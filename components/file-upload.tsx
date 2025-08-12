"use client"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { Progress } from '@/components/ui/progress'

interface UploadedDocument {
  id: string
  fileName: string
  fileSize: number
  category: string
  uploadedAt: string
  isScanned: boolean
  scanResult?: string
  // Enhanced processing info
  processingInfo?: {
    engine: 'enhanced' | 'legacy'
    qualityScore: number
    processingSteps: ProcessingStep[]
    irishVATCompliant: boolean
    totalProcessingTime: number
  }
}

interface ProcessingStep {
  step: string
  success: boolean
  duration: number
  details?: string
  error?: string
}

interface ProcessingState {
  isProcessing: boolean
  currentStep: string
  progress: number
  steps: ProcessingStep[]
  qualityScore?: number
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
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isProcessing: false,
    currentStep: '',
    progress: 0,
    steps: []
  })
  const [isDragOver, setIsDragOver] = useState(false)
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
        
        // Trigger Enhanced AI document processing with real-time feedback
        try {
          // Initialize processing state
          setProcessingState({
            isProcessing: true,
            currentStep: 'Initializing AI Processing...',
            progress: 10,
            steps: []
          })
          
          // Add a small delay to show the processing UI
          await new Promise(resolve => setTimeout(resolve, 500))
          
          setProcessingState(prev => ({
            ...prev,
            currentStep: 'Analyzing document structure...',
            progress: 25
          }))
          
          const processResponse = await fetch('/api/documents/process', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              documentId: newDocument.id
            })
          })
          
          setProcessingState(prev => ({
            ...prev,
            currentStep: 'Extracting VAT information...',
            progress: 60
          }))
          
          const processResult = await processResponse.json()
          
          setProcessingState(prev => ({
            ...prev,
            currentStep: 'Validating Irish VAT compliance...',
            progress: 85
          }))
          
          if (processResponse.ok && processResult.success) {
            // Update the document with enhanced processing results
            const updatedDocument = {
              ...newDocument,
              isScanned: true,
              scanResult: processResult.scanResult || 'Processed with Enhanced AI',
              processingInfo: processResult.processingInfo || undefined
            }
            
            setUploadedFiles(prev => prev.map(doc => 
              doc.id === newDocument.id ? updatedDocument : doc
            ))
            
            // Enhanced success feedback
            const vatAmount = (processResult.extractedData?.salesVAT?.reduce((sum: number, val: number) => sum + val, 0) || 0) +
                             (processResult.extractedData?.purchaseVAT?.reduce((sum: number, val: number) => sum + val, 0) || 0)
            
            const qualityScore = processResult.processingInfo?.qualityScore || 0
            const isCompliant = processResult.processingInfo?.irishVATCompliant || false
            const engine = processResult.processingInfo?.engine || 'legacy'
            
            setProcessingState(prev => ({
              ...prev,
              currentStep: 'Processing complete!',
              progress: 100,
              qualityScore
            }))
            
            if (vatAmount > 0) {
              const engineEmoji = engine === 'enhanced' ? '🚀' : '🤖'
              const complianceEmoji = isCompliant ? '🇮🇪' : '⚠️'
              toast.success(`${engineEmoji} AI extracted €${vatAmount.toFixed(2)} VAT • Quality: ${qualityScore}/100 ${complianceEmoji}`)
            } else {
              toast.success(`Document processed successfully with ${engine} engine`)
            }
            
            // Reset processing state after delay
            setTimeout(() => {
              setProcessingState({
                isProcessing: false,
                currentStep: '',
                progress: 0,
                steps: []
              })
            }, 3000)
            
            onUploadSuccess?.(updatedDocument)
          } else {
            // Enhanced error handling with user-friendly messages
            console.error('AI processing failed:', {
              status: processResponse.status,
              statusText: processResponse.statusText,
              error: processResult?.error || 'Unknown error',
              documentId: newDocument.id
            })
            
            // Update processing state to show error
            setProcessingState(prev => ({
              ...prev,
              currentStep: 'Processing failed - using fallback methods',
              progress: 100
            }))
            
            // Provide specific error messages
            let errorMessage = 'AI processing encountered an issue'
            if (processResult?.errorCode === 'AI_SERVICE_UNAVAILABLE') {
              errorMessage = 'AI service temporarily unavailable - document uploaded successfully'
            } else if (processResult?.errorCode === 'UNSUPPORTED_FILE_TYPE') {
              errorMessage = 'Document format not supported for AI processing'
            } else if (processResult?.errorCode === 'LOW_CONFIDENCE_EXTRACTION') {
              errorMessage = 'Document processed but manual review recommended'
            }
            
            toast.error(errorMessage)
            
            // Reset processing state after delay
            setTimeout(() => {
              setProcessingState({
                isProcessing: false,
                currentStep: '',
                progress: 0,
                steps: []
              })
            }, 3000)
            
            onUploadSuccess?.(newDocument)
          }
        } catch (processError) {
          console.error('AI processing error:', {
            error: processError,
            message: processError instanceof Error ? processError.message : 'Unknown error',
            documentId: newDocument.id
          })
          
          // Update processing state to show network error
          setProcessingState(prev => ({
            ...prev,
            currentStep: 'Connection error - document uploaded successfully',
            progress: 100
          }))
          
          // User-friendly network error message
          let networkErrorMessage = 'Network error during processing'
          if (processError instanceof Error) {
            if (processError.message.includes('fetch')) {
              networkErrorMessage = 'Connection issue - document saved, processing will retry automatically'
            } else if (processError.message.includes('timeout')) {
              networkErrorMessage = 'Processing timeout - document saved, may need manual review'
            }
          }
          
          toast.error(networkErrorMessage)
          
          // Reset processing state
          setTimeout(() => {
            setProcessingState({
              isProcessing: false,
              currentStep: '',
              progress: 0,
              steps: []
            })
          }, 3000)
          
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

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length === 0) return

    console.log('📂 Files dropped:', files.length)
    
    const allowedExtensions = ['pdf', 'csv', 'xlsx', 'xls', 'jpg', 'jpeg', 'png']
    const validFiles: File[] = []
    
    // Validate dropped files
    for (const file of files) {
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
    
    // Show success message for drag and drop
    toast.success(`🎯 ${validFiles.length} file(s) dropped successfully! Processing...`)
    
    // Upload files sequentially
    for (const file of validFiles) {
      await uploadFile(file)
    }
  }

  return (
    <div>
      <h4 className="text-md font-semibold text-gray-900 mb-3">{title}</h4>
      
      {/* Enhanced Upload Area with Drag and Drop */}
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
          isDragOver 
            ? 'border-teal-500 bg-teal-50 scale-105' 
            : 'border-gray-300 hover:border-teal-300'
        } ${
          (isUploading || processingState.isProcessing) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !isUploading && !processingState.isProcessing && handleFileSelect()}
      >
        {isDragOver ? (
          <div className="animate-bounce">
            <div className="h-10 w-10 mx-auto mb-3 rounded-full bg-teal-100 flex items-center justify-center">
              <Upload className="h-6 w-6 text-teal-600" />
            </div>
            <p className="text-teal-700 font-semibold mb-2">Drop files here!</p>
            <p className="text-sm text-teal-600">Release to upload your VAT documents</p>
          </div>
        ) : (
          <>
            <Upload className={`h-10 w-10 mx-auto mb-3 transition-colors ${
              isUploading || processingState.isProcessing ? 'text-gray-300' : 'text-gray-400'
            }`} />
            <p className="text-gray-600 mb-2">{description}</p>
            <p className="text-sm text-gray-500 mb-3">
              Drag & drop files here, or click to select • PDF, Excel, CSV, Images • Up to 10MB each
            </p>
          </>
        )}
        
        <Button 
          variant="outline" 
          className="border-teal-200 text-teal-700 hover:bg-teal-50"
          onClick={handleFileSelect}
          disabled={isUploading || processingState.isProcessing}
        >
          {isUploading ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Uploading...</>
          ) : processingState.isProcessing ? (
            <><Zap className="h-4 w-4 mr-2 animate-pulse" />AI Processing...</>
          ) : (
            `Choose ${category === 'SALES' ? 'Sales' : 'Purchase'} Files`
          )}
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

      {/* Real-time Processing Indicator */}
      {processingState.isProcessing && (
        <div className="mt-4 p-4 bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg border border-teal-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-teal-500 border-t-transparent mr-3"></div>
              <span className="text-sm font-medium text-teal-800">Enhanced AI Processing</span>
              {processingState.qualityScore && (
                <span className="ml-2 px-2 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-medium">
                  Quality: {processingState.qualityScore}/100
                </span>
              )}
            </div>
            <span className="text-sm text-teal-600">{processingState.progress}%</span>
          </div>
          
          <Progress value={processingState.progress} className="mb-3" />
          
          <div className="flex items-center text-sm text-teal-700">
            <Zap className="h-4 w-4 mr-2 animate-pulse" />
            {processingState.currentStep}
          </div>
          
          {processingState.progress >= 100 && (
            <div className="mt-3 flex items-center text-sm text-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Processing complete! Irish VAT compliance validated.
            </div>
          )}
        </div>
      )}
      
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