/**
 * Test Excel processing directly via the document processor
 */

const XLSX = require('xlsx');

async function testExcelProcessingDirect() {
  console.log('🧪 DIRECT EXCEL PROCESSING TEST');
  console.log('=' .repeat(80));
  
  try {
    // Create WooCommerce-style Excel data
    const testData = [
      // Headers matching actual WooCommerce export
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
    console.log(`   Size: ${Math.round(buffer.length / 1024)}KB`);
    console.log(`   Expected Item Tax: €5,142.32`);
    console.log(`   Expected Shipping Tax: €375.88`);
    console.log(`   Expected Combined VAT: €5,518.20`);
    
    // Parse the Excel to verify our test data
    console.log('\n🔍 Verifying test data structure:');
    const testWb = XLSX.read(buffer, { type: 'buffer' });
    const testWs = testWb.Sheets[testWb.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(testWs, { header: 1 });
    
    console.log(`   Rows: ${jsonData.length}`);
    console.log(`   Headers: ${jsonData[0].join(', ')}`);
    console.log(`   Last row (totals): ${jsonData[jsonData.length - 1].join(', ')}`);
    
    // Test the extraction logic
    console.log('\n📋 Testing extraction logic:');
    
    const headers = jsonData[0];
    const taxColumns = [];
    let totalVat = 0;
    
    // Find tax columns
    headers.forEach((header, index) => {
      if (header && header.toString().toLowerCase().includes('tax')) {
        taxColumns.push({ index, name: header });
        console.log(`   Found tax column: "${header}" at index ${index}`);
      }
    });
    
    // Sum tax values
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      taxColumns.forEach(({ index, name }) => {
        const value = parseFloat(row[index]) || 0;
        if (value > 0) {
          totalVat += value;
          console.log(`   Row ${i}, ${name}: €${value}`);
        }
      });
    }
    
    console.log(`\n🎯 CALCULATED TOTAL VAT: €${totalVat.toFixed(2)}`);
    console.log(`   Expected: €5,518.20`);
    console.log(`   Match: ${Math.abs(totalVat - 5518.20) < 0.01 ? '✅ PASS' : '❌ FAIL'}`);
    
    // Save test file for manual upload
    const fileName = 'test-woocommerce-export.xlsx';
    XLSX.writeFile(wb, fileName);
    console.log(`\n💾 Test file saved as: ${fileName}`);
    console.log('   You can upload this file via the web interface to test');
    
    // Test via API using a simpler endpoint
    console.log('\n🌐 Testing via debug endpoint...');
    
    // Create a simple test using the debug endpoint
    const testPayload = {
      fileData: base64,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      fileName: 'test.xlsx'
    };
    
    try {
      const response = await fetch('http://localhost:3002/api/debug/test-vat-extraction', {
        method: 'GET'
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Debug endpoint responded');
        console.log(`   Success: ${result.success}`);
        console.log(`   Tests passed: ${result.results?.summary?.completionRate || 'unknown'}`);
      } else {
        console.log('⚠️ Debug endpoint not available');
      }
    } catch (e) {
      console.log('⚠️ Could not reach debug endpoint (server may not be running)');
    }
    
  } catch (error) {
    console.error('\n🚨 TEST ERROR:', error.message);
  }
  
  console.log('\n' + '=' .repeat(80));
  console.log('TEST COMPLETE');
  console.log('=' .repeat(80));
}

// Run test
testExcelProcessingDirect();