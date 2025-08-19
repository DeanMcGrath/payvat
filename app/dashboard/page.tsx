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

  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "1",
      name: "Invoice_2024_001.pdf",
      type: "sales",
      date: "2024-01-15",
      size: 245760,
      uploadDate: "2024-01-15T10:30:00Z",
      fileType: "pdf",
    },
    {
      id: "2",
      name: "Receipt_Office_Supplies.pdf",
      type: "purchases",
      date: "2024-01-20",
      size: 156432,
      uploadDate: "2024-01-20T14:15:00Z",
      fileType: "pdf",
    },
    {
      id: "3",
      name: "Sales_Report_Q1.xlsx",
      type: "sales",
      date: "2024-03-31",
      size: 512000,
      uploadDate: "2024-03-31T16:45:00Z",
      fileType: "xlsx",
    },
    {
      id: "4",
      name: "Equipment_Purchase.pdf",
      type: "purchases",
      date: "2024-02-10",
      size: 324567,
      uploadDate: "2024-02-10T09:20:00Z",
      fileType: "pdf",
    },
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

    return { total, sales, purchases }
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
    setPreviewDocument(document)
    setIsPreviewOpen(true)
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
    console.log("[v0] Files uploaded:", uploadedFiles)
    // TODO: Convert uploaded files to Document format and add to documents state
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

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                      <p className="text-sm text-slate-600">Sales Documents</p>
                      <p className="text-2xl font-bold text-green-600">{stats.sales}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Purchase Documents</p>
                      <p className="text-2xl font-bold text-red-600">{stats.purchases}</p>
                    </div>
                    <TrendingDown className="h-8 w-8 text-red-600" />
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
    </div>
  )
}