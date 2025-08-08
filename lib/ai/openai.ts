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
 * Enhanced utility function to handle OpenAI API errors with detailed diagnostics
 */
export function handleOpenAIError(error: any): { success: false; error: string; diagnosticInfo?: any } {
  console.error('🚨 OpenAI API Error - Full diagnostic information:')
  console.error('   Error type:', error?.constructor?.name)
  console.error('   Error code:', error?.code)
  console.error('   Error message:', error?.message)
  console.error('   Error status:', error?.status)
  console.error('   Full error object:', error)
  
  // Extract diagnostic information
  const diagnosticInfo = {
    errorType: error?.constructor?.name,
    errorCode: error?.code,
    errorStatus: error?.status,
    errorMessage: error?.message,
    timestamp: new Date().toISOString(),
    apiKeyConfigured: !!process.env.OPENAI_API_KEY,
    apiKeyFormat: process.env.OPENAI_API_KEY?.startsWith('sk-') ? 'valid-format' : 'invalid-format'
  }
  
  // Enhanced error handling with specific diagnostic messages
  if (error?.code === 'rate_limit_exceeded') {
    console.error('🚨 DIAGNOSTIC: Rate limit exceeded - API quota may be exhausted')
    return {
      success: false,
      error: 'OpenAI API rate limit exceeded. Your API key may have reached its usage quota. Check your OpenAI dashboard for usage limits and billing status.',
      diagnosticInfo
    }
  }
  
  if (error?.code === 'invalid_api_key' || error?.message?.includes('Incorrect API key')) {
    console.error('🚨 DIAGNOSTIC: Invalid API key detected')
    return {
      success: false,
      error: 'Invalid OpenAI API key. Please check that OPENAI_API_KEY is correctly set in your environment variables.',
      diagnosticInfo
    }
  }
  
  if (error?.code === 'insufficient_quota' || error?.message?.includes('quota')) {
    console.error('🚨 DIAGNOSTIC: Insufficient quota - billing may need setup')
    return {
      success: false,
      error: 'OpenAI API quota exceeded. Please check your OpenAI account billing and usage limits.',
      diagnosticInfo
    }
  }
  
  if (error?.code === 'model_not_found' || error?.message?.includes('does not exist')) {
    console.error('🚨 DIAGNOSTIC: Model not found - API key may not have access to GPT-4 Vision')
    return {
      success: false,
      error: 'OpenAI model not accessible. Your API key may not have access to GPT-4 Vision. Please check your OpenAI plan and model permissions.',
      diagnosticInfo
    }
  }
  
  if (error?.status === 401) {
    console.error('🚨 DIAGNOSTIC: Unauthorized - API key authentication failed')
    return {
      success: false,
      error: 'OpenAI API authentication failed. Please verify your API key is correct and has the necessary permissions.',
      diagnosticInfo
    }
  }
  
  if (error?.status === 429) {
    console.error('🚨 DIAGNOSTIC: Too many requests - rate limiting or quota exceeded')
    return {
      success: false,
      error: 'OpenAI API is rate limiting requests. Please wait a moment before trying again, or check your usage quota.',
      diagnosticInfo
    }
  }
  
  if (error?.status === 500 || error?.status === 502 || error?.status === 503) {
    console.error('🚨 DIAGNOSTIC: OpenAI server error - temporary service issue')
    return {
      success: false,
      error: 'OpenAI API is temporarily unavailable due to server issues. Please try again in a few minutes.',
      diagnosticInfo
    }
  }
  
  if (error?.message?.includes('timeout') || error?.message?.includes('network')) {
    console.error('🚨 DIAGNOSTIC: Network or timeout error')
    return {
      success: false,
      error: 'Network timeout while connecting to OpenAI API. Please check your internet connection and try again.',
      diagnosticInfo
    }
  }
  
  console.error('🚨 DIAGNOSTIC: Unknown error - this may indicate a new issue type')
  return {
    success: false,
    error: `OpenAI API error: ${error?.message || 'Unknown error'}. Please try again or contact support if the issue persists.`,
    diagnosticInfo
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