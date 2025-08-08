#!/usr/bin/env node
/**
 * Test script to verify document processing is working
 */

import { processDocument } from './lib/documentProcessor.js'
import { isAIEnabled } from './lib/ai/openai.js'

async function testDocumentProcessing() {
  console.log('🧪 TESTING DOCUMENT PROCESSING')
  console.log('=' .repeat(50))
  
  // Test 1: Check if AI is enabled
  console.log('1. Testing AI availability...')
  const aiEnabled = isAIEnabled()
  console.log(`   AI enabled: ${aiEnabled}`)
  
  if (!aiEnabled) {
    console.log('   ❌ AI not available - check OPENAI_API_KEY')
    return
  }
  
  // Test 2: Test simple text document
  console.log('\n2. Testing simple text document...')
  const testDocument = Buffer.from(`
    INVOICE
    Invoice Number: TEST-001
    Date: 2024-08-08
    
    Business Name: Test Company Ltd
    VAT Number: IE1234567T
    
    Item: Professional Services
    Subtotal: €100.00
    VAT @ 23%: €23.00  
    Total: €123.00
    
    Total Amount VAT: €23.00
  `).toString('base64')
  
  try {
    const result = await processDocument(
      testDocument,
      'text/plain',
      'test-invoice.txt',
      'PURCHASES'
    )
    
    console.log('   Processing result:')
    console.log(`     Success: ${result.success}`)
    console.log(`     Scanned: ${result.isScanned}`)
    console.log(`     Scan result: ${result.scanResult}`)
    
    if (result.extractedData) {
      const allVAT = [...result.extractedData.salesVAT, ...result.extractedData.purchaseVAT]
      console.log(`     VAT amounts found: €${allVAT.join(', €')}`)
      console.log(`     Confidence: ${Math.round((result.extractedData.confidence || 0) * 100)}%`)
    }
    
    if (result.error) {
      console.log(`     Error: ${result.error}`)
    }
    
    // Determine if test passed
    const testPassed = result.success && result.extractedData && 
                      (result.extractedData.salesVAT.length > 0 || result.extractedData.purchaseVAT.length > 0)
    
    console.log(`   Test result: ${testPassed ? '✅ PASSED' : '❌ FAILED'}`)
    
  } catch (error) {
    console.log(`   ❌ Test failed with error: ${error.message}`)
  }
  
  console.log('\n🎯 Test complete!')
  console.log('If basic functionality works, documents should now process correctly.')
}

testDocumentProcessing().catch(console.error)