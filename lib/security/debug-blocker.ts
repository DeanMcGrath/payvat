/**
 * Debug Endpoint Blocker
 * Prevents access to debug endpoints in production
 * CRITICAL for security - prevents data exposure
 */

import { NextRequest, NextResponse } from 'next/server'
import { logError, logWarn } from '@/lib/secure-logger'

const DEBUG_PATHS = [
  '/api/debug',
  '/api/test',
  '/api/admin/test',
  '/api/development'
]

const SENSITIVE_DEBUG_ENDPOINTS = [
  '/api/debug/ai-response',
  '/api/debug/ai-status', 
  '/api/debug/create-test-doc',
  '/api/debug/db',
  '/api/debug/env',
  '/api/debug/openai',
  '/api/debug/processing-test',
  '/api/debug/prompt-test',
  '/api/debug/raw-text',
  '/api/debug/test-console-log',
  '/api/debug/test-pdf-extraction',
  '/api/debug/test-pdf-vision',
  '/api/debug/test-vat-extraction'
]

/**
 * Check if a path is a debug endpoint
 */
export function isDebugEndpoint(pathname: string): boolean {
  return DEBUG_PATHS.some(debugPath => pathname.startsWith(debugPath)) ||
         SENSITIVE_DEBUG_ENDPOINTS.includes(pathname)
}

/**
 * Block debug endpoints in production
 */
export function blockDebugEndpoints(request: NextRequest): NextResponse | null {
  const { pathname } = new URL(request.url)
  
  if (isDebugEndpoint(pathname)) {
    const isProduction = process.env.NODE_ENV === 'production'
    const debugDisabled = process.env.ENABLE_DEBUG !== 'true'
    
    if (isProduction || debugDisabled) {
      // Log the attempted access for security monitoring
      logWarn('Debug endpoint access attempt blocked', {
        operation: 'debug-endpoint-block',
        sessionId: request.headers.get('x-session-id') || 'unknown'
      })
      
      // Return 404 to hide existence of debug endpoints
      return NextResponse.json(
        { error: 'Not Found' },
        { status: 404 }
      )
    }
    
    // In development, log access for monitoring
    if (!isProduction) {
      logWarn('Debug endpoint accessed in development', {
        operation: 'debug-endpoint-access'
      })
    }
  }
  
  return null // Allow request to continue
}

/**
 * Create a wrapper that blocks debug endpoints
 */
export function createProductionSafeRoute(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Check if this is a debug endpoint and block if needed
    const blockResponse = blockDebugEndpoints(request)
    if (blockResponse) {
      return blockResponse
    }
    
    // Continue with normal handler
    return handler(request)
  }
}

/**
 * Runtime check to ensure debug endpoints are properly blocked
 */
export function validateDebugSecurity(): boolean {
  const isProduction = process.env.NODE_ENV === 'production'
  const debugEnabled = process.env.ENABLE_DEBUG === 'true'
  
  if (isProduction && debugEnabled) {
    logError('SECURITY VIOLATION: Debug endpoints enabled in production!', null, {
      operation: 'security-validation'
    })
    return false
  }
  
  return true
}

// Export for middleware use
export { DEBUG_PATHS, SENSITIVE_DEBUG_ENDPOINTS }