import { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { createProtectedRoute } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { validateFile, processFileForServerless, getDocumentType } from '@/lib/serverlessFileUtils'
import { AuthUser } from '@/lib/auth'

async function uploadFile(request: NextRequest, user: AuthUser) {
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
    
    // Validate VAT return ownership if provided
    if (vatReturnId) {
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
    const processedFile = await processFileForServerless(file, user.id)
    
    // Save document metadata to database
    const document = await prisma.document.create({
      data: {
        userId: user.id,
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
        isScanned: false, // Will be updated by virus scanning service
      }
    })
    
    // Create audit log
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
    
    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        fileName: document.originalName,
        fileSize: document.fileSize,
        category: document.category,
        uploadedAt: document.uploadedAt,
        isScanned: document.isScanned
      }
    })
    
  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json(
      { error: 'File upload failed' },
      { status: 500 }
    )
  }
}

export const POST = createProtectedRoute(uploadFile)