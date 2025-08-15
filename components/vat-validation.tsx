"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Info, 
  TrendingUp, 
  TrendingDown,
  Calculator,
  FileText,
  Calendar,
  DollarSign,
  Shield,
  Eye,
  RefreshCw
} from 'lucide-react'

interface ValidationIssue {
  id: string
  type: 'error' | 'warning' | 'info'
  category: 'amount' | 'period' | 'document' | 'rate' | 'sequence' | 'duplicate'
  title: string
  description: string
  suggestion?: string
  documentId?: string
  documentName?: string
  affectedAmount?: number
  autoFixable?: boolean
}

interface VATValidationData {
  totalSalesVAT: number
  totalPurchaseVAT: number
  totalNetVAT: number
  documentCount: number
  processedDocuments: number
  averageConfidence: number
  salesDocuments: Array<{
    id: string
    fileName: string
    category: string
    extractedAmounts: number[]
    confidence: number
    uploadedAt: string
  }>
  purchaseDocuments: Array<{
    id: string
    fileName: string
    category: string
    extractedAmounts: number[]
    confidence: number
    uploadedAt: string
  }>
}

interface VATValidationProps {
  extractedVAT: VATValidationData | null
  period: {
    year: number
    period: string
  }
  onIssueClick?: (issue: ValidationIssue) => void
  onAutoFix?: (issueId: string) => void
}

export default function VATValidation({ extractedVAT, period, onIssueClick, onAutoFix }: VATValidationProps) {
  const [issues, setIssues] = useState<ValidationIssue[]>([])
  const [isValidating, setIsValidating] = useState(false)
  const [validationScore, setValidationScore] = useState(0)

  useEffect(() => {
    if (extractedVAT) {
      validateVATData()
    }
  }, [extractedVAT, period])

  const validateVATData = useCallback(async () => {
    if (!extractedVAT) return

    setIsValidating(true)
    const detectedIssues: ValidationIssue[] = []

    try {
      // 1. Validate VAT amounts for unusual values
      validateAmounts(extractedVAT, detectedIssues)

      // 2. Validate VAT rates
      validateVATRates(extractedVAT, detectedIssues)

      // 3. Validate document confidence scores
      validateConfidenceScores(extractedVAT, detectedIssues)

      // 4. Validate period consistency
      validatePeriodConsistency(extractedVAT, period, detectedIssues)

      // 5. Check for duplicate documents
      validateDuplicates(extractedVAT, detectedIssues)

      // 6. Validate document sequence
      validateSequence(extractedVAT, detectedIssues)

      // 7. Check for missing documents
      validateCompleteness(extractedVAT, detectedIssues)

      setIssues(detectedIssues)
      calculateValidationScore(detectedIssues)

    } catch (error) {
      console.error('Validation error:', error)
    } finally {
      setIsValidating(false)
    }
  }, [extractedVAT, period])

  const validateAmounts = (data: VATValidationData, issues: ValidationIssue[]) => {
    const allAmounts = [
      ...data.salesDocuments.flatMap(doc => doc.extractedAmounts),
      ...data.purchaseDocuments.flatMap(doc => doc.extractedAmounts)
    ]

    if (allAmounts.length === 0) return

    const mean = allAmounts.reduce((sum, amount) => sum + amount, 0) / allAmounts.length
    const stdDev = Math.sqrt(allAmounts.reduce((sum, amount) => sum + Math.pow(amount - mean, 2), 0) / allAmounts.length)

    // Check for outliers (amounts more than 3 standard deviations from mean)
    allAmounts.forEach((amount, index) => {
      if (Math.abs(amount - mean) > 3 * stdDev && amount > 1000) {
        const document = [...data.salesDocuments, ...data.purchaseDocuments]
          .find(doc => doc.extractedAmounts.includes(amount))

        issues.push({
          id: `outlier_${index}`,
          type: 'warning',
          category: 'amount',
          title: 'Unusual VAT Amount',
          description: `VAT amount of €${amount.toFixed(2)} is significantly higher than typical amounts`,
          suggestion: 'Please verify this amount is correct',
          documentId: document?.id,
          documentName: document?.fileName,
          affectedAmount: amount
        })
      }
    })

    // Check for suspiciously round numbers in large amounts
    allAmounts.forEach((amount, index) => {
      if (amount > 500 && amount % 100 === 0) {
        const document = [...data.salesDocuments, ...data.purchaseDocuments]
          .find(doc => doc.extractedAmounts.includes(amount))

        issues.push({
          id: `round_${index}`,
          type: 'info',
          category: 'amount',
          title: 'Round VAT Amount',
          description: `VAT amount of €${amount.toFixed(2)} is suspiciously round`,
          suggestion: 'Verify this is not an estimated or placeholder amount',
          documentId: document?.id,
          documentName: document?.fileName,
          affectedAmount: amount
        })
      }
    })
  }

  const validateVATRates = (data: VATValidationData, issues: ValidationIssue[]) => {
    const irishVATRates = [0, 0.095, 0.135, 0.23] // 0%, 9.5%, 13.5%, 23%
    
    const checkVATRate = (documents: any[], type: string) => {
      documents.forEach(doc => {
        doc.extractedAmounts.forEach((vatAmount: number, index: number) => {
          // Estimate the net amount (this is rough - would need actual net amounts)
          const estimatedRate23 = vatAmount / (vatAmount / 0.23 + vatAmount)
          const estimatedRate135 = vatAmount / (vatAmount / 0.135 + vatAmount)
          
          // Check if the implied VAT rate seems unusual
          const isValidRate = irishVATRates.some(rate => 
            Math.abs(estimatedRate23 - rate) < 0.02 || Math.abs(estimatedRate135 - rate) < 0.02
          )

          if (!isValidRate && vatAmount > 10) {
            issues.push({
              id: `rate_${doc.id}_${index}`,
              type: 'warning',
              category: 'rate',
              title: 'Unusual VAT Rate',
              description: `VAT amount of €${vatAmount.toFixed(2)} may not match standard Irish VAT rates`,
              suggestion: 'Verify the VAT rate used (0%, 9.5%, 13.5%, or 23%)',
              documentId: doc.id,
              documentName: doc.fileName,
              affectedAmount: vatAmount
            })
          }
        })
      })
    }

    checkVATRate(data.salesDocuments, 'Sales')
    checkVATRate(data.purchaseDocuments, 'Purchase')
  }

  const validateConfidenceScores = (data: VATValidationData, issues: ValidationIssue[]) => {
    const lowConfidenceDocs = [
      ...data.salesDocuments.filter(doc => doc.confidence < 0.6),
      ...data.purchaseDocuments.filter(doc => doc.confidence < 0.6)
    ]

    lowConfidenceDocs.forEach(doc => {
      issues.push({
        id: `confidence_${doc.id}`,
        type: doc.confidence < 0.4 ? 'error' : 'warning',
        category: 'document',
        title: 'Low AI Confidence',
        description: `Document "${doc.fileName}" has low confidence score (${Math.round(doc.confidence * 100)}%)`,
        suggestion: 'Review and manually verify extracted amounts',
        documentId: doc.id,
        documentName: doc.fileName
      })
    })

    // Check if overall confidence is low
    if (data.averageConfidence < 0.7) {
      issues.push({
        id: 'overall_confidence',
        type: 'warning',
        category: 'document',
        title: 'Low Overall Confidence',
        description: `Average confidence is ${Math.round(data.averageConfidence * 100)}%`,
        suggestion: 'Consider reviewing all extracted amounts before submission'
      })
    }
  }

  const validatePeriodConsistency = (data: VATValidationData, period: any, issues: ValidationIssue[]) => {
    const periodStart = new Date(period.year, getPeriodStartMonth(period.period), 1)
    const periodEnd = new Date(period.year, getPeriodEndMonth(period.period) + 1, 0)

    const checkDocumentDates = (documents: any[], type: string) => {
      documents.forEach(doc => {
        const docDate = new Date(doc.uploadedAt)
        
        // Note: This is upload date, not document date. In a real system, you'd extract document dates.
        if (docDate < periodStart || docDate > periodEnd) {
          issues.push({
            id: `period_${doc.id}`,
            type: 'warning',
            category: 'period',
            title: 'Document Date Outside Period',
            description: `${type} document "${doc.fileName}" may be outside the VAT period`,
            suggestion: 'Verify the document belongs to this VAT period',
            documentId: doc.id,
            documentName: doc.fileName
          })
        }
      })
    }

    checkDocumentDates(data.salesDocuments, 'Sales')
    checkDocumentDates(data.purchaseDocuments, 'Purchase')
  }

  const validateDuplicates = (data: VATValidationData, issues: ValidationIssue[]) => {
    const allDocs = [...data.salesDocuments, ...data.purchaseDocuments]
    const duplicateGroups: { [key: string]: any[] } = {}

    allDocs.forEach(doc => {
      // Simple duplicate detection based on similar filenames and amounts
      const key = `${doc.fileName.toLowerCase().replace(/[^a-z0-9]/g, '')}_${doc.extractedAmounts.join('_')}`
      
      if (!duplicateGroups[key]) {
        duplicateGroups[key] = []
      }
      duplicateGroups[key].push(doc)
    })

    Object.values(duplicateGroups).forEach(group => {
      if (group.length > 1) {
        issues.push({
          id: `duplicate_${group[0].id}`,
          type: 'error',
          category: 'duplicate',
          title: 'Potential Duplicate Documents',
          description: `Found ${group.length} similar documents that may be duplicates`,
          suggestion: 'Review and remove duplicate entries to avoid double-counting',
          documentName: group.map(d => d.fileName).join(', ')
        })
      }
    })
  }

  const validateSequence = (data: VATValidationData, issues: ValidationIssue[]) => {
    // Check for gaps in invoice sequences (basic implementation)
    const extractInvoiceNumbers = (fileName: string): number | null => {
      const match = fileName.match(/(?:inv|invoice).*?(\d{3,})/i)
      return match ? parseInt(match[1]) : null
    }

    const salesInvoiceNumbers = data.salesDocuments
      .map(doc => ({ ...doc, number: extractInvoiceNumbers(doc.fileName) }))
      .filter(doc => doc.number !== null)
      .sort((a, b) => a.number! - b.number!)

    if (salesInvoiceNumbers.length > 2) {
      const gaps = []
      for (let i = 1; i < salesInvoiceNumbers.length; i++) {
        const prev = salesInvoiceNumbers[i - 1].number!
        const curr = salesInvoiceNumbers[i].number!
        if (curr - prev > 1) {
          gaps.push({ from: prev, to: curr, missing: curr - prev - 1 })
        }
      }

      gaps.forEach((gap, index) => {
        if (gap.missing <= 5) { // Only report small gaps
          issues.push({
            id: `sequence_gap_${index}`,
            type: 'info',
            category: 'sequence',
            title: 'Potential Missing Invoices',
            description: `Gap in invoice sequence: ${gap.missing} invoice(s) between ${gap.from} and ${gap.to}`,
            suggestion: 'Check if any invoices are missing from this period'
          })
        }
      })
    }
  }

  const validateCompleteness = (data: VATValidationData, issues: ValidationIssue[]) => {
    // Check for unusual ratios
    const salesTotal = data.totalSalesVAT
    const purchaseTotal = data.totalPurchaseVAT

    if (salesTotal > 0 && purchaseTotal === 0) {
      issues.push({
        id: 'no_purchases',
        type: 'warning',
        category: 'document',
        title: 'No Purchase VAT',
        description: 'You have sales VAT but no purchase VAT recorded',
        suggestion: 'Consider if you have any business purchases with VAT that should be included'
      })
    }

    if (purchaseTotal > 0 && salesTotal === 0) {
      issues.push({
        id: 'no_sales',
        type: 'warning',
        category: 'document',
        title: 'No Sales VAT',
        description: 'You have purchase VAT but no sales VAT recorded',
        suggestion: 'Verify this is correct if your business had no VAT-able sales this period'
      })
    }

    // Check for unusual sales/purchase ratio
    if (salesTotal > 0 && purchaseTotal > 0) {
      const ratio = purchaseTotal / salesTotal
      if (ratio > 0.8) {
        issues.push({
          id: 'high_purchase_ratio',
          type: 'info',
          category: 'amount',
          title: 'High Purchase VAT Ratio',
          description: `Purchase VAT is ${Math.round(ratio * 100)}% of Sales VAT`,
          suggestion: 'This may be normal but verify all amounts are correct'
        })
      }
    }
  }

  const getPeriodStartMonth = (period: string): number => {
    const periodMap: { [key: string]: number } = {
      'jan-feb': 0, 'mar-apr': 2, 'may-jun': 4,
      'jul-aug': 6, 'sep-oct': 8, 'nov-dec': 10
    }
    return periodMap[period] || 0
  }

  const getPeriodEndMonth = (period: string): number => {
    const periodMap: { [key: string]: number } = {
      'jan-feb': 1, 'mar-apr': 3, 'may-jun': 5,
      'jul-aug': 7, 'sep-oct': 9, 'nov-dec': 11
    }
    return periodMap[period] || 1
  }

  const calculateValidationScore = (issues: ValidationIssue[]) => {
    let score = 100
    
    issues.forEach(issue => {
      switch (issue.type) {
        case 'error': score -= 15; break
        case 'warning': score -= 5; break
        case 'info': score -= 1; break
      }
    })

    setValidationScore(Math.max(0, score))
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreDescription = (score: number) => {
    if (score >= 90) return 'Excellent - Ready for submission'
    if (score >= 70) return 'Good - Minor issues to review'
    if (score >= 50) return 'Fair - Several issues need attention'
    return 'Poor - Significant issues require fixing'
  }

  const handleIssueClick = (issue: ValidationIssue) => {
    onIssueClick?.(issue)
  }

  const handleAutoFix = (issueId: string) => {
    onAutoFix?.(issueId)
  }

  const getIssueIcon = (type: ValidationIssue['type']) => {
    switch (type) {
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'info': return <Info className="h-4 w-4 text-blue-500" />
      default: return <Info className="h-4 w-4" />
    }
  }

  const getCategoryIcon = (category: ValidationIssue['category']) => {
    switch (category) {
      case 'amount': return <DollarSign className="h-4 w-4" />
      case 'period': return <Calendar className="h-4 w-4" />
      case 'document': return <FileText className="h-4 w-4" />
      case 'rate': return <Calculator className="h-4 w-4" />
      case 'sequence': return <TrendingUp className="h-4 w-4" />
      case 'duplicate': return <TrendingDown className="h-4 w-4" />
      default: return <Shield className="h-4 w-4" />
    }
  }

  const errorCount = issues.filter(i => i.type === 'error').length
  const warningCount = issues.filter(i => i.type === 'warning').length
  const infoCount = issues.filter(i => i.type === 'info').length

  if (!extractedVAT) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center text-gray-500">
            <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No data available for validation</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            VAT Data Validation
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={validateVATData}
            disabled={isValidating}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isValidating ? 'animate-spin' : ''}`} />
            Re-validate
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Validation Score */}
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl font-bold">Validation Score:</span>
            <span className={`text-3xl font-bold ${getScoreColor(validationScore)}`}>
              {validationScore}/100
            </span>
          </div>
          <Progress value={validationScore} className="w-full mb-2" />
          <p className="text-sm text-gray-600">{getScoreDescription(validationScore)}</p>
        </div>

        {/* Issue Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 border rounded-lg">
            <div className="flex items-center justify-center gap-1 text-red-600 mb-1">
              <XCircle className="h-4 w-4" />
              <span className="text-lg font-semibold">{errorCount}</span>
            </div>
            <p className="text-sm text-gray-600">Errors</p>
          </div>
          <div className="text-center p-3 border rounded-lg">
            <div className="flex items-center justify-center gap-1 text-yellow-600 mb-1">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-lg font-semibold">{warningCount}</span>
            </div>
            <p className="text-sm text-gray-600">Warnings</p>
          </div>
          <div className="text-center p-3 border rounded-lg">
            <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
              <Info className="h-4 w-4" />
              <span className="text-lg font-semibold">{infoCount}</span>
            </div>
            <p className="text-sm text-gray-600">Info</p>
          </div>
        </div>

        {/* Issues List */}
        {issues.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {issues.map((issue) => (
              <Alert key={issue.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleIssueClick(issue)}>
                <div className="flex items-start gap-3 w-full">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {getIssueIcon(issue.type)}
                    {getCategoryIcon(issue.category)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <AlertTitle className="text-sm font-medium mb-1">
                      {issue.title}
                      {issue.affectedAmount && (
                        <Badge variant="outline" className="ml-2">
                          €{issue.affectedAmount.toFixed(2)}
                        </Badge>
                      )}
                    </AlertTitle>
                    <AlertDescription className="text-sm text-gray-600 mb-2">
                      {issue.description}
                    </AlertDescription>
                    
                    {issue.suggestion && (
                      <p className="text-xs text-blue-600 mb-2">💡 {issue.suggestion}</p>
                    )}
                    
                    {issue.documentName && (
                      <p className="text-xs text-gray-500">📄 {issue.documentName}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {issue.documentId && (
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                        <Eye className="h-3 w-3" />
                      </Button>
                    )}
                    
                    {issue.autoFixable && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAutoFix(issue.id)
                        }}
                        className="text-green-600 hover:text-green-700"
                      >
                        Fix
                      </Button>
                    )}
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
            <p className="text-lg font-medium text-green-700">All Validations Passed!</p>
            <p className="text-sm text-gray-600">Your VAT data looks good and ready for submission</p>
          </div>
        )}

        {/* Quick Stats */}
        <Separator />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Documents:</span>
            <span className="ml-1 font-medium">{extractedVAT.processedDocuments}/{extractedVAT.documentCount}</span>
          </div>
          <div>
            <span className="text-gray-600">Avg Confidence:</span>
            <span className="ml-1 font-medium">{Math.round(extractedVAT.averageConfidence * 100)}%</span>
          </div>
          <div>
            <span className="text-gray-600">Period:</span>
            <span className="ml-1 font-medium">{period.year} {period.period}</span>
          </div>
          <div>
            <span className="text-gray-600">Net VAT:</span>
            <span className="ml-1 font-medium">€{extractedVAT.totalNetVAT?.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}