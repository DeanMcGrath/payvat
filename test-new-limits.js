#!/usr/bin/env node

/**
 * Test the updated 4MB file size limits and JSON error responses
 */

const https = require('https');
const FormData = require('form-data');

const TEST_URL = 'https://payvat.ie';

async function testNewLimits() {
  console.log(`🧪 Testing updated file size limits and JSON responses...`);
  console.log(`🌐 Testing against: ${TEST_URL}\n`);
  
  // Test 1: File above 4MB limit (should get our JSON response)
  console.log(`📊 TEST 1: 6MB file (above 4MB limit) - should get our JSON response`);
  await testUpload(6, "Above limit test");
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 2: File at 3MB (should pass size check but fail at blob storage due to missing token)
  console.log(`\n📊 TEST 2: 3MB file (within limit) - should reach blob storage and fail with proper JSON`);
  await testUpload(3, "Within limit test");
}

async function testUpload(sizeMB, description) {
  try {
    const testBuffer = Buffer.alloc(sizeMB * 1024 * 1024, 'test-video-data');
    const form = new FormData();
    
    form.append('title', `Test Video ${sizeMB}MB`);
    form.append('description', `Testing ${description}`);
    form.append('video', testBuffer, {
      filename: `test-video-${sizeMB}mb.mp4`,
      contentType: 'video/mp4'
    });

    const options = {
      hostname: 'payvat.ie',
      port: 443,
      path: '/api/admin/videos',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token', // Will fail auth but that's OK for size testing
        ...form.getHeaders()
      }
    };

    return new Promise((resolve) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          console.log(`  Status: ${res.statusCode}`);
          console.log(`  Content-Type: ${res.headers['content-type']}`);
          
          try {
            const response = JSON.parse(data);
            console.log(`  ✅ JSON Response: ${response.success ? 'Success' : response.error}`);
            if (response.errorCode) {
              console.log(`  📋 Error Code: ${response.errorCode}`);
            }
            if (response.recommendChunkedUpload) {
              console.log(`  ✅ Recommends chunked upload: Yes`);
            }
            resolve({ success: true, jsonResponse: true, response });
          } catch (parseError) {
            console.log(`  ❌ Non-JSON response received`);
            console.log(`  Raw: ${data.substring(0, 200)}...`);
            resolve({ success: false, jsonResponse: false, response: data });
          }
        });
      });

      req.on('error', (error) => {
        console.log(`  ❌ Request Error: ${error.message}`);
        resolve({ success: false, error: error.message });
      });

      req.setTimeout(30000, () => {
        console.log(`  ⏰ Request timeout`);
        req.destroy();
        resolve({ success: false, error: 'timeout' });
      });

      form.pipe(req);
    });
    
  } catch (error) {
    console.log(`  ❌ Test Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

testNewLimits().then(() => {
  console.log(`\n🏁 SUMMARY:`);
  console.log(`If both tests returned JSON responses, the 413 error fix is working!`);
  console.log(`The "Request En..." JSON parsing error should now be resolved.`);
}).catch(error => {
  console.error('❌ Test suite failed:', error);
});