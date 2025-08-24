#!/usr/bin/env node

/**
 * Test script to check if dashboard timeout logic is working
 * This script waits 5 seconds before checking content to allow timeout to fire
 */

const https = require('https');

const TEST_URL = process.env.TEST_URL || 'https://vat-pay-ireland-7yvqh5fqw-deans-projects-cdf015cf.vercel.app';
const DASHBOARD_PATH = '/dashboard/documents';

console.log('🧪 Testing Dashboard Loading Timeout Logic');
console.log('📍 URL:', TEST_URL + DASHBOARD_PATH);
console.log('⏱️  Strategy: Wait 5 seconds to allow timeout to fire\n');

async function fetchWithTimeout(url, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({
        status: res.statusCode,
        headers: res.headers,
        body: data
      }));
    });
    
    req.on('error', reject);
    req.setTimeout(timeout, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function testLoadingTimeout() {
  try {
    console.log('📊 Step 1: Initial fetch (should show loading state)');
    const initialResponse = await fetchWithTimeout(TEST_URL + DASHBOARD_PATH);
    
    if (initialResponse.status !== 200) {
      console.log(`❌ Initial fetch failed: ${initialResponse.status}`);
      return false;
    }
    
    const initialContent = initialResponse.body;
    
    if (initialContent.includes('Loading dashboard...')) {
      console.log('✅ Initial state: Loading spinner detected');
    } else {
      console.log('⚠️  Initial state: No loading spinner found');
    }
    
    console.log('\n⏳ Step 2: Waiting 5 seconds for timeout logic to fire...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('📊 Step 3: Second fetch (should show dashboard or skip button)');
    const secondResponse = await fetchWithTimeout(TEST_URL + DASHBOARD_PATH);
    
    if (secondResponse.status !== 200) {
      console.log(`❌ Second fetch failed: ${secondResponse.status}`);
      return false;
    }
    
    const secondContent = secondResponse.body;
    
    // Check for various indicators that timeout fired
    const hasSkipButton = secondContent.includes('Skip Loading');
    const hasTimeoutMessage = secondContent.includes('Loading timeout reached');
    const hasMainContent = secondContent.includes('dashboard-stat') || 
                          secondContent.includes('document-section') || 
                          secondContent.includes('Documents Found') ||
                          secondContent.includes('VAT Summary');
    const stillLoading = secondContent.includes('Loading dashboard...');
    
    console.log('\n🔍 Analysis:');
    console.log('   Skip button present:', hasSkipButton ? '✅' : '❌');
    console.log('   Timeout message:', hasTimeoutMessage ? '✅' : '❌');
    console.log('   Main content:', hasMainContent ? '✅' : '❌');
    console.log('   Still loading:', stillLoading ? '❌' : '✅');
    
    if (hasMainContent && !stillLoading) {
      console.log('\n🎉 SUCCESS: Dashboard content loaded (timeout worked)');
      return true;
    } else if (hasSkipButton && !stillLoading) {
      console.log('\n⚠️  PARTIAL: Skip button available (timeout fired)');
      return true;
    } else if (stillLoading) {
      console.log('\n❌ FAILED: Still showing loading state after timeout');
      console.log('\n📄 Current page content preview:');
      console.log(secondContent.substring(0, 1000) + '...');
      return false;
    } else {
      console.log('\n❓ UNKNOWN: Unclear state');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

// Run the test
testLoadingTimeout().then(success => {
  if (success) {
    console.log('\n✅ TIMEOUT LOGIC TEST PASSED');
    process.exit(0);
  } else {
    console.log('\n❌ TIMEOUT LOGIC TEST FAILED');
    process.exit(1);
  }
});