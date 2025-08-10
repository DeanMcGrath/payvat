import { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { createGuestFriendlyRoute } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { validateFile, processFileForServerless, getDocumentType } from '@/lib/serverlessFileUtils'
import { processDocument } from '@/lib/documentProcessor'
import { AuthUser } from '@/lib/auth'
import { logger } from '@/lib/logger'

async function uploadFile(request: NextRequest, user?: AuthUser) {
  console.log('🚀🚀🚀 UPLOAD API CALLED - STARTING FUNCTION')
  console.log(`   Request method: ${request.method}`)
  console.log(`   Request URL: ${request.url}`)
  console.log(`   User exists: ${!!user}`)
  console.log(`   Timestamp: ${new Date().toISOString()}`)
  
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
    
    console.log('📋 PARSING FORM DATA...')
    const formData = await request.formData()
    console.log('📋 Form data parsed successfully')
    
    const file = formData.get('file') as File
    const category = formData.get('category') as string
    const vatReturnId = formData.get('vatReturnId') as string | null
    
    console.log('📄 FORM DATA EXTRACTED:')
    console.log(`   File exists: ${!!file}`)
    console.log(`   File name: ${file?.name || 'no file'}`)
    console.log(`   File size: ${file?.size || 0} bytes`)
    console.log(`   File type: ${file?.type || 'unknown'}`)
    console.log(`   Category: ${category}`)
    console.log(`   VAT Return ID: ${vatReturnId || 'none'}`)
    
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
    
    // Generate session-based user ID for guests - but we need a valid User record for DB constraint
    let userId: string;
    if (user) {
      userId = user.id;
    } else {
      // For guest uploads, create a minimal guest user record to satisfy foreign key constraint
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
      console.log(`Created guest user for upload: ${userId}`);
    }
    
    // Validate VAT return ownership if provided and user is authenticated
    if (vatReturnId && user) {
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
    }
    
    // Process file for serverless environment
    const processedFile = await processFileForServerless(file, userId)
    
    // Save document metadata to database
    console.log('💾 CREATING DOCUMENT RECORD IN DATABASE...')
    const document = await prisma.document.create({
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
    
    console.log('✅ DOCUMENT RECORD CREATED SUCCESSFULLY')
    console.log(`   Document ID: ${document.id}`)
    console.log(`   Document filename: ${document.fileName}`)
    console.log(`   Now starting automatic processing...`)
    
    // Process document immediately after upload for VAT extraction
    logger.info('Starting document processing', { fileName: processedFile.originalName }, 'UPLOAD_API')
    
    console.log('🔄🔄🔄 UPLOAD API - STARTING DOCUMENT PROCESSING')
    console.log(`📄 File: ${processedFile.originalName}`)
    console.log(`📂 Category: ${category}`)
    console.log(`🔍 MIME: ${processedFile.mimeType}`)
    console.log(`📏 Size: ${Math.round(processedFile.fileData.length / 1024)}KB`)
    console.log(`👤 User: ${userId}`)
    console.log('🚀 Calling processDocument()...')
    
    try {
      processingResult = await processDocument(
        processedFile.fileData,
        processedFile.mimeType,
        processedFile.originalName,
        category
      )
      
      console.log('📥 PROCESSING RESULT RECEIVED:')
      console.log(`✅ Success: ${processingResult.success}`)
      console.log(`📊 IsScanned: ${processingResult.isScanned}`)
      console.log(`📋 ScanResult: ${processingResult.scanResult}`)
      console.log(`🔢 Has ExtractedData: ${!!processingResult.extractedData}`)
      if (processingResult.extractedData) {
        const salesVAT = processingResult.extractedData.salesVAT || []
        const purchaseVAT = processingResult.extractedData.purchaseVAT || []
        console.log(`💰 Sales VAT: [${salesVAT.join(', ')}] (${salesVAT.length} items)`)
        console.log(`💳 Purchase VAT: [${purchaseVAT.join(', ')}] (${purchaseVAT.length} items)`)
        console.log(`🎯 Confidence: ${processingResult.extractedData.confidence}`)
      }
      console.log(`❌ Error: ${processingResult.error || 'none'}`)
      console.log('🔄🔄🔄 PROCESSING COMPLETE - ANALYZING RESULTS...')
      
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
        console.log('🔍 CHECKING IF VAT DATA SHOULD BE LOGGED...')
        console.log(`   ExtractedData exists: ${!!processingResult.extractedData}`)
        console.log(`   Sales VAT count: ${processingResult.extractedData?.salesVAT?.length || 0}`)
        console.log(`   Purchase VAT count: ${processingResult.extractedData?.purchaseVAT?.length || 0}`)
        
        if (processingResult.extractedData && 
            (processingResult.extractedData.salesVAT.length > 0 || 
             processingResult.extractedData.purchaseVAT.length > 0)) {
          
          console.log('🎉 VAT DATA FOUND - CREATING AUDIT LOG!')
          console.log('💾 CREATING VAT AUDIT LOG FOR USER:', userId)
          console.log(`   Document: ${processedFile.originalName}`)
          console.log(`   Sales VAT: [${processingResult.extractedData.salesVAT.join(', ')}]`)
          console.log(`   Purchase VAT: [${processingResult.extractedData.purchaseVAT.join(', ')}]`)
          console.log(`   User Type: ${user ? 'AUTHENTICATED' : 'GUEST'}`)
          console.log(`   This audit log enables VAT extraction API to find the data!`)
          
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
            
            console.log('✅ VAT AUDIT LOG CREATED SUCCESSFULLY')
            console.log('   This should fix "processedDocuments": 0 issue!')
            
          } catch (auditError) {
            console.error('🚨 AUDIT LOG CREATION FAILED:', auditError)
            console.error('   This may cause VAT extraction to fail for this document')
          }
        } else {
          console.log('⚠️ NO VAT DATA FOUND - NO AUDIT LOG CREATED')
          console.log('   This is why "processedDocuments" count will be 0!')
          console.log('ℹ️  NO VAT DATA TO LOG:')
          console.log(`   Has extracted data: ${!!processingResult.extractedData}`)
          console.log(`   Sales VAT count: ${processingResult.extractedData?.salesVAT?.length || 0}`)
          console.log(`   Purchase VAT count: ${processingResult.extractedData?.purchaseVAT?.length || 0}`)
        }
        
        logger.info('Document processing completed', { scanResult: processingResult.scanResult }, 'UPLOAD_API')
      } else {
        console.log('❌❌❌ DOCUMENT PROCESSING FAILED')
        console.log(`   Reason: ${processingResult.error || 'Unknown error'}`)
        console.log(`   ScanResult: ${processingResult.scanResult || 'No scan result'}`)
        console.log('   This document will NOT be counted as processed!')
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
      console.log('🚨🚨🚨 DOCUMENT PROCESSING EXCEPTION CAUGHT')
      console.log(`   Error: ${docProcessingError instanceof Error ? docProcessingError.message : 'Unknown error'}`)
      console.log(`   Stack: ${docProcessingError instanceof Error ? docProcessingError.stack : 'No stack trace'}`)
      console.log('   This document will NOT be counted as processed!')
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
    console.log('📝 CREATING UPLOAD AUDIT LOG FOR USER:', userId)
    console.log(`   User Type: ${user ? 'AUTHENTICATED' : 'GUEST'}`)
    
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
      
      console.log('✅ UPLOAD AUDIT LOG CREATED SUCCESSFULLY')
      
    } catch (uploadAuditError) {
      console.error('🚨 UPLOAD AUDIT LOG CREATION FAILED:', uploadAuditError)
      console.error('   This won\'t prevent upload but may affect audit trail')
    }
    
    // Fetch updated document status
    const updatedDocument = await prisma.document.findUnique({
      where: { id: document.id }
    })

    // 🔑 CRITICAL: Log document ID prominently for debugging
    console.log('🔑🔑🔑 DOCUMENT UPLOADED SUCCESSFULLY 🔑🔑🔑')
    console.log(`🔑 USE THIS DOCUMENT ID FOR DEBUGGING: ${document.id}`)
    console.log(`📄 File: ${document.originalName}`)
    console.log(`📂 Category: ${document.category}`)
    console.log(`🔍 For diagnostic testing, use: /api/debug/prompt-test?documentId=${document.id}&testtype=compare_both`)
    console.log('🔑🔑🔑🔑🔑🔑🔑🔑🔑🔑🔑🔑🔑🔑🔑🔑🔑🔑🔑')

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
        scanResult: updatedDocument?.scanResult
      }
    })
    
  } catch (error) {
    console.log('🚨🚨🚨 UPLOAD API EXCEPTION CAUGHT AT TOP LEVEL')
    console.log(`   Error name: ${error instanceof Error ? error.name : 'Unknown'}`)
    console.log(`   Error message: ${error instanceof Error ? error.message : 'Unknown error'}`)
    console.log(`   Error stack: ${error instanceof Error ? error.stack : 'No stack trace'}`)
    console.log('   This prevents ALL processing!')
    
    logger.error('File upload error', error, 'UPLOAD_API')
    return NextResponse.json(
      { error: 'File upload failed' },
      { status: 500 }
    )
  }
}

export const POST = createGuestFriendlyRoute(uploadFile)