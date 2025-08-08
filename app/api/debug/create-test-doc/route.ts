import { NextRequest, NextResponse } from 'next/server'
import { createGuestFriendlyRoute } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/debug/create-test-doc - Create a test document for debugging
 */
async function createTestDocEndpoint(request: NextRequest) {
  try {
    console.log('🧪 Creating test document for VAT extraction debugging...')
    
    // Create test invoice content with clear VAT amounts
    const testInvoiceContent = `
VOLKSWAGEN FINANCIAL SERVICES INVOICE

Invoice Number: VFS-001-2024
Date: 2024-08-08

From: Volkswagen Financial Services
VAT Number: IE1234567T
Address: Dublin, Ireland

To: Test Customer
Address: Cork, Ireland

Service Details:
Service Price Excl. VAT: €90.85
Service Price Incl. VAT: €111.73

VAT Breakdown:
VAT MIN    €1.51
VAT NIL    €0.00  
VAT STD23  €109.85
Total Amount VAT: €111.36

Payment Terms: 30 days
Thank you for your business.
    `.trim()

    // Convert to base64
    const fileData = Buffer.from(testInvoiceContent, 'utf-8').toString('base64')
    const fileBuffer = Buffer.from(testInvoiceContent, 'utf-8')
    
    // Generate a simple hash for the test file
    const crypto = await import('crypto')
    const fileHash = crypto.createHash('md5').update(fileBuffer).digest('hex')
    
    // Create document record in database - use a test user ID
    const document = await prisma.document.create({
      data: {
        userId: 'test-user-debug', // Use a placeholder for debugging
        fileName: 'test-vw-invoice.txt',
        originalName: 'test-vw-invoice.txt',
        filePath: '/debug/test-vw-invoice.txt',
        fileSize: fileBuffer.length,
        mimeType: 'text/plain',
        fileHash: fileHash,
        documentType: 'INVOICE',
        category: 'PURCHASES',
        isScanned: false,
        scanResult: 'Test document - not yet processed',
        fileData: fileData,
      }
    })
    
    console.log(`✅ Test document created: ${document.id}`)
    console.log(`   File: ${document.originalName}`)
    console.log(`   Type: ${document.mimeType}`)
    console.log(`   Size: ${fileData.length} chars (base64)`)
    console.log(`   Content contains "111.36": ${testInvoiceContent.includes('111.36')}`)
    console.log(`   Content contains "Total Amount VAT": ${testInvoiceContent.includes('Total Amount VAT')}`)
    
    return NextResponse.json({
      success: true,
      message: 'Test document created successfully',
      document: {
        id: document.id,
        fileName: document.originalName,
        mimeType: document.mimeType,
        category: document.category,
        fileSizeKB: Math.round(fileData.length / 1024),
        debugInfo: {
          contains111_36: testInvoiceContent.includes('111.36'),
          containsVAT: testInvoiceContent.includes('VAT'),
          containsTotalAmountVAT: testInvoiceContent.includes('Total Amount VAT'),
          testEndpoints: {
            processDocument: `/api/documents/process`,
            debugAIResponse: `/api/debug/ai-response?documentId=${document.id}&promptType=simple`,
            debugAIResponseClean: `/api/debug/ai-response?documentId=${document.id}&promptType=clean`,
            debugAIResponseComplex: `/api/debug/ai-response?documentId=${document.id}&promptType=current`
          }
        }
      }
    })
    
  } catch (error) {
    console.error('Failed to create test document:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create test document',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export const POST = createGuestFriendlyRoute(createTestDocEndpoint)