import { NextRequest, NextResponse } from 'next/server'
import { createAdminRoute } from '@/lib/middleware'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'
import { AuthUser } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto-js'
import { createWriteStream, createReadStream, existsSync } from 'fs'
import { mkdir, unlink, stat } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

interface ChunkUploadSession {
  sessionId: string
  totalChunks: number
  totalSize: number
  fileName: string
  title: string
  description?: string
  mimeType: string
  chunksReceived: number[]
  tempDir: string
  uploadedBy: string
}

// In-memory store for chunk upload sessions (in production, use Redis)
const chunkSessions = new Map<string, ChunkUploadSession>()


// POST - Handle chunked video upload
async function handleChunkedUpload(request: NextRequest, user: AuthUser) {
  const uploadStartTime = Date.now()
  // console.log(`🎬 [CHUNKED UPLOAD] Starting chunked upload at ${new Date().toISOString()}`)
  
  try {
    const formData = await request.formData()
    const sessionId = formData.get('sessionId') as string
    const chunkIndex = parseInt(formData.get('chunkIndex') as string)
    const totalChunks = parseInt(formData.get('totalChunks') as string)
    const totalSize = parseInt(formData.get('totalSize') as string)
    const fileName = formData.get('fileName') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const mimeType = formData.get('mimeType') as string
    const chunk = formData.get('chunk') as File

    // console.log(`📦 [CHUNKED UPLOAD] Session ${sessionId}, chunk ${chunkIndex + 1}/${totalChunks}`)

    // Validate required fields
    if (!sessionId || chunkIndex === null || !totalChunks || !chunk) {
      return NextResponse.json({
        success: false,
        error: 'Missing required chunk data',
        details: 'Session ID, chunk index, total chunks, and chunk data are required'
      }, { status: 400 })
    }

    // Initialize session if this is the first chunk
    if (chunkIndex === 0) {
      console.log(`🚀 [CHUNKED UPLOAD] Initializing new session ${sessionId}`)
      
      // Validate file type for first chunk
      const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/quicktime', 'video/webm', 'video/x-msvideo']
      if (!allowedTypes.includes(mimeType.toLowerCase())) {
        return NextResponse.json({
          success: false,
          error: 'Invalid file format',
          details: `Only video files are supported (MP4, MOV, AVI, WebM). Detected: ${mimeType}`
        }, { status: 400 })
      }

      // Validate total size (max 500MB)
      const maxSize = 500 * 1024 * 1024
      if (totalSize > maxSize) {
        return NextResponse.json({
          success: false,
          error: 'File size exceeds limit',
          details: `Maximum file size is 500MB. Your file is ${Math.round(totalSize / 1024 / 1024)}MB.`
        }, { status: 413 })
      }

      // Create temporary directory for chunks
      const tempDir = join(tmpdir(), 'video-chunks', sessionId)
      await mkdir(tempDir, { recursive: true })

      // Store session info
      chunkSessions.set(sessionId, {
        sessionId,
        totalChunks,
        totalSize,
        fileName,
        title,
        description,
        mimeType,
        chunksReceived: [],
        tempDir,
        uploadedBy: user.id
      })
    }

    const session = chunkSessions.get(sessionId)
    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'Upload session not found',
        details: 'The upload session has expired or is invalid'
      }, { status: 404 })
    }

    // Save chunk to temporary file
    const chunkPath = join(session.tempDir, `chunk-${chunkIndex}`)
    const chunkBuffer = Buffer.from(await chunk.arrayBuffer())
    
    await new Promise<void>((resolve, reject) => {
      const writeStream = createWriteStream(chunkPath)
      writeStream.write(chunkBuffer)
      writeStream.end()
      writeStream.on('finish', resolve)
      writeStream.on('error', reject)
    })

    // Mark chunk as received
    if (!session.chunksReceived.includes(chunkIndex)) {
      session.chunksReceived.push(chunkIndex)
    }

    // console.log(`✅ [CHUNKED UPLOAD] Chunk ${chunkIndex + 1}/${totalChunks} saved (${session.chunksReceived.length} total)`)

    // Check if all chunks are received
    if (session.chunksReceived.length === totalChunks) {
      console.log(`🎯 [CHUNKED UPLOAD] All chunks received, assembling file...`)
      return await assembleVideoFile(session, user)
    }

    // Return progress status
    return NextResponse.json({
      success: true,
      message: `Chunk ${chunkIndex + 1}/${totalChunks} uploaded successfully`,
      progress: {
        chunksReceived: session.chunksReceived.length,
        totalChunks: session.totalChunks,
        percentage: Math.round((session.chunksReceived.length / session.totalChunks) * 100)
      }
    })

  } catch (error) {
    const uploadDuration = Date.now() - uploadStartTime
    console.error(`❌ [CHUNKED UPLOAD] Upload failed after ${uploadDuration}ms:`, error)
    
    // Ensure we always return proper JSON
    try {
      if (error instanceof Error) {
        if (error.message.includes('413') || error.message.includes('PayloadTooLargeError')) {
          return NextResponse.json({
            success: false,
            error: 'Chunk too large',
            details: 'Individual chunks must be smaller. Try reducing chunk size.',
            errorCode: 'CHUNK_TOO_LARGE'
          }, { status: 413 })
        }
        
        if (error.message.includes('FormData') || error.message.includes('multipart')) {
          return NextResponse.json({
            success: false,
            error: 'Invalid chunk format',
            details: 'Unable to process chunk data. Please try again.',
            errorCode: 'CHUNK_FORMAT_ERROR'
          }, { status: 400 })
        }
      }
      
      return NextResponse.json({
        success: false,
        error: 'Chunked upload failed',
        details: 'An error occurred during the chunked upload process',
        errorCode: 'CHUNKED_UPLOAD_ERROR'
      }, { status: 500 })
      
    } catch (responseError) {
      console.error(`❌ [CHUNKED UPLOAD] Critical: Failed to create error response:`, responseError)
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'Chunked upload failed',
          details: 'A critical error occurred during chunked upload',
          errorCode: 'CRITICAL_ERROR'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  }
}

// Assemble the complete video file from chunks
async function assembleVideoFile(session: ChunkUploadSession, user: AuthUser) {
  // console.log(`🔧 [CHUNKED UPLOAD] Assembling video file for session ${session.sessionId}`)
  
  try {
    // Create final file path
    const fileExtension = session.fileName.split('.').pop()
    const uniqueFilename = `demo-video-${uuidv4()}.${fileExtension}`
    const finalFilePath = join(session.tempDir, 'final-video')

    // Assemble chunks in order
    const writeStream = createWriteStream(finalFilePath)
    
    for (let i = 0; i < session.totalChunks; i++) {
      const chunkPath = join(session.tempDir, `chunk-${i}`)
      if (!existsSync(chunkPath)) {
        throw new Error(`Missing chunk ${i}`)
      }
      
      const chunkStream = createReadStream(chunkPath)
      await new Promise<void>((resolve, reject) => {
        chunkStream.pipe(writeStream, { end: false })
        chunkStream.on('end', resolve)
        chunkStream.on('error', reject)
      })
      
      // Clean up chunk file
      await unlink(chunkPath)
    }
    
    writeStream.end()
    await new Promise<void>((resolve, reject) => {
      writeStream.on('finish', resolve)
      writeStream.on('error', reject)
    })

    // console.log(`✅ [CHUNKED UPLOAD] File assembled successfully`)

    // Verify file size
    const stats = await stat(finalFilePath)
    if (stats.size !== session.totalSize) {
      throw new Error(`File size mismatch: expected ${session.totalSize}, got ${stats.size}`)
    }

    // Read assembled file and upload to blob storage
    const assembledFile = createReadStream(finalFilePath)
    const chunks: Buffer[] = []
    
    assembledFile.on('data', (chunk: Buffer | string) => {
      const bufferChunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
      chunks.push(bufferChunk)
    })
    await new Promise<void>((resolve, reject) => {
      assembledFile.on('end', resolve)
      assembledFile.on('error', reject)
    })
    
    const finalBuffer = Buffer.concat(chunks)
    
    // Calculate file hash
    const fileHash = crypto.SHA256(finalBuffer.toString()).toString()
    
    // Upload to Vercel Blob
    // console.log(`☁️ [CHUNKED UPLOAD] Uploading assembled file to Vercel Blob...`)
    const videoBlob = await put(uniqueFilename, finalBuffer, {
      access: 'public'
    })
    
    // console.log(`✅ [CHUNKED UPLOAD] Successfully uploaded to Vercel Blob: ${videoBlob.url}`)

    // Create video record in database
    const video = await prisma.demoVideo.create({
      data: {
        title: session.title.trim(),
        description: session.description?.trim() || null,
        fileName: uniqueFilename,
        originalName: session.fileName,
        fileSize: session.totalSize,
        mimeType: session.mimeType,
        videoUrl: videoBlob.url,
        thumbnailUrl: null, // Will be generated separately
        fileHash,
        uploadedBy: session.uploadedBy,
        status: 'READY'
      }
    })

    // Clean up temporary files and session
    try {
      await unlink(finalFilePath)
      // Note: temp directory cleanup should be handled by a cleanup job
    } catch (cleanupError) {
      console.warn('❌ [CHUNKED UPLOAD] Cleanup warning:', cleanupError)
    }
    
    chunkSessions.delete(session.sessionId)
    
    // console.log(`🎉 [CHUNKED UPLOAD] Chunked upload completed successfully`)

    return NextResponse.json({
      success: true,
      message: 'Video uploaded successfully via chunked upload',
      video: {
        id: video.id,
        title: video.title,
        description: video.description,
        videoUrl: video.videoUrl,
        thumbnailUrl: video.thumbnailUrl,
        status: video.status,
        uploadedAt: video.uploadedAt,
        fileSize: video.fileSize,
        originalName: video.originalName
      }
    })

  } catch (error) {
    console.error(`❌ [CHUNKED UPLOAD] Assembly failed:`, error)
    
    // Clean up session and temporary files
    try {
      chunkSessions.delete(session.sessionId)
      // Temp directory cleanup should be handled by a cleanup job
    } catch (cleanupError) {
      console.warn('Cleanup error during failure:', cleanupError)
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to assemble video file',
      details: 'An error occurred while combining the uploaded chunks'
    }, { status: 500 })
  }
}

// GET - Get upload session status
async function getUploadStatus(request: NextRequest, user: AuthUser) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('sessionId')
  
  if (!sessionId) {
    return NextResponse.json({
      success: false,
      error: 'Session ID required'
    }, { status: 400 })
  }
  
  const session = chunkSessions.get(sessionId)
  if (!session) {
    return NextResponse.json({
      success: false,
      error: 'Upload session not found'
    }, { status: 404 })
  }
  
  return NextResponse.json({
    success: true,
    session: {
      sessionId: session.sessionId,
      progress: {
        chunksReceived: session.chunksReceived.length,
        totalChunks: session.totalChunks,
        percentage: Math.round((session.chunksReceived.length / session.totalChunks) * 100)
      }
    }
  })
}

// Export handlers with admin middleware
export const GET = createAdminRoute(getUploadStatus)
export const POST = createAdminRoute(handleChunkedUpload)