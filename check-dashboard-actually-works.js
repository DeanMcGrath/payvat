#!/usr/bin/env node

const https = require('https');

function testDashboardPage(url) {
  return new Promise((resolve) => {
    console.log(`Testing dashboard page: ${url}`);
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        // Check for actual dashboard content, not just loading
        const hasDocumentTable = data.includes('document') && (data.includes('table') || data.includes('grid'));
        const hasVATStats = data.includes('VAT') && (data.includes('€') || data.includes('EUR'));
        const hasFilterControls = data.includes('filter') || data.includes('search');
        const hasUploadButton = data.includes('upload') || data.includes('Upload');
        const isStillLoading = data.includes('Loading dashboard') || data.includes('loading...');
        const hasErrorMessage = data.includes('error') || data.includes('Error');
        
        // Look for specific dashboard elements
        const hasStatCards = data.includes('StatCard') || data.includes('stat');
        const hasDocumentSection = data.includes('DocumentSection');
        const hasDashboardContent = data.includes('dashboard') && !isStillLoading;
        
        console.log(`\n=== DASHBOARD ANALYSIS ===`);
        console.log(`Status: ${res.statusCode}`);
        console.log(`Still Loading: ${isStillLoading ? '❌' : '✅'}`);
        console.log(`Has Document Table: ${hasDocumentTable ? '✅' : '❌'}`);
        console.log(`Has VAT Statistics: ${hasVATStats ? '✅' : '❌'}`);
        console.log(`Has Filter Controls: ${hasFilterControls ? '✅' : '❌'}`);
        console.log(`Has Upload Button: ${hasUploadButton ? '✅' : '❌'}`);
        console.log(`Has Stat Cards: ${hasStatCards ? '✅' : '❌'}`);
        console.log(`Has Document Section: ${hasDocumentSection ? '✅' : '❌'}`);
        console.log(`Has Dashboard Content: ${hasDashboardContent ? '✅' : '❌'}`);
        console.log(`Has Error Message: ${hasErrorMessage ? '❌' : '✅'}`);
        
        const working = !isStillLoading && !hasErrorMessage && (hasDocumentTable || hasVATStats || hasStatCards);
        
        console.log(`\n=== FINAL RESULT ===`);
        console.log(`Dashboard Working: ${working ? '✅ YES' : '❌ NO'}`);
        
        if (!working) {
          // Show a sample of the content to debug
          console.log(`\nPage content sample (first 500 chars):`);
          console.log(data.substring(0, 500));
        }
        
        resolve(working);
      });
    }).on('error', (err) => {
      console.error(`Request failed: ${err.message}`);
      resolve(false);
    });
  });
}

async function checkBothUrls() {
  console.log('🔍 CHECKING IF DASHBOARD ACTUALLY WORKS');
  console.log('=====================================');
  
  const urls = [
    'https://vat-pay-ireland-f2zrevoqo-deans-projects-cdf015cf.vercel.app/dashboard/documents',
    'https://payvat.ie/dashboard/documents'
  ];
  
  for (let i = 0; i < urls.length; i++) {
    const name = i === 0 ? 'NEW DEPLOYMENT' : 'MAIN DOMAIN';
    console.log(`\n📍 Testing ${name}:`);
    
    const working = await testDashboardPage(urls[i]);
    
    if (working) {
      console.log(`\n🎉 SUCCESS! Dashboard is working on ${name}`);
      return true;
    } else {
      console.log(`\n❌ Dashboard not working on ${name}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n=====================================');
  console.log('❌ DASHBOARD IS NOT WORKING ON EITHER URL');
  console.log('The APIs work but the UI is not loading properly.');
  return false;
}

checkBothUrls();