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
    console.log('🔍 PDF EXTRACTION DEBUG:')
    console.log(`📄 PDF Buffer size: ${buffer.length} bytes`)
    console.log(`📄 First 100 bytes: ${buffer.subarray(0, 100).toString('hex')}`)
    
    // This is a basic implementation
    // In production, you would use: const pdf = await pdfParse(buffer)
    
    // For now, we'll attempt to read the PDF as text
    const pdfText = buffer.toString('utf8')
    console.log(`📄 PDF as UTF8 length: ${pdfText.length} characters`)
    console.log(`📄 First 200 chars of PDF text: "${pdfText.substring(0, 200)}"`)
    
    // CRITICAL TEST: Search for our target amount in raw PDF
    const contains111_36 = pdfText.includes('111.36')
    const containsTotalAmountVAT = pdfText.includes('Total Amount VAT')
    console.log(`🎯 RAW PDF SEARCH RESULTS:`)
    console.log(`   - Contains "111.36": ${contains111_36}`)
    console.log(`   - Contains "Total Amount VAT": ${containsTotalAmountVAT}`)
    
    // Look for text patterns that indicate this might be a text-based PDF
    if (pdfText.includes('/Type /Page') || pdfText.includes('stream')) {
      console.log('📄 PDF appears to have valid structure (/Type /Page or stream found)')
      
      // This appears to be a valid PDF structure
      // Extract any readable text content
      const textMatches = pdfText.match(/BT[^E]*ET/g) || []
      console.log(`📄 Found ${textMatches.length} text blocks (BT...ET patterns)`)
      
      const extractedTexts = textMatches.map((match, index) => {
        // Simple text extraction from PDF streams
        const cleaned = match.replace(/[^a-zA-Z0-9\s€.,:%()-]/g, ' ').replace(/\s+/g, ' ').trim()
        console.log(`📄 Text block ${index + 1}: "${cleaned.substring(0, 100)}${cleaned.length > 100 ? '...' : ''}"`)
        
        // Check each block for our target
        if (cleaned.includes('111.36')) {
          console.log(`🎯 FOUND "111.36" in text block ${index + 1}!`)
        }
        if (cleaned.includes('Total Amount VAT')) {
          console.log(`🎯 FOUND "Total Amount VAT" in text block ${index + 1}!`)
        }
        
        return cleaned
      }).filter(text => text.length > 5)
      
      const finalText = extractedTexts.join('\n')
      console.log(`📄 Final extracted text length: ${finalText.length} characters`)
      console.log(`📄 Final text preview: "${finalText.substring(0, 300)}${finalText.length > 300 ? '...' : ''}"`)
      
      // Final test on extracted text
      console.log(`🎯 FINAL EXTRACTION TEST:`)
      console.log(`   - Final text contains "111.36": ${finalText.includes('111.36')}`)
      console.log(`   - Final text contains "Total Amount VAT": ${finalText.includes('Total Amount VAT')}`)
      
      return finalText
    }
    
    console.log('❌ PDF does not appear to have valid structure - no /Type /Page or stream found')
    // If no text found, throw error to trigger AI processing
    throw new Error('PDF appears to be image-based or encrypted')
    
  } catch (error) {
    console.error('🚨 PDF text extraction failed:', error)
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
 * Extract VAT amounts from table-like structures in document text
 * Handles various VAT table formats with multiple rates
 */
function extractVATFromTables(text: string): number[] {
  const vatAmounts: number[] = []
  const lines = text.split('\n')
  
  // Look for VAT table sections
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase().trim()
    
    // Check if this line contains VAT table headers
    if (line.includes('vat') && (line.includes('breakdown') || line.includes('summary') || 
        line.includes('details') || line.includes('rate') || line.includes('amount'))) {
      
      // Process the next several lines looking for VAT amounts
      for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
        const tableLine = lines[j].toLowerCase().trim()
        if (!tableLine) continue
        
        // Look for common VAT table patterns
        const tablePatterns = [
          // Pattern: "MIN    €1.51" or "MIN  1.51"
          /\b(min|nil|std23?|red13\.5?|tou9?)\s+€?([0-9,]+\.?[0-9]*)\b/gi,
          // Pattern: "VAT @ 23%   €109.85"
          /vat\s*@\s*([0-9.]+)%\s*€?([0-9,]+\.?[0-9]*)/gi,
          // Pattern: "23%     €109.85"
          /\b([0-9.]+)%\s+€?([0-9,]+\.?[0-9]*)\b/gi,
          // Pattern: "€109.85    23%" (amount first)
          /€?([0-9,]+\.?[0-9]*)\s+([0-9.]+)%/gi,
        ]
        
        for (const pattern of tablePatterns) {
          let match
          while ((match = pattern.exec(tableLine)) !== null) {
            // For patterns with rate and amount, extract the amount
            let amount: number
            if (pattern.source.includes('([0-9,]+\\.?[0-9]*).*([0-9.]+)%')) {
              // Amount comes first, rate second
              amount = parseFloat(match[1].replace(/,/g, ''))
            } else {
              // Rate comes first, amount second (most common)
              amount = parseFloat(match[2]?.replace(/,/g, '') || match[1]?.replace(/,/g, ''))
            }
            
            if (!isNaN(amount) && amount > 0) {
              // Only add if we haven't already found this amount
              if (!vatAmounts.some(existing => Math.abs(existing - amount) < 0.01)) {
                vatAmounts.push(amount)
              }
            }
          }
        }
        
        // Stop processing if we hit another section header or empty lines
        if (tableLine.includes('total') && !tableLine.includes('vat')) {
          break
        }
      }
    }
  }
  
  return vatAmounts
}

/**
 * Detect document type and business context from content
 */
function analyzeDocumentType(text: string): {
  isLease: boolean
  isFinancialServices: boolean
  businessType: string
  suggestedCategory: 'SALES' | 'PURCHASES' | 'UNKNOWN'
  confidence: number
} {
  const normalizedText = text.toLowerCase()
  
  // Lease detection patterns
  const leasePatterns = [
    /lease/gi,
    /rental/gi,
    /monthly payment/gi,
    /vehicle finance/gi,
    /car finance/gi,
    /finance agreement/gi,
    /hire agreement/gi
  ]
  
  // Financial services company patterns
  const financialServicePatterns = [
    /financial services/gi,
    /volkswagen financial/gi,
    /vw financial/gi,
    /bank/gi,
    /finance limited/gi,
    /finance ltd/gi,
    /credit/gi,
    /lending/gi
  ]
  
  const isLease = leasePatterns.some(pattern => pattern.test(normalizedText))
  const isFinancialServices = financialServicePatterns.some(pattern => pattern.test(normalizedText))
  
  let businessType = 'UNKNOWN'
  let suggestedCategory: 'SALES' | 'PURCHASES' | 'UNKNOWN' = 'UNKNOWN'
  let confidence = 0.5
  
  if (isLease || isFinancialServices) {
    businessType = 'FINANCIAL_SERVICES'
    // Lease invoices are typically purchases (you're buying a service)
    suggestedCategory = 'PURCHASES'
    confidence = 0.8
  }
  
  // Additional business type detection
  if (normalizedText.includes('invoice')) {
    if (normalizedText.includes('from') || normalizedText.includes('bill to')) {
      // This suggests we're being billed by someone (purchase)
      suggestedCategory = 'PURCHASES'
      confidence = Math.max(confidence, 0.7)
    }
  }
  
  return {
    isLease,
    isFinancialServices,
    businessType,
    suggestedCategory,
    confidence
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
  
  // Analyze document type for smart categorization
  const docAnalysis = analyzeDocumentType(text)
  
  // Prioritized VAT amount patterns - high priority patterns first
  const highPriorityVATPatterns = [
    // Explicit total VAT amount patterns (highest priority)
    /total\s+(?:amount\s+)?vat[:\s]*€?([0-9,]+\.?[0-9]*)/gi,
    /total\s+vat\s+amount[:\s]*€?([0-9,]+\.?[0-9]*)/gi,
    /vat\s+total[:\s]*€?([0-9,]+\.?[0-9]*)/gi,
    /vat\s*amount[:\s]*€?([0-9,]+\.?[0-9]*)/gi,
    
    // VAT breakdown table totals
    /(?:total\s+)?(?:vat|tax)\s*(?:breakdown|summary|details)[^€]*total[^€]*€?([0-9,]+\.?[0-9]*)/gi,
  ]
  
  const standardVATPatterns = [
    // VAT with specific rates
    /vat\s*@?\s*23%[:\s]*€?([0-9,]+\.?[0-9]*)/gi,
    /vat\s*@?\s*13\.5%[:\s]*€?([0-9,]+\.?[0-9]*)/gi,
    /vat\s*@?\s*9%[:\s]*€?([0-9,]+\.?[0-9]*)/gi,
    
    // VAT rate category patterns (MIN, NIL, STD, etc.)
    /vat\s*min[:\s]*€?([0-9,]+\.?[0-9]*)/gi,
    /vat\s*std(?:23)?[:\s]*€?([0-9,]+\.?[0-9]*)/gi,
    /vat\s*red(?:13\.5)?[:\s]*€?([0-9,]+\.?[0-9]*)/gi,
    /vat\s*tou(?:9)?[:\s]*€?([0-9,]+\.?[0-9]*)/gi,
    /vat\s*nil[:\s]*€?([0-9,]+\.?[0-9]*)/gi,
    /vat\s*zero[:\s]*€?([0-9,]+\.?[0-9]*)/gi,
  ]
  
  const genericVATPatterns = [
    // Generic VAT patterns (lower priority)
    /(?:total\s+)?vat[:\s]*€?([0-9,]+\.?[0-9]*)/gi,
    /(?:total\s+)?tax[:\s]*€?([0-9,]+\.?[0-9]*)/gi,
    
    // VAT table row patterns
    /min\s+€?([0-9,]+\.?[0-9]*)/gi,
    /std23?\s+€?([0-9,]+\.?[0-9]*)/gi,
    /red13\.5?\s+€?([0-9,]+\.?[0-9]*)/gi,
    /tou9?\s+€?([0-9,]+\.?[0-9]*)/gi,
    
    // Currency first patterns
    /€([0-9,]+\.?[0-9]*)\s*vat/gi,
    /€([0-9,]+\.?[0-9]*)\s*tax/gi,
    
    // Line item patterns
    /vat\s*\([0-9.]+%\)[:\s]*€?([0-9,]+\.?[0-9]*)/gi,
    
    // Irish specific patterns
    /cáin\s*bhreisluacha[:\s]*€?([0-9,]+\.?[0-9]*)/gi, // Irish for VAT
  ]
  
  // Patterns to exclude from VAT detection (lease/payment amounts)
  const excludePatterns = [
    /monthly\s+payment[:\s]*€?([0-9,]+\.?[0-9]*)/gi,
    /lease\s+payment[:\s]*€?([0-9,]+\.?[0-9]*)/gi,
    /rental[:\s]*€?([0-9,]+\.?[0-9]*)/gi,
    /instalment[:\s]*€?([0-9,]+\.?[0-9]*)/gi,
    /payment\s+due[:\s]*€?([0-9,]+\.?[0-9]*)/gi,
  ]
  
  // Total amount patterns
  const totalPatterns = [
    /total[:\s]*€?([0-9,]+\.?[0-9]*)/gi,
    /amount\s*due[:\s]*€?([0-9,]+\.?[0-9]*)/gi,
    /grand\s*total[:\s]*€?([0-9,]+\.?[0-9]*)/gi,
  ]
  
  // Extract amounts to exclude (lease payments, etc.)
  const excludedAmounts = new Set<number>()
  for (const pattern of excludePatterns) {
    let match
    while ((match = pattern.exec(normalizedText)) !== null) {
      const amount = parseFloat(match[1].replace(/,/g, ''))
      if (!isNaN(amount) && amount > 0) {
        excludedAmounts.add(Math.round(amount * 100) / 100)
      }
    }
  }
  
  // Extract VAT amounts using prioritized approach
  const foundVATAmounts = new Set<number>()
  let highPriorityFound = false
  
  // Try high priority patterns first (Total VAT Amount, etc.)
  for (const pattern of highPriorityVATPatterns) {
    let match
    while ((match = pattern.exec(normalizedText)) !== null) {
      const amount = parseFloat(match[1].replace(/,/g, ''))
      if (!isNaN(amount) && amount > 0) {
        const roundedAmount = Math.round(amount * 100) / 100
        // Skip if this amount is in excluded list
        if (excludedAmounts.has(roundedAmount)) continue
        
        if (!foundVATAmounts.has(roundedAmount)) {
          foundVATAmounts.add(roundedAmount)
          
          // Use smart categorization or fallback to original category
          const targetCategory = docAnalysis.suggestedCategory !== 'UNKNOWN' 
            ? docAnalysis.suggestedCategory 
            : (category.includes('SALES') ? 'SALES' : 'PURCHASES')
          
          if (targetCategory === 'SALES') {
            salesVAT.push(amount)
          } else {
            purchaseVAT.push(amount)
          }
          
          // High confidence for explicit VAT amount patterns
          confidence += 0.6
          highPriorityFound = true
        }
      }
    }
  }
  
  // If no high priority patterns found, try standard VAT patterns
  if (!highPriorityFound) {
    for (const pattern of standardVATPatterns) {
      let match
      while ((match = pattern.exec(normalizedText)) !== null) {
        const amount = parseFloat(match[1].replace(/,/g, ''))
        if (!isNaN(amount) && amount > 0) {
          const roundedAmount = Math.round(amount * 100) / 100
          if (excludedAmounts.has(roundedAmount)) continue
          
          if (!foundVATAmounts.has(roundedAmount)) {
            foundVATAmounts.add(roundedAmount)
            
            const targetCategory = docAnalysis.suggestedCategory !== 'UNKNOWN' 
              ? docAnalysis.suggestedCategory 
              : (category.includes('SALES') ? 'SALES' : 'PURCHASES')
            
            if (targetCategory === 'SALES') {
              salesVAT.push(amount)
            } else {
              purchaseVAT.push(amount)
            }
            
            confidence += 0.4
          }
        }
      }
    }
  }
  
  // Only use generic patterns as last resort if nothing else found
  if (foundVATAmounts.size === 0) {
    for (const pattern of genericVATPatterns) {
      let match
      while ((match = pattern.exec(normalizedText)) !== null) {
        const amount = parseFloat(match[1].replace(/,/g, ''))
        if (!isNaN(amount) && amount > 0) {
          const roundedAmount = Math.round(amount * 100) / 100
          if (excludedAmounts.has(roundedAmount)) continue
          
          if (!foundVATAmounts.has(roundedAmount)) {
            foundVATAmounts.add(roundedAmount)
            
            const targetCategory = docAnalysis.suggestedCategory !== 'UNKNOWN' 
              ? docAnalysis.suggestedCategory 
              : (category.includes('SALES') ? 'SALES' : 'PURCHASES')
            
            if (targetCategory === 'SALES') {
              salesVAT.push(amount)
            } else {
              purchaseVAT.push(amount)
            }
            
            // Lower confidence for generic patterns
            confidence += 0.3
          }
        }
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
  
  // Try advanced VAT table extraction if we haven't found enough VAT amounts
  if (salesVAT.length === 0 && purchaseVAT.length === 0) {
    const tableVATAmounts = extractVATFromTables(text)
    for (const amount of tableVATAmounts) {
      // Skip excluded amounts
      if (excludedAmounts.has(Math.round(amount * 100) / 100)) continue
      
      const targetCategory = docAnalysis.suggestedCategory !== 'UNKNOWN' 
        ? docAnalysis.suggestedCategory 
        : (category.includes('SALES') ? 'SALES' : 'PURCHASES')
      
      if (targetCategory === 'SALES') {
        salesVAT.push(amount)
      } else {
        purchaseVAT.push(amount)
      }
      confidence += 0.3
    }
  }

  // If still no explicit VAT amounts found, try to calculate from total and rate
  if (salesVAT.length === 0 && purchaseVAT.length === 0 && totalAmount && vatRate) {
    const calculatedVAT = (totalAmount * vatRate) / (100 + vatRate)
    
    const targetCategory = docAnalysis.suggestedCategory !== 'UNKNOWN' 
      ? docAnalysis.suggestedCategory 
      : (category.includes('SALES') ? 'SALES' : 'PURCHASES')
    
    if (targetCategory === 'SALES') {
      salesVAT.push(Math.round(calculatedVAT * 100) / 100)
    } else {
      purchaseVAT.push(Math.round(calculatedVAT * 100) / 100)
    }
    confidence += 0.2
  }
  
  // Boost confidence based on document analysis
  if (docAnalysis.confidence > 0.7) {
    confidence += 0.2 // Boost for confident document type detection
  }
  
  // Boost confidence if we found multiple VAT amounts that suggest a breakdown table
  const totalVATItems = salesVAT.length + purchaseVAT.length
  if (totalVATItems > 1) {
    confidence += 0.1
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
    console.log('🔄 DOCUMENT PROCESSING PIPELINE START:')
    console.log(`📄 Document: ${fileName}`)
    console.log(`📁 Category: ${category}`)
    console.log(`🎭 MIME Type: ${mimeType}`)
    console.log(`👤 User ID: ${userId || 'guest'}`)
    console.log(`🤖 AI enabled: ${isAIEnabled()}`)
    console.log(`📂 File size: ${Math.round(fileData.length / 1024)}KB (base64)`)
    console.log('=' .repeat(80))
    
    // Try AI processing first if available
    if (isAIEnabled()) {
      console.log('🤖 ATTEMPTING AI DOCUMENT PROCESSING...')
      
      // Quick connectivity test before heavy AI processing
      console.log('⚡ Running quick OpenAI connectivity check before document processing...')
      try {
        const { quickConnectivityTest } = await import('./ai/diagnostics')
        const connectivityCheck = await quickConnectivityTest()
        
        if (!connectivityCheck.success) {
          console.error('🚨 OpenAI connectivity check failed before document processing:', connectivityCheck.error)
          console.log('⚠️ Falling back to legacy processing due to API connectivity issues')
          
          // Skip AI processing and go straight to legacy
          return await processWithLegacyMethod(fileData, mimeType, fileName, category, processingStartTime)
        }
        
        console.log('✅ OpenAI connectivity confirmed, proceeding with AI document processing')
      } catch (connectivityError) {
        console.error('⚠️ Failed to run connectivity check:', connectivityError)
        // Continue with AI processing attempt anyway
      }
      
      const aiResult = await processDocumentWithAI(fileData, mimeType, fileName, category, userId)
      
      console.log('🔍 AI PROCESSING RESULT:')
      console.log(`   Success: ${aiResult.success}`)
      console.log(`   Scanned: ${aiResult.isScanned}`)
      console.log(`   AI Processed: ${aiResult.aiProcessed}`)
      console.log(`   Processing Time: ${aiResult.processingTime}ms`)
      console.log(`   Scan Result: ${aiResult.scanResult}`)
      console.log(`   Has Extracted Data: ${!!aiResult.extractedData}`)
      
      if (aiResult.extractedData) {
        console.log('💰 AI EXTRACTED VAT DATA:')
        console.log(`   Sales VAT: [${aiResult.extractedData.salesVAT?.join(', ') || 'none'}]`)
        console.log(`   Purchase VAT: [${aiResult.extractedData.purchaseVAT?.join(', ') || 'none'}]`)
        console.log(`   Confidence: ${Math.round((aiResult.extractedData.confidence || 0) * 100)}%`)
      }
      
      if (aiResult.success && aiResult.extractedData) {
        // Validate AI results
        const validation = validateExtractedVAT(aiResult.extractedData)
        console.log(`✅ AI processing successful: ${aiResult.scanResult}`, {
          processingTime: aiResult.processingTime,
          validation: validation.isValid ? 'PASS' : 'WARNINGS',
          issues: validation.issues
        })
        
        // Convert AI result to legacy format with validation info
        const finalResult = {
          success: aiResult.success,
          isScanned: aiResult.isScanned,
          scanResult: `🤖 AI Enhanced: ${aiResult.scanResult}${validation.issues.length > 0 ? ` (${validation.issues.length} validation notes)` : ''}`,
          extractedData: convertToLegacyFormat(aiResult.extractedData),
          error: aiResult.error
        }
        
        console.log('🎯 FINAL AI RESULT:')
        console.log(`   Final VAT amounts: Sales=[${finalResult.extractedData?.salesVAT?.join(', ') || 'none'}], Purchase=[${finalResult.extractedData?.purchaseVAT?.join(', ') || 'none'}]`)
        console.log(`   Final confidence: ${Math.round((finalResult.extractedData?.confidence || 0) * 100)}%`)
        console.log('🔄 DOCUMENT PROCESSING PIPELINE: AI SUCCESS - Returning result')
        console.log('=' .repeat(80))
        
        return finalResult
      } else {
        console.warn('❌ AI processing failed, falling back to legacy processing:', aiResult.error)
      }
    } else {
      console.log('⚠️  AI processing not available, using legacy processing')
    }
    
    // Fallback to legacy processing
    return await processWithLegacyMethod(fileData, mimeType, fileName, category, processingStartTime)
    
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
 * Process document using legacy methods (fallback when AI is not available or fails)
 */
async function processWithLegacyMethod(
  fileData: string,
  mimeType: string,
  fileName: string,
  category: string,
  processingStartTime: number
): Promise<DocumentProcessingResult> {
  console.log('🔄 PROCESSING WITH LEGACY METHOD (no AI)')
  
  // Step 1: Extract text from document
  const textResult = await extractTextFromDocument(fileData, mimeType, fileName)
  
  if (!textResult.success || !textResult.text) {
    const errorMsg = `Legacy text extraction failed: ${textResult.error || 'Unable to process this document type'}`
    console.error('Legacy document processing failed:', errorMsg)
    
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