/**
 * Security Utilities
 * Provides secure handling of sensitive data and validation
 */

// Security-focused environment variable access
export class SecureEnv {
  private static instance: SecureEnv
  private secureKeys: Set<string> = new Set([
    'DATABASE_URL',
    'JWT_SECRET', 
    'NEXTAUTH_SECRET',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'OPENAI_API_KEY',
    'ENCRYPTION_KEY',
    'VIDEO_SECURITY_SECRET'
  ])

  private constructor() {}

  static getInstance(): SecureEnv {
    if (!SecureEnv.instance) {
      SecureEnv.instance = new SecureEnv()
    }
    return SecureEnv.instance
  }

  /**
   * Safely check if an environment variable exists without exposing its value
   */
  hasKey(key: string): boolean {
    return Boolean(process.env[key])
  }

  /**
   * Get environment variable with security checks
   */
  get(key: string): string | undefined {
    if (this.secureKeys.has(key) && process.env.NODE_ENV === 'production') {
      // Additional security logging in production
      console.warn(`⚠️ Secure environment variable ${key} accessed in production`)
    }
    return process.env[key]
  }

  /**
   * Safely describe key format without exposing actual content
   */
  describeKey(key: string): {
    exists: boolean
    isSecure: boolean
    format?: 'valid' | 'invalid' | 'unknown'
  } {
    const value = process.env[key]
    const exists = Boolean(value)
    const isSecure = this.secureKeys.has(key)
    
    if (!exists) {
      return { exists: false, isSecure }
    }

    // Only check format for specific known patterns
    let format: 'valid' | 'invalid' | 'unknown' = 'unknown'
    
    if (key === 'OPENAI_API_KEY' && value) {
      format = value.startsWith('sk-') ? 'valid' : 'invalid'
    } else if (key === 'DATABASE_URL' && value) {
      format = value.startsWith('postgresql://') ? 'valid' : 'invalid'  
    } else if (key === 'JWT_SECRET' && value) {
      format = value.length >= 32 ? 'valid' : 'invalid'
    }

    return { exists, isSecure, format }
  }

  /**
   * Safe environment summary for debugging (no sensitive data exposed)
   */
  getSafeSummary(): Record<string, any> {
    return {
      NODE_ENV: process.env.NODE_ENV,
      production: process.env.NODE_ENV === 'production',
      secureKeysConfigured: Array.from(this.secureKeys).reduce((acc, key) => {
        acc[key] = this.hasKey(key)
        return acc
      }, {} as Record<string, boolean>),
      timestamp: new Date().toISOString()
    }
  }
}

// Content Security Policy headers - Next.js compatible
export const getCSPHeaders = () => {
  const csp = [
    "default-src 'self'",
    // More permissive script-src for Next.js hydration and webpack chunks
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://vercel.live",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob:",
    "media-src 'self' blob: https://*.public.blob.vercel-storage.com",
    // More permissive connect-src for Next.js and development
    "connect-src 'self' https: wss: https://api.stripe.com https://api.openai.com",
    "frame-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
    // Removed upgrade-insecure-requests as it might interfere with Next.js
  ].join('; ')

  return {
    'Content-Security-Policy': csp,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  }
}

// Generate cryptographically secure nonce
export function generateNonce(): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(16)
    crypto.getRandomValues(array)
    return btoa(String.fromCharCode.apply(null, Array.from(array)))
  }
  
  // Fallback for Node.js
  try {
    const crypto = require('crypto')
    return crypto.randomBytes(16).toString('base64')
  } catch {
    // Last resort fallback
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }
}

// Input sanitization
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return ''
  
  return input
    .replace(/[<>]/g, '') // Remove potential script tags
    .replace(/javascript:/gi, '') // Remove javascript: urls
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .substring(0, 1000) // Limit length
}

// Rate limiting utility
export class RateLimiter {
  private attempts = new Map<string, { count: number; resetTime: number }>()

  isAllowed(identifier: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now()
    const existing = this.attempts.get(identifier)

    if (!existing || now > existing.resetTime) {
      this.attempts.set(identifier, { count: 1, resetTime: now + windowMs })
      return true
    }

    if (existing.count >= maxAttempts) {
      return false
    }

    existing.count++
    return true
  }

  getRemainingAttempts(identifier: string, maxAttempts: number = 5): number {
    const existing = this.attempts.get(identifier)
    if (!existing || Date.now() > existing.resetTime) {
      return maxAttempts
    }
    return Math.max(0, maxAttempts - existing.count)
  }
}

// Secure headers middleware helper
export function addSecurityHeaders(headers: Headers): void {
  const securityHeaders = getCSPHeaders()
  
  Object.entries(securityHeaders).forEach(([key, value]) => {
    headers.set(key, value)
  })
}

export const secureEnv = SecureEnv.getInstance()