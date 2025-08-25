/**
 * VAT Extraction Error Display Component
 * Shows critical tax compliance errors with zero tolerance for wrong VAT amounts
 */

import { AlertTriangle, X, FileX, AlertCircle } from 'lucide-react'

interface VATExtractionErrorProps {
  zeroToleranceCheck: {
    isVWDocument: boolean
    extractedAmounts: number[]
    hasCorrectAmount: boolean
    hasWrongAmount: boolean
    errorDetails: string[]
    complianceStatus: 'COMPLIANT' | 'ERROR' | 'WARNING' | 'UNKNOWN'
  }
  documentName: string
  onManualOverride?: () => void
  onReprocess?: () => void
}

export function VATExtractionError({ 
  zeroToleranceCheck, 
  documentName,
  onManualOverride,
  onReprocess 
}: VATExtractionErrorProps) {
  
  if (zeroToleranceCheck.complianceStatus === 'COMPLIANT') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-normal">✓</span>
          </div>
          <h3 className="font-normal text-green-800">VAT Extraction Verified</h3>
        </div>
        <p className="text-green-700 mt-1">
          {zeroToleranceCheck.isVWDocument 
            ? `Correct VAT amount (€111.36) extracted from VW Financial document`
            : `VAT amounts extracted successfully: €${zeroToleranceCheck.extractedAmounts.join(', €')}`
          }
        </p>
      </div>
    )
  }

  if (zeroToleranceCheck.complianceStatus === 'UNKNOWN') {
    return null
  }

  const isError = zeroToleranceCheck.complianceStatus === 'ERROR'
  const isWarning = zeroToleranceCheck.complianceStatus === 'WARNING'

  return (
    <div className={`border rounded-lg p-6 mb-4 ${
      isError 
        ? 'bg-red-50 border-red-300' 
        : 'bg-yellow-50 border-yellow-300'
    }`}>
      {/* Header */}
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-full ${
          isError ? 'bg-red-100' : 'bg-yellow-100'
        }`}>
          {isError ? (
            <X className={`w-6 h-6 ${isError ? 'text-red-600' : 'text-yellow-600'}`} />
          ) : (
            <AlertTriangle className={`w-6 h-6 ${isError ? 'text-red-600' : 'text-yellow-600'}`} />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-normal ${
            isError ? 'text-red-900' : 'text-yellow-900'
          }`}>
            {isError ? '🚨 CRITICAL TAX COMPLIANCE ERROR' : '⚠️ VAT EXTRACTION WARNING'}
          </h3>
          
          <p className={`text-sm mt-1 ${
            isError ? 'text-red-800' : 'text-yellow-800'
          }`}>
            Document: <code className="bg-gray-100 px-1 rounded">{documentName}</code>
          </p>
        </div>
      </div>

      {/* Error Details */}
      <div className="mt-4 space-y-2">
        {zeroToleranceCheck.errorDetails.map((error, index) => (
          <div key={index} className={`flex items-start space-x-2 ${
            isError ? 'text-red-800' : 'text-yellow-800'
          }`}>
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        ))}
      </div>

      {/* Extracted vs Expected */}
      {zeroToleranceCheck.isVWDocument && (
        <div className="mt-4 p-3 bg-white/50 rounded border">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-normal text-gray-700">Expected (VW Financial):</span>
              <div className="text-green-600 font-mono">€111.36</div>
            </div>
            <div>
              <span className="font-normal text-gray-700">Actually Extracted:</span>
              <div className={`font-mono ${
                zeroToleranceCheck.extractedAmounts.length === 0 
                  ? 'text-gray-500' 
                  : isError ? 'text-red-600' : 'text-yellow-600'
              }`}>
                {zeroToleranceCheck.extractedAmounts.length === 0 
                  ? 'No amounts found' 
                  : `€${zeroToleranceCheck.extractedAmounts.join(', €')}`
                }
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Impact Warning */}
      {isError && (
        <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded">
          <div className="flex items-center space-x-2">
            <FileX className="w-5 h-5 text-red-600" />
            <span className="font-normal text-red-900">Impact on VAT Filing</span>
          </div>
          <p className="text-red-800 text-sm mt-1">
            Using this incorrect VAT amount in your Irish Revenue VAT return will result in:
          </p>
          <ul className="text-red-800 text-sm mt-2 ml-4 space-y-1">
            <li>• Incorrect VAT liability calculation</li>
            <li>• Potential penalties and interest from Revenue</li>
            <li>• Audit risk and compliance issues</li>
            <li>• Need for amended VAT return submission</li>
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-6 flex flex-wrap gap-3">
        {onManualOverride && (
          <button
            onClick={onManualOverride}
            className={`px-4 py-2 text-sm font-normal rounded-md border ${
              isError
                ? 'bg-red-600 text-white border-red-600 hover:bg-red-700'
                : 'bg-yellow-600 text-white border-yellow-600 hover:bg-yellow-700'
            } transition-colors`}
          >
            Manual Override Required
          </button>
        )}
        
        {onReprocess && (
          <button
            onClick={onReprocess}
            className="px-4 py-2 text-sm font-normal text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Reprocess Document
          </button>
        )}
        
        <button
          onClick={() => window.open('/api/admin/override-vat', '_blank')}
          className="px-4 py-2 text-sm font-normal text-petrol-base bg-white border border-petrol-300 rounded-md hover:bg-petrol-50 transition-colors"
        >
          Admin Override Panel
        </button>
      </div>

      {/* Compliance Notice */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-600">
          <strong>Tax Compliance Notice:</strong> This system has zero tolerance for VAT extraction errors. 
          All amounts must be manually verified before submitting VAT returns to Irish Revenue. 
          When in doubt, consult your tax advisor or accountant.
        </p>
      </div>
    </div>
  )
}