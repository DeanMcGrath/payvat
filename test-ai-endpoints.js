#!/usr/bin/env node

const http = require('http')

console.log('🧪 Testing AI System API Endpoints...\n')

async function testEndpoint(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'AI-System-Test/1.0'
      }
    }

    const req = http.request(options, (res) => {
      let body = ''
      
      res.on('data', (chunk) => {
        body += chunk
      })
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body)
          resolve({ status: res.statusCode, data: parsed })
        } catch (e) {
          resolve({ status: res.statusCode, data: body })
        }
      })
    })

    req.on('error', (err) => {
      reject(err)
    })

    if (data) {
      req.write(JSON.stringify(data))
    }
    
    req.end()
  })
}

async function testAISystem() {
  console.log('🌐 Starting local server test...')
  
  const tests = [
    {
      name: 'Health Check',
      endpoint: '/api/health',
      expected: { status: 200 }
    },
    {
      name: 'AI Metrics Endpoint',
      endpoint: '/api/admin/ai/metrics',
      expected: { status: 200, hasSuccess: true }
    },
    {
      name: 'Learning Pipeline Status',
      endpoint: '/api/admin/ai/learning?action=status',
      expected: { status: 200, hasSuccess: true }
    },
    {
      name: 'Learning Pipeline Metrics',
      endpoint: '/api/admin/ai/learning?action=metrics',
      expected: { status: 200, hasSuccess: true }
    }
  ]

  let passed = 0
  let failed = 0

  for (const test of tests) {
    console.log(`\n🔍 Testing ${test.name}...`)
    
    try {
      const result = await testEndpoint(test.endpoint)
      
      if (result.status === test.expected.status) {
        if (test.expected.hasSuccess && result.data?.success) {
          console.log(`✅ ${test.name}: PASSED (${result.status})`)
          passed++
        } else if (!test.expected.hasSuccess) {
          console.log(`✅ ${test.name}: PASSED (${result.status})`)
          passed++
        } else {
          console.log(`❌ ${test.name}: FAILED - Expected success:true, got:`, result.data?.success)
          failed++
        }
      } else {
        console.log(`❌ ${test.name}: FAILED - Expected ${test.expected.status}, got ${result.status}`)
        failed++
      }
      
    } catch (error) {
      console.log(`❌ ${test.name}: FAILED - ${error.message}`)
      failed++
    }
  }

  console.log(`\n📊 Test Results:`)
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`)

  if (failed === 0) {
    console.log('\n🎉 All AI system endpoints are working correctly!')
  } else {
    console.log('\n⚠️  Some endpoints need attention. Make sure the server is running on localhost:3000')
  }
}

testAISystem().catch((error) => {
  console.error('Test runner failed:', error)
  console.log('\n💡 Tip: Make sure to run `npm run dev` in another terminal first')
})