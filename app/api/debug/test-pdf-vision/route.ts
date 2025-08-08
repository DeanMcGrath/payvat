import { NextRequest, NextResponse } from 'next/server'
import { createGuestFriendlyRoute } from '@/lib/middleware'
import { openai, AI_CONFIG, isAIEnabled } from '@/lib/ai/openai'

/**
 * GET /api/debug/test-pdf-vision - Test if OpenAI Vision API accepts PDFs
 */
async function testPDFVisionEndpoint(request: NextRequest) {
  try {
    if (!isAIEnabled()) {
      return NextResponse.json({
        success: false,
        error: 'OpenAI API not configured'
      }, { status: 400 })
    }
    
    console.log('🧪 TESTING PDF VISION API COMPATIBILITY')
    
    // Create a minimal PDF for testing
    const minimalPDFContent = [
      '%PDF-1.4',
      '1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj',  
      '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj',
      '3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R>>endobj',
      '4 0 obj<</Length 44>>stream',
      'BT /F1 12 Tf 100 700 Td (VAT Amount: €111.36) Tj ET',
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
      '244',
      '%%EOF'
    ].join('\\n')
    
    const pdfBase64 = Buffer.from(minimalPDFContent, 'utf-8').toString('base64')
    
    const testResults: any = {
      timestamp: new Date().toISOString(),
      pdfSize: minimalPDFContent.length,
      pdfBase64Size: pdfBase64.length,
      tests: []
    }
    
    // Test 1: Direct PDF with Vision API
    console.log('1️⃣ Testing direct PDF with Vision API...')
    try {
      const response = await openai.chat.completions.create({
        model: AI_CONFIG.models.vision,
        max_tokens: 200,
        temperature: 0.1,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract the VAT amount from this PDF document. Return just the euro amount."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:application/pdf;base64,${pdfBase64}`,
                  detail: "low"
                }
              }
            ]
          }
        ]
      })
      
      const content = response.choices[0]?.message?.content || 'No response'
      
      testResults.tests.push({
        name: 'Direct PDF Vision API',
        success: true,
        details: {
          responseLength: content.length,
          response: content,
          tokensUsed: response.usage?.total_tokens || 0,
          model: response.model,
          contains111_36: content.includes('111.36'),
          finishReason: response.choices[0]?.finish_reason
        }
      })
      
      console.log(`   ✅ SUCCESS: PDF accepted by Vision API`)
      console.log(`   Response: "${content.substring(0, 100)}..."`)
      
    } catch (pdfError) {
      console.log(`   ❌ FAILED: ${(pdfError as Error).message}`)
      testResults.tests.push({
        name: 'Direct PDF Vision API',
        success: false,
        error: pdfError instanceof Error ? pdfError.message : String(pdfError),
        errorType: pdfError instanceof Error ? pdfError.constructor.name : 'Unknown'
      })
    }
    
    // Test 2: Try treating PDF as image/png (workaround)
    console.log('\\n2️⃣ Testing PDF with image/png MIME type...')
    try {
      const response = await openai.chat.completions.create({
        model: AI_CONFIG.models.vision,
        max_tokens: 200,
        temperature: 0.1,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract VAT information from this document."
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/png;base64,${pdfBase64}`,
                  detail: "low"
                }
              }
            ]
          }
        ]
      })
      
      const content = response.choices[0]?.message?.content || 'No response'
      
      testResults.tests.push({
        name: 'PDF as PNG MIME type',
        success: true,
        details: {
          responseLength: content.length,
          response: content,
          tokensUsed: response.usage?.total_tokens || 0
        }
      })
      
      console.log(`   ✅ SUCCESS: PDF accepted as PNG`)
      console.log(`   Response: "${content.substring(0, 100)}..."`)
      
    } catch (pngError) {
      console.log(`   ❌ FAILED: ${(pngError as Error).message}`)
      testResults.tests.push({
        name: 'PDF as PNG MIME type',
        success: false,
        error: pngError instanceof Error ? pngError.message : String(pngError)
      })
    }
    
    // Summary
    const successfulTests = testResults.tests.filter((test: any) => test.success).length
    const totalTests = testResults.tests.length
    
    testResults.summary = {
      totalTests,
      successfulTests,
      pdfDirectlySupported: testResults.tests[0]?.success || false,
      pdfAsImageWorkaround: testResults.tests[1]?.success || false,
      recommendation: ''
    }
    
    if (testResults.summary.pdfDirectlySupported) {
      testResults.summary.recommendation = 'PDFs can be sent directly to Vision API'
    } else if (testResults.summary.pdfAsImageWorkaround) {
      testResults.summary.recommendation = 'PDFs should be sent with image/png MIME type'
    } else {
      testResults.summary.recommendation = 'PDFs require conversion to images before Vision API'
    }
    
    console.log(`\\n🎯 PDF VISION TEST RESULTS: ${successfulTests}/${totalTests} passed`)
    console.log(`   Recommendation: ${testResults.summary.recommendation}`)
    
    return NextResponse.json({
      success: true,
      message: 'PDF Vision API compatibility test completed',
      results: testResults
    })
    
  } catch (error) {
    console.error('🚨 PDF Vision test failed:', error)
    return NextResponse.json({
      success: false,
      error: 'PDF Vision test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export const GET = createGuestFriendlyRoute(testPDFVisionEndpoint)