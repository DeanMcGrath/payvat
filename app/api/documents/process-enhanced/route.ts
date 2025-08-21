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
      //   success: result.success,
      //   strategy: result.processingStrategy,
      //   confidence: result.extractedData?.confidence,
      //   processingTime: result.processingTime
      // })
      
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
    
    // Extract enhanced data for document organization
    const enhancedData = await extractDocumentMetadata(result, document)
    
    // Update document with scan status and new fields
    try {
      await prisma.document.update({
        where: { id: document.id },
        data: {
          isScanned: result.isScanned,
          scanResult: result.scanResult,
          // New enhanced fields
          extractedDate: enhancedData.extractedDate,
          extractedYear: enhancedData.extractedYear,
          extractedMonth: enhancedData.extractedMonth,
          invoiceTotal: enhancedData.invoiceTotal,
          vatAccuracy: enhancedData.vatAccuracy,
          processingQuality: enhancedData.processingQuality,
          extractionConfidence: enhancedData.extractionConfidence,
          dateExtractionConfidence: enhancedData.dateExtractionConfidence,
          totalExtractionConfidence: enhancedData.totalExtractionConfidence,
          validationStatus: enhancedData.validationStatus,
          complianceIssues: enhancedData.complianceIssues,
          // Duplicate detection will be added later
          isDuplicate: false
        }
      })
      
      console.log('✅ Document updated with enhanced metadata:', {
        extractedDate: enhancedData.extractedDate,
        invoiceTotal: enhancedData.invoiceTotal,
        vatAccuracy: enhancedData.vatAccuracy
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
 * Extract enhanced metadata from document processing results
 */
async function extractDocumentMetadata(result: AdvancedProcessingResult, document: any) {
  const metadata = {
    extractedDate: null as Date | null,
    extractedYear: null as number | null,
    extractedMonth: null as number | null,
    invoiceTotal: null as number | null,
    vatAccuracy: 0.0,
    processingQuality: 85, // Default quality score
    extractionConfidence: result.extractedData?.confidence || 0.0,
    dateExtractionConfidence: 0.0,
    totalExtractionConfidence: 0.0,
    validationStatus: 'PENDING' as string,
    complianceIssues: [] as string[]
  }

  try {
    // First, convert AI response format to metadata format
    let extractedData: any = {}
    
    if (result.extractedData?.metadata) {
      extractedData = result.extractedData.metadata
    } else if (result.extractedData) {
      // Convert AI JSON response to metadata format
      const aiData = result.extractedData
      
      // Map date from transactionData.date to various date field formats
      if (aiData.transactionData?.date) {
        extractedData.dueDate = { value: aiData.transactionData.date, confidence: 0.8 }
        extractedData.invoiceDate = { value: aiData.transactionData.date, confidence: 0.8 }
        extractedData.documentDate = { value: aiData.transactionData.date, confidence: 0.8 }
      }
      
      // Map total from vatData.grandTotal to various total field formats
      if (aiData.vatData?.grandTotal) {
        extractedData.total = { value: aiData.vatData.grandTotal, confidence: 0.8 }
        extractedData.totalAmount = { value: aiData.vatData.grandTotal, confidence: 0.8 }
        extractedData.grandTotal = { value: aiData.vatData.grandTotal, confidence: 0.8 }
      }
    }

    // Extract date information
    if (extractedData && Object.keys(extractedData).length > 0) {

      // Look for date fields in extracted data
      const dateFields = ['dueDate', 'paymentDueDate', 'due', 'paymentDue', 'documentDate', 'invoiceDate', 'date', 'issueDate', 'billDate']
      let extractedDate = null
      let dateConfidence = 0.0

      for (const field of dateFields) {
        if (extractedData[field]) {
          const dateValue = extractedData[field]
          if (dateValue.value) {
            try {
              extractedDate = new Date(dateValue.value)
              dateConfidence = dateValue.confidence || 0.7
              break
            } catch (e) {
              console.warn('Failed to parse date:', dateValue.value)
            }
          }
        }
      }

      // Fallback: try to extract date from document name
      if (!extractedDate) {
        const dateFromName = extractDateFromFileName(document.originalName)
        if (dateFromName) {
          extractedDate = dateFromName
          dateConfidence = 0.5 // Lower confidence for filename extraction
        }
      }

      // Use upload date as final fallback
      if (!extractedDate) {
        extractedDate = new Date(document.uploadedAt)
        dateConfidence = 0.3 // Low confidence for fallback
      }

      if (extractedDate) {
        metadata.extractedDate = extractedDate
        metadata.extractedYear = extractedDate.getFullYear()
        metadata.extractedMonth = extractedDate.getMonth() + 1 // 1-based month
        metadata.dateExtractionConfidence = dateConfidence
      }

      // Extract total amount
      const totalFields = ['total', 'totalAmount', 'grandTotal', 'amountDue', 'totalDue', 'balanceDue', 'totalIncludingVat', 'totalIncVat', 'totalInclVat']
      for (const field of totalFields) {
        if (extractedData[field]) {
          const totalValue = extractedData[field]
          if (totalValue.value && typeof totalValue.value === 'number') {
            metadata.invoiceTotal = totalValue.value
            metadata.totalExtractionConfidence = totalValue.confidence || 0.7
            break
          }
        }
      }

      // Calculate VAT accuracy based on confidence scores
      const vatFields = extractedData.vatAmounts || []
      if (vatFields.length > 0) {
        const avgConfidence = vatFields.reduce((sum: number, vat: any) => sum + (vat.confidence || 0), 0) / vatFields.length
        metadata.vatAccuracy = avgConfidence
      }

      // Set processing quality based on various factors
      let qualityScore = 70 // Base score
      
      if (result.processingStrategy === 'TEMPLATE_MATCH') {
        qualityScore += 20 // Template match is higher quality
      }
      if (metadata.dateExtractionConfidence > 0.8) {
        qualityScore += 5
      }
      if (metadata.totalExtractionConfidence > 0.8) {
        qualityScore += 5
      }
      
      metadata.processingQuality = Math.min(100, qualityScore)

      // Validate compliance (Irish VAT requirements)
      const issues: string[] = []
      
      if (!metadata.invoiceTotal || metadata.invoiceTotal <= 0) {
        issues.push('Missing or invalid invoice total')
      }
      
      if (!metadata.extractedDate) {
        issues.push('Missing document date')
      }
      
      if (vatFields.length === 0) {
        issues.push('No VAT amounts detected')
      }

      metadata.complianceIssues = issues
      
      if (issues.length === 0) {
        metadata.validationStatus = 'COMPLIANT'
      } else if (issues.length <= 2) {
        metadata.validationStatus = 'NEEDS_REVIEW'
      } else {
        metadata.validationStatus = 'NON_COMPLIANT'
      }
    }

  } catch (error) {
    console.error('Error extracting document metadata:', error)
  }

  return metadata
}

/**
 * Extract date from filename patterns
 */
function extractDateFromFileName(filename: string): Date | null {
  // Common date patterns in filenames
  const patterns = [
    /(\d{4})[-_](\d{1,2})[-_](\d{1,2})/, // YYYY-MM-DD or YYYY_MM_DD
    /(\d{1,2})[-_](\d{1,2})[-_](\d{4})/, // MM-DD-YYYY or MM_DD_YYYY
    /(\d{1,2})[-_](\d{1,2})[-_](\d{2})/, // MM-DD-YY or MM_DD_YY
  ]

  for (const pattern of patterns) {
    const match = filename.match(pattern)
    if (match) {
      try {
        let year, month, day
        if (pattern.source.startsWith('(\\d{4})')) {
          // YYYY-MM-DD format
          year = parseInt(match[1])
          month = parseInt(match[2]) - 1 // 0-based for Date constructor
          day = parseInt(match[3])
        } else {
          // MM-DD-YYYY format
          month = parseInt(match[1]) - 1
          day = parseInt(match[2])
          year = parseInt(match[3])
          if (year < 100) {
            year += 2000 // Convert 2-digit year
          }
        }

        const date = new Date(year, month, day)
        if (!isNaN(date.getTime())) {
          return date
        }
      } catch (e) {
        continue
      }
    }
  }

  return null
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