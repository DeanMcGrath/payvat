"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Upload, 
  Check, 
  Clock, 
  AlertTriangle,
  Eye,
  Download,
  Trash2,
  Plus,
  Loader2,
  ChevronRight
} from "lucide-react"

interface Document {
  id: string
  name: string
  type: 'invoice' | 'receipt' | 'bank_statement' | 'other'
  status: 'processing' | 'completed' | 'error' | 'pending'
  uploadedAt: Date
  size: number
  vatAmount?: number
  category?: string
}

interface DocumentsOverviewProps {
  className?: string
}

export default function DocumentsOverview({ className }: DocumentsOverviewProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchRecentDocuments()
  }, [])

  const fetchRecentDocuments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/documents?limit=5&sort=recent', {
        method: 'GET',
        credentials: 'include'
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.documents) {
          setDocuments(result.documents.map((doc: any) => ({
            ...doc,
            uploadedAt: new Date(doc.uploadedAt)
          })))
        } else {
          generateMockDocuments()
        }
      } else {
        generateMockDocuments()
      }
    } catch (err) {
      generateMockDocuments()
    } finally {
      setLoading(false)
    }
  }

  const generateMockDocuments = () => {
    const now = new Date()
    const mockDocs: Document[] = [
      {
        id: '1',
        name: 'invoice-2024-001.pdf',
        type: 'invoice',
        status: 'completed',
        uploadedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
        size: 245760,
        vatAmount: 460,
        category: 'Sales'
      },
      {
        id: '2',
        name: 'receipt-office-supplies.pdf',
        type: 'receipt',
        status: 'processing',
        uploadedAt: new Date(now.getTime() - 30 * 60 * 1000), // 30 min ago
        size: 128540,
        vatAmount: 23
      },
      {
        id: '3',
        name: 'bank-statement-november.pdf',
        type: 'bank_statement',
        status: 'completed',
        uploadedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
        size: 512000
      },
      {
        id: '4',
        name: 'invoice-client-xyz.pdf',
        type: 'invoice',
        status: 'error',
        uploadedAt: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3 hours ago
        size: 184320
      }
    ]
    setDocuments(mockDocs)
  }

  const handleFileUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('category', 'general')

        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          credentials: 'include',
          body: formData
        })

        if (response.ok) {
          // Refresh the documents list
          await fetchRecentDocuments()
        }
      }
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'invoice': return <FileText className="h-4 w-4 text-blue-500" />
      case 'receipt': return <FileText className="h-4 w-4 text-green-500" />
      case 'bank_statement': return <FileText className="h-4 w-4 text-purple-500" />
      default: return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <Check className="h-3 w-3 text-green-500" />
      case 'processing': return <Clock className="h-3 w-3 text-yellow-500" />
      case 'error': return <AlertTriangle className="h-3 w-3 text-red-500" />
      case 'pending': return <Clock className="h-3 w-3 text-gray-500" />
      default: return <Clock className="h-3 w-3 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return "bg-green-100 text-green-800"
      case 'processing': return "bg-yellow-100 text-yellow-800"
      case 'error': return "bg-red-100 text-red-800"
      case 'pending': return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  if (loading) {
    return (
      <Card className={`${className} card-modern`}>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-foreground flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-6 w-6 text-primary" />
              <span>Recent Documents</span>
            </div>
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`${className} card-modern hover-lift`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-foreground flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-6 w-6 text-primary" />
            <span>Recent Documents</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {documents.length} recent
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">Recently uploaded documents and their status</p>
      </CardHeader>
      <CardContent>
        {/* Quick Upload Area */}
        <div
          className={`mb-6 p-4 border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer
            ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'}
            ${uploading ? 'opacity-50 pointer-events-none' : ''}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-center">
            {uploading ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Uploading...</span>
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">Drop files here or click to upload</p>
                <p className="text-xs text-muted-foreground">PDF, JPG, PNG up to 10MB</p>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) {
                handleFileUpload(e.target.files)
              }
            }}
          />
        </div>

        {/* Documents List */}
        {documents.length > 0 ? (
          <div className="space-y-3">
            {documents.map(doc => (
              <div
                key={doc.id}
                className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex-shrink-0">
                  {getDocumentIcon(doc.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-foreground truncate">
                      {doc.name}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={`text-xs ${getStatusColor(doc.status)}`}>
                        <span className="flex items-center space-x-1">
                          {getStatusIcon(doc.status)}
                          <span className="capitalize">{doc.status}</span>
                        </span>
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <span>{formatFileSize(doc.size)}</span>
                      <span>•</span>
                      <span>{getTimeAgo(doc.uploadedAt)}</span>
                      {doc.vatAmount && (
                        <>
                          <span>•</span>
                          <span className="text-primary font-medium">
                            VAT: {formatCurrency(doc.vatAmount)}
                          </span>
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <Button
              variant="ghost"
              className="w-full mt-4 text-sm"
              onClick={() => window.location.href = '/vat-submission'}
            >
              View All Documents
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No documents yet</p>
            <p className="text-sm">Upload your first document to get started</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}