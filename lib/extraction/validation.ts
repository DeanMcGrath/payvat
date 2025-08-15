/**
 * VAT Extraction Validation System
 * Ensures extracted VAT data is accurate, compliant, and mathematically consistent
 * CRITICAL for preventing incorrect submissions to Revenue
 */

import { IRISH_VAT_RATES, validateIrishVATNumber } from './irish-documents'
import { logWarn, logError } from '@/lib/secure-logger'

export interface ValidationResult {
  isValid: boolean
  confidence: number
  errors: ValidationError[]
  warnings: ValidationWarning[]
  suggestions: string[]
  correctedData?: {
    salesVAT: number[]
    purchaseVAT: number[]
    corrections: string[]
  }
}

export interface ValidationError {
  code: string
  message: string
  field: string
  severity: 'HIGH' | 'MEDIUM' | 'LOW'
}

export interface ValidationWarning {
  code: string
  message: string
  field: string
  recommendation: string
}

export interface VATData {
  salesVAT: number[]
  purchaseVAT: number[]
  vatRates?: number[]
  totalAmount?: number
  vatNumber?: string
  documentType?: string
  period?: {
    start: Date
    end: Date
  }
}

/**
 * Comprehensive VAT data validation
 */
export function validateVATExtraction(data: VATData, context?: any): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []
  const suggestions: string[] = []

  // 1. Basic data validation
  validateBasicData(data, errors, warnings)

  // 2. Irish VAT rate validation
  validateVATRates(data, errors, warnings)

  // 3. Mathematical consistency
  validateMathematicalConsistency(data, errors, warnings)

  // 4. Business logic validation
  validateBusinessLogic(data, errors, warnings, suggestions)

  // 5. Compliance validation
  validateCompliance(data, errors, warnings)

  // 6. Cross-validation with document context
  if (context) {
    validateDocumentContext(data, context, warnings, suggestions)
  }

  // Calculate overall confidence
  const confidence = calculateConfidence(data, errors, warnings)

  // Generate suggestions
  generateSuggestions(data, errors, warnings, suggestions)

  // Attempt auto-correction for common issues
  const correctedData = attemptAutoCorrection(data, errors)

  return {
    isValid: errors.filter(e => e.severity === 'HIGH').length === 0,
    confidence,
    errors,
    warnings,
    suggestions,
    correctedData
  }
}

/**
 * Validate basic data integrity
 */
function validateBasicData(data: VATData, errors: ValidationError[], warnings: ValidationWarning[]) {
  // Check for null/undefined values
  if (!data.salesVAT && !data.purchaseVAT) {
    errors.push({
      code: 'NO_VAT_DATA',
      message: 'No VAT data provided',
      field: 'vatData',
      severity: 'HIGH'
    })
    return
  }

  // Validate array structure
  if (data.salesVAT && !Array.isArray(data.salesVAT)) {
    errors.push({
      code: 'INVALID_SALES_VAT_FORMAT',
      message: 'Sales VAT must be an array',
      field: 'salesVAT',
      severity: 'HIGH'
    })
  }

  if (data.purchaseVAT && !Array.isArray(data.purchaseVAT)) {
    errors.push({
      code: 'INVALID_PURCHASE_VAT_FORMAT',
      message: 'Purchase VAT must be an array',
      field: 'purchaseVAT',
      severity: 'HIGH'
    })
  }

  // Check for negative values
  const allVAT = [...(data.salesVAT || []), ...(data.purchaseVAT || [])]
  const negativeValues = allVAT.filter(val => val < 0)
  if (negativeValues.length > 0) {
    errors.push({
      code: 'NEGATIVE_VAT_VALUES',
      message: `Negative VAT values detected: ${negativeValues.join(', ')}`,
      field: 'vatAmounts',
      severity: 'HIGH'
    })
  }

  // Check for unreasonably large values (> €100,000)
  const largeValues = allVAT.filter(val => val > 100000)
  if (largeValues.length > 0) {
    warnings.push({
      code: 'LARGE_VAT_VALUES',
      message: `Unusually large VAT values: €${largeValues.join(', €')}`,
      field: 'vatAmounts',
      recommendation: 'Verify these amounts are correct'
    })
  }

  // Check for very small values (< €0.01)
  const smallValues = allVAT.filter(val => val > 0 && val < 0.01)
  if (smallValues.length > 0) {
    warnings.push({
      code: 'SMALL_VAT_VALUES',
      message: `Very small VAT values: €${smallValues.join(', €')}`,
      field: 'vatAmounts',
      recommendation: 'Check if these are correctly extracted'
    })
  }
}

/**
 * Validate VAT rates against Irish standards
 */
function validateVATRates(data: VATData, errors: ValidationError[], warnings: ValidationWarning[]) {
  if (!data.vatRates || data.vatRates.length === 0) {
    warnings.push({
      code: 'NO_VAT_RATES',
      message: 'No VAT rates specified',
      field: 'vatRates',
      recommendation: 'Consider extracting VAT rates for better validation'
    })
    return
  }

  const validIrishRates = IRISH_VAT_RATES.map(r => r.rate)
  const invalidRates = data.vatRates.filter(rate => !validIrishRates.includes(rate))

  if (invalidRates.length > 0) {
    errors.push({
      code: 'INVALID_IRISH_VAT_RATES',
      message: `Invalid Irish VAT rates: ${invalidRates.join(', ')}%`,
      field: 'vatRates',
      severity: 'MEDIUM'
    })
  }

  // Check for common rate mistakes
  data.vatRates.forEach(rate => {
    if (rate === 20) {
      warnings.push({
        code: 'UK_VAT_RATE_DETECTED',
        message: 'UK VAT rate (20%) detected - Irish standard rate is 23%',
        field: 'vatRates',
        recommendation: 'Verify this is not a UK document'
      })
    }
    if (rate === 25) {
      warnings.push({
        code: 'NORDIC_VAT_RATE_DETECTED',
        message: 'Nordic VAT rate (25%) detected - Irish standard rate is 23%',
        field: 'vatRates',
        recommendation: 'Verify this is an Irish document'
      })
    }
  })
}

/**
 * Validate mathematical consistency
 */
function validateMathematicalConsistency(data: VATData, errors: ValidationError[], warnings: ValidationWarning[]) {
  // Check if totals make sense
  const totalSalesVAT = (data.salesVAT || []).reduce((sum, val) => sum + val, 0)
  const totalPurchaseVAT = (data.purchaseVAT || []).reduce((sum, val) => sum + val, 0)

  // Validate against document total if provided
  if (data.totalAmount && data.vatRates) {
    const calculatedVAT = data.vatRates.map(rate => data.totalAmount! * (rate / 100))
    const extractedVAT = [...(data.salesVAT || []), ...(data.purchaseVAT || [])]
    
    // Allow 5% variance for calculation differences
    const variance = Math.abs(
      calculatedVAT.reduce((sum, val) => sum + val, 0) - 
      extractedVAT.reduce((sum, val) => sum + val, 0)
    )
    
    if (variance > (data.totalAmount * 0.05)) {
      warnings.push({
        code: 'VAT_CALCULATION_MISMATCH',
        message: 'Extracted VAT amounts do not match calculated VAT',
        field: 'vatAmounts',
        recommendation: 'Verify VAT calculation is correct'
      })
    }
  }

  // Check for duplicate values (common extraction error)
  const allVAT = [...(data.salesVAT || []), ...(data.purchaseVAT || [])]
  const duplicates = allVAT.filter((val, index) => allVAT.indexOf(val) !== index)
  if (duplicates.length > 0) {
    warnings.push({
      code: 'DUPLICATE_VAT_VALUES',
      message: `Duplicate VAT values detected: €${[...new Set(duplicates)].join(', €')}`,
      field: 'vatAmounts',
      recommendation: 'Check if values were extracted multiple times'
    })
  }

  // Validate reasonable VAT proportions
  if (data.totalAmount) {
    const totalVAT = totalSalesVAT + totalPurchaseVAT
    const vatPercentage = (totalVAT / data.totalAmount) * 100

    if (vatPercentage > 30) {
      warnings.push({
        code: 'HIGH_VAT_PERCENTAGE',
        message: `VAT represents ${vatPercentage.toFixed(1)}% of total amount`,
        field: 'vatAmounts',
        recommendation: 'Verify this is correct - usually VAT is 0-25% of total'
      })
    }
  }
}

/**
 * Validate business logic rules
 */
function validateBusinessLogic(data: VATData, errors: ValidationError[], warnings: ValidationWarning[], suggestions: string[]) {
  const totalSalesVAT = (data.salesVAT || []).reduce((sum, val) => sum + val, 0)
  const totalPurchaseVAT = (data.purchaseVAT || []).reduce((sum, val) => sum + val, 0)

  // Both sales and purchase VAT in same document (unusual)
  if (totalSalesVAT > 0 && totalPurchaseVAT > 0) {
    warnings.push({
      code: 'MIXED_VAT_DOCUMENT',
      message: 'Document contains both sales and purchase VAT',
      field: 'documentType',
      recommendation: 'Verify document type and VAT categorization'
    })
  }

  // No VAT detected
  if (totalSalesVAT === 0 && totalPurchaseVAT === 0) {
    errors.push({
      code: 'NO_VAT_DETECTED',
      message: 'No VAT amounts detected in document',
      field: 'vatAmounts',
      severity: 'MEDIUM'
    })
    suggestions.push('Check if document is VAT exempt or if extraction failed')
  }

  // Validate VAT number format if provided
  if (data.vatNumber && !validateIrishVATNumber(data.vatNumber)) {
    errors.push({
      code: 'INVALID_VAT_NUMBER_FORMAT',
      message: `Invalid Irish VAT number format: ${data.vatNumber}`,
      field: 'vatNumber',
      severity: 'MEDIUM'
    })
  }

  // Check for round numbers (may indicate estimation)
  const roundNumbers = [...(data.salesVAT || []), ...(data.purchaseVAT || [])]
    .filter(val => val % 1 === 0 && val > 100) // Whole numbers over €100

  if (roundNumbers.length > 0) {
    warnings.push({
      code: 'ROUND_VAT_VALUES',
      message: 'VAT amounts appear to be round numbers',
      field: 'vatAmounts',
      recommendation: 'Verify these are exact amounts, not estimates'
    })
  }
}

/**
 * Validate compliance with Irish VAT regulations
 */
function validateCompliance(data: VATData, errors: ValidationError[], warnings: ValidationWarning[]) {
  // Check minimum VAT registration threshold (€37,500 in 12 months)
  const totalVAT = [...(data.salesVAT || []), ...(data.purchaseVAT || [])].reduce((sum, val) => sum + val, 0)
  
  if (data.period && totalVAT > 0) {
    const monthsDiff = getMonthsDifference(data.period.start, data.period.end)
    const annualizedVAT = (totalVAT / monthsDiff) * 12

    if (annualizedVAT > 37500 && !data.vatNumber) {
      warnings.push({
        code: 'VAT_REGISTRATION_REQUIRED',
        message: 'VAT amounts suggest registration threshold exceeded',
        field: 'vatNumber',
        recommendation: 'Business may need VAT registration'
      })
    }
  }

  // Check for reverse charge indicators
  if (data.documentType === 'PURCHASE_INVOICE') {
    // Look for international suppliers (simplified check)
    if (data.vatNumber && !data.vatNumber.startsWith('IE')) {
      warnings.push({
        code: 'POTENTIAL_REVERSE_CHARGE',
        message: 'International supplier detected',
        field: 'vatNumber',
        recommendation: 'Check if reverse charge VAT applies'
      })
    }
  }
}

/**
 * Validate against document context
 */
function validateDocumentContext(data: VATData, context: any, warnings: ValidationWarning[], suggestions: string[]) {
  // Check if document category matches VAT data
  if (context.category === 'SALES_INVOICE' && (!data.salesVAT || data.salesVAT.length === 0)) {
    warnings.push({
      code: 'CATEGORY_VAT_MISMATCH',
      message: 'Sales invoice but no sales VAT detected',
      field: 'category',
      recommendation: 'Verify document category or VAT extraction'
    })
  }

  if (context.category === 'PURCHASE_INVOICE' && (!data.purchaseVAT || data.purchaseVAT.length === 0)) {
    warnings.push({
      code: 'CATEGORY_VAT_MISMATCH',
      message: 'Purchase invoice but no purchase VAT detected',
      field: 'category',
      recommendation: 'Verify document category or VAT extraction'
    })
  }

  // Check file name for clues
  if (context.fileName) {
    const fileName = context.fileName.toLowerCase()
    if (fileName.includes('credit') && data.salesVAT && data.salesVAT.some(val => val > 0)) {
      warnings.push({
        code: 'CREDIT_NOTE_WITH_POSITIVE_VAT',
        message: 'Credit note with positive VAT amounts',
        field: 'vatAmounts',
        recommendation: 'Credit notes typically have negative VAT amounts'
      })
    }
  }
}

/**
 * Calculate confidence score based on validation results
 */
function calculateConfidence(data: VATData, errors: ValidationError[], warnings: ValidationWarning[]): number {
  let confidence = 0.8 // Base confidence

  // Reduce confidence for errors
  const highSeverityErrors = errors.filter(e => e.severity === 'HIGH').length
  const mediumSeverityErrors = errors.filter(e => e.severity === 'MEDIUM').length
  
  confidence -= (highSeverityErrors * 0.3) + (mediumSeverityErrors * 0.15)

  // Reduce confidence for warnings
  confidence -= warnings.length * 0.05

  // Increase confidence for complete data
  if (data.vatRates && data.vatRates.length > 0) confidence += 0.1
  if (data.vatNumber && validateIrishVATNumber(data.vatNumber)) confidence += 0.1
  if (data.totalAmount && data.totalAmount > 0) confidence += 0.05

  return Math.max(0, Math.min(1, confidence))
}

/**
 * Generate actionable suggestions
 */
function generateSuggestions(data: VATData, errors: ValidationError[], warnings: ValidationWarning[], suggestions: string[]) {
  if (errors.length > 0) {
    suggestions.push('Review and correct validation errors before submission')
  }

  if (warnings.length > 0) {
    suggestions.push('Consider reviewing warnings to improve accuracy')
  }

  const totalVAT = [...(data.salesVAT || []), ...(data.purchaseVAT || [])].reduce((sum, val) => sum + val, 0)
  
  if (totalVAT === 0) {
    suggestions.push('If document should contain VAT, try re-uploading with better quality')
  }

  if (!data.vatNumber) {
    suggestions.push('Include VAT number if available for better validation')
  }
}

/**
 * Attempt automatic correction of common issues
 */
function attemptAutoCorrection(data: VATData, errors: ValidationError[]): any {
  const corrections: string[] = []
  let correctedSalesVAT = [...(data.salesVAT || [])]
  let correctedPurchaseVAT = [...(data.purchaseVAT || [])]

  // Remove duplicate values
  const uniqueSalesVAT = [...new Set(correctedSalesVAT)]
  const uniquePurchaseVAT = [...new Set(correctedPurchaseVAT)]

  if (uniqueSalesVAT.length !== correctedSalesVAT.length) {
    correctedSalesVAT = uniqueSalesVAT
    corrections.push('Removed duplicate sales VAT values')
  }

  if (uniquePurchaseVAT.length !== correctedPurchaseVAT.length) {
    correctedPurchaseVAT = uniquePurchaseVAT
    corrections.push('Removed duplicate purchase VAT values')
  }

  // Remove zero values
  correctedSalesVAT = correctedSalesVAT.filter(val => val > 0)
  correctedPurchaseVAT = correctedPurchaseVAT.filter(val => val > 0)

  if (corrections.length > 0) {
    return {
      salesVAT: correctedSalesVAT,
      purchaseVAT: correctedPurchaseVAT,
      corrections
    }
  }

  return undefined
}

/**
 * Helper function to calculate months difference
 */
function getMonthsDifference(start: Date, end: Date): number {
  return ((end.getFullYear() - start.getFullYear()) * 12) + (end.getMonth() - start.getMonth())
}

/**
 * Quick validation for frontend use
 */
export function quickValidateVAT(salesVAT: number[], purchaseVAT: number[]): {
  isValid: boolean
  message: string
} {
  const allVAT = [...salesVAT, ...purchaseVAT]
  
  if (allVAT.length === 0) {
    return { isValid: false, message: 'No VAT amounts provided' }
  }

  if (allVAT.some(val => val < 0)) {
    return { isValid: false, message: 'VAT amounts cannot be negative' }
  }

  if (allVAT.some(val => val > 100000)) {
    return { isValid: false, message: 'VAT amounts seem unusually large' }
  }

  return { isValid: true, message: 'VAT amounts appear valid' }
}