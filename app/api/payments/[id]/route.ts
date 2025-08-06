import { NextRequest, NextResponse } from 'next/server'
import { createProtectedRoute } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { generatePaymentReceipt } from '@/lib/stripe'
import { AuthUser } from '@/lib/auth'

// GET /api/payments/[id] - Get specific payment details
async function getPayment(request: NextRequest, user: AuthUser) {
  try {
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()
    const action = url.searchParams.get('action')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      )
    }
    
    const payment = await prisma.payment.findFirst({
      where: {
        id,
        userId: user.id // Ensure user can only access their own payments
      },
      include: {
        vatReturn: {
          include: {
            documents: {
              select: {
                id: true,
                originalName: true,
                category: true,
                uploadedAt: true
              }
            }
          }
        }
      }
    })
    
    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }
    
    // Handle receipt generation
    if (action === 'receipt' && payment.status === 'COMPLETED') {
      const receiptData = generatePaymentReceipt(payment, payment.vatReturn, user)
      
      return NextResponse.json({
        success: true,
        receipt: receiptData
      })
    }
    
    return NextResponse.json({
      success: true,
      payment: {
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
        vatReturn: payment.vatReturn ? {
          id: payment.vatReturn.id,
          periodStart: payment.vatReturn.periodStart,
          periodEnd: payment.vatReturn.periodEnd,
          salesVAT: Number(payment.vatReturn.salesVAT),
          purchaseVAT: Number(payment.vatReturn.purchaseVAT),
          netVAT: Number(payment.vatReturn.netVAT),
          status: payment.vatReturn.status,
          submittedAt: payment.vatReturn.submittedAt,
          paidAt: payment.vatReturn.paidAt,
          revenueRefNumber: payment.vatReturn.revenueRefNumber,
          dueDate: payment.vatReturn.dueDate,
          documents: payment.vatReturn.documents
        } : null
      }
    })
    
  } catch (error) {
    console.error('Payment fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment' },
      { status: 500 }
    )
  }
}

export const GET = createProtectedRoute(getPayment)