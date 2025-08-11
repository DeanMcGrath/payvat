import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { PrismaClient } from '@/lib/generated/prisma'
import sharp from 'sharp'
import ffmpeg from 'fluent-ffmpeg'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto-js'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

// Helper function to verify admin access
async function verifyAdminAccess(request: NextRequest) {
  try {
    const token = request.cookies.get('auth')?.value || request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return { error: 'No authentication token provided', status: 401 }
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string, role: string }
    
    if (decoded.role !== 'ADMIN') {
      return { error: 'Admin access required', status: 403 }
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, email: true }
    })

    if (!user || user.role !== 'ADMIN') {
      return { error: 'Invalid admin credentials', status: 403 }
    }

    return { user, error: null, status: 200 }
  } catch (error) {
    console.error('Admin verification error:', error)
    return { error: 'Invalid authentication token', status: 401 }
  }
}

// GET - List all demo videos
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminAccess(request)
    if (authResult.error) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status })
    }

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

// POST - Upload new video
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdminAccess(request)
    if (authResult.error) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status })
    }

    const contentType = request.headers.get('content-type')
    if (!contentType?.includes('multipart/form-data')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Content-Type must be multipart/form-data' 
      }, { status: 400 })
    }

    const formData = await request.formData()
    const file = formData.get('video') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string

    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: 'No video file provided' 
      }, { status: 400 })
    }

    if (!title) {
      return NextResponse.json({ 
        success: false, 
        error: 'Video title is required' 
      }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/quicktime']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid file type. Only MP4, MOV, and AVI files are supported.' 
      }, { status: 400 })
    }

    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024 // 500MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json({ 
        success: false, 
        error: 'File size too large. Maximum size is 500MB.' 
      }, { status: 400 })
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const uniqueFilename = `demo-video-${uuidv4()}.${fileExtension}`
    
    // Convert file to buffer and calculate hash
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const fileHash = crypto.SHA256(buffer.toString()).toString()

    // Upload to Vercel Blob
    const videoBlob = await put(uniqueFilename, buffer, {
      access: 'public'
    })

    // Generate thumbnail from video (simplified - would need ffmpeg setup)
    let thumbnailUrl = null
    try {
      // This would require ffmpeg binary to be available
      // For now, we'll set it to null and handle thumbnail generation separately
      thumbnailUrl = null
    } catch (error) {
      console.warn('Thumbnail generation failed:', error)
    }

    // Create video record in database
    const video = await prisma.demoVideo.create({
      data: {
        title,
        description: description || null,
        fileName: uniqueFilename,
        originalName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        videoUrl: videoBlob.url,
        thumbnailUrl,
        fileHash,
        uploadedBy: authResult.user!.id,
        status: 'READY' // Since we're not doing complex processing initially
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Video uploaded successfully',
      video: {
        id: video.id,
        title: video.title,
        description: video.description,
        videoUrl: video.videoUrl,
        thumbnailUrl: video.thumbnailUrl,
        status: video.status,
        uploadedAt: video.uploadedAt
      }
    })
  } catch (error) {
    console.error('Error uploading video:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to upload video' 
    }, { status: 500 })
  }
}

// DELETE - Delete video
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await verifyAdminAccess(request)
    if (authResult.error) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status })
    }

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

// PUT - Update video metadata
export async function PUT(request: NextRequest) {
  try {
    const authResult = await verifyAdminAccess(request)
    if (authResult.error) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status })
    }

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