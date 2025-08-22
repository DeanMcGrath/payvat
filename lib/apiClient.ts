/**
 * Centralized API client for PayVAT application
 * Provides type-safe methods with error handling and automatic retries
 */

export class ApiError extends Error {
  status?: number
  code?: string
  
  constructor(message: string, status?: number, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

interface RequestConfig extends RequestInit {
  timeout?: number
  retries?: number
  retryDelay?: number
}

class ApiClient {
  private baseURL: string
  private defaultTimeout = 30000
  private defaultRetries = 2
  private defaultRetryDelay = 1000

  constructor(baseURL: string = '') {
    this.baseURL = baseURL
  }

  async get<T>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, { ...config, method: 'GET' })
  }

  async post<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers,
      },
    })
  }

  async put<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers,
      },
    })
  }

  async delete<T>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, { ...config, method: 'DELETE' })
  }

  private async request<T>(url: string, config: RequestConfig): Promise<T> {
    const {
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
      retryDelay = this.defaultRetryDelay,
      ...fetchConfig
    } = config

    const fullUrl = url.startsWith('/') ? url : `${this.baseURL}${url}`

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        const response = await fetch(fullUrl, {
          credentials: 'include',
          cache: 'no-store',
          signal: controller.signal,
          ...fetchConfig,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          let errorMessage = response.statusText
          
          try {
            // Try to parse as JSON first (most API errors)
            const errorData = await response.json()
            errorMessage = errorData.error || errorData.message || errorData.details || response.statusText
          } catch {
            // If not JSON, try to get text
            try {
              errorMessage = await response.text() || response.statusText
            } catch {
              errorMessage = response.statusText
            }
          }
          
          // Don't retry on client errors (4xx)
          if (response.status >= 400 && response.status < 500 && attempt === 0) {
            throw new ApiError(errorMessage, response.status)
          }
          
          // Retry on server errors (5xx) or network issues
          if (attempt < retries && response.status >= 500) {
            await this.delay(retryDelay * Math.pow(2, attempt))
            continue
          }
          
          throw new ApiError(errorMessage, response.status)
        }

        // Handle empty responses
        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          return {} as T
        }

        return await response.json()
      } catch (error) {
        // On last attempt, throw the error
        if (attempt === retries) {
          if (error instanceof ApiError) {
            throw error
          }
          
          if (error instanceof Error) {
            if (error.name === 'AbortError') {
              throw new ApiError('Request timeout', 408, 'TIMEOUT')
            }
            throw new ApiError(error.message, undefined, 'NETWORK_ERROR')
          }
          
          throw new ApiError('Unknown error occurred', undefined, 'UNKNOWN_ERROR')
        }

        // Wait before retrying
        await this.delay(retryDelay * Math.pow(2, attempt))
      }
    }

    throw new ApiError('Maximum retries exceeded', undefined, 'MAX_RETRIES')
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Singleton instance
export const apiClient = new ApiClient()

// Convenience functions for common operations
export const apiGet = <T>(url: string, config?: RequestConfig) => apiClient.get<T>(url, config)
export const apiPost = <T>(url: string, data?: any, config?: RequestConfig) => apiClient.post<T>(url, data, config)
export const apiPut = <T>(url: string, data?: any, config?: RequestConfig) => apiClient.put<T>(url, data, config)
export const apiDelete = <T>(url: string, config?: RequestConfig) => apiClient.delete<T>(url, config)

// Type definitions for common API responses
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
  }
}

// Document-specific API functions
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

export interface VATExtraction {
  id: string
  extractedAmounts: number[]
  confidence: number
}

export interface VATData {
  totalSalesVAT: number
  totalPurchaseVAT: number
  totalNetVAT: number
  processedDocuments: number
  averageConfidence: number
  documentCount: number
  salesDocuments?: VATExtraction[]
  purchaseDocuments?: VATExtraction[]
}

// Utility function to build query strings
function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value))
    }
  })
  
  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}

// Document API functions
export const documentsApi = {
  getAll: (params?: { dashboard?: boolean; category?: string; page?: number; limit?: number }) => {
    const queryString = params ? buildQueryString(params) : ''
    return apiGet<ApiResponse<{ documents: Document[]; pagination?: any }>>(`/api/documents${queryString}`)
  },

  getById: (id: string) =>
    apiGet<ApiResponse<Document>>(`/api/documents/${id}`),

  delete: (id: string) =>
    apiDelete<ApiResponse<void>>(`/api/documents/${id}`),

  getExtractedVAT: (params?: { category?: string; vatReturnId?: string }) => {
    const queryString = params ? buildQueryString(params) : ''
    return apiGet<ApiResponse<{ extractedVAT: VATData }>>(`/api/documents/extracted-vat${queryString}`)
  },
}

// User API functions  
export interface UserProfile {
  id: string
  email: string
  businessName: string
  vatNumber: string
  firstName?: string
  lastName?: string
}

export const userApi = {
  getProfile: () =>
    apiGet<ApiResponse<{ user: UserProfile }>>('/api/auth/profile'),

  login: (email: string, password: string) =>
    apiPost<ApiResponse<{ user: UserProfile }>>('/api/auth/login', { email, password }),

  logout: () =>
    apiPost<ApiResponse<void>>('/api/auth/logout'),
}

// VAT API functions
export interface VATReturn {
  id: string
  periodStart: string
  periodEnd: string
  salesVAT: number
  purchaseVAT: number
  netVAT: number
  status: 'DRAFT' | 'SUBMITTED' | 'PAID'
}

export const vatApi = {
  getReturns: () =>
    apiGet<ApiResponse<{ vatReturns: VATReturn[] }>>('/api/vat'),

  getById: (id: string) =>
    apiGet<ApiResponse<{ vatReturn: VATReturn }>>(`/api/vat/${id}`),
}