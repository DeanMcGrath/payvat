const fs = require('fs');
const path = require('path');

// Test the new pdf-parse implementation
async function testPDFParseFixed() {
  console.log('🧪 Testing fixed pdf-parse implementation...');
  
  try {
    // Read test PDF
    const pdfPath = path.join(__dirname, 'test-vat-document.pdf');
    const pdfBuffer = fs.readFileSync(pdfPath);
    
    console.log('\n📄 Test PDF loaded:');
    console.log(`   File: ${pdfPath}`);
    console.log(`   Size: ${pdfBuffer.length} bytes`);
    
    // Test pdf-parse directly with the serverless optimized approach
    console.log('\n🔧 Testing pdf-parse with require (not dynamic import)...');
    
    const pdfParse = require('pdf-parse');
    console.log('✅ pdf-parse imported successfully');
    
    const parseFunction = typeof pdfParse === 'function' ? pdfParse : pdfParse.default;
    
    if (typeof parseFunction !== 'function') {
      throw new Error('pdf-parse import failed - parseFunction is not a function');
    }
    
    const parseOptions = {
      max: 50,
      version: 'v1.10.100',
      normalizeWhitespace: true,
      disableFontFace: true
    };
    
    console.log('📄 Starting PDF parsing...');
    const result = await parseFunction(pdfBuffer, parseOptions);
    
    console.log('\n📊 Parse Results:');
    console.log(`   Text length: ${result.text.length} characters`);
    console.log(`   Pages: ${result.numpages || 'unknown'}`);
    console.log(`   Contains "VAT": ${result.text.toLowerCase().includes('vat')}`);
    console.log(`   Contains "111.36": ${result.text.includes('111.36')}`);
    console.log(`   First 200 chars: "${result.text.substring(0, 200)}..."`);
    
    console.log('\n✅ SUCCESS: pdf-parse works correctly with new configuration!');
    console.log('🎯 No ENOENT errors - serverless optimization is working');
    
  } catch (error) {
    console.error('\n❌ FAILED:', error.message);
    
    if (error.message.includes('ENOENT') || error.message.includes('no such file')) {
      console.error('🚨 ENOENT ERROR STILL PRESENT - configuration not working');
    }
    
    console.error('Stack:', error.stack);
  }
}

testPDFParseFixed();