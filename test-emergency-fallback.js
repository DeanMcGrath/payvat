/**
 * Test the improved emergency fallback for PDF processing
 */

async function testEmergencyFallback() {
  try {
    console.log('🧪 TESTING IMPROVED EMERGENCY FALLBACK')
    console.log('=' .repeat(60))
    
    // Create a PDF that will trigger emergency fallback but contains VAT amounts
    const emergencyTestPDF = `%PDF-1.4
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
/Length 350
>>
stream
BT
/F1 12 Tf
50 700 Td
(EMERGENCY FALLBACK TEST INVOICE) Tj
0 -25 Td
(Date: 2024-08-09) Tj
0 -25 Td
(Customer: Test User) Tj
0 -30 Td
(SERVICES:) Tj
0 -20 Td
(Consulting Work: €200.00) Tj
0 -30 Td
(VAT CALCULATION:) Tj
0 -20 Td
(VAT Rate: 23%) Tj
0 -15 Td
(VAT Amount: €46.00) Tj
0 -15 Td
(Total Amount VAT: €111.36) Tj
0 -25 Td
(TOTAL DUE: €357.36) Tj
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
670
%%EOF`

    console.log('1️⃣ UPLOADING EMERGENCY TEST PDF...')
    console.log('   Contains: Total Amount VAT: €111.36')
    console.log('   Expected: Emergency fallback should find this amount')
    
    const formData = new FormData()
    const pdfBlob = new Blob([emergencyTestPDF], { type: 'application/pdf' })
    formData.append('file', pdfBlob, 'emergency-test.pdf')
    formData.append('category', 'PURCHASE_INVOICE')
    
    const uploadResponse = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    })
    
    console.log(`   Upload Status: ${uploadResponse.status} ${uploadResponse.statusText}`)
    
    if (uploadResponse.ok) {
      const uploadResult = await uploadResponse.json()
      console.log('   ✅ Upload succeeded!')
      console.log(`   Document ID: ${uploadResult.document?.id}`)
      console.log(`   Processing Status: ${uploadResult.document?.isScanned}`)
      console.log(`   Scan Result: ${uploadResult.document?.scanResult}`)
      
      // Wait for processing
      console.log('\n2️⃣ WAITING FOR PROCESSING...')
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Check extracted VAT API
      console.log('\n3️⃣ CHECKING EXTRACTED VAT API...')
      const vatResponse = await fetch('http://localhost:3000/api/documents/extracted-vat')
      
      if (vatResponse.ok) {
        const vatResult = await vatResponse.json()
        console.log(`   Total Purchase VAT: €${vatResult.extractedVAT.totalPurchaseVAT}`)
        console.log(`   Processed Documents: ${vatResult.extractedVAT.processedDocuments}`)
        
        // Look for our emergency test document
        const emergencyDoc = vatResult.extractedVAT.purchaseDocuments?.find(doc => 
          doc.fileName === 'emergency-test.pdf'
        )
        
        if (emergencyDoc) {
          console.log('\n🎯 EMERGENCY FALLBACK TEST RESULTS:')
          console.log(`   ✅ Document found in processed list: ${emergencyDoc.fileName}`)
          console.log(`   💰 Extracted amounts: €${emergencyDoc.extractedAmounts.join(', €')}`)
          console.log(`   📊 Confidence: ${Math.round(emergencyDoc.confidence * 100)}%`)
          console.log(`   📝 Scan result: ${emergencyDoc.scanResult}`)
          
          const found111_36 = emergencyDoc.extractedAmounts.some(amount => Math.abs(amount - 111.36) < 0.01)
          
          if (found111_36) {
            console.log('\n🎉 SUCCESS! Emergency fallback found €111.36')
            console.log('✅ PDF processing failures now extract VAT amounts')
            console.log('✅ Users will see VAT data instead of €0')
          } else {
            console.log('\n⚠️ PARTIAL SUCCESS: Document processed but incorrect amount')
            console.log(`   Expected: €111.36, Got: €${emergencyDoc.extractedAmounts.join(', €')}`)
          }
        } else {
          console.log('\n❌ Emergency test document not found in processed list')
          console.log('   This means emergency fallback is still not working')
        }
        
      } else {
        console.log('   ❌ Extracted VAT API failed')
      }
      
    } else {
      console.log('   ❌ Upload failed')
      const errorText = await uploadResponse.text()
      console.log(`   Error: ${errorText}`)
    }
    
  } catch (error) {
    console.error('🚨 EMERGENCY FALLBACK TEST ERROR:', error)
  }
}

// Run the test
console.log('🚀 Starting Emergency Fallback Test...')
console.log(`🕒 Time: ${new Date().toISOString()}`)
console.log('Goal: Verify emergency fallback extracts VAT amounts from failed PDFs')
console.log()

testEmergencyFallback()
  .then(() => {
    console.log('\n' + '=' .repeat(60))
    console.log('✅ EMERGENCY FALLBACK TEST COMPLETED')
    console.log('=' .repeat(60))
  })
  .catch(error => {
    console.error('🚨 TEST FAILED:', error)
  })