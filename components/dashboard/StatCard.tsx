/**
 * StatCard - Reusable component for displaying statistics and KPIs
 * Used throughout the dashboard for key metrics
 */

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: number
    direction: 'up' | 'down' | 'neutral'
    period?: string
  }
  icon?: LucideIcon
  variant?: 'default' | 'brand' | 'success' | 'warning' | 'error'
  loading?: boolean
  className?: string
}

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  variant = 'default',
  loading = false,
  className = '',
}: StatCardProps) {
  // Variant styling
  const variants = {
    default: {
      card: 'bg-white border-neutral-200',
      title: 'text-neutral-600',
      value: 'text-neutral-900',
      icon: 'text-neutral-500',
    },
    brand: {
      card: 'bg-brand-50 border-brand-200',
      title: 'text-brand-700',
      value: 'text-brand-900',
      icon: 'text-brand-600',
    },
    success: {
      card: 'bg-green-50 border-green-200',
      title: 'text-green-700',
      value: 'text-green-900',
      icon: 'text-green-600',
    },
    warning: {
      card: 'bg-amber-50 border-amber-200',
      title: 'text-amber-700',
      value: 'text-amber-900',
      icon: 'text-amber-600',
    },
    error: {
      card: 'bg-red-50 border-red-200',
      title: 'text-red-700',
      value: 'text-red-900',
      icon: 'text-red-600',
    },
  }

  const styles = variants[variant]

  // Trend styling
  const getTrendStyles = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up':
        return {
          color: 'text-green-600',
          bg: 'bg-green-100',
          icon: TrendingUp,
        }
      case 'down':
        return {
          color: 'text-red-600',
          bg: 'bg-red-100',
          icon: TrendingDown,
        }
      case 'neutral':
      default:
        return {
          color: 'text-neutral-600',
          bg: 'bg-neutral-100',
          icon: Minus,
        }
    }
  }

  const trendStyles = trend ? getTrendStyles(trend.direction) : null

  if (loading) {
    return (
      <Card className={`${styles.card} border ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-3 flex-1">
              <div className="h-4 bg-neutral-200 rounded animate-pulse" />
              <div className="h-8 bg-neutral-200 rounded animate-pulse w-24" />
              {subtitle && <div className="h-3 bg-neutral-200 rounded animate-pulse w-16" />}
            </div>
            {Icon && (
              <div className="h-10 w-10 bg-neutral-200 rounded animate-pulse" />
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`${styles.card} border shadow-sm hover:shadow-md transition-all duration-200 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            {/* Title */}
            <p className={`body-sm font-medium ${styles.title}`}>
              {title}
            </p>
            
            {/* Value */}
            <p className={`text-2xl lg:text-3xl font-bold ${styles.value}`}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            
            {/* Subtitle */}
            {subtitle && (
              <p className="text-xs text-neutral-500">
                {subtitle}
              </p>
            )}
            
            {/* Trend */}
            {trend && trendStyles && (
              <div className="flex items-center space-x-2">
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${trendStyles.bg}`}>
                  <trendStyles.icon className={`h-3 w-3 ${trendStyles.color}`} />
                  <span className={`text-xs font-medium ${trendStyles.color}`}>
                    {Math.abs(trend.value)}%
                  </span>
                </div>
                {trend.period && (
                  <span className="text-xs text-neutral-500">
                    vs {trend.period}
                  </span>
                )}
              </div>
            )}
          </div>
          
          {/* Icon */}
          {Icon && (
            <div className={`h-10 w-10 flex items-center justify-center rounded-lg bg-white shadow-sm`}>
              <Icon className={`h-6 w-6 ${styles.icon}`} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Grid container for StatCards
 */
interface StatCardGridProps {
  children: React.ReactNode
  columns?: 1 | 2 | 3 | 4
  className?: string
}

export function StatCardGrid({ 
  children, 
  columns = 3,
  className = '' 
}: StatCardGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-6 ${className}`}>
      {children}
    </div>
  )
}

/**
 * Preset StatCard configurations for common dashboard metrics
 */
export function DocumentsStatCard({ total, processed }: { total: number; processed: number }) {
  const processingRate = total > 0 ? Math.round((processed / total) * 100) : 0
  
  return (
    <StatCard
      title="Documents"
      value={total}
      subtitle={`${processed} processed`}
      trend={{
        value: processingRate,
        direction: processingRate >= 80 ? 'up' : processingRate >= 50 ? 'neutral' : 'down',
        period: 'completion rate'
      }}
      variant="default"
    />
  )
}

export function VATStatCard({ 
  title, 
  amount, 
  documentCount 
}: { 
  title: string
  amount: number
  documentCount: number 
}) {
  return (
    <StatCard
      title={title}
      value={`€${amount.toFixed(2)}`}
      subtitle={`${documentCount} documents`}
      variant={title.includes('Sales') ? 'brand' : 'success'}
    />
  )
}

export function NetVATStatCard({ amount }: { amount: number }) {
  const isPositive = amount >= 0
  
  return (
    <StatCard
      title="Net VAT Due"
      value={`€${Math.abs(amount).toFixed(2)}`}
      subtitle={isPositive ? 'Payable to Revenue' : 'Refund due'}
      variant={isPositive ? 'warning' : 'success'}
      trend={{
        value: Math.abs(amount),
        direction: isPositive ? 'up' : 'down',
      }}
    />
  )
}