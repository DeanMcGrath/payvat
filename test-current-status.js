#!/usr/bin/env node

const VERCEL_URL = 'https://vat-pay-ireland-r93x04tn4-deans-projects-cdf015cf.vercel.app';

async function testDocumentProcessing() {
  console.log('🧪 TESTING CURRENT PRODUCTION STATUS');
  console.log(`📅 Test Date: ${new Date().toISOString()}`);
  console.log(`🌐 Testing: ${VERCEL_URL}\n`);
  
  // Test 1: Check if API is responding
  console.log('1️⃣ Testing API Health...');
  const healthResponse = await fetch(`${VERCEL_URL}/api/health`);
  const health = await healthResponse.json();
  console.log(`   Status: ${health.status}`);
  console.log(`   Database: ${health.database.status}\n`);
  
  // Test 2: Check documents endpoint
  console.log('2️⃣ Testing Documents Endpoint...');
  const docsResponse = await fetch(`${VERCEL_URL}/api/documents`);
  const docsData = await docsResponse.json();
  console.log(`   Response status: ${docsResponse.status}`);
  console.log(`   Documents returned: ${docsData.documents ? docsData.documents.length : 0}\n`);
  
  // Test 3: Check VAT extraction endpoint
  console.log('3️⃣ Testing VAT Extraction Endpoint...');
  const vatResponse = await fetch(`${VERCEL_URL}/api/documents/extracted-vat`);
  const vatData = await vatResponse.json();
  console.log(`   Response status: ${vatResponse.status}`);
  console.log(`   Sales documents: ${vatData.salesDocuments ? vatData.salesDocuments.length : 0}`);
  console.log(`   Purchase documents: ${vatData.purchaseDocuments ? vatData.purchaseDocuments.length : 0}\n`);
  
  // Test 4: Test document processing endpoint
  console.log('4️⃣ Testing Document Processing Endpoint...');
  const processResponse = await fetch(`${VERCEL_URL}/api/documents/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentId: 'test-doc-123' })
  });
  console.log(`   Response status: ${processResponse.status}`);
  if (processResponse.status === 500) {
    console.log(`   ❌ CRITICAL: 500 ERROR - Processing endpoint is broken!`);
    const errorText = await processResponse.text();
    console.log(`   Error: ${errorText.substring(0, 200)}...`);
  } else if (processResponse.status === 404) {
    console.log(`   ✅ 404 expected (test document doesn't exist)`);
  } else {
    console.log(`   Status: ${processResponse.status}`);
  }
  
  console.log('\n📊 SUMMARY:');
  console.log('The fixes I described have NOT been implemented yet.');
  console.log('I was in plan mode and couldn\'t make actual changes.');
  console.log('\nTo fix the issues, I need to:');
  console.log('1. Fix PDF parsing with proper validation');
  console.log('2. Fix document status management');
  console.log('3. Fix data extraction and saving');
  console.log('4. Add proper error recovery');
  console.log('5. Implement real integration tests');
}

testDocumentProcessing().catch(console.error);
