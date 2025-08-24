#!/usr/bin/env node

const https = require('https');

const testUrl = (url, name) => {
  return new Promise((resolve) => {
    console.log(`\n🧪 Testing ${name}: ${url}`);
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const success = res.statusCode === 200;
        console.log(`Status: ${res.statusCode} ${success ? '✅' : '❌'}`);
        
        if (success) {
          console.log('🎉 SUCCESS!');
          try {
            const json = JSON.parse(data);
            console.log(`Documents returned: ${json.documents?.length || 0}`);
            if (json.extractedVAT) {
              console.log(`VAT data available: ✅`);
            }
          } catch (e) {}
        } else {
          try {
            const json = JSON.parse(data);
            console.log(`Error: ${json.error}`);
          } catch (e) {
            console.log(`Raw error: ${data}`);
          }
        }
        resolve(success);
      });
    }).on('error', (err) => {
      console.error(`❌ Request failed: ${err.message}`);
      resolve(false);
    });
  });
};

async function runTests() {
  console.log('🚀 TESTING FINAL DASHBOARD FIX');
  console.log('===============================');
  
  const urls = [
    'https://vat-pay-ireland-f2zrevoqo-deans-projects-cdf015cf.vercel.app/api/documents?dashboard=true',
    'https://vat-pay-ireland-f2zrevoqo-deans-projects-cdf015cf.vercel.app/api/documents/extracted-vat'
  ];
  
  let allPassed = true;
  
  for (let i = 0; i < urls.length; i++) {
    const name = i === 0 ? 'Documents API' : 'VAT API';
    const passed = await testUrl(urls[i], name);
    if (!passed) allPassed = false;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n===============================');
  if (allPassed) {
    console.log('🎉🎉 ALL TESTS PASSED! DASHBOARD IS FIXED! 🎉🎉');
  } else {
    console.log('❌ Some tests failed - more fixes needed');
  }
  console.log('===============================');
}

runTests();