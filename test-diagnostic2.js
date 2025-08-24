#!/usr/bin/env node

const https = require('https');

// Try the current production domain
const url = 'https://payvat.ie/api/test-docs';

console.log('Testing diagnostic API on main domain:', url);

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