/**
 * Simple API client for PayVAT application - compatible with stable backend
 */

// Request deduplication - prevent multiple identical requests
const inflightRequests = new Map<string, Promise<any>>()

function createRequestKey(url: string, options: RequestInit): string {
  const method = options.method || 'GET'
  const body = options.body || ''
  return `${method}:${url}:${body}`
}

export class ApiError extends Error {
  status?: number
  retryAfter?: number
  resetTime?: number
  
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
  retryAfter?: number
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

// Enhanced fetch wrapper with rate limiting support and deduplication
async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const requestKey = createRequestKey(url, options)
  
  // Check if identical request is already in flight
  if (inflightRequests.has(requestKey)) {
    console.log(`[API] Deduplicating request: ${requestKey}`)
    return inflightRequests.get(requestKey)!
  }
  
  // Create new request promise
  const requestPromise = executeRequest<T>(url, options)
  
  // Store in-flight request
  inflightRequests.set(requestKey, requestPromise)
  
  // Clean up after completion (success or failure)
  requestPromise.finally(() => {
    inflightRequests.delete(requestKey)
  })
  
  return requestPromise
}

async function executeRequest<T>(url: string, options: RequestInit): Promise<T> {
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
      // Extract error details from response
      let errorMessage = `Request failed: ${response.statusText}`
      let errorData: any = {}
      
      try {
        errorData = await response.json()
        if (errorData.error) {
          errorMessage = errorData.error
        }
      } catch {
        // Ignore JSON parsing errors
      }
      
      const apiError = new ApiError(errorMessage, response.status)
      
      // Add rate limiting information for 429 errors
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After')
        const rateLimitReset = response.headers.get('X-RateLimit-Reset')
        
        if (retryAfter) {
          (apiError as any).retryAfter = parseInt(retryAfter, 10)
        }
        if (rateLimitReset) {
          (apiError as any).resetTime = parseInt(rateLimitReset, 10)
        }
        if (errorData.retryAfter) {
          (apiError as any).retryAfter = errorData.retryAfter
        }
      }
      
      throw apiError
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