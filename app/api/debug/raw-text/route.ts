/**
 * Raw Text Extraction Debug API
 * Shows EXACTLY what text is extracted from PDF documents before AI processing
 */

import { NextRequest, NextResponse } from 'next/server'
import { createGuestFriendlyRoute } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { openai, AI_CONFIG, isAIEnabled } from '@/lib/ai/openai'
import { AuthUser } from '@/lib/auth'

interface RawTextRequest {
  documentId: string
}

/**
 * GET /api/debug/raw-text?documentId=xxx - Extract raw text to verify document content
 */
async function rawTextEndpoint(request: NextRequest, user?: AuthUser) {
  try {
    // Extract parameters from URL query string
    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('documentId')
    
    if (!documentId) {
      return NextResponse.json({
        error: 'Document ID is required as query parameter: ?documentId=xxx'
      }, { status: 400 })
    }
    
    console.log(`🔍 RAW TEXT EXTRACTION DEBUG: Document ${documentId}`)
    
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
      fileSizeKB: Math.round(document.fileData.length / 1024),
      timestamp: new Date().toISOString(),
      
      // Document metadata
      metadata: {
        id: document.id,
        category: document.category,
        uploadedAt: document.uploadedAt,
        isAlreadyScanned: document.isScanned
      }
    }

    console.log(`📄 Document: ${document.originalName} (${document.mimeType}, ${results.fileSizeKB}KB)`)

    // Test 1: Basic AI Connectivity
    if (!isAIEnabled()) {
      results.aiStatus = {
        enabled: false,
        error: 'OpenAI API not configured'
      }
      console.log('🚨 OpenAI API not enabled')
    } else {
      console.log('✅ OpenAI API enabled, testing basic connectivity...')
      
      try {
        // Simple text-only test first
        const basicTest = await openai.chat.completions.create({
          model: 'gpt-4o-mini', // Use the chat model for basic connectivity test
          max_tokens: 50,
          temperature: 0,
          messages: [
            {
              role: "user", 
              content: "Reply with exactly: 'API connection working'"
            }
          ]
        })
        
        results.aiStatus = {
          enabled: true,
          basicConnectivity: true,
          basicResponse: basicTest.choices[0]?.message?.content || 'No response'
        }
        console.log('✅ Basic OpenAI connectivity confirmed')
        
      } catch (error) {
        results.aiStatus = {
          enabled: true,
          basicConnectivity: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
        console.log('🚨 Basic OpenAI connectivity failed:', error)
      }
    }

    // Test 2: Vision Model Test - Can AI see ANYTHING?
    if (results.aiStatus?.basicConnectivity && document.fileData) {
      console.log('👁️ Testing AI vision capabilities...')
      
      try {
        const visionTest = await openai.chat.completions.create({
          model: AI_CONFIG.models.vision,
          max_tokens: 500,
          temperature: 0,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Describe what you see in this image. List any text, numbers, or content you can identify. Be specific about what text is visible."
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
        
        const visionResult = visionTest.choices[0]?.message?.content || 'No response'
        
        results.visionTest = {
          success: true,
          canSeeDocument: visionResult.length > 50, // If AI can see something, response should be substantial
          response: visionResult,
          responseLength: visionResult.length,
          
          // Check for specific content
          containsNumbers: /\d/.test(visionResult),
          containsEuroSymbol: visionResult.includes('€') || visionResult.includes('EUR'),
          containsVAT: visionResult.toLowerCase().includes('vat'),
          containsVolkswagen: visionResult.toLowerCase().includes('volkswagen') || visionResult.toLowerCase().includes('vw'),
          contains111_36: visionResult.includes('111.36'),
          contains103_16: visionResult.includes('103.16'),
          contains90_85: visionResult.includes('90.85'),
          
          tokensUsed: visionTest.usage
        }
        
        console.log('👁️ VISION TEST RESULTS:')
        console.log(`   Can see document: ${results.visionTest.canSeeDocument}`)
        console.log(`   Response length: ${visionResult.length}`)
        console.log(`   Contains numbers: ${results.visionTest.containsNumbers}`)
        console.log(`   Contains €: ${results.visionTest.containsEuroSymbol}`)
        console.log(`   Contains VAT: ${results.visionTest.containsVAT}`)
        console.log(`   Response preview: "${visionResult.substring(0, 200)}..."`)
        
      } catch (error) {
        results.visionTest = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
        console.log('🚨 Vision test failed:', error)
      }
    }

    // Test 3: Specific VAT Number Search
    if (results.visionTest?.success && results.visionTest?.canSeeDocument) {
      console.log('🔍 Testing specific VAT number extraction...')
      
      try {
        const vatSearchTest = await openai.chat.completions.create({
          model: AI_CONFIG.models.vision,
          max_tokens: 200,
          temperature: 0,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Look at this document and find ANY euro amounts. List every number with € symbol or EUR that you can see. Also look for the specific amounts: 111.36, 103.16, 90.85, 101.99. Tell me exactly what euro amounts are visible."
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
        
        const vatSearchResult = vatSearchTest.choices[0]?.message?.content || 'No response'
        
        results.vatSearchTest = {
          success: true,
          response: vatSearchResult,
          contains111_36: vatSearchResult.includes('111.36'),
          contains103_16: vatSearchResult.includes('103.16'),
          contains90_85: vatSearchResult.includes('90.85'),
          contains101_99: vatSearchResult.includes('101.99'),
          tokensUsed: vatSearchTest.usage
        }
        
        console.log('🔍 VAT SEARCH TEST RESULTS:')
        console.log(`   Found 111.36: ${results.vatSearchTest.contains111_36}`)
        console.log(`   Found 103.16: ${results.vatSearchTest.contains103_16}`)
        console.log(`   Found 90.85: ${results.vatSearchTest.contains90_85}`)
        console.log(`   Found 101.99: ${results.vatSearchTest.contains101_99}`)
        console.log(`   Response: "${vatSearchResult}"`)
        
      } catch (error) {
        results.vatSearchTest = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
        console.log('🚨 VAT search test failed:', error)
      }
    }

    // Test 4: Document Format Analysis
    results.documentAnalysis = {
      isPDF: document.mimeType === 'application/pdf',
      isImage: document.mimeType.startsWith('image/'),
      base64Length: document.fileData.length,
      base64Preview: document.fileData.substring(0, 100) + '...',
      base64IsValid: /^[A-Za-z0-9+/]*={0,2}$/.test(document.fileData)
    }
    
    console.log('📋 DOCUMENT FORMAT ANALYSIS:')
    console.log(`   Type: ${document.mimeType}`)
    console.log(`   Base64 length: ${document.fileData.length}`)
    console.log(`   Base64 valid: ${results.documentAnalysis.base64IsValid}`)

    // Summary and Diagnosis
    results.diagnosis = {
      timestamp: new Date().toISOString(),
      overallStatus: 'UNKNOWN',
      issues: [] as string[],
      recommendations: [] as string[]
    }
    
    if (!results.aiStatus?.enabled) {
      results.diagnosis.overallStatus = 'FAILED'
      results.diagnosis.issues.push('OpenAI API not configured')
      results.diagnosis.recommendations.push('Configure OPENAI_API_KEY environment variable')
    } else if (!results.aiStatus?.basicConnectivity) {
      results.diagnosis.overallStatus = 'FAILED'
      results.diagnosis.issues.push('OpenAI API connectivity failed')
      results.diagnosis.recommendations.push('Check API key and network connectivity')
    } else if (!results.visionTest?.success) {
      results.diagnosis.overallStatus = 'FAILED'
      results.diagnosis.issues.push('Vision model API failed')
      results.diagnosis.recommendations.push('Check if API key has vision model access')
    } else if (!results.visionTest?.canSeeDocument) {
      results.diagnosis.overallStatus = 'FAILED'
      results.diagnosis.issues.push('AI cannot see document content')
      results.diagnosis.recommendations.push('Check document format and base64 encoding')
    } else if (!results.vatSearchTest?.success) {
      results.diagnosis.overallStatus = 'PARTIAL'
      results.diagnosis.issues.push('VAT search test failed')
      results.diagnosis.recommendations.push('Debug specific VAT extraction logic')
    } else if (!results.vatSearchTest?.contains111_36) {
      results.diagnosis.overallStatus = 'EXTRACTION_ISSUE'
      results.diagnosis.issues.push('AI can see document but cannot find correct VAT amount (111.36)')
      results.diagnosis.recommendations.push('Document may not contain expected VAT amount, or OCR accuracy issue')
    } else {
      results.diagnosis.overallStatus = 'SUCCESS'
      results.diagnosis.recommendations.push('AI vision is working correctly')
    }
    
    console.log('🏁 DIAGNOSTIC SUMMARY:')
    console.log(`   Status: ${results.diagnosis.overallStatus}`)
    console.log(`   Issues: ${results.diagnosis.issues.length}`)
    results.diagnosis.issues.forEach((issue: string) => console.log(`     - ${issue}`))
    
    return NextResponse.json({
      success: true,
      message: 'Raw text extraction debug completed',
      results
    })
    
  } catch (error) {
    console.error('Raw text extraction API error:', error)
    return NextResponse.json({
      error: 'Failed to extract raw text',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export const GET = createGuestFriendlyRoute(rawTextEndpoint)