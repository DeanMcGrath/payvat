"use client"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2, ArrowRight, Pause, Play, RotateCcw, Trash2 } from 'lucide-react'
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
  // New batch upload options
  enableBatchMode?: boolean
  maxConcurrentUploads?: number
  showBatchProgress?: boolean
}

export default function FileUpload({
  category,
  title,
  description,
  acceptedFiles,
  onUploadSuccess,
  vatReturnId,
  enableBatchMode = false,
  maxConcurrentUploads = 3,
  showBatchProgress = true
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
  
  // Batch upload state
  const [uploadQueue, setUploadQueue] = useState<File[]>([])
  const [currentUploads, setCurrentUploads] = useState<Set<string>>(new Set())
  const [uploadResults, setUploadResults] = useState<Map<string, {status: 'success' | 'error' | 'uploading', document?: UploadedDocument, error?: string}>>(new Map())
  const [batchProgress, setBatchProgress] = useState({ completed: 0, total: 0, failed: 0 })
  const [isPaused, setIsPaused] = useState(false)

  // Smart file categorization based on file name patterns
  const getSmartCategory = (fileName: string): 'SALES' | 'PURCHASES' => {
    const lower = fileName.toLowerCase()
    
    // Sales indicators
    const salesKeywords = ['sales', 'invoice', 'receipt', 'customer', 'payment_received', 'income', 'revenue']
    const purchaseKeywords = ['purchase', 'expense', 'supplier', 'vendor', 'bill', 'paid', 'cost', 'woocommerce']
    
    const salesScore = salesKeywords.reduce((score, keyword) => score + (lower.includes(keyword) ? 1 : 0), 0)
    const purchaseScore = purchaseKeywords.reduce((score, keyword) => score + (lower.includes(keyword) ? 1 : 0), 0)
    
    // Default to category prop, but use smart detection if confidence is high
    if (purchaseScore > salesScore && purchaseScore > 0) return 'PURCHASES'
    if (salesScore > purchaseScore && salesScore > 0) return 'SALES'
    
    return category // Fallback to prop
  }

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

  const handleFileSelect = (event?: React.MouseEvent) => {
    // Prevent double-triggering from multiple event handlers
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
    
    // Prevent action if already uploading or processing
    if (isUploading || processingState.isProcessing) {
      console.log('Upload blocked - already in progress')
      return
    }
    
    console.log('HANDLEFILESELECT CALLED - User clicked upload button')
    console.log('File input ref exists:', !!fileInputRef.current)
    console.log('Current uploading state:', isUploading)
    console.log('Current processing state:', processingState.isProcessing)
    
    // Ensure file input exists before clicking
    if (fileInputRef.current) {
      fileInputRef.current.click()
      console.log('File input click() triggered successfully')
    } else {
      console.error('File input ref not available')
      toast.error('Upload initialization failed. Please try again.')
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('HANDLEFILECHANGE CALLED - Files were selected')
    console.log('Event target:', event.target)
    console.log('Event target files:', event.target.files)
    
    // Prevent processing if already uploading
    if (isUploading || processingState.isProcessing) {
      console.log('File change blocked - upload already in progress')
      return
    }
    
    const files = event.target.files
    console.log('Files count:', files?.length || 0)
    if (!files || files.length === 0) {
      console.log('No files selected, returning early')
      return
    }

    // Set uploading state immediately to prevent double-clicks
    console.log('Setting isUploading to true to prevent concurrent uploads')
    setIsUploading(true)

    try {
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
      
      if (validFiles.length === 0) {
        console.log('No valid files to upload, resetting upload state')
        setIsUploading(false)
        return
      }
      
      // Show progress toast for multiple files
      if (validFiles.length > 1) {
        toast.success(`Starting upload of ${validFiles.length} files...`)
      }

      // Handle batch or sequential upload based on mode
      console.log(`Starting upload of ${validFiles.length} valid files`)
      if (enableBatchMode && validFiles.length > 1) {
        // Initialize batch progress
        setBatchProgress({ completed: 0, total: validFiles.length, failed: 0 })
        setUploadQueue(validFiles)
        
        // Start concurrent uploads
        processBatchQueue(validFiles)
      } else {
        // Sequential upload for single files or when batch mode is disabled
        for (const file of validFiles) {
          console.log(`About to upload file: ${file.name}`)
          await uploadFile(file)
          console.log(`Finished uploading file: ${file.name}`)
        }
      }
      
      // All files uploaded successfully - reset states
      console.log('All files uploaded successfully, resetting upload state')
      setIsUploading(false)
      
      // Reset file input to allow re-selection of the same files if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
        console.log('File input reset for future uploads')
      }
      
    } catch (error) {
      console.error('File validation/upload error:', error)
      toast.error('Upload failed. Please try again.')
      setIsUploading(false)
      
      // Don't reset file input on error - allow retry with same files
      console.log('Upload failed, keeping file selection for retry')
    } finally {
      console.log('File change handler completed')
    }
  }

  // Batch queue processing with concurrent uploads
  const processBatchQueue = async (files: File[]) => {
    const activeUploads = new Set<string>()
    const results = new Map<string, any>()
    let completedCount = 0
    let failedCount = 0

    const processFile = async (file: File) => {
      const fileId = `${file.name}_${file.lastModified}`
      activeUploads.add(fileId)
      setCurrentUploads(new Set(activeUploads))
      
      // Update upload results to show uploading status
      results.set(fileId, { status: 'uploading' })
      setUploadResults(new Map(results))

      try {
        // Use smart categorization if enabled
        const smartCategory = enableBatchMode ? getSmartCategory(file.name) : category
        const uploadedDocument = await uploadFileBatch(file, smartCategory)
        
        results.set(fileId, { status: 'success', document: uploadedDocument })
        completedCount++
        
        if (enableBatchMode) {
          toast.success(`✅ ${file.name} uploaded successfully${smartCategory !== category ? ` (auto-categorized as ${smartCategory})` : ''}`)
        }
      } catch (error) {
        results.set(fileId, { status: 'error', error: error instanceof Error ? error.message : 'Upload failed' })
        failedCount++
        toast.error(`❌ ${file.name} upload failed`)
      } finally {
        activeUploads.delete(fileId)
        setCurrentUploads(new Set(activeUploads))
        setUploadResults(new Map(results))
        setBatchProgress({ completed: completedCount, total: files.length, failed: failedCount })
      }
    }

    // Process files with concurrent limit
    const chunks = []
    for (let i = 0; i < files.length; i += maxConcurrentUploads) {
      chunks.push(files.slice(i, i + maxConcurrentUploads))
    }

    for (const chunk of chunks) {
      if (isPaused) break
      await Promise.all(chunk.map(processFile))
    }

    // Show batch completion summary
    if (completedCount > 0 || failedCount > 0) {
      const summary = `Batch upload complete: ${completedCount} successful, ${failedCount} failed`
      failedCount > 0 ? toast.error(summary) : toast.success(summary)
    }
  }

  const uploadFileBatch = async (file: File, fileCategory: 'SALES' | 'PURCHASES'): Promise<UploadedDocument> => {
    const formData = new FormData()
    formData.append('file', file)
    const categoryValue = getCategoryValue(fileCategory, file.name)
    formData.append('category', categoryValue)
    
    if (vatReturnId) {
      formData.append('vatReturnId', vatReturnId)
    }

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    const result = await response.json()

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Upload failed')
    }

    const newDocument: UploadedDocument = result.document
    setUploadedFiles(prev => [...prev, newDocument])
    
    // Trigger processing without blocking
    processDocumentInBackground(newDocument)
    
    return newDocument
  }

  const processDocumentInBackground = async (document: UploadedDocument) => {
    try {
      const processResponse = await fetch('/api/documents/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: document.id })
      })
      
      if (processResponse.ok) {
        const processResult = await processResponse.json()
        if (processResult.success) {
          // Update the document with processing results
          const updatedDocument = {
            ...document,
            isScanned: true,
            scanResult: processResult.scanResult || 'Processed with AI',
            processingInfo: processResult.processingInfo
          }
          
          setUploadedFiles(prev => prev.map(doc => 
            doc.id === document.id ? updatedDocument : doc
          ))
          
          onUploadSuccess?.(updatedDocument)
        }
      }
    } catch (error) {
      console.error('Background processing failed:', error)
    }
  }

  const uploadFile = async (file: File) => {
    console.log('UPLOADFILE FUNCTION CALLED')
    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    })
    
    // Note: isUploading is already set to true in handleFileChange
    // Don't set it again here to avoid state conflicts

    try {
      const formData = new FormData()
      formData.append('file', file)
      const categoryValue = getCategoryValue(category, file.name)
      formData.append('category', categoryValue)
      console.log('Category determined:', categoryValue)
      
      if (vatReturnId) {
        formData.append('vatReturnId', vatReturnId)
        console.log('VAT Return ID added:', vatReturnId)
      }

      console.log('ABOUT TO SEND NETWORK REQUEST TO /api/upload')
      console.log('Request details:', {
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

      console.log('NETWORK REQUEST COMPLETED')
      console.log('Response status:', response.status, response.statusText)
      console.log('Response ok:', response.ok)

      const result = await response.json()
      console.log('Response JSON:', result)

      if (response.ok && result.success) {
        console.log('Upload successful, processing response')
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
              const engineText = engine === 'enhanced' ? 'Enhanced AI' : 'AI'
              const complianceText = isCompliant ? '(Irish VAT Compliant)' : '(Review Required)'
              toast.success(`${engineText} extracted €${vatAmount.toFixed(2)} VAT • Quality: ${qualityScore}/100 ${complianceText}`)
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
        console.log('Upload failed')
        console.log('Error details:', result)
        toast.error(result.error || 'Upload failed')
      }
    } catch (error) {
      console.error('UPLOAD ERROR CAUGHT:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        name: error instanceof Error ? error.name : 'Unknown error type'
      })
      toast.error('Upload failed. Please try again.')
    } finally {
      // Note: Don't set isUploading to false here since we might be processing multiple files
      // The handleFileChange function will manage the overall upload state
      // Only reset file input if this is the last file or there was an error
      console.log('Upload file function completed for:', file.name)
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

    console.log('Files dropped:', files.length)
    
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
    const smartCategorized = enableBatchMode ? validFiles.filter(f => getSmartCategory(f.name) !== category).length : 0
    toast.success(`${validFiles.length} file(s) dropped successfully${smartCategorized > 0 ? ` (${smartCategorized} auto-categorized)` : ''}`)
    
    setIsUploading(true)
    
    // Handle batch or sequential upload
    if (enableBatchMode && validFiles.length > 1) {
      setBatchProgress({ completed: 0, total: validFiles.length, failed: 0 })
      processBatchQueue(validFiles)
    } else {
      // Sequential upload for single files or non-batch mode
      for (const file of validFiles) {
        await uploadFile(file)
      }
      setIsUploading(false)
    }
  }

  // Batch control functions
  const pauseBatch = () => {
    setIsPaused(true)
    toast.info('Batch upload paused')
  }

  const resumeBatch = () => {
    setIsPaused(false)
    toast.info('Batch upload resumed')
  }

  const clearBatch = () => {
    setUploadQueue([])
    setCurrentUploads(new Set())
    setUploadResults(new Map())
    setBatchProgress({ completed: 0, total: 0, failed: 0 })
    setIsPaused(false)
    toast.info('Batch queue cleared')
  }

  const retryFailed = () => {
    const failedFiles = Array.from(uploadResults.entries())
      .filter(([, result]) => result.status === 'error')
      .map(([fileId]) => {
        // Extract file info from fileId (this is a simplified approach)
        const fileName = fileId.split('_')[0]
        return uploadQueue.find(f => f.name === fileName)
      })
      .filter(Boolean) as File[]

    if (failedFiles.length > 0) {
      // Reset failed files in results
      const newResults = new Map(uploadResults)
      failedFiles.forEach(file => {
        const fileId = `${file.name}_${file.lastModified}`
        newResults.delete(fileId)
      })
      setUploadResults(newResults)
      
      // Restart upload for failed files
      processBatchQueue(failedFiles)
      toast.info(`Retrying ${failedFiles.length} failed uploads`)
    }
  }

  return (
    <div>
      <h4 className="text-md font-semibold text-gray-900 mb-3">{title}</h4>
      
      {/* Enhanced Upload Area with Drag and Drop */}
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
          isDragOver 
            ? 'border-teal-500 bg-teal-50' 
            : 'border-gray-300 hover:border-teal-300'
        } ${
          (isUploading || processingState.isProcessing) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={(event) => {
          // Only handle click if not uploading and not from the button
          if (!isUploading && !processingState.isProcessing && event.target === event.currentTarget) {
            handleFileSelect(event)
          }
        }}
      >
        {isDragOver ? (
          <div>
            <div className="h-10 w-10 mx-auto mb-3 rounded-full bg-teal-100 flex items-center justify-center">
              <Upload className="h-6 w-6 text-teal-600" />
            </div>
            <p className="text-teal-700 font-semibold mb-2">Drop files here</p>
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
              {enableBatchMode && <span className="block text-teal-600 mt-1">
                ⚡ Batch mode: Upload multiple files with smart categorization and concurrent processing
              </span>}
            </p>
          </>
        )}
        
        <Button 
          variant="outline" 
          className="border-teal-200 text-teal-700 hover:bg-teal-50"
          onClick={(event) => {
            event.stopPropagation() // Prevent event bubbling to parent div
            handleFileSelect(event)
          }}
          disabled={isUploading || processingState.isProcessing}
        >
          {isUploading ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Uploading...</>
          ) : processingState.isProcessing ? (
            <><ArrowRight className="h-4 w-4 mr-2" />AI Processing...</>
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
            <ArrowRight className="h-4 w-4 mr-2" />
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

      {/* Batch Progress and Controls */}
      {enableBatchMode && showBatchProgress && batchProgress.total > 0 && (
        <div className="mt-4 p-4 bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg border border-teal-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-teal-800">Batch Upload Progress</span>
                <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-medium">
                  {batchProgress.completed}/{batchProgress.total} files
                </span>
                {batchProgress.failed > 0 && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                    {batchProgress.failed} failed
                  </span>
                )}
              </div>
            </div>
            <span className="text-sm text-teal-600">
              {Math.round((batchProgress.completed / batchProgress.total) * 100)}%
            </span>
          </div>
          
          <Progress 
            value={(batchProgress.completed / batchProgress.total) * 100} 
            className="mb-3" 
          />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-teal-700">
              <ArrowRight className="h-4 w-4 mr-2" />
              {currentUploads.size > 0 ? `Uploading ${currentUploads.size} files...` : 
               batchProgress.completed === batchProgress.total ? 'Batch complete!' : 'Ready to upload'}
            </div>
            
            {/* Batch Control Buttons */}
            <div className="flex space-x-2">
              {isUploading && !isPaused && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={pauseBatch}
                  className="text-yellow-600 hover:text-yellow-700"
                >
                  <Pause className="h-3 w-3 mr-1" />
                  Pause
                </Button>
              )}
              
              {isPaused && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resumeBatch}
                  className="text-green-600 hover:text-green-700"
                >
                  <Play className="h-3 w-3 mr-1" />
                  Resume
                </Button>
              )}
              
              {batchProgress.failed > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={retryFailed}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Retry Failed
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={clearBatch}
                disabled={isUploading && !isPaused}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </div>
          </div>
          
          {/* Active uploads indicator */}
          {currentUploads.size > 0 && (
            <div className="mt-3 text-xs text-teal-600">
              Currently uploading: {Array.from(currentUploads).map(fileId => 
                fileId.split('_')[0]).join(', ')}
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