/**
 * Circuit Breaker Pattern Implementation
 * Prevents cascading failures by stopping requests when service is down
 */

export enum CircuitState {
  CLOSED = 'closed',     // Normal operation
  OPEN = 'open',         // Service is down, reject immediately
  HALF_OPEN = 'half-open' // Testing if service recovered
}

export interface CircuitBreakerOptions {
  failureThreshold: number      // Number of failures before opening circuit
  successThreshold: number      // Number of successes needed to close circuit in half-open state
  timeout: number              // Time to wait before trying half-open (ms)
  monitor?: (event: string, data: any) => void // Optional monitoring callback
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED
  private failureCount: number = 0
  private successCount: number = 0
  private nextAttempt: number = 0
  private readonly options: CircuitBreakerOptions

  constructor(options: CircuitBreakerOptions) {
    this.options = {
      failureThreshold: 3,
      successThreshold: 2,
      timeout: 60000, // 1 minute
      ...options
    }
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        this.options.monitor?.('circuit_open_reject', {
          nextAttempt: new Date(this.nextAttempt).toISOString(),
          failureCount: this.failureCount
        })
        throw new Error('Circuit breaker is OPEN - service unavailable')
      } else {
        this.state = CircuitState.HALF_OPEN
        this.successCount = 0
        this.options.monitor?.('circuit_half_open', {
          previousFailures: this.failureCount
        })
      }
    }

    try {
      const result = await operation()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess(): void {
    this.failureCount = 0

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++
      if (this.successCount >= this.options.successThreshold) {
        this.state = CircuitState.CLOSED
        this.options.monitor?.('circuit_closed', {
          successCount: this.successCount
        })
      }
    }
  }

  private onFailure(): void {
    this.failureCount++

    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.OPEN
      this.nextAttempt = Date.now() + this.options.timeout
      this.options.monitor?.('circuit_open_from_half_open', {
        failureCount: this.failureCount,
        nextAttempt: new Date(this.nextAttempt).toISOString()
      })
    } else if (this.failureCount >= this.options.failureThreshold) {
      this.state = CircuitState.OPEN
      this.nextAttempt = Date.now() + this.options.timeout
      this.options.monitor?.('circuit_opened', {
        failureCount: this.failureCount,
        nextAttempt: new Date(this.nextAttempt).toISOString()
      })
    }
  }

  getState(): CircuitState {
    return this.state
  }

  getStats() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      nextAttempt: this.nextAttempt > 0 ? new Date(this.nextAttempt).toISOString() : null
    }
  }

  reset(): void {
    this.state = CircuitState.CLOSED
    this.failureCount = 0
    this.successCount = 0
    this.nextAttempt = 0
    this.options.monitor?.('circuit_reset', {})
  }
}

// Create circuit breakers for different services - Aggressive reconnection
export const databaseCircuitBreaker = new CircuitBreaker({
  failureThreshold: 5, // Allow more failures before opening
  successThreshold: 1, // Close immediately on first success
  timeout: 5000, // Only wait 5 seconds before trying again
  monitor: (event, data) => {
    console.log(`[DB Circuit Breaker] ${event}:`, data)
  }
})

export const apiCircuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  successThreshold: 3,
  timeout: 30000, // 30 seconds
  monitor: (event, data) => {
    console.log(`[API Circuit Breaker] ${event}:`, data)
  }
})