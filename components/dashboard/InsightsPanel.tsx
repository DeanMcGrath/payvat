"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Lightbulb, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Calendar,
  Euro,
  FileText,
  Loader2,
  ChevronRight,
  Target,
  Shield
} from "lucide-react"

interface Insight {
  id: string
  type: 'optimization' | 'deadline' | 'compliance' | 'trend' | 'action'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  action?: {
    text: string
    href: string
  }
  savings?: number
  daysUntilDue?: number
  completed?: boolean
}

interface InsightsPanelProps {
  className?: string
}

export default function InsightsPanel({ className }: InsightsPanelProps) {
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInsights()
  }, [])

  const fetchInsights = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/reports?type=insights', {
        method: 'GET',
        credentials: 'include'
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.report?.insights) {
          setInsights(result.report.insights)
        } else {
          // Generate mock insights for now
          generateMockInsights()
        }
      } else {
        generateMockInsights()
      }
    } catch (err) {
      generateMockInsights()
    } finally {
      setLoading(false)
    }
  }

  const generateMockInsights = () => {
    const mockInsights: Insight[] = [
      {
        id: '1',
        type: 'deadline',
        priority: 'high',
        title: 'VAT Return Due Soon',
        description: 'Your next VAT return is due in 7 days. Start preparing now to avoid penalties.',
        daysUntilDue: 7,
        action: {
          text: 'Start VAT Return',
          href: '/vat-period'
        }
      },
      {
        id: '2',
        type: 'optimization',
        priority: 'medium',
        title: 'Early Filing Savings',
        description: 'Filing your VAT return early could save you €150 in accountant fees.',
        savings: 150,
        action: {
          text: 'File Early',
          href: '/vat-period'
        }
      },
      {
        id: '3',
        type: 'trend',
        priority: 'low',
        title: 'VAT Trend Analysis',
        description: 'Your VAT payments have increased by 15% compared to last quarter, indicating business growth.',
        action: {
          text: 'View Trends',
          href: '/reports'
        }
      },
      {
        id: '4',
        type: 'compliance',
        priority: 'medium',
        title: 'Document Upload Reminder',
        description: 'Upload your latest invoices to ensure accurate VAT calculations.',
        action: {
          text: 'Upload Documents',
          href: '/vat-submission'
        }
      },
      {
        id: '5',
        type: 'action',
        priority: 'low',
        title: 'Review Tax Calendar',
        description: 'Check your upcoming tax deadlines to stay compliant.',
        action: {
          text: 'View Calendar',
          href: '/tax-calendar-ireland'
        }
      }
    ]
    setInsights(mockInsights)
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'deadline': return <Clock className="h-5 w-5" />
      case 'optimization': return <Target className="h-5 w-5" />
      case 'compliance': return <Shield className="h-5 w-5" />
      case 'trend': return <TrendingUp className="h-5 w-5" />
      case 'action': return <CheckCircle className="h-5 w-5" />
      default: return <Lightbulb className="h-5 w-5" />
    }
  }

  const getInsightColor = (type: string, priority: string) => {
    if (priority === 'high') return "text-red-500"
    if (priority === 'medium') return "text-yellow-500"
    
    switch (type) {
      case 'deadline': return "text-red-500"
      case 'optimization': return "text-green-500"
      case 'compliance': return "text-blue-500"
      case 'trend': return "text-purple-500"
      case 'action': return "text-gray-500"
      default: return "text-blue-500"
    }
  }

  const getBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'high': return "destructive"
      case 'medium': return "secondary"
      case 'low': return "outline"
      default: return "outline"
    }
  }

  const getBadgeText = (priority: string) => {
    switch (priority) {
      case 'high': return "High Priority"
      case 'medium': return "Medium Priority"
      case 'low': return "Low Priority"
      default: return "Priority"
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

  const handleInsightAction = (insight: Insight) => {
    if (insight.action) {
      window.location.href = insight.action.href
    }
  }

  if (loading) {
    return (
      <Card className={`${className} card-modern`}>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-foreground flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Lightbulb className="h-6 w-6 text-primary" />
              <span>Smart Insights</span>
            </div>
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !insights.length) {
    return (
      <Card className={`${className} card-modern`}>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-foreground flex items-center space-x-2">
            <Lightbulb className="h-6 w-6 text-primary" />
            <span>Smart Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <div className="text-center">
              <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No insights available</p>
              <p className="text-sm">Insights will appear as you use the platform</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`${className} card-modern hover-lift`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-foreground flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lightbulb className="h-6 w-6 text-primary" />
            <span>Smart Insights</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {insights.length} insights
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">AI-powered recommendations for your VAT management</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.slice(0, 4).map((insight) => (
            <div 
              key={insight.id}
              className="group p-4 border border-gray-200 rounded-lg hover:border-primary/30 hover:bg-gray-50/50 transition-all duration-200 cursor-pointer"
              onClick={() => handleInsightAction(insight)}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg bg-gray-100 ${getInsightColor(insight.type, insight.priority)}`}>
                  {getInsightIcon(insight.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {insight.title}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getBadgeVariant(insight.priority)} className="text-xs">
                        {getBadgeText(insight.priority)}
                      </Badge>
                      {insight.action && (
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {insight.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      {insight.savings && (
                        <div className="flex items-center space-x-1 text-green-600">
                          <Euro className="h-3 w-3" />
                          <span>Save {formatCurrency(insight.savings)}</span>
                        </div>
                      )}
                      {insight.daysUntilDue && (
                        <div className="flex items-center space-x-1 text-red-600">
                          <Calendar className="h-3 w-3" />
                          <span>{insight.daysUntilDue} days left</span>
                        </div>
                      )}
                    </div>
                    
                    {insight.action && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs h-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleInsightAction(insight)
                        }}
                      >
                        {insight.action.text}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {insights.length > 4 && (
            <Button 
              variant="ghost" 
              className="w-full mt-4 text-sm"
              onClick={() => window.location.href = '/reports'}
            >
              View All Insights
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}