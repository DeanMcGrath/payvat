// Production-safe logging utility

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogMessage {
  level: LogLevel
  message: string
  data?: any
  timestamp: string
  context?: string
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  private log(level: LogLevel, message: string, data?: any, context?: string) {
    const logMessage: LogMessage = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      context
    }

    // In development, log to console
    if (this.isDevelopment) {
      const contextPrefix = context ? `[${context}] ` : ''
      const dataStr = data ? ` ${JSON.stringify(data)}` : ''
      
      switch (level) {
        case 'debug':
          console.debug(`${contextPrefix}${message}${dataStr}`)
          break
        case 'info':
          console.info(`${contextPrefix}${message}${dataStr}`)
          break
        case 'warn':
          console.warn(`${contextPrefix}${message}${dataStr}`)
          break
        case 'error':
          console.error(`${contextPrefix}${message}${dataStr}`)
          break
      }
    } else {
      // In production, you could send to a logging service
      // For now, we'll only log errors to console
      if (level === 'error') {
        console.error(`[${level.toUpperCase()}] ${message}`, data)
      }
    }
  }

  debug(message: string, data?: any, context?: string) {
    this.log('debug', message, data, context)
  }

  info(message: string, data?: any, context?: string) {
    this.log('info', message, data, context)
  }

  warn(message: string, data?: any, context?: string) {
    this.log('warn', message, data, context)
  }

  error(message: string, data?: any, context?: string) {
    this.log('error', message, data, context)
  }
}

export const logger = new Logger()

// Convenience functions for backward compatibility
export const log = {
  debug: logger.debug.bind(logger),
  info: logger.info.bind(logger),
  warn: logger.warn.bind(logger),
  error: logger.error.bind(logger)
}