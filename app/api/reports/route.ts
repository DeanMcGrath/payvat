import { NextRequest, NextResponse } from 'next/server'
import { createProtectedRoute } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/vatUtils'
import { AuthUser } from '@/lib/auth'

// GET /api/reports - Generate various reports for user
async function generateReports(request: NextRequest, user: AuthUser) {
  try {
    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type') || 'summary'
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const monthParam = searchParams.get('month')
    const month = monthParam ? parseInt(monthParam) : null
    
    const startDate = month ? new Date(year, month - 1, 1) : new Date(year, 0, 1)
    const endDate = month ? new Date(year, month, 0) : new Date(year + 1, 0, 0)
    
    switch (reportType) {
      case 'summary':
        return await generateSummaryReport(user, startDate, endDate)
      case 'vat-history':
        return await generateVATHistoryReport(user, startDate, endDate)
      case 'payment-history':
        return await generatePaymentHistoryReport(user, startDate, endDate)
      case 'dashboard-stats':
        return await generateDashboardStats(user)
      default:
        return NextResponse.json(
          { error: 'Invalid report type' },
          { status: 400 }
        )
    }
    
  } catch (error) {
    console.error('Report generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}

async function generateSummaryReport(user: AuthUser, startDate: Date, endDate: Date) {
  // Get VAT returns for the period
  const vatReturns = await prisma.vATReturn.findMany({
    where: {
      userId: user.id,
      periodStart: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      payment: true
    },
    orderBy: {
      periodEnd: 'asc'
    }
  })
  
  // Calculate totals
  const totals = vatReturns.reduce((acc, vatReturn) => ({
    totalSalesVAT: acc.totalSalesVAT + Number(vatReturn.salesVAT),
    totalPurchaseVAT: acc.totalPurchaseVAT + Number(vatReturn.purchaseVAT),
    totalNetVAT: acc.totalNetVAT + Number(vatReturn.netVAT),
    totalPaid: acc.totalPaid + (vatReturn.payment?.status === 'COMPLETED' ? Number(vatReturn.payment.amount) : 0),
    returnsCount: acc.returnsCount + 1,
    submittedCount: acc.submittedCount + (vatReturn.status !== 'DRAFT' ? 1 : 0)
  }), {
    totalSalesVAT: 0,
    totalPurchaseVAT: 0,
    totalNetVAT: 0,
    totalPaid: 0,
    returnsCount: 0,
    submittedCount: 0
  })
  
  return NextResponse.json({
    success: true,
    report: {
      type: 'summary',
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      totals,
      vatReturns: vatReturns.map(vr => ({
        id: vr.id,
        periodStart: vr.periodStart,
        periodEnd: vr.periodEnd,
        salesVAT: Number(vr.salesVAT),
        purchaseVAT: Number(vr.purchaseVAT),
        netVAT: Number(vr.netVAT),
        status: vr.status,
        submittedAt: vr.submittedAt,
        dueDate: vr.dueDate,
        payment: vr.payment ? {
          amount: Number(vr.payment.amount),
          status: vr.payment.status,
          processedAt: vr.payment.processedAt
        } : null
      }))
    }
  })
}

async function generateVATHistoryReport(user: AuthUser, startDate: Date, endDate: Date) {
  const vatReturns = await prisma.vATReturn.findMany({
    where: {
      userId: user.id,
      periodStart: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      documents: {
        select: {
          id: true,
          originalName: true,
          category: true,
          uploadedAt: true
        }
      },
      payment: true
    },
    orderBy: [
      { periodEnd: 'desc' },
      { createdAt: 'desc' }
    ]
  })
  
  return NextResponse.json({
    success: true,
    report: {
      type: 'vat-history',
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      vatReturns: vatReturns.map(vr => ({
        id: vr.id,
        periodStart: vr.periodStart,
        periodEnd: vr.periodEnd,
        salesVAT: Number(vr.salesVAT),
        purchaseVAT: Number(vr.purchaseVAT),
        netVAT: Number(vr.netVAT),
        status: vr.status,
        submittedAt: vr.submittedAt,
        dueDate: vr.dueDate,
        revenueRefNumber: vr.revenueRefNumber,
        documentsCount: vr.documents.length,
        payment: vr.payment ? {
          id: vr.payment.id,
          amount: Number(vr.payment.amount),
          status: vr.payment.status,
          processedAt: vr.payment.processedAt,
          receiptNumber: vr.payment.receiptNumber
        } : null,
        createdAt: vr.createdAt,
        updatedAt: vr.updatedAt
      }))
    }
  })
}

async function generatePaymentHistoryReport(user: AuthUser, startDate: Date, endDate: Date) {
  const payments = await prisma.payment.findMany({
    where: {
      userId: user.id,
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      vatReturn: {
        select: {
          id: true,
          periodStart: true,
          periodEnd: true,
          revenueRefNumber: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
  
  return NextResponse.json({
    success: true,
    report: {
      type: 'payment-history',
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      payments: payments.map(payment => ({
        id: payment.id,
        amount: Number(payment.amount),
        currency: payment.currency,
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        processedAt: payment.processedAt,
        failedAt: payment.failedAt,
        failureReason: payment.failureReason,
        receiptNumber: payment.receiptNumber,
        receiptUrl: payment.receiptUrl,
        vatReturn: payment.vatReturn ? {
          id: payment.vatReturn.id,
          period: `${payment.vatReturn.periodStart.toLocaleDateString()} - ${payment.vatReturn.periodEnd.toLocaleDateString()}`,
          revenueRefNumber: payment.vatReturn.revenueRefNumber
        } : null,
        createdAt: payment.createdAt
      }))
    }
  })
}

async function generateDashboardStats(user: AuthUser) {
  const now = new Date()
  const currentYear = now.getFullYear()
  const startOfYear = new Date(currentYear, 0, 1)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  
  // Get current year stats
  const yearStats = await prisma.vATReturn.aggregate({
    where: {
      userId: user.id,
      periodStart: {
        gte: startOfYear
      },
      status: {
        not: 'DRAFT'
      }
    },
    _sum: {
      salesVAT: true,
      purchaseVAT: true,
      netVAT: true
    },
    _count: {
      id: true
    }
  })
  
  // Get pending payments
  const pendingPayments = await prisma.payment.findMany({
    where: {
      userId: user.id,
      status: {
        in: ['PENDING', 'PROCESSING']
      }
    },
    include: {
      vatReturn: {
        select: {
          dueDate: true,
          periodEnd: true
        }
      }
    }
  })
  
  // Get upcoming due dates
  const upcomingReturns = await prisma.vATReturn.findMany({
    where: {
      userId: user.id,
      status: 'DRAFT',
      dueDate: {
        gte: now,
        lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // Next 30 days
      }
    },
    orderBy: {
      dueDate: 'asc'
    },
    take: 5
  })
  
  // Get recent activity
  const recentActivity = await prisma.auditLog.findMany({
    where: {
      userId: user.id,
      action: {
        in: ['SUBMIT_VAT_RETURN', 'UPLOAD_DOCUMENT', 'CALCULATE_VAT']
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 10
  })
  
  return NextResponse.json({
    success: true,
    report: {
      type: 'dashboard-stats',
      stats: {
        currentYear: {
          totalSalesVAT: Number(yearStats._sum.salesVAT || 0),
          totalPurchaseVAT: Number(yearStats._sum.purchaseVAT || 0),
          totalNetVAT: Number(yearStats._sum.netVAT || 0),
          returnsSubmitted: yearStats._count.id
        },
        pendingPayments: pendingPayments.map(p => ({
          id: p.id,
          amount: Number(p.amount),
          status: p.status,
          dueDate: p.vatReturn?.dueDate,
          period: p.vatReturn ? 
            `${p.vatReturn.periodEnd.toLocaleDateString('en-IE', { month: 'short', year: 'numeric' })}` 
            : null
        })),
        upcomingReturns: upcomingReturns.map(vr => ({
          id: vr.id,
          period: `${vr.periodStart.toLocaleDateString('en-IE', { month: 'short' })} - ${vr.periodEnd.toLocaleDateString('en-IE', { month: 'short', year: 'numeric' })}`,
          netVAT: Number(vr.netVAT),
          dueDate: vr.dueDate,
          daysUntilDue: Math.ceil((vr.dueDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
        })),
        recentActivity: recentActivity.map(log => ({
          action: log.action,
          entityType: log.entityType,
          createdAt: log.createdAt,
          metadata: log.metadata
        }))
      }
    }
  })
}

export const GET = createProtectedRoute(generateReports)