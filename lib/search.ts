// Search utilities and hooks

export interface SearchResult {
  id: string
  title: string
  excerpt: string
  url: string
  type: 'page' | 'help' | 'guide'
  relevance: number
  category: string
}

export interface SearchResponse {
  success: boolean
  results: SearchResult[]
  totalResults: number
  searchTime: number
  query: string
  error?: string
}

// Search API client
export class SearchClient {
  private static instance: SearchClient
  private cache = new Map<string, { data: SearchResponse; timestamp: number }>()
  private cacheTimeout = 5 * 60 * 1000 // 5 minutes

  static getInstance(): SearchClient {
    if (!SearchClient.instance) {
      SearchClient.instance = new SearchClient()
    }
    return SearchClient.instance
  }

  async search(query: string, type: string = 'all'): Promise<SearchResponse> {
    if (!query.trim()) {
      return {
        success: true,
        results: [],
        totalResults: 0,
        searchTime: 0,
        query: query.trim()
      }
    }

    const cacheKey = `${query.trim()}-${type}`
    const cached = this.cache.get(cacheKey)

    // Return cached result if valid
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}&type=${encodeURIComponent(type)}`)
      const data: SearchResponse = await response.json()

      // Cache the result
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      })

      // Clean old cache entries
      this.cleanCache()

      return data
    } catch (error) {
      console.error('Search client error:', error)
      return {
        success: false,
        error: 'Network error',
        results: [],
        totalResults: 0,
        searchTime: 0,
        query: query.trim()
      }
    }
  }

  private cleanCache() {
    const now = Date.now()
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.cache.delete(key)
      }
    }
  }

  clearCache() {
    this.cache.clear()
  }
}

// Search utility functions
export function highlightSearchTerms(text: string, searchTerms: string[]): string {
  if (!searchTerms.length) return text

  let result = text
  for (const term of searchTerms) {
    const regex = new RegExp(`(${term})`, 'gi')
    result = result.replace(regex, '<mark>$1</mark>')
  }
  return result
}

export function extractSearchTerms(query: string): string[] {
  return query
    .toLowerCase()
    .split(' ')
    .map(term => term.trim())
    .filter(term => term.length > 1)
}

export function navigateToSearchResults(query: string, currentPath: string = '') {
  const searchUrl = `/search?q=${encodeURIComponent(query.trim())}`
  
  // Avoid navigation if already on search page with same query
  if (currentPath.startsWith('/search') && currentPath.includes(query)) {
    return
  }

  window.location.href = searchUrl
}

// Common search suggestions
export const SEARCH_SUGGESTIONS = [
  'VAT registration',
  'VAT rates Ireland', 
  'VAT returns',
  'VAT calculator',
  'VAT payments',
  'Revenue Online Service',
  'VAT compliance',
  'Business VAT',
  'VAT deadlines',
  'VAT reports'
]

// Search categories for filtering
export const SEARCH_CATEGORIES = [
  { value: 'all', label: 'All Results' },
  { value: 'guide', label: 'Guides' },
  { value: 'page', label: 'Pages' },
  { value: 'help', label: 'Help & Support' }
]