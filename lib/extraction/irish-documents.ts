/**
 * Irish Document Specialization
 * Handles specific Irish VAT document formats and compliance requirements
 * Supports Revenue forms, Irish invoices, bank statements, and e-commerce exports
 */

import { logInfo, logWarn } from '@/lib/secure-logger'

export interface IrishVATRate {
  rate: number
  category: string
  description: string
}

export const IRISH_VAT_RATES: IrishVATRate[] = [
  { rate: 23, category: 'STANDARD', description: 'Standard rate' },
  { rate: 13.5, category: 'REDUCED', description: 'Reduced rate (fuel, building services, etc.)' },
  { rate: 9, category: 'TOURISM', description: 'Tourism and hospitality' },
  { rate: 4.8, category: 'LIVESTOCK', description: 'Livestock and certain agricultural products' },
  { rate: 0, category: 'EXEMPT', description: 'Exempt supplies' }
]

export interface IrishDocumentPattern {
  name: string
  type: 'REVENUE_FORM' | 'INVOICE' | 'RECEIPT' | 'BANK_STATEMENT' | 'ECOMMERCE'
  patterns: RegExp[]
  vatExtractor: (text: string) => { amounts: number[], rates: number[], confidence: number }
  validator: (text: string) => { isValid: boolean, issues: string[] }
}

/**
 * Irish Revenue Forms (VAT3, Form 11, etc.)
 */
export const REVENUE_FORM_PATTERNS: IrishDocumentPattern = {
  name: 'Irish Revenue Forms',
  type: 'REVENUE_FORM',
  patterns: [
    /revenue\.ie/i,
    /vat\s*3/i,
    /form\s*11/i,
    /vat\s*registration\s*number/i,
    /ie\s*[0-9]{7}[a-z]{1,2}/i // Irish VAT number format
  ],
  vatExtractor: (text: string) => {
    const amounts: number[] = []
    const rates: number[] = []
    let confidence = 0.9 // High confidence for official forms

    // Extract from standard Revenue form fields
    const revenuePatterns = [
      /box\s*t1.*?€?([0-9,]+\.?[0-9]*)/gi, // VAT3 Box T1
      /box\s*t2.*?€?([0-9,]+\.?[0-9]*)/gi, // VAT3 Box T2
      /box\s*t3.*?€?([0-9,]+\.?[0-9]*)/gi, // VAT3 Box T3
      /box\s*t4.*?€?([0-9,]+\.?[0-9]*)/gi, // VAT3 Box T4
      /vat\s*due.*?€?([0-9,]+\.?[0-9]*)/gi,
      /vat\s*reclaim.*?€?([0-9,]+\.?[0-9]*)/gi
    ]

    for (const pattern of revenuePatterns) {
      const matches = [...text.matchAll(pattern)]
      for (const match of matches) {
        const amount = parseFloat(match[1].replace(',', ''))
        if (amount > 0) {
          amounts.push(amount)
        }
      }
    }

    return { amounts, rates, confidence }
  },
  validator: (text: string) => {
    const issues: string[] = []
    let isValid = true

    // Check for Irish VAT number
    if (!text.match(/ie\s*[0-9]{7}[a-z]{1,2}/i)) {
      issues.push('No Irish VAT number found')
      isValid = false
    }

    return { isValid, issues }
  }
}

/**
 * Irish Invoice Patterns
 */
export const IRISH_INVOICE_PATTERNS: IrishDocumentPattern = {
  name: 'Irish Invoices',
  type: 'INVOICE',
  patterns: [
    /invoice/i,
    /bill\s*to/i,
    /vat\s*number/i,
    /dublin|cork|galway|limerick|waterford/i, // Irish cities
    /ireland|éire/i
  ],
  vatExtractor: (text: string) => {
    const amounts: number[] = []
    const rates: number[] = []
    let confidence = 0.7

    // Irish VAT patterns with rates
    const patterns = [
      /vat\s*@?\s*(23|13\.5|9|4\.8)%.*?€?([0-9,]+\.?[0-9]*)/gi,
      /(23|13\.5|9|4\.8)%\s*vat.*?€?([0-9,]+\.?[0-9]*)/gi,
      /vat.*?€?([0-9,]+\.?[0-9]*)/gi
    ]

    for (const pattern of patterns) {
      const matches = [...text.matchAll(pattern)]
      for (const match of matches) {
        if (match[2]) {
          // Has rate and amount
          const rate = parseFloat(match[1])
          const amount = parseFloat(match[2].replace(',', ''))
          if (IRISH_VAT_RATES.some(r => r.rate === rate)) {
            amounts.push(amount)
            rates.push(rate)
            confidence = 0.8
          }
        } else if (match[1]) {
          // Just amount
          const amount = parseFloat(match[1].replace(',', ''))
          amounts.push(amount)
        }
      }
    }

    return { amounts, rates, confidence }
  },
  validator: (text: string) => {
    const issues: string[] = []
    let isValid = true

    // Check for required Irish invoice elements
    if (!text.match(/invoice/i)) {
      issues.push('Document not clearly identified as invoice')
    }

    if (!text.match(/vat/i)) {
      issues.push('No VAT information found')
      isValid = false
    }

    return { isValid, issues }
  }
}

/**
 * Irish Bank Statement Patterns
 */
export const BANK_STATEMENT_PATTERNS: IrishDocumentPattern = {
  name: 'Irish Bank Statements',
  type: 'BANK_STATEMENT',
  patterns: [
    /bank\s*statement/i,
    /account\s*statement/i,
    /aib|bank\s*of\s*ireland|permanent\s*tsb|ulster\s*bank/i,
    /iban\s*ie/i // Irish IBAN
  ],
  vatExtractor: (text: string) => {
    const amounts: number[] = []
    const rates: number[] = []
    let confidence = 0.5 // Lower confidence for bank statements

    // Look for VAT payments to Revenue
    const revenuePatterns = [
      /revenue.*?vat.*?€?([0-9,]+\.?[0-9]*)/gi,
      /vat.*?payment.*?€?([0-9,]+\.?[0-9]*)/gi,
      /collector.*?general.*?€?([0-9,]+\.?[0-9]*)/gi // Revenue Commissioners
    ]

    for (const pattern of revenuePatterns) {
      const matches = [...text.matchAll(pattern)]
      for (const match of matches) {
        const amount = parseFloat(match[1].replace(',', ''))
        if (amount > 0) {
          amounts.push(amount)
          confidence = 0.7 // Higher confidence for Revenue payments
        }
      }
    }

    return { amounts, rates, confidence }
  },
  validator: (text: string) => {
    const issues: string[] = []
    let isValid = true

    if (!text.match(/statement/i)) {
      issues.push('Document not clearly identified as statement')
      isValid = false
    }

    return { isValid, issues }
  }
}

/**
 * E-commerce Export Patterns (Shopify, WooCommerce, etc.)
 */
export const ECOMMERCE_PATTERNS: IrishDocumentPattern = {
  name: 'E-commerce Exports',
  type: 'ECOMMERCE',
  patterns: [
    /shopify/i,
    /woocommerce/i,
    /order\s*#/i,
    /export/i,
    /csv|excel/i
  ],
  vatExtractor: (text: string) => {
    const amounts: number[] = []
    const rates: number[] = []
    let confidence = 0.8

    // E-commerce VAT patterns
    const patterns = [
      /tax.*?€?([0-9,]+\.?[0-9]*)/gi,
      /vat.*?€?([0-9,]+\.?[0-9]*)/gi,
      /total_tax.*?([0-9,]+\.?[0-9]*)/gi // WooCommerce format
    ]

    for (const pattern of patterns) {
      const matches = [...text.matchAll(pattern)]
      for (const match of matches) {
        const amount = parseFloat(match[1].replace(',', ''))
        if (amount > 0) {
          amounts.push(amount)
        }
      }
    }

    return { amounts, rates, confidence }
  },
  validator: (text: string) => {
    const issues: string[] = []
    let isValid = true

    if (!text.match(/order|export|csv/i)) {
      issues.push('Document not clearly identified as e-commerce export')
    }

    return { isValid, issues }
  }
}

/**
 * All Irish document patterns
 */
export const ALL_IRISH_PATTERNS: IrishDocumentPattern[] = [
  REVENUE_FORM_PATTERNS,
  IRISH_INVOICE_PATTERNS,
  BANK_STATEMENT_PATTERNS,
  ECOMMERCE_PATTERNS
]

/**
 * Detect and process Irish document
 */
export function processIrishDocument(
  text: string,
  fileName: string,
  category?: string
): {
  pattern: IrishDocumentPattern | null
  extracted: { amounts: number[], rates: number[], confidence: number }
  validation: { isValid: boolean, issues: string[] }
  recommendations: string[]
} {
  
  // Try to match against Irish patterns
  for (const pattern of ALL_IRISH_PATTERNS) {
    const matches = pattern.patterns.some(p => p.test(text))
    
    if (matches) {
      logInfo(`Matched Irish document pattern: ${pattern.name}`, {
        operation: 'irish-document-detection'
      })

      const extracted = pattern.vatExtractor(text)
      const validation = pattern.validator(text)
      const recommendations = generateRecommendations(pattern, extracted, validation)

      return {
        pattern,
        extracted,
        validation,
        recommendations
      }
    }
  }

  // No specific pattern matched - try generic Irish extraction
  return {
    pattern: null,
    extracted: extractGenericIrishVAT(text),
    validation: { isValid: true, issues: [] },
    recommendations: ['Document does not match standard Irish formats', 'Manual review may be required']
  }
}

/**
 * Generic Irish VAT extraction
 */
function extractGenericIrishVAT(text: string): { amounts: number[], rates: number[], confidence: number } {
  const amounts: number[] = []
  const rates: number[] = []
  let confidence = 0.4

  // Look for Irish VAT indicators
  const irishIndicators = [
    /ireland|éire/i,
    /dublin|cork|galway/i,
    /ie\s*[0-9]{7}[a-z]/i // Irish VAT number
  ]

  const hasIrishIndicator = irishIndicators.some(indicator => indicator.test(text))
  if (hasIrishIndicator) {
    confidence = 0.6
  }

  // Extract VAT amounts with Irish rates
  const vatPatterns = [
    /vat.*?(23|13\.5|9|4\.8)%.*?€?([0-9,]+\.?[0-9]*)/gi,
    /vat.*?€?([0-9,]+\.?[0-9]*)/gi
  ]

  for (const pattern of vatPatterns) {
    const matches = [...text.matchAll(pattern)]
    for (const match of matches) {
      if (match[2]) {
        // Has rate
        const rate = parseFloat(match[1])
        const amount = parseFloat(match[2].replace(',', ''))
        rates.push(rate)
        amounts.push(amount)
      } else if (match[1]) {
        // Just amount
        const amount = parseFloat(match[1].replace(',', ''))
        amounts.push(amount)
      }
    }
  }

  return { amounts, rates, confidence }
}

/**
 * Generate recommendations based on pattern and extraction
 */
function generateRecommendations(
  pattern: IrishDocumentPattern,
  extracted: { amounts: number[], rates: number[], confidence: number },
  validation: { isValid: boolean, issues: string[] }
): string[] {
  const recommendations: string[] = []

  if (extracted.confidence < 0.7) {
    recommendations.push('Consider manual verification of VAT amounts')
  }

  if (pattern.type === 'REVENUE_FORM' && !validation.isValid) {
    recommendations.push('Revenue form may be incomplete or corrupted')
  }

  if (extracted.rates.length > 0) {
    const invalidRates = extracted.rates.filter(rate => 
      !IRISH_VAT_RATES.some(r => r.rate === rate)
    )
    if (invalidRates.length > 0) {
      recommendations.push(`Invalid Irish VAT rates detected: ${invalidRates.join(', ')}%`)
    }
  }

  if (extracted.amounts.length === 0) {
    recommendations.push('No VAT amounts detected - manual review required')
  }

  return recommendations
}

/**
 * Validate Irish VAT number format
 */
export function validateIrishVATNumber(vatNumber: string): boolean {
  // Irish VAT format: IE + 7 digits + 1-2 letters
  const irishVATPattern = /^IE[0-9]{7}[A-Z]{1,2}$/i
  return irishVATPattern.test(vatNumber.replace(/\s/g, ''))
}

/**
 * Get appropriate VAT rate for amount and context
 */
export function suggestVATRate(amount: number, context: string): IrishVATRate | null {
  const contextLower = context.toLowerCase()

  // Tourism/hospitality
  if (contextLower.includes('hotel') || contextLower.includes('restaurant') || 
      contextLower.includes('accommodation')) {
    return IRISH_VAT_RATES.find(r => r.rate === 9) || null
  }

  // Reduced rate items
  if (contextLower.includes('fuel') || contextLower.includes('energy') ||
      contextLower.includes('building')) {
    return IRISH_VAT_RATES.find(r => r.rate === 13.5) || null
  }

  // Default to standard rate
  return IRISH_VAT_RATES.find(r => r.rate === 23) || null
}