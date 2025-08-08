import { NextRequest, NextResponse } from 'next/server'
import { createAdminRoute } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { AuthUser } from '@/lib/auth'

// GET /api/admin/users/[id] - Get specific user details (admin only)
async function getUserDetails(request: NextRequest, user: AuthUser) {
  try {
    // Extract user ID from URL
    const url = new URL(request.url)
    const pathSegments = url.pathname.split('/')
    const userId = pathSegments[pathSegments.length - 1]
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get user with all related data
    const userDetails = await prisma.user.findUnique({
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

    if (!userDetails) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get additional statistics
    const [totalVATPaid, pendingPayments] = await Promise.all([
      // Total VAT paid (completed payments only)
      prisma.payment.aggregate({
        where: {
          userId: userId,
          status: 'COMPLETED'
        },
        _sum: { amount: true }
      }),
      
      // Count pending payments
      prisma.payment.count({
        where: {
          userId: userId,
          status: { in: ['PENDING', 'PROCESSING'] }
        }
      })
    ])

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

    // Create admin audit log
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

    return NextResponse.json({
      success: true,
      user: finalUser
    })
    
  } catch (error) {
    console.error('Admin user details fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user details' },
      { status: 500 }
    )
  }
}

export const GET = createAdminRoute(getUserDetails)