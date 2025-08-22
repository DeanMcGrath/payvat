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
      
      const response = await documentsApi.getAll({ dashboard: true })
      
      if (response.success && response.data?.documents) {
        setDocuments(response.data.documents)
      } else {
        const errorMsg = response.error || response.message || 'Failed to load documents'
        throw new Error(errorMsg)
      }
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to load documents'
      setError(errorMessage)
      console.error('Failed to load documents:', err)
    } finally {
      setLoadingDocuments(false)
    }
  }, [])

  // Load VAT data from API
  const loadVATData = useCallback(async (force = false): Promise<void> => {
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

      const response = await documentsApi.getExtractedVAT()

      if (response.success && response.data?.extractedVAT) {
        setVATData(response.data.extractedVAT)
      } else {
        console.warn('VAT data response failed:', response)
        // Don't throw for VAT data failures - just warn and continue
      }
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to load VAT data'
      setError(errorMessage)
      console.error('Failed to load VAT data:', err)
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