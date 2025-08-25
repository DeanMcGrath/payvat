import { NextRequest, NextResponse } from 'next/server'
import { createGuestFriendlyRoute } from '@/lib/middleware'
import { AIErrorTracker } from '@/lib/ai/error-tracking'
import { AuthUser } from '@/lib/auth'

export const runtime = 'nodejs'

/**
 * GET /api/admin/ai/errors - Get AI error analytics and tracking data
 */
async function getAIErrors(request: NextRequest, user?: AuthUser) {
  try {
    // Only admin users can access error data
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Admin access required'
        },
        { status: 403 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') as 'day' | 'week' | 'month' || 'week'
    const action = searchParams.get('action') || 'analytics'
    
    switch (action) {
      case 'analytics':
        const analytics = await AIErrorTracker.getErrorAnalytics(timeRange)
        return NextResponse.json({
          success: true,
          analytics,
          timeRange
        })
        
      case 'patterns':
        const patterns = await AIErrorTracker.getErrorPatterns()
        return NextResponse.json({
          success: true,
          patterns
        })
        
      default:
        return NextResponse.json(
          { 
            success: false,
            error: 'Invalid action parameter'
          },
          { status: 400 }
        )
    }
    
  } catch (error) {
    console.error('Error getting AI error data:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to retrieve AI error data'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/ai/errors - Resolve an error or perform error management actions
 */
async function manageAIErrors(request: NextRequest, user?: AuthUser) {
  try {
    // Only admin users can manage errors
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Admin access required'
        },
        { status: 403 }
      )
    }
    
    const { action, errorId, resolution } = await request.json()
    
    switch (action) {
      case 'resolve':
        if (!errorId || !resolution) {
          return NextResponse.json(
            { 
              success: false,
              error: 'Error ID and resolution are required'
            },
            { status: 400 }
          )
        }
        
        await AIErrorTracker.resolveError(errorId, resolution)
        return NextResponse.json({
          success: true,
          message: 'Error resolved successfully'
        })
        
      default:
        return NextResponse.json(
          { 
            success: false,
            error: 'Invalid action'
          },
          { status: 400 }
        )
    }
    
  } catch (error) {
    console.error('Error managing AI errors:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to manage AI error'
      },
      { status: 500 }
    )
  }
}

export const GET = createGuestFriendlyRoute(getAIErrors)
export const POST = createGuestFriendlyRoute(manageAIErrors)