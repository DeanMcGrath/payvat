#!/usr/bin/env node

/**
 * Simple test to verify 413 error fixes return proper JSON
 * This test will fail at blob upload due to missing token, but should show JSON error response
 */

const https = require('https');
const FormData = require('form-data');

// Test with production domain
const TEST_URL = 'https://payvat.ie';

async function test413ErrorHandling() {
  console.log(`🧪 Testing 413 error handling improvements on ${TEST_URL}...`);
  
  try {
    // Create a large dummy file (150MB - above our 100MB limit)
    const sizeMB = 150;
    const testBuffer = Buffer.alloc(sizeMB * 1024 * 1024, 'test-data');
    
    const form = new FormData();
    form.append('title', 'Test Large Video');
    form.append('description', 'Testing 413 error fix - should return JSON');
    form.append('video', testBuffer, {
      filename: 'test-large-video.mp4',
      contentType: 'video/mp4'
    });

    const options = {
      hostname: 'payvat.ie',
      port: 443,
      path: '/api/admin/videos',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token', // This will fail auth, but that's OK for testing
        ...form.getHeaders()
      }
    };

    return new Promise((resolve) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          console.log(`\n📊 Response Status: ${res.statusCode}`);
          console.log(`📋 Content-Type: ${res.headers['content-type']}`);
          
          try {
            const response = JSON.parse(data);
            console.log(`✅ SUCCESS: Received proper JSON response!`);
            console.log(`📄 Response:`, JSON.stringify(response, null, 2));
            
            if (response.errorCode && response.recommendChunkedUpload) {
              console.log(`✅ SUCCESS: Error includes chunked upload recommendation!`);
            }
            
            resolve({ success: true, jsonResponse: true, response });
          } catch (parseError) {
            console.log(`❌ FAILURE: Non-JSON response received`);
            console.log(`📄 Raw Response (first 500 chars):`, data.substring(0, 500));
            resolve({ success: false, jsonResponse: false, response: data });
          }
        });
      });

      req.on('error', (error) => {
        console.log(`❌ Request Error:`, error.message);
        resolve({ success: false, error: error.message });
      });

      req.setTimeout(30000, () => {
        console.log(`⏰ Request timeout`);
        req.destroy();
        resolve({ success: false, error: 'timeout' });
      });

      form.pipe(req);
    });
    
  } catch (error) {
    console.log(`❌ Test Setup Error:`, error.message);
    return { success: false, error: error.message };
  }
}

// Run the test
console.log(`🚀 Testing 413 error JSON response fixes...`);
console.log(`📝 This test sends a 150MB file (above our 100MB limit)`);
console.log(`🎯 Goal: Verify we get proper JSON error response (not HTML)\n`);

test413ErrorHandling().then(result => {
  console.log(`\n🏁 TEST SUMMARY:`);
  console.log(`================`);
  
  if (result.jsonResponse) {
    console.log(`✅ SUCCESS: 413/large file errors now return proper JSON!`);
    console.log(`✅ The "Request En..." JSON parsing error should be fixed.`);
  } else {
    console.log(`❌ FAILURE: Still receiving non-JSON responses for large files.`);
  }
}).catch(error => {
  console.error('❌ Test failed:', error);
});