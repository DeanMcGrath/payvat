import { NextRequest, NextResponse } from 'next/server'
import { createAdminRoute } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { AuthUser } from '@/lib/auth'

// GET /api/admin/users - List all users (admin only)
async function getUsers(request: NextRequest, user: AuthUser) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const role = searchParams.get('role')
    const status = searchParams.get('status') // active, inactive
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    
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
    
    // Get total count
    const totalCount = await prisma.user.count({ where })
    
    // Get users with aggregated data
    const users = await prisma.user.findMany({
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
          console.error(`Error fetching stats for user ${user.id}:`, error)
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
      console.error('Failed to create audit log (non-critical):', auditError)
      // Continue without failing the request
    }
    
    return NextResponse.json({
      success: true,
      users: usersWithStats,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
    
  } catch (error) {
    console.error('Admin users fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export const GET = createAdminRoute(getUsers)