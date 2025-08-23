import { PrismaClient } from './generated/prisma'
import { databaseCircuitBreaker } from './circuit-breaker'

declare global {
  var prisma: PrismaClient | undefined
}

// Get the best available database URL
function getDatabaseUrl(): string | undefined {
  // Try multiple environment variables in order of preference
  const dbUrl = process.env.DATABASE_URL || 
                process.env.NILEDB_POSTGRES_URL || 
                process.env.POSTGRES_URL ||
                process.env.NILEDB_URL
  
  // Clean up the URL by removing any trailing newlines or whitespace
  const cleanedUrl = dbUrl?.trim().replace(/\n/g, '')
  
  if (cleanedUrl) {
    console.log('Using database URL from:', 
      process.env.DATABASE_URL ? 'DATABASE_URL' :
      process.env.NILEDB_POSTGRES_URL ? 'NILEDB_POSTGRES_URL' :
      process.env.POSTGRES_URL ? 'POSTGRES_URL' : 'NILEDB_URL'
    )
    console.log('Database URL cleaned:', {
      originalLength: dbUrl?.length,
      cleanedLength: cleanedUrl.length,
      hadNewlines: dbUrl !== cleanedUrl
    })
  }
  
  return cleanedUrl
}

// Validate database URL format
function validateDatabaseUrl(url?: string): boolean {
  if (!url) {
    console.error('No database URL found in environment variables')
    console.error('Checked: DATABASE_URL, NILEDB_POSTGRES_URL, POSTGRES_URL, NILEDB_URL')
    return false
  }
  
  // Check if URL starts with postgresql:// or postgres://
  if (!url.startsWith('postgresql://') && !url.startsWith('postgres://')) {
    console.error('Database URL must start with postgresql:// or postgres://', { urlPrefix: url.substring(0, 20) })
    return false
  }
  
  // Basic validation for required components
  try {
    const parsed = new URL(url)
    if (!parsed.hostname || !parsed.pathname || parsed.pathname === '/') {
      console.error('Database URL missing required components (hostname or database name)', {
        hostname: parsed.hostname,
        pathname: parsed.pathname
      })
      return false
    }
    return true
  } catch (error) {
    console.error('Database URL is not a valid URL:', error)
    return false
  }
}

// Configure Prisma for serverless environment with optimized connection pooling
const createPrismaClient = () => {
  try {
    // Get the best available database URL
    const databaseUrl = getDatabaseUrl()
    
    // Validate database URL before attempting connection
    if (!validateDatabaseUrl(databaseUrl)) {
      throw new Error('Invalid database URL configuration')
    }
    
    // Add connection parameters for better reliability
    const connectionParams = '?connection_limit=20&pool_timeout=20&connect_timeout=10&sslmode=require'
    const fullDatabaseUrl = databaseUrl + connectionParams
    
    console.log('Creating Prisma client with connection params:', {
      hasUrl: !!databaseUrl,
      hostname: databaseUrl ? new URL(databaseUrl).hostname : 'unknown'
    })
    
    const client = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query'] : ['error'],
      errorFormat: 'pretty',
      datasources: {
        db: {
          url: fullDatabaseUrl
        }
      }
    })

    return client
  } catch (error) {
    console.error('Failed to create Prisma client:', error)
    throw error
  }
}

export const prisma =
  globalThis.prisma ??
  createPrismaClient()

// Cache Prisma client in all environments to avoid too many connections
if (!globalThis.prisma) {
  globalThis.prisma = prisma
}

// Enhanced connection handling for serverless
export async function connectDatabase() {
  try {
    // Test connection with timeout
    await Promise.race([
      prisma.$connect(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 10000)
      )
    ])
    console.log('Database connected successfully')
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

// Test database connectivity
export async function testDatabaseConnection() {
  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 5000)
      )
    ])
    // Reset circuit breaker on successful connection
    const { databaseCircuitBreaker } = await import('./circuit-breaker')
    if (databaseCircuitBreaker.getState() !== 'closed') {
      console.log('Resetting circuit breaker after successful database test')
      databaseCircuitBreaker.reset()
    }
    return true
  } catch (error) {
    console.error('Database test query failed:', error)
    return false
  }
}

// Graceful shutdown with timeout
export async function disconnectDatabase() {
  try {
    await Promise.race([
      prisma.$disconnect(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Disconnect timeout')), 5000)
      )
    ])
    console.log('Database disconnected successfully')
  } catch (error) {
    console.error('Database disconnect failed:', error)
  }
}

// Create a function to handle database errors gracefully with circuit breaker
export async function withDatabaseRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 2 // Reduced from 3 to prevent retry storms
): Promise<T> {
  return databaseCircuitBreaker.execute(async () => {
    let lastError: Error
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Test connection before operation with shorter timeout
        const isConnected = await testDatabaseConnection()
        if (!isConnected) {
          throw new Error('Database connection test failed')
        }
        
        return await operation()
      } catch (error) {
        lastError = error as Error
        console.error(`Database operation failed (attempt ${attempt}/${maxRetries}):`, error)
        
        // Check if this is a circuit breaker error to avoid retry loops
        if (error instanceof Error && error.message.includes('Circuit breaker is OPEN')) {
          console.log('Circuit breaker is open, skipping retries')
          throw error
        }
        
        if (attempt < maxRetries) {
          // Wait before retry with jittered exponential backoff
          const baseDelay = Math.pow(2, attempt) * 2000 // Start at 4s instead of 2s
          const jitter = Math.random() * 1000 // Add up to 1s jitter
          await new Promise(resolve => setTimeout(resolve, baseDelay + jitter))
        }
      }
    }
    
    throw lastError!
  })
}

// Graceful fallback cache for critical data
const fallbackCache = new Map<string, { data: any; timestamp: number }>()
const FALLBACK_CACHE_TTL = 300000 // 5 minutes

export function setFallbackData(key: string, data: any): void {
  fallbackCache.set(key, { data, timestamp: Date.now() })
}

export function getFallbackData(key: string): any | null {
  const cached = fallbackCache.get(key)
  if (!cached) return null
  
  if (Date.now() - cached.timestamp > FALLBACK_CACHE_TTL) {
    fallbackCache.delete(key)
    return null
  }
  
  return cached.data
}

// Safe database operation with fallback
export async function withDatabaseFallback<T>(
  operation: () => Promise<T>,
  fallbackKey: string,
  defaultFallback: T
): Promise<{ data: T; fromFallback: boolean }> {
  try {
    console.log(`Attempting database operation for key: ${fallbackKey}`)
    const result = await withDatabaseRetry(operation)
    // Cache successful result for future fallback
    setFallbackData(fallbackKey, result)
    console.log(`Database operation successful for key: ${fallbackKey}`)
    return { data: result, fromFallback: false }
  } catch (error) {
    console.warn(`Database operation failed, trying fallback for key: ${fallbackKey}`, error)
    
    // Try fallback cache first
    const fallbackData = getFallbackData(fallbackKey)
    if (fallbackData) {
      console.log(`Using cached fallback data for key: ${fallbackKey}`)
      return { data: fallbackData, fromFallback: true }
    }
    
    // Use default fallback
    console.log(`Using default fallback data for key: ${fallbackKey}`)
    return { data: defaultFallback, fromFallback: true }
  }
}