/**
 * AI-Powered VAT Analysis and Advice Service
 * Provides intelligent VAT calculation validation and business advice
 */

import { openai, AI_CONFIG, isAIEnabled, handleOpenAIError, logAIUsage } from './openai'
import { VAT_ANALYSIS_PROMPTS, formatPrompt } from './prompts'

// VAT Analysis Result Types
export interface VATAnalysisResult {
  status: 'VALID' | 'WARNING' | 'ERROR'
  issues: string[]
  recommendations: string[]
  complianceNotes: string[]
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  reasoning: string
  confidence: number
}

export interface VATCalculationInput {
  salesVAT: number
  purchaseVAT: number
  netVAT: number
  periodStart: string
  periodEnd: string
  businessType?: string
  industry?: string
  previousReturns?: Array<{
    period: string
    salesVAT: number
    purchaseVAT: number
    netVAT: number
  }>
}

export interface AIVATValidationResult {
  success: boolean
  analysis?: VATAnalysisResult
  suggestions?: string[]
  error?: string
  aiProcessed: boolean
  processingTime?: number
}

/**
 * Analyze VAT calculation using AI
 */
export async function analyzeVATCalculation(
  input: VATCalculationInput,
  userId?: string
): Promise<AIVATValidationResult> {
  const startTime = Date.now()
  
  try {
    if (!isAIEnabled()) {
      return {
        success: false,
        error: 'AI analysis not available - API key not configured',
        aiProcessed: false
      }
    }

    console.log('Starting AI VAT analysis for period:', input.periodStart, 'to', input.periodEnd)

    // Prepare the analysis prompt
    const prompt = formatPrompt(VAT_ANALYSIS_PROMPTS.CALCULATION_REVIEW, {
      salesVAT: input.salesVAT.toFixed(2),
      purchaseVAT: input.purchaseVAT.toFixed(2),
      netVAT: input.netVAT.toFixed(2),
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      businessType: input.businessType || 'General Business'
    })

    // Call OpenAI for analysis
    const response = await openai.chat.completions.create({
      model: AI_CONFIG.models.analysis,
      max_tokens: AI_CONFIG.limits.maxTokens,
      temperature: AI_CONFIG.limits.temperature,
      messages: [
        {
          role: "system",
          content: "You are an expert Irish VAT compliance analyst. Provide thorough, accurate analysis of VAT calculations and flag any potential issues."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    })

    const aiResult = response.choices[0]?.message?.content
    if (!aiResult) {
      throw new Error('No response from AI service')
    }

    // Parse AI response
    let analysisResult: VATAnalysisResult
    try {
      const jsonMatch = aiResult.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        analysisResult = {
          status: parsed.status || 'VALID',
          issues: parsed.issues || [],
          recommendations: parsed.recommendations || [],
          complianceNotes: parsed.complianceNotes || [],
          riskLevel: parsed.riskLevel || 'LOW',
          reasoning: parsed.reasoning || 'Analysis completed',
          confidence: 0.85 // AI analysis confidence
        }
      } else {
        // Fallback parsing from plain text
        analysisResult = parseTextResponse(aiResult)
      }
    } catch (parseError) {
      console.error('Failed to parse AI VAT analysis:', parseError)
      throw new Error('Invalid AI response format')
    }

    // Generate additional suggestions
    const suggestions = generateVATSuggestions(input, analysisResult)
    
    const processingTime = Date.now() - startTime

    // Log usage
    await logAIUsage({
      feature: 'vat_analysis',
      model: AI_CONFIG.models.analysis,
      inputTokens: response.usage?.prompt_tokens,
      outputTokens: response.usage?.completion_tokens,
      timestamp: new Date(),
      userId
    })

    console.log(`AI VAT analysis complete: ${analysisResult.status} (${processingTime}ms)`)

    return {
      success: true,
      analysis: analysisResult,
      suggestions,
      aiProcessed: true,
      processingTime
    }

  } catch (error) {
    console.error('AI VAT analysis error:', error)
    
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
 * Generate business-specific VAT suggestions
 */
function generateVATSuggestions(input: VATCalculationInput, analysis: VATAnalysisResult): string[] {
  const suggestions: string[] = []
  
  // Calculate ratios for insights
  const vatRatio = input.salesVAT > 0 ? input.purchaseVAT / input.salesVAT : 0
  
  // High purchase VAT ratio suggestions
  if (vatRatio > 0.8) {
    suggestions.push("Your purchase VAT is high relative to sales VAT. Ensure all purchases are business-related and properly documented.")
  }
  
  // Low purchase VAT suggestions
  if (vatRatio < 0.1 && input.salesVAT > 1000) {
    suggestions.push("You may be missing eligible purchase VAT deductions. Review expenses for office supplies, professional services, and equipment purchases.")
  }
  
  // Seasonal reminders
  const period = new Date(input.periodStart)
  const month = period.getMonth()
  
  if (month === 11) { // December
    suggestions.push("Year-end reminder: Consider timing of major purchases for VAT efficiency and ensure all December invoices are properly recorded.")
  }
  
  if (month === 0) { // January
    suggestions.push("New year reminder: Review VAT registration thresholds and consider if any rate changes affect your business.")
  }
  
  // Compliance reminders
  if (input.netVAT > 5000) {
    suggestions.push("Large VAT liability: Ensure you have adequate cash flow for the payment and consider monthly VAT returns if beneficial.")
  }
  
  return suggestions
}

/**
 * Parse plain text AI response as fallback
 */
function parseTextResponse(text: string): VATAnalysisResult {
  const hasWarnings = text.toLowerCase().includes('warning') || text.toLowerCase().includes('issue')
  const hasErrors = text.toLowerCase().includes('error') || text.toLowerCase().includes('problem')
  
  let status: VATAnalysisResult['status'] = 'VALID'
  if (hasErrors) status = 'ERROR'
  else if (hasWarnings) status = 'WARNING'
  
  return {
    status,
    issues: hasWarnings ? ['Issues detected in plain text response'] : [],
    recommendations: ['Review the full analysis for detailed recommendations'],
    complianceNotes: ['Ensure compliance with Irish VAT regulations'],
    riskLevel: hasErrors ? 'HIGH' : hasWarnings ? 'MEDIUM' : 'LOW',
    reasoning: text.substring(0, 500) + '...', // Truncate for storage
    confidence: 0.7 // Lower confidence for text parsing
  }
}

/**
 * Get industry-specific VAT insights
 */
export async function getIndustryVATInsights(
  industry: string,
  vatData: VATCalculationInput,
  userId?: string
): Promise<{ success: boolean; insights?: string[]; error?: string }> {
  try {
    if (!isAIEnabled()) {
      return {
        success: false,
        error: 'AI insights not available'
      }
    }

    const prompt = formatPrompt(VAT_ANALYSIS_PROMPTS.INDUSTRY_ANALYSIS, {
      industry,
      salesVAT: vatData.salesVAT.toFixed(2),
      purchaseVAT: vatData.purchaseVAT.toFixed(2),
      period: `${vatData.periodStart} to ${vatData.periodEnd}`
    })

    const response = await openai.chat.completions.create({
      model: AI_CONFIG.models.analysis,
      max_tokens: 1000,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: "You are a VAT expert specializing in industry analysis. Provide specific insights for the given business sector."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    })

    const insights = response.choices[0]?.message?.content
      ?.split('\n')
      .filter(line => line.trim().length > 0)
      .slice(0, 5) // Limit to 5 key insights

    await logAIUsage({
      feature: 'vat_analysis',
      model: AI_CONFIG.models.analysis,
      timestamp: new Date(),
      userId
    })

    return {
      success: true,
      insights: insights || []
    }

  } catch (error) {
    console.error('Industry VAT insights error:', error)
    return {
      success: false,
      error: 'Failed to generate industry insights'
    }
  }
}

/**
 * Check VAT compliance using AI
 */
export async function checkVATCompliance(
  vatData: VATCalculationInput,
  userId?: string
): Promise<{ success: boolean; complianceStatus?: string; issues?: string[]; error?: string }> {
  try {
    if (!isAIEnabled()) {
      return {
        success: false,
        error: 'AI compliance check not available'
      }
    }

    const response = await openai.chat.completions.create({
      model: AI_CONFIG.models.analysis,
      max_tokens: 1500,
      temperature: 0.1, // Very low temperature for compliance accuracy
      messages: [
        {
          role: "system",
          content: "You are an Irish Revenue compliance expert. Check VAT submissions for regulatory compliance."
        },
        {
          role: "user",
          content: VAT_ANALYSIS_PROMPTS.COMPLIANCE_CHECK
        }
      ]
    })

    const result = response.choices[0]?.message?.content || ''
    
    // Parse compliance result
    const isCompliant = !result.toLowerCase().includes('non-compliant') && 
                       !result.toLowerCase().includes('violation')
    
    const issues = result.split('\n')
      .filter(line => line.includes('•') || line.includes('-') || line.includes('*'))
      .slice(0, 5)

    return {
      success: true,
      complianceStatus: isCompliant ? 'COMPLIANT' : 'NEEDS_REVIEW',
      issues: issues.length > 0 ? issues : undefined
    }

  } catch (error) {
    console.error('VAT compliance check error:', error)
    return {
      success: false,
      error: 'Failed to check compliance'
    }
  }
}