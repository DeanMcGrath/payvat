'use client'

import { useEffect, useState } from 'react'
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
  BarChart3
} from 'lucide-react'
import Link from 'next/link'

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
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics?metric=overview&period=30')
      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }
      const data = await response.json()
      setAnalytics(data.analytics)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchAnalytics}>Try Again</Button>
        </div>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
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
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">System overview and analytics</p>
        </div>
        <div className="flex space-x-4">
          <Link href="/admin/users">
            <Button variant="outline" size="sm">
              <Users className="h-4 w-4 mr-2" />
              Manage Users
            </Button>
          </Link>
          <Link href="/admin/analytics">
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Full Analytics
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.overview.activeUsers} active (30 days)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VAT Returns</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalVATReturns}</div>
            <p className="text-xs text-muted-foreground">
              +{analytics.overview.recentActivity.newReturns} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalPayments}</div>
            <p className="text-xs text-muted-foreground">
              +{analytics.overview.recentActivity.newPayments} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Volume</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analytics.overview.totalPaymentVolume)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total processed
            </p>
          </CardContent>
        </Card>
      </div>

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/users">
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Manage Users
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
  )
}