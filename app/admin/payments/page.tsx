'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  CreditCard, 
  Search, 
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Building,
  Calendar,
  Euro,
  Receipt,
  FileText,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'

interface Payment {
  id: string
  amount: number
  currency: string
  status: string
  paymentMethod: string | null
  processedAt: Date | null
  failedAt: Date | null
  failureReason: string | null
  receiptNumber: string | null
  receiptUrl: string | null
  stripePaymentId: string | null
  createdAt: Date
  updatedAt: Date
  user: {
    id: string
    email: string
    businessName: string
    vatNumber: string
  }
  vatReturn: {
    id: string
    period: string
    status: string
    revenueRefNumber: string | null
    netVAT: number
  } | null
}

interface PaymentsResponse {
  success: boolean
  payments: Payment[]
  statistics: {
    totalAmount: number
    averageAmount: number
    statusBreakdown: Array<{
      status: string
      count: number
      totalAmount: number
    }>
  }
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
  }
}

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [statistics, setStatistics] = useState<PaymentsResponse['statistics'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userIdFilter, setUserIdFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('')
  const [dateFromFilter, setDateFromFilter] = useState('')
  const [dateToFilter, setDateToFilter] = useState('')
  const [minAmountFilter, setMinAmountFilter] = useState('')
  const [maxAmountFilter, setMaxAmountFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0
  })

  const fetchPayments = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      })
      
      if (userIdFilter) params.append('userId', userIdFilter)
      if (statusFilter) params.append('status', statusFilter)
      if (paymentMethodFilter) params.append('paymentMethod', paymentMethodFilter)
      if (dateFromFilter) params.append('dateFrom', dateFromFilter)
      if (dateToFilter) params.append('dateTo', dateToFilter)
      if (minAmountFilter) params.append('minAmount', minAmountFilter)
      if (maxAmountFilter) params.append('maxAmount', maxAmountFilter)

      const response = await fetch(`/api/admin/payments?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch payments')
      }
      
      const data: PaymentsResponse = await response.json()
      setPayments(data.payments)
      setStatistics(data.statistics)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payments')
    } finally {
      setLoading(false)
    }
  }, [userIdFilter, statusFilter, paymentMethodFilter, dateFromFilter, dateToFilter, minAmountFilter, maxAmountFilter, page])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-IE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'succeeded':
        return 'bg-green-100 text-green-800'
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'refunded':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'succeeded':
        return <CheckCircle className="h-4 w-4" />
      case 'pending':
      case 'processing':
        return <Clock className="h-4 w-4" />
      case 'failed':
      case 'cancelled':
        return <XCircle className="h-4 w-4" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  const handleFilterChange = (filterType: string, value: string) => {
    switch (filterType) {
      case 'status':
        setStatusFilter(value)
        break
      case 'paymentMethod':
        setPaymentMethodFilter(value)
        break
      case 'dateFrom':
        setDateFromFilter(value)
        break
      case 'dateTo':
        setDateToFilter(value)
        break
      case 'minAmount':
        setMinAmountFilter(value)
        break
      case 'maxAmount':
        setMaxAmountFilter(value)
        break
    }
    setPage(1) // Reset to first page on filter change
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

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Payments</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchPayments}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Monitoring</h1>
          <p className="text-gray-600">Monitor and manage payment transactions</p>
        </div>
        <Link href="/admin">
          <Button variant="outline">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(statistics.totalAmount)}
              </div>
              <p className="text-xs text-muted-foreground">
                All payments processed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Payment</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(statistics.averageAmount)}
              </div>
              <p className="text-xs text-muted-foreground">
                Per transaction
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pagination.totalCount}</div>
              <p className="text-xs text-muted-foreground">
                All transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statistics.statusBreakdown.length > 0 
                  ? Math.round((statistics.statusBreakdown.find(s => s.status === 'COMPLETED')?.count || 0) / 
                      statistics.statusBreakdown.reduce((sum, s) => sum + s.count, 0) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Completion rate
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Status Breakdown */}
      {statistics && statistics.statusBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {statistics.statusBreakdown.map((status) => (
                <div key={status.status} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <Badge className={getStatusColor(status.status)}>
                      {status.status}
                    </Badge>
                    <span className="text-sm font-medium">{status.count}</span>
                  </div>
                  <div className="text-lg font-bold">
                    {formatCurrency(status.totalAmount)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <Select value={statusFilter} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
              </SelectContent>
            </Select>

            <Select value={paymentMethodFilter} onValueChange={(value) => handleFilterChange('paymentMethod', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All Methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Methods</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="sepa_debit">SEPA Debit</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder="From Date"
              value={dateFromFilter}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            />

            <Input
              type="date"
              placeholder="To Date"
              value={dateToFilter}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            />

            <Input
              type="number"
              placeholder="Min Amount"
              value={minAmountFilter}
              onChange={(e) => handleFilterChange('minAmount', e.target.value)}
            />

            <Input
              type="number"
              placeholder="Max Amount"
              value={maxAmountFilter}
              onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              Payments ({pagination.totalCount})
            </CardTitle>
            <div className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.totalPages}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payments.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No payments found</p>
              </div>
            ) : (
              payments.map((payment) => (
                <div key={payment.id} className="border rounded-lg p-4 hover:bg-gray-100">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Payment Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {getStatusIcon(payment.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-lg">
                              {formatCurrency(payment.amount, payment.currency)}
                            </h3>
                            <Badge className={getStatusColor(payment.status)}>
                              {payment.status}
                            </Badge>
                            {payment.paymentMethod && (
                              <Badge variant="outline">
                                {payment.paymentMethod.replace('_', ' ').toUpperCase()}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDate(payment.createdAt)}
                            </span>
                            {payment.processedAt && (
                              <span className="flex items-center text-green-600">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Processed: {formatDate(payment.processedAt)}
                              </span>
                            )}
                            {payment.receiptNumber && (
                              <span className="flex items-center">
                                <Receipt className="h-4 w-4 mr-1" />
                                {payment.receiptNumber}
                              </span>
                            )}
                            {payment.stripePaymentId && (
                              <span className="text-xs text-gray-400">
                                Stripe: {payment.stripePaymentId}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* User Info */}
                      <div className="ml-11 mb-2">
                        <div className="flex items-center space-x-2 text-sm">
                          <Building className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{payment.user.businessName}</span>
                          <span className="text-gray-500">({payment.user.vatNumber})</span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-500">{payment.user.email}</span>
                        </div>
                      </div>

                      {/* VAT Return Info */}
                      {payment.vatReturn && (
                        <div className="ml-11">
                          <div className="flex items-center space-x-2 text-sm">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <span>VAT Return: {payment.vatReturn.period}</span>
                            <Badge className={getStatusColor(payment.vatReturn.status)} variant="outline">
                              {payment.vatReturn.status}
                            </Badge>
                            <span className="text-gray-500">
                              VAT: {formatCurrency(payment.vatReturn.netVAT)}
                            </span>
                            {payment.vatReturn.revenueRefNumber && (
                              <span className="text-gray-500">
                                Ref: {payment.vatReturn.revenueRefNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions & Receipt */}
                    <div className="flex flex-col space-y-2">
                      {payment.receiptUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <Link href={payment.receiptUrl} target="_blank">
                            <Receipt className="h-4 w-4 mr-2" />
                            Receipt
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Failure Information */}
                  {payment.status === 'FAILED' && payment.failureReason && (
                    <div className="ml-11 mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm">
                      <div className="flex items-center space-x-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="font-medium text-red-800">Payment Failed</span>
                      </div>
                      <div className="text-red-700 mt-1">
                        {payment.failureReason}
                      </div>
                      {payment.failedAt && (
                        <div className="text-red-600 text-xs mt-1">
                          Failed at: {formatDate(payment.failedAt)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Showing {((page - 1) * pagination.limit) + 1} to {Math.min(page * pagination.limit, pagination.totalCount)} of {pagination.totalCount} payments
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= pagination.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}