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
      lastLearningRun
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
      
      // Average confidence from feedback
      prisma.learningFeedback.aggregate({
        where: {
          createdAt: { gte: thirtyDaysAgo },
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
      })
    ])
    
    // Calculate accuracy metrics
    let averageAccuracy = 0
    if (recentAnalytics.length > 0) {
      const accuracySum = recentAnalytics
        .filter((a: any) => a.extractionAccuracy !== null)
        .reduce((sum: number, a: any) => sum + (a.extractionAccuracy || 0), 0)
      
      const accuracyCount = recentAnalytics.filter((a: any) => a.extractionAccuracy !== null).length
      averageAccuracy = accuracyCount > 0 ? accuracySum / accuracyCount : 0
    }
    
    // Calculate processing efficiency
    const avgProcessingTime = recentAnalytics.length > 0 
      ? recentAnalytics.reduce((sum: number, a: any) => sum + a.processingTime, 0) / recentAnalytics.length
      : 0
    
    // Template usage statistics
    const templateUsage = await prisma.templateUsage.aggregate({
      where: {
        createdAt: { gte: thirtyDaysAgo }
      },
      _count: { _all: true },
      _avg: { 
        similarity: true,
        confidence: true
      }
    })
    
    const metrics = {
      totalFeedback,
      averageAccuracy,
      averageConfidence: avgConfidence._avg.confidenceScore || 0,
      templatesCreated: totalTemplates,
      templatesActive: activeTemplates,
      processingJobs: 0, // This would come from the learning pipeline
      lastLearningRun: lastLearningRun?.processedAt 
        ? formatTimeAgo(lastLearningRun.processedAt)
        : 'Never',
      
      // Additional insights
      insights: {
        avgProcessingTime: Math.round(avgProcessingTime),
        templateUsageCount: templateUsage._count._all,
        avgTemplateSimilarity: templateUsage._avg.similarity || 0,
        avgTemplateConfidence: templateUsage._avg.confidence || 0,
        recentDocumentsProcessed: recentAnalytics.length
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

export const GET = createGuestFriendlyRoute(getAIMetrics)