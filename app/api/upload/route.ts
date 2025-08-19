import { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { createGuestFriendlyRoute } from '@/lib/middleware'
import { prisma, withDatabaseRetry } from '@/lib/prisma'
import { validateFile, processFileForServerless, getDocumentType } from '@/lib/serverlessFileUtils'
import { processDocument } from '@/lib/documentProcessor'
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
        const guestUser = await prisma.user.create({
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
        const vatReturn = await prisma.vATReturn.findFirst({
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
      document = await prisma.document.create({
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
        // Update document with processing results
        await prisma.document.update({
          where: { id: document.id },
          data: {
            isScanned: true,
            scanResult: processingResult.scanResult,
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
            await prisma.auditLog.create({
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
        await prisma.document.update({
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
      await prisma.document.update({
        where: { id: document.id },
        data: {
          isScanned: false,
          scanResult: 'Processing failed due to technical error',
        }
      })
    }
    
    // Create audit log for document upload (now including guests for consistency)
    // Creating upload audit log
    
    try {
      await prisma.auditLog.create({
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
    const updatedDocument = await prisma.document.findUnique({
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

export const POST = createGuestFriendlyRoute(uploadFile)