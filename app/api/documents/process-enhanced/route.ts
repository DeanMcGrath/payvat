import { NextRequest, NextResponse } from 'next/server'
import { createGuestFriendlyRoute } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { EnhancedDocumentAnalysis, AdvancedProcessingResult } from '@/lib/ai/enhancedDocumentAnalysis'
import { AuthUser } from '@/lib/auth'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

interface EnhancedProcessingRequest {
  documentId: string
  useEnhancedLearning?: boolean
  forceReprocess?: boolean
  debugMode?: boolean
  businessContext?: any
}

/**
 * POST /api/documents/process-enhanced - Enhanced AI document processing with learning
 */
async function processDocumentEnhanced(request: NextRequest, user?: AuthUser) {
  // // console.log('🧠 Enhanced Document Processing API called')
  // // console.log(`   User: ${user ? `${user.id} (${user.email})` : 'GUEST/ANONYMOUS'}`)
  
  try {
    const body: EnhancedProcessingRequest = await request.json()
    
    // // console.log('🔍 Processing request:', {
    //   documentId: body.documentId,
    //   useEnhancedLearning: body.useEnhancedLearning,
    //   forceReprocess: body.forceReprocess,
    //   debugMode: body.debugMode
    // })
    
    // Validate required fields
    if (!body.documentId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Document ID is required'
        },
        { status: 400 }
      )
    }
    
    // Get document from database
    const document = await prisma.document.findUnique({
      where: { id: body.documentId },
      include: { 
        user: true,
        fingerprint: true,
        aiAnalytics: {
          orderBy: { processedAt: 'desc' },
          take: 1
        } as any
      } as any
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
    
    // Check permissions
    const isOwner = user && document.userId === user.id
    const isAdmin = user && user.role === 'ADMIN'
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Access denied'
        },
        { status: 403 }
      )
    }
    
    // Check if already processed and not forcing reprocess
    const aiAnalytics = (document as any).aiAnalytics
    if (!body.forceReprocess && aiAnalytics && aiAnalytics.length > 0) {
      const lastProcessing = aiAnalytics[0]
      // console.log('📊 Document already processed, returning existing results')
      
      return NextResponse.json({
        success: true,
        isScanned: true,
        scanResult: 'Previously processed with enhanced AI',
        aiProcessed: true,
        processingStrategy: lastProcessing.processingStrategy,
        confidenceScore: lastProcessing.confidenceScore,
        learningApplied: lastProcessing.learningApplied,
        matchedFeatures: lastProcessing.matchedFeatures || [],
        suggestedImprovements: lastProcessing.suggestedImprovements || [],
        processingTime: lastProcessing.processingTime,
        extractedData: null, // Would need to fetch from proper storage
        templateUsed: lastProcessing.templateUsed
      })
    }
    
    // // console.log('🚀 Starting enhanced AI processing...')
    const startTime = Date.now()
    
    // Prepare processing context
    const processingContext = {
      userId: user?.id,
      businessContext: body.businessContext || {
        businessName: (document.user as any)?.businessName,
        vatNumber: (document.user as any)?.vatNumber
      },
      forceRelearn: body.forceReprocess,
      debugMode: body.debugMode
    }
    
    // Get file data for processing
    const fileData = document.fileData
    if (!fileData) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Document file data not found'
        },
        { status: 400 }
      )
    }
    
    // Extract text from document (fallback for non-PDF)
    let extractedText = ''
    try {
      // This would be implemented to extract text from various file types
      extractedText = await extractTextFromDocument(document)
    } catch (textError) {
      console.warn('Text extraction failed, using AI Vision only:', textError)
    }
    
    let result: AdvancedProcessingResult
    
    try {
      // Process with enhanced AI system
      result = await EnhancedDocumentAnalysis.processDocumentWithLearning(
        document.id,
        fileData,
        document.mimeType,
        document.originalName,
        extractedText,
        processingContext
      )
      
      // console.log('✅ Enhanced processing completed:', {
        success: result.success,
        strategy: result.processingStrategy,
        confidence: result.extractedData?.confidence,
        processingTime: result.processingTime
      })
      
    } catch (processingError: any) {
      console.error('Enhanced processing failed:', processingError)
      
      // Fallback to basic processing
      result = {
        success: false,
        isScanned: false,
        scanResult: `Enhanced processing failed: ${processingError?.message || 'Unknown error'}`,
        error: processingError?.message || 'Unknown error',
        aiProcessed: false,
        learningApplied: false,
        confidenceBoost: 0,
        suggestedImprovements: [],
        processingStrategy: 'FALLBACK',
        matchedFeatures: [],
        processingTime: Date.now() - startTime
      }
    }
    
    // Store processing analytics
    try {
      await prisma.aIProcessingAnalytics.create({
        data: {
          documentId: document.id,
          userId: user?.id,
          processingStrategy: result.processingStrategy,
          templateUsed: result.templateUsed,
          processingTime: result.processingTime || (Date.now() - startTime),
          confidenceScore: result.extractedData?.confidence || 0,
          tokensUsed: null, // Would be tracked from OpenAI API
          cost: null, // Would be calculated based on tokens
          learningApplied: result.learningApplied,
          confidenceBoost: result.confidenceBoost,
          matchedFeatures: result.matchedFeatures,
          suggestedImprovements: result.suggestedImprovements,
          hadErrors: !result.success,
          errorType: result.error ? 'PROCESSING_ERROR' : null,
          errorMessage: result.error,
          extractionAccuracy: null, // Will be updated after user feedback
          userSatisfaction: null
        }
      })
      
      // console.log('📊 Processing analytics stored')
      
    } catch (analyticsError) {
      console.error('Failed to store analytics:', analyticsError)
      // Don't fail the whole request
    }
    
    // Update document scan status
    try {
      await prisma.document.update({
        where: { id: document.id },
        data: {
          isScanned: result.isScanned,
          scanResult: result.scanResult
        }
      })
      
    } catch (updateError) {
      console.error('Failed to update document:', updateError)
    }
    
    // Log processing completion
    logger.info('Enhanced document processing completed', {
      documentId: document.id,
      userId: user?.id,
      success: result.success,
      strategy: result.processingStrategy,
      processingTime: result.processingTime,
      learningApplied: result.learningApplied
    }, 'ENHANCED_AI_PROCESSING')
    
    // Return enhanced processing results
    return NextResponse.json({
      success: result.success,
      isScanned: result.isScanned,
      scanResult: result.scanResult,
      extractedData: result.extractedData,
      error: result.error,
      aiProcessed: result.aiProcessed,
      
      // Enhanced AI fields
      processingStrategy: result.processingStrategy,
      templateUsed: result.templateUsed,
      confidenceScore: result.extractedData?.confidence,
      learningApplied: result.learningApplied,
      confidenceBoost: result.confidenceBoost,
      matchedFeatures: result.matchedFeatures,
      suggestedImprovements: result.suggestedImprovements,
      fingerprintId: result.fingerprintId,
      processingTime: result.processingTime,
      
      // Additional insights
      insights: {
        documentRecognized: result.templateUsed ? true : false,
        accuracyExpected: result.extractedData?.confidence ? 
          result.extractedData.confidence > 0.8 ? 'High' :
          result.extractedData.confidence > 0.6 ? 'Medium' : 'Low' : 'Unknown',
        improvementsAvailable: result.suggestedImprovements.length > 0,
        learningOpportunity: !result.learningApplied
      }
    })
    
  } catch (error) {
    console.error('Enhanced processing API error:', error)
    
    logger.error('Enhanced document processing failed', error, 'ENHANCED_AI_PROCESSING')
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Enhanced processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Extract text from various document types
 * This is a placeholder - would need actual implementations for different file types
 */
async function extractTextFromDocument(document: any): Promise<string> {
  // // console.log(`📄 Extracting text from ${document.mimeType} document`)
  
  // This would contain actual text extraction logic for:
  // - PDF files (pdf-parse)
  // - Excel files (xlsx)
  // - CSV files
  // - Images (OCR)
  
  if (document.mimeType === 'application/pdf') {
    // PDF text extraction would go here
    return 'PDF text extraction not implemented'
  }
  
  if (document.mimeType?.includes('spreadsheet') || document.mimeType?.includes('excel')) {
    // Excel text extraction would go here
    return 'Excel text extraction not implemented'
  }
  
  if (document.mimeType?.startsWith('image/')) {
    // Image OCR would go here
    return 'Image OCR extraction not implemented'
  }
  
  return ''
}

export const POST = createGuestFriendlyRoute(processDocumentEnhanced)