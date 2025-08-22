import { NextRequest, NextResponse } from 'next/server'
import { addSecurityHeaders } from '@/lib/security-utils'
import { blockDebugEndpoints, validateDebugSecurity } from '@/lib/security/debug-blocker'
import { logWarn, logError } from '@/lib/secure-logger'

// Security: Rate limiting configuration - HOTFIX: Dramatically increased limits
const RATE_LIMIT_MAX_REQUESTS = 2000 // requests per window (increased 10x)
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const LOGIN_RATE_LIMIT = process.env.NODE_ENV === 'development' ? 1000 : 100 // higher limit in development
const PAYMENT_RATE_LIMIT = 50 // payment attempts per window (increased 5x)
const DASHBOARD_RATE_LIMIT = 1500 // higher limit for dashboard endpoints (increased 5x)
const API_DOCUMENTS_RATE_LIMIT = 1000 // higher limit for document API endpoints (increased 6x)
const AUTH_RATE_LIMIT = 1000 // high limit for auth endpoints

// In-memory store for rate limiting (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Serverless-friendly rate limiting with graceful degradation
const isServerlessEnvironment = () => {
  return process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.FUNCTIONS_RUNTIME
}

// Security: Get client IP address
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  if (realIP) {
    return realIP
  }
  return 'unknown'
}

// Security: Rate limiting implementation with endpoint-specific keys
function checkRateLimit(clientIP: string, endpoint: string, limit: number, windowMs: number): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const key = `${clientIP}_${endpoint}_${Math.floor(now / windowMs)}`
  
  const current = rateLimitStore.get(key)
  if (!current) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: limit - 1, resetTime: now + windowMs }
  }
  
  if (current.count >= limit) {
    return { allowed: false, remaining: 0, resetTime: current.resetTime }
  }
  
  current.count++
  return { allowed: true, remaining: limit - current.count, resetTime: current.resetTime }
}

// Security: Clean up expired entries
function cleanupRateLimit() {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const clientIP = getClientIP(request)
  
  // Security: Force HTTPS redirect (except for localhost development)
  const protocol = request.headers.get('x-forwarded-proto') || 'https'
  const host = request.headers.get('host')
  
  if (protocol === 'http' && host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
    const httpsUrl = `https://${host}${request.nextUrl.pathname}${request.nextUrl.search}`
    return NextResponse.redirect(httpsUrl, 301)
  }
  
  // Clean up expired rate limit entries periodically
  if (Math.random() < 0.01) { // 1% chance to clean up
    cleanupRateLimit()
  }
  
  // CRITICAL SECURITY: Block ALL debug endpoints in production
  const debugBlockResponse = blockDebugEndpoints(request)
  if (debugBlockResponse) {
    return debugBlockResponse
  }
  
  // Validate debug security on startup
  if (!validateDebugSecurity()) {
    logError('CRITICAL: Debug security validation failed', null, {
      operation: 'middleware-security-check'
    })
  }
  
  // Skip middleware for static files and Next.js internals
  if (pathname.startsWith('/_next/') || 
      pathname.includes('.') && !pathname.includes('/api/')) {
    return NextResponse.next()
  }
  
  // Check for authentication bypasses
  const authCookie = request.cookies.get('auth-token') || request.cookies.get('session')
  const authHeader = request.headers.get('authorization')
  const hasAuth = authCookie || authHeader
  
  // Apply different rate limits based on endpoint with separate buckets
  let rateLimit = RATE_LIMIT_MAX_REQUESTS
  let windowMs = RATE_LIMIT_WINDOW_MS
  let endpointType = 'general'
  
  // Stricter limits for sensitive endpoints
  if (pathname.startsWith('/api/auth/login')) {
    rateLimit = LOGIN_RATE_LIMIT
    endpointType = 'login'
  } else if (pathname.startsWith('/api/auth/')) {
    rateLimit = AUTH_RATE_LIMIT
    endpointType = 'auth'
  } else if (pathname.startsWith('/api/payments/')) {
    rateLimit = PAYMENT_RATE_LIMIT
    endpointType = 'payments'
  } else if (pathname.startsWith('/dashboard')) {
    rateLimit = hasAuth ? DASHBOARD_RATE_LIMIT * 2 : DASHBOARD_RATE_LIMIT // Double limit for authenticated users
    endpointType = 'dashboard'
  } else if (pathname.startsWith('/api/documents')) {
    rateLimit = hasAuth ? API_DOCUMENTS_RATE_LIMIT * 2 : API_DOCUMENTS_RATE_LIMIT // Double limit for authenticated users
    endpointType = 'documents'
  }
  
  // Check rate limit with endpoint-specific bucket
  // HOTFIX: In serverless environments, be more permissive to avoid false positives
  const rateLimitResult = checkRateLimit(clientIP, endpointType, rateLimit, windowMs)
  
  // Serverless safety: If rate limiting seems broken, allow the request
  const shouldBypass = isServerlessEnvironment() && rateLimitStore.size > 10000 // Too many entries suggests memory issues
  
  if (!rateLimitResult.allowed && !shouldBypass) {
    logWarn('Rate limit exceeded', {
      operation: 'rate-limit-exceeded',
      sessionId: request.headers.get('x-session-id') || 'unknown',
      path: pathname,
      clientIP: clientIP
    })
    
    const retryAfterSeconds = Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Rate limit exceeded - please try again later', 
        resetTime: new Date(rateLimitResult.resetTime).toISOString(),
        retryAfter: retryAfterSeconds
      }), 
      { 
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': rateLimit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          'Retry-After': retryAfterSeconds.toString()
        }
      }
    )
  }
  
  // Add rate limit headers to successful responses
  const response = NextResponse.next()
  response.headers.set('X-RateLimit-Limit', rateLimit.toString())
  response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
  response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString())
  
  // Add security headers to all responses
  // Re-enabled with Next.js compatible CSP configuration
  addSecurityHeaders(response.headers)
  
  return response
}

// Security: Configure which paths to apply middleware to
export const config = {
  matcher: [
    // Apply to all pages except static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
}