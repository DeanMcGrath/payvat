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
  const MIN_INTERVAL = 2000 // 2 seconds between VAT data fetches

  // Load documents from API without automatic retries
  const loadDocuments = useCallback(async () => {
    const startTime = Date.now()
    try {
      setLoadingDocuments(true)
      setError(null) // Clear any previous errors
      
      
      const response = await documentsApi.getAll({ dashboard: true })
      
      const loadTime = Date.now() - startTime
      
      if (response.success && response.documents) {
        setDocuments(response.documents)
        
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
      
      setError(errorMessage)
      console.error('Failed to load documents:', {
        error: err,
        totalTime: Date.now() - startTime,
        errorType: err instanceof ApiError ? 'ApiError' : 'Unknown',
        status: err instanceof ApiError ? err.status : undefined,
        timestamp: new Date().toISOString()
      })
    } finally {
      setLoadingDocuments(false)
    }
  }, [])

  // Load VAT data from API without automatic retries
  const loadVATData = useCallback(async (force = false): Promise<void> => {
    const startTime = Date.now()
    const now = Date.now()
    
    // Rate limiting check
    if (!force && (now - lastFetchTime.current) < MIN_INTERVAL) {
      return
    }

    if (loadingVAT && !force) {
      return
    }

    try {
      setLoadingVAT(true)
      setError(null)
      lastFetchTime.current = now

      console.log('Loading VAT data', {
        force,
        timestamp: new Date().toISOString()
      })

      const response = await documentsApi.getExtractedVAT()
      
      const loadTime = Date.now() - startTime
      console.log('VAT data loaded successfully', {
        loadTime: `${loadTime}ms`,
        totalSalesVAT: response.extractedVAT?.totalSalesVAT || 0,
        totalPurchaseVAT: response.extractedVAT?.totalPurchaseVAT || 0,
        processedDocuments: response.extractedVAT?.processedDocuments || 0,
        fromFallback: response.fromFallback,
        timestamp: new Date().toISOString()
      })

      if (response.success && response.extractedVAT) {
        setVATData(response.extractedVAT)
      } else {
        console.warn('VAT data response failed:', response)
        // Don't throw for VAT data failures - just warn and continue
      }
    } catch (err) {
      console.warn('VAT data failed to load, continuing with documents only:', {
        error: err,
        totalTime: Date.now() - startTime,
        errorType: err instanceof ApiError ? 'ApiError' : 'Unknown',
        status: err instanceof ApiError ? err.status : undefined,
        timestamp: new Date().toISOString()
      })
      
      // CRITICAL FIX: Don't set error state for VAT failures
      // Dashboard should still work with documents even if VAT fails
      // setError() is removed - VAT failures are non-blocking
    } finally {
      setLoadingVAT(false)
    }
  }, [])

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
    // Fix category mapping - API returns specific categories, dashboard expects generic
    const salesDocuments = documents.filter(doc => 
      doc.category === 'SALES' || 
      doc.category === 'SALES_INVOICE' || 
      doc.category?.startsWith('SALES')
    )
    const purchaseDocuments = documents.filter(doc => 
      doc.category === 'PURCHASE' || 
      doc.category === 'PURCHASE_INVOICE' || 
      doc.category === 'PURCHASE_REPORT' || 
      doc.category === 'PURCHASE_RECEIPT' ||
      doc.category?.startsWith('PURCHASE')
    )
    const processedDocuments = documents.filter(doc => doc.isScanned).length

    return {
      salesDocuments,
      purchaseDocuments,
      totalDocuments: documents.length,
      processedDocuments,
    }
  }, [documents])

  // CRITICAL FIX: Load data in parallel, not sequential
  useEffect(() => {
    const loadParallel = async () => {
      console.log('Starting parallel data loading...', {
        timestamp: new Date().toISOString()
      })
      
      try {
        // Load both simultaneously - don't wait for one to finish
        await Promise.allSettled([
          loadDocuments(),
          loadVATData(true)
        ])
        console.log('Parallel loading completed')
      } catch (error) {
        console.error('Parallel loading failed:', error)
        // Individual API calls handle their own errors
      }
      
      // Force clear loading states after 30 seconds maximum
      setTimeout(() => {
        setLoadingDocuments(false)
        setLoadingVAT(false)
      }, 30000)
    }
    
    loadParallel()
  }, [])


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