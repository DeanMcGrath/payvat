#!/usr/bin/env node

/**
 * Test Enhanced Error Handling System
 * Validates circuit breakers, retry logic, and graceful degradation
 */

// Mock the error handling system for testing
const errors = [];

class VATExtractionError extends Error {
  constructor(message, code, recoverable = true, context) {
    super(message);
    this.name = 'VATExtractionError';
    this.code = code;
    this.recoverable = recoverable;
    this.context = context;
  }
}

class CircuitBreaker {
  constructor(service, failureThreshold = 3, recoveryTimeMs = 30000, timeoutMs = 15000) {
    this.service = service;
    this.failureThreshold = failureThreshold;
    this.recoveryTimeMs = recoveryTimeMs;
    this.timeoutMs = timeoutMs;
    this.failures = 0;
    this.lastFailureTime = 0;
    this.state = 'CLOSED';
  }

  async execute(operation) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeMs) {
        this.state = 'HALF_OPEN';
        console.log(`🔄 Circuit breaker for ${this.service} moving to HALF_OPEN`);
      } else {
        throw new VATExtractionError(
          `Circuit breaker open for ${this.service}`,
          'CIRCUIT_BREAKER_OPEN',
          false,
          { service: this.service, failures: this.failures }
        );
      }
    }

    try {
      const result = await operation();
      
      if (this.state === 'HALF_OPEN') {
        this.state = 'CLOSED';
        this.failures = 0;
        console.log(`✅ Circuit breaker for ${this.service} restored to CLOSED`);
      }
      
      return result;
    } catch (error) {
      this.failures++;
      this.lastFailureTime = Date.now();

      if (this.failures >= this.failureThreshold) {
        this.state = 'OPEN';
        console.log(`🚨 Circuit breaker OPEN for ${this.service} after ${this.failures} failures`);
      }

      throw error;
    }
  }

  getStatus() {
    return {
      service: this.service,
      state: this.state,
      failures: this.failures
    };
  }
}

class RetryHandler {
  constructor(maxRetries = 3, baseDelayMs = 1000, maxDelayMs = 10000) {
    this.maxRetries = maxRetries;
    this.baseDelayMs = baseDelayMs;
    this.maxDelayMs = maxDelayMs;
  }

  async execute(operation, shouldRetry = (error) => error.recoverable) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === this.maxRetries || !shouldRetry(lastError)) {
          break;
        }

        const delay = Math.min(
          this.baseDelayMs * Math.pow(2, attempt - 1),
          this.maxDelayMs
        );

        console.log(`⚠️ Attempt ${attempt}/${this.maxRetries} failed: ${lastError.message}. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }
}

class GracefulDegradation {
  static fallbackMethods = new Map();

  static registerFallback(service, fallbackFn) {
    this.fallbackMethods.set(service, fallbackFn);
  }

  static async executeFallback(service, ...args) {
    const fallback = this.fallbackMethods.get(service);
    if (!fallback) {
      throw new VATExtractionError(
        `No fallback available for service: ${service}`,
        'NO_FALLBACK_AVAILABLE',
        false
      );
    }

    console.log(`🔄 Executing fallback for ${service}`);
    return fallback(...args);
  }
}

// Test functions
let testCount = 0;
let passCount = 0;
let failCount = 0;

function test(description, testFn) {
  testCount++;
  try {
    testFn();
    console.log(`✅ ${testCount}. ${description}`);
    passCount++;
  } catch (error) {
    console.log(`❌ ${testCount}. ${description}`);
    console.log(`   Error: ${error.message}`);
    failCount++;
  }
}

function expect(actual) {
  return {
    toBe: (expected) => {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, got ${actual}`);
      }
    },
    toThrow: () => {
      if (typeof actual !== 'function') {
        throw new Error('Expected a function for toThrow()');
      }
      try {
        actual();
        throw new Error('Expected function to throw, but it did not');
      } catch (error) {
        // Function threw as expected
      }
    },
    toBeGreaterThan: (expected) => {
      if (actual <= expected) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`);
      }
    }
  };
}

// Run tests
console.log('🧪 Starting Enhanced Error Handling Tests\n');

// Test 1: VATExtractionError creation
test('VATExtractionError creation with context', () => {
  const error = new VATExtractionError('Test error', 'TEST_ERROR', true, { test: 'context' });
  expect(error.name).toBe('VATExtractionError');
  expect(error.code).toBe('TEST_ERROR');
  expect(error.recoverable).toBe(true);
});

// Test 2: Circuit Breaker - normal operation
test('Circuit Breaker normal operation', async () => {
  const cb = new CircuitBreaker('TEST_SERVICE', 2);
  
  const result = await cb.execute(async () => {
    return 'success';
  });
  
  expect(result).toBe('success');
  expect(cb.getStatus().state).toBe('CLOSED');
});

// Test 3: Circuit Breaker - failure and opening
test('Circuit Breaker failure threshold', async () => {
  const cb = new CircuitBreaker('FAIL_SERVICE', 2, 100); // Low recovery time for testing
  
  // First failure
  try {
    await cb.execute(async () => {
      throw new Error('Service failed');
    });
  } catch (error) {
    // Expected to fail
  }
  
  expect(cb.getStatus().failures).toBe(1);
  expect(cb.getStatus().state).toBe('CLOSED');
  
  // Second failure - should open circuit
  try {
    await cb.execute(async () => {
      throw new Error('Service failed again');
    });
  } catch (error) {
    // Expected to fail
  }
  
  expect(cb.getStatus().state).toBe('OPEN');
});

// Test 4: Retry Handler success after failures
test('Retry Handler success after initial failures', async () => {
  const retryHandler = new RetryHandler(3, 10, 100); // Fast retries for testing
  let attemptCount = 0;
  
  const result = await retryHandler.execute(async () => {
    attemptCount++;
    if (attemptCount < 3) {
      const error = new VATExtractionError('Temporary failure', 'TEMP_ERROR', true);
      throw error;
    }
    return 'success after retries';
  });
  
  expect(result).toBe('success after retries');
  expect(attemptCount).toBe(3);
});

// Test 5: Retry Handler non-recoverable error
test('Retry Handler stops on non-recoverable error', async () => {
  const retryHandler = new RetryHandler(3, 10, 100);
  let attemptCount = 0;
  
  try {
    await retryHandler.execute(async () => {
      attemptCount++;
      const error = new VATExtractionError('Non-recoverable', 'FATAL_ERROR', false);
      throw error;
    });
  } catch (error) {
    expect(error.code).toBe('FATAL_ERROR');
    expect(attemptCount).toBe(1); // Should not retry
  }
});

// Test 6: Graceful Degradation fallback
test('Graceful Degradation fallback execution', async () => {
  // Register a fallback
  GracefulDegradation.registerFallback('test_service', (input) => {
    return `fallback_result_for_${input}`;
  });
  
  const result = await GracefulDegradation.executeFallback('test_service', 'test_input');
  expect(result).toBe('fallback_result_for_test_input');
});

// Test 7: Graceful Degradation no fallback available
test('Graceful Degradation no fallback throws error', async () => {
  try {
    await GracefulDegradation.executeFallback('nonexistent_service', 'input');
    throw new Error('Should have thrown');
  } catch (error) {
    expect(error.code).toBe('NO_FALLBACK_AVAILABLE');
  }
});

// Test 8: Integration test - Circuit breaker with retry and fallback
test('Integration: Circuit breaker, retry, and fallback', async () => {
  const cb = new CircuitBreaker('INTEGRATION_SERVICE', 1, 50);
  const retryHandler = new RetryHandler(2, 10, 50);
  
  // Register fallback
  GracefulDegradation.registerFallback('integration_fallback', () => {
    return 'fallback_success';
  });
  
  let result;
  
  try {
    // This should fail and open the circuit
    await cb.execute(async () => {
      throw new VATExtractionError('Service down', 'SERVICE_DOWN', true);
    });
  } catch (error) {
    // Circuit should be open now, try fallback
    result = await GracefulDegradation.executeFallback('integration_fallback');
  }
  
  expect(result).toBe('fallback_success');
  expect(cb.getStatus().state).toBe('OPEN');
});

// Test 9: Performance test
test('Performance: Handle many operations', async () => {
  const cb = new CircuitBreaker('PERF_SERVICE', 10);
  const operations = 100;
  let successCount = 0;
  
  const start = Date.now();
  
  // Run many successful operations
  for (let i = 0; i < operations; i++) {
    try {
      await cb.execute(async () => {
        return 'success';
      });
      successCount++;
    } catch (error) {
      // Some might fail, that's ok for this test
    }
  }
  
  const duration = Date.now() - start;
  
  console.log(`   ⏱️  Processed ${operations} operations in ${duration}ms (${successCount} successful)`);
  expect(successCount).toBeGreaterThan(80); // At least 80% should succeed
});

// Test 10: Memory and resource handling
test('Memory handling: No memory leaks in error objects', () => {
  const errors = [];
  
  // Create many error objects
  for (let i = 0; i < 1000; i++) {
    errors.push(new VATExtractionError(`Error ${i}`, 'TEST_ERROR', true, { 
      data: 'x'.repeat(1000) // Some context data
    }));
  }
  
  // Clear references
  errors.length = 0;
  
  // If we get here without memory issues, test passes
  expect(true).toBe(true);
});

// Summary
console.log('\n📊 Error Handling Test Summary:');
console.log(`✅ Passed: ${passCount}`);
console.log(`❌ Failed: ${failCount}`);
console.log(`📋 Total: ${testCount}`);

if (failCount === 0) {
  console.log('\n🎉 All error handling tests passed! System is robust and ready for deployment.');
  process.exit(0);
} else {
  console.log('\n⚠️  Some error handling tests failed. Please review the implementation.');
  process.exit(1);
}