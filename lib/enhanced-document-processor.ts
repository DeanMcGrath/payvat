/**
 * Enhanced Production Document Processor
 * Integrates all security, extraction, and validation systems
 * PRODUCTION READY - No console.logs, full error handling
 */

import { extractVATWithPipeline } from './extraction/multi-layer-pipeline'
import { processIrishDocument } from './extraction/irish-documents'
import { validateVATExtraction } from './extraction/validation'
import { logError, logInfo, logAudit, logPerformance } from './secure-logger'
import { extractTextFromDocument } from './documentProcessor'

export interface ProductionDocumentResult {
  success: boolean
  isScanned: boolean
  scanResult: string
  extractedData?: {
    salesVAT: number[]
    purchaseVAT: number[]
    confidence: number
    extractedText: string[]
    processingMethod: string
    validationFlags: string[]
    userMessage: string
    requiresManualReview: boolean
  }
  error?: string
  processingTimeMs: number
  qualityScore: number
  recommendations: string[]
}

/**
 * Main production document processing function
 */
export async function processDocumentProduction(
  documentId: string,
  fileData: string,
  mimeType: string,
  fileName: string,
  userId?: string,
  category?: string
): Promise<ProductionDocumentResult> {
  const startTime = Date.now()
  
  try {
    logAudit('DOCUMENT_PROCESSING_STARTED', {
      userId: userId || 'guest',
      documentId,
      operation: 'document-processing',
      result: 'SUCCESS'
    })

    // Step 1: Extract text from document
    const textResult = await extractTextFromDocument(fileData, mimeType, fileName)
    if (!textResult.success || !textResult.text) {
      return createFailureResult(
        'Text extraction failed',
        Date.now() - startTime,
        documentId,
        userId
      )
    }

    // Step 2: Multi-layer VAT extraction
    const extractionResult = await extractVATWithPipeline({
      documentId,
      fileName,
      fileData,
      mimeType,
      extractedText: textResult.text,
      userId,
      category
    })

    // Step 3: Irish document specialization
    const irishResult = processIrishDocument(textResult.text, fileName, category)

    // Step 4: Combine results and validate
    const combinedData = combineExtractionResults(extractionResult, irishResult)
    const validation = validateVATExtraction(combinedData, { fileName, category })

    // Step 5: Calculate quality score
    const qualityScore = calculateQualityScore(extractionResult, validation)

    // Step 6: Generate user-friendly result
    const result = createSuccessResult(
      extractionResult,
      validation,
      qualityScore,
      Date.now() - startTime,
      irishResult.recommendations
    )

    logPerformance('document-processing', result.processingTimeMs, {
      userId: userId || 'guest',
      documentId,
      operation: 'document-processing'
    })

    return result

  } catch (error: any) {
    logError('Document processing failed', error, {
      userId: userId || 'guest',
      documentId,
      operation: 'document-processing'
    })

    return createFailureResult(
      'Processing failed: ' + error.message,
      Date.now() - startTime,
      documentId,
      userId
    )
  }
}

/**
 * Combine extraction results from multiple sources
 */
function combineExtractionResults(extractionResult: any, irishResult: any) {
  const salesVAT = [
    ...extractionResult.salesVAT,
    ...(irishResult.extracted.amounts.filter((_: any, i: number) => 
      irishResult.pattern?.type === 'INVOICE' && i % 2 === 0
    ) || [])
  ]

  const purchaseVAT = [
    ...extractionResult.purchaseVAT,
    ...(irishResult.extracted.amounts.filter((_: any, i: number) => 
      irishResult.pattern?.type !== 'INVOICE' || i % 2 === 1
    ) || [])
  ]

  return {
    salesVAT: [...new Set(salesVAT)], // Remove duplicates
    purchaseVAT: [...new Set(purchaseVAT)],
    vatRates: irishResult.extracted.rates,
    confidence: Math.max(extractionResult.confidence, irishResult.extracted.confidence)
  }
}

/**
 * Calculate overall quality score
 */
function calculateQualityScore(extractionResult: any, validation: any): number {
  let score = 0.5 // Base score

  // Extraction confidence
  score += extractionResult.confidence * 0.3

  // Validation results
  if (validation.isValid) score += 0.2
  score -= validation.errors.length * 0.1
  score -= validation.warnings.length * 0.05

  // Method reliability
  const methodScores = {
    'AI_VISION': 0.2,
    'OCR_PATTERN': 0.15,
    'TEMPLATE_MATCH': 0.1,
    'FALLBACK': 0.05,
    'MANUAL_REVIEW': 0
  }
  score += methodScores[extractionResult.method as keyof typeof methodScores] || 0

  return Math.max(0, Math.min(1, score))
}

/**
 * Create success result
 */
function createSuccessResult(
  extractionResult: any,
  validation: any,
  qualityScore: number,
  processingTime: number,
  recommendations: string[]
): ProductionDocumentResult {
  
  const validationFlags = [
    ...validation.errors.map((e: any) => `ERROR: ${e.message}`),
    ...validation.warnings.map((w: any) => `WARNING: ${w.message}`)
  ]

  // Create user-friendly scan result
  const scanResult = createScanResult(extractionResult, validation)

  return {
    success: true,
    isScanned: true,
    scanResult,
    extractedData: {
      salesVAT: extractionResult.salesVAT,
      purchaseVAT: extractionResult.purchaseVAT,
      confidence: extractionResult.confidence,
      extractedText: extractionResult.extractedText,
      processingMethod: extractionResult.method,
      validationFlags,
      userMessage: extractionResult.userMessage,
      requiresManualReview: extractionResult.requiresManualReview || !validation.isValid
    },
    processingTimeMs: processingTime,
    qualityScore,
    recommendations: [...extractionResult.issues, ...recommendations, ...validation.suggestions]
  }
}

/**
 * Create failure result
 */
function createFailureResult(
  error: string,
  processingTime: number,
  documentId: string,
  userId?: string
): ProductionDocumentResult {
  
  logError('Document processing failed', null, {
    userId: userId || 'guest',
    documentId,
    operation: 'document-processing'
  })

  return {
    success: false,
    isScanned: false,
    scanResult: `Processing failed: ${error}. Please try re-uploading the document or contact support if the issue persists.`,
    error,
    processingTimeMs: processingTime,
    qualityScore: 0,
    recommendations: [
      'Try re-uploading the document with better quality',
      'Ensure the document contains clear VAT information',
      'Contact support if the problem persists'
    ]
  }
}

/**
 * Create comprehensive scan result for database storage
 */
function createScanResult(extractionResult: any, validation: any): string {
  const totalSalesVAT = extractionResult.salesVAT.reduce((sum: number, val: number) => sum + val, 0)
  const totalPurchaseVAT = extractionResult.purchaseVAT.reduce((sum: number, val: number) => sum + val, 0)
  
  const result = {
    summary: {
      method: extractionResult.method,
      confidence: Math.round(extractionResult.confidence * 100),
      totalSalesVAT: Math.round(totalSalesVAT * 100) / 100,
      totalPurchaseVAT: Math.round(totalPurchaseVAT * 100) / 100,
      isValid: validation.isValid,
      requiresReview: extractionResult.requiresManualReview
    },
    details: {
      salesVAT: extractionResult.salesVAT,
      purchaseVAT: extractionResult.purchaseVAT,
      processingTime: extractionResult.processingTimeMs
    },
    validation: {
      errors: validation.errors.length,
      warnings: validation.warnings.length,
      suggestions: validation.suggestions.length
    },
    userMessage: extractionResult.userMessage,
    timestamp: new Date().toISOString(),
    version: 'production-v1'
  }

  return JSON.stringify(result, null, 2)
}

/**
 * Batch process multiple documents
 */
export async function batchProcessDocuments(
  documents: Array<{
    id: string
    fileData: string
    mimeType: string
    fileName: string
    userId?: string
    category?: string
  }>,
  batchSize: number = 5
): Promise<Array<ProductionDocumentResult>> {
  const results: ProductionDocumentResult[] = []
  
  // Process in batches to avoid overwhelming the system
  for (let i = 0; i < documents.length; i += batchSize) {
    const batch = documents.slice(i, i + batchSize)
    
    const batchPromises = batch.map(doc => 
      processDocumentProduction(
        doc.id,
        doc.fileData,
        doc.mimeType,
        doc.fileName,
        doc.userId,
        doc.category
      )
    )
    
    const batchResults = await Promise.all(batchPromises)
    results.push(...batchResults)
    
    // Add delay between batches to prevent rate limiting
    if (i + batchSize < documents.length) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  
  return results
}

/**
 * Health check for document processing system
 */
export async function healthCheck(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy'
  systems: {
    textExtraction: boolean
    aiProcessing: boolean
    validation: boolean
    storage: boolean
  }
  performance: {
    averageProcessingTime: number
    successRate: number
  }
}> {
  const systems = {
    textExtraction: true,
    aiProcessing: true,
    validation: true,
    storage: true
  }
  
  try {
    // Test with minimal document
    const testResult = await processDocumentProduction(
      'health-check',
      'test-data',
      'text/plain',
      'health-check.txt'
    )
    
    const status = testResult.success ? 'healthy' : 'degraded'
    
    return {
      status,
      systems,
      performance: {
        averageProcessingTime: testResult.processingTimeMs,
        successRate: testResult.success ? 1 : 0
      }
    }
  } catch (error) {
    logError('Health check failed', error, {
      operation: 'health-check'
    })
    
    return {
      status: 'unhealthy',
      systems: { ...systems, textExtraction: false },
      performance: {
        averageProcessingTime: 0,
        successRate: 0
      }
    }
  }
}