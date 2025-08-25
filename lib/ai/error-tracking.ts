/**
 * Enhanced Error Tracking System for AI Processing
 * Provides structured error logging, categorization, and analytics
 */

import { prisma } from '@/lib/prisma'
import { logError, logWarn, logInfo } from '@/lib/secure-logger'

export interface AIError {
  id?: string
  documentId?: string
  userId?: string
  errorType: AIErrorType
  errorCode: string
  message: string
  stack?: string
  context: Record<string, any>
  processingMethod?: string
  confidence?: number
  retryCount?: number
  resolved?: boolean
  timestamp: Date
}

export type AIErrorType = 
  | 'API_ERROR'          // OpenAI API issues
  | 'EXTRACTION_ERROR'   // Failed to extract VAT data
  | 'VALIDATION_ERROR'   // Data validation failed
  | 'TEMPLATE_ERROR'     // Template matching issues
  | 'CONFIDENCE_ERROR'   // Low confidence scores
  | 'TIMEOUT_ERROR'      // Processing timeouts
  | 'RATE_LIMIT_ERROR'   // Rate limiting issues
  | 'PARSING_ERROR'      // Document parsing failures
  | 'LEARNING_ERROR'     // Learning pipeline failures
  | 'SYSTEM_ERROR'       // General system errors

export interface ErrorAnalytics {
  totalErrors: number
  errorsByType: Record<AIErrorType, number>
  errorRate: number
  topErrors: Array<{
    errorCode: string
    count: number
    message: string
    lastOccurrence: Date
  }>
  resolutionRate: number
  averageRetryCount: number
  criticalErrors: AIError[]
}

export class AIErrorTracker {

  /**
   * Log an AI processing error with structured data
   */
  static async logError(error: Omit<AIError, 'id' | 'timestamp'>): Promise<void> {
    try {
      const enhancedError: AIError = {
        ...error,
        timestamp: new Date(),
        retryCount: error.retryCount || 0,
        resolved: false
      }

      // Log to secure logger
      logError('AI processing error', {
        errorType: error.errorType,
        errorCode: error.errorCode,
        message: error.message,
        documentId: error.documentId,
        userId: error.userId,
        context: error.context,
        operation: 'ai-error-tracking'
      })

      // Store in database for analytics
      await this.storeErrorInDatabase(enhancedError)

      // Check for critical errors that need immediate attention
      if (this.isCriticalError(error)) {
        await this.handleCriticalError(enhancedError)
      }

      // Trigger auto-recovery if applicable
      if (this.canAutoRecover(error)) {
        await this.attemptAutoRecovery(enhancedError)
      }

    } catch (trackingError) {
      // Fallback logging if error tracking itself fails
      console.error('Failed to track AI error:', trackingError)
      logError('Error tracking system failure', {
        originalError: error.message,
        trackingError: trackingError.message,
        operation: 'error-tracking-failure'
      })
    }
  }

  /**
   * Get error analytics for dashboard
   */
  static async getErrorAnalytics(timeRange: 'day' | 'week' | 'month' = 'week'): Promise<ErrorAnalytics> {
    try {
      const startDate = this.getStartDate(timeRange)
      
      const [
        totalProcessed,
        totalErrors,
        errorsByType,
        topErrors,
        resolvedErrors,
        avgRetryCount
      ] = await Promise.all([
        // Total documents processed
        prisma.aIProcessingAnalytics.count({
          where: { processedAt: { gte: startDate } }
        }),

        // Total errors
        prisma.aIProcessingAnalytics.count({
          where: { 
            processedAt: { gte: startDate },
            hadErrors: true
          }
        }),

        // Errors by type
        this.getErrorsByType(startDate),

        // Top error codes
        this.getTopErrors(startDate),

        // Resolved errors
        prisma.aIProcessingAnalytics.count({
          where: { 
            processedAt: { gte: startDate },
            hadErrors: true,
            // Assuming resolved errors have subsequent successful processing
          }
        }),

        // Average retry count
        prisma.aIProcessingAnalytics.aggregate({
          where: { 
            processedAt: { gte: startDate },
            hadErrors: true
          },
          _avg: { 
            // We'll need to add retryCount to the analytics model
            tokensUsed: true // Placeholder for now
          }
        })
      ])

      const errorRate = totalProcessed > 0 ? (totalErrors / totalProcessed) * 100 : 0
      const resolutionRate = totalErrors > 0 ? (resolvedErrors / totalErrors) * 100 : 0

      // Get critical errors that need attention
      const criticalErrors = await this.getCriticalErrors(startDate)

      return {
        totalErrors,
        errorsByType,
        errorRate,
        topErrors,
        resolutionRate,
        averageRetryCount: 0, // Will be implemented when we add retry tracking
        criticalErrors
      }

    } catch (error) {
      logError('Failed to get error analytics', { error: error.message })
      return this.getEmptyAnalytics()
    }
  }

  /**
   * Mark an error as resolved
   */
  static async resolveError(errorId: string, resolution: string): Promise<void> {
    try {
      // This would update the error record if we store them separately
      logInfo('AI error resolved', {
        errorId,
        resolution,
        operation: 'error-resolution'
      })
    } catch (error) {
      logError('Failed to resolve error', { errorId, error: error.message })
    }
  }

  /**
   * Get error patterns for learning improvement
   */
  static async getErrorPatterns(): Promise<Array<{
    pattern: string
    frequency: number
    suggestedFix: string
    impact: 'low' | 'medium' | 'high'
  }>> {
    try {
      // Analyze common error patterns
      const patterns = [
        {
          pattern: 'Low confidence extraction (<50%)',
          frequency: await this.countLowConfidenceErrors(),
          suggestedFix: 'Improve prompts or add more training data',
          impact: 'high' as const
        },
        {
          pattern: 'API timeout errors',
          frequency: await this.countTimeoutErrors(),
          suggestedFix: 'Implement exponential backoff retry logic',
          impact: 'medium' as const
        },
        {
          pattern: 'Template matching failures',
          frequency: await this.countTemplateErrors(),
          suggestedFix: 'Expand template library or improve matching algorithm',
          impact: 'medium' as const
        },
        {
          pattern: 'Validation errors',
          frequency: await this.countValidationErrors(),
          suggestedFix: 'Review and improve validation rules',
          impact: 'low' as const
        }
      ]

      return patterns.filter(p => p.frequency > 0)

    } catch (error) {
      logError('Failed to get error patterns', { error: error.message })
      return []
    }
  }

  // Private helper methods

  private static async storeErrorInDatabase(error: AIError): Promise<void> {
    try {
      // For now, we'll use the existing analytics table
      // In a full implementation, we'd have a separate errors table
      if (error.documentId) {
        await prisma.aIProcessingAnalytics.updateMany({
          where: { 
            documentId: error.documentId 
          },
          data: {
            hadErrors: true,
            errorType: error.errorType,
            errorMessage: error.message
          }
        })
      }
    } catch (dbError) {
      console.error('Failed to store error in database:', dbError)
    }
  }

  private static isCriticalError(error: AIError): boolean {
    return [
      'API_ERROR',
      'SYSTEM_ERROR',
      'RATE_LIMIT_ERROR'
    ].includes(error.errorType) || 
    (error.errorCode.includes('CRITICAL')) ||
    (error.retryCount && error.retryCount >= 3)
  }

  private static async handleCriticalError(error: AIError): Promise<void> {
    logError('Critical AI error detected', {
      errorType: error.errorType,
      errorCode: error.errorCode,
      message: error.message,
      documentId: error.documentId,
      operation: 'critical-error-alert'
    })

    // In production, this would send alerts to monitoring systems
    console.error('🚨 CRITICAL AI ERROR:', error.message)
  }

  private static canAutoRecover(error: AIError): boolean {
    return [
      'TIMEOUT_ERROR',
      'RATE_LIMIT_ERROR',
      'API_ERROR'
    ].includes(error.errorType) && (!error.retryCount || error.retryCount < 3)
  }

  private static async attemptAutoRecovery(error: AIError): Promise<void> {
    logInfo('Attempting auto-recovery for error', {
      errorType: error.errorType,
      errorCode: error.errorCode,
      retryCount: error.retryCount,
      operation: 'auto-recovery'
    })

    // Implementation would depend on error type
    // For now, just log the attempt
  }

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

  private static async getErrorsByType(startDate: Date): Promise<Record<AIErrorType, number>> {
    try {
      const results = await prisma.aIProcessingAnalytics.groupBy({
        by: ['errorType'],
        where: {
          processedAt: { gte: startDate },
          hadErrors: true,
          errorType: { not: null }
        },
        _count: { _all: true }
      })

      const errorsByType: Record<string, number> = {}
      results.forEach(result => {
        if (result.errorType) {
          errorsByType[result.errorType] = result._count._all
        }
      })

      return errorsByType as Record<AIErrorType, number>
    } catch (error) {
      return {} as Record<AIErrorType, number>
    }
  }

  private static async getTopErrors(startDate: Date): Promise<Array<{
    errorCode: string
    count: number
    message: string
    lastOccurrence: Date
  }>> {
    try {
      const results = await prisma.aIProcessingAnalytics.groupBy({
        by: ['errorMessage'],
        where: {
          processedAt: { gte: startDate },
          hadErrors: true,
          errorMessage: { not: null }
        },
        _count: { _all: true },
        _max: { processedAt: true },
        orderBy: { _count: { _all: 'desc' } },
        take: 10
      })

      return results.map(result => ({
        errorCode: this.generateErrorCode(result.errorMessage || 'UNKNOWN'),
        count: result._count._all,
        message: result.errorMessage || 'Unknown error',
        lastOccurrence: result._max.processedAt || new Date()
      }))
    } catch (error) {
      return []
    }
  }

  private static async getCriticalErrors(startDate: Date): Promise<AIError[]> {
    try {
      const criticalAnalytics = await prisma.aIProcessingAnalytics.findMany({
        where: {
          processedAt: { gte: startDate },
          hadErrors: true,
          OR: [
            { errorType: 'SYSTEM_ERROR' },
            { errorType: 'API_ERROR' },
            { confidenceScore: { lt: 0.3 } }
          ]
        },
        take: 20,
        orderBy: { processedAt: 'desc' }
      })

      return criticalAnalytics.map(analytics => ({
        id: analytics.id,
        documentId: analytics.documentId,
        userId: analytics.userId,
        errorType: (analytics.errorType as AIErrorType) || 'SYSTEM_ERROR',
        errorCode: this.generateErrorCode(analytics.errorMessage || 'CRITICAL'),
        message: analytics.errorMessage || 'Critical system error',
        context: {
          processingStrategy: analytics.processingStrategy,
          confidenceScore: analytics.confidenceScore,
          processingTime: analytics.processingTime
        },
        processingMethod: analytics.processingStrategy,
        confidence: analytics.confidenceScore,
        timestamp: analytics.processedAt
      }))
    } catch (error) {
      return []
    }
  }

  private static async countLowConfidenceErrors(): Promise<number> {
    try {
      return await prisma.aIProcessingAnalytics.count({
        where: {
          confidenceScore: { lt: 0.5 },
          processedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      })
    } catch (error) {
      return 0
    }
  }

  private static async countTimeoutErrors(): Promise<number> {
    try {
      return await prisma.aIProcessingAnalytics.count({
        where: {
          errorType: 'TIMEOUT_ERROR',
          processedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      })
    } catch (error) {
      return 0
    }
  }

  private static async countTemplateErrors(): Promise<number> {
    try {
      return await prisma.aIProcessingAnalytics.count({
        where: {
          errorType: 'TEMPLATE_ERROR',
          processedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      })
    } catch (error) {
      return 0
    }
  }

  private static async countValidationErrors(): Promise<number> {
    try {
      return await prisma.aIProcessingAnalytics.count({
        where: {
          errorType: 'VALIDATION_ERROR',
          processedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      })
    } catch (error) {
      return 0
    }
  }

  private static generateErrorCode(message: string): string {
    return message
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, '')
      .split(' ')
      .slice(0, 3)
      .join('_') || 'UNKNOWN_ERROR'
  }

  private static getEmptyAnalytics(): ErrorAnalytics {
    return {
      totalErrors: 0,
      errorsByType: {} as Record<AIErrorType, number>,
      errorRate: 0,
      topErrors: [],
      resolutionRate: 0,
      averageRetryCount: 0,
      criticalErrors: []
    }
  }
}

// Export for use in other modules
export { AIErrorTracker as default }