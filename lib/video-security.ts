import jwt from 'jsonwebtoken'
import crypto from 'crypto-js'
import { NextRequest } from 'next/server'

export interface VideoSecurityConfig {
  enableWatermark?: boolean
  enableHotlinkProtection?: boolean
  enableRateLimit?: boolean
  maxViewsPerIP?: number
  viewWindowMinutes?: number
}

export interface SecureVideoAccess {
  isAuthorized: boolean
  reason?: string
  remainingViews?: number
  rateLimited?: boolean
}

const DEFAULT_CONFIG: VideoSecurityConfig = {
  enableWatermark: true,
  enableHotlinkProtection: true,
  enableRateLimit: true,
  maxViewsPerIP: 10,
  viewWindowMinutes: 60
}

// In-memory rate limiting store (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export class VideoSecurity {
  private config: VideoSecurityConfig

  constructor(config: VideoSecurityConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  // Generate secure video token with expiration
  generateSecureToken(videoId: string, sessionId: string, expiresInMinutes: number = 60): string {
    const payload = {
      videoId,
      sessionId,
      iat: Date.now(),
      exp: Date.now() + (expiresInMinutes * 60 * 1000),
      type: 'video_access'
    }

    return jwt.sign(payload, process.env.VIDEO_SECURITY_SECRET || 'default-video-secret', {
      algorithm: 'HS256'
    })
  }

  // Verify secure video token
  verifySecureToken(token: string): { valid: boolean; payload?: any; error?: string } {
    try {
      const payload = jwt.verify(token, process.env.VIDEO_SECURITY_SECRET || 'default-video-secret') as any
      
      if (payload.type !== 'video_access') {
        return { valid: false, error: 'Invalid token type' }
      }

      if (payload.exp < Date.now()) {
        return { valid: false, error: 'Token expired' }
      }

      return { valid: true, payload }
    } catch (error) {
      return { valid: false, error: 'Invalid token' }
    }
  }

  // Check if access is authorized based on security rules
  async checkVideoAccess(request: NextRequest, videoId: string): Promise<SecureVideoAccess> {
    const clientIP = this.getClientIP(request)
    const referrer = request.headers.get('referer')
    const userAgent = request.headers.get('user-agent')

    // Check hotlink protection
    if (this.config.enableHotlinkProtection && !this.isAllowedReferrer(referrer)) {
      return {
        isAuthorized: false,
        reason: 'Hotlinking not allowed from this domain'
      }
    }

    // Check rate limiting
    if (this.config.enableRateLimit) {
      const rateLimitResult = this.checkRateLimit(clientIP)
      if (!rateLimitResult.allowed) {
        return {
          isAuthorized: false,
          reason: 'Rate limit exceeded',
          rateLimited: true,
          remainingViews: rateLimitResult.remaining
        }
      }
    }

    // Check for suspicious patterns
    if (this.isSuspiciousRequest(userAgent, clientIP)) {
      return {
        isAuthorized: false,
        reason: 'Suspicious activity detected'
      }
    }

    return {
      isAuthorized: true,
      remainingViews: this.getRemainingViews(clientIP)
    }
  }

  // Extract client IP with proxy support
  private getClientIP(request: NextRequest): string {
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const clientIP = forwardedFor?.split(',')[0] || realIP || 'unknown'
    
    // Hash IP for privacy while maintaining uniqueness
    return crypto.SHA256(clientIP + (process.env.IP_SALT || 'default-salt')).toString()
  }

  // Check if referrer is allowed
  private isAllowedReferrer(referrer: string | null): boolean {
    if (!referrer) return true // Allow direct access

    const allowedDomains = [
      process.env.NEXT_PUBLIC_BASE_URL || 'localhost',
      'payvat.ie',
      'www.payvat.ie'
    ]

    try {
      const referrerUrl = new URL(referrer)
      return allowedDomains.some(domain => 
        referrerUrl.hostname === domain || referrerUrl.hostname.endsWith('.' + domain)
      )
    } catch {
      return false
    }
  }

  // Rate limiting implementation
  private checkRateLimit(hashedIP: string): { allowed: boolean; remaining: number } {
    if (!this.config.enableRateLimit) {
      return { allowed: true, remaining: this.config.maxViewsPerIP || 10 }
    }

    const now = Date.now()
    const windowMs = (this.config.viewWindowMinutes || 60) * 60 * 1000
    const maxViews = this.config.maxViewsPerIP || 10

    const record = rateLimitStore.get(hashedIP)

    if (!record || now > record.resetTime) {
      // First request or window expired
      rateLimitStore.set(hashedIP, {
        count: 1,
        resetTime: now + windowMs
      })
      return { allowed: true, remaining: maxViews - 1 }
    }

    if (record.count >= maxViews) {
      return { allowed: false, remaining: 0 }
    }

    // Increment count
    record.count++
    rateLimitStore.set(hashedIP, record)

    return { allowed: true, remaining: maxViews - record.count }
  }

  // Get remaining views for IP
  private getRemainingViews(hashedIP: string): number {
    if (!this.config.enableRateLimit) {
      return this.config.maxViewsPerIP || 10
    }

    const record = rateLimitStore.get(hashedIP)
    if (!record) {
      return this.config.maxViewsPerIP || 10
    }

    const maxViews = this.config.maxViewsPerIP || 10
    return Math.max(0, maxViews - record.count)
  }

  // Detect suspicious requests
  private isSuspiciousRequest(userAgent: string | null, hashedIP: string): boolean {
    if (!userAgent) return true

    // Check for bot patterns (basic detection)
    const botPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /wget/i,
      /curl/i
    ]

    const isBotUserAgent = botPatterns.some(pattern => pattern.test(userAgent))
    
    // Allow legitimate crawlers but be cautious of others
    const allowedBots = [
      /googlebot/i,
      /bingbot/i,
      /facebookexternalhit/i,
      /twitterbot/i,
      /linkedinbot/i
    ]

    const isAllowedBot = allowedBots.some(pattern => pattern.test(userAgent))

    return isBotUserAgent && !isAllowedBot
  }

  // Generate video URL with security token
  generateSecureVideoUrl(baseUrl: string, videoId: string, sessionId: string): string {
    const token = this.generateSecureToken(videoId, sessionId)
    const url = new URL(baseUrl)
    url.searchParams.set('token', token)
    url.searchParams.set('v', videoId)
    return url.toString()
  }

  // Clean up expired rate limit entries (should be called periodically)
  cleanupRateLimitStore(): void {
    const now = Date.now()
    for (const [key, record] of rateLimitStore.entries()) {
      if (now > record.resetTime) {
        rateLimitStore.delete(key)
      }
    }
  }
}

// Singleton instance
export const videoSecurity = new VideoSecurity()

// Cleanup function to run periodically
setInterval(() => {
  videoSecurity.cleanupRateLimitStore()
}, 5 * 60 * 1000) // Clean up every 5 minutes