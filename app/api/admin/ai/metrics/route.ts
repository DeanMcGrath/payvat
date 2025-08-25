import { NextRequest, NextResponse } from 'next/server'
import { createGuestFriendlyRoute } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { AuthUser } from '@/lib/auth'

export const runtime = 'nodejs'

/**
 * GET /api/admin/ai/metrics - Get AI learning system metrics
 */
async function getAIMetrics(request: NextRequest, user?: AuthUser) {
  // console.log('📊 AI Metrics API called')
  
  try {
    // Only admin users can access metrics
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Admin access required'
        },
        { status: 403 }
      )
    }
    
    // Calculate metrics from the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    
    const [
      totalFeedback,
      totalTemplates,
      activeTemplates,
      avgConfidence,
      recentAnalytics,
      lastLearningRun,
      totalDocuments,
      successfulExtractions,
      errorCount,
      averageProcessingTime,
      templatePerformance,
      confidenceTrends
    ] = await Promise.all([
      // Total feedback count
      prisma.learningFeedback.count({
        where: {
          createdAt: { gte: thirtyDaysAgo }
        }
      }),
      
      // Total templates created
      prisma.documentTemplate.count(),
      
      // Active templates
      prisma.documentTemplate.count({
        where: { isActive: true }
      }),
      
      // Average confidence from analytics
      prisma.aIProcessingAnalytics.aggregate({
        where: {
          processedAt: { gte: thirtyDaysAgo },
          confidenceScore: { not: null }
        },
        _avg: { confidenceScore: true }
      }),
      
      // Recent processing analytics
      prisma.aIProcessingAnalytics.findMany({
        where: {
          processedAt: { gte: thirtyDaysAgo }
        },
        orderBy: { processedAt: 'desc' },
        take: 100
      }),
      
      // Get the most recent learning activity
      prisma.learningFeedback.findFirst({
        where: { wasProcessed: true },
        orderBy: { processedAt: 'desc' },
        select: { processedAt: true }
      }),

      // Total documents processed
      prisma.document.count({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          status: 'PROCESSED'
        }
      }),

      // Successful extractions (high confidence)
      prisma.aIProcessingAnalytics.count({
        where: {
          processedAt: { gte: thirtyDaysAgo },
          confidenceScore: { gte: 0.7 }
        }
      }),

      // Error count
      prisma.aIProcessingAnalytics.count({
        where: {
          processedAt: { gte: thirtyDaysAgo },
          hadErrors: true
        }
      }),

      // Average processing time
      prisma.aIProcessingAnalytics.aggregate({
        where: {
          processedAt: { gte: thirtyDaysAgo }
        },
        _avg: { processingTime: true }
      }),

      // Template performance
      prisma.templateUsage.aggregate({
        where: {
          createdAt: { gte: thirtyDaysAgo }
        },
        _count: { _all: true },
        _avg: { 
          similarity: true,
          confidence: true,
          processingTime: true
        }
      }),

      // Confidence trends (daily averages)
      prisma.$queryRaw`
        SELECT 
          DATE("processedAt") as date,
          AVG("confidenceScore")::float as avg_confidence,
          COUNT(*)::int as document_count
        FROM "ai_processing_analytics"
        WHERE "processedAt" >= ${thirtyDaysAgo}
        GROUP BY DATE("processedAt")
        ORDER BY date DESC
        LIMIT 30
      ` as any[]
    ])
    
    // Calculate accuracy metrics from extraction accuracy and success rates
    let averageAccuracy = 0
    if (recentAnalytics.length > 0) {
      const accuracySum = recentAnalytics
        .filter((a: any) => a.extractionAccuracy !== null)
        .reduce((sum: number, a: any) => sum + (a.extractionAccuracy || 0), 0)
      
      const accuracyCount = recentAnalytics.filter((a: any) => a.extractionAccuracy !== null).length
      averageAccuracy = accuracyCount > 0 ? accuracySum / accuracyCount : 0
    }

    // Calculate success rate
    const successRate = totalDocuments > 0 ? (successfulExtractions / totalDocuments) * 100 : 0
    const errorRate = recentAnalytics.length > 0 ? (errorCount / recentAnalytics.length) * 100 : 0
    
    // Calculate processing efficiency improvement
    const avgProcessingTimeMs = averageProcessingTime._avg.processingTime || 0
    
    // Template effectiveness
    const templateEffectiveness = templatePerformance._count._all > 0 ? 
      (templatePerformance._avg.confidence || 0) * 100 : 0
    
    const metrics = {
      // Core metrics
      totalFeedback,
      totalDocuments,
      averageAccuracy: Math.round(averageAccuracy * 100), // Convert to percentage
      averageConfidence: Math.round((avgConfidence._avg.confidenceScore || 0) * 100),
      successRate: Math.round(successRate),
      errorRate: Math.round(errorRate * 100) / 100, // Keep 2 decimal places
      
      // Template metrics
      templatesCreated: totalTemplates,
      templatesActive: activeTemplates,
      templateUsageCount: templatePerformance._count._all,
      templateEffectiveness: Math.round(templateEffectiveness),
      
      // Processing metrics
      avgProcessingTime: Math.round(avgProcessingTimeMs),
      avgTemplateSimilarity: Math.round((templatePerformance._avg.similarity || 0) * 100),
      
      // System health
      lastLearningRun: lastLearningRun?.processedAt 
        ? formatTimeAgo(lastLearningRun.processedAt)
        : 'Never',
      
      // Trends and analytics
      confidenceTrends: confidenceTrends.map(row => ({
        date: row.date.toISOString().split('T')[0],
        confidence: Math.round((row.avg_confidence || 0) * 100),
        documentCount: row.document_count
      })),
      
      // Performance insights
      insights: {
        documentsPerDay: Math.round(totalDocuments / 30),
        improvementRate: calculateImprovementRate(confidenceTrends),
        topPerformingMethod: getTopPerformingMethod(recentAnalytics),
        systemStatus: calculateSystemStatus(successRate, errorRate, avgConfidence._avg.confidenceScore || 0)
      }
    }
    
    return NextResponse.json({
      success: true,
      metrics,
      period: '30 days'
    })
    
  } catch (error) {
    console.error('Error getting AI metrics:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to retrieve AI metrics'
      },
      { status: 500 }
    )
  }
}

/**
 * Helper function to format time ago
 */
function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`
  if (diffHours < 24) return `${diffHours} hours ago`
  if (diffDays < 30) return `${diffDays} days ago`
  
  return date.toLocaleDateString()
}

/**
 * Calculate improvement rate from confidence trends
 */
function calculateImprovementRate(trends: any[]): number {
  if (trends.length < 2) return 0
  
  const recent = trends.slice(0, 7) // Last 7 days
  const previous = trends.slice(7, 14) // Previous 7 days
  
  if (recent.length === 0 || previous.length === 0) return 0
  
  const recentAvg = recent.reduce((sum, t) => sum + t.avg_confidence, 0) / recent.length
  const previousAvg = previous.reduce((sum, t) => sum + t.avg_confidence, 0) / previous.length
  
  return Math.round(((recentAvg - previousAvg) / previousAvg) * 100)
}

/**
 * Get top performing processing method
 */
function getTopPerformingMethod(analytics: any[]): string {
  if (analytics.length === 0) return 'N/A'
  
  const methodPerformance: Record<string, { count: number, totalConfidence: number }> = {}
  
  analytics.forEach(a => {
    const method = a.processingStrategy || 'UNKNOWN'
    if (!methodPerformance[method]) {
      methodPerformance[method] = { count: 0, totalConfidence: 0 }
    }
    methodPerformance[method].count++
    methodPerformance[method].totalConfidence += (a.confidenceScore || 0)
  })
  
  let bestMethod = 'UNKNOWN'
  let bestScore = 0
  
  Object.keys(methodPerformance).forEach(method => {
    const avgConfidence = methodPerformance[method].totalConfidence / methodPerformance[method].count
    const score = avgConfidence * Math.log(methodPerformance[method].count + 1) // Weight by usage
    
    if (score > bestScore) {
      bestScore = score
      bestMethod = method
    }
  })
  
  return bestMethod
}

/**
 * Calculate overall system status
 */
function calculateSystemStatus(successRate: number, errorRate: number, avgConfidence: number): string {
  const confidenceScore = avgConfidence * 100
  
  if (successRate >= 90 && errorRate <= 2 && confidenceScore >= 85) return 'Excellent'
  if (successRate >= 80 && errorRate <= 5 && confidenceScore >= 75) return 'Good'
  if (successRate >= 70 && errorRate <= 10 && confidenceScore >= 65) return 'Fair'
  return 'Needs Attention'
}

export const GET = createGuestFriendlyRoute(getAIMetrics)