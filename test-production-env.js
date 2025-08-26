#!/usr/bin/env node

/**
 * Test the production environment to see why AI is disabled
 */

const BASE_URL = 'https://vat-pay-ireland-kiq8no8mp-deans-projects-cdf015cf.vercel.app'

async function testProductionEnv() {
    console.log('🔍 TESTING PRODUCTION ENVIRONMENT')
    console.log('=================================')
    console.log('')

    try {
        console.log('1️⃣ Testing a simple endpoint to trigger environment loading...')
        
        const response = await fetch(`${BASE_URL}/api/health`)
        const health = await response.json()
        
        if (health.status === 'healthy') {
            console.log('   ✅ Production environment is loading')
        }

        // Test an endpoint that would use AI
        console.log('')
        console.log('2️⃣ Testing AI status via simple prompt test...')
        
        // Create a simple request that would trigger AI checking
        const testResponse = await fetch(`${BASE_URL}/api/documents/process`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                documentId: 'env-test-12345'
            })
        })

        const testResult = await testResponse.json()
        console.log(`   Status: ${testResponse.status}`)
        console.log(`   Response: ${JSON.stringify(testResult)}`)

        // Look for any AI-related error messages in the response
        const responseStr = JSON.stringify(testResult)
        if (responseStr.includes('OpenAI') || responseStr.includes('AI')) {
            console.log('   🔍 Found AI-related messages in response')
        }

        return true

    } catch (error) {
        console.log('   ❌ Test failed:', error.message)
        return false
    }
}

// Add fetch polyfill for Node.js  
if (typeof fetch === 'undefined') {
    const fetch = require('node-fetch')
    global.fetch = fetch
}

testProductionEnv().then(() => {
    console.log('')
    console.log('=================================')
    console.log('Test completed - check output above for clues')
    console.log('=================================')
}).catch(error => {
    console.error('Test failed:', error)
    process.exit(1)
})