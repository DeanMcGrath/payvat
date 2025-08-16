'use client'

import { useEffect, useState, useCallback } from 'react'
import AdminRoute from '@/components/admin-route'
import { ErrorBoundary } from '@/components/error-boundary'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  FileText, 
  CreditCard, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Euro,
  Activity,
  BarChart3,
  MessageCircle,
  Video
} from 'lucide-react'
import Link from 'next/link'
import SiteHeader from '@/components/site-header'
import Footer from '@/components/footer'

interface AnalyticsData {
  overview: {
    totalUsers: number
    activeUsers: number
    totalVATReturns: number
    totalPayments: number
    totalPaymentVolume: number
    totalDocuments: number
    recentActivity: {
      newUsers: number
      newReturns: number
      newPayments: number
    }
  }
  trends: {
    monthlyData: Array<{
      month: string
      newUsers: number
      newReturns: number
      completedPayments: number
      paymentVolume: number
    }>
    period: string
    year: number
  }
  distributions: {
    userRoles: Array<{ role: string; count: number }>
    returnStatus: Array<{ status: string; count: number; totalVAT: number }>
    paymentMethods: Array<{ method: string; count: number; totalAmount: number }>
  }
  topBusinesses: Array<{
    id: string
    businessName: string
    vatNumber: string
    totalVATPaid: number
    _count: { vatReturns: number; payments: number }
  }>
}

export default function AdminDashboard() {
  return (
    <AdminRoute requiredRole="ADMIN">
      <ErrorBoundary>
        <AdminDashboardContent />
      </ErrorBoundary>
    </AdminRoute>
  )
}

function AdminDashboardContent() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/analytics?metric=overview&period=30', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Authentication required. Please log in as admin.')
          setTimeout(() => {
            window.location.href = '/login'
          }, 2000)
          return
        } else if (response.status === 403) {
          setError('Admin access required. Contact system administrator.')
          return
        }
        throw new Error(`Server responded with ${response.status}`)
      }
      
      const data = await response.json()
      
      // Validate API response structure
      if (!data.success || !data.analytics) {
        throw new Error('Invalid response format from server')
      }
      
      // Ensure analytics data has required structure
      const analytics = data.analytics
      if (!analytics.overview || !analytics.trends || !analytics.distributions || !analytics.topBusinesses) {
        throw new Error('Incomplete analytics data received')
      }
      
      setAnalytics(analytics)
    } catch (err) {
      console.error('Analytics fetch error:', err)
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Network error. Please check your connection and try again.')
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load analytics data')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  if (loading) {
    return (
      <div className="page-container">
        <SiteHeader 
          searchPlaceholder="Search admin tools..."
          currentPage="Admin Dashboard"
          pageSubtitle="System overview and analytics"
        />
        <div className="content-wrapper section-spacing">
          <div className="flex items-center justify-center h-64">
            <div className="loading-spinner"></div>
            <span className="ml-3 text-muted-foreground">Loading dashboard...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-container">
        <SiteHeader 
          searchPlaceholder="Search admin tools..."
          currentPage="Admin Dashboard"
          pageSubtitle="System overview and analytics"
        />
        <div className="content-wrapper section-spacing">
          <div className="error-card">
            <AlertCircle className="error-icon" />
            <h2 className="text-xl font-semibold mb-2 text-foreground">Error Loading Admin Dashboard</h2>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">{error}</p>
            <div className="flex justify-center space-x-3">
              <Button onClick={fetchAnalytics} disabled={loading} className="btn-primary">
                {loading ? 'Retrying...' : 'Try Again'}
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/admin-setup'} className="hover-scale">
                Admin Setup
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="page-container">
        <SiteHeader 
          searchPlaceholder="Search admin tools..."
          currentPage="Admin Dashboard"
          pageSubtitle="System overview and analytics"
        />
        <div className="content-wrapper section-spacing">
          <div className="card-premium p-12 text-center">
            <div className="icon-premium mb-6 mx-auto opacity-50">
              <AlertCircle className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-2xl font-semibold mb-3 text-foreground">No Data Available</h2>
            <p className="text-muted-foreground mb-4">Analytics data is not available. This could be because:</p>
            <ul className="text-sm text-muted-foreground mb-6 text-left max-w-md mx-auto space-y-2">
              <li>• No users have registered yet</li>
              <li>• Database is empty</li>
              <li>• Admin permissions not configured</li>
            </ul>
            <Button onClick={fetchAnalytics} disabled={loading} className="btn-primary hover-lift">
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const formatCurrency = (amount: number | undefined | null) => {
    const safeAmount = amount || 0
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR'
    }).format(safeAmount)
  }

  const safeGet = (obj: any, path: string, defaultValue: any = 0) => {
    const keys = path.split('.')
    let result = obj
    for (const key of keys) {
      if (result == null || result[key] == null) {
        return defaultValue
      }
      result = result[key]
    }
    return result
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'paid':
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  return (
    <div className="page-container">
      <SiteHeader 
        searchPlaceholder="Search admin tools..."
        currentPage="Admin Dashboard"
        pageSubtitle="System overview and analytics"
      />
      
      <div className="content-wrapper">
      {/* Modern Header Section */}
      <section className="section-spacing">
        <div className="text-center mb-12">
          <div className="icon-premium mb-4 mx-auto">
            <BarChart3 className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
            <span className="text-gradient-primary">Admin Dashboard</span>
            <br />
            <span className="text-foreground">System Analytics</span>
          </h1>
          <div className="w-32 h-1 gradient-primary mx-auto mb-4 rounded-full"></div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            PayVAT system overview and analytics for monitoring platform performance
          </p>
        </div>
        
        {/* Quick Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Link href="/admin/users">
            <Button variant="outline" className="hover-scale">
              <Users className="h-4 w-4 mr-2" />
              Manage Users
            </Button>
          </Link>
          <Link href="/admin/chat">
            <Button variant="outline" className="hover-scale">
              <MessageCircle className="h-4 w-4 mr-2" />
              Live Chat
            </Button>
          </Link>
          <Link href="/admin/videos">
            <Button variant="outline" className="hover-scale">
              <Video className="h-4 w-4 mr-2" />
              Videos
            </Button>
          </Link>
          <Link href="/admin/analytics">
            <Button className="btn-primary hover-lift">
              <BarChart3 className="h-4 w-4 mr-2" />
              Full Analytics
            </Button>
          </Link>
        </div>
      </section>

      {/* Key Metrics Cards */}
      <section className="section-spacing-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="admin-stat-card hover-lift">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Total Users</h3>
            <div className="icon-modern gradient-primary">
              <Users className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">{analytics.overview.totalUsers}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {analytics.overview.activeUsers} active (30 days)
          </p>
        </div>

        <div className="admin-stat-card hover-lift">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">VAT Returns</h3>
            <div className="icon-modern bg-[#0072B1]">
              <FileText className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">{analytics.overview.totalVATReturns}</div>
          <p className="text-xs text-success mt-1">
            +{analytics.overview.recentActivity.newReturns} this month
          </p>
        </div>

        <div className="admin-stat-card hover-lift">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Total Payments</h3>
            <div className="icon-modern bg-[#0072B1]">
              <CreditCard className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">{analytics.overview.totalPayments}</div>
          <p className="text-xs text-success mt-1">
            +{analytics.overview.recentActivity.newPayments} this month
          </p>
        </div>

        <div className="admin-stat-card hover-lift">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Payment Volume</h3>
            <div className="icon-modern bg-gradient-to-br from-[#0072B1] to-[#005A91]">
              <Euro className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {formatCurrency(analytics.overview.totalPaymentVolume)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Total processed
          </p>
        </div>
      </div>
      </section>

      {/* Tabs for Different Views */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="status">Status Distribution</TabsTrigger>
          <TabsTrigger value="top-businesses">Top Businesses</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Recent Activity (30 days)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">New Users</span>
                  <Badge variant="secondary">
                    {analytics.overview.recentActivity.newUsers}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">New VAT Returns</span>
                  <Badge variant="secondary">
                    {analytics.overview.recentActivity.newReturns}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">New Payments</span>
                  <Badge variant="secondary">
                    {analytics.overview.recentActivity.newPayments}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Documents</span>
                  <Badge variant="secondary">
                    {analytics.overview.totalDocuments}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* User Roles Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>User Roles Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analytics.distributions.userRoles.map((role) => (
                  <div key={role.role} className="flex justify-between items-center">
                    <span className="text-sm font-medium capitalize">
                      {role.role.toLowerCase().replace('_', ' ')}
                    </span>
                    <Badge variant="outline">{role.count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* VAT Return Status */}
            <Card>
              <CardHeader>
                <CardTitle>VAT Return Status</CardTitle>
                <CardDescription>Distribution of return statuses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {analytics.distributions.returnStatus.map((status) => (
                  <div key={status.status} className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(status.status)}>
                        {status.status}
                      </Badge>
                      <span className="text-sm">({status.count})</span>
                    </div>
                    <span className="text-sm font-medium">
                      {formatCurrency(status.totalVAT)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Breakdown by payment method</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {analytics.distributions.paymentMethods.map((method) => (
                  <div key={method.method} className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium capitalize">
                        {method.method}
                      </span>
                      <Badge variant="outline">({method.count})</Badge>
                    </div>
                    <span className="text-sm font-medium">
                      {formatCurrency(method.totalAmount)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="top-businesses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Businesses by VAT Paid</CardTitle>
              <CardDescription>Businesses with highest VAT payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topBusinesses.slice(0, 10).map((business, index) => (
                  <div key={business.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                        <span className="text-sm font-medium text-blue-600">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{business.businessName}</p>
                        <p className="text-sm text-gray-500">{business.vatNumber}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(business.totalVATPaid)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {business._count.payments} payments
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Link href="/admin/users">
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
            </Link>
            <Link href="/admin/videos">
              <Button variant="outline" className="w-full justify-start">
                <Video className="h-4 w-4 mr-2" />
                Demo Videos
              </Button>
            </Link>
            <Link href="/admin/documents">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Review Documents
              </Button>
            </Link>
            <Link href="/admin/payments">
              <Button variant="outline" className="w-full justify-start">
                <CreditCard className="h-4 w-4 mr-2" />
                Monitor Payments
              </Button>
            </Link>
            <Link href="/admin/analytics">
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
    
    <Footer />
    </div>
  )
}