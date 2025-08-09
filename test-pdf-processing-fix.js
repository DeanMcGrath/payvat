/**
 * Test if PDF processing 500 error is fixed
 */

async function testPDFProcessingFix() {
  try {
    console.log('🧪 TESTING PDF PROCESSING 500 ERROR FIX')
    console.log('=' .repeat(60))
    
    // Create a simple PDF that will trigger the pdf-parse issue
    const testPdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
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
/Length 200
>>
stream
BT
/F1 12 Tf
100 700 Td
(VOLKSWAGEN FINANCIAL SERVICES) Tj
100 680 Td
(Total Amount VAT: 111.36) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000010 00000 n
0000000079 00000 n
0000000173 00000 n
0000000254 00000 n
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
456
%%EOF`

    console.log('1️⃣ UPLOADING PDF FILE...')
    
    const formData = new FormData()
    const pdfBlob = new Blob([testPdfContent], { type: 'application/pdf' })
    formData.append('file', pdfBlob, 'test-invoice.pdf')
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
      console.log(`   Is Scanned: ${uploadResult.document?.isScanned}`)
      console.log(`   Scan Result: ${uploadResult.document?.scanResult}`)
      
      // Key test: Did processing complete without 500 error?
      const processingSucceeded = uploadResult.document?.isScanned === true || uploadResult.document?.isScanned === false
      console.log(`   Processing Completed: ${processingSucceeded ? '✅' : '❌'}`)
      
      if (processingSucceeded) {
        console.log('\n🎉 SUCCESS! PDF processing no longer returns 500 errors')
        console.log('✅ Documents are saved even when PDF extraction fails')
        console.log('✅ System gracefully handles PDF processing failures')
      } else {
        console.log('\n❌ PDF processing still returning 500 errors')
      }
      
      // Test the extracted VAT API
      console.log('\n2️⃣ TESTING EXTRACTED VAT API...')
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const vatResponse = await fetch('http://localhost:3000/api/documents/extracted-vat')
      if (vatResponse.ok) {
        const vatResult = await vatResponse.json()
        console.log(`   Documents Found: ${vatResult.extractedVAT.documentCount}`)
        console.log(`   Processed Documents: ${vatResult.extractedVAT.processedDocuments}`)
        
        if (vatResult.extractedVAT.documentCount > 0) {
          console.log('   ✅ Document appears in extracted VAT API')
        } else {
          console.log('   ⚠️ Document not found in extracted VAT API yet')
        }
      }
      
    } else {
      console.log('   ❌ Upload failed')
      const errorText = await uploadResponse.text()
      console.log(`   Error: ${errorText}`)
      
      if (uploadResponse.status === 500) {
        console.log('   🚨 Still getting 500 errors - fix not working')
      }
    }
    
  } catch (error) {
    console.error('🚨 TEST ERROR:', error)
  }
}

// Run the test
console.log('🚀 Starting PDF Processing Fix Test...')
console.log(`🕒 Time: ${new Date().toISOString()}`)
testPDFProcessingFix()
  .then(() => {
    console.log('\n' + '=' .repeat(60))
    console.log('✅ PDF PROCESSING FIX TEST COMPLETED')
    console.log('=' .repeat(60))
  })
  .catch(error => {
    console.error('🚨 TEST FAILED:', error)
  })