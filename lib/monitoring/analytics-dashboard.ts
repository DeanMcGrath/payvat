/**
 * Advanced Monitoring and Analytics Infrastructure
 * Provides comprehensive system observability and performance insights
 */

import { EventEmitter } from 'events'

// Metric interfaces
export interface ProcessingMetric {
  timestamp: number
  documentId?: string
  fileName: string
  processingMethod: string
  processingTime: number
  success: boolean
  confidence?: number
  vatAmount?: number
  errorCode?: string
  errorMessage?: string
}

export interface SystemMetric {
  timestamp: number
  cpuUsage: number
  memoryUsage: number
  activeConnections: number
  queueLength: number
  cacheHitRate: number
  throughput: number // documents/hour
}

export interface QualityMetric {
  timestamp: number
  documentId: string
  dataQualityScore: number
  validationIssues: number
  confidenceScore: number
  extractionMethod: string
  irishVATCompliant: boolean
}

// Analytics aggregation
export interface AnalyticsSummary {
  timeRange: {
    start: Date
    end: Date
  }
  processing: {
    totalDocuments: number
    successRate: number
    avgProcessingTime: number
    methodBreakdown: Record<string, { count: number, successRate: number, avgTime: number }>
    hourlyThroughput: Array<{ hour: number, count: number }>
  }
  quality: {
    avgDataQualityScore: number
    avgConfidenceScore: number
    irishVATComplianceRate: number
    commonIssues: Array<{ issue: string, count: number }>
  }
  system: {
    avgCpuUsage: number
    avgMemoryUsage: number
    maxQueueLength: number
    avgCacheHitRate: number
  }
  trends: {
    processingTimetrend: 'IMPROVING' | 'DECLINING' | 'STABLE'
    qualityTrend: 'IMPROVING' | 'DECLINING' | 'STABLE'
    throughputTrend: 'INCREASING' | 'DECREASING' | 'STABLE'
  }
}

// Real-time metrics collector
export class MetricsCollector extends EventEmitter {
  private processingMetrics: ProcessingMetric[] = []
  private systemMetrics: SystemMetric[] = []
  private qualityMetrics: QualityMetric[] = []
  private readonly maxMetricsAge = 24 * 60 * 60 * 1000 // 24 hours
  private readonly maxMetricsCount = 10000
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    super()
    this.startCleanupTimer()
  }

  // Record processing event
  recordProcessing(metric: Omit<ProcessingMetric, 'timestamp'>): void {
    const fullMetric: ProcessingMetric = {
      ...metric,
      timestamp: Date.now()
    }

    this.processingMetrics.push(fullMetric)
    this.enforceMetricsLimits('processing')
    this.emit('processing', fullMetric)

    // Log significant events
    if (!fullMetric.success) {
      console.log(`📊 Processing failed: ${fullMetric.fileName} (${fullMetric.errorCode})`)
    } else if (fullMetric.processingTime > 5000) {
      console.log(`⚠️ Slow processing: ${fullMetric.fileName} took ${fullMetric.processingTime}ms`)
    }
  }

  // Record system metrics
  recordSystem(): void {
    const usage = process.memoryUsage()
    const metric: SystemMetric = {
      timestamp: Date.now(),
      cpuUsage: process.cpuUsage().user / 1000000, // Convert to seconds
      memoryUsage: usage.heapUsed / 1024 / 1024, // Convert to MB
      activeConnections: this.getActiveConnectionCount(),
      queueLength: this.getQueueLength(),
      cacheHitRate: this.getCacheHitRate(),
      throughput: this.calculateThroughput()
    }

    this.systemMetrics.push(metric)
    this.enforceMetricsLimits('system')
    this.emit('system', metric)

    // Alert on high resource usage
    if (metric.memoryUsage > 500) {
      console.log(`🚨 High memory usage: ${metric.memoryUsage.toFixed(1)}MB`)
    }
    if (metric.queueLength > 100) {
      console.log(`🚨 Large queue: ${metric.queueLength} items`)
    }
  }

  // Record data quality metrics
  recordQuality(metric: Omit<QualityMetric, 'timestamp'>): void {
    const fullMetric: QualityMetric = {
      ...metric,
      timestamp: Date.now()
    }

    this.qualityMetrics.push(fullMetric)
    this.enforceMetricsLimits('quality')
    this.emit('quality', fullMetric)

    // Log quality concerns
    if (fullMetric.dataQualityScore < 60) {
      console.log(`📊 Low quality document: ${fullMetric.documentId} (score: ${fullMetric.dataQualityScore})`)
    }
  }

  // Get analytics summary for time range
  getAnalyticsSummary(hoursBack: number = 24): AnalyticsSummary {
    const endTime = Date.now()
    const startTime = endTime - (hoursBack * 60 * 60 * 1000)

    const processingInRange = this.processingMetrics.filter(m => 
      m.timestamp >= startTime && m.timestamp <= endTime
    )
    const systemInRange = this.systemMetrics.filter(m => 
      m.timestamp >= startTime && m.timestamp <= endTime
    )
    const qualityInRange = this.qualityMetrics.filter(m => 
      m.timestamp >= startTime && m.timestamp <= endTime
    )

    return {
      timeRange: {
        start: new Date(startTime),
        end: new Date(endTime)
      },
      processing: this.analyzeProcessingMetrics(processingInRange),
      quality: this.analyzeQualityMetrics(qualityInRange),
      system: this.analyzeSystemMetrics(systemInRange),
      trends: this.analyzeTrends(processingInRange, qualityInRange, systemInRange)
    }
  }

  // Get real-time statistics
  getRealTimeStats(): {
    currentThroughput: number
    avgProcessingTime: number
    successRate: number
    queueLength: number
    memoryUsage: number
    cacheHitRate: number
  } {
    const recentMetrics = this.processingMetrics.filter(m => 
      Date.now() - m.timestamp < 5 * 60 * 1000 // Last 5 minutes
    )
    const latestSystem = this.systemMetrics[this.systemMetrics.length - 1]

    const successful = recentMetrics.filter(m => m.success).length
    const totalTime = recentMetrics.reduce((sum, m) => sum + m.processingTime, 0)

    return {
      currentThroughput: recentMetrics.length * (60 * 60 * 1000) / (5 * 60 * 1000), // per hour
      avgProcessingTime: recentMetrics.length > 0 ? totalTime / recentMetrics.length : 0,
      successRate: recentMetrics.length > 0 ? successful / recentMetrics.length : 0,
      queueLength: latestSystem?.queueLength || 0,
      memoryUsage: latestSystem?.memoryUsage || 0,
      cacheHitRate: latestSystem?.cacheHitRate || 0
    }
  }

  // Export metrics for external analysis
  exportMetrics(format: 'JSON' | 'CSV' = 'JSON', hoursBack: number = 24): string {
    const summary = this.getAnalyticsSummary(hoursBack)

    if (format === 'JSON') {
      return JSON.stringify(summary, null, 2)
    } else {
      // CSV format for spreadsheet analysis
      let csv = 'Type,Timestamp,Value,Details\n'
      
      this.processingMetrics.forEach(m => {
        csv += `Processing,${new Date(m.timestamp).toISOString()},${m.success ? 'SUCCESS' : 'FAIL'},${m.processingTime}ms ${m.processingMethod}\n`
      })
      
      this.systemMetrics.forEach(m => {
        csv += `System,${new Date(m.timestamp).toISOString()},Memory,${m.memoryUsage}MB\n`
        csv += `System,${new Date(m.timestamp).toISOString()},Queue,${m.queueLength}\n`
      })
      
      return csv
    }
  }

  // Private helper methods
  private analyzeProcessingMetrics(metrics: ProcessingMetric[]) {
    if (metrics.length === 0) {
      return {
        totalDocuments: 0,
        successRate: 0,
        avgProcessingTime: 0,
        methodBreakdown: {},
        hourlyThroughput: []
      }
    }

    const successful = metrics.filter(m => m.success).length
    const totalTime = metrics.reduce((sum, m) => sum + m.processingTime, 0)

    // Method breakdown
    const methodBreakdown: Record<string, { count: number, successRate: number, avgTime: number }> = {}
    metrics.forEach(m => {
      if (!methodBreakdown[m.processingMethod]) {
        methodBreakdown[m.processingMethod] = { count: 0, successRate: 0, avgTime: 0 }
      }
      methodBreakdown[m.processingMethod].count++
    })

    // Calculate success rates and avg times for each method
    Object.keys(methodBreakdown).forEach(method => {
      const methodMetrics = metrics.filter(m => m.processingMethod === method)
      const methodSuccessful = methodMetrics.filter(m => m.success).length
      const methodTotalTime = methodMetrics.reduce((sum, m) => sum + m.processingTime, 0)
      
      methodBreakdown[method].successRate = methodSuccessful / methodMetrics.length
      methodBreakdown[method].avgTime = methodTotalTime / methodMetrics.length
    })

    // Hourly throughput
    const hourlyThroughput: Array<{ hour: number, count: number }> = []
    for (let h = 0; h < 24; h++) {
      const hourStart = Date.now() - (h * 60 * 60 * 1000)
      const hourEnd = hourStart + (60 * 60 * 1000)
      const hourCount = metrics.filter(m => m.timestamp >= hourStart && m.timestamp < hourEnd).length
      hourlyThroughput.unshift({ hour: 23 - h, count: hourCount })
    }

    return {
      totalDocuments: metrics.length,
      successRate: successful / metrics.length,
      avgProcessingTime: totalTime / metrics.length,
      methodBreakdown,
      hourlyThroughput
    }
  }

  private analyzeQualityMetrics(metrics: QualityMetric[]) {
    if (metrics.length === 0) {
      return {
        avgDataQualityScore: 0,
        avgConfidenceScore: 0,
        irishVATComplianceRate: 0,
        commonIssues: []
      }
    }

    const totalQualityScore = metrics.reduce((sum, m) => sum + m.dataQualityScore, 0)
    const totalConfidenceScore = metrics.reduce((sum, m) => sum + m.confidenceScore, 0)
    const compliantCount = metrics.filter(m => m.irishVATCompliant).length

    // Mock common issues (in real implementation, would track actual issues)
    const commonIssues = [
      { issue: 'Non-standard VAT rate', count: Math.floor(metrics.length * 0.05) },
      { issue: 'Low confidence extraction', count: Math.floor(metrics.length * 0.08) },
      { issue: 'Missing VAT breakdown', count: Math.floor(metrics.length * 0.03) }
    ].filter(issue => issue.count > 0)

    return {
      avgDataQualityScore: totalQualityScore / metrics.length,
      avgConfidenceScore: totalConfidenceScore / metrics.length,
      irishVATComplianceRate: compliantCount / metrics.length,
      commonIssues
    }
  }

  private analyzeSystemMetrics(metrics: SystemMetric[]) {
    if (metrics.length === 0) {
      return {
        avgCpuUsage: 0,
        avgMemoryUsage: 0,
        maxQueueLength: 0,
        avgCacheHitRate: 0
      }
    }

    return {
      avgCpuUsage: metrics.reduce((sum, m) => sum + m.cpuUsage, 0) / metrics.length,
      avgMemoryUsage: metrics.reduce((sum, m) => sum + m.memoryUsage, 0) / metrics.length,
      maxQueueLength: Math.max(...metrics.map(m => m.queueLength)),
      avgCacheHitRate: metrics.reduce((sum, m) => sum + m.cacheHitRate, 0) / metrics.length
    }
  }

  private analyzeTrends(
    processing: ProcessingMetric[], 
    quality: QualityMetric[], 
    system: SystemMetric[]
  ) {
    // Simplified trend analysis (compare first half vs second half of time period)
    const midpoint = Date.now() - (12 * 60 * 60 * 1000) // 12 hours ago
    
    const earlyProcessing = processing.filter(m => m.timestamp < midpoint)
    const lateProcessing = processing.filter(m => m.timestamp >= midpoint)
    
    const earlyQuality = quality.filter(m => m.timestamp < midpoint)
    const lateQuality = quality.filter(m => m.timestamp >= midpoint)

    // Processing time trend
    const earlyAvgTime = earlyProcessing.length > 0 
      ? earlyProcessing.reduce((sum, m) => sum + m.processingTime, 0) / earlyProcessing.length 
      : 0
    const lateAvgTime = lateProcessing.length > 0 
      ? lateProcessing.reduce((sum, m) => sum + m.processingTime, 0) / lateProcessing.length 
      : 0
    
    let processingTimeRend: 'IMPROVING' | 'DECLINING' | 'STABLE' = 'STABLE'
    if (lateAvgTime < earlyAvgTime * 0.9) processingTimeRend = 'IMPROVING'
    else if (lateAvgTime > earlyAvgTime * 1.1) processingTimeRend = 'DECLINING'

    // Quality trend
    const earlyQualityScore = earlyQuality.length > 0 
      ? earlyQuality.reduce((sum, m) => sum + m.dataQualityScore, 0) / earlyQuality.length 
      : 0
    const lateQualityScore = lateQuality.length > 0 
      ? lateQuality.reduce((sum, m) => sum + m.dataQualityScore, 0) / lateQuality.length 
      : 0
    
    let qualityTrend: 'IMPROVING' | 'DECLINING' | 'STABLE' = 'STABLE'
    if (lateQualityScore > earlyQualityScore * 1.05) qualityTrend = 'IMPROVING'
    else if (lateQualityScore < earlyQualityScore * 0.95) qualityTrend = 'DECLINING'

    // Throughput trend
    const earlyThroughput = earlyProcessing.length
    const lateThroughput = lateProcessing.length
    
    let throughputTrend: 'INCREASING' | 'DECREASING' | 'STABLE' = 'STABLE'
    if (lateThroughput > earlyThroughput * 1.1) throughputTrend = 'INCREASING'
    else if (lateThroughput < earlyThroughput * 0.9) throughputTrend = 'DECREASING'

    return { processingTimetrend: processingTimeRend, qualityTrend, throughputTrend }
  }

  private enforceMetricsLimits(type: 'processing' | 'system' | 'quality'): void {
    const now = Date.now()
    
    switch (type) {
      case 'processing':
        this.processingMetrics = this.processingMetrics
          .filter(m => now - m.timestamp < this.maxMetricsAge)
          .slice(-this.maxMetricsCount)
        break
      case 'system':
        this.systemMetrics = this.systemMetrics
          .filter(m => now - m.timestamp < this.maxMetricsAge)
          .slice(-this.maxMetricsCount)
        break
      case 'quality':
        this.qualityMetrics = this.qualityMetrics
          .filter(m => now - m.timestamp < this.maxMetricsAge)
          .slice(-this.maxMetricsCount)
        break
    }
  }

  private startCleanupTimer(): void {
    this.cleanupInterval = setInterval(() => {
      this.enforceMetricsLimits('processing')
      this.enforceMetricsLimits('system')
      this.enforceMetricsLimits('quality')
    }, 60 * 60 * 1000) // Every hour
  }

  private getActiveConnectionCount(): number {
    // Mock implementation - in real system would track actual connections
    return Math.floor(Math.random() * 10) + 1
  }

  private getQueueLength(): number {
    // Mock implementation - in real system would check actual queue
    return Math.floor(Math.random() * 5)
  }

  private getCacheHitRate(): number {
    // Mock implementation - in real system would get from cache
    return 0.7 + (Math.random() * 0.3) // 70-100%
  }

  private calculateThroughput(): number {
    const lastHourMetrics = this.processingMetrics.filter(m => 
      Date.now() - m.timestamp < 60 * 60 * 1000 // Last hour
    )
    return lastHourMetrics.length // Documents per hour
  }

  // Cleanup resources
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.removeAllListeners()
    this.processingMetrics = []
    this.systemMetrics = []
    this.qualityMetrics = []
  }
}

// Alert system for monitoring critical events
export class AlertSystem {
  private subscribers = new Map<string, Function[]>()

  // Subscribe to alerts
  subscribe(alertType: string, callback: Function): void {
    if (!this.subscribers.has(alertType)) {
      this.subscribers.set(alertType, [])
    }
    this.subscribers.get(alertType)!.push(callback)
  }

  // Trigger alert
  trigger(alertType: string, data: any): void {
    const callbacks = this.subscribers.get(alertType) || []
    callbacks.forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error(`Alert callback error for ${alertType}:`, error)
      }
    })

    console.log(`🚨 ALERT [${alertType}]:`, data)
  }

  // Check metrics and trigger alerts if needed
  checkMetrics(stats: any): void {
    // High processing time alert
    if (stats.avgProcessingTime > 10000) {
      this.trigger('HIGH_PROCESSING_TIME', {
        avgTime: stats.avgProcessingTime,
        threshold: 10000
      })
    }

    // Low success rate alert
    if (stats.successRate < 0.9) {
      this.trigger('LOW_SUCCESS_RATE', {
        successRate: stats.successRate,
        threshold: 0.9
      })
    }

    // High memory usage alert
    if (stats.memoryUsage > 400) {
      this.trigger('HIGH_MEMORY_USAGE', {
        memoryUsage: stats.memoryUsage,
        threshold: 400
      })
    }

    // Large queue alert
    if (stats.queueLength > 50) {
      this.trigger('LARGE_QUEUE', {
        queueLength: stats.queueLength,
        threshold: 50
      })
    }
  }
}

// Monitoring dashboard (would integrate with web interface)
export class MonitoringDashboard {
  constructor(
    private metricsCollector: MetricsCollector,
    private alertSystem: AlertSystem
  ) {
    this.setupPeriodicReporting()
  }

  // Generate dashboard data
  getDashboardData(): any {
    const realTimeStats = this.metricsCollector.getRealTimeStats()
    const summary = this.metricsCollector.getAnalyticsSummary(24)

    return {
      realTime: realTimeStats,
      summary,
      timestamp: new Date().toISOString()
    }
  }

  // Setup periodic reporting
  private setupPeriodicReporting(): void {
    // Log summary every 5 minutes
    setInterval(() => {
      const stats = this.metricsCollector.getRealTimeStats()
      console.log('📊 System Status:')
      console.log(`   Throughput: ${stats.currentThroughput.toFixed(0)} docs/hour`)
      console.log(`   Success Rate: ${(stats.successRate * 100).toFixed(1)}%`)
      console.log(`   Avg Processing Time: ${stats.avgProcessingTime.toFixed(0)}ms`)
      console.log(`   Memory Usage: ${stats.memoryUsage.toFixed(1)}MB`)
      console.log(`   Cache Hit Rate: ${(stats.cacheHitRate * 100).toFixed(1)}%`)

      // Check for alerts
      this.alertSystem.checkMetrics(stats)
    }, 5 * 60 * 1000)
  }
}

// Export monitoring instances
export const metricsCollector = new MetricsCollector()
export const alertSystem = new AlertSystem()
export const monitoringDashboard = new MonitoringDashboard(metricsCollector, alertSystem)

// Auto-start system metrics collection
setInterval(() => {
  metricsCollector.recordSystem()
}, 30000) // Every 30 seconds

console.log('📊 Monitoring and analytics infrastructure initialized')