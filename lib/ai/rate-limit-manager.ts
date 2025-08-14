/**
 * Intelligent Rate Limit Management System
 * Handles OpenAI API rate limits with smart queuing and retry logic
 */

interface RateLimitConfig {
  requestsPerMinute: number
  tokensPerMinute: number
  maxRetries: number
  baseDelayMs: number
  maxDelayMs: number
  queueLimit: number
}

interface QueuedRequest {
  id: string
  request: () => Promise<any>
  resolve: (value: any) => void
  reject: (error: any) => void
  timestamp: number
  retries: number
  priority: 'low' | 'medium' | 'high'
}

interface RateLimitState {
  requestsThisMinute: number
  tokensThisMinute: number
  lastRequestTime: number
  windowStart: number
  consecutiveErrors: number
}

export class RateLimitManager {
  private config: RateLimitConfig
  private state: RateLimitState
  private requestQueue: QueuedRequest[] = []
  private processing = false
  private circuitBreakerOpen = false
  private circuitBreakerOpenTime = 0
  
  constructor(config?: Partial<RateLimitConfig>) {
    this.config = {
      requestsPerMinute: 50,  // Conservative limit
      tokensPerMinute: 40000, // Conservative token limit
      maxRetries: 3,
      baseDelayMs: 1000,
      maxDelayMs: 30000,
      queueLimit: 100,
      ...config
    }
    
    this.state = {
      requestsThisMinute: 0,
      tokensThisMinute: 0,
      lastRequestTime: 0,
      windowStart: Date.now(),
      consecutiveErrors: 0
    }
  }

  /**
   * Execute a request with rate limiting and retry logic
   */
  async executeRequest<T>(
    requestFn: () => Promise<T>,
    estimatedTokens: number = 1000,
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Check queue limit
      if (this.requestQueue.length >= this.config.queueLimit) {
        reject(new Error('Request queue full - please try again later'))
        return
      }
      
      // Check circuit breaker
      if (this.circuitBreakerOpen) {
        const timeSinceOpen = Date.now() - this.circuitBreakerOpenTime
        if (timeSinceOpen < 60000) { // 1 minute circuit breaker
          reject(new Error('Circuit breaker open - API experiencing issues'))
          return
        } else {
          // Reset circuit breaker
          this.circuitBreakerOpen = false
          this.state.consecutiveErrors = 0
          console.log('🔄 Circuit breaker reset - resuming requests')
        }
      }
      
      const queuedRequest: QueuedRequest = {
        id: requestId,
        request: requestFn,
        resolve,
        reject,
        timestamp: Date.now(),
        retries: 0,
        priority
      }
      
      // Insert based on priority
      if (priority === 'high') {
        this.requestQueue.unshift(queuedRequest)
      } else {
        this.requestQueue.push(queuedRequest)
      }
      
      console.log(`📋 Queued request ${requestId} (priority: ${priority}, queue length: ${this.requestQueue.length})`)
      
      // Start processing if not already running
      if (!this.processing) {
        this.processQueue()
      }
    })
  }

  /**
   * Process the request queue
   */
  private async processQueue(): Promise<void> {
    this.processing = true
    
    while (this.requestQueue.length > 0) {
      // Check if we need to wait for rate limits
      await this.waitForRateLimit()
      
      const request = this.requestQueue.shift()!
      
      try {
        console.log(`🚀 Executing request ${request.id} (${request.retries} retries)`)
        
        const startTime = Date.now()
        const result = await request.request()
        const duration = Date.now() - startTime
        
        // Update rate limit tracking
        this.updateRateLimitState(1, 1000) // Estimate 1000 tokens
        
        console.log(`✅ Request ${request.id} completed in ${duration}ms`)
        request.resolve(result)
        
        // Reset consecutive errors on success
        this.state.consecutiveErrors = 0
        
      } catch (error: any) {
        console.error(`❌ Request ${request.id} failed:`, error.message)
        
        // Check if this is a rate limit error
        if (this.isRateLimitError(error)) {
          console.log(`⏳ Rate limit hit for request ${request.id}`)
          
          // Re-queue with higher delay
          if (request.retries < this.config.maxRetries) {
            request.retries++
            const delay = Math.min(
              this.config.baseDelayMs * Math.pow(2, request.retries),
              this.config.maxDelayMs
            )
            
            console.log(`🔄 Re-queuing request ${request.id} with ${delay}ms delay`)
            setTimeout(() => {
              this.requestQueue.unshift(request) // High priority for retries
            }, delay)
            
            continue
          }
        }
        
        // Track consecutive errors for circuit breaker
        this.state.consecutiveErrors++
        if (this.state.consecutiveErrors >= 5) {
          console.log('🚨 Circuit breaker triggered due to consecutive errors')
          this.circuitBreakerOpen = true
          this.circuitBreakerOpenTime = Date.now()
        }
        
        // Check if we should retry
        if (request.retries < this.config.maxRetries && !this.isUnretryableError(error)) {
          request.retries++
          const delay = Math.min(
            this.config.baseDelayMs * Math.pow(2, request.retries),
            this.config.maxDelayMs
          )
          
          console.log(`🔄 Retrying request ${request.id} in ${delay}ms (attempt ${request.retries + 1})`)
          setTimeout(() => {
            this.requestQueue.push(request)
          }, delay)
          
        } else {
          console.log(`💥 Request ${request.id} failed permanently after ${request.retries} retries`)
          request.reject(error)
        }
      }
      
      // Small delay between requests to avoid overwhelming the API
      await this.sleep(100)
    }
    
    this.processing = false
    console.log('📋 Request queue processing complete')
  }

  /**
   * Wait for rate limits to reset if necessary
   */
  private async waitForRateLimit(): Promise<void> {
    const now = Date.now()
    const windowElapsed = now - this.state.windowStart
    
    // Reset window if a minute has passed
    if (windowElapsed >= 60000) {
      this.state.windowStart = now
      this.state.requestsThisMinute = 0
      this.state.tokensThisMinute = 0
    }
    
    // Check if we're near rate limits
    if (this.state.requestsThisMinute >= this.config.requestsPerMinute * 0.8) {
      const timeToWait = 60000 - windowElapsed + 1000 // Add 1s buffer
      if (timeToWait > 0) {
        console.log(`⏳ Rate limit protection: waiting ${Math.round(timeToWait/1000)}s before next request`)
        await this.sleep(timeToWait)
        
        // Reset window
        this.state.windowStart = Date.now()
        this.state.requestsThisMinute = 0
        this.state.tokensThisMinute = 0
      }
    }
    
    // Adaptive delay based on recent errors
    if (this.state.consecutiveErrors > 0) {
      const adaptiveDelay = Math.min(this.state.consecutiveErrors * 1000, 10000)
      console.log(`⏳ Adaptive delay: ${adaptiveDelay}ms due to recent errors`)
      await this.sleep(adaptiveDelay)
    }
  }

  /**
   * Update rate limit tracking
   */
  private updateRateLimitState(requests: number, tokens: number): void {
    this.state.requestsThisMinute += requests
    this.state.tokensThisMinute += tokens
    this.state.lastRequestTime = Date.now()
  }

  /**
   * Check if error is a rate limit error
   */
  private isRateLimitError(error: any): boolean {
    return error.status === 429 || 
           error.code === 'rate_limit_exceeded' ||
           error.message?.includes('rate limit') ||
           error.message?.includes('429')
  }

  /**
   * Check if error should not be retried
   */
  private isUnretryableError(error: any): boolean {
    return error.status === 401 ||  // Authentication error
           error.status === 403 ||  // Permission error
           error.status === 400 ||  // Bad request
           error.code === 'invalid_request_error'
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Get current queue status
   */
  getQueueStatus(): {
    queueLength: number
    requestsThisMinute: number
    tokensThisMinute: number
    circuitBreakerOpen: boolean
    consecutiveErrors: number
  } {
    return {
      queueLength: this.requestQueue.length,
      requestsThisMinute: this.state.requestsThisMinute,
      tokensThisMinute: this.state.tokensThisMinute,
      circuitBreakerOpen: this.circuitBreakerOpen,
      consecutiveErrors: this.state.consecutiveErrors
    }
  }

  /**
   * Clear the queue (emergency use)
   */
  clearQueue(): void {
    const rejectedRequests = this.requestQueue.splice(0)
    rejectedRequests.forEach(req => {
      req.reject(new Error('Queue cleared'))
    })
    console.log(`🗑️ Cleared ${rejectedRequests.length} requests from queue`)
  }
}

// Global rate limit manager instance
export const rateLimitManager = new RateLimitManager()

console.log('🚦 Rate Limit Manager initialized')