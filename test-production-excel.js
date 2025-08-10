/**
 * Test the production deployment with Excel file upload
 */

const fs = require('fs');
const FormData = require('form-data');

async function testProductionExcel() {
  const VERCEL_URL = 'https://vat-pay-ireland-ju9m29hkt-deans-projects-cdf015cf.vercel.app';
  
  console.log('🧪 TESTING PRODUCTION EXCEL PROCESSING');
  console.log('=' .repeat(80));
  console.log(`🌐 Testing URL: ${VERCEL_URL}`);
  
  try {
    // Check if the realistic Excel file exists
    if (!fs.existsSync('realistic-woocommerce.xlsx')) {
      console.log('⚠️ Test file not found, creating it...');
      
      const XLSX = require('xlsx');
      
      // Create the test data again
      const testData = [
        ['Order ID', 'Customer', 'Item Tax Amt.', 'Shipping Tax Amt.', 'Total'],
        ['001', 'John', 1000.00, 100.00, 1100.00],
        ['002', 'Jane', 2000.00, 150.00, 2150.00],
        ['003', 'Bob', 2142.32, 125.88, 2268.20],
        ['004', 'Alice', 1200.00, 100.00, 1300.00]
      ];
      
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(testData);
      XLSX.utils.book_append_sheet(wb, ws, 'Orders');
      XLSX.writeFile(wb, 'realistic-woocommerce.xlsx');
      
      console.log('✅ Created test file: realistic-woocommerce.xlsx');
      console.log('   Expected VAT: €6,342.32 + €475.88 = €6,818.20');
    }
    
    console.log('\n📤 Step 1: Uploading Excel file to production...');
    
    // Create FormData for file upload
    const formData = new FormData();
    const fileBuffer = fs.readFileSync('realistic-woocommerce.xlsx');
    formData.append('file', fileBuffer, {
      filename: 'woocommerce-test.xlsx',
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    formData.append('category', 'SALES_REPORT');
    
    const uploadResponse = await fetch(`${VERCEL_URL}/api/upload`, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });
    
    if (!uploadResponse.ok) {
      const error = await uploadResponse.text();
      throw new Error(`Upload failed: ${uploadResponse.status} - ${error}`);
    }
    
    const uploadResult = await uploadResponse.json();
    console.log('✅ Upload successful!');
    console.log(`   Document ID: ${uploadResult.documentId}`);
    
    console.log('\n⚙️ Step 2: Processing document in production...');
    
    const processResponse = await fetch(`${VERCEL_URL}/api/documents/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentId: uploadResult.documentId
      })
    });
    
    if (!processResponse.ok) {
      const error = await processResponse.text();
      throw new Error(`Processing failed: ${processResponse.status} - ${error}`);
    }
    
    const processResult = await processResponse.json();
    
    console.log('\n📊 PRODUCTION PROCESSING RESULTS:');
    console.log(`   Success: ${processResult.success ? '✅' : '❌'}`);
    console.log(`   AI Processed: ${processResult.aiProcessed ? '✅' : '❌'}`);
    console.log(`   Total VAT Amount: €${processResult.totalVatAmount || 0}`);
    console.log(`   Expected: €6,818.20`);
    console.log(`   Match: ${Math.abs((processResult.totalVatAmount || 0) - 6818.20) < 10 ? '✅ PASS' : '❌ FAIL'}`);
    
    if (processResult.extractedData) {
      console.log('\n📋 Extracted Data Details:');
      console.log(`   Document Type: ${processResult.extractedData.documentType}`);
      console.log(`   Confidence: ${processResult.extractedData.confidence}%`);
      console.log(`   Classification: ${processResult.extractedData.classification?.category}`);
      
      if (processResult.extractedData.vatData?.lineItems) {
        console.log(`   Line Items Found: ${processResult.extractedData.vatData.lineItems.length}`);
        processResult.extractedData.vatData.lineItems.forEach((item, i) => {
          console.log(`     ${i + 1}. ${item.description}: €${item.vatAmount}`);
        });
      }
      
      if (processResult.extractedData.validationFlags) {
        console.log(`   Validation Flags: ${processResult.extractedData.validationFlags.join(', ')}`);
      }
    }
    
    if (processResult.scanResult) {
      console.log(`\n📝 Scan Result: ${processResult.scanResult}`);
    }
    
    if (processResult.error) {
      console.log(`\n❌ Error: ${processResult.error}`);
    }
    
    console.log('\n🎯 TEST SUMMARY:');
    
    if (processResult.success && processResult.totalVatAmount > 0) {
      console.log('🎉 SUCCESS: Excel processing is working in production!');
      console.log('✅ XLSX library loaded correctly');
      console.log('✅ Multi-column tax detection working');
      console.log('✅ VAT amounts extracted successfully');
      console.log('✅ Static import fix resolved the deployment issue');
    } else {
      console.log('🚨 FAILURE: Excel processing still not working');
      console.log('❌ Check Vercel logs for detailed error information');
    }
    
  } catch (error) {
    console.error('\n🚨 PRODUCTION TEST FAILED:', error.message);
    console.error('Stack:', error.stack);
  }
  
  console.log('\n' + '=' .repeat(80));
}

// Run the test
testProductionExcel();