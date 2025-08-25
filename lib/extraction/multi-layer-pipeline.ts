/**
 * Multi-Layer VAT Extraction Pipeline
 * CRITICAL: Ensures VAT is ALWAYS extracted or users get clear explanation
 * NO "0 VAT" results without justification
 */

import { logError, logWarn, logInfo, logPerformance } from '@/lib/secure-logger'
import { processDocumentWithAI } from '@/lib/ai/documentAnalysis'
import { isAIEnabled } from '@/lib/ai/openai'
import { AIErrorTracker, AIErrorType } from '@/lib/ai/error-tracking'

export interface ExtractionResult {
  success: boolean
  confidence: number
  method: 'AI_VISION' | 'OCR_PATTERN' | 'TEMPLATE_MATCH' | 'MANUAL_REVIEW' | 'FALLBACK'
  salesVAT: number[]
  purchaseVAT: number[]
  totalAmount?: number
  vatRate?: number
  extractedText: string[]
  issues: string[]
  requiresManualReview: boolean
  userMessage: string
  processingTimeMs: number
  debugInfo?: any
}

export interface ProcessingContext {
  documentId: string
  fileName: string
  fileData: string
  mimeType: string
  extractedText: string
  userId?: string
  category?: string
}

/**
 * Main pipeline that tries multiple extraction strategies
 * GUARANTEE: Always returns actionable result for user
 */
export async function extractVATWithPipeline(context: ProcessingContext): Promise<ExtractionResult> {
  const startTime = Date.now()
  
  logInfo('Starting multi-layer VAT extraction', {
    documentId: context.documentId,
    operation: 'vat-extraction-pipeline'
  })

  // Strategy 1: AI Vision (Primary)
  const aiResult = await tryAIVisionExtraction(context)
  if (aiResult.success && aiResult.confidence > 0.7) {
    aiResult.processingTimeMs = Date.now() - startTime
    logPerformance('vat-extraction-ai', aiResult.processingTimeMs, {
      documentId: context.documentId,
      operation: 'ai-extraction'
    })
    return aiResult
  }

  // Strategy 2: Pattern Matching (Fallback)
  const patternResult = await tryPatternExtraction(context)
  if (patternResult.success && patternResult.confidence > 0.6) {
    patternResult.processingTimeMs = Date.now() - startTime
    return patternResult
  }

  // Strategy 3: Template Matching
  const templateResult = await tryTemplateMatching(context)
  if (templateResult.success && templateResult.confidence > 0.5) {
    templateResult.processingTimeMs = Date.now() - startTime
    return templateResult
  }

  // Strategy 4: Deep Text Analysis
  const textResult = await tryDeepTextAnalysis(context)
  if (textResult.success && textResult.confidence > 0.4) {
    textResult.processingTimeMs = Date.now() - startTime
    return textResult
  }

  // Strategy 5: Manual Review Queue (Last Resort)
  const manualResult = await flagForManualReview(context, [aiResult, patternResult, templateResult, textResult])
  manualResult.processingTimeMs = Date.now() - startTime
  
  return manualResult
}

/**
 * Strategy 1: AI Vision Extraction
 */
async function tryAIVisionExtraction(context: ProcessingContext): Promise<ExtractionResult> {
  const startTime = Date.now()
  
  try {
    if (!isAIEnabled()) {
      await AIErrorTracker.logError({
        documentId: context.documentId,
        userId: context.userId,
        errorType: 'API_ERROR',
        errorCode: 'AI_SERVICE_DISABLED',
        message: 'AI service is not enabled or available',
        context: {
          fileName: context.fileName,
          processingMethod: 'AI_VISION'
        },
        processingMethod: 'AI_VISION'
      })
      return createFailureResult('AI_VISION', 'AI service not available', context)
    }

    const aiResult = await processDocumentWithAI(
      context.documentId,
      context.fileData,
      context.mimeType,
      context.fileName,
      context.extractedText
    )

    if (aiResult.success && aiResult.extractedData) {
      const { salesVAT = [], purchaseVAT = [], confidence = 0 } = aiResult.extractedData
      const processingTime = Date.now() - startTime

      // Log low confidence as a warning
      if (confidence < 0.5) {
        await AIErrorTracker.logError({
          documentId: context.documentId,
          userId: context.userId,
          errorType: 'CONFIDENCE_ERROR',
          errorCode: 'LOW_CONFIDENCE_EXTRACTION',
          message: `AI extraction confidence is low: ${Math.round(confidence * 100)}%`,
          context: {
            fileName: context.fileName,
            confidence,
            salesVAT,
            purchaseVAT,
            processingTime
          },
          processingMethod: 'AI_VISION',
          confidence
        })
      }

      return {
        success: true,
        confidence,
        method: 'AI_VISION',
        salesVAT,
        purchaseVAT,
        extractedText: [Array.isArray(aiResult.extractedData.extractedText) 
          ? aiResult.extractedData.extractedText.join(' ') 
          : aiResult.extractedData.extractedText || ''],
        issues: confidence < 0.5 ? ['Low confidence extraction'] : [],
        requiresManualReview: confidence < 0.8,
        userMessage: confidence > 0.8 
          ? `AI successfully extracted VAT amounts with ${Math.round(confidence * 100)}% confidence`
          : `AI extracted VAT amounts but confidence is ${Math.round(confidence * 100)}%. Please verify the amounts.`,
        processingTimeMs: processingTime
      }
    }

    // AI processing failed
    await AIErrorTracker.logError({
      documentId: context.documentId,
      userId: context.userId,
      errorType: 'EXTRACTION_ERROR',
      errorCode: 'AI_EXTRACTION_FAILED',
      message: 'AI processing completed but failed to extract VAT data',
      context: {
        fileName: context.fileName,
        aiResultSuccess: aiResult.success,
        hasExtractedData: !!aiResult.extractedData,
        processingTime: Date.now() - startTime
      },
      processingMethod: 'AI_VISION'
    })

    return createFailureResult('AI_VISION', 'AI processing failed to extract VAT data', context)
  } catch (error) {
    const processingTime = Date.now() - startTime
    
    // Determine error type based on error message
    let errorType: AIErrorType = 'SYSTEM_ERROR'
    let errorCode = 'AI_VISION_EXCEPTION'
    
    if (error.message?.includes('timeout')) {
      errorType = 'TIMEOUT_ERROR'
      errorCode = 'AI_PROCESSING_TIMEOUT'
    } else if (error.message?.includes('rate limit')) {
      errorType = 'RATE_LIMIT_ERROR'
      errorCode = 'API_RATE_LIMIT_EXCEEDED'
    } else if (error.message?.includes('API')) {
      errorType = 'API_ERROR'
      errorCode = 'API_REQUEST_FAILED'
    }

    await AIErrorTracker.logError({
      documentId: context.documentId,
      userId: context.userId,
      errorType,
      errorCode,
      message: error.message || 'Unknown error during AI vision extraction',
      stack: error.stack,
      context: {
        fileName: context.fileName,
        processingTime,
        mimeType: context.mimeType
      },
      processingMethod: 'AI_VISION'
    })

    logError('AI vision extraction failed', error, {
      documentId: context.documentId,
      operation: 'ai-vision-extraction'
    })
    
    return createFailureResult('AI_VISION', 'AI extraction encountered an error', context)
  }
}

/**
 * Strategy 2: Pattern Matching Extraction
 */
async function tryPatternExtraction(context: ProcessingContext): Promise<ExtractionResult> {
  try {
    const text = context.extractedText.toLowerCase()
    const patterns = getIrishVATPatterns()
    
    let foundVAT: number[] = []
    let foundAmounts: number[] = []
    let confidence = 0.3 // Base confidence for pattern matching

    // Try multiple VAT detection patterns
    for (const pattern of patterns) {
      const matches = text.match(pattern.regex)
      if (matches) {
        for (const match of matches) {
          const amount = extractAmountFromMatch(match)
          if (amount > 0 && amount < 100000) { // Reasonable VAT range
            foundVAT.push(amount)
            confidence += 0.1
          }
        }
      }
    }

    // Try to find total amounts
    const amountPatterns = [
      /total.*?€?([0-9,]+\.?[0-9]*)/gi,
      /amount.*?€?([0-9,]+\.?[0-9]*)/gi,
      /€([0-9,]+\.?[0-9]*)/g
    ]

    for (const pattern of amountPatterns) {
      const matches = [...text.matchAll(pattern)]
      for (const match of matches) {
        const amount = parseFloat(match[1].replace(',', ''))
        if (amount > 0 && amount < 1000000) {
          foundAmounts.push(amount)
        }
      }
    }

    if (foundVAT.length > 0) {
      // Determine if sales or purchases based on document category
      const isSales = context.category?.includes('SALES') || 
                     text.includes('invoice') || 
                     text.includes('receipt')

      return {
        success: true,
        confidence: Math.min(confidence, 0.8),
        method: 'OCR_PATTERN',
        salesVAT: isSales ? foundVAT : [],
        purchaseVAT: isSales ? [] : foundVAT,
        extractedText: [context.extractedText],
        issues: ['Pattern matching used - please verify amounts'],
        requiresManualReview: true,
        userMessage: `Found ${foundVAT.length} VAT amount(s) using pattern matching. Please verify these amounts are correct.`,
        processingTimeMs: 0
      }
    }

    return createFailureResult('OCR_PATTERN', 'No VAT patterns found in document text', context)
  } catch (error) {
    logError('Pattern extraction failed', error, {
      documentId: context.documentId,
      operation: 'pattern-extraction'
    })
    return createFailureResult('OCR_PATTERN', 'Pattern matching encountered an error', context)
  }
}

/**
 * Strategy 3: Template Matching
 */
async function tryTemplateMatching(context: ProcessingContext): Promise<ExtractionResult> {
  try {
    // Check for known Irish document formats
    const templates = getIrishDocumentTemplates()
    
    for (const template of templates) {
      if (template.matches(context)) {
        const extracted = template.extract(context)
        if (extracted.vatAmounts.length > 0) {
          return {
            success: true,
            confidence: template.confidence,
            method: 'TEMPLATE_MATCH',
            salesVAT: ['INVOICE', 'RECEIPT'].includes(template.type) ? extracted.vatAmounts : [],
            purchaseVAT: ['REVENUE_FORM', 'BANK_STATEMENT', 'ECOMMERCE'].includes(template.type) ? extracted.vatAmounts : [],
            extractedText: [context.extractedText],
            issues: (template as any).issues || [],
            requiresManualReview: template.confidence < 0.7,
            userMessage: `Document matched ${template.name} template. VAT amounts extracted.`,
            processingTimeMs: 0
          }
        }
      }
    }

    return createFailureResult('TEMPLATE_MATCH', 'Document does not match any known templates', context)
  } catch (error) {
    logError('Template matching failed', error, {
      documentId: context.documentId,
      operation: 'template-matching'
    })
    return createFailureResult('TEMPLATE_MATCH', 'Template matching encountered an error', context)
  }
}

/**
 * Strategy 4: Deep Text Analysis
 */
async function tryDeepTextAnalysis(context: ProcessingContext): Promise<ExtractionResult> {
  try {
    const text = context.extractedText
    
    // Look for any mention of VAT/tax concepts
    const vatKeywords = ['vat', 'tax', 'levy', 'duty', 'cáin', 'cois']
    const hasVATMention = vatKeywords.some(keyword => 
      text.toLowerCase().includes(keyword)
    )

    if (!hasVATMention) {
      return createFailureResult('FALLBACK', 'Document does not appear to contain VAT information', context)
    }

    // Try to find any numbers that could be VAT
    const numbers = extractAllNumbers(text)
    const potentialVAT = numbers.filter(num => 
      num > 0.01 && num < 10000 // Reasonable VAT range
    )

    if (potentialVAT.length > 0) {
      return {
        success: true,
        confidence: 0.3,
        method: 'FALLBACK',
        salesVAT: [],
        purchaseVAT: potentialVAT,
        extractedText: [text],
        issues: ['VAT amounts identified but method unclear', 'Manual verification required'],
        requiresManualReview: true,
        userMessage: `Document contains VAT-related information but automatic extraction was uncertain. Found ${potentialVAT.length} potential VAT amount(s). Please review and verify.`,
        processingTimeMs: 0
      }
    }

    return createFailureResult('FALLBACK', 'Could not identify VAT amounts in document', context)
  } catch (error) {
    logError('Deep text analysis failed', error, {
      documentId: context.documentId,
      operation: 'deep-text-analysis'
    })
    return createFailureResult('FALLBACK', 'Text analysis encountered an error', context)
  }
}

/**
 * Strategy 5: Manual Review Queue
 */
async function flagForManualReview(
  context: ProcessingContext, 
  previousAttempts: ExtractionResult[]
): Promise<ExtractionResult> {
  
  logWarn('Document flagged for manual review', {
    documentId: context.documentId,
    operation: 'manual-review-flag'
  })

  // Combine all issues from previous attempts
  const allIssues = previousAttempts.flatMap(result => result.issues)
  
  return {
    success: false,
    confidence: 0,
    method: 'MANUAL_REVIEW',
    salesVAT: [],
    purchaseVAT: [],
    extractedText: [context.extractedText],
    issues: [
      'Automatic VAT extraction failed',
      'Document requires manual review',
      ...allIssues
    ],
    requiresManualReview: true,
    userMessage: `Unable to automatically extract VAT from this document. Our team will review it manually within 24 hours. You can also check if the document contains clear VAT amounts and contact support.`,
    processingTimeMs: 0
  }
}

/**
 * Helper Functions
 */
function createFailureResult(method: ExtractionResult['method'], reason: string, context: ProcessingContext): ExtractionResult {
  return {
    success: false,
    confidence: 0,
    method,
    salesVAT: [],
    purchaseVAT: [],
    extractedText: [context.extractedText],
    issues: [reason],
    requiresManualReview: true,
    userMessage: `${method} extraction failed: ${reason}`,
    processingTimeMs: 0
  }
}

function getIrishVATPatterns() {
  return [
    {
      name: 'Irish VAT with rate',
      regex: /vat.*?(?:23%|13\.5%|9%|4\.8%).*?€?([0-9,]+\.?[0-9]*)/gi
    },
    {
      name: 'VAT amount explicit',
      regex: /vat.*?amount.*?€?([0-9,]+\.?[0-9]*)/gi
    },
    {
      name: 'VAT total',
      regex: /(?:total.*?)?vat.*?€?([0-9,]+\.?[0-9]*)/gi
    },
    {
      name: 'Irish cáin (tax)',
      regex: /cáin.*?€?([0-9,]+\.?[0-9]*)/gi
    }
  ]
}

function getIrishDocumentTemplates() {
  // Simplified template system - can be expanded
  return [
    {
      name: 'Standard Irish Invoice',
      matches: (context: ProcessingContext) => {
        const text = context.extractedText.toLowerCase()
        return text.includes('invoice') && text.includes('vat')
      },
      extract: (context: ProcessingContext) => {
        const amounts = extractAllNumbers(context.extractedText)
        return { vatAmounts: amounts.filter(a => a > 0 && a < 10000) }
      },
      confidence: 0.6,
      type: 'SALES' as const
    }
  ]
}

function extractAmountFromMatch(match: string): number {
  const cleaned = match.replace(/[^0-9.,]/g, '').replace(',', '')
  return parseFloat(cleaned) || 0
}

function extractAllNumbers(text: string): number[] {
  const numberRegex = /([0-9,]+\.?[0-9]*)/g
  const matches = text.match(numberRegex) || []
  return matches.map(match => parseFloat(match.replace(',', ''))).filter(n => !isNaN(n))
}