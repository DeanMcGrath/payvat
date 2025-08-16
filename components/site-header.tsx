"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Bell, User, LogOut, Menu, X, UserPlus } from 'lucide-react'

interface UserProfile {
  businessName: string
  vatNumber: string
}

interface SiteHeaderProps {
  currentPage?: string
  pageSubtitle?: string
  user?: UserProfile | null
  onLogout?: () => void
  hideNavLinks?: boolean
}

export default function SiteHeader({ 
  currentPage,
  pageSubtitle,
  user,
  onLogout,
  hideNavLinks
}: SiteHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Skip Links for Accessibility */}
      <div className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 z-50">
        <a 
          href="#main-content" 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-white"
        >
          Skip to main content
        </a>
        <a 
          href="#navigation" 
          className="bg-blue-600 text-white px-4 py-2 ml-2 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-white"
        >
          Skip to navigation
        </a>
      </div>

      <header className="gradient-primary relative overflow-hidden header-navigation" role="banner">
        {/* Background Pattern */}
        <div className="absolute inset-0 gradient-mesh opacity-30" aria-hidden="true"></div>
      
      <div className="relative z-[9999]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold font-mono text-white tracking-tight hover:text-white/90 transition-colors">
                Don't Be Like Me!
              </Link>
            </div>
            
            {/* Header Actions */}
            <div className="flex items-center space-x-3">

              {/* User Profile - Desktop */}
              {user && (
                <div className="text-right hidden lg:block max-w-48">
                  <h3 className="text-sm font-bold text-white truncate">{user.businessName}</h3>
                  <p className="text-white/70 font-mono text-xs">VAT: {user.vatNumber}</p>
                </div>
              )}
              
              {/* Desktop Navigation & Action Buttons */}
              <div className="hidden md:flex items-center space-x-6">
                {/* Navigation Links */}
                {!hideNavLinks && (
                  <>
                    <button 
                      className="text-white/90 hover:text-white transition-colors font-medium"
                      onClick={() => window.location.href = '/about'}
                    >
                      About
                    </button>
                    <button 
                      className="text-white/90 hover:text-white transition-colors font-medium"
                      onClick={() => window.location.href = '/contact'}
                    >
                      Contact
                    </button>
                  </>
                )}
                
                {!user && (
                  <>
                    {/* Sign Up Link */}
                    <button 
                      className="text-white/90 hover:text-white transition-colors font-medium"
                      onClick={() => window.location.href = '/signup'}
                    >
                      Sign Up
                    </button>
                    
                    {/* Sign In Icon */}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-white hover:bg-white/10 border border-white/20 backdrop-blur-sm min-h-[44px] min-w-[44px]"
                      onClick={() => window.location.href = '/login'}
                      aria-label="Sign In"
                    >
                      <User className="h-5 w-5" />
                    </Button>
                  </>
                )}
                
                {user && onLogout && (
                  <>
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
                    
                    {/* Logout */}
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
                  </>
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
          <div className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-gradient-to-br from-[#73C2FB] to-[#5BADEA] shadow-2xl z-50 md:hidden animate-slide-in-right">
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


              {/* Mobile Navigation Links */}
              <nav className="space-y-1">
                {!hideNavLinks && (
                  <>
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
                  </>
                )}
              </nav>

              {/* Mobile Action Buttons */}
              <div className="space-y-3 pt-4 border-t border-white/20">
                {!user && (
                  <>
                    {/* Sign Up */}
                    <Button 
                      className="w-full bg-white text-[#73C2FB] hover:bg-white/90 font-semibold min-h-[44px]"
                      onClick={() => {
                        window.location.href = '/signup'
                        setIsMobileMenuOpen(false)
                      }}
                    >
                      <UserPlus className="h-5 w-5 mr-3" />
                      <span>Sign Up</span>
                    </Button>
                    
                    {/* Sign In */}
                    <Button 
                      variant="ghost" 
                      className="w-full justify-center text-white hover:bg-white/10 border border-white/20 min-h-[44px]"
                      onClick={() => {
                        window.location.href = '/login'
                        setIsMobileMenuOpen(false)
                      }}
                      aria-label="Sign In"
                    >
                      <User className="h-5 w-5" />
                    </Button>
                  </>
                )}
                
                {user && onLogout && (
                  <>
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
                    
                    {/* Logout */}
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
                  </>
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