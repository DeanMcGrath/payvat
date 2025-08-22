"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger
} from "@/components/ui/sidebar"
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
  Loader2,
  AlertCircle
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface UserProfile {
  id: string
  email: string
  businessName: string
  vatNumber: string
  firstName?: string
  lastName?: string
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [userLoading, setUserLoading] = useState(true)
  const [userError, setUserError] = useState<string | null>(null)

  useEffect(() => {
    fetchUserProfile()
  }, [])

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
        router.push('/login')
        return
      } else {
        setUserError('Failed to fetch user profile')
      }
    } catch (err) {
      console.log('Authentication check failed:', err)
      router.push('/login')
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
      router.push('/login')
    } catch (err) {
      router.push('/login')
    }
  }

  if (userLoading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-brand-300" />
          <span className="body-md text-neutral-600">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  if (userError) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <Card className="w-full max-w-md border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <span className="h6 text-red-800">Error Loading Dashboard</span>
            </div>
            <p className="body-md text-red-600 text-center mb-4">{userError}</p>
            <div className="flex space-x-2">
              <Button onClick={fetchUserProfile} className="flex-1">
                Try Again
              </Button>
              <Button onClick={() => router.push('/')} variant="outline" className="flex-1">
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen w-full bg-neutral-50">
        <Sidebar 
          collapsible="offcanvas"
          className="border-r border-neutral-200 bg-white"
        >
          <SidebarHeader>
            <div className="flex items-center gap-2 px-4 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-700">
                <span className="body-sm font-bold text-white">PV</span>
              </div>
              <div className="grid flex-1 text-left body-sm leading-tight">
                <span className="truncate font-semibold text-brand-700 text-brand-heading">
                  PayVat
                </span>
                <span className="truncate body-xs text-neutral-500">
                  Business Dashboard
                </span>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      tooltip={item.description}
                    >
                      <Link href={item.href} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        <div className="flex-1">
                          <div className="font-medium">{item.title}</div>
                          <div className="body-xs text-neutral-500 group-data-[collapsible=icon]:hidden">
                            {item.description}
                          </div>
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarContent>

          <div className="mt-auto p-4 border-t border-neutral-200">
            {user && (
              <div className="space-y-3">
                <div className="body-sm group-data-[collapsible=icon]:hidden">
                  <div className="font-medium text-neutral-900">
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user.businessName}
                  </div>
                  <div className="body-xs text-neutral-500">{user.email}</div>
                </div>
                
                <div className="flex gap-2 group-data-[collapsible=icon]:flex-col">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/')}
                    className="flex-1 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:p-0"
                    tooltip="Home"
                  >
                    <Home className="h-4 w-4 group-data-[collapsible=icon]:mr-0 mr-2" />
                    <span className="group-data-[collapsible=icon]:hidden">Home</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="flex-1 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:p-0"
                    tooltip="Logout"
                  >
                    <LogOut className="h-4 w-4 group-data-[collapsible=icon]:mr-0 mr-2" />
                    <span className="group-data-[collapsible=icon]:hidden">Logout</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Sidebar>

        <SidebarInset className="w-full">
          <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-neutral-200 px-6 bg-white shadow-sm">
            <SidebarTrigger className="-ml-2" />
            <div className="flex-1">
              <div className="h6 text-neutral-900">
                {navigationItems.find(item => 
                  pathname === item.href || pathname.startsWith(item.href + '/')
                )?.title || 'Dashboard'}
              </div>
            </div>
            {user && (
              <div className="body-sm text-neutral-600">
                Welcome, {user.firstName || user.businessName}
              </div>
            )}
          </header>
          
          <main className="flex-1 p-6 bg-neutral-50 min-h-[calc(100vh-4rem)]">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}