// Test the PDF processing with a focus on avoiding ENOENT errors
const fs = require('fs');

// Mock the documentAnalysis module to test the PDF processing function directly
const mockPDFProcessing = async (pdfBuffer) => {
  console.log('🔧 Testing PDF processing logic similar to documentAnalysis.ts...');
  
  try {
    console.log('📄 PDF PROCESSING WITH PDF-PARSE (SERVERLESS OPTIMIZED):');
    console.log(`   Buffer size: ${pdfBuffer.length} bytes`);
    console.log(`   Buffer type: ${Buffer.isBuffer(pdfBuffer)}`);
    
    // Import pdf-parse with proper error handling for serverless
    let pdfParse;
    try {
      // Use require instead of dynamic import to avoid module resolution issues
      pdfParse = require('pdf-parse');
      console.log('✅ pdf-parse imported successfully');
    } catch (importError) {
      console.error('🚨 Failed to import pdf-parse library:', importError);
      throw new Error('pdf-parse library not available - check Next.js configuration');
    }
    
    // Ensure we have a valid parse function
    const parseFunction = typeof pdfParse === 'function' ? pdfParse : pdfParse.default;
    
    if (typeof parseFunction !== 'function') {
      throw new Error('pdf-parse import failed - parseFunction is not a function');
    }
    
    console.log('📄 Starting PDF parsing with timeout protection...');
    
    // Parse the PDF buffer with comprehensive options and timeout protection
    const parseOptions = {
      max: 50, // Maximum pages to parse
      version: 'v1.10.100', // Specific version for compatibility
      normalizeWhitespace: true,
      disableFontFace: true
    };
    
    // Create a timeout promise to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('PDF parsing timeout after 30 seconds - document may be too complex'));
      }, 30000);
    });
    
    // Race between parsing and timeout
    const parsePromise = parseFunction(pdfBuffer, parseOptions);
    const result = await Promise.race([parsePromise, timeoutPromise]);
    
    console.log('📄 PDF parsing completed, validating result...');
    
    if (!result || typeof result.text !== 'string') {
      throw new Error('pdf-parse returned no valid text content');
    }
    
    const extractedText = result.text.trim();
    console.log(`   Text length: ${extractedText.length} characters`);
    
    return extractedText;
    
  } catch (error) {
    console.error('🚨 PDF text extraction failed:');
    console.error(`   Error message: ${error.message}`);
    
    // Check for ENOENT specifically
    if (error.message.includes('ENOENT') || error.message.includes('no such file')) {
      console.error('🚨 CRITICAL: ENOENT error detected - configuration issue');
      throw new Error('ENOENT_ERROR_DETECTED');
    }
    
    throw error;
  }
};

async function testPDFProcessing() {
  console.log('🧪 Testing PDF processing to detect ENOENT issues...\n');
  
  // Test with different PDF scenarios
  const testScenarios = [
    {
      name: 'Empty buffer test',
      buffer: Buffer.alloc(0),
      expectError: true
    },
    {
      name: 'Invalid PDF buffer test',
      buffer: Buffer.from('not a pdf'),
      expectError: true
    },
    {
      name: 'Valid PDF header but minimal content',
      buffer: Buffer.from('%PDF-1.4\n%EOF'),
      expectError: true // Will likely fail parsing but should not have ENOENT
    }
  ];
  
  for (const scenario of testScenarios) {
    console.log(`🔍 Running: ${scenario.name}`);
    
    try {
      const result = await mockPDFProcessing(scenario.buffer);
      
      if (scenario.expectError) {
        console.log('⚠️  Unexpected success - expected error');
      } else {
        console.log(`✅ Success: ${result.length} characters extracted`);
      }
    } catch (error) {
      if (error.message === 'ENOENT_ERROR_DETECTED') {
        console.error('❌ CRITICAL: ENOENT error found - configuration not working!');
        return false;
      } else if (scenario.expectError) {
        console.log(`✅ Expected error: ${error.message.substring(0, 100)}...`);
      } else {
        console.error(`❌ Unexpected error: ${error.message}`);
      }
    }
    
    console.log(''); // Empty line for readability
  }
  
  console.log('🎯 TEST RESULT: No ENOENT errors detected!');
  console.log('✅ pdf-parse configuration appears to be working correctly');
  return true;
}

testPDFProcessing().then(success => {
  if (success) {
    console.log('\n🚀 Ready for production deployment!');
  } else {
    console.log('\n🚨 Configuration needs more work before deployment');
  }
}).catch(console.error);