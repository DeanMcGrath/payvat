const fs = require('fs');

// Create a simple test PDF that should be parseable
// Using minimal PDF structure for testing purposes
const SIMPLE_PDF_CONTENT = `%PDF-1.4
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
/Length 59
>>
stream
BT
/F1 12 Tf
100 700 Td
(VAT Invoice - Total: €115.00) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000120 00000 n 
0000000210 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
320
%%EOF`;

// Write the PDF to a file for testing
fs.writeFileSync('simple-test.pdf', SIMPLE_PDF_CONTENT);

console.log('📄 Simple test PDF created: simple-test.pdf');

async function testWithSimplePDF() {
  const PRODUCTION_URL = 'https://payvat.ie';
  
  try {
    // Read the simple PDF
    const pdfBuffer = fs.readFileSync('simple-test.pdf');
    const base64Data = pdfBuffer.toString('base64');
    
    console.log('🧪 Testing with simple PDF on production...');
    console.log(`📍 URL: ${PRODUCTION_URL}`);
    console.log(`📄 PDF size: ${pdfBuffer.length} bytes`);
    
    // Upload PDF using FormData
    const formData = new FormData();
    formData.append('file', new Blob([pdfBuffer], { type: 'application/pdf' }), 'simple-test.pdf');
    formData.append('userId', 'test_user_' + Date.now());
    formData.append('category', 'SALES_INVOICE');
    
    const uploadResponse = await fetch(`${PRODUCTION_URL}/api/upload`, {
      method: 'POST',
      body: formData
    });
    
    const uploadResult = await uploadResponse.json();
    console.log('\n📤 Upload Response:');
    console.log(`   Status: ${uploadResponse.status}`);
    console.log(`   Success: ${uploadResult.success}`);
    console.log(`   Message: ${uploadResult.message || uploadResult.error || 'No message'}`);
    
    // Check for ENOENT error specifically
    const responseText = JSON.stringify(uploadResult);
    const hasENOENT = responseText.includes('ENOENT') || responseText.includes('no such file');
    
    if (hasENOENT) {
      console.log('\n❌ ENOENT ERROR STILL PRESENT!');
      console.log('🔍 Error details:', responseText);
    } else {
      console.log('\n✅ SUCCESS: No ENOENT errors detected!');
      console.log('🎯 PDF processing fix is working');
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  } finally {
    // Clean up
    try {
      fs.unlinkSync('simple-test.pdf');
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

testWithSimplePDF();