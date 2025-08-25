"use client"

import React, { useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, X, ArrowUpDown, Home, RefreshCw, Video, Play, Calendar, Clock, ArrowRight, Search, FileText, Loader2, AlertCircle, CheckCircle, Eye, ChevronDown, ChevronUp, TrendingUp, ShoppingCart } from 'lucide-react'
import { VideoModal } from "@/components/video-modal"
import { toast } from "sonner"
import { useVATData } from "@/contexts/vat-data-context"
import { formatCurrency } from "@/lib/vatUtils"
import { ErrorBoundary, useErrorHandler } from "@/components/ErrorBoundary"

// New imports for refactored components
import { useDocumentsData } from "@/hooks/useDocumentsData"
import FileUpload from "@/components/file-upload"
import { StatCardGrid, DocumentsStatCard, VATStatCard, NetVATStatCard } from "@/components/dashboard/StatCard"
import { PageLayout } from "@/components/layout/PageLayout"
import { Document, VATReturn, UserProfile } from "@/types/dashboard"
import { userApi, vatApi } from "@/lib/apiClient"

// Dynamic imports for better performance
const DocumentViewer = dynamic(() => import("@/components/document-viewer"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-petrol-600"></div></div>
})

function DashboardDocumentsContent() {
  const { selectedYear, selectedPeriod, setVATAmounts } = useVATData()
  const router = useRouter()
  const currentYear = new Date().getFullYear()
  const errorHandler = useErrorHandler()
  
  // State for filtering and search
  const [selectedFilterYear, setSelectedFilterYear] = useState<string>(currentYear.toString())
  const [selectedMonth, setSelectedMonth] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"date" | "name">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  
  // User state  
  const [user, setUser] = useState<UserProfile | null>(null)
  const [userLoading, setUserLoading] = useState(false)
  
  // Document viewer state
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false)
  
  // Video modal state
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [isVideoCollapsed, setIsVideoCollapsed] = useState(false)
  
  // Past VAT submissions state
  const [pastSubmissions, setPastSubmissions] = useState<VATReturn[]>([])
  const [loadingSubmissions, setLoadingSubmissions] = useState(false)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 25
  
  
  // Use the new documents data hook
  const {
    state: { documents, vatData, loadingDocuments, loadingVAT, error, inFallbackMode, fallbackMessage },
    actions: { refreshData, debouncedRefreshVAT, removeDocument, setDocuments },
    computed: { salesDocuments, purchaseDocuments, totalDocuments, processedDocuments }
  } = useDocumentsData()
  
  // Batch upload settings
  const enableBatchMode = true
  const maxConcurrentUploads = 3

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  // Memoized filtered and sorted documents with pagination - single computation replaces multiple filter calls
  const { filteredSalesDocuments, filteredPurchaseDocuments, allFilteredDocuments, paginatedDocuments, stats, totalPages } = useMemo(() => {
    const yearFilter = selectedFilterYear
    const monthFilter = selectedMonth
    const categoryFilter = selectedCategory
    const query = searchQuery.toLowerCase()

    // Filter all documents once
    const filtered = documents.filter((doc) => {
      const date = new Date(doc.uploadedAt ?? doc.extractedDate ?? Date.now())
      const docYear = String(date.getFullYear())
      const docMonth = String(date.getMonth() + 1)
      const name = (doc.originalName || doc.fileName || "").toLowerCase()

      if (yearFilter !== "all" && docYear !== yearFilter) return false
      if (monthFilter !== "all" && docMonth !== monthFilter) return false
      if (categoryFilter !== "all") {
        if (categoryFilter === "sales" && !doc.category?.startsWith("SALES")) return false
        if (categoryFilter === "purchases" && !doc.category?.startsWith("PURCHASE")) return false
      }
      if (query && !name.includes(query)) return false
      return true
    }).sort((a, b) => {
      if (sortBy === "name") {
        const nA = a.originalName || a.fileName || ""
        const nB = b.originalName || b.fileName || ""
        return sortOrder === "asc" ? nA.localeCompare(nB) : nB.localeCompare(nA)
      } else {
        const dA = new Date(a.uploadedAt ?? a.extractedDate ?? 0).getTime()
        const dB = new Date(b.uploadedAt ?? b.extractedDate ?? 0).getTime()
        return sortOrder === "asc" ? dA - dB : dB - dA
      }
    })

    // Split into categories - FIXED: Match category prefixes instead of exact match
    const sales = filtered.filter(d => d.category?.startsWith("SALES"))
    const purchase = filtered.filter(d => d.category?.startsWith("PURCHASE"))

    // Calculate stats
    const stats = {
      totalDocuments: filtered.length,
      totalSales: sales.length,
      totalPurchase: purchase.length,
      salesVAT: vatData?.totalSalesVAT || 0,
      purchaseVAT: vatData?.totalPurchaseVAT || 0,
      netVAT: (vatData?.totalSalesVAT || 0) - (vatData?.totalPurchaseVAT || 0),
      processedDocuments: filtered.filter(d => d.isScanned).length,
      averageConfidence: vatData?.averageConfidence || 0,
    }

    // Calculate pagination
    const totalPages = Math.ceil(filtered.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedDocuments = filtered.slice(startIndex, endIndex)

    return {
      filteredSalesDocuments: sales,
      filteredPurchaseDocuments: purchase,
      allFilteredDocuments: filtered,
      paginatedDocuments,
      stats,
      totalPages
    }
  }, [documents, selectedFilterYear, selectedMonth, selectedCategory, searchQuery, sortBy, sortOrder, vatData, currentPage, itemsPerPage])

  // Load user profile and past submissions on mount
  React.useEffect(() => {
    const loadInitialData = async () => {
      try {
        setUserLoading(true)
        const userResponse = await userApi.getProfile()
        if (userResponse.success && userResponse.data?.user) {
          setUser(userResponse.data.user)
        }
      } catch (err) {
        setUser(null)
      } finally {
        setUserLoading(false)
      }

      try {
        setLoadingSubmissions(true)
        const submissionsResponse = await vatApi.getReturns()
        if (submissionsResponse.success && submissionsResponse.data?.vatReturns) {
          setPastSubmissions(submissionsResponse.data.vatReturns)
        }
      } catch (err) {
        console.error('Failed to load past submissions:', err)
      } finally {
        setLoadingSubmissions(false)
      }
    }

    loadInitialData()
  }, [])

  // Event handlers
  const handleLogout = async () => {
    try {
      await userApi.logout()
      router.push('/login')
    } catch (err) {
      router.push('/login')
    }
  }

  const handleDocumentUpload = (doc: Document) => {
    setDocuments(prev => [...prev, doc])
    debouncedRefreshVAT(5000, () => {
      if (vatData && vatData.processedDocuments > 0) {
        setVATAmounts(vatData.totalSalesVAT, vatData.totalPurchaseVAT)
      }
    })
  }

  const handleDocumentRemove = useCallback(async (id: string) => {
    try {
      await removeDocument(id)
      toast.success('Document removed successfully')
    } catch (err) {
      console.error('Error removing document:', err)
      errorHandler(err instanceof Error ? err : new Error('Failed to remove document'))
      toast.error('Failed to remove document')
    }
  }, [removeDocument, errorHandler])

  // Document viewer handlers - memoized for performance
  const handleViewDocument = useCallback((document: Document) => {
    setSelectedDocument(document)
    setDocumentViewerOpen(true)
  }, [])

  const handleCloseDocumentViewer = useCallback(() => {
    setDocumentViewerOpen(false)
    setSelectedDocument(null)
  }, [])


  // Helper function to get VAT extraction data for a document
  const getDocumentVATExtraction = (documentId: string) => {
    const salesDoc = vatData?.salesDocuments?.find((doc) => doc.id === documentId)
    const purchaseDoc = vatData?.purchaseDocuments?.find((doc) => doc.id === documentId)
    
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

  // Filter management
  const clearFilters = () => {
    setSelectedFilterYear(currentYear.toString())
    setSelectedMonth("all")
    setSelectedCategory("all")
    setSearchQuery("")
    setSortBy("date")
    setSortOrder("desc")
    setCurrentPage(1)
  }

  // Reset pagination when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [selectedFilterYear, selectedMonth, selectedCategory, searchQuery, sortBy, sortOrder])


  const activeFiltersCount = 
    (selectedFilterYear !== currentYear.toString() ? 1 : 0) +
    (selectedMonth !== "all" ? 1 : 0) +
    (selectedCategory !== "all" ? 1 : 0) +
    (searchQuery ? 1 : 0)

  if (loadingDocuments && documents.length === 0) {
    return (
      <PageLayout>
        <div className="space-y-8 animate-pulse">
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <div>
              <div className="h-8 bg-neutral-200 rounded w-48 mb-2" />
              <div className="h-5 bg-neutral-100 rounded w-96" />
            </div>
            <div className="h-10 bg-neutral-200 rounded w-32" />
          </div>

          {/* Stats cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border-neutral-200">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-neutral-200 rounded w-24" />
                    <div className="h-8 bg-neutral-200 rounded w-16" />
                    <div className="h-3 bg-neutral-100 rounded w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Upload sections skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="border-neutral-200">
                <CardHeader>
                  <div className="h-6 bg-neutral-200 rounded w-48" />
                  <div className="h-4 bg-neutral-100 rounded w-64" />
                </CardHeader>
                <CardContent>
                  <div className="h-32 bg-neutral-100 rounded border-2 border-dashed" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </PageLayout>
    )
  }

  if (error) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center py-20">
          <Card className="w-full max-w-md border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Clock className="h-8 w-8 text-red-500" />
                <span className="h6 text-red-800">Error Loading Dashboard</span>
              </div>
              <p className="body-md text-red-600 text-center mb-4">{error}</p>
              <div className="flex space-x-2">
                <Button onClick={refreshData} className="flex-1">
                  Try Again
                </Button>
                <Button onClick={() => router.push('/')} variant="outline" className="flex-1">
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      headerProps={{
        currentPage: "Document Management Dashboard",
        user: user,
        onLogout: handleLogout,
      }}
    >
      <div className="space-y-8">
        {/* PayVAT Heading at Top */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-normal text-brand-heading mb-2">
              PayVAT
            </h1>
            <p className="text-lg text-neutral-600">Upload, process, and manage your VAT documents</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => router.push('/')}
            className="text-petrol-dark border-petrol-300 hover:bg-petrol-50"
          >
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
        {/* Fallback Mode Warning */}
        {inFallbackMode && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                <div>
                  <h3 className="font-normal text-yellow-800">Service Temporarily Unavailable</h3>
                  <p className="text-yellow-700 text-sm mt-1">
                    {fallbackMessage || 'Database maintenance in progress. Showing demo data.'} 
                    <Button 
                      variant="link" 
                      size="sm" 
                      onClick={refreshData}
                      className="text-yellow-700 underline p-0 h-auto font-normal ml-2"
                    >
                      Try again
                    </Button>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics Overview */}
        <StatCardGrid columns={4}>
          <DocumentsStatCard 
            total={stats.totalDocuments} 
            processed={stats.processedDocuments} 
          />
          <VATStatCard 
            title="Sales VAT" 
            amount={stats.salesVAT} 
            documentCount={stats.totalSales} 
          />
          <VATStatCard 
            title="Purchase VAT" 
            amount={stats.purchaseVAT} 
            documentCount={stats.totalPurchase} 
          />
          <NetVATStatCard amount={stats.netVAT} />
        </StatCardGrid>

        {/* Watch Demo Video Section - Collapsible */}
        <Card className="bg-gradient-brand-subtle border-petrol-200">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="h-5 w-5 text-petrol-base" />
                <h2 className="h5 text-brand-900">Learn How It Works</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVideoCollapsed(!isVideoCollapsed)}
                className="h-8 w-8 p-0 text-petrol-base hover:bg-petrol-50"
              >
                {isVideoCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          {!isVideoCollapsed && (
            <CardContent className="pt-0 pb-6">
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <p className="body-lg text-petrol-dark mb-4">
                    Watch our demo to see how easy VAT submission can be
                  </p>
                  <Button 
                    onClick={() => setShowVideoModal(true)}
                    size="lg"
                    className="bg-gradient-brand text-white px-8 py-3"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Watch Demo Video
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Past VAT Submissions Section */}
        {user && (
          <Card className="border-petrol-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-petrol-dark">
                <Calendar className="h-5 w-5" />
                Past VAT Submissions
                {pastSubmissions.length > 0 && (
                  <span className="bg-petrol-base text-white text-xs rounded-full px-2 py-1">
                    {pastSubmissions.length}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingSubmissions ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-petrol-light" />
                  <span className="ml-2 body-md text-neutral-600">Loading submissions...</span>
                </div>
              ) : pastSubmissions.length > 0 ? (
                <div className="space-y-3">
                  {pastSubmissions.slice(0, 5).map((submission) => (
                    <div key={submission.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <Calendar className="h-8 w-8 text-petrol-base" />
                        </div>
                        <div>
                          <p className="body-sm font-normal text-neutral-900">
                            {new Date(submission.periodStart).toLocaleDateString()} - {new Date(submission.periodEnd).toLocaleDateString()}
                          </p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              submission.status === 'SUBMITTED' ? 'bg-green-100 text-green-800' :
                              submission.status === 'PAID' ? 'bg-blue-100 text-petrol-dark' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {submission.status}
                            </span>
                            <span className="text-xs text-neutral-500">
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
                          className="text-petrol-dark border-petrol-300 hover:bg-petrol-50"
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
                  <Clock className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                  <h3 className="h6 text-neutral-900 mb-2">No VAT Submissions Yet</h3>
                  <p className="body-md text-neutral-500 mb-4">
                    Start by uploading your documents and creating your first VAT submission
                  </p>
                  <Button 
                    onClick={() => router.push('/vat-submission')}
                    className="bg-gradient-brand text-white"
                  >
                    Create New VAT Submission
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Side-by-Side Upload Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Documents Upload - Left Side */}
          <Card className="border-petrol-200 bg-brand-50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="bg-brand-100 rounded-t-xl">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-petrol-base" />
                <div>
                  <h3 className="h5 text-brand-900">
                    Upload Sales Documents
                  </h3>
                  <p className="text-sm text-petrol-dark mt-1">
                    Upload sales-related documents including invoices, receipts, and payment records
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <FileUpload
                category="SALES"
                title="Upload Sales Documents"
                description="Upload sales-related documents including invoices, receipts, and payment records"
                acceptedFiles={['.pdf', '.csv', '.xlsx', '.xls', '.jpg', '.jpeg', '.png']}
                enableBatchMode={enableBatchMode}
                maxConcurrentUploads={maxConcurrentUploads}
                showBatchProgress={true}
                onUploadSuccess={handleDocumentUpload}
                vatReturnId={undefined}
              />
            </CardContent>
          </Card>

          {/* Purchase Documents Upload - Right Side */}
          <Card className="border-green-200 bg-green-50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="bg-green-100 rounded-t-xl">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-green-600" />
                <div>
                  <h3 className="h5 text-green-900">
                    Upload Purchase Documents
                  </h3>
                  <p className="text-sm text-green-700 mt-1">
                    Upload purchase-related documents including invoices, receipts, and expense records
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <FileUpload
                category="PURCHASES"
                title="Upload Purchase Documents"
                description="Upload purchase-related documents including invoices, receipts, and expense records"
                acceptedFiles={['.pdf', '.csv', '.xlsx', '.xls', '.jpg', '.jpeg', '.png']}
                enableBatchMode={enableBatchMode}
                maxConcurrentUploads={maxConcurrentUploads}
                showBatchProgress={true}
                onUploadSuccess={handleDocumentUpload}
                vatReturnId={undefined}
              />
            </CardContent>
          </Card>
        </div>

        {/* Search & Filter Documents - Moved ABOVE document list */}
        <Card className="border-neutral-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-petrol-dark">
                <Filter className="h-5 w-5" />
                Search & Filter Documents
                {activeFiltersCount > 0 && (
                  <span className="bg-petrol-base text-white text-xs rounded-full px-2 py-1">
                    {activeFiltersCount}
                  </span>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={refreshData}
                  disabled={loadingDocuments}
                  className="text-petrol-dark border-petrol-300 hover:bg-petrol-50"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loadingDocuments ? 'animate-spin' : ''}`} />
                  {loadingDocuments ? 'Refreshing...' : 'Refresh Data'}
                </Button>
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="body-sm font-normal text-neutral-700">Year</label>
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
                <label className="body-sm font-normal text-neutral-700">Month</label>
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
                <label className="body-sm font-normal text-neutral-700">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="sales">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-3 w-3" />
                        Sales
                      </div>
                    </SelectItem>
                    <SelectItem value="purchases">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="h-3 w-3" />
                        Purchases
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="body-sm font-normal text-neutral-700">Sort By</label>
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
                <label className="body-sm font-normal text-neutral-700">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
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
            
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-200">
              <div className="flex items-center gap-2">
                <span className="body-sm text-neutral-600">Sort Order:</span>
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

        {/* Unified All Documents List */}
        <Card className="border-neutral-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-petrol-dark">
                <FileText className="h-5 w-5" />
                All Documents
                {allFilteredDocuments.length > 0 && (
                  <span className="bg-petrol-base text-white text-xs rounded-full px-2 py-1">
                    {allFilteredDocuments.length}
                  </span>
                )}
              </CardTitle>
              
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loadingDocuments ? (
              <div className="p-6 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="grid grid-cols-12 gap-4 items-center p-4 animate-pulse">
                    <div className="col-span-1 flex justify-center">
                      <div className="h-6 w-6 bg-neutral-200 rounded" />
                    </div>
                    <div className="col-span-2">
                      <div className="h-4 bg-neutral-200 rounded mb-2" />
                      <div className="h-3 bg-neutral-100 rounded w-16" />
                    </div>
                    <div className="col-span-2">
                      <div className="h-4 bg-neutral-200 rounded w-20" />
                    </div>
                    <div className="col-span-2">
                      <div className="h-4 bg-neutral-200 rounded w-16" />
                    </div>
                    <div className="col-span-2">
                      <div className="h-4 bg-neutral-200 rounded w-14" />
                    </div>
                    <div className="col-span-1">
                      <div className="h-4 bg-neutral-200 rounded w-10" />
                    </div>
                    <div className="col-span-1">
                      <div className="h-6 w-16 bg-neutral-200 rounded-full" />
                    </div>
                    <div className="col-span-1 flex justify-end space-x-1">
                      <div className="h-8 w-8 bg-neutral-200 rounded" />
                      <div className="h-8 w-8 bg-neutral-200 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : allFilteredDocuments.length > 0 ? (
              <div className="w-full">
                {/* Table Headers */}
                <div className="grid grid-cols-12 gap-4 items-center px-6 py-3 bg-neutral-50 border-b text-xs font-normal text-neutral-600 uppercase tracking-wide">
                  <div className="col-span-1 text-center">Type</div>
                  <div className="col-span-2">Document Name</div>
                  <div className="col-span-2">Date on Doc</div>
                  <div className="col-span-2">Total on Doc</div>
                  <div className="col-span-2">VAT Amount</div>
                  <div className="col-span-1">Confidence %</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-1 text-right">Actions</div>
                </div>
                
                {/* Document Rows */}
                <div className="divide-y divide-neutral-100">
                  {paginatedDocuments.map((document) => {
                    const isVATSalesDoc = document.category?.startsWith("SALES")
                    const isVATPurchaseDoc = document.category?.startsWith("PURCHASE")
                    const variant = isVATSalesDoc ? 'sales' : 'purchase'
                    
                    return (
                      <div key={document.id} className={`grid grid-cols-12 gap-4 items-center p-4 hover:bg-neutral-50 transition-colors group`}>
                        {/* Type Badge */}
                        <div className="col-span-1 flex justify-center">
                          <div className={`px-2 py-1 text-xs font-normal rounded-full ${
                            isVATSalesDoc 
                              ? 'bg-brand-100 text-brand-900' 
                              : 'bg-green-100 text-green-900'
                          }`}>
                            {isVATSalesDoc ? 'Sales' : 'Purchase'}
                          </div>
                        </div>
                        
                        {/* Document Name and Size */}
                        <div className="col-span-2 min-w-0">
                          <p className="body-sm font-normal truncate" title={document.originalName || document.fileName}>
                            {document.originalName || document.fileName}
                          </p>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            {Math.round(document.fileSize / 1024)} KB
                          </p>
                        </div>
                        
                        {/* Date */}
                        <div className="col-span-2">
                          <p className="body-sm text-neutral-700">
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
                          <p className="body-sm font-normal text-neutral-800">
                            {document.invoiceTotal 
                              ? formatCurrency(Number(document.invoiceTotal))
                              : '—'
                            }
                          </p>
                        </div>
                        
                        {/* VAT Amount */}
                        <div className="col-span-2">
                          <p className={`body-sm font-normal ${
                            isVATSalesDoc ? 'text-petrol-dark' : 'text-green-700'
                          }`}>
                            {/* Get VAT amount from vatData */}
                            {(() => {
                              const vatDoc = isVATSalesDoc 
                                ? vatData?.salesDocuments?.find(d => d.id === document.id)
                                : vatData?.purchaseDocuments?.find(d => d.id === document.id)
                              const totalVAT = vatDoc?.extractedAmounts?.reduce((sum, amount) => sum + amount, 0) || 0
                              return totalVAT > 0 ? formatCurrency(totalVAT) : '—'
                            })()}
                          </p>
                        </div>
                        
                        {/* Confidence % */}
                        <div className="col-span-1">
                          <p className="body-sm font-normal text-neutral-700">
                            {(() => {
                              const vatDoc = isVATSalesDoc 
                                ? vatData?.salesDocuments?.find(d => d.id === document.id)
                                : vatData?.purchaseDocuments?.find(d => d.id === document.id)
                              const confidence = vatDoc?.confidence || 0
                              return confidence > 0 ? `${Math.round(confidence * 100)}%` : '—'
                            })()}
                          </p>
                        </div>
                        
                        {/* Status */}
                        <div className="col-span-1">
                          <div className={`inline-flex items-center px-2 py-1 text-xs font-normal rounded-full ${
                            document.isScanned 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {document.isScanned ? (
                              <><CheckCircle className="h-3 w-3 mr-1" />Processed</>
                            ) : (
                              <><Clock className="h-3 w-3 mr-1" />Processing</>
                            )}
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="col-span-1 flex justify-end space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDocument(document)}
                            className="h-8 w-8 p-0 opacity-100 transition-opacity"
                            aria-label="View document"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDocumentRemove(document.id)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 opacity-100 transition-opacity"
                            aria-label="Remove document"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <FileText className="h-16 w-16 mx-auto mb-4 text-neutral-400 opacity-50" />
                <h4 className="h6 text-neutral-900 mb-2">No Documents Found</h4>
                <p className="body-sm text-neutral-600">
                  Upload your documents using the sections above or adjust your filters
                </p>
              </div>
            )}
            
            {/* Pagination Controls */}
            {allFilteredDocuments.length > itemsPerPage && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100">
                <div className="text-sm text-neutral-600">
                  Showing {Math.min((currentPage - 1) * itemsPerPage + 1, allFilteredDocuments.length)} to{' '}
                  {Math.min(currentPage * itemsPerPage, allFilteredDocuments.length)} of{' '}
                  {allFilteredDocuments.length} documents
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  
                  {/* Page numbers */}
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <>
                        <span className="text-neutral-400">...</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(totalPages)}
                          className="w-8 h-8 p-0"
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Empty State */}
        {!loadingDocuments && documents.length === 0 && (
          <Card className="border-neutral-200">
            <CardContent className="p-8 text-center">
              <div className="flex flex-col items-center space-y-4">
                <FileText className="h-16 w-16 text-neutral-400" />
                <div>
                  <h3 className="h6 text-neutral-900 mb-2">No Documents Found</h3>
                  <p className="body-md text-neutral-500 mb-4">
                    Upload your first document to get started with VAT processing
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Document Viewer Modal */}
      <DocumentViewer
        isOpen={documentViewerOpen}
        onClose={handleCloseDocumentViewer}
        document={selectedDocument}
        extractedVAT={selectedDocument ? getDocumentVATExtraction(selectedDocument.id) : null}
        onVATCorrection={(correctionData) => {
          // Handle VAT corrections for AI training
        }}
      />

      {/* Video Modal */}
      <VideoModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
      />
    </PageLayout>
  )
}

// Export the component wrapped with error boundary
export default function DashboardDocuments() {
  return (
    <ErrorBoundary 
      onError={(error, errorInfo) => {
        console.error('Dashboard Documents Error:', error, errorInfo)
        // In production, you might want to send this to an error reporting service
      }}
    >
      <DashboardDocumentsContent />
    </ErrorBoundary>
  )
}