"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  ThumbsUp, 
  ThumbsDown, 
  AlertTriangle, 
  CheckCircle, 
  Star,
  Send,
  Info
} from 'lucide-react'
import { toast } from 'sonner'

interface DocumentFeedbackProps {
  documentId: string
  originalExtraction: any
  onFeedbackSubmitted?: (feedbackType: string) => void
  className?: string
}

interface FieldCorrection {
  field: string
  fieldLabel: string
  originalValue: any
  correctedValue: any
  confidence?: number
}

export default function DocumentFeedback({
  documentId,
  originalExtraction,
  onFeedbackSubmitted,
  className = ''
}: DocumentFeedbackProps) {
  const [feedbackType, setFeedbackType] = useState<'CORRECT' | 'INCORRECT' | 'PARTIALLY_CORRECT' | null>(null)
  const [corrections, setCorrections] = useState<FieldCorrection[]>([])
  const [userNotes, setUserNotes] = useState('')
  const [confidenceRating, setConfidenceRating] = useState<number>(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCorrectionForm, setShowCorrectionForm] = useState(false)
  const [insights, setInsights] = useState<any>(null)
  
  // Extract correctable fields from original extraction
  const correctableFields = [
    { 
      key: 'vatData.totalVatAmount', 
      label: 'Total VAT Amount', 
      value: originalExtraction?.vatData?.totalVatAmount,
      type: 'number'
    },
    { 
      key: 'businessDetails.vatNumber', 
      label: 'VAT Number', 
      value: originalExtraction?.businessDetails?.vatNumber,
      type: 'text'
    },
    { 
      key: 'businessDetails.businessName', 
      label: 'Business Name', 
      value: originalExtraction?.businessDetails?.businessName,
      type: 'text'
    },
    { 
      key: 'transactionData.date', 
      label: 'Document Date', 
      value: originalExtraction?.transactionData?.date,
      type: 'date'
    },
    { 
      key: 'transactionData.invoiceNumber', 
      label: 'Invoice Number', 
      value: originalExtraction?.transactionData?.invoiceNumber,
      type: 'text'
    }
  ].filter(field => field.value !== undefined && field.value !== null)

  const handleFeedbackTypeSelect = (type: 'CORRECT' | 'INCORRECT' | 'PARTIALLY_CORRECT') => {
    setFeedbackType(type)
    
    if (type === 'PARTIALLY_CORRECT' || type === 'INCORRECT') {
      setShowCorrectionForm(true)
      // Initialize corrections with current values
      const initialCorrections = correctableFields.map(field => ({
        field: field.key,
        fieldLabel: field.label,
        originalValue: field.value,
        correctedValue: field.value,
        confidence: 0.5
      }))
      setCorrections(initialCorrections)
    } else {
      setShowCorrectionForm(false)
      setCorrections([])
    }
  }

  const handleCorrectionChange = (index: number, correctedValue: any) => {
    const updatedCorrections = [...corrections]
    updatedCorrections[index].correctedValue = correctedValue
    setCorrections(updatedCorrections)
  }

  const handleSubmitFeedback = async () => {
    if (!feedbackType) {
      toast.error('Please select a feedback type')
      return
    }

    setIsSubmitting(true)

    try {
      // Filter corrections to only include fields that were actually changed
      const actualCorrections = corrections.filter(correction => 
        correction.originalValue !== correction.correctedValue
      )

      // Build corrected extraction object
      const correctedExtraction = { ...originalExtraction }
      actualCorrections.forEach(correction => {
        const keys = correction.field.split('.')
        let target = correctedExtraction
        
        for (let i = 0; i < keys.length - 1; i++) {
          if (!target[keys[i]]) target[keys[i]] = {}
          target = target[keys[i]]
        }
        
        target[keys[keys.length - 1]] = correction.correctedValue
      })

      const response = await fetch('/api/ai/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          documentId,
          originalExtraction,
          correctedExtraction,
          feedback: feedbackType,
          specificCorrections: actualCorrections,
          userNotes: userNotes.trim() || undefined,
          confidenceRating: confidenceRating || undefined
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast.success(result.message || 'Thank you for your feedback!')
        setInsights(result.insights)
        onFeedbackSubmitted?.(feedbackType)
      } else {
        toast.error(result.error || 'Failed to submit feedback')
      }

    } catch (error) {
      console.error('Error submitting feedback:', error)
      toast.error('Network error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStarRating = () => {
    return (
      <div className="flex items-center space-x-1">
        <Label className="text-sm font-medium">Confidence in our extraction:</Label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              onClick={() => setConfidenceRating(star)}
              className={`p-1 rounded transition-colors ${
                star <= confidenceRating
                  ? 'text-yellow-500 hover:text-yellow-600'
                  : 'text-gray-300 hover:text-yellow-300'
              }`}
            >
              <Star className="h-4 w-4 fill-current" />
            </button>
          ))}
        </div>
        {confidenceRating > 0 && (
          <span className="text-xs text-gray-500 ml-2">
            {confidenceRating === 1 ? 'Poor' :
             confidenceRating === 2 ? 'Fair' :
             confidenceRating === 3 ? 'Good' :
             confidenceRating === 4 ? 'Very Good' : 'Excellent'}
          </span>
        )}
      </div>
    )
  }

  // If insights are available, show them instead of the form
  if (insights) {
    return (
      <Card className={`border-green-200 bg-green-50 ${className}`}>
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            Feedback Received!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-green-800 mb-2">Impact</h4>
            <p className="text-green-700 text-sm">{insights.accuracyImprovement}</p>
          </div>

          {insights.commonIssues?.length > 0 && (
            <div>
              <h4 className="font-medium text-green-800 mb-2">Issues Identified</h4>
              <ul className="text-green-700 text-sm space-y-1">
                {insights.commonIssues.map((issue: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <AlertTriangle className="h-3 w-3 mr-2 mt-0.5 text-yellow-600" />
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {insights.suggestions?.length > 0 && (
            <div>
              <h4 className="font-medium text-green-800 mb-2 flex items-center">
                <Info className="h-4 w-4 mr-1" />
                Suggestions
              </h4>
              <ul className="text-green-700 text-sm space-y-1">
                {insights.suggestions.map((suggestion: string, index: number) => (
                  <li key={index} className="flex items-start">
                    • {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`border-blue-200 bg-blue-50 ${className}`}>
      <CardHeader>
        <CardTitle className="text-blue-800 flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          How accurate was our extraction?
        </CardTitle>
        <p className="text-sm text-blue-600">
          Your feedback helps improve our AI for future documents
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Feedback Type Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Overall accuracy:</Label>
          <div className="flex flex-wrap gap-3">
            <Button
              variant={feedbackType === 'CORRECT' ? 'default' : 'outline'}
              onClick={() => handleFeedbackTypeSelect('CORRECT')}
              className={`${
                feedbackType === 'CORRECT' 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'border-green-200 text-green-700 hover:bg-green-50'
              }`}
            >
              <ThumbsUp className="h-4 w-4 mr-2" />
              All Correct
            </Button>
            
            <Button
              variant={feedbackType === 'PARTIALLY_CORRECT' ? 'default' : 'outline'}
              onClick={() => handleFeedbackTypeSelect('PARTIALLY_CORRECT')}
              className={`${
                feedbackType === 'PARTIALLY_CORRECT' 
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                  : 'border-yellow-200 text-yellow-700 hover:bg-yellow-50'
              }`}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Mostly Correct
            </Button>
            
            <Button
              variant={feedbackType === 'INCORRECT' ? 'default' : 'outline'}
              onClick={() => handleFeedbackTypeSelect('INCORRECT')}
              className={`${
                feedbackType === 'INCORRECT' 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'border-red-200 text-red-700 hover:bg-red-50'
              }`}
            >
              <ThumbsDown className="h-4 w-4 mr-2" />
              Needs Correction
            </Button>
          </div>
        </div>

        {/* Correction Form */}
        {showCorrectionForm && correctableFields.length > 0 && (
          <div className="space-y-4 p-4 bg-white rounded-lg border">
            <h4 className="font-medium text-gray-900">Correct the extracted values:</h4>
            
            {corrections.map((correction, index) => {
              const field = correctableFields.find(f => f.key === correction.field)
              if (!field) return null

              return (
                <div key={correction.field} className="space-y-2">
                  <Label className="text-sm font-medium">{correction.fieldLabel}</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-gray-500">Original (AI extracted)</Label>
                      <div className="px-3 py-2 bg-gray-100 border rounded text-sm">
                        {String(correction.originalValue) || 'Not extracted'}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Correct value</Label>
                      <Input
                        type={field.type}
                        value={String(correction.correctedValue)}
                        onChange={(e) => handleCorrectionChange(index, e.target.value)}
                        placeholder="Enter correct value"
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Star Rating */}
        {feedbackType && (
          <div className="space-y-2">
            {renderStarRating()}
          </div>
        )}

        {/* Additional Notes */}
        {feedbackType && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Additional notes (optional)</Label>
            <Textarea
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              placeholder="Tell us more about the accuracy issues or suggestions..."
              className="text-sm"
              rows={3}
            />
          </div>
        )}

        {/* Submit Button */}
        {feedbackType && (
          <Button
            onClick={handleSubmitFeedback}
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Feedback
              </>
            )}
          </Button>
        )}

        {/* Help Text */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Your feedback improves AI accuracy for similar documents</p>
          <p>• All feedback is anonymous and helps the entire PayVAT community</p>
          <p>• Changes may take effect within a few hours</p>
        </div>
      </CardContent>
    </Card>
  )
}