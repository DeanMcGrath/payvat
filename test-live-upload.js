#!/usr/bin/env node
/**
 * Test script to actually upload a document to the live system and verify extraction
 */

const fs = require('fs');
const https = require('https');

// Create test document content (VW invoice format that should extract €111.36)
// Since we can't upload .txt files, let's test by creating a document via the debug API first
const testDocumentContent = `
VOLKSWAGEN FINANCIAL SERVICES INVOICE

Invoice Number: VFS-001-2024  
Date: 2024-08-08

From: Volkswagen Financial Services
VAT Number: IE1234567T
Address: Dublin, Ireland

Service Details:
Service Price Excl. VAT: €90.85
Service Price Incl. VAT: €111.73

VAT Breakdown:
VAT MIN    €1.51
VAT NIL    €0.00  
VAT STD23  €109.85
Total Amount VAT: €111.36

Payment Due: €111.73
Payment Terms: 30 days
`.trim();

async function testLiveUpload() {
  console.log('🧪 TESTING LIVE DOCUMENT PROCESSING ON payvat.ie');
  console.log('📄 Since upload requires PDF/image files, using debug API to create test document...');
  
  try {
    console.log('🔧 Step 1: Create test document via debug API');
    
    const createOptions = {
      hostname: 'payvat.ie',
      port: 443,
      path: '/api/debug/create-test-doc',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const createResult = await new Promise((resolve, reject) => {
      const req = https.request(createOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            console.log(`   Create Response Status: ${res.statusCode}`);
            const result = JSON.parse(data);
            console.log(`   Create Success: ${result.success}`);
            if (result.document) {
              console.log(`   Document ID: ${result.document.id}`);
              console.log(`   File Name: ${result.document.fileName}`);
              console.log(`   Contains €111.36: ${result.document.debugInfo?.contains111_36}`);
            }
            if (result.error) {
              console.log(`   Error: ${result.error}`);
            }
            resolve(result);
          } catch (e) {
            console.log('   Raw response:', data);
            reject(e);
          }
        });
      });
      
      req.on('error', reject);
      req.write('{}'); // Empty POST body
      req.end();
    });
    
    if (!createResult.success || !createResult.document) {
      console.log('❌ Test document creation failed:', createResult.error || 'Unknown error');
      return false;
    }
    
    const documentId = createResult.document.id;
    console.log(`✅ Test document created! Document ID: ${documentId}`);
    
    // Wait a moment for processing
    console.log('⏳ Waiting 3 seconds for document processing...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('🔧 Step 2: Check processing result via /api/documents/process');
    
    const processOptions = {
      hostname: 'payvat.ie',
      port: 443,
      path: '/api/documents/process',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const processRequestBody = JSON.stringify({
      documentId: documentId,
      forceReprocess: true
    });
    
    const processResult = await new Promise((resolve, reject) => {
      const req = https.request(processOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            console.log(`   Process Response Status: ${res.statusCode}`);
            const result = JSON.parse(data);
            console.log(`   Process Success: ${result.success}`);
            
            if (result.document) {
              console.log(`   Is Scanned: ${result.document.isScanned}`);
              console.log(`   Scan Result: ${result.document.scanResult}`);
            }
            
            if (result.extractedData) {
              console.log('   📊 EXTRACTED VAT DATA:');
              console.log(`      Sales VAT: €${result.extractedData.salesVAT?.join(', €') || 'none'}`);
              console.log(`      Purchase VAT: €${result.extractedData.purchaseVAT?.join(', €') || 'none'}`);
              console.log(`      Confidence: ${Math.round((result.extractedData.confidence || 0) * 100)}%`);
              
              // Check for expected €111.36
              const allVAT = [...(result.extractedData.salesVAT || []), ...(result.extractedData.purchaseVAT || [])];
              const found111_36 = allVAT.some(amount => Math.abs(amount - 111.36) < 0.01);
              console.log(`      Found €111.36: ${found111_36 ? '✅ SUCCESS' : '❌ FAILED'}`);
              
              if (found111_36) {
                console.log('\\n🎉 LIVE TEST PASSED: System correctly extracted €111.36!');
                return resolve(result);
              } else {
                console.log(`\\n❌ LIVE TEST FAILED: Expected €111.36, got €${allVAT.join(', €') || '0'}`);
              }
            } else {
              console.log('❌ No extracted data returned');
            }
            
            if (result.error) {
              console.log(`   Error: ${result.error}`);
            }
            
            resolve(result);
          } catch (e) {
            console.log('   Raw response:', data);
            reject(e);
          }
        });
      });
      
      req.on('error', reject);
      req.write(processRequestBody);
      req.end();
    });
    
    return processResult.success && 
           processResult.extractedData &&
           [...(processResult.extractedData.salesVAT || []), ...(processResult.extractedData.purchaseVAT || [])].some(amount => Math.abs(amount - 111.36) < 0.01);
           
  } catch (error) {
    console.error('❌ Live test failed:', error.message);
    return false;
  }
}

// Run the test
testLiveUpload().then(success => {
  console.log('\\n' + '='.repeat(60));
  if (success) {
    console.log('🎉 LIVE SYSTEM TEST: PASSED ✅');
    console.log('   System correctly extracts €111.36 from uploaded documents');
  } else {
    console.log('💥 LIVE SYSTEM TEST: FAILED ❌'); 
    console.log('   System is NOT working - documents return €0 instead of €111.36');
  }
  console.log('='.repeat(60));
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('💥 LIVE SYSTEM TEST: CRASHED ❌');
  console.error('Error:', error.message);
  process.exit(1);
});