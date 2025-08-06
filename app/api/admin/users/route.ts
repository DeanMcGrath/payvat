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
    
    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { businessName: { contains: search, mode: 'insensitive' } },
        { vatNumber: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (role) {
      where.role = role
    }
    
    // Status filtering based on last login
    if (status === 'active') {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      where.lastLoginAt = { gte: thirtyDaysAgo }
    } else if (status === 'inactive') {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      where.OR = [
        { lastLoginAt: { lt: thirtyDaysAgo } },
        { lastLoginAt: null }
      ]
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
    
    // Get additional statistics for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const [totalVATPaid, pendingPayments, lastvATReturn] = await Promise.all([
          // Total VAT paid
          prisma.payment.aggregate({
            where: {
              userId: user.id,
              status: 'COMPLETED'
            },
            _sum: { amount: true }
          }),
          // Pending payments count
          prisma.payment.count({
            where: {
              userId: user.id,
              status: { in: ['PENDING', 'PROCESSING'] }
            }
          }),
          // Last VAT return
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
          })
        ])
        
        return {
          ...user,
          stats: {
            totalvATReturns: user._count.vatReturns,
            totalDocuments: user._count.documents,
            totalPayments: user._count.payments,
            totalVATPaid: Number(totalVATPaid._sum.amount || 0),
            pendingPayments,
            lastvATReturn
          }
        }
      })
    )
    
    // Create admin audit log
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