import { useState, useCallback } from 'react'
import { SearchClient, SearchResult, SearchResponse } from '@/lib/search'

interface UseSearchState {
  query: string
  results: SearchResult[]
  isLoading: boolean
  hasSearched: boolean
  totalResults: number
  searchTime: number
  error: string | null
}

interface UseSearchReturn extends UseSearchState {
  setQuery: (query: string) => void
  search: (searchQuery?: string, type?: string) => Promise<void>
  clearResults: () => void
  navigateToResult: (result: SearchResult) => void
}

export function useSearch(initialQuery: string = ''): UseSearchReturn {
  const [state, setState] = useState<UseSearchState>({
    query: initialQuery,
    results: [],
    isLoading: false,
    hasSearched: false,
    totalResults: 0,
    searchTime: 0,
    error: null
  })

  const setQuery = useCallback((query: string) => {
    setState(prev => ({ ...prev, query }))
  }, [])

  const search = useCallback(async (searchQuery?: string, type: string = 'all') => {
    const queryToSearch = searchQuery || state.query

    if (!queryToSearch.trim()) {
      return
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const searchClient = SearchClient.getInstance()
      const response: SearchResponse = await searchClient.search(queryToSearch, type)

      setState(prev => ({
        ...prev,
        results: response.results,
        totalResults: response.totalResults,
        searchTime: response.searchTime,
        hasSearched: true,
        isLoading: false,
        error: response.success ? null : response.error || 'Search failed'
      }))
    } catch (error) {
      console.error('Search hook error:', error)
      setState(prev => ({
        ...prev,
        results: [],
        totalResults: 0,
        searchTime: 0,
        hasSearched: true,
        isLoading: false,
        error: 'Network error occurred'
      }))
    }
  }, [state.query])

  const clearResults = useCallback(() => {
    setState(prev => ({
      ...prev,
      results: [],
      hasSearched: false,
      totalResults: 0,
      searchTime: 0,
      error: null
    }))
  }, [])

  const navigateToResult = useCallback((result: SearchResult) => {
    window.location.href = result.url
  }, [])

  return {
    ...state,
    setQuery,
    search,
    clearResults,
    navigateToResult
  }
}