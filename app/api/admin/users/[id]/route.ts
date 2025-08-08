import { NextRequest, NextResponse } from 'next/server'
import { createAdminRoute } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { AuthUser } from '@/lib/auth'

// GET /api/admin/users/[id] - Get specific user details (admin only)
async function getUserDetails(request: NextRequest, user: AuthUser) {
  const requestId = Math.random().toString(36).substring(7)
  
  try {
    // Extract user ID from URL
    const url = new URL(request.url)
    const pathSegments = url.pathname.split('/')
    const userId = pathSegments[pathSegments.length - 1]
    
    console.log(`[${requestId}] Admin user detail request for user ${userId} by ${user.email} (${user.role})`)
    
    if (!userId) {
      console.log(`[${requestId}] Missing user ID in request`)
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Test database connection
    try {
      await prisma.$connect()
      console.log(`[${requestId}] Database connection confirmed`)
    } catch (dbError) {
      console.error(`[${requestId}] Database connection failed:`, dbError)
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

    // Get user with all related data
    let userDetails
    try {
      console.log(`[${requestId}] Fetching user details for ${userId}`)
      userDetails = await prisma.user.findUnique({
      where: { id: userId },
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
        
        // Include related data
        documents: {
          select: {
            id: true,
            fileName: true,
            originalName: true,
            fileSize: true,
            mimeType: true,
            documentType: true,
            category: true,
            isScanned: true,
            scanResult: true,
            uploadedAt: true,
            vatReturnId: true
          },
          orderBy: { uploadedAt: 'desc' }
        },
        
        vatReturns: {
          select: {
            id: true,
            periodStart: true,
            periodEnd: true,
            dueDate: true,
            salesVAT: true,
            purchaseVAT: true,
            netVAT: true,
            status: true,
            submittedAt: true,
            paidAt: true,
            revenueRefNumber: true,
            createdAt: true,
            updatedAt: true
          },
          orderBy: { periodEnd: 'desc' }
        },
        
        payments: {
          select: {
            id: true,
            vatReturnId: true,
            amount: true,
            currency: true,
            status: true,
            paymentMethod: true,
            stripePaymentId: true,
            processedAt: true,
            failedAt: true,
            failureReason: true,
            receiptNumber: true,
            receiptUrl: true,
            createdAt: true,
            updatedAt: true
          },
          orderBy: { createdAt: 'desc' }
        },
        
        chatSessions: {
          select: {
            id: true,
            sessionId: true,
            isActive: true,
            isResolved: true,
            resolvedAt: true,
            resolvedBy: true,
            userEmail: true,
            userName: true,
            userCompany: true,
            createdAt: true,
            lastMessageAt: true,
            _count: {
              select: { messages: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        
        _count: {
          select: {
            vatReturns: true,
            documents: true,
            payments: true
          }
        }
      }
    })
    console.log(`[${requestId}] User details query completed`)
    } catch (userQueryError) {
      console.error(`[${requestId}] Failed to fetch user details:`, userQueryError)
      return NextResponse.json(
        { 
          error: 'Failed to fetch user data from database',
          details: process.env.NODE_ENV === 'development' ? String(userQueryError) : 'Database query error'
        },
        { status: 500 }
      )
    }

    if (!userDetails) {
      console.log(`[${requestId}] User ${userId} not found in database`)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log(`[${requestId}] Found user ${userDetails.email}, fetching additional stats`)

    // Get additional statistics with error handling
    let totalVATPaid, pendingPayments
    try {
      [totalVATPaid, pendingPayments] = await Promise.all([
        // Total VAT paid (completed payments only)
        prisma.payment.aggregate({
          where: {
            userId: userId,
            status: 'COMPLETED'
          },
          _sum: { amount: true }
        }).catch(() => ({ _sum: { amount: 0 } })),
        
        // Count pending payments
        prisma.payment.count({
          where: {
            userId: userId,
            status: { in: ['PENDING', 'PROCESSING'] }
          }
        }).catch(() => 0)
      ])
      console.log(`[${requestId}] Statistics aggregation completed`)
    } catch (statsError) {
      console.error(`[${requestId}] Failed to fetch user statistics:`, statsError)
      // Use defaults if stats fail
      totalVATPaid = { _sum: { amount: 0 } }
      pendingPayments = 0
    }

    // Format the response with statistics
    const userWithStats = {
      ...userDetails,
      stats: {
        totalVATReturns: userDetails._count.vatReturns,
        totalDocuments: userDetails._count.documents,
        totalPayments: userDetails._count.payments,
        totalVATPaid: Number(totalVATPaid._sum.amount || 0),
        pendingPayments
      },
      // Add message count to chat sessions
      chatSessions: userDetails.chatSessions.map(session => ({
        ...session,
        messageCount: session._count.messages
      }))
    }

    // Remove the _count field as it's been processed into stats
    const { _count, ...finalUser } = userWithStats

    // Create admin audit log (non-blocking)
    try {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'ADMIN_VIEW_USER_DETAILS',
          entityType: 'USER',
          entityId: userId,
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          metadata: {
            viewedUserId: userId,
            viewedUserEmail: userDetails.email,
            timestamp: new Date().toISOString()
          }
        }
      })
    } catch (auditError) {
      console.error(`[${requestId}] Failed to create audit log (non-critical):`, auditError)
    }

    console.log(`[${requestId}] Admin user detail request completed successfully for ${userDetails.email}`)
    return NextResponse.json({
      success: true,
      user: finalUser
    })
    
  } catch (error) {
    const errorId = Math.random().toString(36).substring(7)
    console.error(`[${errorId}] Critical admin user details fetch error:`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      requestId,
      timestamp: new Date().toISOString()
    })
    return NextResponse.json(
      { 
        error: 'Failed to fetch user details',
        details: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error'
      },
      { status: 500 }
    )
  }
}

export const GET = createAdminRoute(getUserDetails)