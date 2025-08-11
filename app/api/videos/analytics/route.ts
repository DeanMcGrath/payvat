import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto-js'

const prisma = new PrismaClient()

// Helper function to extract device/browser info from user agent
function parseUserAgent(userAgent: string | null) {
  if (!userAgent) {
    return {
      deviceType: 'unknown',
      browserName: 'unknown',
      osName: 'unknown'
    }
  }

  let deviceType = 'desktop'
  let browserName = 'unknown'
  let osName = 'unknown'

  // Device type detection
  if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
    deviceType = /iPad|Tablet/i.test(userAgent) ? 'tablet' : 'mobile'
  }

  // Browser detection
  if (/Chrome/i.test(userAgent) && !/Edge|OPR/i.test(userAgent)) {
    browserName = 'chrome'
  } else if (/Firefox/i.test(userAgent)) {
    browserName = 'firefox'
  } else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) {
    browserName = 'safari'
  } else if (/Edge/i.test(userAgent)) {
    browserName = 'edge'
  } else if (/OPR/i.test(userAgent)) {
    browserName = 'opera'
  }

  // OS detection
  if (/Windows/i.test(userAgent)) {
    osName = 'windows'
  } else if (/Mac OS/i.test(userAgent)) {
    osName = 'macos'
  } else if (/Android/i.test(userAgent)) {
    osName = 'android'
  } else if (/iOS|iPhone|iPad/i.test(userAgent)) {
    osName = 'ios'
  } else if (/Linux/i.test(userAgent)) {
    osName = 'linux'
  }

  return { deviceType, browserName, osName }
}

// Helper function to hash IP address for privacy
function hashIP(ip: string): string {
  return crypto.SHA256(ip + process.env.ANALYTICS_SALT || 'default-salt').toString()
}

// POST - Track video view/interaction
export async function POST(request: NextRequest) {
  try {
    const {
      videoId,
      sessionId,
      watchDuration = 0,
      completionRate = 0,
      selectedQuality,
      bufferEvents = 0,
      loadTime,
      playCount = 1
    } = await request.json()

    if (!videoId) {
      return NextResponse.json({
        success: false,
        error: 'Video ID is required'
      }, { status: 400 })
    }

    // Verify video exists
    const video = await prisma.demoVideo.findUnique({
      where: { id: videoId },
      select: { id: true, isActive: true }
    })

    if (!video || !video.isActive) {
      return NextResponse.json({
        success: false,
        error: 'Video not found or inactive'
      }, { status: 404 })
    }

    // Extract request information
    const userAgent = request.headers.get('user-agent')
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const clientIP = forwardedFor?.split(',')[0] || realIP || 'unknown'
    
    const hashedIP = clientIP !== 'unknown' ? hashIP(clientIP) : null
    const deviceInfo = parseUserAgent(userAgent)
    
    // Generate session ID if not provided
    const analyticsSessionId = sessionId || uuidv4()

    // Get referrer and page URL from headers or request body
    const referrerUrl = request.headers.get('referer')
    const pageUrl = request.headers.get('referer') // Same as referrer for most cases

    // Check if this is a first-time view for this session
    const existingRecord = await prisma.videoAnalytics.findFirst({
      where: {
        videoId,
        sessionId: analyticsSessionId
      }
    })

    if (existingRecord) {
      // Update existing record
      const updatedRecord = await prisma.videoAnalytics.update({
        where: { id: existingRecord.id },
        data: {
          playCount: existingRecord.playCount + (playCount || 1),
          watchDuration: Math.max(existingRecord.watchDuration, watchDuration),
          completionRate: Math.max(existingRecord.completionRate, completionRate),
          selectedQuality: selectedQuality || existingRecord.selectedQuality,
          bufferEvents: existingRecord.bufferEvents + (bufferEvents || 0),
          loadTime: loadTime || existingRecord.loadTime,
          isFirstView: false,
          lastViewAt: new Date()
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Analytics updated successfully',
        analyticsId: updatedRecord.id,
        isFirstView: false
      })
    } else {
      // Create new analytics record
      const analyticsRecord = await prisma.videoAnalytics.create({
        data: {
          videoId,
          sessionId: analyticsSessionId,
          ipAddress: hashedIP,
          userAgent: userAgent || undefined,
          deviceType: deviceInfo.deviceType,
          browserName: deviceInfo.browserName,
          osName: deviceInfo.osName,
          playCount: playCount || 1,
          watchDuration: watchDuration || 0,
          completionRate: completionRate || 0,
          referrerUrl: referrerUrl || undefined,
          pageUrl: pageUrl || undefined,
          selectedQuality: selectedQuality || undefined,
          bufferEvents: bufferEvents || 0,
          loadTime: loadTime || undefined,
          isFirstView: true
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Analytics recorded successfully',
        analyticsId: analyticsRecord.id,
        isFirstView: true,
        sessionId: analyticsSessionId
      })
    }
  } catch (error) {
    console.error('Error recording video analytics:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to record analytics'
    }, { status: 500 })
  }
}

// GET - Get video analytics summary (admin only)
export async function GET(request: NextRequest) {
  try {
    // Basic auth check - you might want to implement proper admin verification here
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const videoId = searchParams.get('videoId')
    const period = searchParams.get('period') || '30' // days

    if (!videoId) {
      return NextResponse.json({
        success: false,
        error: 'Video ID is required'
      }, { status: 400 })
    }

    // Calculate date range
    const periodDays = parseInt(period)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - periodDays)

    // Get analytics data
    const analytics = await prisma.videoAnalytics.findMany({
      where: {
        videoId,
        firstViewAt: {
          gte: startDate
        }
      },
      orderBy: { firstViewAt: 'desc' }
    })

    // Calculate summary statistics
    const totalViews = analytics.reduce((sum, record) => sum + record.playCount, 0)
    const uniqueViewers = analytics.length
    const totalWatchTime = analytics.reduce((sum, record) => sum + record.watchDuration, 0)
    const avgWatchDuration = uniqueViewers > 0 ? totalWatchTime / uniqueViewers : 0
    const avgCompletionRate = uniqueViewers > 0 
      ? analytics.reduce((sum, record) => sum + record.completionRate, 0) / uniqueViewers 
      : 0

    // Device breakdown
    const deviceStats = analytics.reduce((acc, record) => {
      const device = record.deviceType || 'unknown'
      acc[device] = (acc[device] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Browser breakdown
    const browserStats = analytics.reduce((acc, record) => {
      const browser = record.browserName || 'unknown'
      acc[browser] = (acc[browser] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Daily views for the period
    const dailyViews = analytics.reduce((acc, record) => {
      const date = record.firstViewAt.toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + record.playCount
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      success: true,
      analytics: {
        summary: {
          totalViews,
          uniqueViewers,
          avgWatchDuration: Math.round(avgWatchDuration),
          avgCompletionRate: Math.round(avgCompletionRate * 100) / 100,
          totalWatchTime: Math.round(totalWatchTime)
        },
        breakdown: {
          devices: deviceStats,
          browsers: browserStats
        },
        timeline: dailyViews,
        period: `${periodDays} days`
      }
    })
  } catch (error) {
    console.error('Error fetching video analytics:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch analytics'
    }, { status: 500 })
  }
}