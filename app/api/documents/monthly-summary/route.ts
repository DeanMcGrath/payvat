import { NextRequest, NextResponse } from 'next/server'
import { createGuestFriendlyRoute } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { AuthUser } from '@/lib/auth'
import { logError, logWarn, logInfo, logAudit, logPerformance } from '@/lib/secure-logger'

interface MonthlySummary {
  year: number
  month: number
  totalSalesAmount: number
  totalPurchaseAmount: number
  totalSalesVAT: number
  totalPurchaseVAT: number
  totalNetVAT: number
  documentCount: number
  salesDocumentCount: number
  purchaseDocumentCount: number
  averageProcessingQuality: number
  averageVATAccuracy: number
  complianceRate: number
  trends: {
    salesVATChange: number
    purchaseVATChange: number
    documentCountChange: number
  }
}

/**
 * GET /api/documents/monthly-summary - Get monthly document and VAT summaries
 */
async function getMonthlySummary(request: NextRequest, user?: AuthUser) {
  try {
    const startTime = Date.now()
    const { searchParams } = new URL(request.url)
    const requestedYear = searchParams.get('year')
    const requestedMonth = searchParams.get('month')
    
    // Test basic database connectivity
    try {
      await prisma.$queryRaw`SELECT 1`
    } catch (dbError) {
      logError('Database connection failed in monthly summary', dbError, {
        userId: user?.id,
        operation: 'monthly-summary-db-test'
      })
      return NextResponse.json({
        success: false,
        error: 'Database temporarily unavailable',
        monthlySummaries: [],
        currentMonth: null
      }, { status: 503 })
    }

    logAudit('MONTHLY_SUMMARY_REQUEST', {
      userId: user?.id,
      operation: 'monthly-summary',
      result: 'SUCCESS'
    })

    // Determine date range
    const currentDate = new Date()
    const targetYear = requestedYear ? parseInt(requestedYear) : currentDate.getFullYear()
    const targetMonth = requestedMonth ? parseInt(requestedMonth) : currentDate.getMonth() + 1

    // Build where clause for user/guest access
    const userWhere: any = {}
    
    if (user) {
      userWhere.userId = user.id
    } else {
      // Guest user logic with error handling
      try {
        const recentGuestUsers = await prisma.user.findMany({
          where: {
            role: 'GUEST',
            createdAt: {
              gte: new Date(Date.now() - 1000 * 60 * 60 * 24) // Last 24 hours
            }
          },
          select: { id: true },
          take: 50 // Limit guest users
        })
        
        if (recentGuestUsers.length === 0) {
          return NextResponse.json({
            success: true,
            monthlySummaries: [],
            currentMonth: null,
            message: 'No recent documents found'
          })
        }
        
        userWhere.userId = {
          in: recentGuestUsers.map(u => u.id)
        }
      } catch (guestError) {
        logError('Guest user lookup failed in monthly summary', guestError, {
          operation: 'monthly-summary-guest-lookup'
        })
        return NextResponse.json({
          success: false,
          error: 'Unable to retrieve guest data',
          monthlySummaries: [],
          currentMonth: null
        }, { status: 500 })
      }
    }

    // Get documents for the last 12 months to calculate trends
    let documentsData
    try {
      documentsData = await prisma.document.findMany({
      where: {
        ...userWhere,
        extractedYear: { not: null },
        extractedMonth: { not: null },
        // Get documents from the last 12 months
        OR: [
          {
            extractedYear: targetYear,
            extractedMonth: { lte: targetMonth }
          },
          {
            extractedYear: targetYear - 1,
            extractedMonth: { gte: targetMonth }
          }
        ]
      },
      select: {
        extractedYear: true,
        extractedMonth: true,
        category: true,
        invoiceTotal: true,
        vatAccuracy: true,
        processingQuality: true,
        validationStatus: true,
        complianceIssues: true,
        isDuplicate: true
      }
      })
    } catch (documentsError) {
      logError('Document query failed in monthly summary', documentsError, {
        userId: user?.id,
        operation: 'monthly-summary-documents-query',
        userWhere: JSON.stringify(userWhere)
      })
      return NextResponse.json({
        success: false,
        error: 'Failed to retrieve document data',
        monthlySummaries: [],
        currentMonth: null
      }, { status: 500 })
    }

    // Group documents by month and calculate summaries
    const monthlyData = new Map<string, MonthlySummary>()

    for (const doc of documentsData) {
      const key = `${doc.extractedYear}-${doc.extractedMonth}`
      
      if (!monthlyData.has(key)) {
        monthlyData.set(key, {
          year: doc.extractedYear!,
          month: doc.extractedMonth!,
          totalSalesAmount: 0,
          totalPurchaseAmount: 0,
          totalSalesVAT: 0,
          totalPurchaseVAT: 0,
          totalNetVAT: 0,
          documentCount: 0,
          salesDocumentCount: 0,
          purchaseDocumentCount: 0,
          averageProcessingQuality: 0,
          averageVATAccuracy: 0,
          complianceRate: 0,
          trends: {
            salesVATChange: 0,
            purchaseVATChange: 0,
            documentCountChange: 0
          }
        })
      }

      const summary = monthlyData.get(key)!
      
      // Update counts
      summary.documentCount += 1
      
      if (doc.category?.includes('SALES')) {
        summary.salesDocumentCount += 1
        if (doc.invoiceTotal) {
          const amount = parseFloat(doc.invoiceTotal.toString())
          summary.totalSalesAmount += amount
          // Estimate VAT at 23% (will be replaced with actual extracted VAT)
          summary.totalSalesVAT += amount * 0.23
        }
      } else if (doc.category?.includes('PURCHASE')) {
        summary.purchaseDocumentCount += 1
        if (doc.invoiceTotal) {
          const amount = parseFloat(doc.invoiceTotal.toString())
          summary.totalPurchaseAmount += amount
          // Estimate VAT at 23%
          summary.totalPurchaseVAT += amount * 0.23
        }
      }

      // Update quality metrics
      if (doc.processingQuality) {
        summary.averageProcessingQuality += doc.processingQuality
      }
      if (doc.vatAccuracy) {
        summary.averageVATAccuracy += doc.vatAccuracy
      }
    }

    // Calculate averages and compliance rates
    const monthlySummaries: MonthlySummary[] = []
    
    for (const [key, summary] of monthlyData) {
      if (summary.documentCount > 0) {
        summary.averageProcessingQuality = summary.averageProcessingQuality / summary.documentCount
        summary.averageVATAccuracy = summary.averageVATAccuracy / summary.documentCount
        
        // Calculate compliance rate
        const monthDocs = documentsData.filter(doc => 
          doc.extractedYear === summary.year && 
          doc.extractedMonth === summary.month
        )
        const compliantDocs = monthDocs.filter(doc => 
          doc.validationStatus === 'COMPLIANT' && 
          (!doc.complianceIssues || doc.complianceIssues.length === 0) && 
          !doc.isDuplicate
        ).length
        summary.complianceRate = compliantDocs / monthDocs.length
        
        // Calculate net VAT
        summary.totalNetVAT = summary.totalSalesVAT - summary.totalPurchaseVAT
      }
      
      monthlySummaries.push(summary)
    }

    // Sort by year and month (most recent first)
    monthlySummaries.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year
      return b.month - a.month
    })

    // Calculate trends for each month
    for (let i = 0; i < monthlySummaries.length; i++) {
      const current = monthlySummaries[i]
      const previous = monthlySummaries[i + 1] // Previous month (sorted desc)
      
      if (previous) {
        // Calculate percentage changes
        current.trends.salesVATChange = previous.totalSalesVAT > 0 
          ? ((current.totalSalesVAT - previous.totalSalesVAT) / previous.totalSalesVAT) * 100
          : 0
          
        current.trends.purchaseVATChange = previous.totalPurchaseVAT > 0
          ? ((current.totalPurchaseVAT - previous.totalPurchaseVAT) / previous.totalPurchaseVAT) * 100
          : 0
          
        current.trends.documentCountChange = previous.documentCount > 0
          ? ((current.documentCount - previous.documentCount) / previous.documentCount) * 100
          : 0
      }
    }

    // Find the current/requested month summary
    const currentMonth = monthlySummaries.find(s => s.year === targetYear && s.month === targetMonth) || null

    logPerformance('monthly-summary', Date.now() - startTime, {
      operation: 'monthly-summary',
      monthCount: monthlySummaries.length,
      documentCount: documentsData.length
    })

    return NextResponse.json({
      success: true,
      monthlySummaries,
      currentMonth,
      requestedPeriod: {
        year: targetYear,
        month: targetMonth
      }
    })

  } catch (error) {
    logError('Monthly summary failed', error, 'API_MONTHLY_SUMMARY')
    return NextResponse.json({
      success: false,
      error: 'Failed to generate monthly summary'
    }, { status: 500 })
  }
}

export const GET = createGuestFriendlyRoute(getMonthlySummary)