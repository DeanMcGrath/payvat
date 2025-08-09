/**
 * Test script to verify AI setup is working
 * Run with: node test-ai-setup.js
 */

// Load environment variables
require('dotenv').config();

async function testAISetup() {
  console.log('🔧 TESTING AI SETUP...');
  console.log('=' .repeat(60));
  
  // Test 1: Check environment variables
  console.log('📋 ENVIRONMENT CHECK:');
  console.log(`   OPENAI_API_KEY exists: ${!!process.env.OPENAI_API_KEY}`);
  console.log(`   Key length: ${process.env.OPENAI_API_KEY?.length || 0} characters`);
  console.log(`   Key format: ${process.env.OPENAI_API_KEY?.startsWith('sk-') ? 'VALID (sk-*)' : 'INVALID'}`);
  console.log(`   Key preview: ${process.env.OPENAI_API_KEY ? `"${process.env.OPENAI_API_KEY.substring(0, 7)}..."` : '"undefined"'}`);
  console.log('');
  
  // Test 2: Import and test isAIEnabled function
  try {
    console.log('📦 TESTING MODULE IMPORTS...');
    
    // Import the modules (using dynamic import for ES modules)
    const { isAIEnabled, getAIStatus } = await import('./lib/ai/openai.js');
    
    console.log('✅ Successfully imported AI modules');
    console.log('');
    
    // Test 3: Check AI availability
    console.log('🤖 TESTING AI AVAILABILITY:');
    const aiEnabled = isAIEnabled();
    const aiStatus = getAIStatus();
    
    console.log(`   AI Enabled: ${aiEnabled}`);
    console.log(`   Status: ${aiStatus.reason}`);
    
    if (!aiEnabled) {
      console.log('   Suggestions:');
      aiStatus.suggestions.forEach(suggestion => {
        console.log(`     - ${suggestion}`);
      });
    }
    console.log('');
    
    // Test 4: Try basic OpenAI connection (if enabled)
    if (aiEnabled) {
      console.log('🔗 TESTING OPENAI CONNECTIVITY...');
      try {
        const { quickConnectivityTest } = await import('./lib/ai/diagnostics.js');
        const connectivityResult = await quickConnectivityTest();
        
        console.log(`   Connectivity Test: ${connectivityResult.success ? 'SUCCESS' : 'FAILED'}`);
        console.log(`   Message: ${connectivityResult.message}`);
        if (connectivityResult.error) {
          console.log(`   Error: ${connectivityResult.error}`);
        }
      } catch (connectivityError) {
        console.log(`   ❌ Connectivity test failed: ${connectivityError.message}`);
      }
    } else {
      console.log('⏭️  SKIPPING CONNECTIVITY TEST (AI disabled)');
    }
    
  } catch (importError) {
    console.error('❌ Failed to import AI modules:', importError.message);
    console.error('   This indicates a module or dependency issue');
  }
  
  console.log('');
  console.log('=' .repeat(60));
  console.log('🎯 SUMMARY:');
  
  if (!process.env.OPENAI_API_KEY) {
    console.log('❌ CRITICAL: No OpenAI API key configured');
    console.log('   Action needed: Add OPENAI_API_KEY to .env file');
    console.log('   Get key from: https://platform.openai.com/api-keys');
  } else if (!process.env.OPENAI_API_KEY.startsWith('sk-')) {
    console.log('❌ CRITICAL: Invalid OpenAI API key format');
    console.log('   Action needed: Replace with valid key starting with "sk-"');
  } else if (process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
    console.log('❌ CRITICAL: API key is still placeholder');
    console.log('   Action needed: Replace placeholder with real API key');
  } else {
    console.log('✅ OpenAI API key appears to be configured correctly');
    console.log('   Next: Test document processing to verify it works end-to-end');
  }
  
  console.log('');
  console.log('📝 NEXT STEPS:');
  console.log('1. Ensure OPENAI_API_KEY is set to a valid key in .env');
  console.log('2. Restart your development server');
  console.log('3. Upload a document to test processing');
  console.log('4. Check console logs for AI processing status');
  console.log('5. Verify "processedDocuments" count increases');
}

// Handle both CommonJS and ES module contexts
if (typeof module !== 'undefined' && module.exports) {
  // CommonJS
  testAISetup().catch(console.error);
} else {
  // ES modules
  testAISetup().catch(console.error);
}