import { NextRequest, NextResponse } from 'next/server'
import { createGuestFriendlyRoute } from '@/lib/middleware'
import { processDocument } from '@/lib/documentProcessor'

/**
 * GET /api/debug/test-pdf-extraction - Test PDF VAT extraction specifically
 */
async function testPDFExtractionEndpoint(request: NextRequest) {
  try {
    console.log('🧪 TESTING PDF VAT EXTRACTION')
    
    // Create a realistic PDF content that pdf-parse can handle
    const pdfContent = [
      '%PDF-1.4',
      '1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj',
      '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj',
      '3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R>>endobj',
      '4 0 obj<</Length 200>>stream',
      'BT',
      '/F1 12 Tf',
      '50 700 Td (VOLKSWAGEN FINANCIAL SERVICES) Tj',
      '0 -20 Td (Invoice Number: VFS-2024-001) Tj',
      '0 -20 Td (Service Price Excl. VAT: EUR 90.85) Tj',
      '0 -20 Td (VAT MIN EUR 1.51) Tj',
      '0 -20 Td (VAT NIL EUR 0.00) Tj', 
      '0 -20 Td (VAT STD23 EUR 109.85) Tj',
      '0 -20 Td (Total Amount VAT: EUR 111.36) Tj',
      '0 -20 Td (Payment Terms: 30 days) Tj',
      'ET',
      'endstream endobj',
      'xref',
      '0 5',
      '0000000000 65535 f',
      '0000000009 00000 n',
      '0000000074 00000 n',
      '0000000120 00000 n',
      '0000000179 00000 n',
      'trailer<</Size 5/Root 1 0 R>>',
      'startxref',
      '400',
      '%%EOF'
    ].join('\\n')
    
    const pdfBase64 = Buffer.from(pdfContent, 'utf-8').toString('base64')
    
    console.log(`📄 Created test PDF: ${pdfContent.length} bytes`)
    console.log(`📄 Base64 size: ${pdfBase64.length} characters`)
    console.log(`📄 Contains "111.36": ${pdfContent.includes('111.36')}`)
    console.log(`📄 Contains "Total Amount VAT": ${pdfContent.includes('Total Amount VAT')}`)
    
    try {
      const result = await processDocument(
        pdfBase64,
        'application/pdf',
        'test-vw-financial.pdf',
        'PURCHASES'
      )
      
      console.log(`📊 PROCESSING RESULT:`)
      console.log(`   Success: ${result.success}`)
      console.log(`   Is Scanned: ${result.isScanned}`)
      console.log(`   Scan Result: ${result.scanResult}`)
      console.log(`   Error: ${result.error || 'none'}`)
      
      if (result.extractedData) {
        const allVAT = [...result.extractedData.salesVAT, ...result.extractedData.purchaseVAT]
        console.log(`   Sales VAT: [${result.extractedData.salesVAT.join(', ')}]`)
        console.log(`   Purchase VAT: [${result.extractedData.purchaseVAT.join(', ')}]`)
        console.log(`   All VAT amounts: [${allVAT.join(', ')}]`)
        console.log(`   Found 111.36: ${allVAT.some(amt => Math.abs(amt - 111.36) < 0.01) ? '✅' : '❌'}`)
        console.log(`   Confidence: ${Math.round((result.extractedData.confidence || 0) * 100)}%`)
      }
      
      return NextResponse.json({
        success: true,
        message: 'PDF extraction test completed',
        result: {
          processingSuccess: result.success,
          isScanned: result.isScanned,
          scanResult: result.scanResult,
          vatAmounts: result.extractedData ? {
            salesVAT: result.extractedData.salesVAT,
            purchaseVAT: result.extractedData.purchaseVAT,
            total: [...result.extractedData.salesVAT, ...result.extractedData.purchaseVAT].length
          } : null,
          found111_36: result.extractedData ? 
            [...result.extractedData.salesVAT, ...result.extractedData.purchaseVAT].some(amt => Math.abs(amt - 111.36) < 0.01) : 
            false,
          confidence: result.extractedData?.confidence || 0,
          error: result.error
        }
      })
      
    } catch (processingError) {
      console.error('🚨 PDF processing failed:', processingError)
      
      return NextResponse.json({
        success: false,
        error: 'PDF processing failed',
        details: processingError instanceof Error ? processingError.message : 'Unknown error'
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('🚨 PDF extraction test failed:', error)
    return NextResponse.json({
      success: false,
      error: 'PDF extraction test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export const GET = createGuestFriendlyRoute(testPDFExtractionEndpoint)