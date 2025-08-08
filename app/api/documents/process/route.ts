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
    
    // IMMEDIATE OPENAI API STATUS CHECK - Show status to user via console and response
    console.log('🔍 PRE-PROCESSING: Checking OpenAI API status...')
    const openAIStatus: any = {
      apiKeyConfigured: false,
      apiKeyFormat: 'invalid',
      apiEnabled: false,
      connectivityTest: null
    }
    
    try {
      // Quick API status check
      openAIStatus.apiKeyConfigured = !!process.env.OPENAI_API_KEY
      openAIStatus.apiKeyFormat = process.env.OPENAI_API_KEY?.startsWith('sk-') ? 'valid-format' : 'invalid-format'
      
      // Import diagnostics and run quick connectivity test
      const { isAIEnabled } = await import('@/lib/ai/openai')
      const { quickConnectivityTest } = await import('@/lib/ai/diagnostics')
      openAIStatus.apiEnabled = isAIEnabled()
      
      if (openAIStatus.apiEnabled) {
        console.log('✅ OpenAI API key configured, testing connectivity...')
        const connectivityResult = await quickConnectivityTest()
        openAIStatus.connectivityTest = {
          success: connectivityResult.success,
          message: connectivityResult.message,
          error: connectivityResult.error
        }
        
        if (connectivityResult.success) {
          console.log('✅ OpenAI API connectivity confirmed')
        } else {
          console.error('🚨 OpenAI API connectivity failed:', connectivityResult.error)
        }
      } else {
        console.log('⚠️ OpenAI API not enabled (missing or invalid API key)')
      }
    } catch (statusError) {
      console.error('⚠️ Failed to check OpenAI API status:', statusError)
      openAIStatus.connectivityTest = {
        success: false,
        message: 'Status check failed',
        error: statusError instanceof Error ? statusError.message : 'Unknown error'
      }
    }
    
    console.log('🤖 OpenAI API Status Summary:', openAIStatus)
    
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
      },
      // Include OpenAI API status for debugging
      openAIStatus: openAIStatus,
      processingInfo: {
        timestamp: new Date().toISOString(),
        processingType: result.scanResult.includes('AI') ? 'AI_ENHANCED' : 'LEGACY',
        hasAPIConnectivity: openAIStatus.connectivityTest?.success || false
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