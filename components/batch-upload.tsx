"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Upload, 
  FileText, 
  Image, 
  File, 
  X, 
  Check, 
  AlertCircle, 
  Loader2,
  FolderUp,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'
import { toast } from "sonner"

interface BatchFile {
  id: string
  file: File
  category: 'SALES' | 'PURCHASES'
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error'
  progress: number
  error?: string
  documentId?: string
}

interface BatchUploadProps {
  onUploadComplete: (documents: any[]) => void
  onUploadProgress?: (files: BatchFile[]) => void
}

export default function BatchUpload({ onUploadComplete, onUploadProgress }: BatchUploadProps) {
  const [files, setFiles] = useState<BatchFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [defaultCategory, setDefaultCategory] = useState<'SALES' | 'PURCHASES'>('SALES')
  const [autoStart, setAutoStart] = useState(true)
  const [maxConcurrent, setMaxConcurrent] = useState(3)

  const startBatchUpload = useCallback(async (filesToUpload = files) => {
    if (isUploading) return

    setIsUploading(true)
    const pendingFiles = filesToUpload.filter(f => f.status === 'pending')
    
    if (pendingFiles.length === 0) {
      setIsUploading(false)
      return
    }

    toast.info(`Starting upload of ${pendingFiles.length} files...`)

    // Process files in chunks to limit concurrent uploads
    const chunks = []
    for (let i = 0; i < pendingFiles.length; i += maxConcurrent) {
      chunks.push(pendingFiles.slice(i, i + maxConcurrent))
    }

    try {
      for (const chunk of chunks) {
        await Promise.all(chunk.map(file => uploadSingleFile(file)))
      }

      const completedFiles = files.filter(f => f.status === 'completed')
      const errorFiles = files.filter(f => f.status === 'error')

      if (completedFiles.length > 0) {
        toast.success(`Successfully uploaded ${completedFiles.length} files`)
        
        // Notify parent component
        const documents = completedFiles
          .filter(f => f.documentId)
          .map(f => ({ id: f.documentId, fileName: f.file.name, category: f.category }))
        
        onUploadComplete(documents)
      }

      if (errorFiles.length > 0) {
        toast.error(`${errorFiles.length} files failed to upload`)
      }

    } catch (error) {
      console.error('Batch upload error:', error)
      toast.error('Batch upload failed')
    } finally {
      setIsUploading(false)
    }
  }, [files, isUploading, maxConcurrent, onUploadComplete])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: BatchFile[] = acceptedFiles.map(file => ({
      id: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      file,
      category: defaultCategory,
      status: 'pending',
      progress: 0
    }))

    setFiles(prev => [...prev, ...newFiles])
    
    if (autoStart && !isUploading) {
      setTimeout(() => startBatchUpload([...files, ...newFiles]), 100)
    }

    toast.success(`Added ${acceptedFiles.length} files to batch upload queue`)
  }, [defaultCategory, autoStart, files, isUploading, startBatchUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv']
    },
    multiple: true,
    maxSize: 10 * 1024 * 1024 // 10MB
  })

  const updateFileCategory = (fileId: string, category: 'SALES' | 'PURCHASES') => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, category } : f
    ))
  }

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const updateFileStatus = (fileId: string, status: BatchFile['status'], progress = 0, error?: string, documentId?: string) => {
    setFiles(prev => {
      const updated = prev.map(f => 
        f.id === fileId ? { ...f, status, progress, error, documentId } : f
      )
      onUploadProgress?.(updated)
      return updated
    })
  }

  const uploadSingleFile = async (batchFile: BatchFile): Promise<void> => {
    updateFileStatus(batchFile.id, 'uploading', 10)

    try {
      const formData = new FormData()
      formData.append('file', batchFile.file)
      formData.append('category', batchFile.category)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      updateFileStatus(batchFile.id, 'uploading', 60)

      const result = await response.json()
      
      if (result.success) {
        updateFileStatus(batchFile.id, 'processing', 80)
        
        // Wait for AI processing to complete
        await waitForProcessing(result.document.id, batchFile.id)
        
        updateFileStatus(batchFile.id, 'completed', 100, undefined, result.document.id)
      } else {
        throw new Error(result.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      updateFileStatus(batchFile.id, 'error', 0, error instanceof Error ? error.message : 'Upload failed')
    }
  }

  const waitForProcessing = async (documentId: string, batchFileId: string): Promise<void> => {
    const maxAttempts = 30 // 30 seconds max wait
    let attempts = 0

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`/api/documents/${documentId}`, {
          credentials: 'include'
        })

        if (response.ok) {
          const result = await response.json()
          if (result.success && result.document.isScanned) {
            return // Processing complete
          }
        }

        // Update progress during processing
        const processingProgress = 80 + (attempts / maxAttempts) * 15
        updateFileStatus(batchFileId, 'processing', processingProgress)

        await new Promise(resolve => setTimeout(resolve, 1000))
        attempts++
      } catch (error) {
        console.error('Error checking processing status:', error)
        attempts++
      }
    }

    // If we get here, processing took too long but don't fail
    console.warn(`Processing timeout for document ${documentId}`)
  }


  const pauseUpload = () => {
    setIsUploading(false)
    toast.info('Upload paused')
  }

  const retryErrors = () => {
    const errorFiles = files.filter(f => f.status === 'error')
    errorFiles.forEach(f => updateFileStatus(f.id, 'pending', 0))
    
    if (errorFiles.length > 0) {
      startBatchUpload()
    }
  }

  const clearCompleted = () => {
    setFiles(prev => prev.filter(f => f.status !== 'completed'))
  }

  const clearAll = () => {
    if (isUploading) {
      toast.error('Cannot clear files while uploading')
      return
    }
    setFiles([])
  }

  const getFileIcon = (file: File) => {
    if (file.type.includes('pdf')) return <FileText className="h-6 w-6 text-red-500" />
    if (file.type.includes('image')) return <Image className="h-6 w-6 text-blue-500" />
    return <File className="h-6 w-6 text-gray-500" />
  }

  const getStatusColor = (status: BatchFile['status']) => {
    switch (status) {
      case 'pending': return 'bg-gray-500'
      case 'uploading': return 'bg-blue-500'
      case 'processing': return 'bg-yellow-500'
      case 'completed': return 'bg-green-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: BatchFile['status']) => {
    switch (status) {
      case 'pending': return 'Pending'
      case 'uploading': return 'Uploading'
      case 'processing': return 'AI Processing'
      case 'completed': return 'Complete'
      case 'error': return 'Error'
      default: return 'Unknown'
    }
  }

  const totalFiles = files.length
  const completedFiles = files.filter(f => f.status === 'completed').length
  const errorFiles = files.filter(f => f.status === 'error').length
  const pendingFiles = files.filter(f => f.status === 'pending').length
  const overallProgress = totalFiles > 0 ? (completedFiles / totalFiles) * 100 : 0

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderUp className="h-5 w-5" />
          Batch Document Upload
          {totalFiles > 0 && (
            <Badge variant="outline">
              {completedFiles}/{totalFiles} completed
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Default Category</label>
            <Select value={defaultCategory} onValueChange={(value: 'SALES' | 'PURCHASES') => setDefaultCategory(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SALES">Sales Documents</SelectItem>
                <SelectItem value="PURCHASES">Purchase Documents</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Max Concurrent</label>
            <Select value={maxConcurrent.toString()} onValueChange={(value) => setMaxConcurrent(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 file at a time</SelectItem>
                <SelectItem value="2">2 files at a time</SelectItem>
                <SelectItem value="3">3 files at a time</SelectItem>
                <SelectItem value="5">5 files at a time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2 pt-6">
            <Checkbox 
              id="auto-start"
              checked={autoStart}
              onCheckedChange={(checked) => setAutoStart(checked as boolean)}
            />
            <label htmlFor="auto-start" className="text-sm font-medium">Auto-start upload</label>
          </div>
        </div>

        {/* Drop Zone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          {isDragActive ? (
            <p className="text-lg text-blue-600">Drop files here...</p>
          ) : (
            <div>
              <p className="text-lg text-gray-600 mb-2">Drag & drop files here, or click to select</p>
              <p className="text-sm text-gray-500">Supports PDF, Images, Excel, CSV (max 10MB per file)</p>
            </div>
          )}
        </div>

        {/* Overall Progress */}
        {totalFiles > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{Math.round(overallProgress)}% ({completedFiles}/{totalFiles})</span>
            </div>
            <Progress value={overallProgress} className="w-full" />
          </div>
        )}

        {/* Controls */}
        {totalFiles > 0 && (
          <div className="flex flex-wrap gap-2">
            {!isUploading && pendingFiles > 0 && (
              <Button onClick={() => startBatchUpload()} className="flex items-center gap-2">
                <Play className="h-4 w-4" />
                Start Upload ({pendingFiles} files)
              </Button>
            )}

            {isUploading && (
              <Button onClick={pauseUpload} variant="outline" className="flex items-center gap-2">
                <Pause className="h-4 w-4" />
                Pause Upload
              </Button>
            )}

            {errorFiles > 0 && (
              <Button onClick={retryErrors} variant="outline" className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Retry Errors ({errorFiles})
              </Button>
            )}

            {completedFiles > 0 && (
              <Button onClick={clearCompleted} variant="outline" className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                Clear Completed
              </Button>
            )}

            <Button onClick={clearAll} variant="outline" disabled={isUploading} className="flex items-center gap-2">
              <X className="h-4 w-4" />
              Clear All
            </Button>
          </div>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {files.map((batchFile) => (
              <div key={batchFile.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getFileIcon(batchFile.file)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium truncate">{batchFile.file.name}</p>
                      <Badge className={`text-xs ${getStatusColor(batchFile.status)} text-white`}>
                        {getStatusText(batchFile.status)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{Math.round(batchFile.file.size / 1024)}KB</span>
                      
                      <Select
                        value={batchFile.category}
                        onValueChange={(value: 'SALES' | 'PURCHASES') => updateFileCategory(batchFile.id, value)}
                        disabled={batchFile.status !== 'pending'}
                      >
                        <SelectTrigger className="w-32 h-6 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SALES">Sales</SelectItem>
                          <SelectItem value="PURCHASES">Purchases</SelectItem>
                        </SelectContent>
                      </Select>

                      {batchFile.status === 'uploading' || batchFile.status === 'processing' ? (
                        <div className="flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span>{batchFile.progress}%</span>
                        </div>
                      ) : null}

                      {batchFile.error && (
                        <span className="text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {batchFile.error}
                        </span>
                      )}
                    </div>

                    {(batchFile.status === 'uploading' || batchFile.status === 'processing') && (
                      <Progress value={batchFile.progress} className="w-full h-1 mt-1" />
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(batchFile.id)}
                  disabled={batchFile.status === 'uploading' || batchFile.status === 'processing'}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}