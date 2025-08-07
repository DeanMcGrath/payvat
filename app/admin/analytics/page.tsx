'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, 
  ChevronLeft,
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  CreditCard,
  Euro,
  Clock,
  AlertTriangle,
  Activity,
  Calendar
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

interface PerformanceData {
  performance: {
    averageProcessingTime: number
    paymentFailureRate: number
    totalPaymentAttempts: number
    systemErrors: number
    period: string
  }
}

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [performance, setPerformance] = useState<PerformanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState('30')
  const [activeTab, setActiveTab] = useState('overview')

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    try {
      const [overviewResponse, performanceResponse] = await Promise.all([
        fetch(`/api/admin/analytics?metric=overview&period=${period}`),
        fetch(`/api/admin/analytics?metric=performance&period=${period}`)
      ])

      if (!overviewResponse.ok || !performanceResponse.ok) {
        throw new Error('Failed to fetch analytics')
      }

      const overviewData = await overviewResponse.json()
      const performanceData = await performanceResponse.json()

      setAnalytics(overviewData.analytics)
      setPerformance(performanceData.analytics)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const formatPercent = (value: number, total: number) => {
    if (total === 0) return '0%'
    return `${Math.round((value / total) * 100)}%`
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

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) {
      return <TrendingUp className="h-4 w-4 text-green-500" />
    } else if (current < previous) {
      return <TrendingDown className="h-4 w-4 text-red-500" />
    }
    return <Activity className="h-4 w-4 text-gray-500" />
  }

  const getMaxValue = (data: any[], key: string) => {
    return Math.max(...data.map(item => item[key]))
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
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Analytics</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchAnalytics}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Analytics</h1>
          <p className="text-gray-600">Detailed analytics and performance metrics</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Link href="/admin">
            <Button variant="outline">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalUsers}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getTrendIcon(analytics.overview.activeUsers, analytics.overview.totalUsers - analytics.overview.activeUsers)}
              <span className="ml-1">
                {analytics.overview.activeUsers} active ({period} days)
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VAT Returns</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalVATReturns}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              +{analytics.overview.recentActivity.newReturns} recent
            </div>
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
            <div className="text-xs text-muted-foreground">
              {analytics.overview.totalPayments} transactions
            </div>
          </CardContent>
        </Card>

        {performance && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Processing</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performance.performance.averageProcessingTime}min</div>
              <div className="text-xs text-muted-foreground">
                {performance.performance.systemErrors} errors
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="distributions">Distributions</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Recent Activity ({period} days)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">New User Registrations</span>
                  </div>
                  <Badge variant="secondary" className="text-lg">
                    {analytics.overview.recentActivity.newUsers}
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    <span className="font-medium">VAT Returns Submitted</span>
                  </div>
                  <Badge variant="secondary" className="text-lg">
                    {analytics.overview.recentActivity.newReturns}
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5 text-purple-600" />
                    <span className="font-medium">Payments Processed</span>
                  </div>
                  <Badge variant="secondary" className="text-lg">
                    {analytics.overview.recentActivity.newPayments}
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-orange-600" />
                    <span className="font-medium">Documents Uploaded</span>
                  </div>
                  <Badge variant="secondary" className="text-lg">
                    {analytics.overview.totalDocuments}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* User Roles */}
            <Card>
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
                <CardDescription>Breakdown by user roles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {analytics.distributions.userRoles.map((role) => (
                  <div key={role.role} className="flex items-center justify-between p-2 border rounded">
                    <span className="font-medium capitalize">
                      {role.role.toLowerCase().replace('_', ' ')}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{role.count}</Badge>
                      <span className="text-sm text-gray-500">
                        {formatPercent(role.count, analytics.overview.totalUsers)}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Monthly Trends ({analytics.trends.year})
              </CardTitle>
              <CardDescription>Growth patterns throughout the year</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Monthly Data Visualization */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* User Growth */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center">
                      <Users className="h-4 w-4 mr-2 text-blue-500" />
                      User Growth
                    </h4>
                    <div className="space-y-2">
                      {analytics.trends.monthlyData.map((month, index) => {
                        const maxUsers = getMaxValue(analytics.trends.monthlyData, 'newUsers')
                        const widthPercent = maxUsers > 0 ? (month.newUsers / maxUsers) * 100 : 0
                        return (
                          <div key={index} className="flex items-center space-x-3">
                            <span className="text-sm font-medium w-12">{month.month}</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{ width: `${widthPercent}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 w-8">{month.newUsers}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Payment Volume */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center">
                      <Euro className="h-4 w-4 mr-2 text-green-500" />
                      Payment Volume
                    </h4>
                    <div className="space-y-2">
                      {analytics.trends.monthlyData.map((month, index) => {
                        const maxVolume = getMaxValue(analytics.trends.monthlyData, 'paymentVolume')
                        const widthPercent = maxVolume > 0 ? (month.paymentVolume / maxVolume) * 100 : 0
                        return (
                          <div key={index} className="flex items-center space-x-3">
                            <span className="text-sm font-medium w-12">{month.month}</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${widthPercent}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 w-20">
                              {formatCurrency(month.paymentVolume)}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distributions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* VAT Return Status */}
            <Card>
              <CardHeader>
                <CardTitle>VAT Return Status</CardTitle>
                <CardDescription>Distribution of return statuses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {analytics.distributions.returnStatus.map((status) => (
                  <div key={status.status} className="flex justify-between items-center p-3 border rounded-lg">
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
                  <div key={method.method} className="flex justify-between items-center p-3 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium capitalize">
                        {method.method.replace('_', ' ')}
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

        <TabsContent value="performance" className="space-y-4">
          {performance && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Processing Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {performance.performance.averageProcessingTime} min
                  </div>
                  <p className="text-xs text-muted-foreground">Average payment processing</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Failure Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatPercent(
                      performance.performance.paymentFailureRate,
                      performance.performance.totalPaymentAttempts
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {performance.performance.paymentFailureRate} of {performance.performance.totalPaymentAttempts} attempts
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">System Errors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {performance.performance.systemErrors}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    In {performance.performance.period}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatPercent(
                      performance.performance.totalPaymentAttempts - performance.performance.paymentFailureRate,
                      performance.performance.totalPaymentAttempts
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Payment success rate</p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Top Businesses */}
      <Card>
        <CardHeader>
          <CardTitle>Top Businesses by VAT Paid</CardTitle>
          <CardDescription>Highest contributing businesses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.topBusinesses.slice(0, 5).map((business, index) => (
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
                    {business._count.payments} payments, {business._count.vatReturns} returns
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}