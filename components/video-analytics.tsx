'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Eye, 
  Users, 
  Clock, 
  TrendingUp, 
  Monitor, 
  Smartphone, 
  Tablet,
  Chrome,
  Globe,
  RefreshCw,
  BarChart3
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface VideoAnalyticsSummary {
  totalViews: number
  uniqueViewers: number
  avgWatchDuration: number
  avgCompletionRate: number
  totalWatchTime: number
}

interface VideoAnalyticsBreakdown {
  devices: Record<string, number>
  browsers: Record<string, number>
}

interface VideoAnalyticsData {
  summary: VideoAnalyticsSummary
  breakdown: VideoAnalyticsBreakdown
  timeline: Record<string, number>
  period: string
}

interface VideoAnalyticsProps {
  videoId: string
  className?: string
}

const deviceIcons: Record<string, React.ElementType> = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
  unknown: Globe
}

export function VideoAnalytics({ videoId, className }: VideoAnalyticsProps) {
  const [analytics, setAnalytics] = useState<VideoAnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<string>('30')

  const fetchAnalytics = useCallback(async () => {
    if (!videoId) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/videos/analytics?videoId=${videoId}&period=${period}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${document.cookie.split('auth=')[1]?.split(';')[0] || ''}`,
          'Accept': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to load analytics')
      }

      setAnalytics(data.analytics)
    } catch (err) {
      console.error('Analytics fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }, [videoId, period])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const formatDuration = (seconds: number) => {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = Math.round(seconds % 60)
      return `${minutes}m ${remainingSeconds}s`
    } else {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      return `${hours}h ${minutes}m`
    }
  }

  const getDeviceIcon = (deviceType: string) => {
    const IconComponent = deviceIcons[deviceType] || deviceIcons.unknown
    return <IconComponent className="h-4 w-4" />
  }

  const getTopItems = (data: Record<string, number>, limit = 5) => {
    return Object.entries(data)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Video Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Video Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchAnalytics} size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analytics) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Video Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600">No analytics data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with Period Selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Video Analytics
              </CardTitle>
              <CardDescription>
                Performance metrics for the last {analytics.period}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={fetchAnalytics} size="sm" variant="outline">
                <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.summary.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              All video plays
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Viewers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.summary.uniqueViewers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Individual visitors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Watch Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(analytics.summary.avgWatchDuration)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per viewer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.summary.avgCompletionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Video completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Device Types</CardTitle>
            <CardDescription>Views by device category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getTopItems(analytics.breakdown.devices).map(([device, count]) => {
                const percentage = analytics.summary.uniqueViewers > 0 
                  ? (count / analytics.summary.uniqueViewers) * 100 
                  : 0
                
                return (
                  <div key={device} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getDeviceIcon(device)}
                      <span className="text-sm font-medium capitalize">{device}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        {count}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Browser Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Browsers</CardTitle>
            <CardDescription>Views by browser type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getTopItems(analytics.breakdown.browsers).map(([browser, count]) => {
                const percentage = analytics.summary.uniqueViewers > 0 
                  ? (count / analytics.summary.uniqueViewers) * 100 
                  : 0
                
                return (
                  <div key={browser} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4" />
                      <span className="text-sm font-medium capitalize">{browser}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        {count}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {formatDuration(analytics.summary.totalWatchTime)}
              </div>
              <div className="text-sm text-muted-foreground">Total Watch Time</div>
            </div>
            
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {analytics.summary.uniqueViewers > 0 
                  ? (analytics.summary.totalViews / analytics.summary.uniqueViewers).toFixed(1)
                  : '0'
                }
              </div>
              <div className="text-sm text-muted-foreground">Avg Views per Viewer</div>
            </div>
            
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Object.keys(analytics.timeline).length}
              </div>
              <div className="text-sm text-muted-foreground">Days with Views</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}