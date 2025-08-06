import { z } from 'zod'

// Irish VAT Configuration
export const VAT_CONFIG = {
  STANDARD_RATE: 0.23, // 23% standard VAT rate
  REDUCED_RATE: 0.135, // 13.5% reduced rate
  ZERO_RATE: 0.0, // 0% zero rate
  
  // Filing periods
  MONTHLY_THRESHOLD: 3000000, // €3M annual turnover for monthly filing
  BI_MONTHLY_FILING: true,
  
  // Due dates (days after period end)
  RETURN_DUE_DAYS: 19, // VAT return due 19th of month following period
  PAYMENT_DUE_DAYS: 23, // Payment due 23rd of month following period
  
  // Validation limits
  MAX_VAT_AMOUNT: 10000000, // €10M max VAT amount for validation
  MIN_VAT_AMOUNT: 0
}

// Validation schemas
export const vatCalculationSchema = z.object({
  salesVAT: z.number()
    .min(VAT_CONFIG.MIN_VAT_AMOUNT, 'Sales VAT cannot be negative')
    .max(VAT_CONFIG.MAX_VAT_AMOUNT, 'Sales VAT amount too large')
    .multipleOf(0.01, 'Amount must be in cents precision'),
    
  purchaseVAT: z.number()
    .min(VAT_CONFIG.MIN_VAT_AMOUNT, 'Purchase VAT cannot be negative')
    .max(VAT_CONFIG.MAX_VAT_AMOUNT, 'Purchase VAT amount too large')
    .multipleOf(0.01, 'Amount must be in cents precision'),
    
  periodStart: z.string().datetime('Invalid period start date'),
  periodEnd: z.string().datetime('Invalid period end date'),
})

export const vatPeriodSchema = z.object({
  startDate: z.string().datetime('Invalid start date'),
  endDate: z.string().datetime('Invalid end date'),
})

// Types
export interface VATCalculation {
  salesVAT: number
  purchaseVAT: number
  netVAT: number
  periodStart: Date
  periodEnd: Date
  dueDate: Date
  isValid: boolean
  warnings?: string[]
}

export interface VATSubmissionData {
  userId: string
  salesVAT: number
  purchaseVAT: number
  netVAT: number
  periodStart: Date
  periodEnd: Date
  documentIds?: string[]
}

// VAT Calculation Functions
export function calculateNetVAT(salesVAT: number, purchaseVAT: number): number {
  const netAmount = salesVAT - purchaseVAT
  return Math.round(netAmount * 100) / 100 // Round to 2 decimal places
}

export function calculateDueDate(periodEnd: Date): Date {
  const dueDate = new Date(periodEnd)
  dueDate.setMonth(dueDate.getMonth() + 1) // Next month
  dueDate.setDate(23) // 23rd of the month
  
  // If 23rd falls on weekend, move to next Monday
  if (dueDate.getDay() === 0) { // Sunday
    dueDate.setDate(24)
  } else if (dueDate.getDay() === 6) { // Saturday
    dueDate.setDate(25)
  }
  
  return dueDate
}

export function validateVATPeriod(startDate: Date, endDate: Date): { isValid: boolean; error?: string } {
  // Period must be positive duration
  if (endDate <= startDate) {
    return { isValid: false, error: 'Period end date must be after start date' }
  }
  
  // Period cannot be in the future
  const now = new Date()
  if (startDate > now) {
    return { isValid: false, error: 'Period cannot start in the future' }
  }
  
  // Period cannot be more than 6 months in the past
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  if (endDate < sixMonthsAgo) {
    return { isValid: false, error: 'Period cannot be more than 6 months old' }
  }
  
  // Check if period length is reasonable (1-3 months)
  const diffMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                     (endDate.getMonth() - startDate.getMonth())
  
  if (diffMonths > 3) {
    return { isValid: false, error: 'VAT period cannot exceed 3 months' }
  }
  
  if (diffMonths < 0.5) {
    return { isValid: false, error: 'VAT period must be at least 2 weeks' }
  }
  
  return { isValid: true }
}

export function performVATCalculation(data: {
  salesVAT: number
  purchaseVAT: number
  periodStart: Date
  periodEnd: Date
}): VATCalculation {
  const { salesVAT, purchaseVAT, periodStart, periodEnd } = data
  
  // Validate period
  const periodValidation = validateVATPeriod(periodStart, periodEnd)
  if (!periodValidation.isValid) {
    return {
      ...data,
      netVAT: 0,
      dueDate: new Date(),
      isValid: false,
      warnings: [periodValidation.error!]
    }
  }
  
  // Calculate net VAT
  const netVAT = calculateNetVAT(salesVAT, purchaseVAT)
  
  // Calculate due date
  const dueDate = calculateDueDate(periodEnd)
  
  // Generate warnings
  const warnings: string[] = []
  
  if (netVAT > 50000) { // €50k threshold
    warnings.push('Large VAT amount - please verify calculations')
  }
  
  if (purchaseVAT > salesVAT) {
    warnings.push('Purchase VAT exceeds Sales VAT - VAT refund may apply')
  }
  
  const now = new Date()
  if (dueDate < now) {
    warnings.push('VAT return is overdue - late filing penalties may apply')
  }
  
  return {
    salesVAT,
    purchaseVAT,
    netVAT,
    periodStart,
    periodEnd,
    dueDate,
    isValid: true,
    warnings: warnings.length > 0 ? warnings : undefined
  }
}

// Format currency for display
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

// Format VAT reference number
export function generateVATReference(userId: string, periodEnd: Date): string {
  const year = periodEnd.getFullYear()
  const month = String(periodEnd.getMonth() + 1).padStart(2, '0')
  const userSuffix = userId.slice(-6).toUpperCase()
  return `VAT-${year}-${month}-${userSuffix}`
}

// Validate Irish VAT number format
export function validateIrishVATNumber(vatNumber: string): boolean {
  // Irish VAT format: IE + 7 digits + 1-2 letters
  const irishVATRegex = /^IE[0-9]{7}[A-Z]{1,2}$/
  return irishVATRegex.test(vatNumber.toUpperCase())
}

// Calculate filing frequency based on annual turnover
export function getFilingFrequency(annualTurnover: number): 'monthly' | 'bi-monthly' {
  return annualTurnover >= VAT_CONFIG.MONTHLY_THRESHOLD ? 'monthly' : 'bi-monthly'
}

// Generate period suggestions based on filing frequency
export function suggestVATPeriods(filingFrequency: 'monthly' | 'bi-monthly', year: number): Array<{
  label: string
  startDate: Date
  endDate: Date
}> {
  const periods = []
  
  if (filingFrequency === 'monthly') {
    // Monthly periods
    for (let month = 0; month < 12; month++) {
      const startDate = new Date(year, month, 1)
      const endDate = new Date(year, month + 1, 0) // Last day of month
      
      periods.push({
        label: `${startDate.toLocaleDateString('en-IE', { month: 'long' })} ${year}`,
        startDate,
        endDate
      })
    }
  } else {
    // Bi-monthly periods
    const biMonthlyPeriods = [
      { start: 0, end: 1, label: 'Jan - Feb' },
      { start: 2, end: 3, label: 'Mar - Apr' },
      { start: 4, end: 5, label: 'May - Jun' },
      { start: 6, end: 7, label: 'Jul - Aug' },
      { start: 8, end: 9, label: 'Sep - Oct' },
      { start: 10, end: 11, label: 'Nov - Dec' },
    ]
    
    biMonthlyPeriods.forEach(period => {
      const startDate = new Date(year, period.start, 1)
      const endDate = new Date(year, period.end + 1, 0) // Last day of second month
      
      periods.push({
        label: `${period.label} ${year}`,
        startDate,
        endDate
      })
    })
  }
  
  return periods
}