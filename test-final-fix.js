/**
 * Test the final fix for PDF emergency fallback VAT extraction
 */

async function testFinalFix() {
  try {
    console.log('🧪 TESTING FINAL PDF EMERGENCY FALLBACK FIX')
    console.log('=' .repeat(60))
    
    // Create a PDF that will trigger emergency fallback
    const finalTestPDF = `%PDF-1.4
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
(FINAL FIX TEST INVOICE) Tj
0 -25 Td
(Date: 2024-08-09) Tj
0 -25 Td
(Customer: Test User Final) Tj
0 -30 Td
(BILLING DETAILS:) Tj
0 -20 Td
(Service Fee: €200.00) Tj
0 -20 Td
(VAT (23%): €46.00) Tj
0 -15 Td
(Additional VAT: €65.36) Tj
0 -15 Td
(Total Amount VAT: €111.36) Tj
0 -25 Td
(GRAND TOTAL: €357.36) Tj
0 -30 Td
(Payment due within 30 days) Tj
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

    console.log('1️⃣ UPLOADING FINAL TEST PDF...')
    console.log('   Contains: Total Amount VAT: €111.36')
    console.log('   Expected: Emergency fallback extracts data AND shows in scan result')
    
    const formData = new FormData()
    const pdfBlob = new Blob([finalTestPDF], { type: 'application/pdf' })
    formData.append('file', pdfBlob, 'final-fix-test.pdf')
    formData.append('category', 'PURCHASE_INVOICE')
    
    const uploadResponse = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    })
    
    console.log(`   Upload Status: ${uploadResponse.status} ${uploadResponse.statusText}`)
    
    if (!uploadResponse.ok) {
      console.log('   ❌ Upload failed')
      const errorText = await uploadResponse.text()
      console.log(`   Error: ${errorText}`)
      return
    }
    
    const uploadResult = await uploadResponse.json()
    console.log('   ✅ Upload succeeded!')
    console.log(`   Document ID: ${uploadResult.document?.id}`)
    console.log(`   Processing Status: ${uploadResult.document?.isScanned}`)
    console.log(`   Scan Result: ${uploadResult.document?.scanResult}`)
    
    // Wait for processing
    console.log('\n2️⃣ WAITING FOR PROCESSING TO COMPLETE...')
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    // Check extracted VAT API
    console.log('\n3️⃣ CHECKING EXTRACTED VAT API RESPONSE...')
    const vatResponse = await fetch('http://localhost:3000/api/documents/extracted-vat')
    
    if (!vatResponse.ok) {
      console.log('   ❌ Extracted VAT API failed')
      return
    }
    
    const vatResult = await vatResponse.json()
    
    console.log('📊 CURRENT API STATE:')
    console.log(`   Total Purchase VAT: €${vatResult.extractedVAT.totalPurchaseVAT}`)
    console.log(`   Document Count: ${vatResult.extractedVAT.documentCount}`)
    console.log(`   Processed Documents: ${vatResult.extractedVAT.processedDocuments}`)
    console.log(`   Purchase Documents: ${vatResult.extractedVAT.purchaseDocuments?.length || 0}`)
    
    // Look for our final test document
    const finalDoc = vatResult.extractedVAT.purchaseDocuments?.find(doc => 
      doc.fileName === 'final-fix-test.pdf'
    )
    
    console.log('\n🎯 FINAL FIX TEST RESULTS:')
    
    if (finalDoc) {
      console.log(`   ✅ Document found: ${finalDoc.fileName}`)
      console.log(`   💰 Extracted amounts: €${finalDoc.extractedAmounts.join(', €')}`)
      console.log(`   📊 Confidence: ${Math.round(finalDoc.confidence * 100)}%`)
      console.log(`   📝 Scan result: ${finalDoc.scanResult}`)
      
      const hasCorrectAmount = finalDoc.extractedAmounts.some(amount => Math.abs(amount - 111.36) < 0.01)
      const scanResultHasAmounts = finalDoc.scanResult.includes('€')
      
      console.log('\n📋 VALIDATION:')
      console.log(`   Contains €111.36: ${hasCorrectAmount ? '✅' : '❌'}`)
      console.log(`   Scan result shows amounts: ${scanResultHasAmounts ? '✅' : '❌'}`)
      console.log(`   Is emergency processing: ${finalDoc.scanResult.includes('Emergency') ? '✅' : '❌'}`)
      
      if (hasCorrectAmount && scanResultHasAmounts) {
        console.log('\n🎉 COMPLETE SUCCESS!')
        console.log('✅ Emergency fallback extracts VAT amounts from failed PDFs')
        console.log('✅ Scan results include extracted amounts for API processing')  
        console.log('✅ Users will see VAT data instead of €0')
        console.log('✅ User complaint FULLY RESOLVED!')
      } else {
        console.log('\n⚠️ PARTIAL SUCCESS - Still needs improvement')
        if (!hasCorrectAmount) console.log('   - Amount extraction needs work')
        if (!scanResultHasAmounts) console.log('   - Scan result format needs work')
      }
      
    } else {
      console.log('   ❌ Final test document not found in processed list')
      console.log('   This indicates the fix is not yet working properly')
      
      // Show what documents were found for debugging
      console.log('\n🔍 DEBUG - Documents found:')
      vatResult.extractedVAT.purchaseDocuments?.forEach((doc, i) => {
        console.log(`   ${i+1}. ${doc.fileName} - €${doc.extractedAmounts.join(', €')}`)
      })
    }
    
  } catch (error) {
    console.error('🚨 FINAL FIX TEST ERROR:', error)
  }
}

// Run the final test
console.log('🚀 Starting Final Fix Test...')
console.log(`🕒 Time: ${new Date().toISOString()}`)
console.log('🎯 Goal: Verify PDF emergency fallback fully resolves user complaint')
console.log()

testFinalFix()
  .then(() => {
    console.log('\n' + '=' .repeat(60))
    console.log('✅ FINAL FIX TEST COMPLETED')
    console.log('=' .repeat(60))
  })
  .catch(error => {
    console.error('🚨 FINAL TEST FAILED:', error)
  })