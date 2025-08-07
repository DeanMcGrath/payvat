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
      console.log('Fetching admin analytics overview...')
      
      // System overview statistics with individual error handling
      let totalUsers = 0
      let activeUsers = 0
      let totalVATReturns = 0
      let totalPayments: any = { _count: { id: 0 }, _sum: { amount: 0 } }
      let totalDocuments = 0
      let recentUsers = 0
      let recentReturns = 0
      let recentPayments = 0
      
      try {
        const results = await Promise.all([
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
      
      // Destructure results
      totalUsers = results[0]
      activeUsers = results[1]
      totalVATReturns = results[2]
      totalPayments = results[3]
      totalDocuments = results[4]
      recentUsers = results[5]
      recentReturns = results[6]
      recentPayments = results[7]
      
      console.log('Basic analytics fetched successfully:', { 
        totalUsers, 
        activeUsers, 
        totalVATReturns, 
        totalPayments: totalPayments._count.id,
        totalDocuments 
      })
      
      } catch (basicQueryError) {
        console.error('Error in basic analytics queries:', basicQueryError)
        const errorMessage = basicQueryError instanceof Error ? basicQueryError.message : 'Unknown database error'
        throw new Error(`Database query failed: ${errorMessage}`)
      }
      
      // Monthly growth data for the current year
      let monthlyData = []
      try {
        monthlyData = await Promise.all(
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
      
      console.log('Monthly data fetched successfully')
      } catch (monthlyDataError) {
        console.error('Error fetching monthly data:', monthlyDataError)
        // Continue with empty monthly data
        monthlyData = Array.from({ length: 12 }, (_, i) => ({
          month: new Date(currentYear, i, 1).toLocaleDateString('en-IE', { month: 'short' }),
          newUsers: 0,
          newReturns: 0,
          completedPayments: 0,
          paymentVolume: 0
        }))
      }
      
      // User role distribution
      let userRoles: any[] = []
      let returnStatus: any[] = []
      let paymentMethods: any[] = []
      
      try {
        [userRoles, returnStatus, paymentMethods] = await Promise.all([
          prisma.user.groupBy({
            by: ['role'],
            _count: { role: true }
          }),
          
          prisma.vATReturn.groupBy({
            by: ['status'],
            _count: { status: true },
            _sum: { netVAT: true }
          }),
          
          prisma.payment.groupBy({
            by: ['paymentMethod'],
            _count: { paymentMethod: true },
            _sum: { amount: true },
            where: { status: 'COMPLETED' }
          })
        ])
        
        console.log('Distribution data fetched successfully')
      } catch (distributionError) {
        console.error('Error fetching distribution data:', distributionError)
        // Continue with empty distributions
        userRoles = []
        returnStatus = []
        paymentMethods = []
      }
      
      // Top businesses by VAT paid
      let topBusinessesWithStats: any[] = []
      
      try {
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
        
        topBusinessesWithStats = await Promise.all(
          topBusinesses.map(async (business) => {
            try {
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
            } catch (businessError) {
              console.error(`Error fetching stats for business ${business.id}:`, businessError)
              return {
                ...business,
                totalVATPaid: 0
              }
            }
          })
        )
        
        console.log('Top businesses data fetched successfully')
      } catch (topBusinessesError) {
        console.error('Error fetching top businesses:', topBusinessesError)
        topBusinessesWithStats = []
      }
      
      // Create admin audit log for overview analytics
      try {
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
      } catch (auditError) {
        console.error('Error creating audit log:', auditError)
        // Continue without failing the entire request
      }

      return NextResponse.json({
        success: true,
        analytics: {
          overview: {
            totalUsers,
            activeUsers,
            totalVATReturns,
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
      
      // Create admin audit log for performance analytics
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'ADMIN_VIEW_PERFORMANCE',
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
    
    // If we reach here, the metric was not recognized
    return NextResponse.json(
      { error: `Unsupported metric: ${metric}` },
      { status: 400 }
    )
    
  } catch (error) {
    console.error('Admin analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

export const GET = createAdminRoute(getAnalytics)