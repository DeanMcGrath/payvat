const fs = require('fs');
const path = require('path');

// Read and encode test PDF
const pdfPath = path.join(__dirname, 'test-vat-document.pdf');
const pdfBuffer = fs.readFileSync(pdfPath);
const base64Data = pdfBuffer.toString('base64');

console.log('📄 Test PDF loaded:');
console.log(`   File: ${pdfPath}`);
console.log(`   Size: ${pdfBuffer.length} bytes`);
console.log(`   Base64 length: ${base64Data.length} characters`);

// Mock environment for testing
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'test-key';

// Test the PDF extraction directly
async function testPDFExtraction() {
  try {
    // Import pdfjs-dist
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    
    console.log('\n🔧 Testing pdfjs-dist PDF extraction...');
    
    // Convert buffer to Uint8Array
    const uint8Array = new Uint8Array(pdfBuffer);
    
    // Load the PDF document
    const loadingTask = pdfjs.getDocument({
      data: uint8Array,
      useSystemFonts: true,
      verbosity: 0
    });
    
    const pdfDoc = await loadingTask.promise;
    console.log(`✅ PDF loaded: ${pdfDoc.numPages} pages`);
    
    // Extract text from all pages
    let fullText = '';
    
    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map(item => item.str)
        .join(' ');
      
      fullText += pageText + '\n';
      console.log(`   Page ${pageNum}: ${pageText.length} characters`);
    }
    
    console.log('\n📊 Extraction Results:');
    console.log(`   Total text: ${fullText.length} characters`);
    console.log(`   Contains "VAT": ${fullText.toLowerCase().includes('vat')}`);
    console.log(`   Contains "111.36": ${fullText.includes('111.36')}`);
    console.log(`   First 200 chars: "${fullText.substring(0, 200)}..."`);
    
    console.log('\n✅ SUCCESS: pdfjs-dist extraction works without ENOENT errors!');
    
  } catch (error) {
    console.error('\n❌ FAILED:', error.message);
    console.error('Stack:', error.stack);
  }
}

testPDFExtraction();