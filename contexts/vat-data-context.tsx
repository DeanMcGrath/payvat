"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface UserProfile {
  id: string
  email: string
  businessName: string
  vatNumber: string
  firstName?: string
  lastName?: string
  phone?: string
  address?: string
}

export interface VATDataContextType {
  // User Profile Data
  userProfile: UserProfile | null
  
  // Period Data
  selectedYear: string
  selectedPeriod: string
  periodBeginDate: string
  periodEndDate: string
  
  // VAT Amounts (in euros, will be converted to whole euros for VAT3)
  totalSalesVAT: number
  totalPurchaseVAT: number
  
  // Loading states
  isLoading: boolean
  
  // Actions
  setUserProfile: (profile: UserProfile | null) => void
  setPeriodData: (year: string, period: string, beginDate?: string, endDate?: string) => void
  setVATAmounts: (sales: number, purchases: number) => void
  clearVATData: () => void
  loadUserProfile: () => Promise<void>
}

const VATDataContext = createContext<VATDataContextType | undefined>(undefined)

// Period mapping for date calculations
const periodMap: Record<string, { start: [number, number], end: [number, number] }> = {
  'jan-feb': { start: [0, 1], end: [1, 28] }, // Jan 1 - Feb 28/29
  'mar-apr': { start: [2, 1], end: [3, 30] }, // Mar 1 - Apr 30
  'may-jun': { start: [4, 1], end: [5, 30] }, // May 1 - Jun 30
  'jul-aug': { start: [6, 1], end: [7, 31] }, // Jul 1 - Aug 31
  'sep-oct': { start: [8, 1], end: [9, 31] }, // Sep 1 - Oct 31
  'nov-dec': { start: [10, 1], end: [11, 31] }, // Nov 1 - Dec 31
}

// Helper function to calculate period dates
function calculatePeriodDates(year: string, period: string): { beginDate: string, endDate: string } {
  const yearNum = parseInt(year)
  const mapping = periodMap[period]
  
  if (!mapping) {
    return { beginDate: '', endDate: '' }
  }
  
  const startDate = new Date(yearNum, mapping.start[0], mapping.start[1])
  let endDate = new Date(yearNum, mapping.end[0], mapping.end[1])
  
  // Handle February leap year - ensure we get the correct last day
  if (period === 'jan-feb') {
    const isLeapYear = yearNum % 4 === 0 && (yearNum % 100 !== 0 || yearNum % 400 === 0)
    const lastDayOfFeb = isLeapYear ? 29 : 28
    endDate = new Date(yearNum, 1, lastDayOfFeb) // Month 1 = February
  }
  
  // Return dates in ISO format (YYYY-MM-DD) for HTML date inputs
  return {
    beginDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  }
}

export function VATDataProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null)
  const [selectedYear, setSelectedYear] = useState('2025')
  const [selectedPeriod, setSelectedPeriod] = useState('jan-feb')
  const [periodBeginDate, setPeriodBeginDate] = useState('')
  const [periodEndDate, setPeriodEndDate] = useState('')
  const [totalSalesVAT, setTotalSalesVAT] = useState(0)
  const [totalPurchaseVAT, setTotalPurchaseVAT] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // Load data from localStorage on mount
  useEffect(() => {
    const savedVATData = localStorage.getItem('vat-data')
    if (savedVATData) {
      try {
        const data = JSON.parse(savedVATData)
        if (data.userProfile) setUserProfileState(data.userProfile)
        if (data.selectedYear) setSelectedYear(data.selectedYear)
        if (data.selectedPeriod) setSelectedPeriod(data.selectedPeriod)
        if (data.periodBeginDate) setPeriodBeginDate(data.periodBeginDate)
        if (data.periodEndDate) setPeriodEndDate(data.periodEndDate)
        if (data.totalSalesVAT) setTotalSalesVAT(data.totalSalesVAT)
        if (data.totalPurchaseVAT) setTotalPurchaseVAT(data.totalPurchaseVAT)
      } catch (error) {
        console.warn('Failed to load VAT data from localStorage:', error)
      }
    }
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    const vatData = {
      userProfile,
      selectedYear,
      selectedPeriod,
      periodBeginDate,
      periodEndDate,
      totalSalesVAT,
      totalPurchaseVAT,
      lastUpdated: new Date().toISOString()
    }
    
    localStorage.setItem('vat-data', JSON.stringify(vatData))
  }, [userProfile, selectedYear, selectedPeriod, periodBeginDate, periodEndDate, totalSalesVAT, totalPurchaseVAT])

  const setUserProfile = (profile: UserProfile | null) => {
    setUserProfileState(profile)
  }

  const setPeriodData = (year: string, period: string, beginDate?: string, endDate?: string) => {
    setSelectedYear(year)
    setSelectedPeriod(period)
    
    if (beginDate && endDate) {
      setPeriodBeginDate(beginDate)
      setPeriodEndDate(endDate)
    } else {
      // Calculate dates from year and period
      const dates = calculatePeriodDates(year, period)
      setPeriodBeginDate(dates.beginDate)
      setPeriodEndDate(dates.endDate)
    }
  }

  const setVATAmounts = (sales: number, purchases: number) => {
    setTotalSalesVAT(sales)
    setTotalPurchaseVAT(purchases)
  }

  const clearVATData = () => {
    setUserProfileState(null)
    setSelectedYear('2025')
    setSelectedPeriod('jan-feb')
    setPeriodBeginDate('')
    setPeriodEndDate('')
    setTotalSalesVAT(0)
    setTotalPurchaseVAT(0)
    localStorage.removeItem('vat-data')
  }

  const loadUserProfile = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/profile')
      const data = await response.json()
      
      if (data.success && data.user) {
        setUserProfile(data.user)
      }
    } catch (error) {
      console.error('Failed to load user profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const value: VATDataContextType = {
    userProfile,
    selectedYear,
    selectedPeriod,
    periodBeginDate,
    periodEndDate,
    totalSalesVAT,
    totalPurchaseVAT,
    isLoading,
    setUserProfile,
    setPeriodData,
    setVATAmounts,
    clearVATData,
    loadUserProfile
  }

  return (
    <VATDataContext.Provider value={value}>
      {children}
    </VATDataContext.Provider>
  )
}

export function useVATData() {
  const context = useContext(VATDataContext)
  if (context === undefined) {
    throw new Error('useVATData must be used within a VATDataProvider')
  }
  return context
}