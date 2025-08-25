/**
 * DocumentTable - Table component for displaying documents with consistent layout
 * Provides headers and uses DocumentRow for individual items
 */

import React from 'react'
import { DocumentRow } from './DocumentRow'
import { Document, VATData } from '@/types/dashboard'

interface DocumentTableProps {
  documents: Document[]
  vatData?: VATData
  variant: 'sales' | 'purchase'
  onView: (document: Document) => void
  onRemove: (id: string) => void
  showHeaders?: boolean
}

export function DocumentTable({
  documents,
  vatData,
  variant,
  onView,
  onRemove,
  showHeaders = true,
}: DocumentTableProps) {
  if (documents.length === 0) {
    return null
  }

  return (
    <div className="w-full">
      {showHeaders && (
        <div className="grid grid-cols-12 gap-4 items-center px-6 py-3 bg-neutral-50 border-b text-xs font-normal text-neutral-600 uppercase tracking-wide">
          <div className="col-span-1 text-center">Type</div>
          <div className="col-span-2">Document Name</div>
          <div className="col-span-2">Date on Doc</div>
          <div className="col-span-2">Total on Doc</div>
          <div className="col-span-2">VAT Amount</div>
          <div className="col-span-1">Confidence %</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>
      )}
      
      <div className="divide-y divide-neutral-100">
        {documents.map((document) => (
          <DocumentRow
            key={document.id}
            document={document}
            vatData={vatData}
            variant={variant}
            onView={onView}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * Compact table variant for smaller spaces
 */
export function DocumentTableCompact({
  documents,
  vatData,
  variant,
  onView,
  onRemove,
}: DocumentTableProps) {
  if (documents.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      {documents.map((document) => (
        <DocumentRow
          key={document.id}
          document={document}
          vatData={vatData}
          variant={variant}
          onView={onView}
          onRemove={onRemove}
          compact
        />
      ))}
    </div>
  )
}