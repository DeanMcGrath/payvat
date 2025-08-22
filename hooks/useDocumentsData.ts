/**
 * Custom hook for managing documents and VAT data
 * Centralizes all document-related state and API calls
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { documentsApi, Document, VATData, VATExtraction, ApiError } from '@/lib/apiClient'
import { useDebouncedCallback } from './useDebouncedCallback'
import { logger } from '@/lib/logger'

interface UseDocumentsDataState {
  documents: Document[]
  vatData: VATData | null
  loadingDocuments: boolean
  loadingVAT: boolean
  error: string | null
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

  // Rate limiting
  const lastFetchTime = useRef(0)
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const MIN_INTERVAL = 2000 // 2 seconds between VAT data fetches

  // Load documents from API
  const loadDocuments = useCallback(async () => {
    try {
      setLoadingDocuments(true)
      setError(null)
      
      logger.info('Loading documents from API', {}, 'DOCUMENTS_HOOK')
      
      const response = await documentsApi.getAll({ dashboard: true })
      
      if (response.success && response.data?.documents) {
        setDocuments(response.data.documents)
        logger.info('Documents loaded successfully', { 
          count: response.data.documents.length 
        }, 'DOCUMENTS_HOOK')
      } else {
        const errorMsg = response.error || response.message || 'Failed to load documents'
        logger.error('Documents API returned error', { response }, 'DOCUMENTS_HOOK')
        throw new Error(errorMsg)
      }
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to load documents'
      setError(errorMessage)
      logger.error('Failed to load documents', err, 'DOCUMENTS_HOOK')
    } finally {
      setLoadingDocuments(false)
    }
  }, [])

  // Load VAT data from API
  const loadVATData = useCallback(async (force = false): Promise<void> => {
    const now = Date.now()
    
    // Rate limiting check
    if (!force && (now - lastFetchTime.current) < MIN_INTERVAL) {
      logger.debug('VAT data fetch skipped due to rate limiting', {}, 'DOCUMENTS_HOOK')
      return
    }

    if (loadingVAT && !force) {
      logger.debug('VAT data fetch already in progress', {}, 'DOCUMENTS_HOOK')
      return
    }

    try {
      setLoadingVAT(true)
      setError(null)
      lastFetchTime.current = now

      logger.info('Loading VAT data from API', {}, 'DOCUMENTS_HOOK')

      const response = await documentsApi.getExtractedVAT()

      if (response.success && response.data?.extractedVAT) {
        setVATData(response.data.extractedVAT)
        logger.info('VAT data loaded successfully', {
          totalSalesVAT: response.data.extractedVAT.totalSalesVAT,
          totalPurchaseVAT: response.data.extractedVAT.totalPurchaseVAT,
          processedDocuments: response.data.extractedVAT.processedDocuments
        }, 'DOCUMENTS_HOOK')
      } else {
        const errorMsg = response.error || response.message || 'Failed to load VAT data'
        logger.warn('VAT data response failed', { response, error: errorMsg }, 'DOCUMENTS_HOOK')
        // Don't throw for VAT data failures - just warn and continue
      }
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to load VAT data'
      setError(errorMessage)
      logger.error('Failed to load VAT data', err, 'DOCUMENTS_HOOK')
    } finally {
      setLoadingVAT(false)
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
      
      logger.info('Document removed successfully', { documentId: id }, 'DOCUMENTS_HOOK')
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to remove document'
      setError(errorMessage)
      logger.error('Failed to remove document', err, 'DOCUMENTS_HOOK')
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

  // Load initial data
  useEffect(() => {
    loadDocuments()
    loadVATData(true)
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