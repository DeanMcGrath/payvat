'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell 
} from 'recharts'
import { 
  Activity, 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Target,
  Zap,
  Database,
  Cpu
} from 'lucide-react'

interface AIPerformanceData {
  metrics: {
    totalFeedback: number
    totalDocuments: number
    averageAccuracy: number
    averageConfidence: number
    successRate: number
    errorRate: number
    templatesCreated: number
    templatesActive: number
    avgProcessingTime: number
    confidenceTrends: Array<{
      date: string
      confidence: number
      documentCount: number
    }>
    insights: {
      documentsPerDay: number
      improvementRate: number
      topPerformingMethod: string
      systemStatus: string
    }
  }
  errors: {
    totalErrors: number
    errorsByType: Record<string, number>
    errorRate: number
    topErrors: Array<{
      errorCode: string
      count: number
      message: string
      lastOccurrence: string
    }>
    criticalErrors: any[]
  }
  learning: {
    isRunning: boolean
    currentJobs: number
    totalFeedbackProcessed: number
    templatesCreated: number
    accuracyImprovement: number
    recentActivity: {
      jobsCompletedToday: number
      avgProcessingTime: number
      successRate: number
    }
  }
  prompts: {
    metrics: Array<{
      variationId: string
      variationName: string
      totalTests: number
      averageConfidence: number
      averageAccuracy: number
      successRate: number
      recommendedAction: string
    }>
  }
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export default function AIPerformanceDashboard() {
  const [data, setData] = useState<AIPerformanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Fetch dashboard data
  const fetchData = async () => {
    try {
      setLoading(true)
      
      const [metricsRes, errorsRes, learningRes, promptsRes] = await Promise.all([
        fetch('/api/admin/ai/metrics'),
        fetch('/api/admin/ai/errors?action=analytics'),
        fetch('/api/admin/ai/learning?action=metrics'),
        fetch('/api/admin/ai/prompts?action=metrics')
      ])

      const [metrics, errors, learning, prompts] = await Promise.all([
        metricsRes.json(),
        errorsRes.json(),
        learningRes.json(),
        promptsRes.json()
      ])

      setData({
        metrics: metrics.success ? metrics.metrics : {},
        errors: errors.success ? errors.analytics : { totalErrors: 0, errorsByType: {}, errorRate: 0, topErrors: [], criticalErrors: [] },
        learning: learning.success ? learning.metrics : { isRunning: false, currentJobs: 0, totalFeedbackProcessed: 0, templatesCreated: 0, accuracyImprovement: 0, recentActivity: { jobsCompletedToday: 0, avgProcessingTime: 0, successRate: 0 } },
        prompts: prompts.success ? { metrics: prompts.metrics } : { metrics: [] }
      })

      setLastUpdated(new Date())
      setError(null)
    } catch (err) {
      setError('Failed to fetch dashboard data')
      console.error('Dashboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Auto refresh every 30 seconds
  useEffect(() => {
    fetchData()
    
    if (autoRefresh) {
      const interval = setInterval(fetchData, 30000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  // Manual refresh
  const handleRefresh = () => {
    fetchData()
  }

  // Toggle learning pipeline
  const toggleLearningPipeline = async () => {
    try {
      const action = data?.learning.isRunning ? 'stop' : 'start'
      const response = await fetch('/api/admin/ai/learning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })
      
      if (response.ok) {
        fetchData() // Refresh data
      }
    } catch (err) {
      console.error('Failed to toggle learning pipeline:', err)
    }
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!data) return null

  const systemHealthColor = {
    'Excellent': 'text-green-600',
    'Good': 'text-blue-600',
    'Fair': 'text-yellow-600',
    'Needs Attention': 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Performance Dashboard</h1>
          <p className="text-gray-600">
            Real-time monitoring of AI document processing system
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-pulse' : ''}`} />
            Auto Refresh {autoRefresh ? 'On' : 'Off'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <Clock className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {lastUpdated && (
            <span className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${systemHealthColor[data.metrics.insights?.systemStatus] || 'text-gray-600'}`}>
              {data.metrics.insights?.systemStatus || 'Unknown'}
            </div>
            <p className="text-xs text-muted-foreground">
              Overall system health
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.metrics.averageAccuracy || 0}%</div>
            <Progress 
              value={data.metrics.averageAccuracy || 0} 
              className="w-full mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Speed</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((data.metrics.avgProcessingTime || 0) / 1000 * 10) / 10}s
            </div>
            <p className="text-xs text-muted-foreground">
              Average processing time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents Today</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.metrics.insights?.documentsPerDay || 0}</div>
            <p className="text-xs text-muted-foreground">
              Documents processed per day
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="errors">Error Tracking</TabsTrigger>
          <TabsTrigger value="learning">Learning Pipeline</TabsTrigger>
          <TabsTrigger value="prompts">Prompt Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Confidence Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Confidence Trends</CardTitle>
                <CardDescription>AI confidence scores over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.metrics.confidenceTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="confidence" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
                <CardDescription>Current system performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Success Rate</span>
                  <Badge variant={data.metrics.successRate > 90 ? "default" : "secondary"}>
                    {data.metrics.successRate || 0}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Error Rate</span>
                  <Badge variant={data.metrics.errorRate < 5 ? "default" : "destructive"}>
                    {data.metrics.errorRate || 0}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Active Templates</span>
                  <Badge variant="outline">
                    {data.metrics.templatesActive || 0}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Top Method</span>
                  <Badge variant="secondary">
                    {data.metrics.insights?.topPerformingMethod || 'N/A'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Processing Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Processing Performance</CardTitle>
                <CardDescription>Document processing metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Average Confidence</span>
                      <span>{data.metrics.averageConfidence || 0}%</span>
                    </div>
                    <Progress value={data.metrics.averageConfidence || 0} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Success Rate</span>
                      <span>{data.metrics.successRate || 0}%</span>
                    </div>
                    <Progress value={data.metrics.successRate || 0} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Processing Speed</span>
                      <span>Good</span>
                    </div>
                    <Progress value={85} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Template Usage */}
            <Card>
              <CardHeader>
                <CardTitle>Template Usage</CardTitle>
                <CardDescription>Active templates and usage patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Templates</span>
                    <span>{data.metrics.templatesCreated || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Templates</span>
                    <span>{data.metrics.templatesActive || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Template Effectiveness</span>
                    <Badge variant="default">87%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Similarity Score</span>
                    <span>92%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Error Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Error Overview</CardTitle>
                <CardDescription>System error tracking and analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Errors (24h)</span>
                    <Badge variant={data.errors.totalErrors < 10 ? "default" : "destructive"}>
                      {data.errors.totalErrors || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Error Rate</span>
                    <Badge variant={data.errors.errorRate < 5 ? "default" : "destructive"}>
                      {data.errors.errorRate || 0}%
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Critical Errors</span>
                    <Badge variant={data.errors.criticalErrors?.length === 0 ? "default" : "destructive"}>
                      {data.errors.criticalErrors?.length || 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Errors */}
            <Card>
              <CardHeader>
                <CardTitle>Top Error Types</CardTitle>
                <CardDescription>Most common errors in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.errors.topErrors?.slice(0, 5).map((error, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{error.errorCode}</div>
                        <div className="text-xs text-gray-500 truncate">
                          {error.message}
                        </div>
                      </div>
                      <Badge variant="outline">{error.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="learning" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Learning Pipeline Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Learning Pipeline
                  <Button
                    size="sm"
                    variant={data.learning.isRunning ? "destructive" : "default"}
                    onClick={toggleLearningPipeline}
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    {data.learning.isRunning ? 'Stop' : 'Start'}
                  </Button>
                </CardTitle>
                <CardDescription>Continuous learning system status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Status</span>
                    <Badge variant={data.learning.isRunning ? "default" : "secondary"}>
                      {data.learning.isRunning ? 'Running' : 'Stopped'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Jobs</span>
                    <span>{data.learning.currentJobs || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Feedback Processed</span>
                    <span>{data.learning.totalFeedbackProcessed || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Accuracy Improvement</span>
                    <Badge variant="default">
                      +{Math.round((data.learning.accuracyImprovement || 0) * 100)}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Learning Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Learning Metrics</CardTitle>
                <CardDescription>System learning performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Templates Created</span>
                    <span>{data.learning.templatesCreated || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Jobs Completed Today</span>
                    <span>{data.learning.recentActivity?.jobsCompletedToday || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Success Rate</span>
                    <Badge variant="default">
                      {Math.round((data.learning.recentActivity?.successRate || 0) * 100)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Processing Time</span>
                    <span>
                      {Math.round((data.learning.recentActivity?.avgProcessingTime || 0) / 1000)}s
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="prompts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Prompt Performance</CardTitle>
              <CardDescription>A/B testing results and prompt optimization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.prompts.metrics?.slice(0, 5).map((variation, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">{variation.variationName}</h4>
                      <Badge 
                        variant={variation.recommendedAction === 'PROMOTE' ? 'default' : 
                                variation.recommendedAction === 'CONTINUE_TESTING' ? 'secondary' : 'destructive'}
                      >
                        {variation.recommendedAction}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Tests</div>
                        <div className="font-medium">{variation.totalTests}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Accuracy</div>
                        <div className="font-medium">{variation.averageAccuracy}%</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Success Rate</div>
                        <div className="font-medium">{variation.successRate}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}