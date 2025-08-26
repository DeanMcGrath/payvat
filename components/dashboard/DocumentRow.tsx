/**
 * DocumentRow - Individual document row component with consistent styling
 * Displays document information, VAT data, and action buttons
 */

import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Eye, X, CheckCircle, Clock, AlertTriangle, RefreshCw } from 'lucide-react'
import { Document, VATData, VATExtraction } from '@/types/dashboard'
import { formatCurrency } from '@/lib/vatUtils'

interface DocumentRowProps {
  document: Document
  vatData?: VATData
  variant: 'sales' | 'purchase'
  onView: (document: Document) => void
  onRemove: (id: string) => void
  onRetry?: (document: Document) => void
  compact?: boolean
  showDetails?: boolean
}

export const DocumentRow = React.memo<DocumentRowProps>(function DocumentRow({
  document,
  vatData,
  variant,
  onView,
  onRemove,
  onRetry,
  compact = false,
  showDetails = false,
}: DocumentRowProps) {
  // Find VAT extraction data for this document
  const vatExtraction = React.useMemo(() => {
    const sourceArray = variant === 'sales' 
      ? vatData?.salesDocuments 
      : vatData?.purchaseDocuments
    
    return sourceArray?.find((vatDoc: VATExtraction) => vatDoc.id === document.id)
  }, [document.id, vatData, variant])

  // Calculate totals
  const vatAmounts = vatExtraction?.extractedAmounts || []
  const confidence = vatExtraction?.confidence || 0
  const totalVAT = vatAmounts.reduce((sum: number, amount: number) => sum + amount, 0)

  // Determine variant styling
  const variantStyles = {
    sales: {
      bg: 'bg-brand-50',
      border: 'border-petrol-200',
      hover: 'hover:bg-petrol-100',
      text: 'text-brand-900',
      accent: 'text-petrol-dark',
    },
    purchase: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      hover: 'hover:bg-green-100',
      text: 'text-green-900',
      accent: 'text-green-700',
    },
  }

  const styles = variantStyles[variant]

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '—'
    try {
      return new Date(dateString).toLocaleDateString('en-IE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch {
      return '—'
    }
  }

  // Get processing status
  const getProcessingStatus = () => {
    // 🔧 CRITICAL FIX: Better status detection logic
    
    // Check if processing failed (scanResult indicates failure but isScanned is false)
    if (!document.isScanned && document.scanResult) {
      const scanResult = document.scanResult.toLowerCase()
      if (scanResult.includes('failed') || scanResult.includes('error') || scanResult.includes('validation failed')) {
        return {
          label: 'Failed',
          icon: AlertTriangle,
          variant: 'destructive' as const,
          className: 'text-red-600',
        }
      }
    }
    
    // Still processing (no scanResult yet or processing in progress)
    if (!document.isScanned) {
      return {
        label: 'Processing',
        icon: Clock,
        variant: 'secondary' as const,
        className: 'text-amber-600',
      }
    }

    // Successfully processed with VAT data
    if (vatExtraction && vatAmounts.length > 0) {
      return {
        label: 'Processed',
        icon: CheckCircle,
        variant: 'success' as const,
        className: 'text-green-600',
      }
    }

    // Scanned but no VAT data extracted (partial success)
    if (document.isScanned) {
      return {
        label: 'Completed',
        icon: CheckCircle,
        variant: 'success' as const,
        className: 'text-green-600',
      }
    }

    // Fallback for unknown status
    return {
      label: 'Unknown',
      icon: AlertTriangle,
      variant: 'secondary' as const,
      className: 'text-gray-600',
    }
  }

  const status = getProcessingStatus()

  if (compact) {
    return (
      <div className={`flex items-center justify-between p-3 rounded-lg ${styles.bg} ${styles.border} border ${styles.hover} transition-colors`}>
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <FileText className={`h-4 w-4 ${styles.accent} flex-shrink-0`} />
          <div className="min-w-0 flex-1">
            <p className="body-sm font-normal truncate" title={document.originalName || document.fileName}>
              {document.originalName || document.fileName}
            </p>
            <p className="text-xs text-neutral-500">
              {formatFileSize(document.fileSize)} • {formatDate(document.extractedDate)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {totalVAT > 0 && (
            <span className={`body-xs font-normal ${styles.accent}`}>
              {formatCurrency(totalVAT)}
            </span>
          )}
          
          <Badge variant={status.variant} className="text-xs">
            <status.icon className="h-3 w-3 mr-1" />
            {status.label}
          </Badge>
          
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(document)}
              className="h-6 w-6 p-0"
              aria-label="View document"
            >
              <Eye className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(document.id)}
              className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
              aria-label="Remove document"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-12 gap-4 items-center p-4 ${styles.bg} ${styles.hover} transition-colors group`}>
      {/* Document Icon */}
      <div className="col-span-1 flex justify-center">
        <FileText className={`h-6 w-6 ${styles.accent}`} aria-hidden="true" />
      </div>
      
      {/* Document Name and Size */}
      <div className="col-span-2 min-w-0">
        <p className="body-sm font-normal truncate" title={document.originalName || document.fileName}>
          {document.originalName || document.fileName}
        </p>
        <p className="text-xs text-neutral-500 mt-0.5">
          {formatFileSize(document.fileSize)}
        </p>
      </div>
      
      {/* Date */}
      <div className="col-span-2">
        <p className="body-sm text-neutral-700">
          {formatDate(document.extractedDate)}
        </p>
      </div>
      
      {/* Total Amount */}
      <div className="col-span-2">
        <p className="body-sm font-normal text-neutral-800">
          {document.invoiceTotal 
            ? formatCurrency(Number(document.invoiceTotal))
            : '—'
          }
        </p>
      </div>
      
      {/* VAT Amount */}
      <div className="col-span-2">
        <p className={`body-sm font-normal ${styles.accent}`}>
          {totalVAT > 0 ? formatCurrency(totalVAT) : '—'}
        </p>
      </div>
      
      {/* Confidence % */}
      <div className="col-span-1">
        <p className="body-sm font-normal text-neutral-700">
          {confidence > 0 ? `${Math.round(confidence * 100)}%` : '—'}
        </p>
      </div>
      
      {/* Status */}
      <div className="col-span-1">
        <Badge variant={status.variant} className="text-xs">
          <status.icon className="h-3 w-3 mr-1" />
          {status.label}
        </Badge>
      </div>
      
      {/* Actions */}
      <div className="col-span-1 flex justify-end space-x-1">
        {/* 🔧 CRITICAL FIX: Add retry button for failed documents */}
        {status.label === 'Failed' && onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRetry(document)}
            className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Retry processing"
            title="Retry processing this document"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView(document)}
          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="View document"
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(document.id)}
          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Remove document"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Expandable Details */}
      {showDetails && vatExtraction && (
        <div className="col-span-12 mt-4 p-4 bg-neutral-50 rounded-lg border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="font-normal text-neutral-700">VAT Amounts</p>
              <p className="text-neutral-600">
                {vatAmounts.map(amount => formatCurrency(amount)).join(', ')}
              </p>
            </div>
            <div>
              <p className="font-normal text-neutral-700">Confidence</p>
              <p className="text-neutral-600">{Math.round(confidence * 100)}%</p>
            </div>
            <div>
              <p className="font-normal text-neutral-700">Category</p>
              <p className="text-neutral-600">{document.category}</p>
            </div>
            <div>
              <p className="font-normal text-neutral-700">Uploaded</p>
              <p className="text-neutral-600">{formatDate(document.uploadedAt)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})