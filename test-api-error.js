#!/usr/bin/env node

const https = require('https');

const url = 'https://vat-pay-ireland-cy1jv0iun-deans-projects-cdf015cf.vercel.app/api/documents?dashboard=true';

console.log('Testing API:', url);

https.get(url, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
    
    if (res.statusCode === 500) {
      try {
        const json = JSON.parse(data);
        console.log('\nError details:', JSON.stringify(json, null, 2));
      } catch (e) {
        console.log('\nRaw error:', data);
      }
    }
  });
}).on('error', (err) => {
  console.error('Request failed:', err);
});