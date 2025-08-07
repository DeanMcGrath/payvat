import { NextRequest, NextResponse } from 'next/server'

// Security: Rate limiting configuration
const RATE_LIMIT_MAX_REQUESTS = 100 // requests per window
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const LOGIN_RATE_LIMIT = 20 // login attempts per window (increased from 5 to prevent blocking legitimate users)
const PAYMENT_RATE_LIMIT = 10 // payment attempts per window

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
  const clientIP = getClientIP(request)
  const pathname = request.nextUrl.pathname
  
  // Clean up expired entries periodically
  if (Math.random() < 0.01) { // 1% chance
    cleanupRateLimit()
  }
  
  // Security: Different rate limits for different endpoints
  let limit = RATE_LIMIT_MAX_REQUESTS
  let windowMs = RATE_LIMIT_WINDOW_MS
  
  // Stricter limits for sensitive endpoints
  // Only apply login rate limit to actual login API calls, not page loads
  if (pathname === '/api/auth/login' || pathname === '/api/auth/register') {
    limit = LOGIN_RATE_LIMIT
    windowMs = RATE_LIMIT_WINDOW_MS
  } else if (pathname.includes('/api/payments') || pathname.includes('/api/vat/submit')) {
    limit = PAYMENT_RATE_LIMIT
    windowMs = RATE_LIMIT_WINDOW_MS
  }
  
  const rateLimitResult = checkRateLimit(clientIP, limit, windowMs)
  
  if (!rateLimitResult.allowed) {
    // Security: Return 429 Too Many Requests with security headers
    const response = new NextResponse(JSON.stringify({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
    }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
      }
    })
    
    return response
  }
  
  // Security: Add rate limit headers to successful responses
  const response = NextResponse.next()
  response.headers.set('X-RateLimit-Limit', limit.toString())
  response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
  response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString())
  
  return response
}

// Security: Configure which paths to apply middleware to
export const config = {
  matcher: [
    // Apply to all pages except static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
}