import { NextRequest, NextResponse } from 'next/server'
import { createGuestFriendlyRoute } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { AuthUser } from '@/lib/auth'
import { logError, logInfo, logAudit } from '@/lib/secure-logger'

interface LearningFeedbackRequest {
  documentId: string
  originalExtraction: {
    salesVAT: number[]
    purchaseVAT: number[]
    confidence: number
  }
  correctedExtraction: {
    salesVAT: number[]
    purchaseVAT: number[]
  }
  feedback: 'CORRECT' | 'INCORRECT' | 'PARTIALLY_CORRECT'
  corrections?: Array<{
    field: string
    originalValue: any
    correctedValue: any
    reason?: string
  }>
  notes?: string
}

/**
 * POST /api/learning/feedback - Submit user corrections for AI learning
 */
async function submitLearningFeedback(request: NextRequest, user?: AuthUser) {
  try {
    logAudit('LEARNING_FEEDBACK_SUBMITTED', {
      userId: user?.id,
      operation: 'learning-feedback',
      result: 'SUCCESS'
    })

    const body: LearningFeedbackRequest = await request.json()
    const { 
      documentId, 
      originalExtraction, 
      correctedExtraction, 
      feedback, 
      corrections = [],
      notes 
    } = body

    // Validate required fields
    if (!documentId || !originalExtraction || !correctedExtraction || !feedback) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify document exists and user has access
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        ...(user ? { userId: user.id } : {}) // For authenticated users, check ownership
      }
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found or access denied' },
        { status: 404 }
      )
    }

    // Check if we already have feedback for this document from this user
    const existingFeedback = await prisma.learningFeedback.findFirst({
      where: {
        documentId,
        userId: user?.id || document.userId // Use document owner if no user
      }
    })

    let feedbackRecord
    if (existingFeedback) {
      // Update existing feedback
      feedbackRecord = await prisma.learningFeedback.update({
        where: { id: existingFeedback.id },
        data: {
          originalExtraction: originalExtraction,
          correctedExtraction: correctedExtraction,
          feedback,
          corrections: corrections,
          notes,
          wasProcessed: false, // Reset to be processed again
          updatedAt: new Date()
        }
      })
      logInfo('Updated existing learning feedback', { 
        feedbackId: feedbackRecord.id,
        documentId,
        userId: user?.id
      })
    } else {
      // Create new feedback record
      feedbackRecord = await prisma.learningFeedback.create({
        data: {
          documentId,
          userId: user?.id || document.userId,
          originalExtraction: originalExtraction,
          correctedExtraction: correctedExtraction,
          feedback,
          corrections: corrections,
          confidenceScore: originalExtraction.confidence,
          notes,
          wasProcessed: false
        }
      })
      logInfo('Created new learning feedback', { 
        feedbackId: feedbackRecord.id,
        documentId,
        userId: user?.id
      })
    }

    // Determine if this feedback indicates an improvement opportunity
    const improvementNeeded = feedback === 'INCORRECT' || feedback === 'PARTIALLY_CORRECT'

    // If improvement is needed, try to process it immediately for quick learning
    if (improvementNeeded) {
      try {
        await processLearningFeedback(feedbackRecord.id)
        
        // Update the record to show it was processed
        await prisma.learningFeedback.update({
          where: { id: feedbackRecord.id },
          data: {
            wasProcessed: true,
            processedAt: new Date(),
            improvementMade: true
          }
        })

        logInfo('Learning feedback processed immediately', { 
          feedbackId: feedbackRecord.id,
          improvementMade: true
        })
      } catch (processingError) {
        logError('Failed to process learning feedback immediately', processingError, {
          feedbackId: feedbackRecord.id,
          operation: 'learning-feedback-processing'
        })
        // Don't fail the API call, feedback is still saved for batch processing
      }
    }

    // Create audit log for the feedback submission
    await prisma.auditLog.create({
      data: {
        userId: user?.id || document.userId,
        action: 'LEARNING_FEEDBACK_SUBMITTED',
        entityType: 'DOCUMENT',
        entityId: documentId,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        metadata: {
          feedbackId: feedbackRecord.id,
          feedback,
          originalVATTotal: [...originalExtraction.salesVAT, ...originalExtraction.purchaseVAT].reduce((sum, val) => sum + val, 0),
          correctedVATTotal: [...correctedExtraction.salesVAT, ...correctedExtraction.purchaseVAT].reduce((sum, val) => sum + val, 0),
          improvementNeeded,
          timestamp: new Date().toISOString()
        }
      }
    })

    logAudit('LEARNING_FEEDBACK_COMPLETED', {
      userId: user?.id,
      feedbackId: feedbackRecord.id,
      operation: 'learning-feedback',
      result: 'SUCCESS'
    })

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
      feedbackId: feedbackRecord.id,
      learningImpact: {
        improvementNeeded,
        willImproveFutureExtractions: improvementNeeded,
        processedImmediately: improvementNeeded
      },
      debugInfo: {
        documentId,
        feedback,
        correctionsCount: corrections.length,
        hasNotes: !!notes,
        existingFeedback: !!existingFeedback
      }
    })

  } catch (error) {
    logError('Learning feedback submission failed', error, {
      userId: user?.id,
      operation: 'learning-feedback'
    })
    
    return NextResponse.json(
      { 
        error: 'Failed to submit learning feedback',
        message: 'Your feedback could not be saved. Please try again.'
      },
      { status: 500 }
    )
  }
}

/**
 * Process learning feedback to improve AI performance
 */
async function processLearningFeedback(feedbackId: string): Promise<void> {
  const feedback = await prisma.learningFeedback.findUnique({
    where: { id: feedbackId },
    include: {
      document: true,
      user: true
    }
  })

  if (!feedback || !feedback.document) {
    throw new Error('Feedback or document not found')
  }

  // Extract learning patterns from the correction
  const originalExtraction = feedback.originalExtraction as any || { salesVAT: [], purchaseVAT: [] }
  const correctedExtraction = feedback.correctedExtraction as any || { salesVAT: [], purchaseVAT: [] }
  const originalVAT = [...originalExtraction.salesVAT, ...originalExtraction.purchaseVAT]
  const correctedVAT = [...correctedExtraction.salesVAT, ...correctedExtraction.purchaseVAT]

  // Create or update business learning patterns
  const businessName = feedback.user?.businessName || 'Unknown'
  const patternData = {
    documentType: feedback.document.category,
    fileName: feedback.document.originalName,
    originalAmounts: originalVAT,
    correctedAmounts: correctedVAT,
    feedback: feedback.feedback,
    corrections: feedback.corrections
  }

  // Check if we have a similar pattern for this business
  const existingPattern = await prisma.businessLearningPattern.findFirst({
    where: {
      userId: feedback.userId,
      patternType: 'VAT_CORRECTION',
      documentTypes: {
        has: feedback.document.category
      }
    }
  })

  if (existingPattern) {
    // Update existing pattern
    await prisma.businessLearningPattern.update({
      where: { id: existingPattern.id },
      data: {
        frequency: existingPattern.frequency + 1,
        confidence: Math.min(existingPattern.confidence + 0.1, 1.0),
        patternData: {
          ...(existingPattern.patternData as any || {}),
          recentCorrections: [
            ...(Array.isArray((existingPattern.patternData as any)?.recentCorrections) 
              ? (existingPattern.patternData as any).recentCorrections.slice(-4) 
              : []),
            patternData
          ]
        },
        lastSeen: new Date(),
        updatedAt: new Date()
      }
    })
  } else {
    // Create new pattern
    await prisma.businessLearningPattern.create({
      data: {
        userId: feedback.userId,
        businessName,
        patternType: 'VAT_CORRECTION',
        patternData: {
          recentCorrections: [patternData],
          commonMistakes: [],
          improvementAreas: []
        },
        frequency: 1,
        confidence: 0.5,
        documentTypes: [feedback.document.category],
        categories: [feedback.document.category.includes('SALES') ? 'SALES' : 'PURCHASES']
      }
    })
  }

  logInfo('Learning pattern updated', {
    feedbackId,
    userId: feedback.userId,
    patternType: 'VAT_CORRECTION'
  })
}

/**
 * GET /api/learning/feedback - Get learning feedback statistics
 */
async function getLearningStats(request: NextRequest, user?: AuthUser) {
  try {
    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('documentId')

    let whereClause: any = {}
    if (user) {
      whereClause.userId = user.id
    }
    if (documentId) {
      whereClause.documentId = documentId
    }

    const stats = await prisma.learningFeedback.aggregate({
      where: whereClause,
      _count: {
        id: true
      }
    })

    const breakdown = await prisma.learningFeedback.groupBy({
      by: ['feedback'],
      where: whereClause,
      _count: {
        id: true
      }
    })

    const recentFeedback = await prisma.learningFeedback.findMany({
      where: whereClause,
      include: {
        document: {
          select: {
            originalName: true,
            category: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    return NextResponse.json({
      success: true,
      stats: {
        totalFeedback: stats._count.id,
        breakdown: breakdown.reduce((acc, item) => {
          acc[item.feedback] = item._count.id
          return acc
        }, {} as Record<string, number>),
        recentFeedback: recentFeedback.map(fb => ({
          id: fb.id,
          documentName: fb.document?.originalName,
          documentCategory: fb.document?.category,
          feedback: fb.feedback,
          wasProcessed: fb.wasProcessed,
          improvementMade: fb.improvementMade,
          createdAt: fb.createdAt
        }))
      }
    })

  } catch (error) {
    logError('Failed to get learning stats', error, {
      userId: user?.id,
      operation: 'learning-stats'
    })
    
    return NextResponse.json(
      { error: 'Failed to retrieve learning statistics' },
      { status: 500 }
    )
  }
}

export const POST = createGuestFriendlyRoute(submitLearningFeedback)
export const GET = createGuestFriendlyRoute(getLearningStats)