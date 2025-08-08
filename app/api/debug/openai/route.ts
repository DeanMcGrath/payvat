/**
 * Debug API Route for OpenAI Testing
 * Manual testing and diagnostics for OpenAI API integration
 */

import { NextRequest, NextResponse } from 'next/server'
import { runOpenAIDiagnostics, quickConnectivityTest, testDocumentProcessingDiagnostics, compareTextExtractionWithAIVision } from '@/lib/ai/diagnostics'
import { isAIEnabled } from '@/lib/ai/openai'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const testType = searchParams.get('test') || 'quick'
    
    console.log(`🔍 Debug API: Running OpenAI test type: ${testType}`)
    
    switch (testType) {
      case 'quick':
        const quickTest = await quickConnectivityTest()
        return NextResponse.json({
          success: quickTest.success,
          test: 'Quick Connectivity Test',
          message: quickTest.message,
          error: quickTest.error,
          timestamp: new Date().toISOString()
        })
        
      case 'comprehensive':
        const diagnostics = await runOpenAIDiagnostics()
        return NextResponse.json({
          test: 'Comprehensive Diagnostics',
          ...diagnostics,
          timestamp: new Date().toISOString()
        })
        
      case 'status':
        return NextResponse.json({
          success: true,
          test: 'API Status Check',
          apiEnabled: isAIEnabled(),
          environment: {
            nodeEnv: process.env.NODE_ENV,
            hasOpenAIKey: !!process.env.OPENAI_API_KEY,
            keyLength: process.env.OPENAI_API_KEY?.length || 0,
            keyPrefix: process.env.OPENAI_API_KEY?.substring(0, 7) || 'none'
          },
          timestamp: new Date().toISOString()
        })
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid test type',
          availableTests: ['quick', 'comprehensive', 'status'],
          timestamp: new Date().toISOString()
        }, { status: 400 })
    }
    
  } catch (error) {
    console.error('Debug API error:', error)
    
    return NextResponse.json({
      success: false,
      test: 'Debug API Error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body
    
    console.log(`🔍 Debug API POST: Running action: ${action}`)
    
    switch (action) {
      case 'test-document':
        if (!data?.fileData) {
          return NextResponse.json({
            success: false,
            error: 'File data required for document test',
            timestamp: new Date().toISOString()
          }, { status: 400 })
        }
        
        const expectedAmount = data.expectedAmount || 111.36
        const documentTest = await testDocumentProcessingDiagnostics(data.fileData, expectedAmount)
        
        return NextResponse.json({
          ...documentTest,
          timestamp: new Date().toISOString()
        })
        
      case 'validate-setup':
        const setupValidation = await validateOpenAISetup()
        return NextResponse.json({
          success: setupValidation.valid,
          test: 'Setup Validation',
          ...setupValidation,
          timestamp: new Date().toISOString()
        })
        
      case 'compare-extraction':
        if (!data?.fileData || !data?.mimeType) {
          return NextResponse.json({
            success: false,
            error: 'File data and MIME type required for extraction comparison',
            timestamp: new Date().toISOString()
          }, { status: 400 })
        }
        
        const comparisonResult = await compareTextExtractionWithAIVision(
          data.fileData, 
          data.mimeType, 
          data.fileName || 'test-document'
        )
        
        return NextResponse.json({
          success: comparisonResult.discrepancies.length === 0,
          test: 'Text Extraction vs AI Vision Comparison',
          ...comparisonResult,
          timestamp: new Date().toISOString()
        })
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action',
          availableActions: ['test-document', 'validate-setup', 'compare-extraction'],
          timestamp: new Date().toISOString()
        }, { status: 400 })
    }
    
  } catch (error) {
    console.error('Debug API POST error:', error)
    
    return NextResponse.json({
      success: false,
      test: 'Debug API POST Error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

/**
 * Validate OpenAI setup and configuration
 */
async function validateOpenAISetup(): Promise<{
  valid: boolean
  issues: string[]
  warnings: string[]
  details: any
}> {
  const issues: string[] = []
  const warnings: string[] = []
  const details: any = {}
  
  // Check environment variables
  if (!process.env.OPENAI_API_KEY) {
    issues.push('OPENAI_API_KEY environment variable not set')
  } else if (process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
    issues.push('OPENAI_API_KEY is still set to placeholder value')
  } else if (!process.env.OPENAI_API_KEY.startsWith('sk-')) {
    issues.push('OPENAI_API_KEY does not appear to be valid (should start with sk-)')
  }
  
  details.environment = {
    hasKey: !!process.env.OPENAI_API_KEY,
    keyFormat: process.env.OPENAI_API_KEY?.startsWith('sk-') ? 'valid' : 'invalid',
    isEnabled: isAIEnabled()
  }
  
  // Test basic connectivity if key exists
  if (process.env.OPENAI_API_KEY && isAIEnabled()) {
    try {
      const connectivityTest = await quickConnectivityTest()
      details.connectivity = connectivityTest
      
      if (!connectivityTest.success) {
        issues.push(`API connectivity failed: ${connectivityTest.error}`)
      }
    } catch (error) {
      issues.push(`Failed to test connectivity: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  
  // Check model access
  const requiredModels = ['gpt-4o', 'gpt-4o-mini']
  details.models = {
    required: requiredModels,
    configured: {
      chat: 'gpt-4o-mini',
      vision: 'gpt-4o'
    }
  }
  
  return {
    valid: issues.length === 0,
    issues,
    warnings,
    details
  }
}