/**
 * Document Processing Service
 * Handles OCR text extraction and VAT amount detection from uploaded documents
 * Enhanced with OpenAI Vision API for improved accuracy
 */

import { processDocumentWithAI, type AIDocumentProcessingResult } from './ai/documentAnalysis'
import { isAIEnabled } from './ai/openai'

export interface ExtractedVATData {
  salesVAT: number[]
  purchaseVAT: number[]
  totalAmount?: number
  vatRate?: number
  confidence: number
  extractedText: string[]
  documentType: 'SALES_INVOICE' | 'PURCHASE_INVOICE' | 'SALES_RECEIPT' | 'PURCHASE_RECEIPT' | 'OTHER'
}

export interface DocumentProcessingResult {
  success: boolean
  isScanned: boolean
  scanResult: string
  extractedData?: ExtractedVATData
  error?: string
}

/**
 * Extract text content from base64 encoded files
 * This is a simplified OCR service for the demo - in production you'd use:
 * - Google Cloud Vision API
 * - Amazon Textract
 * - Azure Computer Vision
 * - Tesseract.js for client-side OCR
 */
export async function extractTextFromDocument(
  fileData: string,
  mimeType: string,
  fileName: string
): Promise<{ success: boolean; text?: string; error?: string }> {
  try {
    // For PDFs, we'll use a simple text extraction approach
    if (mimeType === 'application/pdf') {
      return await extractTextFromPDF(fileData)
    }
    
    // For images, we'll simulate OCR (in production, use actual OCR service)
    if (mimeType.startsWith('image/')) {
      return await simulateImageOCR(fileName)
    }
    
    // For CSV/Excel files, parse structured data
    if (mimeType.includes('csv') || mimeType.includes('spreadsheet')) {
      return await extractTextFromCSV(fileData)
    }
    
    return {
      success: false,
      error: 'Unsupported file type for text extraction'
    }
  } catch (error) {
    console.error('Text extraction error:', error)
    return {
      success: false,
      error: 'Failed to extract text from document'
    }
  }
}

/**
 * PDF text extraction using proper parsing
 * For production use, integrates with pdf-parse or similar libraries
 */
async function extractTextFromPDF(base64Data: string): Promise<{ success: boolean; text?: string; error?: string }> {
  try {
    // Convert base64 to buffer
    const pdfBuffer = Buffer.from(base64Data, 'base64')
    
    // Try to extract text using basic PDF parsing
    // This is a simplified approach - in production you'd use pdf-parse
    const text = await extractPDFTextContent(pdfBuffer)
    
    if (text && text.trim().length > 0) {
      return {
        success: true,
        text: text
      }
    } else {
      // If no text extracted, return error to trigger AI processing
      return {
        success: false,
        error: 'No text content found in PDF - may be image-based PDF'
      }
    }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to extract text from PDF: ' + (error instanceof Error ? error.message : 'Unknown error')
    }
  }
}

/**
 * Extract text content from PDF buffer
 * This is a simplified implementation - in production use pdf-parse
 */
async function extractPDFTextContent(buffer: Buffer): Promise<string> {
  try {
    // This is a basic implementation
    // In production, you would use: const pdf = await pdfParse(buffer)
    
    // For now, we'll attempt to read the PDF as text
    const pdfText = buffer.toString('utf8')
    
    // Look for text patterns that indicate this might be a text-based PDF
    if (pdfText.includes('/Type /Page') || pdfText.includes('stream')) {
      // This appears to be a valid PDF structure
      // Extract any readable text content
      const textMatches = pdfText.match(/BT[^E]*ET/g) || []
      const extractedTexts = textMatches.map(match => {
        // Simple text extraction from PDF streams
        return match.replace(/[^a-zA-Z0-9\s€.,:%()-]/g, ' ').replace(/\s+/g, ' ').trim()
      }).filter(text => text.length > 5)
      
      return extractedTexts.join('\n')
    }
    
    // If no text found, throw error to trigger AI processing
    throw new Error('PDF appears to be image-based or encrypted')
    
  } catch (error) {
    // If PDF text extraction fails, let AI handle it
    throw new Error('PDF requires AI processing for text extraction')
  }
}

/**
 * Process images using OCR - prioritizes AI processing over legacy OCR
 * In production, use actual OCR services like Google Vision API or Tesseract
 */
async function simulateImageOCR(fileName: string): Promise<{ success: boolean; text?: string; error?: string }> {
  try {
    // For image files, we should prioritize AI processing since it's more accurate
    // This function should only be called when AI is not available
    console.log(`Legacy OCR processing for image: ${fileName}`)
    
    // Return error to force AI processing if available
    return {
      success: false,
      error: 'Image OCR requires AI processing for accurate text extraction'
    }
    
    // The following code would be used if you had a real OCR service:
    /*
    // Example integration with Tesseract.js or Google Vision API
    const ocrResult = await performRealOCR(imageBuffer)
    return {
      success: true,
      text: ocrResult.text
    }
    */
    
  } catch (error) {
    return {
      success: false,
      error: 'Failed to perform OCR on image: ' + (error instanceof Error ? error.message : 'Unknown error')
    }
  }
}

/**
 * Placeholder for real OCR integration
 * In production, implement actual OCR service
 */
// async function performRealOCR(imageBuffer: Buffer): Promise<{ text: string; confidence: number }> {
//   // Example: Google Vision API
//   // const [result] = await client.textDetection(imageBuffer)
//   // return { text: result.fullTextAnnotation?.text || '', confidence: 0.9 }
//   
//   // Example: Tesseract.js
//   // const { data: { text, confidence } } = await Tesseract.recognize(imageBuffer, 'eng')
//   // return { text, confidence: confidence / 100 }
// }

/**
 * Extract text from CSV files
 */
async function extractTextFromCSV(base64Data: string): Promise<{ success: boolean; text?: string; error?: string }> {
  try {
    const csvContent = Buffer.from(base64Data, 'base64').toString('utf-8')
    return {
      success: true,
      text: csvContent
    }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to extract text from CSV'
    }
  }
}

/**
 * Extract VAT amounts and related data from text content
 */
export function extractVATDataFromText(
  text: string, 
  category: string,
  fileName: string
): ExtractedVATData {
  const salesVAT: number[] = []
  const purchaseVAT: number[] = []
  let totalAmount: number | undefined
  let vatRate: number | undefined
  let confidence = 0
  const extractedText: string[] = []
  
  // Normalize text for processing
  const normalizedText = text.toLowerCase().replace(/\s+/g, ' ').trim()
  extractedText.push(text)
  
  // Enhanced VAT amount patterns - match various formats commonly used on invoices
  const vatPatterns = [
    // Standard VAT patterns
    /(?:total\s+)?vat[:\s]*€?([0-9,]+\.?[0-9]*)/gi,
    /vat\s*amount[:\s]*€?([0-9,]+\.?[0-9]*)/gi,
    /(?:total\s+)?tax[:\s]*€?([0-9,]+\.?[0-9]*)/gi,
    
    // VAT with rates
    /vat\s*@?\s*23%[:\s]*€?([0-9,]+\.?[0-9]*)/gi,
    /vat\s*@?\s*13\.5%[:\s]*€?([0-9,]+\.?[0-9]*)/gi,
    /vat\s*@?\s*9%[:\s]*€?([0-9,]+\.?[0-9]*)/gi,
    
    // Currency first patterns
    /€([0-9,]+\.?[0-9]*)\s*vat/gi,
    /€([0-9,]+\.?[0-9]*)\s*tax/gi,
    
    // Line item patterns
    /vat\s*\([0-9.]+%\)[:\s]*€?([0-9,]+\.?[0-9]*)/gi,
    
    // Irish specific patterns
    /cáin\s*bhreisluacha[:\s]*€?([0-9,]+\.?[0-9]*)/gi, // Irish for VAT
  ]
  
  // Total amount patterns
  const totalPatterns = [
    /total[:\s]*€?([0-9,]+\.?[0-9]*)/gi,
    /amount\s*due[:\s]*€?([0-9,]+\.?[0-9]*)/gi,
    /grand\s*total[:\s]*€?([0-9,]+\.?[0-9]*)/gi,
  ]
  
  // Extract VAT amounts
  for (const pattern of vatPatterns) {
    let match
    while ((match = pattern.exec(normalizedText)) !== null) {
      const amount = parseFloat(match[1].replace(/,/g, ''))
      if (!isNaN(amount) && amount > 0) {
        if (category.includes('SALES')) {
          salesVAT.push(amount)
        } else if (category.includes('PURCHASE')) {
          purchaseVAT.push(amount)
        }
        confidence += 0.3
      }
    }
  }
  
  // Extract total amounts
  for (const pattern of totalPatterns) {
    let match
    while ((match = pattern.exec(normalizedText)) !== null) {
      const amount = parseFloat(match[1].replace(/,/g, ''))
      if (!isNaN(amount) && amount > 0) {
        totalAmount = amount
        confidence += 0.2
      }
    }
  }
  
  // Extract VAT rate
  const rateMatch = normalizedText.match(/vat\s*@?\s*([0-9]+)%/i)
  if (rateMatch) {
    vatRate = parseInt(rateMatch[1])
    confidence += 0.1
  }
  
  // If no explicit VAT amounts found, try to calculate from total and rate
  if (salesVAT.length === 0 && purchaseVAT.length === 0 && totalAmount && vatRate) {
    const calculatedVAT = (totalAmount * vatRate) / (100 + vatRate)
    if (category.includes('SALES')) {
      salesVAT.push(Math.round(calculatedVAT * 100) / 100)
    } else if (category.includes('PURCHASE')) {
      purchaseVAT.push(Math.round(calculatedVAT * 100) / 100)
    }
    confidence += 0.2
  }
  
  // Determine document type from category and content
  let documentType: ExtractedVATData['documentType'] = 'OTHER'
  if (category.includes('SALES')) {
    documentType = normalizedText.includes('invoice') ? 'SALES_INVOICE' : 'SALES_RECEIPT'
  } else if (category.includes('PURCHASE')) {
    documentType = normalizedText.includes('invoice') ? 'PURCHASE_INVOICE' : 'PURCHASE_RECEIPT'
  }
  
  // Cap confidence at 1.0
  confidence = Math.min(confidence, 1.0)
  
  return {
    salesVAT,
    purchaseVAT,
    totalAmount,
    vatRate,
    confidence,
    extractedText,
    documentType
  }
}

/**
 * Process a document: extract text and VAT data
 * Uses AI when available, falls back to legacy processing with better error handling
 */
export async function processDocument(
  fileData: string,
  mimeType: string,
  fileName: string,
  category: string,
  userId?: string
): Promise<DocumentProcessingResult> {
  const processingStartTime = Date.now()
  
  try {
    console.log(`Processing document: ${fileName} (${category}, ${mimeType}) - AI enabled: ${isAIEnabled()}`)
    
    // Try AI processing first if available
    if (isAIEnabled()) {
      console.log('Attempting AI document processing...')
      const aiResult = await processDocumentWithAI(fileData, mimeType, fileName, category, userId)
      
      if (aiResult.success && aiResult.extractedData) {
        // Validate AI results
        const validation = validateExtractedVAT(aiResult.extractedData)
        console.log(`AI processing successful: ${aiResult.scanResult}`, {
          processingTime: aiResult.processingTime,
          validation: validation.isValid ? 'PASS' : 'WARNINGS',
          issues: validation.issues
        })
        
        // Convert AI result to legacy format with validation info
        return {
          success: aiResult.success,
          isScanned: aiResult.isScanned,
          scanResult: `🤖 AI Enhanced: ${aiResult.scanResult}${validation.issues.length > 0 ? ` (${validation.issues.length} validation notes)` : ''}`,
          extractedData: convertToLegacyFormat(aiResult.extractedData),
          error: aiResult.error
        }
      } else {
        console.warn('AI processing failed, falling back to legacy processing:', aiResult.error)
      }
    } else {
      console.log('AI processing not available, using legacy processing')
    }
    
    // Fallback to legacy processing
    console.log('Using legacy document processing')
    
    // Step 1: Extract text from document
    const textResult = await extractTextFromDocument(fileData, mimeType, fileName)
    
    if (!textResult.success || !textResult.text) {
      // If both AI and legacy text extraction fail, return helpful error
      const errorMsg = isAIEnabled() 
        ? `Both AI and legacy processing failed. ${textResult.error || 'Unable to extract text from document'}`
        : `Text extraction failed: ${textResult.error || 'Unable to process this document type'}`
        
      console.error('Document processing failed:', errorMsg)
      
      return {
        success: false,
        isScanned: false,
        scanResult: errorMsg,
        error: textResult.error
      }
    }
    
    // Step 2: Extract VAT data from text
    const extractedData = extractVATDataFromText(textResult.text, category, fileName)
    
    // Step 3: Validate extracted data
    const validation = validateExtractedVAT(extractedData)
    
    // Step 4: Generate scan result summary
    const vatAmounts = [...extractedData.salesVAT, ...extractedData.purchaseVAT]
    const processingTime = Date.now() - processingStartTime
    const scanResult = vatAmounts.length > 0 
      ? `Legacy: Extracted ${vatAmounts.length} VAT amount(s): €${vatAmounts.join(', €')} (${Math.round(extractedData.confidence * 100)}% confidence, ${processingTime}ms)`
      : `Legacy: Document scanned but no VAT amounts detected (${processingTime}ms)`
    
    console.log(`Legacy document processing complete: ${scanResult}`, {
      validation: validation.isValid ? 'PASS' : 'WARNINGS',
      issues: validation.issues,
      processingTime
    })
    
    return {
      success: true,
      isScanned: true,
      scanResult: scanResult + (validation.issues.length > 0 ? ` (${validation.issues.length} validation notes)` : ''),
      extractedData
    }
    
  } catch (error) {
    const processingTime = Date.now() - processingStartTime
    console.error('Document processing error:', error, { fileName, category, processingTime })
    
    return {
      success: false,
      isScanned: false,
      scanResult: `Processing failed after ${processingTime}ms: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Convert enhanced AI data to legacy format for compatibility
 */
function convertToLegacyFormat(enhancedData: any): ExtractedVATData | undefined {
  if (!enhancedData) return undefined
  
  return {
    salesVAT: enhancedData.salesVAT || [],
    purchaseVAT: enhancedData.purchaseVAT || [],
    totalAmount: enhancedData.totalAmount,
    vatRate: enhancedData.vatRate,
    confidence: enhancedData.confidence || 0,
    extractedText: [enhancedData.extractedText || ''],
    documentType: mapDocumentType(enhancedData.documentType)
  }
}

/**
 * Map enhanced document types to legacy format
 */
function mapDocumentType(type: string): ExtractedVATData['documentType'] {
  switch (type) {
    case 'INVOICE':
      return 'SALES_INVOICE'
    case 'RECEIPT':
      return 'SALES_RECEIPT'
    case 'CREDIT_NOTE':
      return 'PURCHASE_INVOICE'
    default:
      return 'OTHER'
  }
}

/**
 * Validate extracted VAT data for accuracy and compliance
 */
export function validateExtractedVAT(extractedData: ExtractedVATData | any): {
  isValid: boolean
  issues: string[]
  warnings: string[]
} {
  const issues: string[] = []
  const warnings: string[] = []
  
  try {
    // Check for basic data structure
    if (!extractedData) {
      issues.push('No extracted data available')
      return { isValid: false, issues, warnings }
    }
    
    // Check VAT amounts
    const salesVAT = extractedData.salesVAT || []
    const purchaseVAT = extractedData.purchaseVAT || []
    const totalVAT = [...salesVAT, ...purchaseVAT]
    
    if (totalVAT.length === 0) {
      warnings.push('No VAT amounts detected in document')
    }
    
    // Validate VAT amount ranges (reasonable business amounts)
    for (const amount of totalVAT) {
      if (amount < 0) {
        issues.push(`Invalid negative VAT amount: €${amount}`)
      }
      if (amount > 100000) {
        warnings.push(`Very high VAT amount detected: €${amount} - please verify`)
      }
    }
    
    // Check confidence score
    const confidence = extractedData.confidence || 0
    if (confidence < 0.3) {
      warnings.push(`Low confidence score: ${Math.round(confidence * 100)}% - manual review recommended`)
    }
    
    // Validate Irish VAT rates if present
    const vatRate = extractedData.vatRate
    if (vatRate && ![0, 9, 13.5, 23].includes(vatRate)) {
      warnings.push(`Unusual VAT rate detected: ${vatRate}% - verify this is correct for Ireland`)
    }
    
    // Check total amount consistency if available
    const totalAmount = extractedData.totalAmount
    if (totalAmount && totalVAT.length > 0) {
      const vatSum = totalVAT.reduce((sum, amount) => sum + amount, 0)
      const expectedNet = totalAmount - vatSum
      if (expectedNet < 0) {
        warnings.push('VAT amount exceeds total amount - please verify calculations')
      }
    }
    
  } catch (error) {
    issues.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    warnings
  }
}

/**
 * Aggregate VAT amounts from multiple documents with enhanced validation
 */
export function aggregateVATAmounts(documents: ExtractedVATData[]): {
  totalSalesVAT: number
  totalPurchaseVAT: number
  totalNetVAT: number
  documentCount: number
  averageConfidence: number
  validationSummary: {
    totalIssues: number
    totalWarnings: number
    documentsWithIssues: number
  }
} {
  let totalSalesVAT = 0
  let totalPurchaseVAT = 0
  let totalConfidence = 0
  let documentCount = 0
  let totalIssues = 0
  let totalWarnings = 0
  let documentsWithIssues = 0
  
  for (const doc of documents) {
    totalSalesVAT += doc.salesVAT.reduce((sum, amount) => sum + amount, 0)
    totalPurchaseVAT += doc.purchaseVAT.reduce((sum, amount) => sum + amount, 0)
    totalConfidence += doc.confidence
    documentCount++
    
    // Validate each document
    const validation = validateExtractedVAT(doc)
    totalIssues += validation.issues.length
    totalWarnings += validation.warnings.length
    if (!validation.isValid || validation.warnings.length > 0) {
      documentsWithIssues++
    }
  }
  
  const totalNetVAT = totalSalesVAT - totalPurchaseVAT
  const averageConfidence = documentCount > 0 ? totalConfidence / documentCount : 0
  
  return {
    totalSalesVAT: Math.round(totalSalesVAT * 100) / 100,
    totalPurchaseVAT: Math.round(totalPurchaseVAT * 100) / 100,
    totalNetVAT: Math.round(totalNetVAT * 100) / 100,
    documentCount,
    averageConfidence: Math.round(averageConfidence * 100) / 100,
    validationSummary: {
      totalIssues,
      totalWarnings, 
      documentsWithIssues
    }
  }
}