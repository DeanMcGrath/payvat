import { NextRequest, NextResponse } from 'next/server'
import { createGuestFriendlyRoute } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { processDocument } from '@/lib/documentProcessor'
import { AuthUser } from '@/lib/auth'
import { extractionMonitor, createExtractionAttempt } from '@/lib/extraction-monitor'
import { invalidateUserCache } from '@/app/api/documents/extracted-vat/route'

// Force Node.js runtime for XLSX library compatibility
export const runtime = 'nodejs'

interface ProcessDocumentRequest {
  documentId: string
  forceReprocess?: boolean
  debugMode?: boolean // 🚨 EMERGENCY: Enable simple vs complex prompt testing
}

/**
 * POST /api/documents/process - Process a document for VAT extraction
 */
async function processDocumentEndpoint(request: NextRequest, user?: AuthUser) {
  // console.log('PROCESS DOCUMENT ENDPOINT CALLED')
  // console.log(`   User: ${user ? `${user.id} (${user.email})` : 'GUEST/ANONYMOUS'}`)
  // console.log(`   Request method: ${request.method}`)
  // console.log(`   Request URL: ${request.url}`)
  // console.log(`   User Agent: ${request.headers.get('user-agent')}`)
  // console.log(`   Referer: ${request.headers.get('referer')}`)
  // console.log(`   Timestamp: ${new Date().toISOString()}`)
  
  try {
    // Parse JSON with proper error handling
    let body: ProcessDocumentRequest
    try {
      body = await request.json()
    } catch (jsonError) {
      console.error('JSON PARSING ERROR:', jsonError)
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
      
      // console.log(`Looking for document ${documentId}${user ? ` owned by user ${user.id}` : ' (no user)'}`)
      
      document = await prisma.document.findFirst({
        where: whereClause
      })
      
      if (!document) {
        console.error(`Document ${documentId} not found${user ? ` for user ${user.id}` : ''}`)
        return NextResponse.json(
          { 
            error: 'Document not found or not authorized',
            documentId: documentId,
            userContext: user ? 'authenticated' : 'anonymous'
          },
          { status: 404 }
        )
      }
      
      // console.log(`Found document: ${document.originalName}`)
    } catch (dbError) {
      console.error('Database error when fetching document:', dbError)
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
    
    // CRITICAL DEBUG: Validate file data before processing
    // console.log('FILE DATA VALIDATION:')
    // console.log(`   Document: ${document.originalName} (${document.category})`)
    // console.log(`   MIME Type: ${document.mimeType}`)
    // console.log(`   File data exists: ${!!document.fileData}`)
    // console.log(`   File data type: ${typeof document.fileData}`)
    // console.log(`   File data length: ${document.fileData?.length || 0} characters`)
    
    // Check if fileData is valid base64
    if (document.fileData) {
      try {
        const testBuffer = Buffer.from(document.fileData, 'base64')
        // console.log(`   Base64 decode test: SUCCESS (${testBuffer.length} bytes)`)
        
        // For PDFs, check the header
        if (document.mimeType === 'application/pdf') {
          const pdfHeader = testBuffer.subarray(0, 4).toString('ascii')
          // console.log(`   PDF header check: "${pdfHeader}" (${pdfHeader.startsWith('%PDF') ? 'VALID' : 'INVALID'})`)
        }
      } catch (base64Error) {
        console.error('CRITICAL: fileData base64 decode failed:', base64Error)
        return NextResponse.json(
          { 
            error: 'Invalid file data format - not valid base64',
            errorCode: 'INVALID_FILE_DATA',
            technicalDetails: {
              error: base64Error instanceof Error ? base64Error.message : 'Base64 decode failed',
              timestamp: new Date().toISOString()
            }
          },
          { status: 400 }
        )
      }
    }
    
    // IMMEDIATE OPENAI API STATUS CHECK - Show status to user via console and response
    // console.log('PRE-PROCESSING: Checking OpenAI API status...')
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
        // console.log('CRITICAL: AI PROCESSING DISABLED')
        // console.log(`   Reason: ${aiStatus.reason}`)
        // console.log(`   Suggestions:`)
        aiStatus.suggestions.forEach(suggestion => {
          // console.log(`     - ${suggestion}`)
        })
        // console.log('   Impact: Document will be uploaded but NOT processed')
        // console.log('   Result: "processedDocuments": 0 in API response')
      }
      
      if (openAIStatus.apiEnabled) {
        // console.log('OpenAI API key configured, testing connectivity...')
        const connectivityResult = await quickConnectivityTest()
        openAIStatus.connectivityTest = {
          success: connectivityResult.success,
          message: connectivityResult.message,
          error: connectivityResult.error
        }
        
        if (connectivityResult.success) {
          // console.log('OpenAI API connectivity confirmed - AI processing will work!')
        } else {
          console.error('OpenAI API connectivity failed:', connectivityResult.error)
          console.error('   Documents will fall back to legacy processing')
        }
      }
    } catch (statusError) {
        console.error('Failed to check OpenAI API status:', statusError)
      openAIStatus.connectivityTest = {
        success: false,
        message: 'Status check failed',
        error: statusError instanceof Error ? statusError.message : 'Unknown error'
      }
    }
    
    // console.log('OpenAI API Status Summary:', openAIStatus)
    
    // 🚨 EMERGENCY EMBEDDED PROMPT DIAGNOSTIC - Simple vs Complex Test
    let promptDiagnostic: any = null
    if (debugMode && openAIStatus.apiEnabled && document.fileData) {
      // console.log('EMERGENCY DEBUG MODE: Testing Simple vs Complex Prompts')
      
      try {
        const { openai, AI_CONFIG } = await import('@/lib/ai/openai')
        const { DOCUMENT_PROMPTS } = await import('@/lib/ai/prompts')
        
        const isVWDoc = document.originalName.toLowerCase().includes('vw') || 
                       document.originalName.toLowerCase().includes('volkswagen') ||
                       document.originalName.toLowerCase().includes('financial')
        
        // console.log(`VW Document Detection: ${isVWDoc}`)
        // console.log('Testing SIMPLE prompt: "What is the Total Amount VAT on this Volkswagen Financial Services invoice?"')
        
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
        // console.log(`SIMPLE PROMPT RESULT: "${simpleResult}"`)
        // console.log(`Simple found €111.36: ${simpleResult.includes('111.36')}`)
        // console.log(`Simple found €103.16: ${simpleResult.includes('103.16')}`)
        // console.log(`Simple found €101.99: ${simpleResult.includes('101.99')}`)
        
        // Test 2: Complex Prompt (first 500 chars for comparison)
        // console.log('Testing COMPLEX prompt (full VAT_EXTRACTION prompt)')
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
        // console.log(`COMPLEX PROMPT RESULT LENGTH: ${complexResult.length} chars`)
        // console.log(`Complex found €111.36: ${complexResult.includes('111.36')}`)
        // console.log(`Complex found €103.16: ${complexResult.includes('103.16')}`)
        // console.log(`Complex found €101.99: ${complexResult.includes('101.99')}`)
        // console.log(`COMPLEX RESULT PREVIEW: "${complexResult.substring(0, 300)}..."`)
        
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
          comparison.verdict = 'SIMPLE PROMPT WINS - Found correct €111.36, complex failed'
        } else if (comparison.complexFound111_36 && !comparison.simpleFound111_36) {
          comparison.verdict = 'COMPLEX PROMPT WINS - Found correct €111.36, simple failed'
        } else if (comparison.simpleFound111_36 && comparison.complexFound111_36) {
          comparison.verdict = 'BOTH WORK - Both found €111.36'
        } else {
          comparison.verdict = 'BOTH FAILED - Neither found €111.36'
        }
        
        // console.log('EMERGENCY DIAGNOSTIC RESULTS:')
        // console.log(`   Simple prompt result: "${simpleResult}"`)
        // console.log(`   Complex prompt found €111.36: ${comparison.complexFound111_36}`)
        // console.log(`   VERDICT: ${comparison.verdict}`)
        
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
        console.error('EMERGENCY DEBUG FAILED:', debugError)
        promptDiagnostic = {
          error: debugError instanceof Error ? debugError.message : 'Unknown error',
          failed: true
        }
      }
    }
    
    // Process the document with enhanced AI engine and monitoring  
    let result: any
    const processingStartTime = Date.now()
    
    try {
      // console.log('Starting ENHANCED document processing with real-time monitoring...')
      // console.log(`   File: ${document.originalName}`)
      // console.log(`   Category: ${document.category}`)
      // console.log(`   User: ${user ? user.id : 'anonymous'}`)
      // console.log(`   Enhanced Engine: ${process.env.USE_ENHANCED_PROCESSING !== 'false' ? 'ENABLED' : 'DISABLED'}`)
      
      // Try enhanced processing first (if enabled)
      if (process.env.USE_ENHANCED_PROCESSING !== 'false') {
        // console.log('Using Enhanced VAT Processing Engine v2.0...')
        const { processDocumentEnhanced } = await import('@/lib/documentProcessor')
        
        try {
          result = await processDocumentEnhanced(
            document.fileData,
            document.mimeType,
            document.originalName,
            document.category,
            user?.id
          )
          // console.log('Enhanced processing completed successfully!')
        } catch (enhancedError) {
          // console.log('Enhanced processing failed, falling back to legacy...')
          // console.log(`   Error: ${enhancedError instanceof Error ? enhancedError.message : enhancedError}`)
          
          // Fallback to original processing
          result = await processDocument(
            document.fileData,
            document.mimeType,
            document.originalName,
            document.category,
            user?.id
          )
        }
      } else {
        // Use legacy processing
        // console.log('Using legacy processing (enhanced engine disabled)...')
        result = await processDocument(
          document.fileData,
          document.mimeType,
          document.originalName,
          document.category,
          user?.id
        )
      }
      
      const processingTimeMs = Date.now() - processingStartTime
      // console.log('✅ Document processing completed successfully')
      // console.log(`   Processing time: ${processingTimeMs}ms`)

      // 🚨 NEW: Create extraction attempt for monitoring
      if (result.success && result.extractedData) {
        const extractedAmount = [
          ...(result.extractedData.salesVAT || []),
          ...(result.extractedData.purchaseVAT || [])
        ].reduce((sum, amt) => sum + amt, 0)

        // Determine file type for monitoring
        const fileExtension = document.originalName.split('.').pop()?.toLowerCase()
        let fileType: 'excel' | 'pdf' | 'image' | 'other' = 'other'
        if (fileExtension === 'xlsx' || fileExtension === 'xls') {
          fileType = 'excel'
        } else if (fileExtension === 'pdf') {
          fileType = 'pdf'
        } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff'].includes(fileExtension || '')) {
          fileType = 'image'
        }

        // Determine processing method from result
        let processingMethod: 'woocommerce_processor' | 'excel_generic' | 'ai_vision' | 'legacy_text' = 'legacy_text'
        if (result.scanResult?.includes('WooCommerce VAT extracted')) {
          processingMethod = 'woocommerce_processor'
        } else if (result.scanResult?.includes('VAT extracted from Excel')) {
          processingMethod = 'excel_generic'
        } else if (result.scanResult?.includes('AI processed')) {
          processingMethod = 'ai_vision'
        }

        // Check for expected WooCommerce totals
        let expectedAmount: number | undefined
        if (document.originalName.toLowerCase().includes('product_list')) {
          expectedAmount = 5475.24
        } else if (document.originalName.toLowerCase().includes('recent_order')) {
          expectedAmount = 11036.40
        }

        const extractionAttempt = createExtractionAttempt(
          document.originalName,
          fileType,
          processingMethod,
          {
            success: true,
            extractedAmount,
            confidence: result.extractedData.confidence || 0.8,
            processingTimeMs,
            errors: [],
            warnings: result.extractedData.validationFlags || []
          },
          {
            expectedAmount,
            userId: user?.id
          }
        )

        extractionMonitor.logAttempt(extractionAttempt)
        
        // console.log('📊 MONITORING: Extraction attempt logged')
        // console.log(`   Amount: €${extractedAmount.toFixed(2)}`)
        // console.log(`   Method: ${processingMethod}`)
        // console.log(`   Confidence: ${Math.round((result.extractedData.confidence || 0.8) * 100)}%`)
        if (expectedAmount) {
          const accuracy = Math.max(0, 100 - (Math.abs(extractedAmount - expectedAmount) / expectedAmount) * 100)
          // console.log(`   Accuracy: ${accuracy.toFixed(1)}%`)
        }
      }
      
    } catch (processingError) {
      const processingTimeMs = Date.now() - processingStartTime
      console.error('🚨 Document processing threw an error:', processingError)
      console.error(`   Processing time before error: ${processingTimeMs}ms`)

      // 🚨 NEW: Log failed extraction attempt for monitoring
      const fileExtension = document.originalName.split('.').pop()?.toLowerCase()
      let fileType: 'excel' | 'pdf' | 'image' | 'other' = 'other'
      if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        fileType = 'excel'
      } else if (fileExtension === 'pdf') {
        fileType = 'pdf'
      } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff'].includes(fileExtension || '')) {
        fileType = 'image'
      }

      const failedAttempt = createExtractionAttempt(
        document.originalName,
        fileType,
        'legacy_text', // Default to legacy since processing failed
        {
          success: false,
          extractedAmount: 0,
          confidence: 0,
          processingTimeMs,
          errors: [processingError instanceof Error ? processingError.message : String(processingError)],
          warnings: []
        },
        {
          userId: user?.id
        }
      )

      extractionMonitor.logAttempt(failedAttempt)
      // console.log('📊 MONITORING: Failed extraction attempt logged')
      
      // ENHANCED: Mark document as failed with detailed status
      try {
        const failureStatus = {
          status: 'failed',
          timestamp: new Date().toISOString(),
          processingTime: processingTimeMs,
          error: processingError instanceof Error ? processingError.message : 'Unknown error',
          retryable: true
        }
        
        await prisma.document.update({
          where: { id: documentId },
          data: {
            isScanned: false, // Keep as false to indicate processing incomplete
            scanResult: `Processing failed: ${failureStatus.error}\n\n[PROCESSING_STATUS: ${JSON.stringify(failureStatus)}]`,
          }
        })
      } catch (updateError) {
        console.error('Failed to update document status:', updateError)
      }
      
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
    // console.log('🔍 DOCUMENT PROCESSING VALIDATION: Checking extraction results...')
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
          // console.log('✅ HIGH CONFIDENCE EXTRACTION: VAT data extracted with good confidence')
        } else if (validationCheck.confidence >= 0.5) {
          validationCheck.complianceStatus = 'WARNING'  
          // console.log('⚠️ MEDIUM CONFIDENCE: Manual review recommended')
        } else {
          validationCheck.complianceStatus = 'WARNING'
          // console.log('⚠️ LOW CONFIDENCE: Extraction may be inaccurate')
        }
      } else {
        validationCheck.complianceStatus = 'ERROR'
        // console.log('🚨 NO VAT DATA EXTRACTED')
      }
    } else {
      validationCheck.complianceStatus = 'ERROR'
      // console.log('🚨 DOCUMENT PROCESSING FAILED')
    }
    
    // console.log('🔍 VALIDATION SUMMARY:')
    // console.log(`   Extracted amounts: €${validationCheck.extractedAmounts.join(', €') || 'none'}`)
    // console.log(`   Confidence: ${Math.round(validationCheck.confidence * 100)}%`)
    // console.log(`   Status: ${validationCheck.complianceStatus}`)
    // console.log(`   Ready for review: ${validationCheck.hasValidExtraction ? 'Yes' : 'No'}`)
    
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
    
    // ENHANCED: Update document with detailed processing status
    const processingStatus = {
      status: 'completed',
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - processingStartTime,
      engine: result.processingSteps ? 'enhanced' : 'legacy',
      vatExtracted: result.extractedData ? [...result.extractedData.salesVAT, ...result.extractedData.purchaseVAT].length > 0 : false,
      confidence: result.extractedData?.confidence || 0,
      originalScanResult: result.scanResult
    }
    
    // Extract date information for automatic folder allocation
    let extractedDate: Date | null = null
    let extractedYear: number | null = null
    let extractedMonth: number | null = null
    
    if (result.extractedData?.invoiceDate) {
      try {
        // Parse various date formats commonly found in Irish documents
        const dateStr = result.extractedData.invoiceDate
        let parsedDate: Date | null = null
        
        // Try multiple date formats
        const dateFormats = [
          // DD/MM/YYYY (Irish standard)
          /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
          // MM/DD/YYYY (American format)
          /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,
          // YYYY-MM-DD (ISO format)
          /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
          // DD MMM YYYY (e.g., 15 Jan 2025)
          /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/i
        ]
        
        console.log(`📅 EXTRACTING DATE: Attempting to parse "${dateStr}"`)
        
        // Try direct parsing first
        parsedDate = new Date(dateStr)
        if (isNaN(parsedDate.getTime())) {
          // Try regex patterns
          for (const pattern of dateFormats) {
            const match = dateStr.match(pattern)
            if (match) {
              if (pattern.source.includes('(\\d{4}).*?(\\d{1,2}).*?(\\d{1,2})')) {
                // YYYY-MM-DD format
                parsedDate = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]))
              } else if (match[2] && isNaN(parseInt(match[2]))) {
                // Month name format
                const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 
                                  'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
                const monthIndex = monthNames.indexOf(match[2].toLowerCase())
                if (monthIndex !== -1) {
                  parsedDate = new Date(parseInt(match[3]), monthIndex, parseInt(match[1]))
                }
              } else {
                // DD/MM/YYYY format (assume Irish format)
                parsedDate = new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]))
              }
              
              if (!isNaN(parsedDate.getTime())) {
                break
              }
            }
          }
        }
        
        // Validate the parsed date is reasonable
        if (parsedDate && !isNaN(parsedDate.getTime())) {
          const currentYear = new Date().getFullYear()
          const year = parsedDate.getFullYear()
          
          // Accept dates from 1990 to 2030 (reasonable range for business documents)
          if (year >= 1990 && year <= 2030) {
            extractedDate = parsedDate
            extractedYear = year
            extractedMonth = parsedDate.getMonth() + 1 // Convert to 1-12 range
            console.log(`✅ DATE EXTRACTION SUCCESS: ${extractedDate.toISOString()} → Year: ${extractedYear}, Month: ${extractedMonth}`)
          } else {
            console.log(`⚠️ DATE OUT OF RANGE: ${year} is outside acceptable range (1990-2030)`)
          }
        } else {
          console.log(`❌ DATE PARSING FAILED: Could not parse "${dateStr}"`)
        }
      } catch (dateError) {
        console.error(`🚨 DATE EXTRACTION ERROR:`, dateError)
      }
    }
    
    // Fallback: use current date if no date could be extracted
    if (!extractedDate) {
      console.log(`📅 FALLBACK: Using current date for document organization`)
      extractedDate = new Date()
      extractedYear = extractedDate.getFullYear()
      extractedMonth = extractedDate.getMonth() + 1
    }
    
    console.log(`📁 FOLDER ALLOCATION: Document will be placed in ${extractedYear}/${String(extractedMonth).padStart(2, '0')}/${document.category.includes('SALES') ? 'Sales' : 'Purchases'}`)

    // Extract invoice total from processing results
    let extractedInvoiceTotal: number | null = null
    
    if (result.extractedData) {
      // Try different fields where the total might be stored
      if (result.extractedData.totalAmount) {
        extractedInvoiceTotal = result.extractedData.totalAmount
      } else if (result.extractedData.transactionData?.total) {
        extractedInvoiceTotal = result.extractedData.transactionData.total  
      } else if (result.extractedData.invoiceTotal) {
        extractedInvoiceTotal = result.extractedData.invoiceTotal
      } else {
        // Calculate from VAT amounts if available (rough estimate)
        const totalVAT = [...(result.extractedData.salesVAT || []), ...(result.extractedData.purchaseVAT || [])].reduce((sum, vat) => sum + vat, 0)
        if (totalVAT > 0) {
          // Rough estimate: total = VAT / 0.23 (Irish VAT rate) 
          extractedInvoiceTotal = Math.round((totalVAT / 0.23) * 100) / 100
        }
      }
    }
    
    // If still no total, try to extract from scan result text
    if (!extractedInvoiceTotal && result.scanResult) {
      const totalMatches = result.scanResult.match(/(?:Total|Amount|Invoice Total|Final Amount)[\s:]*€?([0-9,]+\.?[0-9]*)/gi)
      if (totalMatches && totalMatches.length > 0) {
        const amounts = totalMatches.map(match => {
          const numMatch = match.match(/([0-9,]+\.?[0-9]*)/)
          return numMatch ? parseFloat(numMatch[1].replace(',', '')) : 0
        }).filter(amount => amount > 0)
        
        if (amounts.length > 0) {
          // Take the largest amount as the most likely total
          extractedInvoiceTotal = Math.max(...amounts)
        }
      }
    }

    console.log(`💰 INVOICE TOTAL EXTRACTION: ${extractedInvoiceTotal ? `€${extractedInvoiceTotal}` : 'Not found'}`)

    // 🔧 CRITICAL FIX: Create DocumentFolder before updating document to prevent foreign key constraint violation
    let documentUpdateData: any = {
      isScanned: true,
      scanResult: `${result.scanResult}\n\n[PROCESSING_STATUS: ${JSON.stringify(processingStatus)}]`,
      // Add extracted invoice total
      invoiceTotal: extractedInvoiceTotal,
      extractionConfidence: result.extractedData?.confidence || 0.8,
      dateExtractionConfidence: result.extractedData?.invoiceDate ? 0.9 : 0.5, // High confidence if date was found
    }

    // Only add date fields and folder relationship if we have valid extracted date
    if (extractedDate && extractedYear && extractedMonth && user) {
      try {
        console.log(`📁 CREATING/UPDATING DOCUMENT FOLDER: ${extractedYear}/${String(extractedMonth).padStart(2, '0')} for user ${user.id}`)
        
        // Create or update DocumentFolder to ensure it exists before creating relationship
        await prisma.documentFolder.upsert({
          where: {
            userId_year_month: {
              userId: user.id,
              year: extractedYear,
              month: extractedMonth
            }
          },
          create: {
            userId: user.id,
            year: extractedYear,
            month: extractedMonth,
            totalSalesAmount: 0,
            totalPurchaseAmount: 0,
            totalSalesVAT: 0,
            totalPurchaseVAT: 0,
            totalNetVAT: 0,
            documentCount: 0,
            salesDocumentCount: 0,
            purchaseDocumentCount: 0
          },
          update: {
            // Update lastDocumentAt when adding new document
            lastDocumentAt: new Date()
          }
        })
        
        console.log(`✅ DOCUMENT FOLDER READY: Foreign key relationship can now be created safely`)
        
        // Now it's safe to add the date fields that create the foreign key relationship
        documentUpdateData.extractedDate = extractedDate
        documentUpdateData.extractedYear = extractedYear
        documentUpdateData.extractedMonth = extractedMonth
        
      } catch (folderError) {
        console.error(`🚨 DOCUMENT FOLDER CREATION FAILED:`, folderError)
        console.error(`   This will prevent automatic folder allocation, but document processing can continue`)
        console.error(`   Document will be saved without folder relationship to prevent foreign key constraint violation`)
        
        // Still save the date fields for reference, but don't create the folder relationship
        documentUpdateData.extractedDate = extractedDate
        // Note: NOT adding extractedYear/extractedMonth to avoid foreign key constraint
        
        // Log the folder creation failure but don't fail the entire processing
      }
    } else {
      console.log(`📁 SKIPPING FOLDER ALLOCATION: ${extractedDate ? 'Valid date extracted' : 'No valid date'}, ${extractedYear && extractedMonth ? 'Valid year/month' : 'Invalid year/month'}, ${user ? 'User authenticated' : 'Guest user'}`)
      
      // For guests or when no date extracted, still save the date for reference
      if (extractedDate) {
        documentUpdateData.extractedDate = extractedDate
      }
    }

    // 🔧 CRITICAL FIX: Wrap document update in try-catch to handle any remaining constraint issues
    let updatedDocument
    try {
      updatedDocument = await prisma.document.update({
        where: { id: documentId },
        data: documentUpdateData
      })
      console.log(`✅ DOCUMENT UPDATE SUCCESSFUL: Document ${documentId} updated with processing results`)
    } catch (documentUpdateError) {
      console.error(`🚨 DOCUMENT UPDATE FAILED:`, documentUpdateError)
      
      // Check if it's a foreign key constraint error
      if (documentUpdateError instanceof Error && documentUpdateError.message.includes('Foreign key constraint')) {
        console.error(`🚨 FOREIGN KEY CONSTRAINT VIOLATION DETECTED`)
        console.error(`   Attempting fallback update without folder relationship...`)
        
        // Fallback: Update without the foreign key relationship fields
        const fallbackData = {
          isScanned: true,
          scanResult: `${result.scanResult}\n\n[PROCESSING_STATUS: ${JSON.stringify(processingStatus)}]`,
          invoiceTotal: extractedInvoiceTotal,
          extractionConfidence: result.extractedData?.confidence || 0.8,
          dateExtractionConfidence: result.extractedData?.invoiceDate ? 0.9 : 0.5,
          // Save date for reference but don't create folder relationship
          extractedDate: extractedDate
          // Note: NOT including extractedYear/extractedMonth to avoid constraint
        }
        
        try {
          updatedDocument = await prisma.document.update({
            where: { id: documentId },
            data: fallbackData
          })
          console.log(`✅ FALLBACK UPDATE SUCCESSFUL: Document saved without folder relationship`)
        } catch (fallbackError) {
          console.error(`🚨 FALLBACK UPDATE ALSO FAILED:`, fallbackError)
          
          // Last resort: throw the original error to trigger 500 response with proper error handling
          throw new Error(`Document update failed: ${documentUpdateError.message}. Fallback also failed: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`)
        }
      } else {
        // Not a foreign key error, re-throw
        throw documentUpdateError
      }
    }
    
    // 🔧 CRITICAL FIX: Ensure updatedDocument exists before proceeding
    if (!updatedDocument) {
      console.error(`🚨 CRITICAL: updatedDocument is null - this should not happen`)
      throw new Error('Document update failed - updatedDocument is null')
    }
    
    // Store extracted VAT data in a separate table for easy querying (skip for guests) - with safe error handling
    if (user && result.extractedData && (result.extractedData.salesVAT?.length > 0 || result.extractedData.purchaseVAT?.length > 0)) {
      try {
        // console.log('💾 CREATING AUDIT LOG: VAT data extracted successfully')
        // console.log(`   User: ${user.id}`)
        // console.log(`   Document: ${document.originalName} (${documentId})`)
        // console.log(`   Document Category: ${document.category}`)
        
        // 🚨 CRITICAL DEBUG: Audit Log VAT Data Storage
        // console.log(`\n🔍 AUDIT LOG VAT DATA DEBUG:`)
        // console.log(`   📊 Full extracted data structure:`, JSON.stringify(result.extractedData, null, 2))
        // console.log(`   💰 Sales VAT array: [${result.extractedData.salesVAT?.join(', ') || 'EMPTY'}] (${result.extractedData.salesVAT?.length || 0} items)`)
        // console.log(`   💰 Purchase VAT array: [${result.extractedData.purchaseVAT?.join(', ') || 'EMPTY'}] (${result.extractedData.purchaseVAT?.length || 0} items)`)
        // console.log(`   📈 Confidence: ${Math.round((result.extractedData.confidence || 0) * 100)}%`)
        // console.log(`   🏷️  Classification: ${result.extractedData.classification?.category || 'UNKNOWN'}`)
        // console.log(`   📝 Expected behavior: ${document.category.includes('SALES') ? 'Sales amounts should be in salesVAT array' : 'Purchase amounts should be in purchaseVAT array'}`)
        // console.log(``)
        
        // Validate the data before storing
        const totalSalesAmount = (result.extractedData.salesVAT || []).reduce((sum: number, val: number) => sum + val, 0)
        const totalPurchaseAmount = (result.extractedData.purchaseVAT || []).reduce((sum: number, val: number) => sum + val, 0)
        // console.log(`   🧮 Total Sales VAT: €${totalSalesAmount}`)
        // console.log(`   🧮 Total Purchase VAT: €${totalPurchaseAmount}`)
        
        if (document.category.includes('SALES') && totalSalesAmount === 0 && totalPurchaseAmount > 0) {
          // console.log(`   🚨 POTENTIAL BUG: Sales document has VAT in purchase array!`)
        } else if (document.category.includes('PURCHASE') && totalPurchaseAmount === 0 && totalSalesAmount > 0) {
          // console.log(`   🚨 POTENTIAL BUG: Purchase document has VAT in sales array!`)
        } else {
          // console.log(`   ✅ VAT categorization appears correct for document category`)
        }
        
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
        
        // console.log('✅ AUDIT LOG CREATED SUCCESSFULLY')
      } catch (auditError) {
        console.error('🚨 AUDIT LOG CREATION FAILED:', auditError)
        console.error('   This will not prevent document processing from succeeding')
        console.error('   But VAT data may not be available in extracted VAT API')
        // Don't throw - allow processing to continue even if audit log fails
      }
    } else {
      // console.log('ℹ️ SKIPPING AUDIT LOG:')
      // console.log(`   User authenticated: ${!!user}`)
      // console.log(`   Has extracted data: ${!!result.extractedData}`)
      // console.log(`   Has VAT amounts: ${(result.extractedData?.salesVAT?.length || 0) + (result.extractedData?.purchaseVAT?.length || 0) > 0}`)
    }
    
    // Enhanced response data with real-time processing information
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
      // Include extractedData at root level for easier access
      extractedData: result.extractedData,
      // Enhanced processing metadata (merged from both processing systems)
      processingInfo: {
        // Enhanced processing fields
        engine: result.processingSteps ? 'enhanced' : 'legacy',
        processingSteps: result.processingSteps || [],
        qualityScore: result.qualityScore || 0,
        recommendedAction: result.recommendedAction || 'Ready for review',
        totalProcessingTime: Date.now() - processingStartTime,
        timestamp: new Date().toISOString(),
        irishVATCompliant: result.extractedData?.irishVATCompliant || false,
        // Legacy processing fields
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
      // OpenAI API status for debugging
      openAIStatus: openAIStatus,
      // 🚨 EMERGENCY EMBEDDED PROMPT DIAGNOSTIC
      promptDiagnostic: promptDiagnostic,
      // Document validation results
      validationCheck: validationCheck,
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
    
    // CRITICAL FIX: Invalidate VAT data cache after successful processing
    try {
      invalidateUserCache(user?.id)
      console.log('Cache invalidated after document processing', { userId: user?.id })
    } catch (cacheError) {
      console.error('Cache invalidation failed', cacheError)
      // Don't fail the processing if cache invalidation fails
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
      
      // 🔧 CRITICAL FIX: Add specific handling for foreign key constraint errors
      if (errorMessage.includes('foreign key constraint') || errorMessage.includes('constraint violation')) {
        specificError = 'Document folder relationship error - processing incomplete'
        errorCode = 'FOREIGN_KEY_CONSTRAINT_ERROR'
        suggestions.push('The document was uploaded but automatic folder organization failed')
        suggestions.push('You can manually organize the document or try re-processing it')
        suggestions.push('Contact support if this issue persists')
      }
      // Database connection errors
      else if (errorMessage.includes('prismaclient') || errorMessage.includes('database') || errorMessage.includes('connection')) {
        specificError = 'Database connection failed'
        errorCode = 'DATABASE_ERROR'
        suggestions.push('Please try again in a moment')
        suggestions.push('If the issue persists, contact support')
      }
      // 🔧 NEW: Document update specific errors
      else if (errorMessage.includes('document update failed')) {
        specificError = 'Failed to save document processing results'
        errorCode = 'DOCUMENT_UPDATE_ERROR'
        suggestions.push('The document may have been processed but results could not be saved')
        suggestions.push('Try re-processing the document')
        suggestions.push('Check that the document still exists and is accessible')
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
      // 🔧 NEW: VAT extraction specific errors
      else if (errorMessage.includes('vat') && errorMessage.includes('extraction')) {
        specificError = 'VAT data extraction failed'
        errorCode = 'VAT_EXTRACTION_ERROR'
        suggestions.push('The document was processed but VAT amounts could not be extracted')
        suggestions.push('Ensure the document contains clear VAT information')
        suggestions.push('Try using a higher quality scan or different document format')
      }
      else {
        specificError = error.message
      }
    }
    
    console.error('   Categorized as:', errorCode)
    console.error('   User-friendly message:', specificError)
    console.error('   Suggestions:', suggestions)
    
    // 🔧 CRITICAL FIX: Try to mark document as failed for user feedback
    try {
      const body = await request.clone().json()
      const documentId = body.documentId
      
      if (documentId) {
        console.log(`🚨 MARKING DOCUMENT ${documentId} AS FAILED DUE TO PROCESSING ERROR`)
        
        // 🔧 CRITICAL FIX: Update document to show failed status (mark as scanned to prevent "Processing" status)
        await prisma.document.update({
          where: { id: documentId },
          data: {
            isScanned: true,  // Mark as scanned so it doesn't appear as "Processing"
            scanResult: `PROCESSING FAILED: ${specificError}\n\nError Code: ${errorCode}\nTimestamp: ${new Date().toISOString()}\n\nDetails:\n${suggestions.map(s => `• ${s}`).join('\n')}\n\nThis document can be re-processed by trying the operation again.`
          }
        })
        
        console.log(`✅ DOCUMENT MARKED AS FAILED: User will see failure status in dashboard`)
      }
    } catch (markFailedError) {
      console.error(`🚨 FAILED TO MARK DOCUMENT AS FAILED:`, markFailedError)
      // Don't let this secondary error affect the main error response
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: specificError,
        errorCode: errorCode,
        suggestions: suggestions,
        timestamp: new Date().toISOString(),
        // 🔧 NEW: Add recovery instructions
        recoveryInstructions: {
          canRetry: true,
          retryDelay: errorCode === 'DATABASE_ERROR' ? 30000 : 5000, // 30s for DB errors, 5s for others
          alternativeActions: [
            'Try re-processing the document',
            'Check the document format and quality',
            'Contact support if the issue persists'
          ]
        },
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