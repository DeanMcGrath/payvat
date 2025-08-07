import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { z } from 'zod'
import DOMPurify from 'isomorphic-dompurify'
import { checkChatRateLimit } from '@/lib/chat-rate-limiter'
import { generateChatResponse, getConversationContext, logChatInteraction } from '@/lib/ai/chatbot'
import { isAIEnabled } from '@/lib/ai/openai'

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
      const sessionId = `session_${crypto.randomUUID()}`
      
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

      // Create welcome message (with AI enhancement if available)
      let welcomeMessage = "Hi! How can we help you with your VAT submission today?"
      
      if (isAIEnabled() && user) {
        try {
          const context = await getConversationContext(user.id)
          const aiWelcome = await generateChatResponse(
            "Welcome new user to VAT support chat",
            context
          )
          
          if (aiWelcome.success && aiWelcome.response) {
            welcomeMessage = aiWelcome.response
          }
        } catch (error) {
          console.warn('AI welcome message failed, using default:', error)
        }
      }

      await prisma.chatMessage.create({
        data: {
          sessionId: session.id,
          message: welcomeMessage,
          messageType: 'text',
          senderType: 'system',
          senderName: isAIEnabled() ? 'PAY VAT Assistant 🤖' : 'Support Team',
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

      // Check rate limiting
      const rateCheck = checkChatRateLimit(sessionId)
      if (!rateCheck.allowed) {
        return NextResponse.json(
          { 
            error: 'Rate limit exceeded',
            message: rateCheck.message,
            resetIn: rateCheck.resetIn
          },
          { status: 429 }
        )
      }

      // Sanitize message content
      const sanitizedMessage = DOMPurify.sanitize(message, { 
        ALLOWED_TAGS: [],  // Strip all HTML tags
        ALLOWED_ATTR: []   // Strip all attributes
      })

      // Create message
      const newMessage = await prisma.chatMessage.create({
        data: {
          sessionId: session.id,
          message: sanitizedMessage,
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

      // Generate AI response if enabled and no admin is online
      let aiResponseMessage = null
      if (isAIEnabled() && user) {
        try {
          // Get conversation context
          const context = await getConversationContext(user.id)
          
          // Get recent conversation history for context
          const recentMessages = await prisma.chatMessage.findMany({
            where: { sessionId: session.id },
            orderBy: { createdAt: 'desc' },
            take: 10,
            select: {
              message: true,
              senderType: true,
            }
          })
          
          const conversationHistory = recentMessages
            .reverse()
            .map(msg => ({
              role: (msg.senderType === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
              content: msg.message
            }))
          
          // Generate AI response
          const aiResponse = await generateChatResponse(
            sanitizedMessage,
            context,
            conversationHistory
          )
          
          if (aiResponse.success && aiResponse.response) {
            // Create AI response message
            aiResponseMessage = await prisma.chatMessage.create({
              data: {
                sessionId: session.id,
                message: aiResponse.response,
                messageType: 'text',
                senderType: 'system',
                senderName: 'PAY VAT Assistant 🤖',
                isRead: false,
              }
            })
            
            // Log the interaction
            await logChatInteraction(
              session.sessionId,
              sanitizedMessage,
              aiResponse.response,
              undefined, // wasHelpful will be set by user feedback
              user.id
            )
            
            console.log('AI response generated for chat session:', session.sessionId)
            
            // If human support is required, flag the session
            if (aiResponse.requiresHumanSupport) {
              await prisma.chatSession.update({
                where: { id: session.id },
                data: { isResolved: false }
              })
              
              // Create a system message about escalation
              await prisma.chatMessage.create({
                data: {
                  sessionId: session.id,
                  message: `This conversation has been flagged for human support: ${aiResponse.escalationReason}`,
                  messageType: 'system',
                  senderType: 'system',
                  senderName: 'System',
                  isRead: true,
                }
              })
            }
          }
        } catch (aiError) {
          console.warn('AI chat response failed:', aiError)
        }
      }

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
        },
        aiResponse: aiResponseMessage ? {
          id: aiResponseMessage.id,
          message: aiResponseMessage.message,
          senderName: aiResponseMessage.senderName,
          createdAt: aiResponseMessage.createdAt,
        } : null
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