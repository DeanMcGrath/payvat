"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus, LucideIcon } from "lucide-react"
import { ReactNode } from "react"

interface EnhancedStatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  iconColor?: string
  trend?: {
    value: number
    period: string
  }
  status?: {
    type: 'success' | 'warning' | 'error' | 'info'
    text: string
  }
  sparklineData?: number[]
  className?: string
  loading?: boolean
}

export default function EnhancedStatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = "text-white",
  trend,
  status,
  sparklineData,
  className,
  loading = false
}: EnhancedStatsCardProps) {
  
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `€${(val / 1000000).toFixed(1)}M`
      } else if (val >= 1000) {
        return `€${(val / 1000).toFixed(1)}K`
      } else {
        return new Intl.NumberFormat('en-IE', {
          style: 'currency',
          currency: 'EUR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(val)
      }
    }
    return val
  }

  const getTrendIcon = () => {
    if (!trend) return null
    if (trend.value > 0) return <TrendingUp className="h-3 w-3" />
    if (trend.value < 0) return <TrendingDown className="h-3 w-3" />
    return <Minus className="h-3 w-3" />
  }

  const getTrendColor = () => {
    if (!trend) return "text-gray-500"
    if (trend.value > 0) return "text-green-600"
    if (trend.value < 0) return "text-red-600"
    return "text-gray-500"
  }

  const getStatusColor = () => {
    if (!status) return "default"
    switch (status.type) {
      case 'success': return "default"
      case 'warning': return "secondary"
      case 'error': return "destructive"
      case 'info': return "outline"
      default: return "default"
    }
  }

  const getStatusBgColor = () => {
    if (!status) return "bg-gray-100"
    switch (status.type) {
      case 'success': return "bg-green-50 text-green-700"
      case 'warning': return "bg-yellow-50 text-yellow-700"
      case 'error': return "bg-red-50 text-red-700"
      case 'info': return "bg-blue-50 text-blue-700"
      default: return "bg-gray-50 text-gray-700"
    }
  }

  // Simple sparkline component
  const Sparkline = ({ data }: { data: number[] }) => {
    if (!data || data.length < 2) return null
    
    const max = Math.max(...data)
    const min = Math.min(...data)
    const range = max - min || 1
    
    const points = data.map((val, index) => {
      const x = (index / (data.length - 1)) * 60
      const y = 20 - ((val - min) / range) * 20
      return `${x},${y}`
    }).join(' ')
    
    return (
      <svg width="60" height="20" className="opacity-70">
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  if (loading) {
    return (
      <Card className={`card-modern p-6 hover-lift ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        </div>
      </Card>
    )
  }

  return (
    <Card className={`card-modern p-6 hover-lift transition-all duration-200 ${className}`}>
      <CardContent className="p-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground font-medium mb-1">{title}</p>
            <div className="flex items-baseline space-x-2">
              <div className="text-3xl font-bold text-foreground">
                {formatValue(value)}
              </div>
              {trend && (
                <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
                  {getTrendIcon()}
                  <span className="text-sm font-medium">
                    {Math.abs(trend.value).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          
          <div className="flex flex-col items-end space-y-2">
            <div className="icon-premium">
              <Icon className={`h-6 w-6 ${iconColor}`} />
            </div>
            {sparklineData && (
              <div className="text-muted-foreground">
                <Sparkline data={sparklineData} />
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          {status && (
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBgColor()}`}>
              {status.text}
            </div>
          )}
          
          {trend && (
            <div className="text-xs text-muted-foreground">
              vs {trend.period}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}