#!/usr/bin/env node
/**
 * End-to-end test of document upload and processing
 */

import fetch from 'node-fetch'
import FormData from 'form-data'

const BASE_URL = 'http://localhost:3000'

async function testEndToEnd() {
  console.log('🧪 END-TO-END DOCUMENT PROCESSING TEST')
  console.log('=' .repeat(50))

  try {
    // Step 1: Create test invoice content
    const testInvoiceContent = `
INVOICE

Invoice Number: TEST-001
Date: 2024-08-08

From: Test Company Ltd
VAT Number: IE1234567T
Address: 123 Test Street, Dublin

To: Customer Company
Address: 456 Customer Road, Cork

Description: Professional Services
Quantity: 1
Unit Price: €100.00
VAT Rate: 23%
VAT Amount: €23.00
Total: €123.00

Payment Terms: 30 days
Thank you for your business.
    `.trim()

    console.log('1️⃣ Creating test document...')
    console.log(`   Content preview: "${testInvoiceContent.substring(0, 100)}..."`);

    // Step 2: Upload the document
    console.log('\n2️⃣ Uploading document...')
    
    const formData = new FormData()
    const buffer = Buffer.from(testInvoiceContent, 'utf-8')
    
    formData.append('file', buffer, {
      filename: 'test-invoice.txt',
      contentType: 'text/plain',
    })
    formData.append('category', 'PURCHASES')
    
    const uploadResponse = await fetch(`${BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData
    })
    
    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`)
    }
    
    const uploadResult = await uploadResponse.json()
    console.log(`   Upload result: ${uploadResult.success ? 'SUCCESS' : 'FAILED'}`)
    
    if (!uploadResult.success) {
      throw new Error(`Upload failed: ${uploadResult.error}`)
    }
    
    const documentId = uploadResult.document.id
    console.log(`   Document ID: ${documentId}`)
    
    // Step 3: Process the document
    console.log('\n3️⃣ Processing document...')
    
    const processResponse = await fetch(`${BASE_URL}/api/documents/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        documentId: documentId,
        forceReprocess: true
      })
    })
    
    if (!processResponse.ok) {
      const errorText = await processResponse.text()
      throw new Error(`Processing failed: ${processResponse.status} ${processResponse.statusText}\n${errorText}`)
    }
    
    const processResult = await processResponse.json()
    console.log(`   Processing result: ${processResult.success ? 'SUCCESS' : 'FAILED'}`)
    console.log(`   Scan result: ${processResult.document?.scanResult || 'No scan result'}`)
    
    // Step 4: Check extracted data
    if (processResult.success && processResult.document?.extractedData) {
      const data = processResult.document.extractedData
      const allVAT = [...(data.salesVAT || []), ...(data.purchaseVAT || [])]
      
      console.log('\n4️⃣ Extracted VAT Data:')
      console.log(`   Sales VAT: €${(data.salesVAT || []).join(', €') || 'none'}`)
      console.log(`   Purchase VAT: €${(data.purchaseVAT || []).join(', €') || 'none'}`)
      console.log(`   Total VAT amounts: ${allVAT.length}`)
      console.log(`   Confidence: ${Math.round((data.confidence || 0) * 100)}%`)
      console.log(`   Document type: ${data.documentType || 'unknown'}`)
      
      // Verify we found the expected €23.00 VAT amount
      const found23 = allVAT.some(amount => Math.abs(amount - 23) < 0.01)
      console.log(`   Found expected €23.00: ${found23 ? '✅ YES' : '❌ NO'}`)
      
      if (found23) {
        console.log('\n🎉 END-TO-END TEST: ✅ PASSED')
        console.log('   Document processed successfully with correct VAT extraction!')
      } else {
        console.log('\n⚠️  END-TO-END TEST: 🟡 PARTIAL SUCCESS')
        console.log('   Document processed but VAT extraction needs improvement')
      }
    } else {
      console.log('\n4️⃣ No extracted data available')
      if (processResult.error) {
        console.log(`   Error: ${processResult.error}`)
      }
      
      console.log('\n❌ END-TO-END TEST: FAILED')
      console.log('   Document processing completed but no VAT data extracted')
    }
    
    // Step 5: Debug information
    if (processResult.debugInfo) {
      console.log('\n5️⃣ Debug Information:')
      console.log(`   AI extracted text available: ${!!processResult.debugInfo.aiExtractedText}`)
      console.log(`   Contains expected content: ${processResult.debugInfo.contains111_36 || 'not checked'}`)
      console.log(`   Processing type: ${processResult.processingInfo?.processingType || 'unknown'}`)
    }
    
  } catch (error) {
    console.error('\n🚨 END-TO-END TEST FAILED:')
    console.error(`   Error: ${error.message}`)
    
    if (error.stack) {
      console.error(`   Stack: ${error.stack.split('\n').slice(0, 3).join('\n')}`)
    }
  }
}

// Check if server is running first
fetch(`${BASE_URL}/api/debug/processing-test`)
  .then(() => {
    console.log('✅ Server is running, starting end-to-end test...\n')
    return testEndToEnd()
  })
  .catch(error => {
    console.error('❌ Server not running or not accessible')
    console.error('   Please make sure the development server is running on localhost:3000')
    console.error(`   Error: ${error.message}`)
  })