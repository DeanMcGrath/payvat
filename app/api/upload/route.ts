import { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { createGuestFriendlyRoute } from '@/lib/middleware'
import { prisma, withDatabaseRetry } from '@/lib/prisma'
import { validateFile, processFileForServerless, getDocumentType } from '@/lib/serverlessFileUtils'
import { processDocument } from '@/lib/documentProcessor'
import { EnhancedDocumentAnalysis } from '@/lib/ai/enhancedDocumentAnalysis'
import { AuthUser } from '@/lib/auth'
import { logger } from '@/lib/logger'
import { logError, logWarn, logInfo, logAudit, logPerformance } from '@/lib/secure-logger'
import { invalidateUserCache } from '@/app/api/documents/extracted-vat/route'
import { generateDocumentFingerprint, checkForDuplicates, storeDocumentHash, markAsDuplicate } from '@/lib/duplicateDetection'

async function uploadFile(request: NextRequest, user?: AuthUser) {
  const startTime = Date.now()
  logAudit('FILE_UPLOAD_STARTED', {
    userId: user?.id,
    operation: 'file-upload',
    result: 'SUCCESS'
  })
  
  let processingResult: any = null // Track processing result for debugging
  let processingError: any = null // Track processing errors
  
  try {
    // Check if request has multipart form data
    const contentType = request.headers.get('content-type')
    if (!contentType?.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Content-Type must be multipart/form-data' },
        { status: 400 }
      )
    }
    
    // Parsing form data
    const formData = await request.formData()
    // Form data parsed
    
    const file = formData.get('file') as File
    const category = formData.get('category') as string
    const vatReturnId = formData.get('vatReturnId') as string | null
    
    // Form data extracted and validated
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }
    
    if (!category) {
      return NextResponse.json(
        { error: 'Document category is required' },
        { status: 400 }
      )
    }
    
    // Validate document category
    const validCategories = [
      'SALES_INVOICE',
      'SALES_RECEIPT', 
      'SALES_REPORT',
      'PURCHASE_INVOICE',
      'PURCHASE_RECEIPT',
      'PURCHASE_REPORT',
      'BANK_STATEMENT',
      'OTHER'
    ]
    
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid document category' },
        { status: 400 }
      )
    }
    
    // Validate file
    const validation = validateFile(file)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }
    
    // Test basic database connectivity
    try {
      await prisma.$queryRaw`SELECT 1`
    } catch (dbError) {
      logError('Database connection failed in upload', dbError, {
        userId: user?.id,
        operation: 'upload-db-test'
      })
      return NextResponse.json({
        success: false,
        error: 'Service temporarily unavailable. Please try again later.'
      }, { status: 503 })
    }

    // Generate session-based user ID for guests - but we need a valid User record for DB constraint
    let userId: string;
    if (user) {
      userId = user.id;
    } else {
      // For guest uploads, create a minimal guest user record to satisfy foreign key constraint
      try {
        const guestEmail = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}@guest.payvat.ie`;
        const guestUser = await prisma.User.create({
          data: {
            email: guestEmail,
            password: 'guest-no-password',
            businessName: 'Guest Upload',
            vatNumber: `GUEST${Date.now()}`,
            role: 'GUEST'
          }
        });
        userId = guestUser.id;
        logInfo('Created guest user for upload', { 
          operation: 'guest-user-creation',
          userId: userId 
        });
      } catch (guestUserError) {
        logError('Failed to create guest user', guestUserError, {
          operation: 'guest-user-creation'
        })
        return NextResponse.json({
          success: false,
          error: 'Unable to process guest upload. Please try again.'
        }, { status: 500 })
      }
    }
    
    // Validate VAT return ownership if provided and user is authenticated
    if (vatReturnId && user) {
      try {
        const vatReturn = await prisma.VATReturn.findFirst({
          where: {
            id: vatReturnId,
            userId: user.id
          }
        })
        
        if (!vatReturn) {
          return NextResponse.json(
            { error: 'VAT return not found or not authorized' },
            { status: 404 }
          )
        }
      } catch (vatReturnError) {
        logError('VAT return validation failed', vatReturnError, {
          userId: user.id,
          vatReturnId,
          operation: 'upload-vat-return-validation'
        })
        return NextResponse.json({
          success: false,
          error: 'Unable to validate VAT return. Please try again.'
        }, { status: 500 })
      }
    }
    
    // Process file for serverless environment
    let processedFile
    try {
      processedFile = await processFileForServerless(file, userId)
    } catch (processingError) {
      logError('File processing failed', processingError, {
        userId,
        fileName: file.name,
        operation: 'upload-file-processing'
      })
      return NextResponse.json({
        success: false,
        error: 'File processing failed. Please ensure the file is not corrupted and try again.'
      }, { status: 500 })
    }
    
    // Save document metadata to database
    let document
    try {
      document = await prisma.Document.create({
        data: {
          userId: userId,
          vatReturnId: vatReturnId || null,
          fileName: processedFile.fileName,
          originalName: processedFile.originalName,
          filePath: null, // Not used in serverless
          fileData: processedFile.fileData,
          fileSize: processedFile.fileSize,
          mimeType: processedFile.mimeType,
          fileHash: processedFile.fileHash,
          documentType: getDocumentType(processedFile.extension) as any,
          category: category as any,
          isScanned: false, // Will be updated by document processing
        }
      })
    } catch (dbCreateError) {
      logError('Document creation failed', dbCreateError, {
        userId,
        fileName: processedFile.fileName,
        operation: 'upload-document-creation'
      })
      return NextResponse.json({
        success: false,
        error: 'Failed to save document. Please try again.'
      }, { status: 500 })
    }
    
    // Document record created successfully
    
    // DUPLICATE DETECTION - Check if this document is a duplicate
    let duplicateResult = null
    try {
      logger.info('Starting duplicate detection', { fileName: processedFile.originalName }, 'UPLOAD_API')
      
      // Generate document fingerprint
      const fingerprint = generateDocumentFingerprint(
        processedFile.fileData,
        processedFile.originalName,
        processedFile.fileSize,
        processedFile.mimeType
      )
      
      // Check for duplicates
      duplicateResult = await checkForDuplicates(fingerprint, userId, document.id)
      
      if (duplicateResult.isDuplicate && duplicateResult.duplicateOfId) {
        logger.info('Duplicate document detected', { 
          documentId: document.id, 
          duplicateOfId: duplicateResult.duplicateOfId,
          confidence: duplicateResult.confidence 
        }, 'DUPLICATE_DETECTION')
        
        // Mark as duplicate in database
        await markAsDuplicate(document.id, duplicateResult.duplicateOfId, duplicateResult.confidence)
        
        logWarn('Document marked as duplicate', {
          documentId: document.id,
          duplicateOfId: duplicateResult.duplicateOfId,
          reasons: duplicateResult.reasons,
          confidence: duplicateResult.confidence
        })
      } else {
        // Store document hash for future duplicate detection
        await storeDocumentHash(document.id, fingerprint)
      }
      
    } catch (duplicateError) {
      logError('Duplicate detection failed', duplicateError, 'DUPLICATE_DETECTION')
      // Continue with processing even if duplicate detection fails
    }
    
    // Process document immediately after upload for VAT extraction
    logger.info('Starting document processing', { fileName: processedFile.originalName }, 'UPLOAD_API')
    
    // Starting document processing
    
    try {
      processingResult = await processDocument(
        processedFile.fileData,
        processedFile.mimeType,
        processedFile.originalName,
        category
      )
      
      // Processing result received
      if (processingResult.extractedData) {
        const salesVAT = processingResult.extractedData.salesVAT || []
        const purchaseVAT = processingResult.extractedData.purchaseVAT || []
        // VAT data processed
      }
      // Processing complete
      
      if (processingResult.success) {
        // Extract date information from basic processing (support both formats)
        let extractedDate = null
        let extractedYear = null
        let extractedMonth = null
        
        // Try basic processing format first
        if (processingResult.extractedData?.invoiceDate) {
          try {
            extractedDate = new Date(processingResult.extractedData.invoiceDate)
            if (!isNaN(extractedDate.getTime())) {
              extractedYear = extractedDate.getFullYear()
              extractedMonth = extractedDate.getMonth() + 1 // 1-based month
            } else {
              extractedDate = null
            }
          } catch (dateError) {
            console.warn('Failed to parse extracted date:', processingResult.extractedData.invoiceDate)
            extractedDate = null
          }
        } 
        // Try AI response format
        else if (processingResult.extractedData?.transactionData?.date) {
          try {
            extractedDate = new Date(processingResult.extractedData.transactionData.date)
            if (!isNaN(extractedDate.getTime())) {
              extractedYear = extractedDate.getFullYear()
              extractedMonth = extractedDate.getMonth() + 1 // 1-based month
            } else {
              extractedDate = null
            }
          } catch (dateError) {
            console.warn('Failed to parse AI extracted date:', processingResult.extractedData.transactionData.date)
            extractedDate = null
          }
        }
        
        // Extract total amount from basic or AI processing
        let invoiceTotal = null
        if (processingResult.extractedData?.totalAmount) {
          invoiceTotal = processingResult.extractedData.totalAmount
        } else if (processingResult.extractedData?.vatData?.grandTotal) {
          invoiceTotal = processingResult.extractedData.vatData.grandTotal
        }
        
        // Update document with processing results including extracted date and total
        await prisma.Document.update({
          where: { id: document.id },
          data: {
            isScanned: true,
            scanResult: processingResult.scanResult,
            ...(extractedDate && {
              extractedDate,
              extractedYear,
              extractedMonth
            }),
            ...(invoiceTotal && {
              invoiceTotal
            })
          }
        })
        
        // 🔧 CRITICAL FIX: Log extracted VAT data for audit trail (NOW INCLUDING GUESTS!)
        // This was the root cause of "processedDocuments": 0 - guest users weren't getting audit logs
        // Checking VAT data for audit logging
        
        if (processingResult.extractedData && 
            (processingResult.extractedData.salesVAT.length > 0 || 
             processingResult.extractedData.purchaseVAT.length > 0)) {
          
          // Creating VAT audit log
          
          try {
            await prisma.AuditLog.create({
              data: {
                userId: userId, // Use the userId (works for both authenticated and guest users)
                action: 'VAT_DATA_EXTRACTED',
                entityType: 'DOCUMENT',
                entityId: document.id,
                ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
                userAgent: request.headers.get('user-agent') || 'unknown',
                metadata: {
                  extractedData: JSON.parse(JSON.stringify(processingResult.extractedData)),
                  fileName: processedFile.originalName,
                  category,
                  confidence: processingResult.extractedData.confidence,
                  timestamp: new Date().toISOString(),
                  userType: user ? 'authenticated' : 'guest' // Add flag for debugging
                }
              }
            })
            
            // VAT audit log created
            
          } catch (auditError) {
            logError('Audit log creation failed', auditError, {
              userId,
              operation: 'vat-audit-log-creation'
            })
          }
        } else {
          // No VAT data found, no audit log created
        }
        
        logger.info('Document processing completed', { scanResult: processingResult.scanResult }, 'UPLOAD_API')
      } else {
        logError('Document processing failed', processingResult.error, {
          userId,
          operation: 'document-processing'
        })
        logger.warn('Document processing failed', { error: processingResult.error }, 'UPLOAD_API')
        // Update with failed status
        await prisma.Document.update({
          where: { id: document.id },
          data: {
            isScanned: false,
            scanResult: processingResult.scanResult || 'Processing failed',
          }
        })
      }
    } catch (docProcessingError) {
      processingError = docProcessingError
      logError('Document processing exception', docProcessingError, {
        userId,
        operation: 'document-processing-exception'
      })
      logger.error('Document processing error', docProcessingError, 'UPLOAD_API')
      // Update with error status
      await prisma.Document.update({
        where: { id: document.id },
        data: {
          isScanned: false,
          scanResult: 'Processing failed due to technical error',
        }
      })
    }
    
    // Enhanced AI Processing - trigger after basic processing (ASYNC TO PREVENT TIMEOUT)
    // Don't await this to prevent timeout - let it run in background
    const triggerAsyncAIProcessing = async () => {
      try {
        const enhancedAI = formData.get('enhancedAI') === 'true'
        
        if (enhancedAI || processingResult?.success) {
          logger.info('Starting enhanced AI processing (async)', { documentId: document.id }, 'ENHANCED_AI')
        
        // Prepare processing context
        const processingContext = {
          userId: userId,
          businessContext: {
            businessName: user?.businessName || 'Guest Upload',
            vatNumber: user?.vatNumber
          },
          forceRelearn: false,
          debugMode: false
        }
        
        // Extract text from document (use basic processing result as primary source)
        let extractedText = ''
        try {
          if (processingResult?.extractedData?.extractedText) {
            extractedText = Array.isArray(processingResult.extractedData.extractedText) 
              ? processingResult.extractedData.extractedText.join(' ')
              : processingResult.extractedData.extractedText.toString()
          }
          
          // If no extracted text from basic processing, try to extract some basic info
          if (!extractedText || extractedText.length < 10) {
            // For PDFs, try to extract basic information from the document name and category
            if (document.mimeType === 'application/pdf' || document.mimeType === 'application/octet-stream') {
              extractedText = `Document: ${document.originalName}, Category: ${document.category}, Type: Invoice/Receipt document for VAT processing`
            }
          }
          
          logger.info('Text extracted for enhanced processing', { 
            textLength: extractedText.length,
            hasBasicResult: !!processingResult?.extractedData?.extractedText,
            documentId: document.id 
          }, 'ENHANCED_AI')
          
        } catch (textError) {
          logger.warn('Text extraction failed for enhanced processing', textError, 'ENHANCED_AI')
          // Fallback: use document metadata
          extractedText = `Document: ${document.originalName}, Category: ${document.category}`
        }
        
        // Process with enhanced AI system
        const enhancedResult = await EnhancedDocumentAnalysis.processDocumentWithLearning(
          document.id,
          processedFile.fileData,
          processedFile.mimeType,
          processedFile.originalName,
          extractedText,
          processingContext
        )
        
        if (enhancedResult.success && enhancedResult.extractedData) {
          logger.info('Enhanced AI processing completed successfully', { 
            documentId: document.id,
            strategy: enhancedResult.processingStrategy,
            confidence: enhancedResult.extractedData.confidence
          }, 'ENHANCED_AI')
          
          // Extract enhanced metadata (simplified version)
          const enhancedData = await extractDocumentMetadataSimple(enhancedResult, document)
          
          // Update document with enhanced metadata
          await prisma.Document.update({
            where: { id: document.id },
            data: {
              // Enhanced fields
              extractedDate: enhancedData.extractedDate,
              extractedYear: enhancedData.extractedYear,
              extractedMonth: enhancedData.extractedMonth,
              invoiceTotal: enhancedData.invoiceTotal,
              vatAmount: enhancedData.vatAmount,
              vatAccuracy: enhancedData.vatAccuracy,
              processingQuality: enhancedData.processingQuality,
              extractionConfidence: enhancedData.extractionConfidence,
              dateExtractionConfidence: enhancedData.dateExtractionConfidence,
              totalExtractionConfidence: enhancedData.totalExtractionConfidence,
              validationStatus: enhancedData.validationStatus,
              complianceIssues: enhancedData.complianceIssues,
              isDuplicate: false
            }
          })
          
          // Store processing analytics
          await prisma.AIProcessingAnalytics.create({
            data: {
              documentId: document.id,
              userId: userId,
              processingStrategy: enhancedResult.processingStrategy,
              templateUsed: enhancedResult.templateUsed,
              processingTime: enhancedResult.processingTime || 0,
              confidenceScore: enhancedResult.extractedData?.confidence || 0,
              tokensUsed: null,
              cost: null,
              learningApplied: enhancedResult.learningApplied,
              confidenceBoost: enhancedResult.confidenceBoost,
              matchedFeatures: enhancedResult.matchedFeatures,
              suggestedImprovements: enhancedResult.suggestedImprovements,
              hadErrors: !enhancedResult.success,
              errorType: enhancedResult.error ? 'PROCESSING_ERROR' : null,
              errorMessage: enhancedResult.error,
              extractionAccuracy: null,
              userSatisfaction: null
            }
          })
          
          logger.info('Enhanced AI metadata saved successfully', { 
            documentId: document.id,
            extractedDate: enhancedData.extractedDate,
            invoiceTotal: enhancedData.invoiceTotal
          }, 'ENHANCED_AI')
        } else {
          logger.warn('Enhanced AI processing failed', { 
            documentId: document.id,
            error: enhancedResult.error 
          }, 'ENHANCED_AI')
        }
        }
      } catch (enhancedProcessingError) {
        logger.error('Enhanced AI processing failed with exception (async)', enhancedProcessingError, 'ENHANCED_AI')
        // Don't fail the upload if enhanced processing fails
      }
    }
    
    // Trigger async AI processing without blocking the response
    triggerAsyncAIProcessing().catch(error => {
      logger.error('Async AI processing trigger failed', error, 'ENHANCED_AI')
    })
    
    // Create audit log for document upload (now including guests for consistency)
    // Creating upload audit log
    
    try {
      await prisma.AuditLog.create({
        data: {
          userId: userId, // Use userId for both authenticated and guest users
          action: 'UPLOAD_DOCUMENT',
          entityType: 'DOCUMENT',
          entityId: document.id,
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          metadata: {
            fileName: processedFile.originalName,
            fileSize: processedFile.fileSize,
            category,
            vatReturnId,
            timestamp: new Date().toISOString(),
            userType: user ? 'authenticated' : 'guest'
          }
        }
      })
      
      // Upload audit log created
      
    } catch (uploadAuditError) {
      logError('Upload audit log creation failed', uploadAuditError, {
        userId,
        operation: 'upload-audit-log'
      })
    }
    
    // Fetch updated document status
    const updatedDocument = await prisma.Document.findUnique({
      where: { id: document.id }
    })

    // 🔑 CRITICAL: Log document ID prominently for debugging
    // Document uploaded successfully
    logAudit('DOCUMENT_UPLOADED', {
      userId,
      documentId: document.id,
      operation: 'file-upload',
      result: 'SUCCESS'
    })
    
    logPerformance('file-upload', Date.now() - startTime, {
      userId,
      operation: 'file-upload'
    })

    // CRITICAL FIX: Invalidate VAT data cache after successful upload
    try {
      invalidateUserCache(user?.id)
      logInfo('Cache invalidated after document upload', { userId: user?.id })
    } catch (cacheError) {
      logError('Cache invalidation failed', cacheError, { userId: user?.id })
      // Don't fail the upload if cache invalidation fails
    }

    return NextResponse.json({
      success: true,
      message: `Document uploaded successfully! Use document ID: ${document.id} for debugging`,
      debugInfo: {
        documentId: document.id,
        debugUrl: `/api/debug/prompt-test?documentId=${document.id}&testtype=compare_both`,
        instruction: "🔑 Copy the documentId above to use in diagnostic testing",
        processingResult: processingResult ? {
          success: processingResult.success,
          isScanned: processingResult.isScanned,
          hasExtractedData: !!processingResult.extractedData,
          salesVATCount: processingResult.extractedData?.salesVAT?.length || 0,
          purchaseVATCount: processingResult.extractedData?.purchaseVAT?.length || 0,
          error: processingResult.error || null,
          scanResult: processingResult.scanResult
        } : null,
        serverLogs: {
          processingAttempted: true,
          timestampProcessed: new Date().toISOString(),
          uploadAPIExecuted: true,
          processingError: processingError ? {
            message: processingError instanceof Error ? processingError.message : 'Unknown error',
            name: processingError instanceof Error ? processingError.name : 'Unknown'
          } : null
        }
      },
      document: {
        id: document.id,
        fileName: document.originalName,
        fileSize: document.fileSize,
        category: document.category,
        uploadedAt: document.uploadedAt,
        isScanned: updatedDocument?.isScanned || false,
        scanResult: updatedDocument?.scanResult,
        // Include duplicate detection results
        isDuplicate: updatedDocument?.isDuplicate || false,
        duplicateOfId: updatedDocument?.duplicateOfId || null,
        duplicateInfo: duplicateResult ? {
          confidence: duplicateResult.confidence,
          reasons: duplicateResult.reasons,
          similarityScore: duplicateResult.similarityScore
        } : null
      }
    })
    
  } catch (error) {
    logError('Upload API exception at top level', error, {
      operation: 'file-upload-top-level'
    })
    
    logger.error('File upload error', error, 'UPLOAD_API')
    return NextResponse.json(
      { error: 'File upload failed' },
      { status: 500 }
    )
  }
}

/**
 * Extract enhanced metadata from document processing results
 * Simplified version for upload API
 */
async function extractDocumentMetadataSimple(result: any, document: any) {
  const metadata = {
    extractedDate: null as Date | null,
    extractedYear: null as number | null,
    extractedMonth: null as number | null,
    invoiceTotal: null as number | null,
    vatAmount: 0.0,
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

      // Use upload date as fallback
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

      // Extract VAT amount
      let vatAmount = 0
      if (result.extractedData?.vatData?.totalVatAmount) {
        vatAmount = result.extractedData.vatData.totalVatAmount
      } else if (result.extractedData?.salesVAT?.length > 0) {
        vatAmount = result.extractedData.salesVAT.reduce((sum: number, vat: number) => sum + vat, 0)
      } else if (result.extractedData?.purchaseVAT?.length > 0) {
        vatAmount = result.extractedData.purchaseVAT.reduce((sum: number, vat: number) => sum + vat, 0)
      } else if (extractedData['vatAmount']) {
        const vatValue = extractedData['vatAmount']
        vatAmount = vatValue.value || vatValue
      }
      
      metadata.vatAmount = vatAmount

      // Set processing quality based on confidence
      let qualityScore = 70 // Base score
      if (result.processingStrategy === 'TEMPLATE_MATCH') {
        qualityScore += 20
      }
      if (metadata.dateExtractionConfidence > 0.8) {
        qualityScore += 5
      }
      if (metadata.totalExtractionConfidence > 0.8) {
        qualityScore += 5
      }
      metadata.processingQuality = Math.min(100, qualityScore)

      // Basic validation
      const issues: string[] = []
      if (!metadata.invoiceTotal || metadata.invoiceTotal <= 0) {
        issues.push('Missing or invalid invoice total')
      }
      if (!metadata.extractedDate) {
        issues.push('Missing document date')
      }
      
      metadata.complianceIssues = issues
      metadata.validationStatus = issues.length === 0 ? 'COMPLIANT' : 'NEEDS_REVIEW'
    }
  } catch (error) {
    console.error('Error extracting document metadata:', error)
  }

  return metadata
}

// Temporary: expose real error for debugging
export const POST = async (request: NextRequest) => {
  try {
    return await uploadFile(request, undefined)
  } catch (error) {
    console.error('REAL UPLOAD ERROR:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      details: error
    }, { status: 500 })
  }
}