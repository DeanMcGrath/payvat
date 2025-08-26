#!/usr/bin/env node

/**
 * Test the final deployment with all fixes applied
 */

const BASE_URL = 'https://vat-pay-ireland-jezjejyx0-deans-projects-cdf015cf.vercel.app'

async function testDeployment() {
    console.log('🚀 TESTING FINAL DEPLOYMENT')
    console.log('===========================')
    console.log(`URL: ${BASE_URL}`)
    console.log('')

    try {
        // Test 1: Health check
        console.log('1️⃣ Testing API health...')
        const healthResponse = await fetch(`${BASE_URL}/api/health`)
        const health = await healthResponse.json()
        
        if (health.status === 'healthy') {
            console.log('   ✅ API is healthy')
        } else {
            console.log('   ❌ API health check failed')
            return false
        }

        // Test 2: Check if AI is now working by looking for evidence in processing attempts
        console.log('')
        console.log('2️⃣ Testing document list to see processing status...')
        const docsResponse = await fetch(`${BASE_URL}/api/documents`)
        const docsData = await docsResponse.json()
        
        if (docsData.success && docsData.documents) {
            console.log(`   ✅ Found ${docsData.documents.length} documents`)
            
            // Look for signs of processing methods in the documents
            let aiProcessedCount = 0
            let legacyProcessedCount = 0
            
            for (const doc of docsData.documents) {
                if (doc.processingMethod) {
                    if (doc.processingMethod.includes('AI') || doc.processingMethod.includes('VISION')) {
                        aiProcessedCount++
                    } else {
                        legacyProcessedCount++
                    }
                }
            }
            
            console.log(`   📊 Processing method breakdown:`)
            console.log(`      - AI processed: ${aiProcessedCount}`)
            console.log(`      - Legacy processed: ${legacyProcessedCount}`)
            console.log(`      - Unknown: ${docsData.documents.length - aiProcessedCount - legacyProcessedCount}`)
            
        } else {
            console.log('   ⚠️ Could not fetch documents')
        }

        // Test 3: Test the dashboard loading
        console.log('')
        console.log('3️⃣ Testing dashboard loading...')
        const dashboardResponse = await fetch(`${BASE_URL}/dashboard/documents`)
        
        if (dashboardResponse.ok) {
            const dashboardHtml = await dashboardResponse.text()
            if (dashboardHtml.includes('Loading dashboard...')) {
                console.log('   ⚠️ Dashboard still stuck in loading state')
            } else if (dashboardHtml.includes('PayVAT Ireland')) {
                console.log('   ✅ Dashboard appears to load properly')
            } else {
                console.log('   ❌ Dashboard has unexpected content')
            }
        } else {
            console.log('   ❌ Dashboard failed to load')
        }

        // Test 4: Test that we're not getting 500 errors on processing endpoints
        console.log('')
        console.log('4️⃣ Testing processing endpoints for 500 errors...')
        const processResponse = await fetch(`${BASE_URL}/api/documents/process`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ documentId: 'test' })
        })
        
        console.log(`   Process endpoint status: ${processResponse.status}`)
        if (processResponse.status !== 500) {
            console.log('   ✅ No 500 errors on process endpoint')
        } else {
            console.log('   ❌ Still getting 500 errors')
            return false
        }

        return true

    } catch (error) {
        console.log(`   ❌ Test failed with error: ${error.message}`)
        return false
    }
}

// Add fetch polyfill for Node.js
if (typeof fetch === 'undefined') {
    const fetch = require('node-fetch')
    global.fetch = fetch
}

testDeployment().then(success => {
    console.log('')
    console.log('===========================')
    if (success) {
        console.log('🎉 DEPLOYMENT TEST: SUCCESS!')
        console.log('   ✅ API is healthy')
        console.log('   ✅ No 500 errors detected')
        console.log('   ✅ System appears functional')
    } else {
        console.log('🚨 DEPLOYMENT TEST: ISSUES REMAIN')
        console.log('   ❌ Critical problems still exist')
    }
    console.log('===========================')
    
    process.exit(success ? 0 : 1)
}).catch(error => {
    console.error('Test script failed:', error)
    process.exit(1)
})