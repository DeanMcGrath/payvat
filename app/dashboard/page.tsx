"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Calendar, TrendingUp, TrendingDown, Search, Filter, X, ArrowUpDown, Home, Calculator } from "lucide-react"
import FileUpload from "@/components/file-upload"
import DocumentList, { type Document } from "@/components/document-list"
import DocumentPreviewModal from "@/components/document-preview-modal"
import DocumentViewer from "@/components/document-viewer"
import { toast } from "sonner"

// Helper function to map uploaded documents to dashboard format
const mapUploadedDocument = (doc: any): Document => ({
  id: doc.id,
  name: doc.originalName || doc.fileName || 'Uploaded Document',
  type: doc.category?.includes('SALES') ? 'sales' as const : 'purchases' as const,
  date: doc.uploadedAt ? new Date(doc.uploadedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  size: doc.fileSize || 0,
  uploadDate: doc.uploadedAt || new Date().toISOString(),
  fileType: doc.mimeType?.includes('pdf') ? 'pdf' : 
           doc.mimeType?.includes('spreadsheet') || doc.mimeType?.includes('excel') ? 'xlsx' :
           doc.mimeType?.includes('csv') ? 'csv' : 'pdf',
  isScanned: doc.isScanned || false,
  vatAmount: doc.vatAmount,
  invoiceTotal: doc.invoiceTotal,
  aiConfidence: doc.extractionConfidence || doc.confidence,
  processingQuality: doc.processingQuality,
  validationStatus: doc.validationStatus || 'PENDING' as const,
  irishVATCompliant: doc.irishVATCompliant,
  processingEngine: 'enhanced' as const,
  extractedDate: doc.extractedDate ? new Date(doc.extractedDate) : undefined
})

export default function Dashboard() {
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString())
  const [selectedMonth, setSelectedMonth] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"date" | "name">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  
  // Document viewer state for advanced analytics
  const [selectedDocument, setSelectedDocument] = useState<any>(null)
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false)
  const [extractedVATData, setExtractedVATData] = useState<any>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [loadingDocuments, setLoadingDocuments] = useState(true)
  
  // VAT extraction and batch upload state
  const [loadingExtractedData, setLoadingExtractedData] = useState(false)
  const [lastFetchTime, setLastFetchTime] = useState(0)
  const [fetchTimeout, setFetchTimeout] = useState<NodeJS.Timeout | null>(null)
  const [enableBatchMode] = useState(true)
  const [maxConcurrentUploads] = useState(3)

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const filteredAndSortedDocuments = useMemo(() => {
    const filtered = documents.filter((doc) => {
      const docDate = new Date(doc.date)
      const docYear = docDate.getFullYear().toString()
      const docMonth = (docDate.getMonth() + 1).toString()

      // Filter by year
      if (selectedYear !== "all" && docYear !== selectedYear) return false

      // Filter by month
      if (selectedMonth !== "all" && docMonth !== selectedMonth) return false

      // Filter by search query
      if (searchQuery && !doc.name.toLowerCase().includes(searchQuery.toLowerCase())) return false

      return true
    })

    // Sort documents
    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
          break
        case "name":
          comparison = a.name.localeCompare(b.name)
          break
      }

      return sortOrder === "asc" ? comparison : -comparison
    })

    return filtered
  }, [documents, selectedYear, selectedMonth, searchQuery, sortBy, sortOrder])

  const stats = useMemo(() => {
    const total = documents.length
    const sales = documents.filter((doc) => doc.type === "sales").length
    const purchases = documents.filter((doc) => doc.type === "purchases").length
    
    // Calculate VAT totals from enhanced document data
    const totalSalesVAT = documents
      .filter((doc) => doc.type === "sales" && doc.vatAmount)
      .reduce((sum, doc) => sum + (doc.vatAmount || 0), 0)
    
    const totalPurchaseVAT = documents
      .filter((doc) => doc.type === "purchases" && doc.vatAmount)
      .reduce((sum, doc) => sum + (doc.vatAmount || 0), 0)
    
    const totalInvoiceAmount = documents
      .filter((doc) => doc.invoiceTotal)
      .reduce((sum, doc) => sum + (doc.invoiceTotal || 0), 0)
    
    const averageConfidence = documents
      .filter((doc) => doc.aiConfidence)
      .reduce((sum, doc) => sum + (doc.aiConfidence || 0), 0) / 
      Math.max(documents.filter((doc) => doc.aiConfidence).length, 1)
    
    const compliantDocuments = documents.filter((doc) => doc.validationStatus === 'COMPLIANT').length
    const complianceRate = total > 0 ? (compliantDocuments / total) * 100 : 0

    return { 
      total, 
      sales, 
      purchases, 
      totalSalesVAT, 
      totalPurchaseVAT, 
      totalInvoiceAmount, 
      averageConfidence,
      complianceRate,
      compliantDocuments
    }
  }, [documents])

  const clearFilters = () => {
    setSelectedYear(currentYear.toString())
    setSelectedMonth("all")
    setSearchQuery("")
    setSortBy("date")
    setSortOrder("desc")
  }

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (selectedYear !== currentYear.toString()) count++
    if (selectedMonth !== "all") count++
    if (searchQuery) count++
    return count
  }, [selectedYear, selectedMonth, searchQuery, currentYear])

  const handleDocumentView = (document: Document) => {
    // Convert Document to DocumentData format expected by DocumentViewer
    const documentData = {
      id: document.id,
      originalName: document.name,
      fileName: document.name,
      mimeType: document.fileType === 'pdf' ? 'application/pdf' : 
                document.fileType === 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
                document.fileType === 'xls' ? 'application/vnd.ms-excel' :
                document.fileType === 'csv' ? 'text/csv' : 'application/octet-stream',
      fileSize: document.size,
      category: document.type.toUpperCase(),
      isScanned: document.isScanned || false,
      uploadedAt: document.uploadDate
    }
    
    setSelectedDocument(documentData)
    setDocumentViewerOpen(true)
    
    // Mock extracted VAT data based on document properties
    if (document.isScanned && document.vatAmount) {
      setExtractedVATData({
        salesVAT: document.type === 'sales' ? [document.vatAmount] : [],
        purchaseVAT: document.type === 'purchases' ? [document.vatAmount] : [],
        confidence: document.aiConfidence || 0.8,
        totalSalesVAT: document.type === 'sales' ? document.vatAmount : 0,
        totalPurchaseVAT: document.type === 'purchases' ? document.vatAmount : 0
      })
    }
  }

  const handleCloseDocumentViewer = () => {
    setDocumentViewerOpen(false)
    setSelectedDocument(null)
    setExtractedVATData(null)
  }

  const handleVATCorrection = (correctionData: any) => {
    // Handle VAT corrections for AI training
    console.log('VAT correction submitted:', correctionData)
    // In a real app, this would send the correction to the API
  }

  const handleDocumentUpdate = (updatedDocument: Document) => {
    setDocuments((prev) => prev.map((doc) => (doc.id === updatedDocument.id ? updatedDocument : doc)))
  }

  const handleDocumentDownload = (document: Document) => {
    console.log("[v0] Downloading document:", document.name)
    // Create a mock download
    const link = globalThis.document.createElement("a")
    link.href = "#"
    link.download = document.name
    globalThis.document.body.appendChild(link)
    link.click()
    globalThis.document.body.removeChild(link)
  }

  const handleDocumentDelete = async (document: Document) => {
    try {
      // Call API to delete from database
      const response = await fetch(`/api/documents/${document.id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        // Remove from local state only after successful deletion
        setDocuments((prev) => prev.filter((doc) => doc.id !== document.id))
        toast.success('Document deleted successfully')
      } else {
        toast.error('Failed to delete document')
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      toast.error('Error deleting document')
    }
  }

  const handleBulkDelete = async (documentIds: string[]) => {
    try {
      // Delete all documents via API
      const deletePromises = documentIds.map(id =>
        fetch(`/api/documents/${id}`, { method: 'DELETE' })
      )
      
      const results = await Promise.all(deletePromises)
      const successfulDeletes = documentIds.filter((id, index) => results[index].ok)
      
      // Remove only successfully deleted documents from state
      setDocuments((prev) => prev.filter((doc) => !successfulDeletes.includes(doc.id)))
      
      if (successfulDeletes.length === documentIds.length) {
        toast.success(`${successfulDeletes.length} documents deleted`)
      } else {
        toast.warning(`Deleted ${successfulDeletes.length} of ${documentIds.length} documents`)
      }
    } catch (error) {
      console.error('Error deleting documents:', error)
      toast.error('Error deleting documents')
    }
  }

  const handleExport = (documents: Document[]) => {
    console.log(
      "[v0] Exporting documents:",
      documents.map((d) => d.name),
    )
    // Mock CSV export
    const csvContent = [
      "Name,Type,Date,Size,Upload Date",
      ...documents.map((doc) => `"${doc.name}","${doc.type}","${doc.date}","${doc.size}","${doc.uploadDate}"`),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = globalThis.URL.createObjectURL(blob)
    const link = globalThis.document.createElement("a")
    link.href = url
    link.download = "documents-export.csv"
    globalThis.document.body.appendChild(link)
    link.click()
    globalThis.document.body.removeChild(link)
    globalThis.URL.revokeObjectURL(url)
  }

  const loadDocuments = async () => {
    try {
      setLoadingDocuments(true)
      const response = await fetch('/api/documents?dashboard=true')
      
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.documents) {
          // Map API documents to Dashboard Document interface
          const mappedDocuments: Document[] = result.documents.map((doc: any) => ({
            id: doc.id,
            name: doc.originalName || doc.fileName || 'Unknown Document',
            type: doc.category?.includes('SALES') ? 'sales' as const : 'purchases' as const,
            date: doc.extractedDate ? new Date(doc.extractedDate).toISOString().split('T')[0] : 
                  doc.uploadedAt ? new Date(doc.uploadedAt).toISOString().split('T')[0] : 
                  new Date().toISOString().split('T')[0],
            size: doc.fileSize || 0,
            uploadDate: doc.uploadedAt || new Date().toISOString(),
            fileType: doc.mimeType?.includes('pdf') ? 'pdf' :
                     doc.mimeType?.includes('spreadsheet') || doc.mimeType?.includes('excel') ? 'xlsx' :
                     doc.mimeType?.includes('csv') ? 'csv' : 'pdf',
            isScanned: doc.isScanned || true,
            vatAmount: doc.vatAccuracy || doc.vatAmount || doc.extractedAmounts?.[0] || undefined,
            invoiceTotal: doc.invoiceTotal || doc.totalAmount || undefined,
            aiConfidence: doc.extractionConfidence || doc.confidence || doc.aiConfidence || undefined,
            processingQuality: doc.processingQuality || undefined,
            irishVATCompliant: doc.irishVATCompliant,
            processingEngine: doc.processingEngine || 'enhanced' as const,
            validationStatus: doc.validationStatus || 'COMPLIANT' as const,
            extractedDate: doc.extractedDate ? new Date(doc.extractedDate) : undefined
          }))
          
          setDocuments(mappedDocuments)
          console.log('Loaded documents from API:', mappedDocuments)
        } else {
          setDocuments([])
        }
      } else {
        console.warn('Failed to load documents:', response.statusText)
        setDocuments([])
      }
    } catch (error) {
      console.error('Error loading documents:', error)
      setDocuments([])
    } finally {
      setLoadingDocuments(false)
    }
  }

  useEffect(() => {
    loadDocuments()
  }, [])

  // Debounced refresh function to prevent rapid successive calls
  const debouncedRefreshVATData = (delay = 3000, enableAutoPopulate = false) => {
    // Clear any existing timeouts to prevent conflicts
    if (fetchTimeout) {
      clearTimeout(fetchTimeout)
    }
    
    const timeout = setTimeout(() => {
      console.log('🔄 DASHBOARD: Executing debounced VAT data refresh')
      loadExtractedVATData(true).then(() => {
        // Reload documents to get updated VAT data
        loadDocuments()
      })
    }, delay)
    
    setFetchTimeout(timeout)
  }

  const loadExtractedVATData = async (forceRefresh = false): Promise<any> => {
    try {
      // Prevent rapid successive calls
      const MIN_INTERVAL = 2000; // 2 seconds minimum between calls
      const now = Date.now()
      if (!forceRefresh && (now - lastFetchTime) < MIN_INTERVAL) {
        console.log('⏳ DASHBOARD: Skipping request due to rate limiting')
        return extractedVATData
      }
      
      // Check if we're already loading
      if (loadingExtractedData) {
        console.log('⏳ DASHBOARD: Request already in progress, skipping')
        return extractedVATData
      }
      
      setLoadingExtractedData(true)
      setLastFetchTime(now)
      console.log('🔍 DASHBOARD: Loading extracted VAT data...')
      
      const response = await fetch('/api/documents/extracted-vat')
      
      if (response.ok) {
        const data = await response.json()
        setExtractedVATData(data)
        console.log('✅ DASHBOARD: VAT data loaded successfully:', data)
        return data
      } else {
        console.error('❌ DASHBOARD: Failed to load VAT data')
        return null
      }
    } catch (error) {
      console.error('❌ DASHBOARD: Error loading VAT data:', error)
      return null
    } finally {
      setLoadingExtractedData(false)
    }
  }

  const handleDocumentUploadSuccess = (doc: any) => {
    console.log('📤 DASHBOARD: Document uploaded:', doc.fileName || doc.originalName)
    
    // Add to documents list immediately with mapped format
    const mappedDoc = mapUploadedDocument(doc)
    setDocuments(prev => [...prev, mappedDoc])
    
    // Show success message
    toast.success('Document uploaded successfully')
    
    console.log('⏳ DASHBOARD: Document uploaded, scheduling debounced VAT data refresh...')
    // Use debounced refresh with auto-populate
    debouncedRefreshVATData(5000, true) // 5 second delay for AI processing
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
            <Button variant="secondary" className="bg-white text-[#0072B1] hover:bg-gray-100">
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-slate-600">
            <span>Dashboard</span>
            <span>/</span>
            <span>Documents</span>
            {selectedYear !== "2024" && (
              <>
                <span>/</span>
                <span>{selectedYear}</span>
              </>
            )}
            {selectedMonth !== "all" && (
              <>
                <span>/</span>
                <span>{months[Number.parseInt(selectedMonth) - 1]}</span>
              </>
            )}
          </nav>
        </div>

        <div className="space-y-8">
          {/* Main Content */}
          <div className="space-y-8">
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#0072B1]">
                  <FileText className="h-5 w-5" />
                  Upload Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-green-600 mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Sales Documents
                    </h3>
                    <FileUpload
                      category="SALES"
                      title="Upload Sales Documents"
                      description="Upload sales-related documents including invoices, receipts, and payment records"
                      acceptedFiles={['.pdf', '.csv', '.xlsx', '.xls', '.jpg', '.jpeg', '.png']}
                      enableBatchMode={enableBatchMode}
                      maxConcurrentUploads={maxConcurrentUploads}
                      showBatchProgress={true}
                      onUploadSuccess={handleDocumentUploadSuccess}
                      onUploadStart={() => console.log('Sales upload started')}
                      onUploadError={(error) => {
                        console.error('Sales upload error:', error)
                        toast.error('Failed to upload sales document')
                      }}
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-red-600 mb-4 flex items-center gap-2">
                      <TrendingDown className="h-5 w-5" />
                      Purchase Documents
                    </h3>
                    <FileUpload
                      category="PURCHASES"
                      title="Upload Purchase Documents"
                      description="Upload purchase-related documents including invoices, receipts, and expense records"
                      acceptedFiles={['.pdf', '.csv', '.xlsx', '.xls', '.jpg', '.jpeg', '.png']}
                      enableBatchMode={enableBatchMode}
                      maxConcurrentUploads={maxConcurrentUploads}
                      showBatchProgress={true}
                      onUploadSuccess={handleDocumentUploadSuccess}
                      onUploadStart={() => console.log('Purchase upload started')}
                      onUploadError={(error) => {
                        console.error('Purchase upload error:', error)
                        toast.error('Failed to upload purchase document')
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loading Indicator */}
            {loadingDocuments && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent" />
                    <div className="flex-1">
                      <h3 className="font-medium text-blue-800">Loading Documents</h3>
                      <p className="text-sm text-blue-600">
                        Fetching your documents from the database...
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Processing Status Indicator */}
            {!loadingDocuments && documents.some(doc => !doc.isScanned) && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-yellow-500 border-t-transparent" />
                    <div className="flex-1">
                      <h3 className="font-medium text-yellow-800">AI Processing in Progress</h3>
                      <p className="text-sm text-yellow-600">
                        {documents.filter(doc => !doc.isScanned).length} documents being analyzed for VAT extraction and compliance
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-yellow-700">
                        {Math.round((documents.filter(doc => doc.isScanned).length / documents.length) * 100)}% Complete
                      </div>
                      <div className="w-24 bg-yellow-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(documents.filter(doc => doc.isScanned).length / documents.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* VAT Extraction Status and Results */}
            {!loadingDocuments && documents.length > 0 && (
              <Card className="border-[#0072B1] bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#0072B1]">
                    <Calculator className="h-5 w-5" />
                    VAT Data Extraction Status
                    {loadingExtractedData && (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#0072B1] border-t-transparent ml-2" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Processing Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div>
                          <p className="text-sm text-gray-600">Documents Processed</p>
                          <p className="text-lg font-semibold text-[#0072B1]">
                            {documents.filter(doc => doc.isScanned).length} / {documents.length}
                          </p>
                        </div>
                        <div className="text-2xl">📄</div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div>
                          <p className="text-sm text-gray-600">VAT Amounts Found</p>
                          <p className="text-lg font-semibold text-green-600">
                            {documents.filter(doc => doc.vatAmount && doc.vatAmount > 0).length}
                          </p>
                        </div>
                        <div className="text-2xl">💰</div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div>
                          <p className="text-sm text-gray-600">Average Confidence</p>
                          <p className="text-lg font-semibold text-[#0072B1]">
                            {Math.round(stats.averageConfidence * 100)}%
                          </p>
                        </div>
                        <div className="text-2xl">🎯</div>
                      </div>
                    </div>

                    {/* Processing Progress Bar */}
                    {documents.some(doc => !doc.isScanned) && (
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Processing Progress</span>
                          <span className="text-sm text-gray-500">
                            {documents.filter(doc => doc.isScanned).length} / {documents.length} complete
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-[#0072B1] to-[#5BADEA] h-3 rounded-full transition-all duration-500"
                            style={{ width: `${(documents.filter(doc => doc.isScanned).length / documents.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Recent Processing Activity */}
                    {documents.filter(doc => doc.isScanned).length > 0 && (
                      <div className="bg-white p-4 rounded-lg border">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Recent AI Processing Results</h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {documents
                            .filter(doc => doc.isScanned)
                            .slice(0, 5)
                            .map((doc) => (
                              <div key={doc.id} className="flex items-center justify-between text-sm">
                                <div className="flex items-center space-x-2">
                                  <div className={`w-2 h-2 rounded-full ${doc.vatAmount && doc.vatAmount > 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
                                  <span className="truncate max-w-40">{doc.name}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {doc.vatAmount && doc.vatAmount > 0 ? (
                                    <span className="text-green-600 font-medium">€{doc.vatAmount.toFixed(2)}</span>
                                  ) : (
                                    <span className="text-gray-500">No VAT</span>
                                  )}
                                  {doc.aiConfidence && (
                                    <span className={`text-xs ${doc.aiConfidence > 0.8 ? 'text-green-600' : doc.aiConfidence > 0.6 ? 'text-yellow-600' : 'text-red-600'}`}>
                                      {Math.round(doc.aiConfidence * 100)}%
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Enhanced Analytics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Total Documents</p>
                      <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
                    </div>
                    <FileText className="h-8 w-8 text-[#0072B1]" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Sales VAT Total</p>
                      <p className="text-2xl font-bold text-green-600">€{stats.totalSalesVAT.toFixed(2)}</p>
                      <p className="text-xs text-slate-500">{stats.sales} documents</p>
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
                      <p className="text-2xl font-bold text-red-600">€{stats.totalPurchaseVAT.toFixed(2)}</p>
                      <p className="text-xs text-slate-500">{stats.purchases} documents</p>
                    </div>
                    <TrendingDown className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">AI Confidence</p>
                      <p className="text-2xl font-bold text-[#0072B1]">{Math.round(stats.averageConfidence * 100)}%</p>
                      <p className="text-xs text-slate-500">Average across all docs</p>
                    </div>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      stats.averageConfidence >= 0.8 ? 'bg-green-100' :
                      stats.averageConfidence >= 0.6 ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                      <div className={`h-4 w-4 rounded-full ${
                        stats.averageConfidence >= 0.8 ? 'bg-green-500' :
                        stats.averageConfidence >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Analytics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Total Invoice Value</p>
                      <p className="text-2xl font-bold text-[#0072B1]">€{stats.totalInvoiceAmount.toFixed(2)}</p>
                      <p className="text-xs text-slate-500">Across all documents</p>
                    </div>
                    <Calendar className="h-8 w-8 text-[#0072B1]" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">VAT Compliance</p>
                      <p className="text-2xl font-bold text-green-600">{Math.round(stats.complianceRate)}%</p>
                      <p className="text-xs text-slate-500">{stats.compliantDocuments} of {stats.total} compliant</p>
                    </div>
                    <div className="h-8 w-8 flex items-center justify-center text-lg">🇮🇪</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Net VAT Due</p>
                      <p className="text-2xl font-bold text-[#0072B1]">€{(stats.totalSalesVAT - stats.totalPurchaseVAT).toFixed(2)}</p>
                      <p className="text-xs text-slate-500">Sales VAT - Purchase VAT</p>
                    </div>
                    <div className="h-8 w-8 bg-[#0072B1] rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">€</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

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
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
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

            {/* Empty State */}
            {!loadingDocuments && documents.length === 0 && (
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

            {/* Sales Documents Section */}
            {!loadingDocuments && documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <TrendingUp className="h-5 w-5" />
                  Sales Documents for {selectedYear}{" "}
                  {selectedMonth !== "all" ? `- ${months[Number.parseInt(selectedMonth) - 1]}` : ""}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DocumentList
                  documents={filteredAndSortedDocuments.filter(doc => doc.type === 'sales')}
                  onView={handleDocumentView}
                  onDelete={handleDocumentDelete}
                  onBulkDelete={handleBulkDelete}
                  onExport={handleExport}
                />
              </CardContent>
            </Card>
            )}

            {/* Purchase Documents Section */}
            {!loadingDocuments && documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <TrendingDown className="h-5 w-5" />
                  Purchase Documents for {selectedYear}{" "}
                  {selectedMonth !== "all" ? `- ${months[Number.parseInt(selectedMonth) - 1]}` : ""}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DocumentList
                  documents={filteredAndSortedDocuments.filter(doc => doc.type === 'purchases')}
                  onView={handleDocumentView}
                  onDelete={handleDocumentDelete}
                  onBulkDelete={handleBulkDelete}
                  onExport={handleExport}
                />
              </CardContent>
            </Card>
            )}
          </div>
        </div>
      </div>

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        document={previewDocument}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onUpdate={handleDocumentUpdate}
      />

      {/* Advanced Document Viewer with VAT Analytics */}
      <DocumentViewer
        isOpen={documentViewerOpen}
        onClose={handleCloseDocumentViewer}
        document={selectedDocument}
        extractedVAT={extractedVATData}
        onVATCorrection={handleVATCorrection}
      />
    </div>
  )
}