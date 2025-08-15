"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { 
  FileText, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Eye, 
  Edit3, 
  Check, 
  X, 
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  BookOpen,
  Euro,
  Calculator,
  Save,
  RefreshCw
} from 'lucide-react'
import { toast } from "sonner"

interface DocumentData {
  id: string
  originalName: string
  fileName: string
  mimeType: string
  fileSize: number
  category: string
  isScanned: boolean
  scanResult?: string
  uploadedAt: string
  extractedAmounts?: number[]
  confidence?: number
}

interface VATExtraction {
  salesVAT: number[]
  purchaseVAT: number[]
  confidence: number
  totalSalesVAT: number
  totalPurchaseVAT: number
}

interface DocumentViewerProps {
  isOpen: boolean
  onClose: () => void
  document: DocumentData | null
  extractedVAT?: VATExtraction | null
  onVATCorrection?: (correctedData: {
    salesVAT: number[]
    purchaseVAT: number[]
    feedback: 'CORRECT' | 'INCORRECT' | 'PARTIALLY_CORRECT'
    notes?: string
  }) => void
}

export default function DocumentViewer({ isOpen, onClose, document, extractedVAT, onVATCorrection }: DocumentViewerProps) {
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [viewMode, setViewMode] = useState<'view' | 'correct'>('view')
  const [documentUrl, setDocumentUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  // Correction state
  const [correctedSalesVAT, setCorrectedSalesVAT] = useState<string[]>([])
  const [correctedPurchaseVAT, setCorrectedPurchaseVAT] = useState<string[]>([])
  const [correctionNotes, setCorrectionNotes] = useState("")
  const [feedback, setFeedback] = useState<'CORRECT' | 'INCORRECT' | 'PARTIALLY_CORRECT'>('CORRECT')

  // Initialize correction state when document or extractedVAT changes
  useEffect(() => {
    if (extractedVAT) {
      setCorrectedSalesVAT(extractedVAT.salesVAT.map(v => v.toString()))
      setCorrectedPurchaseVAT(extractedVAT.purchaseVAT.map(v => v.toString()))
    } else {
      setCorrectedSalesVAT([''])
      setCorrectedPurchaseVAT([''])
    }
    setCorrectionNotes("")
    setFeedback('CORRECT')
    setViewMode('view')
  }, [document, extractedVAT])

  // Load document for viewing
  useEffect(() => {
    if (document && isOpen) {
      loadDocument()
    }
  }, [document, isOpen, loadDocument])

  const loadDocument = useCallback(async () => {
    if (!document) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/documents/${document.id}?action=download`, {
        method: 'GET',
        credentials: 'include'
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        setDocumentUrl(url)
      } else {
        toast.error('Failed to load document')
      }
    } catch (error) {
      console.error('Error loading document:', error)
      toast.error('Error loading document')
    } finally {
      setLoading(false)
    }
  }, [document])

  const handleDownload = async () => {
    if (!document) return
    
    try {
      const response = await fetch(`/api/documents/${document.id}?action=download`, {
        method: 'GET',
        credentials: 'include'
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = document.originalName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success('Document downloaded')
      } else {
        toast.error('Failed to download document')
      }
    } catch (error) {
      console.error('Error downloading document:', error)
      toast.error('Error downloading document')
    }
  }

  const addVATLine = (type: 'sales' | 'purchase') => {
    if (type === 'sales') {
      setCorrectedSalesVAT([...correctedSalesVAT, ''])
    } else {
      setCorrectedPurchaseVAT([...correctedPurchaseVAT, ''])
    }
  }

  const removeVATLine = (type: 'sales' | 'purchase', index: number) => {
    if (type === 'sales') {
      const newLines = correctedSalesVAT.filter((_, i) => i !== index)
      setCorrectedSalesVAT(newLines.length > 0 ? newLines : [''])
    } else {
      const newLines = correctedPurchaseVAT.filter((_, i) => i !== index)
      setCorrectedPurchaseVAT(newLines.length > 0 ? newLines : [''])
    }
  }

  const updateVATLine = (type: 'sales' | 'purchase', index: number, value: string) => {
    if (type === 'sales') {
      const newLines = [...correctedSalesVAT]
      newLines[index] = value
      setCorrectedSalesVAT(newLines)
    } else {
      const newLines = [...correctedPurchaseVAT]
      newLines[index] = value
      setCorrectedPurchaseVAT(newLines)
    }
  }

  const calculateTotals = () => {
    const salesTotal = correctedSalesVAT
      .filter(v => v.trim() !== '')
      .reduce((sum, v) => sum + (parseFloat(v) || 0), 0)
    
    const purchaseTotal = correctedPurchaseVAT
      .filter(v => v.trim() !== '')
      .reduce((sum, v) => sum + (parseFloat(v) || 0), 0)
    
    return { salesTotal, purchaseTotal }
  }

  const handleSaveCorrection = () => {
    if (!onVATCorrection) return

    const salesAmounts = correctedSalesVAT
      .filter(v => v.trim() !== '')
      .map(v => parseFloat(v))
      .filter(v => !isNaN(v))

    const purchaseAmounts = correctedPurchaseVAT
      .filter(v => v.trim() !== '')
      .map(v => parseFloat(v))
      .filter(v => !isNaN(v))

    onVATCorrection({
      salesVAT: salesAmounts,
      purchaseVAT: purchaseAmounts,
      feedback,
      notes: correctionNotes.trim() || undefined
    })

    toast.success('VAT correction saved and AI training data submitted')
    setViewMode('view')
  }

  const handleConfirmCorrect = () => {
    if (!onVATCorrection || !extractedVAT) return

    onVATCorrection({
      salesVAT: extractedVAT.salesVAT,
      purchaseVAT: extractedVAT.purchaseVAT,
      feedback: 'CORRECT',
      notes: 'User confirmed extraction is correct'
    })

    toast.success('Confirmed! This helps improve AI accuracy.')
  }

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'bg-gray-500'
    if (confidence >= 0.8) return 'bg-green-500'
    if (confidence >= 0.6) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getConfidenceText = (confidence?: number) => {
    if (!confidence) return 'Unknown'
    if (confidence >= 0.8) return 'High'
    if (confidence >= 0.6) return 'Medium'
    return 'Low'
  }

  const renderDocumentViewer = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-teal-600" />
            <p className="text-gray-600">Loading document...</p>
          </div>
        </div>
      )
    }

    if (!documentUrl) {
      return (
        <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
          <div className="text-center">
            <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-600">Document preview not available</p>
          </div>
        </div>
      )
    }

    const isPDF = document?.mimeType?.includes('pdf')
    const isImage = document?.mimeType?.includes('image')

    if (isPDF) {
      return (
        <div className="relative bg-gray-50 rounded-lg overflow-hidden" style={{ height: '500px' }}>
          <iframe
            src={documentUrl}
            className="w-full h-full"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transformOrigin: 'center center'
            }}
          />
        </div>
      )
    }

    if (isImage) {
      return (
        <div className="relative bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center" style={{ height: '500px' }}>
          <img
            src={documentUrl}
            alt={document?.originalName || 'Document preview'}
            className="max-w-full max-h-full object-contain"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transformOrigin: 'center center'
            }}
          />
        </div>
      )
    }

    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
          <p className="text-gray-600">Preview not available for this file type</p>
          <Button onClick={handleDownload} className="mt-2">
            <Download className="h-4 w-4 mr-2" />
            Download to View
          </Button>
        </div>
      </div>
    )
  }

  const { salesTotal, purchaseTotal } = calculateTotals()

  if (!isOpen || !document) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {document.originalName}
          </DialogTitle>
          <DialogDescription>
            Uploaded {new Date(document.uploadedAt).toLocaleDateString()} • {Math.round(document.fileSize / 1024)} KB
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Document Viewer */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Document Preview</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(50, zoom - 25))}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm min-w-12 text-center">{zoom}%</span>
                <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(200, zoom + 25))}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setRotation((rotation + 90) % 360)}>
                  <RotateCw className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {renderDocumentViewer()}
          </div>

          {/* VAT Data and Correction Panel */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">VAT Information</h3>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'view' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('view')}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button
                  variant={viewMode === 'correct' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('correct')}
                >
                  <Edit3 className="h-4 w-4 mr-1" />
                  Correct
                </Button>
              </div>
            </div>

            {/* Document Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Document Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Category:</span>
                  <Badge variant="outline">{document.category}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">AI Processed:</span>
                  <Badge variant={document.isScanned ? "default" : "secondary"}>
                    {document.isScanned ? 'Yes' : 'No'}
                  </Badge>
                </div>
                {extractedVAT && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Confidence:</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getConfidenceColor(extractedVAT.confidence)}`} />
                      <span className="text-sm">{getConfidenceText(extractedVAT.confidence)} ({Math.round((extractedVAT.confidence || 0) * 100)}%)</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* View Mode */}
            {viewMode === 'view' && extractedVAT && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Extracted VAT Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Sales VAT</Label>
                    {extractedVAT.salesVAT.length > 0 ? (
                      <div className="space-y-1">
                        {extractedVAT.salesVAT.map((amount, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Euro className="h-3 w-3 text-gray-400" />
                            <span className="text-sm">{amount.toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="border-t pt-2 mt-2">
                          <span className="text-sm font-medium">Total: €{extractedVAT.totalSalesVAT.toFixed(2)}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No sales VAT detected</p>
                    )}
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-sm font-medium">Purchase VAT</Label>
                    {extractedVAT.purchaseVAT.length > 0 ? (
                      <div className="space-y-1">
                        {extractedVAT.purchaseVAT.map((amount, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Euro className="h-3 w-3 text-gray-400" />
                            <span className="text-sm">{amount.toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="border-t pt-2 mt-2">
                          <span className="text-sm font-medium">Total: €{extractedVAT.totalPurchaseVAT.toFixed(2)}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No purchase VAT detected</p>
                    )}
                  </div>

                  <Separator />

                  <div className="flex gap-2">
                    <Button onClick={handleConfirmCorrect} className="flex-1 bg-green-600 hover:bg-green-700">
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Confirm Correct
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setViewMode('correct')}
                      className="flex-1"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Needs Correction
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Correction Mode */}
            {viewMode === 'correct' && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Edit3 className="h-4 w-4" />
                    Correct VAT Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Feedback Type</Label>
                    <Select value={feedback} onValueChange={(value: any) => setFeedback(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PARTIALLY_CORRECT">Partially Correct</SelectItem>
                        <SelectItem value="INCORRECT">Incorrect</SelectItem>
                        <SelectItem value="CORRECT">Actually Correct</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium">Sales VAT Amounts</Label>
                      <Button variant="outline" size="sm" onClick={() => addVATLine('sales')}>
                        Add Line
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {correctedSalesVAT.map((amount, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Euro className="h-4 w-4 text-gray-400" />
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => updateVATLine('sales', index, e.target.value)}
                            className="flex-1"
                          />
                          {correctedSalesVAT.length > 1 && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeVATLine('sales', index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <div className="text-sm text-gray-600">
                        Total: €{salesTotal.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium">Purchase VAT Amounts</Label>
                      <Button variant="outline" size="sm" onClick={() => addVATLine('purchase')}>
                        Add Line
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {correctedPurchaseVAT.map((amount, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Euro className="h-4 w-4 text-gray-400" />
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => updateVATLine('purchase', index, e.target.value)}
                            className="flex-1"
                          />
                          {correctedPurchaseVAT.length > 1 && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeVATLine('purchase', index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <div className="text-sm text-gray-600">
                        Total: €{purchaseTotal.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Notes (Optional)</Label>
                    <Textarea
                      placeholder="Explain the correction to help train the AI..."
                      value={correctionNotes}
                      onChange={(e) => setCorrectionNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSaveCorrection} className="flex-1">
                      <Save className="h-4 w-4 mr-2" />
                      Save & Train AI
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setViewMode('view')}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}