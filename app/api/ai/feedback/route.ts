import { NextRequest, NextResponse } from 'next/server'
import { createGuestFriendlyRoute } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { EnhancedDocumentAnalysis } from '@/lib/ai/enhancedDocumentAnalysis'
import { AuthUser } from '@/lib/auth'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

interface FeedbackRequest {
  documentId: string
  originalExtraction: any
  correctedExtraction: any
  feedback: 'CORRECT' | 'INCORRECT' | 'PARTIALLY_CORRECT'
  specificCorrections: {
    field: string
    originalValue: any
    correctedValue: any
    confidence?: number
  }[]
  userNotes?: string
  confidenceRating?: number // 1-5 scale
  processingTime?: number
  // Enhanced VAT correction support
  vatCorrection?: {
    originalSalesVAT: number[]
    originalPurchaseVAT: number[]
    correctedSalesVAT: number[]
    correctedPurchaseVAT: number[]
    correctionReason: 'WRONG_AMOUNT' | 'WRONG_CATEGORY' | 'MISSING_VAT' | 'DUPLICATE_VAT' | 'OTHER'
    extractionMethod?: string
  }
}

/**
 * POST /api/ai/feedback - Collect user feedback on document processing
 */
async function collectFeedback(request: NextRequest, user?: AuthUser) {
  console.log('🎓 AI Feedback Collection API called')
  console.log(`   User: ${user ? `${user.id} (${user.email})` : 'GUEST/ANONYMOUS'}`)
  
  try {
    const body: FeedbackRequest = await request.json()
    
    console.log('📝 Feedback details:', {
      documentId: body.documentId,
      feedback: body.feedback,
      correctionsCount: body.specificCorrections?.length || 0,
      hasNotes: !!body.userNotes,
      confidenceRating: body.confidenceRating,
      hasVATCorrection: !!body.vatCorrection
    })
    
    // Enhanced logging for VAT corrections
    if (body.vatCorrection) {
      console.log('💰 VAT Correction details:', {
        originalSalesVAT: body.vatCorrection.originalSalesVAT,
        correctedSalesVAT: body.vatCorrection.correctedSalesVAT,
        originalPurchaseVAT: body.vatCorrection.originalPurchaseVAT,
        correctedPurchaseVAT: body.vatCorrection.correctedPurchaseVAT,
        reason: body.vatCorrection.correctionReason
      })
    }
    
    // Validate required fields
    if (!body.documentId || !body.feedback) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields: documentId and feedback'
        },
        { status: 400 }
      )
    }
    
    // Verify document exists and user has access
    const document = await prisma.document.findUnique({
      where: { id: body.documentId },
      include: { user: true }
    })
    
    if (!document) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Document not found'
        },
        { status: 404 }
      )
    }
    
    // Check user permissions (owner or admin)
    const isOwner = user && document.userId === user.id
    const isAdmin = user && user.role === 'ADMIN'
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Access denied - document belongs to different user'
        },
        { status: 403 }
      )
    }
    
    // Store feedback in database with enhanced VAT correction data
    const feedbackRecord = await prisma.learningFeedback.create({
      data: {
        documentId: body.documentId,
        userId: user?.id || 'anonymous',
        originalExtraction: body.originalExtraction,
        correctedExtraction: body.correctedExtraction,
        feedback: body.feedback,
        corrections: [
          ...(body.specificCorrections || []),
          // Add VAT-specific corrections if provided
          ...(body.vatCorrection ? [{
            field: 'vatData.salesVAT',
            originalValue: body.vatCorrection.originalSalesVAT,
            correctedValue: body.vatCorrection.correctedSalesVAT,
            confidence: body.confidenceRating
          }, {
            field: 'vatData.purchaseVAT',
            originalValue: body.vatCorrection.originalPurchaseVAT,
            correctedValue: body.vatCorrection.correctedPurchaseVAT,
            confidence: body.confidenceRating
          }] : [])
        ],
        confidenceScore: body.confidenceRating,
        processingTime: body.processingTime,
        notes: body.userNotes
      }
    })
    
    console.log(`✅ Feedback stored with ID: ${feedbackRecord.id}`)
    
    // Process VAT corrections through user correction system if provided
    if (body.vatCorrection) {
      try {
        console.log('💰 Processing VAT correction through correction system...')
        const { userCorrectionSystem } = await import('@/lib/ai/user-correction-system')
        
        await userCorrectionSystem.submitCorrection({
          documentId: body.documentId,
          fileName: document.originalName,
          documentType: document.category,
          userId: user?.id || 'anonymous',
          originalExtraction: {
            salesVAT: body.vatCorrection.originalSalesVAT,
            purchaseVAT: body.vatCorrection.originalPurchaseVAT,
            confidence: body.confidenceRating || 0.5,
            extractionMethod: body.vatCorrection.extractionMethod || 'AI_VISION'
          },
          correctedExtraction: {
            salesVAT: body.vatCorrection.correctedSalesVAT,
            purchaseVAT: body.vatCorrection.correctedPurchaseVAT,
            confidence: 1.0, // User corrections are always high confidence
            notes: body.userNotes
          },
          correctionReason: body.vatCorrection.correctionReason,
          userFeedback: body.userNotes || 'User VAT correction',
          documentText: document.scanResult || undefined
        })
        
        console.log('✅ VAT correction processed successfully')
      } catch (correctionError) {
        console.error('Error processing VAT correction:', correctionError)
        // Don't fail the whole request if VAT correction processing fails
      }
    }
    
    // Process feedback through learning system
    try {
      console.log('🧠 Processing feedback through learning system...')
      await EnhancedDocumentAnalysis.collectUserFeedback(
        body.documentId,
        {
          success: true,
          isScanned: true,
          scanResult: 'User feedback collection',
          extractedData: body.originalExtraction,
          aiProcessed: true,
          learningApplied: false,
          confidenceBoost: 0,
          suggestedImprovements: [],
          processingStrategy: 'AI_VISION' as const,
          matchedFeatures: []
        },
        body.correctedExtraction,
        user?.id
      )
      
      console.log('✅ Learning system processed feedback successfully')
      
    } catch (learningError) {
      console.error('Error processing feedback through learning system:', learningError)
      // Don't fail the whole request if learning processing fails
    }
    
    // Store processing analytics
    try {
      await prisma.aIProcessingAnalytics.create({
        data: {
          documentId: body.documentId,
          userId: user?.id,
          processingStrategy: 'USER_FEEDBACK',
          processingTime: body.processingTime || 0,
          confidenceScore: body.confidenceRating || 0.5,
          extractionAccuracy: body.feedback === 'CORRECT' ? 1.0 :
                              body.feedback === 'PARTIALLY_CORRECT' ? 0.5 : 0.0,
          userSatisfaction: body.confidenceRating,
          learningApplied: true,
          confidenceBoost: 0,
          matchedFeatures: [],
          suggestedImprovements: [],
          hadErrors: body.feedback !== 'CORRECT',
          errorType: body.feedback === 'INCORRECT' ? 'EXTRACTION_ERROR' : null
        }
      })
      
      console.log('✅ Analytics stored successfully')
      
    } catch (analyticsError) {
      console.error('Error storing analytics:', analyticsError)
      // Don't fail the whole request if analytics storage fails
    }
    
    // Generate insights for user
    const insights = await generateFeedbackInsights(body, document)
    
    logger.info('User feedback collected', {
      documentId: body.documentId,
      userId: user?.id,
      feedback: body.feedback,
      correctionsCount: body.specificCorrections?.length || 0
    }, 'AI_FEEDBACK')
    
    return NextResponse.json({
      success: true,
      feedbackId: feedbackRecord.id,
      message: 'Thank you for your feedback! This helps improve our AI accuracy.',
      insights,
      nextSteps: generateNextSteps(body.feedback, insights)
    })
    
  } catch (error) {
    console.error('Error collecting feedback:', error)
    logger.error('Failed to collect user feedback', error, 'AI_FEEDBACK')
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process feedback. Please try again.'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/ai/feedback - Get feedback analytics for admin
 */
async function getFeedbackAnalytics(request: NextRequest, user?: AuthUser) {
  console.log('📊 Feedback Analytics API called')
  
  try {
    // Only admin users can access analytics
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Admin access required'
        },
        { status: 403 }
      )
    }
    
    const url = new URL(request.url)
    const timeRange = url.searchParams.get('timeRange') || '30d' // 7d, 30d, 90d, 1y
    const documentId = url.searchParams.get('documentId')
    const userId = url.searchParams.get('userId')
    
    // Calculate date range
    const now = new Date()
    const daysBack = timeRange === '7d' ? 7 : 
                     timeRange === '30d' ? 30 : 
                     timeRange === '90d' ? 90 : 
                     timeRange === '1y' ? 365 : 30
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000))
    
    // Build where clause
    const whereClause: any = {
      createdAt: { gte: startDate }
    }
    
    if (documentId) whereClause.documentId = documentId
    if (userId) whereClause.userId = userId
    
    // Get feedback statistics
    const [
      totalFeedback,
      feedbackByType,
      recentFeedback,
      avgConfidence,
      mostCorrectedFields
    ] = await Promise.all([
      // Total feedback count
      prisma.learningFeedback.count({ where: whereClause }),
      
      // Feedback by type
      prisma.learningFeedback.groupBy({
        by: ['feedback'],
        where: whereClause,
        _count: { _all: true }
      }),
      
      // Recent feedback
      prisma.learningFeedback.findMany({
        where: whereClause,
        include: {
          document: { select: { originalName: true } },
          user: { select: { email: true, businessName: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      
      // Average confidence
      prisma.learningFeedback.aggregate({
        where: { ...whereClause, confidenceScore: { not: null } },
        _avg: { confidenceScore: true }
      }),
      
      // Most corrected fields (this would need custom aggregation)
      prisma.learningFeedback.findMany({
        where: whereClause,
        select: { corrections: true }
      })
    ])
    
    // Process most corrected fields
    const fieldCorrectionCounts: { [key: string]: number } = {}
    mostCorrectedFields.forEach((feedback: any) => {
      if (Array.isArray(feedback.corrections)) {
        feedback.corrections.forEach((correction: any) => {
          if (correction.field) {
            fieldCorrectionCounts[correction.field] = (fieldCorrectionCounts[correction.field] || 0) + 1
          }
        })
      }
    })
    
    const topCorrectedFields = Object.entries(fieldCorrectionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([field, count]) => ({ field, count }))
    
    // Calculate accuracy trend
    const accuracyTrend = feedbackByType.map((item: any) => ({
      type: item.feedback,
      count: item._count._all,
      percentage: totalFeedback > 0 ? (item._count._all / totalFeedback * 100).toFixed(1) : '0'
    }))
    
    return NextResponse.json({
      success: true,
      analytics: {
        timeRange,
        totalFeedback,
        averageConfidence: avgConfidence._avg.confidenceScore || 0,
        accuracyTrend,
        topCorrectedFields,
        recentFeedback: recentFeedback.map((fb: any) => ({
          id: fb.id,
          documentName: fb.document.originalName,
          userEmail: fb.user?.email || 'Anonymous',
          businessName: fb.user?.businessName,
          feedback: fb.feedback,
          createdAt: fb.createdAt,
          correctionsCount: Array.isArray(fb.corrections) ? fb.corrections.length : 0
        }))
      }
    })
    
  } catch (error) {
    console.error('Error getting feedback analytics:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to retrieve analytics'
      },
      { status: 500 }
    )
  }
}

/**
 * Generate insights from feedback for user display
 */
async function generateFeedbackInsights(feedback: FeedbackRequest, document: any): Promise<{
  accuracyImprovement: string
  commonIssues: string[]
  suggestions: string[]
}> {
  const insights = {
    accuracyImprovement: '',
    commonIssues: [] as string[],
    suggestions: [] as string[]
  }
  
  try {
    // Calculate accuracy improvement message
    if (feedback.feedback === 'CORRECT') {
      insights.accuracyImprovement = 'Great! This confirms our AI is working well for similar documents.'
    } else if (feedback.feedback === 'PARTIALLY_CORRECT') {
      insights.accuracyImprovement = 'Thanks! We\'ll improve accuracy for the fields you corrected.'
    } else {
      insights.accuracyImprovement = 'This feedback helps us significantly improve future processing.'
    }
    
    // Analyze common issues
    if (feedback.specificCorrections && feedback.specificCorrections.length > 0) {
      const correctedFields = feedback.specificCorrections.map(c => c.field)
      
      if (correctedFields.includes('vatData.totalVatAmount')) {
        insights.commonIssues.push('VAT amount extraction needs improvement')
      }
      if (correctedFields.includes('businessDetails.vatNumber')) {
        insights.commonIssues.push('VAT number recognition needs refinement')
      }
      if (correctedFields.includes('transactionData.date')) {
        insights.commonIssues.push('Date parsing requires enhancement')
      }
    }
    
    // Generate suggestions
    if (document.mimeType?.includes('pdf')) {
      insights.suggestions.push('For better PDF processing, ensure text is selectable (not scanned images)')
    }
    
    if (feedback.feedback !== 'CORRECT') {
      insights.suggestions.push('Similar documents will be processed more accurately in the future')
      insights.suggestions.push('Consider providing multiple examples for better learning')
    }
    
  } catch (error) {
    console.error('Error generating insights:', error)
  }
  
  return insights
}

/**
 * Generate next steps based on feedback
 */
function generateNextSteps(feedbackType: string, insights: any): string[] {
  const nextSteps: string[] = []
  
  switch (feedbackType) {
    case 'CORRECT':
      nextSteps.push('Continue uploading similar documents for consistent results')
      nextSteps.push('Your feedback helps train our AI for other users too')
      break
      
    case 'PARTIALLY_CORRECT':
      nextSteps.push('Upload similar documents to see improved accuracy')
      nextSteps.push('The corrected fields will be remembered for future processing')
      break
      
    case 'INCORRECT':
      nextSteps.push('Our AI will learn from these corrections')
      nextSteps.push('Try uploading the document again in a few hours for better results')
      nextSteps.push('Contact support if accuracy doesn\'t improve')
      break
  }
  
  return nextSteps
}

export const POST = createGuestFriendlyRoute(collectFeedback)
export const GET = createGuestFriendlyRoute(getFeedbackAnalytics)