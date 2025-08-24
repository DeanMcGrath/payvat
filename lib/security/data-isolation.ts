/**
 * User Data Isolation Security System
 * Ensures users can ONLY access their own data
 * CRITICAL for preventing data breaches in production
 */

import { prisma } from '@/lib/prisma'
import { AuthUser } from '@/lib/auth'
import { logError, logWarn, logAudit } from '@/lib/secure-logger'

export class SecurityViolationError extends Error {
  constructor(message: string, public details: any = {}) {
    super(message)
    this.name = 'SecurityViolationError'
  }
}

/**
 * Validate that a user owns a specific document
 */
export async function validateDocumentOwnership(
  documentId: string,
  user: AuthUser
): Promise<boolean> {
  try {
    const document = await prisma.Document.findUnique({
      where: { id: documentId },
      select: { userId: true, user: { select: { role: true } } }
    })

    if (!document) {
      logWarn('Document not found during ownership check', {
        userId: user.id,
        documentId,
        operation: 'document-ownership-check'
      })
      return false
    }

    // User owns document
    if (document.userId === user.id) {
      return true
    }

    // Admin can access any document
    if (user.role === 'ADMIN') {
      logAudit('ADMIN_DOCUMENT_ACCESS', {
        userId: user.id,
        documentId,
        operation: 'admin-document-access',
        result: 'SUCCESS'
      })
      return true
    }

    // Security violation - user trying to access another user's document
    logError('SECURITY VIOLATION: Unauthorized document access attempt', null, {
      userId: user.id,
      documentId,
      documentOwnerId: document.userId,
      operation: 'unauthorized-document-access'
    })

    return false
  } catch (error) {
    logError('Error during document ownership validation', error, {
      userId: user.id,
      documentId,
      operation: 'document-ownership-check'
    })
    return false
  }
}

/**
 * Validate that a user owns a specific VAT return
 */
export async function validateVATReturnOwnership(
  vatReturnId: string,
  user: AuthUser
): Promise<boolean> {
  try {
    const vatReturn = await prisma.VATReturn.findUnique({
      where: { id: vatReturnId },
      select: { userId: true }
    })

    if (!vatReturn) {
      return false
    }

    if (vatReturn.userId === user.id || user.role === 'ADMIN') {
      return true
    }

    logError('SECURITY VIOLATION: Unauthorized VAT return access attempt', null, {
      userId: user.id,
      vatReturnId,
      operation: 'unauthorized-vat-return-access'
    })

    return false
  } catch (error) {
    logError('Error during VAT return ownership validation', error, {
      userId: user.id,
      vatReturnId,
      operation: 'vat-return-ownership-check'
    })
    return false
  }
}

/**
 * Validate that a user owns a specific payment
 */
export async function validatePaymentOwnership(
  paymentId: string,
  user: AuthUser
): Promise<boolean> {
  try {
    const payment = await prisma.Payment.findUnique({
      where: { id: paymentId },
      select: { userId: true }
    })

    if (!payment) {
      return false
    }

    if (payment.userId === user.id || user.role === 'ADMIN') {
      return true
    }

    logError('SECURITY VIOLATION: Unauthorized payment access attempt', null, {
      userId: user.id,
      paymentId,
      operation: 'unauthorized-payment-access'
    })

    return false
  } catch (error) {
    logError('Error during payment ownership validation', error, {
      userId: user.id,
      paymentId,
      operation: 'payment-ownership-check'
    })
    return false
  }
}

/**
 * Enforce user data isolation for database queries
 */
export function enforceUserIsolation(user?: AuthUser) {
  const baseWhere: any = {}

  if (!user) {
    // Guest users - only access recent guest data
    return {
      user: {
        role: 'GUEST'
      },
      uploadedAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours
      }
    }
  }

  if (user.role === 'ADMIN') {
    // Admins can access all data but log the access
    logAudit('ADMIN_DATA_ACCESS', {
      userId: user.id,
      operation: 'admin-data-access',
      result: 'SUCCESS'
    })
    return baseWhere // No restrictions for admin
  }

  // Regular users - only their own data
  baseWhere.userId = user.id
  return baseWhere
}

/**
 * Sanitize data before sending to client
 */
export function sanitizeOutputData<T extends Record<string, any>>(
  data: T,
  user?: AuthUser
): Partial<T> {
  if (!data) return data

  const sanitized = { ...data }

  // Always remove sensitive fields for non-admins
  if (user?.role !== 'ADMIN') {
    delete sanitized.fileData  // Never send file data to client
    delete sanitized.fileHash  // Hash not needed on client
    delete sanitized.password  // Never send passwords
    delete sanitized.passwordResetToken
    delete sanitized.passwordResetExpires
    
    // Partially sanitize VAT numbers (show only last 4 digits)
    if ((sanitized as any).vatNumber && typeof (sanitized as any).vatNumber === 'string') {
      const vatNumber = (sanitized as any).vatNumber
      if (vatNumber.length > 4) {
        (sanitized as any).vatNumber = '****' + vatNumber.slice(-4)
      }
    }
    
    // Sanitize email addresses
    if ((sanitized as any).email && typeof (sanitized as any).email === 'string') {
      const email = (sanitized as any).email
      const [local, domain] = email.split('@')
      if (local && domain) {
        (sanitized as any).email = local.slice(0, 2) + '***@' + domain
      }
    }
  }

  return sanitized
}

/**
 * Wrapper for database operations with automatic isolation
 */
export class SecureDBClient {
  constructor(private user?: AuthUser) {}

  /**
   * Find documents with automatic user isolation
   */
  async findDocuments(additionalWhere: any = {}) {
    const where = {
      ...enforceUserIsolation(this.user),
      ...additionalWhere
    }

    const documents = await prisma.Document.findMany({
      where,
      select: {
        id: true,
        fileName: true,
        originalName: true,
        fileSize: true,
        mimeType: true,
        documentType: true,
        category: true,
        isScanned: true,
        scanResult: true,
        uploadedAt: true,
        vatReturnId: true,
        // Never select fileData or sensitive fields
      },
      orderBy: {
        uploadedAt: 'desc'
      }
    })

    return documents.map(doc => sanitizeOutputData(doc, this.user))
  }

  /**
   * Find VAT returns with automatic user isolation
   */
  async findVATReturns(additionalWhere: any = {}) {
    const where = {
      ...enforceUserIsolation(this.user),
      ...additionalWhere
    }

    const returns = await prisma.VATReturn.findMany({
      where,
      select: {
        id: true,
        periodStart: true,
        periodEnd: true,
        dueDate: true,
        salesVAT: true,
        purchaseVAT: true,
        netVAT: true,
        status: true,
        submittedAt: true,
        paidAt: true,
        createdAt: true,
        updatedAt: true,
        // Don't include sensitive revenue data
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return returns.map(ret => sanitizeOutputData(ret, this.user))
  }

  /**
   * Find payments with automatic user isolation
   */
  async findPayments(additionalWhere: any = {}) {
    const where = {
      ...enforceUserIsolation(this.user),
      ...additionalWhere
    }

    const payments = await prisma.Payment.findMany({
      where,
      select: {
        id: true,
        vatReturnId: true,
        amount: true,
        currency: true,
        status: true,
        processedAt: true,
        receiptNumber: true,
        receiptUrl: true,
        createdAt: true,
        updatedAt: true,
        // Don't include Stripe secrets
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return payments.map(payment => sanitizeOutputData(payment, this.user))
  }
}

/**
 * Middleware to validate API access
 */
export async function validateAPIAccess(
  request: any,
  resourceType: 'document' | 'vat-return' | 'payment',
  resourceId: string,
  user?: AuthUser
): Promise<boolean> {
  if (!user) {
    // Guest users can only access recent guest resources
    if (resourceType === 'document') {
      const document = await prisma.Document.findUnique({
        where: { id: resourceId },
        include: { user: true }
      })
      
      if (!document) return false
      
      // Check if it's a recent guest document
      const isRecentGuest = 
        document.user.role === 'GUEST' &&
        document.uploadedAt > new Date(Date.now() - 24 * 60 * 60 * 1000)
      
      return isRecentGuest
    }
    
    return false // Guests can't access VAT returns or payments
  }

  // Validate ownership based on resource type
  switch (resourceType) {
    case 'document':
      return validateDocumentOwnership(resourceId, user)
    case 'vat-return':
      return validateVATReturnOwnership(resourceId, user)
    case 'payment':
      return validatePaymentOwnership(resourceId, user)
    default:
      return false
  }
}

/**
 * Rate limiting per user to prevent abuse
 */
const userRateLimits = new Map<string, { count: number; resetTime: number }>()

export function checkUserRateLimit(
  userId: string,
  limit: number = 100,
  windowMs: number = 15 * 60 * 1000
): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const key = `${userId}_${Math.floor(now / windowMs)}`
  
  const current = userRateLimits.get(key)
  if (!current) {
    userRateLimits.set(key, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: limit - 1 }
  }
  
  if (current.count >= limit) {
    return { allowed: false, remaining: 0 }
  }
  
  current.count++
  return { allowed: true, remaining: limit - current.count }
}