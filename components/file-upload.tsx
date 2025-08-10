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
  scanResult?: string
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
    console.log('🔥🔥🔥 HANDLEFILESELECT CALLED - User clicked upload button')
    console.log('📁 File input ref exists:', !!fileInputRef.current)
    fileInputRef.current?.click()
    console.log('✅ File input click() triggered')
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🔥🔥🔥 HANDLEFILECHANGE CALLED - Files were selected')
    console.log('📂 Event target:', event.target)
    console.log('📂 Event target files:', event.target.files)
    const files = event.target.files
    console.log('📂 Files count:', files?.length || 0)
    if (!files || files.length === 0) {
      console.log('❌ No files selected, returning early')
      return
    }

    const allowedExtensions = ['pdf', 'csv', 'xlsx', 'xls', 'jpg', 'jpeg', 'png']
    const validFiles: File[] = []
    
    // Validate all selected files
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File "${file.name}" is too large. Must be less than 10MB`)
        continue
      }

      // Validate file type
      const extension = file.name.split('.').pop()?.toLowerCase()
      
      if (!extension || !allowedExtensions.includes(extension)) {
        toast.error(`File "${file.name}" has invalid type. Please upload PDF, Excel, CSV, or image files.`)
        continue
      }
      
      validFiles.push(file)
    }
    
    if (validFiles.length === 0) return
    
    // Show progress toast for multiple files
    if (validFiles.length > 1) {
      toast.success(`Starting upload of ${validFiles.length} files...`)
    }

    // Upload files sequentially to avoid overwhelming the server
    console.log(`🚀 Starting upload of ${validFiles.length} valid files`)
    for (const file of validFiles) {
      console.log(`📤 About to upload file: ${file.name}`)
      await uploadFile(file)
      console.log(`✅ Finished uploading file: ${file.name}`)
    }
  }

  const uploadFile = async (file: File) => {
    console.log('🔥🔥🔥 UPLOADFILE FUNCTION CALLED')
    console.log('📄 File details:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    })
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      const categoryValue = getCategoryValue(category, file.name)
      formData.append('category', categoryValue)
      console.log('📂 Category determined:', categoryValue)
      
      if (vatReturnId) {
        formData.append('vatReturnId', vatReturnId)
        console.log('🔑 VAT Return ID added:', vatReturnId)
      }

      console.log('🌐🌐🌐 ABOUT TO SEND NETWORK REQUEST TO /api/upload')
      console.log('📡 Request details:', {
        url: '/api/upload',
        method: 'POST',
        hasFormData: true,
        formDataEntries: Array.from(formData.entries()).map(([key, value]) => 
          key === 'file' ? [key, `File: ${(value as File).name}`] : [key, value]
        )
      })

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      console.log('🌐 NETWORK REQUEST COMPLETED')
      console.log('📡 Response status:', response.status, response.statusText)
      console.log('📡 Response ok:', response.ok)

      const result = await response.json()
      console.log('📄 Response JSON:', result)

      if (response.ok && result.success) {
        console.log('✅ Upload successful, processing response')
        const newDocument: UploadedDocument = result.document
        setUploadedFiles(prev => [...prev, newDocument])
        toast.success('File uploaded successfully')
        
        // Trigger AI document processing automatically
        try {
          const processResponse = await fetch('/api/documents/process', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              documentId: newDocument.id
            })
          })
          
          const processResult = await processResponse.json()
          
          if (processResponse.ok && processResult.success) {
            // Update the document with processing results
            const updatedDocument = {
              ...newDocument,
              isScanned: true,
              scanResult: processResult.scanResult || 'Processed with AI'
            }
            
            setUploadedFiles(prev => prev.map(doc => 
              doc.id === newDocument.id ? updatedDocument : doc
            ))
            
            if (processResult.extractedData?.salesVAT?.length > 0 || processResult.extractedData?.purchaseVAT?.length > 0) {
              const vatAmount = processResult.extractedData.salesVAT?.reduce((sum: number, val: number) => sum + val, 0) || 
                               processResult.extractedData.purchaseVAT?.reduce((sum: number, val: number) => sum + val, 0) || 0
              if (vatAmount > 0) {
                toast.success(`🤖 AI extracted €${vatAmount.toFixed(2)} VAT from document`)
              }
            }
            
            onUploadSuccess?.(updatedDocument)
          } else {
            console.error('AI processing failed:', {
              status: processResponse.status,
              statusText: processResponse.statusText,
              error: processResult?.error || 'Unknown error',
              documentId: newDocument.id
            })
            toast.error(`AI processing failed: ${processResult?.error || 'Unknown error'}`)
            onUploadSuccess?.(newDocument)
          }
        } catch (processError) {
          console.error('AI processing error:', {
            error: processError,
            message: processError instanceof Error ? processError.message : 'Unknown error',
            documentId: newDocument.id
          })
          toast.error(`AI processing failed: ${processError instanceof Error ? processError.message : 'Network error'}`)
          onUploadSuccess?.(newDocument)
        }
      } else {
        console.log('❌ Upload failed')
        console.log('📄 Error details:', result)
        toast.error(result.error || 'Upload failed')
      }
    } catch (error) {
      console.error('🚨🚨🚨 UPLOAD ERROR CAUGHT:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        name: error instanceof Error ? error.name : 'Unknown error type'
      })
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
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-teal-300 transition-colors">
        <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 mb-2">{description}</p>
        <p className="text-sm text-gray-500 mb-3">Select multiple files: PDF, Excel, or CSV files up to 10MB each</p>
        
        <Button 
          variant="outline" 
          className="border-teal-200 text-teal-700 hover:bg-teal-50"
          onClick={handleFileSelect}
          disabled={isUploading}
        >
          {isUploading ? '🤖 Processing with AI...' : `Choose ${category === 'SALES' ? 'Sales' : 'Purchase'} Files`}
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          accept={acceptedFiles.join(',')}
          onChange={handleFileChange}
        />
      </div>
      
      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploadedFiles.map((file) => (
            <div key={file.id} className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.fileName}</p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.fileSize)} • {file.category.replace('_', ' ')}
                  </p>
                  <div className="text-xs mt-1">
                    {file.isScanned && (
                      <span className="inline-flex items-center text-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {file.scanResult?.includes('€') ? (
                          <span className="font-medium">{file.scanResult}</span>
                        ) : (
                          'Processed'
                        )}
                      </span>
                    )}
                    {!file.isScanned && (
                      <span className="inline-flex items-center text-yellow-600">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Processing document...
                      </span>
                    )}
                  </div>
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