"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts"
import { TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface VATTrendData {
  month: string
  salesVAT: number
  purchaseVAT: number
  netVAT: number
  period: string
}

interface VATTrendsChartProps {
  className?: string
}

export default function VATTrendsChart({ className }: VATTrendsChartProps) {
  const [data, setData] = useState<VATTrendData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalTrend, setTotalTrend] = useState<number>(0)

  useEffect(() => {
    fetchVATTrendsData()
  }, [])

  const fetchVATTrendsData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/reports?type=vat-trends', {
        method: 'GET',
        credentials: 'include'
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.report?.trends) {
          setData(result.report.trends)
          calculateTrend(result.report.trends)
        }
      } else {
        setError('Failed to load VAT trends data')
      }
    } catch (err) {
      setError('Error fetching VAT trends')
    } finally {
      setLoading(false)
    }
  }

  const calculateTrend = (trends: VATTrendData[]) => {
    if (trends.length < 2) return
    
    const recent = trends.slice(-3).reduce((sum, item) => sum + item.netVAT, 0) / 3
    const previous = trends.slice(-6, -3).reduce((sum, item) => sum + item.netVAT, 0) / 3
    
    if (previous !== 0) {
      setTotalTrend(((recent - previous) / previous) * 100)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-normal text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center space-x-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600">{entry.name}:</span>
              <span className="text-sm font-normal text-gray-900">
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  const getTrendIcon = () => {
    if (totalTrend > 5) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (totalTrend < -5) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-gray-500" />
  }

  const getTrendColor = () => {
    if (totalTrend > 5) return "text-green-600"
    if (totalTrend < -5) return "text-red-600"
    return "text-gray-600"
  }

  const getTrendBadgeVariant = () => {
    if (totalTrend > 5) return "default"
    if (totalTrend < -5) return "destructive"
    return "secondary"
  }

  if (loading) {
    return (
      <Card className={`${className} card-modern`}>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-normal text-foreground flex items-center justify-between">
            VAT Trends
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-muted-foreground">Loading trends...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !data.length) {
    return (
      <Card className={`${className} card-modern`}>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-normal text-foreground">VAT Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-normal">No trend data available</p>
              <p className="text-sm">Submit more VAT returns to see trends</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`${className} card-modern hover-lift`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-normal text-foreground">VAT Trends</CardTitle>
          <div className="flex items-center space-x-2">
            {getTrendIcon()}
            <Badge variant={getTrendBadgeVariant()} className="text-xs">
              {totalTrend > 0 ? '+' : ''}{totalTrend.toFixed(1)}%
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Monthly VAT performance over time</p>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#216477" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#216477" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickLine={{ stroke: '#e2e8f0' }}
                tickFormatter={formatCurrency}
              />
              <Tooltip content={<CustomTooltip />} />
              
              <Area
                type="monotone"
                dataKey="salesVAT"
                stroke="#216477"
                strokeWidth={2}
                fill="url(#salesGradient)"
                name="Sales VAT"
              />
              <Area
                type="monotone"
                dataKey="netVAT"
                stroke="#059669"
                strokeWidth={2}
                fill="url(#netGradient)"
                name="Net VAT"
              />
              <Line
                type="monotone"
                dataKey="purchaseVAT"
                stroke="#dc2626"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#dc2626', strokeWidth: 2, r: 3 }}
                name="Purchase VAT"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="flex items-center justify-center space-x-1">
              <div className="w-3 h-3 bg-[#216477] rounded-full" />
              <span className="text-xs text-muted-foreground">Sales VAT</span>
            </div>
            <p className="text-sm font-normal text-foreground">
              {formatCurrency(data[data.length - 1]?.salesVAT || 0)}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span className="text-xs text-muted-foreground">Purchase VAT</span>
            </div>
            <p className="text-sm font-normal text-foreground">
              {formatCurrency(data[data.length - 1]?.purchaseVAT || 0)}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center space-x-1">
              <div className="w-3 h-3 bg-green-600 rounded-full" />
              <span className="text-xs text-muted-foreground">Net VAT</span>
            </div>
            <p className="text-sm font-normal text-foreground">
              {formatCurrency(data[data.length - 1]?.netVAT || 0)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}