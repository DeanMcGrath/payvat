/**
 * Test Document Processing with VW Financial-style document
 * This tests our enhanced VAT extraction fixes
 */

async function testDirectProcessing() {
  try {
    console.log('🧪 Testing direct document processing with simulated VW PDF text...')
    
    // Simulate the text that would be extracted from a VW PDF
    const simulatedPDFText = `
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
    
    // Convert to base64 as if it were a text file
    const base64Data = Buffer.from(simulatedPDFText, 'utf-8').toString('base64')
    
    // Import and test the document processor directly
    const { processDocument } = require('./lib/documentProcessor')
    
    console.log('📝 Testing with simulated VW PDF text...')
    const result = await processDocument(
      base64Data,
      'text/plain', // Simulate as text for now
      'vw-financial-test.txt',
      'PURCHASES'
    )
    
    console.log('📊 Direct Processing Result:')
    console.log(`   Success: ${result.success}`)
    console.log(`   Scan Result: ${result.scanResult}`)
    
    if (result.extractedData) {
      const allVAT = [...result.extractedData.salesVAT, ...result.extractedData.purchaseVAT]
      const found111_36 = allVAT.some(amount => Math.abs(amount - 111.36) < 0.01)
      
      console.log(`   VAT amounts: €${allVAT.join(', €') || 'none'}`)
      console.log(`   Found €111.36: ${found111_36 ? '✅' : '❌'}`)
      console.log(`   Confidence: ${Math.round(result.extractedData.confidence * 100)}%`)
      
      if (found111_36) {
        console.log('\n🎉 DIRECT PROCESSING TEST PASSED!')
        console.log('The system correctly extracted €111.36')
      } else {
        console.log('\n🚨 DIRECT PROCESSING TEST FAILED!')
        console.log('The system did not extract €111.36 as expected')
      }
    } else {
      console.log('   ❌ No extracted data')
    }
    
  } catch (error) {
    console.error('🚨 Direct Processing Test Error:', error)
  }
}

// Run the test
console.log('🚀 Starting PDF Processing Tests...')
testDirectProcessing()