"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bell, Search, User, LogIn, LogOut } from 'lucide-react'

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
  return (
    <header className="gradient-primary relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 gradient-mesh opacity-30"></div>
      
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
            <div className="flex items-center space-x-4">
              {/* Search - Desktop */}
              <div className="hidden lg:flex items-center space-x-3">
                <div className="relative">
                  <Input
                    placeholder={searchPlaceholder}
                    className="w-64 xl:w-80 bg-white/10 text-white placeholder-white/70 border-white/20 backdrop-blur-sm focus:bg-white/15 focus:border-white/40"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70" />
                </div>
              </div>

              {/* User Profile - if logged in */}
              {user && (
                <div className="text-right hidden sm:block max-w-48 lg:max-w-none">
                  <h3 className="text-sm lg:text-base font-bold text-white truncate">{user.businessName}</h3>
                  <p className="text-white/70 font-mono text-xs">VAT: {user.vatNumber}</p>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                {/* Mobile Search */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white hover:bg-white/10 lg:hidden glass-white/10 backdrop-blur-sm border-white/20"
                >
                  <Search className="h-5 w-5" />
                </Button>
                
                {/* Notifications */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white hover:bg-white/10 glass-white/10 backdrop-blur-sm border-white/20 relative"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-warning rounded-full animate-pulse-gentle"></span>
                </Button>
                
                {/* Sign In Icon or Logout */}
                {user && onLogout ? (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/10 glass-white/10 backdrop-blur-sm border-white/20"
                    onClick={onLogout}
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/10 glass-white/10 backdrop-blur-sm border-white/20"
                    onClick={() => window.location.href = 'https://payvat.ie/login'}
                  >
                    <User className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Modern Navigation */}
        <nav className="border-t border-white/10 bg-white/5 backdrop-blur-sm">
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
                  <button className="hover:text-white transition-colors" onClick={() => window.location.href = '/pricing'}>Pricing</button>
                  <button className="hover:text-white transition-colors" onClick={() => window.location.href = '/vat-guide'}>VAT Guide</button>
                  <Button 
                    className="btn-primary px-4 py-2 text-sm font-semibold hover-lift"
                    onClick={() => window.location.href = 'https://payvat.ie/signup'}
                  >
                    Get Started
                  </Button>
                  <button className="hover:text-white transition-colors" onClick={() => window.location.href = '/vat-registration'}>Get VAT Number</button>
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
    </header>
  )
}