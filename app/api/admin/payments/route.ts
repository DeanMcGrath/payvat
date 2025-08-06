import { NextRequest, NextResponse } from 'next/server'
import { createAdminRoute } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/vatUtils'
import { AuthUser } from '@/lib/auth'

// GET /api/admin/payments - View all payments (admin only)
async function getPayments(request: NextRequest, user: AuthUser) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')
    const paymentMethod = searchParams.get('paymentMethod')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const minAmount = searchParams.get('minAmount')
    const maxAmount = searchParams.get('maxAmount')
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
    
    if (paymentMethod) {
      where.paymentMethod = paymentMethod
    }
    
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom)
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo)
      }
    }
    
    if (minAmount || maxAmount) {
      where.amount = {}
      if (minAmount) {
        where.amount.gte = parseFloat(minAmount)
      }
      if (maxAmount) {
        where.amount.lte = parseFloat(maxAmount)
      }
    }
    
    // Get total count and sum
    const [totalCount, aggregations] = await Promise.all([
      prisma.payment.count({ where }),
      prisma.payment.aggregate({
        where,
        _sum: { amount: true },
        _avg: { amount: true }
      })
    ])
    
    // Get payments with user and VAT return info
    const payments = await prisma.payment.findMany({
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
        vatReturn: {
          select: {
            id: true,
            periodStart: true,
            periodEnd: true,
            status: true,
            revenueRefNumber: true,
            netVAT: true
          }
        }
      },
      orderBy: [
        { createdAt: 'desc' }
      ],
      skip: (page - 1) * limit,
      take: limit
    })
    
    // Get payment statistics by status
    const statusStats = await prisma.payment.groupBy({
      by: ['status'],
      where,
      _count: { status: true },
      _sum: { amount: true }
    })
    
    // Create admin audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'ADMIN_VIEW_PAYMENTS',
        entityType: 'PAYMENT',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        metadata: {
          filters: { userId, status, paymentMethod, dateFrom, dateTo, minAmount, maxAmount },
          resultCount: payments.length,
          totalAmount: Number(aggregations._sum.amount || 0),
          timestamp: new Date().toISOString()
        }
      }
    })
    
    return NextResponse.json({
      success: true,
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
        stripePaymentId: payment.stripePaymentId,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
        user: payment.user,
        vatReturn: payment.vatReturn ? {
          id: payment.vatReturn.id,
          period: `${payment.vatReturn.periodStart.toLocaleDateString('en-IE')} - ${payment.vatReturn.periodEnd.toLocaleDateString('en-IE')}`,
          status: payment.vatReturn.status,
          revenueRefNumber: payment.vatReturn.revenueRefNumber,
          netVAT: Number(payment.vatReturn.netVAT)
        } : null
      })),
      statistics: {
        totalAmount: Number(aggregations._sum.amount || 0),
        averageAmount: Number(aggregations._avg.amount || 0),
        statusBreakdown: statusStats.map(stat => ({
          status: stat.status,
          count: stat._count.status,
          totalAmount: Number(stat._sum.amount || 0)
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
    console.error('Admin payments fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}

export const GET = createAdminRoute(getPayments)