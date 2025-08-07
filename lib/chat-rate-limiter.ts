/**
 * Chat Rate Limiter
 * Prevents spam by limiting messages per session
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory rate limiter (for production, use Redis)
const rateLimitCache = new Map<string, RateLimitEntry>()

// Configuration
const RATE_LIMIT = {
  MAX_MESSAGES: 10,     // Maximum messages per window
  WINDOW_MS: 60 * 1000, // 1 minute window
  BURST_LIMIT: 5,       // Max messages in quick succession
  BURST_WINDOW_MS: 10 * 1000 // 10 seconds for burst detection
}

export function checkChatRateLimit(sessionId: string): { 
  allowed: boolean
  resetIn?: number
  message?: string 
} {
  const now = Date.now()
  const key = `chat:${sessionId}`
  
  // Clean up expired entries (simple cleanup)
  if (rateLimitCache.size > 1000) {
    const cutoff = now - (RATE_LIMIT.WINDOW_MS * 2)
    for (const [k, v] of rateLimitCache.entries()) {
      if (v.resetTime < cutoff) {
        rateLimitCache.delete(k)
      }
    }
  }
  
  const entry = rateLimitCache.get(key)
  
  if (!entry || now > entry.resetTime) {
    // First request or window expired
    rateLimitCache.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT.WINDOW_MS
    })
    return { allowed: true }
  }
  
  if (entry.count >= RATE_LIMIT.MAX_MESSAGES) {
    return {
      allowed: false,
      resetIn: entry.resetTime - now,
      message: `Rate limit exceeded. Please wait ${Math.ceil((entry.resetTime - now) / 1000)} seconds.`
    }
  }
  
  // Check for burst limit (quick succession of messages)
  const burstKey = `burst:${sessionId}`
  const burstEntry = rateLimitCache.get(burstKey)
  
  if (!burstEntry || now > burstEntry.resetTime) {
    rateLimitCache.set(burstKey, {
      count: 1,
      resetTime: now + RATE_LIMIT.BURST_WINDOW_MS
    })
  } else {
    burstEntry.count++
    if (burstEntry.count > RATE_LIMIT.BURST_LIMIT) {
      return {
        allowed: false,
        resetIn: burstEntry.resetTime - now,
        message: 'Sending messages too quickly. Please slow down.'
      }
    }
  }
  
  // Update main counter
  entry.count++
  rateLimitCache.set(key, entry)
  
  return { allowed: true }
}

export function getChatRateLimit(sessionId: string): {
  remaining: number
  resetIn: number
} {
  const now = Date.now()
  const key = `chat:${sessionId}`
  const entry = rateLimitCache.get(key)
  
  if (!entry || now > entry.resetTime) {
    return {
      remaining: RATE_LIMIT.MAX_MESSAGES,
      resetIn: RATE_LIMIT.WINDOW_MS
    }
  }
  
  return {
    remaining: Math.max(0, RATE_LIMIT.MAX_MESSAGES - entry.count),
    resetIn: entry.resetTime - now
  }
}