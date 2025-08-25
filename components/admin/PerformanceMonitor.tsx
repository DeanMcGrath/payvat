"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Activity, 
  BarChart3, 
  Clock, 
  Eye, 
  Gauge, 
  RefreshCw, 
  Smartphone, 
  TrendingDown, 
  TrendingUp, 
  Zap 
} from 'lucide-react'

interface WebVitalsMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  threshold: { good: number; poor: number }
  unit: string
  description: string
}

interface PerformanceSummary {
  overall_performance: 'good' | 'needs-improvement' | 'poor'
  metrics: {
    [key: string]: {
      average: number
      rating: 'good' | 'needs-improvement' | 'poor'
      samples: number
    }
  }
  trends: {
    last_24h: 'improving' | 'stable' | 'degrading'
    last_7d: 'improving' | 'stable' | 'degrading'
    last_30d: 'improving' | 'stable' | 'degrading'
  }
  pages: {
    [url: string]: {
      lcp: number
      inp: number
      cls: number
    }
  }
}

export default function PerformanceMonitor() {
  const [summary, setSummary] = useState<PerformanceSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  // Core Web Vitals definitions
  const webVitalsMetrics: WebVitalsMetric[] = [
    {
      name: 'LCP',
      value: 0,
      rating: 'good',
      threshold: { good: 2500, poor: 4000 },
      unit: 'ms',
      description: 'Largest Contentful Paint - Time to render largest content element'
    },
    {
      name: 'INP',
      value: 0,
      rating: 'good',
      threshold: { good: 200, poor: 500 },
      unit: 'ms',
      description: 'Interaction to Next Paint - Response time to user interactions'
    },
    {
      name: 'CLS',
      value: 0,
      rating: 'good',
      threshold: { good: 0.1, poor: 0.25 },
      unit: '',
      description: 'Cumulative Layout Shift - Visual stability of page content'
    },
    {
      name: 'FCP',
      value: 0,
      rating: 'good',
      threshold: { good: 1800, poor: 3000 },
      unit: 'ms',
      description: 'First Contentful Paint - Time to render first content'
    },
    {
      name: 'TTFB',
      value: 0,
      rating: 'good',
      threshold: { good: 800, poor: 1800 },
      unit: 'ms',
      description: 'Time to First Byte - Server response time'
    }
  ]

  const fetchPerformanceData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/analytics/web-vitals')
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch performance data')
      }
      
      setSummary(result.data)
      setLastRefresh(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Performance data fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPerformanceData()
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchPerformanceData, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'text-green-600 bg-green-50 border-green-200'
      case 'needs-improvement': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'poor': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'good': return '✅'
      case 'needs-improvement': return '⚠️'
      case 'poor': return '❌'
      default: return '⭕'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'degrading': return <TrendingDown className="h-4 w-4 text-red-500" />
      default: return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getProgressValue = (value: number, threshold: { good: number; poor: number }, isLower = true) => {
    if (isLower) {
      // For metrics where lower is better (LCP, INP, FCP, TTFB)
      return Math.min((value / threshold.poor) * 100, 100)
    } else {
      // For CLS where 0 is best
      return Math.min((value / threshold.poor) * 100, 100)
    }
  }

  if (loading && !summary) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Gauge className="h-5 w-5 mr-2" />
            Performance Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Loading performance data...
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Gauge className="h-5 w-5 mr-2" />
            Performance Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">⚠️ {error}</div>
            <Button onClick={fetchPerformanceData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Gauge className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Performance Monitor</h2>
          <Badge className={getRatingColor(summary?.overall_performance || 'good')}>
            {getRatingIcon(summary?.overall_performance || 'good')} {summary?.overall_performance || 'Loading...'}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchPerformanceData} 
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Core Metrics</TabsTrigger>
          <TabsTrigger value="pages">Page Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {summary && Object.entries(summary.metrics).map(([metric, data]) => {
              const config = webVitalsMetrics.find(m => m.name === metric)
              if (!config) return null

              const progressValue = getProgressValue(
                data.average, 
                config.threshold, 
                metric !== 'CLS'
              )

              return (
                <Card key={metric}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">{metric}</h3>
                      <Badge className={getRatingColor(data.rating)}>
                        {getRatingIcon(data.rating)} {data.rating}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold">
                        {metric === 'CLS' ? data.average.toFixed(3) : Math.round(data.average)}
                        <span className="text-sm font-normal text-gray-500 ml-1">
                          {config.unit}
                        </span>
                      </div>
                      <Progress value={progressValue} className="h-2" />
                      <div className="text-xs text-gray-500">
                        {data.samples} samples
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Detailed Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          {webVitalsMetrics.map((metric) => {
            const data = summary?.metrics[metric.name]
            if (!data) return null

            return (
              <Card key={metric.name}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Zap className="h-5 w-5" />
                      <span>{metric.name}</span>
                      <Badge className={getRatingColor(data.rating)}>
                        {getRatingIcon(data.rating)} {data.rating}
                      </Badge>
                    </CardTitle>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {metric.name === 'CLS' ? data.average.toFixed(3) : Math.round(data.average)}
                        <span className="text-sm font-normal ml-1">{metric.unit}</span>
                      </div>
                      <div className="text-sm text-gray-500">{data.samples} samples</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{metric.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Performance</span>
                      <span>{data.rating}</span>
                    </div>
                    <Progress 
                      value={getProgressValue(data.average, metric.threshold, metric.name !== 'CLS')} 
                      className="h-3" 
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Good: &lt; {metric.threshold.good}{metric.unit}</span>
                      <span>Poor: &gt; {metric.threshold.poor}{metric.unit}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>

        {/* Page Analysis Tab */}
        <TabsContent value="pages" className="space-y-4">
          {summary && Object.entries(summary.pages).map(([page, metrics]) => (
            <Card key={page}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>{page}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold">{Math.round(metrics.lcp)}ms</div>
                    <div className="text-sm text-gray-500">LCP</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">{Math.round(metrics.inp)}ms</div>
                    <div className="text-sm text-gray-500">INP</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">{metrics.cls.toFixed(3)}</div>
                    <div className="text-sm text-gray-500">CLS</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {summary && Object.entries(summary.trends).map(([period, trend]) => (
              <Card key={period}>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    {getTrendIcon(trend)}
                  </div>
                  <div className="font-semibold capitalize">
                    {period.replace('_', ' ')}
                  </div>
                  <div className="text-sm text-gray-500 capitalize">
                    {trend}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}