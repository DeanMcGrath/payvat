import { NextRequest, NextResponse } from 'next/server'
import { createGuestFriendlyRoute } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { performVATCalculation, vatCalculationSchema } from '@/lib/vatUtils'
import { AuthUser } from '@/lib/auth'
import { analyzeVATCalculation, VATCalculationInput } from '@/lib/ai/vatAdvice'
import { isAIEnabled } from '@/lib/ai/openai'
import { logger } from '@/lib/logger'

async function calculateVAT(request: NextRequest, user?: AuthUser) {
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
    
    // Get VAT data extracted from documents (optional enhancement)
    let documentExtractedVAT = { salesVAT: 0, purchaseVAT: 0, documentCount: 0 }
    
    try {
      // Get extracted VAT data from documents for this user (skip for guests)
      let auditLogs: any[] = []
      if (user) {
        auditLogs = await prisma.auditLog.findMany({
          where: {
            userId: user.id,
            action: 'VAT_DATA_EXTRACTED',
            entityType: 'DOCUMENT',
            createdAt: {
              gte: startDate,
              lte: endDate
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
      }
      
      // Aggregate extracted VAT amounts from documents
      for (const log of auditLogs) {
        if (log.metadata && (log.metadata as any).extractedData) {
          const extractedData = (log.metadata as any).extractedData
          if (extractedData.salesVAT && Array.isArray(extractedData.salesVAT)) {
            documentExtractedVAT.salesVAT += extractedData.salesVAT.reduce((sum: number, amount: number) => sum + amount, 0)
          }
          if (extractedData.purchaseVAT && Array.isArray(extractedData.purchaseVAT)) {
            documentExtractedVAT.purchaseVAT += extractedData.purchaseVAT.reduce((sum: number, amount: number) => sum + amount, 0)
          }
          documentExtractedVAT.documentCount++
        }
      }
      
      logger.info('Extracted VAT from documents', documentExtractedVAT, 'VAT_CALCULATE_API')
    } catch (error) {
      logger.warn('Failed to get extracted VAT data', error, 'VAT_CALCULATE_API')
      // Continue with manual calculation if document extraction fails
    }
    
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
    
    // Check if user has an existing draft for this period (skip for guests)
    let existingReturn = null
    if (user) {
      existingReturn = await prisma.vATReturn.findFirst({
        where: {
          userId: user.id,
          periodStart: startDate,
          periodEnd: endDate,
          status: 'DRAFT'
        }
      })
    }
    
    // Create or update draft VAT return (skip for guests)
    if (existingReturn && user) {
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
    } else if (user) {
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
    
    // AI-powered VAT analysis (if available)
    let aiAnalysis = null
    if (isAIEnabled()) {
      try {
        const analysisInput: VATCalculationInput = {
          salesVAT: calculation.salesVAT,
          purchaseVAT: calculation.purchaseVAT,
          netVAT: calculation.netVAT,
          periodStart: startDate.toISOString(),
          periodEnd: endDate.toISOString(),
          businessType: user?.businessName || 'General Business'
        }
        
        const analysisResult = await analyzeVATCalculation(analysisInput, user?.id)
        
        if (analysisResult.success && analysisResult.analysis) {
          aiAnalysis = {
            status: analysisResult.analysis.status,
            riskLevel: analysisResult.analysis.riskLevel,
            recommendations: analysisResult.analysis.recommendations,
            issues: analysisResult.analysis.issues,
            suggestions: analysisResult.suggestions
          }
          
          logger.info('AI VAT analysis completed', { status: analysisResult.analysis.status, riskLevel: analysisResult.analysis.riskLevel }, 'VAT_CALCULATE_API')
        }
      } catch (aiError) {
        logger.warn('AI analysis failed, continuing without', aiError, 'VAT_CALCULATE_API')
      }
    }

    // Create audit log (only for authenticated users)
    if (user && existingReturn) {
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
            aiAnalysis: aiAnalysis,
            timestamp: new Date().toISOString()
          }
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      calculation: {
        vatReturnId: existingReturn?.id || null,
        salesVAT: calculation.salesVAT,
        purchaseVAT: calculation.purchaseVAT,
        netVAT: calculation.netVAT,
        periodStart: calculation.periodStart.toISOString(),
        periodEnd: calculation.periodEnd.toISOString(),
        dueDate: calculation.dueDate.toISOString(),
        warnings: calculation.warnings,
        documentExtracted: {
          salesVAT: Math.round(documentExtractedVAT.salesVAT * 100) / 100,
          purchaseVAT: Math.round(documentExtractedVAT.purchaseVAT * 100) / 100,
          documentCount: documentExtractedVAT.documentCount,
          hasData: documentExtractedVAT.documentCount > 0
        },
        aiAnalysis: aiAnalysis // Include AI analysis in response
      }
    })
    
  } catch (error) {
    logger.error('VAT calculation error', error, 'VAT_CALCULATE_API')
    return NextResponse.json(
      { error: 'VAT calculation failed' },
      { status: 500 }
    )
  }
}

export const POST = createGuestFriendlyRoute(calculateVAT)