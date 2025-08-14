/**
 * Enhanced Error Handling for VAT Extraction System
 * Provides robust error handling, circuit breakers, and graceful degradation
 */

export class VATExtractionError extends Error {
  public readonly code: string
  public readonly recoverable: boolean
  public readonly context: any

  constructor(message: string, code: string, recoverable: boolean = true, context?: any) {
    super(message)
    this.name = 'VATExtractionError'
    this.code = code
    this.recoverable = recoverable
    this.context = context
  }
}

export class CircuitBreakerError extends VATExtractionError {
  constructor(service: string, failureCount: number) {
    super(
      `Circuit breaker open for ${service} after ${failureCount} failures`,
      'CIRCUIT_BREAKER_OPEN',
      false,
      { service, failureCount }
    )
  }
}

export class ProcessingTimeoutError extends VATExtractionError {
  constructor(operation: string, timeoutMs: number) {
    super(
      `Operation ${operation} timed out after ${timeoutMs}ms`,
      'PROCESSING_TIMEOUT',
      true,
      { operation, timeoutMs }
    )
  }
}

// Circuit Breaker Pattern Implementation
export class CircuitBreaker {
  private failures = 0
  private lastFailureTime = 0
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED'

  constructor(
    private readonly service: string,
    private readonly failureThreshold: number = 5,
    private readonly recoveryTimeMs: number = 60000, // 1 minute
    private readonly timeoutMs: number = 30000 // 30 seconds
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeMs) {
        this.state = 'HALF_OPEN'
        console.log(`🔄 Circuit breaker for ${this.service} moving to HALF_OPEN`)
      } else {
        throw new CircuitBreakerError(this.service, this.failures)
      }
    }

    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new ProcessingTimeoutError(this.service, this.timeoutMs))
        }, this.timeoutMs)
      })

      const result = await Promise.race([operation(), timeoutPromise])
      
      // Success - reset or close circuit
      if (this.state === 'HALF_OPEN') {
        this.state = 'CLOSED'
        this.failures = 0
        console.log(`✅ Circuit breaker for ${this.service} restored to CLOSED`)
      }
      
      return result
    } catch (error) {
      this.failures++
      this.lastFailureTime = Date.now()

      if (this.failures >= this.failureThreshold) {
        this.state = 'OPEN'
        console.log(`🚨 Circuit breaker OPEN for ${this.service} after ${this.failures} failures`)
      }

      throw error
    }
  }

  getStatus() {
    return {
      service: this.service,
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime
    }
  }
}

// Retry Logic with Exponential Backoff
export class RetryHandler {
  constructor(
    private readonly maxRetries: number = 3,
    private readonly baseDelayMs: number = 1000,
    private readonly maxDelayMs: number = 10000
  ) {}

  async execute<T>(
    operation: () => Promise<T>,
    shouldRetry: (error: Error) => boolean = (error) => error instanceof VATExtractionError && error.recoverable
  ): Promise<T> {
    let lastError: Error
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error
        
        if (attempt === this.maxRetries || !shouldRetry(lastError)) {
          break
        }

        const delay = Math.min(
          this.baseDelayMs * Math.pow(2, attempt - 1),
          this.maxDelayMs
        )

        console.log(`⚠️ Attempt ${attempt}/${this.maxRetries} failed: ${lastError.message}. Retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw lastError!
  }
}

// Error Context Collector
export class ErrorContext {
  private static contexts = new Map<string, any>()

  static addContext(key: string, value: any) {
    this.contexts.set(key, value)
  }

  static getContext(): Record<string, any> {
    return Object.fromEntries(this.contexts.entries())
  }

  static clearContext() {
    this.contexts.clear()
  }
}

// Graceful Degradation Handler
export class GracefulDegradation {
  private static fallbackMethods = new Map<string, Function>()

  static registerFallback(service: string, fallbackFn: Function) {
    this.fallbackMethods.set(service, fallbackFn)
  }

  static async executeFallback(service: string, ...args: any[]): Promise<any> {
    const fallback = this.fallbackMethods.get(service)
    if (!fallback) {
      throw new VATExtractionError(
        `No fallback available for service: ${service}`,
        'NO_FALLBACK_AVAILABLE',
        false
      )
    }

    console.log(`🔄 Executing fallback for ${service}`)
    return fallback(...args)
  }
}

// Enhanced Error Reporter
export class ErrorReporter {
  private static errorCounts = new Map<string, number>()

  static reportError(error: Error, context?: any) {
    const errorKey = `${error.constructor.name}:${error.message}`
    const count = this.errorCounts.get(errorKey) || 0
    this.errorCounts.set(errorKey, count + 1)

    const errorReport = {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        ...(error instanceof VATExtractionError && {
          code: error.code,
          recoverable: error.recoverable,
          context: error.context
        })
      },
      occurrenceCount: count + 1,
      context: {
        ...ErrorContext.getContext(),
        ...context
      }
    }

    // Log error (in production, send to monitoring service)
    console.error('🚨 VAT Extraction Error:', JSON.stringify(errorReport, null, 2))

    return errorReport
  }

  static getErrorStats() {
    return Object.fromEntries(this.errorCounts.entries())
  }
}

// Health Check System
export class HealthChecker {
  private static checks = new Map<string, () => Promise<boolean>>()

  static registerCheck(service: string, checkFn: () => Promise<boolean>) {
    this.checks.set(service, checkFn)
  }

  static async checkHealth(): Promise<{ service: string, healthy: boolean, error?: string }[]> {
    const results = []
    
    for (const [service, checkFn] of this.checks.entries()) {
      try {
        const healthy = await checkFn()
        results.push({ service, healthy })
      } catch (error) {
        results.push({ 
          service, 
          healthy: false, 
          error: (error as Error).message 
        })
      }
    }

    return results
  }
}

// Input Validation and Sanitization
export class InputValidator {
  static validateDocumentInput(fileData: string, mimeType: string, fileName: string) {
    const errors: string[] = []

    // Validate file data
    if (!fileData || typeof fileData !== 'string') {
      errors.push('File data is required and must be a string')
    }

    if (fileData && fileData.length > 50 * 1024 * 1024) { // 50MB limit
      errors.push('File size exceeds maximum allowed size (50MB)')
    }

    // Validate MIME type
    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain'
    ]

    if (!mimeType || !allowedMimeTypes.includes(mimeType)) {
      errors.push(`Invalid MIME type: ${mimeType}. Allowed types: ${allowedMimeTypes.join(', ')}`)
    }

    // Validate filename
    if (!fileName || typeof fileName !== 'string') {
      errors.push('Filename is required and must be a string')
    }

    if (fileName && !/^[a-zA-Z0-9._-]+\.[a-zA-Z0-9]+$/.test(fileName)) {
      errors.push('Filename contains invalid characters')
    }

    if (errors.length > 0) {
      throw new VATExtractionError(
        'Input validation failed',
        'INVALID_INPUT',
        false,
        { errors }
      )
    }
  }

  static sanitizeText(text: string): string {
    if (!text) return ''

    // Remove potential XSS and injection attempts
    return text
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim()
  }

  static validateVATAmount(amount: number): boolean {
    return (
      typeof amount === 'number' &&
      !isNaN(amount) &&
      isFinite(amount) &&
      amount >= 0 &&
      amount <= 1000000 // Reasonable upper bound
    )
  }
}

// Resource Monitor
export class ResourceMonitor {
  private static memoryThreshold = 500 * 1024 * 1024 // 500MB
  private static cpuThreshold = 80 // 80% CPU

  static checkResources(): { memory: number, withinLimits: boolean } {
    const memoryUsage = process.memoryUsage()
    const withinLimits = memoryUsage.heapUsed < this.memoryThreshold

    return {
      memory: memoryUsage.heapUsed,
      withinLimits
    }
  }

  static async enforceResourceLimits() {
    const { memory, withinLimits } = this.checkResources()

    if (!withinLimits) {
      // Force garbage collection if available
      if (global.gc) {
        global.gc()
        console.log('🗑️ Forced garbage collection due to high memory usage')
      }

      throw new VATExtractionError(
        `Memory usage (${Math.round(memory / 1024 / 1024)}MB) exceeds threshold`,
        'RESOURCE_LIMIT_EXCEEDED',
        true,
        { memoryUsage: memory, threshold: this.memoryThreshold }
      )
    }
  }
}

// Export all error handling utilities
export {
  VATExtractionError as default
}