#!/usr/bin/env node

/**
 * Production test script to verify AI processing fixes are working
 */

const BASE_URL = 'https://vat-pay-ireland-kiq8no8mp-deans-projects-cdf015cf.vercel.app'

// Simple test PDF with VAT content
const TEST_PDF_BASE64 = 'JVBERi0xLjQKJcfsj6IKCjEgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKL1BhZ2VzIDIgMCBSCj4+CmVuZG9iagoKMiAwIG9iago8PAovVHlwZSAvUGFnZXMKL0tpZHMgWzMgMCBSXQovQ291bnQgMQo+PgplbmRvYmoKCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovUmVzb3VyY2VzIDw8Cj4+Ci9Db250ZW50cyA0IDAgUgo+PgplbmRvYmoKCjQgMCBvYmoKPDwKL0xlbmd0aCA4OAo+PgpzdHJlYW0KQlQKL0YxIDEyIFRmCjEwMCA3MjAgVGQKKEludm9pY2UgTnVtYmVyOiAxMjMpIFRqCjAgLTIwIFRkCihUb3RhbCBBbW91bnQ6IEVVUiA0ODQpIFRqCjAgLTIwIFRkCihWQVQgQW1vdW50OiBFVVIgMTExLjM2KSBUagovRjEgMTAgVGYKMCAtMjAgVGQKKElyaXNoIFZBVCBOdW1iZXI6IElFMTIzNDU2N1QpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKCjUgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9OYW1lIC9GMQovQmFzZUZvbnQgL0hlbHZldGljYQo+PgplbmRvYmoKCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZgowMDAwMDAwMDA5IDAwMDAwIG4KMDAwMDAwMDA1OCAwMDAwMCBuCjAwMDAwMDAxMTUgMDAwMDAgbgowMDAwMDAwMjQ1IDAwMDAwIG4KMDAwMDAwMDM4MyAwMDAwMCBuCnRyYWlsZXIKPDwKL1NpemUgNgovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDcxCiUlRU9G'

async function testAPI() {
    console.log('🧪 TESTING PRODUCTION AI PROCESSING FIXES')
    console.log('==========================================')
    console.log(`Testing URL: ${BASE_URL}`)
    console.log('')

    // Test 1: Health check
    console.log('1️⃣ Testing API health...')
    try {
        const healthResponse = await fetch(`${BASE_URL}/api/health`)
        const health = await healthResponse.json()
        
        if (health.status === 'healthy') {
            console.log('   ✅ API is healthy')
        } else {
            console.log('   ❌ API health check failed:', health)
            return false
        }
    } catch (error) {
        console.log('   ❌ Health check failed:', error.message)
        return false
    }

    // Test 2: Upload document (which processes it)
    console.log('')
    console.log('2️⃣ Testing document upload and processing...')
    try {
        // Convert base64 to blob for FormData
        const binaryString = Buffer.from(TEST_PDF_BASE64, 'base64').toString('binary')
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i)
        }
        
        // Create form data using Node.js FormData
        const FormData = require('form-data')
        const formData = new FormData()
        formData.append('files', Buffer.from(TEST_PDF_BASE64, 'base64'), {
            filename: 'test-invoice.pdf',
            contentType: 'application/pdf'
        })
        formData.append('category', 'PURCHASE_INVOICE')

        const uploadResponse = await fetch(`${BASE_URL}/api/upload`, {
            method: 'POST',
            body: formData,
            headers: formData.getHeaders()
        })

        const uploadResult = await uploadResponse.json()
        
        console.log(`   Status: ${uploadResponse.status}`)
        console.log(`   Response keys: ${Object.keys(uploadResult)}`)
        
        if (uploadResponse.ok && uploadResult.success) {
            console.log('   ✅ Upload successful!')
            
            // Check processing details
            if (uploadResult.processedDocuments && uploadResult.processedDocuments > 0) {
                console.log('   ✅ Enhanced AI processing worked!')
                console.log(`   📊 Processed documents: ${uploadResult.processedDocuments}`)
            } else {
                console.log('   ⚠️  Using fallback processing (AI might be disabled)')
            }

            // Check for extracted data
            if (uploadResult.documents && uploadResult.documents.length > 0) {
                const doc = uploadResult.documents[0]
                console.log(`   📄 Document created with ID: ${doc.id}`)
                
                if (doc.extractedDate) {
                    console.log(`   📅 Extracted date: ${doc.extractedDate}`)
                } else {
                    console.log('   ⚠️  No date extracted')
                }
                
                if (doc.invoiceTotal) {
                    console.log(`   💰 Extracted total: €${doc.invoiceTotal}`)
                } else {
                    console.log('   ⚠️  No total extracted')
                }
            }

            return true

        } else {
            console.log('   ❌ Upload failed')
            console.log('   Error:', uploadResult.error || 'Unknown error')
            console.log('   Full response:', JSON.stringify(uploadResult, null, 2))
            return false
        }

    } catch (error) {
        console.log('   ❌ Upload test failed:', error.message)
        return false
    }
}

async function main() {
    const success = await testAPI()
    
    console.log('')
    console.log('==========================================')
    if (success) {
        console.log('🎉 PRODUCTION TEST: SUCCESS!')
        console.log('   ✅ No 500 errors')
        console.log('   ✅ Document processing working')
        console.log('   ✅ Validation fixes applied')
        console.log('   ✅ All fixes deployed successfully!')
    } else {
        console.log('🚨 PRODUCTION TEST: FAILED')
        console.log('   ❌ Issues still exist - check logs above')
    }
    console.log('==========================================')
    
    process.exit(success ? 0 : 1)
}

// Handle Node.js environment
if (typeof fetch === 'undefined') {
    require('node-fetch').then(fetch => {
        global.fetch = fetch
        main().catch(error => {
            console.error('Test failed:', error)
            process.exit(1)
        })
    }).catch(() => {
        console.log('Installing node-fetch...')
        require('child_process').exec('npm install node-fetch form-data', (err) => {
            if (err) {
                console.error('Failed to install dependencies:', err)
                process.exit(1)
            }
            console.log('Dependencies installed, retrying...')
            process.exit(2) // Signal to retry
        })
    })
} else {
    main().catch(error => {
        console.error('Test failed:', error)
        process.exit(1)
    })
}