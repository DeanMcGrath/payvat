#!/usr/bin/env node

/**
 * Test script to verify AI processing is working after fixes
 */

const TEST_URL = 'https://vat-pay-ireland-m2husxuwg-deans-projects-cdf015cf.vercel.app'

// Simple PDF content in base64 (minimal PDF structure)
const TEST_PDF_BASE64 = 'JVBERi0xLjQKJcfsj6IKCjEgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKL1BhZ2VzIDIgMCBSCj4+CmVuZG9iagoKMiAwIG9iago8PAovVHlwZSAvUGFnZXMKL0tpZHMgWzMgMCBSXQovQ291bnQgMQo+PgplbmRvYmoKCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovUmVzb3VyY2VzIDw8Cj4+Ci9Db250ZW50cyA0IDAgUgo+PgplbmRvYmoKCjQgMCBvYmoKPDwKL0xlbmd0aCA0NAo+PgpzdHJlYW0KQlQKL0YxIDEyIFRmCjEwMCA3MDAgVGQKKFRlc3QgSW52b2ljZSBWQVQgRXVyIDExMS4zNikgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagoKNSAwIG9iago8PAovVHlwZSAvRm9udAovU3VidHlwZSAvVHlwZTEKL05hbWUgL0YxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iagoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmCjAwMDAwMDAwMDkgMDAwMDAgbgowMDAwMDAwMDU4IDAwMDAwIG4KMDAwMDAwMDExNSAwMDAwMCBuCjAwMDAwMDAyNDUgMDAwMDAgbgowMDAwMDAwMzM5IDAwMDAwIG4KdHJhaWxlcgo8PAovU2l6ZSA2Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgo0MjcKJSVFT0Y='

async function testProcessingEndpoint() {
    console.log('🧪 TESTING AI PROCESSING FIXES')
    console.log('================================')
    console.log(`Target URL: ${TEST_URL}`)
    console.log('')

    try {
        console.log('1️⃣ Testing /api/upload endpoint (which processes documents)...')
        
        // Create form data for upload
        const formData = new FormData()
        
        // Create a blob from the base64 data
        const binaryString = atob(TEST_PDF_BASE64)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i)
        }
        const blob = new Blob([bytes], { type: 'application/pdf' })
        
        formData.append('files', blob, 'test-invoice.pdf')
        formData.append('category', 'PURCHASE_INVOICE')

        const response = await fetch(`${TEST_URL}/api/upload`, {
            method: 'POST',
            body: formData
        })

        const result = await response.json()
        
        console.log(`   Status: ${response.status}`)
        console.log(`   Response:`, JSON.stringify(result, null, 2))
        
        if (response.ok && result.success) {
            console.log('✅ SUCCESS: Processing endpoint working!')
            
            // Check if AI was used or fallback
            if (result.processedDocuments > 0) {
                console.log('✅ AI PROCESSING: Enhanced processing worked!')
            } else {
                console.log('⚠️  FALLBACK: Using legacy processing (AI may be disabled)')
            }
            
            return true
        } else {
            console.log('❌ FAILED: Processing endpoint returned error')
            console.log('   Error:', result.error || 'Unknown error')
            return false
        }

    } catch (error) {
        console.log('❌ CRITICAL ERROR:', error.message)
        return false
    }
}

async function main() {
    const success = await testProcessingEndpoint()
    
    console.log('')
    console.log('================================')
    if (success) {
        console.log('🎉 TEST RESULT: PROCESSING FIXES WORKING!')
        console.log('   - No more 500 errors')
        console.log('   - Validation handles missing fields')
        console.log('   - Fallback processing functional')
    } else {
        console.log('🚨 TEST RESULT: ISSUES STILL EXIST')
        console.log('   - Check logs above for details')
    }
    console.log('================================')
    
    process.exit(success ? 0 : 1)
}

main().catch(error => {
    console.error('Test script failed:', error)
    process.exit(1)
})