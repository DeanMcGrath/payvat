import { NextRequest, NextResponse } from 'next/server'
import { createGuestFriendlyRoute } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { AuthUser } from '@/lib/auth'
import { logError, logInfo, logAudit } from '@/lib/secure-logger'

interface ApplyLearningRequest {
  documentId: string
  useBusinessPatterns?: boolean
}

/**
 * POST /api/learning/apply - Apply learned patterns to improve document processing
 */
async function applyLearning(request: NextRequest, user?: AuthUser) {
  try {
    logAudit('LEARNING_APPLICATION_STARTED', {
      userId: user?.id,
      operation: 'apply-learning',
      result: 'SUCCESS'
    })

    const body: ApplyLearningRequest = await request.json()
    const { documentId, useBusinessPatterns = true } = body

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      )
    }

    // Get the document
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        ...(user ? { userId: user.id } : {})
      }
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found or access denied' },
        { status: 404 }
      )
    }

    // Get relevant learning patterns for this user/business
    const learningPatterns = useBusinessPatterns ? await prisma.businessLearningPattern.findMany({
      where: {
        userId: user?.id || document.userId,
        documentTypes: {
          has: document.category
        },
        confidence: {
          gte: 0.5 // Only use patterns with decent confidence
        }
      },
      orderBy: {
        confidence: 'desc'
      }
    }) : []

    // Get recent feedback for similar documents
    const recentFeedback = await prisma.learningFeedback.findMany({
      where: {
        userId: user?.id || document.userId,
        document: {
          category: document.category
        },
        feedback: {
          in: ['INCORRECT', 'PARTIALLY_CORRECT']
        },
        wasProcessed: true
      },
      include: {
        document: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })

    // Apply learning insights
    const learningInsights = {
      businessPatterns: learningPatterns.map(pattern => ({
        id: pattern.id,
        type: pattern.patternType,
        confidence: pattern.confidence,
        frequency: pattern.frequency,
        insights: extractPatternInsights(pattern.patternData)
      })),
      recentCorrections: recentFeedback.map(fb => {
        const originalExtraction = fb.originalExtraction as any || { salesVAT: [], purchaseVAT: [] }
        const correctedExtraction = fb.correctedExtraction as any || { salesVAT: [], purchaseVAT: [] }
        return {
          documentName: fb.document.originalName,
          originalAmounts: [...originalExtraction.salesVAT, ...originalExtraction.purchaseVAT],
          correctedAmounts: [...correctedExtraction.salesVAT, ...correctedExtraction.purchaseVAT],
          feedback: fb.feedback,
          corrections: fb.corrections
        }
      }),
      recommendations: generateRecommendations(learningPatterns, recentFeedback, document)
    }

    // Log the application of learning
    await prisma.auditLog.create({
      data: {
        userId: user?.id || document.userId,
        action: 'LEARNING_APPLIED',
        entityType: 'DOCUMENT',
        entityId: documentId,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        metadata: {
          patternsApplied: learningPatterns.length,
          feedbackConsidered: recentFeedback.length,
          useBusinessPatterns,
          insights: learningInsights,
          timestamp: new Date().toISOString()
        }
      }
    })

    logAudit('LEARNING_APPLICATION_COMPLETED', {
      userId: user?.id,
      documentId,
      patternsCount: learningPatterns.length,
      operation: 'apply-learning',
      result: 'SUCCESS'
    })

    return NextResponse.json({
      success: true,
      message: 'Learning patterns applied successfully',
      learningInsights,
      appliedPatterns: learningPatterns.length,
      consideredFeedback: recentFeedback.length,
      hasLearningData: learningPatterns.length > 0 || recentFeedback.length > 0
    })

  } catch (error) {
    logError('Failed to apply learning patterns', error, {
      userId: user?.id,
      operation: 'apply-learning'
    })
    
    return NextResponse.json(
      { 
        error: 'Failed to apply learning patterns',
        message: 'Could not apply learned improvements to this document'
      },
      { status: 500 }
    )
  }
}

/**
 * Extract actionable insights from pattern data
 */
function extractPatternInsights(patternData: any): any {
  if (!patternData || !patternData.recentCorrections) {
    return { insights: [], commonMistakes: [] }
  }

  const corrections = patternData.recentCorrections
  const insights = []
  const commonMistakes = []

  // Analyze correction patterns
  for (const correction of corrections) {
    if (correction.originalAmounts && correction.correctedAmounts) {
      const originalTotal = correction.originalAmounts.reduce((sum: number, val: number) => sum + val, 0)
      const correctedTotal = correction.correctedAmounts.reduce((sum: number, val: number) => sum + val, 0)
      
      if (originalTotal !== correctedTotal) {
        const difference = correctedTotal - originalTotal
        const percentageError = originalTotal > 0 ? (difference / originalTotal) * 100 : 0
        
        insights.push({
          type: 'amount_correction',
          originalTotal,
          correctedTotal,
          difference,
          percentageError: Math.round(percentageError * 100) / 100,
          pattern: difference > 0 ? 'underestimation' : 'overestimation'
        })

        if (Math.abs(percentageError) > 10) {
          commonMistakes.push({
            type: 'significant_amount_error',
            description: `AI ${difference > 0 ? 'underestimated' : 'overestimated'} VAT by ${Math.abs(percentageError).toFixed(1)}%`,
            impact: 'high'
          })
        }
      }
    }
  }

  return { insights, commonMistakes }
}

/**
 * Generate recommendations based on learning patterns
 */
function generateRecommendations(patterns: any[], feedback: any[], document: any): string[] {
  const recommendations = []

  if (patterns.length === 0 && feedback.length === 0) {
    recommendations.push('No learning data available yet. Upload and correct more documents to improve AI accuracy.')
    return recommendations
  }

  if (patterns.length > 0) {
    const avgConfidence = patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length
    if (avgConfidence > 0.8) {
      recommendations.push('Strong learning patterns detected. AI should perform well on similar documents.')
    } else if (avgConfidence > 0.6) {
      recommendations.push('Moderate learning patterns available. Continue providing feedback to improve accuracy.')
    } else {
      recommendations.push('Learning patterns are still developing. More user corrections needed for better performance.')
    }
  }

  if (feedback.length > 0) {
    const incorrectCount = feedback.filter(fb => fb.feedback === 'INCORRECT').length
    const partialCount = feedback.filter(fb => fb.feedback === 'PARTIALLY_CORRECT').length
    
    if (incorrectCount > partialCount) {
      recommendations.push('Recent feedback shows significant extraction errors. Consider manual review of AI results.')
    } else if (partialCount > 0) {
      recommendations.push('Some partial corrections detected. AI is learning but may need refinement.')
    }
  }

  // Document-specific recommendations
  if (document.category.includes('SALES') && document.originalName.toLowerCase().includes('invoice')) {
    recommendations.push('For sales invoices, ensure VAT amounts are categorized as sales rather than purchases.')
  }

  if (document.originalName.toLowerCase().includes('woocommerce') || document.originalName.toLowerCase().includes('product')) {
    recommendations.push('WooCommerce reports detected. Specialized processing should handle VAT extraction accurately.')
  }

  return recommendations
}

export const POST = createGuestFriendlyRoute(applyLearning)