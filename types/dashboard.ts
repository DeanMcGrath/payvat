/**
 * Type definitions for the dashboard components and API responses
 */

// Document types - matching API response structure
export interface Document {
  id: string
  fileName: string
  originalName?: string
  fileSize: number
  mimeType?: string
  documentType?: string
  category:
    | 'SALES'
    | 'PURCHASE'
    | 'SALES_INVOICE'
    | 'SALES_RECEIPT'
    | 'SALES_REPORT'
    | 'PURCHASE_INVOICE'
    | 'PURCHASE_RECEIPT'
    | 'PURCHASE_REPORT'
    | 'COMPLIANCE_YEAR_END'
    | string
  uploadedAt: string
  extractedDate?: string | null
  extractedYear?: number | null
  extractedMonth?: number | null
  invoiceTotal?: number | string | null
  isScanned: boolean
  scanResult?: string | null
  vatReturnId?: string | null
  vatAccuracy?: number | null
  processingQuality?: string | null
  isDuplicate?: boolean
  duplicateOfId?: string | null
  validationStatus?: string | null
  complianceIssues?: string[] | null
  extractionConfidence?: number | null
  processingStatus?: {
    status: 'uploading' | 'uploaded' | 'processing' | 'processed' | 'needs_review' | 'failed'
    timestamp: string
    error?: string
    warnings?: string[]
    failureReasons?: string[]
  } | null
  validation?: {
    passed: boolean
    reasons: string[]
    warnings: string[]
  } | null
  classification?: {
    family:
      | 'vat3_return_print_view'
      | 'vat3_amended_example'
      | 'corporation_tax_return_summary'
      | 'annual_accounts_abridged'
      | 'annual_accounts_full'
      | 'cro_annual_return_b1'
      | 'cro_acknowledgement_receipt'
      | 'bookkeeping_export_csv_xlsx'
    confidence: number
  } | null
  complianceExtraction?: {
    document_type:
      | 'vat3_return_print_view'
      | 'vat3_amended_example'
      | 'corporation_tax_return_summary'
      | 'annual_accounts_abridged'
      | 'annual_accounts_full'
      | 'cro_annual_return_b1'
      | 'cro_acknowledgement_receipt'
      | 'bookkeeping_export_csv_xlsx'
    confidence: number
    reviewReasons: string[]
    vat_number?: string
    return_type?: 'original' | 'supplementary' | 'amended'
    is_amended?: boolean
    amended_reference?: string
    t1_vat_on_sales?: number
    t2_vat_on_purchases?: number
    t3_vat_due?: number
    t4_vat_reclaim?: number
    net_vat_due?: number
    period_start?: string
    period_end?: string
    filing_date?: string
    company_name?: string
    tax_reference_number?: string
    cro_number?: string
    return_date?: string
    accounting_period_start?: string
    accounting_period_end?: string
    corporation_tax_balance_payable?: number
    turnover_if_present?: number
    purchases_if_present?: number
    profit_before_tax_if_present?: number
    registration_number?: string
    financial_year_end?: string
    board_approval_date?: string
    fixed_assets?: number
    stock?: number
    receivables?: number
    cash_at_bank_and_in_hand?: number
    creditors_due_within_one_year?: number
    net_assets?: number
    shareholders_funds?: number
    turnover?: number
    cost_of_sales?: number
    gross_profit?: number
    profit_or_loss_before_tax?: number
    profit_or_loss_after_tax?: number
    vat_payable?: number
    corporate_tax_payable?: number
    paye_prsi?: number
    annual_return_date?: string
    made_up_to_date?: string
    next_return_due_date?: string
    acknowledgement_reference?: string
    received_at?: string
    submission_status?: string
    issuer?: string
    source_system?: string
    transaction_count?: number
    total_money_in?: number
    total_money_out?: number
    closing_balance?: number
    currency?: string
    file_format?: 'csv' | 'xlsx'
    classification?: {
      family:
        | 'vat3_return_print_view'
        | 'vat3_amended_example'
        | 'corporation_tax_return_summary'
        | 'annual_accounts_abridged'
        | 'annual_accounts_full'
        | 'cro_annual_return_b1'
        | 'cro_acknowledgement_receipt'
        | 'bookkeeping_export_csv_xlsx'
      confidence: number
    }
  } | null
  dateExtractionConfidence?: number | null
  totalExtractionConfidence?: number | null
  // Computed fields for dashboard compatibility
  vatAmount?: number | null
  aiConfidence?: number | null
  confidence?: number | null
}

// VAT extraction data from individual documents
export interface VATExtraction {
  id: string
  extractedAmounts: number[]
  confidence: number
  scanResult?: string
  processingStatus?: {
    status: 'uploading' | 'uploaded' | 'processing' | 'processed' | 'needs_review' | 'failed'
    timestamp: string
    error?: string
    warnings?: string[]
    failureReasons?: string[]
  }
  validation?: {
    passed: boolean
    reasons: string[]
    warnings: string[]
  }
}

// Aggregated VAT data from API
export interface VATData {
  totalSalesVAT: number
  totalPurchaseVAT: number
  totalNetVAT: number
  documentCount: number
  processedDocuments: number
  averageConfidence: number
  failedDocuments?: number
  processingStats?: {
    completed: number
    failed: number
    pending: number
  }
  salesDocuments?: Array<{
    id: string
    fileName?: string
    category?: string
    extractedAmounts: number[]
    confidence: number
    scanResult?: string
    processingStatus?: any
  }>
  purchaseDocuments?: Array<{
    id: string
    fileName?: string
    category?: string
    extractedAmounts: number[]
    confidence: number
    scanResult?: string
    processingStatus?: any
  }>
}

// User profile data
export interface UserProfile {
  id: string
  email: string
  businessName: string
  vatNumber: string
  firstName?: string
  lastName?: string
  role?: 'USER' | 'GUEST' | 'ADMIN'
  createdAt?: string
  updatedAt?: string
}

// VAT return data
export interface VATReturn {
  id: string
  periodStart: string
  periodEnd: string
  salesVAT: number
  purchaseVAT: number
  netVAT: number
  status: 'DRAFT' | 'SUBMITTED' | 'PAID' | 'OVERDUE'
  submittedAt?: string | null
  dueDate?: string | null
  createdAt?: string
  updatedAt?: string
  userId?: string
}

// API response wrapper types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
  fromCache?: boolean
  fromFallback?: boolean
  retryAfter?: number
}

// Dashboard-specific response types
export interface DocumentsResponse {
  documents: Document[]
  pagination?: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
  }
}

export interface VATDataResponse {
  extractedVAT: VATData
}

export interface UserResponse {
  user: UserProfile
}

export interface VATReturnsResponse {
  vatReturns: VATReturn[]
}

// Component prop types
export interface DocumentTableProps {
  documents: Document[]
  vatData?: VATData
  variant: 'sales' | 'purchase'
  onView: (document: Document) => void
  onRemove: (id: string) => void
}

export interface DocumentRowProps extends DocumentTableProps {
  document: Document
  vatExtraction?: VATExtraction | null
}

export interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ComponentType<{ className?: string }>
  variant?: 'default' | 'success' | 'warning' | 'error'
  loading?: boolean
}

// Hook return types
export interface UseDocumentsDataReturn {
  state: {
    documents: Document[]
    vatData: VATData | null
    loadingDocuments: boolean
    loadingVAT: boolean
    error: string | null
    inFallbackMode: boolean
    fallbackMessage: string | null
  }
  actions: {
    loadDocuments: () => Promise<void>
    loadVATData: (force?: boolean) => Promise<void>
    refreshData: () => Promise<void>
    debouncedRefreshVAT: (delay?: number, callback?: () => void) => void
    removeDocument: (id: string) => Promise<void>
    setDocuments: React.Dispatch<React.SetStateAction<Document[]>>
  }
  maps: {
    salesMap: Map<string, VATExtraction>
    purchaseMap: Map<string, VATExtraction>
  }
  computed: {
    salesDocuments: Document[]
    purchaseDocuments: Document[]
    totalDocuments: number
    processedDocuments: number
  }
}
