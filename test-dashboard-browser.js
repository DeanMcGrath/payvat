#!/usr/bin/env node

/**
 * Test dashboard loading with detailed browser-like behavior
 */

const https = require('https');
const http = require('http');
const fs = require('fs');

const TEST_URL = 'https://payvat.ie/dashboard/documents';

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestModule = urlObj.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        ...options.headers
      },
      timeout: 60000 // 60 second timeout
    };

    const req = requestModule.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
          rawData: data
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function testDashboard() {
  try {
    console.log('🔍 Testing Dashboard Page Loading...');
    console.log('URL:', TEST_URL);
    console.log('=' .repeat(60));

    const startTime = Date.now();
    const response = await makeRequest(TEST_URL);
    const loadTime = Date.now() - startTime;

    console.log(`📊 Status: ${response.statusCode}`);
    console.log(`⏱️ Load Time: ${loadTime}ms`);
    console.log(`📄 Content Length: ${response.rawData.length} bytes`);

    // Check for key indicators in the HTML
    const html = response.rawData;
    
    console.log('\n🔍 Content Analysis:');
    
    // Check for loading indicators
    if (html.includes('Loading dashboard...')) {
      console.log('❌ Page stuck in "Loading dashboard..." state');
    } else {
      console.log('✅ No loading message found');
    }

    // Check for error messages
    if (html.includes('Error Loading Dashboard')) {
      console.log('❌ Dashboard error detected');
    } else {
      console.log('✅ No error message found');
    }

    // Check for React hydration issues
    if (html.includes('hydrationError') || html.includes('hydration-error')) {
      console.log('❌ React hydration errors detected');
    } else {
      console.log('✅ No hydration errors found');
    }

    // Check for JavaScript errors
    if (html.includes('script error') || html.includes('Uncaught') || html.includes('TypeError')) {
      console.log('❌ JavaScript errors may be present');
    } else {
      console.log('✅ No obvious JavaScript errors');
    }

    // Check for Next.js content
    if (html.includes('__NEXT_DATA__')) {
      console.log('✅ Next.js data found - page is server-side rendered');
    } else {
      console.log('❌ Missing Next.js data - rendering issue');
    }

    // Check for dashboard-specific content
    if (html.includes('Document Management') || html.includes('VAT documents')) {
      console.log('✅ Dashboard content found');
    } else {
      console.log('❌ Dashboard content missing');
    }

    // Look for meta tags
    if (html.includes('<meta') && html.includes('PayVAT')) {
      console.log('✅ Meta tags present - page structure OK');
    } else {
      console.log('❌ Meta tags missing - page structure issue');
    }

    // Save raw HTML for inspection
    const filename = `dashboard-test-${Date.now()}.html`;
    fs.writeFileSync(filename, html);
    console.log(`\n💾 Raw HTML saved to: ${filename}`);

    // Extract any console errors from inline scripts
    const scriptMatches = html.match(/<script[^>]*>(.*?)<\/script>/gs);
    if (scriptMatches) {
      console.log(`\n📜 Found ${scriptMatches.length} script tags`);
      
      let hasConsoleErrors = false;
      scriptMatches.forEach((script, i) => {
        if (script.includes('console.error') || script.includes('console.warn')) {
          hasConsoleErrors = true;
        }
      });
      
      if (hasConsoleErrors) {
        console.log('⚠️  Console errors/warnings may be present in scripts');
      } else {
        console.log('✅ No console errors found in inline scripts');
      }
    }

    console.log('\n' + '='.repeat(60));
    
    if (html.includes('Loading dashboard...')) {
      console.log('🚨 ISSUE: Dashboard is stuck in loading state');
      console.log('💡 This suggests:');
      console.log('   • JavaScript is not executing properly');
      console.log('   • API calls are failing or timing out');
      console.log('   • React hydration issues');
      console.log('   • Client-side routing problems');
      
      // Test the API endpoints directly
      console.log('\n🔧 Testing API endpoints directly...');
      
      try {
        const apiTest1 = await makeRequest('https://payvat.ie/api/documents?dashboard=true');
        console.log(`📡 Documents API: ${apiTest1.statusCode} (${apiTest1.rawData.length} bytes)`);
        
        const apiTest2 = await makeRequest('https://payvat.ie/api/documents/extracted-vat');
        console.log(`📡 VAT API: ${apiTest2.statusCode} (${apiTest2.rawData.length} bytes)`);
        
        if (apiTest1.statusCode === 200 && apiTest2.statusCode === 200) {
          console.log('✅ APIs are working - issue is client-side');
        } else {
          console.log('❌ API issues detected - may be causing loading problems');
        }
      } catch (apiError) {
        console.log('❌ API test failed:', apiError.message);
      }
    } else {
      console.log('🎉 Dashboard appears to be loading correctly!');
    }

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testDashboard();