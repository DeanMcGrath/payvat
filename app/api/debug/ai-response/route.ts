/**
 * AI Response Debug API  
 * Shows complete unprocessed OpenAI API responses to verify what AI actually returns
 */

import { NextRequest, NextResponse } from 'next/server'
import { createGuestFriendlyRoute } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { openai, AI_CONFIG, isAIEnabled } from '@/lib/ai/openai'
import { DOCUMENT_PROMPTS } from '@/lib/ai/prompts'
import { AuthUser } from '@/lib/auth'

interface AIResponseRequest {
  documentId: string
  promptType?: 'current' | 'simple' | 'clean'
}

/**
 * GET /api/debug/ai-response?documentId=xxx&promptType=current - Show full AI response
 */
async function aiResponseEndpoint(request: NextRequest, user?: AuthUser) {
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
    const promptType = (searchParams.get('promptType') || 'current') as 'current' | 'simple' | 'clean'
    
    if (!documentId) {
      return NextResponse.json({
        error: 'Document ID is required as query parameter: ?documentId=xxx'
      }, { status: 400 })
    }
    
    console.log(`🤖 AI RESPONSE DEBUG: Document ${documentId}, Prompt: ${promptType}`)
    
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
      promptType,
      timestamp: new Date().toISOString(),
      
      // Document metadata
      metadata: {
        id: document.id,
        category: document.category,
        fileSizeKB: Math.round(document.fileData.length / 1024)
      }
    }

    // Select the prompt to test
    let selectedPrompt: string
    let promptName: string
    
    switch (promptType) {
      case 'simple':
        selectedPrompt = "What is the Total Amount VAT on this invoice? Look for VAT amounts and extract the euro value. Return just the number."
        promptName = 'Simple VAT Extraction'
        break
        
      case 'clean':
        selectedPrompt = DOCUMENT_PROMPTS.CLEAN_VAT_EXTRACTION
        promptName = 'Clean VAT Extraction'
        break
        
      case 'current':
      default:
        selectedPrompt = DOCUMENT_PROMPTS.VAT_EXTRACTION
        promptName = 'Current VAT Extraction (Complex)'
        break
    }

    results.promptDetails = {
      name: promptName,
      type: promptType,
      length: selectedPrompt.length,
      lines: selectedPrompt.split('\n').length,
      preview: selectedPrompt.substring(0, 300) + (selectedPrompt.length > 300 ? '...' : '')
    }

    console.log(`📝 Using prompt: ${promptName} (${selectedPrompt.length} chars)`)

    // Make the actual OpenAI API call
    try {
      console.log('🤖 Calling OpenAI Vision API...')
      
      const startTime = Date.now()
      
      const apiResponse = await openai.chat.completions.create({
        model: AI_CONFIG.models.vision,
        max_tokens: promptType === 'simple' ? 100 : 2000,
        temperature: promptType === 'simple' ? 0.0 : 0.1,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: document.mimeType === 'application/pdf' 
                  ? `${selectedPrompt}\n\nNote: This is a PDF document. Please extract all visible text and VAT information from all pages.`
                  : selectedPrompt
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
      
      const endTime = Date.now()
      const responseContent = apiResponse.choices[0]?.message?.content || 'No response'
      
      // Complete API response analysis
      results.apiResponse = {
        success: true,
        responseTimeMs: endTime - startTime,
        
        // Full API response details
        fullResponse: {
          id: apiResponse.id,
          object: apiResponse.object,
          created: apiResponse.created,
          model: apiResponse.model,
          choices: apiResponse.choices.map(choice => ({
            index: choice.index,
            message: {
              role: choice.message.role,
              content: choice.message.content
            },
            finish_reason: choice.finish_reason
          })),
          usage: apiResponse.usage,
          system_fingerprint: (apiResponse as any).system_fingerprint
        },
        
        // Content analysis
        content: {
          raw: responseContent,
          length: responseContent.length,
          lines: responseContent.split('\n').length,
          wordCount: responseContent.split(/\s+/).length
        },
        
        // VAT-specific analysis
        vatAnalysis: {
          contains111_36: responseContent.includes('111.36'),
          contains103_16: responseContent.includes('103.16'),
          contains90_85: responseContent.includes('90.85'),
          contains101_99: responseContent.includes('101.99'),
          containsEuroSymbol: responseContent.includes('€') || responseContent.includes('EUR'),
          containsVAT: responseContent.toLowerCase().includes('vat'),
          containsTotalAmountVAT: responseContent.toLowerCase().includes('total amount vat'),
          containsVolkswagen: responseContent.toLowerCase().includes('volkswagen') || responseContent.toLowerCase().includes('vw'),
          
          // Extract all numbers that look like VAT amounts
          euroAmounts: [...responseContent.matchAll(/€?\s*(\d+\.\d{2})/g)].map(match => match[1]),
          allNumbers: [...responseContent.matchAll(/\d+\.\d{2}/g)].map(match => match[0])
        },
        
        // JSON parsing attempt (for structured responses)
        jsonAnalysis: {
          looksLikeJSON: responseContent.trim().startsWith('{') && responseContent.trim().endsWith('}'),
          parseAttempt: null as any,
          parseError: null as string | null
        }
      }
      
      // Try to parse JSON if it looks like structured data
      if (results.apiResponse.jsonAnalysis.looksLikeJSON) {
        try {
          results.apiResponse.jsonAnalysis.parseAttempt = JSON.parse(responseContent)
        } catch (parseError) {
          results.apiResponse.jsonAnalysis.parseError = parseError instanceof Error ? parseError.message : 'Parse failed'
        }
      }
      
      console.log('✅ OPENAI API RESPONSE RECEIVED:')
      console.log(`   Response time: ${results.apiResponse.responseTimeMs}ms`)
      console.log(`   Content length: ${results.apiResponse.content.length} chars`)
      console.log(`   Tokens used: ${apiResponse.usage?.total_tokens || 'unknown'}`)
      console.log(`   Contains 111.36: ${results.apiResponse.vatAnalysis.contains111_36}`)
      console.log(`   Contains 103.16: ${results.apiResponse.vatAnalysis.contains103_16}`)
      console.log(`   Euro amounts found: [${results.apiResponse.vatAnalysis.euroAmounts.join(', ')}]`)
      console.log(`   All numbers found: [${results.apiResponse.vatAnalysis.allNumbers.join(', ')}]`)
      console.log(`   First 500 chars: "${responseContent.substring(0, 500)}..."`)
      
    } catch (error) {
      console.error('🚨 OpenAI API call failed:', error)
      
      results.apiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'UnknownError'
      }
    }

    // Diagnosis
    results.diagnosis = {
      timestamp: new Date().toISOString(),
      status: 'UNKNOWN',
      findings: [] as string[],
      recommendations: [] as string[]
    }
    
    if (!results.apiResponse.success) {
      results.diagnosis.status = 'API_ERROR'
      results.diagnosis.findings.push(`API call failed: ${results.apiResponse.error}`)
      results.diagnosis.recommendations.push('Check OpenAI API key and permissions')
    } else if (results.apiResponse.content.length < 50) {
      results.diagnosis.status = 'NO_CONTENT'
      results.diagnosis.findings.push('AI returned very short response - may not be seeing document')
      results.diagnosis.recommendations.push('Check document format and encoding')
    } else if (!results.apiResponse.vatAnalysis.containsVAT && !results.apiResponse.vatAnalysis.containsEuroSymbol) {
      results.diagnosis.status = 'NO_VAT_DATA'
      results.diagnosis.findings.push('AI response contains no VAT-related content')
      results.diagnosis.recommendations.push('Document may not contain VAT data or AI cannot extract it')
    } else if (!results.apiResponse.vatAnalysis.contains111_36) {
      results.diagnosis.status = 'WRONG_EXTRACTION'
      results.diagnosis.findings.push('AI can see VAT data but is not extracting the expected amount (111.36)')
      results.diagnosis.findings.push(`Found amounts: [${results.apiResponse.vatAnalysis.euroAmounts.join(', ')}]`)
      results.diagnosis.recommendations.push('Check if document actually contains 111.36 or if extraction logic needs improvement')
    } else {
      results.diagnosis.status = 'CORRECT_EXTRACTION'
      results.diagnosis.findings.push('AI successfully found the expected VAT amount (111.36)')
      results.diagnosis.recommendations.push('This prompt configuration is working correctly')
    }
    
    console.log('🏁 AI RESPONSE DIAGNOSIS:')
    console.log(`   Status: ${results.diagnosis.status}`)
    console.log(`   Findings: ${results.diagnosis.findings.length}`)
    results.diagnosis.findings.forEach((finding: string) => console.log(`     - ${finding}`))
    
    return NextResponse.json({
      success: true,
      message: 'AI response debug completed',
      results
    })
    
  } catch (error) {
    console.error('AI response debug API error:', error)
    return NextResponse.json({
      error: 'Failed to debug AI response',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export const GET = createGuestFriendlyRoute(aiResponseEndpoint)