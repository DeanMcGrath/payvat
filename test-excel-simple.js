/**
 * Simple test to verify Excel processing works via the API
 */

const XLSX = require('xlsx');

async function testExcelViaAPI() {
  console.log('🧪 TESTING EXCEL PROCESSING VIA API');
  console.log('=' .repeat(80));
  
  try {
    // Create WooCommerce-style Excel data
    const testData = [
      // Headers
      ['Order ID', 'Customer', 'Item Tax Amt.', 'Shipping Tax Amt.', 'Total'],
      // Orders with tax data
      ['001', 'John', 1000.00, 100.00, 1100.00],
      ['002', 'Jane', 2000.00, 150.00, 2150.00],
      ['003', 'Bob', 2142.32, 125.88, 2268.20],
      // Totals row
      ['TOTAL', '', 5142.32, 375.88, 5518.20]
    ];
    
    // Create Excel file
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(testData);
    XLSX.utils.book_append_sheet(wb, ws, 'Orders');
    
    // Convert to base64
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const base64 = buffer.toString('base64');
    
    console.log('📊 Created Excel file:');
    console.log(`   Expected VAT: €5,518.20 (Item Tax: €5,142.32 + Shipping Tax: €375.88)`);
    
    // Test upload
    console.log('\n📤 Uploading to API...');
    const uploadResponse = await fetch('http://localhost:3002/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: 'test-woocommerce.xlsx',
        fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        fileData: base64,
        category: 'SALES'
      })
    });
    
    if (!uploadResponse.ok) {
      const error = await uploadResponse.text();
      throw new Error(`Upload failed: ${uploadResponse.status} - ${error}`);
    }
    
    const { documentId } = await uploadResponse.json();
    console.log('✅ Upload successful! Document ID:', documentId);
    
    // Process document
    console.log('\n⚙️ Processing document...');
    const processResponse = await fetch('http://localhost:3002/api/documents/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId })
    });
    
    if (!processResponse.ok) {
      const error = await processResponse.text();
      throw new Error(`Processing failed: ${processResponse.status} - ${error}`);
    }
    
    const result = await processResponse.json();
    console.log('\n📊 PROCESSING RESULTS:');
    console.log(`   Success: ${result.success ? '✅' : '❌'}`);
    console.log(`   Total VAT: €${result.totalVatAmount || 0}`);
    console.log(`   Expected: €5,518.20`);
    console.log(`   Match: ${Math.abs((result.totalVatAmount || 0) - 5518.20) < 1 ? '✅ PASS' : '❌ FAIL'}`);
    
    if (result.extractedData) {
      console.log('\n📋 Extracted Data:');
      console.log(`   Sales VAT: €${result.extractedData.salesVAT?.join(', €') || 'none'}`);
      console.log(`   Purchase VAT: €${result.extractedData.purchaseVAT?.join(', €') || 'none'}`);
      console.log(`   Document Type: ${result.extractedData.documentType}`);
      console.log(`   Confidence: ${result.extractedData.confidence}%`);
    }
    
    // Save test file
    XLSX.writeFile(wb, 'test-woocommerce.xlsx');
    console.log('\n💾 Test file saved as: test-woocommerce.xlsx');
    
  } catch (error) {
    console.error('\n🚨 TEST FAILED:', error.message);
    console.log('\n💡 Make sure the dev server is running: npm run dev');
  }
  
  console.log('\n' + '=' .repeat(80));
}

// Run test
console.log('🚀 Starting test (requires server on port 3000)...\n');
testExcelViaAPI();