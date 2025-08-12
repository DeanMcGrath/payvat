import { NextRequest, NextResponse } from 'next/server'
import { createGuestFriendlyRoute } from '@/lib/middleware'
import { AuthUser } from '@/lib/auth'
import { LearningPipeline } from '@/lib/ai/learningPipeline'

export const runtime = 'nodejs'

/**
 * GET /api/admin/ai/pipeline-status - Get learning pipeline status
 */
async function getPipelineStatus(request: NextRequest, user?: AuthUser) {
  console.log('🔍 Pipeline Status API called')
  
  try {
    // Only admin users can access pipeline status
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Admin access required'
        },
        { status: 403 }
      )
    }
    
    // Get current pipeline status
    const status = LearningPipeline.getStatus()
    
    return NextResponse.json({
      success: true,
      status: {
        isRunning: status.isRunning,
        currentJobs: status.currentJobs.map(job => ({
          id: job.id,
          type: job.type,
          status: job.status,
          priority: job.priority,
          scheduledAt: job.scheduledAt,
          startedAt: job.startedAt,
          errorMessage: job.errorMessage,
          progress: calculateJobProgress(job)
        })),
        recentMetrics: status.recentMetrics,
        systemHealth: {
          status: status.isRunning ? 'HEALTHY' : 'INACTIVE',
          uptime: status.isRunning ? getUptime() : null,
          jobsInQueue: status.currentJobs.filter(j => j.status === 'PENDING').length,
          jobsRunning: status.currentJobs.filter(j => j.status === 'RUNNING').length,
          jobsCompleted: status.currentJobs.filter(j => j.status === 'COMPLETED').length,
          jobsFailed: status.currentJobs.filter(j => j.status === 'FAILED').length
        }
      }
    })
    
  } catch (error) {
    console.error('Error getting pipeline status:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to retrieve pipeline status'
      },
      { status: 500 }
    )
  }
}

/**
 * Helper function to calculate job progress
 */
function calculateJobProgress(job: any): number {
  if (job.status === 'COMPLETED') return 100
  if (job.status === 'FAILED') return 0
  if (job.status === 'PENDING') return 0
  if (job.status === 'RUNNING') {
    // Estimate progress based on elapsed time
    const elapsed = job.startedAt ? Date.now() - new Date(job.startedAt).getTime() : 0
    const estimated = getEstimatedJobTime(job.type)
    return Math.min(90, Math.floor((elapsed / estimated) * 100)) // Cap at 90% until complete
  }
  return 0
}

/**
 * Get estimated time for different job types
 */
function getEstimatedJobTime(jobType: string): number {
  switch (jobType) {
    case 'PROCESS_FEEDBACK': return 60000 // 1 minute
    case 'OPTIMIZE_TEMPLATES': return 120000 // 2 minutes
    case 'LEARN_PATTERNS': return 180000 // 3 minutes
    case 'CLEANUP_DATA': return 30000 // 30 seconds
    default: return 60000
  }
}

/**
 * Get pipeline uptime (placeholder - would track actual start time)
 */
function getUptime(): string {
  // This would be implemented to track actual pipeline uptime
  return '2h 15m'
}

export const GET = createGuestFriendlyRoute(getPipelineStatus)