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
      methodResults.push({
        method: 'AI_VISION',
        result: aiResult,
        confidence: aiResult.confidence,
        weight: 1.0, // Highest weight for AI Vision
        processingTime: Date.now() - startTime,
        quality: this.assessMethodQuality(aiResult, 'AI_VISION')
      })
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
    const bestResult = this.selectBestResult(methodResults, agreementScore)
    
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

    // Compare business names
    const businessNames = results.map(r => r.result.businessDetails?.businessName).filter(Boolean)
    if (businessNames.length > 1) {
      const uniqueNames = [...new Set(businessNames)]
      agreements += uniqueNames.length === 1 ? 1 : 0.5
      comparisons += 1
    }

    // Compare VAT numbers
    const vatNumbers = results.map(r => r.result.businessDetails?.vatNumber).filter(Boolean)
    if (vatNumbers.length > 1) {
      const uniqueVATNumbers = [...new Set(vatNumbers)]
      agreements += uniqueVATNumbers.length === 1 ? 1 : 0.3
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

    const uniqueTypes = [...new Set(documentTypes)]
    return { agreement: uniqueTypes.length === 1 ? 1.0 : 0.6 }
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

    if (result.businessDetails?.businessName) quality += 5
    if (result.businessDetails?.vatNumber) quality += 10
    if (result.documentType && result.documentType !== 'OTHER') quality += 5

    return Math.min(100, quality)
  }

  /**
   * Placeholder for structured parser (would integrate with Excel processor)
   */
  private static async processWithStructuredParser(
    fileData: string, 
    fileName: string, 
    category: string
  ): Promise<ExtractedVATData | null> {
    // This would integrate with the existing Excel/CSV processor
    // For now, return null to indicate not implemented
    console.log('   📝 Structured parser not yet integrated')
    return null
  }

  /**
   * Placeholder for OCR + pattern matching
   */
  private static async processWithOCRPatterns(
    fileData: string, 
    fileName: string, 
    category: string
  ): Promise<ExtractedVATData | null> {
    // This would implement OCR + regex pattern matching
    // For now, return null to indicate not implemented
    console.log('   📝 OCR pattern matching not yet integrated')
    return null
  }
}

// MultiModelValidator is already exported as a class above