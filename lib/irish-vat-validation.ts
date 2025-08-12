/**
 * Irish VAT Number Validation and Compliance Utilities
 * Provides validation functions for Irish VAT compliance
 */

export interface IrishVATValidationResult {
  isValid: boolean
  vatNumber?: string
  errors: string[]
  warnings: string[]
  complianceLevel: 'COMPLIANT' | 'WARNING' | 'NON_COMPLIANT'
  recommendations: string[]
}

export interface VATComplianceCheck {
  documentType: string
  vatAmounts: number[]
  vatRates: number[]
  totalAmount?: number
  supplierVATNumber?: string
  invoiceDate?: string
  currency: string
}

/**
 * Validate Irish VAT number format
 * Format: IE + 7 digits + 1-2 letters
 * Examples: IE1234567T, IE1234567AB
 */
export function validateIrishVATNumber(vatNumber: string): IrishVATValidationResult {
  const result: IrishVATValidationResult = {
    isValid: false,
    errors: [],
    warnings: [],
    complianceLevel: 'NON_COMPLIANT',
    recommendations: []
  }

  if (!vatNumber) {
    result.errors.push('VAT number is required')
    result.recommendations.push('Ensure all invoices include a valid Irish VAT number')
    return result
  }

  // Clean the VAT number (remove spaces, convert to uppercase)
  const cleanVATNumber = vatNumber.replace(/\s/g, '').toUpperCase()
  result.vatNumber = cleanVATNumber

  // Check Irish VAT number format: IE + 7 digits + 1-2 letters
  const irishVATPattern = /^IE[0-9]{7}[A-Z]{1,2}$/
  
  if (!irishVATPattern.test(cleanVATNumber)) {
    result.errors.push('Invalid Irish VAT number format')
    result.recommendations.push('Irish VAT numbers must follow format: IE1234567T (IE + 7 digits + 1-2 letters)')
    
    // Provide more specific guidance
    if (!cleanVATNumber.startsWith('IE')) {
      result.recommendations.push('Irish VAT numbers must start with "IE"')
    }
    
    const numberPart = cleanVATNumber.substring(2)
    if (numberPart.length < 8 || numberPart.length > 9) {
      result.recommendations.push('Irish VAT numbers must have 7 digits followed by 1-2 letters after "IE"')
    }
    
    return result
  }

  // Additional validation: check for common patterns that might be invalid
  const digits = cleanVATNumber.substring(2, 9)
  const letters = cleanVATNumber.substring(9)
  
  // Warn about suspicious patterns
  if (digits === '0000000') {
    result.warnings.push('VAT number appears to contain placeholder digits')
    result.complianceLevel = 'WARNING'
  }
  
  if (digits === '1234567') {
    result.warnings.push('VAT number appears to be an example/test number')
    result.complianceLevel = 'WARNING'
  }

  result.isValid = true
  result.complianceLevel = result.warnings.length > 0 ? 'WARNING' : 'COMPLIANT'
  
  if (result.complianceLevel === 'COMPLIANT') {
    result.recommendations.push('VAT number format is valid for Irish compliance')
  }

  return result
}

/**
 * Validate VAT rates for Irish compliance
 * Irish VAT rates: 0% (zero-rated), 13.5% (reduced), 23% (standard)
 */
export function validateIrishVATRates(vatRates: number[]): {
  validRates: number[]
  invalidRates: number[]
  warnings: string[]
} {
  const validIrishRates = [0, 13.5, 23]
  const validRates: number[] = []
  const invalidRates: number[] = []
  const warnings: string[] = []

  for (const rate of vatRates) {
    if (validIrishRates.includes(rate)) {
      validRates.push(rate)
    } else {
      invalidRates.push(rate)
      // Check if it's close to a valid rate (might be rounding error)
      if (Math.abs(rate - 13.5) < 0.5) {
        warnings.push(`VAT rate ${rate}% is close to Irish reduced rate 13.5% - check for rounding errors`)
      } else if (Math.abs(rate - 23) < 0.5) {
        warnings.push(`VAT rate ${rate}% is close to Irish standard rate 23% - check for rounding errors`)
      } else {
        warnings.push(`VAT rate ${rate}% is not a standard Irish VAT rate`)
      }
    }
  }

  return { validRates, invalidRates, warnings }
}

/**
 * Comprehensive Irish VAT compliance check
 */
export function checkIrishVATCompliance(check: VATComplianceCheck): IrishVATValidationResult {
  const result: IrishVATValidationResult = {
    isValid: false,
    errors: [],
    warnings: [],
    complianceLevel: 'NON_COMPLIANT',
    recommendations: []
  }

  // Check currency - should be EUR for Irish businesses
  if (check.currency !== 'EUR') {
    result.warnings.push(`Currency is ${check.currency}, but Irish businesses typically use EUR`)
    result.recommendations.push('Ensure foreign currency transactions are properly converted to EUR for VAT reporting')
  }

  // Validate VAT amounts
  if (!check.vatAmounts || check.vatAmounts.length === 0) {
    result.errors.push('No VAT amounts found in document')
    result.recommendations.push('Ensure all VAT-applicable transactions show clear VAT amounts')
    return result
  }

  // Check for negative VAT amounts (unusual but possible for credit notes)
  const negativeAmounts = check.vatAmounts.filter(amt => amt < 0)
  if (negativeAmounts.length > 0) {
    if (check.documentType.toLowerCase().includes('credit')) {
      result.warnings.push('Negative VAT amounts detected - appropriate for credit note')
    } else {
      result.warnings.push('Negative VAT amounts detected - verify document type')
      result.recommendations.push('Check if this should be classified as a credit note or refund')
    }
  }

  // Validate VAT rates if provided
  if (check.vatRates && check.vatRates.length > 0) {
    const rateValidation = validateIrishVATRates(check.vatRates)
    result.warnings.push(...rateValidation.warnings)
    
    if (rateValidation.invalidRates.length > 0) {
      result.errors.push(`Non-standard Irish VAT rates detected: ${rateValidation.invalidRates.join(', ')}%`)
    }
  }

  // Validate supplier VAT number if provided
  if (check.supplierVATNumber) {
    const vatValidation = validateIrishVATNumber(check.supplierVATNumber)
    if (!vatValidation.isValid) {
      result.errors.push(...vatValidation.errors)
      result.warnings.push(...vatValidation.warnings)
      result.recommendations.push(...vatValidation.recommendations)
    }
    result.vatNumber = vatValidation.vatNumber
  }

  // Check invoice date validity
  if (check.invoiceDate) {
    const invoiceDate = new Date(check.invoiceDate)
    const now = new Date()
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
    const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days from now

    if (invoiceDate < oneYearAgo) {
      result.warnings.push('Invoice date is more than one year old')
      result.recommendations.push('Verify that historical invoices are still within VAT reporting period')
    }

    if (invoiceDate > futureDate) {
      result.errors.push('Invoice date appears to be in the future')
      result.recommendations.push('Check invoice date format and validity')
    }
  }

  // Calculate compliance level
  if (result.errors.length === 0) {
    result.isValid = true
    result.complianceLevel = result.warnings.length > 0 ? 'WARNING' : 'COMPLIANT'
    
    if (result.complianceLevel === 'COMPLIANT') {
      result.recommendations.push('Document meets Irish VAT compliance requirements')
    } else {
      result.recommendations.push('Document is valid but has warnings - review recommended')
    }
  } else {
    result.recommendations.push('Address compliance errors before submitting VAT return')
  }

  return result
}

/**
 * Calculate VAT amount validation
 */
export function validateVATCalculation(
  netAmount: number, 
  vatRate: number, 
  expectedVATAmount: number
): {
  isCorrect: boolean
  calculatedVAT: number
  difference: number
  tolerance: number
} {
  const calculatedVAT = Math.round((netAmount * vatRate / 100) * 100) / 100
  const difference = Math.abs(calculatedVAT - expectedVATAmount)
  const tolerance = 0.02 // 2 cent tolerance for rounding

  return {
    isCorrect: difference <= tolerance,
    calculatedVAT,
    difference,
    tolerance
  }
}

/**
 * Irish VAT period validation
 */
export function validateVATPeriod(periodStart: Date, periodEnd: Date): {
  isValid: boolean
  periodType: 'MONTHLY' | 'BI_MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'UNKNOWN'
  warnings: string[]
} {
  const warnings: string[] = []
  
  const diffTime = Math.abs(periodEnd.getTime() - periodStart.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  let periodType: 'MONTHLY' | 'BI_MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'UNKNOWN' = 'UNKNOWN'
  let isValid = false

  if (diffDays >= 28 && diffDays <= 31) {
    periodType = 'MONTHLY'
    isValid = true
  } else if (diffDays >= 59 && diffDays <= 62) {
    periodType = 'BI_MONTHLY'
    isValid = true
    warnings.push('Bi-monthly VAT returns are standard for most Irish businesses')
  } else if (diffDays >= 89 && diffDays <= 92) {
    periodType = 'QUARTERLY'
    isValid = true
    warnings.push('Quarterly VAT returns require Revenue approval for most businesses')
  } else if (diffDays >= 365 && diffDays <= 366) {
    periodType = 'ANNUAL'
    isValid = true
    warnings.push('Annual VAT returns are only available for qualifying small businesses')
  } else {
    warnings.push(`Unusual VAT period length: ${diffDays} days`)
  }

  return { isValid, periodType, warnings }
}