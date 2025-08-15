/**
 * Confidence Monitoring Dashboard
 * Tracks AI performance and confidence scores over time for continuous improvement
 */

import { prisma } from '@/lib/prisma'

export interface ConfidenceMetrics {
  overall: {
    averageConfidence: number
    totalDocuments: number
    confidenceDistribution: Record<string, number> // bins: 0-20%, 21-40%, etc.
    trend: 'improving' | 'declining' | 'stable'
  }
  byDocumentType: Record<string, {
    averageConfidence: number
    documentCount: number
    successRate: number
  }>
  byProcessingMethod: Record<string, {
    averageConfidence: number
    documentCount: number
    averageProcessingTime: number
  }>
  qualityMetrics: {
    irishVATCompliance: number // percentage
    averageQualityScore: number
    commonIssues: Array<{ issue: string, frequency: number }>
  }
  userFeedback: {
    totalCorrections: number
    accuracyImprovement: number
    commonCorrectionTypes: Record<string, number>
  }
  performance: {
    dailyVolume: Array<{ date: string, count: number, avgConfidence: number }>
    weeklyTrends: Array<{ week: string, confidence: number, volume: number }>
    systemHealth: 'excellent' | 'good' | 'fair' | 'poor'
  }
}

export interface ConfidenceAlert {
  type: 'low_confidence' | 'declining_trend' | 'processing_error' | 'quality_issue'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  documentId?: string
  threshold?: number
  actualValue?: number
  timestamp: Date
}

export class ConfidenceMonitor {
  
  /**
   * Get comprehensive confidence metrics for the dashboard
   */
  static async getConfidenceMetrics(timeRange: 'day' | 'week' | 'month' = 'week'): Promise<ConfidenceMetrics> {
    const startDate = this.calculateStartDate(timeRange)
    
    console.log(`📊 Generating confidence metrics for last ${timeRange}`)
    
    try {
      // Get document processing data
      const documents = await this.getProcessedDocuments(startDate)
      
      // Get user corrections data
      const corrections = await this.getUserCorrections(startDate)
      
      // Calculate metrics
      const metrics: ConfidenceMetrics = {
        overall: this.calculateOverallMetrics(documents),
        byDocumentType: this.calculateDocumentTypeMetrics(documents),
        byProcessingMethod: this.calculateProcessingMethodMetrics(documents),
        qualityMetrics: this.calculateQualityMetrics(documents),
        userFeedback: this.calculateUserFeedbackMetrics(corrections, documents),
        performance: await this.calculatePerformanceMetrics(documents, timeRange)
      }
      
      console.log(`✅ Confidence metrics generated:`)
      console.log(`   📈 Average confidence: ${Math.round(metrics.overall.averageConfidence * 100)}%`)
      console.log(`   📄 Documents processed: ${metrics.overall.totalDocuments}`)
      console.log(`   🇮🇪 Irish VAT compliance: ${Math.round(metrics.qualityMetrics.irishVATCompliance)}%`)
      console.log(`   🎯 System health: ${metrics.performance.systemHealth}`)
      
      return metrics
      
    } catch (error) {
      console.error('❌ Failed to generate confidence metrics:', error)
      return this.getEmptyMetrics()
    }
  }
  
  /**
   * Check for confidence-related alerts that need attention
   */
  static async checkForAlerts(): Promise<ConfidenceAlert[]> {
    const alerts: ConfidenceAlert[] = []
    
    try {
      // Check for recent low confidence documents
      const lowConfidenceThreshold = 0.5
      const recentLowConfidence = await this.findLowConfidenceDocuments(lowConfidenceThreshold, 24) // Last 24 hours
      
      recentLowConfidence.forEach(doc => {
        alerts.push({
          type: 'low_confidence',
          severity: doc.confidence < 0.3 ? 'critical' : doc.confidence < 0.4 ? 'high' : 'medium',
          message: `Document "${doc.fileName}" has low confidence: ${Math.round(doc.confidence * 100)}%`,
          documentId: doc.id,
          threshold: lowConfidenceThreshold,
          actualValue: doc.confidence,
          timestamp: new Date()
        })
      })
      
      // Check for declining confidence trends
      const weeklyTrend = await this.calculateConfidenceTrend(7) // Last 7 days vs previous 7 days
      if (weeklyTrend.change < -0.1) { // 10% decline
        alerts.push({
          type: 'declining_trend',
          severity: weeklyTrend.change < -0.2 ? 'high' : 'medium',
          message: `Confidence declining: ${Math.round(weeklyTrend.change * 100)}% drop over past week`,
          actualValue: weeklyTrend.current,
          timestamp: new Date()
        })
      }
      
      // Check for processing errors
      const errorRate = await this.calculateErrorRate(24) // Last 24 hours
      if (errorRate > 0.05) { // More than 5% error rate
        alerts.push({
          type: 'processing_error',
          severity: errorRate > 0.15 ? 'critical' : errorRate > 0.1 ? 'high' : 'medium',
          message: `High processing error rate: ${Math.round(errorRate * 100)}%`,
          actualValue: errorRate,
          timestamp: new Date()
        })
      }
      
      // Check for quality issues
      const qualityScore = await this.calculateAverageQualityScore(24) // Last 24 hours
      if (qualityScore < 70) {
        alerts.push({
          type: 'quality_issue',
          severity: qualityScore < 50 ? 'critical' : qualityScore < 60 ? 'high' : 'medium',
          message: `Low average quality score: ${Math.round(qualityScore)}/100`,
          actualValue: qualityScore,
          timestamp: new Date()
        })
      }
      
      console.log(`🚨 Generated ${alerts.length} confidence alerts`)
      alerts.forEach(alert => {
        console.log(`   ${alert.severity.toUpperCase()}: ${alert.message}`)
      })
      
      return alerts
      
    } catch (error) {
      console.error('❌ Failed to check for alerts:', error)
      return []
    }
  }
  
  /**
   * Log confidence metrics for a processed document
   */
  static async logConfidenceMetric(data: {
    documentId: string
    fileName: string
    documentType: string
    processingMethod: string
    confidence: number
    qualityScore?: number
    irishVATCompliant?: boolean
    processingTime?: number
    vatAmounts: number[]
    userId?: string
  }): Promise<void> {
    try {
      // Store confidence metric (in production, this would go to a time-series database)
      console.log(`📊 Logging confidence metric for ${data.fileName}:`)
      console.log(`   🎯 Confidence: ${Math.round(data.confidence * 100)}%`)
      console.log(`   📊 Quality: ${data.qualityScore || 'N/A'}/100`)
      console.log(`   🇮🇪 Irish VAT: ${data.irishVATCompliant ? 'Yes' : 'No'}`)
      
      // In a full implementation, you'd store this data for analytics
      // await prisma.confidenceMetric.create({ data: ... })
      
    } catch (error) {
      console.warn('Failed to log confidence metric:', error)
    }
  }
  
  // Private helper methods
  
  private static calculateStartDate(timeRange: 'day' | 'week' | 'month'): Date {
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
  
  private static async getProcessedDocuments(startDate: Date): Promise<any[]> {
    // Mock data for now - in production, query actual documents
    return [
      {
        id: '1',
        fileName: 'invoice1.pdf',
        documentType: 'INVOICE',
        processingMethod: 'AI_VISION',
        confidence: 0.85,
        qualityScore: 88,
        irishVATCompliant: true,
        processingTime: 2500,
        vatAmounts: [123.45],
        createdAt: new Date()
      },
      {
        id: '2',
        fileName: 'receipt2.pdf',
        documentType: 'RECEIPT',
        processingMethod: 'AI_VISION',
        confidence: 0.92,
        qualityScore: 94,
        irishVATCompliant: true,
        processingTime: 1800,
        vatAmounts: [45.67],
        createdAt: new Date()
      }
    ]
  }
  
  private static async getUserCorrections(startDate: Date): Promise<any[]> {
    // Mock correction data
    return [
      {
        id: '1',
        documentId: '1',
        originalConfidence: 0.75,
        actualAccuracy: 0.95,
        correctionType: 'WRONG_AMOUNT',
        createdAt: new Date()
      }
    ]
  }
  
  private static calculateOverallMetrics(documents: any[]): ConfidenceMetrics['overall'] {
    if (documents.length === 0) {
      return {
        averageConfidence: 0,
        totalDocuments: 0,
        confidenceDistribution: {},
        trend: 'stable'
      }
    }
    
    const totalConfidence = documents.reduce((sum, doc) => sum + doc.confidence, 0)
    const averageConfidence = totalConfidence / documents.length
    
    // Calculate confidence distribution
    const distribution: Record<string, number> = {
      '0-20%': 0, '21-40%': 0, '41-60%': 0, '61-80%': 0, '81-100%': 0
    }
    
    documents.forEach(doc => {
      const confidencePercent = doc.confidence * 100
      if (confidencePercent <= 20) distribution['0-20%']++
      else if (confidencePercent <= 40) distribution['21-40%']++
      else if (confidencePercent <= 60) distribution['41-60%']++
      else if (confidencePercent <= 80) distribution['61-80%']++
      else distribution['81-100%']++
    })
    
    return {
      averageConfidence,
      totalDocuments: documents.length,
      confidenceDistribution: distribution,
      trend: 'stable' // Would calculate trend from historical data
    }
  }
  
  private static calculateDocumentTypeMetrics(documents: any[]): Record<string, any> {
    const metrics: Record<string, any> = {}
    
    const typeGroups = documents.reduce((groups, doc) => {
      const type = doc.documentType || 'UNKNOWN'
      if (!groups[type]) groups[type] = []
      groups[type].push(doc)
      return groups
    }, {} as Record<string, any[]>)
    
    Object.keys(typeGroups).forEach(type => {
      const docs = typeGroups[type]
      const totalConfidence = docs.reduce((sum: number, doc: any) => sum + doc.confidence, 0)
      const successfulDocs = docs.filter((doc: any) => doc.confidence > 0.7).length
      
      metrics[type] = {
        averageConfidence: totalConfidence / docs.length,
        documentCount: docs.length,
        successRate: successfulDocs / docs.length
      }
    })
    
    return metrics
  }
  
  private static calculateProcessingMethodMetrics(documents: any[]): Record<string, any> {
    const metrics: Record<string, any> = {}
    
    const methodGroups = documents.reduce((groups, doc) => {
      const method = doc.processingMethod || 'UNKNOWN'
      if (!groups[method]) groups[method] = []
      groups[method].push(doc)
      return groups
    }, {} as Record<string, any[]>)
    
    Object.keys(methodGroups).forEach(method => {
      const docs = methodGroups[method]
      const totalConfidence = docs.reduce((sum: number, doc: any) => sum + doc.confidence, 0)
      const totalProcessingTime = docs.reduce((sum: number, doc: any) => sum + (doc.processingTime || 0), 0)
      
      metrics[method] = {
        averageConfidence: totalConfidence / docs.length,
        documentCount: docs.length,
        averageProcessingTime: totalProcessingTime / docs.length
      }
    })
    
    return metrics
  }
  
  private static calculateQualityMetrics(documents: any[]): ConfidenceMetrics['qualityMetrics'] {
    const compliantDocs = documents.filter((doc: any) => doc.irishVATCompliant).length
    const totalQuality = documents.reduce((sum: number, doc: any) => sum + (doc.qualityScore || 50), 0)
    
    return {
      irishVATCompliance: documents.length > 0 ? (compliantDocs / documents.length) * 100 : 0,
      averageQualityScore: documents.length > 0 ? totalQuality / documents.length : 0,
      commonIssues: [
        { issue: 'Low quality document image', frequency: 5 },
        { issue: 'Missing VAT number', frequency: 3 },
        { issue: 'Unclear VAT amounts', frequency: 2 }
      ]
    }
  }
  
  private static calculateUserFeedbackMetrics(corrections: any[], documents: any[]): ConfidenceMetrics['userFeedback'] {
    const totalCorrections = corrections.length
    const accuracyImprovement = corrections.length > 0 
      ? corrections.reduce((sum: number, c: any) => sum + (c.actualAccuracy - c.originalConfidence), 0) / corrections.length
      : 0
    
    const correctionTypes = corrections.reduce((types: Record<string, number>, c: any) => {
      types[c.correctionType] = (types[c.correctionType] || 0) + 1
      return types
    }, {} as Record<string, number>)
    
    return {
      totalCorrections,
      accuracyImprovement,
      commonCorrectionTypes: correctionTypes
    }
  }
  
  private static async calculatePerformanceMetrics(documents: any[], timeRange: string): Promise<ConfidenceMetrics['performance']> {
    // Mock performance data
    const dailyVolume = [
      { date: '2024-01-01', count: 25, avgConfidence: 0.86 },
      { date: '2024-01-02', count: 32, avgConfidence: 0.89 },
      { date: '2024-01-03', count: 28, avgConfidence: 0.87 }
    ]
    
    const weeklyTrends = [
      { week: 'Week 1', confidence: 0.85, volume: 150 },
      { week: 'Week 2', confidence: 0.88, volume: 180 }
    ]
    
    const avgConfidence = documents.reduce((sum: number, doc: any) => sum + doc.confidence, 0) / (documents.length || 1)
    const systemHealth = avgConfidence > 0.9 ? 'excellent' : avgConfidence > 0.8 ? 'good' : avgConfidence > 0.6 ? 'fair' : 'poor'
    
    return {
      dailyVolume,
      weeklyTrends,
      systemHealth: systemHealth as any
    }
  }
  
  private static async findLowConfidenceDocuments(threshold: number, hours: number): Promise<any[]> {
    // Mock low confidence documents
    return []
  }
  
  private static async calculateConfidenceTrend(days: number): Promise<{ current: number, previous: number, change: number }> {
    // Mock trend calculation
    return { current: 0.85, previous: 0.88, change: -0.03 }
  }
  
  private static async calculateErrorRate(hours: number): Promise<number> {
    // Mock error rate
    return 0.02
  }
  
  private static async calculateAverageQualityScore(hours: number): Promise<number> {
    // Mock quality score
    return 85
  }
  
  private static getEmptyMetrics(): ConfidenceMetrics {
    return {
      overall: { averageConfidence: 0, totalDocuments: 0, confidenceDistribution: {}, trend: 'stable' },
      byDocumentType: {},
      byProcessingMethod: {},
      qualityMetrics: { irishVATCompliance: 0, averageQualityScore: 0, commonIssues: [] },
      userFeedback: { totalCorrections: 0, accuracyImprovement: 0, commonCorrectionTypes: {} },
      performance: { dailyVolume: [], weeklyTrends: [], systemHealth: 'poor' }
    }
  }
}

// ConfidenceMonitor is already exported as a class above