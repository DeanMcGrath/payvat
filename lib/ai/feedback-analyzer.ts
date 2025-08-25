/**
 * Automated Feedback Loop Analysis System
 * Analyzes user feedback patterns to identify improvement opportunities
 */

import { prisma } from '@/lib/prisma'
import { logInfo, logError } from '@/lib/secure-logger'

export interface FeedbackPattern {
  id: string
  patternType: 'ACCURACY_ISSUE' | 'CONFIDENCE_ISSUE' | 'PROCESSING_ERROR' | 'USER_CORRECTION' | 'TEMPLATE_MISMATCH'
  description: string
  frequency: number
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  affectedDocuments: number
  suggestedImprovements: string[]
  confidenceImpact: number // -1 to 1, impact on confidence scores
  accuracyImpact: number // -1 to 1, impact on accuracy
  firstSeen: Date
  lastSeen: Date
  trend: 'INCREASING' | 'STABLE' | 'DECREASING'
}

export interface FeedbackInsight {
  category: string
  title: string
  description: string
  impact: 'LOW' | 'MEDIUM' | 'HIGH'
  actionable: boolean
  suggestedActions: Array<{
    action: string
    priority: 'LOW' | 'MEDIUM' | 'HIGH'
    estimatedEffort: string
    expectedImprovement: string
  }>
  supportingData: {
    documentCount: number
    errorRate: number
    avgConfidence: number
    userSatisfaction?: number
  }
}

export interface FeedbackAnalysisReport {
  generatedAt: Date
  analysisPeriod: {
    startDate: Date
    endDate: Date
    totalFeedback: number
    totalDocuments: number
  }
  overallHealth: {
    score: number // 0-100
    trend: 'IMPROVING' | 'STABLE' | 'DECLINING'
    keyIndicators: Array<{
      metric: string
      value: number
      trend: 'UP' | 'DOWN' | 'STABLE'
      isGood: boolean
    }>
  }
  identifiedPatterns: FeedbackPattern[]
  actionableInsights: FeedbackInsight[]
  recommendations: Array<{
    priority: 'HIGH' | 'MEDIUM' | 'LOW'
    category: string
    recommendation: string
    expectedImpact: string
    implementationComplexity: 'LOW' | 'MEDIUM' | 'HIGH'
  }>
}

export class FeedbackAnalyzer {
  
  /**
   * Generate comprehensive feedback analysis report
   */
  static async generateAnalysisReport(timeRange: 'day' | 'week' | 'month' = 'week'): Promise<FeedbackAnalysisReport> {
    const startDate = this.getStartDate(timeRange)
    const endDate = new Date()
    
    logInfo('Starting feedback analysis', {
      timeRange,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      operation: 'feedback-analysis'
    })

    try {
      // Gather all feedback data for analysis
      const feedbackData = await this.gatherFeedbackData(startDate, endDate)
      
      // Analyze patterns in the feedback
      const patterns = await this.identifyPatterns(feedbackData)
      
      // Generate actionable insights
      const insights = await this.generateInsights(feedbackData, patterns)
      
      // Calculate overall system health
      const overallHealth = await this.calculateOverallHealth(feedbackData)
      
      // Generate specific recommendations
      const recommendations = await this.generateRecommendations(patterns, insights)

      const report: FeedbackAnalysisReport = {
        generatedAt: new Date(),
        analysisPeriod: {
          startDate,
          endDate,
          totalFeedback: feedbackData.feedback.length,
          totalDocuments: feedbackData.documents.length
        },
        overallHealth,
        identifiedPatterns: patterns,
        actionableInsights: insights,
        recommendations
      }

      logInfo('Feedback analysis completed', {
        patternsFound: patterns.length,
        insightsGenerated: insights.length,
        recommendationsCount: recommendations.length,
        healthScore: overallHealth.score,
        operation: 'feedback-analysis-complete'
      })

      return report

    } catch (error) {
      logError('Failed to generate feedback analysis', { error: error.message })
      throw error
    }
  }

  /**
   * Continuously monitor feedback for real-time alerts
   */
  static async monitorFeedbackStreams(): Promise<Array<{
    alertType: 'ACCURACY_DROP' | 'ERROR_SPIKE' | 'CONFIDENCE_DECLINE' | 'USER_DISSATISFACTION'
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    message: string
    triggeredAt: Date
    affectedMetrics: string[]
    suggestedActions: string[]
  }>> {
    const alerts: any[] = []
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000)

    try {
      // Check for accuracy drops
      const recentFeedback = await this.getRecentFeedback(last24Hours)
      const accuracyTrend = this.calculateAccuracyTrend(recentFeedback)
      
      if (accuracyTrend.change < -0.1) { // 10% drop
        alerts.push({
          alertType: 'ACCURACY_DROP',
          severity: accuracyTrend.change < -0.2 ? 'CRITICAL' : 'HIGH',
          message: `Accuracy dropped by ${Math.abs(accuracyTrend.change * 100).toFixed(1)}% in the last 24 hours`,
          triggeredAt: new Date(),
          affectedMetrics: ['extraction_accuracy', 'user_corrections'],
          suggestedActions: [
            'Review recent document processing failures',
            'Check for changes in document types or formats',
            'Investigate AI model performance'
          ]
        })
      }

      // Check for error spikes
      const errorSpike = await this.detectErrorSpike(last24Hours)
      if (errorSpike.detected) {
        alerts.push({
          alertType: 'ERROR_SPIKE',
          severity: errorSpike.severity,
          message: `${errorSpike.errorType} errors increased by ${errorSpike.increase}% in the last 24 hours`,
          triggeredAt: new Date(),
          affectedMetrics: ['error_rate', 'processing_failures'],
          suggestedActions: errorSpike.suggestedActions
        })
      }

      // Check confidence decline
      const confidenceTrend = await this.checkConfidenceTrend(last24Hours)
      if (confidenceTrend.declining) {
        alerts.push({
          alertType: 'CONFIDENCE_DECLINE',
          severity: 'MEDIUM',
          message: `Average confidence declined by ${confidenceTrend.decline}% over 24 hours`,
          triggeredAt: new Date(),
          affectedMetrics: ['confidence_scores', 'extraction_reliability'],
          suggestedActions: [
            'Review recent prompt changes',
            'Check document quality issues',
            'Analyze confidence calibration'
          ]
        })
      }

      return alerts

    } catch (error) {
      logError('Failed to monitor feedback streams', { error: error.message })
      return []
    }
  }

  /**
   * Get improvement suggestions based on feedback analysis
   */
  static async getImprovementSuggestions(category?: string): Promise<Array<{
    category: string
    title: string
    description: string
    priority: 'HIGH' | 'MEDIUM' | 'LOW'
    effort: 'LOW' | 'MEDIUM' | 'HIGH'
    impact: 'LOW' | 'MEDIUM' | 'HIGH'
    implementationSteps: string[]
    successMetrics: string[]
  }>> {
    try {
      const suggestions = []

      // Analyze recent patterns for suggestions
      const recentPatterns = await this.getRecentPatterns(category)
      
      for (const pattern of recentPatterns) {
        const suggestion = await this.patternToSuggestion(pattern)
        if (suggestion) {
          suggestions.push(suggestion)
        }
      }

      // Add general improvement suggestions based on system state
      const systemSuggestions = await this.getSystemWideSuggestions()
      suggestions.push(...systemSuggestions)

      // Sort by priority and impact
      return suggestions.sort((a, b) => {
        const priorityOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 }
        const impactOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 }
        
        const aScore = priorityOrder[a.priority] + impactOrder[a.impact]
        const bScore = priorityOrder[b.priority] + impactOrder[b.impact]
        
        return bScore - aScore
      })

    } catch (error) {
      logError('Failed to get improvement suggestions', { error: error.message })
      return []
    }
  }

  // Private helper methods

  private static getStartDate(timeRange: 'day' | 'week' | 'month'): Date {
    const now = new Date()
    switch (timeRange) {
      case 'day':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000)
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }
  }

  private static async gatherFeedbackData(startDate: Date, endDate: Date): Promise<{
    feedback: any[]
    documents: any[]
    analytics: any[]
    corrections: any[]
  }> {
    const [feedback, documents, analytics] = await Promise.all([
      // Get learning feedback
      prisma.learningFeedback.findMany({
        where: {
          createdAt: { gte: startDate, lte: endDate }
        },
        include: {
          document: true,
          user: true
        }
      }),
      
      // Get processed documents
      prisma.document.findMany({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          status: 'PROCESSED'
        },
        include: {
          processingAnalytics: true
        }
      }),

      // Get processing analytics
      prisma.aIProcessingAnalytics.findMany({
        where: {
          processedAt: { gte: startDate, lte: endDate }
        }
      })
    ])

    // Extract corrections from feedback
    const corrections = feedback.flatMap(f => 
      Object.entries(f.corrections || {}).map(([field, correction]) => ({
        feedbackId: f.id,
        documentId: f.documentId,
        field,
        correction,
        createdAt: f.createdAt
      }))
    )

    return { feedback, documents, analytics, corrections }
  }

  private static async identifyPatterns(data: any): Promise<FeedbackPattern[]> {
    const patterns: FeedbackPattern[] = []

    // Pattern 1: Accuracy Issues
    const accuracyIssues = data.corrections.filter((c: any) => 
      ['salesVAT', 'purchaseVAT', 'totalAmount'].includes(c.field)
    )
    
    if (accuracyIssues.length > 5) {
      patterns.push({
        id: 'accuracy_pattern_1',
        patternType: 'ACCURACY_ISSUE',
        description: 'High frequency of VAT amount corrections',
        frequency: accuracyIssues.length,
        severity: accuracyIssues.length > 20 ? 'HIGH' : 'MEDIUM',
        affectedDocuments: new Set(accuracyIssues.map((c: any) => c.documentId)).size,
        suggestedImprovements: [
          'Improve VAT extraction prompts',
          'Add more training examples for edge cases',
          'Enhance OCR text preprocessing'
        ],
        confidenceImpact: -0.3,
        accuracyImpact: -0.4,
        firstSeen: new Date(Math.min(...accuracyIssues.map((c: any) => c.createdAt.getTime()))),
        lastSeen: new Date(Math.max(...accuracyIssues.map((c: any) => c.createdAt.getTime()))),
        trend: 'STABLE'
      })
    }

    // Pattern 2: Confidence Issues
    const lowConfidenceFeedback = data.feedback.filter((f: any) => f.confidenceScore < 0.7)
    
    if (lowConfidenceFeedback.length > 10) {
      patterns.push({
        id: 'confidence_pattern_1',
        patternType: 'CONFIDENCE_ISSUE',
        description: 'High frequency of low confidence extractions',
        frequency: lowConfidenceFeedback.length,
        severity: 'MEDIUM',
        affectedDocuments: lowConfidenceFeedback.length,
        suggestedImprovements: [
          'Calibrate confidence scoring algorithm',
          'Improve template matching accuracy',
          'Add document quality pre-processing'
        ],
        confidenceImpact: -0.2,
        accuracyImpact: -0.1,
        firstSeen: new Date(Math.min(...lowConfidenceFeedback.map((f: any) => f.createdAt.getTime()))),
        lastSeen: new Date(Math.max(...lowConfidenceFeedback.map((f: any) => f.createdAt.getTime()))),
        trend: 'STABLE'
      })
    }

    // Pattern 3: Processing Errors
    const errorAnalytics = data.analytics.filter((a: any) => a.hadErrors)
    
    if (errorAnalytics.length > 0) {
      patterns.push({
        id: 'error_pattern_1',
        patternType: 'PROCESSING_ERROR',
        description: 'Processing errors affecting document extraction',
        frequency: errorAnalytics.length,
        severity: errorAnalytics.length > 10 ? 'HIGH' : 'MEDIUM',
        affectedDocuments: errorAnalytics.length,
        suggestedImprovements: [
          'Improve error handling and retry logic',
          'Add better input validation',
          'Enhance timeout handling for large documents'
        ],
        confidenceImpact: -0.5,
        accuracyImpact: -0.6,
        firstSeen: new Date(Math.min(...errorAnalytics.map((a: any) => a.processedAt.getTime()))),
        lastSeen: new Date(Math.max(...errorAnalytics.map((a: any) => a.processedAt.getTime()))),
        trend: 'STABLE'
      })
    }

    return patterns
  }

  private static async generateInsights(data: any, patterns: FeedbackPattern[]): Promise<FeedbackInsight[]> {
    const insights: FeedbackInsight[] = []

    // Insight 1: Overall accuracy trends
    const totalCorrections = data.corrections.length
    const totalDocuments = data.documents.length
    const correctionRate = totalDocuments > 0 ? (totalCorrections / totalDocuments) * 100 : 0

    insights.push({
      category: 'Accuracy',
      title: 'Document Processing Accuracy',
      description: `${correctionRate.toFixed(1)}% of documents required user corrections, indicating ${
        correctionRate < 10 ? 'excellent' : correctionRate < 20 ? 'good' : 'poor'
      } accuracy levels.`,
      impact: correctionRate > 20 ? 'HIGH' : correctionRate > 10 ? 'MEDIUM' : 'LOW',
      actionable: correctionRate > 10,
      suggestedActions: correctionRate > 10 ? [
        {
          action: 'Analyze most common correction types',
          priority: 'HIGH',
          estimatedEffort: 'Medium',
          expectedImprovement: 'Reduce correction rate by 30-50%'
        },
        {
          action: 'Improve AI prompts based on correction patterns',
          priority: 'HIGH',
          estimatedEffort: 'Low',
          expectedImprovement: 'Improve accuracy by 10-20%'
        }
      ] : [],
      supportingData: {
        documentCount: totalDocuments,
        errorRate: correctionRate,
        avgConfidence: data.feedback.length > 0 ? 
          data.feedback.reduce((sum: number, f: any) => sum + (f.confidenceScore || 0), 0) / data.feedback.length : 0
      }
    })

    // Insight 2: Processing efficiency
    const avgProcessingTime = data.analytics.length > 0 ?
      data.analytics.reduce((sum: number, a: any) => sum + (a.processingTime || 0), 0) / data.analytics.length : 0

    insights.push({
      category: 'Performance',
      title: 'Processing Efficiency',
      description: `Average processing time is ${(avgProcessingTime / 1000).toFixed(1)} seconds per document, which is ${
        avgProcessingTime < 3000 ? 'excellent' : avgProcessingTime < 5000 ? 'good' : 'needs improvement'
      }.`,
      impact: avgProcessingTime > 5000 ? 'MEDIUM' : 'LOW',
      actionable: avgProcessingTime > 4000,
      suggestedActions: avgProcessingTime > 4000 ? [
        {
          action: 'Optimize AI prompts for faster processing',
          priority: 'MEDIUM',
          estimatedEffort: 'Low',
          expectedImprovement: 'Reduce processing time by 20-30%'
        }
      ] : [],
      supportingData: {
        documentCount: data.analytics.length,
        errorRate: 0,
        avgConfidence: 0
      }
    })

    return insights
  }

  private static async calculateOverallHealth(data: any): Promise<any> {
    const totalDocuments = data.documents.length
    const totalFeedback = data.feedback.length
    const totalCorrections = data.corrections.length
    
    const accuracyScore = totalDocuments > 0 ? 
      Math.max(0, 100 - (totalCorrections / totalDocuments) * 100) : 100
    
    const confidenceScore = totalFeedback > 0 ?
      data.feedback.reduce((sum: number, f: any) => sum + (f.confidenceScore || 0), 0) / totalFeedback * 100 : 100
    
    const errorRate = data.analytics.length > 0 ?
      (data.analytics.filter((a: any) => a.hadErrors).length / data.analytics.length) * 100 : 0
    
    const errorScore = Math.max(0, 100 - errorRate)
    
    const overallScore = Math.round((accuracyScore + confidenceScore + errorScore) / 3)

    return {
      score: overallScore,
      trend: 'STABLE', // Would calculate from historical data
      keyIndicators: [
        {
          metric: 'Accuracy',
          value: Math.round(accuracyScore),
          trend: 'STABLE',
          isGood: accuracyScore > 80
        },
        {
          metric: 'Confidence',
          value: Math.round(confidenceScore),
          trend: 'STABLE',
          isGood: confidenceScore > 80
        },
        {
          metric: 'Error Rate',
          value: Math.round(errorRate),
          trend: 'STABLE',
          isGood: errorRate < 5
        }
      ]
    }
  }

  private static async generateRecommendations(patterns: FeedbackPattern[], insights: FeedbackInsight[]): Promise<any[]> {
    const recommendations = []

    // High priority recommendations from patterns
    const criticalPatterns = patterns.filter(p => p.severity === 'CRITICAL' || p.severity === 'HIGH')
    
    for (const pattern of criticalPatterns) {
      recommendations.push({
        priority: pattern.severity === 'CRITICAL' ? 'HIGH' : 'MEDIUM',
        category: pattern.patternType.toLowerCase(),
        recommendation: pattern.suggestedImprovements[0],
        expectedImpact: `Improve ${pattern.patternType.toLowerCase()} by 20-40%`,
        implementationComplexity: 'MEDIUM'
      })
    }

    // Recommendations from insights
    const highImpactInsights = insights.filter(i => i.impact === 'HIGH' && i.actionable)
    
    for (const insight of highImpactInsights) {
      if (insight.suggestedActions.length > 0) {
        const action = insight.suggestedActions[0]
        recommendations.push({
          priority: action.priority,
          category: insight.category.toLowerCase(),
          recommendation: action.action,
          expectedImpact: action.expectedImprovement,
          implementationComplexity: action.estimatedEffort.toUpperCase()
        })
      }
    }

    return recommendations
  }

  private static async getRecentFeedback(since: Date): Promise<any[]> {
    return await prisma.learningFeedback.findMany({
      where: { createdAt: { gte: since } },
      include: { document: true }
    })
  }

  private static calculateAccuracyTrend(feedback: any[]): { current: number, change: number } {
    // Mock calculation - in production would compare with previous period
    const current = feedback.length > 0 ? 0.85 : 1.0
    const change = -0.05 // Mock 5% decline
    
    return { current, change }
  }

  private static async detectErrorSpike(since: Date): Promise<any> {
    const analytics = await prisma.aIProcessingAnalytics.findMany({
      where: { processedAt: { gte: since } }
    })
    
    const errorCount = analytics.filter(a => a.hadErrors).length
    const totalCount = analytics.length
    const errorRate = totalCount > 0 ? (errorCount / totalCount) * 100 : 0
    
    return {
      detected: errorRate > 10,
      errorType: 'Processing',
      increase: errorRate,
      severity: errorRate > 20 ? 'HIGH' : 'MEDIUM',
      suggestedActions: [
        'Review recent processing failures',
        'Check system resource availability',
        'Validate input document formats'
      ]
    }
  }

  private static async checkConfidenceTrend(since: Date): Promise<any> {
    const analytics = await prisma.aIProcessingAnalytics.findMany({
      where: { processedAt: { gte: since } }
    })
    
    const avgConfidence = analytics.length > 0 ?
      analytics.reduce((sum, a) => sum + (a.confidenceScore || 0), 0) / analytics.length : 1.0
    
    return {
      declining: avgConfidence < 0.7,
      decline: (1.0 - avgConfidence) * 100
    }
  }

  private static async getRecentPatterns(category?: string): Promise<any[]> {
    // Mock patterns - in production would analyze recent feedback
    return []
  }

  private static async patternToSuggestion(pattern: any): Promise<any | null> {
    // Convert pattern to actionable suggestion
    return null
  }

  private static async getSystemWideSuggestions(): Promise<any[]> {
    return [
      {
        category: 'optimization',
        title: 'Prompt A/B Testing',
        description: 'Run A/B tests on different prompt variations to optimize extraction accuracy',
        priority: 'MEDIUM',
        effort: 'LOW',
        impact: 'MEDIUM',
        implementationSteps: [
          'Create prompt variations',
          'Set up A/B testing framework',
          'Monitor results over 2-4 weeks',
          'Implement winning variations'
        ],
        successMetrics: ['Improved accuracy by 10-15%', 'Higher user satisfaction']
      }
    ]
  }
}

// Export for use in other modules
export { FeedbackAnalyzer as default }