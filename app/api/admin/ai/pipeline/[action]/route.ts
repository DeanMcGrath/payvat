import { NextRequest, NextResponse } from 'next/server'
import { createGuestFriendlyRoute } from '@/lib/middleware'
import { AuthUser } from '@/lib/auth'
import { LearningPipeline } from '@/lib/ai/learningPipeline'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

/**
 * POST /api/admin/ai/pipeline/start - Start the learning pipeline
 * POST /api/admin/ai/pipeline/stop - Stop the learning pipeline
 */
async function handlePipelineAction(
  request: NextRequest, 
  user: AuthUser | undefined
) {
  const url = new URL(request.url)
  const action = url.pathname.split('/').pop()
  console.log(`🎛️ Pipeline ${action} API called`)
  
  try {
    // Only admin users can control the pipeline
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Admin access required'
        },
        { status: 403 }
      )
    }
    
    if (!action) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Action parameter is required'
        },
        { status: 400 }
      )
    }
    
    if (action !== 'start' && action !== 'stop') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid action. Use "start" or "stop"'
        },
        { status: 400 }
      )
    }
    
    let message: string
    let statusBefore = LearningPipeline.getStatus()
    
    try {
      if (action === 'start') {
        if (statusBefore.isRunning) {
          return NextResponse.json({
            success: true,
            message: 'Pipeline is already running',
            status: statusBefore
          })
        }
        
        await LearningPipeline.startPipeline()
        message = 'Learning pipeline started successfully'
        
        logger.info('Learning pipeline started by admin', {
          adminUserId: user.id,
          adminEmail: user.email
        }, 'ADMIN_AI_CONTROL')
        
      } else {
        if (!statusBefore.isRunning) {
          return NextResponse.json({
            success: true,
            message: 'Pipeline is already stopped',
            status: statusBefore
          })
        }
        
        await LearningPipeline.stopPipeline()
        message = 'Learning pipeline stopped successfully'
        
        logger.info('Learning pipeline stopped by admin', {
          adminUserId: user.id,
          adminEmail: user.email
        }, 'ADMIN_AI_CONTROL')
      }
      
      // Get updated status
      const statusAfter = LearningPipeline.getStatus()
      
      return NextResponse.json({
        success: true,
        message,
        status: statusAfter,
        timestamp: new Date().toISOString()
      })
      
    } catch (pipelineError) {
      console.error(`Pipeline ${action} error:`, pipelineError)
      
      return NextResponse.json(
        { 
          success: false,
          error: `Failed to ${action} pipeline: ${pipelineError instanceof Error ? pipelineError.message : 'Unknown error'}`,
          details: pipelineError instanceof Error ? pipelineError.message : 'Unknown error'
        },
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error(`Error handling pipeline ${action}:`, error)
    
    logger.error(`Failed to ${action} pipeline`, error, 'ADMIN_AI_CONTROL')
    
    return NextResponse.json(
      { 
        success: false,
        error: `Failed to ${action} learning pipeline`
      },
      { status: 500 }
    )
  }
}

export const POST = createGuestFriendlyRoute(handlePipelineAction)