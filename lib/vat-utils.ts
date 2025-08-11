/**
 * VAT Utility functions for the PayVAT application
 */

export interface PeriodMapping {
  label: string
  key: string
  startMonth: number // 0-based (0 = January)
  endMonth: number   // 0-based (11 = December)
  startDay: number
  endDay: number
}

// Standard Irish VAT bi-monthly periods
export const VAT_PERIODS: PeriodMapping[] = [
  {
    label: "January - February",
    key: "jan-feb",
    startMonth: 0,
    endMonth: 1,
    startDay: 1,
    endDay: 28, // Will be adjusted for leap years
  },
  {
    label: "March - April", 
    key: "mar-apr",
    startMonth: 2,
    endMonth: 3,
    startDay: 1,
    endDay: 30,
  },
  {
    label: "May - June",
    key: "may-jun", 
    startMonth: 4,
    endMonth: 5,
    startDay: 1,
    endDay: 30,
  },
  {
    label: "July - August",
    key: "jul-aug",
    startMonth: 6,
    endMonth: 7, 
    startDay: 1,
    endDay: 31,
  },
  {
    label: "September - October",
    key: "sep-oct",
    startMonth: 8,
    endMonth: 9,
    startDay: 1, 
    endDay: 31,
  },
  {
    label: "November - December",
    key: "nov-dec",
    startMonth: 10,
    endMonth: 11,
    startDay: 1,
    endDay: 31,
  }
]

/**
 * Check if a year is a leap year
 */
export function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
}

/**
 * Get the number of days in February for a given year
 */
export function getFebruaryDays(year: number): number {
  return isLeapYear(year) ? 29 : 28
}

/**
 * Calculate period start and end dates from year and period key
 */
export function calculatePeriodDates(year: string, periodKey: string): {
  startDate: string
  endDate: string
  startDateISO: string
  endDateISO: string
} {
  const yearNum = parseInt(year)
  const period = VAT_PERIODS.find(p => p.key === periodKey)
  
  if (!period) {
    throw new Error(`Invalid period key: ${periodKey}`)
  }
  
  // Create start date
  const startDate = new Date(yearNum, period.startMonth, period.startDay)
  
  // Create end date - handle February leap year special case
  let endDay = period.endDay
  if (period.key === 'jan-feb') {
    endDay = getFebruaryDays(yearNum)
  }
  
  const endDate = new Date(yearNum, period.endMonth, endDay)
  
  // Format dates for display and ISO format for form inputs
  const formatForDisplay = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }
  
  const formatForISO = (date: Date): string => {
    return date.toISOString().split('T')[0]
  }
  
  return {
    startDate: formatForDisplay(startDate),
    endDate: formatForDisplay(endDate), 
    startDateISO: formatForISO(startDate),
    endDateISO: formatForISO(endDate)
  }
}

/**
 * Get period label from period key
 */
export function getPeriodLabel(periodKey: string): string {
  const period = VAT_PERIODS.find(p => p.key === periodKey)
  return period?.label || periodKey
}

/**
 * Convert decimal euro amounts to whole euros (as required by VAT3 form)
 * Rounds to nearest whole euro
 */
export function convertToWholeEuros(amount: number): number {
  return Math.round(amount)
}

/**
 * Convert decimal euro amounts to whole euros as string (for form inputs)
 */
export function convertToWholeEurosString(amount: number): string {
  return Math.round(amount).toString()
}

/**
 * Format euro amount for display with currency symbol
 */
export function formatEuroAmount(amount: number, showCents: boolean = true): string {
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0
  }
  
  return new Intl.NumberFormat('en-IE', options).format(amount)
}

/**
 * Parse euro amount from string, handling various input formats
 */
export function parseEuroAmount(value: string): number {
  // Remove currency symbols, whitespace, and commas
  const cleaned = value.replace(/[€$,\s]/g, '')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Generate VAT3 return reference number
 * Format: VAT3-YYYY-MM-XXXXXXXX (where XXXXXXXX is timestamp-based)
 */
export function generateVAT3Reference(year: string, periodKey: string): string {
  const period = VAT_PERIODS.find(p => p.key === periodKey)
  const monthNum = period ? (period.startMonth + 1).toString().padStart(2, '0') : '01'
  const timestamp = Date.now().toString().slice(-8)
  
  return `VAT3-${year}-${monthNum}-${timestamp}`
}

/**
 * Validate VAT number format (basic Irish VAT number validation)
 */
export function isValidIrishVATNumber(vatNumber: string): boolean {
  // Remove spaces and convert to uppercase
  const cleaned = vatNumber.replace(/\s/g, '').toUpperCase()
  
  // Irish VAT numbers: 7 digits + 1-2 letters, or 8 digits + 1 letter
  const patterns = [
    /^\d{7}[A-Z]{1,2}$/, // 7 digits + 1-2 letters
    /^\d{8}[A-Z]$/       // 8 digits + 1 letter
  ]
  
  return patterns.some(pattern => pattern.test(cleaned))
}

/**
 * Get the next VAT return due date
 * Irish VAT returns are typically due by the 19th of the month following the period end
 */
export function getVATReturnDueDate(year: string, periodKey: string): string {
  const dates = calculatePeriodDates(year, periodKey)
  const endDate = new Date(dates.endDateISO + 'T00:00:00')
  
  // Add one month and set to 19th day
  const dueDate = new Date(endDate)
  dueDate.setMonth(dueDate.getMonth() + 1)
  dueDate.setDate(19)
  
  return dueDate.toISOString().split('T')[0]
}

/**
 * Check if VAT return is overdue
 */
export function isVATReturnOverdue(year: string, periodKey: string): boolean {
  const dueDate = new Date(getVATReturnDueDate(year, periodKey))
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Reset time to start of day
  
  return dueDate < today
}