"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Calculator, FileText, CheckCircle, BadgeCheck, RefreshCw, X, AlertCircle, Loader2, Eye, Edit3 } from 'lucide-react'
import Footer from "@/components/footer"
import SiteHeader from "@/components/site-header"
import DocumentViewer from "@/components/document-viewer"
import { toast } from "sonner"
import { logger } from "@/lib/logger"
import { useVATData } from "@/contexts/vat-data-context"
import { getPeriodLabel, formatEuroAmount, formatCurrency } from "@/lib/vatUtils"

interface UserProfile {
  id: string
  email: string
  businessName: string
  vatNumber: string
  firstName?: string
  lastName?: string
}

export default function VATSubmissionPage() {
  const { selectedYear, selectedPeriod, periodBeginDate, periodEndDate, setVATAmounts, totalSalesVAT: contextSalesVAT, totalPurchaseVAT: contextPurchaseVAT } = useVATData()
  const router = useRouter()
  const [salesVAT, setSalesVAT] = useState("0.00")
  const [purchaseVAT, setPurchaseVAT] = useState("0.00")
  const [netVAT, setNetVAT] = useState("0.00")
  const [extractedVATData, setExtractedVATData] = useState<any>(null)
  const [loadingExtractedData, setLoadingExtractedData] = useState(false)
  const [useExtractedData, setUseExtractedData] = useState(false)
  const [uploadedDocuments, setUploadedDocuments] = useState<any[]>([])
  const [loadingDocuments, setLoadingDocuments] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [userLoading, setUserLoading] = useState(true)
  const [userError, setUserError] = useState<string | null>(null)
  
  // Document viewer and correction state
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null)
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false)
  const [corrections, setCorrections] = useState<Map<string, any>>(new Map())
  
  // Rate limiting and debouncing state
  const [lastFetchTime, setLastFetchTime] = useState(0)
  const [fetchTimeout, setFetchTimeout] = useState<NodeJS.Timeout | null>(null)
  // REMOVED: Frontend caching - now handled by backend with proper invalidation
  const [isRefreshDisabled, setIsRefreshDisabled] = useState(false)
  const [autoPopulateTimeout, setAutoPopulateTimeout] = useState<NodeJS.Timeout | null>(null)
  
  
  // Use period data from context or fallback
  // Calculate current period if none selected
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() // 0-based
  
  // Determine current VAT period (bi-monthly)
  let defaultPeriod = "jan-feb"
  if (currentMonth >= 2 && currentMonth < 4) defaultPeriod = "mar-apr"
  else if (currentMonth >= 4 && currentMonth < 6) defaultPeriod = "may-jun"
  else if (currentMonth >= 6 && currentMonth < 8) defaultPeriod = "jul-aug"
  else if (currentMonth >= 8 && currentMonth < 10) defaultPeriod = "sep-oct"
  else if (currentMonth >= 10) defaultPeriod = "nov-dec"
  
  const displayPeriod = selectedPeriod ? getPeriodLabel(selectedPeriod) + " " + selectedYear : getPeriodLabel(defaultPeriod) + " " + currentYear
  
  // Calculate due date dynamically (19th of month after period end)
  const calculateDueDate = () => {
    const year = selectedYear ? parseInt(selectedYear) : currentYear
    const period = selectedPeriod || defaultPeriod
    
    // Get period end month
    let endMonth = 1 // Default Jan-Feb ends in Feb (month 1)
    if (period === "mar-apr") endMonth = 3
    else if (period === "may-jun") endMonth = 5
    else if (period === "jul-aug") endMonth = 7
    else if (period === "sep-oct") endMonth = 9
    else if (period === "nov-dec") endMonth = 11
    
    // Due date is 19th of the month after period ends
    const dueDate = new Date(year, endMonth + 1, 19)
    return dueDate.toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })
  }
  
  const dueDate = calculateDueDate()

  // Document categorization helper functions
  const categorizeSalesDocuments = (documents: any[]) => {
    return documents.filter(doc => 
      doc.category === 'SALES_INVOICE' || 
      doc.category === 'SALES' ||
      doc.category?.includes('SALES')
    )
  }

  const categorizePurchaseDocuments = (documents: any[]) => {
    return documents.filter(doc => 
      doc.category === 'PURCHASE_INVOICE' || 
      doc.category === 'PURCHASE_REPORT' || 
      doc.category === 'PURCHASES' ||
      doc.category?.includes('PURCHASE')
    )
  }

  // Load data on component mount
  useEffect(() => {
    fetchUserProfile()
    loadExtractedVATData()
    loadUploadedDocuments()
    
    // Cleanup timeouts on unmount
    return () => {
      if (fetchTimeout) {
        clearTimeout(fetchTimeout)
      }
      if (autoPopulateTimeout) {
        clearTimeout(autoPopulateTimeout)
      }
    }
  }, [])
  
  // Reload documents when VAT period dates change
  useEffect(() => {
    if (periodBeginDate && periodEndDate) {
      logger.info('VAT period dates changed, reloading documents', { 
        periodBeginDate, 
        periodEndDate 
      }, 'VAT_SUBMISSION')
      loadUploadedDocuments()
    }
  }, [periodBeginDate, periodEndDate])
  
  // Handle URL parameters for continuing existing VAT returns
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const returnId = urlParams.get('returnId')
    
    if (returnId) {
      // Load existing VAT return data
      loadExistingVATReturn(returnId)
    }
  }, [])
  
  const loadExistingVATReturn = async (returnId: string) => {
    try {
      logger.info('Loading existing VAT return', { returnId }, 'VAT_SUBMISSION')
      const response = await fetch(`/api/vat/${returnId}`)
      
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.vatReturn) {
          const vatReturn = result.vatReturn
          
          // Update VAT amounts
          setSalesVAT(vatReturn.salesVAT.toString())
          setPurchaseVAT(vatReturn.purchaseVAT.toString())
          setNetVAT(vatReturn.netVAT.toString())
          
          // Update context with period data if needed
          const periodStart = new Date(vatReturn.periodStart)
          const periodEnd = new Date(vatReturn.periodEnd)
          
          logger.info('Loaded existing VAT return successfully', { 
            returnId,
            periodStart: periodStart.toISOString(),
            periodEnd: periodEnd.toISOString(),
            salesVAT: vatReturn.salesVAT,
            purchaseVAT: vatReturn.purchaseVAT
          }, 'VAT_SUBMISSION')
        }
      }
    } catch (error) {
      logger.error('Failed to load existing VAT return', error, 'VAT_SUBMISSION')
      toast.error('Failed to load VAT return data')
    }
  }
  
  // Monitor changes to extracted VAT data
  useEffect(() => {
    console.log('🔄 FRONTEND: extractedVATData state changed:', extractedVATData)
    if (extractedVATData) {
      console.log('📊 FRONTEND: New extracted VAT data details:', {
        totalSalesVAT: extractedVATData.totalSalesVAT,
        totalPurchaseVAT: extractedVATData.totalPurchaseVAT,
        totalNetVAT: extractedVATData.totalNetVAT,
        processedDocuments: extractedVATData.processedDocuments,
        averageConfidence: extractedVATData.averageConfidence,
        documentCount: extractedVATData.documentCount
      })
    }
  }, [extractedVATData])
  
  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'GET',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.user) {
          setUser(data.user)
        } else {
          setUserError('Failed to load user profile')
        }
      } else if (response.status === 401) {
        // User not logged in - this is okay, just set user as null
        setUser(null)
        setUserError(null) // Clear any error since this is expected for anonymous users
      } else {
        setUserError('Failed to fetch user profile')
      }
    } catch (err) {
      // For anonymous users, network errors during auth checks are not critical
      console.log('Authentication check failed:', err)
      setUser(null)
      setUserError(null) // Don't show error for failed auth checks
    } finally {
      setUserLoading(false)
    }
  }
  
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      router.push('/login')
    } catch (err) {
      router.push('/login')
    }
  }
  
  // Debounced refresh function to prevent rapid successive calls
  const debouncedRefreshVATData = (delay = 3000, enableAutoPopulate = false) => {
    // Clear any existing timeouts to prevent conflicts
    if (fetchTimeout) {
      clearTimeout(fetchTimeout)
    }
    if (autoPopulateTimeout) {
      clearTimeout(autoPopulateTimeout)
    }
    
    const timeout = setTimeout(() => {
      console.log('🔄 FRONTEND: Executing debounced VAT data refresh')
      loadExtractedVATData(true).then(() => {
        // Auto-populate only if specifically requested and data is available
        if (enableAutoPopulate) {
          const populateTimeout = setTimeout(() => {
            if (extractedVATData && extractedVATData.processedDocuments > 0) {
              console.log('✅ FRONTEND: Auto-populating calculator with extracted VAT data')
              useExtractedVATData()
            }
          }, 1000) // Short delay after data refresh
          setAutoPopulateTimeout(populateTimeout)
        }
      })
    }, delay)
    
    setFetchTimeout(timeout)
  }
  
  const loadUploadedDocuments = async () => {
    try {
      setLoadingDocuments(true)
      
      // Build API URL with date filtering if period dates are available
      let apiUrl = '/api/documents'
      if (periodBeginDate && periodEndDate) {
        const params = new URLSearchParams({
          startDate: periodBeginDate,
          endDate: periodEndDate
        })
        apiUrl = `/api/documents?${params.toString()}`
        logger.info('Loading documents filtered by VAT period', { 
          startDate: periodBeginDate, 
          endDate: periodEndDate 
        }, 'VAT_SUBMISSION')
      }
      
      const response = await fetch(apiUrl)
      
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.documents) {
          setUploadedDocuments(result.documents)
          logger.info('Loaded uploaded documents', { 
            count: result.documents.length,
            filtered: !!(periodBeginDate && periodEndDate)
          }, 'VAT_SUBMISSION')
        }
      }
    } catch (error) {
      logger.error('Failed to load uploaded documents', error, 'VAT_SUBMISSION')
    } finally {
      setLoadingDocuments(false)
    }
  }
  
  const removeDocument = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Remove from local state
        setUploadedDocuments(prev => prev.filter(doc => doc.id !== documentId))
        
        // Refresh VAT data since document was removed - use debounced refresh
        debouncedRefreshVATData(1000)
        
        // Reset calculator if no more documents with VAT data
        if (uploadedDocuments.length <= 1) {
          setSalesVAT("0.00")
          setPurchaseVAT("0.00") 
          setNetVAT("0.00")
          setUseExtractedData(false)
        }
        
        toast.success('Document removed successfully')
        logger.info('Document removed successfully', { documentId }, 'VAT_SUBMISSION')
      } else {
        const result = await response.json()
        toast.error('Failed to remove document: ' + (result.error || 'Unknown error'))
        logger.error('Failed to remove document', result.error, 'VAT_SUBMISSION')
      }
    } catch (error) {
      toast.error('Network error occurred while removing document')
      logger.error('Delete error', error, 'VAT_SUBMISSION')
    }
  }

  const loadExtractedVATData = async (forceRefresh = false): Promise<any> => {
    try {
      // FIXED: Removed frontend caching - backend handles caching with proper invalidation
      // Prevent rapid successive calls
      const MIN_INTERVAL = 2000; // 2 seconds minimum between calls
      const now = Date.now()
      if (!forceRefresh && (now - lastFetchTime) < MIN_INTERVAL) {
        console.log('⏳ FRONTEND: Skipping request due to rate limiting')
        return extractedVATData
      }
      
      // Check if we're already loading
      if (loadingExtractedData) {
        console.log('⏳ FRONTEND: Request already in progress, skipping')
        return extractedVATData
      }
      
      setLoadingExtractedData(true)
      setLastFetchTime(now)
      console.log('🔍 FRONTEND: Loading extracted VAT data...')
      
      const response = await fetch(`/api/documents/extracted-vat?t=${now}`)
      console.log('🌐 FRONTEND: API response status:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('📊 FRONTEND: Raw API response:', JSON.stringify(result, null, 2))
        
        if (result.success && result.extractedVAT) {
          console.log('✅ FRONTEND: Setting extracted VAT data:', {
            totalSalesVAT: result.extractedVAT.totalSalesVAT,
            totalPurchaseVAT: result.extractedVAT.totalPurchaseVAT,
            totalNetVAT: result.extractedVAT.totalNetVAT,
            processedDocuments: result.extractedVAT.processedDocuments,
            averageConfidence: result.extractedVAT.averageConfidence,
            salesDocuments: result.extractedVAT.salesDocuments?.length || 0,
            purchaseDocuments: result.extractedVAT.purchaseDocuments?.length || 0
          })
          
          setExtractedVATData(result.extractedVAT)
          // REMOVED: Frontend caching - now handled by backend with proper invalidation
          logger.info('Loaded extracted VAT data', { totalSalesVAT: result.extractedVAT.totalSalesVAT, totalPurchaseVAT: result.extractedVAT.totalPurchaseVAT }, 'VAT_SUBMISSION')
          return result.extractedVAT // Return fresh data
        } else {
          console.log('❌ FRONTEND: API response indicates failure or no data:', {
            success: result.success,
            hasExtractedVAT: !!result.extractedVAT
          })
          return null
        }
      } else {
        console.log('❌ FRONTEND: API request failed:', response.status, response.statusText)
        return null
      }
    } catch (error) {
      console.error('🚨 FRONTEND: Error loading extracted VAT data:', error)
      logger.error('Failed to load extracted VAT data', error, 'VAT_SUBMISSION')
      return null
    } finally {
      setLoadingExtractedData(false)
      console.log('🏁 FRONTEND: Finished loading extracted VAT data')
    }
  }

  const useExtractedVATData = () => {
    console.log('🎯 FRONTEND: useExtractedVATData called')
    console.log('📊 FRONTEND: Current extractedVATData state:', extractedVATData)
    
    if (extractedVATData) {
      console.log('✅ FRONTEND: Applying extracted VAT data to calculator:', {
        salesVAT: extractedVATData.totalSalesVAT.toFixed(2),
        purchaseVAT: extractedVATData.totalPurchaseVAT.toFixed(2),
        netVAT: extractedVATData.totalNetVAT.toFixed(2)
      })
      
      setSalesVAT(extractedVATData.totalSalesVAT.toFixed(2))
      setPurchaseVAT(extractedVATData.totalPurchaseVAT.toFixed(2))
      setNetVAT(extractedVATData.totalNetVAT.toFixed(2))
      
      // Save VAT amounts to context for VAT3 form autofill
      setVATAmounts(extractedVATData.totalSalesVAT, extractedVATData.totalPurchaseVAT)
      setUseExtractedData(true)
    } else {
      console.log('❌ FRONTEND: No extractedVATData available to use')
    }
  }

  const calculateNetVAT = async () => {
    try {
      const sales = parseFloat(salesVAT) || 0
      const purchases = parseFloat(purchaseVAT) || 0
      
      // Get current date for period calculation (using current month)
      const now = new Date()
      const periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
      const periodEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString()
      
      const response = await fetch('/api/vat/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          salesVAT: sales,
          purchaseVAT: purchases,
          periodStart,
          periodEnd
        })
      })
      
      const result = await response.json()
      
      if (response.ok && result.success) {
        setNetVAT(result.calculation.netVAT.toFixed(2))
        
        // Show warnings if any
        if (result.calculation.warnings) {
          result.calculation.warnings.forEach((warning: string) => {
            logger.warn('VAT Calculation Warning', warning, 'VAT_SUBMISSION')
          })
        }
      } else {
        logger.error('VAT calculation failed', result.error, 'VAT_SUBMISSION')
        // Fallback to client-side calculation
        const net = (sales - purchases).toFixed(2)
        setNetVAT(net)
      }
    } catch (error) {
      logger.error('VAT calculation error', error, 'VAT_SUBMISSION')
      // Fallback to client-side calculation
      const sales = parseFloat(salesVAT) || 0
      const purchases = parseFloat(purchaseVAT) || 0
      const net = (sales - purchases).toFixed(2)
      setNetVAT(net)
    }
  }

  // Document viewer handlers
  const handleViewDocument = (document: any) => {
    setSelectedDocument(document)
    setDocumentViewerOpen(true)
  }

  const handleCloseDocumentViewer = () => {
    setDocumentViewerOpen(false)
    setSelectedDocument(null)
  }

  // VAT correction handlers
  const handleVATCorrection = async (correctionData: any) => {
    try {
      console.log('🔧 Submitting VAT correction:', correctionData)
      
      // Determine correction reason based on feedback
      let correctionReason = 'OTHER'
      if (correctionData.feedback === 'INCORRECT') {
        correctionReason = 'WRONG_AMOUNT'
      } else if (correctionData.feedback === 'PARTIALLY_CORRECT') {
        correctionReason = 'WRONG_AMOUNT'
      }

      // Submit feedback with VAT correction data
      const response = await fetch('/api/ai/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          documentId: selectedDocument?.id,
          originalExtraction: {
            salesVAT: extractedVATData?.salesDocuments?.find((doc: any) => doc.id === selectedDocument?.id)?.extractedAmounts || [],
            purchaseVAT: extractedVATData?.purchaseDocuments?.find((doc: any) => doc.id === selectedDocument?.id)?.extractedAmounts || []
          },
          correctedExtraction: {
            salesVAT: correctionData.salesVAT,
            purchaseVAT: correctionData.purchaseVAT
          },
          feedback: correctionData.feedback,
          userNotes: correctionData.notes,
          vatCorrection: {
            originalSalesVAT: extractedVATData?.salesDocuments?.find((doc: any) => doc.id === selectedDocument?.id)?.extractedAmounts || [],
            originalPurchaseVAT: extractedVATData?.purchaseDocuments?.find((doc: any) => doc.id === selectedDocument?.id)?.extractedAmounts || [],
            correctedSalesVAT: correctionData.salesVAT,
            correctedPurchaseVAT: correctionData.purchaseVAT,
            correctionReason: correctionReason,
            extractionMethod: 'AI_VISION'
          }
        })
      })

      if (response.ok) {
        // Store correction locally
        const newCorrections = new Map(corrections)
        newCorrections.set(selectedDocument?.id, correctionData)
        setCorrections(newCorrections)

        // Force refresh of extracted VAT data with cache busting
        console.log('🔄 FRONTEND: Forcing refresh of VAT data after correction...')
        
        // Clear any local state that might be cached
        setExtractedVATData(null)
        
        // Wait a moment for the backend to process the audit log
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Force reload with cache busting
        const refreshedData = await loadExtractedVATData(true)
        
        if (refreshedData && (refreshedData.totalSalesVAT > 0 || refreshedData.totalPurchaseVAT > 0)) {
          console.log('✅ FRONTEND: VAT data refreshed successfully with corrected values')
          
          // Auto-apply the updated extracted data to the calculator
          setSalesVAT(refreshedData.totalSalesVAT.toFixed(2))
          setPurchaseVAT(refreshedData.totalPurchaseVAT.toFixed(2))
          setNetVAT(refreshedData.totalNetVAT.toFixed(2))
          setUseExtractedData(true)
          
          // Update context for VAT3 form
          setVATAmounts(refreshedData.totalSalesVAT, refreshedData.totalPurchaseVAT)
          
          toast.success('VAT correction applied! Updated totals are now displayed.')
        } else {
          console.log('⚠️ FRONTEND: VAT data refresh completed but no amounts found')
          toast.success('VAT correction saved successfully!')
        }
      } else {
        const error = await response.json()
        toast.error(`Failed to save correction: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error submitting VAT correction:', error)
      toast.error('Failed to submit VAT correction')
    }
  }


  // Helper function to get VAT extraction data for a document
  const getDocumentVATExtraction = (documentId: string) => {
    const salesDoc = extractedVATData?.salesDocuments?.find((doc: any) => doc.id === documentId)
    const purchaseDoc = extractedVATData?.purchaseDocuments?.find((doc: any) => doc.id === documentId)
    
    if (salesDoc) {
      return {
        salesVAT: salesDoc.extractedAmounts,
        purchaseVAT: [],
        confidence: salesDoc.confidence,
        totalSalesVAT: salesDoc.extractedAmounts.reduce((sum: number, amount: number) => sum + amount, 0),
        totalPurchaseVAT: 0
      }
    } else if (purchaseDoc) {
      return {
        salesVAT: [],
        purchaseVAT: purchaseDoc.extractedAmounts,
        confidence: purchaseDoc.confidence,
        totalSalesVAT: 0,
        totalPurchaseVAT: purchaseDoc.extractedAmounts.reduce((sum: number, amount: number) => sum + amount, 0)
      }
    }
    
    return null
  }


  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-[#216477]" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    )
  }

  if (userError) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="w-full max-w-md border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <span className="text-lg font-normal text-red-800">Error Loading Page</span>
            </div>
            <p className="text-red-600 text-center mb-4">{userError}</p>
            <div className="flex space-x-2">
              <Button onClick={fetchUserProfile} className="flex-1">
                Try Again
              </Button>
              <Button onClick={() => router.push('/')} variant="outline" className="flex-1">
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader 
        searchPlaceholder="Search VAT documents and forms..."
        currentPage="VAT Submission"
        pageSubtitle="Complete your VAT calculations and submit"
        user={user}
        onLogout={handleLogout}
        hideNavLinks={true}
      />


      <div className="max-w-6xl mx-auto px-6 content-after-header pb-8">
        {/* Workflow Information Header */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-blue-600 mt-1" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-normal text-gray-900 mb-2">
                  Documents Auto-populated for {displayPeriod}
                </h3>
                <p className="text-gray-700 mb-3">
                  Your documents have been automatically loaded from the dashboard based on the VAT period you selected in the previous step. 
                  Documents are filtered by their extracted dates to match the {displayPeriod} period.
                </p>
                <p className="text-sm text-blue-600 mb-3">
                  ℹ️ Need to add more documents? Upload them in the 
                  <button 
                    onClick={() => router.push('/dashboard/documents')} 
                    className="underline font-normal hover:text-blue-800 mx-1"
                  >
                    Documents Dashboard
                  </button>
                  and they will automatically appear here based on their extracted dates.
                </p>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="flex items-center mr-6">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span>Sales Documents: {categorizeSalesDocuments(uploadedDocuments).length}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span>Purchase Documents: {categorizePurchaseDocuments(uploadedDocuments).length}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
            {/* Sales Documents Section - Always visible */}
            <Card className="card-modern border-[#99D3FF]">
              <CardHeader className="bg-[#E6F4FF]">
                <CardTitle className="text-lg font-normal text-blue-900 flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-[#2A7A8F]" />
                    Section 1: Sales Documents {categorizeSalesDocuments(uploadedDocuments).length > 0 && (
                      <>({categorizeSalesDocuments(uploadedDocuments).length})</>
                    )}
                  </div>
                  {extractedVATData?.totalSalesVAT && extractedVATData.totalSalesVAT > 0 && (
                    <div className="text-right">
                      <div className="text-sm font-normal text-[#2A7A8F]">
                        Sales VAT Total: {formatCurrency(extractedVATData.totalSalesVAT)}
                      </div>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {/* Auto-populated Sales Documents from Dashboard */}
                <div className="mb-6">
                  <div className="bg-blue-50 border-2 border-dashed border-blue-200 rounded-lg p-6">
                    <div className="text-center">
                      <CheckCircle className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                      <h3 className="text-sm font-normal text-blue-900 mb-1">
                        Documents Auto-loaded for {displayPeriod}
                      </h3>
                      <p className="text-xs text-blue-600">
                        Sales documents from your dashboard have been automatically included based on the selected VAT period.
                      </p>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* Purchase Documents Section - Always visible */}
            <Card className="card-modern border-green-200">
              <CardHeader className="bg-green-50">
                <CardTitle className="text-lg font-normal text-green-900 flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-green-600" />
                    Section 2: Purchase Documents {categorizePurchaseDocuments(uploadedDocuments).length > 0 && (
                      <>({categorizePurchaseDocuments(uploadedDocuments).length})</>
                    )}
                  </div>
                  {extractedVATData?.totalPurchaseVAT && extractedVATData.totalPurchaseVAT > 0 && (
                    <div className="text-right">
                      <div className="text-sm font-normal text-green-600">
                        Purchase VAT Total: {formatCurrency(extractedVATData.totalPurchaseVAT)}
                      </div>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {/* Auto-populated Purchase Documents from Dashboard */}
                <div className="mb-6">
                  <div className="bg-green-50 border-2 border-dashed border-green-200 rounded-lg p-6">
                    <div className="text-center">
                      <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <h3 className="text-sm font-normal text-green-900 mb-1">
                        Documents Auto-loaded for {displayPeriod}
                      </h3>
                      <p className="text-xs text-green-600">
                        Purchase documents from your dashboard have been automatically included based on the selected VAT period.
                      </p>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* Auto-populated Documents Section */}
            {(categorizeSalesDocuments(uploadedDocuments).length > 0 || 
              categorizePurchaseDocuments(uploadedDocuments).length > 0) && (
              <Card className="card-modern border-gray-300">
                <CardHeader>
                  <CardTitle className="text-lg font-normal text-gray-900 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-gray-600" />
                    Auto-populated Documents for {displayPeriod} ({categorizeSalesDocuments(uploadedDocuments).length + categorizePurchaseDocuments(uploadedDocuments).length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Sales Documents List */}
                  {categorizeSalesDocuments(uploadedDocuments).length > 0 && (
                    <div>
                      <h4 className="text-md font-normal text-blue-900 mb-3 flex items-center">
                        <div className="w-3 h-3 bg-[#2A7A8F] rounded-full mr-2"></div>
                        Sales Documents ({categorizeSalesDocuments(uploadedDocuments).length})
                        {extractedVATData?.totalSalesVAT && extractedVATData.totalSalesVAT > 0 && (
                          <span className="ml-2 text-sm font-normal text-[#2A7A8F]">
                            Total VAT: {formatCurrency(extractedVATData.totalSalesVAT)}
                          </span>
                        )}
                      </h4>
                      <div className="space-y-3">
                        {categorizeSalesDocuments(uploadedDocuments)
                          .map((document) => {
                            // Find VAT data for this document - check sales documents only
                            let docVATData = extractedVATData?.salesDocuments?.find((vatDoc: any) => vatDoc.id === document.id);
                            
                            const vatAmounts = docVATData?.extractedAmounts || [];
                            const confidence = docVATData?.confidence || 0;
                            const totalVAT = vatAmounts.reduce((sum: number, amount: number) => sum + amount, 0);
                            
                            return (
                              <div key={document.id} className="flex items-center justify-between p-4 bg-[#E6F4FF] rounded-lg border border-[#99D3FF]">
                                <div className="flex items-center space-x-4">
                                  <div className="flex-shrink-0">
                                    {document.mimeType?.includes('pdf') ? (
                                      <FileText className="h-8 w-8 text-red-500" />
                                    ) : document.mimeType?.includes('image') ? (
                                      <FileText className="h-8 w-8 text-[#8FD0FC]" />
                                    ) : (
                                      <FileText className="h-8 w-8 text-green-500" />
                                    )}
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-normal text-gray-900 truncate">
                                      {document.originalName || document.fileName}
                                    </p>
                                    <div className="flex items-center space-x-4 mt-1">
                                      <p className="text-xs text-gray-500">
                                        {Math.round(document.fileSize / 1024)}KB
                                      </p>
                                      
                                      {/* Enhanced VAT Amount Display with Quality Indicators */}
                                      {document.isScanned && docVATData && vatAmounts.length > 0 && (
                                        <div className="flex flex-col space-y-1">
                                          <div className="flex items-center text-xs">
                                            <span className="inline-flex items-center text-[#216477] font-normal">
                                              <CheckCircle className="h-3 w-3 mr-1" />
                                              VAT: {formatCurrency(totalVAT)} • {Math.round(confidence * 100)}% confidence
                                            </span>
                                          </div>
                                          
                                          {/* Quality Score Indicator */}
                                          {(document as any).processingInfo?.qualityScore && (
                                            <div className="flex items-center text-xs">
                                              <div className="flex items-center mr-2">
                                                {(document as any).processingInfo.qualityScore >= 80 ? (
                                                  <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
                                                ) : (document as any).processingInfo.qualityScore >= 60 ? (
                                                  <AlertCircle className="h-3 w-3 text-yellow-600 mr-1" />
                                                ) : (
                                                  <AlertCircle className="h-3 w-3 text-red-600 mr-1" />
                                                )}
                                                <span className={`font-normal ${
                                                  (document as any).processingInfo.qualityScore >= 80 ? 'text-green-600' :
                                                  (document as any).processingInfo.qualityScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                                                }`}>
                                                  Quality: {(document as any).processingInfo.qualityScore}/100
                                                </span>
                                              </div>
                                              
                                              {/* Irish VAT Compliance Indicator */}
                                              {(document as any).processingInfo?.irishVATCompliant && (
                                                <span className="inline-flex items-center text-green-600 text-xs ml-2">
                                                  <span className="mr-1">🇮🇪</span>
                                                  Irish VAT Compliant
                                                </span>
                                              )}
                                              
                                              {/* Processing Engine Indicator */}
                                              {(document as any).processingInfo?.engine === 'enhanced' && (
                                                <span className="inline-flex items-center text-[#2A7A8F] text-xs ml-2">
                                                  <span className="mr-1">🚀</span>
                                                  Enhanced AI
                                                </span>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                      
                                      {document.isScanned && (!docVATData || vatAmounts.length === 0) && (
                                        <div className="flex items-center justify-between">
                                          <span className="inline-flex items-center text-green-600 text-xs">
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            AI Processed
                                          </span>
                                          
                                          {/* Quality indicator for processed documents without VAT */}
                                          {(document as any).processingInfo?.qualityScore && (
                                            <span className={`text-xs font-normal ${
                                              (document as any).processingInfo.qualityScore >= 60 ? 'text-green-600' : 'text-yellow-600'
                                            }`}>
                                              Quality: {(document as any).processingInfo.qualityScore}/100
                                            </span>
                                          )}
                                        </div>
                                      )}
                                      
                                      {!document.isScanned && (
                                        <div className="flex items-center">
                                          <span className="inline-flex items-center text-yellow-600 text-xs">
                                            <div className="animate-spin rounded-full h-3 w-3 border border-yellow-600 border-t-transparent mr-2"></div>
                                            AI Processing...
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewDocument(document)}
                                    className="text-[#8FD0FC] hover:text-[#216477] hover:bg-[#E6F4FF]"
                                    title="Review Document"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {/* Purchase Documents List */}
                  {categorizePurchaseDocuments(uploadedDocuments).length > 0 && (
                    <div>
                      <h4 className="text-md font-normal text-green-900 mb-3 flex items-center">
                        <div className="w-3 h-3 bg-green-600 rounded-full mr-2"></div>
                        Purchase Documents ({categorizePurchaseDocuments(uploadedDocuments).length})
                        {extractedVATData?.totalPurchaseVAT && extractedVATData.totalPurchaseVAT > 0 && (
                          <span className="ml-2 text-sm font-normal text-green-600">
                            Total VAT: {formatCurrency(extractedVATData.totalPurchaseVAT)}
                          </span>
                        )}
                      </h4>
                      <div className="space-y-3">
                        {categorizePurchaseDocuments(uploadedDocuments)
                          .map((document) => {
                            // Find VAT data for this document - check purchase documents only
                            let docVATData = extractedVATData?.purchaseDocuments?.find((vatDoc: any) => vatDoc.id === document.id);
                            
                            const vatAmounts = docVATData?.extractedAmounts || [];
                            const confidence = docVATData?.confidence || 0;
                            const totalVAT = vatAmounts.reduce((sum: number, amount: number) => sum + amount, 0);
                            
                            return (
                              <div key={document.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                                <div className="flex items-center space-x-4">
                                  <div className="flex-shrink-0">
                                    {document.mimeType?.includes('pdf') ? (
                                      <FileText className="h-8 w-8 text-red-500" />
                                    ) : document.mimeType?.includes('image') ? (
                                      <FileText className="h-8 w-8 text-[#8FD0FC]" />
                                    ) : (
                                      <FileText className="h-8 w-8 text-green-500" />
                                    )}
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-normal text-gray-900 truncate">
                                      {document.originalName || document.fileName}
                                    </p>
                                    <div className="flex items-center space-x-4 mt-1">
                                      <p className="text-xs text-gray-500">
                                        {Math.round(document.fileSize / 1024)}KB
                                      </p>
                                      
                                      {/* VAT Amount Display */}
                                      {document.isScanned && docVATData && vatAmounts.length > 0 && (
                                        <div className="flex items-center text-xs">
                                          <span className="inline-flex items-center text-green-700 font-normal">
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            VAT: {formatCurrency(totalVAT)} detected ({Math.round(confidence * 100)}% confidence)
                                          </span>
                                        </div>
                                      )}
                                      
                                      {document.isScanned && (!docVATData || vatAmounts.length === 0) && (
                                        <span className="inline-flex items-center text-green-600 text-xs">
                                          <CheckCircle className="h-3 w-3 mr-1" />
                                          AI Processed
                                        </span>
                                      )}
                                      
                                      {!document.isScanned && (
                                        <span className="inline-flex items-center text-yellow-600 text-xs">
                                          <AlertCircle className="h-3 w-3 mr-1" />
                                          Processing...
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewDocument(document)}
                                    className="text-[#8FD0FC] hover:text-[#216477] hover:bg-[#E6F4FF]"
                                    title="Review Document"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Other Documents Section (if any exist that aren't SALES or PURCHASE) */}
            {uploadedDocuments.filter(doc => !doc.category?.includes('SALES') && !doc.category?.includes('PURCHASE')).length > 0 && (
              <Card className="card-modern border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-normal text-gray-900 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-gray-600" />
                    Other Documents ({uploadedDocuments.filter(doc => !doc.category?.includes('SALES') && !doc.category?.includes('PURCHASE')).length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {uploadedDocuments
                      .filter(doc => !doc.category?.includes('SALES') && !doc.category?.includes('PURCHASE'))
                      .map((document) => (
                        <div key={document.id} className="flex items-center justify-between p-4 bg-gray-100 rounded-lg border">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              {document.mimeType?.includes('pdf') ? (
                                <FileText className="h-8 w-8 text-red-500" />
                              ) : document.mimeType?.includes('image') ? (
                                <FileText className="h-8 w-8 text-[#8FD0FC]" />
                              ) : (
                                <FileText className="h-8 w-8 text-green-500" />
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-normal text-gray-900 truncate">
                                {document.originalName || document.fileName}
                              </p>
                              <div className="flex items-center space-x-4 mt-1">
                                <p className="text-xs text-gray-500">
                                  {Math.round(document.fileSize / 1024)}KB • {document.category?.replace('_', ' ')}
                                </p>
                                {document.isScanned && (
                                  <span className="inline-flex items-center text-green-600 text-xs">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    AI Processed
                                  </span>
                                )}
                                {!document.isScanned && (
                                  <span className="inline-flex items-center text-yellow-600 text-xs">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Processing...
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDocument(document.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* VAT Data Extracted from Documents - Moved from top */}
            {extractedVATData && extractedVATData.processedDocuments > 0 && (
              <Card className="card-premium ">
                <CardHeader>
                  <CardTitle className="text-lg font-normal text-blue-900 flex items-center">
                    <BadgeCheck className="h-5 w-5 mr-2 text-[#2A7A8F]" />
                    VAT Data Extracted from Documents
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-3 rounded-lg border border-[#99D3FF]">
                      <div className="text-sm text-gray-600">Sales VAT</div>
                      <div className="text-lg font-normal text-[#2A7A8F]">
{formatCurrency(extractedVATData.totalSalesVAT)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {extractedVATData.salesDocuments.length} document(s)
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg border border-[#99D3FF]">
                      <div className="text-sm text-gray-600">Purchase VAT</div>
                      <div className="text-lg font-normal text-[#2A7A8F]">
{formatCurrency(extractedVATData.totalPurchaseVAT)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {extractedVATData.purchaseDocuments.length} document(s)
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg border border-[#99D3FF]">
                      <div className="text-sm text-gray-600">Confidence</div>
                      <div className="text-lg font-normal text-[#2A7A8F]">
                        {(extractedVATData.averageConfidence * 100).toFixed(0)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {extractedVATData.processedDocuments} processed
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      onClick={useExtractedVATData}
                      className="bg-[#2A7A8F] hover:bg-[#2A7A8F] text-white"
                      disabled={useExtractedData}
                    >
                      <Calculator className="h-4 w-4 mr-2" />
                      {useExtractedData ? 'Using Extracted Data' : 'Use Extracted Amounts'}
                    </Button>
                    
                    <Button 
                      onClick={() => {
                        console.log('🔄 FRONTEND: Manual refresh button clicked')
                        setIsRefreshDisabled(true)
                        loadExtractedVATData(true).finally(() => {
                          // Re-enable refresh button after 3 seconds
                          setTimeout(() => setIsRefreshDisabled(false), 3000)
                        })
                      }}
                      variant="outline" 
                      className="border-[#99D3FF] text-[#216477]"
                      disabled={loadingExtractedData || isRefreshDisabled}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${loadingExtractedData ? 'animate-spin' : ''}`} />
                      {isRefreshDisabled ? 'Wait...' : 'Refresh'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* VAT Calculation - Moved from top */}
            <Card className="card-modern ">
              <CardHeader>
                <CardTitle className="text-lg font-normal text-foreground flex items-center">
                  <Calculator className="h-5 w-5 mr-2 text-[#2A7A8F]" />
                  VAT Calculation
                  {useExtractedData && (
                    <Badge className="ml-2 bg-[#CCE7FF] text-[#004A75]">
                      From Documents
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="sales-vat" className="text-gray-700 font-normal">
                      VAT on Sales (Output VAT)
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                      <Input
                        id="sales-vat"
                        type="text"
                        value={salesVAT}
                        onChange={(e) => {
                          setSalesVAT(e.target.value)
                          // Update context with new value
                          const salesValue = parseFloat(e.target.value) || 0
                          const purchaseValue = parseFloat(purchaseVAT) || 0
                          setVATAmounts(salesValue, purchaseValue)
                        }}
                        className="pl-8 bg-white border-gray-300 focus:border-[#2A7A8F] focus:ring-[#2A7A8F]"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Total VAT collected on sales</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="purchase-vat" className="text-gray-700 font-normal">
                      VAT on Purchases (Input VAT)
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                      <Input
                        id="purchase-vat"
                        type="text"
                        value={purchaseVAT}
                        onChange={(e) => {
                          setPurchaseVAT(e.target.value)
                          // Update context with new value
                          const salesValue = parseFloat(salesVAT) || 0
                          const purchaseValue = parseFloat(e.target.value) || 0
                          setVATAmounts(salesValue, purchaseValue)
                        }}
                        className="pl-8 bg-white border-gray-300 focus:border-[#2A7A8F] focus:ring-[#2A7A8F]"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Total VAT paid on purchases</p>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <div className="bg-[#E6F4FF] border border-[#99D3FF] rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-lg font-normal text-blue-900">Net VAT Due</Label>
                        <p className="text-sm text-[#216477]">Amount to pay to Revenue</p>
                      </div>
                      <div className="text-3xl font-normal text-[#2A7A8F]">€{netVAT}</div>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={calculateNetVAT}
                  className="w-full bg-[#2A7A8F] hover:bg-[#2A7A8F] text-white"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Recalculate VAT
                </Button>
              </CardContent>
            </Card>
            
            {/* Return Summary Panel - Moved from Sidebar */}
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="text-lg font-normal text-foreground">Return Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Period:</span>
                  <span className="font-normal">{selectedPeriod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Due Date:</span>
                  <span className="font-normal text-red-600">{dueDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                    Draft
                  </Badge>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-normal">
                    <span>Total Due:</span>
                    <span className="text-[#2A7A8F]">€{netVAT}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Ready to Submit Section - Moved from Sidebar */}
            <Card className="bg-gradient-to-r from-[#E6F4FF] to-[#CCE7FF] border-[#99D3FF]">
              <CardHeader className="text-center">
                <CardTitle className="text-xl font-normal text-blue-900">Ready to Submit?</CardTitle>
                <p className="text-[#216477] text-sm">Review your VAT return and submit to Revenue Ireland</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Summary info */}
                <div className="bg-white/70 rounded-lg p-4 border border-[#B8DDF6]">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Period</div>
                      <div className="font-normal">{displayPeriod}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Net VAT Due</div>
                      <div className="font-normal text-[#2A7A8F] text-lg">€{netVAT}</div>
                    </div>
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full bg-white/50 border-[#99D3FF] text-[#216477] hover:bg-white/80 justify-start text-base py-6"
                  >
                    <FileText className="h-5 w-5 mr-3" />
                    Save as Draft
                  </Button>
                  <Button 
                    className="w-full bg-[#2A7A8F] hover:bg-[#216477] text-white justify-start text-base py-6 shadow-lg"
                    onClick={() => {
                      // Save current VAT amounts to context before navigating
                      const salesValue = parseFloat(salesVAT) || 0
                      const purchaseValue = parseFloat(purchaseVAT) || 0
                      setVATAmounts(salesValue, purchaseValue)
                      
                      // Navigate to VAT3 return page
                      setTimeout(() => {
                        router.push('/vat3-return')
                      }, 100) // Small delay to ensure context updates
                    }}
                  >
                    <CheckCircle className="h-5 w-5 mr-3" />
                    Submit VAT Return
                  </Button>
                </div>
                
                <div className="text-xs text-[#216477] text-center mt-4">
                  ✓ Secure submission via ROS  ✓ Automatic filing confirmation
                </div>
              </CardContent>
            </Card>
        </div>
      </div>

      {/* Document Viewer Modal */}
      <DocumentViewer
        isOpen={documentViewerOpen}
        onClose={handleCloseDocumentViewer}
        document={selectedDocument}
        extractedVAT={selectedDocument ? getDocumentVATExtraction(selectedDocument.id) : null}
        onVATCorrection={handleVATCorrection}
      />

      {/* Footer */}
      <Footer />
    </div>
  )
}