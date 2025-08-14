/**
 * Fallback Processing Methods
 * Provides graceful degradation when primary processors fail
 */

import { GracefulDegradation, VATExtractionError } from './error-handling/vat-extraction-errors'

// Simple text extraction fallback
async function fallbackTextExtraction(
  fileData: string, 
  mimeType: string, 
  fileName: string
): Promise<{ success: boolean; text?: string; error?: string }> {
  console.log('🔄 Executing fallback text extraction...')
  
  try {
    // For any file, try basic base64 decode as text
    if (fileData) {
      const decoded = Buffer.from(fileData, 'base64').toString('utf-8')
      
      // Basic sanity check - if it contains readable text
      const readableChars = (decoded.match(/[a-zA-Z0-9\s€$£¥]/g) || []).length
      const totalChars = decoded.length
      const readabilityRatio = totalChars > 0 ? readableChars / totalChars : 0
      
      if (readabilityRatio > 0.3) {
        console.log(`✅ Fallback extraction successful (${Math.round(readabilityRatio * 100)}% readable)`)
        return {
          success: true,
          text: `FALLBACK_EXTRACTED: ${decoded.substring(0, 10000)}` // Limit to prevent memory issues
        }
      }
    }
    
    // If basic decode fails, return minimal extraction
    console.log('⚠️ Fallback extraction with minimal data')
    return {
      success: true,
      text: `FALLBACK_MINIMAL: Document processed with limited extraction capabilities. File: ${fileName}, Type: ${mimeType}`
    }
    
  } catch (error) {
    console.error('❌ Fallback text extraction failed:', error)
    return {
      success: false,
      error: 'All text extraction methods failed'
    }
  }
}

// Simple VAT extraction fallback
function fallbackVATExtraction(text: string, category: string, fileName: string) {
  console.log('🔄 Executing fallback VAT extraction...')
  
  try {
    // Use only the most basic VAT patterns
    const basicPatterns = [
      /VAT.*?(\d+\.?\d*)/gi,
      /Tax.*?(\d+\.?\d*)/gi,
      /€(\d+\.?\d*)/gi,
      /(\d+\.?\d+).*VAT/gi
    ]
    
    const foundAmounts: number[] = []
    const extractedText = [text.substring(0, 500)] // Limited text for fallback
    
    for (const pattern of basicPatterns) {
      let match
      while ((match = pattern.exec(text.toLowerCase())) !== null) {
        const amount = parseFloat(match[1])
        if (amount && amount > 0 && amount < 100000) {
          foundAmounts.push(amount)
        }
      }
    }
    
    // Remove duplicates and take reasonable amounts
    const uniqueAmounts = [...new Set(foundAmounts)]
      .sort((a, b) => b - a)
      .slice(0, 5) // Maximum 5 amounts
    
    console.log(`✅ Fallback VAT extraction found ${uniqueAmounts.length} amounts: €${uniqueAmounts.join(', €')}`)
    
    return {
      salesVAT: category.includes('SALES') ? uniqueAmounts : [],
      purchaseVAT: category.includes('PURCHASES') ? uniqueAmounts : [],
      totalAmount: uniqueAmounts[0] || undefined,
      vatRate: undefined,
      confidence: 0.3, // Low confidence for fallback
      extractedText,
      documentType: 'OTHER' as const,
      processingMethod: 'FALLBACK' as const,
      processingTimeMs: 0,
      validationFlags: ['FALLBACK_PROCESSING_USED', 'LOW_CONFIDENCE'],
      irishVATCompliant: false,
      errorRecovery: {
        hadErrors: true,
        recoveryMethod: 'BASIC_PATTERN_MATCHING',
        fallbacksUsed: ['SIMPLE_VAT_PATTERNS']
      }
    }
    
  } catch (error) {
    console.error('❌ Fallback VAT extraction failed:', error)
    
    // Return minimal empty result
    return {
      salesVAT: [],
      purchaseVAT: [],
      confidence: 0.1,
      extractedText: ['Fallback processing failed - manual review required'],
      documentType: 'OTHER' as const,
      processingMethod: 'FALLBACK' as const,
      processingTimeMs: 0,
      validationFlags: ['FALLBACK_FAILED', 'MANUAL_REVIEW_REQUIRED'],
      irishVATCompliant: false,
      errorRecovery: {
        hadErrors: true,
        recoveryMethod: 'MINIMAL_RESPONSE',
        fallbacksUsed: ['EMPTY_RESULT']
      }
    }
  }
}

// AI service fallback
async function fallbackAIProcessing(...args: any[]) {
  console.log('🔄 AI service unavailable, using pattern-based processing...')
  
  // Return indication that AI is unavailable
  return {
    success: false,
    isScanned: true,
    scanResult: 'AI service unavailable, fallback processing used',
    extractedData: fallbackVATExtraction(
      args[0] || '', 
      args[1] || 'UNKNOWN', 
      args[2] || 'fallback.pdf'
    ),
    processingSteps: [{
      step: 'AI Fallback',
      success: true,
      duration: 0,
      details: 'AI service unavailable, used pattern matching',
      fallbackUsed: true
    }],
    qualityScore: 30 // Low quality score for fallback
  }
}

// OCR service fallback
async function fallbackOCRProcessing(fileData: string, fileName: string) {
  console.log('🔄 OCR service unavailable, attempting basic processing...')
  
  try {
    // Try basic text decode
    const decoded = Buffer.from(fileData, 'base64').toString('utf-8')
    
    return {
      success: true,
      text: `OCR_FALLBACK: ${decoded.substring(0, 1000)}` // Limited extraction
    }
  } catch (error) {
    return {
      success: false,
      text: 'OCR fallback failed',
      error: 'OCR service unavailable and fallback processing failed'
    }
  }
}

// Excel parser fallback
async function fallbackExcelProcessing(fileData: string, fileName: string) {
  console.log('🔄 Excel parser unavailable, attempting basic processing...')
  
  return {
    success: true,
    text: `EXCEL_FALLBACK: Excel parsing unavailable for ${fileName}. Basic processing attempted.`
  }
}

// Health check functions
async function checkAIHealth(): Promise<boolean> {
  try {
    // In a real system, this would ping the AI service
    return Math.random() > 0.1 // 90% uptime simulation
  } catch {
    return false
  }
}

async function checkOCRHealth(): Promise<boolean> {
  try {
    return Math.random() > 0.05 // 95% uptime simulation
  } catch {
    return false
  }
}

async function checkExcelParserHealth(): Promise<boolean> {
  try {
    return Math.random() > 0.02 // 98% uptime simulation
  } catch {
    return false
  }
}

// Register all fallback methods and health checks
export function initializeFallbackProcessors() {
  console.log('🔄 Initializing fallback processors...')
  
  // Register fallback methods
  GracefulDegradation.registerFallback('text_extraction', fallbackTextExtraction)
  GracefulDegradation.registerFallback('vat_extraction', fallbackVATExtraction)
  GracefulDegradation.registerFallback('ai_processing', fallbackAIProcessing)
  GracefulDegradation.registerFallback('ocr_processing', fallbackOCRProcessing)
  GracefulDegradation.registerFallback('excel_processing', fallbackExcelProcessing)
  
  console.log('✅ Fallback processors initialized')
}