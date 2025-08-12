"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Brain, 
  TrendingUp, 
  FileText, 
  Users, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  BarChart3,
  Settings,
  RefreshCw,
  Play,
  Pause,
  Activity
} from 'lucide-react'

interface LearningMetrics {
  totalFeedback: number
  averageAccuracy: number
  templatesCreated: number
  templatesActive: number
  processingJobs: number
  lastLearningRun: string
}

interface PipelineStatus {
  isRunning: boolean
  currentJobs: any[]
  recentMetrics: any
}

interface FeedbackAnalytics {
  timeRange: string
  totalFeedback: number
  averageConfidence: number
  accuracyTrend: Array<{
    type: string
    count: number
    percentage: string
  }>
  topCorrectedFields: Array<{
    field: string
    count: number
  }>
  recentFeedback: Array<{
    id: string
    documentName: string
    userEmail: string
    businessName: string
    feedback: string
    createdAt: string
    correctionsCount: number
  }>
}

export default function AITrainingDashboard() {
  const [metrics, setMetrics] = useState<LearningMetrics>({
    totalFeedback: 0,
    averageAccuracy: 0,
    templatesCreated: 0,
    templatesActive: 0,
    processingJobs: 0,
    lastLearningRun: 'Never'
  })
  
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus>({
    isRunning: false,
    currentJobs: [],
    recentMetrics: {}
  })
  
  const [feedbackAnalytics, setFeedbackAnalytics] = useState<FeedbackAnalytics>({
    timeRange: '30d',
    totalFeedback: 0,
    averageConfidence: 0,
    accuracyTrend: [],
    topCorrectedFields: [],
    recentFeedback: []
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadDashboardData()
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      if (!refreshing) setIsLoading(true)
      setError(null)

      // Load all dashboard data in parallel
      const [metricsRes, statusRes, analyticsRes] = await Promise.all([
        fetch('/api/admin/ai/metrics'),
        fetch('/api/admin/ai/pipeline-status'),
        fetch('/api/ai/feedback?timeRange=30d')
      ])

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json()
        if (metricsData.success) {
          setMetrics(metricsData.metrics)
        }
      }

      if (statusRes.ok) {
        const statusData = await statusRes.json()
        if (statusData.success) {
          setPipelineStatus(statusData.status)
        }
      }

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json()
        if (analyticsData.success) {
          setFeedbackAnalytics(analyticsData.analytics)
        }
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setError('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadDashboardData()
  }

  const togglePipeline = async () => {
    try {
      const action = pipelineStatus.isRunning ? 'stop' : 'start'
      const response = await fetch(`/api/admin/ai/pipeline/${action}`, {
        method: 'POST'
      })
      
      if (response.ok) {
        await loadDashboardData()
      }
    } catch (error) {
      console.error('Error toggling pipeline:', error)
    }
  }

  const triggerLearning = async () => {
    try {
      const response = await fetch('/api/admin/ai/trigger-learning', {
        method: 'POST'
      })
      
      if (response.ok) {
        await loadDashboardData()
      }
    } catch (error) {
      console.error('Error triggering learning:', error)
    }
  }

  if (isLoading && !refreshing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-600 border-t-transparent"></div>
          <span className="text-gray-600">Loading AI Training Dashboard...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <span className="text-lg font-medium text-red-800">Error</span>
            </div>
            <p className="text-red-600 text-center mb-4">{error}</p>
            <Button onClick={loadDashboardData} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Brain className="h-8 w-8 mr-3 text-teal-600" />
              AI Training Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Monitor and control the PayVAT.ie AI learning system
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            
            <Button
              onClick={togglePipeline}
              variant={pipelineStatus.isRunning ? "destructive" : "default"}
              className="flex items-center"
            >
              {pipelineStatus.isRunning ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Stop Pipeline
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Pipeline
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Pipeline Status */}
        <Card className={`${pipelineStatus.isRunning ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
          <CardHeader>
            <CardTitle className={`flex items-center ${pipelineStatus.isRunning ? 'text-green-800' : 'text-yellow-800'}`}>
              <Activity className="h-5 w-5 mr-2" />
              Learning Pipeline Status
              <Badge 
                variant={pipelineStatus.isRunning ? "default" : "secondary"}
                className={`ml-3 ${pipelineStatus.isRunning ? 'bg-green-600' : 'bg-yellow-600'}`}
              >
                {pipelineStatus.isRunning ? 'RUNNING' : 'STOPPED'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-2xl font-bold">{pipelineStatus.currentJobs.length}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Last Run</p>
                <p className="text-lg">{metrics.lastLearningRun}</p>
              </div>
              <div>
                <Button
                  onClick={triggerLearning}
                  disabled={!pipelineStatus.isRunning}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Trigger Learning Now
                </Button>
              </div>
            </div>
            
            {/* Current Jobs */}
            {pipelineStatus.currentJobs.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-900 mb-2">Current Jobs</h4>
                <div className="space-y-2">
                  {pipelineStatus.currentJobs.map((job, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          job.status === 'RUNNING' ? 'bg-blue-500 animate-pulse' :
                          job.status === 'COMPLETED' ? 'bg-green-500' :
                          job.status === 'FAILED' ? 'bg-red-500' :
                          'bg-gray-400'
                        }`} />
                        <span className="text-sm font-medium">{job.type}</span>
                      </div>
                      <Badge variant="outline">{job.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Total Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-teal-600">{feedbackAnalytics.totalFeedback.toLocaleString()}</div>
              <p className="text-xs text-gray-500 mt-1">User corrections collected</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Average Accuracy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {(feedbackAnalytics.averageConfidence * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-gray-500 mt-1">Based on user feedback</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Active Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{metrics.templatesActive}</div>
              <p className="text-xs text-gray-500 mt-1">
                {metrics.templatesCreated} created total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Processing Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{pipelineStatus.currentJobs.length}</div>
              <p className="text-xs text-gray-500 mt-1">Currently running</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <Tabs defaultValue="feedback" className="space-y-4">
          <TabsList>
            <TabsTrigger value="feedback">Feedback Analysis</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="patterns">Learning Patterns</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          {/* Feedback Analysis */}
          <TabsContent value="feedback">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Accuracy Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Accuracy Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {feedbackAnalytics.accuracyTrend.length > 0 ? (
                    <div className="space-y-3">
                      {feedbackAnalytics.accuracyTrend.map((item) => (
                        <div key={item.type} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded ${
                              item.type === 'CORRECT' ? 'bg-green-500' :
                              item.type === 'PARTIALLY_CORRECT' ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`} />
                            <span className="text-sm font-medium">
                              {item.type.replace('_', ' ').toLowerCase()}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold">{item.percentage}%</span>
                            <span className="text-xs text-gray-500 ml-2">({item.count})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No feedback data available</p>
                  )}
                </CardContent>
              </Card>

              {/* Top Corrected Fields */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Most Corrected Fields
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {feedbackAnalytics.topCorrectedFields.length > 0 ? (
                    <div className="space-y-3">
                      {feedbackAnalytics.topCorrectedFields.slice(0, 8).map((field, index) => (
                        <div key={field.field} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{field.field}</span>
                          <Badge variant="outline">{field.count} corrections</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No correction data available</p>
                  )}
                </CardContent>
              </Card>

              {/* Recent Feedback */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Recent Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                  {feedbackAnalytics.recentFeedback.length > 0 ? (
                    <div className="space-y-3">
                      {feedbackAnalytics.recentFeedback.slice(0, 10).map((feedback) => (
                        <div key={feedback.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <span className="text-sm font-medium">{feedback.documentName}</span>
                              <Badge 
                                variant={
                                  feedback.feedback === 'CORRECT' ? 'default' :
                                  feedback.feedback === 'PARTIALLY_CORRECT' ? 'secondary' :
                                  'destructive'
                                }
                                className="text-xs"
                              >
                                {feedback.feedback}
                              </Badge>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {feedback.businessName} • {feedback.correctionsCount} corrections
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(feedback.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No recent feedback</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle>Document Templates</CardTitle>
                <p className="text-sm text-gray-600">
                  AI-generated templates for faster document processing
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Template management interface coming soon</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Currently {metrics.templatesActive} active templates
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Learning Patterns Tab */}
          <TabsContent value="patterns">
            <Card>
              <CardHeader>
                <CardTitle>Learning Patterns</CardTitle>
                <p className="text-sm text-gray-600">
                  AI-discovered patterns in document processing
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Pattern analysis interface coming soon</p>
                  <p className="text-sm text-gray-400 mt-2">
                    AI is continuously learning from user interactions
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <p className="text-sm text-gray-600">
                  System performance and optimization insights
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Performance dashboard coming soon</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Tracking processing speed, accuracy trends, and cost optimization
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}