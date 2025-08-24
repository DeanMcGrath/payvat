#!/usr/bin/env node

const https = require('https');

const url = 'https://vat-pay-ireland-cs5yxnz9q-deans-projects-cdf015cf.vercel.app/api/test-docs';

console.log('Testing diagnostic API:', url);

https.get(url, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
    
    try {
      const json = JSON.parse(data);
      console.log('\nParsed response:', JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('\nCould not parse JSON:', e.message);
    }
  });
}).on('error', (err) => {
  console.error('Request failed:', err);
});