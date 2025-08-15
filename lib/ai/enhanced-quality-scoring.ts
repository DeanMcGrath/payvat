/**
 * Enhanced Quality Scoring System for Irish VAT Documents
 * Provides comprehensive quality assessment with Irish VAT compliance checks
 */

import { ExtractedVATData } from '../documentProcessor'

export interface QualityAssessment {
  overallScore: number // 0-100
  confidenceBoost: number // Factor to apply to base confidence (0.8-1.2)
  irishVATCompliant: boolean
  qualityFactors: {
    vatAmountQuality: number // 0-100
    documentStructure: number // 0-100
    irishVATCompliance: number // 0-100
    extractionReliability: number // 0-100
    dataConsistency: number // 0-100
  }
  issues: QualityIssue[]
  recommendations: string[]
}

export interface QualityIssue {
  severity: 'low' | 'medium' | 'high' | 'critical'
  type: string
  message: string
  impact: number // 0-100 (impact on quality score)
}

export class EnhancedQualityScorer {
  
  /**
   * Assess overall document quality and Irish VAT compliance
   */
  static assessDocumentQuality(
    extractedData: ExtractedVATData,
    processingInfo?: any
  ): QualityAssessment {
    const issues: QualityIssue[] = []
    const recommendations: string[] = []
    let qualityFactors = {
      vatAmountQuality: 0,
      documentStructure: 0,
      irishVATCompliance: 0,
      extractionReliability: 0,
      dataConsistency: 0
    }

    // 1. VAT Amount Quality Assessment (30% weight)
    qualityFactors.vatAmountQuality = this.assessVATAmountQuality(extractedData, issues, recommendations)
    
    // 2. Document Structure Quality (20% weight)
    qualityFactors.documentStructure = this.assessDocumentStructure(extractedData, processingInfo, issues)
    
    // 3. Irish VAT Compliance (25% weight)
    qualityFactors.irishVATCompliance = this.assessIrishVATCompliance(extractedData, issues, recommendations)
    
    // 4. Extraction Reliability (15% weight)
    qualityFactors.extractionReliability = this.assessExtractionReliability(processingInfo, issues)
    
    // 5. Data Consistency (10% weight)
    qualityFactors.dataConsistency = this.assessDataConsistency(extractedData, issues)

    // Calculate weighted overall score
    const overallScore = Math.round(
      qualityFactors.vatAmountQuality * 0.30 +
      qualityFactors.documentStructure * 0.20 +
      qualityFactors.irishVATCompliance * 0.25 +
      qualityFactors.extractionReliability * 0.15 +
      qualityFactors.dataConsistency * 0.10
    )

    // Determine Irish VAT compliance (requires 70+ score in compliance and no critical issues)
    const irishVATCompliant = qualityFactors.irishVATCompliance >= 70 && 
                              !issues.some(issue => issue.severity === 'critical')

    // Calculate confidence boost factor based on quality
    const confidenceBoost = this.calculateConfidenceBoost(overallScore, issues)

    return {
      overallScore: Math.max(0, Math.min(100, overallScore)),
      confidenceBoost,
      irishVATCompliant,
      qualityFactors,
      issues,
      recommendations
    }
  }

  /**
   * Assess VAT amount quality (reasonable values, proper formatting)
   */
  private static assessVATAmountQuality(
    data: ExtractedVATData,
    issues: QualityIssue[],
    recommendations: string[]
  ): number {
    let score = 100
    const allVAT = [...data.salesVAT, ...data.purchaseVAT]

    if (allVAT.length === 0) {
      issues.push({
        severity: 'critical',
        type: 'NO_VAT_FOUND',
        message: 'No VAT amounts detected in document',
        impact: 60
      })
      return 10 // Very low quality if no VAT found
    }

    // Check for reasonable VAT amounts
    allVAT.forEach((amount, index) => {
      if (amount < 0) {
        issues.push({
          severity: 'critical',
          type: 'NEGATIVE_VAT',
          message: `Negative VAT amount detected: €${amount}`,
          impact: 30
        })
        score -= 30
      } else if (amount === 0) {
        issues.push({
          severity: 'low',
          type: 'ZERO_VAT',
          message: 'Zero VAT amount found (acceptable for exempt items)',
          impact: 5
        })
        score -= 5
      } else if (amount > 0 && amount < 0.01) {
        issues.push({
          severity: 'medium',
          type: 'VERY_SMALL_VAT',
          message: `Very small VAT amount: €${amount.toFixed(4)}`,
          impact: 10
        })
        score -= 10
      } else if (amount > 50000) {
        issues.push({
          severity: 'medium',
          type: 'VERY_LARGE_VAT',
          message: `Very large VAT amount: €${amount.toFixed(2)} - please verify`,
          impact: 15
        })
        score -= 15
      }

      // Check for proper decimal formatting
      if (amount > 0) {
        const decimalPlaces = (amount.toString().split('.')[1] || '').length
        if (decimalPlaces > 2) {
          issues.push({
            severity: 'low',
            type: 'PRECISION_ISSUE',
            message: `VAT amount has unusual precision: €${amount}`,
            impact: 3
          })
          score -= 3
        }
      }
    })

    // Check for potential duplicates (double counting)
    const uniqueAmounts = [...new Set(allVAT)]
    if (uniqueAmounts.length < allVAT.length) {
      issues.push({
        severity: 'high',
        type: 'DUPLICATE_VAT',
        message: 'Potential duplicate VAT amounts detected',
        impact: 20
      })
      recommendations.push('Review document for double-counting of VAT amounts')
      score -= 20
    }

    return Math.max(0, Math.min(100, score))
  }

  /**
   * Assess document structure quality
   */
  private static assessDocumentStructure(
    data: ExtractedVATData,
    processingInfo: any,
    issues: QualityIssue[]
  ): number {
    let score = 100

    // Check if we have document type classification
    if (!data.documentType || data.documentType === 'OTHER') {
      issues.push({
        severity: 'medium',
        type: 'UNKNOWN_DOCUMENT_TYPE',
        message: 'Document type could not be determined',
        impact: 15
      })
      score -= 15
    }

    // Check for business details
    if (!data.businessDetails?.businessName) {
      issues.push({
        severity: 'low',
        type: 'NO_BUSINESS_NAME',
        message: 'Business name not detected',
        impact: 10
      })
      score -= 10
    }

    if (!data.businessDetails?.vatNumber) {
      issues.push({
        severity: 'medium',
        type: 'NO_VAT_NUMBER',
        message: 'VAT number not detected',
        impact: 15
      })
      score -= 15
    }

    // Check for transaction details
    if (!data.transactionData?.date) {
      issues.push({
        severity: 'low',
        type: 'NO_DATE',
        message: 'Transaction date not detected',
        impact: 8
      })
      score -= 8
    }

    // Quality boost for enhanced processing
    if (processingInfo?.engine === 'enhanced') {
      score += 10
    }

    return Math.max(0, Math.min(100, score))
  }

  /**
   * Assess Irish VAT compliance
   */
  private static assessIrishVATCompliance(
    data: ExtractedVATData,
    issues: QualityIssue[],
    recommendations: string[]
  ): number {
    let score = 100
    const allVAT = [...data.salesVAT, ...data.purchaseVAT]

    // Irish VAT rates: 0%, 9%, 13.5%, 23%
    const validIrishVATRates = [0, 0.09, 0.135, 0.23]

    // Check if VAT amounts align with typical Irish VAT calculations
    if (allVAT.length > 0 && data.vatData?.lineItems) {
      data.vatData.lineItems.forEach((item: any, index: number) => {
        if (item.vatRate) {
          const declaredRate = item.vatRate / 100
          const isValidIrishRate = validIrishVATRates.some(rate => Math.abs(rate - declaredRate) < 0.001)
          
          if (!isValidIrishRate) {
            issues.push({
              severity: 'high',
              type: 'INVALID_IRISH_VAT_RATE',
              message: `Non-standard Irish VAT rate detected: ${item.vatRate}%`,
              impact: 25
            })
            score -= 25
          }
        }
      })
    }

    // Check VAT number format (Irish format starts with IE)
    if (data.businessDetails?.vatNumber) {
      const vatNumber = data.businessDetails.vatNumber.toUpperCase()
      if (!vatNumber.startsWith('IE')) {
        issues.push({
          severity: 'medium',
          type: 'NON_IRISH_VAT_NUMBER',
          message: 'VAT number format suggests non-Irish entity',
          impact: 15
        })
        score -= 15
      } else {
        // Validate Irish VAT number format (IE followed by 7 digits and 1-2 letters)
        const irishVATPattern = /^IE[0-9]{7}[A-Z]{1,2}$/
        if (!irishVATPattern.test(vatNumber)) {
          issues.push({
            severity: 'low',
            type: 'IRISH_VAT_FORMAT_WARNING',
            message: 'VAT number format may be incomplete or non-standard',
            impact: 8
          })
          score -= 8
        }
      }
    }

    // Check currency (should be EUR for Irish documents)
    if (data.transactionData?.currency && data.transactionData.currency !== 'EUR') {
      issues.push({
        severity: 'medium',
        type: 'NON_EUR_CURRENCY',
        message: `Non-Euro currency detected: ${data.transactionData.currency}`,
        impact: 20
      })
      recommendations.push('Verify currency conversion if applicable for Irish VAT')
      score -= 20
    }

    return Math.max(0, Math.min(100, score))
  }

  /**
   * Assess extraction reliability based on processing method and confidence
   */
  private static assessExtractionReliability(
    processingInfo: any,
    issues: QualityIssue[]
  ): number {
    let score = 50 // Base score

    if (!processingInfo) return score

    // Boost for better extraction methods
    switch (processingInfo.engine) {
      case 'enhanced':
        score = 95
        break
      case 'AI_VISION':
        score = 85
        break
      case 'EXCEL_PARSER':
        score = 80
        break
      case 'OCR_TEXT':
        score = 65
        break
      default:
        score = 50
        break
    }

    // Adjust based on processing quality score
    if (processingInfo.qualityScore) {
      score = Math.max(score, processingInfo.qualityScore)
    }

    // Penalties for processing issues
    if (processingInfo.validationFlags?.includes('PROCESSING_FAILED')) {
      issues.push({
        severity: 'critical',
        type: 'PROCESSING_FAILED',
        message: 'Document processing encountered errors',
        impact: 40
      })
      score -= 40
    }

    if (processingInfo.validationFlags?.includes('FALLBACK_PROCESSING_USED')) {
      issues.push({
        severity: 'medium',
        type: 'FALLBACK_PROCESSING',
        message: 'Fallback processing method used',
        impact: 20
      })
      score -= 20
    }

    return Math.max(0, Math.min(100, score))
  }

  /**
   * Assess data consistency across different fields
   */
  private static assessDataConsistency(
    data: ExtractedVATData,
    issues: QualityIssue[]
  ): number {
    let score = 100

    // Check if totals are consistent
    if (data.vatData?.grandTotal && data.vatData?.subtotal && data.vatData?.totalVatAmount) {
      const calculatedTotal = data.vatData.subtotal + data.vatData.totalVatAmount
      const difference = Math.abs(calculatedTotal - data.vatData.grandTotal)
      
      if (difference > 0.01) {
        issues.push({
          severity: 'high',
          type: 'TOTAL_MISMATCH',
          message: `Total amount mismatch: expected €${calculatedTotal.toFixed(2)}, found €${data.vatData.grandTotal.toFixed(2)}`,
          impact: 25
        })
        score -= 25
      }
    }

    // Check if VAT amounts match line items
    if (data.vatData?.lineItems?.length > 0) {
      const lineItemVATTotal = data.vatData.lineItems.reduce((sum: number, item: any) => {
        return sum + (item.vatAmount || 0)
      }, 0)
      
      const extractedVATTotal = [...data.salesVAT, ...data.purchaseVAT].reduce((sum, amount) => sum + amount, 0)
      const difference = Math.abs(lineItemVATTotal - extractedVATTotal)
      
      if (difference > 1.00) { // Allow €1 tolerance for rounding
        issues.push({
          severity: 'medium',
          type: 'VAT_LINE_ITEM_MISMATCH',
          message: `VAT total from line items (€${lineItemVATTotal.toFixed(2)}) differs from extracted total (€${extractedVATTotal.toFixed(2)})`,
          impact: 15
        })
        score -= 15
      }
    }

    return Math.max(0, Math.min(100, score))
  }

  /**
   * Calculate confidence boost factor based on quality assessment
   */
  private static calculateConfidenceBoost(overallScore: number, issues: QualityIssue[]): number {
    let boost = 1.0 // Neutral boost

    // Base boost from overall score
    if (overallScore >= 90) {
      boost = 1.15 // 15% boost for excellent quality
    } else if (overallScore >= 80) {
      boost = 1.10 // 10% boost for good quality
    } else if (overallScore >= 70) {
      boost = 1.05 // 5% boost for acceptable quality
    } else if (overallScore < 50) {
      boost = 0.85 // 15% penalty for poor quality
    } else if (overallScore < 30) {
      boost = 0.70 // 30% penalty for very poor quality
    }

    // Additional penalties for critical issues
    const criticalIssues = issues.filter(issue => issue.severity === 'critical')
    if (criticalIssues.length > 0) {
      boost *= (1 - criticalIssues.length * 0.1) // 10% penalty per critical issue
    }

    // Ensure boost is within reasonable bounds
    return Math.max(0.5, Math.min(1.3, boost))
  }
}

export { EnhancedQualityScorer as QualityScorer }