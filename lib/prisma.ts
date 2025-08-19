import { PrismaClient } from './generated/prisma'

declare global {
  var prisma: PrismaClient | undefined
}

// Configure Prisma for serverless environment
const createPrismaClient = () => {
  try {
    const client = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query'] : ['error'],
      errorFormat: 'pretty'
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

// Create a function to handle database errors gracefully
export async function withDatabaseRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Test connection before operation
      const isConnected = await testDatabaseConnection()
      if (!isConnected) {
        throw new Error('Database connection test failed')
      }
      
      return await operation()
    } catch (error) {
      lastError = error as Error
      console.error(`Database operation failed (attempt ${attempt}/${maxRetries}):`, error)
      
      if (attempt < maxRetries) {
        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }
  }
  
  throw lastError!
}