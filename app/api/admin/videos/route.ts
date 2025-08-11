import { NextRequest, NextResponse } from 'next/server'
import { createAdminRoute } from '@/lib/middleware'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'
import { AuthUser } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto-js'

// GET - List all demo videos (admin only)
async function getVideos(request: NextRequest, user: AuthUser) {
  try {
    const videos = await prisma.demoVideo.findMany({
      orderBy: { uploadedAt: 'desc' },
      include: {
        analytics: {
          select: {
            id: true,
            playCount: true,
            watchDuration: true,
            completionRate: true,
            firstViewAt: true
          }
        }
      }
    })

    // Calculate aggregated analytics for each video
    const videosWithStats = videos.map(video => {
      const analytics = video.analytics
      const totalViews = analytics.reduce((sum, record) => sum + record.playCount, 0)
      const avgWatchDuration = analytics.length > 0 
        ? analytics.reduce((sum, record) => sum + record.watchDuration, 0) / analytics.length 
        : 0
      const avgCompletionRate = analytics.length > 0
        ? analytics.reduce((sum, record) => sum + record.completionRate, 0) / analytics.length
        : 0

      return {
        ...video,
        stats: {
          totalViews,
          uniqueViewers: analytics.length,
          avgWatchDuration: Math.round(avgWatchDuration),
          avgCompletionRate: Math.round(avgCompletionRate * 100) / 100
        },
        analytics: undefined // Remove detailed analytics from response
      }
    })

    // Create audit log for admin action
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'ADMIN_VIEW_VIDEOS',
        entityType: 'VIDEO',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        metadata: {
          videoCount: videos.length,
          timestamp: new Date().toISOString()
        }
      }
    }).catch(error => {
      console.error('Failed to create audit log (non-critical):', error)
    })

    return NextResponse.json({
      success: true,
      videos: videosWithStats,
      count: videos.length
    })
  } catch (error) {
    console.error('Error fetching videos:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch videos' 
    }, { status: 500 })
  }
}

// POST - Upload new video (admin only)
async function postVideo(request: NextRequest, user: AuthUser) {
  const uploadStartTime = Date.now()
  console.log(`🎥 [VIDEO UPLOAD] Starting upload process at ${new Date().toISOString()}`)
  console.log(`📊 [VIDEO UPLOAD] User ID: ${user.id}, Role: ${user.role}`)
  
  try {
    // Log request headers for debugging
    const contentType = request.headers.get('content-type')
    const contentLength = request.headers.get('content-length')
    console.log(`📋 [VIDEO UPLOAD] Content-Type: ${contentType}`)
    console.log(`📏 [VIDEO UPLOAD] Content-Length: ${contentLength || 'unknown'}`)

    // Early request size validation - Vercel has ~4-6MB hard limit
    const maxRequestSize = 4 * 1024 * 1024 // 4MB limit due to Vercel serverless constraints
    if (contentLength && parseInt(contentLength) > maxRequestSize) {
      console.error(`❌ [VIDEO UPLOAD] Request too large: ${contentLength} bytes (${Math.round(parseInt(contentLength) / 1024 / 1024)}MB)`)
      return NextResponse.json({ 
        success: false, 
        error: 'File too large for direct upload',
        details: `Due to serverless function limits, files larger than ${Math.round(maxRequestSize / 1024 / 1024)}MB must use chunked upload. Your file is ${Math.round(parseInt(contentLength) / 1024 / 1024)}MB.`,
        errorCode: 'USE_CHUNKED_UPLOAD',
        recommendChunkedUpload: true
      }, { status: 413 })
    }

    if (!contentType?.includes('multipart/form-data')) {
      console.error(`❌ [VIDEO UPLOAD] Invalid content type: ${contentType}`)
      return NextResponse.json({ 
        success: false, 
        error: 'Content-Type must be multipart/form-data',
        details: 'Please ensure your request includes the correct Content-Type header'
      }, { status: 400 })
    }

    console.log(`📦 [VIDEO UPLOAD] Parsing form data...`)
    const formData = await request.formData()
    const file = formData.get('video') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string

    console.log(`📝 [VIDEO UPLOAD] Form data parsed - Title: "${title}", Description length: ${description?.length || 0}`)

    // Pre-upload validation
    if (!file) {
      console.error(`❌ [VIDEO UPLOAD] No file provided in form data`)
      return NextResponse.json({ 
        success: false, 
        error: 'No video file provided',
        details: 'Please select a video file to upload'
      }, { status: 400 })
    }

    if (!title?.trim()) {
      console.error(`❌ [VIDEO UPLOAD] No title provided`)
      return NextResponse.json({ 
        success: false, 
        error: 'Video title is required',
        details: 'Please provide a title for your video'
      }, { status: 400 })
    }

    console.log(`📄 [VIDEO UPLOAD] File details - Name: "${file.name}", Size: ${file.size} bytes (${Math.round(file.size / 1024 / 1024)}MB), Type: ${file.type}`)

    // Enhanced file type validation
    const allowedTypes = [
      'video/mp4', 
      'video/mov', 
      'video/avi', 
      'video/quicktime',
      'video/webm',
      'video/x-msvideo' // Alternative MIME type for AVI
    ]
    const allowedExtensions = ['.mp4', '.mov', '.avi', '.webm', '.qt']
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
    
    const isValidType = allowedTypes.includes(file.type.toLowerCase())
    const isValidExtension = allowedExtensions.includes(fileExtension)
    
    if (!isValidType && !isValidExtension) {
      console.error(`❌ [VIDEO UPLOAD] Invalid file type - MIME: ${file.type}, Extension: ${fileExtension}`)
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid file format',
        details: `Only video files are supported (MP4, MOV, AVI, WebM). Detected: ${file.type || 'unknown'}`
      }, { status: 400 })
    }

    // Pre-upload size validation (max 4MB due to Vercel serverless limits)
    const maxSize = 4 * 1024 * 1024 // 4MB in bytes - Vercel serverless constraint
    if (file.size > maxSize) {
      console.error(`❌ [VIDEO UPLOAD] File too large - Size: ${file.size} bytes (${Math.round(file.size / 1024 / 1024)}MB)`)
      return NextResponse.json({ 
        success: false, 
        error: 'File too large for direct upload',
        details: `Due to serverless function limits, files larger than ${Math.round(maxSize / 1024 / 1024)}MB must use chunked upload. Your file is ${Math.round(file.size / 1024 / 1024)}MB.`,
        errorCode: 'USE_CHUNKED_UPLOAD',
        recommendChunkedUpload: true
      }, { status: 413 })
    }

    if (file.size === 0) {
      console.error(`❌ [VIDEO UPLOAD] Empty file detected`)
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid file',
        details: 'The uploaded file appears to be empty'
      }, { status: 400 })
    }

    console.log(`✅ [VIDEO UPLOAD] File validation passed`)

    // Generate unique filename
    const originalExtension = file.name.split('.').pop()
    const uniqueFilename = `demo-video-${uuidv4()}.${originalExtension}`
    console.log(`🏷️ [VIDEO UPLOAD] Generated filename: ${uniqueFilename}`)
    
    // Convert file to buffer and calculate hash
    console.log(`🔄 [VIDEO UPLOAD] Converting file to buffer...`)
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    console.log(`📊 [VIDEO UPLOAD] Buffer created - Size: ${buffer.length} bytes`)
    
    console.log(`🔐 [VIDEO UPLOAD] Calculating file hash...`)
    const fileHash = crypto.SHA256(buffer.toString()).toString()
    console.log(`✅ [VIDEO UPLOAD] File hash calculated: ${fileHash}`)

    // Upload to Vercel Blob
    console.log(`☁️ [VIDEO UPLOAD] Uploading to Vercel Blob...`)
    try {
      const videoBlob = await put(uniqueFilename, buffer, {
        access: 'public'
      })
      console.log(`✅ [VIDEO UPLOAD] Successfully uploaded to Vercel Blob: ${videoBlob.url}`)

      // Generate thumbnail from video (simplified - would need ffmpeg setup)
      let thumbnailUrl = null
      try {
        // This would require ffmpeg binary to be available
        // For now, we'll set it to null and handle thumbnail generation separately
        console.log(`🖼️ [VIDEO UPLOAD] Thumbnail generation skipped (not implemented)`)
        thumbnailUrl = null
      } catch (error) {
        console.warn(`⚠️ [VIDEO UPLOAD] Thumbnail generation failed:`, error)
      }

      // Create video record in database
      console.log(`💾 [VIDEO UPLOAD] Creating database record...`)
      const video = await prisma.demoVideo.create({
        data: {
          title: title.trim(),
          description: description?.trim() || null,
          fileName: uniqueFilename,
          originalName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          videoUrl: videoBlob.url,
          thumbnailUrl,
          fileHash,
          uploadedBy: user.id,
          status: 'READY' // Since we're not doing complex processing initially
        }
      })
      
      const uploadDuration = Date.now() - uploadStartTime
      console.log(`🎉 [VIDEO UPLOAD] Upload completed successfully in ${uploadDuration}ms`)
      console.log(`📄 [VIDEO UPLOAD] Video record created with ID: ${video.id}`)

      return NextResponse.json({
        success: true,
        message: 'Video uploaded successfully',
        uploadDuration: uploadDuration,
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
      
    } catch (blobError) {
      console.error(`❌ [VIDEO UPLOAD] Blob upload failed:`, blobError)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to upload video to storage',
        details: 'There was an issue uploading your video to our storage service. Please try again.',
        errorCode: 'STORAGE_ERROR'
      }, { status: 500 })
    }
    
  } catch (error) {
    const uploadDuration = Date.now() - uploadStartTime
    console.error(`❌ [VIDEO UPLOAD] Upload failed after ${uploadDuration}ms:`, error)
    
    // Ensure we always return a proper JSON response, never HTML
    try {
      // Provide specific error messages based on error type
      if (error instanceof Error) {
        if (error.message.includes('413') || error.message.includes('Entity Too Large') || error.message.includes('PayloadTooLargeError')) {
          console.error(`❌ [VIDEO UPLOAD] File size limit exceeded`)
          return NextResponse.json({ 
            success: false, 
            error: 'File size exceeds server limit',
            details: 'The file is too large for direct upload. Use chunked upload for large files.',
            errorCode: 'FILE_TOO_LARGE',
            recommendChunkedUpload: true
          }, { status: 413 })
        }
        
        if (error.message.includes('timeout') || error.message.includes('TIMEOUT')) {
          console.error(`❌ [VIDEO UPLOAD] Upload timeout`)
          return NextResponse.json({ 
            success: false, 
            error: 'Upload timeout',
            details: 'The upload took too long to complete. Try a smaller file or use chunked upload.',
            errorCode: 'UPLOAD_TIMEOUT',
            recommendChunkedUpload: true
          }, { status: 408 })
        }
        
        if (error.message.includes('network') || error.message.includes('connection')) {
          console.error(`❌ [VIDEO UPLOAD] Network error`)
          return NextResponse.json({ 
            success: false, 
            error: 'Network error',
            details: 'There was a network issue during upload. Please check your connection and try again.',
            errorCode: 'NETWORK_ERROR'
          }, { status: 502 })
        }
        
        // Database errors
        if (error.message.includes('Prisma') || error.message.includes('database')) {
          console.error(`❌ [VIDEO UPLOAD] Database error`)
          return NextResponse.json({ 
            success: false, 
            error: 'Database error',
            details: 'There was an issue saving the video information. Please try again.',
            errorCode: 'DATABASE_ERROR'
          }, { status: 500 })
        }
        
        // Form data parsing errors
        if (error.message.includes('FormData') || error.message.includes('multipart')) {
          console.error(`❌ [VIDEO UPLOAD] Form data parsing error`)
          return NextResponse.json({ 
            success: false, 
            error: 'Invalid request format',
            details: 'Unable to process the uploaded file. Please try again or use chunked upload.',
            errorCode: 'FORM_DATA_ERROR',
            recommendChunkedUpload: true
          }, { status: 400 })
        }
      }
      
      // Generic error fallback
      console.error(`❌ [VIDEO UPLOAD] Generic error:`, error)
      return NextResponse.json({ 
        success: false, 
        error: 'Video upload failed',
        details: 'An unexpected error occurred during upload. Please try again or use chunked upload for large files.',
        errorCode: 'UNKNOWN_ERROR',
        recommendChunkedUpload: true
      }, { status: 500 })
      
    } catch (responseError) {
      // Fallback if even JSON response creation fails
      console.error(`❌ [VIDEO UPLOAD] Critical: Failed to create error response:`, responseError)
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'Upload failed',
          details: 'A critical error occurred. Please try chunked upload.',
          errorCode: 'CRITICAL_ERROR',
          recommendChunkedUpload: true
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  }
}

// DELETE - Delete video (admin only)
async function deleteVideo(request: NextRequest, user: AuthUser) {
  try {

    const { searchParams } = new URL(request.url)
    const videoId = searchParams.get('id')

    if (!videoId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Video ID is required' 
      }, { status: 400 })
    }

    // Find video to get file URLs for deletion
    const video = await prisma.demoVideo.findUnique({
      where: { id: videoId }
    })

    if (!video) {
      return NextResponse.json({ 
        success: false, 
        error: 'Video not found' 
      }, { status: 404 })
    }

    // Delete video record and related analytics (cascading delete handled by Prisma)
    await prisma.demoVideo.delete({
      where: { id: videoId }
    })

    // Note: For Vercel Blob, we'd need to implement blob deletion
    // This would require additional API calls to Vercel Blob service

    return NextResponse.json({
      success: true,
      message: 'Video deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting video:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete video' 
    }, { status: 500 })
  }
}

// PUT - Update video metadata (admin only)
async function putVideo(request: NextRequest, user: AuthUser) {
  try {

    const { videoId, title, description, isActive } = await request.json()

    if (!videoId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Video ID is required' 
      }, { status: 400 })
    }

    if (!title) {
      return NextResponse.json({ 
        success: false, 
        error: 'Video title is required' 
      }, { status: 400 })
    }

    const video = await prisma.demoVideo.update({
      where: { id: videoId },
      data: {
        title,
        description: description || null,
        isActive: isActive !== undefined ? isActive : undefined
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Video updated successfully',
      video: {
        id: video.id,
        title: video.title,
        description: video.description,
        isActive: video.isActive,
        lastModified: video.lastModified
      }
    })
  } catch (error) {
    console.error('Error updating video:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update video' 
    }, { status: 500 })
  }
}


// Export handlers with admin middleware
export const GET = createAdminRoute(getVideos)
export const POST = createAdminRoute(postVideo) 
export const DELETE = createAdminRoute(deleteVideo)
export const PUT = createAdminRoute(putVideo)