require('dotenv').config();

async function testAPI() {
  console.log('Testing API...');
  
  try {
    const response = await fetch('http://localhost:3001/api/documents/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documentId: 'test-123',
        debugMode: true
      })
    });
    
    const data = await response.json();
    console.log('AI Status:', data.openAIStatus?.apiEnabled ? 'ENABLED' : 'DISABLED');
    console.log('AI Key Configured:', data.openAIStatus?.apiKeyConfigured);
    console.log('AI Key Format:', data.openAIStatus?.apiKeyFormat);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPI();