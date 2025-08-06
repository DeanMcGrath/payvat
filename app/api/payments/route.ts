import { NextRequest, NextResponse } from 'next/server'
import { createProtectedRoute } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { AuthUser } from '@/lib/auth'

// GET /api/payments - List user's payments
async function getPayments(request: NextRequest, user: AuthUser) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const vatReturnId = searchParams.get('vatReturnId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)
    
    // Build where clause
    const where: any = {
      userId: user.id
    }
    
    if (status) {
      where.status = status
    }
    
    if (vatReturnId) {
      where.vatReturnId = vatReturnId
    }
    
    // Get total count
    const totalCount = await prisma.payment.count({ where })
    
    // Get payments with related data
    const payments = await prisma.payment.findMany({
      where,
      include: {
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
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
        vatReturn: payment.vatReturn ? {
          id: payment.vatReturn.id,
          period: `${payment.vatReturn.periodStart.toLocaleDateString('en-IE', { month: 'short' })} - ${payment.vatReturn.periodEnd.toLocaleDateString('en-IE', { month: 'short', year: 'numeric' })}`,
          status: payment.vatReturn.status,
          revenueRefNumber: payment.vatReturn.revenueRefNumber,
          netVAT: Number(payment.vatReturn.netVAT)
        } : null
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
    
  } catch (error) {
    console.error('Payments fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}

export const GET = createProtectedRoute(getPayments)