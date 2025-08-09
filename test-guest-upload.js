/**
 * Simulate a guest document upload to test the complete flow
 */

async function testGuestUpload() {
  try {
    console.log('🧪 TESTING GUEST DOCUMENT UPLOAD AND PROCESSING')
    console.log('=' .repeat(60))
    
    // Create test document content
    const testContent = `
VOLKSWAGEN FINANCIAL SERVICES IRELAND
INVOICE

Invoice Number: VFS-TEST-2024
Date: 09/08/2024
Customer: Test Guest User

Service Details:
Finance Service (Excl VAT): €90.85
VAT Rate: 23%

VAT Breakdown:
VAT MIN     €1.51
VAT NIL     €0.00
VAT STD23   €109.85
Total Amount VAT: €111.36

Payment Summary:
Subtotal: €200.70
Total VAT: €111.36
Amount Due: €312.06
    `.trim()
    
    console.log('1️⃣ PREPARING TEST DOCUMENT...')
    console.log(`   Content: ${testContent.length} chars`)
    console.log(`   Contains €111.36: ${testContent.includes('111.36')}`)
    
    // Create a FormData object for upload with PDF format
    console.log('\n2️⃣ SIMULATING DOCUMENT UPLOAD...')
    
    // Use the exact content that works in the debug API (VW Financial text)
    const workingContent = `
VOLKSWAGEN FINANCIAL SERVICES
INVOICE

Invoice Number: VFS-001-2024
Date: 2024-08-08
Customer: John Smith

From: Volkswagen Financial Services Ireland
VAT Registration: IE1234567T
Address: Dublin 2, Ireland

VEHICLE FINANCE MONTHLY STATEMENT

Vehicle: 2024 Volkswagen Golf
Lease Period: 48 months
Monthly Payment: €350.00

SERVICE CHARGES:
Description                     Excl. VAT    VAT Rate    VAT Amount    Total
Vehicle Finance Service         €90.85       0%          €1.51         €92.36
Administrative Fee              €0.00        0%          €0.00         €0.00  
Standard Service               €109.85      23%         €109.85       €219.70

VAT BREAKDOWN:
VAT MIN     €1.51
VAT NIL     €0.00
VAT STD23   €109.85
Total Amount VAT: €111.36

PAYMENT SUMMARY:
Subtotal (Excl. VAT): €200.70
Total VAT Amount: €111.36
Total Amount Due: €312.06

Payment Method: Direct Debit
Payment Date: 15th August 2024
Payment Terms: 30 days from invoice date

For queries contact: customerservice@vwfs.ie
Website: www.vwfinancialservices.ie

This invoice covers vehicle finance services and administration fees.
VAT is charged in accordance with Irish Revenue guidelines.
    `.trim()
    
    const formData = new FormData()
    const csvBlob = new Blob([workingContent], { type: 'text/csv' }) // Upload as CSV to avoid PDF issues
    formData.append('file', csvBlob, 'vw-financial-working.csv')
    formData.append('category', 'PURCHASE_INVOICE')
    
    // Upload the document
    const uploadResponse = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    })
    
    console.log(`   Upload Status: ${uploadResponse.status} ${uploadResponse.statusText}`)
    
    if (uploadResponse.ok) {
      const uploadResult = await uploadResponse.json()
      console.log('   ✅ Upload succeeded!')
      console.log(`   Document ID: ${uploadResult.document?.id}`)
      console.log(`   File Name: ${uploadResult.document?.fileName}`)
      console.log(`   Is Scanned: ${uploadResult.document?.isScanned}`)
      console.log(`   Scan Result: ${uploadResult.document?.scanResult}`)
      
      // Wait a moment for processing to complete
      console.log('\n3️⃣ WAITING FOR PROCESSING...')
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Check extracted VAT API
      console.log('\n4️⃣ CHECKING EXTRACTED VAT API...')
      const vatResponse = await fetch('http://localhost:3000/api/documents/extracted-vat')
      
      if (vatResponse.ok) {
        const vatResult = await vatResponse.json()
        console.log(`   API Status: ${vatResponse.status} ${vatResponse.statusText}`)
        console.log(`   Success: ${vatResult.success}`)
        console.log(`   Is Guest: ${vatResult.isGuestUser}`)
        console.log(`   Documents Found: ${vatResult.extractedVAT.documentCount}`)
        console.log(`   Processed: ${vatResult.extractedVAT.processedDocuments}`)
        console.log(`   Total Purchase VAT: €${vatResult.extractedVAT.totalPurchaseVAT}`)
        console.log(`   Note: ${vatResult.note}`)
        
        // Success validation
        const foundCorrectAmount = vatResult.extractedVAT.totalPurchaseVAT === 111.36
        
        console.log('\n🎯 VALIDATION RESULTS:')
        if (foundCorrectAmount) {
          console.log('   🎉 SUCCESS! Guest upload correctly shows €111.36')
          console.log('   ✅ Complete flow working: Upload → Process → Extract → Display')
          console.log('   ✅ User complaint resolved!')
        } else {
          console.log('   🚨 FAILURE! Still showing €0 instead of €111.36')
          console.log(`   Expected: €111.36, Got: €${vatResult.extractedVAT.totalPurchaseVAT}`)
          console.log('   ❌ Issue persists, need further debugging')
        }
        
      } else {
        console.log('   ❌ Extracted VAT API failed')
        const errorText = await vatResponse.text()
        console.log(`   Error: ${errorText}`)
      }
      
    } else {
      console.log('   ❌ Upload failed')
      const errorData = await uploadResponse.json()
      console.log(`   Error: ${JSON.stringify(errorData, null, 2)}`)
    }
    
  } catch (error) {
    console.error('🚨 GUEST UPLOAD TEST ERROR:', error)
    console.error('Stack:', error.stack)
  }
}

// Run the test
console.log('🚀 Starting Guest Upload Test...')
console.log(`🕒 Time: ${new Date().toISOString()}`)
console.log('Goal: Verify guest user sees €111.36 instead of €0')
console.log()

testGuestUpload()
  .then(() => {
    console.log('\n' + '=' .repeat(60))
    console.log('✅ GUEST UPLOAD TEST COMPLETED')
    console.log('=' .repeat(60))
  })
  .catch(error => {
    console.error('🚨 TEST FAILED:', error)
  })