import { NextRequest, NextResponse } from 'next/server'
import { createAdminRoute } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { AuthUser } from '@/lib/auth'

// GET /api/admin/returns - View all VAT returns (admin only)
async function getvATReturns(request: NextRequest, user: AuthUser) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')
    const year = searchParams.get('year')
    const quarter = searchParams.get('quarter')
    const overdue = searchParams.get('overdue') // 'true' or 'false'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    
    // Build where clause
    const where: any = {}
    
    if (userId) {
      where.userId = userId
    }
    
    if (status) {
      where.status = status
    }
    
    if (year) {
      const yearNum = parseInt(year)
      where.periodStart = {
        gte: new Date(yearNum, 0, 1),
        lt: new Date(yearNum + 1, 0, 1)
      }
    }
    
    if (quarter && year) {
      const yearNum = parseInt(year)
      const quarterNum = parseInt(quarter)
      const startMonth = (quarterNum - 1) * 3
      where.periodStart = {
        gte: new Date(yearNum, startMonth, 1),
        lt: new Date(yearNum, startMonth + 3, 1)
      }
    }
    
    if (overdue === 'true') {
      where.dueDate = { lt: new Date() }
      where.status = { in: ['DRAFT', 'SUBMITTED'] }
    }
    
    // Get total count and aggregations
    const [totalCount, aggregations] = await Promise.all([
      prisma.vATReturn.count({ where }),
      prisma.vATReturn.aggregate({
        where,
        _sum: { 
          salesVAT: true,
          purchaseVAT: true,
          netVAT: true
        },
        _avg: { netVAT: true }
      })
    ])
    
    // Get VAT returns with user and payment info
    const vatReturns = await prisma.vATReturn.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            businessName: true,
            vatNumber: true
          }
        },
        payment: {
          select: {
            id: true,
            amount: true,
            status: true,
            processedAt: true,
            receiptNumber: true
          }
        },
        documents: {
          select: {
            id: true,
            originalName: true,
            category: true,
            isScanned: true
          }
        }
      },
      orderBy: [
        { periodEnd: 'desc' },
        { createdAt: 'desc' }
      ],
      skip: (page - 1) * limit,
      take: limit
    })
    
    // Get status statistics
    const statusStats = await prisma.vATReturn.groupBy({
      by: ['status'],
      where,
      _count: { status: true },
      _sum: { netVAT: true }
    })
    
    // Create admin audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'ADMIN_VIEW_VAT_RETURNS',
        entityType: 'VAT_RETURN',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        metadata: {
          filters: { userId, status, year, quarter, overdue },
          resultCount: vatReturns.length,
          totalNetVAT: Number(aggregations._sum.netVAT || 0),
          timestamp: new Date().toISOString()
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      vatReturns: vatReturns.map(vr => ({
        id: vr.id,
        periodStart: vr.periodStart,
        periodEnd: vr.periodEnd,
        salesVAT: Number(vr.salesVAT),
        purchaseVAT: Number(vr.purchaseVAT),
        netVAT: Number(vr.netVAT),
        status: vr.status,
        submittedAt: vr.submittedAt,
        paidAt: vr.paidAt,
        dueDate: vr.dueDate,
        revenueRefNumber: vr.revenueRefNumber,
        createdAt: vr.createdAt,
        updatedAt: vr.updatedAt,
        user: vr.user,
        payment: vr.payment ? {
          id: vr.payment.id,
          amount: Number(vr.payment.amount),
          status: vr.payment.status,
          processedAt: vr.payment.processedAt,
          receiptNumber: vr.payment.receiptNumber
        } : null,
        documentsCount: vr.documents.length,
        isOverdue: vr.dueDate < new Date() && !['PAID', 'APPROVED'].includes(vr.status)
      })),
      statistics: {
        totalSalesVAT: Number(aggregations._sum.salesVAT || 0),
        totalPurchaseVAT: Number(aggregations._sum.purchaseVAT || 0),
        totalNetVAT: Number(aggregations._sum.netVAT || 0),
        averageNetVAT: Number(aggregations._avg.netVAT || 0),
        statusBreakdown: statusStats.map(stat => ({
          status: stat.status,
          count: stat._count.status,
          totalNetVAT: Number(stat._sum.netVAT || 0)
        }))
      },
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
    
  } catch (error) {
    console.error('Admin VAT returns fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch VAT returns' },
      { status: 500 }
    )
  }
}

export const GET = createAdminRoute(getvATReturns)