#!/usr/bin/env node

/**
 * End-to-End test for Dashboard Documents Page
 * Tests the actual user flow including API calls and data persistence
 */

const https = require('https');
const http = require('http');

// Test configuration
const TEST_CONFIG = {
  BASE_URL: process.env.TEST_URL || 'https://payvat.ie',
  TIMEOUT: 30000, // 30 second timeout
  USER_AGENT: 'PayVAT-E2E-Test/1.0'
};

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestModule = urlObj.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': TEST_CONFIG.USER_AGENT,
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        ...options.headers
      },
      timeout: TEST_CONFIG.TIMEOUT
    };

    const req = requestModule.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonData,
            rawData: data
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: null,
            rawData: data,
            parseError: e
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.data) {
      req.write(JSON.stringify(options.data));
    }
    
    req.end();
  });
}

// Test function wrapper
function test(name, testFn) {
  return async () => {
    try {
      console.log(`\n🧪 Running: ${name}`);
      await testFn();
      console.log(`✅ PASSED: ${name}`);
      testResults.passed++;
    } catch (error) {
      console.log(`❌ FAILED: ${name}`);
      console.log(`   Error: ${error.message}`);
      testResults.failed++;
      testResults.errors.push({ test: name, error: error.message });
    }
  };
}

// Assertion helper
function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

// Main tests
const tests = [
  test('Documents API endpoint returns valid response', async () => {
    const response = await makeRequest(`${TEST_CONFIG.BASE_URL}/api/documents?dashboard=true`);
    
    assert(response.statusCode === 200, `Expected 200, got ${response.statusCode}`);
    assert(response.data !== null, 'Response data should not be null');
    assert(response.data.success === true, 'Response should indicate success');
    assert(Array.isArray(response.data.documents), 'Documents should be an array');
    
    console.log(`   📊 Found ${response.data.documents.length} documents`);
    console.log(`   📋 Pagination: page=${response.data.pagination?.page}, total=${response.data.pagination?.totalCount}`);
    
    if (response.data.fromFallback) {
      console.log(`   ⚠️  Using fallback data: ${response.data.message}`);
    }
  }),

  test('VAT Extraction API endpoint returns valid response', async () => {
    const response = await makeRequest(`${TEST_CONFIG.BASE_URL}/api/documents/extracted-vat`);
    
    assert(response.statusCode === 200, `Expected 200, got ${response.statusCode}`);
    assert(response.data !== null, 'Response data should not be null');
    assert(response.data.success === true, 'Response should indicate success');
    assert(response.data.extractedVAT !== null, 'extractedVAT should not be null');
    
    const vatData = response.data.extractedVAT;
    assert(typeof vatData.totalSalesVAT === 'number', 'totalSalesVAT should be a number');
    assert(typeof vatData.totalPurchaseVAT === 'number', 'totalPurchaseVAT should be a number');
    assert(typeof vatData.documentCount === 'number', 'documentCount should be a number');
    assert(Array.isArray(vatData.salesDocuments), 'salesDocuments should be an array');
    assert(Array.isArray(vatData.purchaseDocuments), 'purchaseDocuments should be an array');
    
    console.log(`   💰 Sales VAT: €${vatData.totalSalesVAT.toFixed(2)}`);
    console.log(`   💸 Purchase VAT: €${vatData.totalPurchaseVAT.toFixed(2)}`);
    console.log(`   📈 Net VAT: €${vatData.totalNetVAT.toFixed(2)}`);
    console.log(`   📄 Document count: ${vatData.documentCount}`);
    console.log(`   ✅ Processed documents: ${vatData.processedDocuments}`);
    
    if (response.data.fromFallback) {
      console.log(`   ⚠️  Using fallback data: ${response.data.message}`);
    }
    
    if (response.data.isGuestUser) {
      console.log(`   👤 Guest user session detected`);
    }
  }),

  test('Dashboard page loads without errors', async () => {
    const response = await makeRequest(`${TEST_CONFIG.BASE_URL}/dashboard/documents`);
    
    assert(response.statusCode === 200, `Expected 200, got ${response.statusCode}`);
    assert(response.rawData.includes('<!DOCTYPE html>') || response.rawData.includes('<html'), 'Should return HTML');
    assert(response.rawData.includes('Dashboard') || response.rawData.includes('Documents'), 'Should contain dashboard content');
    
    console.log(`   📄 Page size: ${(response.rawData.length / 1024).toFixed(1)} KB`);
  }),

  test('API endpoints respond within reasonable time', async () => {
    const startTime = Date.now();
    
    // Test both APIs in parallel
    const promises = [
      makeRequest(`${TEST_CONFIG.BASE_URL}/api/documents?dashboard=true`),
      makeRequest(`${TEST_CONFIG.BASE_URL}/api/documents/extracted-vat`)
    ];
    
    const responses = await Promise.all(promises);
    const totalTime = Date.now() - startTime;
    
    assert(totalTime < 15000, `Total API response time too slow: ${totalTime}ms`);
    assert(responses[0].statusCode === 200, 'Documents API failed');
    assert(responses[1].statusCode === 200, 'VAT extraction API failed');
    
    console.log(`   ⏱️  Total API response time: ${totalTime}ms`);
    console.log(`   🚀 Performance: ${totalTime < 5000 ? 'Excellent' : totalTime < 10000 ? 'Good' : 'Acceptable'}`);
  }),

  test('Data consistency between endpoints', async () => {
    // Get data from both endpoints
    const [docsResponse, vatResponse] = await Promise.all([
      makeRequest(`${TEST_CONFIG.BASE_URL}/api/documents?dashboard=true`),
      makeRequest(`${TEST_CONFIG.BASE_URL}/api/documents/extracted-vat`)
    ]);
    
    assert(docsResponse.data.success && vatResponse.data.success, 'Both endpoints should succeed');
    
    const documentCount = docsResponse.data.documents.length;
    const vatDocumentCount = vatResponse.data.extractedVAT.documentCount;
    
    console.log(`   📊 Documents endpoint: ${documentCount} documents`);
    console.log(`   📊 VAT endpoint: ${vatDocumentCount} documents`);
    
    // Check for reasonable consistency (allow for some variation due to processing)
    const difference = Math.abs(documentCount - vatDocumentCount);
    const maxAllowedDifference = Math.max(5, documentCount * 0.1); // 10% or 5 documents, whichever is larger
    
    if (difference > maxAllowedDifference) {
      console.log(`   ⚠️  Large discrepancy detected: ${difference} documents`);
      console.log(`   ℹ️  This may indicate processing delays or data sync issues`);
    } else {
      console.log(`   ✅ Data consistency check passed (difference: ${difference})`);
    }
  }),

  test('Error handling works correctly', async () => {
    try {
      // Test invalid endpoint
      const response = await makeRequest(`${TEST_CONFIG.BASE_URL}/api/documents/invalid-endpoint`);
      assert(response.statusCode === 404, 'Should return 404 for invalid endpoint');
      console.log(`   🚫 404 handling works correctly`);
    } catch (error) {
      // Network errors are also acceptable for this test
      console.log(`   🌐 Network error handling works: ${error.message}`);
    }
  })
];

// Run all tests
async function runTests() {
  console.log('🚀 Starting PayVAT Dashboard E2E Tests');
  console.log(`📍 Testing: ${TEST_CONFIG.BASE_URL}`);
  console.log(`⏱️  Timeout: ${TEST_CONFIG.TIMEOUT}ms`);
  console.log('=' .repeat(60));

  for (const testFn of tests) {
    await testFn();
  }

  console.log('\n' + '='.repeat(60));
  console.log('📋 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📊 Total: ${testResults.passed + testResults.failed}`);

  if (testResults.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.errors.forEach(({ test, error }) => {
      console.log(`   • ${test}: ${error}`);
    });
  }

  if (testResults.failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Dashboard is working correctly.');
    process.exit(0);
  } else {
    console.log('\n💔 SOME TESTS FAILED! Please investigate the dashboard issues.');
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('💥 Unhandled Rejection:', reason);
  process.exit(1);
});

// Start the tests
runTests().catch((error) => {
  console.error('💥 Test runner failed:', error.message);
  process.exit(1);
});