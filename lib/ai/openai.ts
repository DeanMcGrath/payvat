/**
 * OpenAI Service Configuration
 * Centralized OpenAI client and configuration for PayVAT AI features
 */

import { OpenAI } from 'openai'
import { env } from '@/lib/env-validation'

// Initialize OpenAI client
export const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY || '',
})

// AI Service Configuration
export const AI_CONFIG = {
  models: {
    vision: 'gpt-4-vision-preview',
    chat: 'gpt-4-turbo',
    analysis: 'gpt-4-turbo',
  },
  limits: {
    maxTokens: 2000,
    temperature: 0.1, // Low temperature for consistent, factual responses
    maxRetries: 3,
  },
  features: {
    documentProcessing: !!env.OPENAI_API_KEY,
    vatAnalysis: !!env.OPENAI_API_KEY,
    chatbot: !!env.OPENAI_API_KEY,
  }
} as const

/**
 * Check if AI features are available
 */
export function isAIEnabled(): boolean {
  return !!env.OPENAI_API_KEY && env.OPENAI_API_KEY !== 'your_openai_api_key_here'
}

/**
 * Utility function to handle OpenAI API errors
 */
export function handleOpenAIError(error: any): { success: false; error: string } {
  console.error('OpenAI API Error:', error)
  
  if (error?.code === 'rate_limit_exceeded') {
    return {
      success: false,
      error: 'AI service temporarily unavailable due to high demand. Please try again in a moment.'
    }
  }
  
  if (error?.code === 'invalid_api_key') {
    return {
      success: false,
      error: 'AI service configuration error. Please contact support.'
    }
  }
  
  return {
    success: false,
    error: 'AI processing failed. Please try again or contact support.'
  }
}

/**
 * Usage tracking for cost monitoring
 */
export interface AIUsageLog {
  feature: 'document_processing' | 'vat_analysis' | 'chat'
  model: string
  inputTokens?: number
  outputTokens?: number
  timestamp: Date
  userId?: string
  cost?: number
}

/**
 * Log AI usage for monitoring and cost tracking
 */
export async function logAIUsage(usage: AIUsageLog): Promise<void> {
  try {
    // In a real implementation, you'd store this in your database
    console.log('AI Usage:', {
      ...usage,
      timestamp: usage.timestamp.toISOString()
    })
  } catch (error) {
    console.warn('Failed to log AI usage:', error)
  }
}