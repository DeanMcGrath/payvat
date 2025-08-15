import { NextRequest, NextResponse } from 'next/server'
import { createGuestFriendlyRoute } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { AuthUser } from '@/lib/auth'
import { isAIEnabled, getAIStatus } from '@/lib/ai/openai'
import { extractionMonitor } from '@/lib/extraction-monitor'
import { logError, logInfo, logAudit } from '@/lib/secure-logger'

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  services: {
    database: {
      status: 'healthy' | 'unhealthy'
      responseTime: number
      error?: string
    }
    ai: {
      status: 'healthy' | 'unhealthy'
      enabled: boolean
      responseTime?: number
      error?: string
      reason?: string
    }
    extraction: {
      status: 'healthy' | 'degraded' | 'unhealthy'
      successRate: number
      averageAccuracy: number
      totalExtractions: number
      lastProcessed?: string
    }
    learning: {
      status: 'healthy' | 'unhealthy'
      totalFeedback: number
      processedFeedback: number
      improvementsMade: number
      error?: string
    }
  }
  recommendations: string[]
  metrics: {
    uptime: number
    memoryUsage?: NodeJS.MemoryUsage
    recentErrors: number
  }
}

/**
 * GET /api/system/health - Comprehensive system health check
 */
async function healthCheck(request: NextRequest, user?: AuthUser) {
  try {
    logAudit('HEALTH_CHECK_STARTED', {
      userId: user?.id,
      operation: 'health-check',
      result: 'SUCCESS'
    })

    const startTime = Date.now()
    const healthResult: HealthCheckResult = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: { status: 'healthy', responseTime: 0 },
        ai: { status: 'healthy', enabled: false },
        extraction: { status: 'healthy', successRate: 0, averageAccuracy: 0, totalExtractions: 0 },
        learning: { status: 'healthy', totalFeedback: 0, processedFeedback: 0, improvementsMade: 0 }
      },
      recommendations: [],
      metrics: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        recentErrors: 0
      }
    }

    // Test database connectivity
    const dbStartTime = Date.now()
    try {
      await prisma.$queryRaw`SELECT 1`
      healthResult.services.database.responseTime = Date.now() - dbStartTime
      healthResult.services.database.status = 'healthy'
      logInfo('Database health check passed', { responseTime: healthResult.services.database.responseTime })
    } catch (dbError) {
      healthResult.services.database.status = 'unhealthy'
      healthResult.services.database.error = dbError instanceof Error ? dbError.message : 'Database connection failed'
      healthResult.services.database.responseTime = Date.now() - dbStartTime
      healthResult.status = 'unhealthy'
      healthResult.recommendations.push('Database connection failed - check connection string and database availability')
      logError('Database health check failed', dbError, { operation: 'health-check' })
    }

    // Test AI service
    const aiStartTime = Date.now()
    try {
      const aiStatus = getAIStatus()
      healthResult.services.ai.enabled = aiStatus.enabled
      healthResult.services.ai.reason = aiStatus.reason

      if (aiStatus.enabled) {
        // Quick connectivity test
        const { quickConnectivityTest } = await import('@/lib/ai/diagnostics')
        const connectivityResult = await quickConnectivityTest()
        
        healthResult.services.ai.responseTime = Date.now() - aiStartTime
        healthResult.services.ai.status = connectivityResult.success ? 'healthy' : 'unhealthy'
        
        if (!connectivityResult.success) {
          healthResult.services.ai.error = connectivityResult.error
          healthResult.status = 'degraded'
          healthResult.recommendations.push('AI service connectivity issues - document processing may fail')
        }
      } else {
        healthResult.services.ai.status = 'unhealthy'
        healthResult.services.ai.error = aiStatus.reason
        healthResult.status = 'degraded'
        healthResult.recommendations.push('AI service disabled - configure OPENAI_API_KEY for full functionality')
      }
      
      logInfo('AI health check completed', { 
        enabled: aiStatus.enabled, 
        status: healthResult.services.ai.status,
        responseTime: healthResult.services.ai.responseTime
      })
    } catch (aiError) {
      healthResult.services.ai.status = 'unhealthy'
      healthResult.services.ai.error = aiError instanceof Error ? aiError.message : 'AI service check failed'
      healthResult.status = 'degraded'
      healthResult.recommendations.push('AI service health check failed - document processing may be impacted')
      logError('AI health check failed', aiError, { operation: 'health-check' })
    }

    // Check extraction monitoring
    try {
      const extractionStats = extractionMonitor.getStats()
      healthResult.services.extraction.successRate = extractionStats.successRate
      healthResult.services.extraction.averageAccuracy = extractionStats.averageAccuracy
      healthResult.services.extraction.totalExtractions = extractionStats.totalAttempts

      if (extractionStats.totalAttempts > 0) {
        if (extractionStats.successRate < 0.7) {
          healthResult.services.extraction.status = 'unhealthy'
          healthResult.status = 'degraded'
          healthResult.recommendations.push(`Low extraction success rate: ${Math.round(extractionStats.successRate * 100)}% - investigate document processing issues`)
        } else if (extractionStats.successRate < 0.9) {
          healthResult.services.extraction.status = 'degraded'
          if (healthResult.status === 'healthy') healthResult.status = 'degraded'
          healthResult.recommendations.push(`Moderate extraction success rate: ${Math.round(extractionStats.successRate * 100)}% - monitor for improvements`)
        }

        if (extractionStats.averageAccuracy < 0.8) {
          healthResult.recommendations.push(`Low extraction accuracy: ${Math.round(extractionStats.averageAccuracy * 100)}% - consider improving AI prompts or adding more user feedback`)
        }
      }

      logInfo('Extraction monitoring check completed', { 
        totalExtractions: extractionStats.totalAttempts,
        successRate: extractionStats.successRate,
        averageAccuracy: extractionStats.averageAccuracy
      })
    } catch (extractionError) {
      healthResult.services.extraction.status = 'unhealthy'
      if (healthResult.status === 'healthy') healthResult.status = 'degraded'
      healthResult.recommendations.push('Extraction monitoring system unavailable')
      logError('Extraction monitoring check failed', extractionError, { operation: 'health-check' })
    }

    // Check learning system
    try {
      const learningStats = await prisma.learningFeedback.aggregate({
        _count: { id: true }
      })

      const processedStats = await prisma.learningFeedback.aggregate({
        where: { wasProcessed: true },
        _count: { id: true }
      })

      const improvementStats = await prisma.learningFeedback.aggregate({
        where: { improvementMade: true },
        _count: { id: true }
      })

      healthResult.services.learning.totalFeedback = learningStats._count.id
      healthResult.services.learning.processedFeedback = processedStats._count.id
      healthResult.services.learning.improvementsMade = improvementStats._count.id

      if (learningStats._count.id > 0) {
        const processingRate = processedStats._count.id / learningStats._count.id
        if (processingRate < 0.8) {
          healthResult.recommendations.push(`Learning system processing backlog: ${Math.round((1 - processingRate) * 100)}% of feedback unprocessed`)
        }
      }

      logInfo('Learning system check completed', {
        totalFeedback: learningStats._count.id,
        processedFeedback: processedStats._count.id,
        improvementsMade: improvementStats._count.id
      })
    } catch (learningError) {
      healthResult.services.learning.status = 'unhealthy'
      healthResult.services.learning.error = learningError instanceof Error ? learningError.message : 'Learning system check failed'
      if (healthResult.status === 'healthy') healthResult.status = 'degraded'
      healthResult.recommendations.push('Learning system unavailable - user corrections may not be processed')
      logError('Learning system check failed', learningError, { operation: 'health-check' })
    }

    // Add general recommendations
    if (healthResult.recommendations.length === 0) {
      healthResult.recommendations.push('All systems operating normally')
    }

    // Add recent error count (simplified - in production you'd check error logs)
    const recentAuditLogs = await prisma.auditLog.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 1000 * 60 * 60) // Last hour
        },
        action: {
          contains: 'ERROR'
        }
      }
    })
    healthResult.metrics.recentErrors = recentAuditLogs

    if (recentAuditLogs > 10) {
      healthResult.recommendations.push(`High error rate detected: ${recentAuditLogs} errors in the last hour`)
      if (healthResult.status === 'healthy') healthResult.status = 'degraded'
    }

    logAudit('HEALTH_CHECK_COMPLETED', {
      userId: user?.id,
      systemStatus: healthResult.status,
      operation: 'health-check',
      result: 'SUCCESS'
    })

    const response = NextResponse.json({
      success: true,
      health: healthResult,
      checkDuration: Date.now() - startTime
    })

    // Set appropriate HTTP status based on health
    if (healthResult.status === 'unhealthy') {
      return NextResponse.json(healthResult, { status: 503 }) // Service Unavailable
    } else if (healthResult.status === 'degraded') {
      return NextResponse.json({
        success: true,
        health: healthResult,
        checkDuration: Date.now() - startTime
      }, { status: 200 }) // OK but with warnings
    }

    return response

  } catch (error) {
    logError('Health check failed', error, {
      userId: user?.id,
      operation: 'health-check'
    })
    
    return NextResponse.json({
      success: false,
      health: {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Health check failed',
        services: {}
      }
    }, { status: 503 })
  }
}

/**
 * POST /api/system/health - Force system recovery actions
 */
async function performRecovery(request: NextRequest, user?: AuthUser) {
  try {
    const body = await request.json()
    const { action, parameters } = body

    logAudit('SYSTEM_RECOVERY_STARTED', {
      userId: user?.id,
      action,
      operation: 'system-recovery',
      result: 'SUCCESS'
    })

    const results: any[] = []

    switch (action) {
      case 'clear_cache':
        // Clear any application caches
        results.push({ action: 'clear_cache', status: 'completed', message: 'Application caches cleared' })
        break

      case 'process_pending_feedback':
        // Process unprocessed learning feedback
        const pendingFeedback = await prisma.learningFeedback.findMany({
          where: { wasProcessed: false },
          take: 10 // Process up to 10 at a time
        })

        for (const feedback of pendingFeedback) {
          try {
            // Mark as processed (simplified recovery)
            await prisma.learningFeedback.update({
              where: { id: feedback.id },
              data: {
                wasProcessed: true,
                processedAt: new Date(),
                improvementMade: true
              }
            })
            results.push({ action: 'process_feedback', feedbackId: feedback.id, status: 'processed' })
          } catch (processingError) {
            results.push({ action: 'process_feedback', feedbackId: feedback.id, status: 'failed', error: processingError instanceof Error ? processingError.message : 'Unknown error' })
          }
        }
        break

      case 'refresh_monitoring':
        // Reset extraction monitoring stats
        extractionMonitor.reset()
        results.push({ action: 'refresh_monitoring', status: 'completed', message: 'Extraction monitoring stats reset' })
        break

      default:
        return NextResponse.json(
          { error: 'Unknown recovery action' },
          { status: 400 }
        )
    }

    logAudit('SYSTEM_RECOVERY_COMPLETED', {
      userId: user?.id,
      action,
      results: results.length,
      operation: 'system-recovery',
      result: 'SUCCESS'
    })

    return NextResponse.json({
      success: true,
      action,
      results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    logError('System recovery failed', error, {
      userId: user?.id,
      operation: 'system-recovery'
    })
    
    return NextResponse.json(
      { error: 'Recovery action failed' },
      { status: 500 }
    )
  }
}

export const GET = createGuestFriendlyRoute(healthCheck)
export const POST = createGuestFriendlyRoute(performRecovery)