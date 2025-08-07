import { NextRequest, NextResponse } from 'next/server'
import { createAdminRoute } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { AuthUser } from '@/lib/auth'
import { z } from 'zod'

const sendAdminMessageSchema = z.object({
  sessionId: z.string().min(1),
  message: z.string().min(1).max(2000),
  messageType: z.enum(['text', 'file']).default('text'),
  fileName: z.string().optional(),
  fileUrl: z.string().optional(),
})

const updateSessionSchema = z.object({
  sessionId: z.string().min(1),
  isResolved: z.boolean().optional(),
  isActive: z.boolean().optional(),
})

// GET /api/admin/chat - List all active chat sessions
async function getAdminChats(request: NextRequest, user: AuthUser) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'active' // active, resolved, all
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

    // Build where clause
    const where: any = {}
    
    if (status === 'active') {
      where.isActive = true
      where.isResolved = false
    } else if (status === 'resolved') {
      where.isResolved = true
    }

    // Get total count
    const totalCount = await prisma.chatSession.count({ where })

    // Get sessions with latest message
    const sessions = await prisma.chatSession.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            businessName: true,
            firstName: true,
            lastName: true,
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            message: true,
            senderType: true,
            senderName: true,
            isRead: true,
            createdAt: true,
          }
        },
        _count: {
          select: {
            messages: true
          }
        }
      },
      orderBy: [
        { isResolved: 'asc' },
        { lastMessageAt: 'desc' }
      ],
      skip: (page - 1) * limit,
      take: limit
    })

    return NextResponse.json({
      success: true,
      sessions: sessions.map(session => ({
        id: session.id,
        sessionId: session.sessionId,
        isActive: session.isActive,
        isResolved: session.isResolved,
        resolvedAt: session.resolvedAt,
        resolvedBy: session.resolvedBy,
        userEmail: session.user?.email || session.userEmail,
        userName: session.user?.businessName || session.userName,
        userCompany: session.userCompany,
        messageCount: session._count.messages,
        lastMessage: session.messages[0] || null,
        lastMessageAt: session.lastMessageAt,
        createdAt: session.createdAt,
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error('Admin chat list error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chat sessions' },
      { status: 500 }
    )
  }
}

// POST /api/admin/chat - Send admin message or update session
async function adminChatAction(request: NextRequest, user: AuthUser) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'send_message') {
      // Send admin reply
      const { sessionId, message, messageType, fileName, fileUrl } = sendAdminMessageSchema.parse(body)
      
      // Find session by sessionId
      const session = await prisma.chatSession.findFirst({
        where: { sessionId }
      })

      if (!session) {
        return NextResponse.json(
          { error: 'Chat session not found' },
          { status: 404 }
        )
      }

      // Create admin message
      const newMessage = await prisma.chatMessage.create({
        data: {
          sessionId: session.id,
          message,
          messageType,
          senderType: 'admin',
          senderId: user.id,
          senderName: user.businessName || `Admin (${user.email})`,
          fileName,
          fileUrl,
        }
      })

      // Update session
      await prisma.chatSession.update({
        where: { id: session.id },
        data: { 
          lastMessageAt: new Date(),
          isActive: true,
        }
      })

      // Create admin audit log
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'ADMIN_CHAT_REPLY',
          entityType: 'CHAT_SESSION',
          entityId: session.id,
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          metadata: {
            sessionId: session.sessionId,
            messageLength: message.length,
          }
        }
      })

      return NextResponse.json({
        success: true,
        message: {
          id: newMessage.id,
          message: newMessage.message,
          messageType: newMessage.messageType,
          senderType: newMessage.senderType,
          senderName: newMessage.senderName,
          createdAt: newMessage.createdAt,
        }
      })
    }

    if (action === 'update_session') {
      // Update session status
      const { sessionId, isResolved, isActive } = updateSessionSchema.parse(body)
      
      const session = await prisma.chatSession.findFirst({
        where: { sessionId }
      })

      if (!session) {
        return NextResponse.json(
          { error: 'Chat session not found' },
          { status: 404 }
        )
      }

      const updateData: any = {}
      if (isResolved !== undefined) {
        updateData.isResolved = isResolved
        if (isResolved) {
          updateData.resolvedAt = new Date()
          updateData.resolvedBy = user.id
        }
      }
      if (isActive !== undefined) {
        updateData.isActive = isActive
      }

      const updatedSession = await prisma.chatSession.update({
        where: { id: session.id },
        data: updateData
      })

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'ADMIN_UPDATE_CHAT_SESSION',
          entityType: 'CHAT_SESSION',
          entityId: session.id,
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          metadata: {
            sessionId: session.sessionId,
            changes: updateData,
          }
        }
      })

      return NextResponse.json({
        success: true,
        session: {
          id: updatedSession.id,
          sessionId: updatedSession.sessionId,
          isActive: updatedSession.isActive,
          isResolved: updatedSession.isResolved,
          resolvedAt: updatedSession.resolvedAt,
        }
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Admin chat action error:', error)
    return NextResponse.json(
      { error: 'Failed to process admin chat action' },
      { status: 500 }
    )
  }
}

export const GET = createAdminRoute(getAdminChats)
export const POST = createAdminRoute(adminChatAction)