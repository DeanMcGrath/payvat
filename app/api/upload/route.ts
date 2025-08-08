import { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { createGuestFriendlyRoute } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { validateFile, processFileForServerless, getDocumentType } from '@/lib/serverlessFileUtils'
import { processDocument } from '@/lib/documentProcessor'
import { AuthUser } from '@/lib/auth'
import { logger } from '@/lib/logger'

async function uploadFile(request: NextRequest, user?: AuthUser) {
  try {
    // Check if request has multipart form data
    const contentType = request.headers.get('content-type')
    if (!contentType?.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Content-Type must be multipart/form-data' },
        { status: 400 }
      )
    }
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const category = formData.get('category') as string
    const vatReturnId = formData.get('vatReturnId') as string | null
    
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
    
    // Generate session-based user ID for guests
    const userId = user?.id || `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
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
    
    // Process document immediately after upload for VAT extraction
    logger.info('Starting document processing', { fileName: processedFile.originalName }, 'UPLOAD_API')
    
    try {
      const processingResult = await processDocument(
        processedFile.fileData,
        processedFile.mimeType,
        processedFile.originalName,
        category
      )
      
      if (processingResult.success) {
        // Update document with processing results
        await prisma.document.update({
          where: { id: document.id },
          data: {
            isScanned: true,
            scanResult: processingResult.scanResult,
          }
        })
        
        // Log extracted VAT data for audit trail (skip for guests)
        if (user && processingResult.extractedData && 
            (processingResult.extractedData.salesVAT.length > 0 || 
             processingResult.extractedData.purchaseVAT.length > 0)) {
          await prisma.auditLog.create({
            data: {
              userId: user.id,
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
                timestamp: new Date().toISOString()
              }
            }
          })
        }
        
        logger.info('Document processing completed', { scanResult: processingResult.scanResult }, 'UPLOAD_API')
      } else {
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
    } catch (processingError) {
      logger.error('Document processing error', processingError, 'UPLOAD_API')
      // Update with error status
      await prisma.document.update({
        where: { id: document.id },
        data: {
          isScanned: false,
          scanResult: 'Processing failed due to technical error',
        }
      })
    }
    
    // Create audit log (skip for guests)
    if (user) {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
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
            timestamp: new Date().toISOString()
          }
        }
      })
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
        instruction: "🔑 Copy the documentId above to use in diagnostic testing"
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
    logger.error('File upload error', error, 'UPLOAD_API')
    return NextResponse.json(
      { error: 'File upload failed' },
      { status: 500 }
    )
  }
}

export const POST = createGuestFriendlyRoute(uploadFile)