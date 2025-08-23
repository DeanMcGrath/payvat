/**
 * Custom hook for managing documents and VAT data
 * Centralizes all document-related state and API calls
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { documentsApi, Document, VATData, ApiError } from '@/lib/apiClient'
import { useDebouncedCallback } from './useDebouncedCallback'

interface VATExtraction {
  id: string
  extractedAmounts: number[]
  confidence: number
}

interface UseDocumentsDataState {
  documents: Document[]
  vatData: VATData | null
  loadingDocuments: boolean
  loadingVAT: boolean
  error: string | null
  inFallbackMode: boolean
  fallbackMessage: string | null
}

interface UseDocumentsDataActions {
  loadDocuments: () => Promise<void>
  loadVATData: (force?: boolean) => Promise<void>
  refreshData: () => Promise<void>
  debouncedRefreshVAT: (delay?: number, callback?: () => void) => void
  removeDocument: (id: string) => Promise<void>
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>
}

interface UseDocumentsDataMaps {
  salesMap: Map<string, VATExtraction>
  purchaseMap: Map<string, VATExtraction>
}

interface UseDocumentsDataReturn {
  state: UseDocumentsDataState
  actions: UseDocumentsDataActions
  maps: UseDocumentsDataMaps
  computed: {
    salesDocuments: Document[]
    purchaseDocuments: Document[]
    totalDocuments: number
    processedDocuments: number
  }
}

export function useDocumentsData(): UseDocumentsDataReturn {
  // State
  const [documents, setDocuments] = useState<Document[]>([])
  const [vatData, setVATData] = useState<VATData | null>(null)
  const [loadingDocuments, setLoadingDocuments] = useState(false)
  const [loadingVAT, setLoadingVAT] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inFallbackMode, setInFallbackMode] = useState(false)
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null)

  // Rate limiting and retry logic
  const lastFetchTime = useRef(0)
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const retryCountRef = useRef(0)
  const MIN_INTERVAL = 3000 // 3 seconds between VAT data fetches (reduced for better UX)
  const MAX_RETRIES = 1 // Reduced to 1 to prevent retry storms

  // Load documents from API with retry logic
  const loadDocuments = useCallback(async (retryCount = 0) => {
    const startTime = Date.now()
    try {
      setLoadingDocuments(true)
      if (retryCount === 0) setError(null) // Only clear error on first attempt
      
      console.log(`Loading documents (attempt ${retryCount + 1}/${MAX_RETRIES + 1})`, {
        timestamp: new Date().toISOString()
      })
      
      const response = await documentsApi.getAll({ dashboard: true })
      
      const loadTime = Date.now() - startTime
      console.log('Documents loaded successfully', {
        loadTime: `${loadTime}ms`,
        documentCount: response.data?.documents?.length || 0,
        fromFallback: response.fromFallback,
        timestamp: new Date().toISOString()
      })
      
      if (response.success && response.data?.documents) {
        setDocuments(response.data.documents)
        retryCountRef.current = 0 // Reset retry count on success
        
        // Check if in fallback mode
        if (response.fromFallback) {
          setInFallbackMode(true)
          setFallbackMessage(response.message || 'Service temporarily unavailable - showing cached data')
        } else {
          setInFallbackMode(false)
          setFallbackMessage(null)
        }
      } else {
        const errorMsg = response.error || response.message || 'Failed to load documents'
        throw new Error(errorMsg)
      }
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to load documents'
      const isRateLimited = err instanceof ApiError && err.status === 429
      const isServerError = err instanceof ApiError && (err.status === 500 || err.status === 503)
      
      // Implement simple retry with fixed delay to prevent retry storms
      if (retryCount < MAX_RETRIES && (isRateLimited || isServerError)) {
        const delay = 5000 // Fixed 5s delay instead of exponential backoff
        console.log(`Retrying documents load in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`)
        
        setTimeout(() => {
          loadDocuments(retryCount + 1)
        }, delay)
        return
      }
      
      retryCountRef.current = retryCount
      setError(errorMessage)
      console.error('Failed to load documents:', {
        error: err,
        attempt: retryCount + 1,
        totalTime: Date.now() - startTime,
        errorType: err instanceof ApiError ? 'ApiError' : 'Unknown',
        status: err instanceof ApiError ? err.status : undefined,
        timestamp: new Date().toISOString()
      })
    } finally {
      if (retryCount === 0) setLoadingDocuments(false) // Only update loading on first attempt
    }
  }, [])

  // Load VAT data from API with retry logic
  const loadVATData = useCallback(async (force = false, retryCount = 0): Promise<void> => {
    const startTime = Date.now()
    const now = Date.now()
    
    // Rate limiting check
    if (!force && (now - lastFetchTime.current) < MIN_INTERVAL) {
      console.log('VAT data load skipped due to rate limiting', {
        timeSinceLastFetch: now - lastFetchTime.current,
        minInterval: MIN_INTERVAL
      })
      return
    }

    if (loadingVAT && !force && retryCount === 0) {
      console.log('VAT data load skipped - already loading')
      return
    }

    try {
      if (retryCount === 0) {
        setLoadingVAT(true)
        setError(null)
      }
      lastFetchTime.current = now

      console.log(`Loading VAT data (attempt ${retryCount + 1}/${MAX_RETRIES + 1})`, {
        force,
        timestamp: new Date().toISOString()
      })

      const response = await documentsApi.getExtractedVAT()
      
      const loadTime = Date.now() - startTime
      console.log('VAT data loaded successfully', {
        loadTime: `${loadTime}ms`,
        totalSalesVAT: response.data?.extractedVAT?.totalSalesVAT || 0,
        totalPurchaseVAT: response.data?.extractedVAT?.totalPurchaseVAT || 0,
        processedDocuments: response.data?.extractedVAT?.processedDocuments || 0,
        fromFallback: response.fromFallback,
        timestamp: new Date().toISOString()
      })

      if (response.success && response.data?.extractedVAT) {
        setVATData(response.data.extractedVAT)
        retryCountRef.current = 0 // Reset retry count on success
      } else {
        console.warn('VAT data response failed:', response)
        // Don't throw for VAT data failures - just warn and continue
      }
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to load VAT data'
      const isRateLimited = err instanceof ApiError && err.status === 429
      const isServerError = err instanceof ApiError && (err.status === 500 || err.status === 503)
      
      // Implement simple retry with fixed delay to prevent retry storms
      if (retryCount < MAX_RETRIES && (isRateLimited || isServerError)) {
        const delay = 8000 // Fixed 8s delay for VAT data (longer than documents)
        console.log(`Retrying VAT data load in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`)
        
        setTimeout(() => {
          loadVATData(true, retryCount + 1)
        }, delay)
        return
      }
      
      retryCountRef.current = retryCount
      setError(errorMessage)
      console.error('Failed to load VAT data:', {
        error: err,
        attempt: retryCount + 1,
        totalTime: Date.now() - startTime,
        errorType: err instanceof ApiError ? 'ApiError' : 'Unknown',
        status: err instanceof ApiError ? err.status : undefined,
        timestamp: new Date().toISOString()
      })
    } finally {
      if (retryCount === 0) setLoadingVAT(false) // Only update loading on first attempt
    }
  }, [loadingVAT])

  // Refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([
      loadDocuments(),
      loadVATData(true)
    ])
  }, [loadDocuments, loadVATData])

  // Debounced VAT data refresh
  const debouncedRefreshVAT = useCallback((delay = 3000, callback?: () => void) => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current)
    }

    fetchTimeoutRef.current = setTimeout(async () => {
      await loadVATData(true)
      callback?.()
    }, delay)
  }, [loadVATData])

  // Remove document
  const removeDocument = useCallback(async (id: string) => {
    try {
      setError(null)
      
      await documentsApi.delete(id)
      
      // Remove from local state
      setDocuments(prev => prev.filter(doc => doc.id !== id))
      
      // Refresh VAT data after removal
      debouncedRefreshVAT(1000)
      
      console.log('Document removed successfully:', id)
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to remove document'
      setError(errorMessage)
      console.error('Failed to remove document:', err)
      throw err // Re-throw so the caller can handle it
    }
  }, [debouncedRefreshVAT])

  // Memoized maps for O(1) VAT data lookup
  const salesMap = useMemo(() => {
    const map = new Map<string, VATExtraction>()
    vatData?.salesDocuments?.forEach(doc => {
      map.set(doc.id, doc)
    })
    return map
  }, [vatData?.salesDocuments])

  const purchaseMap = useMemo(() => {
    const map = new Map<string, VATExtraction>()
    vatData?.purchaseDocuments?.forEach(doc => {
      map.set(doc.id, doc)
    })
    return map
  }, [vatData?.purchaseDocuments])

  // Computed values
  const computed = useMemo(() => {
    const salesDocuments = documents.filter(doc => doc.category === 'SALES')
    const purchaseDocuments = documents.filter(doc => doc.category === 'PURCHASE')
    const processedDocuments = documents.filter(doc => doc.isScanned).length

    return {
      salesDocuments,
      purchaseDocuments,
      totalDocuments: documents.length,
      processedDocuments,
    }
  }, [documents])

  // Load initial data with staggered timing to prevent thundering herd
  useEffect(() => {
    // Sequential loading to prevent rate limit exhaustion
    const loadSequentially = async () => {
      try {
        await loadDocuments()
        // Fixed 2 second delay between requests
        await new Promise(resolve => setTimeout(resolve, 2000))
        await loadVATData(true)
      } catch (error) {
        console.error('Sequential loading failed:', error)
      }
    }
    
    loadSequentially()
  }, [loadDocuments, loadVATData])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current)
      }
    }
  }, [])

  return {
    state: {
      documents,
      vatData,
      loadingDocuments,
      loadingVAT,
      error,
      inFallbackMode,
      fallbackMessage,
    },
    actions: {
      loadDocuments,
      loadVATData,
      refreshData,
      debouncedRefreshVAT,
      removeDocument,
      setDocuments,
    },
    maps: {
      salesMap,
      purchaseMap,
    },
    computed,
  }
}