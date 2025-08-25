"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Calendar,
  TrendingUp,
  TrendingDown,
  Euro,
  FileText,
  CheckCircle,
  AlertTriangle,
  Download,
  Eye,
  Calculator,
  BarChart3,
  PieChart
} from "lucide-react"
import { formatCurrency } from "@/lib/vatUtils"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, Pie } from 'recharts'

interface MonthlySummary {
  year: number
  month: number
  totalSalesAmount: number
  totalPurchaseAmount: number
  totalSalesVAT: number
  totalPurchaseVAT: number
  totalNetVAT: number
  documentCount: number
  salesDocumentCount: number
  purchaseDocumentCount: number
  averageProcessingQuality: number
  averageVATAccuracy: number
  complianceRate: number
  trends: {
    salesVATChange: number
    purchaseVATChange: number
    documentCountChange: number
  }
}

interface MonthlyDocumentSummaryProps {
  selectedYear?: number
  selectedMonth?: number
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const COLORS = ['#2A7A8F', '#216477', '#99D3FF', '#CCE7FF']

export default function MonthlyDocumentSummary({ 
  selectedYear, 
  selectedMonth 
}: MonthlyDocumentSummaryProps) {
  const [summaryData, setSummaryData] = useState<MonthlySummary[]>([])
  const [currentSummary, setCurrentSummary] = useState<MonthlySummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'chart' | 'summary'>('summary')

  const currentDate = new Date()
  const displayYear = selectedYear || currentDate.getFullYear()
  const displayMonth = selectedMonth || currentDate.getMonth() + 1

  useEffect(() => {
    loadMonthlySummary()
  }, [selectedYear, selectedMonth])

  const loadMonthlySummary = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedYear) params.set('year', selectedYear.toString())
      if (selectedMonth) params.set('month', selectedMonth.toString())

      const response = await fetch(`/api/documents/monthly-summary?${params}`, {
        method: 'GET',
        credentials: 'include'
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setSummaryData(result.monthlySummaries || [])
          setCurrentSummary(result.currentMonth || null)
        }
      }
    } catch (error) {
      console.error('Failed to load monthly summary:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <div className="h-4 w-4" />
  }

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const formatTrendValue = (value: number, isPercentage = false) => {
    const symbol = value >= 0 ? '+' : ''
    const suffix = isPercentage ? '%' : ''
    return `${symbol}${value.toFixed(1)}${suffix}`
  }

  // Prepare chart data
  const chartData = summaryData.map(summary => ({
    month: MONTHS[summary.month - 1].substring(0, 3),
    salesVAT: summary.totalSalesVAT,
    purchaseVAT: summary.totalPurchaseVAT,
    netVAT: summary.totalNetVAT,
    documents: summary.documentCount
  }))

  // Prepare pie chart data for current month
  const pieData = currentSummary ? [
    { name: 'Sales VAT', value: currentSummary.totalSalesVAT, color: '#2A7A8F' },
    { name: 'Purchase VAT', value: currentSummary.totalPurchaseVAT, color: '#216477' }
  ].filter(item => item.value > 0) : []

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Monthly Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">Loading monthly summary...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!currentSummary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Monthly Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-normal">No data for {MONTHS[displayMonth - 1]} {displayYear}</p>
            <p className="text-sm">Upload documents to see monthly summaries</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              {MONTHS[displayMonth - 1]} {displayYear} Summary
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant={viewMode === 'summary' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('summary')}
              >
                <Calculator className="h-4 w-4 mr-1" />
                Summary
              </Button>
              <Button
                variant={viewMode === 'chart' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('chart')}
              >
                <BarChart3 className="h-4 w-4 mr-1" />
                Charts
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {viewMode === 'summary' ? (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-petrol-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-normal text-blue-900">Sales VAT</div>
                    {getTrendIcon(currentSummary.trends.salesVATChange)}
                  </div>
                  <div className="text-2xl font-normal text-blue-900">
                    {formatCurrency(currentSummary.totalSalesVAT)}
                  </div>
                  <div className={`text-xs ${getTrendColor(currentSummary.trends.salesVATChange)}`}>
                    {formatTrendValue(currentSummary.trends.salesVATChange)}% vs last month
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-normal text-green-900">Purchase VAT</div>
                    {getTrendIcon(currentSummary.trends.purchaseVATChange)}
                  </div>
                  <div className="text-2xl font-normal text-green-900">
                    {formatCurrency(currentSummary.totalPurchaseVAT)}
                  </div>
                  <div className={`text-xs ${getTrendColor(currentSummary.trends.purchaseVATChange)}`}>
                    {formatTrendValue(currentSummary.trends.purchaseVATChange)}% vs last month
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-normal text-purple-900">Net VAT</div>
                    <Euro className="h-4 w-4 text-purple-500" />
                  </div>
                  <div className="text-2xl font-normal text-purple-900">
                    {formatCurrency(currentSummary.totalNetVAT)}
                  </div>
                  <div className="text-xs text-purple-700">
                    Due to Revenue
                  </div>
                </div>

                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-normal text-gray-900">Documents</div>
                    <FileText className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="text-2xl font-normal text-gray-900">
                    {currentSummary.documentCount}
                  </div>
                  <div className="text-xs text-gray-700">
                    {currentSummary.salesDocumentCount} sales • {currentSummary.purchaseDocumentCount} purchases
                  </div>
                </div>
              </div>

              {/* Quality Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-card p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-normal">Processing Quality</h3>
                    <Badge variant="outline">
                      {currentSummary.averageProcessingQuality.toFixed(0)}/100
                    </Badge>
                  </div>
                  <Progress 
                    value={currentSummary.averageProcessingQuality} 
                    className="mb-2" 
                  />
                  <p className="text-xs text-muted-foreground">
                    Average document scan quality
                  </p>
                </div>

                <div className="bg-card p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-normal">VAT Accuracy</h3>
                    <Badge variant="outline">
                      {(currentSummary.averageVATAccuracy * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  <Progress 
                    value={currentSummary.averageVATAccuracy * 100} 
                    className="mb-2" 
                  />
                  <p className="text-xs text-muted-foreground">
                    Average VAT extraction accuracy
                  </p>
                </div>
              </div>

              {/* Compliance Status */}
              <div className="bg-card p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-normal flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Compliance Status
                  </h3>
                  <Badge className={currentSummary.complianceRate >= 0.9 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                    {(currentSummary.complianceRate * 100).toFixed(0)}% Compliant
                  </Badge>
                </div>
                <Progress 
                  value={currentSummary.complianceRate * 100} 
                  className="mb-2" 
                />
                <p className="text-xs text-muted-foreground">
                  Documents meeting Irish VAT requirements
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* VAT Trends Chart */}
              {chartData.length > 1 && (
                <div className="bg-card p-4 rounded-lg border">
                  <h3 className="text-sm font-normal mb-4">VAT Trends (6 Months)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData.slice(-6)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Line 
                        type="monotone" 
                        dataKey="salesVAT" 
                        stroke="#2A7A8F" 
                        strokeWidth={2}
                        name="Sales VAT"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="purchaseVAT" 
                        stroke="#216477" 
                        strokeWidth={2}
                        name="Purchase VAT"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="netVAT" 
                        stroke="#99D3FF" 
                        strokeWidth={2}
                        name="Net VAT"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* VAT Breakdown Pie Chart */}
                {pieData.length > 0 && (
                  <div className="bg-card p-4 rounded-lg border">
                    <h3 className="text-sm font-normal mb-4">VAT Breakdown</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <RechartsPieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={60}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Document Count Chart */}
                {chartData.length > 1 && (
                  <div className="bg-card p-4 rounded-lg border">
                    <h3 className="text-sm font-normal mb-4">Document Volume</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={chartData.slice(-6)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="documents" fill="#2A7A8F" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}