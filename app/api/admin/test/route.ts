import { NextRequest, NextResponse } from 'next/server'
import { createAdminRoute } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { AuthUser } from '@/lib/auth'

// GET /api/admin/test - Diagnostic test endpoint for admin dashboard issues
async function testAdminEndpoints(request: NextRequest, user: AuthUser) {
  const testResults: any[] = []
  
  // Test 1: Basic authentication
  testResults.push({
    test: 'Authentication',
    status: 'PASS',
    details: { userId: user.id, email: user.email, role: user.role }
  })
  
  // Test 2: Database connection
  try {
    await prisma.$connect()
    testResults.push({
      test: 'Database Connection',
      status: 'PASS',
      details: 'Connected successfully'
    })
  } catch (error) {
    testResults.push({
      test: 'Database Connection', 
      status: 'FAIL',
      details: error instanceof Error ? error.message : String(error)
    })
  }
  
  // Test 3: Database URL format
  const dbUrl = process.env.DATABASE_URL
  testResults.push({
    test: 'Database URL Format',
    status: dbUrl && dbUrl.startsWith('postgresql://') ? 'PASS' : 'WARN',
    details: dbUrl ? 'URL present and properly formatted' : 'DATABASE_URL missing or invalid format'
  })
  
  // Test 4: Basic user count query
  try {
    const userCount = await prisma.user.count()
    testResults.push({
      test: 'Basic User Count Query',
      status: 'PASS',
      details: `Found ${userCount} users in database`
    })
  } catch (error) {
    testResults.push({
      test: 'Basic User Count Query',
      status: 'FAIL', 
      details: error instanceof Error ? error.message : String(error)
    })
  }
  
  // Test 5: User query with relationships
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        _count: {
          select: {
            vatReturns: true,
            documents: true,
            payments: true
          }
        }
      },
      take: 5
    })
    testResults.push({
      test: 'User Query with Relationships',
      status: 'PASS',
      details: `Successfully retrieved ${users.length} users with relationship counts`
    })
  } catch (error) {
    testResults.push({
      test: 'User Query with Relationships',
      status: 'FAIL',
      details: error instanceof Error ? error.message : String(error)
    })
  }
  
  // Test 6: VATReturn table access (the original case sensitivity issue)
  try {
    const vatReturnCount = await prisma.vATReturn.count()
    testResults.push({
      test: 'VATReturn Table Access',
      status: 'PASS',
      details: `Found ${vatReturnCount} VAT returns in database`
    })
  } catch (error) {
    testResults.push({
      test: 'VATReturn Table Access',
      status: 'FAIL',
      details: error instanceof Error ? error.message : String(error)
    })
  }
  
  // Test 7: Payment aggregation (common failure point)
  try {
    const paymentStats = await prisma.payment.aggregate({
      _count: true,
      _sum: { amount: true }
    })
    testResults.push({
      test: 'Payment Aggregation',
      status: 'PASS',
      details: `Found ${paymentStats._count} payments, total amount: ${paymentStats._sum.amount}`
    })
  } catch (error) {
    testResults.push({
      test: 'Payment Aggregation', 
      status: 'FAIL',
      details: error instanceof Error ? error.message : String(error)
    })
  }
  
  // Test 8: Audit log creation
  try {
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'ADMIN_DIAGNOSTIC_TEST',
        entityType: 'SYSTEM',
        ipAddress: request.headers.get('x-forwarded-for') || 'test',
        userAgent: request.headers.get('user-agent') || 'test',
        metadata: {
          timestamp: new Date().toISOString(),
          testRun: true
        }
      }
    })
    testResults.push({
      test: 'Audit Log Creation',
      status: 'PASS',
      details: 'Audit log created successfully'
    })
  } catch (error) {
    testResults.push({
      test: 'Audit Log Creation',
      status: 'FAIL',
      details: error instanceof Error ? error.message : String(error)
    })
  }
  
  // Summary
  const passCount = testResults.filter(t => t.status === 'PASS').length
  const failCount = testResults.filter(t => t.status === 'FAIL').length  
  const warnCount = testResults.filter(t => t.status === 'WARN').length
  
  return NextResponse.json({
    success: true,
    summary: {
      total: testResults.length,
      passed: passCount,
      failed: failCount,
      warnings: warnCount,
      overall: failCount === 0 ? 'PASS' : 'FAIL'
    },
    tests: testResults,
    environment: {
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      databaseUrlPresent: !!process.env.DATABASE_URL
    },
    recommendations: failCount > 0 ? [
      'Check database connection and credentials',
      'Verify DATABASE_URL format is correct', 
      'Ensure database schema is migrated',
      'Check Vercel environment variables'
    ] : [
      'All tests passing - issue may be frontend related or race condition'
    ]
  })
}

export const GET = createAdminRoute(testAdminEndpoints)