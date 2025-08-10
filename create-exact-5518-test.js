/**
 * Create Excel file with exactly €5,518.20 total VAT
 */

const XLSX = require('xlsx');

// Create data that sums to exactly €5,518.20
const exactData = [
  // WooCommerce headers
  ['Order ID', 'Customer', 'Item Tax Amt.', 'Shipping Tax Amt.', 'Total'],
  
  // Data rows that sum to €5,518.20
  ['WC-001', 'Customer A', 5142.32, 375.88, 5518.20],  // Exactly the target amounts
];

// Verify
const itemTax = 5142.32;
const shippingTax = 375.88;
const total = itemTax + shippingTax;

console.log('🎯 EXACT €5,518.20 TEST FILE');
console.log('=' .repeat(50));
console.log(`Item Tax: €${itemTax}`);
console.log(`Shipping Tax: €${shippingTax}`);
console.log(`Total: €${total}`);
console.log(`Target: €5,518.20`);
console.log(`Match: ${total === 5518.20 ? '✅ EXACT' : '❌'}`);

// Create Excel
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet(exactData);
XLSX.utils.book_append_sheet(wb, ws, 'WooCommerce');

const fileName = 'exact-5518-20-test.xlsx';
XLSX.writeFile(wb, fileName);

console.log(`\n💾 Created: ${fileName}`);
console.log('Upload this file to test the fix!');
console.log('Expected result: €5,518.20 extracted successfully');
console.log('=' .repeat(50));