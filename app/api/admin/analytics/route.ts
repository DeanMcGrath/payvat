import { NextRequest, NextResponse } from 'next/server'
import { createAdminRoute } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { AuthUser } from '@/lib/auth'

// GET /api/admin/analytics - System analytics (admin only)
async function getAnalytics(request: NextRequest, user: AuthUser) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // days
    const metric = searchParams.get('metric') || 'overview'
    
    const periodDays = parseInt(period)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - periodDays)
    
    const currentYear = new Date().getFullYear()
    const yearStart = new Date(currentYear, 0, 1)
    
    if (metric === 'overview' || metric === 'all') {
      // System overview statistics
      const [
        totalUsers,
        activeUsers,
        totalvATReturns,
        totalPayments,
        totalDocuments,
        recentUsers,
        recentReturns,
        recentPayments
      ] = await Promise.all([
        // Total users
        prisma.user.count(),
        
        // Active users (logged in within period)
        prisma.user.count({
          where: {
            lastLoginAt: { gte: startDate }
          }
        }),
        
        // Total VAT returns
        prisma.vATReturn.count(),
        
        // Total payments with aggregations
        prisma.payment.aggregate({
          _count: { id: true },
          _sum: { amount: true },
          where: { status: 'COMPLETED' }
        }),
        
        // Total documents
        prisma.document.count(),
        
        // Recent user registrations
        prisma.user.count({
          where: {
            createdAt: { gte: startDate }
          }
        }),
        
        // Recent VAT returns
        prisma.vATReturn.count({
          where: {
            createdAt: { gte: startDate }
          }
        }),
        
        // Recent payments
        prisma.payment.count({
          where: {
            createdAt: { gte: startDate },
            status: 'COMPLETED'
          }
        })
      ])
      
      // Monthly growth data for the current year
      const monthlyData = await Promise.all(
        Array.from({ length: 12 }, async (_, monthIndex) => {
          const monthStart = new Date(currentYear, monthIndex, 1)
          const monthEnd = new Date(currentYear, monthIndex + 1, 0)
          
          const [newUsers, newReturns, completedPayments] = await Promise.all([
            prisma.user.count({
              where: {
                createdAt: { gte: monthStart, lte: monthEnd }
              }
            }),
            prisma.vATReturn.count({
              where: {
                createdAt: { gte: monthStart, lte: monthEnd }
              }
            }),
            prisma.payment.aggregate({
              where: {
                createdAt: { gte: monthStart, lte: monthEnd },
                status: 'COMPLETED'
              },
              _count: { id: true },
              _sum: { amount: true }
            })
          ])
          
          return {
            month: monthStart.toLocaleDateString('en-IE', { month: 'short' }),
            newUsers,
            newReturns,
            completedPayments: completedPayments._count.id,
            paymentVolume: Number(completedPayments._sum.amount || 0)
          }
        })
      )
      
      // User role distribution
      const userRoles = await prisma.user.groupBy({
        by: ['role'],
        _count: { role: true }
      })
      
      // VAT return status distribution
      const returnStatus = await prisma.vATReturn.groupBy({
        by: ['status'],
        _count: { status: true },
        _sum: { netVAT: true }
      })
      
      // Payment method distribution
      const paymentMethods = await prisma.payment.groupBy({
        by: ['paymentMethod'],
        _count: { paymentMethod: true },
        _sum: { amount: true },
        where: { status: 'COMPLETED' }
      })
      
      // Top businesses by VAT paid
      const topBusinesses = await prisma.user.findMany({
        select: {
          id: true,
          businessName: true,
          vatNumber: true,
          _count: {
            select: {
              vatReturns: true,
              payments: true
            }
          }
        },
        orderBy: {
          payments: {
            _count: 'desc'
          }
        },
        take: 10
      })
      
      const topBusinessesWithStats = await Promise.all(
        topBusinesses.map(async (business) => {
          const totalPaid = await prisma.payment.aggregate({
            where: {
              userId: business.id,
              status: 'COMPLETED'
            },
            _sum: { amount: true }
          })
          
          return {
            ...business,
            totalVATPaid: Number(totalPaid._sum.amount || 0)
          }
        })
      )
      
      return NextResponse.json({
        success: true,
        analytics: {
          overview: {
            totalUsers,
            activeUsers,
            totalvATReturns,
            totalPayments: totalPayments._count.id,
            totalPaymentVolume: Number(totalPayments._sum.amount || 0),
            totalDocuments,
            recentActivity: {
              newUsers: recentUsers,
              newReturns: recentReturns,
              newPayments: recentPayments
            }
          },
          trends: {
            monthlyData,
            period: `${periodDays} days`,
            year: currentYear
          },
          distributions: {
            userRoles: userRoles.map(role => ({
              role: role.role,
              count: role._count.role
            })),
            returnStatus: returnStatus.map(status => ({
              status: status.status,
              count: status._count.status,
              totalVAT: Number(status._sum.netVAT || 0)
            })),
            paymentMethods: paymentMethods.map(method => ({
              method: method.paymentMethod || 'unknown',
              count: method._count.paymentMethod,
              totalAmount: Number(method._sum.amount || 0)
            }))
          },
          topBusinesses: topBusinessesWithStats.sort((a, b) => b.totalVATPaid - a.totalVATPaid)
        }
      })
    }
    
    // Performance metrics
    if (metric === 'performance') {
      const [averageProcessingTime, failureRates, systemHealth] = await Promise.all([
        // Average payment processing time
        prisma.payment.findMany({
          where: {
            status: 'COMPLETED',
            createdAt: { gte: startDate },
            processedAt: { not: null }
          },
          select: {
            createdAt: true,
            processedAt: true
          }
        }),
        
        // Payment failure rates
        prisma.payment.groupBy({
          by: ['status'],
          where: { createdAt: { gte: startDate } },
          _count: { status: true }
        }),
        
        // System health indicators
        prisma.auditLog.count({
          where: {
            createdAt: { gte: startDate },
            action: { contains: 'ERROR' }
          }
        })
      ])
      
      // Calculate average processing time
      const processingTimes = averageProcessingTime.map(payment => {
        if (payment.processedAt) {
          return payment.processedAt.getTime() - payment.createdAt.getTime()
        }
        return 0
      }).filter(time => time > 0)
      
      const avgProcessingTime = processingTimes.length > 0 
        ? processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length / 1000 / 60 // minutes
        : 0
      
      return NextResponse.json({
        success: true,
        analytics: {
          performance: {
            averageProcessingTime: Math.round(avgProcessingTime * 100) / 100, // minutes
            paymentFailureRate: failureRates.find(r => r.status === 'FAILED')?._count.status || 0,
            totalPaymentAttempts: failureRates.reduce((sum, r) => sum + r._count.status, 0),
            systemErrors: systemHealth,
            period: `${periodDays} days`
          }
        }
      })
    }
    
    // Create admin audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'ADMIN_VIEW_ANALYTICS',
        entityType: 'SYSTEM',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        metadata: {
          metric,
          period: periodDays,
          timestamp: new Date().toISOString()
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      analytics: {
        message: 'Metric not implemented yet'
      }
    })
    
  } catch (error) {
    console.error('Admin analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

export const GET = createAdminRoute(getAnalytics)