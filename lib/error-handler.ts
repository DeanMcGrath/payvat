// Security: Secure error handling utilities

export interface SecureError {
  id: string
  message: string
  code?: string
  timestamp: string
}

export interface ErrorLogEntry {
  id: string
  originalError: string
  stack?: string
  userAgent?: string
  url?: string
  userId?: string
  timestamp: string
}

// Security: Generate unique error ID for tracking
function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

// Security: Safe error messages that don't expose sensitive information
const SAFE_ERROR_MESSAGES: Record<string, string> = {
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection and try again.',
  VALIDATION_ERROR: 'The information provided is invalid. Please check and try again.',
  AUTHENTICATION_ERROR: 'Authentication failed. Please log in again.',
  AUTHORIZATION_ERROR: 'You do not have permission to perform this action.',
  RATE_LIMIT_ERROR: 'Too many requests. Please wait before trying again.',
  PAYMENT_ERROR: 'Payment processing failed. Please try again or contact support.',
  SERVER_ERROR: 'A server error occurred. Please try again later.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
}

// Security: Classify errors and provide safe messages
export function classifyError(error: any): { code: string; message: string } {
  const errorMessage = typeof error === 'string' ? error : error?.message || ''
  const lowerMessage = errorMessage.toLowerCase()

  if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
    return { code: 'NETWORK_ERROR', message: SAFE_ERROR_MESSAGES.NETWORK_ERROR }
  }
  
  if (lowerMessage.includes('validation') || lowerMessage.includes('invalid')) {
    return { code: 'VALIDATION_ERROR', message: SAFE_ERROR_MESSAGES.VALIDATION_ERROR }
  }
  
  if (lowerMessage.includes('auth') || lowerMessage.includes('unauthorized')) {
    return { code: 'AUTHENTICATION_ERROR', message: SAFE_ERROR_MESSAGES.AUTHENTICATION_ERROR }
  }
  
  if (lowerMessage.includes('forbidden') || lowerMessage.includes('permission')) {
    return { code: 'AUTHORIZATION_ERROR', message: SAFE_ERROR_MESSAGES.AUTHORIZATION_ERROR }
  }
  
  if (lowerMessage.includes('rate limit') || lowerMessage.includes('too many')) {
    return { code: 'RATE_LIMIT_ERROR', message: SAFE_ERROR_MESSAGES.RATE_LIMIT_ERROR }
  }
  
  if (lowerMessage.includes('payment') || lowerMessage.includes('charge')) {
    return { code: 'PAYMENT_ERROR', message: SAFE_ERROR_MESSAGES.PAYMENT_ERROR }
  }
  
  if (lowerMessage.includes('server') || lowerMessage.includes('500')) {
    return { code: 'SERVER_ERROR', message: SAFE_ERROR_MESSAGES.SERVER_ERROR }
  }
  
  return { code: 'UNKNOWN_ERROR', message: SAFE_ERROR_MESSAGES.UNKNOWN_ERROR }
}

// Security: Handle errors securely
export function handleError(error: any, context?: string): SecureError {
  const errorId = generateErrorId()
  const { code, message } = classifyError(error)
  const timestamp = new Date().toISOString()
  
  // Security: Log full error details securely (server-side only)
  const logEntry: ErrorLogEntry = {
    id: errorId,
    originalError: typeof error === 'string' ? error : error?.message || 'Unknown error',
    stack: error?.stack,
    userAgent: typeof window !== 'undefined' ? window.navigator?.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location?.href : undefined,
    timestamp,
  }
  
  // Security: In development, log to console; in production, send to monitoring service
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context || 'ERROR'}] ${errorId}:`, logEntry)
  } else {
    // Security: In production, send to secure logging service
    // Example: sendToLoggingService(logEntry)
  }
  
  // Security: Return sanitized error for user display
  return {
    id: errorId,
    message,
    code,
    timestamp,
  }
}

// Security: Async error handler wrapper
export function withErrorHandler<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: string
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args)
    } catch (error) {
      const secureError = handleError(error, context)
      throw secureError
    }
  }
}

// Security: Sync error handler wrapper
export function withSyncErrorHandler<T extends any[], R>(
  fn: (...args: T) => R,
  context?: string
): (...args: T) => R {
  return (...args: T): R => {
    try {
      return fn(...args)
    } catch (error) {
      const secureError = handleError(error, context)
      throw secureError
    }
  }
}

// Security: API error handler for fetch requests
export async function handleApiError(response: Response): Promise<never> {
  let errorMessage = 'API request failed'
  
  try {
    const errorData = await response.json()
    errorMessage = errorData.message || errorData.error || errorMessage
  } catch {
    // If response is not JSON, use status text
    errorMessage = response.statusText || errorMessage
  }
  
  const secureError = handleError(`${response.status}: ${errorMessage}`, 'API_ERROR')
  throw secureError
}