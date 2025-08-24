#!/usr/bin/env node

const https = require('https');

const url = 'https://vat-pay-ireland-o10ohf6z1-deans-projects-cdf015cf.vercel.app/api/documents?dashboard=true';

console.log('Testing FIXED API:', url);

https.get(url, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    
    if (res.statusCode === 200) {
      console.log('✅ SUCCESS! API is working!');
    } else {
      console.log('❌ Still failing, but now we should see the real error:');
    }
    
    try {
      const json = JSON.parse(data);
      console.log('\nResponse:', JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('\nRaw response:', data);
    }
  });
}).on('error', (err) => {
  console.error('Request failed:', err);
});

// Also test the VAT API
setTimeout(() => {
  console.log('\n--- Testing VAT API ---');
  const vatUrl = 'https://vat-pay-ireland-o10ohf6z1-deans-projects-cdf015cf.vercel.app/api/documents/extracted-vat';
  
  https.get(vatUrl, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('VAT API Status:', res.statusCode);
      console.log('VAT API Working:', res.statusCode === 200 ? '✅' : '❌');
    });
  }).on('error', (err) => {
    console.error('VAT API failed:', err);
  });
}, 2000);