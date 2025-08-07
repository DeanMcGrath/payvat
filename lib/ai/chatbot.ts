/**
 * AI-Powered VAT Support Chatbot
 * Intelligent customer support for VAT-related queries
 */

import { openai, AI_CONFIG, isAIEnabled, handleOpenAIError, logAIUsage } from './openai'
import { CHAT_PROMPTS, formatPrompt } from './prompts'
import { prisma } from '@/lib/prisma'

// Chat AI Types
export interface UserContext {
  userId?: string
  businessName?: string
  vatNumber?: string
  currentVATData?: {
    salesVAT: number
    purchaseVAT: number
    netVAT: number
    period?: string
  }
  recentActivity?: string[]
  sessionHistory?: Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
  }>
}

export interface ChatResponse {
  success: boolean
  response?: string
  requiresHumanSupport?: boolean
  escalationReason?: string
  suggestedActions?: string[]
  confidence?: number
  error?: string
  aiProcessed: boolean
  processingTime?: number
}

export interface EscalationCheck {
  escalate: boolean
  reason: string
  suggestedResponse?: string
}

/**
 * Generate AI response for chat message
 */
export async function generateChatResponse(
  message: string,
  context: UserContext = {},
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<ChatResponse> {
  const startTime = Date.now()

  try {
    if (!isAIEnabled()) {
      return {
        success: false,
        error: 'AI chatbot not available - API key not configured',
        aiProcessed: false
      }
    }

    // Check if query requires human escalation
    const escalationCheck = await checkForEscalation(message, context)
    if (escalationCheck.escalate) {
      return {
        success: true,
        response: escalationCheck.suggestedResponse || "I'll connect you with a human support agent who can better assist you with this query.",
        requiresHumanSupport: true,
        escalationReason: escalationCheck.reason,
        aiProcessed: true,
        processingTime: Date.now() - startTime
      }
    }

    console.log('Generating AI chat response for:', message.substring(0, 100))

    // Build conversation context
    const contextPrompt = buildContextPrompt(context)
    const systemPrompt = CHAT_PROMPTS.SYSTEM_PROMPT + (contextPrompt ? '\n\n' + contextPrompt : '')

    // Prepare conversation messages
    const messages: Array<{ role: 'system' | 'user' | 'assistant', content: string }> = [
      { role: 'system' as const, content: systemPrompt }
    ]

    // Add conversation history (limit to last 10 messages for context)
    const recentHistory = conversationHistory.slice(-10)
    for (const msg of recentHistory) {
      messages.push({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })
    }

    // Add current user message
    messages.push({
      role: 'user' as const,
      content: message
    })

    // Call OpenAI
    const response = await openai.chat.completions.create({
      model: AI_CONFIG.models.chat,
      max_tokens: AI_CONFIG.limits.maxTokens,
      temperature: 0.3, // Slightly higher for more natural conversation
      messages
    })

    const aiResponse = response.choices[0]?.message?.content
    if (!aiResponse) {
      throw new Error('No response from AI chatbot')
    }

    // Generate suggested actions based on response
    const suggestedActions = generateSuggestedActions(message, aiResponse, context)
    
    const processingTime = Date.now() - startTime

    // Log usage
    await logAIUsage({
      feature: 'chat',
      model: AI_CONFIG.models.chat,
      inputTokens: response.usage?.prompt_tokens,
      outputTokens: response.usage?.completion_tokens,
      timestamp: new Date(),
      userId: context.userId
    })

    console.log(`AI chat response generated (${processingTime}ms)`)

    return {
      success: true,
      response: aiResponse,
      suggestedActions,
      confidence: 0.85,
      aiProcessed: true,
      processingTime
    }

  } catch (error) {
    console.error('AI chat response error:', error)
    
    const errorResult = handleOpenAIError(error)
    
    return {
      success: false,
      error: errorResult.error,
      aiProcessed: false,
      processingTime: Date.now() - startTime
    }
  }
}

/**
 * Check if message requires human support escalation
 */
async function checkForEscalation(message: string, context: UserContext): Promise<EscalationCheck> {
  try {
    if (!isAIEnabled()) {
      return { escalate: false, reason: 'AI not available' }
    }

    const escalationPrompt = formatPrompt(CHAT_PROMPTS.ESCALATION_CHECK, {})
    
    const response = await openai.chat.completions.create({
      model: AI_CONFIG.models.chat,
      max_tokens: 300,
      temperature: 0.1, // Low temperature for consistent escalation decisions
      messages: [
        {
          role: 'system',
          content: escalationPrompt
        },
        {
          role: 'user',
          content: `Analyze this message: "${message}"`
        }
      ]
    })

    const result = response.choices[0]?.message?.content
    if (!result) return { escalate: false, reason: 'No escalation analysis' }

    try {
      const parsed = JSON.parse(result)
      return {
        escalate: parsed.escalate || false,
        reason: parsed.reason || 'General escalation',
        suggestedResponse: parsed.suggestedResponse
      }
    } catch {
      // Simple text-based escalation check if JSON parsing fails
      const requiresEscalation = 
        message.toLowerCase().includes('complaint') ||
        message.toLowerCase().includes('billing') ||
        message.toLowerCase().includes('legal') ||
        message.toLowerCase().includes('urgent') ||
        message.toLowerCase().includes('speak to manager')

      return {
        escalate: requiresEscalation,
        reason: requiresEscalation ? 'Keywords suggest human support needed' : 'AI can handle this query'
      }
    }

  } catch (error) {
    console.error('Escalation check error:', error)
    return { escalate: false, reason: 'Escalation check failed' }
  }
}

/**
 * Build context prompt from user information
 */
function buildContextPrompt(context: UserContext): string {
  if (!context.userId) return ''

  const contextParts: string[] = []
  
  if (context.businessName) {
    contextParts.push(`Business: ${context.businessName}`)
  }
  
  if (context.vatNumber) {
    contextParts.push(`VAT Number: ${context.vatNumber}`)
  }
  
  if (context.currentVATData) {
    contextParts.push(
      `Current VAT calculation: Sales VAT €${context.currentVATData.salesVAT}, ` +
      `Purchase VAT €${context.currentVATData.purchaseVAT}, ` +
      `Net VAT €${context.currentVATData.netVAT}`
    )
  }
  
  if (context.recentActivity && context.recentActivity.length > 0) {
    contextParts.push(`Recent activity: ${context.recentActivity.slice(0, 3).join(', ')}`)
  }
  
  if (contextParts.length === 0) return ''
  
  return formatPrompt(CHAT_PROMPTS.CONTEXTUAL_RESPONSE, {
    salesVAT: context.currentVATData?.salesVAT?.toFixed(2) || '0.00',
    purchaseVAT: context.currentVATData?.purchaseVAT?.toFixed(2) || '0.00',
    netVAT: context.currentVATData?.netVAT?.toFixed(2) || '0.00',
    documentCount: '0', // Could be enhanced with actual document count
    recentActivity: context.recentActivity?.join(', ') || 'No recent activity'
  })
}

/**
 * Generate suggested actions based on the conversation
 */
function generateSuggestedActions(
  userMessage: string,
  aiResponse: string,
  context: UserContext
): string[] {
  const suggestions: string[] = []
  
  // VAT calculation related suggestions
  if (userMessage.toLowerCase().includes('calculate') || userMessage.toLowerCase().includes('vat')) {
    suggestions.push('📊 Calculate VAT return')
  }
  
  // Document upload suggestions
  if (userMessage.toLowerCase().includes('upload') || userMessage.toLowerCase().includes('document')) {
    suggestions.push('📄 Upload VAT documents')
  }
  
  // Payment related suggestions
  if (userMessage.toLowerCase().includes('pay') || userMessage.toLowerCase().includes('payment')) {
    suggestions.push('💳 Make VAT payment')
  }
  
  // Deadline reminders
  if (userMessage.toLowerCase().includes('deadline') || userMessage.toLowerCase().includes('due')) {
    suggestions.push('📅 View VAT deadlines')
  }
  
  // Help documentation
  if (userMessage.toLowerCase().includes('help') || userMessage.toLowerCase().includes('how')) {
    suggestions.push('📚 View VAT guide')
  }
  
  return suggestions
}

/**
 * Get conversation context for user
 */
export async function getConversationContext(userId: string): Promise<UserContext> {
  try {
    // Get user information
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        businessName: true,
        vatNumber: true
      }
    })

    // Get recent VAT return
    const recentReturn = await prisma.vATReturn.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        salesVAT: true,
        purchaseVAT: true,
        netVAT: true,
        periodStart: true,
        periodEnd: true
      }
    })

    // Get recent activity from audit logs
    const recentLogs = await prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        action: true,
        createdAt: true
      }
    })

    const recentActivity = recentLogs.map(log => 
      log.action.replace(/_/g, ' ').toLowerCase()
    )

    return {
      userId,
      businessName: user?.businessName || undefined,
      vatNumber: user?.vatNumber || undefined,
      currentVATData: recentReturn ? {
        salesVAT: Number(recentReturn.salesVAT),
        purchaseVAT: Number(recentReturn.purchaseVAT),
        netVAT: Number(recentReturn.netVAT),
        period: recentReturn.periodStart && recentReturn.periodEnd ? 
          `${recentReturn.periodStart.toLocaleDateString()} to ${recentReturn.periodEnd.toLocaleDateString()}` : 
          undefined
      } : undefined,
      recentActivity
    }

  } catch (error) {
    console.error('Error getting conversation context:', error)
    return { userId }
  }
}

/**
 * Save AI chat interaction for learning
 */
export async function logChatInteraction(
  sessionId: string,
  userMessage: string,
  aiResponse: string,
  wasHelpful?: boolean,
  userId?: string
): Promise<void> {
  try {
    // In a full implementation, you'd save this to a dedicated chat analytics table
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'AI_CHAT_INTERACTION',
        entityType: 'CHAT',
        entityId: sessionId,
        ipAddress: 'system',
        userAgent: 'ai-chatbot',
        metadata: {
          userMessage: userMessage.substring(0, 500), // Truncate long messages
          aiResponse: aiResponse.substring(0, 500),
          wasHelpful,
          timestamp: new Date().toISOString()
        }
      }
    })
  } catch (error) {
    console.warn('Failed to log chat interaction:', error)
  }
}