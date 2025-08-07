import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { z } from 'zod'

// Validation schemas
const createSessionSchema = z.object({
  userEmail: z.string().email().optional(),
  userName: z.string().min(1).optional(),
  userCompany: z.string().optional(),
})

const sendMessageSchema = z.object({
  sessionId: z.string().min(1),
  message: z.string().min(1).max(2000),
  messageType: z.enum(['text', 'file']).default('text'),
  fileName: z.string().optional(),
  fileUrl: z.string().optional(),
  fileSize: z.number().optional(),
})

// POST /api/chat - Create new chat session or send message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'create_session') {
      // Create new chat session
      const { userEmail, userName, userCompany } = createSessionSchema.parse(body)
      
      const user = await getUserFromRequest(request)
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const session = await prisma.chatSession.create({
        data: {
          sessionId,
          userId: user?.id,
          userEmail: userEmail || user?.email,
          userName: userName || (user ? `${user.businessName}` : undefined),
          userCompany: userCompany || user?.businessName,
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          referrerUrl: request.headers.get('referer'),
        }
      })

      // Create welcome message
      await prisma.chatMessage.create({
        data: {
          sessionId: session.id,
          message: "Hi! How can we help you with your VAT submission today?",
          messageType: 'text',
          senderType: 'system',
          senderName: 'Support Team',
          isRead: true,
        }
      })

      return NextResponse.json({
        success: true,
        session: {
          id: session.id,
          sessionId: session.sessionId,
          isActive: session.isActive,
        }
      })
    }

    if (action === 'send_message') {
      // Send new message
      const { sessionId, message, messageType, fileName, fileUrl, fileSize } = sendMessageSchema.parse(body)
      
      const user = await getUserFromRequest(request)
      
      // Find session
      const session = await prisma.chatSession.findUnique({
        where: { sessionId }
      })

      if (!session) {
        return NextResponse.json(
          { error: 'Chat session not found' },
          { status: 404 }
        )
      }

      // Create message
      const newMessage = await prisma.chatMessage.create({
        data: {
          sessionId: session.id,
          message,
          messageType,
          senderType: user ? 'user' : 'user', // Could be 'admin' if admin is sending
          senderId: user?.id,
          senderName: user?.businessName || session.userName || 'User',
          fileName,
          fileUrl,
          fileSize,
        }
      })

      // Update session last message time
      await prisma.chatSession.update({
        where: { id: session.id },
        data: { 
          lastMessageAt: new Date(),
          isActive: true,
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
          fileName: newMessage.fileName,
          fileUrl: newMessage.fileUrl,
        }
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    )
  }
}

// GET /api/chat?sessionId=xxx - Get messages for a session
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Find session with messages
    const session = await prisma.chatSession.findUnique({
      where: { sessionId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Chat session not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        sessionId: session.sessionId,
        isActive: session.isActive,
        isResolved: session.isResolved,
        createdAt: session.createdAt,
      },
      messages: session.messages.map(msg => ({
        id: msg.id,
        message: msg.message,
        messageType: msg.messageType,
        senderType: msg.senderType,
        senderName: msg.senderName,
        isRead: msg.isRead,
        createdAt: msg.createdAt,
        fileName: msg.fileName,
        fileUrl: msg.fileUrl,
      }))
    })

  } catch (error) {
    console.error('Chat fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}