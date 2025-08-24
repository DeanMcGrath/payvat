const https = require('https');

// Test both domains to check if the fix is deployed
const domains = [
  'https://payvat.ie',
  'https://vat-pay-ireland-26tn1pty0-deans-projects-cdf015cf.vercel.app'
];

async function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function checkDashboardFix() {
  console.log('🔍 Checking if dashboard loading fix is deployed...\n');
  
  for (const baseUrl of domains) {
    console.log(`📍 Testing: ${baseUrl}`);
    
    try {
      // Check the dashboard page HTML for our timeout fix
      const response = await makeRequest(`${baseUrl}/dashboard/documents`);
      
      if (response.statusCode !== 200) {
        console.log(`❌ Failed: HTTP ${response.statusCode}\n`);
        continue;
      }
      
      // Look for key indicators that our fix is present
      const indicators = [
        { text: 'Skip Loading - Show Dashboard Now', name: 'Skip Loading Button' },
        { text: 'loadingTimeout', name: 'Timeout Logic' },
        { text: '3000)', name: '3-Second Timeout' },
        { text: 'showLoadingSpinner', name: 'Loading Logic Variable' }
      ];
      
      const found = [];
      const missing = [];
      
      for (const indicator of indicators) {
        if (response.data.includes(indicator.text)) {
          found.push(indicator.name);
        } else {
          missing.push(indicator.name);
        }
      }
      
      console.log(`✅ Found in HTML: ${found.length > 0 ? found.join(', ') : 'None'}`);
      console.log(`❌ Missing: ${missing.length > 0 ? missing.join(', ') : 'None'}`);
      
      // Check if the overall fix seems to be deployed
      const fixDeployed = found.length >= 2; // At least 2 indicators should be present
      console.log(`🎯 Fix Status: ${fixDeployed ? '✅ DEPLOYED' : '❌ NOT DEPLOYED'}`);
      
      // Additional analysis
      if (response.data.includes('Loading dashboard...')) {
        console.log(`📊 Contains loading text: Yes`);
      }
      
      if (response.data.includes('documents.length')) {
        console.log(`📊 Contains document length checks: Yes`);
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    console.log(''); // Empty line
  }
}

checkDashboardFix();