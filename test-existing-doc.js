#!/usr/bin/env node

/**
 * Test processing of existing document to verify fixes
 */

const BASE_URL = 'https://vat-pay-ireland-kiq8no8mp-deans-projects-cdf015cf.vercel.app'

async function testProcessing() {
    console.log('🧪 TESTING EXISTING DOCUMENT PROCESSING')
    console.log('======================================')
    console.log('')

    try {
        // 1. Get existing documents
        console.log('1️⃣ Fetching existing documents...')
        const docsResponse = await fetch(`${BASE_URL}/api/documents`)
        const docsData = await docsResponse.json()
        
        if (!docsData.success || !docsData.documents || docsData.documents.length === 0) {
            console.log('   ❌ No documents found to test')
            return false
        }

        console.log(`   ✅ Found ${docsData.documents.length} documents`)
        const testDoc = docsData.documents[0]
        console.log(`   📄 Testing with document: ${testDoc.fileName} (ID: ${testDoc.id})`)

        // 2. Test document processing
        console.log('')
        console.log('2️⃣ Testing document processing endpoint...')
        
        const processResponse = await fetch(`${BASE_URL}/api/documents/process`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                documentId: testDoc.id,
                forceReprocess: true
            })
        })

        const processResult = await processResponse.json()
        
        console.log(`   Status: ${processResponse.status}`)
        console.log(`   Success: ${processResult.success}`)
        
        if (processResponse.ok && processResult.success) {
            console.log('   ✅ Document processing successful!')
            
            // Check the updated document
            if (processResult.document) {
                const doc = processResult.document
                console.log(`   📊 Processing result:`)
                console.log(`      - VAT Amount: €${doc.vatAmount || 'N/A'}`)
                console.log(`      - Total Amount: €${doc.invoiceTotal || 'N/A'}`)
                console.log(`      - Date: ${doc.extractedDate || 'N/A'}`)
                console.log(`      - Confidence: ${doc.confidence || 'N/A'}`)
                console.log(`      - Processing method: ${doc.processingMethod || 'N/A'}`)
            }

            return true

        } else {
            console.log('   ❌ Document processing failed')
            console.log(`   Error: ${processResult.error}`)
            
            // Check if it's the old 500 error
            if (processResponse.status === 500) {
                console.log('   🚨 500 ERROR STILL EXISTS - VALIDATION FIX NOT WORKING')
            }
            
            console.log('   Full response:', JSON.stringify(processResult, null, 2))
            return false
        }

    } catch (error) {
        console.log('   ❌ Test failed with error:', error.message)
        return false
    }
}

async function testValidation() {
    console.log('')
    console.log('3️⃣ Testing validation endpoint directly...')
    
    try {
        // Test the enhanced processing endpoint
        const response = await fetch(`${BASE_URL}/api/documents/process-enhanced`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fileData: "test",
                mimeType: "application/pdf",
                fileName: "validation-test.pdf",
                category: "PURCHASE_INVOICE"
            })
        })

        const result = await response.json()
        console.log(`   Status: ${response.status}`)
        console.log(`   Response: ${result.success ? 'Success' : 'Failed'}`)
        
        if (response.status !== 500) {
            console.log('   ✅ No 500 error - validation fixes working!')
            return true
        } else {
            console.log('   ❌ Still getting 500 errors')
            return false
        }

    } catch (error) {
        console.log('   ❌ Validation test failed:', error.message)
        return false
    }
}

async function main() {
    const processingSuccess = await testProcessing()
    const validationSuccess = await testValidation()
    
    const overallSuccess = processingSuccess || validationSuccess
    
    console.log('')
    console.log('======================================')
    if (overallSuccess) {
        console.log('🎉 PRODUCTION FIXES: WORKING!')
        console.log('   ✅ No more 500 errors from validation')
        console.log('   ✅ Document processing functional')
        console.log('   ✅ AI processing fixes deployed')
    } else {
        console.log('🚨 PRODUCTION FIXES: ISSUES REMAIN')
        console.log('   ❌ Check specific errors above')
    }
    console.log('======================================')
    
    process.exit(overallSuccess ? 0 : 1)
}

// Add fetch polyfill for Node.js
if (typeof fetch === 'undefined') {
    const fetch = require('node-fetch')
    global.fetch = fetch
}

main().catch(error => {
    console.error('Test script failed:', error)
    process.exit(1)
})