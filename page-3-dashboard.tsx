"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, FileText, Settings, LogOut, TrendingUp, Calendar, Euro, AlertCircle, Loader2, Search, CheckCircle, Calculator } from 'lucide-react'
import { Input } from "@/components/ui/input"
import Footer from "./components/footer"
import { useSubscription } from "./contexts/subscription-context"

interface UserProfile {
  id: string
  email: string
  businessName: string
  vatNumber: string
  firstName?: string
  lastName?: string
}

interface DashboardStats {
  currentYear: {
    totalSalesVAT: number
    totalPurchaseVAT: number
    totalNetVAT: number
    returnsSubmitted: number
  }
  pendingPayments: Array<{
    id: string
    amount: number
    status: string
    dueDate?: Date
    period?: string
  }>
  upcomingReturns: Array<{
    id: string
    period: string
    netVAT: number
    dueDate: Date
    daysUntilDue: number
  }>
  recentActivity: Array<{
    action: string
    entityType: string
    createdAt: Date
    metadata: any
  }>
}

export default function HomePage() {
  const { hasAccess, subscriptionType, trialEndsAt } = useSubscription()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchUserProfile()
    fetchDashboardStats()
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
          setError('Failed to load user profile')
        }
      } else if (response.status === 401) {
        // User not authenticated, redirect to login
        window.location.href = '/login'
      } else {
        setError('Failed to fetch user profile')
      }
    } catch (err) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/reports?type=dashboard-stats', {
        method: 'GET',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.report) {
          setStats(data.report.stats)
        }
      }
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err)
    } finally {
      setStatsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      // Always redirect to login after logout attempt
      window.location.href = '/login'
    } catch (err) {
      // Even if logout fails, redirect to login
      window.location.href = '/login'
    }
  }

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-teal-700" />
          <span className="text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="w-full max-w-md border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <span className="text-lg font-medium text-red-800">Error Loading Dashboard</span>
            </div>
            <p className="text-red-600 text-center mb-4">{error}</p>
            <div className="flex space-x-2">
              <Button onClick={fetchUserProfile} className="flex-1">
                Try Again
              </Button>
              <Button onClick={() => window.location.href = '/login'} variant="outline" className="flex-1">
                Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Modern Header */}
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
              
              {/* Header Content */}
              <div className="flex items-center space-x-6">
                {/* Search - Desktop */}
                <div className="hidden lg:flex items-center space-x-3">
                  <div className="relative">
                    <Input
                      placeholder="Search ..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleSearchKeyPress}
                      className="w-64 xl:w-80 bg-white/10 text-white placeholder-white/70 border-white/20 backdrop-blur-sm focus:bg-white/15 focus:border-white/40"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70 cursor-pointer" onClick={handleSearch} />
                  </div>
                </div>
                
                {/* Business Info */}
                <div className="text-right hidden sm:block">
                  <h3 className="text-sm lg:text-base font-bold text-white truncate max-w-48 lg:max-w-none">{user.businessName}</h3>
                  <p className="text-white/70 font-mono text-xs">VAT: {user.vatNumber}</p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/10 lg:hidden glass-white/10 backdrop-blur-sm border-white/20"
                    onClick={() => window.location.href = '/search'}
                    title="Search"
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/10 glass-white/10 backdrop-blur-sm border-white/20 relative"
                  >
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-warning rounded-full animate-pulse-gentle"></span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/10 hidden sm:flex glass-white/10 backdrop-blur-sm border-white/20"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/10 glass-white/10 backdrop-blur-sm border-white/20"
                    onClick={handleLogout} 
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Modern Navigation */}
          <nav className="border-t border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-8">
                  <span className="text-white/90 text-sm font-medium flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>Dashboard</span>
                  </span>
                </div>
                <div className="text-white/60 text-xs hidden sm:block">
                  Welcome back, {user.firstName || user.businessName}
                </div>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="mb-3 animate-fade-in">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
              Welcome back, <span className="text-gradient-primary">{user.firstName || user.businessName.split(' ')[0] || 'User'}</span>
            </h2>
            <p className="text-xl text-muted-foreground">Here's your VAT overview and recent activity</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-3" data-animate>
            <div className="card-modern p-6 hover-lift">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Net VAT Due</p>
                  {statsLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <div className="text-2xl font-bold text-foreground">Loading...</div>
                    </div>
                  ) : (
                    <div className="text-3xl font-bold text-foreground">
                      €{(stats?.pendingPayments && stats.pendingPayments.length > 0) ? 
                        stats.pendingPayments[0].amount.toFixed(2) : 
                        stats?.currentYear?.totalNetVAT?.toFixed(2) || '0.00'
                      }
                    </div>
                  )}
                </div>
                <div className="icon-premium">
                  <Euro className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {(stats?.pendingPayments && stats.pendingPayments.length > 0) ? (
                  <div className="status-warning">
                    Due: {stats.pendingPayments[0].dueDate ? new Date(stats.pendingPayments[0].dueDate).toLocaleDateString() : 'Soon'}
                  </div>
                ) : (
                  <div className="status-success">No outstanding VAT</div>
                )}
              </div>
            </div>

            <div className="card-modern p-6 hover-lift">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">This Year</p>
                  {statsLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <div className="text-2xl font-bold text-foreground">Loading...</div>
                    </div>
                  ) : (
                    <div className="text-3xl font-bold text-foreground">
                      €{stats?.currentYear?.totalSalesVAT?.toFixed(2) || '0.00'}
                    </div>
                  )}
                </div>
                <div className="icon-premium">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="status-success">
                  Sales VAT collected
                </div>
              </div>
            </div>

            <div className="card-modern p-6 hover-lift">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Returns Filed</p>
                  {statsLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <div className="text-2xl font-bold text-foreground">Loading...</div>
                    </div>
                  ) : (
                    <div className="text-3xl font-bold text-foreground">
                      {stats?.currentYear?.returnsSubmitted || 0}
                    </div>
                  )}
                </div>
                <div className="icon-premium">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="status-success">
                  {stats?.currentYear?.returnsSubmitted ? 'Filed this year' : 'Ready to file'}
                </div>
              </div>
            </div>

            <div className="card-modern p-6 hover-lift">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Upcoming Returns</p>
                  {statsLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <div className="text-2xl font-bold text-foreground">Loading...</div>
                    </div>
                  ) : (
                    <div className="text-3xl font-bold text-foreground">
                      {stats?.upcomingReturns?.length ?? 0}
                    </div>
                  )}
                </div>
                <div className="icon-premium">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="status-success">
                  {(stats?.upcomingReturns && stats.upcomingReturns.length > 0) ? 'Due soon' : 'All up to date'}
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Status */}
          {subscriptionType === 'trial' && trialEndsAt && (
            <div className="mb-3">
              <div className="card-premium p-8 border border-warning/20 bg-warning/5 relative overflow-hidden">
                <div className="absolute inset-0 gradient-mesh opacity-10"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="icon-modern bg-warning/20 border-warning/30">
                      <Bell className="h-6 w-6 text-warning" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-1">Free Trial Active</h3>
                      <p className="text-muted-foreground">
                        Your trial expires on {trialEndsAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button variant="premium" size="lg" className="hover-lift">
                    Upgrade Now
                    <CheckCircle className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-3">
            <div className="card-modern p-8">
              <div className="mb-2">
                <h3 className="text-2xl font-bold text-foreground mb-2">Quick Actions</h3>
                <p className="text-muted-foreground">Common VAT tasks and operations</p>
              </div>
              
              <div className="space-y-4">
                <Button 
                  size="lg"
                  className="w-full btn-primary justify-start hover-lift"
                  onClick={() => window.location.href = '/vat-period'}
                >
                  <FileText className="h-5 w-5 mr-3" />
                  Submit VAT Return
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg"
                  className="w-full btn-outline justify-start"
                  onClick={() => window.location.href = '/reports'}
                >
                  <TrendingUp className="h-5 w-5 mr-3" />
                  View Reports
                </Button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card-modern p-8">
              <div className="mb-2">
                <h3 className="text-2xl font-bold text-foreground mb-2">Recent Activity</h3>
                <p className="text-muted-foreground">Latest VAT transactions and updates</p>
              </div>
              
{statsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Loading activity...</span>
                </div>
              ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
                <div className="space-y-6">
                  {stats.recentActivity.map((activity, index) => {
                    const getActivityDetails = (action: string) => {
                      switch (action) {
                        case 'SUBMIT_VAT_RETURN':
                          return {
                            icon: FileText,
                            bgColor: 'bg-primary/20 border-primary/30',
                            iconColor: 'text-primary',
                            title: 'VAT return submitted',
                            status: 'Filed'
                          }
                        case 'UPLOAD_DOCUMENT':
                          return {
                            icon: FileText,
                            bgColor: 'bg-blue-500/20 border-blue-500/30',
                            iconColor: 'text-blue-500',
                            title: 'Document uploaded',
                            status: 'Processed'
                          }
                        case 'CALCULATE_VAT':
                          return {
                            icon: Calculator,
                            bgColor: 'bg-green-500/20 border-green-500/30',
                            iconColor: 'text-green-500',
                            title: 'VAT calculated',
                            status: 'Completed'
                          }
                        default:
                          return {
                            icon: CheckCircle,
                            bgColor: 'bg-success/20 border-success/30',
                            iconColor: 'text-success',
                            title: 'Activity logged',
                            status: 'Completed'
                          }
                      }
                    }
                    
                    const details = getActivityDetails(activity.action)
                    const Icon = details.icon
                    
                    return (
                      <div key={index} className="flex items-center space-x-4">
                        <div className={`icon-modern ${details.bgColor}`}>
                          <Icon className={`h-5 w-5 ${details.iconColor}`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{details.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(activity.createdAt).toLocaleDateString()} - {new Date(activity.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="status-success">{details.status}</div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No recent activity</p>
                  <p className="text-sm">Your VAT activities will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Live Chat */}

      {/* Footer */}
      <Footer />
    </div>
  )
}
