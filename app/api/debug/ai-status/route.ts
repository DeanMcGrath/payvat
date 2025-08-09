import { NextRequest, NextResponse } from 'next/server'
import { getAIStatus, isAIEnabled } from '@/lib/ai/openai'
import { quickConnectivityTest } from '@/lib/ai/diagnostics'

/**
 * GET /api/debug/ai-status - Check OpenAI API configuration and connectivity
 * 🔧 CRITICAL DIAGNOSTIC ENDPOINT: Use this to debug AI processing issues
 */
export async function GET(request: NextRequest) {
  console.log('🔍 AI STATUS DIAGNOSTIC ENDPOINT CALLED')
  console.log(`   URL: ${request.url}`)
  console.log(`   User Agent: ${request.headers.get('user-agent')}`)
  console.log(`   Timestamp: ${new Date().toISOString()}`)
  
  try {
    // Get detailed AI status
    const aiStatus = getAIStatus()
    console.log('📊 AI Status Details:', aiStatus)
    
    // Test connectivity if API key is configured
    let connectivityTest: any = null
    if (aiStatus.enabled) {
      try {
        console.log('🔌 Testing OpenAI API connectivity...')
        connectivityTest = await quickConnectivityTest()
        console.log('🔌 Connectivity test result:', connectivityTest)
      } catch (connectivityError) {
        console.error('🚨 Connectivity test failed:', connectivityError)
        connectivityTest = {
          success: false,
          message: 'Connectivity test failed',
          error: connectivityError instanceof Error ? connectivityError.message : 'Unknown error'
        }
      }
    }
    
    // Environment information (safe to expose)
    const environmentInfo = {
      nodeEnv: process.env.NODE_ENV,
      hasApiKey: !!process.env.OPENAI_API_KEY,
      apiKeyLength: process.env.OPENAI_API_KEY?.length || 0,
      apiKeyFormat: process.env.OPENAI_API_KEY?.startsWith('sk-') ? 'valid' : 'invalid'
    }
    
    const response = {
      success: true,
      aiStatus,
      connectivityTest,
      environmentInfo,
      isAIEnabled: isAIEnabled(),
      timestamp: new Date().toISOString(),
      diagnostic: {
        canProcessDocuments: aiStatus.enabled && (connectivityTest?.success ?? false),
        recommendedAction: !aiStatus.enabled 
          ? 'Set valid OpenAI API key in environment variables'
          : !connectivityTest?.success 
            ? 'Check OpenAI API key permissions and quota'
            : 'AI processing should work correctly',
        criticalIssues: [
          ...(!aiStatus.enabled ? ['OpenAI API key not configured'] : []),
          ...(connectivityTest && !connectivityTest.success ? ['OpenAI API connectivity failed'] : [])
        ]
      }
    }
    
    console.log('✅ AI status diagnostic complete')
    console.log(`   AI Enabled: ${response.isAIEnabled}`)
    console.log(`   Can Process Documents: ${response.diagnostic.canProcessDocuments}`)
    console.log(`   Critical Issues: ${response.diagnostic.criticalIssues.length}`)
    
    return NextResponse.json(response, { status: 200 })
    
  } catch (error) {
    console.error('🚨 AI STATUS DIAGNOSTIC ERROR:', error)
    
    return NextResponse.json({
      success: false,
      error: 'AI status check failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      isAIEnabled: false,
      diagnostic: {
        canProcessDocuments: false,
        recommendedAction: 'Check server logs for detailed error information',
        criticalIssues: ['AI status check failed completely']
      }
    }, { status: 500 })
  }
}