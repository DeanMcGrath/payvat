import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyWebhookSignature, mapStripeStatusToPaymentStatus } from '@/lib/stripe'
import Stripe from 'stripe'

// Webhook endpoint to handle Stripe events
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')
    
    if (!signature) {
      console.error('No Stripe signature found')
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }
    
    let event: Stripe.Event
    
    try {
      // Verify webhook signature
      event = verifyWebhookSignature(body, signature)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }
    
    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent)
        break
        
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        break
        
      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object as Stripe.PaymentIntent)
        break
        
      case 'payment_intent.requires_action':
        await handlePaymentRequiresAction(event.data.object as Stripe.PaymentIntent)
        break
        
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
    
    return NextResponse.json({ received: true })
    
  } catch (error) {
    console.error('Webhook handling error:', error)
    return NextResponse.json(
      { error: 'Webhook handling failed' },
      { status: 500 }
    )
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    // console.log(`Payment succeeded: ${paymentIntent.id}`)
    
    // Find payment by Stripe payment intent ID
    const payment = await prisma.payment.findFirst({
      where: {
        stripePaymentId: paymentIntent.id
      },
      include: {
        vatReturn: true,
        user: true
      }
    })
    
    if (!payment) {
      console.error(`Payment not found for Stripe payment intent: ${paymentIntent.id}`)
      return
    }
    
    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'COMPLETED',
        processedAt: new Date(),
        paymentMethod: paymentIntent.payment_method_types[0] || 'card',
        receiptNumber: `RCP-${payment.id.slice(-8).toUpperCase()}`,
        failedAt: null,
        failureReason: null
      }
    })
    
    // Update VAT return status to PAID
    if (payment.vatReturn) {
      await prisma.vATReturn.update({
        where: { id: payment.vatReturn.id },
        data: {
          status: 'PAID',
          paidAt: new Date()
        }
      })
    }
    
    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: payment.userId,
        action: 'PAYMENT_COMPLETED_WEBHOOK',
        entityType: 'PAYMENT',
        entityId: payment.id,
        metadata: {
          stripePaymentIntentId: paymentIntent.id,
          amount: Number(payment.amount),
          vatReturnId: payment.vatReturnId,
          receiptNumber: updatedPayment.receiptNumber,
          timestamp: new Date().toISOString()
        }
      }
    })
    
    // console.log(`Payment ${payment.id} successfully processed`)
    
  } catch (error) {
    console.error('Error handling payment succeeded:', error)
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    // console.log(`Payment failed: ${paymentIntent.id}`)
    
    const payment = await prisma.payment.findFirst({
      where: {
        stripePaymentId: paymentIntent.id
      }
    })
    
    if (!payment) {
      console.error(`Payment not found for Stripe payment intent: ${paymentIntent.id}`)
      return
    }
    
    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'FAILED',
        failedAt: new Date(),
        failureReason: paymentIntent.last_payment_error?.message || 'Payment failed'
      }
    })
    
    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: payment.userId,
        action: 'PAYMENT_FAILED_WEBHOOK',
        entityType: 'PAYMENT',
        entityId: payment.id,
        metadata: {
          stripePaymentIntentId: paymentIntent.id,
          amount: Number(payment.amount),
          vatReturnId: payment.vatReturnId,
          failureReason: paymentIntent.last_payment_error?.message,
          timestamp: new Date().toISOString()
        }
      }
    })
    
    // console.log(`Payment ${payment.id} marked as failed`)
    
  } catch (error) {
    console.error('Error handling payment failed:', error)
  }
}

async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  try {
    // console.log(`Payment canceled: ${paymentIntent.id}`)
    
    const payment = await prisma.payment.findFirst({
      where: {
        stripePaymentId: paymentIntent.id
      }
    })
    
    if (!payment) {
      console.error(`Payment not found for Stripe payment intent: ${paymentIntent.id}`)
      return
    }
    
    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'CANCELLED',
        failedAt: new Date(),
        failureReason: 'Payment was canceled'
      }
    })
    
    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: payment.userId,
        action: 'PAYMENT_CANCELED_WEBHOOK',
        entityType: 'PAYMENT',
        entityId: payment.id,
        metadata: {
          stripePaymentIntentId: paymentIntent.id,
          amount: Number(payment.amount),
          vatReturnId: payment.vatReturnId,
          timestamp: new Date().toISOString()
        }
      }
    })
    
    // console.log(`Payment ${payment.id} marked as canceled`)
    
  } catch (error) {
    console.error('Error handling payment canceled:', error)
  }
}

async function handlePaymentRequiresAction(paymentIntent: Stripe.PaymentIntent) {
  try {
    // console.log(`Payment requires action: ${paymentIntent.id}`)
    
    const payment = await prisma.payment.findFirst({
      where: {
        stripePaymentId: paymentIntent.id
      }
    })
    
    if (!payment) {
      console.error(`Payment not found for Stripe payment intent: ${paymentIntent.id}`)
      return
    }
    
    // Update payment status to processing
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'PROCESSING'
      }
    })
    
    // console.log(`Payment ${payment.id} requires action`)
    
  } catch (error) {
    console.error('Error handling payment requires action:', error)
  }
}