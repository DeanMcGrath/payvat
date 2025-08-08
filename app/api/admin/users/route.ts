import { NextRequest, NextResponse } from 'next/server'
import { createAdminRoute } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { AuthUser } from '@/lib/auth'
import { Decimal } from '@prisma/client/runtime/library'

// GET /api/admin/users - List all users (admin only)
async function getUsers(request: NextRequest, user: AuthUser) {
  const requestId = Math.random().toString(36).substring(7)
  console.log(`[${requestId}] Admin users request started by user ${user.email} (${user.role})`)
  console.log(`[${requestId}] Request URL: ${request.url}`)
  console.log(`[${requestId}] Environment: ${process.env.NODE_ENV}`)
  console.log(`[${requestId}] Database URL configured: ${!!process.env.DATABASE_URL}`)
  
  try {
    // Enhanced database connection with retry logic and detailed logging
    async function testDatabaseConnection(maxRetries = 3, delay = 1000) {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`[${requestId}] Attempting database connection ${attempt}/${maxRetries}`)
          await prisma.$connect()
          
          // Test a simple query to verify full database connectivity
          await prisma.user.findFirst({ select: { id: true } })
          
          console.log(`[${requestId}] Database connection and query test confirmed on attempt ${attempt}`)
          return true
        } catch (dbError) {
          console.error(`[${requestId}] Database connection attempt ${attempt} failed:`, {
            error: dbError instanceof Error ? dbError.message : String(dbError),
            code: dbError instanceof Error ? (dbError as any).code : undefined,
            stack: dbError instanceof Error ? dbError.stack : undefined
          })
          
          if (attempt === maxRetries) {
            throw dbError
          }
          
          // Wait before retry with exponential backoff
          const backoffDelay = delay * Math.pow(2, attempt - 1)
          console.log(`[${requestId}] Waiting ${backoffDelay}ms before retry ${attempt + 1}`)
          await new Promise(resolve => setTimeout(resolve, backoffDelay))
        }
      }
    }
    
    try {
      await testDatabaseConnection()
    } catch (dbError) {
      const dbErrorDetails = {
        message: dbError instanceof Error ? dbError.message : String(dbError),
        code: dbError instanceof Error ? (dbError as any).code : undefined,
        type: dbError instanceof Error ? dbError.constructor.name : typeof dbError
      }
      
      console.error(`[${requestId}] Database connection failed after all retries:`, dbErrorDetails)
      return NextResponse.json(
        { 
          error: 'Database connection unavailable',
          errorId: requestId,
          details: process.env.NODE_ENV === 'development' 
            ? `Database error: ${dbErrorDetails.message} (${dbErrorDetails.type})` 
            : 'Database service temporarily unavailable. Please try again.',
          timestamp: new Date().toISOString()
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
    
    // Get total count with enhanced error handling
    let totalCount = 0
    try {
      console.log(`[${requestId}] Executing user count query with where clause:`, JSON.stringify(where, null, 2))
      totalCount = await prisma.user.count({ where })
      console.log(`[${requestId}] Admin users count query succeeded: ${totalCount} users found`)
    } catch (countError) {
      const countErrorDetails = {
        message: countError instanceof Error ? countError.message : String(countError),
        code: countError instanceof Error ? (countError as any).code : undefined,
        query: 'user.count',
        where: JSON.stringify(where)
      }
      
      console.error(`[${requestId}] Failed to get user count:`, countErrorDetails)
      return NextResponse.json(
        { 
          error: 'Database query failed - unable to fetch user count',
          errorId: requestId,
          details: process.env.NODE_ENV === 'development' 
            ? `Count query error: ${countErrorDetails.message}` 
            : 'Database error occurred while counting users',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      )
    }
    
    // Get users with basic data first (simplified approach)
    let users: any[] = []
    try {
      console.log(`[${requestId}] Executing users query - page ${page}, limit ${limit}`)
      console.log(`[${requestId}] Query where clause:`, JSON.stringify(where, null, 2))
      
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
      const usersErrorDetails = {
        message: usersError instanceof Error ? usersError.message : String(usersError),
        code: usersError instanceof Error ? (usersError as any).code : undefined,
        query: 'user.findMany',
        params: { page, limit, where: JSON.stringify(where) }
      }
      
      console.error(`[${requestId}] Failed to get users:`, usersErrorDetails)
      return NextResponse.json(
        { 
          error: 'Database query failed - unable to fetch users',
          errorId: requestId,
          details: process.env.NODE_ENV === 'development' 
            ? `Users query error: ${usersErrorDetails.message}` 
            : 'Database error occurred while fetching user list',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      )
    }
    
    // Get additional statistics for each user with enhanced error handling
    console.log(`[${requestId}] Starting stats aggregation for ${users.length} users`)
    const usersWithStats = await Promise.all(
      users.map(async (user, index) => {
        try {
          console.log(`[${requestId}] Processing stats for user ${index + 1}/${users.length}: ${user.email}`)
          
          // Execute queries with individual error handling
          let totalVATPaid: { _sum: { amount: Decimal | null } } = { _sum: { amount: null } }
          let pendingPayments = 0
          let lastVATReturn = null
          
          // Total VAT paid query with detailed error handling
          try {
            totalVATPaid = await prisma.payment.aggregate({
              where: {
                userId: user.id,
                status: 'COMPLETED'
              },
              _sum: { amount: true }
            })
            console.log(`[${requestId}] Total VAT paid for ${user.email}: ${totalVATPaid._sum.amount || 0}`)
          } catch (vatPaidError) {
            console.error(`[${requestId}] Failed to get VAT paid for user ${user.id}:`, {
              error: vatPaidError instanceof Error ? vatPaidError.message : String(vatPaidError),
              userId: user.id
            })
            totalVATPaid = { _sum: { amount: null } }
          }
          
          // Pending payments count with detailed error handling
          try {
            pendingPayments = await prisma.payment.count({
              where: {
                userId: user.id,
                status: { in: ['PENDING', 'PROCESSING'] }
              }
            })
            console.log(`[${requestId}] Pending payments for ${user.email}: ${pendingPayments}`)
          } catch (pendingError) {
            console.error(`[${requestId}] Failed to get pending payments for user ${user.id}:`, {
              error: pendingError instanceof Error ? pendingError.message : String(pendingError),
              userId: user.id
            })
            pendingPayments = 0
          }
          
          // Last VAT return with detailed error handling
          try {
            lastVATReturn = await prisma.vATReturn.findFirst({
              where: { userId: user.id },
              orderBy: { createdAt: 'desc' },
              select: {
                id: true,
                status: true,
                periodEnd: true,
                netVAT: true,
                submittedAt: true
              }
            })
            console.log(`[${requestId}] Last VAT return for ${user.email}:`, lastVATReturn?.id || 'none')
          } catch (vatReturnError) {
            console.error(`[${requestId}] Failed to get last VAT return for user ${user.id}:`, {
              error: vatReturnError instanceof Error ? vatReturnError.message : String(vatReturnError),
              userId: user.id
            })
            lastVATReturn = null
          }
          
          const userWithStats = {
            ...user,
            stats: {
              totalVATReturns: user._count?.vatReturns || 0,
              totalDocuments: user._count?.documents || 0,
              totalPayments: user._count?.payments || 0,
              totalVATPaid: totalVATPaid?._sum?.amount ? Number(totalVATPaid._sum.amount) : 0,
              pendingPayments: pendingPayments || 0,
              lastVATReturn
            }
          }
          
          console.log(`[${requestId}] Completed stats for user ${index + 1}/${users.length}: ${user.email}`)
          return userWithStats
          
        } catch (error) {
          const statsErrorDetails = {
            message: error instanceof Error ? error.message : String(error),
            userId: user.id,
            email: user.email,
            userIndex: index
          }
          
          console.error(`[${requestId}] Critical error fetching stats for user ${user.id}:`, statsErrorDetails)
          
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
    
    console.log(`[${requestId}] Completed stats aggregation for all ${usersWithStats.length} users`)
    
    // Create admin audit log (non-blocking) with enhanced error handling
    try {
      console.log(`[${requestId}] Creating audit log for admin action`)
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
            totalCount,
            page,
            limit,
            timestamp: new Date().toISOString()
          }
        }
      })
      console.log(`[${requestId}] Audit log created successfully`)
    } catch (auditError) {
      console.error(`[${requestId}] Failed to create audit log (non-critical):`, {
        error: auditError instanceof Error ? auditError.message : String(auditError),
        userId: user.id,
        action: 'ADMIN_VIEW_USERS'
      })
      // Continue without failing the request - audit logs are not critical
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
    const criticalErrorDetails = {
      requestId,
      errorId,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.constructor.name : typeof error,
      code: error instanceof Error ? (error as any).code : undefined,
      timestamp: new Date().toISOString(),
      adminUser: user.email,
      url: request.url
    }
    
    console.error(`[${errorId}] CRITICAL admin users fetch error:`, criticalErrorDetails)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch users', 
        errorId,
        requestId,
        details: process.env.NODE_ENV === 'development' 
          ? `${criticalErrorDetails.name}: ${criticalErrorDetails.message}` 
          : 'Internal server error occurred while fetching admin users',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export const GET = createAdminRoute(getUsers)