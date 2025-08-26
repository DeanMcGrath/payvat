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
  console.log('✅ STEP 2: uploadFile function called')
  
  const startTime = Date.now()
  logAudit('FILE_UPLOAD_STARTED', {
    userId: user?.id,
    operation: 'file-upload',
    result: 'SUCCESS'
  })
  
  console.log('✅ STEP 3: Audit log completed')
  
  let processingResult: any = null // Track processing result for debugging
  let processingError: any = null // Track processing errors
  
  try {
    // Check if request has multipart form data
    console.log('✅ STEP 4: Checking content type')
    const contentType = request.headers.get('content-type')
    if (!contentType?.includes('multipart/form-data')) {
      console.error('❌ STEP 4 FAILED: Invalid content type:', contentType)
      return NextResponse.json(
        { error: 'Content-Type must be multipart/form-data' },
        { status: 400 }
      )
    }
    
    // Parsing form data with enhanced error handling
    console.log('✅ STEP 5: Parsing form data')
    let formData: FormData
    try {
      formData = await request.formData()
      console.log('✅ STEP 6: Form data parsed successfully')
    } catch (formError) {
      console.error('❌ STEP 6 FAILED: Form data parsing error:', formError)
      return NextResponse.json(
        { 
          error: 'Failed to parse form data',
          details: formError instanceof Error ? formError.message : 'Unknown parsing error',
          step: 'form-data-parsing'
        },
        { status: 400 }
      )
    }
    
    console.log('✅ STEP 7: Extracting form fields')
    
    // Enhanced field extraction with validation
    const file = formData.get('file') as File | null
    const category = formData.get('category') as string | null
    const vatReturnId = formData.get('vatReturnId') as string | null
    
    // Log all form fields for debugging
    const allFields = Array.from(formData.keys())
    console.log('Form fields received:', allFields)
    
    // Also try alternative field names in case frontend uses different names
    const fileAlternative = file || formData.get('files') as File | null
    const finalFile = fileAlternative
    
    console.log('✅ STEP 8: Form data extracted successfully', {
      hasFile: !!finalFile,
      hasOriginalFile: !!file,
      allFields: allFields,
      category,
      fileSize: finalFile?.size
    })
    
    if (!finalFile) {
      console.error('❌ STEP 8 FAILED: No file provided in any field')
      return NextResponse.json(
        { 
          error: 'No file provided',
          details: `Expected field 'file' or 'files', found fields: ${allFields.join(', ')}`,
          receivedFields: allFields
        },
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
    const validation = validateFile(finalFile)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }
    
    // Test basic database connectivity
    console.log('✅ STEP 9: Testing database connection')
    try {
      await prisma.$queryRaw`SELECT 1`
      console.log('✅ STEP 10: Database connection successful')
    } catch (dbError) {
      console.error('❌ STEP 10 FAILED: Database connection error:', dbError)
      logError('Database connection failed in upload', dbError, {
        userId: user?.id,
        operation: 'upload-db-test'
      })
      return NextResponse.json({
        success: false,
        error: 'Service temporarily unavailable. Please try again later.',
        step: 'DATABASE_CONNECTION_FAILED',
        details: dbError instanceof Error ? dbError.message : String(dbError)
      }, { status: 503 })
    }

    // Generate session-based user ID for guests - but we need a valid User record for DB constraint
    console.log('✅ STEP 11: Setting up user ID')
    let userId: string;
    if (user) {
      userId = user.id;
      console.log('✅ STEP 12: Using authenticated user ID:', userId)
    } else {
      // For guest uploads, create a minimal guest user record to satisfy foreign key constraint
      console.log('✅ STEP 12: Creating guest user')
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
        console.log('✅ STEP 13: Guest user created:', userId)
        logInfo('Created guest user for upload', { 
          operation: 'guest-user-creation',
          userId: userId 
        });
      } catch (guestUserError) {
        console.error('❌ STEP 13 FAILED: Guest user creation error:', guestUserError)
        logError('Failed to create guest user', guestUserError, {
          operation: 'guest-user-creation'
        })
        return NextResponse.json({
          success: false,
          error: 'Unable to process guest upload. Please try again.',
          step: 'GUEST_USER_CREATION_FAILED',
          details: guestUserError instanceof Error ? guestUserError.message : String(guestUserError)
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
    console.log('✅ STEP 14: Starting file processing for serverless')
    let processedFile
    try {
      processedFile = await processFileForServerless(finalFile, userId)
      console.log('✅ STEP 15: File processed successfully', {
        fileName: processedFile?.fileName,
        fileSize: processedFile?.fileSize
      })
    } catch (processingError) {
      console.error('❌ STEP 15 FAILED: File processing error:', processingError)
      logError('File processing failed', processingError, {
        userId,
        fileName: finalFile.name,
        operation: 'upload-file-processing'
      })
      return NextResponse.json({
        success: false,
        error: 'File processing failed. Please ensure the file is not corrupted and try again.',
        step: 'FILE_PROCESSING_FAILED',
        details: processingError instanceof Error ? processingError.message : String(processingError)
      }, { status: 500 })
    }
    
    // Save document metadata to database
    console.log('✅ STEP 16: Creating document record in database')
    let document
    try {
      // Test with absolute minimum required fields only + fileData for preview
      document = await prisma.Document.create({
        data: {
          userId: userId,
          fileName: processedFile.fileName,
          originalName: processedFile.originalName,
          fileSize: processedFile.fileSize,
          mimeType: processedFile.mimeType,
          fileHash: processedFile.fileHash,
          fileData: processedFile.fileData, // CRITICAL: Save base64 file data for preview
          documentType: getDocumentType(processedFile.extension) as any,
          category: category as any,
          isScanned: false
          // Only absolute essentials to avoid schema conflicts
        }
      })
      console.log('✅ STEP 17: Document record created successfully', {
        documentId: document.id,
        fileName: document.fileName
      })
    } catch (dbCreateError) {
      console.error('❌ STEP 17 FAILED: Document creation error:', dbCreateError)
      logError('Document creation failed', dbCreateError, {
        userId,
        fileName: processedFile.fileName,
        operation: 'upload-document-creation'
      })
      return NextResponse.json({
        success: false,
        error: 'Failed to save document. Please try again.',
        step: 'DOCUMENT_CREATION_FAILED',
        details: dbCreateError instanceof Error ? dbCreateError.message : String(dbCreateError)
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
        
        // 🔧 CRITICAL FIX: Enhanced date extraction with comprehensive debug logging
        console.log('📅 EXTRACTING DATE FROM PROCESSING RESULT:')
        console.log('   Full extractedData structure:', JSON.stringify(processingResult.extractedData, null, 2))
        
        // Try basic processing format first
        if (processingResult.extractedData?.invoiceDate) {
          try {
            extractedDate = new Date(processingResult.extractedData.invoiceDate)
            if (!isNaN(extractedDate.getTime())) {
              extractedYear = extractedDate.getFullYear()
              extractedMonth = extractedDate.getMonth() + 1 // 1-based month
              console.log(`✅ EXTRACTION SUCCESS: Date extracted from invoiceDate - ${extractedDate.toISOString()}`)
            } else {
              extractedDate = null
              console.log('🚨 Date extraction failed: invoiceDate is not a valid date')
            }
          } catch (dateError) {
            console.warn('Failed to parse extracted date:', processingResult.extractedData.invoiceDate, dateError)
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
              console.log(`✅ EXTRACTION SUCCESS: Date extracted from transactionData.date - ${extractedDate.toISOString()}`)
            } else {
              extractedDate = null
              console.log('🚨 Date extraction failed: transactionData.date is not a valid date')
            }
          } catch (dateError) {
            console.warn('Failed to parse AI extracted date:', processingResult.extractedData.transactionData.date, dateError)
            extractedDate = null
          }
        } else {
          console.log('🚨 NO DATE FOUND in processing result - attempting fallback extraction')
          console.log('   Available fields in extractedData:', processingResult.extractedData ? Object.keys(processingResult.extractedData) : 'none')
          
          // 🔧 CRITICAL FIX: Fallback date extraction from extractedText
          if (processingResult.extractedData?.extractedText) {
            const textArray = Array.isArray(processingResult.extractedData.extractedText) 
              ? processingResult.extractedData.extractedText 
              : [processingResult.extractedData.extractedText];
            
            const fullText = textArray.join(' ');
            console.log('   Attempting to extract date from text:', fullText);
            
            // Look for date patterns in the text
            const datePatterns = [
              /Date:\s*(\d{4}-\d{2}-\d{2})/i,           // "Date: 2024-03-15"
              /Invoice\s+Date:\s*(\d{4}-\d{2}-\d{2})/i, // "Invoice Date: 2024-03-15"
              /(\d{4}-\d{2}-\d{2})/,                    // Just "2024-03-15"
              /(\d{1,2}\/\d{1,2}\/\d{4})/,              // "15/03/2024"
              /(\d{1,2}-\d{1,2}-\d{4})/                 // "15-03-2024"
            ];
            
            for (const pattern of datePatterns) {
              const match = fullText.match(pattern);
              if (match) {
                try {
                  let dateString = match[1];
                  
                  // Convert DD/MM/YYYY to YYYY-MM-DD
                  if (dateString.includes('/')) {
                    const [day, month, year] = dateString.split('/');
                    dateString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                  }
                  // Convert DD-MM-YYYY to YYYY-MM-DD  
                  else if (dateString.match(/^\d{1,2}-\d{1,2}-\d{4}$/)) {
                    const [day, month, year] = dateString.split('-');
                    dateString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                  }
                  
                  const testDate = new Date(dateString);
                  if (!isNaN(testDate.getTime())) {
                    extractedDate = testDate;
                    extractedYear = testDate.getFullYear();
                    extractedMonth = testDate.getMonth() + 1;
                    console.log(`✅ FALLBACK DATE EXTRACTION SUCCESS: ${dateString} -> ${extractedDate.toISOString()}`);
                    break;
                  }
                } catch (dateError) {
                  console.log(`   Failed to parse date: ${match[1]} - ${dateError.message}`);
                }
              }
            }
            
            if (!extractedDate) {
              console.log('   No valid date found in extracted text using fallback patterns');
            }
          }
        }
        
        // 🔧 CRITICAL FIX: Enhanced total amount extraction with comprehensive debug logging
        console.log('💰 EXTRACTING TOTAL AMOUNT FROM PROCESSING RESULT:')
        console.log('   Looking for totalAmount:', processingResult.extractedData?.totalAmount)
        console.log('   Looking for vatData.grandTotal:', processingResult.extractedData?.vatData?.grandTotal)
        console.log('   Full vatData:', processingResult.extractedData?.vatData)
        
        let invoiceTotal = null
        if (processingResult.extractedData?.totalAmount) {
          invoiceTotal = processingResult.extractedData.totalAmount
          console.log(`✅ TOTAL EXTRACTED from totalAmount - €${invoiceTotal}`)
        } else if (processingResult.extractedData?.vatData?.grandTotal) {
          invoiceTotal = processingResult.extractedData.vatData.grandTotal
          console.log(`✅ TOTAL EXTRACTED from vatData.grandTotal - €${invoiceTotal}`)
        } else {
          console.log(`🚨 NO TOTAL AMOUNT FOUND in processing result`)
          console.log('   Available fields in extractedData:', processingResult.extractedData ? Object.keys(processingResult.extractedData) : 'none')
          
          // Try to find any amount-related fields
          if (processingResult.extractedData) {
            const amountFields = Object.keys(processingResult.extractedData).filter(key => 
              key.toLowerCase().includes('total') || 
              key.toLowerCase().includes('amount') || 
              key.toLowerCase().includes('price')
            )
            console.log('   Amount-related fields found:', amountFields)
            amountFields.forEach(field => {
              console.log(`     ${field}:`, processingResult.extractedData[field])
            })
          }
        }
        
        // 🔧 CRITICAL FIX: Handle DocumentFolder creation to prevent foreign key constraint violation
        let documentUpdateData: any = {
          isScanned: true,
          scanResult: processingResult.scanResult,
          ...(invoiceTotal && { invoiceTotal })
        }
        
        // Only add year/month fields if we have valid date and authenticated user
        if (extractedDate && extractedYear && extractedMonth && user) {
          try {
            console.log(`📁 UPLOAD: Creating/updating DocumentFolder for ${extractedYear}/${extractedMonth}`)
            
            // Create or update DocumentFolder to ensure it exists
            await prisma.DocumentFolder.upsert({
              where: {
                userId_year_month: {
                  userId: user.id,
                  year: extractedYear,
                  month: extractedMonth
                }
              },
              create: {
                userId: user.id,
                year: extractedYear,
                month: extractedMonth,
                totalSalesAmount: 0,
                totalPurchaseAmount: 0,
                totalSalesVAT: 0,
                totalPurchaseVAT: 0,
                totalNetVAT: 0,
                documentCount: 0,
                salesDocumentCount: 0,
                purchaseDocumentCount: 0
              },
              update: {
                lastDocumentAt: new Date()
              }
            })
            
            // Now safe to add the foreign key fields
            documentUpdateData.extractedDate = extractedDate
            documentUpdateData.extractedYear = extractedYear
            documentUpdateData.extractedMonth = extractedMonth
            
            console.log(`✅ UPLOAD: DocumentFolder ready, safe to create relationship`)
            
          } catch (folderError) {
            console.error(`🚨 UPLOAD: DocumentFolder creation failed:`, folderError)
            // Save date but not year/month to avoid constraint violation
            documentUpdateData.extractedDate = extractedDate
          }
        } else {
          // For guests or invalid dates, just save the date without folder relationship
          if (extractedDate) {
            documentUpdateData.extractedDate = extractedDate
          }
        }
        
        // Update document with safe error handling
        try {
          await prisma.Document.update({
            where: { id: document.id },
            data: documentUpdateData
          })
          console.log(`✅ UPLOAD: Document update successful`)
        } catch (updateError) {
          console.error(`🚨 UPLOAD: Document update failed:`, updateError)
          
          if (updateError instanceof Error && updateError.message.includes('Foreign key constraint')) {
            console.error(`🚨 UPLOAD: Foreign key constraint - attempting fallback`)
            
            // Fallback: update without foreign key fields
            await prisma.Document.update({
              where: { id: document.id },
              data: {
                isScanned: true,
                scanResult: processingResult.scanResult,
                extractedDate: extractedDate,
                ...(invoiceTotal && { invoiceTotal })
                // Note: no extractedYear/extractedMonth to avoid constraint
              }
            })
            console.log(`✅ UPLOAD: Fallback update successful`)
          } else {
            throw updateError
          }
        }
        
        // 🔧 CRITICAL FIX: Enhanced database save confirmation logging
        console.log(`🎯 DATABASE UPDATE COMPLETE - CONFIRMING DATA SAVED:`)
        console.log(`   Document ID: ${document.id}`)
        console.log(`   isScanned: true`)
        console.log(`   extractedDate: ${extractedDate ? extractedDate.toISOString() : 'null'}`)
        console.log(`   extractedYear: ${extractedYear || 'null'}`)
        console.log(`   extractedMonth: ${extractedMonth || 'null'}`) 
        console.log(`   invoiceTotal: €${invoiceTotal || 'null'}`)
        console.log(`   fileData saved: ${document.fileData ? 'YES' : 'NO'} (${document.fileData ? `${Math.round(document.fileData.length/1024)}KB` : '0KB'})`)
        console.log(`   documentUpdateData sent to database:`, JSON.stringify(documentUpdateData, null, 2))
        
        // Fetch the document back from database to confirm what was actually saved
        try {
          const savedDocument = await prisma.Document.findUnique({
            where: { id: document.id },
            select: { 
              id: true, 
              isScanned: true, 
              extractedDate: true, 
              extractedYear: true, 
              extractedMonth: true, 
              invoiceTotal: true,
              scanResult: true
            }
          })
          console.log(`🔍 VERIFICATION - Document as saved in database:`, JSON.stringify(savedDocument, null, 2))
        } catch (verificationError) {
          console.error(`🚨 Failed to verify saved document:`, verificationError)
        }
        
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
        // 🔧 CRITICAL FIX: Mark as scanned with failure status so it doesn't appear as "Processing"
        await prisma.Document.update({
          where: { id: document.id },
          data: {
            isScanned: true,  // Mark as scanned to prevent "Processing" status
            scanResult: `Processing failed: ${processingResult.error || 'Unknown error'}\n\nThe document could not be processed. This may be due to:\n- Corrupted or invalid file format\n- Unsupported PDF structure\n- Processing timeout\n\nYou can try re-uploading the document or contact support if the issue persists.`,
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
      // 🔧 CRITICAL FIX: Mark as scanned with error status so it doesn't appear as "Processing"
      await prisma.Document.update({
        where: { id: document.id },
        data: {
          isScanned: true,  // Mark as scanned to prevent "Processing" status
          scanResult: `Processing failed: ${docProcessingError instanceof Error ? docProcessingError.message : 'Technical error occurred'}\n\nA technical error prevented the document from being processed.\n\nYou can try re-uploading the document or contact support if the issue persists.`,
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
          
          // Update document with enhanced metadata (save available fields)
          await prisma.Document.update({
            where: { id: document.id },
            data: {
              // Save all available enhanced fields from AI processing
              isScanned: true,
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
    console.error('❌ UPLOAD FAILED - TOP LEVEL EXCEPTION:', error)
    console.error('❌ STACK TRACE:', error instanceof Error ? error.stack : 'No stack trace')
    
    logError('Upload API exception at top level', error, {
      operation: 'file-upload-top-level'
    })
    
    logger.error('File upload error', error, 'UPLOAD_API')
    return NextResponse.json({
      success: false,
      error: 'File upload failed: ' + (error instanceof Error ? error.message : String(error)),
      step: 'TOP_LEVEL_EXCEPTION',
      details: error instanceof Error ? error.stack : String(error)
    }, { status: 500 })
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

// POST handler with step-by-step error logging
export const POST = createGuestFriendlyRoute(async (request: NextRequest, user?: AuthUser) => {
  console.log('🚀 UPLOAD POST CALLED - STEP BY STEP DEBUG')
  
  try {
    console.log('✅ STEP 1: Route handler executing')
    return await uploadFile(request, user)
  } catch (handlerError) {
    console.error('❌ STEP 1 FAILED: Route handler exception:', handlerError)
    return NextResponse.json({
      success: false,
      error: 'Handler error: ' + (handlerError instanceof Error ? handlerError.message : String(handlerError)),
      step: 'ROUTE_HANDLER_EXCEPTION',
      details: handlerError instanceof Error ? handlerError.stack : undefined
    }, { status: 500 })
  }
})