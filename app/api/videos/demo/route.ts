import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'
import { videoSecurity } from '@/lib/video-security'

const prisma = new PrismaClient()

// GET - Get active demo video for public display
export async function GET(request: NextRequest) {
  try {
    // Find the most recent active demo video
    const video = await prisma.demoVideo.findFirst({
      where: {
        isActive: true,
        status: 'READY'
      },
      orderBy: { uploadedAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        videoUrl: true,
        thumbnailUrl: true,
        duration: true,
        width: true,
        height: true,
        aspectRatio: true,
        uploadedAt: true
      }
    })

    if (!video) {
      return NextResponse.json({
        success: false,
        error: 'No active demo video available',
        hasVideo: false
      }, { status: 404 })
    }

    // Check video access security
    const accessCheck = await videoSecurity.checkVideoAccess(request, video.id)
    
    if (!accessCheck.isAuthorized) {
      return NextResponse.json({
        success: false,
        error: accessCheck.reason || 'Access denied',
        hasVideo: false,
        rateLimited: accessCheck.rateLimited,
        remainingViews: accessCheck.remainingViews
      }, { 
        status: accessCheck.rateLimited ? 429 : 403,
        headers: accessCheck.rateLimited ? {
          'X-RateLimit-Remaining': (accessCheck.remainingViews || 0).toString(),
          'Retry-After': '3600'
        } : {
          'X-RateLimit-Remaining': (accessCheck.remainingViews || 0).toString()
        }
      })
    }

    // Generate secure video URL if security is enabled
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId') || 'anonymous'
    
    const secureVideoUrl = videoSecurity.generateSecureVideoUrl(
      video.videoUrl, 
      video.id, 
      sessionId
    )

    return NextResponse.json({
      success: true,
      hasVideo: true,
      video: {
        id: video.id,
        title: video.title,
        description: video.description,
        videoUrl: secureVideoUrl, // Return secure URL
        thumbnailUrl: video.thumbnailUrl,
        duration: video.duration,
        width: video.width,
        height: video.height,
        aspectRatio: video.aspectRatio || '16:9',
        uploadedAt: video.uploadedAt
      },
      security: {
        remainingViews: accessCheck.remainingViews,
        watermarkEnabled: true
      }
    })
  } catch (error) {
    console.error('Error fetching demo video:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch demo video',
      hasVideo: false
    }, { status: 500 })
  }
}