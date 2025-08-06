import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createProtectedRoute } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { generateVATReference, validateVATPeriod } from '@/lib/vatUtils'
import { AuthUser } from '@/lib/auth'

// Validation schema
const submitVATSchema = z.object({
  vatReturnId: z.string().cuid('Invalid VAT return ID'),
  documentIds: z.array(z.string().cuid()).optional(),
})

// Mock Revenue API integration
async function submitToRevenue(vatReturn: any, user: any): Promise<{
  success: boolean
  referenceNumber?: string
  error?: string
}> {
  // Mock API call to Irish Revenue
  // In production, this would integrate with Revenue's ROS system
  
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Generate mock reference number
    const referenceNumber = generateVATReference(user.id, vatReturn.periodEnd)
    
    // Mock success response (95% success rate for demo)
    if (Math.random() > 0.05) {
      return {
        success: true,
        referenceNumber
      }
    } else {
      return {
        success: false,
        error: 'Revenue system temporarily unavailable. Please try again later.'
      }
    }
    
  } catch (error) {
    return {
      success: false,
      error: 'Failed to connect to Revenue system'
    }
  }
}

async function submitVAT(request: NextRequest, user: AuthUser) {
  try {
    const body = await request.json()
    
    // Validate input
    const validationResult = submitVATSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input data', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }
    
    const { vatReturnId, documentIds = [] } = validationResult.data
    
    // Find VAT return and verify ownership
    const vatReturn = await prisma.vATReturn.findFirst({
      where: {
        id: vatReturnId,
        userId: user.id,
        status: 'DRAFT' // Can only submit draft returns
      },
      include: {
        documents: true
      }
    })
    
    if (!vatReturn) {
      return NextResponse.json(
        { error: 'VAT return not found or already submitted' },
        { status: 404 }
      )
    }
    
    // Validate VAT period is still valid
    const periodValidation = validateVATPeriod(vatReturn.periodStart, vatReturn.periodEnd)
    if (!periodValidation.isValid) {
      return NextResponse.json(
        { error: `Invalid VAT period: ${periodValidation.error}` },
        { status: 400 }
      )
    }
    
    // Check if due date has passed (allow with warning)
    const now = new Date()
    const isOverdue = vatReturn.dueDate < now
    
    // Validate documents if provided
    if (documentIds.length > 0) {
      const documents = await prisma.document.findMany({
        where: {
          id: { in: documentIds },
          userId: user.id
        }
      })
      
      if (documents.length !== documentIds.length) {
        return NextResponse.json(
          { error: 'One or more documents not found or not owned by user' },
          { status: 400 }
        )
      }
      
      // Link documents to VAT return
      await prisma.document.updateMany({
        where: {
          id: { in: documentIds }
        },
        data: {
          vatReturnId: vatReturn.id
        }
      })
    }
    
    // Submit to Revenue (mock)
    const revenueResponse = await submitToRevenue(vatReturn, user)
    
    if (!revenueResponse.success) {
      return NextResponse.json(
        { error: revenueResponse.error || 'Revenue submission failed' },
        { status: 502 } // Bad Gateway - external service error
      )
    }
    
    // Update VAT return status
    const submittedVATReturn = await prisma.vATReturn.update({
      where: { id: vatReturn.id },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
        revenueRefNumber: revenueResponse.referenceNumber,
        revenueResponse: {
          submissionId: revenueResponse.referenceNumber,
          submittedAt: new Date().toISOString(),
          status: 'SUBMITTED'
        }
      }
    })
    
    // Create payment record if VAT amount is positive
    let paymentRecord = null
    if (Number(vatReturn.netVAT) > 0) {
      paymentRecord = await prisma.payment.create({
        data: {
          userId: user.id,
          vatReturnId: vatReturn.id,
          amount: Number(vatReturn.netVAT),
          currency: 'EUR',
          status: 'PENDING'
        }
      })
    }
    
    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'SUBMIT_VAT_RETURN',
        entityType: 'VAT_RETURN',
        entityId: vatReturn.id,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        metadata: {
          revenueReference: revenueResponse.referenceNumber,
          netVAT: vatReturn.netVAT,
          period: `${vatReturn.periodStart.toISOString()} to ${vatReturn.periodEnd.toISOString()}`,
          documentsCount: documentIds.length,
          isOverdue,
          paymentRequired: Number(vatReturn.netVAT) > 0,
          timestamp: new Date().toISOString()
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'VAT return submitted successfully',
      vatReturn: {
        id: submittedVATReturn.id,
        status: submittedVATReturn.status,
        submittedAt: submittedVATReturn.submittedAt,
        revenueRefNumber: submittedVATReturn.revenueRefNumber,
        netVAT: submittedVATReturn.netVAT,
        dueDate: submittedVATReturn.dueDate
      },
      payment: paymentRecord ? {
        id: paymentRecord.id,
        amount: paymentRecord.amount,
        status: paymentRecord.status,
        currency: paymentRecord.currency
      } : null,
      warnings: isOverdue ? ['VAT return was submitted after due date - penalties may apply'] : undefined
    })
    
  } catch (error) {
    console.error('VAT submission error:', error)
    return NextResponse.json(
      { error: 'VAT submission failed' },
      { status: 500 }
    )
  }
}

export const POST = createProtectedRoute(submitVAT)