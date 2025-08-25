"use client"

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, Camera, FileText, X, CheckCircle, AlertCircle, Loader2, ImageIcon, Scan } from 'lucide-react'
import { toast } from 'sonner'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface MobileUploadedDocument {
  id: string
  fileName: string
  fileSize: number
  category: string
  uploadedAt: string
  isProcessing: boolean
  processingProgress: number
  thumbnail?: string
}

interface MobileFileUploadProps {
  category: 'SALES' | 'PURCHASES'
  title: string
  description: string
  onUploadSuccess?: (document: MobileUploadedDocument) => void
  vatReturnId?: string
}

export default function MobileFileUpload({
  category,
  title,
  description,
  onUploadSuccess,
  vatReturnId
}: MobileFileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<MobileUploadedDocument[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isDragOver, setIsDragOver] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  // Check if device has camera capability
  const hasCamera = typeof navigator !== 'undefined' && 
    ('mediaDevices' in navigator) && 
    ('getUserMedia' in navigator.mediaDevices)

  // Handle file selection from device storage
  const handleFileSelect = () => {
    if (isUploading) return
    fileInputRef.current?.click()
  }

  // Handle camera capture
  const handleCameraCapture = () => {
    if (isUploading) return
    cameraInputRef.current?.click()
  }

  // Process selected files (from storage or camera)
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, source: 'file' | 'camera' = 'file') => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        await processFile(file, source)
        setUploadProgress(((i + 1) / files.length) * 100)
      }
      
      toast.success(`Successfully uploaded ${files.length} file${files.length > 1 ? 's' : ''}`)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      // Reset file inputs
      if (event.target) event.target.value = ''
    }
  }

  // Process individual file
  const processFile = async (file: File, source: 'file' | 'camera') => {
    const uploadId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // Create thumbnail for images
    const thumbnail = file.type.startsWith('image/') ? await createThumbnail(file) : undefined
    
    // Create document entry
    const document: MobileUploadedDocument = {
      id: uploadId,
      fileName: file.name,
      fileSize: file.size,
      category,
      uploadedAt: new Date().toISOString(),
      isProcessing: true,
      processingProgress: 0,
      thumbnail
    }

    setUploadedFiles(prev => [...prev, document])

    try {
      // Simulate file upload and processing
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', category)
      formData.append('source', source)
      if (vatReturnId) formData.append('vatReturnId', vatReturnId)

      // Simulate upload progress
      let progress = 0
      const progressInterval = setInterval(() => {
        progress += Math.random() * 15
        if (progress > 90) progress = 90
        
        setUploadedFiles(prev => prev.map(doc => 
          doc.id === uploadId 
            ? { ...doc, processingProgress: progress }
            : doc
        ))
      }, 200)

      // Make API call
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      const result = await response.json()

      // Update document as completed
      setUploadedFiles(prev => prev.map(doc => 
        doc.id === uploadId 
          ? { 
              ...doc, 
              isProcessing: false, 
              processingProgress: 100,
              id: result.document?.id || uploadId
            }
          : doc
      ))

      if (onUploadSuccess && result.document) {
        onUploadSuccess({
          ...document,
          id: result.document.id,
          isProcessing: false,
          processingProgress: 100
        })
      }

    } catch (error) {
      console.error('Processing error:', error)
      
      // Mark as failed
      setUploadedFiles(prev => prev.map(doc => 
        doc.id === uploadId 
          ? { ...doc, isProcessing: false, processingProgress: 0 }
          : doc
      ))
      
      throw error
    }
  }

  // Create thumbnail for image files
  const createThumbnail = useCallback((file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        resolve('')
        return
      }

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // Set canvas size (thumbnail)
        const maxSize = 100
        const ratio = Math.min(maxSize / img.width, maxSize / img.height)
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio

        // Draw and compress
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.7))
      }

      img.onerror = () => resolve('')
      img.src = URL.createObjectURL(file)
    })
  }, [])

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    if (isUploading) return

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      // Create a synthetic event for handleFileChange
      const syntheticEvent = {
        target: { files: e.dataTransfer.files, value: '' }
      } as React.ChangeEvent<HTMLInputElement>
      
      handleFileChange(syntheticEvent, 'file')
    }
  }, [isUploading])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  // Remove uploaded file
  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId))
  }

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  return (
    <div className="w-full space-y-4">
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50'}
          ${isUploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:border-blue-400 hover:bg-blue-50'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleFileSelect}
      >
        <div className="space-y-4">
          <div className="flex justify-center space-x-4">
            <Upload className="h-10 w-10 text-gray-400" />
            {hasCamera && (
              <Camera className="h-10 w-10 text-blue-500" />
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-600 mb-4">{description}</p>
            
            <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 sm:justify-center">
              <Button 
                onClick={(e) => {
                  e.stopPropagation()
                  handleFileSelect()
                }}
                disabled={isUploading}
                className="flex items-center"
              >
                <FileText className="mr-2 h-4 w-4" />
                Choose Files
              </Button>
              
              {hasCamera && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCameraCapture()
                  }}
                  disabled={isUploading}
                  variant="outline"
                  className="flex items-center"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Take Photo
                </Button>
              )}
            </div>
            
            <p className="text-xs text-gray-500 mt-3">
              PDF, JPG, PNG up to 10MB. Drag and drop or tap to select.
            </p>
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="absolute inset-0 bg-white/90 flex items-center justify-center rounded-lg">
            <div className="text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">Uploading files...</p>
                <Progress value={uploadProgress} className="w-48" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
        multiple
        onChange={(e) => handleFileChange(e, 'file')}
        className="hidden"
      />
      
      {hasCamera && (
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => handleFileChange(e, 'camera')}
          className="hidden"
        />
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">
            Uploaded Files ({uploadedFiles.length})
          </h4>
          
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <Card key={file.id} className="p-3">
                <div className="flex items-center space-x-3">
                  {file.thumbnail ? (
                    <img 
                      src={file.thumbnail} 
                      alt={file.fileName}
                      className="w-12 h-12 rounded object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                      <FileText className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.fileName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.fileSize)}
                    </p>
                    
                    {file.isProcessing ? (
                      <div className="mt-1">
                        <Progress value={file.processingProgress} className="h-1" />
                        <p className="text-xs text-blue-600 mt-1">Processing...</p>
                      </div>
                    ) : (
                      <div className="flex items-center mt-1">
                        <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                        <span className="text-xs text-green-600">Ready</span>
                      </div>
                    )}
                  </div>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFile(file.id)}
                    className="flex-shrink-0 h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}