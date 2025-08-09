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
  const pathname = request.nextUrl.pathname
  
  console.log('🚨 EMERGENCY BYPASS: Middleware completely disabled for:', pathname)
  console.log('   Method:', request.method)
  console.log('   Timestamp:', new Date().toISOString())
  
  // EMERGENCY: Complete bypass of all middleware logic
  // This will allow all requests through without any processing
  const response = NextResponse.next()
  response.headers.set('X-Emergency-Bypass', 'true')
  response.headers.set('X-Debug-Path', pathname)
  response.headers.set('X-Emergency-Timestamp', new Date().toISOString())
  
  console.log('✅ EMERGENCY BYPASS: Request allowed through without ANY processing')
  return response
}

// Security: Configure which paths to apply middleware to
export const config = {
  matcher: [
    // Apply to all pages except static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
}