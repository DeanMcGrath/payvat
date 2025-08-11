import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'
import { videoSecurity } from '@/lib/video-security'

const prisma = new PrismaClient()

// GET - Secure video streaming with token verification
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const videoId = id
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Security token required'
      }, { status: 401 })
    }

    // Verify security token
    const tokenResult = videoSecurity.verifySecureToken(token)
    if (!tokenResult.valid || tokenResult.payload?.videoId !== videoId) {
      return NextResponse.json({
        success: false,
        error: tokenResult.error || 'Invalid security token'
      }, { status: 401 })
    }

    // Find the video
    const video = await prisma.demoVideo.findUnique({
      where: { id: videoId },
      select: {
        id: true,
        videoUrl: true,
        isActive: true,
        status: true,
        mimeType: true,
        fileSize: true
      }
    })

    if (!video || !video.isActive || video.status !== 'READY') {
      return NextResponse.json({
        success: false,
        error: 'Video not found or unavailable'
      }, { status: 404 })
    }

    // Additional security check
    const accessCheck = await videoSecurity.checkVideoAccess(request, videoId)
    if (!accessCheck.isAuthorized) {
      return NextResponse.json({
        success: false,
        error: accessCheck.reason || 'Access denied'
      }, { 
        status: accessCheck.rateLimited ? 429 : 403 
      })
    }

    // For Vercel Blob URLs, we can redirect securely
    // In a more advanced implementation, you might proxy the video through your server
    // to add watermarks or additional security features
    
    const response = NextResponse.redirect(video.videoUrl, 302)
    
    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'SAMEORIGIN')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate')
    
    // Add content type if available
    if (video.mimeType) {
      response.headers.set('Content-Type', video.mimeType)
    }

    return response
  } catch (error) {
    console.error('Error streaming secure video:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to stream video'
    }, { status: 500 })
  }
}

// OPTIONS - Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_BASE_URL || '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  })
}