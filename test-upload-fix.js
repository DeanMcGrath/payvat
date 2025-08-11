#!/usr/bin/env node

/**
 * Test script to verify video upload 413 error fixes
 * Tests various file sizes and validates JSON responses
 */

const https = require('https');
const FormData = require('form-data');

// Test configuration
const TEST_URL = process.env.TEST_URL || 'http://localhost:3000';
const TEST_TOKEN = process.env.TEST_TOKEN || 'your-admin-token-here';

// Create test files of different sizes
function createTestBuffer(sizeMB) {
  const sizeBytes = sizeMB * 1024 * 1024;
  return Buffer.alloc(sizeBytes, 'test-video-data');
}

// Test function
async function testUpload(sizeMB, description) {
  console.log(`\n🧪 Testing ${description} (${sizeMB}MB file)...`);
  
  try {
    const testBuffer = createTestBuffer(sizeMB);
    const form = new FormData();
    
    // Add form fields
    form.append('title', `Test Video ${sizeMB}MB`);
    form.append('description', `Test upload of ${sizeMB}MB file for 413 error fix validation`);
    form.append('video', testBuffer, {
      filename: `test-video-${sizeMB}mb.mp4`,
      contentType: 'video/mp4'
    });

    const options = {
      hostname: TEST_URL.includes('localhost') ? 'localhost' : new URL(TEST_URL).hostname,
      port: TEST_URL.includes('localhost') ? 3000 : 443,
      path: '/api/admin/videos',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        ...form.getHeaders()
      }
    };

    const protocol = TEST_URL.startsWith('https') ? https : require('http');
    
    return new Promise((resolve) => {
      const req = protocol.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            console.log(`✅ Status: ${res.statusCode}`);
            console.log(`📄 Response:`, JSON.stringify(response, null, 2));
            
            // Validate response structure
            if (response.success !== undefined && response.error !== undefined) {
              console.log(`✅ Valid JSON structure returned`);
            } else {
              console.log(`❌ Invalid JSON structure`);
            }
            
            resolve({ statusCode: res.statusCode, response, success: true });
          } catch (parseError) {
            console.log(`❌ JSON Parse Error:`, parseError.message);
            console.log(`📄 Raw Response:`, data.substring(0, 500) + '...');
            resolve({ statusCode: res.statusCode, response: data, success: false });
          }
        });
      });

      req.on('error', (error) => {
        console.log(`❌ Request Error:`, error.message);
        resolve({ error: error.message, success: false });
      });

      req.setTimeout(30000, () => {
        console.log(`⏰ Request timeout`);
        req.destroy();
        resolve({ error: 'timeout', success: false });
      });

      form.pipe(req);
    });
    
  } catch (error) {
    console.log(`❌ Test Error:`, error.message);
    return { error: error.message, success: false };
  }
}

// Main test suite
async function runTests() {
  console.log(`🚀 Starting video upload fix validation tests`);
  console.log(`🌐 Testing against: ${TEST_URL}`);
  
  const tests = [
    { size: 1, desc: "Small file (should succeed)" },
    { size: 50, desc: "Medium file (should succeed)" },
    { size: 150, desc: "Large file (should recommend chunked upload)" },
    { size: 300, desc: "Very large file (should recommend chunked upload)" }
  ];
  
  const results = [];
  
  for (const test of tests) {
    const result = await testUpload(test.size, test.desc);
    results.push({ ...test, result });
    
    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  console.log(`\n📊 TEST SUMMARY:`);
  console.log(`==================`);
  
  let passed = 0;
  let failed = 0;
  
  results.forEach(({ size, desc, result }) => {
    if (result.success && result.response && typeof result.response === 'object') {
      console.log(`✅ ${desc}: JSON response received`);
      passed++;
    } else {
      console.log(`❌ ${desc}: Failed or non-JSON response`);
      failed++;
    }
  });
  
  console.log(`\n🎯 Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log(`🎉 All tests passed! 413 errors should now return proper JSON responses.`);
  } else {
    console.log(`⚠️  Some tests failed. Check the responses above for details.`);
  }
}

// Check if running as main module
if (require.main === module) {
  console.log(`📋 Note: This test requires a running server and valid admin token.`);
  console.log(`🔧 Set TEST_URL and TEST_TOKEN environment variables if needed.`);
  console.log(`⚡ Example: TEST_URL=http://localhost:3000 TEST_TOKEN=your-token node test-upload-fix.js\n`);
  
  runTests().catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = { testUpload, runTests };