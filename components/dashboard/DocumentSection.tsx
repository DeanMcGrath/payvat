/**
 * DocumentSection - Reusable component for displaying document collections
 * Used for both sales and purchase document sections
 */

import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { DocumentTable } from './DocumentTable'
import { Skeleton } from '@/components/ui/skeleton'
import { FileText } from 'lucide-react'
import { Document, VATData } from '@/types/dashboard'
import { formatCurrency } from '@/lib/vatUtils'
import FileUpload from '@/components/file-upload'

interface DocumentSectionProps {
  title: string
  documents: Document[]
  vatData?: VATData
  variant: 'sales' | 'purchase'
  onView: (document: Document) => void
  onRemove: (id: string) => void
  loading?: boolean
  emptyMessage?: string
  children?: React.ReactNode
  // Upload functionality props
  onUploadSuccess?: (document: Document) => void
  enableBatchMode?: boolean
  maxConcurrentUploads?: number
  vatReturnId?: string
}

export function DocumentSection({
  title,
  documents,
  vatData,
  variant,
  onView,
  onRemove,
  loading = false,
  emptyMessage,
  children,
  onUploadSuccess,
  enableBatchMode = true,
  maxConcurrentUploads = 3,
  vatReturnId,
}: DocumentSectionProps) {
  // Determine styling based on variant
  const variantStyles = {
    sales: {
      card: 'border-petrol-200 bg-brand-50',
      header: 'bg-brand-100',
      title: 'text-brand-900',
      accent: 'text-petrol-dark',
      icon: 'text-petrol-base',
    },
    purchase: {
      card: 'border-green-200 bg-green-50',
      header: 'bg-green-100',
      title: 'text-green-900',
      accent: 'text-green-700',
      icon: 'text-green-600',
    },
  }

  const styles = variantStyles[variant]

  // Calculate total VAT for this section
  const totalVAT = variant === 'sales' 
    ? vatData?.totalSalesVAT || 0
    : vatData?.totalPurchaseVAT || 0

  const defaultEmptyMessage = variant === 'sales' 
    ? 'Upload sales-related documents including invoices, receipts, and payment records'
    : 'Upload purchase-related documents including invoices, receipts, and expense records'

  // Map variant to FileUpload category
  const uploadCategory = variant === 'sales' ? 'SALES' : 'PURCHASES'
  const uploadTitle = variant === 'sales' ? 'Upload Sales Documents' : 'Upload Purchase Documents'
  const uploadDescription = variant === 'sales' 
    ? 'Upload sales-related documents including invoices, receipts, and payment records'
    : 'Upload purchase-related documents including invoices, receipts, and expense records'

  return (
    <Card className={`${styles.card} rounded-xl shadow-sm hover:shadow-md transition-all duration-300`}>
      <CardHeader className={`${styles.header} rounded-t-xl`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <FileText className={`h-5 w-5 ${styles.icon}`} />
            <div>
              <h3 className={`h5 ${styles.title}`}>
                {title}
                {documents.length > 0 && (
                  <span className="ml-2 text-sm font-normal">
                    ({documents.length})
                  </span>
                )}
              </h3>
            </div>
          </div>
          
          {totalVAT > 0 && (
            <div className="text-right">
              <div className={`body-sm font-normal ${styles.accent}`}>
                Total VAT: {formatCurrency(totalVAT)}
              </div>
            </div>
          )}
        </div>

        {/* Integrated Upload Area */}
        <div className="mt-4">
          <FileUpload
            category={uploadCategory}
            title={uploadTitle}
            description={uploadDescription}
            acceptedFiles={['.pdf', '.csv', '.xlsx', '.xls', '.jpg', '.jpeg', '.png']}
            enableBatchMode={enableBatchMode}
            maxConcurrentUploads={maxConcurrentUploads}
            showBatchProgress={true}
            onUploadSuccess={onUploadSuccess}
            vatReturnId={vatReturnId}
          />
        </div>
        
        {children}
      </CardHeader>
      
      <CardContent className="p-0">
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : documents.length > 0 ? (
          <DocumentTable
            documents={documents}
            vatData={vatData}
            variant={variant}
            onView={onView}
            onRemove={onRemove}
          />
        ) : (
          <div className="p-8 text-center">
            <FileText className={`h-16 w-16 mx-auto mb-4 ${styles.icon} opacity-50`} />
            <h4 className="h6 text-neutral-900 mb-2">No Documents Found</h4>
            <p className="body-sm text-neutral-600">
              {emptyMessage || defaultEmptyMessage}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Skeleton loader for DocumentSection
 */
export function DocumentSectionSkeleton({ variant }: { variant: 'sales' | 'purchase' }) {
  const styles = variant === 'sales' 
    ? 'border-petrol-200 bg-brand-50'
    : 'border-green-200 bg-green-50'

  return (
    <Card className={`${styles} rounded-xl`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-48" />
          </div>
          <Skeleton className="h-5 w-32" />
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </CardContent>
    </Card>
  )
}