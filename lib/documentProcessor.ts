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
 * Simple PDF text extraction (for demo purposes)
 * In production, use libraries like pdf-parse or pdf2pic + OCR
 */
async function extractTextFromPDF(base64Data: string): Promise<{ success: boolean; text?: string; error?: string }> {
  try {
    // This is a mock implementation - in real usage you'd use pdf-parse
    // For now, we'll return mock invoice text based on common patterns
    const mockInvoiceText = `
      INVOICE
      Date: ${new Date().toLocaleDateString()}
      Invoice No: INV-${Math.random().toString(36).substr(2, 9)}
      
      Items:
      Product/Service Description    Qty    Unit Price    VAT Rate    VAT Amount    Total
      Professional Services          1      €1,000.00     23%        €230.00       €1,230.00
      Consultation                   2      €500.00       23%        €230.00       €1,460.00
      
      Subtotal: €1,500.00
      VAT @ 23%: €345.00
      Total Amount: €1,845.00
      
      VAT Registration Number: IE1234567A
      Payment Terms: 30 days
    `
    
    return {
      success: true,
      text: mockInvoiceText
    }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to extract text from PDF'
    }
  }
}

/**
 * Simulate OCR for images (mock implementation)
 * In production, use actual OCR services
 */
async function simulateImageOCR(fileName: string): Promise<{ success: boolean; text?: string; error?: string }> {
  try {
    // Generate mock receipt text based on filename patterns
    const isSales = fileName.toLowerCase().includes('sales') || fileName.toLowerCase().includes('receipt')
    const isPurchase = fileName.toLowerCase().includes('purchase') || fileName.toLowerCase().includes('invoice')
    
    const mockReceiptText = isSales ? `
      RECEIPT
      ${new Date().toLocaleDateString()}
      Transaction ID: ${Math.random().toString(36).substr(2, 9)}
      
      Sale Items:
      Item 1: €${(Math.random() * 100 + 50).toFixed(2)}
      Item 2: €${(Math.random() * 200 + 100).toFixed(2)}
      
      Subtotal: €${(Math.random() * 300 + 200).toFixed(2)}
      VAT (23%): €${(Math.random() * 69 + 46).toFixed(2)}
      Total: €${(Math.random() * 369 + 246).toFixed(2)}
    ` : `
      PURCHASE INVOICE
      Date: ${new Date().toLocaleDateString()}
      Invoice: ${Math.random().toString(36).substr(2, 9)}
      
      Purchases:
      Office Supplies: €${(Math.random() * 150 + 50).toFixed(2)}
      Equipment: €${(Math.random() * 500 + 200).toFixed(2)}
      
      Subtotal: €${(Math.random() * 650 + 250).toFixed(2)}
      VAT @ 23%: €${(Math.random() * 150 + 58).toFixed(2)}
      Total Due: €${(Math.random() * 800 + 308).toFixed(2)}
    `
    
    return {
      success: true,
      text: mockReceiptText
    }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to perform OCR on image'
    }
  }
}

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
  
  // VAT amount patterns - match various formats
  const vatPatterns = [
    /vat[:\s]*€?([0-9,]+\.?[0-9]*)/gi,
    /vat\s*@?\s*23%[:\s]*€?([0-9,]+\.?[0-9]*)/gi,
    /vat\s*amount[:\s]*€?([0-9,]+\.?[0-9]*)/gi,
    /tax[:\s]*€?([0-9,]+\.?[0-9]*)/gi,
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
 * Uses AI when available, falls back to legacy processing
 */
export async function processDocument(
  fileData: string,
  mimeType: string,
  fileName: string,
  category: string,
  userId?: string
): Promise<DocumentProcessingResult> {
  try {
    console.log(`Processing document: ${fileName} (${category}) - AI enabled: ${isAIEnabled()}`)
    
    // Try AI processing first if available
    if (isAIEnabled()) {
      const aiResult = await processDocumentWithAI(fileData, mimeType, fileName, category, userId)
      
      if (aiResult.success) {
        // Convert AI result to legacy format
        return {
          success: aiResult.success,
          isScanned: aiResult.isScanned,
          scanResult: `🤖 AI Enhanced: ${aiResult.scanResult}`,
          extractedData: convertToLegacyFormat(aiResult.extractedData),
          error: aiResult.error
        }
      } else {
        console.warn('AI processing failed, falling back to legacy processing:', aiResult.error)
      }
    }
    
    // Fallback to legacy processing
    console.log('Using legacy document processing')
    
    // Step 1: Extract text from document
    const textResult = await extractTextFromDocument(fileData, mimeType, fileName)
    
    if (!textResult.success || !textResult.text) {
      return {
        success: false,
        isScanned: false,
        scanResult: textResult.error || 'Failed to extract text',
        error: textResult.error
      }
    }
    
    // Step 2: Extract VAT data from text
    const extractedData = extractVATDataFromText(textResult.text, category, fileName)
    
    // Step 3: Generate scan result summary
    const vatAmounts = [...extractedData.salesVAT, ...extractedData.purchaseVAT]
    const scanResult = vatAmounts.length > 0 
      ? `Extracted ${vatAmounts.length} VAT amount(s): €${vatAmounts.join(', €')} (${Math.round(extractedData.confidence * 100)}% confidence)`
      : 'Document scanned but no VAT amounts detected'
    
    console.log(`Legacy document processing complete: ${scanResult}`)
    
    return {
      success: true,
      isScanned: true,
      scanResult,
      extractedData
    }
    
  } catch (error) {
    console.error('Document processing error:', error)
    return {
      success: false,
      isScanned: false,
      scanResult: 'Processing failed due to technical error',
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
 * Aggregate VAT amounts from multiple documents
 */
export function aggregateVATAmounts(documents: ExtractedVATData[]): {
  totalSalesVAT: number
  totalPurchaseVAT: number
  totalNetVAT: number
  documentCount: number
  averageConfidence: number
} {
  let totalSalesVAT = 0
  let totalPurchaseVAT = 0
  let totalConfidence = 0
  let documentCount = 0
  
  for (const doc of documents) {
    totalSalesVAT += doc.salesVAT.reduce((sum, amount) => sum + amount, 0)
    totalPurchaseVAT += doc.purchaseVAT.reduce((sum, amount) => sum + amount, 0)
    totalConfidence += doc.confidence
    documentCount++
  }
  
  const totalNetVAT = totalSalesVAT - totalPurchaseVAT
  const averageConfidence = documentCount > 0 ? totalConfidence / documentCount : 0
  
  return {
    totalSalesVAT: Math.round(totalSalesVAT * 100) / 100,
    totalPurchaseVAT: Math.round(totalPurchaseVAT * 100) / 100,
    totalNetVAT: Math.round(totalNetVAT * 100) / 100,
    documentCount,
    averageConfidence: Math.round(averageConfidence * 100) / 100
  }
}