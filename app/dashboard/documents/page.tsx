"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calculator, FileText, CheckCircle, BadgeCheck, RefreshCw, X, AlertCircle, Loader2, Eye, Edit3, Home, Search, Filter, Trash2, Calendar, DollarSign } from 'lucide-react'
import FileUpload from "@/components/file-upload"
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

export default function DashboardDocuments() {
  const { selectedYear, selectedPeriod, setVATAmounts, totalSalesVAT: contextSalesVAT, totalPurchaseVAT: contextPurchaseVAT } = useVATData()
  const router = useRouter()
  
  // State for filtering and search
  const currentYear = new Date().getFullYear()
  const [selectedFilterYear, setSelectedFilterYear] = useState<string>(currentYear.toString())
  const [selectedMonth, setSelectedMonth] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"date" | "name">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  
  // VAT extraction and document state (copied from working vat-submission)
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
  const [isRefreshDisabled, setIsRefreshDisabled] = useState(false)
  const [autoPopulateTimeout, setAutoPopulateTimeout] = useState<NodeJS.Timeout | null>(null)
  
  // Batch upload state
  const [enableBatchMode, setEnableBatchMode] = useState(true)
  const [maxConcurrentUploads, setMaxConcurrentUploads] = useState(3)
  
  // Delete functionality state
  const [deletingDocuments, setDeletingDocuments] = useState<Set<string>>(new Set())
  const [deleteConfirmDoc, setDeleteConfirmDoc] = useState<any | null>(null)

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  // Load data on component mount
  useEffect(() => {
    fetchUserProfile()
    loadUploadedDocuments()
    loadExtractedVATData()
  }, [])

  const fetchUserProfile = async () => {
    try {
      setUserLoading(true)
      setUserError(null)
      
      const response = await fetch('/api/auth/profile', {
        method: 'GET',
        credentials: 'include'
      })
      
      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
        logger.info('User profile loaded', { userId: userData.user?.id }, 'DASHBOARD')
      } else {
        console.log('User not logged in or session expired')
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      setUserError('Failed to load user profile')
    } finally {
      setUserLoading(false)
    }
  }

  const loadUploadedDocuments = async () => {
    try {
      setLoadingDocuments(true)
      
      const response = await fetch('/api/documents?dashboard=true', {
        method: 'GET',
        credentials: 'include'
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.documents) {
          setUploadedDocuments(result.documents)
          logger.info('Documents loaded for dashboard', { count: result.documents.length }, 'DASHBOARD')
        }
      }
    } catch (error) {
      console.error('Failed to load documents:', error)
      toast.error('Failed to load documents')
    } finally {
      setLoadingDocuments(false)
    }
  }

  // Rate limiting configuration
  const MIN_INTERVAL = 3000 // 3 seconds between requests

  const loadExtractedVATData = async (forceRefresh = false) => {
    const now = Date.now()
    if (!forceRefresh && (now - lastFetchTime) < MIN_INTERVAL) {
      console.log('⏳ FRONTEND: Skipping request due to rate limiting')
      return extractedVATData
    }
    
    if (loadingExtractedData) {
      console.log('⏳ FRONTEND: Request already in progress, skipping')
      return extractedVATData
    }
    
    try {
      setLoadingExtractedData(true)
      setLastFetchTime(now)
      
      console.log('📊 FRONTEND: Loading extracted VAT data...')
      
      const response = await fetch('/api/documents/extracted-vat', {
        method: 'GET',
        credentials: 'include'
      })
      
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
          logger.info('Loaded extracted VAT data', { totalSalesVAT: result.extractedVAT.totalSalesVAT, totalPurchaseVAT: result.extractedVAT.totalPurchaseVAT }, 'DASHBOARD')
          return result.extractedVAT
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
      console.error('❌ FRONTEND: Error loading extracted VAT data:', error)
      return null
    } finally {
      setLoadingExtractedData(false)
    }
  }

  // Debounced refresh function
  const debouncedRefreshVATData = (delay = 3000, enableAutoPopulate = false) => {
    if (fetchTimeout) {
      clearTimeout(fetchTimeout)
    }
    
    if (autoPopulateTimeout) {
      clearTimeout(autoPopulateTimeout)
    }
    
    setFetchTimeout(setTimeout(async () => {
      console.log('⏳ FRONTEND: Executing debounced VAT data refresh...')
      const freshData = await loadExtractedVATData(true)
      
      // Auto-populate only if specifically requested and data is available
      if (enableAutoPopulate) {
        const populateTimeout = setTimeout(() => {
          if (extractedVATData && extractedVATData.processedDocuments > 0) {
            console.log('✅ FRONTEND: Auto-populating calculator with extracted VAT data')
            useExtractedVATData()
          }
        }, 2000) // Wait 2 seconds after data load to auto-populate
        setAutoPopulateTimeout(populateTimeout)
      }
    }, delay))
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
      
      setVATAmounts(extractedVATData.totalSalesVAT, extractedVATData.totalPurchaseVAT)
      setUseExtractedData(true)
    } else {
      console.log('❌ FRONTEND: No extractedVATData available to use')
    }
  }

  const handleDocumentView = (document: any) => {
    setSelectedDocument(document)
    setDocumentViewerOpen(true)
  }

  const handleCloseDocumentViewer = () => {
    setDocumentViewerOpen(false)
    setSelectedDocument(null)
  }

  // Helper function to get VAT extraction data for a document
  const getDocumentVATExtraction = (documentId: string) => {
    const salesDoc = extractedVATData?.salesDocuments?.find((doc: any) => doc.id === documentId)
    const purchaseDoc = extractedVATData?.purchaseDocuments?.find((doc: any) => doc.id === documentId)
    
    if (salesDoc) {
      return {
        type: 'sales',
        amounts: salesDoc.extractedAmounts || [],
        confidence: salesDoc.confidence || 0
      }
    }
    
    if (purchaseDoc) {
      return {
        type: 'purchase', 
        amounts: purchaseDoc.extractedAmounts || [],
        confidence: purchaseDoc.confidence || 0
      }
    }
    
    return null
  }

  // Helper function to parse invoice total from scanResult
  const parseInvoiceTotal = (scanResult: string | null): number | null => {
    if (!scanResult) return null
    
    // Look for various total patterns
    const totalPatterns = [
      /Total[:\s]*€?([0-9,]+\.?[0-9]*)/gi,
      /Invoice\s+Total[:\s]*€?([0-9,]+\.?[0-9]*)/gi,
      /Amount\s+Due[:\s]*€?([0-9,]+\.?[0-9]*)/gi,
      /Subtotal[:\s]*€?([0-9,]+\.?[0-9]*)/gi,
      /€([0-9,]+\.?[0-9]*)\s*(?:total|due|amount)/gi
    ]
    
    for (const pattern of totalPatterns) {
      const match = scanResult.match(pattern)
      if (match && match[1]) {
        const amount = parseFloat(match[1].replace(',', ''))
        if (!isNaN(amount) && amount > 0) {
          return amount
        }
      }
    }
    
    return null
  }

  // Helper function to format document date
  const formatDocumentDate = (date: Date | string | null): string => {
    if (!date) return '-'
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date
      return dateObj.toLocaleDateString('en-IE', { 
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch {
      return '-'
    }
  }

  // Delete document handler
  const handleDeleteDocument = async (documentId: string) => {
    try {
      setDeletingDocuments(prev => new Set(prev).add(documentId))
      
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      
      if (response.ok) {
        // Remove from local state
        setUploadedDocuments(prev => prev.filter(doc => doc.id !== documentId))
        toast.success('Document deleted successfully')
        
        // Refresh VAT data after deletion
        debouncedRefreshVATData(2000)
      } else {
        throw new Error('Failed to delete document')
      }
    } catch (error) {
      console.error('Failed to delete document:', error)
      toast.error('Failed to delete document')
    } finally {
      setDeletingDocuments(prev => {
        const newSet = new Set(prev)
        newSet.delete(documentId)
        return newSet
      })
      setDeleteConfirmDoc(null)
    }
  }

  // Filter management
  const clearFilters = () => {
    setSelectedFilterYear(currentYear.toString())
    setSelectedMonth("all")
    setSearchQuery("")
    setSortBy("date")
    setSortOrder("desc")
  }

  const activeFiltersCount = 
    (selectedFilterYear !== currentYear.toString() ? 1 : 0) +
    (selectedMonth !== "all" ? 1 : 0) +
    (searchQuery ? 1 : 0)

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <div className="text-gray-400">/</div>
              <h1 className="text-xl font-semibold text-gray-900">Document Management</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => loadExtractedVATData(true)}
                disabled={loadingExtractedData}
                className="text-brand-700 border-brand-300 hover:bg-brand-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loadingExtractedData ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Upload Areas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sales Upload */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-blue-900 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-[#73C2FB] rounded-full mr-3"></div>
                    Sales Documents
                    {uploadedDocuments.filter(doc => doc.category?.includes('SALES')).length > 0 && (
                      <>({uploadedDocuments.filter(doc => doc.category?.includes('SALES')).length})</>
                    )}
                  </div>
                  {extractedVATData?.totalSalesVAT && extractedVATData.totalSalesVAT > 0 && (
                    <div className="text-right">
                      <div className="text-sm font-medium text-[#73C2FB]">
                        Sales VAT Total: {formatCurrency(extractedVATData.totalSalesVAT)}
                      </div>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="mb-6">
                  <FileUpload
                    category="SALES"
                    title="Upload Sales Documents"
                    description="Upload sales-related documents including invoices, receipts, and payment records"
                    acceptedFiles={['.pdf', '.csv', '.xlsx', '.xls', '.jpg', '.jpeg', '.png']}
                    enableBatchMode={true}
                    maxConcurrentUploads={maxConcurrentUploads}
                    showBatchProgress={true}
                    onUploadSuccess={(doc) => {
                      console.log('📤 FRONTEND: Sales document uploaded:', doc.fileName)
                      logger.info('Sales document uploaded', { fileName: doc.fileName }, 'DASHBOARD')
                      setUploadedDocuments(prev => [...prev, doc])
                      
                      console.log('⏳ FRONTEND: Document uploaded, scheduling debounced VAT data refresh...')
                      debouncedRefreshVATData(5000, true)
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Purchase Upload */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-green-900 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-600 rounded-full mr-3"></div>
                    Purchase Documents
                    {uploadedDocuments.filter(doc => doc.category?.includes('PURCHASE')).length > 0 && (
                      <>({uploadedDocuments.filter(doc => doc.category?.includes('PURCHASE')).length})</>
                    )}
                  </div>
                  {extractedVATData?.totalPurchaseVAT && extractedVATData.totalPurchaseVAT > 0 && (
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">
                        Purchase VAT Total: {formatCurrency(extractedVATData.totalPurchaseVAT)}
                      </div>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="mb-6">
                  <FileUpload
                    category="PURCHASES"
                    title="Upload Purchase Documents"
                    description="Upload purchase-related documents including invoices, receipts, and expense records"
                    acceptedFiles={['.pdf', '.csv', '.xlsx', '.xls', '.jpg', '.jpeg', '.png']}
                    enableBatchMode={true}
                    maxConcurrentUploads={maxConcurrentUploads}
                    showBatchProgress={true}
                    onUploadSuccess={(doc) => {
                      console.log('📤 FRONTEND: Purchase document uploaded:', doc.fileName)
                      logger.info('Purchase document uploaded', { fileName: doc.fileName }, 'DASHBOARD')
                      setUploadedDocuments(prev => [...prev, doc])
                      
                      console.log('⏳ FRONTEND: Document uploaded, scheduling debounced VAT data refresh...')
                      debouncedRefreshVATData(5000, true)
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search & Filter Documents - Positioned for logical workflow */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <Filter className="h-5 w-5 mr-2 text-gray-600" />
                Search & Filter Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search documents..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedFilterYear} onValueChange={setSelectedFilterYear}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Months</SelectItem>
                    {months.map((month, index) => (
                      <SelectItem key={month} value={(index + 1).toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear ({activeFiltersCount})
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Document Table */
          {(uploadedDocuments.filter(doc => doc.category?.includes('SALES')).length > 0 || 
            uploadedDocuments.filter(doc => doc.category?.includes('PURCHASE')).length > 0) && (
            <div className="space-y-6">
              {/* Sales Documents Table */}
              {uploadedDocuments.filter(doc => doc.category?.includes('SALES')).length > 0 && (
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-blue-900 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-[#73C2FB] rounded-full mr-3"></div>
                        Sales Documents ({uploadedDocuments.filter(doc => doc.category?.includes('SALES')).length})
                      </div>
                      {extractedVATData?.totalSalesVAT && extractedVATData.totalSalesVAT > 0 && (
                        <span className="text-sm font-medium text-[#73C2FB]">
                          Total VAT: {formatCurrency(extractedVATData.totalSalesVAT)}
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Document Name</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">File Size</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date on Doc</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Total on Doc</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">VAT Amount</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Confidence</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">AI Status</th>
                            <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {uploadedDocuments
                            .filter(doc => doc.category?.includes('SALES'))
                            .map((document) => {
                              const docVATData = extractedVATData?.salesDocuments?.find((vatDoc: any) => vatDoc.id === document.id)
                              const vatAmounts = docVATData?.extractedAmounts || []
                              const confidence = docVATData?.confidence || 0
                              const totalVAT = vatAmounts.reduce((sum: number, amount: number) => sum + amount, 0)
                              const invoiceTotal = parseInvoiceTotal(document.scanResult)
                              const isDeleting = deletingDocuments.has(document.id)
                              
                              return (
                                <tr key={document.id} className="border-b border-gray-100 hover:bg-[#E6F4FF] transition-colors">
                                  <td className="py-3 px-4">
                                    <div className="flex items-center">
                                      <FileText className="h-5 w-5 text-[#73C2FB] mr-3" />
                                      <div>
                                        <p className="text-sm font-medium text-gray-900 truncate max-w-48">
                                          {document.originalName || document.fileName}
                                        </p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 text-sm text-gray-600">
                                    {Math.round(document.fileSize / 1024)}KB
                                  </td>
                                  <td className="py-3 px-4 text-sm text-gray-600">
                                    <div className="flex items-center">
                                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                      {formatDocumentDate(document.extractedDate)}
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 text-sm text-gray-600">
                                    <div className="flex items-center">
                                      <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                                      {invoiceTotal ? formatCurrency(invoiceTotal) : '-'}
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 text-sm font-medium text-[#73C2FB]">
                                    {totalVAT > 0 ? formatCurrency(totalVAT) : '-'}
                                  </td>
                                  <td className="py-3 px-4 text-sm text-gray-600">
                                    {confidence > 0 ? `${Math.round(confidence * 100)}%` : '-'}
                                  </td>
                                  <td className="py-3 px-4">
                                    {document.isScanned ? (
                                      <span className="inline-flex items-center text-green-600 text-xs">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Processed
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center text-yellow-600 text-xs">
                                        <div className="animate-spin rounded-full h-3 w-3 border border-yellow-600 border-t-transparent mr-2"></div>
                                        Processing...
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="flex items-center justify-center space-x-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDocumentView(document)}
                                        className="text-[#73C2FB] border-[#73C2FB] hover:bg-[#73C2FB] hover:text-white"
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setDeleteConfirmDoc(document)}
                                        disabled={isDeleting}
                                        className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                                      >
                                        {isDeleting ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <Trash2 className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              )
                            })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Purchase Documents Table */}
              {uploadedDocuments.filter(doc => doc.category?.includes('PURCHASE')).length > 0 && (
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-green-900 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-600 rounded-full mr-3"></div>
                        Purchase Documents ({uploadedDocuments.filter(doc => doc.category?.includes('PURCHASE')).length})
                      </div>
                      {extractedVATData?.totalPurchaseVAT && extractedVATData.totalPurchaseVAT > 0 && (
                        <span className="text-sm font-medium text-green-600">
                          Total VAT: {formatCurrency(extractedVATData.totalPurchaseVAT)}
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Document Name</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">File Size</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date on Doc</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Total on Doc</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">VAT Amount</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Confidence</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">AI Status</th>
                            <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {uploadedDocuments
                            .filter(doc => doc.category?.includes('PURCHASE'))
                            .map((document) => {
                              const docVATData = extractedVATData?.purchaseDocuments?.find((vatDoc: any) => vatDoc.id === document.id)
                              const vatAmounts = docVATData?.extractedAmounts || []
                              const confidence = docVATData?.confidence || 0
                              const totalVAT = vatAmounts.reduce((sum: number, amount: number) => sum + amount, 0)
                              const invoiceTotal = parseInvoiceTotal(document.scanResult)
                              const isDeleting = deletingDocuments.has(document.id)
                              
                              return (
                                <tr key={document.id} className="border-b border-gray-100 hover:bg-green-50 transition-colors">
                                  <td className="py-3 px-4">
                                    <div className="flex items-center">
                                      <FileText className="h-5 w-5 text-green-600 mr-3" />
                                      <div>
                                        <p className="text-sm font-medium text-gray-900 truncate max-w-48">
                                          {document.originalName || document.fileName}
                                        </p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 text-sm text-gray-600">
                                    {Math.round(document.fileSize / 1024)}KB
                                  </td>
                                  <td className="py-3 px-4 text-sm text-gray-600">
                                    <div className="flex items-center">
                                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                      {formatDocumentDate(document.extractedDate)}
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 text-sm text-gray-600">
                                    <div className="flex items-center">
                                      <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                                      {invoiceTotal ? formatCurrency(invoiceTotal) : '-'}
                                    </div>
                                  </td>
                                  <td className="py-3 px-4 text-sm font-medium text-green-700">
                                    {totalVAT > 0 ? formatCurrency(totalVAT) : '-'}
                                  </td>
                                  <td className="py-3 px-4 text-sm text-gray-600">
                                    {confidence > 0 ? `${Math.round(confidence * 100)}%` : '-'}
                                  </td>
                                  <td className="py-3 px-4">
                                    {document.isScanned ? (
                                      <span className="inline-flex items-center text-green-600 text-xs">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Processed
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center text-yellow-600 text-xs">
                                        <div className="animate-spin rounded-full h-3 w-3 border border-yellow-600 border-t-transparent mr-2"></div>
                                        Processing...
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="flex items-center justify-center space-x-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleDocumentView(document)}
                                        className="text-green-700 border-green-700 hover:bg-green-700 hover:text-white"
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setDeleteConfirmDoc(document)}
                                        disabled={isDeleting}
                                        className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                                      >
                                        {isDeleting ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <Trash2 className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              )
                            })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* VAT Data Extracted from Documents */}
          {extractedVATData && extractedVATData.processedDocuments > 0 && (
            <Card className="bg-gradient-to-r from-[#E6F4FF] to-[#F0F8FF] border-[#73C2FB]">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-blue-900 flex items-center">
                  <Calculator className="h-5 w-5 mr-2 text-[#73C2FB]" />
                  AI-Extracted VAT Summary
                  <Badge variant="secondary" className="ml-2 bg-[#73C2FB] text-white">
                    {extractedVATData.processedDocuments} documents processed
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-3 rounded-lg border border-[#99D3FF]">
                    <div className="text-sm text-gray-600">Sales VAT</div>
                    <div className="text-lg font-semibold text-[#73C2FB]">
                      {formatCurrency(extractedVATData.totalSalesVAT)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {extractedVATData.salesDocuments.length} document(s)
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border border-[#99D3FF]">
                    <div className="text-sm text-gray-600">Purchase VAT</div>
                    <div className="text-lg font-semibold text-[#73C2FB]">
                      {formatCurrency(extractedVATData.totalPurchaseVAT)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {extractedVATData.purchaseDocuments.length} document(s)
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded-lg border border-[#99D3FF]">
                    <div className="text-sm text-gray-600">Confidence</div>
                    <div className="text-lg font-semibold text-[#73C2FB]">
                      {(extractedVATData.averageConfidence * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {extractedVATData.processedDocuments} processed
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </div>

      {/* Document Viewer Modal */}
      <DocumentViewer
        isOpen={documentViewerOpen}
        onClose={handleCloseDocumentViewer}
        document={selectedDocument}
        extractedVAT={selectedDocument ? getDocumentVATExtraction(selectedDocument.id) : null}
      />

      {/* Delete Confirmation Dialog */}
      {deleteConfirmDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="bg-white max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
                Delete Document
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to delete "{deleteConfirmDoc.originalName || deleteConfirmDoc.fileName}"? 
                This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirmDoc(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteDocument(deleteConfirmDoc.id)}
                  disabled={deletingDocuments.has(deleteConfirmDoc.id)}
                >
                  {deletingDocuments.has(deleteConfirmDoc.id) ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}