import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createProtectedRoute } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { retrievePaymentIntent, handleStripeError, mapStripeStatusToPaymentStatus, generatePaymentReceipt } from '@/lib/stripe'
import { AuthUser } from '@/lib/auth'

// Input validation schema
const confirmPaymentSchema = z.object({
  paymentId: z.string().cuid('Invalid payment ID'),
})

async function confirmPayment(request: NextRequest, user: AuthUser) {
  try {
    const body = await request.json()
    
    // Validate input
    const validationResult = confirmPaymentSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input data', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }
    
    const { paymentId } = validationResult.data
    
    // Find payment and verify ownership
    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        userId: user.id
      },
      include: {
        vatReturn: true
      }
    })
    
    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }
    
    if (!payment.stripePaymentId) {
      return NextResponse.json(
        { error: 'Payment not properly initialized' },
        { status: 400 }
      )
    }
    
    try {
      // Retrieve payment intent from Stripe
      const paymentIntent = await retrievePaymentIntent(payment.stripePaymentId)
      const newStatus = mapStripeStatusToPaymentStatus(paymentIntent.status)
      
      // Update payment status
      const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: newStatus,
          processedAt: newStatus === 'COMPLETED' ? new Date() : null,
          failedAt: newStatus === 'FAILED' ? new Date() : null,
          failureReason: paymentIntent.last_payment_error?.message || null,
          receiptNumber: newStatus === 'COMPLETED' ? `RCP-${paymentId.slice(-8).toUpperCase()}` : null
        }
      })
      
      // If payment completed, update VAT return status
      if (newStatus === 'COMPLETED' && payment.vatReturn) {
        await prisma.vATReturn.update({
          where: { id: payment.vatReturn.id },
          data: {
            status: 'PAID',
            paidAt: new Date()
          }
        })
        
        // Generate receipt data
        const receiptData = generatePaymentReceipt(updatedPayment, payment.vatReturn, user)
        
        // Create audit log for successful payment
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'PAYMENT_COMPLETED',
            entityType: 'PAYMENT',
            entityId: paymentId,
            ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown',
            metadata: {
              amount: Number(payment.amount),
              vatReturnId: payment.vatReturn.id,
              receiptNumber: updatedPayment.receiptNumber,
              stripePaymentIntentId: payment.stripePaymentId,
              paymentMethod: paymentIntent.payment_method_types[0] || 'card',
              timestamp: new Date().toISOString()
            }
          }
        })
        
        return NextResponse.json({
          success: true,
          payment: {
            id: updatedPayment.id,
            status: updatedPayment.status,
            amount: Number(updatedPayment.amount),
            currency: updatedPayment.currency,
            processedAt: updatedPayment.processedAt,
            receiptNumber: updatedPayment.receiptNumber
          },
          vatReturn: {
            id: payment.vatReturn.id,
            status: 'PAID'
          },
          receipt: receiptData
        })
      }
      
      // Payment failed or still processing
      if (newStatus === 'FAILED') {
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'PAYMENT_FAILED',
            entityType: 'PAYMENT',
            entityId: paymentId,
            ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown',
            metadata: {
              amount: Number(payment.amount),
              vatReturnId: payment.vatReturnId,
              failureReason: paymentIntent.last_payment_error?.message,
              stripePaymentIntentId: payment.stripePaymentId,
              timestamp: new Date().toISOString()
            }
          }
        })
      }
      
      return NextResponse.json({
        success: true,
        payment: {
          id: updatedPayment.id,
          status: updatedPayment.status,
          amount: Number(updatedPayment.amount),
          currency: updatedPayment.currency,
          failureReason: updatedPayment.failureReason
        },
        requiresAction: paymentIntent.status === 'requires_action',
        clientSecret: payment.stripeClientSecret
      })
      
    } catch (stripeError: any) {
      console.error('Stripe payment confirmation error:', stripeError)
      const errorDetails = handleStripeError(stripeError)
      
      // Update payment status to failed
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'FAILED',
          failedAt: new Date(),
          failureReason: errorDetails.message
        }
      })
      
      return NextResponse.json(
        { 
          error: errorDetails.message,
          type: errorDetails.type,
          code: errorDetails.code
        },
        { status: 400 }
      )
    }
    
  } catch (error) {
    console.error('Payment confirmation error:', error)
    return NextResponse.json(
      { error: 'Failed to confirm payment' },
      { status: 500 }
    )
  }
}

export const POST = createProtectedRoute(confirmPayment)