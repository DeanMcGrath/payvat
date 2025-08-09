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
  console.log('🚀 PROCESS DOCUMENT ENDPOINT CALLED')
  console.log(`   User: ${user ? `${user.id} (${user.email})` : 'GUEST/ANONYMOUS'}`)
  console.log(`   Request method: ${request.method}`)
  console.log(`   Request URL: ${request.url}`)
  console.log(`   User Agent: ${request.headers.get('user-agent')}`)
  console.log(`   Referer: ${request.headers.get('referer')}`)
  console.log(`   Timestamp: ${new Date().toISOString()}`)
  
  try {
    // Parse JSON with proper error handling
    let body: ProcessDocumentRequest
    try {
      body = await request.json()
    } catch (jsonError) {
      console.error('🚨 JSON PARSING ERROR:', jsonError)
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid JSON in request body',
          errorCode: 'INVALID_JSON',
          suggestions: [
            'Check that your request contains valid JSON',
            'Ensure Content-Type header is set to application/json'
          ],
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }
    
    const { documentId, forceReprocess = false, debugMode = false } = body
    
    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      )
    }
    
    // Find the document and verify ownership (for authenticated users)
    let document
    try {
      const whereClause: any = { id: documentId }
      if (user) {
        // For logged-in users, ensure they own the document
        whereClause.userId = user.id
      }
      
      console.log(`📄 Looking for document ${documentId}${user ? ` owned by user ${user.id}` : ' (no user)'}`)
      
      document = await prisma.document.findFirst({
        where: whereClause
      })
      
      if (!document) {
        console.error(`❌ Document ${documentId} not found${user ? ` for user ${user.id}` : ''}`)
        return NextResponse.json(
          { 
            error: 'Document not found or not authorized',
            documentId: documentId,
            userContext: user ? 'authenticated' : 'anonymous'
          },
          { status: 404 }
        )
      }
      
      console.log(`✅ Found document: ${document.originalName}`)
    } catch (dbError) {
      console.error('🚨 Database error when fetching document:', dbError)
      return NextResponse.json(
        { 
          error: 'Database error',
          message: 'Failed to retrieve document from database'
        },
        { status: 500 }
      )
    }
    
    // Check if already processed (unless force reprocessing)
    if (document.isScanned && document.scanResult && !forceReprocess) {
      // Parse VAT data from existing scan result
      let existingVATData = null
      
      // Try to extract VAT amounts from scan result for proper display
      const vatMatches = document.scanResult.match(/€([0-9,]+\.?[0-9]*)/g)
      if (vatMatches && vatMatches.length > 0) {
        const vatAmounts = vatMatches.map(match => parseFloat(match.replace('€', '').replace(',', '')))
        existingVATData = {
          salesVAT: [],
          purchaseVAT: vatAmounts, // Assume purchases for existing data
          confidence: 0.8,
          extractedText: ['Previously processed'],
          documentType: 'OTHER'
        }
      }
      
      return NextResponse.json({
        success: true,
        message: 'Document already processed',
        document: {
          id: document.id,
          isScanned: document.isScanned,
          scanResult: document.scanResult,
          extractedData: existingVATData
        },
        extractedData: existingVATData,
        processingInfo: {
          timestamp: new Date().toISOString(),
          processingType: 'CACHED',
          message: 'Document was previously processed successfully'
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
      connectivityTest: null,
      diagnosticMessage: null
    }
    
    try {
      // Quick API status check
      openAIStatus.apiKeyConfigured = !!process.env.OPENAI_API_KEY
      openAIStatus.apiKeyFormat = process.env.OPENAI_API_KEY?.startsWith('sk-') ? 'valid-format' : 'invalid-format'
      
      // Import diagnostics and run quick connectivity test
      const { isAIEnabled, getAIStatus } = await import('@/lib/ai/openai')
      const { quickConnectivityTest } = await import('@/lib/ai/diagnostics')
      
      openAIStatus.apiEnabled = isAIEnabled()
      const aiStatus = getAIStatus()
      openAIStatus.diagnosticMessage = aiStatus.reason
      
      if (!openAIStatus.apiEnabled) {
        console.log('🚨 CRITICAL: AI PROCESSING DISABLED')
        console.log(`   Reason: ${aiStatus.reason}`)
        console.log(`   Suggestions:`)
        aiStatus.suggestions.forEach(suggestion => {
          console.log(`     - ${suggestion}`)
        })
        console.log('   Impact: Document will be uploaded but NOT processed')
        console.log('   Result: "processedDocuments": 0 in API response')
      }
      
      if (openAIStatus.apiEnabled) {
        console.log('✅ OpenAI API key configured, testing connectivity...')
        const connectivityResult = await quickConnectivityTest()
        openAIStatus.connectivityTest = {
          success: connectivityResult.success,
          message: connectivityResult.message,
          error: connectivityResult.error
        }
        
        if (connectivityResult.success) {
          console.log('✅ OpenAI API connectivity confirmed - AI processing will work!')
        } else {
          console.error('🚨 OpenAI API connectivity failed:', connectivityResult.error)
          console.error('   Documents will fall back to legacy processing')
        }
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
    let result: any
    try {
      console.log('📄 Starting document processing...')
      result = await processDocument(
        document.fileData,
        document.mimeType,
        document.originalName,
        document.category,
        user?.id // Pass user ID for AI usage tracking
      )
      console.log('✅ Document processing completed successfully')
    } catch (processingError) {
      console.error('🚨 Document processing threw an error:', processingError)
      
      // Return a structured error response
      return NextResponse.json(
        {
          success: false,
          error: 'Document processing failed',
          errorCode: 'PROCESSING_EXCEPTION',
          technicalDetails: {
            error: processingError instanceof Error ? processingError.message : 'Unknown error',
            stack: processingError instanceof Error ? processingError.stack : undefined,
            timestamp: new Date().toISOString()
          },
          suggestions: [
            'Try uploading the document again',
            'Ensure the document is not corrupted',
            'Contact support if the issue persists'
          ]
        },
        { status: 500 }
      )
    }
    
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
      // Provide user-friendly error messages based on error type
      let userFriendlyMessage = 'Document processing failed'
      let userFriendlyCode = 'PROCESSING_ERROR'
      let suggestions: string[] = []
      
      const errorLower = (result.error || '').toLowerCase()
      
      if (errorLower.includes('pdf') && errorLower.includes('image-based')) {
        userFriendlyMessage = 'PDF appears to be image-based or scanned'
        userFriendlyCode = 'PDF_IMAGE_BASED'
        suggestions.push('Try converting the PDF to a high-quality image (PNG/JPG) and upload that instead')
        suggestions.push('Ensure the PDF contains selectable text, not just scanned images')
      } else if (errorLower.includes('pdf') && errorLower.includes('encrypted')) {
        userFriendlyMessage = 'PDF is password-protected or encrypted'
        userFriendlyCode = 'PDF_ENCRYPTED'
        suggestions.push('Remove password protection from the PDF before uploading')
        suggestions.push('Try saving the PDF as a new file to remove encryption')
      } else if (errorLower.includes('openai') || errorLower.includes('ai')) {
        userFriendlyMessage = 'AI document analysis temporarily unavailable'
        userFriendlyCode = 'AI_SERVICE_UNAVAILABLE'
        suggestions.push('The system will use alternative processing methods')
        suggestions.push('Some document types may have reduced accuracy')
      } else if (errorLower.includes('unsupported') || errorLower.includes('mime')) {
        userFriendlyMessage = 'File type not supported'
        userFriendlyCode = 'UNSUPPORTED_FILE_TYPE'
        suggestions.push('Supported formats: PDF, PNG, JPG, TXT, CSV')
        suggestions.push('Try converting your document to PDF or image format')
      }
      
      return NextResponse.json(
        { 
          success: false,
          error: userFriendlyMessage,
          errorCode: userFriendlyCode,
          suggestions: suggestions,
          technicalDetails: {
            originalError: result.error,
            scanResult: result.scanResult,
            timestamp: new Date().toISOString()
          },
          // Still provide some extracted data if available for debugging
          extractedData: result.extractedData || {
            salesVAT: [],
            purchaseVAT: [],
            confidence: 0,
            extractedText: ['Processing failed'],
            documentType: 'OTHER'
          }
        },
        { status: 422 } // 422 Unprocessable Entity instead of 500 for user errors
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
    
    // Store extracted VAT data in a separate table for easy querying (skip for guests) - with safe error handling
    if (user && result.extractedData && (result.extractedData.salesVAT?.length > 0 || result.extractedData.purchaseVAT?.length > 0)) {
      try {
        console.log('💾 CREATING AUDIT LOG: VAT data extracted successfully')
        console.log(`   User: ${user.id}`)
        console.log(`   Document: ${document.originalName} (${documentId})`)
        console.log(`   Sales VAT: [${result.extractedData.salesVAT?.join(', ') || 'none'}]`)
        console.log(`   Purchase VAT: [${result.extractedData.purchaseVAT?.join(', ') || 'none'}]`)
        console.log(`   Confidence: ${Math.round((result.extractedData.confidence || 0) * 100)}%`)
        
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
              confidence: result.extractedData.confidence || 0,
              timestamp: new Date().toISOString()
            }
          }
        })
        
        console.log('✅ AUDIT LOG CREATED SUCCESSFULLY')
      } catch (auditError) {
        console.error('🚨 AUDIT LOG CREATION FAILED:', auditError)
        console.error('   This will not prevent document processing from succeeding')
        console.error('   But VAT data may not be available in extracted VAT API')
        // Don't throw - allow processing to continue even if audit log fails
      }
    } else {
      console.log('ℹ️ SKIPPING AUDIT LOG:')
      console.log(`   User authenticated: ${!!user}`)
      console.log(`   Has extracted data: ${!!result.extractedData}`)
      console.log(`   Has VAT amounts: ${(result.extractedData?.salesVAT?.length || 0) + (result.extractedData?.purchaseVAT?.length || 0) > 0}`)
    }
    
    // Add AI status information to response for debugging
    const responseData = {
      success: true,
      document: {
        id: updatedDocument.id,
        fileName: updatedDocument.originalName,
        isScanned: updatedDocument.isScanned,
        scanResult: updatedDocument.scanResult,
        category: updatedDocument.category,
        extractedData: result.extractedData
      },
      // Also include extractedData at root level for easier access
      extractedData: result.extractedData,
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
        taxComplianceStatus: validationCheck.complianceStatus,
        aiProcessingStatus: {
          enabled: openAIStatus.apiEnabled,
          message: openAIStatus.apiEnabled 
            ? 'AI processing is enabled and working'
            : openAIStatus.diagnosticMessage || 'AI processing disabled - check API key configuration',
          impact: openAIStatus.apiEnabled
            ? 'Document processed with AI for maximum accuracy'
            : 'Document processed with legacy methods - may have reduced accuracy'
        },
        warnings: [] as string[] // Initialize as empty array, will be populated below if needed
      },
      // RAW TEXT DEBUG INFO (for tax compliance debugging) - with safe null handling
      debugInfo: (() => {
        try {
          const extractedText = result.extractedData?.extractedText
          let textString = ''
          
          // Safely convert extractedText to string
          if (extractedText) {
            if (Array.isArray(extractedText)) {
              textString = extractedText.join(' ')
            } else {
              textString = String(extractedText)
            }
          }
          
          return {
            aiExtractedText: textString ? 
              (textString.substring(0, 1000) + (textString.length > 1000 ? '...' : '')) : 
              'No AI extracted text available',
            textLength: textString.length,
            contains111_36: textString.includes('111.36'),
            contains90_85: textString.includes('90.85'),
            containsVW: textString.toLowerCase().includes('volkswagen') || textString.toLowerCase().includes('vw financial'),
            containsTotalAmountVAT: textString.toLowerCase().includes('total amount vat'),
            hardcodedOverride: (result.scanResult || '').includes('HARDCODED')
          }
        } catch (debugError) {
          console.error('🚨 DEBUG INFO GENERATION ERROR:', debugError)
          return {
            aiExtractedText: 'Error generating debug info',
            textLength: 0,
            contains111_36: false,
            contains90_85: false,
            containsVW: false,
            containsTotalAmountVAT: false,
            hardcodedOverride: false,
            debugError: debugError instanceof Error ? debugError.message : 'Unknown debug error'
          }
        }
      })()
    }
    
    // Add warning if AI is disabled
    if (!openAIStatus.apiEnabled) {
      responseData.processingInfo.warnings.push(
        'AI processing is disabled - document processed with legacy methods only',
        'VAT extraction accuracy may be reduced',
        'To enable full AI processing, configure OPENAI_API_KEY in environment variables'
      )
    }
    
    return NextResponse.json(responseData)
    
  } catch (error) {
    console.error('🚨 DOCUMENT PROCESSING API ERROR - DETAILED LOGGING:')
    console.error('   Error type:', error?.constructor?.name)
    console.error('   Error message:', error instanceof Error ? error.message : String(error))
    console.error('   Stack trace:', error instanceof Error ? error.stack : 'No stack trace available')
    
    // Log request context for debugging
    try {
      const body = await request.clone().json()
      console.error('   Request context:')
      console.error('     URL:', request.url)
      console.error('     Method:', request.method)
      console.error('     Document ID:', body.documentId)
      console.error('     Debug Mode:', body.debugMode)
      console.error('     Force Reprocess:', body.forceReprocess)
    } catch (bodyError) {
      console.error('   Could not parse request body for debugging:', bodyError)
    }
    
    // Determine specific error type and provide helpful response
    let specificError = 'Document processing failed'
    let errorCode = 'PROCESSING_ERROR'
    let suggestions: string[] = []
    
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase()
      
      // Database errors
      if (errorMessage.includes('prismaclient') || errorMessage.includes('database') || errorMessage.includes('connection')) {
        specificError = 'Database connection failed'
        errorCode = 'DATABASE_ERROR'
        suggestions.push('Please try again in a moment')
        suggestions.push('If the issue persists, contact support')
      }
      // Document not found errors
      else if (errorMessage.includes('document not found') || errorMessage.includes('not authorized')) {
        specificError = 'Document not found or access denied'
        errorCode = 'DOCUMENT_ACCESS_ERROR'
        suggestions.push('Make sure the document was uploaded successfully')
        suggestions.push('Try refreshing the page and uploading again')
      }
      // OpenAI API errors
      else if (errorMessage.includes('openai') || errorMessage.includes('api key') || errorMessage.includes('rate limit')) {
        specificError = 'AI processing service temporarily unavailable'
        errorCode = 'AI_SERVICE_ERROR'
        suggestions.push('The system will use alternative processing methods')
        suggestions.push('Document processing may still succeed with reduced accuracy')
      }
      // PDF processing errors
      else if (errorMessage.includes('pdf')) {
        specificError = 'PDF processing failed'
        errorCode = 'PDF_PROCESSING_ERROR'
        suggestions.push('Try converting the PDF to an image format (PNG/JPG)')
        suggestions.push('Ensure the PDF is not password-protected or corrupted')
      }
      // Import/Module errors
      else if (errorMessage.includes('import') || errorMessage.includes('module') || errorMessage.includes('cannot find')) {
        specificError = 'Service dependency error'
        errorCode = 'MODULE_ERROR'
        suggestions.push('Please contact support - this indicates a server configuration issue')
      }
      // JSON/Parsing errors
      else if (errorMessage.includes('json') || errorMessage.includes('parse') || errorMessage.includes('stringify')) {
        specificError = 'Data processing error'
        errorCode = 'DATA_PROCESSING_ERROR'
        suggestions.push('The document may contain unexpected data structures')
        suggestions.push('Try uploading a different document format')
      }
      else {
        specificError = error.message
      }
    }
    
    console.error('   Categorized as:', errorCode)
    console.error('   User-friendly message:', specificError)
    console.error('   Suggestions:', suggestions)
    
    return NextResponse.json(
      { 
        success: false,
        error: specificError,
        errorCode: errorCode,
        suggestions: suggestions,
        timestamp: new Date().toISOString(),
        // Include more details in development
        ...(process.env.NODE_ENV === 'development' && {
          debugInfo: {
            originalError: error instanceof Error ? error.message : String(error),
            stackTrace: error instanceof Error ? error.stack?.substring(0, 1000) : null,
            errorType: error?.constructor?.name
          }
        })
      },
      { status: 500 }
    )
  }
}

export const POST = createGuestFriendlyRoute(processDocumentEndpoint)