"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Calendar, TrendingUp, TrendingDown, Search, Filter, X, ArrowUpDown, Home } from "lucide-react"
import FileUpload from "@/components/file-upload"
import DocumentList, { type Document } from "@/components/document-list"
import DocumentPreviewModal from "@/components/document-preview-modal"
import DocumentViewer from "@/components/document-viewer"

// Component wrapper to match the expected interface
function FileUploadComponent({ onFilesUploaded, defaultDocumentType, title, description }: {
  onFilesUploaded: (files: any[]) => void
  defaultDocumentType: string
  title: string
  description: string
}) {
  return (
    <FileUpload
      category={defaultDocumentType === "sales" ? "SALES" : "PURCHASES"}
      title={title}
      description={description}
      acceptedFiles={[".pdf", ".csv", ".xlsx", ".xls", ".jpg", ".jpeg", ".png"]}
      onUploadSuccess={(document) => {
        onFilesUploaded([document])
      }}
    />
  )
}

export default function Dashboard() {
  const [selectedYear, setSelectedYear] = useState<string>("2024")
  const [selectedMonth, setSelectedMonth] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"date" | "name" | "size">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  
  // Document viewer state for advanced analytics
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false)
  const [extractedVATData, setExtractedVATData] = useState<any>(null)

  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "1",
      name: "Invoice_2024_001.pdf",
      type: "sales",
      date: "2024-01-15",
      size: 245760,
      uploadDate: "2024-01-15T10:30:00Z",
      fileType: "pdf",
      isScanned: true,
      vatAmount: 460.50,
      invoiceTotal: 2302.50,
      aiConfidence: 0.94,
      processingQuality: 88,
      irishVATCompliant: true,
      processingEngine: 'enhanced',
      validationStatus: 'COMPLIANT',
      extractedDate: new Date("2024-01-15"),
      processingInfo: {
        engine: 'enhanced',
        qualityScore: 88,
        processingSteps: [],
        irishVATCompliant: true,
        totalProcessingTime: 2340
      }
    },
    {
      id: "2",
      name: "Receipt_Office_Supplies.pdf",
      type: "purchases",
      date: "2024-01-20",
      size: 156432,
      uploadDate: "2024-01-20T14:15:00Z",
      fileType: "pdf",
      isScanned: true,
      vatAmount: 34.20,
      invoiceTotal: 171.00,
      aiConfidence: 0.87,
      processingQuality: 75,
      irishVATCompliant: true,
      processingEngine: 'enhanced',
      validationStatus: 'COMPLIANT',
      extractedDate: new Date("2024-01-20")
    },
    {
      id: "3",
      name: "Sales_Report_Q1.xlsx",
      type: "sales",
      date: "2024-03-31",
      size: 512000,
      uploadDate: "2024-03-31T16:45:00Z",
      fileType: "xlsx",
      isScanned: true,
      vatAmount: 1580.75,
      invoiceTotal: 7903.75,
      aiConfidence: 0.96,
      processingQuality: 92,
      irishVATCompliant: true,
      processingEngine: 'enhanced',
      validationStatus: 'COMPLIANT',
      extractedDate: new Date("2024-03-31")
    },
    {
      id: "4",
      name: "Equipment_Purchase.pdf",
      type: "purchases",
      date: "2024-02-10",
      size: 324567,
      uploadDate: "2024-02-10T09:20:00Z",
      fileType: "pdf",
      isScanned: true,
      vatAmount: 127.50,
      invoiceTotal: 637.50,
      aiConfidence: 0.72,
      processingQuality: 65,
      irishVATCompliant: false,
      processingEngine: 'legacy',
      validationStatus: 'NEEDS_REVIEW',
      extractedDate: new Date("2024-02-10")
    },
    {
      id: "5",
      name: "Monthly_Expenses_Feb.csv",
      type: "purchases",
      date: "2024-02-28",
      size: 89456,
      uploadDate: "2024-02-28T09:15:00Z",
      fileType: "csv",
      isScanned: false,
      processingEngine: 'enhanced',
      validationStatus: 'PENDING'
    }
  ])

  const currentYear = new Date().getFullYear()
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

      // Filter by type
      if (selectedType !== "all" && doc.type !== selectedType) return false

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
        case "size":
          comparison = a.size - b.size
          break
      }

      return sortOrder === "asc" ? comparison : -comparison
    })

    return filtered
  }, [documents, selectedYear, selectedMonth, selectedType, searchQuery, sortBy, sortOrder])

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
    setSelectedYear("2024")
    setSelectedMonth("all")
    setSelectedType("all")
    setSearchQuery("")
    setSortBy("date")
    setSortOrder("desc")
  }

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (selectedYear !== "2024") count++
    if (selectedMonth !== "all") count++
    if (selectedType !== "all") count++
    if (searchQuery) count++
    return count
  }, [selectedYear, selectedMonth, selectedType, searchQuery])

  const handleDocumentView = (document: Document) => {
    // Use the advanced DocumentViewer for enhanced analytics
    setSelectedDocument(document)
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
    const link = document.createElement("a")
    link.href = "#"
    link.download = document.name
    link.click()
  }

  const handleDocumentDelete = (document: Document) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== document.id))
  }

  const handleBulkDelete = (documentIds: string[]) => {
    setDocuments((prev) => prev.filter((doc) => !documentIds.includes(doc.id)))
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
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "documents-export.csv"
    link.click()
    window.URL.revokeObjectURL(url)
  }

  const handleFilesUploaded = (uploadedFiles: any[]) => {
    console.log("[Dashboard] Files uploaded:", uploadedFiles)
    
    // Convert uploaded files to Document format with processing indicators
    const newDocuments = uploadedFiles.map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: file.name || 'Uploaded Document',
      type: file.category?.includes('SALES') ? 'sales' as const : 'purchases' as const,
      date: new Date().toISOString().split('T')[0],
      size: file.size || 0,
      uploadDate: new Date().toISOString(),
      fileType: file.name?.split('.').pop()?.toLowerCase() || 'pdf',
      isScanned: false, // Will be set to true when processing completes
      processingEngine: 'enhanced' as const,
      validationStatus: 'PENDING' as const
    }))
    
    setDocuments(prev => [...prev, ...newDocuments])
    
    // Simulate AI processing with real-time updates
    newDocuments.forEach((doc, index) => {
      setTimeout(() => {
        setDocuments(prev => prev.map(d => 
          d.id === doc.id 
            ? {
                ...d,
                isScanned: true,
                vatAmount: Math.random() * 500 + 50, // Mock VAT amount
                invoiceTotal: Math.random() * 2500 + 250, // Mock invoice total
                aiConfidence: 0.7 + Math.random() * 0.3, // Mock confidence 70-100%
                processingQuality: 60 + Math.random() * 40, // Mock quality 60-100
                irishVATCompliant: Math.random() > 0.2, // 80% compliance rate
                validationStatus: Math.random() > 0.15 ? 'COMPLIANT' as const : 'NEEDS_REVIEW' as const,
                extractedDate: new Date()
              }
            : d
        ))
      }, (index + 1) * 3000 + Math.random() * 2000) // Stagger processing times
    })
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
            {selectedType !== "all" && (
              <>
                <span>/</span>
                <span className="capitalize">{selectedType}</span>
              </>
            )}
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
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
              <CardContent className="space-y-6">
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
                  <label className="text-sm font-medium text-slate-700">Document Type</label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Documents</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="purchases">Purchases</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Sort By</label>
                  <Select value={sortBy} onValueChange={(value: "date" | "name" | "size") => setSortBy(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="size">Size</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Sort Order</label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    className="w-full justify-start"
                  >
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    {sortOrder === "asc" ? "Ascending" : "Descending"}
                  </Button>
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
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sales Upload Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <TrendingUp className="h-5 w-5" />
                    Upload Sales Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FileUploadComponent
                    onFilesUploaded={handleFilesUploaded}
                    defaultDocumentType="sales"
                    title="Sales Documents"
                    description="Upload invoices, receipts, and sales reports"
                  />
                </CardContent>
              </Card>

              {/* Purchases Upload Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <TrendingDown className="h-5 w-5" />
                    Upload Purchase Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FileUploadComponent
                    onFilesUploaded={handleFilesUploaded}
                    defaultDocumentType="purchases"
                    title="Purchase Documents"
                    description="Upload receipts, invoices, and purchase orders"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Processing Status Indicator */}
            {documents.some(doc => !doc.isScanned) && (
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

            {/* Documents List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#0072B1]">
                  <Calendar className="h-5 w-5" />
                  Documents for {selectedYear}{" "}
                  {selectedMonth !== "all" ? `- ${months[Number.parseInt(selectedMonth) - 1]}` : ""}
                  {selectedType !== "all" && (
                    <span className="text-sm font-normal text-slate-600">({selectedType} only)</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DocumentList
                  documents={filteredAndSortedDocuments}
                  onView={handleDocumentView}
                  onDownload={handleDocumentDownload}
                  onDelete={handleDocumentDelete}
                  onBulkDelete={handleBulkDelete}
                  onExport={handleExport}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        document={previewDocument}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onUpdate={handleDocumentUpdate}
        onDownload={handleDocumentDownload}
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