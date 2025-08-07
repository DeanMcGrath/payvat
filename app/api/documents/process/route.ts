import { NextRequest, NextResponse } from 'next/server'
import { createGuestFriendlyRoute } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { processDocument } from '@/lib/documentProcessor'
import { AuthUser } from '@/lib/auth'

interface ProcessDocumentRequest {
  documentId: string
  forceReprocess?: boolean
}

/**
 * POST /api/documents/process - Process a document for VAT extraction
 */
async function processDocumentEndpoint(request: NextRequest, user?: AuthUser) {
  try {
    const body: ProcessDocumentRequest = await request.json()
    const { documentId, forceReprocess = false } = body
    
    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      )
    }
    
    // Find the document and verify ownership (for authenticated users) or allow guest access
    const whereClause: any = { id: documentId }
    if (user) {
      whereClause.userId = user.id
    }
    
    const document = await prisma.document.findFirst({
      where: whereClause
    })
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found or not authorized' },
        { status: 404 }
      )
    }
    
    // Check if already processed (unless force reprocessing)
    if (document.isScanned && document.scanResult && !forceReprocess) {
      return NextResponse.json({
        success: true,
        message: 'Document already processed',
        document: {
          id: document.id,
          isScanned: document.isScanned,
          scanResult: document.scanResult,
          extractedData: document.scanResult.includes('€') ? {
            processed: true,
            hasVATData: true
          } : null
        }
      })
    }
    
    if (!document.fileData) {
      return NextResponse.json(
        { error: 'Document file data not available' },
        { status: 400 }
      )
    }
    
    console.log(`Processing document: ${document.originalName} (${document.category})`)
    
    // Process the document with AI enhancement
    const result = await processDocument(
      document.fileData,
      document.mimeType,
      document.originalName,
      document.category,
      user?.id // Pass user ID for AI usage tracking
    )
    
    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Document processing failed',
          details: result.error
        },
        { status: 500 }
      )
    }
    
    // Update document with processing results
    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: {
        isScanned: true,
        scanResult: result.scanResult,
      }
    })
    
    // Store extracted VAT data in a separate table for easy querying (skip for guests)
    if (user && result.extractedData && (result.extractedData.salesVAT.length > 0 || result.extractedData.purchaseVAT.length > 0)) {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'VAT_DATA_EXTRACTED',
          entityType: 'DOCUMENT',
          entityId: documentId,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          metadata: {
            extractedData: JSON.parse(JSON.stringify(result.extractedData)),
            fileName: document.originalName,
            category: document.category,
            confidence: result.extractedData.confidence,
            timestamp: new Date().toISOString()
          }
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      document: {
        id: updatedDocument.id,
        fileName: updatedDocument.originalName,
        isScanned: updatedDocument.isScanned,
        scanResult: updatedDocument.scanResult,
        category: updatedDocument.category,
        extractedData: result.extractedData
      }
    })
    
  } catch (error) {
    console.error('Document processing API error:', error)
    return NextResponse.json(
      { error: 'Failed to process document' },
      { status: 500 }
    )
  }
}

export const POST = createGuestFriendlyRoute(processDocumentEndpoint)