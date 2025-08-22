/**
 * Simple API client for PayVAT application - compatible with stable backend
 */

export class ApiError extends Error {
  status?: number
  
  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// Simple API response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Document types
export interface Document {
  id: string
  fileName: string
  originalName?: string
  fileSize: number
  category: 'SALES' | 'PURCHASE'
  uploadedAt: string
  extractedDate?: string
  invoiceTotal?: string
  isScanned: boolean
  scanResult?: string
}

export interface VATData {
  totalSalesVAT: number
  totalPurchaseVAT: number
  totalNetVAT: number
  processedDocuments: number
  averageConfidence: number
  documentCount: number
  salesDocuments?: Array<{
    id: string
    extractedAmounts: number[]
    confidence: number
  }>
  purchaseDocuments?: Array<{
    id: string
    extractedAmounts: number[]
    confidence: number
  }>
}

// User types
export interface UserProfile {
  id: string
  email: string
  businessName: string
  vatNumber: string
  firstName?: string
  lastName?: string
}

// VAT Return types
export interface VATReturn {
  id: string
  periodStart: string
  periodEnd: string
  salesVAT: number
  purchaseVAT: number
  netVAT: number
  status: 'DRAFT' | 'SUBMITTED' | 'PAID'
}

// Simple fetch wrapper
async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new ApiError(`Request failed: ${response.statusText}`, response.status)
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError('Network error occurred')
  }
}

// Document API
export const documentsApi = {
  getAll: (params?: { dashboard?: boolean }) => {
    const query = params?.dashboard ? '?dashboard=true' : ''
    return apiRequest<ApiResponse<{ documents: Document[] }>>(`/api/documents${query}`)
  },

  getById: (id: string) =>
    apiRequest<ApiResponse<Document>>(`/api/documents/${id}`),

  delete: (id: string) =>
    apiRequest<ApiResponse<void>>(`/api/documents/${id}`, { method: 'DELETE' }),

  getExtractedVAT: () =>
    apiRequest<ApiResponse<{ extractedVAT: VATData }>>('/api/documents/extracted-vat'),
}

// User API
export const userApi = {
  getProfile: () =>
    apiRequest<ApiResponse<{ user: UserProfile }>>('/api/auth/profile'),

  login: (email: string, password: string) =>
    apiRequest<ApiResponse<{ user: UserProfile }>>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    apiRequest<ApiResponse<void>>('/api/auth/logout', { method: 'POST' }),
}

// VAT API
export const vatApi = {
  getReturns: () =>
    apiRequest<ApiResponse<{ vatReturns: VATReturn[] }>>('/api/vat'),

  getById: (id: string) =>
    apiRequest<ApiResponse<{ vatReturn: VATReturn }>>(`/api/vat/${id}`),
}