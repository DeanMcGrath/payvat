"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Loader2 } from 'lucide-react'

interface SearchComponentProps {
  onSearch?: (query: string) => void
  className?: string
  inputClassName?: string
  buttonClassName?: string
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'desktop' | 'mobile' | 'full'
  isLoading?: boolean
  autoFocus?: boolean
  initialQuery?: string
}

export default function SearchComponent({
  onSearch,
  className = "",
  inputClassName = "",
  buttonClassName = "",
  placeholder = "Search",
  size = "md",
  variant = "desktop",
  isLoading = false,
  autoFocus = false,
  initialQuery = ""
}: SearchComponentProps) {
  const [query, setQuery] = useState(initialQuery)

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery)
    }
  }, [initialQuery])

  const handleSearch = () => {
    const trimmedQuery = query.trim()
    if (trimmedQuery && !isLoading) {
      if (onSearch) {
        onSearch(trimmedQuery)
      } else {
        // Default behavior: navigate to search page
        window.location.href = `/search?q=${encodeURIComponent(trimmedQuery)}`
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleMobileSearch = () => {
    if (!isLoading) {
      window.location.href = '/search'
    }
  }

  if (variant === 'mobile') {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        className={`text-white hover:bg-[#73C2FB] p-2 min-w-[44px] min-h-[44px] ${className}`}
        onClick={handleMobileSearch}
        title="Search"
      >
        <Search className="h-4 w-4" />
      </Button>
    )
  }

  if (variant === 'full') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className={`pl-10 ${inputClassName}`}
            autoFocus={autoFocus}
            disabled={isLoading}
          />
        </div>
        <Button 
          onClick={handleSearch}
          className={buttonClassName}
          disabled={!query.trim() || isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>
    )
  }

  // Default desktop variant
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Input
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={handleKeyPress}
        autoFocus={autoFocus}
        disabled={isLoading}
        className={`bg-white text-gray-900 border-0 ${
          size === 'sm' ? 'w-32' : 
          size === 'md' ? 'w-32 xl:w-48 2xl:w-64' : 
          'w-64'
        } ${inputClassName}`}
      />
      <Button 
        size={size === 'lg' ? 'default' : 'sm'}
        className={`bg-blue-700 hover:bg-blue-800 ${buttonClassName}`}
        onClick={handleSearch}
        disabled={!query.trim() || isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Search className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}