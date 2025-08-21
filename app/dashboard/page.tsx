"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, TrendingUp, TrendingDown, Search, Filter, X, ArrowUpDown, Home, Calculator, CheckCircle, RefreshCw, Eye, AlertCircle, Loader2, Video, Play, Calendar, Clock, ArrowRight } from 'lucide-react'
import FileUpload from "@/components/file-upload"
import DocumentViewer from "@/components/document-viewer"
import { VideoModal } from "@/components/video-modal"
import { toast } from "sonner"
import { logger } from "@/lib/logger"
import { useVATData } from "@/contexts/vat-data-context"
import { formatCurrency } from "@/lib/vatUtils"

interface UserProfile {
  id: string
  email: string
  businessName: string
  vatNumber: string
  firstName?: string
  lastName?: string
}

export default function Dashboard() {
  const { selectedYear, selectedPeriod, setVATAmounts } = useVATData()
  const router = useRouter()
  const currentYear = new Date().getFullYear()
  
  // State for filtering and search
  const [selectedFilterYear, setSelectedFilterYear] = useState<string>(currentYear.toString())
  const [selectedMonth, setSelectedMonth] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"date" | "name">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  
  // Document and VAT data state
  const [extractedVATData, setExtractedVATData] = useState<any>(null)
  const [loadingExtractedData, setLoadingExtractedData] = useState(false)
  const [uploadedDocuments, setUploadedDocuments] = useState<any[]>([])
  const [loadingDocuments, setLoadingDocuments] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [userLoading, setUserLoading] = useState(true)
  const [userError, setUserError] = useState<string | null>(null)
  
  // Document viewer state
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null)
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false)
  
  // Video modal state
  const [showVideoModal, setShowVideoModal] = useState(false)
  
  // Past VAT submissions state
  const [pastSubmissions, setPastSubmissions] = useState<any[]>([])
  const [loadingSubmissions, setLoadingSubmissions] = useState(false)
  
  // Rate limiting and debouncing state
  const [lastFetchTime, setLastFetchTime] = useState(0)
  const [fetchTimeout, setFetchTimeout] = useState<NodeJS.Timeout | null>(null)
  const [isRefreshDisabled, setIsRefreshDisabled] = useState(false)
  const [autoPopulateTimeout, setAutoPopulateTimeout] = useState<NodeJS.Timeout | null>(null)
  
  // Batch upload state
  const [enableBatchMode] = useState(true)
  const [maxConcurrentUploads] = useState(3)

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  // Load data on component mount
  useEffect(() => {
    fetchUserProfile()
    loadExtractedVATData()
    loadUploadedDocuments()
    loadPastSubmissions()
    
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

  // Monitor changes to extracted VAT data
  useEffect(() => {
    console.log('🔄 DASHBOARD: extractedVATData state changed:', extractedVATData)
    if (extractedVATData) {
      console.log('📊 DASHBOARD: New extracted VAT data details:', {
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
        setUser(null)
        setUserError(null)
      } else {
        setUserError('Failed to fetch user profile')
      }
    } catch (err) {
      console.log('Authentication check failed:', err)
      setUser(null)
      setUserError(null)
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
    if (fetchTimeout) {
      clearTimeout(fetchTimeout)
    }
    if (autoPopulateTimeout) {
      clearTimeout(autoPopulateTimeout)
    }
    
    const timeout = setTimeout(() => {
      console.log('🔄 DASHBOARD: Executing debounced VAT data refresh')
      loadExtractedVATData(true).then(() => {
        if (enableAutoPopulate) {
          const populateTimeout = setTimeout(() => {
            if (extractedVATData && extractedVATData.processedDocuments > 0) {
              console.log('✅ DASHBOARD: Auto-populating with extracted VAT data')
              setVATAmounts(extractedVATData.totalSalesVAT, extractedVATData.totalPurchaseVAT)
            }
          }, 1000)
          setAutoPopulateTimeout(populateTimeout)
        }
      })
    }, delay)
    
    setFetchTimeout(timeout)
  }

  const loadUploadedDocuments = async () => {
    try {
      setLoadingDocuments(true)
      const response = await fetch('/api/documents?dashboard=true')
      
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.documents) {
          setUploadedDocuments(result.documents)
          logger.info('Loaded uploaded documents', { count: result.documents.length }, 'DASHBOARD')
        }
      }
    } catch (error) {
      logger.error('Failed to load uploaded documents', error, 'DASHBOARD')
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
        setUploadedDocuments(prev => prev.filter(doc => doc.id !== documentId))
        debouncedRefreshVATData(1000)
        toast.success('Document removed successfully')
        logger.info('Document removed successfully', { documentId }, 'DASHBOARD')
      } else {
        const result = await response.json()
        toast.error('Failed to remove document: ' + (result.error || 'Unknown error'))
        logger.error('Failed to remove document', result.error, 'DASHBOARD')
      }
    } catch (error) {
      toast.error('Network error occurred while removing document')
      logger.error('Delete error', error, 'DASHBOARD')
    }
  }

  const loadPastSubmissions = async () => {
    try {
      setLoadingSubmissions(true)
      const response = await fetch('/api/vat')
      
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.vatReturns) {
          setPastSubmissions(result.vatReturns)
          logger.info('Loaded past VAT submissions', { count: result.vatReturns.length }, 'DASHBOARD')
        }
      }
    } catch (error) {
      logger.error('Failed to load past submissions', error, 'DASHBOARD')
    } finally {
      setLoadingSubmissions(false)
    }
  }

  const loadExtractedVATData = async (forceRefresh = false): Promise<any> => {
    try {
      const MIN_INTERVAL = 2000
      const now = Date.now()
      if (!forceRefresh && (now - lastFetchTime) < MIN_INTERVAL) {
        console.log('⏳ DASHBOARD: Skipping request due to rate limiting')
        return extractedVATData
      }
      
      if (loadingExtractedData) {
        console.log('⏳ DASHBOARD: Request already in progress, skipping')
        return extractedVATData
      }
      
      setLoadingExtractedData(true)
      setLastFetchTime(now)
      console.log('🔍 DASHBOARD: Loading extracted VAT data...')
      
      const response = await fetch(`/api/documents/extracted-vat?t=${now}`)
      console.log('🌐 DASHBOARD: API response status:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('📊 DASHBOARD: Raw API response:', JSON.stringify(result, null, 2))
        
        if (result.success && result.extractedVAT) {
          console.log('✅ DASHBOARD: Setting extracted VAT data:', {
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
          console.log('❌ DASHBOARD: API response indicates failure or no data:', {
            success: result.success,
            hasExtractedVAT: !!result.extractedVAT
          })
          return null
        }
      } else {
        console.log('❌ DASHBOARD: API request failed:', response.status, response.statusText)
        return null
      }
    } catch (error) {
      console.error('🚨 DASHBOARD: Error loading extracted VAT data:', error)
      logger.error('Failed to load extracted VAT data', error, 'DASHBOARD')
      return null
    } finally {
      setLoadingExtractedData(false)
      console.log('🏁 DASHBOARD: Finished loading extracted VAT data')
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

  // Filter and sort documents
  const filteredAndSortedDocuments = uploadedDocuments.filter((doc) => {
    const docDate = new Date(doc.uploadedAt || doc.extractedDate || new Date())
    const docYear = docDate.getFullYear().toString()
    const docMonth = (docDate.getMonth() + 1).toString()

    // Filter by year
    if (selectedFilterYear !== "all" && docYear !== selectedFilterYear) return false

    // Filter by month
    if (selectedMonth !== "all" && docMonth !== selectedMonth) return false

    // Filter by search query
    if (searchQuery && !doc.originalName?.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !doc.fileName?.toLowerCase().includes(searchQuery.toLowerCase())) return false

    return true
  }).sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case "date":
        const dateA = new Date(a.uploadedAt || a.extractedDate || new Date())
        const dateB = new Date(b.uploadedAt || b.extractedDate || new Date())
        comparison = dateA.getTime() - dateB.getTime()
        break
      case "name":
        const nameA = a.originalName || a.fileName || ''
        const nameB = b.originalName || b.fileName || ''
        comparison = nameA.localeCompare(nameB)
        break
    }

    return sortOrder === "asc" ? comparison : -comparison
  })

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

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-[#5BADEA]" />
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
              <span className="text-lg font-medium text-red-800">Error Loading Dashboard</span>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#0072B1] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold font-mono">Don't Be Like Me!</h1>
              <p className="text-blue-100 text-sm">Document Management Dashboard</p>
            </div>
            <Button 
              variant="secondary" 
              className="bg-white text-[#0072B1] hover:bg-gray-100"
              onClick={() => router.push('/')}
            >
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Watch Demo Video Section */}
          <Card className="bg-gradient-to-r from-[#E6F4FF] to-[#CCE7FF] border-[#99D3FF]">
            <CardContent className="p-6">
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-3">
                    <Video className="h-8 w-8 text-[#73C2FB] mr-3" />
                    <h2 className="text-2xl font-bold text-blue-900">Learn How It Works</h2>
                  </div>
                  <p className="text-[#5BADEA] mb-4 text-lg">
                    Watch our demo to see how easy VAT submission can be
                  </p>
                  <Button 
                    onClick={() => setShowVideoModal(true)}
                    size="lg"
                    className="bg-[#73C2FB] hover:bg-[#5BADEA] text-white px-8 py-3 text-lg font-semibold"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Watch Demo Video
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Past VAT Submissions Section */}
          {!userLoading && user && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#0072B1]">
                  <Calendar className="h-5 w-5" />
                  Past VAT Submissions
                  {pastSubmissions.length > 0 && (
                    <span className="bg-[#0072B1] text-white text-xs rounded-full px-2 py-1">
                      {pastSubmissions.length}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingSubmissions ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-[#5BADEA]" />
                    <span className="ml-2 text-gray-600">Loading submissions...</span>
                  </div>
                ) : pastSubmissions.length > 0 ? (
                  <div className="space-y-3">
                    {pastSubmissions.slice(0, 5).map((submission) => (
                      <div key={submission.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <Calendar className="h-8 w-8 text-[#0072B1]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(submission.periodStart).toLocaleDateString()} - {new Date(submission.periodEnd).toLocaleDateString()}
                            </p>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                submission.status === 'SUBMITTED' ? 'bg-green-100 text-green-800' :
                                submission.status === 'PAID' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {submission.status}
                              </span>
                              <span className="text-xs text-gray-500">
                                Sales: {formatCurrency(submission.salesVAT)} • Purchase: {formatCurrency(submission.purchaseVAT)} • Net: {formatCurrency(submission.netVAT)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/vat-submission?returnId=${submission.id}`)}
                            className="text-[#0072B1] border-[#0072B1] hover:bg-[#E6F4FF]"
                          >
                            {submission.status === 'DRAFT' ? 'Continue' : 'View'}
                            <ArrowRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {pastSubmissions.length > 5 && (
                      <div className="text-center pt-4">
                        <Button variant="outline" onClick={() => router.push('/submit-return')}>
                          View All Submissions ({pastSubmissions.length})
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No VAT Submissions Yet</h3>
                    <p className="text-gray-500 mb-4">
                      Start by uploading your documents and creating your first VAT submission
                    </p>
                    <Button 
                      onClick={() => router.push('/vat-submission')}
                      className="bg-[#0072B1] hover:bg-[#005A8D] text-white"
                    >
                      Create New VAT Submission
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Sales Documents Section */}
          <Card className="card-modern border-[#99D3FF]">
            <CardHeader className="bg-[#E6F4FF]">
              <CardTitle className="text-lg font-semibold text-blue-900 flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-[#73C2FB]" />
                  Sales Documents {uploadedDocuments.filter(doc => doc.category?.includes('SALES')).length > 0 && (
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
                  enableBatchMode={enableBatchMode}
                  maxConcurrentUploads={maxConcurrentUploads}
                  showBatchProgress={true}
                  onUploadSuccess={(doc) => {
                    console.log('📤 DASHBOARD: Sales document uploaded:', doc.fileName)
                    logger.info('Sales document uploaded', { fileName: doc.fileName }, 'DASHBOARD')
                    setUploadedDocuments(prev => [...prev, doc])
                    
                    console.log('⏳ DASHBOARD: Document uploaded, scheduling debounced VAT data refresh...')
                    debouncedRefreshVATData(5000, true)
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Purchase Documents Section */}
          <Card className="card-modern border-green-200">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-lg font-semibold text-green-900 flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-green-600" />
                  Purchase Documents {uploadedDocuments.filter(doc => doc.category?.includes('PURCHASE')).length > 0 && (
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
                  enableBatchMode={enableBatchMode}
                  maxConcurrentUploads={maxConcurrentUploads}
                  showBatchProgress={true}
                  onUploadSuccess={(doc) => {
                    console.log('📤 DASHBOARD: Purchase document uploaded:', doc.fileName)
                    logger.info('Purchase document uploaded', { fileName: doc.fileName }, 'DASHBOARD')
                    setUploadedDocuments(prev => [...prev, doc])
                    
                    console.log('⏳ DASHBOARD: Document uploaded, scheduling debounced VAT data refresh...')
                    debouncedRefreshVATData(5000, true)
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Filters Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-[#0072B1]">
                  <Filter className="h-5 w-5" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="bg-[#0072B1] text-white text-xs rounded-full px-2 py-1">
                      {activeFiltersCount}
                    </span>
                  )}
                </CardTitle>
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Year</label>
                  <Select value={selectedFilterYear} onValueChange={setSelectedFilterYear}>
                    <SelectTrigger>
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
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Month</label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger>
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
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Sort By</label>
                  <Select value={sortBy} onValueChange={(value: "date" | "name") => setSortBy(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search documents..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSearchQuery("")}
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Sort Order:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    className="h-8"
                  >
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    {sortOrder === "asc" ? "Ascending" : "Descending"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Document List Section */}
          {(uploadedDocuments.filter(doc => doc.category?.includes('SALES')).length > 0 || 
            uploadedDocuments.filter(doc => doc.category?.includes('PURCHASE')).length > 0) && (
            <Card className="card-modern border-gray-300">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-gray-600" />
                  Uploaded Documents ({filteredAndSortedDocuments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Sales Documents List */}
                {filteredAndSortedDocuments.filter(doc => doc.category?.includes('SALES')).length > 0 && (
                  <div>
                    <h4 className="text-md font-medium text-blue-900 mb-3 flex items-center">
                      <div className="w-3 h-3 bg-[#73C2FB] rounded-full mr-2"></div>
                      Sales Documents ({filteredAndSortedDocuments.filter(doc => doc.category?.includes('SALES')).length})
                      {extractedVATData?.totalSalesVAT && extractedVATData.totalSalesVAT > 0 && (
                        <span className="ml-2 text-sm font-medium text-[#73C2FB]">
                          Total VAT: {formatCurrency(extractedVATData.totalSalesVAT)}
                        </span>
                      )}
                    </h4>
                    
                    {/* Column Headers */}
                    <div className="grid grid-cols-12 gap-4 items-center px-4 py-2 bg-gray-50 rounded-lg border-b text-xs font-medium text-gray-600 uppercase tracking-wide mb-3">
                      <div className="col-span-1 text-center">Type</div>
                      <div className="col-span-3">Document Name</div>
                      <div className="col-span-2">Date</div>
                      <div className="col-span-2">Total</div>
                      <div className="col-span-2">VAT Amount</div>
                      <div className="col-span-1">Confidence</div>
                      <div className="col-span-1 text-right">Actions</div>
                    </div>
                    
                    <div className="space-y-3">
                      {filteredAndSortedDocuments
                        .filter(doc => doc.category?.includes('SALES'))
                        .map((document) => {
                          // Find VAT data for this document
                          let docVATData = extractedVATData?.salesDocuments?.find((vatDoc: any) => vatDoc.id === document.id);
                          
                          const vatAmounts = docVATData?.extractedAmounts || [];
                          const confidence = docVATData?.confidence || 0;
                          const totalVAT = vatAmounts.reduce((sum: number, amount: number) => sum + amount, 0);
                          
                          return (
                            <div key={document.id} className="grid grid-cols-12 gap-4 items-center p-4 bg-[#E6F4FF] rounded-lg border border-[#99D3FF] hover:bg-[#DDF0FF] transition-colors">
                              {/* Icon */}
                              <div className="col-span-1 flex justify-center">
                                <FileText className="h-6 w-6 text-[#5BADEA]" />
                              </div>
                              
                              {/* Filename */}
                              <div className="col-span-3">
                                <p className="text-sm font-medium text-gray-900 truncate" title={document.originalName || document.fileName}>
                                  {document.originalName || document.fileName}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {Math.round(document.fileSize / 1024)}KB
                                </p>
                              </div>
                              
                              {/* Date */}
                              <div className="col-span-2">
                                <p className="text-sm text-gray-700">
                                  {document.extractedDate 
                                    ? new Date(document.extractedDate).toLocaleDateString('en-IE', {
                                        day: '2-digit',
                                        month: '2-digit', 
                                        year: 'numeric'
                                      })
                                    : '—'
                                  }
                                </p>
                              </div>
                              
                              {/* Total Amount */}
                              <div className="col-span-2">
                                <p className="text-sm font-medium text-gray-800">
                                  {document.invoiceTotal 
                                    ? formatCurrency(parseFloat(document.invoiceTotal.toString()))
                                    : '—'
                                  }
                                </p>
                              </div>
                              
                              {/* VAT Amount */}
                              <div className="col-span-2">
                                <p className="text-sm font-medium text-[#5BADEA]">
                                  {document.isScanned && docVATData && vatAmounts.length > 0
                                    ? formatCurrency(totalVAT)
                                    : '—'
                                  }
                                </p>
                              </div>
                              
                              {/* Confidence & Status */}
                              <div className="col-span-1">
                                {document.isScanned && docVATData && vatAmounts.length > 0 && (
                                  <span className="inline-flex items-center text-xs font-medium text-[#5BADEA]">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    {Math.round(confidence * 100)}%
                                  </span>
                                )}
                                {document.isScanned && (!docVATData || vatAmounts.length === 0) && (
                                  <span className="inline-flex items-center text-xs font-medium text-green-600">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Done
                                  </span>
                                )}
                                {!document.isScanned && (
                                  <span className="inline-flex items-center text-xs text-yellow-600">
                                    <div className="animate-spin rounded-full h-3 w-3 border border-yellow-600 border-t-transparent mr-1"></div>
                                    Processing
                                  </span>
                                )}
                              </div>
                              
                              {/* Actions */}
                              <div className="col-span-1 flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewDocument(document)}
                                  className="h-8 w-8 p-0 text-[#8FD0FC] hover:text-[#5BADEA] hover:bg-[#CCE7FF]"
                                  title="Review Document"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeDocument(document.id)}
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                  title="Remove Document"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Purchase Documents List */}
                {filteredAndSortedDocuments.filter(doc => doc.category?.includes('PURCHASE')).length > 0 && (
                  <div>
                    <h4 className="text-md font-medium text-green-900 mb-3 flex items-center">
                      <div className="w-3 h-3 bg-green-600 rounded-full mr-2"></div>
                      Purchase Documents ({filteredAndSortedDocuments.filter(doc => doc.category?.includes('PURCHASE')).length})
                      {extractedVATData?.totalPurchaseVAT && extractedVATData.totalPurchaseVAT > 0 && (
                        <span className="ml-2 text-sm font-medium text-green-600">
                          Total VAT: {formatCurrency(extractedVATData.totalPurchaseVAT)}
                        </span>
                      )}
                    </h4>
                    
                    {/* Column Headers */}
                    <div className="grid grid-cols-12 gap-4 items-center px-4 py-2 bg-gray-50 rounded-lg border-b text-xs font-medium text-gray-600 uppercase tracking-wide mb-3">
                      <div className="col-span-1 text-center">Type</div>
                      <div className="col-span-3">Document Name</div>
                      <div className="col-span-2">Date</div>
                      <div className="col-span-2">Total</div>
                      <div className="col-span-2">VAT Amount</div>
                      <div className="col-span-1">Confidence</div>
                      <div className="col-span-1 text-right">Actions</div>
                    </div>
                    
                    <div className="space-y-3">
                      {filteredAndSortedDocuments
                        .filter(doc => doc.category?.includes('PURCHASE'))
                        .map((document) => {
                          // Find VAT data for this document
                          let docVATData = extractedVATData?.purchaseDocuments?.find((vatDoc: any) => vatDoc.id === document.id);
                          
                          const vatAmounts = docVATData?.extractedAmounts || [];
                          const confidence = docVATData?.confidence || 0;
                          const totalVAT = vatAmounts.reduce((sum: number, amount: number) => sum + amount, 0);
                          
                          return (
                            <div key={document.id} className="grid grid-cols-12 gap-4 items-center p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
                              {/* Icon */}
                              <div className="col-span-1 flex justify-center">
                                <FileText className="h-6 w-6 text-green-600" />
                              </div>
                              
                              {/* Filename */}
                              <div className="col-span-3">
                                <p className="text-sm font-medium text-gray-900 truncate" title={document.originalName || document.fileName}>
                                  {document.originalName || document.fileName}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {Math.round(document.fileSize / 1024)}KB
                                </p>
                              </div>
                              
                              {/* Date */}
                              <div className="col-span-2">
                                <p className="text-sm text-gray-700">
                                  {document.extractedDate 
                                    ? new Date(document.extractedDate).toLocaleDateString('en-IE', {
                                        day: '2-digit',
                                        month: '2-digit', 
                                        year: 'numeric'
                                      })
                                    : '—'
                                  }
                                </p>
                              </div>
                              
                              {/* Total Amount */}
                              <div className="col-span-2">
                                <p className="text-sm font-medium text-gray-800">
                                  {document.invoiceTotal 
                                    ? formatCurrency(parseFloat(document.invoiceTotal.toString()))
                                    : '—'
                                  }
                                </p>
                              </div>
                              
                              {/* VAT Amount */}
                              <div className="col-span-2">
                                <p className="text-sm font-medium text-green-600">
                                  {document.isScanned && docVATData && vatAmounts.length > 0
                                    ? formatCurrency(totalVAT)
                                    : '—'
                                  }
                                </p>
                              </div>
                              
                              {/* Confidence & Status */}
                              <div className="col-span-1">
                                {document.isScanned && docVATData && vatAmounts.length > 0 && (
                                  <span className="inline-flex items-center text-xs font-medium text-green-600">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    {Math.round(confidence * 100)}%
                                  </span>
                                )}
                                {document.isScanned && (!docVATData || vatAmounts.length === 0) && (
                                  <span className="inline-flex items-center text-xs font-medium text-green-600">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Done
                                  </span>
                                )}
                                {!document.isScanned && (
                                  <span className="inline-flex items-center text-xs text-yellow-600">
                                    <div className="animate-spin rounded-full h-3 w-3 border border-yellow-600 border-t-transparent mr-1"></div>
                                    Processing
                                  </span>
                                )}
                              </div>
                              
                              {/* Actions */}
                              <div className="col-span-1 flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewDocument(document)}
                                  className="h-8 w-8 p-0 text-[#8FD0FC] hover:text-[#5BADEA] hover:bg-[#CCE7FF]"
                                  title="Review Document"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeDocument(document.id)}
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                  title="Remove Document"
                                >
                                  <X className="h-4 w-4" />
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

          {/* Empty State */}
          {!loadingDocuments && uploadedDocuments.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="flex flex-col items-center space-y-4">
                  <FileText className="h-16 w-16 text-gray-400" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Found</h3>
                    <p className="text-gray-500 mb-4">
                      Upload your first document to get started with VAT processing
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          {extractedVATData && extractedVATData.processedDocuments > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Sales VAT Total</p>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(extractedVATData.totalSalesVAT)}</p>
                      <p className="text-xs text-slate-500">{extractedVATData.salesDocuments?.length || 0} documents</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Purchase VAT Total</p>
                      <p className="text-2xl font-bold text-red-600">{formatCurrency(extractedVATData.totalPurchaseVAT)}</p>
                      <p className="text-xs text-slate-500">{extractedVATData.purchaseDocuments?.length || 0} documents</p>
                    </div>
                    <TrendingDown className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Net VAT Due</p>
                      <p className="text-2xl font-bold text-[#0072B1]">{formatCurrency(extractedVATData.totalNetVAT)}</p>
                      <p className="text-xs text-slate-500">Sales - Purchase VAT</p>
                    </div>
                    <Calculator className="h-8 w-8 text-[#0072B1]" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Document Viewer Modal */}
      <DocumentViewer
        isOpen={documentViewerOpen}
        onClose={handleCloseDocumentViewer}
        document={selectedDocument}
        extractedVAT={selectedDocument ? getDocumentVATExtraction(selectedDocument.id) : null}
        onVATCorrection={(correctionData) => {
          console.log('VAT correction submitted:', correctionData)
          // Handle VAT corrections for AI training
        }}
      />

      {/* Video Modal */}
      <VideoModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
      />
    </div>
  )
}