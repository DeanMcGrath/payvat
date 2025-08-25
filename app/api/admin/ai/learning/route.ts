import { NextRequest, NextResponse } from 'next/server'
import { createGuestFriendlyRoute } from '@/lib/middleware'
import { LearningPipeline } from '@/lib/ai/learningPipeline'
import { AuthUser } from '@/lib/auth'

export const runtime = 'nodejs'

/**
 * GET /api/admin/ai/learning - Get learning pipeline status and metrics
 */
async function getLearningData(request: NextRequest, user?: AuthUser) {
  try {
    // Only admin users can access learning pipeline data
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
    const action = searchParams.get('action') || 'status'
    
    switch (action) {
      case 'status':
        const status = await LearningPipeline.getPipelineStatus()
        return NextResponse.json({
          success: true,
          status
        })
        
      case 'metrics':
        const metrics = await LearningPipeline.getLearningMetrics()
        return NextResponse.json({
          success: true,
          metrics
        })
        
      case 'jobs':
        const jobs = await LearningPipeline.getCurrentJobs()
        return NextResponse.json({
          success: true,
          jobs
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
    console.error('Error getting learning data:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to retrieve learning pipeline data'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/ai/learning - Manage learning pipeline (start, stop, trigger jobs)
 */
async function manageLearning(request: NextRequest, user?: AuthUser) {
  try {
    // Only admin users can manage the learning pipeline
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Admin access required'
        },
        { status: 403 }
      )
    }
    
    const { action, ...data } = await request.json()
    
    switch (action) {
      case 'start':
        await LearningPipeline.startPipeline()
        return NextResponse.json({
          success: true,
          message: 'Learning pipeline started successfully'
        })
        
      case 'stop':
        await LearningPipeline.stopPipeline()
        return NextResponse.json({
          success: true,
          message: 'Learning pipeline stopped successfully'
        })
        
      case 'trigger-feedback':
        const feedbackMetrics = await LearningPipeline.processFeedbackBatch()
        return NextResponse.json({
          success: true,
          message: 'Feedback processing triggered',
          metrics: feedbackMetrics
        })
        
      case 'optimize-templates':
        await LearningPipeline.optimizeTemplates()
        return NextResponse.json({
          success: true,
          message: 'Template optimization completed'
        })
        
      case 'learn-patterns':
        await LearningPipeline.learnPatterns()
        return NextResponse.json({
          success: true,
          message: 'Pattern learning completed'
        })
        
      case 'cleanup-data':
        await LearningPipeline.cleanupLearningData()
        return NextResponse.json({
          success: true,
          message: 'Data cleanup completed'
        })
        
      case 'schedule-job':
        const { jobType, priority, delay } = data
        
        if (!jobType) {
          return NextResponse.json(
            { 
              success: false,
              error: 'Job type is required'
            },
            { status: 400 }
          )
        }
        
        await LearningPipeline.scheduleJob({
          type: jobType,
          priority: priority || 'MEDIUM',
          scheduledAt: new Date(Date.now() + (delay || 0))
        })
        
        return NextResponse.json({
          success: true,
          message: `${jobType} job scheduled successfully`
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
    console.error('Error managing learning pipeline:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to manage learning pipeline'
      },
      { status: 500 }
    )
  }
}

export const GET = createGuestFriendlyRoute(getLearningData)
export const POST = createGuestFriendlyRoute(manageLearning)