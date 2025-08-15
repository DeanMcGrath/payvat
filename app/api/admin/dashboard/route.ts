import { NextRequest, NextResponse } from 'next/server'
import { createGuestFriendlyRoute } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { AuthUser } from '@/lib/auth'
import { extractionMonitor } from '@/lib/extraction-monitor'
import { logError, logAudit } from '@/lib/secure-logger'

interface DashboardStats {
  overview: {
    totalDocuments: number
    processedDocuments: number
    totalUsers: number
    guestUsers: number
    totalVATExtracted: number
    averageConfidence: number
  }
  extraction: {
    successRate: number
    averageAccuracy: number
    totalExtractions: number
    recentExtractions: Array<{
      fileName: string
      category: string
      vatAmount: number
      confidence: number
      processedAt: string
    }>
  }
  learning: {
    totalFeedback: number
    processedFeedback: number
    improvementsMade: number
    recentCorrections: Array<{
      documentName: string
      feedback: string
      originalTotal: number
      correctedTotal: number
      createdAt: string
    }>
  }
  performance: {
    averageProcessingTime: number
    recentErrors: number
    systemUptime: number
    memoryUsage: NodeJS.MemoryUsage
  }
  trends: {
    documentsPerDay: Array<{ date: string; count: number }>
    extractionAccuracy: Array<{ date: string; accuracy: number }>
  }
}

/**
 * GET /api/admin/dashboard - Get admin dashboard statistics
 */
async function getDashboardStats(request: NextRequest, user?: AuthUser) {
  try {
    logAudit('ADMIN_DASHBOARD_ACCESS', {
      userId: user?.id,
      operation: 'admin-dashboard',
      result: 'STARTED'
    })

    const dashboardStats: DashboardStats = {
      overview: {
        totalDocuments: 0,
        processedDocuments: 0,
        totalUsers: 0,
        guestUsers: 0,
        totalVATExtracted: 0,
        averageConfidence: 0
      },
      extraction: {
        successRate: 0,
        averageAccuracy: 0,
        totalExtractions: 0,
        recentExtractions: []
      },
      learning: {
        totalFeedback: 0,
        processedFeedback: 0,
        improvementsMade: 0,
        recentCorrections: []
      },
      performance: {
        averageProcessingTime: 0,
        recentErrors: 0,
        systemUptime: process.uptime(),
        memoryUsage: process.memoryUsage()
      },
      trends: {
        documentsPerDay: [],
        extractionAccuracy: []
      }
    }

    // Get overview statistics
    const [totalDocuments, processedDocuments, totalUsers, guestUsers] = await Promise.all([
      prisma.document.count(),
      prisma.document.count({ where: { isScanned: true } }),
      prisma.user.count(),
      prisma.user.count({ where: { role: 'GUEST' } })
    ])

    dashboardStats.overview.totalDocuments = totalDocuments
    dashboardStats.overview.processedDocuments = processedDocuments
    dashboardStats.overview.totalUsers = totalUsers
    dashboardStats.overview.guestUsers = guestUsers

    // Calculate total VAT extracted and average confidence
    const recentAuditLogs = await prisma.auditLog.findMany({
      where: {
        action: 'VAT_DATA_EXTRACTED',
        createdAt: {
          gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) // Last 7 days
        }
      },
      take: 100,
      orderBy: { createdAt: 'desc' }
    })

    let totalVAT = 0
    let totalConfidence = 0
    let confidenceCount = 0
    const recentExtractions: DashboardStats['extraction']['recentExtractions'] = []

    for (const log of recentAuditLogs.slice(0, 10)) {
      if (log.metadata && typeof log.metadata === 'object') {
        const metadata = log.metadata as any
        if (metadata.extractedData) {
          const { salesVAT = [], purchaseVAT = [], confidence = 0 } = metadata.extractedData
          const vatTotal = [...salesVAT, ...purchaseVAT].reduce((sum: number, val: number) => sum + val, 0)
          
          totalVAT += vatTotal
          if (confidence > 0) {
            totalConfidence += confidence
            confidenceCount++
          }

          if (recentExtractions.length < 10 && metadata.fileName) {
            recentExtractions.push({
              fileName: metadata.fileName,
              category: metadata.category || 'Unknown',
              vatAmount: vatTotal,
              confidence: confidence,
              processedAt: log.createdAt.toISOString()
            })
          }
        }
      }
    }

    dashboardStats.overview.totalVATExtracted = Math.round(totalVAT * 100) / 100
    dashboardStats.overview.averageConfidence = confidenceCount > 0 ? totalConfidence / confidenceCount : 0

    // Get extraction monitoring stats
    const extractionStats = extractionMonitor.getStats()
    dashboardStats.extraction.successRate = extractionStats.successRate
    dashboardStats.extraction.averageAccuracy = extractionStats.averageAccuracy
    dashboardStats.extraction.totalExtractions = extractionStats.totalAttempts
    dashboardStats.extraction.recentExtractions = recentExtractions

    // Get learning system stats
    const [learningTotal, learningProcessed, learningImproved] = await Promise.all([
      prisma.learningFeedback.count(),
      prisma.learningFeedback.count({ where: { wasProcessed: true } }),
      prisma.learningFeedback.count({ where: { improvementMade: true } })
    ])

    dashboardStats.learning.totalFeedback = learningTotal
    dashboardStats.learning.processedFeedback = learningProcessed
    dashboardStats.learning.improvementsMade = learningImproved

    // Get recent corrections
    const recentFeedback = await prisma.learningFeedback.findMany({
      where: {
        feedback: { in: ['INCORRECT', 'PARTIALLY_CORRECT'] }
      },
      include: {
        document: { select: { originalName: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    dashboardStats.learning.recentCorrections = recentFeedback.map(fb => {
      const originalTotal = [...fb.originalExtraction.salesVAT, ...fb.originalExtraction.purchaseVAT].reduce((sum: number, val: number) => sum + val, 0)
      const correctedTotal = [...fb.correctedExtraction.salesVAT, ...fb.correctedExtraction.purchaseVAT].reduce((sum: number, val: number) => sum + val, 0)

      return {
        documentName: fb.document?.originalName || 'Unknown',
        feedback: fb.feedback,
        originalTotal,
        correctedTotal,
        createdAt: fb.createdAt.toISOString()
      }
    })

    // Get performance stats
    const recentErrors = await prisma.auditLog.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 1000 * 60 * 60 * 24) // Last 24 hours
        },
        action: { contains: 'ERROR' }
      }
    })

    dashboardStats.performance.recentErrors = recentErrors
    dashboardStats.performance.averageProcessingTime = extractionStats.averageProcessingTime

    // Get document trends (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)
    const documentTrends = await prisma.document.groupBy({
      by: ['uploadedAt'],
      where: {
        uploadedAt: { gte: sevenDaysAgo }
      },
      _count: { id: true }
    })

    // Group by day
    const trendMap = new Map<string, number>()
    for (const trend of documentTrends) {
      const date = trend.uploadedAt.toISOString().split('T')[0]
      trendMap.set(date, (trendMap.get(date) || 0) + trend._count.id)
    }

    dashboardStats.trends.documentsPerDay = Array.from(trendMap.entries()).map(([date, count]) => ({
      date,
      count
    }))

    // Mock extraction accuracy trend (in production, you'd calculate this from actual data)
    const now = new Date()
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      dashboardStats.trends.extractionAccuracy.push({
        date: date.toISOString().split('T')[0],
        accuracy: Math.max(0.7, Math.min(0.95, 0.85 + (Math.random() - 0.5) * 0.2))
      })
    }

    logAudit('ADMIN_DASHBOARD_COMPLETED', {
      userId: user?.id,
      operation: 'admin-dashboard',
      result: 'SUCCESS'
    })

    return NextResponse.json({
      success: true,
      dashboard: dashboardStats,
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    logError('Admin dashboard failed', error, {
      userId: user?.id,
      operation: 'admin-dashboard'
    })
    
    return NextResponse.json(
      { error: 'Failed to retrieve dashboard statistics' },
      { status: 500 }
    )
  }
}

export const GET = createGuestFriendlyRoute(getDashboardStats)