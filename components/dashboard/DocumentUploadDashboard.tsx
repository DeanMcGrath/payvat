"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Eye,
  X,
  RefreshCw,
  TrendingUp,
  Euro,
  Calendar,
  FolderOpen
} from "lucide-react"
import FileUpload from "@/components/file-upload"
import DocumentViewer from "@/components/document-viewer"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/vatUtils"

interface DocumentUploadDashboardProps {
  onDocumentProcessed?: (document: any) => void
  onFolderUpdate?: (year: number, month: number, totals: any) => void
}

interface ProcessedDocument {
  id: string
  fileName: string
  originalName: string
  fileSize: number
  mimeType: string
  category: string
  isScanned: boolean
  extractedDate?: Date
  extractedYear?: number
  extractedMonth?: number
  invoiceTotal?: number
  vatAccuracy?: number
  processingQuality?: number
  isDuplicate: boolean
  validationStatus: string
  complianceIssues: string[]
  uploadedAt: Date
}

interface ExtractedVATData {
  totalSalesVAT: number
  totalPurchaseVAT: number
  totalNetVAT: number
  salesDocuments: Array<{
    id: string
    fileName: string
    extractedAmounts: number[]
    confidence: number
  }>
  purchaseDocuments: Array<{
    id: string
    fileName: string
    extractedAmounts: number[]
    confidence: number
  }>
  processedDocuments: number
  averageConfidence: number
}

export default function DocumentUploadDashboard({ 
  onDocumentProcessed, 
  onFolderUpdate 
}: DocumentUploadDashboardProps) {
  const [uploadedDocuments, setUploadedDocuments] = useState<ProcessedDocument[]>([])
  const [extractedVATData, setExtractedVATData] = useState<ExtractedVATData | null>(null)
  const [loadingExtractedData, setLoadingExtractedData] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<ProcessedDocument | null>(null)
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false)
  const [processingQueue, setProcessingQueue] = useState<string[]>([])
  const [duplicateAlerts, setDuplicateAlerts] = useState<string[]>([])

  // Load uploaded documents on mount
  useEffect(() => {
    loadUploadedDocuments()
    loadExtractedVATData()
  }, [])

  const loadUploadedDocuments = async () => {
    try {
      const response = await fetch('/api/documents?dashboard=true', {
        method: 'GET',
        credentials: 'include'
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.documents) {
          setUploadedDocuments(result.documents.map((doc: any) => ({
            ...doc,
            uploadedAt: new Date(doc.uploadedAt),
            extractedDate: doc.extractedDate ? new Date(doc.extractedDate) : undefined
          })))
        }
      }
    } catch (error) {
      console.error('Failed to load uploaded documents:', error)
    }
  }

  const loadExtractedVATData = async () => {
    try {
      setLoadingExtractedData(true)
      const response = await fetch('/api/documents/extracted-vat', {
        method: 'GET',
        credentials: 'include'
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.extractedVAT) {
          setExtractedVATData(result.extractedVAT)
        }
      }
    } catch (error) {
      console.error('Failed to load extracted VAT data:', error)
    } finally {
      setLoadingExtractedData(false)
    }
  }

  const handleUploadSuccess = async (document: any) => {
    console.log('Document uploaded:', document.fileName)
    
    // Add to processing queue
    setProcessingQueue(prev => [...prev, document.id])
    
    // Add to uploaded documents list
    setUploadedDocuments(prev => [...prev, {
      ...document,
      uploadedAt: new Date(document.uploadedAt),
      extractedDate: document.extractedDate ? new Date(document.extractedDate) : undefined
    }])

    // Check for duplicates
    if (document.isDuplicate) {
      setDuplicateAlerts(prev => [...prev, document.id])
      toast.warning(`Possible duplicate detected: ${document.fileName}`)
    }

    // Refresh VAT data after processing
    setTimeout(() => {
      loadExtractedVATData()
      setProcessingQueue(prev => prev.filter(id => id !== document.id))
      
      // Notify parent component
      if (onDocumentProcessed) {
        onDocumentProcessed(document)
      }
    }, 5000) // Wait for AI processing
  }

  const handleRemoveDocument = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        setUploadedDocuments(prev => prev.filter(doc => doc.id !== documentId))
        setDuplicateAlerts(prev => prev.filter(id => id !== documentId))
        loadExtractedVATData()
        toast.success('Document removed successfully')
      } else {
        toast.error('Failed to remove document')
      }
    } catch (error) {
      toast.error('Network error occurred')
    }
  }

  const handleViewDocument = (document: ProcessedDocument) => {
    setSelectedDocument(document)
    setDocumentViewerOpen(true)
  }

  const getValidationStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLIANT': return 'bg-green-100 text-green-800'
      case 'NON_COMPLIANT': return 'bg-red-100 text-red-800'
      case 'NEEDS_REVIEW': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getValidationStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLIANT': return <CheckCircle className="h-3 w-3 text-green-500" />
      case 'NON_COMPLIANT': return <AlertCircle className="h-3 w-3 text-red-500" />
      case 'NEEDS_REVIEW': return <AlertCircle className="h-3 w-3 text-yellow-500" />
      default: return <Loader2 className="h-3 w-3 animate-spin text-gray-500" />
    }
  }

  const salesDocuments = uploadedDocuments.filter(doc => doc.category?.includes('SALES'))
  const purchaseDocuments = uploadedDocuments.filter(doc => doc.category?.includes('PURCHASE'))

  return (
    <div className="space-y-6">
      {/* Processing Queue Status */}
      {processingQueue.length > 0 && (
        <Card className="border-petrol-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-3">
              <Loader2 className="h-5 w-5 animate-spin text-petrol-base" />
              <div>
                <p className="text-sm font-normal text-blue-900">
                  Processing {processingQueue.length} document{processingQueue.length > 1 ? 's' : ''}...
                </p>
                <p className="text-xs text-petrol-dark">AI is extracting data and organizing documents</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Duplicate Alerts */}
      {duplicateAlerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-normal text-orange-900">
                    {duplicateAlerts.length} possible duplicate{duplicateAlerts.length > 1 ? 's' : ''} detected
                  </p>
                  <p className="text-xs text-orange-700">Review and resolve duplicate documents</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDuplicateAlerts([])}
                className="text-orange-600 hover:bg-orange-100"
              >
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sales Documents Upload Section */}
      <Card className="border-[#99D3FF]">
        <CardHeader className="bg-[#E6F4FF]">
          <CardTitle className="text-lg font-normal text-blue-900 flex items-center justify-between">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-[#2A7A8F]" />
              Sales Documents {salesDocuments.length > 0 && (
                <>({salesDocuments.length})</>
              )}
            </div>
            {extractedVATData?.totalSalesVAT && extractedVATData.totalSalesVAT > 0 && (
              <div className="text-right">
                <div className="text-sm font-normal text-[#2A7A8F]">
                  Total VAT: {formatCurrency(extractedVATData.totalSalesVAT)}
                </div>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <FileUpload
            category="SALES"
            title="Upload Sales Documents"
            description="Upload invoices, receipts, and sales records. AI will extract dates, amounts, and organize by month."
            acceptedFiles={['.pdf', '.csv', '.xlsx', '.xls', '.jpg', '.jpeg', '.png']}
            enableBatchMode={true}
            maxConcurrentUploads={3}
            showBatchProgress={true}
            onUploadSuccess={handleUploadSuccess}
          />
        </CardContent>
      </Card>

      {/* Purchase Documents Upload Section */}
      <Card className="border-green-200">
        <CardHeader className="bg-green-50">
          <CardTitle className="text-lg font-normal text-green-900 flex items-center justify-between">
            <div className="flex items-center">
              <Euro className="h-5 w-5 mr-2 text-green-600" />
              Purchase Documents {purchaseDocuments.length > 0 && (
                <>({purchaseDocuments.length})</>
              )}
            </div>
            {extractedVATData?.totalPurchaseVAT && extractedVATData.totalPurchaseVAT > 0 && (
              <div className="text-right">
                <div className="text-sm font-normal text-green-600">
                  Total VAT: {formatCurrency(extractedVATData.totalPurchaseVAT)}
                </div>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <FileUpload
            category="PURCHASES"
            title="Upload Purchase Documents"
            description="Upload purchase invoices, expense receipts, and supplier documents. AI will extract and organize automatically."
            acceptedFiles={['.pdf', '.csv', '.xlsx', '.xls', '.jpg', '.jpeg', '.png']}
            enableBatchMode={true}
            maxConcurrentUploads={3}
            showBatchProgress={true}
            onUploadSuccess={handleUploadSuccess}
          />
        </CardContent>
      </Card>

      {/* Document Summary */}
      {extractedVATData && extractedVATData.processedDocuments > 0 && (
        <Card className="bg-gradient-to-r from-[#E6F4FF] to-[#CCE7FF] border-[#99D3FF]">
          <CardHeader>
            <CardTitle className="text-lg font-normal text-blue-900 flex items-center">
              <FolderOpen className="h-5 w-5 mr-2 text-[#2A7A8F]" />
              Document Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/70 p-3 rounded-lg border border-[#99D3FF]">
                <div className="text-sm text-gray-600">Sales VAT</div>
                <div className="text-lg font-normal text-[#2A7A8F]">
                  {formatCurrency(extractedVATData.totalSalesVAT)}
                </div>
                <div className="text-xs text-gray-500">
                  {extractedVATData.salesDocuments.length} document(s)
                </div>
              </div>
              
              <div className="bg-white/70 p-3 rounded-lg border border-[#99D3FF]">
                <div className="text-sm text-gray-600">Purchase VAT</div>
                <div className="text-lg font-normal text-[#2A7A8F]">
                  {formatCurrency(extractedVATData.totalPurchaseVAT)}
                </div>
                <div className="text-xs text-gray-500">
                  {extractedVATData.purchaseDocuments.length} document(s)
                </div>
              </div>
              
              <div className="bg-white/70 p-3 rounded-lg border border-[#99D3FF]">
                <div className="text-sm text-gray-600">AI Confidence</div>
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
                onClick={loadExtractedVATData}
                variant="outline" 
                className="border-[#99D3FF] text-[#216477]"
                disabled={loadingExtractedData}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loadingExtractedData ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <DocumentViewer
          isOpen={documentViewerOpen}
          onClose={() => {
            setDocumentViewerOpen(false)
            setSelectedDocument(null)
          }}
          document={selectedDocument}
          extractedVAT={null} // Will be populated when we integrate with existing viewer
          onVATCorrection={(correctionData) => {
            console.log('VAT correction:', correctionData)
            // Handle VAT corrections
            loadExtractedVATData()
          }}
        />
      )}
    </div>
  )
}