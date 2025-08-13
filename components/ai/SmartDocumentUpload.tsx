"use client"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Sparkles,
  Brain,
  TrendingUp,
  Lightbulb
} from 'lucide-react'
import { toast } from 'sonner'
import DocumentFeedback from './DocumentFeedback'

interface SmartDocumentUploadProps {
  category: 'SALES' | 'PURCHASES'
  title: string
  description: string
  acceptedFiles: string[]
  onUploadSuccess?: (document: any) => void
  vatReturnId?: string
  userId?: string
}

interface ProcessedDocument {
  id: string
  fileName: string
  fileSize: number
  category: string
  uploadedAt: string
  isScanned: boolean
  scanResult?: string
  
  // Enhanced AI data
  aiProcessed: boolean
  processingStrategy?: 'TEMPLATE_MATCH' | 'AI_VISION' | 'HYBRID' | 'FALLBACK'
  templateUsed?: string
  confidenceScore?: number
  matchedFeatures?: string[]
  suggestedImprovements?: string[]
  extractedData?: any
  learningApplied?: boolean
}

export default function SmartDocumentUpload({
  category,
  title,
  description,
  acceptedFiles,
  onUploadSuccess,
  vatReturnId,
  userId
}: SmartDocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<ProcessedDocument[]>([])
  const [selectedFileForFeedback, setSelectedFileForFeedback] = useState<ProcessedDocument | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = () => {
    console.log('🔥 Smart file upload triggered')
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const allowedExtensions = ['pdf', 'csv', 'xlsx', 'xls', 'jpg', 'jpeg', 'png']
    const validFiles: File[] = []
    
    // Validate files
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File "${file.name}" is too large. Must be less than 10MB`)
        continue
      }

      const extension = file.name.split('.').pop()?.toLowerCase()
      if (!extension || !allowedExtensions.includes(extension)) {
        toast.error(`File "${file.name}" has invalid type. Please upload PDF, Excel, CSV, or image files.`)
        continue
      }
      
      validFiles.push(file)
    }
    
    if (validFiles.length === 0) return
    
    if (validFiles.length > 1) {
      toast.success(`🧠 Starting AI processing of ${validFiles.length} files...`)
    }

    // Process files with enhanced AI
    for (const file of validFiles) {
      await uploadFileWithEnhancedAI(file)
    }
  }

  const uploadFileWithEnhancedAI = async (file: File) => {
    console.log('🧠 Enhanced AI upload started:', file.name)
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', getCategoryValue(category, file.name))
      formData.append('enhancedAI', 'true') // Enable enhanced processing
      
      if (vatReturnId) formData.append('vatReturnId', vatReturnId)
      if (userId) formData.append('userId', userId)

      console.log('🚀 Sending to enhanced processing endpoint')
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (response.ok && result.success) {
        console.log('✅ Enhanced upload successful:', result)
        
        const enhancedDocument: ProcessedDocument = {
          ...result.document,
          aiProcessed: result.aiProcessed || false,
          processingStrategy: result.processingStrategy,
          templateUsed: result.templateUsed,
          confidenceScore: result.confidenceScore,
          matchedFeatures: result.matchedFeatures || [],
          suggestedImprovements: result.suggestedImprovements || [],
          extractedData: result.extractedData,
          learningApplied: result.learningApplied || false
        }

        setUploadedFiles(prev => [...prev, enhancedDocument])
        
        // Show enhanced success message
        if (result.templateUsed) {
          toast.success(`🎯 Document processed using learned template! ${result.confidenceScore ? `(${Math.round(result.confidenceScore * 100)}% confidence)` : ''}`)
        } else if (result.aiProcessed) {
          toast.success(`🤖 AI processed document successfully`)
        } else {
          toast.success('File uploaded successfully')
        }

        // Auto-process with AI if not already done
        if (!result.aiProcessed) {
          await triggerAIProcessing(enhancedDocument.id)
        }
        
        onUploadSuccess?.(enhancedDocument)
        
      } else {
        toast.error(result.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Enhanced upload error:', error)
      toast.error('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const triggerAIProcessing = async (documentId: string) => {
    try {
      console.log('🔄 Triggering enhanced AI processing for:', documentId)
      
      const response = await fetch('/api/documents/process-enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId,
          useEnhancedLearning: true
        })
      })
      
      const result = await response.json()
      
      if (response.ok && result.success) {
        console.log('✅ Enhanced AI processing completed')
        
        // Update document with AI results
        setUploadedFiles(prev => prev.map(doc => 
          doc.id === documentId ? {
            ...doc,
            isScanned: true,
            scanResult: result.scanResult,
            aiProcessed: true,
            processingStrategy: result.processingStrategy,
            confidenceScore: result.confidenceScore,
            matchedFeatures: result.matchedFeatures || [],
            suggestedImprovements: result.suggestedImprovements || [],
            extractedData: result.extractedData,
            learningApplied: result.learningApplied
          } : doc
        ))
        
        // Show processing results
        if (result.templateUsed) {
          toast.success(`🎯 Applied learned template: ${result.templateUsed}`)
        }
        
        if (result.extractedData?.vatData?.totalVatAmount) {
          const vatAmount = result.extractedData.vatData.totalVatAmount
          toast.success(`💰 AI extracted €${vatAmount.toFixed(2)} VAT`)
        }
      }
    } catch (error) {
      console.error('Enhanced AI processing error:', error)
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
      }
    } catch (error) {
      toast.error('Failed to remove file')
    }
  }

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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getProcessingStrategyBadge = (strategy?: string) => {
    if (!strategy) return null
    
    const config = {
      'TEMPLATE_MATCH': { color: 'bg-green-100 text-green-800', icon: '🎯', label: 'Template Match' },
      'HYBRID': { color: 'bg-blue-100 text-blue-800', icon: '🔄', label: 'Hybrid AI' },
      'AI_VISION': { color: 'bg-teal-100 text-teal-800', icon: '🤖', label: 'AI Vision' },
      'FALLBACK': { color: 'bg-yellow-100 text-yellow-800', icon: '⚡', label: 'Fallback' }
    }
    
    const strategyConfig = config[strategy as keyof typeof config]
    if (!strategyConfig) return null
    
    return (
      <Badge className={`text-xs ${strategyConfig.color}`}>
        {strategyConfig.icon} {strategyConfig.label}
      </Badge>
    )
  }

  return (
    <div>
      <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
        <Brain className="h-5 w-5 mr-2 text-teal-600" />
        {title}
      </h4>
      
      {/* Enhanced Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-teal-300 transition-colors bg-gradient-to-br from-teal-50 to-blue-50">
        <div className="flex justify-center mb-3">
          <div className="relative">
            <Upload className="h-10 w-10 text-teal-600" />
            <Sparkles className="h-4 w-4 text-yellow-500 absolute -top-1 -right-1" />
          </div>
        </div>
        <p className="text-gray-700 mb-2 font-medium">{description}</p>
        <p className="text-sm text-gray-600 mb-1">✨ Enhanced with AI learning</p>
        <p className="text-xs text-gray-500 mb-4">Templates, pattern recognition, and continuous improvement</p>
        
        <Button 
          variant="outline" 
          className="border-teal-300 text-teal-700 hover:bg-teal-50 font-medium"
          onClick={handleFileSelect}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-teal-600 border-t-transparent mr-2" />
              🧠 AI Processing...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 mr-2" />
              Smart Upload {category === 'SALES' ? 'Sales' : 'Purchase'} Files
            </>
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
      
      {/* Enhanced File List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-3">
          {uploadedFiles.map((file) => (
            <div key={file.id}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="relative">
                          <FileText className="h-8 w-8 text-gray-500" />
                          {file.learningApplied && (
                            <Brain className="h-3 w-3 text-teal-600 absolute -top-1 -right-1" />
                          )}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.fileName}
                        </p>
                        
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.fileSize)}
                          </p>
                          
                          {/* Processing Strategy Badge */}
                          {getProcessingStrategyBadge(file.processingStrategy)}
                          
                          {/* Confidence Score */}
                          {file.confidenceScore && (
                            <Badge variant="outline" className="text-xs">
                              {Math.round(file.confidenceScore * 100)}% confidence
                            </Badge>
                          )}
                        </div>
                        
                        {/* Status and Features */}
                        <div className="flex items-center space-x-2 mt-2">
                          {file.isScanned ? (
                            <div className="flex items-center text-green-600 text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              AI Processed
                            </div>
                          ) : (
                            <div className="flex items-center text-yellow-600 text-xs">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Processing...
                            </div>
                          )}
                          
                          {/* Matched Features */}
                          {file.matchedFeatures && file.matchedFeatures.length > 0 && (
                            <div className="flex items-center text-teal-600 text-xs">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              {file.matchedFeatures.length} patterns matched
                            </div>
                          )}
                          
                          {/* Suggested Improvements */}
                          {file.suggestedImprovements && file.suggestedImprovements.length > 0 && (
                            <div className="flex items-center text-teal-600 text-xs">
                              <Lightbulb className="h-3 w-3 mr-1" />
                              {file.suggestedImprovements.length} suggestions
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {/* Feedback Button */}
                      {file.isScanned && file.extractedData && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedFileForFeedback(file)}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <Sparkles className="h-3 w-3 mr-1" />
                          Feedback
                        </Button>
                      )}
                      
                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
      
      {/* Feedback Modal */}
      {selectedFileForFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Provide Feedback</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFileForFeedback(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <DocumentFeedback
                documentId={selectedFileForFeedback.id}
                originalExtraction={selectedFileForFeedback.extractedData}
                onFeedbackSubmitted={() => {
                  setSelectedFileForFeedback(null)
                  toast.success('Thank you! Your feedback helps improve our AI.')
                }}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Enhanced Guidelines */}
      <div className="mt-3 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center mb-2">
          <Sparkles className="h-3 w-3 mr-1 text-yellow-500" />
          <span className="font-medium">AI-Enhanced Processing</span>
        </div>
        <ul className="space-y-1">
          {category === 'SALES' ? (
            <>
              <li>• Sales invoices and receipts</li>
              <li>• Customer payment records</li>
              <li>• Sales reports and summaries</li>
            </>
          ) : (
            <>
              <li>• Purchase invoices and receipts</li>
              <li>• Supplier payment records</li>
              <li>• Expense reports and summaries</li>
            </>
          )}
          <li className="text-teal-600 font-medium">• AI learns from your feedback to improve accuracy</li>
          <li className="text-teal-600 font-medium">• Templates auto-created for similar documents</li>
        </ul>
      </div>
    </div>
  )
}