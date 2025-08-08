import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/debug/db - Simple database connectivity test (no auth required for debugging)
export async function GET(request: NextRequest) {
  const testResults: any[] = []
  
  try {
    // Test 1: Basic connection
    await prisma.$connect()
    testResults.push({
      test: 'Database Connection',
      status: 'PASS',
      details: 'Connected successfully'
    })
    
    // Test 2: Simple count queries
    try {
      const userCount = await prisma.user.count()
      testResults.push({
        test: 'User Count Query',
        status: 'PASS', 
        details: `Found ${userCount} users`
      })
      
      // Test 3: Check for admin users
      const adminCount = await prisma.user.count({
        where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } }
      })
      testResults.push({
        test: 'Admin User Check',
        status: adminCount > 0 ? 'PASS' : 'WARN',
        details: `Found ${adminCount} admin users`
      })
      
    } catch (queryError) {
      testResults.push({
        test: 'Database Queries',
        status: 'FAIL',
        details: queryError instanceof Error ? queryError.message : String(queryError)
      })
    }
    
    // Test 4: Environment check
    const dbUrl = process.env.DATABASE_URL
    testResults.push({
      test: 'Database URL Format',
      status: dbUrl && dbUrl.startsWith('postgresql://') ? 'PASS' : 'FAIL',
      details: dbUrl ? `Format: ${dbUrl.split('://')[0]}://...` : 'DATABASE_URL missing'
    })
    
  } catch (connectionError) {
    testResults.push({
      test: 'Database Connection',
      status: 'FAIL',
      details: connectionError instanceof Error ? connectionError.message : String(connectionError)
    })
  }
  
  const failCount = testResults.filter(t => t.status === 'FAIL').length
  
  return NextResponse.json({
    success: failCount === 0,
    tests: testResults,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  })
}