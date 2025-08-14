/**
 * High-Performance Caching System for VAT Extraction
 * Implements multi-layer caching with intelligent invalidation
 */

import crypto from 'crypto'

// Cache entry interface
export interface CacheEntry<T> {
  key: string
  value: T
  timestamp: number
  ttl: number
  hitCount: number
  lastAccessed: number
  size: number
}

// Performance metrics
export interface CacheMetrics {
  hits: number
  misses: number
  evictions: number
  totalOperations: number
  hitRate: number
  avgResponseTime: number
  memoryUsage: number
}

// Cache configuration
export interface CacheConfig {
  maxSize: number // Maximum number of entries
  maxMemory: number // Maximum memory usage in bytes
  defaultTTL: number // Default TTL in milliseconds
  cleanupInterval: number // Cleanup interval in milliseconds
  enableMetrics: boolean
}

// Multi-layer cache with LRU eviction
export class PerformanceCache<T> {
  private cache = new Map<string, CacheEntry<T>>()
  private accessOrder: string[] = []
  private metrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalOperations: 0,
    hitRate: 0,
    avgResponseTime: 0,
    memoryUsage: 0
  }
  private cleanupTimer: NodeJS.Timeout | null = null

  constructor(private config: CacheConfig) {
    this.startCleanupTimer()
  }

  // Generate cache key from content
  generateKey(content: string | Buffer): string {
    return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16)
  }

  // Set cache entry with intelligent sizing
  set(key: string, value: T, ttl?: number): void {
    const startTime = Date.now()
    const actualTTL = ttl || this.config.defaultTTL
    const size = this.calculateSize(value)
    
    // Remove existing entry if it exists
    if (this.cache.has(key)) {
      this.delete(key)
    }

    // Check if we need to evict entries
    this.enforceMemoryLimits(size)

    const entry: CacheEntry<T> = {
      key,
      value,
      timestamp: Date.now(),
      ttl: actualTTL,
      hitCount: 0,
      lastAccessed: Date.now(),
      size
    }

    this.cache.set(key, entry)
    this.accessOrder.unshift(key)
    
    // Enforce size limits
    this.enforceSizeLimits()
    
    this.updateMetrics(Date.now() - startTime)
    
    if (this.config.enableMetrics) {
      console.log(`📦 Cache SET: ${key} (size: ${size} bytes, TTL: ${actualTTL}ms)`)
    }
  }

  // Get cache entry with hit tracking
  get(key: string): T | null {
    const startTime = Date.now()
    this.metrics.totalOperations++

    const entry = this.cache.get(key)
    
    if (!entry) {
      this.metrics.misses++
      this.updateMetrics(Date.now() - startTime)
      return null
    }

    // Check if entry is expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.delete(key)
      this.metrics.misses++
      this.updateMetrics(Date.now() - startTime)
      return null
    }

    // Update access tracking
    entry.hitCount++
    entry.lastAccessed = Date.now()
    
    // Move to front of access order (LRU)
    const index = this.accessOrder.indexOf(key)
    if (index > 0) {
      this.accessOrder.splice(index, 1)
      this.accessOrder.unshift(key)
    }

    this.metrics.hits++
    this.updateMetrics(Date.now() - startTime)

    if (this.config.enableMetrics) {
      console.log(`🎯 Cache HIT: ${key} (hits: ${entry.hitCount})`)
    }

    return entry.value
  }

  // Delete cache entry
  delete(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    this.cache.delete(key)
    const index = this.accessOrder.indexOf(key)
    if (index >= 0) {
      this.accessOrder.splice(index, 1)
    }

    return true
  }

  // Check if key exists and is valid
  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.delete(key)
      return false
    }

    return true
  }

  // Clear all cache entries
  clear(): void {
    this.cache.clear()
    this.accessOrder = []
    this.resetMetrics()
    console.log('🗑️ Cache cleared')
  }

  // Get cache statistics
  getStats(): CacheMetrics & { entries: number, memoryUsageHuman: string } {
    this.updateHitRate()
    this.updateMemoryUsage()
    
    return {
      ...this.metrics,
      entries: this.cache.size,
      memoryUsageHuman: this.formatBytes(this.metrics.memoryUsage)
    }
  }

  // Get top performing cache entries
  getTopEntries(limit = 10): Array<{ key: string, hits: number, lastAccessed: Date }> {
    return Array.from(this.cache.values())
      .sort((a, b) => b.hitCount - a.hitCount)
      .slice(0, limit)
      .map(entry => ({
        key: entry.key,
        hits: entry.hitCount,
        lastAccessed: new Date(entry.lastAccessed)
      }))
  }

  // Cleanup expired entries
  cleanup(): number {
    const startTime = Date.now()
    let cleanedCount = 0
    const now = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.delete(key)
        cleanedCount++
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cache cleanup: removed ${cleanedCount} expired entries in ${Date.now() - startTime}ms`)
    }

    return cleanedCount
  }

  // Warmup cache with predicted entries
  async warmup(entries: Array<{ key: string, generator: () => Promise<T> }>): Promise<void> {
    console.log(`🔥 Cache warmup starting for ${entries.length} entries...`)
    const startTime = Date.now()
    let warmedCount = 0

    for (const { key, generator } of entries) {
      if (!this.has(key)) {
        try {
          const value = await generator()
          this.set(key, value)
          warmedCount++
        } catch (error) {
          console.log(`⚠️ Cache warmup failed for key ${key}: ${(error as Error).message}`)
        }
      }
    }

    console.log(`✅ Cache warmup completed: ${warmedCount}/${entries.length} entries in ${Date.now() - startTime}ms`)
  }

  // Private methods
  private calculateSize(value: T): number {
    try {
      return JSON.stringify(value).length * 2 // Rough estimate (UTF-16)
    } catch {
      return 1000 // Default size for non-serializable objects
    }
  }

  private enforceMemoryLimits(newEntrySize: number): void {
    const currentMemory = this.getCurrentMemoryUsage()
    
    while (currentMemory + newEntrySize > this.config.maxMemory && this.cache.size > 0) {
      const oldestKey = this.accessOrder[this.accessOrder.length - 1]
      if (oldestKey) {
        this.delete(oldestKey)
        this.metrics.evictions++
      } else {
        break
      }
    }
  }

  private enforceSizeLimits(): void {
    while (this.cache.size > this.config.maxSize) {
      const oldestKey = this.accessOrder[this.accessOrder.length - 1]
      if (oldestKey) {
        this.delete(oldestKey)
        this.metrics.evictions++
      } else {
        break
      }
    }
  }

  private getCurrentMemoryUsage(): number {
    let total = 0
    for (const entry of this.cache.values()) {
      total += entry.size
    }
    return total
  }

  private updateMetrics(responseTime: number): void {
    this.metrics.avgResponseTime = (
      (this.metrics.avgResponseTime * (this.metrics.totalOperations - 1) + responseTime) /
      this.metrics.totalOperations
    )
  }

  private updateHitRate(): void {
    this.metrics.hitRate = this.metrics.totalOperations > 0 
      ? this.metrics.hits / this.metrics.totalOperations 
      : 0
  }

  private updateMemoryUsage(): void {
    this.metrics.memoryUsage = this.getCurrentMemoryUsage()
  }

  private resetMetrics(): void {
    this.metrics = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalOperations: 0,
      hitRate: 0,
      avgResponseTime: 0,
      memoryUsage: 0
    }
  }

  private startCleanupTimer(): void {
    if (this.config.cleanupInterval > 0) {
      this.cleanupTimer = setInterval(() => {
        this.cleanup()
      }, this.config.cleanupInterval)
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Cleanup resources
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
    this.clear()
    console.log('🗑️ Cache destroyed')
  }
}

// Specialized cache for VAT extraction results
export class VATExtractionCache extends PerformanceCache<any> {
  constructor() {
    super({
      maxSize: 1000, // 1000 documents
      maxMemory: 100 * 1024 * 1024, // 100MB
      defaultTTL: 24 * 60 * 60 * 1000, // 24 hours
      cleanupInterval: 60 * 60 * 1000, // 1 hour
      enableMetrics: true
    })
  }

  // Generate key from document content
  generateDocumentKey(fileData: string, mimeType: string, fileName: string): string {
    const content = `${fileData}_${mimeType}_${fileName}`
    return `vat_${this.generateKey(content)}`
  }

  // Cache VAT extraction result
  cacheVATResult(fileData: string, mimeType: string, fileName: string, result: any): void {
    const key = this.generateDocumentKey(fileData, mimeType, fileName)
    this.set(key, {
      ...result,
      cached: true,
      cacheTimestamp: Date.now()
    })
  }

  // Get cached VAT result
  getCachedVATResult(fileData: string, mimeType: string, fileName: string): any | null {
    const key = this.generateDocumentKey(fileData, mimeType, fileName)
    return this.get(key)
  }
}

// Specialized cache for document text extraction
export class TextExtractionCache extends PerformanceCache<string> {
  constructor() {
    super({
      maxSize: 2000, // 2000 text extractions
      maxMemory: 200 * 1024 * 1024, // 200MB
      defaultTTL: 7 * 24 * 60 * 60 * 1000, // 7 days
      cleanupInterval: 4 * 60 * 60 * 1000, // 4 hours
      enableMetrics: true
    })
  }

  generateTextKey(fileData: string, mimeType: string): string {
    const content = `${fileData}_${mimeType}`
    return `text_${this.generateKey(content)}`
  }
}

// Export cache instances
export const vatExtractionCache = new VATExtractionCache()
export const textExtractionCache = new TextExtractionCache()

// Cache warming functions for common patterns
export async function warmupCommonPatterns(): Promise<void> {
  console.log('🔥 Starting cache warmup for common VAT patterns...')
  
  // This would typically load from a database of common patterns
  const commonPatterns = [
    'VAT (23.00%): €92.00',
    'VAT 23%: €230.00', 
    'Total VAT: €134.96',
    'Tax: €46.00'
  ]

  // Simulate warming up pattern recognition
  for (const pattern of commonPatterns) {
    try {
      const key = vatExtractionCache.generateKey(pattern)
      // In a real system, this would pre-compute pattern matches
      vatExtractionCache.set(`pattern_${key}`, {
        pattern,
        precomputed: true,
        confidence: 0.95
      })
    } catch (error) {
      console.log(`⚠️ Pattern warmup failed: ${(error as Error).message}`)
    }
  }

  console.log('✅ Cache warmup completed')
}

// Performance monitoring
export class CachePerformanceMonitor {
  private static startTime = Date.now()
  private static operations = 0

  static recordOperation(): void {
    this.operations++
  }

  static getPerformanceReport(): {
    uptime: number
    totalOperations: number
    operationsPerSecond: number
    vatCacheStats: any
    textCacheStats: any
  } {
    const uptime = Date.now() - this.startTime
    const operationsPerSecond = uptime > 0 ? (this.operations * 1000) / uptime : 0

    return {
      uptime,
      totalOperations: this.operations,
      operationsPerSecond: Math.round(operationsPerSecond),
      vatCacheStats: vatExtractionCache.getStats(),
      textCacheStats: textExtractionCache.getStats()
    }
  }

  static logPerformanceReport(): void {
    const report = this.getPerformanceReport()
    console.log('📊 Cache Performance Report:')
    console.log(`   Uptime: ${Math.round(report.uptime / 1000)}s`)
    console.log(`   Total Operations: ${report.totalOperations}`)
    console.log(`   Operations/sec: ${report.operationsPerSecond}`)
    console.log(`   VAT Cache: ${report.vatCacheStats.entries} entries, ${report.vatCacheStats.hitRate.toFixed(2)} hit rate`)
    console.log(`   Text Cache: ${report.textCacheStats.entries} entries, ${report.textCacheStats.hitRate.toFixed(2)} hit rate`)
  }
}

// Initialize performance monitoring
setInterval(() => {
  CachePerformanceMonitor.logPerformanceReport()
}, 5 * 60 * 1000) // Every 5 minutes