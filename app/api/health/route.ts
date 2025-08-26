import { NextResponse } from 'next/server'
import { testDatabaseConnection } from '@/lib/prisma'
import { databaseCircuitBreaker } from '@/lib/circuit-breaker'

export async function GET() {
  const startTime = Date.now()
  
  try {
    // Test database connection through circuit breaker
    const isHealthy = await databaseCircuitBreaker.execute(async () => {
      return await testDatabaseConnection()
    })
    
    const responseTime = Date.now() - startTime
    const circuitStats = databaseCircuitBreaker.getStats()
    
    return NextResponse.json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      database: isHealthy ? 'connected' : 'disconnected',
      databaseDetails: {
        connected: isHealthy,
        responseTime,
        circuit: circuitStats
      },
      timestamp: new Date().toISOString()
    }, { 
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    const responseTime = Date.now() - startTime
    const circuitStats = databaseCircuitBreaker.getStats()
    
    return NextResponse.json({
      status: 'unhealthy',
      database: 'disconnected',
      databaseDetails: {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime,
        circuit: circuitStats
      },
      timestamp: new Date().toISOString()
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  }
}