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
  category: 'SALES' | 'PURCHASE' | 'SALES_INVOICE' | 'SALES_RECEIPT' | 'SALES_REPORT' | 'PURCHASE_INVOICE' | 'PURCHASE_RECEIPT' | 'PURCHASE_REPORT'
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
    status: 'pending' | 'completed' | 'failed'
    timestamp: string
    error?: string
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