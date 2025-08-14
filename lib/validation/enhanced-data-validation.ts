/**
 * Enhanced Data Validation and Cross-Validation System
 * Ensures data quality and accuracy across different extraction methods
 */

import { ExtractedVATData } from '../documentProcessor'

// Validation result interfaces
export interface ValidationResult {
  isValid: boolean
  confidence: number
  issues: ValidationIssue[]
  recommendations: string[]
  dataQualityScore: number
}

export interface ValidationIssue {
  type: 'ERROR' | 'WARNING' | 'INFO'
  code: string
  message: string
  field?: string
  actualValue?: any
  expectedRange?: { min?: number, max?: number }
  severity: number // 1-10, 10 being most severe
}

export interface CrossValidationResult {
  agreement: number // 0-1, how much methods agree
  primaryResult: ExtractedVATData
  alternativeResults: ExtractedVATData[]
  conflictResolution: 'PRIMARY' | 'CONSENSUS' | 'WEIGHTED_AVERAGE' | 'MANUAL_REVIEW'
  confidence: number
  details: {
    methodComparison: Array<{
      method: string
      vatAmounts: number[]
      confidence: number
      weight: number
    }>
    statisticalAnalysis: {
      mean: number
      median: number
      standardDeviation: number
      outliers: number[]
    }
  }
}

// Irish VAT compliance validator
export class IrishVATValidator {
  private static readonly IRISH_VAT_RATES = [0, 9, 13.5, 23]
  private static readonly MAX_REASONABLE_VAT = 100000 // €100,000
  private static readonly MIN_REASONABLE_VAT = 0.01 // €0.01

  static validateVATAmounts(amounts: number[]): ValidationResult {
    const issues: ValidationIssue[] = []
    const recommendations: string[] = []
    let confidence = 1.0

    // Check for empty amounts
    if (!amounts || amounts.length === 0) {
      issues.push({
        type: 'ERROR',
        code: 'NO_VAT_AMOUNTS',
        message: 'No VAT amounts found in document',
        severity: 9
      })
      confidence = 0.1
    }

    // Validate each amount
    for (let i = 0; i < amounts.length; i++) {
      const amount = amounts[i]

      // Check if amount is a valid number
      if (typeof amount !== 'number' || isNaN(amount)) {
        issues.push({
          type: 'ERROR',
          code: 'INVALID_AMOUNT_FORMAT',
          message: `Invalid VAT amount format: ${amount}`,
          actualValue: amount,
          severity: 8
        })
        confidence -= 0.2
        continue
      }

      // Check for negative amounts
      if (amount < 0) {
        issues.push({
          type: 'ERROR',
          code: 'NEGATIVE_VAT_AMOUNT',
          message: `Negative VAT amount not allowed: €${amount}`,
          actualValue: amount,
          severity: 8
        })
        confidence -= 0.15
      }

      // Check for unreasonably small amounts
      if (amount > 0 && amount < this.MIN_REASONABLE_VAT) {
        issues.push({
          type: 'WARNING',
          code: 'VERY_SMALL_VAT_AMOUNT',
          message: `Very small VAT amount: €${amount}. Please verify.`,
          actualValue: amount,
          expectedRange: { min: this.MIN_REASONABLE_VAT },
          severity: 4
        })
        confidence -= 0.05
      }

      // Check for unreasonably large amounts
      if (amount > this.MAX_REASONABLE_VAT) {
        issues.push({
          type: 'WARNING',
          code: 'VERY_LARGE_VAT_AMOUNT',
          message: `Very large VAT amount: €${amount}. Please verify.`,
          actualValue: amount,
          expectedRange: { max: this.MAX_REASONABLE_VAT },
          severity: 6
        })
        confidence -= 0.1
      }

      // Check for common rounding issues
      if (amount % 0.01 !== 0) {
        issues.push({
          type: 'WARNING',
          code: 'PRECISION_ISSUE',
          message: `VAT amount has unusual precision: €${amount}`,
          actualValue: amount,
          severity: 2
        })
        confidence -= 0.02
      }
    }

    // Check for duplicate amounts (potential double-counting)
    const uniqueAmounts = [...new Set(amounts)]
    if (uniqueAmounts.length !== amounts.length) {
      const duplicates = amounts.filter((amount, index) => amounts.indexOf(amount) !== index)
      issues.push({
        type: 'WARNING',
        code: 'DUPLICATE_VAT_AMOUNTS',
        message: `Possible double-counting detected: €${duplicates.join(', €')}`,
        actualValue: duplicates,
        severity: 7
      })
      recommendations.push('Review document for potential double-counting of VAT amounts')
      confidence -= 0.15
    }

    // Statistical analysis for outliers
    if (amounts.length > 3) {
      const stats = this.calculateStatistics(amounts)
      const outliers = this.detectOutliers(amounts, stats)
      
      if (outliers.length > 0) {
        issues.push({
          type: 'INFO',
          code: 'STATISTICAL_OUTLIERS',
          message: `Statistical outliers detected: €${outliers.join(', €')}`,
          actualValue: outliers,
          severity: 3
        })
        recommendations.push('Review outlier amounts for accuracy')
      }
    }

    const dataQualityScore = Math.max(0, Math.min(100, confidence * 100))

    return {
      isValid: issues.filter(i => i.type === 'ERROR').length === 0,
      confidence: Math.max(0.1, Math.min(1.0, confidence)),
      issues,
      recommendations,
      dataQualityScore
    }
  }

  static validateVATRate(rate?: number): ValidationResult {
    const issues: ValidationIssue[] = []
    const recommendations: string[] = []
    let confidence = 1.0

    if (rate === undefined || rate === null) {
      issues.push({
        type: 'INFO',
        code: 'MISSING_VAT_RATE',
        message: 'VAT rate not specified',
        severity: 2
      })
      return {
        isValid: true,
        confidence: 0.7,
        issues,
        recommendations,
        dataQualityScore: 70
      }
    }

    if (!this.IRISH_VAT_RATES.includes(rate)) {
      issues.push({
        type: 'WARNING',
        code: 'NON_STANDARD_VAT_RATE',
        message: `VAT rate ${rate}% is not a standard Irish VAT rate`,
        actualValue: rate,
        expectedRange: { min: 0, max: 23 },
        severity: 5
      })
      recommendations.push(`Standard Irish VAT rates are: ${this.IRISH_VAT_RATES.join('%, ')}%`)
      confidence -= 0.2
    }

    return {
      isValid: rate >= 0 && rate <= 100,
      confidence,
      issues,
      recommendations,
      dataQualityScore: confidence * 100
    }
  }

  static validateTotalAmount(vatAmounts: number[], totalAmount?: number): ValidationResult {
    const issues: ValidationIssue[] = []
    const recommendations: string[] = []
    let confidence = 1.0

    if (!totalAmount) {
      issues.push({
        type: 'INFO',
        code: 'MISSING_TOTAL_AMOUNT',
        message: 'Total amount not provided',
        severity: 2
      })
      return {
        isValid: true,
        confidence: 0.8,
        issues,
        recommendations,
        dataQualityScore: 80
      }
    }

    const vatSum = vatAmounts.reduce((sum, amount) => sum + amount, 0)
    const expectedNetAmount = totalAmount - vatSum

    if (expectedNetAmount < 0) {
      issues.push({
        type: 'ERROR',
        code: 'VAT_EXCEEDS_TOTAL',
        message: `VAT amount (€${vatSum.toFixed(2)}) exceeds total amount (€${totalAmount.toFixed(2)})`,
        actualValue: { vat: vatSum, total: totalAmount },
        severity: 9
      })
      confidence = 0.2
    } else if (expectedNetAmount < vatSum * 0.1) {
      // Net amount is less than 10% of VAT - unusual
      issues.push({
        type: 'WARNING',
        code: 'UNUSUAL_VAT_TO_NET_RATIO',
        message: `Unusual ratio: VAT (€${vatSum.toFixed(2)}) is very high compared to net (€${expectedNetAmount.toFixed(2)})`,
        actualValue: { vatPercentage: (vatSum / totalAmount * 100).toFixed(1) + '%' },
        severity: 6
      })
      recommendations.push('Verify VAT calculation and total amount')
      confidence -= 0.15
    }

    return {
      isValid: issues.filter(i => i.type === 'ERROR').length === 0,
      confidence,
      issues,
      recommendations,
      dataQualityScore: confidence * 100
    }
  }

  private static calculateStatistics(amounts: number[]) {
    const sorted = [...amounts].sort((a, b) => a - b)
    const sum = amounts.reduce((a, b) => a + b, 0)
    const mean = sum / amounts.length
    const median = sorted.length % 2 === 0 
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)]
    
    const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - mean, 2), 0) / amounts.length
    const standardDeviation = Math.sqrt(variance)

    return { mean, median, standardDeviation }
  }

  private static detectOutliers(amounts: number[], stats: { mean: number, standardDeviation: number }): number[] {
    const threshold = 2 // 2 standard deviations
    return amounts.filter(amount => 
      Math.abs(amount - stats.mean) > threshold * stats.standardDeviation
    )
  }
}

// Cross-validation engine
export class CrossValidationEngine {
  static async validateMultipleExtractions(
    results: ExtractedVATData[],
    weights?: number[]
  ): Promise<CrossValidationResult> {
    if (results.length < 2) {
      throw new Error('Cross-validation requires at least 2 extraction results')
    }

    const methodWeights = weights || this.calculateMethodWeights(results)
    const methodComparison = this.compareExtractionMethods(results, methodWeights)
    const statisticalAnalysis = this.performStatisticalAnalysis(results)
    
    // Calculate agreement between methods
    const agreement = this.calculateAgreement(results)
    
    // Determine best result using weighted consensus
    const primaryResult = this.selectPrimaryResult(results, methodWeights, agreement)
    
    // Determine conflict resolution strategy
    const conflictResolution = this.determineConflictResolution(agreement, results)
    
    // Calculate overall confidence
    const confidence = this.calculateCrossValidationConfidence(
      results, 
      agreement, 
      statisticalAnalysis
    )

    return {
      agreement,
      primaryResult,
      alternativeResults: results.filter(r => r !== primaryResult),
      conflictResolution,
      confidence,
      details: {
        methodComparison,
        statisticalAnalysis
      }
    }
  }

  private static calculateMethodWeights(results: ExtractedVATData[]): number[] {
    return results.map(result => {
      let weight = result.confidence || 0.5

      // Boost weight based on processing method reliability
      switch (result.processingMethod) {
        case 'AI_VISION':
          weight += 0.2
          break
        case 'EXCEL_PARSER':
          weight += 0.15
          break
        case 'OCR_TEXT':
          weight += 0.1
          break
        case 'FALLBACK':
          weight -= 0.2
          break
      }

      // Boost weight for Irish VAT compliance
      if (result.irishVATCompliant) {
        weight += 0.1
      }

      // Boost weight for high validation scores
      if (result.validationFlags && !result.validationFlags.some(flag => 
        flag.includes('ERROR') || flag.includes('FAILED')
      )) {
        weight += 0.05
      }

      return Math.max(0.1, Math.min(1.0, weight))
    })
  }

  private static compareExtractionMethods(
    results: ExtractedVATData[], 
    weights: number[]
  ) {
    return results.map((result, index) => ({
      method: result.processingMethod,
      vatAmounts: [...result.salesVAT, ...result.purchaseVAT],
      confidence: result.confidence,
      weight: weights[index]
    }))
  }

  private static performStatisticalAnalysis(results: ExtractedVATData[]) {
    const allAmounts = results.flatMap(r => [...r.salesVAT, ...r.purchaseVAT])
    
    if (allAmounts.length === 0) {
      return {
        mean: 0,
        median: 0,
        standardDeviation: 0,
        outliers: []
      }
    }

    const sorted = [...allAmounts].sort((a, b) => a - b)
    const sum = allAmounts.reduce((a, b) => a + b, 0)
    const mean = sum / allAmounts.length
    const median = sorted.length % 2 === 0 
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)]
    
    const variance = allAmounts.reduce((sum, amount) => sum + Math.pow(amount - mean, 2), 0) / allAmounts.length
    const standardDeviation = Math.sqrt(variance)

    const outliers = allAmounts.filter(amount => 
      Math.abs(amount - mean) > 2 * standardDeviation
    )

    return { mean, median, standardDeviation, outliers }
  }

  private static calculateAgreement(results: ExtractedVATData[]): number {
    if (results.length < 2) return 1.0

    const allAmounts = results.map(r => [...r.salesVAT, ...r.purchaseVAT])
    let agreements = 0
    let comparisons = 0

    // Compare each pair of results
    for (let i = 0; i < results.length; i++) {
      for (let j = i + 1; j < results.length; j++) {
        const amounts1 = allAmounts[i]
        const amounts2 = allAmounts[j]
        
        // Check if amounts are similar (within 5% or €1, whichever is larger)
        for (const amount1 of amounts1) {
          for (const amount2 of amounts2) {
            const tolerance = Math.max(1, Math.max(amount1, amount2) * 0.05)
            if (Math.abs(amount1 - amount2) <= tolerance) {
              agreements++
            }
            comparisons++
          }
        }
      }
    }

    return comparisons > 0 ? agreements / comparisons : 0
  }

  private static selectPrimaryResult(
    results: ExtractedVATData[], 
    weights: number[], 
    agreement: number
  ): ExtractedVATData {
    // If high agreement, select highest weighted result
    if (agreement > 0.8) {
      const maxWeightIndex = weights.indexOf(Math.max(...weights))
      return results[maxWeightIndex]
    }

    // If low agreement, prefer AI_VISION if available and confident
    const aiResult = results.find(r => 
      r.processingMethod === 'AI_VISION' && r.confidence > 0.7
    )
    if (aiResult) return aiResult

    // Otherwise, select highest confidence result
    const maxConfidenceIndex = results.findIndex(r => 
      r.confidence === Math.max(...results.map(res => res.confidence))
    )
    return results[maxConfidenceIndex]
  }

  private static determineConflictResolution(
    agreement: number, 
    results: ExtractedVATData[]
  ): CrossValidationResult['conflictResolution'] {
    if (agreement > 0.9) return 'CONSENSUS'
    if (agreement > 0.7) return 'WEIGHTED_AVERAGE'
    if (agreement > 0.4) return 'PRIMARY'
    return 'MANUAL_REVIEW'
  }

  private static calculateCrossValidationConfidence(
    results: ExtractedVATData[],
    agreement: number,
    stats: { standardDeviation: number }
  ): number {
    let confidence = 0.5 // Base confidence

    // Boost for high agreement
    confidence += agreement * 0.3

    // Boost for low variance (consistent results)
    if (stats.standardDeviation < 5) confidence += 0.1
    if (stats.standardDeviation < 1) confidence += 0.1

    // Boost for multiple high-confidence methods
    const highConfidenceMethods = results.filter(r => r.confidence > 0.8).length
    confidence += Math.min(0.2, highConfidenceMethods * 0.05)

    // Boost for AI + Excel combination
    const hasAI = results.some(r => r.processingMethod === 'AI_VISION')
    const hasExcel = results.some(r => r.processingMethod === 'EXCEL_PARSER')
    if (hasAI && hasExcel) confidence += 0.1

    return Math.max(0.1, Math.min(0.98, confidence))
  }
}

// Data quality assessor
export class DataQualityAssessor {
  static assessOverallQuality(data: ExtractedVATData): {
    score: number
    grade: 'A' | 'B' | 'C' | 'D' | 'F'
    issues: ValidationIssue[]
    recommendations: string[]
  } {
    const allAmounts = [...data.salesVAT, ...data.purchaseVAT]
    const issues: ValidationIssue[] = []
    const recommendations: string[] = []
    
    let score = 100 // Start with perfect score

    // Validate VAT amounts
    const vatValidation = IrishVATValidator.validateVATAmounts(allAmounts)
    issues.push(...vatValidation.issues)
    recommendations.push(...vatValidation.recommendations)
    score -= (100 - vatValidation.dataQualityScore) * 0.4 // 40% weight

    // Validate VAT rate
    const rateValidation = IrishVATValidator.validateVATRate(data.vatRate)
    issues.push(...rateValidation.issues)
    recommendations.push(...rateValidation.recommendations)
    score -= (100 - rateValidation.dataQualityScore) * 0.2 // 20% weight

    // Validate total amount consistency
    const totalValidation = IrishVATValidator.validateTotalAmount(allAmounts, data.totalAmount)
    issues.push(...totalValidation.issues)
    recommendations.push(...totalValidation.recommendations)
    score -= (100 - totalValidation.dataQualityScore) * 0.2 // 20% weight

    // Assess confidence score
    const confidenceScore = (data.confidence || 0) * 100
    score -= (100 - confidenceScore) * 0.1 // 10% weight

    // Assess processing method reliability
    const methodReliability = this.getMethodReliabilityScore(data.processingMethod)
    score -= (100 - methodReliability) * 0.1 // 10% weight

    // Ensure score is within bounds
    score = Math.max(0, Math.min(100, score))

    // Determine grade
    let grade: 'A' | 'B' | 'C' | 'D' | 'F'
    if (score >= 90) grade = 'A'
    else if (score >= 80) grade = 'B'
    else if (score >= 70) grade = 'C'
    else if (score >= 60) grade = 'D'
    else grade = 'F'

    return { score, grade, issues, recommendations }
  }

  private static getMethodReliabilityScore(method: string): number {
    switch (method) {
      case 'AI_VISION': return 95
      case 'EXCEL_PARSER': return 90
      case 'OCR_TEXT': return 75
      case 'FALLBACK': return 50
      default: return 60
    }
  }
}

// Export validation utilities
export {
  IrishVATValidator as VATValidator,
  CrossValidationEngine,
  DataQualityAssessor
}