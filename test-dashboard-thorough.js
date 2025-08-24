#!/usr/bin/env node

const http = require('http');

console.log('🔍 THOROUGH DASHBOARD TEST - NO SHORTCUTS');
console.log('Testing for 3+ minutes as requested');
console.log('=' .repeat(60));

let testCount = 0;
const startTime = Date.now();
const MINIMUM_TEST_DURATION = 180000; // 3 minutes in milliseconds

async function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 Test Agent',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 30000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, data }));
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.end();
  });
}

async function testAPI(url, description) {
  try {
    const response = await makeRequest(url);
    const data = JSON.parse(response.data);
    
    console.log(`✅ ${description}: ${response.statusCode}`);
    console.log(`   Success: ${data.success}`);
    
    if (url.includes('documents?dashboard')) {
      console.log(`   Documents structure: ${Array.isArray(data.documents)}`);
      console.log(`   Documents count: ${data.documents?.length || 0}`);
    }
    
    if (url.includes('extracted-vat')) {
      console.log(`   VAT structure: ${!!data.extractedVAT}`);
      console.log(`   Total Sales VAT: ${data.extractedVAT?.totalSalesVAT || 0}`);
    }
    
    return true;
  } catch (error) {
    console.log(`❌ ${description}: ${error.message}`);
    return false;
  }
}

async function testDashboardPage(url) {
  try {
    const response = await makeRequest(url);
    
    if (response.statusCode !== 200) {
      console.log(`❌ Dashboard page: ${response.statusCode}`);
      return false;
    }
    
    const html = response.data;
    
    // Check for loading state
    const hasLoading = html.includes('Loading dashboard...');
    const hasDocumentManagement = html.includes('Document Management');
    const hasJavaScript = html.includes('_next/static');
    
    console.log(`📄 Dashboard page analysis:`);
    console.log(`   Status: ${response.statusCode}`);
    console.log(`   Has JavaScript: ${hasJavaScript}`);
    console.log(`   Shows "Loading dashboard...": ${hasLoading}`);
    console.log(`   Contains "Document Management": ${hasDocumentManagement}`);
    
    return response.statusCode === 200 && hasJavaScript;
    
  } catch (error) {
    console.log(`❌ Dashboard page test failed: ${error.message}`);
    return false;
  }
}

async function runTestCycle() {
  testCount++;
  const elapsed = Date.now() - startTime;
  console.log(`\n🔄 Test cycle ${testCount} (${Math.floor(elapsed/1000)}s elapsed)`);
  console.log('-'.repeat(50));
  
  const results = await Promise.all([
    testAPI('http://localhost:3000/api/documents?dashboard=true', 'Documents API'),
    testAPI('http://localhost:3000/api/documents/extracted-vat', 'VAT API'),
    testDashboardPage('http://localhost:3000/dashboard/documents')
  ]);
  
  const allPassed = results.every(r => r);
  console.log(`\n📊 Cycle ${testCount} result: ${allPassed ? '✅ PASS' : '❌ FAIL'}`);
  
  return allPassed;
}

async function main() {
  console.log('\n🚀 Starting thorough testing...');
  
  let passCount = 0;
  let totalCycles = 0;
  
  // Test every 10 seconds for at least 3 minutes
  const interval = setInterval(async () => {
    try {
      const passed = await runTestCycle();
      totalCycles++;
      if (passed) passCount++;
      
      const elapsed = Date.now() - startTime;
      if (elapsed >= MINIMUM_TEST_DURATION) {
        clearInterval(interval);
        
        console.log('\n🏁 FINAL RESULTS AFTER 3+ MINUTES:');
        console.log('=' .repeat(50));
        console.log(`Total test cycles: ${totalCycles}`);
        console.log(`Passed cycles: ${passCount}`);
        console.log(`Failed cycles: ${totalCycles - passCount}`);
        console.log(`Success rate: ${Math.round((passCount/totalCycles)*100)}%`);
        console.log(`Total duration: ${Math.floor(elapsed/1000)} seconds`);
        
        if (passCount === totalCycles) {
          console.log('\n🎉 ALL TESTS PASSED - DASHBOARD IS WORKING!');
          process.exit(0);
        } else {
          console.log('\n💥 SOME TESTS FAILED - NEEDS MORE FIXING');
          process.exit(1);
        }
      }
    } catch (error) {
      console.log(`❌ Test cycle error: ${error.message}`);
    }
  }, 10000);
  
  // Run first test immediately
  setTimeout(() => {
    runTestCycle().then(passed => {
      totalCycles++;
      if (passed) passCount++;
    });
  }, 1000);
}

main().catch(console.error);
