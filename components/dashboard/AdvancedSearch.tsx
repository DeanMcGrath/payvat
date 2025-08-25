"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Search,
  Filter,
  X,
  FileText,
  Calendar,
  Euro,
  Building,
  Tag,
  Download,
  Eye,
  SlidersHorizontal,
  Loader2,
  BookmarkPlus,
  BookmarkMinus,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { DateRange } from "react-day-picker"
import { formatCurrency } from "@/lib/vatUtils"
import { debounce } from 'lodash'

interface SearchFilters {
  query: string
  dateRange: DateRange | undefined
  categories: string[]
  validationStatus: string[]
  amountRange: {
    min: number | null
    max: number | null
  }
  vatAccuracyRange: {
    min: number | null
    max: number | null
  }
  complianceIssues: string[]
  isDuplicate: boolean | null
  year: number | null
  month: number | null
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

interface SearchResult {
  id: string
  fileName: string
  originalName: string
  category: string
  extractedDate?: Date
  invoiceTotal?: number
  vatAccuracy?: number
  validationStatus: string
  complianceIssues: string[]
  isDuplicate: boolean
  uploadedAt: Date
  processingQuality?: number
  relevanceScore?: number
}

interface SavedSearch {
  id: string
  name: string
  filters: SearchFilters
  createdAt: Date
  lastUsed: Date
}

interface AdvancedSearchProps {
  onResultSelect?: (result: SearchResult) => void
  className?: string
}

const DEFAULT_FILTERS: SearchFilters = {
  query: '',
  dateRange: undefined,
  categories: [],
  validationStatus: [],
  amountRange: { min: null, max: null },
  vatAccuracyRange: { min: null, max: null },
  complianceIssues: [],
  isDuplicate: null,
  year: null,
  month: null,
  sortBy: 'relevance',
  sortOrder: 'desc'
}

const CATEGORIES = [
  'SALES_INVOICE',
  'SALES_RECEIPT', 
  'SALES_REPORT',
  'PURCHASE_INVOICE',
  'PURCHASE_RECEIPT',
  'PURCHASE_REPORT',
  'BANK_STATEMENT',
  'OTHER'
]

const VALIDATION_STATUSES = [
  'PENDING',
  'COMPLIANT', 
  'NON_COMPLIANT',
  'NEEDS_REVIEW'
]

const COMPLIANCE_ISSUES = [
  'Missing or invalid invoice total',
  'Missing document date',
  'No VAT amounts detected',
  'Invalid VAT number format',
  'Missing supplier information'
]

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function AdvancedSearch({ onResultSelect, className }: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS)
  const [results, setResults] = useState<SearchResult[]>([])
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [totalResults, setTotalResults] = useState(0)
  const [searchTime, setSearchTime] = useState(0)
  const [savedSearchName, setSavedSearchName] = useState('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchFilters: SearchFilters) => {
      await performSearch(searchFilters)
    }, 300),
    []
  )

  useEffect(() => {
    if (filters.query || hasActiveFilters()) {
      debouncedSearch(filters)
    }
  }, [filters, debouncedSearch])

  useEffect(() => {
    loadSavedSearches()
  }, [])

  const hasActiveFilters = () => {
    return filters.categories.length > 0 ||
           filters.validationStatus.length > 0 ||
           filters.dateRange ||
           filters.amountRange.min !== null ||
           filters.amountRange.max !== null ||
           filters.vatAccuracyRange.min !== null ||
           filters.vatAccuracyRange.max !== null ||
           (filters.complianceIssues && filters.complianceIssues.length > 0) ||
           filters.isDuplicate !== null ||
           filters.year !== null ||
           filters.month !== null
  }

  const performSearch = async (searchFilters: SearchFilters) => {
    try {
      setLoading(true)
      const startTime = Date.now()
      
      const params = new URLSearchParams()
      
      if (searchFilters.query) params.set('query', searchFilters.query)
      if (searchFilters.dateRange?.from) params.set('dateFrom', searchFilters.dateRange.from.toISOString())
      if (searchFilters.dateRange?.to) params.set('dateTo', searchFilters.dateRange.to.toISOString())
      if (searchFilters.categories.length) params.set('categories', searchFilters.categories.join(','))
      if (searchFilters.validationStatus.length) params.set('validationStatus', searchFilters.validationStatus.join(','))
      if (searchFilters.amountRange.min !== null) params.set('minAmount', searchFilters.amountRange.min.toString())
      if (searchFilters.amountRange.max !== null) params.set('maxAmount', searchFilters.amountRange.max.toString())
      if (searchFilters.vatAccuracyRange.min !== null) params.set('minVATAccuracy', (searchFilters.vatAccuracyRange.min / 100).toString())
      if (searchFilters.vatAccuracyRange.max !== null) params.set('maxVATAccuracy', (searchFilters.vatAccuracyRange.max / 100).toString())
      if (searchFilters.complianceIssues && searchFilters.complianceIssues.length) params.set('complianceIssues', searchFilters.complianceIssues.join(','))
      if (searchFilters.isDuplicate !== null) params.set('isDuplicate', searchFilters.isDuplicate.toString())
      if (searchFilters.year !== null) params.set('year', searchFilters.year.toString())
      if (searchFilters.month !== null) params.set('month', searchFilters.month.toString())
      params.set('sortBy', searchFilters.sortBy)
      params.set('sortOrder', searchFilters.sortOrder)

      const response = await fetch(`/api/documents/search?${params}`, {
        method: 'GET',
        credentials: 'include'
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setResults(result.documents || [])
          setTotalResults(result.totalResults || 0)
          setSearchTime(Date.now() - startTime)
        } else {
          setResults([])
          setTotalResults(0)
        }
      } else {
        setResults([])
        setTotalResults(0)
      }
    } catch (error) {
      console.error('Search failed:', error)
      setResults([])
      setTotalResults(0)
    } finally {
      setLoading(false)
    }
  }

  const loadSavedSearches = async () => {
    try {
      const response = await fetch('/api/documents/saved-searches', {
        method: 'GET',
        credentials: 'include'
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setSavedSearches(result.savedSearches || [])
        }
      }
    } catch (error) {
      console.error('Failed to load saved searches:', error)
    }
  }

  const saveSearch = async () => {
    if (!savedSearchName.trim()) return

    try {
      const response = await fetch('/api/documents/saved-searches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: savedSearchName.trim(),
          filters
        })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          await loadSavedSearches()
          setSavedSearchName('')
          setShowSaveDialog(false)
        }
      }
    } catch (error) {
      console.error('Failed to save search:', error)
    }
  }

  const loadSavedSearch = (savedSearch: SavedSearch) => {
    setFilters(savedSearch.filters)
    setShowFilters(true)
  }

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS)
    setResults([])
    setTotalResults(0)
  }

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const toggleCategory = (category: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }))
  }

  const toggleValidationStatus = (status: string) => {
    setFilters(prev => ({
      ...prev,
      validationStatus: prev.validationStatus.includes(status)
        ? prev.validationStatus.filter(s => s !== status)
        : [...prev.validationStatus, status]
    }))
  }

  const toggleComplianceIssue = (issue: string) => {
    setFilters(prev => ({
      ...prev,
      complianceIssues: prev.complianceIssues.includes(issue)
        ? prev.complianceIssues.filter(i => i !== issue)
        : [...prev.complianceIssues, issue]
    }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLIANT': return 'bg-green-100 text-green-800'
      case 'NON_COMPLIANT': return 'bg-red-100 text-red-800'
      case 'NEEDS_REVIEW': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCategoryName = (category: string) => {
    return category.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Advanced Document Search
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-1" />
              Filters
              {showFilters ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
            </Button>
            {hasActiveFilters() && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Main Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents by name, content, or metadata..."
            value={filters.query}
            onChange={(e) => updateFilter('query', e.target.value)}
            className="pl-10 pr-4"
          />
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          {filters.categories.map(category => (
            <Badge key={category} variant="secondary" className="cursor-pointer" onClick={() => toggleCategory(category)}>
              {formatCategoryName(category)}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          {filters.validationStatus.map(status => (
            <Badge key={status} variant="secondary" className="cursor-pointer" onClick={() => toggleValidationStatus(status)}>
              {status.replace('_', ' ')}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          {filters.isDuplicate === true && (
            <Badge variant="destructive" className="cursor-pointer" onClick={() => updateFilter('isDuplicate', null)}>
              Duplicates Only
              <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
        </div>

        {/* Saved Searches */}
        {savedSearches.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Label className="text-xs text-muted-foreground">Saved Searches:</Label>
            {savedSearches.slice(0, 3).map(saved => (
              <Button
                key={saved.id}
                variant="outline"
                size="sm"
                onClick={() => loadSavedSearch(saved)}
                className="text-xs"
              >
                {saved.name}
              </Button>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
            {/* Date Range */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <DatePickerWithRange
                selected={filters.dateRange}
                onSelect={(range) => updateFilter('dateRange', range)}
              />
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <Label>Categories</Label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map(category => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={filters.categories.includes(category)}
                      onCheckedChange={() => toggleCategory(category)}
                    />
                    <Label htmlFor={`category-${category}`} className="text-xs">
                      {formatCategoryName(category)}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Validation Status */}
            <div className="space-y-2">
              <Label>Validation Status</Label>
              <div className="space-y-2">
                {VALIDATION_STATUSES.map(status => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status}`}
                      checked={filters.validationStatus.includes(status)}
                      onCheckedChange={() => toggleValidationStatus(status)}
                    />
                    <Label htmlFor={`status-${status}`} className="text-xs">
                      {status.replace('_', ' ')}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Amount Range */}
            <div className="space-y-2">
              <Label>Invoice Amount Range</Label>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  placeholder="Min €"
                  value={filters.amountRange.min || ''}
                  onChange={(e) => updateFilter('amountRange', {
                    ...filters.amountRange,
                    min: e.target.value ? parseFloat(e.target.value) : null
                  })}
                  className="text-xs"
                />
                <Input
                  type="number"
                  placeholder="Max €"
                  value={filters.amountRange.max || ''}
                  onChange={(e) => updateFilter('amountRange', {
                    ...filters.amountRange,
                    max: e.target.value ? parseFloat(e.target.value) : null
                  })}
                  className="text-xs"
                />
              </div>
            </div>

            {/* VAT Accuracy Range */}
            <div className="space-y-2">
              <Label>VAT Accuracy Range (%)</Label>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  placeholder="Min %"
                  min="0"
                  max="100"
                  value={filters.vatAccuracyRange.min || ''}
                  onChange={(e) => updateFilter('vatAccuracyRange', {
                    ...filters.vatAccuracyRange,
                    min: e.target.value ? parseFloat(e.target.value) : null
                  })}
                  className="text-xs"
                />
                <Input
                  type="number"
                  placeholder="Max %"
                  min="0"
                  max="100"
                  value={filters.vatAccuracyRange.max || ''}
                  onChange={(e) => updateFilter('vatAccuracyRange', {
                    ...filters.vatAccuracyRange,
                    max: e.target.value ? parseFloat(e.target.value) : null
                  })}
                  className="text-xs"
                />
              </div>
            </div>

            {/* Year/Month */}
            <div className="space-y-2">
              <Label>Period</Label>
              <div className="flex space-x-2">
                <Select value={filters.year?.toString() || ''} onValueChange={(value) => updateFilter('year', value ? parseInt(value) : null)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Year</SelectItem>
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filters.month?.toString() || ''} onValueChange={(value) => updateFilter('month', value ? parseInt(value) : null)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any Month</SelectItem>
                    {MONTHS.map((month, index) => (
                      <SelectItem key={index + 1} value={(index + 1).toString()}>{month}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Other Options */}
            <div className="space-y-2">
              <Label>Options</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="duplicates-only"
                    checked={filters.isDuplicate === true}
                    onCheckedChange={(checked) => updateFilter('isDuplicate', checked ? true : null)}
                  />
                  <Label htmlFor="duplicates-only" className="text-xs">Show duplicates only</Label>
                </div>
              </div>
            </div>

            {/* Sort Options */}
            <div className="space-y-2">
              <Label>Sort By</Label>
              <div className="flex space-x-2">
                <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="uploadedAt">Upload Date</SelectItem>
                    <SelectItem value="extractedDate">Document Date</SelectItem>
                    <SelectItem value="invoiceTotal">Amount</SelectItem>
                    <SelectItem value="vatAccuracy">VAT Accuracy</SelectItem>
                    <SelectItem value="fileName">File Name</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.sortOrder} onValueChange={(value) => updateFilter('sortOrder', value as 'asc' | 'desc')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Descending</SelectItem>
                    <SelectItem value="asc">Ascending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        <div className="space-y-4">
          {/* Results Header */}
          {(loading || results.length > 0 || filters.query || hasActiveFilters()) && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Searching...</span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    {totalResults} result{totalResults !== 1 ? 's' : ''} found in {searchTime}ms
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {(filters.query || hasActiveFilters()) && !loading && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSaveDialog(true)}
                  >
                    <BookmarkPlus className="h-3 w-3 mr-1" />
                    Save Search
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Results List */}
          {results.length > 0 && (
            <div className="space-y-3">
              {results.map(result => (
                <div
                  key={result.id}
                  className="flex items-center justify-between p-3 bg-card border rounded-lg hover:bg-accent cursor-pointer"
                  onClick={() => onResultSelect?.(result)}
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-sm font-normal">{result.originalName}</p>
                        {result.isDuplicate && (
                          <Badge variant="destructive" className="text-xs">Duplicate</Badge>
                        )}
                        <Badge className={`text-xs ${getStatusColor(result.validationStatus)}`}>
                          {result.validationStatus.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>{formatCategoryName(result.category)}</span>
                        {result.extractedDate && (
                          <>
                            <span>•</span>
                            <span>{result.extractedDate.toLocaleDateString()}</span>
                          </>
                        )}
                        {result.invoiceTotal && (
                          <>
                            <span>•</span>
                            <span>{formatCurrency(result.invoiceTotal)}</span>
                          </>
                        )}
                        {result.vatAccuracy && (
                          <>
                            <span>•</span>
                            <span>{(result.vatAccuracy * 100).toFixed(0)}% VAT accuracy</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation() }}>
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation() }}>
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {!loading && results.length === 0 && (filters.query || hasActiveFilters()) && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-normal">No documents found</p>
              <p className="text-sm">Try adjusting your search criteria</p>
            </div>
          )}

          {/* Initial State */}
          {!loading && results.length === 0 && !filters.query && !hasActiveFilters() && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-normal">Start searching your documents</p>
              <p className="text-sm">Enter a search term or use filters to find documents</p>
            </div>
          )}
        </div>

        {/* Save Search Dialog */}
        {showSaveDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-96">
              <CardHeader>
                <CardTitle>Save Search</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Search Name</Label>
                  <Input
                    placeholder="Enter a name for this search"
                    value={savedSearchName}
                    onChange={(e) => setSavedSearchName(e.target.value)}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={saveSearch} disabled={!savedSearchName.trim()}>
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setShowSaveDialog(false)
                    setSavedSearchName('')
                  }}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  )
}