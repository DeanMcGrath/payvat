"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { 
  Calculator, 
  Check, 
  X, 
  AlertTriangle, 
  TrendingUp, 
  Euro, 
  Edit3, 
  Save,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  BookOpen,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { toast } from "sonner"

interface VATCorrectionData {
  documentId: string
  originalSalesVAT: number[]
  originalPurchaseVAT: number[]
  correctedSalesVAT: number[]
  correctedPurchaseVAT: number[]
  confidence: number
  feedback: 'CORRECT' | 'INCORRECT' | 'PARTIALLY_CORRECT'
  notes?: string
}

interface VATCorrectionPanelProps {
  extractedVAT: {
    totalSalesVAT: number
    totalPurchaseVAT: number
    totalNetVAT: number
    averageConfidence: number
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
  } | null
  onCorrection: (correction: VATCorrectionData) => void
  onRecalculate: () => void
}

export default function VATCorrectionPanel({ extractedVAT, onCorrection, onRecalculate }: VATCorrectionPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [correctionMode, setCorrectionMode] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null)
  const [documentCorrections, setDocumentCorrections] = useState<Map<string, VATCorrectionData>>(new Map())
  
  // Current correction state for selected document
  const [currentCorrection, setCurrentCorrection] = useState<Partial<VATCorrectionData>>({
    correctedSalesVAT: [],
    correctedPurchaseVAT: [],
    feedback: 'CORRECT',
    notes: ''
  })

  // Recalculated totals after corrections
  const [recalculatedTotals, setRecalculatedTotals] = useState<{
    salesVAT: number
    purchaseVAT: number
    netVAT: number
  } | null>(null)

  // Initialize component when extractedVAT changes
  useEffect(() => {
    if (extractedVAT) {
      calculateTotalsWithCorrections()
    }
  }, [extractedVAT, documentCorrections, calculateTotalsWithCorrections])

  const calculateTotalsWithCorrections = useCallback(() => {
    if (!extractedVAT) return

    let totalSalesVAT = 0
    let totalPurchaseVAT = 0

    // Calculate sales VAT
    extractedVAT.salesDocuments.forEach(doc => {
      const correction = documentCorrections.get(doc.id)
      if (correction) {
        totalSalesVAT += correction.correctedSalesVAT.reduce((sum, amount) => sum + amount, 0)
      } else {
        totalSalesVAT += doc.extractedAmounts.reduce((sum, amount) => sum + amount, 0)
      }
    })

    // Calculate purchase VAT
    extractedVAT.purchaseDocuments.forEach(doc => {
      const correction = documentCorrections.get(doc.id)
      if (correction) {
        totalPurchaseVAT += correction.correctedPurchaseVAT.reduce((sum, amount) => sum + amount, 0)
      } else {
        totalPurchaseVAT += doc.extractedAmounts.reduce((sum, amount) => sum + amount, 0)
      }
    })

    setRecalculatedTotals({
      salesVAT: totalSalesVAT,
      purchaseVAT: totalPurchaseVAT,
      netVAT: totalSalesVAT - totalPurchaseVAT
    })
  }, [extractedVAT, documentCorrections])

  const selectDocumentForCorrection = (documentId: string, type: 'sales' | 'purchase') => {
    setSelectedDocument(documentId)
    setCorrectionMode(true)
    
    const documents = type === 'sales' ? extractedVAT?.salesDocuments : extractedVAT?.purchaseDocuments
    const document = documents?.find(doc => doc.id === documentId)
    
    if (document) {
      const existingCorrection = documentCorrections.get(documentId)
      
      if (existingCorrection) {
        setCurrentCorrection(existingCorrection)
      } else {
        setCurrentCorrection({
          documentId,
          originalSalesVAT: type === 'sales' ? document.extractedAmounts : [],
          originalPurchaseVAT: type === 'purchase' ? document.extractedAmounts : [],
          correctedSalesVAT: type === 'sales' ? [...document.extractedAmounts] : [],
          correctedPurchaseVAT: type === 'purchase' ? [...document.extractedAmounts] : [],
          confidence: document.confidence,
          feedback: 'CORRECT',
          notes: ''
        })
      }
    }
  }

  const saveCorrection = () => {
    if (!selectedDocument || !currentCorrection.documentId) return

    const correction: VATCorrectionData = {
      documentId: selectedDocument,
      originalSalesVAT: currentCorrection.originalSalesVAT || [],
      originalPurchaseVAT: currentCorrection.originalPurchaseVAT || [],
      correctedSalesVAT: currentCorrection.correctedSalesVAT || [],
      correctedPurchaseVAT: currentCorrection.correctedPurchaseVAT || [],
      confidence: currentCorrection.confidence || 0,
      feedback: currentCorrection.feedback || 'CORRECT',
      notes: currentCorrection.notes
    }

    // Update local corrections
    const newCorrections = new Map(documentCorrections)
    newCorrections.set(selectedDocument, correction)
    setDocumentCorrections(newCorrections)

    // Notify parent component
    onCorrection(correction)

    setCorrectionMode(false)
    setSelectedDocument(null)
    toast.success('Correction saved and AI training data submitted')
  }

  const confirmDocumentCorrect = (documentId: string, type: 'sales' | 'purchase') => {
    const documents = type === 'sales' ? extractedVAT?.salesDocuments : extractedVAT?.purchaseDocuments
    const document = documents?.find(doc => doc.id === documentId)
    
    if (document) {
      const correction: VATCorrectionData = {
        documentId,
        originalSalesVAT: type === 'sales' ? document.extractedAmounts : [],
        originalPurchaseVAT: type === 'purchase' ? document.extractedAmounts : [],
        correctedSalesVAT: type === 'sales' ? document.extractedAmounts : [],
        correctedPurchaseVAT: type === 'purchase' ? document.extractedAmounts : [],
        confidence: document.confidence,
        feedback: 'CORRECT',
        notes: 'User confirmed extraction is correct'
      }

      onCorrection(correction)
      toast.success('Confirmed! This helps improve AI accuracy.')
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500'
    if (confidence >= 0.6) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'High'
    if (confidence >= 0.6) return 'Medium'
    return 'Low'
  }

  const addVATAmount = (type: 'sales' | 'purchase') => {
    if (type === 'sales') {
      setCurrentCorrection({
        ...currentCorrection,
        correctedSalesVAT: [...(currentCorrection.correctedSalesVAT || []), 0]
      })
    } else {
      setCurrentCorrection({
        ...currentCorrection,
        correctedPurchaseVAT: [...(currentCorrection.correctedPurchaseVAT || []), 0]
      })
    }
  }

  const updateVATAmount = (type: 'sales' | 'purchase', index: number, value: number) => {
    if (type === 'sales') {
      const newAmounts = [...(currentCorrection.correctedSalesVAT || [])]
      newAmounts[index] = value
      setCurrentCorrection({
        ...currentCorrection,
        correctedSalesVAT: newAmounts
      })
    } else {
      const newAmounts = [...(currentCorrection.correctedPurchaseVAT || [])]
      newAmounts[index] = value
      setCurrentCorrection({
        ...currentCorrection,
        correctedPurchaseVAT: newAmounts
      })
    }
  }

  const removeVATAmount = (type: 'sales' | 'purchase', index: number) => {
    if (type === 'sales') {
      const newAmounts = (currentCorrection.correctedSalesVAT || []).filter((_, i) => i !== index)
      setCurrentCorrection({
        ...currentCorrection,
        correctedSalesVAT: newAmounts
      })
    } else {
      const newAmounts = (currentCorrection.correctedPurchaseVAT || []).filter((_, i) => i !== index)
      setCurrentCorrection({
        ...currentCorrection,
        correctedPurchaseVAT: newAmounts
      })
    }
  }

  if (!extractedVAT) return null

  const correctionCount = documentCorrections.size
  const totalDocuments = extractedVAT.salesDocuments.length + extractedVAT.purchaseDocuments.length
  const totals = recalculatedTotals || {
    salesVAT: extractedVAT.totalSalesVAT,
    purchaseVAT: extractedVAT.totalPurchaseVAT,
    netVAT: extractedVAT.totalNetVAT
  }

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            VAT Review & Correction
            {correctionCount > 0 && (
              <Badge className="bg-blue-600">
                {correctionCount} corrected
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-white rounded-lg border">
            <div className="text-sm text-gray-600">Sales VAT</div>
            <div className="text-lg font-semibold text-green-600">€{totals.salesVAT.toFixed(2)}</div>
            {recalculatedTotals && (
              <div className="text-xs text-blue-600">
                {recalculatedTotals.salesVAT !== extractedVAT.totalSalesVAT ? 'Corrected' : 'Original'}
              </div>
            )}
          </div>
          <div className="text-center p-3 bg-white rounded-lg border">
            <div className="text-sm text-gray-600">Purchase VAT</div>
            <div className="text-lg font-semibold text-orange-600">€{totals.purchaseVAT.toFixed(2)}</div>
            {recalculatedTotals && (
              <div className="text-xs text-blue-600">
                {recalculatedTotals.purchaseVAT !== extractedVAT.totalPurchaseVAT ? 'Corrected' : 'Original'}
              </div>
            )}
          </div>
          <div className="text-center p-3 bg-white rounded-lg border">
            <div className="text-sm text-gray-600">Net VAT</div>
            <div className="text-lg font-semibold text-blue-600">€{totals.netVAT.toFixed(2)}</div>
            {recalculatedTotals && (
              <div className="text-xs text-blue-600">
                {recalculatedTotals.netVAT !== extractedVAT.totalNetVAT ? 'Corrected' : 'Original'}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={onRecalculate} variant="outline" className="flex-1">
            <RefreshCw className="h-4 w-4 mr-2" />
            Recalculate
          </Button>
          <Button 
            onClick={() => setIsExpanded(!isExpanded)} 
            variant={isExpanded ? "default" : "outline"}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            {isExpanded ? 'Hide Details' : 'Review Documents'}
          </Button>
        </div>

        {/* Detailed Document Review */}
        {isExpanded && (
          <div className="space-y-4 border-t pt-4">
            {/* Sales Documents */}
            {extractedVAT.salesDocuments.length > 0 && (
              <div>
                <h4 className="font-medium text-green-800 mb-2">Sales Documents ({extractedVAT.salesDocuments.length})</h4>
                <div className="space-y-2">
                  {extractedVAT.salesDocuments.map((doc) => {
                    const correction = documentCorrections.get(doc.id)
                    const hasCorrection = !!correction
                    const isBeingCorrected = selectedDocument === doc.id && correctionMode
                    
                    return (
                      <div key={doc.id} className="bg-white p-3 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">{doc.fileName}</span>
                            {hasCorrection && <Badge variant="outline" className="text-xs">Corrected</Badge>}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getConfidenceColor(doc.confidence)}`} />
                            <span className="text-xs text-gray-600">{Math.round(doc.confidence * 100)}%</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            VAT: €{(hasCorrection ? 
                              correction.correctedSalesVAT.reduce((sum, amount) => sum + amount, 0) :
                              doc.extractedAmounts.reduce((sum, amount) => sum + amount, 0)
                            ).toFixed(2)}
                            {hasCorrection && (
                              <span className="text-blue-600 ml-1">(corrected)</span>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => confirmDocumentCorrect(doc.id, 'sales')}
                              className="text-green-600 hover:text-green-700"
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => selectDocumentForCorrection(doc.id, 'sales')}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Purchase Documents */}
            {extractedVAT.purchaseDocuments.length > 0 && (
              <div>
                <h4 className="font-medium text-orange-800 mb-2">Purchase Documents ({extractedVAT.purchaseDocuments.length})</h4>
                <div className="space-y-2">
                  {extractedVAT.purchaseDocuments.map((doc) => {
                    const correction = documentCorrections.get(doc.id)
                    const hasCorrection = !!correction
                    
                    return (
                      <div key={doc.id} className="bg-white p-3 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">{doc.fileName}</span>
                            {hasCorrection && <Badge variant="outline" className="text-xs">Corrected</Badge>}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getConfidenceColor(doc.confidence)}`} />
                            <span className="text-xs text-gray-600">{Math.round(doc.confidence * 100)}%</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            VAT: €{(hasCorrection ? 
                              correction.correctedPurchaseVAT.reduce((sum, amount) => sum + amount, 0) :
                              doc.extractedAmounts.reduce((sum, amount) => sum + amount, 0)
                            ).toFixed(2)}
                            {hasCorrection && (
                              <span className="text-blue-600 ml-1">(corrected)</span>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => confirmDocumentCorrect(doc.id, 'purchase')}
                              className="text-green-600 hover:text-green-700"
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => selectDocumentForCorrection(doc.id, 'purchase')}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Correction Modal */}
        {correctionMode && selectedDocument && (
          <div className="border-t pt-4 bg-blue-50 -mx-6 -mb-6 px-6 pb-6 rounded-b-lg">
            <h4 className="font-medium mb-3">Correct VAT Amounts</h4>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Feedback Type</Label>
                <Select 
                  value={currentCorrection.feedback} 
                  onValueChange={(value: any) => setCurrentCorrection({...currentCorrection, feedback: value})}
                >
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

              {/* Sales VAT Correction */}
              {(currentCorrection.correctedSalesVAT?.length || 0) > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium">Sales VAT Amounts</Label>
                    <Button variant="outline" size="sm" onClick={() => addVATAmount('sales')}>
                      Add
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {currentCorrection.correctedSalesVAT?.map((amount, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Euro className="h-4 w-4 text-gray-400" />
                        <Input
                          type="number"
                          step="0.01"
                          value={amount}
                          onChange={(e) => updateVATAmount('sales', index, parseFloat(e.target.value) || 0)}
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeVATAmount('sales', index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Purchase VAT Correction */}
              {(currentCorrection.correctedPurchaseVAT?.length || 0) > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium">Purchase VAT Amounts</Label>
                    <Button variant="outline" size="sm" onClick={() => addVATAmount('purchase')}>
                      Add
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {currentCorrection.correctedPurchaseVAT?.map((amount, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Euro className="h-4 w-4 text-gray-400" />
                        <Input
                          type="number"
                          step="0.01"
                          value={amount}
                          onChange={(e) => updateVATAmount('purchase', index, parseFloat(e.target.value) || 0)}
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeVATAmount('purchase', index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium">Notes (Optional)</Label>
                <Textarea
                  placeholder="Explain the correction..."
                  value={currentCorrection.notes || ''}
                  onChange={(e) => setCurrentCorrection({...currentCorrection, notes: e.target.value})}
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={saveCorrection} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save Correction
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setCorrectionMode(false)
                    setSelectedDocument(null)
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}