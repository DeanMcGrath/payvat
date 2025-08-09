/**
 * Test the document processing API endpoint directly
 * This will help identify why it's returning 500 errors
 */

async function testProcessingEndpoint() {
  console.log('🧪 TESTING DOCUMENT PROCESSING ENDPOINT')
  console.log('=' .repeat(80))
  
  try {
    // Test 1: Test with invalid document ID (should return 404, not 500)
    console.log('\n1️⃣ Testing with invalid document ID...')
    
    const invalidResponse = await fetch('http://localhost:3000/api/documents/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documentId: 'invalid-doc-id-12345',
        forceReprocess: true,
        debugMode: false
      })
    })
    
    console.log(`   Status: ${invalidResponse.status} ${invalidResponse.statusText}`)
    
    if (!invalidResponse.ok) {
      const errorData = await invalidResponse.json()
      console.log('   Response:', JSON.stringify(errorData, null, 2))
      
      if (invalidResponse.status === 404) {
        console.log('   ✅ EXPECTED: Document not found returns 404')
      } else if (invalidResponse.status === 500) {
        console.log('   ❌ UNEXPECTED: Invalid document ID causes 500 error')
        console.log('   This suggests the endpoint is crashing before proper validation')
      } else {
        console.log(`   ⚠️ UNEXPECTED STATUS: ${invalidResponse.status}`)
      }
    }
    
    // Test 2: Test with missing document ID (should return 400, not 500)
    console.log('\n2️⃣ Testing with missing document ID...')
    
    const missingResponse = await fetch('http://localhost:3000/api/documents/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        forceReprocess: true,
        debugMode: false
      })
    })
    
    console.log(`   Status: ${missingResponse.status} ${missingResponse.statusText}`)
    
    if (!missingResponse.ok) {
      const errorData = await missingResponse.json()
      console.log('   Response:', JSON.stringify(errorData, null, 2))
      
      if (missingResponse.status === 400) {
        console.log('   ✅ EXPECTED: Missing document ID returns 400')
      } else if (missingResponse.status === 500) {
        console.log('   ❌ UNEXPECTED: Missing document ID causes 500 error')
        console.log('   This suggests the endpoint crashes during request parsing')
      }
    }
    
    // Test 3: Test with invalid JSON (should return 400, not 500)
    console.log('\n3️⃣ Testing with invalid JSON...')
    
    const invalidJSONResponse = await fetch('http://localhost:3000/api/documents/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: 'invalid json content'
    })
    
    console.log(`   Status: ${invalidJSONResponse.status} ${invalidJSONResponse.statusText}`)
    
    if (!invalidJSONResponse.ok) {
      const errorText = await invalidJSONResponse.text()
      console.log('   Response:', errorText)
      
      if (invalidJSONResponse.status === 400) {
        console.log('   ✅ EXPECTED: Invalid JSON returns 400')
      } else if (invalidJSONResponse.status === 500) {
        console.log('   ❌ UNEXPECTED: Invalid JSON causes 500 error')
        console.log('   This suggests the endpoint lacks proper JSON validation')
      }
    }
    
    console.log('\n📊 ENDPOINT HEALTH ASSESSMENT:')
    
    const tests = [
      { name: 'Invalid Document ID', expectedStatus: 404, actualStatus: invalidResponse.status },
      { name: 'Missing Document ID', expectedStatus: 400, actualStatus: missingResponse.status },
      { name: 'Invalid JSON', expectedStatus: 400, actualStatus: invalidJSONResponse.status }
    ]
    
    let healthyTests = 0
    let crashingTests = 0
    
    tests.forEach(test => {
      if (test.actualStatus === test.expectedStatus) {
        console.log(`   ✅ ${test.name}: Working correctly (${test.actualStatus})`)
        healthyTests++
      } else if (test.actualStatus === 500) {
        console.log(`   🚨 ${test.name}: CRASHING with 500 error`)
        crashingTests++
      } else {
        console.log(`   ⚠️ ${test.name}: Unexpected status ${test.actualStatus} (expected ${test.expectedStatus})`)
      }
    })
    
    console.log(`\n🎯 DIAGNOSIS:`)
    if (crashingTests === 0) {
      console.log('   ✅ ENDPOINT IS HEALTHY: No 500 errors detected')
      console.log('   The 500 errors in the console logs may be from specific document processing')
    } else {
      console.log(`   🚨 ENDPOINT IS UNSTABLE: ${crashingTests} basic tests cause 500 errors`)
      console.log('   The endpoint crashes before reaching proper error handling')
      console.log('   This needs immediate attention')
    }
    
  } catch (error) {
    console.error('\n🚨 ENDPOINT TEST ERROR:', error)
    console.error('Stack:', error.stack)
  }
}

// Test 4: Check if server is running and responsive
async function testServerHealth() {
  console.log('\n4️⃣ Testing server health...')
  
  try {
    const healthResponse = await fetch('http://localhost:3000/api/debug/test-vat-extraction')
    console.log(`   Debug endpoint status: ${healthResponse.status}`)
    
    if (healthResponse.ok) {
      console.log('   ✅ Server is running and responsive')
    } else {
      console.log('   ⚠️ Server issues detected')
    }
  } catch (error) {
    console.log('   ❌ Server not responding:', error.message)
  }
}

// Run all tests
console.log('🚀 Starting Document Processing Endpoint Tests...')
console.log(`🕒 Time: ${new Date().toISOString()}`)

Promise.resolve()
  .then(() => testServerHealth())
  .then(() => testProcessingEndpoint())
  .then(() => {
    console.log('\n' + '=' .repeat(80))
    console.log('✅ ENDPOINT TESTS COMPLETED')
    console.log('Check the results above to identify why the processing endpoint fails.')
    console.log('=' .repeat(80))
  })
  .catch(error => {
    console.error('\n🚨 OVERALL TEST FAILURE:', error)
  })