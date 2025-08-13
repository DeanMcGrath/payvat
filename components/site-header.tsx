"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bell, Search, User, LogIn, LogOut, Menu, X } from 'lucide-react'

interface UserProfile {
  businessName: string
  vatNumber: string
}

interface SiteHeaderProps {
  searchPlaceholder?: string
  currentPage?: string
  pageSubtitle?: string
  user?: UserProfile | null
  onLogout?: () => void
}

export default function SiteHeader({ 
  searchPlaceholder = "Search...", 
  currentPage,
  pageSubtitle,
  user,
  onLogout
}: SiteHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleMobileSearch = () => {
    window.location.href = '/search'
  }
  return (
    <>
      {/* Skip Links for Accessibility */}
      <div className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 z-50">
        <a 
          href="#main-content" 
          className="bg-teal-600 text-white px-4 py-2 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-white"
        >
          Skip to main content
        </a>
        <a 
          href="#navigation" 
          className="bg-teal-600 text-white px-4 py-2 ml-2 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-white"
        >
          Skip to navigation
        </a>
      </div>

      <header className="gradient-primary relative overflow-hidden" role="banner">
        {/* Background Pattern */}
        <div className="absolute inset-0 gradient-mesh opacity-30" aria-hidden="true"></div>
      
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-thin text-white tracking-tight hover:text-white/90 transition-colors">
                PayVAT
              </Link>
            </div>
            
            {/* Header Actions */}
            <div className="flex items-center space-x-3">
              {/* Search - Tablet & Desktop */}
              <div className="hidden md:flex items-center space-x-3">
                <div className="relative">
                  <Input
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                    className="w-48 lg:w-56 xl:w-72 bg-white/10 text-white placeholder-white/70 border-white/20 backdrop-blur-sm focus:bg-white/15 focus:border-white/40 transition-all duration-200"
                    aria-label="Search PayVAT guides, tools, and VAT help"
                    autoComplete="off"
                    role="searchbox"
                  />
                  <Search 
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70 cursor-pointer hover:text-white transition-colors" 
                    onClick={handleSearch}
                    role="button"
                    aria-label="Submit search"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleSearch()
                      }
                    }}
                  />
                </div>
              </div>

              {/* User Profile - Desktop */}
              {user && (
                <div className="text-right hidden lg:block max-w-48">
                  <h3 className="text-sm font-bold text-white truncate">{user.businessName}</h3>
                  <p className="text-white/70 font-mono text-xs">VAT: {user.vatNumber}</p>
                </div>
              )}
              
              {/* Desktop Action Buttons */}
              <div className="hidden md:flex items-center space-x-2">
                {/* Notifications */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white hover:bg-white/10 glass-white/10 backdrop-blur-sm border-white/20 relative min-h-[44px] min-w-[44px]"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-yellow-400 rounded-full animate-pulse-gentle"></span>
                </Button>
                
                {/* Sign In Icon or Logout */}
                {user && onLogout ? (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/10 glass-white/10 backdrop-blur-sm border-white/20 min-h-[44px] min-w-[44px]"
                    onClick={onLogout}
                    title="Logout"
                    aria-label="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/10 glass-white/10 backdrop-blur-sm border-white/20 min-h-[44px] min-w-[44px]"
                    onClick={() => window.location.href = 'https://payvat.ie/login'}
                    aria-label="Login"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                )}
              </div>

              {/* Mobile Menu Button */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-white hover:bg-white/10 glass-white/10 backdrop-blur-sm border-white/20 min-h-[44px] min-w-[44px]"
                aria-label="Toggle mobile menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Modern Navigation */}
        <nav 
          className="border-t border-white/10 bg-white/5 backdrop-blur-sm" 
          role="navigation" 
          aria-label="Main navigation"
          id="navigation"
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-8">
                {currentPage && (
                  <span className="text-white/90 text-sm font-medium flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>{currentPage}</span>
                  </span>
                )}
                <div className="hidden md:flex items-center space-x-6 text-white/70 text-sm">
                  <button className="hover:text-white transition-colors" onClick={() => window.location.href = '/about'}>About</button>
                  <button className="hover:text-white transition-colors" onClick={() => window.location.href = '/contact'}>Contact</button>
                </div>
              </div>
              {pageSubtitle && (
                <div className="text-white/60 text-xs hidden sm:block">
                  {pageSubtitle}
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          
          {/* Mobile Menu */}
          <div className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-gradient-to-br from-teal-600 to-teal-700 shadow-2xl z-50 md:hidden animate-slide-in-right">
            <div className="p-6 space-y-6">
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/20">
                <div className="text-white font-bold text-lg">Menu</div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-white hover:bg-white/10 min-h-[44px] min-w-[44px]"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>

              {/* User Profile - Mobile */}
              {user && (
                <div className="pb-4 border-b border-white/20">
                  <h3 className="text-base font-bold text-white mb-1">{user.businessName}</h3>
                  <p className="text-white/70 font-mono text-sm">VAT: {user.vatNumber}</p>
                </div>
              )}

              {/* Mobile Search */}
              <div className="space-y-3">
                <div className="relative">
                  <Input
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                    className="w-full bg-white/10 text-white placeholder-white/70 border-white/20 backdrop-blur-sm focus:bg-white/15 focus:border-white/40"
                    aria-label="Search PayVAT guides, tools, and VAT help"
                    autoComplete="off"
                    role="searchbox"
                  />
                  <Search 
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70 cursor-pointer hover:text-white transition-colors" 
                    onClick={handleSearch}
                    role="button"
                    aria-label="Submit search"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleSearch()
                      }
                    }}
                  />
                </div>
              </div>

              {/* Mobile Navigation Links */}
              <nav className="space-y-1">
                <button 
                  className="w-full text-left px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors flex items-center space-x-3 min-h-[44px]"
                  onClick={() => {
                    window.location.href = '/about'
                    setIsMobileMenuOpen(false)
                  }}
                >
                  <span>About</span>
                </button>
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    window.location.href = '/contact'
                  }}
                  className="w-full block px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors min-h-[44px] flex items-center"
                >
                  <span>Contact</span>
                </button>
              </nav>

              {/* Mobile Action Buttons */}
              <div className="space-y-3 pt-4 border-t border-white/20">
                {/* Notifications */}
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-white hover:bg-white/10 min-h-[44px]"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5 mr-3" />
                  <span>Notifications</span>
                  <span className="ml-auto h-3 w-3 bg-yellow-400 rounded-full animate-pulse-gentle"></span>
                </Button>
                
                {/* Login/Logout */}
                {user && onLogout ? (
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-white hover:bg-white/10 min-h-[44px]"
                    onClick={() => {
                      onLogout()
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    <span>Logout</span>
                  </Button>
                ) : (
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-white hover:bg-white/10 min-h-[44px]"
                    onClick={() => {
                      window.location.href = 'https://payvat.ie/login'
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    <User className="h-5 w-5 mr-3" />
                    <span>Sign In</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </header>
    </>
  )
}