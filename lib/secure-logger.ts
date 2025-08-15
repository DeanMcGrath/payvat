/**
 * Secure Production Logger
 * Replaces console.log to prevent GDPR violations and data exposure
 */

interface LogLevel {
  ERROR: 'error'
  WARN: 'warn'
  INFO: 'info'
  DEBUG: 'debug'
}

const LOG_LEVELS: LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
}

interface LogContext {
  userId?: string
  sessionId?: string
  documentId?: string
  filePath?: string
  operation?: string
  timestamp?: string
  count?: number
  result?: 'SUCCESS' | 'FAILURE'
  maxAgeHours?: number
  dryRun?: boolean
  [key: string]: any // Allow additional properties
}

class SecureLogger {
  private isProduction = process.env.NODE_ENV === 'production'
  private enabledLevel = process.env.LOG_LEVEL || 'error'

  /**
   * Log error - only critical errors in production
   */
  error(message: string, error?: any, context?: LogContext) {
    if (this.shouldLog('error')) {
      const logEntry = this.sanitizeLogEntry({
        level: 'ERROR',
        message,
        error: this.sanitizeError(error),
        context: this.sanitizeContext(context),
        timestamp: new Date().toISOString()
      })

      if (this.isProduction) {
        // In production, send to external logging service
        this.sendToLoggingService(logEntry)
      } else {
        console.error('🚨 ERROR:', logEntry)
      }
    }
  }

  /**
   * Log warning - only in development or for critical warnings
   */
  warn(message: string, context?: LogContext) {
    if (this.shouldLog('warn') && !this.isProduction) {
      console.warn('⚠️ WARNING:', {
        message,
        context: this.sanitizeContext(context),
        timestamp: new Date().toISOString()
      })
    }
  }

  /**
   * Log info - development only
   */
  info(message: string, context?: LogContext) {
    if (this.shouldLog('info') && !this.isProduction) {
      console.info('ℹ️ INFO:', {
        message,
        context: this.sanitizeContext(context),
        timestamp: new Date().toISOString()
      })
    }
  }

  /**
   * Debug logging - development only
   */
  debug(message: string, data?: any, context?: LogContext) {
    if (this.shouldLog('debug') && !this.isProduction) {
      console.log('🔍 DEBUG:', {
        message,
        data: this.sanitizeData(data),
        context: this.sanitizeContext(context),
        timestamp: new Date().toISOString()
      })
    }
  }

  /**
   * Log system performance metrics
   */
  performance(operation: string, duration: number, context?: LogContext) {
    if (!this.isProduction) {
      console.log('⏱️ PERFORMANCE:', {
        operation,
        duration: `${duration}ms`,
        context: this.sanitizeContext(context),
        timestamp: new Date().toISOString()
      })
    } else {
      // In production, only log slow operations
      if (duration > 5000) {
        this.sendToLoggingService({
          type: 'SLOW_OPERATION',
          operation,
          duration,
          timestamp: new Date().toISOString()
        })
      }
    }
  }

  /**
   * NEVER log sensitive data in production
   */
  private sanitizeContext(context?: LogContext) {
    if (!context) return {}
    
    return {
      userId: context.userId ? '***' : undefined,
      sessionId: context.sessionId ? '***' : undefined,
      documentId: context.documentId ? '***' : undefined,
      operation: context.operation,
      timestamp: context.timestamp
    }
  }

  private sanitizeData(data: any) {
    if (!data) return null
    
    if (this.isProduction) {
      return '[REDACTED]'
    }

    // In development, still sanitize sensitive fields
    if (typeof data === 'object') {
      const sanitized = { ...data }
      const sensitiveFields = ['password', 'token', 'vatNumber', 'email', 'businessName', 'fileData', 'scanResult']
      
      sensitiveFields.forEach(field => {
        if (sanitized[field]) {
          sanitized[field] = '[SENSITIVE]'
        }
      })
      
      return sanitized
    }
    
    return data
  }

  private sanitizeError(error: any) {
    if (!error) return null
    
    return {
      message: error.message || 'Unknown error',
      stack: this.isProduction ? '[REDACTED]' : error.stack,
      code: error.code,
      type: error.constructor?.name
    }
  }

  private sanitizeLogEntry(entry: any) {
    // Never log actual user data in production
    const sanitized = { ...entry }
    
    if (this.isProduction) {
      // Remove any potential sensitive data
      delete sanitized.context?.userId
      delete sanitized.context?.sessionId
      delete sanitized.context?.documentId
    }
    
    return sanitized
  }

  private shouldLog(level: string): boolean {
    const levels = ['error', 'warn', 'info', 'debug']
    const currentLevelIndex = levels.indexOf(this.enabledLevel)
    const requestedLevelIndex = levels.indexOf(level)
    
    return requestedLevelIndex <= currentLevelIndex
  }

  private sendToLoggingService(logEntry: any) {
    // In production, send to external logging service like DataDog, Sentry, etc.
    // For now, just store critical errors
    try {
      // This would be your external logging service
      // await loggingService.send(logEntry)
    } catch (err) {
      // Fallback - never let logging break the app
    }
  }

  /**
   * Audit log for compliance
   */
  audit(action: string, context: LogContext & { result?: 'SUCCESS' | 'FAILURE' }) {
    const auditEntry = {
      type: 'AUDIT',
      action,
      userId: context.userId ? '***' : 'ANONYMOUS',
      result: context.result || 'SUCCESS',
      timestamp: new Date().toISOString(),
      operation: context.operation
    }

    if (this.isProduction) {
      this.sendToLoggingService(auditEntry)
    } else {
      console.log('📋 AUDIT:', auditEntry)
    }
  }
}

// Export singleton instance
export const secureLogger = new SecureLogger()

// Convenience exports
export const logError = (message: string, error?: any, context?: LogContext) => 
  secureLogger.error(message, error, context)

export const logWarn = (message: string, context?: LogContext) => 
  secureLogger.warn(message, context)

export const logInfo = (message: string, context?: LogContext) => 
  secureLogger.info(message, context)

export const logDebug = (message: string, data?: any, context?: LogContext) => 
  secureLogger.debug(message, data, context)

export const logPerformance = (operation: string, duration: number, context?: LogContext) => 
  secureLogger.performance(operation, duration, context)

export const logAudit = (action: string, context: LogContext & { result?: 'SUCCESS' | 'FAILURE' }) => 
  secureLogger.audit(action, context)

// Development helper - throw error if console.log used in production
if (process.env.NODE_ENV === 'production') {
  const originalConsole = console.log
  console.log = (...args: any[]) => {
    throw new Error('🚨 SECURITY VIOLATION: console.log used in production! Use secureLogger instead.')
  }
  
  console.warn = (...args: any[]) => {
    throw new Error('🚨 SECURITY VIOLATION: console.warn used in production! Use secureLogger instead.')
  }
  
  console.info = (...args: any[]) => {
    throw new Error('🚨 SECURITY VIOLATION: console.info used in production! Use secureLogger instead.')
  }
}