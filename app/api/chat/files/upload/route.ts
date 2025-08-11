import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { z } from 'zod'
import {
  validateFile,
  generateSecureFilePath,
  calculateFileHash,
  scanFileForViruses,
  generateFilePreview,
  ensureUploadDirectories,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE
} from '@/lib/chat-file-security'

// Validation schema for file upload
const fileUploadSchema = z.object({
  sessionId: z.string().min(1),
  message: z.string().optional().default(''),
})

export async function POST(request: NextRequest) {
  try {
    // Ensure upload directories exist
    await ensureUploadDirectories()

    const formData = await request.formData()
    const file = formData.get('file') as File
    const sessionId = formData.get('sessionId') as string
    const message = formData.get('message') as string || ''

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Get user for authentication
    const user = await getUserFromRequest(request)

    // Find chat session
    const session = await prisma.chatSession.findUnique({
      where: { sessionId }
    })

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Chat session not found' },
        { status: 404 }
      )
    }

    // Validate user access to session
    if (user && session.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access to chat session' },
        { status: 403 }
      )
    }

    // Validate file
    const validation = validateFile(file)
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      )
    }

    // Generate secure file path
    const secureFilePath = generateSecureFilePath(file.name, sessionId)
    
    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    await writeFile(secureFilePath, buffer)
    
    // Calculate file hash for integrity
    const fileHash = await calculateFileHash(secureFilePath)
    
    // Scan file for viruses/malware
    const scanResult = await scanFileForViruses(secureFilePath)
    
    // If file is infected, delete it and reject
    if (!scanResult.isClean && scanResult.result === 'INFECTED') {
      try {
        await require('fs').promises.unlink(secureFilePath)
      } catch (e) {
        console.error('Failed to delete infected file:', e)
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'File failed security scan', 
          details: scanResult.details 
        },
        { status: 400 }
      )
    }
    
    // Generate preview if possible
    const previewUrl = await generateFilePreview(secureFilePath, validation.mimeType!)
    
    // Determine sender type and name based on user role
    const isAdmin = user?.role === 'ADMIN'
    const senderType = isAdmin ? 'admin' : 'user'
    const senderName = isAdmin 
      ? user.businessName || 'Admin'
      : user?.businessName || session.userName || 'User'

    // Create chat message with file
    const chatMessage = await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        message: message || `Shared file: ${file.name}`,
        messageType: 'file',
        senderType: senderType as 'user' | 'admin' | 'system',
        senderId: user?.id,
        senderName: senderName,
        
        // File details
        fileName: validation.sanitizedName!,
        originalName: file.name,
        fileUrl: secureFilePath,
        fileSize: file.size,
        mimeType: validation.mimeType,
        fileHash,
        filePreviewUrl: previewUrl,
        
        // Security info
        isScanned: true,
        scanResult: scanResult.result,
        scanDetails: scanResult.details,
        
        // Set expiration (30 days from now)
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      }
    })

    // Update session last message time
    await prisma.chatSession.update({
      where: { id: session.id },
      data: { 
        lastMessageAt: new Date(),
        isActive: true,
      }
    })

    // Return success response
    return NextResponse.json({
      success: true,
      message: {
        id: chatMessage.id,
        message: chatMessage.message,
        messageType: chatMessage.messageType,
        senderType: chatMessage.senderType,
        senderName: chatMessage.senderName,
        createdAt: chatMessage.createdAt,
        
        // File details for frontend
        file: {
          id: chatMessage.id,
          name: chatMessage.fileName,
          originalName: chatMessage.originalName,
          size: chatMessage.fileSize,
          mimeType: chatMessage.mimeType,
          previewUrl: chatMessage.filePreviewUrl,
          downloadUrl: `/api/chat/files/${chatMessage.id}`,
          scanResult: chatMessage.scanResult,
        }
      }
    })

  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}

// GET endpoint to return supported file types and limits
export async function GET() {
  return NextResponse.json({
    success: true,
    config: {
      allowedTypes: Object.keys(ALLOWED_FILE_TYPES),
      allowedExtensions: Object.values(ALLOWED_FILE_TYPES),
      maxFileSize: MAX_FILE_SIZE,
      maxFileSizeMB: Math.round(MAX_FILE_SIZE / 1024 / 1024),
    }
  })
}