"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts"
import { PieChart as PieChartIcon, Loader2 } from "lucide-react"

interface VATBreakdownData {
  name: string
  value: number
  color: string
  percentage: number
}

interface VATBreakdownChartProps {
  className?: string
}

export default function VATBreakdownChart({ className }: VATBreakdownChartProps) {
  const [data, setData] = useState<VATBreakdownData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalVAT, setTotalVAT] = useState(0)

  useEffect(() => {
    fetchVATBreakdownData()
  }, [])

  const fetchVATBreakdownData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/reports?type=vat-breakdown', {
        method: 'GET',
        credentials: 'include'
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.report?.breakdown) {
          const breakdown = result.report.breakdown
          const total = breakdown.salesVAT + breakdown.purchaseVAT
          setTotalVAT(total)
          
          const chartData = [
            {
              name: "Sales VAT",
              value: breakdown.salesVAT,
              color: "#216477",
              percentage: total > 0 ? (breakdown.salesVAT / total) * 100 : 0
            },
            {
              name: "Purchase VAT",
              value: breakdown.purchaseVAT,
              color: "#dc2626",
              percentage: total > 0 ? (breakdown.purchaseVAT / total) * 100 : 0
            }
          ]
          setData(chartData)
        }
      } else {
        setError('Failed to load VAT breakdown data')
      }
    } catch (err) {
      setError('Error fetching VAT breakdown')
    } finally {
      setLoading(false)
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

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-normal text-gray-900 mb-2">{data.name}</p>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">
              Amount: <span className="font-normal text-gray-900">{formatCurrency(data.value)}</span>
            </p>
            <p className="text-sm text-gray-600">
              Share: <span className="font-normal text-gray-900">{data.percentage.toFixed(1)}%</span>
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null // Don't show labels for very small slices
    
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-sm font-normal"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  if (loading) {
    return (
      <Card className={`${className} card-modern`}>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-normal text-foreground flex items-center justify-between">
            VAT Breakdown
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-muted-foreground">Loading breakdown...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !data.length || totalVAT === 0) {
    return (
      <Card className={`${className} card-modern`}>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-normal text-foreground">VAT Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <PieChartIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-normal">No VAT data available</p>
              <p className="text-sm">Submit VAT returns to see breakdown</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`${className} card-modern hover-lift`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-normal text-foreground">VAT Breakdown</CardTitle>
        <p className="text-sm text-muted-foreground">Current year VAT composition</p>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={CustomLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                stroke="white"
                strokeWidth={2}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 space-y-3">
          <div className="text-center mb-4">
            <p className="text-sm text-muted-foreground">Total VAT Activity</p>
            <p className="text-2xl font-normal text-foreground">{formatCurrency(totalVAT)}</p>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-normal text-foreground">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-normal text-foreground">
                    {formatCurrency(item.value)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.percentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-normal text-foreground">Net VAT Due</span>
              <span className="text-sm font-normal text-primary">
                {formatCurrency(data[0]?.value - data[1]?.value || 0)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Sales VAT minus Purchase VAT
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}