/**
 * Quick test to verify the variable name fix works
 */

async function testVariableFix() {
  try {
    console.log('🧪 TESTING VARIABLE NAME FIX')
    console.log('=' .repeat(50))
    
    // Quick PDF with clear VAT amounts
    const testPDF = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 200 >>
stream
BT
/F1 12 Tf
50 700 Td
(VARIABLE FIX TEST) Tj
0 -20 Td
(VAT Amount: €111.36) Tj
0 -20 Td
(Total Amount VAT: €111.36) Tj
ET
endstream
endobj
trailer
<< /Size 5 /Root 1 0 R >>
%%EOF`
    
    console.log('Uploading quick test PDF...')
    
    const formData = new FormData()
    const pdfBlob = new Blob([testPDF], { type: 'application/pdf' })
    formData.append('file', pdfBlob, 'variable-fix-test.pdf')
    formData.append('category', 'PURCHASE_INVOICE')
    
    const uploadResponse = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    })
    
    if (uploadResponse.ok) {
      const result = await uploadResponse.json()
      console.log(`✅ Upload: ${uploadResponse.status}`)
      console.log(`📄 Scan Result: ${result.document?.scanResult}`)
      
      const hasAmountInResult = result.document?.scanResult?.includes('111.36')
      const isEmergency = result.document?.scanResult?.includes('Emergency')
      
      console.log(`\n🎯 Results:`)
      console.log(`   Contains €111.36: ${hasAmountInResult ? '✅' : '❌'}`)
      console.log(`   Emergency processing: ${isEmergency ? '✅' : '❌'}`)
      
      if (hasAmountInResult) {
        console.log('\n🎉 SUCCESS! Emergency fallback now extracts and reports VAT amounts!')
      } else {
        console.log('\n⚠️ Still needs work - not extracting amounts properly')
      }
    } else {
      console.log(`❌ Upload failed: ${uploadResponse.status}`)
    }
    
  } catch (error) {
    console.error('🚨 Variable fix test error:', error)
  }
}

testVariableFix()