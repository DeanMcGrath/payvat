"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { useIsMobile } from "@/components/ui/use-mobile"
import { cn } from "@/lib/utils"
import { 
  User, 
  FileCheck, 
  FileText, 
  Calculator, 
  CreditCard, 
  Calendar, 
  XCircle, 
  DollarSign,
  Home,
  LogOut,
  Menu,
  X,
  ChevronDown
} from "lucide-react"

interface UserProfile {
  id: string
  email: string
  businessName: string
  vatNumber: string
  firstName?: string
  lastName?: string
}

interface TopNavigationProps {
  user: UserProfile | null
  onLogout: () => void
  onHome: () => void
}

const navigationItems = [
  {
    title: "Account",
    href: "/dashboard/account",
    icon: User,
    description: "Profile, billing, and messages"
  },
  {
    title: "Registration",
    href: "/dashboard/registration", 
    icon: FileCheck,
    description: "Company & VAT registration status"
  },
  {
    title: "Documents",
    href: "/dashboard/documents",
    icon: FileText,
    description: "Sales and purchase documents"
  },
  {
    title: "VAT Returns",
    href: "/dashboard/vat-returns",
    icon: Calculator,
    description: "Past returns and upcoming submissions"
  },
  {
    title: "Financial Payments",
    href: "/dashboard/payments",
    icon: CreditCard,
    description: "Bank statements and transactions"
  },
  {
    title: "Annual Returns",
    href: "/dashboard/annual-returns",
    icon: Calendar,
    description: "End of year filings"
  },
  {
    title: "Terminate Business",
    href: "/dashboard/terminate",
    icon: XCircle,
    description: "Request closure assistance"
  },
  {
    title: "Sell Business",
    href: "/dashboard/sell",
    icon: DollarSign,
    description: "Request sale guidance"
  }
]

export function TopNavigation({ user, onLogout, onHome }: TopNavigationProps) {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Split navigation items for desktop - main items and overflow items
  const mainNavItems = navigationItems.slice(0, 5) // First 5 items
  const overflowNavItems = navigationItems.slice(5) // Remaining items

  const NavigationLink = ({ item, onClick }: { item: typeof navigationItems[0], onClick?: () => void }) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
    
    return (
      <Link 
        href={item.href} 
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-normal transition-colors",
          "hover:bg-neutral-100 hover:text-neutral-900",
          isActive 
            ? "bg-brand-50 text-petrol-dark font-normal" 
            : "text-neutral-600"
        )}
        onClick={onClick}
      >
        <item.icon className="h-4 w-4" />
        <span>{item.title}</span>
      </Link>
    )
  }

  if (isMobile) {
    return (
      <>
        {/* Mobile Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-petrol-dark">
                <span className="text-sm font-normal text-white">PV</span>
              </div>
              <span className="font-normal text-petrol-dark payvat-brand">PayVAT</span>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Mobile Menu Overlay */}
          {mobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 bg-white border-b border-neutral-200 shadow-lg">
              <div className="px-4 py-2 max-h-[calc(100vh-4rem)] overflow-y-auto">
                {/* Navigation Items */}
                <div className="space-y-1 pb-4 border-b border-neutral-100">
                  {navigationItems.map((item) => (
                    <div key={item.href}>
                      <NavigationLink 
                        item={item} 
                        onClick={() => setMobileMenuOpen(false)} 
                      />
                    </div>
                  ))}
                </div>

                {/* User Info and Actions */}
                {user && (
                  <div className="pt-4">
                    <div className="pb-3 border-b border-neutral-100">
                      <div className="text-sm font-normal text-neutral-900">
                        {user.firstName && user.lastName 
                          ? `${user.firstName} ${user.lastName}` 
                          : user.businessName}
                      </div>
                      <div className="text-xs text-neutral-500">{user.email}</div>
                    </div>
                    
                    <div className="flex gap-2 pt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          onHome()
                          setMobileMenuOpen(false)
                        }}
                        className="flex-1 justify-start"
                      >
                        <Home className="h-4 w-4 mr-2" />
                        Home
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          onLogout()
                          setMobileMenuOpen(false)
                        }}
                        className="flex-1 justify-start"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </nav>

        {/* Mobile Menu Backdrop */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </>
    )
  }

  // Desktop Navigation
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-200 shadow-sm">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-petrol-dark">
              <span className="text-sm font-normal text-white">PV</span>
            </div>
            <div className="flex flex-col">
              <span className="font-normal text-petrol-dark text-sm payvat-brand">PayVAT</span>
              <span className="text-xs text-neutral-500">Business Dashboard</span>
            </div>
          </div>

          {/* Main Navigation */}
          <NavigationMenu>
            <NavigationMenuList className="gap-1">
              {/* Main Navigation Items */}
              {mainNavItems.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <NavigationLink item={item} />
                </NavigationMenuItem>
              ))}

              {/* More Menu for Overflow Items */}
              {overflowNavItems.length > 0 && (
                <NavigationMenuItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex items-center gap-2 px-3 py-2 text-sm font-normal text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                      >
                        More
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      {overflowNavItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                        return (
                          <DropdownMenuItem key={item.href} asChild>
                            <Link 
                              href={item.href}
                              className={cn(
                                "flex items-center gap-2",
                                isActive && "bg-brand-50 text-petrol-dark font-normal"
                              )}
                            >
                              <item.icon className="h-4 w-4" />
                              <div className="flex flex-col">
                                <span>{item.title}</span>
                                <span className="text-xs text-neutral-500">{item.description}</span>
                              </div>
                            </Link>
                          </DropdownMenuItem>
                        )
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>

          {/* User Menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-3 py-2">
                  <div className="text-right">
                    <div className="text-sm font-normal">
                      {user.firstName && user.lastName 
                        ? `${user.firstName} ${user.lastName}` 
                        : user.businessName}
                    </div>
                    <div className="text-xs text-neutral-500">{user.email}</div>
                  </div>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={onHome}>
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  )
}

export default TopNavigation