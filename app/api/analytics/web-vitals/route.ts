import { NextRequest, NextResponse } from 'next/server'
import { createGuestFriendlyRoute } from '@/lib/middleware'
import { AuthUser } from '@/lib/auth'

export const runtime = 'nodejs'

interface WebVitalsData {
  metric: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  id: string
  delta: number
  url: string
  userAgent: string
  timestamp: number
}

/**
 * POST /api/analytics/web-vitals - Track Core Web Vitals metrics
 */
async function trackWebVitals(request: NextRequest, user?: AuthUser) {
  try {
    const data: WebVitalsData = await request.json()
    
    // Validate required fields
    if (!data.metric || typeof data.value !== 'number' || !data.rating) {
      return NextResponse.json(
        { success: false, error: 'Invalid metric data' },
        { status: 400 }
      )
    }

    // Log the metric for monitoring (in production, this would go to a proper analytics service)
    console.log(`[Web Vitals] ${data.metric}: ${data.value.toFixed(2)}ms (${data.rating})`, {
      url: data.url,
      userAgent: data.userAgent.substring(0, 100), // Truncate for privacy
      userId: user?.id || 'anonymous',
      timestamp: new Date(data.timestamp).toISOString()
    })

    // In production, you would store this in a database or send to analytics service
    // Example:
    // await prisma.webVitalsMetric.create({
    //   data: {
    //     metric: data.metric,
    //     value: data.value,
    //     rating: data.rating,
    //     metricId: data.id,
    //     delta: data.delta,
    //     url: data.url,
    //     userAgent: data.userAgent,
    //     userId: user?.id,
    //     timestamp: new Date(data.timestamp)
    //   }
    // })

    // For now, we'll just track Core Web Vitals thresholds
    const thresholds = {
      LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
      FID: { good: 100, poor: 300 },   // First Input Delay (deprecated)
      INP: { good: 200, poor: 500 },   // Interaction to Next Paint
      CLS: { good: 0.1, poor: 0.25 },  // Cumulative Layout Shift
      FCP: { good: 1800, poor: 3000 }, // First Contentful Paint
      TTFB: { good: 800, poor: 1800 }  // Time to First Byte
    }

    const threshold = thresholds[data.metric as keyof typeof thresholds]
    if (threshold) {
      const actualRating = data.value <= threshold.good ? 'good' : 
                          data.value <= threshold.poor ? 'needs-improvement' : 'poor'
      
      // Alert if metric is consistently poor
      if (actualRating === 'poor') {
        console.warn(`⚠️ Poor ${data.metric} detected: ${data.value.toFixed(2)}ms on ${data.url}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Web vital metric tracked',
      rating: data.rating
    })

  } catch (error) {
    console.error('Error tracking web vitals:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to track metric' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/analytics/web-vitals - Get Core Web Vitals summary (admin only)
 */
async function getWebVitalsSummary(request: NextRequest, user?: AuthUser) {
  try {
    // Only allow admin access to analytics
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    // In production, this would query the database for metrics
    // For now, return a mock summary
    const summary = {
      overall_performance: 'good',
      metrics: {
        LCP: { average: 2100, rating: 'good', samples: 1250 },
        INP: { average: 150, rating: 'good', samples: 980 },
        CLS: { average: 0.05, rating: 'good', samples: 1150 },
        FCP: { average: 1600, rating: 'good', samples: 1300 },
        TTFB: { average: 650, rating: 'good', samples: 1200 }
      },
      trends: {
        last_24h: 'stable',
        last_7d: 'improving',
        last_30d: 'stable'
      },
      pages: {
        '/': { lcp: 1800, inp: 120, cls: 0.03 },
        '/dashboard': { lcp: 2300, inp: 180, cls: 0.08 },
        '/vat-submission': { lcp: 2100, inp: 160, cls: 0.06 }
      }
    }

    return NextResponse.json({
      success: true,
      data: summary,
      generated_at: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error getting web vitals summary:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get metrics summary' },
      { status: 500 }
    )
  }
}

export const POST = createGuestFriendlyRoute(trackWebVitals)
export const GET = createGuestFriendlyRoute(getWebVitalsSummary)