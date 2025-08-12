/**
 * VAT Extraction Monitoring and Performance Tracking
 * Monitors accuracy, tracks patterns, and provides insights for improvement
 */

export interface ExtractionAttempt {
  id: string
  fileName: string
  fileType: 'excel' | 'pdf' | 'image' | 'other'
  isWooCommerce: boolean
  processingMethod: 'woocommerce_processor' | 'excel_generic' | 'ai_vision' | 'legacy_text'
  extractedAmount: number
  expectedAmount?: number
  confidence: number
  accuracy?: number
  processingTimeMs: number
  success: boolean
  errors: string[]
  warnings: string[]
  timestamp: Date
  userId?: string
}

export interface MonitoringStats {
  totalAttempts: number
  successfulExtractions: number
  successRate: number
  averageAccuracy: number
  averageConfidence: number
  averageProcessingTime: number
  wooCommerceStats: {
    attempts: number
    successes: number
    averageAccuracy: number
    countryReports: number
    orderReports: number
  }
  processingMethodStats: Record<string, {
    attempts: number
    successes: number
    averageAccuracy: number
    averageProcessingTime: number
  }>
  commonIssues: Array<{
    issue: string
    count: number
    lastSeen: Date
  }>
  recommendations: string[]
}

class ExtractionMonitor {
  private attempts: Map<string, ExtractionAttempt> = new Map()
  
  /**
   * Log a VAT extraction attempt
   */
  logAttempt(attempt: ExtractionAttempt): void {
    this.attempts.set(attempt.id, attempt)
    
    console.log('📊 EXTRACTION MONITOR: Logged attempt')
    console.log(`   ID: ${attempt.id}`)
    console.log(`   File: ${attempt.fileName}`)
    console.log(`   Method: ${attempt.processingMethod}`)
    console.log(`   Success: ${attempt.success}`)
    console.log(`   Amount: €${attempt.extractedAmount}`)
    console.log(`   Confidence: ${Math.round(attempt.confidence * 100)}%`)
    console.log(`   Processing time: ${attempt.processingTimeMs}ms`)
    
    // Automatic alerts for issues
    if (!attempt.success) {
      console.warn(`⚠️ EXTRACTION FAILED: ${attempt.fileName} - ${attempt.errors.join(', ')}`)
    }
    
    if (attempt.success && attempt.confidence < 0.5) {
      console.warn(`⚠️ LOW CONFIDENCE: ${attempt.fileName} - ${Math.round(attempt.confidence * 100)}%`)
    }
    
    if (attempt.accuracy && attempt.accuracy < 90) {
      console.warn(`⚠️ LOW ACCURACY: ${attempt.fileName} - ${attempt.accuracy.toFixed(1)}%`)
    }
  }

  /**
   * Generate comprehensive monitoring statistics
   */
  getStats(): MonitoringStats {
    const attempts = Array.from(this.attempts.values())
    const totalAttempts = attempts.length
    
    if (totalAttempts === 0) {
      return this.getEmptyStats()
    }

    const successfulAttempts = attempts.filter(a => a.success)
    const successfulExtractions = successfulAttempts.length
    const successRate = (successfulExtractions / totalAttempts) * 100

    // Calculate averages for successful attempts
    const averageAccuracy = successfulAttempts.length > 0
      ? successfulAttempts.reduce((sum, a) => sum + (a.accuracy || 0), 0) / successfulAttempts.length
      : 0

    const averageConfidence = successfulAttempts.length > 0
      ? successfulAttempts.reduce((sum, a) => sum + a.confidence, 0) / successfulAttempts.length
      : 0

    const averageProcessingTime = attempts.reduce((sum, a) => sum + a.processingTimeMs, 0) / totalAttempts

    // WooCommerce-specific stats
    const wooCommerceAttempts = attempts.filter(a => a.isWooCommerce)
    const wooCommerceSuccesses = wooCommerceAttempts.filter(a => a.success)
    const wooCommerceAccuracy = wooCommerceSuccesses.length > 0
      ? wooCommerceSuccesses.reduce((sum, a) => sum + (a.accuracy || 0), 0) / wooCommerceSuccesses.length
      : 0

    const countryReports = wooCommerceAttempts.filter(a => 
      a.processingMethod === 'woocommerce_processor' && 
      a.fileName.includes('product_list') || 
      a.fileName.includes('country')
    ).length

    const orderReports = wooCommerceAttempts.filter(a => 
      a.processingMethod === 'woocommerce_processor' && 
      a.fileName.includes('recent_order') || 
      a.fileName.includes('order')
    ).length

    // Processing method stats
    const processingMethods = ['woocommerce_processor', 'excel_generic', 'ai_vision', 'legacy_text']
    const processingMethodStats: Record<string, any> = {}

    processingMethods.forEach(method => {
      const methodAttempts = attempts.filter(a => a.processingMethod === method)
      const methodSuccesses = methodAttempts.filter(a => a.success)
      
      processingMethodStats[method] = {
        attempts: methodAttempts.length,
        successes: methodSuccesses.length,
        averageAccuracy: methodSuccesses.length > 0
          ? methodSuccesses.reduce((sum, a) => sum + (a.accuracy || 0), 0) / methodSuccesses.length
          : 0,
        averageProcessingTime: methodAttempts.length > 0
          ? methodAttempts.reduce((sum, a) => sum + a.processingTimeMs, 0) / methodAttempts.length
          : 0
      }
    })

    // Common issues analysis
    const issueMap = new Map<string, { count: number, lastSeen: Date }>()
    attempts.forEach(attempt => {
      attempt.errors.forEach(error => {
        const current = issueMap.get(error) || { count: 0, lastSeen: new Date(0) }
        issueMap.set(error, {
          count: current.count + 1,
          lastSeen: attempt.timestamp > current.lastSeen ? attempt.timestamp : current.lastSeen
        })
      })
    })

    const commonIssues = Array.from(issueMap.entries())
      .map(([issue, data]) => ({ issue, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Generate recommendations
    const recommendations = this.generateRecommendations(attempts, {
      successRate,
      averageAccuracy,
      averageConfidence,
      wooCommerceStats: {
        attempts: wooCommerceAttempts.length,
        successes: wooCommerceSuccesses.length,
        averageAccuracy: wooCommerceAccuracy,
        countryReports,
        orderReports
      }
    })

    return {
      totalAttempts,
      successfulExtractions,
      successRate,
      averageAccuracy,
      averageConfidence,
      averageProcessingTime,
      wooCommerceStats: {
        attempts: wooCommerceAttempts.length,
        successes: wooCommerceSuccesses.length,
        averageAccuracy: wooCommerceAccuracy,
        countryReports,
        orderReports
      },
      processingMethodStats,
      commonIssues,
      recommendations
    }
  }

  /**
   * Generate actionable recommendations based on monitoring data
   */
  private generateRecommendations(attempts: ExtractionAttempt[], stats: any): string[] {
    const recommendations: string[] = []

    // Success rate recommendations
    if (stats.successRate < 80) {
      recommendations.push('Success rate below 80% - review error handling and file format support')
    }

    // Accuracy recommendations
    if (stats.averageAccuracy < 90) {
      recommendations.push('Average accuracy below 90% - improve pattern matching and validation')
    }

    // Confidence recommendations
    if (stats.averageConfidence < 0.8) {
      recommendations.push('Average confidence below 80% - enhance detection algorithms')
    }

    // WooCommerce-specific recommendations
    if (stats.wooCommerceStats.attempts > 0) {
      const wooSuccessRate = (stats.wooCommerceStats.successes / stats.wooCommerceStats.attempts) * 100
      if (wooSuccessRate < stats.successRate) {
        recommendations.push('WooCommerce extraction performing below overall average - review WooCommerce processor')
      }

      if (stats.wooCommerceStats.countryReports === 0 && stats.wooCommerceStats.attempts > 0) {
        recommendations.push('No country summary reports detected - verify country report detection logic')
      }

      if (stats.wooCommerceStats.orderReports === 0 && stats.wooCommerceStats.attempts > 0) {
        recommendations.push('No order detail reports detected - verify order report detection logic')
      }
    }

    // Processing method recommendations
    const aiAttempts = attempts.filter(a => a.processingMethod === 'ai_vision')
    const excelAttempts = attempts.filter(a => a.processingMethod === 'excel_generic')
    
    if (aiAttempts.length > excelAttempts.length * 2) {
      recommendations.push('High AI processing usage - consider improving structured data processors to reduce costs')
    }

    // Performance recommendations
    const slowAttempts = attempts.filter(a => a.processingTimeMs > 10000) // > 10 seconds
    if (slowAttempts.length > attempts.length * 0.2) {
      recommendations.push('More than 20% of extractions are slow (>10s) - optimize processing performance')
    }

    return recommendations
  }

  private getEmptyStats(): MonitoringStats {
    return {
      totalAttempts: 0,
      successfulExtractions: 0,
      successRate: 0,
      averageAccuracy: 0,
      averageConfidence: 0,
      averageProcessingTime: 0,
      wooCommerceStats: {
        attempts: 0,
        successes: 0,
        averageAccuracy: 0,
        countryReports: 0,
        orderReports: 0
      },
      processingMethodStats: {},
      commonIssues: [],
      recommendations: []
    }
  }

  /**
   * Clear old monitoring data (keep last 30 days)
   */
  cleanup(daysToKeep: number = 30): void {
    const cutoffDate = new Date(Date.now() - (daysToKeep * 24 * 60 * 60 * 1000))
    
    for (const [id, attempt] of this.attempts.entries()) {
      if (attempt.timestamp < cutoffDate) {
        this.attempts.delete(id)
      }
    }
    
    console.log(`🧹 Cleaned up monitoring data older than ${daysToKeep} days`)
  }

  /**
   * Export monitoring data for analysis
   */
  exportData(): ExtractionAttempt[] {
    return Array.from(this.attempts.values()).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }
}

// Global monitor instance
export const extractionMonitor = new ExtractionMonitor()

/**
 * Helper function to create extraction attempt from document processing
 */
export function createExtractionAttempt(
  fileName: string,
  fileType: 'excel' | 'pdf' | 'image' | 'other',
  processingMethod: 'woocommerce_processor' | 'excel_generic' | 'ai_vision' | 'legacy_text',
  result: {
    success: boolean
    extractedAmount: number
    confidence: number
    processingTimeMs: number
    errors?: string[]
    warnings?: string[]
  },
  options?: {
    expectedAmount?: number
    userId?: string
  }
): ExtractionAttempt {
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  const isWooCommerce = fileName.toLowerCase().includes('woocommerce') ||
                       fileName.toLowerCase().includes('icwoocommercetaxpro') ||
                       fileName.toLowerCase().includes('tax_report')

  const accuracy = options?.expectedAmount 
    ? Math.max(0, 100 - (Math.abs(result.extractedAmount - options.expectedAmount) / options.expectedAmount) * 100)
    : undefined

  return {
    id,
    fileName,
    fileType,
    isWooCommerce,
    processingMethod,
    extractedAmount: result.extractedAmount,
    expectedAmount: options?.expectedAmount,
    confidence: result.confidence,
    accuracy,
    processingTimeMs: result.processingTimeMs,
    success: result.success,
    errors: result.errors || [],
    warnings: result.warnings || [],
    timestamp: new Date(),
    userId: options?.userId
  }
}