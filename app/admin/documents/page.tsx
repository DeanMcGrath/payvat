'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { 
  FileText, 
  Search, 
  Filter,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Building,
  Calendar,
  FileIcon,
  Scan,
  MoreHorizontal,
  Trash2,
  Archive,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'

interface Document {
  id: string
  fileName: string
  fileSize: number
  mimeType: string
  documentType: string | null
  category: string
  isScanned: boolean
  scanResult: any | null
  uploadedAt: Date
  user: {
    id: string
    email: string
    businessName: string
    vatNumber: string
  }
  vatReturn: {
    id: string
    period: string
    status: string
    revenueRefNumber: string | null
  } | null
}

interface DocumentsResponse {
  success: boolean
  documents: Document[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
  }
}

export default function AdminDocuments() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [userIdFilter, setUserIdFilter] = useState<string | undefined>(undefined)
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined)
  const [documentTypeFilter, setDocumentTypeFilter] = useState<string | undefined>(undefined)
  const [scannedFilter, setScannedFilter] = useState<string | undefined>(undefined)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0
  })
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set())
  const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false)

  const fetchDocuments = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      })
      
      if (search) params.append('search', search)
      if (userIdFilter) params.append('userId', userIdFilter)
      if (categoryFilter) params.append('category', categoryFilter)
      if (documentTypeFilter) params.append('documentType', documentTypeFilter)
      if (scannedFilter) params.append('isScanned', scannedFilter)

      const response = await fetch(`/api/admin/documents?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch documents')
      }
      
      const data: DocumentsResponse = await response.json()
      setDocuments(data.documents)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load documents')
    } finally {
      setLoading(false)
    }
  }, [search, userIdFilter, categoryFilter, documentTypeFilter, scannedFilter, page])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-IE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'sales':
        return 'bg-green-100 text-green-800'
      case 'purchases':
        return 'bg-blue-100 text-blue-800'
      case 'expenses':
        return 'bg-orange-100 text-orange-800'
      case 'other':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-purple-100 text-purple-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'paid':
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const getFileTypeIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <FileIcon className="h-4 w-4 text-blue-500" />
    }
    if (mimeType.includes('pdf')) {
      return <FileIcon className="h-4 w-4 text-red-500" />
    }
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
      return <FileIcon className="h-4 w-4 text-green-500" />
    }
    return <FileIcon className="h-4 w-4 text-gray-500" />
  }

  // Parse VAT amounts and confidence from scanResult
  const parseVATFromScanResult = (scanResult: string | any) => {
    if (!scanResult || typeof scanResult !== 'string') {
      return null
    }

    // Pattern 1: "AI extracted N VAT amount(s): €X.XX, €Y.YY (ZZ% confidence)"
    const aiPattern = /(?:AI|Legacy|HARDCODED)\s+(?:processing\s+)?(?:successfully\s+)?extracted\s+\d+\s+VAT\s+amount\(s\):\s+(€[\d,]+\.?\d*(?:,\s+€[\d,]+\.?\d*)*)\s+\((\d+)%\s+confidence/i
    let match = scanResult.match(aiPattern)
    if (match) {
      const vatAmountsStr = match[1]
      const confidence = parseInt(match[2])
      const vatAmounts = vatAmountsStr.split(',').map(amount => amount.trim())
      return { vatAmounts, confidence }
    }

    // Pattern 2: "VAT extracted from Excel: €X.XX"
    const excelPattern = /VAT\s+extracted\s+from\s+Excel:\s+(€[\d,]+\.?\d*)/i
    match = scanResult.match(excelPattern)
    if (match) {
      return { vatAmounts: [match[1]], confidence: 95 } // Default high confidence for Excel
    }

    // Pattern 3: Direct euro amounts in scan result
    const euroPattern = /€([\d,]+\.?\d*)/g
    const euros = []
    let euroMatch
    while ((euroMatch = euroPattern.exec(scanResult)) !== null) {
      euros.push(`€${euroMatch[1]}`)
    }
    if (euros.length > 0) {
      // Try to extract confidence if available
      const confPattern = /(\d+)%/
      const confMatch = scanResult.match(confPattern)
      const confidence = confMatch ? parseInt(confMatch[1]) : 85 // Default confidence
      return { vatAmounts: euros.slice(0, 3), confidence } // Limit to first 3 amounts
    }

    return null
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1) // Reset to first page on search
  }

  const handleFilterChange = (filterType: string, value: string) => {
    switch (filterType) {
      case 'category':
        setCategoryFilter(value === 'all' ? undefined : value)
        break
      case 'documentType':
        setDocumentTypeFilter(value === 'all' ? undefined : value)
        break
      case 'scanned':
        setScannedFilter(value === 'all' ? undefined : value)
        break
    }
    setPage(1) // Reset to first page on filter change
  }

  const handleSelectDocument = (documentId: string, checked: boolean) => {
    setSelectedDocuments(prev => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(documentId)
      } else {
        newSet.delete(documentId)
      }
      return newSet
    })
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDocuments(new Set(documents.map(doc => doc.id)))
    } else {
      setSelectedDocuments(new Set())
    }
  }

  const handleBulkAction = async (action: 'download' | 'delete' | 'rescan' | 'archive') => {
    if (selectedDocuments.size === 0) return
    
    setIsPerformingBulkAction(true)
    try {
      switch (action) {
        case 'download':
          await handleDownloadDocuments(Array.from(selectedDocuments))
          break
        case 'rescan':
          await handleRescanDocuments(Array.from(selectedDocuments))
          break
        case 'archive':
          await handleArchiveDocuments(Array.from(selectedDocuments))
          break
        case 'delete':
          if (confirm(`Are you sure you want to delete ${selectedDocuments.size} document(s)? This action cannot be undone.`)) {
            await handleDeleteDocuments(Array.from(selectedDocuments))
          }
          break
      }
      setSelectedDocuments(new Set()) // Clear selection after action
      fetchDocuments() // Refresh the list
    } catch (error) {
      console.error('Bulk action failed:', error)
      setError(`Failed to perform bulk action: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsPerformingBulkAction(false)
    }
  }

  const handleDownloadDocuments = async (documentIds: string[]) => {
    const response = await fetch('/api/admin/documents/bulk-download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentIds }),
      credentials: 'include'
    })
    
    if (!response.ok) throw new Error('Download failed')
    
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `documents-${new Date().toISOString().split('T')[0]}.zip`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleRescanDocuments = async (documentIds: string[]) => {
    const response = await fetch('/api/admin/documents/bulk-rescan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentIds }),
      credentials: 'include'
    })
    
    if (!response.ok) throw new Error('Rescan failed')
  }

  const handleArchiveDocuments = async (documentIds: string[]) => {
    const response = await fetch('/api/admin/documents/bulk-archive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentIds }),
      credentials: 'include'
    })
    
    if (!response.ok) throw new Error('Archive failed')
  }

  const handleDeleteDocuments = async (documentIds: string[]) => {
    const response = await fetch('/api/admin/documents/bulk-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentIds }),
      credentials: 'include'
    })
    
    if (!response.ok) throw new Error('Delete failed')
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Documents</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchDocuments}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Document Review</h1>
          <p className="text-gray-600">Review and manage uploaded documents</p>
        </div>
        <Link href="/admin">
          <Button variant="outline">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </div>
            {selectedDocuments.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {selectedDocuments.size} selected
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={isPerformingBulkAction}
                    >
                      {isPerformingBulkAction ? 'Processing...' : 'Bulk Actions'}
                      <MoreHorizontal className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleBulkAction('download')}>
                      <Download className="h-4 w-4 mr-2" />
                      Download Selected
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('rescan')}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Rescan Selected
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleBulkAction('archive')}>
                      <Archive className="h-4 w-4 mr-2" />
                      Archive Selected
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleBulkAction('delete')}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Selected
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by filename, user, or VAT number..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter || undefined} onValueChange={(value) => handleFilterChange('category', value)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="SALES">Sales</SelectItem>
                <SelectItem value="PURCHASES">Purchases</SelectItem>
                <SelectItem value="EXPENSES">Expenses</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select value={documentTypeFilter || undefined} onValueChange={(value) => handleFilterChange('documentType', value)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="INVOICE">Invoice</SelectItem>
                <SelectItem value="RECEIPT">Receipt</SelectItem>
                <SelectItem value="BANK_STATEMENT">Bank Statement</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select value={scannedFilter || undefined} onValueChange={(value) => handleFilterChange('scanned', value)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Documents" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Documents</SelectItem>
                <SelectItem value="true">Scanned Only</SelectItem>
                <SelectItem value="false">Not Scanned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              Documents ({pagination.totalCount})
            </CardTitle>
            <div className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.totalPages}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No documents found</p>
              </div>
            ) : (
              documents.map((document) => (
                <div key={document.id} className="border rounded-lg p-4 hover:bg-gray-100">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Document Info */}
                    <div className="flex-1">
                      <div className="flex items-start space-x-3 mb-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {getFileTypeIcon(document.mimeType)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-lg truncate">
                                {document.fileName}
                              </h3>
                              <Badge className={getCategoryColor(document.category)}>
                                {document.category.toLowerCase()}
                              </Badge>
                            </div>
                            
                            {/* VAT Amount Display - Prominently positioned on the right */}
                            <div className="flex items-center space-x-2">
                              {document.isScanned ? (
                                (() => {
                                  const vatInfo = parseVATFromScanResult(document.scanResult)
                                  return vatInfo ? (
                                    <div className="flex items-center bg-green-50 text-green-800 px-3 py-1 rounded-md border border-green-200">
                                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                      <div className="text-right">
                                        <div className="font-semibold">
                                          VAT: {vatInfo.vatAmounts.join(', ')}
                                        </div>
                                        <div className="text-xs opacity-75">
                                          {vatInfo.confidence}% confidence
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <Badge variant="outline" className="bg-green-50 text-green-700">
                                      <Scan className="h-3 w-3 mr-1" />
                                      AI Processed
                                    </Badge>
                                  )
                                })()
                              ) : (
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Not Scanned
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            <span>{formatFileSize(document.fileSize)}</span>
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDate(document.uploadedAt)}
                            </span>
                            {document.documentType && (
                              <span>Type: {document.documentType.toLowerCase().replace('_', ' ')}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* User Info */}
                      <div className="ml-11 mb-2">
                        <div className="flex items-center space-x-2 text-sm">
                          <Building className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{document.user.businessName}</span>
                          <span className="text-gray-500">({document.user.vatNumber})</span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-500">{document.user.email}</span>
                        </div>
                      </div>

                      {/* VAT Return Info */}
                      {document.vatReturn && (
                        <div className="ml-11">
                          <div className="flex items-center space-x-2 text-sm">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <span>VAT Return: {document.vatReturn.period}</span>
                            <Badge className={getStatusColor(document.vatReturn.status)}>
                              {document.vatReturn.status}
                            </Badge>
                            {document.vatReturn.revenueRefNumber && (
                              <span className="text-gray-500">
                                Ref: {document.vatReturn.revenueRefNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>

                  {/* Scan Results */}
                  {document.isScanned && document.scanResult && (
                    <div className="ml-11 mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                      <div className="font-medium text-blue-800 mb-1">Scan Results:</div>
                      <div className="text-blue-700">
                        {typeof document.scanResult === 'object' 
                          ? (
                              <pre className="whitespace-pre-wrap font-mono text-xs bg-white p-2 rounded border max-h-32 overflow-y-auto">
                                {JSON.stringify(document.scanResult, null, 2)}
                              </pre>
                            )
                          : (
                              <div className="whitespace-pre-wrap">
                                {document.scanResult}
                              </div>
                            )
                        }
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{pagination.totalCount}</div>
                <div className="text-sm text-gray-500">Total Documents</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">
                  {documents.filter(d => d.isScanned).length}
                </div>
                <div className="text-sm text-gray-500">Scanned</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">
                  {documents.filter(d => !d.isScanned).length}
                </div>
                <div className="text-sm text-gray-500">Not Scanned</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">
                  {new Set(documents.map(d => d.user.id)).size}
                </div>
                <div className="text-sm text-gray-500">Unique Users</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Showing {((page - 1) * pagination.limit) + 1} to {Math.min(page * pagination.limit, pagination.totalCount)} of {pagination.totalCount} documents
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= pagination.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}