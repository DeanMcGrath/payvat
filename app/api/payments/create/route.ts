import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createProtectedRoute } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { createVATPaymentIntent, validatePaymentAmount, handleStripeError } from '@/lib/stripe'
import { AuthUser } from '@/lib/auth'

// Input validation schema
const createPaymentSchema = z.object({
  vatReturnId: z.string().cuid('Invalid VAT return ID'),
  paymentMethod: z.enum(['card']).default('card'),
})

async function createPayment(request: NextRequest, user: AuthUser) {
  try {
    const body = await request.json()
    
    // Validate input
    const validationResult = createPaymentSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input data', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }
    
    const { vatReturnId, paymentMethod } = validationResult.data
    
    // Find VAT return and verify ownership
    const vatReturn = await prisma.vATReturn.findFirst({
      where: {
        id: vatReturnId,
        userId: user.id,
        status: 'SUBMITTED' // Can only pay submitted returns
      },
      include: {
        payment: true
      }
    })
    
    if (!vatReturn) {
      return NextResponse.json(
        { error: 'VAT return not found or not submitted' },
        { status: 404 }
      )
    }
    
    // Check if VAT return requires payment (positive net VAT)
    if (Number(vatReturn.netVAT) <= 0) {
      return NextResponse.json(
        { error: 'This VAT return does not require payment' },
        { status: 400 }
      )
    }
    
    // Check if payment already exists and is not failed/cancelled
    if (vatReturn.payment && !['FAILED', 'CANCELLED'].includes(vatReturn.payment.status)) {
      if (vatReturn.payment.status === 'COMPLETED') {
        return NextResponse.json(
          { error: 'VAT return has already been paid' },
          { status: 400 }
        )
      }
      
      // Return existing payment if it's pending/processing
      return NextResponse.json({
        success: true,
        payment: {
          id: vatReturn.payment.id,
          amount: Number(vatReturn.payment.amount),
          status: vatReturn.payment.status,
          clientSecret: vatReturn.payment.stripeClientSecret
        }
      })
    }
    
    const paymentAmount = Number(vatReturn.netVAT)
    
    // Validate payment amount
    const amountValidation = validatePaymentAmount(paymentAmount)
    if (!amountValidation.isValid) {
      return NextResponse.json(
        { error: amountValidation.error },
        { status: 400 }
      )
    }
    
    try {
      // Create Stripe payment intent
      const paymentIntent = await createVATPaymentIntent(
        paymentAmount,
        vatReturnId,
        user.id,
        {
          businessName: user.businessName,
          vatNumber: user.vatNumber || 'Not provided',
          period: `${vatReturn.periodStart.toISOString()}-${vatReturn.periodEnd.toISOString()}`,
        }
      )
      
      // Create or update payment record
      let payment
      if (vatReturn.payment) {
        // Update existing failed/cancelled payment
        payment = await prisma.payment.update({
          where: { id: vatReturn.payment.id },
          data: {
            amount: paymentAmount,
            status: 'PENDING',
            paymentMethod,
            stripePaymentId: paymentIntent.id,
            stripeClientSecret: paymentIntent.client_secret,
            failedAt: null,
            failureReason: null,
            updatedAt: new Date()
          }
        })
      } else {
        // Create new payment record
        payment = await prisma.payment.create({
          data: {
            userId: user.id,
            vatReturnId,
            amount: paymentAmount,
            currency: 'EUR',
            status: 'PENDING',
            paymentMethod,
            stripePaymentId: paymentIntent.id,
            stripeClientSecret: paymentIntent.client_secret,
          }
        })
      }
      
      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'CREATE_PAYMENT',
          entityType: 'PAYMENT',
          entityId: payment.id,
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          metadata: {
            vatReturnId,
            amount: paymentAmount,
            paymentMethod,
            stripePaymentIntentId: paymentIntent.id,
            timestamp: new Date().toISOString()
          }
        }
      })
      
      return NextResponse.json({
        success: true,
        payment: {
          id: payment.id,
          amount: paymentAmount,
          currency: 'EUR',
          status: payment.status,
          clientSecret: paymentIntent.client_secret
        }
      })
      
    } catch (stripeError: any) {
      console.error('Stripe payment creation error:', stripeError)
      const errorDetails = handleStripeError(stripeError)
      
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
    console.error('Payment creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}

export const POST = createProtectedRoute(createPayment)