const fs = require('fs');
const path = require('path');

// Production URL - update this with the actual production URL
const PRODUCTION_URL = 'https://payvat.ie';

async function testPDFProcessing() {
  console.log('🧪 Testing PDF processing on production...');
  console.log(`📍 URL: ${PRODUCTION_URL}`);
  
  try {
    // Read test PDF
    const pdfPath = path.join(__dirname, 'test-vat-document.pdf');
    const pdfBuffer = fs.readFileSync(pdfPath);
    const base64Data = pdfBuffer.toString('base64');
    
    console.log('\n📄 Uploading PDF...');
    console.log(`   File: ${pdfPath}`);
    console.log(`   Size: ${pdfBuffer.length} bytes`);
    
    // 1. Upload PDF using FormData
    const formData = new FormData();
    formData.append('file', new Blob([pdfBuffer], { type: 'application/pdf' }), 'test-vat-document.pdf');
    formData.append('userId', 'guest_test_' + Date.now());
    formData.append('category', 'SALES_INVOICE');
    
    const uploadResponse = await fetch(`${PRODUCTION_URL}/api/upload`, {
      method: 'POST',
      body: formData
    });
    
    const uploadResult = await uploadResponse.json();
    console.log('\n📤 Upload Response:');
    console.log(`   Status: ${uploadResponse.status}`);
    console.log(`   Success: ${uploadResult.success}`);
    console.log(`   Document ID: ${uploadResult.documentId}`);
    
    if (!uploadResult.success) {
      console.error('❌ Upload failed:', uploadResult.error);
      return;
    }
    
    // 2. Process document
    console.log('\n🔄 Processing document...');
    const processResponse = await fetch(`${PRODUCTION_URL}/api/documents/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentId: uploadResult.documentId,
        userId: uploadResult.userId
      })
    });
    
    const processResult = await processResponse.json();
    console.log('\n⚙️ Process Response:');
    console.log(`   Status: ${processResponse.status}`);
    console.log(`   Success: ${processResult.success}`);
    console.log(`   Processed: ${processResult.processed}`);
    
    // 3. Get extracted VAT data
    console.log('\n📊 Getting extracted VAT data...');
    const vatResponse = await fetch(`${PRODUCTION_URL}/api/documents/extracted-vat?userId=${uploadResult.userId}`);
    const vatResult = await vatResponse.json();
    
    console.log('\n💰 VAT Extraction Results:');
    console.log(`   Status: ${vatResponse.status}`);
    console.log(`   Success: ${vatResult.success}`);
    console.log(`   Processed Documents: ${vatResult.processedDocuments}`);
    console.log(`   Total Sales VAT: €${vatResult.totalSalesVAT}`);
    console.log(`   Total Purchase VAT: €${vatResult.totalPurchaseVAT}`);
    console.log(`   Net VAT: €${vatResult.totalNetVAT}`);
    
    // Check for ENOENT error
    const hasENOENTError = JSON.stringify(uploadResult).includes('ENOENT') || 
                           JSON.stringify(processResult).includes('ENOENT') ||
                           JSON.stringify(vatResult).includes('ENOENT');
    
    if (hasENOENTError) {
      console.error('\n❌ ENOENT ERROR DETECTED - PDF processing bug still present!');
    } else {
      console.log('\n✅ SUCCESS: No ENOENT errors - PDF processing fix is working!');
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

testPDFProcessing();