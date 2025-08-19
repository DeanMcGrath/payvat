"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Trash2, Eye, MoreHorizontal, Calendar, FolderOpen, Archive, CheckCircle, AlertCircle, Euro, TrendingUp, Star, Zap } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export interface Document {
  id: string
  name: string
  type: "sales" | "purchases"
  date: string
  size: number
  uploadDate: string
  fileType: string
  // Enhanced VAT analytics fields
  vatAmount?: number
  invoiceTotal?: number
  aiConfidence?: number
  processingQuality?: number
  irishVATCompliant?: boolean
  processingEngine?: 'enhanced' | 'legacy'
  extractedDate?: Date
  validationStatus?: 'COMPLIANT' | 'NEEDS_REVIEW' | 'NON_COMPLIANT' | 'PENDING'
  isScanned?: boolean
  scanResult?: string
  // Processing info from enhanced engine
  processingInfo?: {
    engine: 'enhanced' | 'legacy'
    qualityScore: number
    processingSteps: any[]
    irishVATCompliant: boolean
    totalProcessingTime: number
  }
}

interface DocumentListProps {
  documents: Document[]
  onView: (document: Document) => void
  onDownload: (document: Document) => void
  onDelete: (document: Document) => void
  onBulkDelete: (documentIds: string[]) => void
  onExport: (documents: Document[]) => void
}

export default function DocumentList({
  documents,
  onView,
  onDownload,
  onDelete,
  onBulkDelete,
  onExport
}: DocumentListProps) {
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getFileTypeIcon = (fileType: string) => {
    const type = fileType.toLowerCase()
    if (type === 'pdf') return <FileText className="h-4 w-4 text-red-500" />
    if (type === 'xlsx' || type === 'xls') return <FileText className="h-4 w-4 text-green-500" />
    if (type === 'csv') return <FileText className="h-4 w-4 text-blue-500" />
    return <FileText className="h-4 w-4 text-gray-500" />
  }

  const getTypeBadge = (type: string) => {
    return type === 'sales' ? (
      <Badge variant="secondary" className="bg-green-100 text-green-700">
        Sales
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-red-100 text-red-700">
        Purchases
      </Badge>
    )
  }

  const getConfidenceBadge = (confidence?: number) => {
    if (!confidence) return null
    
    const percentage = Math.round(confidence * 100)
    if (percentage >= 80) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-700">
          <CheckCircle className="h-3 w-3 mr-1" />
          {percentage}% confident
        </Badge>
      )
    } else if (percentage >= 60) {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
          <AlertCircle className="h-3 w-3 mr-1" />
          {percentage}% confident
        </Badge>
      )
    } else {
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-700">
          <AlertCircle className="h-3 w-3 mr-1" />
          {percentage}% confident
        </Badge>
      )
    }
  }

  const getQualityBadge = (qualityScore?: number) => {
    if (!qualityScore) return null
    
    if (qualityScore >= 80) {
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
          <Star className="h-3 w-3 mr-1" />
          Quality: {qualityScore}/100
        </Badge>
      )
    } else if (qualityScore >= 60) {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
          <Star className="h-3 w-3 mr-1" />
          Quality: {qualityScore}/100
        </Badge>
      )
    } else {
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-700">
          <Star className="h-3 w-3 mr-1" />
          Quality: {qualityScore}/100
        </Badge>
      )
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDocuments(documents.map(doc => doc.id))
    } else {
      setSelectedDocuments([])
    }
  }

  const handleSelectDocument = (documentId: string, checked: boolean) => {
    if (checked) {
      setSelectedDocuments(prev => [...prev, documentId])
    } else {
      setSelectedDocuments(prev => prev.filter(id => id !== documentId))
    }
  }

  const handleBulkAction = (action: string) => {
    const selectedDocs = documents.filter(doc => selectedDocuments.includes(doc.id))
    
    switch (action) {
      case 'delete':
        onBulkDelete(selectedDocuments)
        setSelectedDocuments([])
        break
      case 'export':
        onExport(selectedDocs)
        break
      case 'download':
        selectedDocs.forEach(doc => onDownload(doc))
        break
    }
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
        <p className="text-gray-500">Upload some documents to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selectedDocuments.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-blue-700 font-medium">
              {selectedDocuments.length} document{selectedDocuments.length > 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('export')}
              className="text-blue-600 hover:text-blue-700"
            >
              <Archive className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('download')}
              className="text-blue-600 hover:text-blue-700"
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('delete')}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      )}

      {/* Documents Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedDocuments.length === documents.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Document</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>VAT Analytics</TableHead>
              <TableHead>Quality</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Size</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((document) => (
              <TableRow key={document.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedDocuments.includes(document.id)}
                    onCheckedChange={(checked) => handleSelectDocument(document.id, checked as boolean)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    {getFileTypeIcon(document.fileType)}
                    <div>
                      <div className="font-medium text-gray-900">{document.name}</div>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="text-sm text-gray-500 uppercase">{document.fileType}</div>
                        {document.isScanned && (
                          <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            AI Processed
                          </Badge>
                        )}
                        {!document.isScanned && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Processing...
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col space-y-1">
                    {getTypeBadge(document.type)}
                    {document.processingEngine === 'enhanced' && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                        <Zap className="h-3 w-3 mr-1" />
                        Enhanced AI
                      </Badge>
                    )}
                    {document.irishVATCompliant && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                        🇮🇪 VAT Compliant
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col space-y-2">
                    {document.vatAmount && (
                      <div className="flex items-center text-sm">
                        <Euro className="h-3 w-3 mr-1 text-green-600" />
                        <span className="font-medium text-green-600">
                          {formatCurrency(document.vatAmount)}
                        </span>
                      </div>
                    )}
                    {document.invoiceTotal && (
                      <div className="flex items-center text-sm text-gray-600">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        <span>Total: {formatCurrency(document.invoiceTotal)}</span>
                      </div>
                    )}
                    {getConfidenceBadge(document.aiConfidence)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col space-y-1">
                    {getQualityBadge(document.processingQuality || document.processingInfo?.qualityScore)}
                    {document.validationStatus && (
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${
                          document.validationStatus === 'COMPLIANT' ? 'bg-green-100 text-green-700' :
                          document.validationStatus === 'NEEDS_REVIEW' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}
                      >
                        {document.validationStatus === 'COMPLIANT' ? 'Compliant' :
                         document.validationStatus === 'NEEDS_REVIEW' ? 'Needs Review' :
                         document.validationStatus === 'NON_COMPLIANT' ? 'Non-Compliant' : 'Pending'}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1 text-gray-600">
                    <Calendar className="h-3 w-3" />
                    <span className="text-sm">{formatDate(document.extractedDate || document.date)}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {formatFileSize(document.size)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(document)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View & Analyze
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDownload(document)}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onDelete(document)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          Showing {documents.length} document{documents.length > 1 ? 's' : ''}
        </span>
        {selectedDocuments.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedDocuments([])}
            className="text-gray-500 hover:text-gray-700"
          >
            Clear selection
          </Button>
        )}
      </div>
    </div>
  )
}