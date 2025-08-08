import { NextRequest, NextResponse } from 'next/server'
import { createGuestFriendlyRoute } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { processDocument } from '@/lib/documentProcessor'
import { AuthUser } from '@/lib/auth'

interface ProcessDocumentRequest {
  documentId: string
  forceReprocess?: boolean
  debugMode?: boolean // 🚨 EMERGENCY: Enable simple vs complex prompt testing
}

/**
 * POST /api/documents/process - Process a document for VAT extraction
 */
async function processDocumentEndpoint(request: NextRequest, user?: AuthUser) {
  try {
    const body: ProcessDocumentRequest = await request.json()
    const { documentId, forceReprocess = false, debugMode = false } = body
    
    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      )
    }
    
    // Find the document and verify ownership (for authenticated users) or allow guest access
    const whereClause: any = { id: documentId }
    if (user) {
      whereClause.userId = user.id
    }
    
    const document = await prisma.document.findFirst({
      where: whereClause
    })
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found or not authorized' },
        { status: 404 }
      )
    }
    
    // Check if already processed (unless force reprocessing)
    if (document.isScanned && document.scanResult && !forceReprocess) {
      return NextResponse.json({
        success: true,
        message: 'Document already processed',
        document: {
          id: document.id,
          isScanned: document.isScanned,
          scanResult: document.scanResult,
          extractedData: document.scanResult.includes('€') ? {
            processed: true,
            hasVATData: true
          } : null
        }
      })
    }
    
    if (!document.fileData) {
      return NextResponse.json(
        { error: 'Document file data not available' },
        { status: 400 }
      )
    }
    
    console.log(`Processing document: ${document.originalName} (${document.category})`)
    
    // IMMEDIATE OPENAI API STATUS CHECK - Show status to user via console and response
    console.log('🔍 PRE-PROCESSING: Checking OpenAI API status...')
    const openAIStatus: any = {
      apiKeyConfigured: false,
      apiKeyFormat: 'invalid',
      apiEnabled: false,
      connectivityTest: null
    }
    
    try {
      // Quick API status check
      openAIStatus.apiKeyConfigured = !!process.env.OPENAI_API_KEY
      openAIStatus.apiKeyFormat = process.env.OPENAI_API_KEY?.startsWith('sk-') ? 'valid-format' : 'invalid-format'
      
      // Import diagnostics and run quick connectivity test
      const { isAIEnabled } = await import('@/lib/ai/openai')
      const { quickConnectivityTest } = await import('@/lib/ai/diagnostics')
      openAIStatus.apiEnabled = isAIEnabled()
      
      if (openAIStatus.apiEnabled) {
        console.log('✅ OpenAI API key configured, testing connectivity...')
        const connectivityResult = await quickConnectivityTest()
        openAIStatus.connectivityTest = {
          success: connectivityResult.success,
          message: connectivityResult.message,
          error: connectivityResult.error
        }
        
        if (connectivityResult.success) {
          console.log('✅ OpenAI API connectivity confirmed')
        } else {
          console.error('🚨 OpenAI API connectivity failed:', connectivityResult.error)
        }
      } else {
        console.log('⚠️ OpenAI API not enabled (missing or invalid API key)')
      }
    } catch (statusError) {
      console.error('⚠️ Failed to check OpenAI API status:', statusError)
      openAIStatus.connectivityTest = {
        success: false,
        message: 'Status check failed',
        error: statusError instanceof Error ? statusError.message : 'Unknown error'
      }
    }
    
    console.log('🤖 OpenAI API Status Summary:', openAIStatus)
    
    // 🚨 EMERGENCY EMBEDDED PROMPT DIAGNOSTIC - Simple vs Complex Test
    let promptDiagnostic: any = null
    if (debugMode && openAIStatus.apiEnabled && document.fileData) {
      console.log('🧪🚨 EMERGENCY DEBUG MODE: Testing Simple vs Complex Prompts')
      
      try {
        const { openai, AI_CONFIG } = await import('@/lib/ai/openai')
        const { DOCUMENT_PROMPTS } = await import('@/lib/ai/prompts')
        
        const isVWDoc = document.originalName.toLowerCase().includes('vw') || 
                       document.originalName.toLowerCase().includes('volkswagen') ||
                       document.originalName.toLowerCase().includes('financial')
        
        console.log(`🚗 VW Document Detection: ${isVWDoc}`)
        console.log('🎯 Testing SIMPLE prompt: "What is the Total Amount VAT on this Volkswagen Financial Services invoice?"')
        
        // Test 1: Simple Prompt
        const simplePrompt = "What is the Total Amount VAT on this Volkswagen Financial Services invoice? Look for the field labeled 'Total Amount VAT' and extract only that euro amount. Return just the number."
        const simpleResponse = await openai.chat.completions.create({
          model: AI_CONFIG.models.vision,
          max_tokens: 100,
          temperature: 0.0,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: simplePrompt
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
        console.log(`🎯 SIMPLE PROMPT RESULT: "${simpleResult}"`)
        console.log(`🎯 Simple found €111.36: ${simpleResult.includes('111.36')}`)
        console.log(`🎯 Simple found €103.16: ${simpleResult.includes('103.16')}`)
        console.log(`🎯 Simple found €101.99: ${simpleResult.includes('101.99')}`)
        
        // Test 2: Complex Prompt (first 500 chars for comparison)
        console.log('📊 Testing COMPLEX prompt (full VAT_EXTRACTION prompt)')
        const complexPrompt = document.mimeType === 'application/pdf' 
          ? `${DOCUMENT_PROMPTS.VAT_EXTRACTION}\n\nNote: This is a PDF document. Please extract all visible text and VAT information from all pages.`
          : DOCUMENT_PROMPTS.VAT_EXTRACTION
        
        const complexResponse = await openai.chat.completions.create({
          model: AI_CONFIG.models.vision,
          max_tokens: AI_CONFIG.limits.maxTokens,
          temperature: AI_CONFIG.limits.temperature,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: complexPrompt
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
        console.log(`📊 COMPLEX PROMPT RESULT LENGTH: ${complexResult.length} chars`)
        console.log(`📊 Complex found €111.36: ${complexResult.includes('111.36')}`)
        console.log(`📊 Complex found €103.16: ${complexResult.includes('103.16')}`)
        console.log(`📊 Complex found €101.99: ${complexResult.includes('101.99')}`)
        console.log(`📊 COMPLEX RESULT PREVIEW: "${complexResult.substring(0, 300)}..."`)
        
        // Comparison Results
        const comparison = {
          simpleFound111_36: simpleResult.includes('111.36'),
          complexFound111_36: complexResult.includes('111.36'),
          simpleFound103_16: simpleResult.includes('103.16'),
          complexFound103_16: complexResult.includes('103.16'),
          simpleFound101_99: simpleResult.includes('101.99'),
          complexFound101_99: complexResult.includes('101.99'),
          verdict: ''
        }
        
        if (comparison.simpleFound111_36 && !comparison.complexFound111_36) {
          comparison.verdict = '🎯 SIMPLE PROMPT WINS - Found correct €111.36, complex failed'
        } else if (comparison.complexFound111_36 && !comparison.simpleFound111_36) {
          comparison.verdict = '📊 COMPLEX PROMPT WINS - Found correct €111.36, simple failed'
        } else if (comparison.simpleFound111_36 && comparison.complexFound111_36) {
          comparison.verdict = '✅ BOTH WORK - Both found €111.36'
        } else {
          comparison.verdict = '🚨 BOTH FAILED - Neither found €111.36'
        }
        
        console.log('🔍🚨 EMERGENCY DIAGNOSTIC RESULTS:')
        console.log(`   🎯 Simple prompt result: "${simpleResult}"`)
        console.log(`   📊 Complex prompt found €111.36: ${comparison.complexFound111_36}`)
        console.log(`   ✅ VERDICT: ${comparison.verdict}`)
        
        promptDiagnostic = {
          isVWDocument: isVWDoc,
          simplePrompt: simplePrompt,
          simpleResult: simpleResult,
          complexResultLength: complexResult.length,
          complexResultPreview: complexResult.substring(0, 500),
          comparison: comparison,
          tokensUsed: {
            simple: simpleResponse.usage?.total_tokens || 0,
            complex: complexResponse.usage?.total_tokens || 0
          }
        }
        
      } catch (debugError) {
        console.error('🚨 EMERGENCY DEBUG FAILED:', debugError)
        promptDiagnostic = {
          error: debugError instanceof Error ? debugError.message : 'Unknown error',
          failed: true
        }
      }
    }
    
    // Process the document with AI enhancement
    const result = await processDocument(
      document.fileData,
      document.mimeType,
      document.originalName,
      document.category,
      user?.id // Pass user ID for AI usage tracking
    )
    
    // 🔍 DOCUMENT PROCESSING VALIDATION
    console.log('🔍 DOCUMENT PROCESSING VALIDATION: Checking extraction results...')
    const validationCheck = {
      extractedAmounts: [] as number[],
      hasValidExtraction: false,
      confidence: 0,
      complianceStatus: 'UNKNOWN' as 'COMPLIANT' | 'WARNING' | 'ERROR' | 'UNKNOWN'
    }
    
    if (result.success && result.extractedData) {
      const allAmounts = [...result.extractedData.salesVAT, ...result.extractedData.purchaseVAT]
      validationCheck.extractedAmounts = allAmounts
      validationCheck.confidence = result.extractedData.confidence || 0
      validationCheck.hasValidExtraction = allAmounts.length > 0
      
      if (validationCheck.hasValidExtraction) {
        if (validationCheck.confidence >= 0.8) {
          validationCheck.complianceStatus = 'COMPLIANT'
          console.log('✅ HIGH CONFIDENCE EXTRACTION: VAT data extracted with good confidence')
        } else if (validationCheck.confidence >= 0.5) {
          validationCheck.complianceStatus = 'WARNING'  
          console.log('⚠️ MEDIUM CONFIDENCE: Manual review recommended')
        } else {
          validationCheck.complianceStatus = 'WARNING'
          console.log('⚠️ LOW CONFIDENCE: Extraction may be inaccurate')
        }
      } else {
        validationCheck.complianceStatus = 'ERROR'
        console.log('🚨 NO VAT DATA EXTRACTED')
      }
    } else {
      validationCheck.complianceStatus = 'ERROR'
      console.log('🚨 DOCUMENT PROCESSING FAILED')
    }
    
    console.log('🔍 VALIDATION SUMMARY:')
    console.log(`   Extracted amounts: €${validationCheck.extractedAmounts.join(', €') || 'none'}`)
    console.log(`   Confidence: ${Math.round(validationCheck.confidence * 100)}%`)
    console.log(`   Status: ${validationCheck.complianceStatus}`)
    console.log(`   Ready for review: ${validationCheck.hasValidExtraction ? 'Yes' : 'No'}`)
    
    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Document processing failed',
          details: result.error
        },
        { status: 500 }
      )
    }
    
    // Update document with processing results
    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: {
        isScanned: true,
        scanResult: result.scanResult,
      }
    })
    
    // Store extracted VAT data in a separate table for easy querying (skip for guests)
    if (user && result.extractedData && (result.extractedData.salesVAT.length > 0 || result.extractedData.purchaseVAT.length > 0)) {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'VAT_DATA_EXTRACTED',
          entityType: 'DOCUMENT',
          entityId: documentId,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          metadata: {
            extractedData: JSON.parse(JSON.stringify(result.extractedData)),
            fileName: document.originalName,
            category: document.category,
            confidence: result.extractedData.confidence,
            timestamp: new Date().toISOString()
          }
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      document: {
        id: updatedDocument.id,
        fileName: updatedDocument.originalName,
        isScanned: updatedDocument.isScanned,
        scanResult: updatedDocument.scanResult,
        category: updatedDocument.category,
        extractedData: result.extractedData
      },
      // Include OpenAI API status for debugging
      openAIStatus: openAIStatus,
      // 🚨 EMERGENCY EMBEDDED PROMPT DIAGNOSTIC
      promptDiagnostic: promptDiagnostic,
      // Document validation results
      validationCheck: validationCheck,
      processingInfo: {
        timestamp: new Date().toISOString(),
        processingType: result.scanResult.includes('AI') ? 'AI_ENHANCED' : 'LEGACY',
        hasAPIConnectivity: openAIStatus.connectivityTest?.success || false,
        taxComplianceStatus: validationCheck.complianceStatus
      },
      // RAW TEXT DEBUG INFO (for tax compliance debugging)
      debugInfo: {
        aiExtractedText: result.extractedData?.extractedText ? 
          String(result.extractedData.extractedText).substring(0, 1000) + (String(result.extractedData.extractedText).length > 1000 ? '...' : '') : 
          'No AI extracted text available',
        textLength: result.extractedData?.extractedText ? String(result.extractedData.extractedText).length : 0,
        contains111_36: result.extractedData?.extractedText ? String(result.extractedData.extractedText).includes('111.36') : false,
        contains90_85: result.extractedData?.extractedText ? String(result.extractedData.extractedText).includes('90.85') : false,
        containsVW: result.extractedData?.extractedText ? 
          (String(result.extractedData.extractedText).toLowerCase().includes('volkswagen') || 
           String(result.extractedData.extractedText).toLowerCase().includes('vw financial')) : false,
        containsTotalAmountVAT: result.extractedData?.extractedText ? 
          String(result.extractedData.extractedText).toLowerCase().includes('total amount vat') : false,
        hardcodedOverride: result.scanResult.includes('HARDCODED') || false
      }
    })
    
  } catch (error) {
    console.error('🚨 DOCUMENT PROCESSING API ERROR - DETAILED LOGGING:')
    console.error('   Error type:', error?.constructor?.name)
    console.error('   Error message:', error instanceof Error ? error.message : String(error))
    console.error('   Stack trace:', error instanceof Error ? error.stack : 'No stack trace available')
    
    // Log request context for debugging
    console.error('   Request context:')
    console.error('     URL:', request.url)
    console.error('     Method:', request.method)
    console.error('     Headers:', Object.fromEntries(request.headers.entries()))
    
    // Determine specific error type and provide helpful response
    let specificError = 'Unknown error occurred'
    let errorCode = 'PROCESSING_ERROR'
    
    if (error instanceof Error) {
      // Database errors
      if (error.message.includes('PrismaClient') || error.message.includes('database')) {
        specificError = 'Database connection failed'
        errorCode = 'DATABASE_ERROR'
      }
      // OpenAI API errors
      else if (error.message.includes('OpenAI') || error.message.includes('API key')) {
        specificError = 'AI processing service unavailable'
        errorCode = 'AI_SERVICE_ERROR'
      }
      // PDF processing errors
      else if (error.message.includes('pdf') || error.message.includes('PDF')) {
        specificError = 'PDF processing failed'
        errorCode = 'PDF_PROCESSING_ERROR'
      }
      // Import/Module errors
      else if (error.message.includes('import') || error.message.includes('module')) {
        specificError = 'Service dependency error'
        errorCode = 'MODULE_ERROR'
      }
      else {
        specificError = error.message
      }
    }
    
    console.error('   Categorized as:', errorCode)
    console.error('   User-friendly message:', specificError)
    
    return NextResponse.json(
      { 
        error: specificError,
        errorCode: errorCode,
        timestamp: new Date().toISOString(),
        // Include more details in development
        ...(process.env.NODE_ENV === 'development' && {
          debugInfo: {
            originalError: error instanceof Error ? error.message : String(error),
            stackTrace: error instanceof Error ? error.stack : null
          }
        })
      },
      { status: 500 }
    )
  }
}

export const POST = createGuestFriendlyRoute(processDocumentEndpoint)