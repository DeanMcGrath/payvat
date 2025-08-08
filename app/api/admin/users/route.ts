import { NextRequest, NextResponse } from 'next/server'
import { createAdminRoute } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { AuthUser } from '@/lib/auth'

// GET /api/admin/users - List all users (admin only)
async function getUsers(request: NextRequest, user: AuthUser) {
  const requestId = Math.random().toString(36).substring(7)
  console.log(`[${requestId}] Admin users request started by user ${user.email} (${user.role})`)
  
  try {
    // Database connection with retry logic
    async function testDatabaseConnection(maxRetries = 3, delay = 1000) {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          await prisma.$connect()
          console.log(`[${requestId}] Database connection confirmed on attempt ${attempt}`)
          return true
        } catch (dbError) {
          console.error(`[${requestId}] Database connection attempt ${attempt} failed:`, dbError)
          
          if (attempt === maxRetries) {
            throw dbError
          }
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }
    
    try {
      await testDatabaseConnection()
    } catch (dbError) {
      console.error(`[${requestId}] Database connection failed after all retries:`, dbError)
      return NextResponse.json(
        { 
          error: 'Database connection unavailable',
          details: process.env.NODE_ENV === 'development' 
            ? `Database error: ${String(dbError)}` 
            : 'Database service temporarily unavailable. Please try again.'
        },
        { status: 503 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const role = searchParams.get('role')
    const status = searchParams.get('status') // active, inactive
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    
    console.log(`[${requestId}] Query parameters:`, { search, role, status, page, limit })
    
    // Build where clause with proper AND/OR logic
    const where: any = {}
    const conditions: any[] = []
    
    // Search condition
    if (search) {
      conditions.push({
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { businessName: { contains: search, mode: 'insensitive' } },
          { vatNumber: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } }
        ]
      })
    }
    
    // Role condition
    if (role) {
      conditions.push({ role })
    }
    
    // Status filtering based on last login
    if (status === 'active') {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      conditions.push({ lastLoginAt: { gte: thirtyDaysAgo } })
    } else if (status === 'inactive') {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      conditions.push({
        OR: [
          { lastLoginAt: { lt: thirtyDaysAgo } },
          { lastLoginAt: null }
        ]
      })
    }
    
    // Combine all conditions with AND logic
    if (conditions.length > 0) {
      where.AND = conditions
    }
    
    // Get total count with error handling
    let totalCount = 0
    try {
      totalCount = await prisma.user.count({ where })
      console.log(`[${requestId}] Admin users count query succeeded: ${totalCount} users found`)
    } catch (countError) {
      console.error(`[${requestId}] Failed to get user count:`, countError)
      // Return error immediately if basic database connection fails
      return NextResponse.json(
        { 
          error: 'Database connection failed - unable to fetch user count',
          details: process.env.NODE_ENV === 'development' ? String(countError) : 'Database error'
        },
        { status: 500 }
      )
    }
    
    // Get users with aggregated data and error handling
    let users: any[] = []
    try {
      users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          role: true,
          businessName: true,
          vatNumber: true,
          firstName: true,
          lastName: true,
          phone: true,
          address: true,
          emailVerified: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              vatReturns: true,
              documents: true,
              payments: true
            }
          }
        },
        orderBy: [
          { createdAt: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit
      })
      console.log(`[${requestId}] Admin users query succeeded: ${users.length} users retrieved`)
    } catch (usersError) {
      console.error(`[${requestId}] Failed to get users:`, usersError)
      return NextResponse.json(
        { 
          error: 'Database connection failed - unable to fetch users',
          details: process.env.NODE_ENV === 'development' ? String(usersError) : 'Database error'
        },
        { status: 500 }
      )
    }
    
    // Get additional statistics for each user with error handling
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        try {
          const [totalVATPaid, pendingPayments, lastVATReturn] = await Promise.all([
            // Total VAT paid - with fallback
            prisma.payment.aggregate({
              where: {
                userId: user.id,
                status: 'COMPLETED'
              },
              _sum: { amount: true }
            }).catch(() => ({ _sum: { amount: 0 } })),
            
            // Pending payments count - with fallback
            prisma.payment.count({
              where: {
                userId: user.id,
                status: { in: ['PENDING', 'PROCESSING'] }
              }
            }).catch(() => 0),
            
            // Last VAT return - with fallback
            prisma.vATReturn.findFirst({
              where: { userId: user.id },
              orderBy: { createdAt: 'desc' },
              select: {
                id: true,
                status: true,
                periodEnd: true,
                netVAT: true,
                submittedAt: true
              }
            }).catch(() => null)
          ])
          
          return {
            ...user,
            stats: {
              totalVATReturns: user._count?.vatReturns || 0,
              totalDocuments: user._count?.documents || 0,
              totalPayments: user._count?.payments || 0,
              totalVATPaid: Number(totalVATPaid?._sum?.amount || 0),
              pendingPayments: pendingPayments || 0,
              lastVATReturn
            }
          }
        } catch (error) {
          console.error(`[${requestId}] Error fetching stats for user ${user.id}:`, error)
          // Return user with safe default stats
          return {
            ...user,
            stats: {
              totalVATReturns: user._count?.vatReturns || 0,
              totalDocuments: user._count?.documents || 0,
              totalPayments: user._count?.payments || 0,
              totalVATPaid: 0,
              pendingPayments: 0,
              lastVATReturn: null
            }
          }
        }
      })
    )
    
    // Create admin audit log (non-blocking)
    try {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'ADMIN_VIEW_USERS',
          entityType: 'USER',
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          metadata: {
            search,
            role,
            status,
            resultCount: users.length,
            timestamp: new Date().toISOString()
          }
        }
      })
    } catch (auditError) {
      console.error(`[${requestId}] Failed to create audit log (non-critical):`, auditError)
      // Continue without failing the request
    }
    
    // Handle empty state gracefully
    if (totalCount === 0) {
      console.log(`[${requestId}] No users found in database - returning empty result`)
    }
    
    // Simple response format matching frontend interface exactly
    const response = {
      success: true,
      users: usersWithStats,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1
      }
    }
    
    console.log(`[${requestId}] Admin users request completed successfully: ${usersWithStats.length} users returned`)
    return NextResponse.json(response)
    
  } catch (error) {
    const errorId = Math.random().toString(36).substring(7)
    console.error(`[${errorId}] Critical admin users fetch error:`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    })
    return NextResponse.json(
      { 
        error: 'Failed to fetch users', 
        details: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error'
      },
      { status: 500 }
    )
  }
}

export const GET = createAdminRoute(getUsers)