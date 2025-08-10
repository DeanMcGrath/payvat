/**
 * Test Excel file processing with XLSX library
 * Tests the WooCommerce Excel scenario with multiple tax columns
 */

const fs = require('fs');
const XLSX = require('xlsx');

async function createAndTestExcelFile() {
  console.log('🧪 TESTING EXCEL FILE PROCESSING');
  console.log('=' .repeat(80));
  
  try {
    // Create test Excel data matching WooCommerce export format
    const testData = [
      // Headers row
      [
        'Order ID', 'Order Date', 'Customer Name', 'Product', 
        'Quantity', 'Item Price', 'Item Tax Amt.', 'Shipping Cost', 
        'Shipping Tax Amt.', 'Total'
      ],
      // Data rows with tax values
      ['ORD-001', '2024-08-01', 'John Smith', 'Product A', 2, 100.00, 23.00, 15.00, 3.45, 141.45],
      ['ORD-002', '2024-08-02', 'Jane Doe', 'Product B', 1, 250.00, 57.50, 20.00, 4.60, 332.10],
      ['ORD-003', '2024-08-03', 'Bob Wilson', 'Product C', 3, 500.00, 1150.00, 25.00, 5.75, 1680.75],
      ['ORD-004', '2024-08-04', 'Alice Brown', 'Product D', 1, 1800.00, 414.00, 30.00, 6.90, 2250.90],
      ['ORD-005', '2024-08-05', 'Charlie Davis', 'Product E', 2, 950.00, 2497.82, 35.00, 355.18, 3838.00],
      // Total row (like WooCommerce export)
      ['', '', '', 'TOTALS', '', 3600.00, 5142.32, 125.00, 375.88, 9243.20]
    ];
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(testData);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Orders');
    
    // Write to buffer (simulating file upload)
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const base64Excel = excelBuffer.toString('base64');
    
    console.log('\n📊 Created test Excel file:');
    console.log(`   Size: ${Math.round(excelBuffer.length / 1024)}KB`);
    console.log(`   Base64 length: ${base64Excel.length} chars`);
    console.log(`   Expected Item Tax Total: €5,142.32`);
    console.log(`   Expected Shipping Tax Total: €375.88`);
    console.log(`   Expected Combined VAT: €5,518.20`);
    
    // Test 1: Direct extraction using our function
    console.log('\n1️⃣ Testing direct Excel extraction...');
    
    const { extractTextFromExcel } = require('./lib/documentProcessor');
    const result = await extractTextFromExcel(base64Excel);
    
    if (result.success) {
      console.log('✅ Excel extraction successful!');
      console.log(`   Extracted text length: ${result.text.length} chars`);
      
      // Check if the correct values are in the extracted text
      const hasItemTax = result.text.includes('5142.32');
      const hasShippingTax = result.text.includes('375.88');
      const hasTotalVat = result.text.includes('5518.20');
      
      console.log(`   Contains Item Tax (5142.32): ${hasItemTax ? '✅' : '❌'}`);
      console.log(`   Contains Shipping Tax (375.88): ${hasShippingTax ? '✅' : '❌'}`);
      console.log(`   Contains Total VAT (5518.20): ${hasTotalVat ? '✅' : '❌'}`);
      
      // Show first 500 chars of extracted text
      console.log('\n📋 Extracted text preview:');
      console.log(result.text.substring(0, 500) + '...');
      
    } else {
      console.log('❌ Excel extraction failed:', result.error);
    }
    
    // Test 2: Test via API endpoint
    console.log('\n2️⃣ Testing via API (requires server running on port 3000)...');
    
    try {
      // First, create a document record
      const uploadResponse = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: 'woocommerce-orders.xlsx',
          fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          fileData: base64Excel,
          category: 'SALES'
        })
      });
      
      if (uploadResponse.ok) {
        const uploadResult = await uploadResponse.json();
        console.log('✅ Upload successful, document ID:', uploadResult.documentId);
        
        // Process the document
        const processResponse = await fetch('http://localhost:3000/api/documents/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            documentId: uploadResult.documentId
          })
        });
        
        if (processResponse.ok) {
          const processResult = await processResponse.json();
          console.log('✅ Processing successful!');
          console.log(`   Total VAT extracted: €${processResult.totalVatAmount || 0}`);
          console.log(`   Expected: €5,518.20`);
          console.log(`   Match: ${Math.abs((processResult.totalVatAmount || 0) - 5518.20) < 0.01 ? '✅' : '❌'}`);
        } else {
          console.log('❌ Processing failed:', processResponse.status, processResponse.statusText);
        }
      } else {
        console.log('❌ Upload failed:', uploadResponse.status, uploadResponse.statusText);
      }
      
    } catch (apiError) {
      console.log('⚠️ API test skipped (server not running or network error):', apiError.message);
    }
    
    // Save test file for manual verification
    const testFilePath = './test-woocommerce-export.xlsx';
    XLSX.writeFile(wb, testFilePath);
    console.log(`\n💾 Test Excel file saved to: ${testFilePath}`);
    console.log('   You can manually upload this file to test the web interface');
    
  } catch (error) {
    console.error('\n🚨 Test error:', error);
    console.error('Stack:', error.stack);
  }
  
  console.log('\n' + '=' .repeat(80));
  console.log('✅ EXCEL PROCESSING TEST COMPLETED');
  console.log('=' .repeat(80));
}

// Run the test
createAndTestExcelFile();