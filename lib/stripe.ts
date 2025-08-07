import Stripe from 'stripe'

// Server-side Stripe configuration
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
  typescript: true,
})

export { stripe }

// Client-side Stripe configuration (for frontend)
export const getStripePublishableKey = () => {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
}

// Payment configuration
export const PAYMENT_CONFIG = {
  CURRENCY: 'eur',
  SUPPORTED_PAYMENT_METHODS: ['card'],
  WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET!,
  
  // Minimum payment amounts (in cents)
  MIN_AMOUNT: 50, // €0.50
  MAX_AMOUNT: 100000000, // €1,000,000
  
  // Fee configuration
  APPLICATION_FEE_PERCENT: 0.025, // 2.5% application fee (if applicable)
}

// Payment validation
export function validatePaymentAmount(amount: number): { isValid: boolean; error?: string } {
  const amountInCents = Math.round(amount * 100)
  
  if (amountInCents < PAYMENT_CONFIG.MIN_AMOUNT) {
    return { 
      isValid: false, 
      error: `Minimum payment amount is €${PAYMENT_CONFIG.MIN_AMOUNT / 100}` 
    }
  }
  
  if (amountInCents > PAYMENT_CONFIG.MAX_AMOUNT) {
    return { 
      isValid: false, 
      error: `Maximum payment amount is €${PAYMENT_CONFIG.MAX_AMOUNT / 100}` 
    }
  }
  
  return { isValid: true }
}

// Create payment intent for VAT payment
export async function createVATPaymentIntent(
  amount: number,
  vatReturnId: string,
  userId: string,
  metadata?: Record<string, string>
): Promise<Stripe.PaymentIntent> {
  const amountInCents = Math.round(amount * 100)
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: PAYMENT_CONFIG.CURRENCY,
    payment_method_types: PAYMENT_CONFIG.SUPPORTED_PAYMENT_METHODS,
    metadata: {
      type: 'vat_payment',
      vatReturnId,
      userId,
      ...metadata
    },
    description: `VAT Payment for Return ${vatReturnId}`,
    statement_descriptor: 'VAT Payment',
    setup_future_usage: 'off_session', // Allow saving payment method for future use
  })
  
  return paymentIntent
}

// Confirm payment intent
export async function confirmPaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
  return paymentIntent
}

// Retrieve payment intent
export async function retrievePaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  return await stripe.paymentIntents.retrieve(paymentIntentId)
}

// Cancel payment intent
export async function cancelPaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  return await stripe.paymentIntents.cancel(paymentIntentId)
}

// Create refund
export async function createRefund(
  paymentIntentId: string,
  amount?: number,
  reason?: Stripe.RefundCreateParams.Reason
): Promise<Stripe.Refund> {
  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: amount ? Math.round(amount * 100) : undefined,
    reason,
  })
  
  return refund
}

// Verify webhook signature
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    PAYMENT_CONFIG.WEBHOOK_SECRET
  )
}

// Format amount for display
export function formatPaymentAmount(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount)
}

// Generate payment receipt data
export function generatePaymentReceipt(
  payment: any,
  vatReturn: any,
  user: any
): {
  receiptNumber: string
  paymentDate: Date
  amount: number
  currency: string
  method: string
  description: string
  businessDetails: {
    name: string
    vatNumber: string
    email: string
  }
  vatDetails: {
    period: string
    revenueReference?: string
    netVAT: number
  }
} {
  return {
    receiptNumber: payment.receiptNumber || `RCP-${payment.id.slice(-8).toUpperCase()}`,
    paymentDate: payment.processedAt || new Date(),
    amount: Number(payment.amount),
    currency: payment.currency.toUpperCase(),
    method: payment.paymentMethod || 'card',
    description: `VAT Payment for ${vatReturn.periodStart.toLocaleDateString('en-IE', { month: 'short', year: 'numeric' })}`,
    businessDetails: {
      name: user.businessName,
      vatNumber: user.vatNumber,
      email: user.email
    },
    vatDetails: {
      period: `${vatReturn.periodStart.toLocaleDateString('en-IE')} - ${vatReturn.periodEnd.toLocaleDateString('en-IE')}`,
      revenueReference: vatReturn.revenueRefNumber,
      netVAT: Number(vatReturn.netVAT)
    }
  }
}

// Payment status mapping
export const PAYMENT_STATUS_MAP = {
  'requires_payment_method': 'PENDING',
  'requires_confirmation': 'PROCESSING',
  'requires_action': 'PROCESSING',
  'processing': 'PROCESSING',
  'requires_capture': 'PROCESSING',
  'canceled': 'CANCELLED',
  'succeeded': 'COMPLETED',
} as const

export function mapStripeStatusToPaymentStatus(
  stripeStatus: string
): 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED' {
  return PAYMENT_STATUS_MAP[stripeStatus as keyof typeof PAYMENT_STATUS_MAP] || 'FAILED'
}

// Error handling for Stripe errors
export function handleStripeError(error: any): {
  message: string
  code?: string
  type: 'card_error' | 'invalid_request' | 'api_error' | 'authentication_error' | 'rate_limit_error' | 'generic_error'
} {
  if (error.type === 'StripeCardError') {
    return {
      message: error.message || 'Your card was declined',
      code: error.code,
      type: 'card_error'
    }
  }
  
  if (error.type === 'StripeInvalidRequestError') {
    return {
      message: 'Invalid payment request',
      code: error.code,
      type: 'invalid_request'
    }
  }
  
  if (error.type === 'StripeAPIError') {
    return {
      message: 'Payment service temporarily unavailable',
      code: error.code,
      type: 'api_error'
    }
  }
  
  if (error.type === 'StripeAuthenticationError') {
    return {
      message: 'Authentication error',
      code: error.code,
      type: 'authentication_error'
    }
  }
  
  if (error.type === 'StripeRateLimitError') {
    return {
      message: 'Too many requests, please try again later',
      code: error.code,
      type: 'rate_limit_error'
    }
  }
  
  return {
    message: error.message || 'Payment processing failed',
    type: 'generic_error'
  }
}