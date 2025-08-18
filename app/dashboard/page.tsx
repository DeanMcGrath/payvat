"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, FileText, Settings, LogOut, TrendingUp, Calendar, Euro, AlertCircle, Loader2, Search, CheckCircle, Calculator } from 'lucide-react'
import { Input } from "@/components/ui/input"
import Footer from "@/components/footer"
import { useSubscription } from "@/contexts/subscription-context"
import VATTrendsChart from "@/components/dashboard/VATTrendsChart"
import VATBreakdownChart from "@/components/dashboard/VATBreakdownChart"
import EnhancedStatsCard from "@/components/dashboard/EnhancedStatsCard"
import InsightsPanel from "@/components/dashboard/InsightsPanel"
import CalendarWidget from "@/components/dashboard/CalendarWidget"
import DocumentsOverview from "@/components/dashboard/DocumentsOverview"
import QuickActions from "@/components/dashboard/QuickActions"

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
          <Loader2 className="h-6 w-6 animate-spin text-[#5BADEA]" />
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
                <Link href="/" className="text-2xl font-bold font-mono text-white tracking-tight hover:text-white/90 transition-colors">
                  Don't Be Like Me!
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

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" data-animate>
            <EnhancedStatsCard
              title="Net VAT Due"
              value={(stats?.pendingPayments && stats.pendingPayments.length > 0) ? 
                stats.pendingPayments[0].amount : 
                stats?.currentYear?.totalNetVAT || 0
              }
              subtitle={(stats?.pendingPayments && stats.pendingPayments.length > 0) ? 
                `Due: ${stats.pendingPayments[0].dueDate ? new Date(stats.pendingPayments[0].dueDate).toLocaleDateString() : 'Soon'}` : 
                'No outstanding VAT'
              }
              icon={Euro}
              trend={{
                value: 5.2,
                period: 'vs last quarter'
              }}
              status={{
                type: (stats?.pendingPayments && stats.pendingPayments.length > 0) ? 'warning' : 'success',
                text: (stats?.pendingPayments && stats.pendingPayments.length > 0) ? 'Payment Due' : 'Up to Date'
              }}
              loading={statsLoading}
            />
            
            <EnhancedStatsCard
              title="Sales VAT"
              value={stats?.currentYear?.totalSalesVAT || 0}
              subtitle="This year collected"
              icon={TrendingUp}
              trend={{
                value: 12.8,
                period: 'vs last year'
              }}
              status={{
                type: 'success',
                text: 'Growing'
              }}
              sparklineData={[1200, 1500, 1800, 1650, 1900, 2100]}
              loading={statsLoading}
            />
            
            <EnhancedStatsCard
              title="Returns Filed"
              value={stats?.currentYear?.returnsSubmitted || 0}
              subtitle={stats?.currentYear?.returnsSubmitted ? 'Filed this year' : 'Ready to file'}
              icon={FileText}
              trend={{
                value: 0,
                period: 'on schedule'
              }}
              status={{
                type: 'info',
                text: 'On Track'
              }}
              loading={statsLoading}
            />
            
            <EnhancedStatsCard
              title="Upcoming Returns"
              value={stats?.upcomingReturns?.length ?? 0}
              subtitle={(stats?.upcomingReturns && stats.upcomingReturns.length > 0) ? 'Due soon' : 'All up to date'}
              icon={Calendar}
              status={{
                type: (stats?.upcomingReturns && stats.upcomingReturns.length > 0) ? 'warning' : 'success',
                text: (stats?.upcomingReturns && stats.upcomingReturns.length > 0) ? 'Action Required' : 'Current'
              }}
              loading={statsLoading}
            />
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
                  <Button variant="default" size="lg" className="hover-lift">
                    Upgrade Now
                    <CheckCircle className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <VATTrendsChart className="col-span-1" />
            <VATBreakdownChart className="col-span-1" />
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Left Column - Quick Actions */}
            <div className="lg:col-span-1">
              <QuickActions className="mb-8" />
            </div>
            
            {/* Middle Column - Insights & Calendar */}
            <div className="lg:col-span-1 space-y-8">
              <InsightsPanel />
              <CalendarWidget />
            </div>
            
            {/* Right Column - Documents & Activity */}
            <div className="lg:col-span-1">
              <DocumentsOverview className="mb-8" />
              
              {/* Recent Activity - Simplified */}
              <Card className="card-modern hover-lift">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-foreground">Recent Activity</CardTitle>
                  <p className="text-sm text-muted-foreground">Latest VAT transactions</p>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-muted-foreground">Loading...</span>
                    </div>
                  ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {stats.recentActivity.slice(0, 3).map((activity, index) => {
                        const getActivityDetails = (action: string) => {
                          switch (action) {
                            case 'SUBMIT_VAT_RETURN':
                              return { icon: FileText, title: 'VAT return submitted', color: 'text-primary' }
                            case 'UPLOAD_DOCUMENT':
                              return { icon: FileText, title: 'Document uploaded', color: 'text-blue-500' }
                            case 'CALCULATE_VAT':
                              return { icon: Calculator, title: 'VAT calculated', color: 'text-green-500' }
                            default:
                              return { icon: CheckCircle, title: 'Activity logged', color: 'text-gray-500' }
                          }
                        }
                        
                        const details = getActivityDetails(activity.action)
                        const Icon = details.icon
                        
                        return (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <Icon className={`h-4 w-4 ${details.color}`} />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">{details.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(activity.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => window.location.href = '/reports'}
                      >
                        View All Activity
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No recent activity</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}