import { NextRequest, NextResponse } from 'next/server'
import { addSecurityHeaders } from '@/lib/security-utils'
import { blockDebugEndpoints, validateDebugSecurity } from '@/lib/security/debug-blocker'
import { logWarn, logError } from '@/lib/secure-logger'

// Security: Rate limiting configuration
const RATE_LIMIT_MAX_REQUESTS = 200 // requests per window
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const LOGIN_RATE_LIMIT = process.env.NODE_ENV === 'development' ? 1000 : 20 // higher limit in development
const PAYMENT_RATE_LIMIT = 10 // payment attempts per window
const DASHBOARD_RATE_LIMIT = 300 // higher limit for dashboard endpoints
const API_DOCUMENTS_RATE_LIMIT = 150 // higher limit for document API endpoints

// In-memory store for rate limiting (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

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

// Security: Rate limiting implementation
function checkRateLimit(clientIP: string, limit: number, windowMs: number): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const key = `${clientIP}_${Math.floor(now / windowMs)}`
  
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
  
  // Apply different rate limits based on endpoint
  let rateLimit = RATE_LIMIT_MAX_REQUESTS
  let windowMs = RATE_LIMIT_WINDOW_MS
  
  // Stricter limits for sensitive endpoints
  if (pathname.startsWith('/api/auth/login')) {
    rateLimit = LOGIN_RATE_LIMIT
  } else if (pathname.startsWith('/api/payments/')) {
    rateLimit = PAYMENT_RATE_LIMIT
  } else if (pathname.startsWith('/dashboard')) {
    rateLimit = DASHBOARD_RATE_LIMIT
  } else if (pathname.startsWith('/api/documents')) {
    rateLimit = API_DOCUMENTS_RATE_LIMIT
  }
  
  // Check rate limit
  const rateLimitResult = checkRateLimit(clientIP, rateLimit, windowMs)
  
  if (!rateLimitResult.allowed) {
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