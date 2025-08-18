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
      case 'vat-trends':
        return await generateVATTrends(user)
      case 'vat-breakdown':
        return await generateVATBreakdown(user)
      case 'insights':
        return await generateInsights(user)
      case 'calendar-events':
        return await generateCalendarEvents(user)
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

async function generateVATTrends(user: AuthUser) {
  const now = new Date()
  const last12Months = new Date(now.getFullYear(), now.getMonth() - 11, 1)
  
  // Get VAT returns for the last 12 months
  const vatReturns = await prisma.vATReturn.findMany({
    where: {
      userId: user.id,
      periodStart: {
        gte: last12Months
      },
      status: {
        not: 'DRAFT'
      }
    },
    orderBy: {
      periodEnd: 'asc'
    }
  })
  
  // Group by month and calculate trends
  const monthlyData = []
  for (let i = 11; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthReturns = vatReturns.filter(vr => 
      vr.periodEnd.getMonth() === monthDate.getMonth() &&
      vr.periodEnd.getFullYear() === monthDate.getFullYear()
    )
    
    const salesVAT = monthReturns.reduce((sum, vr) => sum + Number(vr.salesVAT), 0)
    const purchaseVAT = monthReturns.reduce((sum, vr) => sum + Number(vr.purchaseVAT), 0)
    const netVAT = monthReturns.reduce((sum, vr) => sum + Number(vr.netVAT), 0)
    
    monthlyData.push({
      month: monthDate.toLocaleDateString('en-IE', { month: 'short' }),
      period: monthDate.toLocaleDateString('en-IE', { month: 'long', year: 'numeric' }),
      salesVAT,
      purchaseVAT,
      netVAT
    })
  }
  
  return NextResponse.json({
    success: true,
    report: {
      type: 'vat-trends',
      trends: monthlyData
    }
  })
}

async function generateVATBreakdown(user: AuthUser) {
  const currentYear = new Date().getFullYear()
  const startOfYear = new Date(currentYear, 0, 1)
  
  // Get current year VAT totals
  const yearTotals = await prisma.vATReturn.aggregate({
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
      purchaseVAT: true
    }
  })
  
  return NextResponse.json({
    success: true,
    report: {
      type: 'vat-breakdown',
      breakdown: {
        salesVAT: Number(yearTotals._sum.salesVAT || 0),
        purchaseVAT: Number(yearTotals._sum.purchaseVAT || 0)
      }
    }
  })
}

async function generateInsights(user: AuthUser) {
  const now = new Date()
  const insights = []
  
  // Check for upcoming deadlines
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
    take: 3
  })
  
  upcomingReturns.forEach(vatReturn => {
    const daysUntilDue = Math.ceil((vatReturn.dueDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
    insights.push({
      id: `deadline-${vatReturn.id}`,
      type: 'deadline',
      priority: daysUntilDue <= 7 ? 'high' : 'medium',
      title: daysUntilDue <= 7 ? 'VAT Return Due Soon' : 'Upcoming VAT Return',
      description: `Your VAT return is due in ${daysUntilDue} days. Start preparing now to avoid penalties.`,
      daysUntilDue,
      action: {
        text: 'Start VAT Return',
        href: '/vat-period'
      }
    })
  })
  
  // Add trend insights
  const last3Months = await prisma.vATReturn.findMany({
    where: {
      userId: user.id,
      periodStart: {
        gte: new Date(now.getFullYear(), now.getMonth() - 3, 1)
      },
      status: {
        not: 'DRAFT'
      }
    },
    orderBy: {
      periodEnd: 'desc'
    },
    take: 3
  })
  
  if (last3Months.length >= 2) {
    const recent = Number(last3Months[0]?.netVAT || 0)
    const previous = Number(last3Months[1]?.netVAT || 0)
    
    if (previous > 0) {
      const growth = ((recent - previous) / previous) * 100
      if (Math.abs(growth) > 10) {
        insights.push({
          id: 'trend-analysis',
          type: 'trend',
          priority: 'low',
          title: 'VAT Trend Analysis',
          description: `Your VAT payments have ${growth > 0 ? 'increased' : 'decreased'} by ${Math.abs(growth).toFixed(1)}% compared to last period, indicating business ${growth > 0 ? 'growth' : 'changes'}.`,
          action: {
            text: 'View Trends',
            href: '/reports'
          }
        })
      }
    }
  }
  
  return NextResponse.json({
    success: true,
    report: {
      type: 'insights',
      insights
    }
  })
}

async function generateCalendarEvents(user: AuthUser) {
  const now = new Date()
  const next3Months = new Date(now.getFullYear(), now.getMonth() + 3, 0)
  const events: Array<{
    id: string
    date: Date
    type: string
    title: string
    description: string
    status: string
    amount?: number
  }> = []
  
  // Get upcoming VAT return deadlines
  const upcomingReturns = await prisma.vATReturn.findMany({
    where: {
      userId: user.id,
      dueDate: {
        gte: now,
        lte: next3Months
      }
    },
    orderBy: {
      dueDate: 'asc'
    }
  })
  
  upcomingReturns.forEach(vatReturn => {
    const daysUntil = Math.ceil((vatReturn.dueDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
    let status = 'upcoming'
    if (daysUntil <= 0) status = 'overdue'
    else if (daysUntil <= 7) status = 'due'
    
    events.push({
      id: `deadline-${vatReturn.id}`,
      date: vatReturn.dueDate,
      type: 'deadline',
      title: 'VAT Return Due',
      description: `${vatReturn.periodStart.toLocaleDateString('en-IE', { month: 'short' })} - ${vatReturn.periodEnd.toLocaleDateString('en-IE', { month: 'short', year: 'numeric' })} VAT return`,
      status,
      amount: Number(vatReturn.netVAT)
    })
  })
  
  // Get submitted returns in the last 3 months
  const past3Months = new Date(now.getFullYear(), now.getMonth() - 3, 1)
  const submittedReturns = await prisma.vATReturn.findMany({
    where: {
      userId: user.id,
      submittedAt: {
        gte: past3Months,
        lte: now
      },
      status: {
        not: 'DRAFT'
      }
    },
    orderBy: {
      submittedAt: 'desc'
    },
    take: 10
  })
  
  submittedReturns.forEach(vatReturn => {
    if (vatReturn.submittedAt) {
      events.push({
        id: `submitted-${vatReturn.id}`,
        date: vatReturn.submittedAt,
        type: 'submitted',
        title: 'VAT Return Submitted',
        description: `${vatReturn.periodStart.toLocaleDateString('en-IE', { month: 'short' })} - ${vatReturn.periodEnd.toLocaleDateString('en-IE', { month: 'short', year: 'numeric' })} successfully filed`,
        status: 'completed'
      })
    }
  })
  
  return NextResponse.json({
    success: true,
    report: {
      type: 'calendar-events',
      events: events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }
  })
}

export const GET = createProtectedRoute(generateReports)