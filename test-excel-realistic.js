/**
 * Test Excel with realistic WooCommerce data (no totals row)
 */

const XLSX = require('xlsx');

async function testRealisticExcel() {
  console.log('🧪 REALISTIC EXCEL TEST (WooCommerce Style)');
  console.log('=' .repeat(80));
  
  // Realistic WooCommerce export without totals row
  const testData = [
    // Headers exactly like WooCommerce
    ['Order ID', 'Order Date', 'Customer Name', 'Product', 'Qty', 'Item Price', 'Item Tax Amt.', 'Shipping', 'Shipping Tax Amt.', 'Order Total'],
    // Real orders 
    ['12345', '2024-08-01', 'John Smith', 'Product A', 2, 100.00, 23.00, 15.00, 3.45, 141.45],
    ['12346', '2024-08-01', 'Jane Doe', 'Product B', 1, 200.00, 46.00, 15.00, 3.45, 264.45],
    ['12347', '2024-08-02', 'Bob Wilson', 'Product C', 1, 2000.00, 460.00, 25.00, 5.75, 2490.75],
    ['12348', '2024-08-02', 'Alice Brown', 'Product D', 3, 800.00, 552.00, 30.00, 6.90, 2188.90],
    ['12349', '2024-08-03', 'Charlie Davis', 'Product E', 1, 1800.00, 414.00, 35.00, 8.05, 2257.05],
    ['12350', '2024-08-03', 'Diana Green', 'Product F', 2, 1200.00, 276.00, 20.00, 4.60, 1500.60],
    ['12351', '2024-08-04', 'Frank Miller', 'Product G', 1, 500.00, 115.00, 15.00, 3.45, 633.45],
    ['12352', '2024-08-04', 'Grace Lee', 'Product H', 4, 750.00, 690.00, 40.00, 9.20, 1489.20],
    ['12353', '2024-08-05', 'Henry Taylor', 'Product I', 1, 300.00, 69.00, 15.00, 3.45, 387.45],
    ['12354', '2024-08-05', 'Ivy Wilson', 'Product J', 2, 1500.00, 1038.00, 25.00, 5.75, 2568.75],
    ['12355', '2024-08-06', 'Jack Brown', 'Product K', 1, 650.00, 149.50, 20.00, 4.60, 824.10],
    ['12356', '2024-08-06', 'Kelly Davis', 'Product L', 3, 400.00, 276.00, 30.00, 6.90, 712.90],
    ['12357', '2024-08-07', 'Liam Green', 'Product M', 1, 900.00, 207.00, 15.00, 3.45, 1125.45],
    ['12358', '2024-08-07', 'Mia Miller', 'Product N', 2, 1100.00, 506.00, 25.00, 5.75, 1636.75],
    ['12359', '2024-08-08', 'Noah Lee', 'Product O', 1, 2200.00, 506.00, 35.00, 8.05, 2749.05]
  ];
  
  // Calculate expected totals
  let expectedItemTax = 0;
  let expectedShippingTax = 0;
  
  for (let i = 1; i < testData.length; i++) {
    expectedItemTax += parseFloat(testData[i][6]);
    expectedShippingTax += parseFloat(testData[i][8]);
  }
  
  const expectedTotal = expectedItemTax + expectedShippingTax;
  
  console.log('📊 Test Data Summary:');
  console.log(`   Orders: ${testData.length - 1}`);
  console.log(`   Expected Item Tax Total: €${expectedItemTax.toFixed(2)}`);
  console.log(`   Expected Shipping Tax Total: €${expectedShippingTax.toFixed(2)}`);
  console.log(`   Expected Combined VAT: €${expectedTotal.toFixed(2)}`);
  
  // Create Excel file
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(testData);
  XLSX.utils.book_append_sheet(wb, ws, 'Orders');
  
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  const base64 = buffer.toString('base64');
  
  // Test extraction locally
  console.log('\n🔍 Testing local extraction:');
  const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 });
  const headers = jsonData[0];
  
  let calculatedTotal = 0;
  const taxColumns = [];
  
  headers.forEach((header, index) => {
    const headerStr = String(header).toLowerCase();
    if (headerStr.includes('tax') && headerStr.includes('amt')) {
      taxColumns.push({ index, name: header });
      console.log(`   Found tax column: "${header}" at index ${index}`);
    }
  });
  
  // Calculate totals
  const taxTotals = {};
  for (let i = 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    taxColumns.forEach(({ index, name }) => {
      const value = parseFloat(row[index]) || 0;
      if (value > 0) {
        taxTotals[name] = (taxTotals[name] || 0) + value;
        calculatedTotal += value;
      }
    });
  }
  
  console.log('\n💰 Tax Column Totals:');
  Object.entries(taxTotals).forEach(([name, total]) => {
    console.log(`   ${name}: €${total.toFixed(2)}`);
  });
  
  console.log(`\n🎯 CALCULATED TOTAL: €${calculatedTotal.toFixed(2)}`);
  console.log(`   Expected: €${expectedTotal.toFixed(2)}`);
  console.log(`   Match: ${Math.abs(calculatedTotal - expectedTotal) < 0.01 ? '✅ PERFECT' : '❌ MISMATCH'}`);
  
  // Save test file
  const fileName = 'realistic-woocommerce.xlsx';
  XLSX.writeFile(wb, fileName);
  console.log(`\n💾 Realistic test file saved: ${fileName}`);
  console.log('   This matches actual WooCommerce export format');
  console.log('   Upload this via the web interface to test production');
  
  console.log('\n' + '=' .repeat(80));
  return { fileName, expectedTotal, calculatedTotal };
}

// Run test
testRealisticExcel().then(result => {
  if (result && Math.abs(result.calculatedTotal - result.expectedTotal) < 0.01) {
    console.log('🎉 TEST PASSED: Excel extraction logic is working correctly!');
  } else {
    console.log('🚨 TEST FAILED: Excel extraction needs debugging');
  }
});