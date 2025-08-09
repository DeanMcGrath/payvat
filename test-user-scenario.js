/**
 * Simulate the exact user scenario:
 * 1. User uploads "test invoice.pdf" 
 * 2. System processes it
 * 3. User checks extracted VAT data
 * 4. Verify they see VAT amounts instead of €0
 */

async function simulateUserScenario() {
  try {
    console.log('🧪 SIMULATING EXACT USER SCENARIO')
    console.log('=' .repeat(60))
    console.log('Testing: User uploads PDF → Should see VAT amounts (not €0)')
    console.log()
    
    // Step 1: Upload PDF with name similar to user's "test invoice.pdf"
    console.log('1️⃣ USER UPLOADS "test invoice.pdf"...')
    
    // Create a realistic PDF with VAT content
    const realInvoicePDF = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 400
>>
stream
BT
/F1 12 Tf
50 700 Td
(INVOICE) Tj
0 -20 Td
(Date: 2024-08-09) Tj
0 -30 Td
(Services Provided:) Tj
0 -20 Td
(Consulting Services) Tj
0 -30 Td
(VAT BREAKDOWN:) Tj
0 -20 Td
(Net Amount: €90.85) Tj
0 -15 Td
(VAT Rate: 23%) Tj
0 -15 Td
(VAT Amount: €20.90) Tj
0 -15 Td
(Total Amount VAT: €111.36) Tj
0 -30 Td
(Total Due: €312.06) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000074 00000 n
0000000120 00000 n
0000000268 00000 n
trailer
<< /Size 5 /Root 1 0 R >>
startxref
720
%%EOF`
    
    const formData = new FormData()
    const pdfBlob = new Blob([realInvoicePDF], { type: 'application/pdf' })
    formData.append('file', pdfBlob, 'test invoice.pdf') // Exact name user used
    formData.append('category', 'PURCHASE_INVOICE')
    
    const uploadResponse = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    })
    
    console.log(`   Upload Status: ${uploadResponse.status} ${uploadResponse.statusText}`)
    
    if (uploadResponse.status === 500) {
      console.log('   🚨 CRITICAL: Still getting 500 errors!')
      const errorText = await uploadResponse.text()
      console.log(`   Error: ${errorText}`)
      return
    }
    
    if (!uploadResponse.ok) {
      console.log('   ❌ Upload failed (non-500 error)')
      const errorText = await uploadResponse.text()
      console.log(`   Error: ${errorText}`)
      return
    }
    
    const uploadResult = await uploadResponse.json()
    console.log('   ✅ Upload succeeded!')
    console.log(`   Document ID: ${uploadResult.document?.id}`)
    console.log(`   Filename: ${uploadResult.document?.fileName}`)
    console.log(`   Processing Status: ${uploadResult.document?.isScanned ? 'Processed' : 'Failed'}`)
    console.log(`   Scan Result: ${uploadResult.document?.scanResult}`)
    
    // Step 2: Wait for processing to complete (as frontend does)
    console.log('\n2️⃣ WAITING FOR PROCESSING (as frontend does)...')
    await new Promise(resolve => setTimeout(resolve, 5000)) // 5 second wait like frontend
    
    // Step 3: Check extracted VAT data (exactly what frontend calls)
    console.log('\n3️⃣ FRONTEND CALLS EXTRACTED VAT API...')
    
    const extractedResponse = await fetch('http://localhost:3000/api/documents/extracted-vat')
    console.log(`   API Status: ${extractedResponse.status} ${extractedResponse.statusText}`)
    
    if (!extractedResponse.ok) {
      console.log('   ❌ Extracted VAT API failed!')
      return
    }
    
    const extractedResult = await extractedResponse.json()
    
    // Step 4: Display results exactly as frontend would
    console.log('\n4️⃣ FRONTEND DISPLAYS RESULTS:')
    console.log('   ' + '=' .repeat(40))
    console.log(`   💰 Total Sales VAT: €${extractedResult.extractedVAT.totalSalesVAT}`)
    console.log(`   💰 Total Purchase VAT: €${extractedResult.extractedVAT.totalPurchaseVAT}`)
    console.log(`   💰 Net VAT: €${extractedResult.extractedVAT.totalNetVAT}`)
    console.log(`   📊 Confidence: ${Math.round(extractedResult.extractedVAT.averageConfidence * 100)}%`)
    console.log(`   📄 Documents processed: ${extractedResult.extractedVAT.processedDocuments}`)
    console.log('   ' + '=' .repeat(40))
    
    // Step 5: Validate success
    console.log('\n🎯 VALIDATION:')
    
    const hasDocuments = extractedResult.extractedVAT.documentCount > 0
    const hasProcessedDocs = extractedResult.extractedVAT.processedDocuments > 0
    const hasVATAmounts = extractedResult.extractedVAT.totalPurchaseVAT > 0 || extractedResult.extractedVAT.totalSalesVAT > 0
    const noErrors = extractedResponse.status === 200 && uploadResponse.status === 200
    
    console.log(`   Documents found: ${hasDocuments ? '✅' : '❌'} (${extractedResult.extractedVAT.documentCount})`)
    console.log(`   Documents processed: ${hasProcessedDocs ? '✅' : '❌'} (${extractedResult.extractedVAT.processedDocuments})`)
    console.log(`   VAT amounts > €0: ${hasVATAmounts ? '✅' : '❌'} (Total: €${extractedResult.extractedVAT.totalPurchaseVAT + extractedResult.extractedVAT.totalSalesVAT})`)
    console.log(`   No 500 errors: ${noErrors ? '✅' : '❌'}`)
    
    const userComplaintResolved = hasDocuments && hasProcessedDocs && hasVATAmounts && noErrors
    
    console.log('\n🏆 FINAL RESULT:')
    if (userComplaintResolved) {
      console.log('   🎉 USER COMPLAINT FULLY RESOLVED!')
      console.log('   ✅ User now sees VAT amounts instead of €0')
      console.log('   ✅ No more 500 errors blocking uploads')
      console.log('   ✅ System ready for tax filing')
    } else {
      console.log('   🚨 User complaint NOT fully resolved')
      console.log('   Issues remaining:')
      if (!hasDocuments) console.log('   - Documents not being stored')
      if (!hasProcessedDocs) console.log('   - Documents not being processed')
      if (!hasVATAmounts) console.log('   - Still showing €0 instead of VAT amounts')
      if (!noErrors) console.log('   - Still getting 500 errors')
    }
    
  } catch (error) {
    console.error('\n🚨 USER SCENARIO TEST ERROR:', error)
  }
}

// Run the simulation
console.log('🚀 Starting User Scenario Simulation...')
console.log(`🕒 Time: ${new Date().toISOString()}`)
console.log('🎯 Goal: Reproduce and verify resolution of user\'s exact complaint')
console.log()

simulateUserScenario()
  .then(() => {
    console.log('\n' + '=' .repeat(60))
    console.log('✅ USER SCENARIO SIMULATION COMPLETED')
    console.log('=' .repeat(60))
  })
  .catch(error => {
    console.error('🚨 SIMULATION FAILED:', error)
  })