const puppeteer = require('puppeteer');

(async () => {
  console.log('Testing dashboard client-side behavior...');
  
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Capture console messages
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text()
    });
  });
  
  // Capture errors
  const errors = [];
  page.on('error', err => errors.push(err.toString()));
  page.on('pageerror', err => errors.push(err.toString()));
  
  console.log('Loading dashboard...');
  await page.goto('https://payvat.ie/dashboard/documents', {
    waitUntil: 'networkidle2',
    timeout: 30000
  });
  
  // Wait a bit for JavaScript to execute
  await page.waitForTimeout(5000);
  
  // Check what's visible
  const dashboardText = await page.evaluate(() => document.body.innerText);
  
  console.log('\n=== Console Messages ===');
  consoleMessages.forEach(msg => {
    console.log(`[${msg.type}] ${msg.text}`);
  });
  
  console.log('\n=== Errors ===');
  errors.forEach(err => console.log(err));
  
  console.log('\n=== Page Content ===');
  if (dashboardText.includes('Loading dashboard...')) {
    console.log('❌ STILL STUCK AT LOADING');
  } else if (dashboardText.includes('Document Management')) {
    console.log('✅ DASHBOARD LOADED SUCCESSFULLY');
  } else {
    console.log('❓ Unknown state');
  }
  console.log('First 500 chars:', dashboardText.substring(0, 500));
  
  await browser.close();
})();
