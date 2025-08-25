/**
 * Multi-Model Validation System
 * Compares results from different extraction methods to improve accuracy and confidence
 */

import { ExtractedVATData } from '../documentProcessor'
import { processDocumentWithAI } from './documentAnalysis'

export interface ValidationResult {
  finalResult: ExtractedVATData
  confidence: number
  consensusReached: boolean
  agreementScore: number // 0-1, how much models agree
  methodResults: MethodResult[]
  validationSummary: {
    totalMethods: number
    agreeingMethods: number
    conflictingFields: string[]
    recommendedAction: 'ACCEPT' | 'REVIEW' | 'REJECT'
  }
}

export interface MethodResult {
  method: string
  result: ExtractedVATData
  confidence: number
  weight: number
  processingTime: number
  quality: number
}

export class MultiModelValidator {
  
  /**
   * Validate document using multiple extraction methods
   */
  static async validateWithMultipleMethods(
    fileData: string,
    mimeType: string,
    fileName: string,
    category: string
  ): Promise<ValidationResult> {
    console.log('🔍 Starting multi-model validation for:', fileName)
    
    const methodResults: MethodResult[] = []
    const startTime = Date.now()
    
    // Method 1: Primary AI Vision processing
    try {
      console.log('   📊 Method 1: AI Vision processing...')
      const aiResult = await processDocumentWithAI(fileData, mimeType, fileName, category)
      if (aiResult.success && aiResult.extractedData) {
        // Convert EnhancedVATData to ExtractedVATData
        const extractedData: ExtractedVATData = {
          salesVAT: aiResult.extractedData.salesVAT,
          purchaseVAT: aiResult.extractedData.purchaseVAT,
          totalAmount: aiResult.extractedData.totalAmount,
          vatRate: aiResult.extractedData.vatRate,
          confidence: aiResult.extractedData.confidence,
          extractedText: [aiResult.extractedData.extractedText],
          documentType: this.mapDocumentType(aiResult.extractedData.documentType),
          vatNumber: aiResult.extractedData.businessDetails?.vatNumber || undefined,
          invoiceDate: aiResult.extractedData.transactionData?.date || undefined,
          supplierName: aiResult.extractedData.businessDetails?.businessName || undefined,
          processingMethod: 'AI_VISION',
          processingTimeMs: Date.now() - startTime,
          validationFlags: aiResult.extractedData.validationFlags,
          irishVATCompliant: !aiResult.extractedData.validationFlags.includes('NON_IRISH_VAT')
        }
        
        methodResults.push({
          method: 'AI_VISION',
          result: extractedData,
          confidence: extractedData.confidence,
          weight: 1.0, // Highest weight for AI Vision
          processingTime: Date.now() - startTime,
          quality: this.assessMethodQuality(extractedData, 'AI_VISION')
        })
      }
    } catch (error) {
      console.warn('   ❌ AI Vision processing failed:', error)
    }

    // Method 2: Excel/CSV structured parsing (if applicable)
    if (mimeType.includes('spreadsheet') || fileName.endsWith('.csv') || fileName.endsWith('.xlsx')) {
      try {
        console.log('   📊 Method 2: Structured data parsing...')
        const structuredResult = await this.processWithStructuredParser(fileData, fileName, category)
        if (structuredResult) {
          methodResults.push({
            method: 'STRUCTURED_PARSER',
            result: structuredResult,
            confidence: structuredResult.confidence,
            weight: 0.9, // High weight for structured data
            processingTime: Date.now() - startTime,
            quality: this.assessMethodQuality(structuredResult, 'STRUCTURED_PARSER')
          })
        }
      } catch (error) {
        console.warn('   ❌ Structured parsing failed:', error)
      }
    }

    // Method 3: OCR + Pattern matching (if PDF/image)
    if (mimeType.includes('pdf') || mimeType.includes('image')) {
      try {
        console.log('   📊 Method 3: OCR + Pattern matching...')
        const ocrResult = await this.processWithOCRPatterns(fileData, fileName, category)
        if (ocrResult) {
          methodResults.push({
            method: 'OCR_PATTERNS',
            result: ocrResult,
            confidence: ocrResult.confidence,
            weight: 0.7, // Medium weight for OCR
            processingTime: Date.now() - startTime,
            quality: this.assessMethodQuality(ocrResult, 'OCR_PATTERNS')
          })
        }
      } catch (error) {
        console.warn('   ❌ OCR pattern matching failed:', error)
      }
    }

    // Analyze results and reach consensus
    const validationResult = this.analyzeAndReachConsensus(methodResults, fileName)
    
    console.log('✅ Multi-model validation complete:')
    console.log(`   🎯 Final confidence: ${Math.round(validationResult.confidence * 100)}%`)
    console.log(`   🤝 Agreement score: ${Math.round(validationResult.agreementScore * 100)}%`)
    console.log(`   📋 Recommendation: ${validationResult.validationSummary.recommendedAction}`)
    
    return validationResult
  }

  /**
   * Analyze results from different methods and reach consensus
   */
  private static analyzeAndReachConsensus(methodResults: MethodResult[], fileName: string): ValidationResult {
    if (methodResults.length === 0) {
      throw new Error('No valid extraction results available')
    }

    if (methodResults.length === 1) {
      // Only one method succeeded
      const result = methodResults[0]
      return {
        finalResult: result.result,
        confidence: result.confidence,
        consensusReached: true,
        agreementScore: 1.0,
        methodResults,
        validationSummary: {
          totalMethods: 1,
          agreeingMethods: 1,
          conflictingFields: [],
          recommendedAction: result.confidence > 0.8 ? 'ACCEPT' : 'REVIEW'
        }
      }
    }

    // Multiple methods - compare and find consensus
    const vatAmountComparison = this.compareVATAmounts(methodResults)
    const businessDataComparison = this.compareBusinessData(methodResults)
    const documentTypeComparison = this.compareDocumentTypes(methodResults)
    
    // Calculate overall agreement score
    const agreementScore = (
      vatAmountComparison.agreement + 
      businessDataComparison.agreement + 
      documentTypeComparison.agreement
    ) / 3

    // Choose best result based on weighted scoring
    const bestResult = this.selectBestResult(methodResults)
    
    // Adjust confidence based on agreement
    const confidenceMultiplier = this.calculateConfidenceMultiplier(agreementScore, methodResults.length)
    const finalConfidence = Math.min(0.99, bestResult.confidence * confidenceMultiplier)

    // Identify conflicting fields
    const conflictingFields: string[] = []
    if (vatAmountComparison.agreement < 0.8) conflictingFields.push('VAT amounts')
    if (businessDataComparison.agreement < 0.8) conflictingFields.push('Business data')
    if (documentTypeComparison.agreement < 0.8) conflictingFields.push('Document type')

    // Determine recommendation
    let recommendedAction: 'ACCEPT' | 'REVIEW' | 'REJECT' = 'ACCEPT'
    if (finalConfidence < 0.7 || conflictingFields.length > 1) {
      recommendedAction = 'REVIEW'
    } else if (finalConfidence < 0.5) {
      recommendedAction = 'REJECT'
    }

    return {
      finalResult: {
        ...bestResult,
        confidence: finalConfidence
      },
      confidence: finalConfidence,
      consensusReached: agreementScore > 0.8,
      agreementScore,
      methodResults,
      validationSummary: {
        totalMethods: methodResults.length,
        agreeingMethods: Math.round(agreementScore * methodResults.length),
        conflictingFields,
        recommendedAction
      }
    }
  }

  /**
   * Compare VAT amounts across methods
   */
  private static compareVATAmounts(results: MethodResult[]): { agreement: number, consensusAmount: number } {
    const allVATAmounts = results.map(r => {
      const total = [...r.result.salesVAT, ...r.result.purchaseVAT].reduce((sum, amt) => sum + amt, 0)
      return { total, weight: r.weight }
    })

    if (allVATAmounts.length < 2) return { agreement: 1.0, consensusAmount: allVATAmounts[0]?.total || 0 }

    // Calculate weighted average
    const totalWeight = allVATAmounts.reduce((sum, item) => sum + item.weight, 0)
    const weightedAverage = allVATAmounts.reduce((sum, item) => sum + (item.total * item.weight), 0) / totalWeight

    // Calculate agreement based on how close amounts are to the weighted average
    let agreementSum = 0
    allVATAmounts.forEach(item => {
      const difference = Math.abs(item.total - weightedAverage)
      const tolerance = Math.max(1, weightedAverage * 0.1) // 10% tolerance or €1, whichever is greater
      const agreement = Math.max(0, 1 - (difference / tolerance))
      agreementSum += agreement * item.weight
    })

    return {
      agreement: agreementSum / totalWeight,
      consensusAmount: weightedAverage
    }
  }

  /**
   * Compare business data across methods
   */
  private static compareBusinessData(results: MethodResult[]): { agreement: number } {
    let agreements = 0
    let comparisons = 0

    // Compare business names (using actual ExtractedVATData structure)
    const businessNames = results.map(r => r.result.supplierName).filter(Boolean)
    if (businessNames.length > 1) {
      const uniqueNames = new Set(businessNames)
      agreements += uniqueNames.size === 1 ? 1 : 0.5
      comparisons += 1
    }

    // Compare VAT numbers (using actual ExtractedVATData structure)
    const vatNumbers = results.map(r => r.result.vatNumber).filter(Boolean)
    if (vatNumbers.length > 1) {
      const uniqueVATNumbers = new Set(vatNumbers)
      agreements += uniqueVATNumbers.size === 1 ? 1 : 0.3
      comparisons += 1
    }

    return { agreement: comparisons > 0 ? agreements / comparisons : 1.0 }
  }

  /**
   * Compare document types across methods
   */
  private static compareDocumentTypes(results: MethodResult[]): { agreement: number } {
    const documentTypes = results.map(r => r.result.documentType).filter(Boolean)
    if (documentTypes.length < 2) return { agreement: 1.0 }

    const uniqueTypes = new Set(documentTypes)
    return { agreement: uniqueTypes.size === 1 ? 1.0 : 0.6 }
  }

  /**
   * Select the best result based on weighted scoring
   */
  private static selectBestResult(results: MethodResult[]): ExtractedVATData {
    let bestScore = -1
    let bestResult = results[0].result

    results.forEach(methodResult => {
      const score = (methodResult.confidence * 0.4) + 
                   (methodResult.weight * 0.3) + 
                   (methodResult.quality * 0.3)
      
      if (score > bestScore) {
        bestScore = score
        bestResult = methodResult.result
      }
    })

    return bestResult
  }

  /**
   * Calculate confidence multiplier based on agreement
   */
  private static calculateConfidenceMultiplier(agreementScore: number, methodCount: number): number {
    // Higher agreement and more methods = higher confidence
    const baseMultiplier = 0.8 + (agreementScore * 0.4) // 0.8 to 1.2 based on agreement
    const methodBonus = Math.min(0.1, (methodCount - 1) * 0.05) // Small bonus for more methods
    
    return Math.min(1.3, baseMultiplier + methodBonus)
  }

  /**
   * Assess quality of method result
   */
  private static assessMethodQuality(result: ExtractedVATData, method: string): number {
    let quality = 50 // Base quality

    // Method-specific quality assessment
    switch (method) {
      case 'AI_VISION':
        quality = 85
        break
      case 'STRUCTURED_PARSER':
        quality = 90
        break
      case 'OCR_PATTERNS':
        quality = 70
        break
    }

    // Adjust based on result characteristics
    const vatCount = result.salesVAT.length + result.purchaseVAT.length
    if (vatCount > 0) quality += 10
    if (vatCount > 3) quality += 5

    if (result.supplierName) quality += 5
    if (result.vatNumber) quality += 10
    if (result.documentType && result.documentType !== 'OTHER') quality += 5

    return Math.min(100, quality)
  }

  /**
   * Structured parser for Excel/CSV documents
   */
  private static async processWithStructuredParser(
    fileData: string, 
    fileName: string, 
    category: string
  ): Promise<ExtractedVATData | null> {
    try {
      console.log('   📊 Processing with structured parser...')
      
      // Parse the structured data
      const parsedData = await this.parseStructuredDocument(fileData, fileName)
      if (!parsedData) {
        console.log('   ❌ Failed to parse structured document')
        return null
      }

      // Detect if this is a tax report (like WooCommerce)
      const isTaxReport = this.detectTaxReportStructure(parsedData)
      
      if (isTaxReport) {
        return this.processTaxReport(parsedData, fileName, category)
      }

      // Process as invoice/receipt data
      return this.processInvoiceData(parsedData, fileName, category)

    } catch (error) {
      console.error('   ❌ Structured parser failed:', error)
      return null
    }
  }

  /**
   * Parse structured document (CSV/Excel-like data)
   */
  private static async parseStructuredDocument(fileData: string, fileName: string): Promise<any[][] | null> {
    try {
      // Handle CSV format
      if (fileName.toLowerCase().endsWith('.csv') || fileData.includes(',')) {
        return this.parseCSVData(fileData)
      }

      // Handle TSV format
      if (fileData.includes('\t')) {
        return this.parseTSVData(fileData)
      }

      // Handle structured text data
      if (fileData.includes('\n') && fileData.includes(':')) {
        return this.parseKeyValueData(fileData)
      }

      // Handle JSON-like data
      if (fileData.trim().startsWith('{') || fileData.trim().startsWith('[')) {
        return this.parseJSONData(fileData)
      }

      return null
    } catch (error) {
      console.error('Failed to parse structured document:', error)
      return null
    }
  }

  /**
   * Parse CSV data into rows and columns
   */
  private static parseCSVData(csvData: string): any[][] {
    const lines = csvData.split('\n').filter(line => line.trim().length > 0)
    const rows: any[][] = []

    lines.forEach(line => {
      // Simple CSV parsing (handles quoted fields)
      const row: string[] = []
      let currentField = ''
      let inQuotes = false

      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        
        if (char === '"' && (i === 0 || line[i-1] === ',')) {
          inQuotes = true
        } else if (char === '"' && inQuotes) {
          inQuotes = false
        } else if (char === ',' && !inQuotes) {
          row.push(currentField.trim())
          currentField = ''
        } else {
          currentField += char
        }
      }
      
      // Add the last field
      row.push(currentField.trim())
      
      if (row.some(field => field.length > 0)) {
        rows.push(row)
      }
    })

    return rows
  }

  /**
   * Parse TSV (tab-separated values) data
   */
  private static parseTSVData(tsvData: string): any[][] {
    return tsvData
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.split('\t').map(field => field.trim()))
      .filter(row => row.some(field => field.length > 0))
  }

  /**
   * Parse key-value structured data
   */
  private static parseKeyValueData(data: string): any[][] {
    const lines = data.split('\n').filter(line => line.trim().length > 0)
    const rows: any[][] = []
    
    lines.forEach(line => {
      if (line.includes(':')) {
        const [key, ...valueParts] = line.split(':')
        const value = valueParts.join(':').trim()
        rows.push([key.trim(), value])
      }
    })
    
    return rows
  }

  /**
   * Parse JSON data
   */
  private static parseJSONData(jsonData: string): any[][] {
    try {
      const parsed = JSON.parse(jsonData)
      const rows: any[][] = []
      
      if (Array.isArray(parsed)) {
        // Array of objects or arrays
        parsed.forEach(item => {
          if (Array.isArray(item)) {
            rows.push(item)
          } else if (typeof item === 'object') {
            rows.push([JSON.stringify(item)])
          }
        })
      } else if (typeof parsed === 'object') {
        // Single object - convert to key-value pairs
        Object.entries(parsed).forEach(([key, value]) => {
          rows.push([key, typeof value === 'object' ? JSON.stringify(value) : String(value)])
        })
      }
      
      return rows
    } catch (error) {
      console.error('JSON parsing failed:', error)
      return []
    }
  }

  /**
   * Detect if this is a tax report structure
   */
  private static detectTaxReportStructure(data: any[][]): boolean {
    const flatData = data.flat().join(' ').toLowerCase()
    
    // Check for tax report indicators
    const taxReportIndicators = [
      'vat_extraction_marker',
      'woocommerce_tax_report',
      'tax_summary',
      'country_summary',
      'period_summary',
      'vat_breakdown'
    ]
    
    return taxReportIndicators.some(indicator => flatData.includes(indicator))
  }

  /**
   * Process tax report data
   */
  private static processTaxReport(data: any[][], fileName: string, category: string): ExtractedVATData {
    console.log('   📊 Processing as tax report...')
    
    const salesVAT: number[] = []
    const purchaseVAT: number[] = []
    let totalAmount = 0
    let confidence = 0.9 // High confidence for structured tax reports
    
    // Look for VAT extraction markers
    data.forEach(row => {
      row.forEach(cell => {
        const cellStr = String(cell).toLowerCase()
        
        // WooCommerce VAT extraction marker
        if (cellStr.includes('vat_extraction_marker')) {
          const match = cellStr.match(/vat_extraction_marker[:\s]*([0-9,]+\.?[0-9]*)/i)
          if (match) {
            const amount = parseFloat(match[1].replace(/,/g, ''))
            if (!isNaN(amount) && amount > 0) {
              salesVAT.push(amount)
              confidence = 0.95
            }
          }
        }
        
        // Look for country breakdowns
        if (cellStr.includes('ireland') || cellStr.includes('ie')) {
          const match = cellStr.match(/([0-9,]+\.?[0-9]*)/g)
          if (match) {
            match.forEach(amountStr => {
              const amount = parseFloat(amountStr.replace(/,/g, ''))
              if (!isNaN(amount) && amount > 0 && amount < 1000000) {
                if (category?.toLowerCase().includes('purchase')) {
                  purchaseVAT.push(amount)
                } else {
                  salesVAT.push(amount)
                }
              }
            })
          }
        }
      })
    })
    
    // Calculate total from VAT amounts
    totalAmount = [...salesVAT, ...purchaseVAT].reduce((sum, amount) => sum + amount, 0)
    if (totalAmount > 0) {
      totalAmount = Math.round((totalAmount / 0.23) * 100) / 100 // Estimate from 23% VAT
    }

    return {
      salesVAT,
      purchaseVAT,
      totalAmount,
      vatRate: 23,
      confidence,
      extractedText: [data.flat().join(' ')],
      documentType: 'PURCHASE_RECEIPT',
      processingMethod: 'EXCEL_PARSER',
      processingTimeMs: 0,
      validationFlags: salesVAT.length === 0 && purchaseVAT.length === 0 ? ['NO_VAT_FOUND'] : [],
      irishVATCompliant: salesVAT.length > 0 || purchaseVAT.length > 0
    }
  }

  /**
   * Process regular invoice/receipt data
   */
  private static processInvoiceData(data: any[][], fileName: string, category: string): ExtractedVATData | null {
    console.log('   📄 Processing as invoice/receipt data...')
    
    const salesVAT: number[] = []
    const purchaseVAT: number[] = []
    let totalAmount = 0
    let vatNumber: string | undefined
    let businessName: string | undefined
    let invoiceDate: Date | undefined
    
    // Find headers to understand data structure
    const headers = data.length > 0 ? data[0] : []
    const headerMap = this.createHeaderMap(headers)
    
    // Process each row of data
    data.slice(1).forEach(row => {
      const vatAmount = this.extractVATFromRow(row, headerMap)
      const amount = this.extractAmountFromRow(row, headerMap)
      
      if (vatAmount > 0) {
        if (category?.toLowerCase().includes('purchase')) {
          purchaseVAT.push(vatAmount)
        } else {
          salesVAT.push(vatAmount)
        }
      }
      
      if (amount > 0) {
        totalAmount = Math.max(totalAmount, amount)
      }
      
      // Extract business details
      if (!vatNumber) {
        vatNumber = this.extractVATNumberFromRow(row, headerMap)
      }
      if (!businessName) {
        businessName = this.extractBusinessNameFromRow(row, headerMap)
      }
      if (!invoiceDate) {
        invoiceDate = this.extractDateFromRow(row, headerMap)
      }
    })

    // If no structured VAT found, try pattern matching on all data
    if (salesVAT.length === 0 && purchaseVAT.length === 0) {
      const allText = data.flat().join(' ')
      const patterns = this.getIrishVATPatterns()
      const matches = this.findVATAmountsInText(allText, patterns)
      
      matches.forEach(match => {
        if (category?.toLowerCase().includes('purchase')) {
          purchaseVAT.push(match.amount)
        } else {
          salesVAT.push(match.amount)
        }
      })
    }

    if (salesVAT.length === 0 && purchaseVAT.length === 0) {
      return null
    }

    // Calculate confidence based on data structure quality
    let confidence = 0.8 // Base confidence for structured data
    if (vatNumber) confidence += 0.1
    if (businessName) confidence += 0.05
    if (invoiceDate) confidence += 0.05

    return {
      salesVAT,
      purchaseVAT,
      totalAmount: totalAmount || this.calculateTotalAmount(salesVAT, purchaseVAT),
      vatRate: 23,
      confidence: Math.min(0.95, confidence),
      extractedText: [data.flat().join(' ')],
      documentType: this.determineDocumentType(data.flat().join(' '), fileName),
      vatNumber,
      invoiceDate: invoiceDate?.toISOString(),
      supplierName: businessName,
      processingMethod: 'EXCEL_PARSER',
      processingTimeMs: 0,
      validationFlags: this.getValidationFlags({ vatNumber, businessName, invoiceDate }, salesVAT, purchaseVAT),
      irishVATCompliant: this.isIrishVATCompliant(vatNumber, salesVAT, purchaseVAT)
    }
  }

  /**
   * Create mapping of headers to column indices
   */
  private static createHeaderMap(headers: string[]): Record<string, number> {
    const map: Record<string, number> = {}
    
    headers.forEach((header, index) => {
      const normalizedHeader = header.toLowerCase().trim()
      
      // Map common header patterns
      if (normalizedHeader.includes('vat') || normalizedHeader.includes('tax')) {
        map.vat = index
      }
      if (normalizedHeader.includes('total') || normalizedHeader.includes('amount')) {
        map.total = index
      }
      if (normalizedHeader.includes('date')) {
        map.date = index
      }
      if (normalizedHeader.includes('business') || normalizedHeader.includes('company') || normalizedHeader.includes('name')) {
        map.business = index
      }
      if (normalizedHeader.includes('vat number') || normalizedHeader.includes('tax id')) {
        map.vatNumber = index
      }
    })
    
    return map
  }

  /**
   * Extract VAT amount from a data row
   */
  private static extractVATFromRow(row: any[], headerMap: Record<string, number>): number {
    // Try mapped VAT column first
    if (headerMap.vat !== undefined && row[headerMap.vat]) {
      const amount = this.parseAmount(String(row[headerMap.vat]))
      if (amount > 0) return amount
    }
    
    // Search all columns for VAT-like values
    for (const cell of row) {
      const cellStr = String(cell).toLowerCase()
      if (cellStr.includes('vat') || cellStr.includes('tax')) {
        const amount = this.parseAmount(cellStr)
        if (amount > 0) return amount
      }
    }
    
    return 0
  }

  /**
   * Extract total amount from a data row
   */
  private static extractAmountFromRow(row: any[], headerMap: Record<string, number>): number {
    if (headerMap.total !== undefined && row[headerMap.total]) {
      return this.parseAmount(String(row[headerMap.total]))
    }
    
    // Find largest numeric value in row
    let maxAmount = 0
    for (const cell of row) {
      const amount = this.parseAmount(String(cell))
      if (amount > maxAmount) {
        maxAmount = amount
      }
    }
    
    return maxAmount
  }

  /**
   * Extract VAT number from a data row
   */
  private static extractVATNumberFromRow(row: any[], headerMap: Record<string, number>): string | undefined {
    if (headerMap.vatNumber !== undefined && row[headerMap.vatNumber]) {
      const value = String(row[headerMap.vatNumber]).trim()
      if (value.startsWith('IE')) return value
    }
    
    // Search all columns for VAT number pattern
    for (const cell of row) {
      const match = String(cell).match(/IE\s*([0-9]{7}[A-Z]{1,2})/i)
      if (match) {
        return 'IE' + match[1]
      }
    }
    
    return undefined
  }

  /**
   * Extract business name from a data row
   */
  private static extractBusinessNameFromRow(row: any[], headerMap: Record<string, number>): string | undefined {
    if (headerMap.business !== undefined && row[headerMap.business]) {
      const value = String(row[headerMap.business]).trim()
      if (value.length > 2 && !value.includes('€') && !value.match(/^\d+/)) {
        return value
      }
    }
    
    // Find first text-like field
    for (const cell of row) {
      const cellStr = String(cell).trim()
      if (cellStr.length > 3 && !cellStr.includes('€') && !cellStr.match(/^\d+/) && !cellStr.includes('/')) {
        return cellStr
      }
    }
    
    return undefined
  }

  /**
   * Extract date from a data row
   */
  private static extractDateFromRow(row: any[], headerMap: Record<string, number>): Date | undefined {
    if (headerMap.date !== undefined && row[headerMap.date]) {
      const date = this.parseDate(String(row[headerMap.date]))
      if (date) return date
    }
    
    // Search all columns for date patterns
    for (const cell of row) {
      const date = this.parseDate(String(cell))
      if (date) return date
    }
    
    return undefined
  }

  /**
   * Parse amount from string
   */
  private static parseAmount(str: string): number {
    // Remove currency symbols and spaces
    const cleaned = str.replace(/[€£$,\s]/g, '')
    const amount = parseFloat(cleaned)
    return isNaN(amount) ? 0 : amount
  }

  /**
   * Parse date from string
   */
  private static parseDate(str: string): Date | undefined {
    try {
      const dateMatch = str.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/)
      if (dateMatch) {
        const [, day, month, year] = dateMatch
        const fullYear = year.length === 2 ? `20${year}` : year
        return new Date(`${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)
      }
      
      // Try ISO format
      const isoMatch = str.match(/\d{4}-\d{2}-\d{2}/)
      if (isoMatch) {
        return new Date(isoMatch[0])
      }
    } catch (error) {
      // Date parsing failed
    }
    
    return undefined
  }

  /**
   * OCR + Pattern matching extraction method
   */
  private static async processWithOCRPatterns(
    fileData: string, 
    fileName: string, 
    category: string
  ): Promise<ExtractedVATData | null> {
    try {
      console.log('   📝 Processing with OCR pattern matching...')
      
      // For PDFs and images, we need to extract text first
      const extractedText = await this.extractTextFromDocument(fileData, fileName)
      if (!extractedText) {
        console.log('   ❌ No text extracted from document')
        return null
      }

      // Apply Irish VAT patterns to extracted text
      const irishPatterns = this.getIrishVATPatterns()
      const vatMatches = this.findVATAmountsInText(extractedText, irishPatterns)

      if (vatMatches.length === 0) {
        console.log('   📄 No VAT amounts found with pattern matching')
        return null
      }

      // Categorize VAT amounts based on context
      const { salesVAT, purchaseVAT } = this.categorizeVATAmounts(vatMatches, extractedText, category)
      
      // Calculate confidence based on pattern strength and context
      const confidence = this.calculatePatternConfidence(vatMatches, extractedText)
      
      // Extract additional business details
      const businessDetails = this.extractBusinessDetails(extractedText)
      const documentType = this.determineDocumentType(extractedText, fileName)

      const result: ExtractedVATData = {
        salesVAT,
        purchaseVAT,
        totalAmount: this.calculateTotalAmount(salesVAT, purchaseVAT),
        vatRate: this.extractVATRate(extractedText),
        confidence,
        extractedText: [extractedText],
        documentType,
        vatNumber: businessDetails.vatNumber,
        invoiceDate: businessDetails.invoiceDate?.toISOString(),
        supplierName: businessDetails.businessName,
        processingMethod: 'OCR_TEXT',
        processingTimeMs: 0, // Set by caller
        validationFlags: this.getValidationFlags(businessDetails, salesVAT, purchaseVAT),
        irishVATCompliant: this.isIrishVATCompliant(businessDetails.vatNumber, salesVAT, purchaseVAT)
      }

      console.log(`   ✅ OCR pattern matching found ${salesVAT.length} sales VAT + ${purchaseVAT.length} purchase VAT amounts`)
      return result

    } catch (error) {
      console.error('   ❌ OCR pattern matching failed:', error)
      return null
    }
  }

  /**
   * Extract text from document using OCR or text extraction
   */
  private static async extractTextFromDocument(fileData: string, fileName: string): Promise<string | null> {
    try {
      // For now, we'll assume the text is already extracted and available
      // In a full implementation, this would use:
      // - PDF.js for PDFs
      // - Tesseract.js for images
      // - Other OCR libraries
      
      // Check if fileData contains base64 encoded text or actual text
      if (fileData.length > 1000 && fileData.includes('\n')) {
        // Likely already extracted text
        return fileData
      }
      
      // For base64 PDFs, we'd decode and extract text
      // For now, return null to indicate OCR not available
      console.log('   📝 OCR text extraction not yet fully implemented')
      return null
      
    } catch (error) {
      console.error('Text extraction failed:', error)
      return null
    }
  }

  /**
   * Get Irish VAT extraction patterns
   */
  private static getIrishVATPatterns(): Array<{
    name: string
    pattern: RegExp
    confidence: number
  }> {
    return [
      // Standard VAT patterns
      {
        name: 'VAT_AMOUNT_EUR',
        pattern: /VAT[:\s]*€?\s*([0-9,]+\.?[0-9]*)/gi,
        confidence: 0.9
      },
      {
        name: 'VAT_PERCENTAGE',
        pattern: /VAT[:\s]*\(?([0-9]{1,2}\.?[0-9]*)%\)?[:\s]*€?\s*([0-9,]+\.?[0-9]*)/gi,
        confidence: 0.95
      },
      // Irish VAT categories
      {
        name: 'STD23_PATTERN',
        pattern: /STD23[:\s]*€?\s*([0-9,]+\.?[0-9]*)/gi,
        confidence: 0.98
      },
      {
        name: 'RED13_5_PATTERN',
        pattern: /RED13\.?5[:\s]*€?\s*([0-9,]+\.?[0-9]*)/gi,
        confidence: 0.98
      },
      {
        name: 'TOU9_PATTERN',
        pattern: /TOU9[:\s]*€?\s*([0-9,]+\.?[0-9]*)/gi,
        confidence: 0.98
      },
      {
        name: 'MIN_PATTERN',
        pattern: /MIN[:\s]*€?\s*([0-9,]+\.?[0-9]*)/gi,
        confidence: 0.95
      },
      // WooCommerce patterns
      {
        name: 'WOOCOMMERCE_MARKER',
        pattern: /VAT_EXTRACTION_MARKER[:\s]*([0-9,]+\.?[0-9]*)/gi,
        confidence: 0.99
      },
      // Tax summary patterns
      {
        name: 'TOTAL_VAT',
        pattern: /Total.*VAT[:\s]*€?\s*([0-9,]+\.?[0-9]*)/gi,
        confidence: 0.85
      },
      // Generic amount patterns (lower confidence)
      {
        name: 'CURRENCY_FIRST',
        pattern: /€\s*([0-9,]+\.?[0-9]*)[^\d]*VAT/gi,
        confidence: 0.7
      }
    ]
  }

  /**
   * Find VAT amounts in text using patterns
   */
  private static findVATAmountsInText(text: string, patterns: Array<{
    name: string
    pattern: RegExp
    confidence: number
  }>): Array<{
    amount: number
    pattern: string
    confidence: number
    context: string
  }> {
    const matches: Array<{
      amount: number
      pattern: string
      confidence: number
      context: string
    }> = []

    patterns.forEach(({ name, pattern, confidence }) => {
      let match
      while ((match = pattern.exec(text)) !== null) {
        const amountStr = match[1] || match[2] || match[0]
        const amount = parseFloat(amountStr.replace(/[,\s]/g, ''))
        
        if (!isNaN(amount) && amount > 0) {
          // Get context around the match
          const startIdx = Math.max(0, match.index - 50)
          const endIdx = Math.min(text.length, match.index + match[0].length + 50)
          const context = text.substring(startIdx, endIdx)
          
          matches.push({
            amount,
            pattern: name,
            confidence,
            context
          })
        }
      }
      // Reset regex lastIndex
      pattern.lastIndex = 0
    })

    // Sort by confidence and remove duplicates
    return this.deduplicateVATMatches(matches)
  }

  /**
   * Remove duplicate VAT matches
   */
  private static deduplicateVATMatches(matches: Array<{
    amount: number
    pattern: string
    confidence: number
    context: string
  }>): Array<{
    amount: number
    pattern: string
    confidence: number
    context: string
  }> {
    const uniqueMatches: typeof matches = []
    const seenAmounts = new Set<number>()
    
    // Sort by confidence (highest first)
    matches.sort((a, b) => b.confidence - a.confidence)
    
    matches.forEach(match => {
      // Consider amounts within €0.01 as duplicates
      const isDuplicate = Array.from(seenAmounts).some(amount => 
        Math.abs(amount - match.amount) < 0.01
      )
      
      if (!isDuplicate) {
        uniqueMatches.push(match)
        seenAmounts.add(match.amount)
      }
    })
    
    return uniqueMatches
  }

  /**
   * Categorize VAT amounts as sales or purchase VAT
   */
  private static categorizeVATAmounts(
    matches: Array<{ amount: number, pattern: string, confidence: number, context: string }>,
    fullText: string,
    category: string
  ): { salesVAT: number[], purchaseVAT: number[] } {
    const salesVAT: number[] = []
    const purchaseVAT: number[] = []
    
    // Default categorization based on document category
    const defaultToSales = category?.toUpperCase().includes('SALES') || category?.toUpperCase().includes('INVOICE')
    const defaultToPurchases = category?.toUpperCase().includes('PURCHASE') || category?.toUpperCase().includes('EXPENSE')
    
    matches.forEach(match => {
      // Check context for sales/purchase indicators
      const context = match.context.toLowerCase()
      const isSalesContext = context.includes('invoice') || context.includes('sales') || context.includes('charged')
      const isPurchaseContext = context.includes('purchase') || context.includes('expense') || context.includes('paid')
      
      if (isSalesContext || (defaultToSales && !isPurchaseContext)) {
        salesVAT.push(match.amount)
      } else if (isPurchaseContext || defaultToPurchases) {
        purchaseVAT.push(match.amount)
      } else {
        // Default behavior: smaller amounts usually purchases, larger sales
        if (match.amount < 100 || defaultToPurchases) {
          purchaseVAT.push(match.amount)
        } else {
          salesVAT.push(match.amount)
        }
      }
    })
    
    return { salesVAT, purchaseVAT }
  }

  /**
   * Calculate pattern matching confidence
   */
  private static calculatePatternConfidence(
    matches: Array<{ amount: number, pattern: string, confidence: number, context: string }>,
    text: string
  ): number {
    if (matches.length === 0) return 0
    
    // Base confidence from pattern strength
    const avgPatternConfidence = matches.reduce((sum, m) => sum + m.confidence, 0) / matches.length
    
    // Confidence boosts
    let confidenceBoost = 0
    
    // Boost for multiple consistent patterns
    if (matches.length > 1) confidenceBoost += 0.1
    
    // Boost for Irish VAT patterns
    const hasIrishPatterns = matches.some(m => 
      m.pattern.includes('STD23') || m.pattern.includes('RED13') || m.pattern.includes('TOU9')
    )
    if (hasIrishPatterns) confidenceBoost += 0.15
    
    // Boost for structured document indicators
    const hasStructure = text.includes('Total') || text.includes('Subtotal') || text.includes('Invoice')
    if (hasStructure) confidenceBoost += 0.05
    
    return Math.min(0.95, avgPatternConfidence + confidenceBoost)
  }

  /**
   * Extract business details from text
   */
  private static extractBusinessDetails(text: string): {
    businessName?: string
    vatNumber?: string
    invoiceDate?: Date
  } {
    const details: { businessName?: string, vatNumber?: string, invoiceDate?: Date } = {}
    
    // Extract VAT number (Irish format: IE + 7 digits + 1/2 letters)
    const vatRegex = /IE\s*([0-9]{7}[A-Z]{1,2})/gi
    const vatMatch = vatRegex.exec(text)
    if (vatMatch) {
      details.vatNumber = 'IE' + vatMatch[1]
    }
    
    // Extract business name (simple heuristic)
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    if (lines.length > 0) {
      // Usually the first substantial line is the business name
      details.businessName = lines.find(line => 
        line.length > 3 && 
        !line.includes('€') && 
        !line.match(/^\d+/) &&
        !line.toLowerCase().includes('invoice') &&
        !line.toLowerCase().includes('date')
      )
    }
    
    // Extract date (basic patterns)
    const dateRegex = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/g
    const dateMatch = dateRegex.exec(text)
    if (dateMatch) {
      try {
        const [, day, month, year] = dateMatch
        const fullYear = year.length === 2 ? `20${year}` : year
        details.invoiceDate = new Date(`${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)
      } catch (error) {
        // Date parsing failed, ignore
      }
    }
    
    return details
  }

  /**
   * Determine document type from text content
   */
  private static determineDocumentType(text: string, fileName: string): ExtractedVATData['documentType'] {
    const lowerText = text.toLowerCase()
    const lowerFileName = fileName.toLowerCase()
    
    if (lowerText.includes('invoice') || lowerFileName.includes('invoice')) {
      return lowerText.includes('credit') ? 'PURCHASE_INVOICE' : 'SALES_INVOICE'
    }
    
    if (lowerText.includes('receipt') || lowerFileName.includes('receipt')) {
      return 'SALES_RECEIPT'
    }
    
    if (lowerText.includes('statement') || lowerFileName.includes('statement')) {
      return 'PURCHASE_RECEIPT'
    }
    
    if (lowerText.includes('report') || lowerFileName.includes('report')) {
      return 'PURCHASE_RECEIPT'
    }
    
    return 'OTHER'
  }

  /**
   * Calculate total amount from VAT amounts
   */
  private static calculateTotalAmount(salesVAT: number[], purchaseVAT: number[]): number {
    const totalVAT = [...salesVAT, ...purchaseVAT].reduce((sum, amount) => sum + amount, 0)
    // Estimate total by assuming 23% VAT rate (most common in Ireland)
    return totalVAT > 0 ? Math.round((totalVAT / 0.23) * 100) / 100 : 0
  }

  /**
   * Extract VAT rate from text
   */
  private static extractVATRate(text: string): number {
    const rateRegex = /(\d{1,2}\.?\d*)%/g
    let match
    const rates: number[] = []
    
    while ((match = rateRegex.exec(text)) !== null) {
      const rate = parseFloat(match[1])
      if (rate >= 5 && rate <= 30) { // Reasonable VAT rate range
        rates.push(rate)
      }
    }
    
    if (rates.length === 0) return 23 // Default Irish standard rate
    
    // Return most common rate
    const rateCounts = rates.reduce((acc, rate) => {
      acc[rate] = (acc[rate] || 0) + 1
      return acc
    }, {} as Record<number, number>)
    
    return Object.keys(rateCounts).reduce((a, b) => 
      rateCounts[a] > rateCounts[b] ? a : b
    ) as any
  }

  /**
   * Get validation flags based on extracted data
   */
  private static getValidationFlags(
    businessDetails: { businessName?: string, vatNumber?: string, invoiceDate?: Date },
    salesVAT: number[],
    purchaseVAT: number[]
  ): string[] {
    const flags: string[] = []
    
    if (!businessDetails.vatNumber) flags.push('MISSING_VAT_NUMBER')
    if (!businessDetails.vatNumber?.startsWith('IE')) flags.push('NON_IRISH_VAT')
    if (salesVAT.length === 0 && purchaseVAT.length === 0) flags.push('NO_VAT_FOUND')
    if (!businessDetails.invoiceDate) flags.push('MISSING_DATE')
    
    return flags
  }

  /**
   * Check Irish VAT compliance
   */
  private static isIrishVATCompliant(
    vatNumber?: string,
    salesVAT: number[] = [],
    purchaseVAT: number[] = []
  ): boolean {
    // Basic compliance checks
    const hasIrishVAT = vatNumber?.startsWith('IE')
    const hasVATAmounts = salesVAT.length > 0 || purchaseVAT.length > 0
    
    return hasIrishVAT && hasVATAmounts
  }

  /**
   * Map EnhancedVATData document type to ExtractedVATData document type
   */
  private static mapDocumentType(enhancedType: string): ExtractedVATData['documentType'] {
    switch (enhancedType) {
      case 'INVOICE':
        return 'SALES_INVOICE'
      case 'RECEIPT':
        return 'SALES_RECEIPT'
      case 'CREDIT_NOTE':
        return 'PURCHASE_INVOICE'
      case 'STATEMENT':
        return 'PURCHASE_RECEIPT'
      default:
        return 'OTHER'
    }
  }
}

// MultiModelValidator is already exported as a class above