import { NextRequest, NextResponse } from 'next/server'
import { createGuestFriendlyRoute } from '@/lib/middleware'
import { AuthUser } from '@/lib/auth'
import { LearningPipeline } from '@/lib/ai/learningPipeline'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

/**
 * POST /api/admin/ai/trigger-learning - Trigger immediate learning process
 */
async function triggerLearning(request: NextRequest, user?: AuthUser) {
  // console.log('⚡ Trigger Learning API called')
  
  try {
    // Only admin users can trigger learning
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Admin access required'
        },
        { status: 403 }
      )
    }
    
    // Check if pipeline is running
    const pipelineStatus = LearningPipeline.getStatus()
    
    if (!pipelineStatus.isRunning) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Learning pipeline is not running. Please start it first.'
        },
        { status: 400 }
      )
    }
    
    const startTime = Date.now()
    
    try {
      console.log('🚀 Starting manual learning process...')
      
      // Trigger immediate feedback processing
      const feedbackMetrics = await LearningPipeline.processFeedbackBatch()
      
      // Trigger template optimization
      await LearningPipeline.optimizeTemplates()
      
      // Trigger pattern learning
      await LearningPipeline.learnPatterns()
      
      const processingTime = Date.now() - startTime
      
      const results = {
        processingTimeMs: processingTime,
        feedbackProcessed: feedbackMetrics.totalFeedbackProcessed,
        templatesCreated: feedbackMetrics.templatesCreated,
        templatesOptimized: feedbackMetrics.templatesOptimized,
        patternsLearned: feedbackMetrics.patternsLearned,
        accuracyImprovement: feedbackMetrics.accuracyImprovement,
        timestamp: new Date().toISOString()
      }
      
      console.log('✅ Manual learning process completed:', results)
      
      // Log the manual trigger
      logger.info('Manual learning process triggered', {
        adminUserId: user.id,
        adminEmail: user.email,
        results
      }, 'ADMIN_AI_LEARNING')
      
      return NextResponse.json({
        success: true,
        message: 'Learning process completed successfully',
        results,
        summary: generateLearningSum(results)
      })
      
    } catch (learningError) {
      console.error('Learning process failed:', learningError)
      
      const processingTime = Date.now() - startTime
      
      logger.error('Manual learning process failed', {
        error: learningError,
        adminUserId: user.id,
        processingTime
      }, 'ADMIN_AI_LEARNING')
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Learning process failed',
          details: learningError instanceof Error ? learningError.message : 'Unknown error',
          processingTime
        },
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error('Error triggering learning:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to trigger learning process'
      },
      { status: 500 }
    )
  }
}

/**
 * Generate a human-readable summary of learning results
 */
function generateLearningSum

(results: any): string[] {
  const summary: string[] = []
  
  if (results.feedbackProcessed > 0) {
    summary.push(`Processed ${results.feedbackProcessed} user feedback items`)
  }
  
  if (results.templatesCreated > 0) {
    summary.push(`Created ${results.templatesCreated} new document templates`)
  }
  
  if (results.templatesOptimized > 0) {
    summary.push(`Optimized ${results.templatesOptimized} existing templates`)
  }
  
  if (results.patternsLearned > 0) {
    summary.push(`Learned ${results.patternsLearned} new document patterns`)
  }
  
  if (results.accuracyImprovement > 0) {
    summary.push(`Improved accuracy by ${(results.accuracyImprovement * 100).toFixed(1)}%`)
  }
  
  if (summary.length === 0) {
    summary.push('No new learning data available at this time')
  }
  
  summary.push(`Completed in ${(results.processingTimeMs / 1000).toFixed(1)} seconds`)
  
  return summary
}

export const POST = createGuestFriendlyRoute(triggerLearning)