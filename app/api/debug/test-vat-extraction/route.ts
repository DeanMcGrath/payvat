import { NextRequest, NextResponse } from 'next/server'
import { createGuestFriendlyRoute } from '@/lib/middleware'
import { processDocument } from '@/lib/documentProcessor'
import { openai, AI_CONFIG, isAIEnabled } from '@/lib/ai/openai'

/**
 * GET /api/debug/test-vat-extraction - Test VAT extraction with sample documents
 */
async function testVATExtractionEndpoint(request: NextRequest) {
  try {
    console.log('🧪 TESTING VAT EXTRACTION WITH SAMPLE DOCUMENTS')
    
    const testResults: any = {
      timestamp: new Date().toISOString(),
      tests: []
    }
    
    // Test 1: Simple text document with clear VAT
    console.log('1️⃣ Testing simple text document...')
    const simpleInvoice = `
INVOICE

Invoice Number: TEST-001
Date: 2024-08-08

Business: Test Company Ltd
VAT Number: IE1234567T

Item: Professional Services
Subtotal: €100.00
VAT @ 23%: €23.00
Total: €123.00

VAT Amount: €23.00
    `.trim()
    
    try {
      const simpleFileData = Buffer.from(simpleInvoice, 'utf-8').toString('base64')
      const simpleResult = await processDocument(
        simpleFileData,
        'text/plain',
        'simple-test.txt',
        'PURCHASES'
      )
      
      const simpleTest: any = {
        name: 'Simple Text Invoice',
        success: simpleResult.success,
        details: {
          isScanned: simpleResult.isScanned,
          scanResult: simpleResult.scanResult,
          hasExtractedData: !!simpleResult.extractedData,
          salesVAT: simpleResult.extractedData?.salesVAT || [],
          purchaseVAT: simpleResult.extractedData?.purchaseVAT || [],
          confidence: simpleResult.extractedData?.confidence || 0,
          error: simpleResult.error
        }
      }
      
      // Check if we found the expected €23.00
      const allVAT = [...simpleTest.details.salesVAT, ...simpleTest.details.purchaseVAT]
      const found23 = allVAT.some(amount => Math.abs(amount - 23) < 0.01)
      simpleTest.details.foundExpected23 = found23
      
      console.log(`   Result: ${simpleResult.success ? 'SUCCESS' : 'FAILED'}`)
      console.log(`   Found €23.00: ${found23 ? '✅' : '❌'}`)
      console.log(`   All VAT amounts: €${allVAT.join(', €') || 'none'}`)
      
      testResults.tests.push(simpleTest)
      
    } catch (simpleError) {
      testResults.tests.push({
        name: 'Simple Text Invoice',
        success: false,
        error: simpleError instanceof Error ? simpleError.message : String(simpleError)
      })
    }
    
    // Test 2: VW-style invoice with complex VAT breakdown
    console.log('\\n2️⃣ Testing VW-style invoice...')
    const vwInvoice = `
VOLKSWAGEN FINANCIAL SERVICES INVOICE

Invoice Number: VFS-001-2024  
Date: 2024-08-08

From: Volkswagen Financial Services
VAT Number: IE1234567T
Address: Dublin, Ireland

Service Details:
Service Price Excl. VAT: €90.85
Service Price Incl. VAT: €111.73

VAT Breakdown:
VAT MIN    €1.51
VAT NIL    €0.00  
VAT STD23  €109.85
Total Amount VAT: €111.36

Payment Due: €111.73
Payment Terms: 30 days
    `.trim()
    
    try {
      const vwFileData = Buffer.from(vwInvoice, 'utf-8').toString('base64')
      const vwResult = await processDocument(
        vwFileData,
        'text/plain',
        'vw-test.txt',
        'PURCHASES'
      )
      
      const vwTest: any = {
        name: 'VW Financial Invoice',
        success: vwResult.success,
        details: {
          isScanned: vwResult.isScanned,
          scanResult: vwResult.scanResult,
          hasExtractedData: !!vwResult.extractedData,
          salesVAT: vwResult.extractedData?.salesVAT || [],
          purchaseVAT: vwResult.extractedData?.purchaseVAT || [],
          confidence: vwResult.extractedData?.confidence || 0,
          error: vwResult.error
        }
      }
      
      // Check if we found the expected €111.36
      const allVAT = [...vwTest.details.salesVAT, ...vwTest.details.purchaseVAT]
      const found111_36 = allVAT.some(amount => Math.abs(amount - 111.36) < 0.01)
      vwTest.details.foundExpected111_36 = found111_36
      
      console.log(`   Result: ${vwResult.success ? 'SUCCESS' : 'FAILED'}`)
      console.log(`   Found €111.36: ${found111_36 ? '✅' : '❌'}`)
      console.log(`   All VAT amounts: €${allVAT.join(', €') || 'none'}`)
      
      testResults.tests.push(vwTest)
      
    } catch (vwError) {
      testResults.tests.push({
        name: 'VW Financial Invoice',
        success: false,
        error: vwError instanceof Error ? vwError.message : String(vwError)
      })
    }
    
    // Test 3: Direct OpenAI API test (if available)
    if (isAIEnabled()) {
      console.log('\\n3️⃣ Testing direct OpenAI Vision API...')
      
      try {
        // Create a simple test image data (base64 encoded text as if it were an image)
        const testPrompt = "Extract VAT information from this document. Look for VAT amounts and return them as JSON: {vatAmount: number, confidence: number}"
        
        const directAPIResponse = await openai.chat.completions.create({
          model: AI_CONFIG.models.vision,
          max_tokens: 500,
          temperature: 0.1,
          messages: [
            {
              role: "user", 
              content: [
                {
                  type: "text",
                  text: testPrompt
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:text/plain;base64,${Buffer.from(vwInvoice, 'utf-8').toString('base64')}`,
                    detail: "low" // Use low detail for text
                  }
                }
              ]
            }
          ]
        })
        
        const aiContent = directAPIResponse.choices[0]?.message?.content || 'No response'
        
        const directTest: any = {
          name: 'Direct OpenAI Vision API',
          success: true,
          details: {
            responseLength: aiContent.length,
            response: aiContent,
            tokensUsed: directAPIResponse.usage?.total_tokens || 0,
            model: directAPIResponse.model,
            contains111_36: aiContent.includes('111.36'),
            containsVAT: aiContent.toLowerCase().includes('vat'),
            containsJSON: aiContent.includes('{') && aiContent.includes('}')
          }
        }
        
        console.log(`   Response length: ${aiContent.length} chars`)
        console.log(`   Contains 111.36: ${directTest.details.contains111_36 ? '✅' : '❌'}`)
        console.log(`   Response preview: "${aiContent.substring(0, 200)}..."`)
        
        testResults.tests.push(directTest)
        
      } catch (apiError) {
        testResults.tests.push({
          name: 'Direct OpenAI Vision API',
          success: false,
          error: apiError instanceof Error ? apiError.message : String(apiError)
        })
      }
    }
    
    // Summary
    const successfulTests = testResults.tests.filter((test: any) => test.success).length
    const totalTests = testResults.tests.length
    
    testResults.summary = {
      totalTests,
      successfulTests,
      failedTests: totalTests - successfulTests,
      overallSuccess: successfulTests === totalTests,
      completionRate: `${successfulTests}/${totalTests} (${Math.round((successfulTests/totalTests) * 100)}%)`
    }
    
    console.log(`\\n🎯 VAT EXTRACTION TEST RESULTS: ${testResults.summary.completionRate}`)
    
    return NextResponse.json({
      success: true,
      message: 'VAT extraction testing completed',
      results: testResults
    })
    
  } catch (error) {
    console.error('🚨 VAT extraction test failed:', error)
    return NextResponse.json({
      success: false,
      error: 'VAT extraction test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export const GET = createGuestFriendlyRoute(testVATExtractionEndpoint)