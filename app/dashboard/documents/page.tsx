"use client"

import React, { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, X, ArrowUpDown, Home, RefreshCw, Video, Play, Calendar, Clock, ArrowRight, Search, FileText, Loader2, AlertCircle } from 'lucide-react'
import { VideoModal } from "@/components/video-modal"
import { toast } from "sonner"
import { useVATData } from "@/contexts/vat-data-context"
import { formatCurrency } from "@/lib/vatUtils"
import { ErrorBoundary, useErrorHandler } from "@/components/ErrorBoundary"

// New imports for refactored components
import { useDocumentsData } from "@/hooks/useDocumentsData"
import { DocumentSection } from "@/components/dashboard/DocumentSection"
import { StatCard, StatCardGrid, DocumentsStatCard, VATStatCard, NetVATStatCard } from "@/components/dashboard/StatCard"
import { PageLayout } from "@/components/layout/PageLayout"
import { Document, VATReturn, UserProfile } from "@/types/dashboard"
import { userApi, vatApi } from "@/lib/apiClient"

// Dynamic imports for better performance
const DocumentViewer = dynamic(() => import("@/components/document-viewer"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div></div>
})

function DashboardDocumentsContent() {
  const { selectedYear, selectedPeriod, setVATAmounts } = useVATData()
  const router = useRouter()
  const currentYear = new Date().getFullYear()
  const errorHandler = useErrorHandler()
  
  // State for filtering and search
  const [selectedFilterYear, setSelectedFilterYear] = useState<string>(currentYear.toString())
  const [selectedMonth, setSelectedMonth] = useState<string>("all")
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
  
  // Past VAT submissions state
  const [pastSubmissions, setPastSubmissions] = useState<VATReturn[]>([])
  const [loadingSubmissions, setLoadingSubmissions] = useState(false)
  
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

  // Memoized filtered and sorted documents - single computation replaces multiple filter calls
  const { filteredSalesDocuments, filteredPurchaseDocuments, stats } = useMemo(() => {
    const yearFilter = selectedFilterYear
    const monthFilter = selectedMonth
    const query = searchQuery.toLowerCase()

    // Filter all documents once
    const filtered = documents.filter((doc) => {
      const date = new Date(doc.uploadedAt ?? doc.extractedDate ?? Date.now())
      const docYear = String(date.getFullYear())
      const docMonth = String(date.getMonth() + 1)
      const name = (doc.originalName || doc.fileName || "").toLowerCase()

      if (yearFilter !== "all" && docYear !== yearFilter) return false
      if (monthFilter !== "all" && docMonth !== monthFilter) return false
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

    // Split into categories
    const sales = filtered.filter(d => d.category === "SALES")
    const purchase = filtered.filter(d => d.category === "PURCHASE")

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

    return {
      filteredSalesDocuments: sales,
      filteredPurchaseDocuments: purchase,
      stats
    }
  }, [documents, selectedFilterYear, selectedMonth, searchQuery, sortBy, sortOrder, vatData])

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
        console.log('Authentication check failed:', err)
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

  const handleDocumentRemove = async (id: string) => {
    try {
      await removeDocument(id)
      toast.success('Document removed successfully')
    } catch (err) {
      console.error('Error removing document:', err)
      errorHandler(err instanceof Error ? err : new Error('Failed to remove document'))
      toast.error('Failed to remove document')
    }
  }

  // Document viewer handlers
  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document)
    setDocumentViewerOpen(true)
  }

  const handleCloseDocumentViewer = () => {
    setDocumentViewerOpen(false)
    setSelectedDocument(null)
  }

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
    setSearchQuery("")
    setSortBy("date")
    setSortOrder("desc")
  }

  const activeFiltersCount = 
    (selectedFilterYear !== currentYear.toString() ? 1 : 0) +
    (selectedMonth !== "all" ? 1 : 0) +
    (searchQuery ? 1 : 0)

  if (loadingDocuments && documents.length === 0) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
            <span className="body-lg text-neutral-600">Loading dashboard...</span>
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
      title="Document Management"
      subtitle="Upload, process, and manage your VAT documents"
      headerProps={{
        currentPage: "Document Management Dashboard",
        user: user,
        onLogout: handleLogout,
      }}
      actions={
        <Button 
          variant="outline" 
          onClick={() => router.push('/')}
          className="text-brand-700 border-brand-300 hover:bg-brand-50"
        >
          <Home className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      }
    >
      <div className="space-y-8">
        {/* Fallback Mode Warning */}
        {inFallbackMode && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-yellow-800">Service Temporarily Unavailable</h3>
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

        {/* Watch Demo Video Section */}
        <Card className="bg-gradient-brand-subtle border-brand-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="flex items-center justify-center mb-3">
                  <Video className="h-8 w-8 text-brand-600 mr-3" />
                  <h2 className="h4 text-brand-900">Learn How It Works</h2>
                </div>
                <p className="body-lg text-brand-700 mb-4">
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
        </Card>

        {/* Past VAT Submissions Section */}
        {user && (
          <Card className="border-brand-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-brand-700">
                <Calendar className="h-5 w-5" />
                Past VAT Submissions
                {pastSubmissions.length > 0 && (
                  <span className="bg-brand-600 text-white text-xs rounded-full px-2 py-1">
                    {pastSubmissions.length}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingSubmissions ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
                  <span className="ml-2 body-md text-neutral-600">Loading submissions...</span>
                </div>
              ) : pastSubmissions.length > 0 ? (
                <div className="space-y-3">
                  {pastSubmissions.slice(0, 5).map((submission) => (
                    <div key={submission.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <Calendar className="h-8 w-8 text-brand-600" />
                        </div>
                        <div>
                          <p className="body-sm font-medium text-neutral-900">
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
                          className="text-brand-700 border-brand-300 hover:bg-brand-50"
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

        {/* Search & Filter Documents - Positioned for optimal user workflow */}
        <Card className="border-neutral-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-brand-700">
                <Filter className="h-5 w-5" />
                Search & Filter Documents
                {activeFiltersCount > 0 && (
                  <span className="bg-brand-600 text-white text-xs rounded-full px-2 py-1">
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
                  className="text-brand-700 border-brand-300 hover:bg-brand-50"
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="body-sm font-medium text-neutral-700">Year</label>
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
                <label className="body-sm font-medium text-neutral-700">Month</label>
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
                <label className="body-sm font-medium text-neutral-700">Sort By</label>
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
                <label className="body-sm font-medium text-neutral-700">Search</label>
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

        {/* Sales Documents Section */}
        <DocumentSection
          variant="sales"
          title="Sales Documents"
          documents={filteredSalesDocuments}
          vatData={vatData}
          onView={handleViewDocument}
          onRemove={handleDocumentRemove}
          loading={loadingDocuments}
          emptyMessage="Upload sales-related documents including invoices, receipts, and payment records"
        />

        {/* Purchase Documents Section */}
        <DocumentSection
          variant="purchase"
          title="Purchase Documents"
          documents={filteredPurchaseDocuments}
          vatData={vatData}
          onView={handleViewDocument}
          onRemove={handleDocumentRemove}
          loading={loadingDocuments}
          emptyMessage="Upload purchase-related documents including invoices, receipts, and expense records"
        />

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
          console.log('VAT correction submitted:', correctionData)
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