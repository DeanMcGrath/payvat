"use client"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface UploadedDocument {
  id: string
  fileName: string
  fileSize: number
  category: string
  uploadedAt: string
  isScanned: boolean
}

interface FileUploadProps {
  category: 'SALES' | 'PURCHASES'
  title: string
  description: string
  acceptedFiles: string[]
  onUploadSuccess?: (document: UploadedDocument) => void
  vatReturnId?: string
}

export default function FileUpload({
  category,
  title,
  description,
  acceptedFiles,
  onUploadSuccess,
  vatReturnId
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedDocument[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Map category to backend enum values
  const getCategoryValue = (fileCategory: 'SALES' | 'PURCHASES', fileName: string) => {
    const lower = fileName.toLowerCase()
    
    if (fileCategory === 'SALES') {
      if (lower.includes('invoice')) return 'SALES_INVOICE'
      if (lower.includes('receipt')) return 'SALES_RECEIPT'
      return 'SALES_REPORT'
    } else {
      if (lower.includes('invoice')) return 'PURCHASE_INVOICE'
      if (lower.includes('receipt')) return 'PURCHASE_RECEIPT'
      return 'PURCHASE_REPORT'
    }
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    
    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }

    // Validate file type
    const extension = file.name.split('.').pop()?.toLowerCase()
    const allowedExtensions = ['pdf', 'csv', 'xlsx', 'xls', 'jpg', 'jpeg', 'png']
    
    if (!extension || !allowedExtensions.includes(extension)) {
      toast.error('Invalid file type. Please upload PDF, Excel, CSV, or image files.')
      return
    }

    await uploadFile(file)
  }

  const uploadFile = async (file: File) => {
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', getCategoryValue(category, file.name))
      
      if (vatReturnId) {
        formData.append('vatReturnId', vatReturnId)
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (response.ok && result.success) {
        const newDocument: UploadedDocument = result.document
        setUploadedFiles(prev => [...prev, newDocument])
        onUploadSuccess?.(newDocument)
        toast.success('File uploaded successfully')
      } else {
        toast.error(result.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeFile = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setUploadedFiles(prev => prev.filter(doc => doc.id !== documentId))
        toast.success('File removed successfully')
      } else {
        const result = await response.json()
        toast.error(result.error || 'Failed to remove file')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to remove file')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div>
      <h4 className="text-md font-semibold text-gray-900 mb-3">{title}</h4>
      
      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-300 transition-colors">
        <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 mb-2">{description}</p>
        <p className="text-sm text-gray-500 mb-3">PDF, Excel, or CSV files up to 10MB each</p>
        
        <Button 
          variant="outline" 
          className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
          onClick={handleFileSelect}
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : `Choose ${category === 'SALES' ? 'Sales' : 'Purchase'} Files`}
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={acceptedFiles.join(',')}
          onChange={handleFileChange}
        />
      </div>
      
      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploadedFiles.map((file) => (
            <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.fileName}</p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.fileSize)} • {file.category.replace('_', ' ')}
                    {file.isScanned && (
                      <span className="ml-2 inline-flex items-center">
                        <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                        Scanned
                      </span>
                    )}
                    {!file.isScanned && (
                      <span className="ml-2 inline-flex items-center">
                        <AlertCircle className="h-3 w-3 text-yellow-500 mr-1" />
                        Pending scan
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(file.id)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
      
      {/* Guidelines */}
      <div className="mt-3 text-xs text-gray-500">
        {category === 'SALES' ? (
          <>
            <p>• Sales invoices and receipts</p>
            <p>• Customer payment records</p>
            <p>• Sales reports and summaries</p>
          </>
        ) : (
          <>
            <p>• Purchase invoices and receipts</p>
            <p>• Supplier payment records</p>
            <p>• Expense reports and summaries</p>
          </>
        )}
      </div>
    </div>
  )
}