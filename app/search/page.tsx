"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Bell, Settings, LogOut, Search, ArrowRight, Clock, FileText, BookOpen, Calculator, Building, Users, HelpCircle, Loader2, AlertCircle as AlertCircleIcon } from 'lucide-react'
import Footer from "@/components/footer"

interface SearchResult {
  id: string
  title: string
  excerpt: string
  url: string
  type: 'page' | 'help' | 'guide'
  relevance: number
  category: string
}

interface UserProfile {
  id: string
  email: string
  businessName: string
  vatNumber: string
  firstName?: string
  lastName?: string
}

function SearchPageContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalResults, setTotalResults] = useState(0)
  const [searchTime, setSearchTime] = useState(0)
  const [hasSearched, setHasSearched] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [userLoading, setUserLoading] = useState(true)
  const [userError, setUserError] = useState<string | null>(null)

  const handleSearch = useCallback(async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    setHasSearched(true)

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`)
      const data = await response.json()

      if (data.success) {
        setResults(data.results)
        setTotalResults(data.totalResults)
        setSearchTime(data.searchTime)
      } else {
        setResults([])
        setTotalResults(0)
        setSearchTime(0)
      }
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
      setTotalResults(0)
      setSearchTime(0)
    } finally {
      setIsLoading(false)
    }
  }, [query])

  useEffect(() => {
    fetchUserProfile()
  }, [])

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery)
    }
  }, [initialQuery, handleSearch])
  
  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'GET',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.user) {
          setUser(data.user)
        } else {
          setUserError('Failed to load user profile')
        }
      } else if (response.status === 401) {
        // User not logged in - this is fine for public pages
        setUser(null)
      } else {
        setUserError('Failed to fetch user profile')
      }
    } catch (err) {
      setUserError('Network error occurred')
    } finally {
      setUserLoading(false)
    }
  }
  
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      window.location.href = '/login'
    } catch (err) {
      window.location.href = '/login'
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'vat registration':
      case 'vat guide':
        return <BookOpen className="h-4 w-4" />
      case 'dashboard':
        return <Building className="h-4 w-4" />
      case 'vat returns':
        return <FileText className="h-4 w-4" />
      case 'payments':
        return <Calculator className="h-4 w-4" />
      case 'reports':
        return <FileText className="h-4 w-4" />
      case 'calculator':
        return <Calculator className="h-4 w-4" />
      case 'help & support':
        return <HelpCircle className="h-4 w-4" />
      case 'account':
        return <Users className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'guide':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'page':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'help':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-[#5BADEA] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-thin">PayVAT</h1>
            
            <div className="flex items-center space-x-2 sm:space-x-6">
              <div className="hidden lg:flex items-center space-x-2">
                <Input
                  placeholder="Search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-32 xl:w-48 2xl:w-64 bg-white text-gray-900 border-0"
                />
                <Button 
                  size="sm" 
                  className="bg-blue-700 hover:bg-blue-800"
                  onClick={() => handleSearch()}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              
              {user && (
                <div className="text-right hidden sm:block max-w-48 lg:max-w-none">
                  <h3 className="text-sm lg:text-base font-bold text-white truncate">{user.businessName}</h3>
                  <p className="text-blue-100 font-mono text-xs">VAT: {user.vatNumber}</p>
                </div>
              )}
              
              <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
                <Button variant="ghost" size="sm" className="text-white hover:bg-[#73C2FB] lg:hidden p-2 min-w-[44px] min-h-[44px]">
                  <Search className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-white hover:bg-[#73C2FB] p-2 min-w-[44px] min-h-[44px]">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-white hover:bg-[#73C2FB] hidden sm:flex p-2 min-w-[44px] min-h-[44px]">
                  <Settings className="h-4 w-4" />
                </Button>
                {user && (
                  <Button variant="ghost" size="sm" className="text-white hover:bg-[#73C2FB] p-2 min-w-[44px] min-h-[44px]" onClick={handleLogout} title="Logout">
                    <LogOut className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="bg-[#73C2FB] px-4 sm:px-6 py-3">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-white">Search Results</span>
                {query && (
                  <span className="text-blue-100">for &quot;{query}&quot;</span>
                )}
              </div>
              {user && (
                <div className="sm:hidden text-right max-w-40">
                  <p className="text-xs text-blue-100 font-mono truncate">{user.businessName}</p>
                  <p className="text-xs text-blue-200 font-mono">{user.vatNumber}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Search Box */}
        <div className="mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="Search PayVAT documentation, guides, and help..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="pl-10 pr-4 py-3 text-lg"
                      autoFocus
                    />
                  </div>
                </div>
                <Button 
                  onClick={() => handleSearch()}
                  className="bg-[#73C2FB] hover:bg-[#5BADEA] px-6 py-3"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Search className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Results */}
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#73C2FB] mx-auto mb-4" />
            <p className="text-gray-600">Searching...</p>
          </div>
        ) : hasSearched ? (
          <>
            {/* Results Summary */}
            {totalResults > 0 && (
              <div className="mb-6 flex items-center justify-between">
                <p className="text-gray-600">
                  Found <strong>{totalResults}</strong> result{totalResults !== 1 ? 's' : ''} for &quot;<strong>{query}</strong>&quot;
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  {searchTime}ms
                </div>
              </div>
            )}

            {/* Results List */}
            {totalResults > 0 ? (
              <div className="space-y-4">
                {results.map((result) => (
                  <Card key={result.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = result.url}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(result.category)}
                          <Badge className={getTypeColor(result.type)} variant="outline">
                            {result.type === 'guide' ? 'Guide' : result.type === 'help' ? 'Help' : 'Page'}
                          </Badge>
                          <span className="text-sm text-gray-500">{result.category}</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </div>
                      
                      <h3 className="text-lg font-semibold text-[#5BADEA] hover:text-[#5BADEA] mb-2">
                        {result.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {result.excerpt}
                      </p>
                      
                      <div className="mt-3 flex items-center text-xs text-gray-500">
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          {result.url}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              /* No Results */
              <div className="text-center py-12">
                <AlertCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600 mb-6">We couldn&apos;t find anything matching &quot;{query}&quot;</p>
                
                <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
                  <h4 className="font-semibold text-gray-900 mb-3">Try searching for:</h4>
                  <div className="flex flex-wrap gap-2">
                    {['VAT registration', 'VAT returns', 'Payments', 'Reports', 'Calculator', 'Help'].map((suggestion) => (
                      <Button
                        key={suggestion}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setQuery(suggestion)
                          handleSearch(suggestion)
                        }}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Welcome State */
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-[#73C2FB] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Search PayVAT</h2>
            <p className="text-gray-600 mb-8">Find guides, documentation, and help for managing your VAT in Ireland</p>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6 text-center">
                  <BookOpen className="h-8 w-8 text-[#73C2FB] mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">VAT Guides</h3>
                  <p className="text-gray-600 text-sm mb-4">Learn about VAT registration, rates, and compliance in Ireland</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setQuery('VAT guide')
                      handleSearch('VAT guide')
                    }}
                  >
                    Search Guides
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6 text-center">
                  <Calculator className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">VAT Tools</h3>
                  <p className="text-gray-600 text-sm mb-4">Use our calculator and submission tools for VAT management</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setQuery('calculator')
                      handleSearch('calculator')
                    }}
                  >
                    Search Tools
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6 text-center">
                  <HelpCircle className="h-8 w-8 text-[#73C2FB] mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Help & Support</h3>
                  <p className="text-gray-600 text-sm mb-4">Get answers to common questions and troubleshooting help</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setQuery('help')
                      handleSearch('help')
                    }}
                  >
                    Search Help
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Live Chat */}

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#73C2FB] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading search...</p>
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  )
}