/**
 * Prompt Testing Debug API
 * Shows the EXACT prompt being sent to GPT and tests simple vs complex prompts
 */

import { NextRequest, NextResponse } from 'next/server'
import { createGuestFriendlyRoute } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { openai, AI_CONFIG, isAIEnabled } from '@/lib/ai/openai'
import { DOCUMENT_PROMPTS } from '@/lib/ai/prompts'
import { AuthUser } from '@/lib/auth'

interface PromptTestRequest {
  documentId: string
  testType: 'show_prompt' | 'simple_test' | 'complex_test' | 'compare_both'
}

/**
 * POST /api/debug/prompt-test - Test exact prompts being sent to GPT
 */
async function promptTestEndpoint(request: NextRequest, user?: AuthUser) {
  try {
    if (!isAIEnabled()) {
      return NextResponse.json({
        success: false,
        error: 'OpenAI API not configured'
      }, { status: 400 })
    }

    const body: PromptTestRequest = await request.json()
    const { documentId, testType = 'show_prompt' } = body
    
    if (!documentId) {
      return NextResponse.json({
        error: 'Document ID is required'
      }, { status: 400 })
    }
    
    // Find the document
    const whereClause: any = { id: documentId }
    if (user) {
      whereClause.userId = user.id
    }
    
    const document = await prisma.document.findFirst({
      where: whereClause
    })
    
    if (!document) {
      return NextResponse.json({
        error: 'Document not found or not authorized'
      }, { status: 404 })
    }
    
    if (!document.fileData) {
      return NextResponse.json({
        error: 'Document file data not available'
      }, { status: 400 })
    }

    console.log(`🚨 EMERGENCY PROMPT DEBUG: ${testType} for document ${document.originalName}`)
    
    const results: any = {
      documentName: document.originalName,
      mimeType: document.mimeType,
      testType,
      timestamp: new Date().toISOString()
    }

    if (testType === 'show_prompt' || testType === 'compare_both') {
      console.log('📝 SHOWING EXACT COMPLEX PROMPT BEING SENT TO GPT:')
      console.log('=' .repeat(100))
      console.log(DOCUMENT_PROMPTS.VAT_EXTRACTION)
      console.log('=' .repeat(100))
      
      results.complexPrompt = {
        text: DOCUMENT_PROMPTS.VAT_EXTRACTION,
        length: DOCUMENT_PROMPTS.VAT_EXTRACTION.length,
        lines: DOCUMENT_PROMPTS.VAT_EXTRACTION.split('\n').length,
        contains111_36: DOCUMENT_PROMPTS.VAT_EXTRACTION.includes('111.36'),
        containsForbiddenAmounts: DOCUMENT_PROMPTS.VAT_EXTRACTION.includes('€90.85')
      }
    }

    // Define the simple test prompt
    const SIMPLE_TEST_PROMPT = "What is the Total Amount VAT on this Volkswagen Financial Services invoice? Look for the field labeled 'Total Amount VAT' and extract only that euro amount. Return just the number."
    
    if (testType === 'simple_test' || testType === 'compare_both') {
      console.log('🎯 SIMPLE TEST PROMPT:')
      console.log('=' .repeat(50))
      console.log(SIMPLE_TEST_PROMPT)
      console.log('=' .repeat(50))
      
      results.simplePrompt = {
        text: SIMPLE_TEST_PROMPT,
        length: SIMPLE_TEST_PROMPT.length,
        lines: 1
      }
    }

    // Test the prompts with actual OpenAI API calls
    if (testType === 'complex_test' || testType === 'compare_both') {
      try {
        console.log('🤖 TESTING COMPLEX PROMPT with OpenAI Vision API...')
        
        const complexResponse = await openai.chat.completions.create({
          model: AI_CONFIG.models.vision,
          max_tokens: 2000,
          temperature: 0.1,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: document.mimeType === 'application/pdf' 
                    ? `${DOCUMENT_PROMPTS.VAT_EXTRACTION}\n\nNote: This is a PDF document. Please extract all visible text and VAT information from all pages.`
                    : DOCUMENT_PROMPTS.VAT_EXTRACTION
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${document.mimeType};base64,${document.fileData}`,
                    detail: "high"
                  }
                }
              ]
            }
          ]
        })
        
        const complexResult = complexResponse.choices[0]?.message?.content || 'No response'
        
        results.complexTest = {
          success: true,
          response: complexResult,
          responseLength: complexResult.length,
          contains111_36: complexResult.includes('111.36'),
          contains103_16: complexResult.includes('103.16'),
          contains101_99: complexResult.includes('101.99'),
          contains90_85: complexResult.includes('90.85'),
          containsTotalAmountVAT: complexResult.includes('Total Amount VAT'),
          tokensUsed: complexResponse.usage,
          finishReason: complexResponse.choices[0]?.finish_reason
        }
        
        console.log('✅ COMPLEX PROMPT TEST RESULTS:')
        console.log(`   Response length: ${complexResult.length}`)
        console.log(`   Contains 111.36: ${complexResult.includes('111.36')}`)
        console.log(`   Contains 103.16: ${complexResult.includes('103.16')}`)
        console.log(`   Contains 101.99: ${complexResult.includes('101.99')}`)
        console.log(`   Contains 90.85: ${complexResult.includes('90.85')}`)
        console.log(`   First 500 chars: "${complexResult.substring(0, 500)}"`)
        
      } catch (error) {
        console.error('🚨 Complex prompt test failed:', error)
        results.complexTest = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }

    if (testType === 'simple_test' || testType === 'compare_both') {
      try {
        console.log('🎯 TESTING SIMPLE PROMPT with OpenAI Vision API...')
        
        const simpleResponse = await openai.chat.completions.create({
          model: AI_CONFIG.models.vision,
          max_tokens: 100, // Much smaller since we just want a number
          temperature: 0.0, // Zero temperature for consistency
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: SIMPLE_TEST_PROMPT
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${document.mimeType};base64,${document.fileData}`,
                    detail: "high"
                  }
                }
              ]
            }
          ]
        })
        
        const simpleResult = simpleResponse.choices[0]?.message?.content || 'No response'
        
        results.simpleTest = {
          success: true,
          response: simpleResult,
          responseLength: simpleResult.length,
          contains111_36: simpleResult.includes('111.36'),
          contains103_16: simpleResult.includes('103.16'),
          contains101_99: simpleResult.includes('101.99'),
          contains90_85: simpleResult.includes('90.85'),
          tokensUsed: simpleResponse.usage,
          finishReason: simpleResponse.choices[0]?.finish_reason
        }
        
        console.log('✅ SIMPLE PROMPT TEST RESULTS:')
        console.log(`   Response: "${simpleResult}"`)
        console.log(`   Contains 111.36: ${simpleResult.includes('111.36')}`)
        console.log(`   Contains 103.16: ${simpleResult.includes('103.16')}`)
        console.log(`   Contains 101.99: ${simpleResult.includes('101.99')}`)
        console.log(`   Contains 90.85: ${simpleResult.includes('90.85')}`)
        
      } catch (error) {
        console.error('🚨 Simple prompt test failed:', error)
        results.simpleTest = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }

    // Compare results if both tests were run
    if (testType === 'compare_both' && results.complexTest && results.simpleTest) {
      results.comparison = {
        bothSuccessful: results.complexTest.success && results.simpleTest.success,
        complexFound111_36: results.complexTest.contains111_36,
        simpleFound111_36: results.simpleTest.contains111_36,
        complexFound103_16: results.complexTest.contains103_16,
        simpleFound103_16: results.simpleTest.contains103_16,
        simpleIsBetter: results.simpleTest.contains111_36 && !results.complexTest.contains111_36,
        complexIsBetter: results.complexTest.contains111_36 && !results.simpleTest.contains111_36,
        conclusion: ''
      }
      
      // Determine conclusion
      if (results.comparison.simpleIsBetter) {
        results.comparison.conclusion = '🎯 SIMPLE PROMPT WINS: Found correct €111.36, complex prompt failed'
      } else if (results.comparison.complexIsBetter) {
        results.comparison.conclusion = '📊 COMPLEX PROMPT WINS: Found correct €111.36, simple prompt failed'
      } else if (results.comparison.complexFound111_36 && results.comparison.simpleFound111_36) {
        results.comparison.conclusion = '✅ BOTH WORK: Both prompts found correct €111.36'
      } else if (!results.comparison.complexFound111_36 && !results.comparison.simpleFound111_36) {
        results.comparison.conclusion = '🚨 BOTH FAIL: Neither prompt found correct €111.36'
      } else {
        results.comparison.conclusion = '❓ MIXED RESULTS: Inconsistent extraction between prompts'
      }
      
      console.log('🔍 PROMPT COMPARISON RESULTS:')
      console.log(`   ${results.comparison.conclusion}`)
    }

    // Add the exact message structure being sent to OpenAI
    if (testType === 'show_prompt' || testType === 'compare_both') {
      results.exactAPICall = {
        model: AI_CONFIG.models.vision,
        maxTokens: AI_CONFIG.limits.maxTokens,
        temperature: AI_CONFIG.limits.temperature,
        messageStructure: {
          role: "user",
          content: [
            {
              type: "text",
              text: `${DOCUMENT_PROMPTS.VAT_EXTRACTION.substring(0, 200)}... (truncated for display)`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${document.mimeType};base64,[${Math.round(document.fileData.length / 1024)}KB base64 data]`,
                detail: "high"
              }
            }
          ]
        }
      }
    }

    console.log('🚨 EMERGENCY PROMPT DEBUG COMPLETE')
    
    return NextResponse.json({
      success: true,
      message: 'Prompt debug test completed',
      results
    })
    
  } catch (error) {
    console.error('Prompt test API error:', error)
    return NextResponse.json({
      error: 'Failed to test prompts',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * GET /api/debug/prompt-test?documentId=xxx&testtype=compare_both
 * Same functionality as POST but accepts query parameters
 */
async function promptTestGetEndpoint(request: NextRequest, user?: AuthUser) {
  try {
    if (!isAIEnabled()) {
      return NextResponse.json({
        success: false,
        error: 'OpenAI API not configured'
      }, { status: 400 })
    }

    // Extract parameters from URL query string
    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('documentId')
    const testType = (searchParams.get('testtype') || 'show_prompt') as 'show_prompt' | 'simple_test' | 'complex_test' | 'compare_both'
    
    if (!documentId) {
      return NextResponse.json({
        error: 'Document ID is required as query parameter: ?documentId=xxx'
      }, { status: 400 })
    }
    
    console.log(`🚨 EMERGENCY PROMPT DEBUG (GET): ${testType} for document ${documentId}`)
    
    // Find the document
    const whereClause: any = { id: documentId }
    if (user) {
      whereClause.userId = user.id
    }
    
    const document = await prisma.document.findFirst({
      where: whereClause
    })
    
    if (!document) {
      return NextResponse.json({
        error: 'Document not found or not authorized'
      }, { status: 404 })
    }
    
    if (!document.fileData) {
      return NextResponse.json({
        error: 'Document file data not available'
      }, { status: 400 })
    }

    const results: any = {
      documentName: document.originalName,
      mimeType: document.mimeType,
      testType,
      timestamp: new Date().toISOString(),
      method: 'GET'
    }

    if (testType === 'show_prompt' || testType === 'compare_both') {
      console.log('📝 SHOWING EXACT COMPLEX PROMPT BEING SENT TO GPT:')
      console.log('=' .repeat(100))
      console.log(DOCUMENT_PROMPTS.VAT_EXTRACTION)
      console.log('=' .repeat(100))
      
      results.complexPrompt = {
        text: DOCUMENT_PROMPTS.VAT_EXTRACTION,
        length: DOCUMENT_PROMPTS.VAT_EXTRACTION.length,
        lines: DOCUMENT_PROMPTS.VAT_EXTRACTION.split('\n').length,
        contains111_36: DOCUMENT_PROMPTS.VAT_EXTRACTION.includes('111.36'),
        containsForbiddenAmounts: DOCUMENT_PROMPTS.VAT_EXTRACTION.includes('€90.85')
      }
    }

    // Define the simple test prompt
    const SIMPLE_TEST_PROMPT = "What is the Total Amount VAT on this Volkswagen Financial Services invoice? Look for the field labeled 'Total Amount VAT' and extract only that euro amount. Return just the number."
    
    if (testType === 'simple_test' || testType === 'compare_both') {
      console.log('🎯 SIMPLE TEST PROMPT:')
      console.log('=' .repeat(50))
      console.log(SIMPLE_TEST_PROMPT)
      console.log('=' .repeat(50))
      
      results.simplePrompt = {
        text: SIMPLE_TEST_PROMPT,
        length: SIMPLE_TEST_PROMPT.length,
        lines: 1
      }
    }

    // Test the prompts with actual OpenAI API calls
    if (testType === 'complex_test' || testType === 'compare_both') {
      try {
        console.log('🤖 TESTING COMPLEX PROMPT with OpenAI Vision API...')
        
        const complexResponse = await openai.chat.completions.create({
          model: AI_CONFIG.models.vision,
          max_tokens: 2000,
          temperature: 0.1,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: document.mimeType === 'application/pdf' 
                    ? `${DOCUMENT_PROMPTS.VAT_EXTRACTION}\n\nNote: This is a PDF document. Please extract all visible text and VAT information from all pages.`
                    : DOCUMENT_PROMPTS.VAT_EXTRACTION
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${document.mimeType};base64,${document.fileData}`,
                    detail: "high"
                  }
                }
              ]
            }
          ]
        })
        
        const complexResult = complexResponse.choices[0]?.message?.content || 'No response'
        
        results.complexTest = {
          success: true,
          response: complexResult,
          responseLength: complexResult.length,
          contains111_36: complexResult.includes('111.36'),
          contains103_16: complexResult.includes('103.16'),
          contains101_99: complexResult.includes('101.99'),
          contains90_85: complexResult.includes('90.85'),
          containsTotalAmountVAT: complexResult.includes('Total Amount VAT'),
          tokensUsed: complexResponse.usage,
          finishReason: complexResponse.choices[0]?.finish_reason
        }
        
        console.log('✅ COMPLEX PROMPT TEST RESULTS:')
        console.log(`   Response length: ${complexResult.length}`)
        console.log(`   Contains 111.36: ${complexResult.includes('111.36')}`)
        console.log(`   Contains 103.16: ${complexResult.includes('103.16')}`)
        console.log(`   Contains 101.99: ${complexResult.includes('101.99')}`)
        console.log(`   Contains 90.85: ${complexResult.includes('90.85')}`)
        console.log(`   First 500 chars: "${complexResult.substring(0, 500)}"`)
        
      } catch (error) {
        console.error('🚨 Complex prompt test failed:', error)
        results.complexTest = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }

    if (testType === 'simple_test' || testType === 'compare_both') {
      try {
        console.log('🎯 TESTING SIMPLE PROMPT with OpenAI Vision API...')
        
        const simpleResponse = await openai.chat.completions.create({
          model: AI_CONFIG.models.vision,
          max_tokens: 100, // Much smaller since we just want a number
          temperature: 0.0, // Zero temperature for consistency
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: SIMPLE_TEST_PROMPT
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${document.mimeType};base64,${document.fileData}`,
                    detail: "high"
                  }
                }
              ]
            }
          ]
        })
        
        const simpleResult = simpleResponse.choices[0]?.message?.content || 'No response'
        
        results.simpleTest = {
          success: true,
          response: simpleResult,
          responseLength: simpleResult.length,
          contains111_36: simpleResult.includes('111.36'),
          contains103_16: simpleResult.includes('103.16'),
          contains101_99: simpleResult.includes('101.99'),
          contains90_85: simpleResult.includes('90.85'),
          tokensUsed: simpleResponse.usage,
          finishReason: simpleResponse.choices[0]?.finish_reason
        }
        
        console.log('✅ SIMPLE PROMPT TEST RESULTS:')
        console.log(`   Response: "${simpleResult}"`)
        console.log(`   Contains 111.36: ${simpleResult.includes('111.36')}`)
        console.log(`   Contains 103.16: ${simpleResult.includes('103.16')}`)
        console.log(`   Contains 101.99: ${simpleResult.includes('101.99')}`)
        console.log(`   Contains 90.85: ${simpleResult.includes('90.85')}`)
        
      } catch (error) {
        console.error('🚨 Simple prompt test failed:', error)
        results.simpleTest = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }

    // Compare results if both tests were run
    if (testType === 'compare_both' && results.complexTest && results.simpleTest) {
      results.comparison = {
        bothSuccessful: results.complexTest.success && results.simpleTest.success,
        complexFound111_36: results.complexTest.contains111_36,
        simpleFound111_36: results.simpleTest.contains111_36,
        complexFound103_16: results.complexTest.contains103_16,
        simpleFound103_16: results.simpleTest.contains103_16,
        simpleIsBetter: results.simpleTest.contains111_36 && !results.complexTest.contains111_36,
        complexIsBetter: results.complexTest.contains111_36 && !results.simpleTest.contains111_36,
        conclusion: ''
      }
      
      // Determine conclusion
      if (results.comparison.simpleIsBetter) {
        results.comparison.conclusion = '🎯 SIMPLE PROMPT WINS: Found correct €111.36, complex prompt failed'
      } else if (results.comparison.complexIsBetter) {
        results.comparison.conclusion = '📊 COMPLEX PROMPT WINS: Found correct €111.36, simple prompt failed'
      } else if (results.comparison.complexFound111_36 && results.comparison.simpleFound111_36) {
        results.comparison.conclusion = '✅ BOTH WORK: Both prompts found correct €111.36'
      } else if (!results.comparison.complexFound111_36 && !results.comparison.simpleFound111_36) {
        results.comparison.conclusion = '🚨 BOTH FAIL: Neither prompt found correct €111.36'
      } else {
        results.comparison.conclusion = '❓ MIXED RESULTS: Inconsistent extraction between prompts'
      }
      
      console.log('🔍 PROMPT COMPARISON RESULTS (GET):')
      console.log(`   ${results.comparison.conclusion}`)
    }

    console.log('🚨 EMERGENCY PROMPT DEBUG (GET) COMPLETE')
    
    return NextResponse.json({
      success: true,
      message: 'Prompt debug test completed via GET request',
      results
    })
    
  } catch (error) {
    console.error('Prompt test API (GET) error:', error)
    return NextResponse.json({
      error: 'Failed to test prompts via GET request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export const POST = createGuestFriendlyRoute(promptTestEndpoint)
export const GET = createGuestFriendlyRoute(promptTestGetEndpoint)