import { NextRequest, NextResponse } from 'next/server'
import { createProtectedRoute } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { performVATCalculation, vatCalculationSchema } from '@/lib/vatUtils'
import { AuthUser } from '@/lib/auth'

async function calculateVAT(request: NextRequest, user: AuthUser) {
  try {
    const body = await request.json()
    
    // Validate input data
    const validationResult = vatCalculationSchema.safeParse({
      salesVAT: parseFloat(body.salesVAT) || 0,
      purchaseVAT: parseFloat(body.purchaseVAT) || 0,
      periodStart: body.periodStart,
      periodEnd: body.periodEnd,
    })
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input data', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }
    
    const { salesVAT, purchaseVAT, periodStart, periodEnd } = validationResult.data
    
    // Convert date strings to Date objects
    const startDate = new Date(periodStart)
    const endDate = new Date(periodEnd)
    
    // Perform VAT calculation
    const calculation = performVATCalculation({
      salesVAT,
      purchaseVAT,
      periodStart: startDate,
      periodEnd: endDate
    })
    
    if (!calculation.isValid) {
      return NextResponse.json(
        { 
          error: 'Invalid VAT calculation',
          warnings: calculation.warnings 
        },
        { status: 400 }
      )
    }
    
    // Check if user has an existing draft for this period
    let existingReturn = await prisma.vATReturn.findFirst({
      where: {
        userId: user.id,
        periodStart: startDate,
        periodEnd: endDate,
        status: 'DRAFT'
      }
    })
    
    // Create or update draft VAT return
    if (existingReturn) {
      existingReturn = await prisma.vATReturn.update({
        where: { id: existingReturn.id },
        data: {
          salesVAT: calculation.salesVAT,
          purchaseVAT: calculation.purchaseVAT,
          netVAT: calculation.netVAT,
          dueDate: calculation.dueDate,
          updatedAt: new Date()
        }
      })
    } else {
      existingReturn = await prisma.vATReturn.create({
        data: {
          userId: user.id,
          salesVAT: calculation.salesVAT,
          purchaseVAT: calculation.purchaseVAT,
          netVAT: calculation.netVAT,
          periodStart: startDate,
          periodEnd: endDate,
          dueDate: calculation.dueDate,
          status: 'DRAFT'
        }
      })
    }
    
    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'CALCULATE_VAT',
        entityType: 'VAT_RETURN',
        entityId: existingReturn.id,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        metadata: {
          salesVAT: calculation.salesVAT,
          purchaseVAT: calculation.purchaseVAT,
          netVAT: calculation.netVAT,
          period: `${startDate.toISOString()} to ${endDate.toISOString()}`,
          warnings: calculation.warnings,
          timestamp: new Date().toISOString()
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      calculation: {
        vatReturnId: existingReturn.id,
        salesVAT: calculation.salesVAT,
        purchaseVAT: calculation.purchaseVAT,
        netVAT: calculation.netVAT,
        periodStart: calculation.periodStart.toISOString(),
        periodEnd: calculation.periodEnd.toISOString(),
        dueDate: calculation.dueDate.toISOString(),
        warnings: calculation.warnings
      }
    })
    
  } catch (error) {
    console.error('VAT calculation error:', error)
    return NextResponse.json(
      { error: 'VAT calculation failed' },
      { status: 500 }
    )
  }
}

export const POST = createProtectedRoute(calculateVAT)