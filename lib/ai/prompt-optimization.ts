/**
 * AI Prompt Optimization and A/B Testing System
 * Allows testing different prompt variations to improve extraction accuracy
 */

import { prisma } from '@/lib/prisma'
import { logInfo, logError } from '@/lib/secure-logger'

export interface PromptVariation {
  id: string
  name: string
  description: string
  promptText: string
  category: 'VAT_EXTRACTION' | 'IRISH_VAT_OPTIMIZED' | 'CLEAN_VAT_EXTRACTION' | 'BUSINESS_DETAILS'
  isActive: boolean
  weight: number // 0-1, for weighted random selection
  version: number
  createdAt: Date
  updatedAt: Date
}

export interface PromptTest {
  id: string
  variationId: string
  documentId: string
  userId?: string
  confidence: number
  accuracy?: number // Set after user feedback
  extractionSuccess: boolean
  processingTime: number
  errorMessage?: string
  testContext: {
    documentType: string
    fileSize: number
    originalPromptId?: string
  }
  createdAt: Date
}

export interface PromptPerformanceMetrics {
  variationId: string
  variationName: string
  totalTests: number
  averageConfidence: number
  averageAccuracy: number
  successRate: number
  averageProcessingTime: number
  errorRate: number
  improvementOverBaseline: number
  recommendedAction: 'PROMOTE' | 'CONTINUE_TESTING' | 'DEPRECATE'
}

export interface ABTestConfig {
  testName: string
  category: string
  variations: string[] // Variation IDs to test
  trafficSplit: Record<string, number> // variationId -> percentage
  minSampleSize: number
  maxDuration: number // days
  confidenceLevel: number // 0.95 for 95% confidence
  isActive: boolean
}

export class PromptOptimizer {
  
  /**
   * Create a new prompt variation for testing
   */
  static async createPromptVariation(variation: Omit<PromptVariation, 'id' | 'createdAt' | 'updatedAt'>): Promise<PromptVariation> {
    try {
      const newVariation: PromptVariation = {
        ...variation,
        id: this.generateVariationId(),
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Store in database (mocked for now)
      logInfo('Created new prompt variation', {
        variationId: newVariation.id,
        name: newVariation.name,
        category: newVariation.category,
        operation: 'prompt-variation-created'
      })

      return newVariation
    } catch (error) {
      logError('Failed to create prompt variation', { error: error.message })
      throw error
    }
  }

  /**
   * Select the best prompt variation for a given context
   */
  static async selectPromptVariation(
    category: string,
    context: {
      documentType?: string
      userId?: string
      isTestMode?: boolean
    }
  ): Promise<{ variation: PromptVariation, isTestVariation: boolean }> {
    try {
      // Get active variations for category
      const variations = await this.getActiveVariations(category)
      
      if (variations.length === 0) {
        throw new Error(`No active variations found for category: ${category}`)
      }

      // Check if there's an active A/B test
      const activeTest = await this.getActiveTest(category)
      
      if (activeTest && context.isTestMode !== false) {
        // Select variation based on A/B test configuration
        const testVariation = this.selectTestVariation(variations, activeTest)
        return { variation: testVariation, isTestVariation: true }
      }

      // Select best performing variation
      const bestVariation = await this.selectBestVariation(variations, context)
      return { variation: bestVariation, isTestVariation: false }

    } catch (error) {
      logError('Failed to select prompt variation', { 
        category, 
        context, 
        error: error.message 
      })
      
      // Fallback to default prompt
      return { 
        variation: this.getDefaultVariation(category), 
        isTestVariation: false 
      }
    }
  }

  /**
   * Record the results of using a prompt variation
   */
  static async recordPromptTest(test: Omit<PromptTest, 'id' | 'createdAt'>): Promise<void> {
    try {
      const promptTest: PromptTest = {
        ...test,
        id: this.generateTestId(),
        createdAt: new Date()
      }

      // Store test results (would use database in production)
      logInfo('Recorded prompt test results', {
        testId: promptTest.id,
        variationId: promptTest.variationId,
        confidence: promptTest.confidence,
        success: promptTest.extractionSuccess,
        processingTime: promptTest.processingTime,
        operation: 'prompt-test-recorded'
      })

      // Update variation performance metrics
      await this.updateVariationMetrics(test.variationId, promptTest)

    } catch (error) {
      logError('Failed to record prompt test', { error: error.message })
    }
  }

  /**
   * Get performance metrics for all variations
   */
  static async getVariationMetrics(category?: string, timeRange: 'day' | 'week' | 'month' = 'week'): Promise<PromptPerformanceMetrics[]> {
    try {
      const variations = category ? 
        await this.getVariationsByCategory(category) : 
        await this.getAllVariations()
      
      const metrics: PromptPerformanceMetrics[] = []
      
      for (const variation of variations) {
        const variationMetrics = await this.calculateVariationMetrics(variation.id, timeRange)
        metrics.push(variationMetrics)
      }

      // Sort by improvement over baseline
      return metrics.sort((a, b) => b.improvementOverBaseline - a.improvementOverBaseline)

    } catch (error) {
      logError('Failed to get variation metrics', { error: error.message })
      return []
    }
  }

  /**
   * Start a new A/B test
   */
  static async startABTest(config: ABTestConfig): Promise<void> {
    try {
      // Validate test configuration
      this.validateTestConfig(config)
      
      // Store test configuration
      logInfo('Starting A/B test', {
        testName: config.testName,
        category: config.category,
        variations: config.variations,
        trafficSplit: config.trafficSplit,
        operation: 'ab-test-started'
      })

      // In production, this would store the config in database
      console.log(`🧪 A/B Test Started: ${config.testName}`)
      console.log(`   📊 Testing ${config.variations.length} variations`)
      console.log(`   🎯 Category: ${config.category}`)
      console.log(`   📈 Traffic Split: ${JSON.stringify(config.trafficSplit)}`)

    } catch (error) {
      logError('Failed to start A/B test', { config, error: error.message })
      throw error
    }
  }

  /**
   * Analyze A/B test results and make recommendations
   */
  static async analyzeABTest(testName: string): Promise<{
    winner?: string
    results: PromptPerformanceMetrics[]
    recommendation: string
    significanceLevel: number
  }> {
    try {
      const testConfig = await this.getTestConfig(testName)
      if (!testConfig) {
        throw new Error(`Test not found: ${testName}`)
      }

      const results = await Promise.all(
        testConfig.variations.map(varId => this.calculateVariationMetrics(varId, 'week'))
      )

      // Perform statistical analysis
      const analysis = this.performStatisticalAnalysis(results, testConfig.confidenceLevel)
      
      logInfo('A/B test analysis complete', {
        testName,
        winner: analysis.winner,
        significanceLevel: analysis.significanceLevel,
        operation: 'ab-test-analyzed'
      })

      return analysis

    } catch (error) {
      logError('Failed to analyze A/B test', { testName, error: error.message })
      throw error
    }
  }

  /**
   * Get optimized prompts based on performance data
   */
  static async getOptimizedPrompts(): Promise<{
    category: string
    currentBest: PromptVariation
    improvements: string[]
    suggestedChanges: string[]
  }[]> {
    try {
      const categories = ['VAT_EXTRACTION', 'IRISH_VAT_OPTIMIZED', 'CLEAN_VAT_EXTRACTION', 'BUSINESS_DETAILS']
      const optimizations: any[] = []

      for (const category of categories) {
        const metrics = await this.getVariationMetrics(category)
        if (metrics.length > 0) {
          const bestMetrics = metrics[0]
          const variation = await this.getVariationById(bestMetrics.variationId)
          
          if (variation) {
            const improvements = this.generateImprovementSuggestions(bestMetrics)
            optimizations.push({
              category,
              currentBest: variation,
              improvements: improvements.accomplishments,
              suggestedChanges: improvements.suggestions
            })
          }
        }
      }

      return optimizations

    } catch (error) {
      logError('Failed to get optimized prompts', { error: error.message })
      return []
    }
  }

  // Private helper methods

  private static generateVariationId(): string {
    return `var_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private static generateTestId(): string {
    return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private static async getActiveVariations(category: string): Promise<PromptVariation[]> {
    // Mock data - in production, this would query the database
    return [
      {
        id: 'var_vat_baseline',
        name: 'VAT Extraction Baseline',
        description: 'Original VAT extraction prompt',
        promptText: this.getBaselinePrompt(category),
        category: category as any,
        isActive: true,
        weight: 0.7,
        version: 1,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: 'var_vat_enhanced',
        name: 'Enhanced VAT Extraction',
        description: 'Improved prompt with better context understanding',
        promptText: this.getEnhancedPrompt(category),
        category: category as any,
        isActive: true,
        weight: 0.3,
        version: 2,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01')
      }
    ]
  }

  private static async getActiveTest(category: string): Promise<ABTestConfig | null> {
    // Mock - would check database for active tests
    return null
  }

  private static selectTestVariation(variations: PromptVariation[], test: ABTestConfig): PromptVariation {
    // Weighted random selection based on traffic split
    const random = Math.random()
    let cumulative = 0
    
    for (const [varId, percentage] of Object.entries(test.trafficSplit)) {
      cumulative += percentage / 100
      if (random <= cumulative) {
        return variations.find(v => v.id === varId) || variations[0]
      }
    }
    
    return variations[0]
  }

  private static async selectBestVariation(variations: PromptVariation[], context: any): Promise<PromptVariation> {
    // Select based on weighted performance
    const performanceScores = await Promise.all(
      variations.map(async v => ({
        variation: v,
        score: await this.calculateVariationScore(v.id)
      }))
    )
    
    performanceScores.sort((a, b) => b.score - a.score)
    return performanceScores[0].variation
  }

  private static getDefaultVariation(category: string): PromptVariation {
    return {
      id: 'var_default',
      name: 'Default Prompt',
      description: 'Fallback default prompt',
      promptText: this.getBaselinePrompt(category),
      category: category as any,
      isActive: true,
      weight: 1.0,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  private static async updateVariationMetrics(variationId: string, test: PromptTest): Promise<void> {
    // Update running averages and metrics
    logInfo('Updated variation metrics', {
      variationId,
      confidence: test.confidence,
      success: test.extractionSuccess,
      operation: 'metrics-updated'
    })
  }

  private static async getVariationsByCategory(category: string): Promise<PromptVariation[]> {
    return this.getActiveVariations(category)
  }

  private static async getAllVariations(): Promise<PromptVariation[]> {
    const categories = ['VAT_EXTRACTION', 'IRISH_VAT_OPTIMIZED', 'CLEAN_VAT_EXTRACTION', 'BUSINESS_DETAILS']
    const allVariations: PromptVariation[] = []
    
    for (const category of categories) {
      const variations = await this.getActiveVariations(category)
      allVariations.push(...variations)
    }
    
    return allVariations
  }

  private static async calculateVariationMetrics(variationId: string, timeRange: string): Promise<PromptPerformanceMetrics> {
    // Mock metrics calculation
    const baseSuccess = 0.75 + Math.random() * 0.2
    const baseConfidence = 0.8 + Math.random() * 0.15
    
    return {
      variationId,
      variationName: `Variation ${variationId.slice(-4)}`,
      totalTests: Math.floor(50 + Math.random() * 200),
      averageConfidence: baseConfidence,
      averageAccuracy: baseSuccess,
      successRate: baseSuccess * 100,
      averageProcessingTime: 2000 + Math.random() * 1000,
      errorRate: (1 - baseSuccess) * 100,
      improvementOverBaseline: (baseSuccess - 0.75) * 100,
      recommendedAction: baseSuccess > 0.85 ? 'PROMOTE' : baseSuccess > 0.75 ? 'CONTINUE_TESTING' : 'DEPRECATE'
    }
  }

  private static async calculateVariationScore(variationId: string): Promise<number> {
    const metrics = await this.calculateVariationMetrics(variationId, 'week')
    
    // Weighted score combining accuracy, confidence, and speed
    return (
      metrics.averageAccuracy * 0.4 +
      metrics.averageConfidence * 100 * 0.3 +
      (3000 / metrics.averageProcessingTime) * 100 * 0.2 +
      (100 - metrics.errorRate) * 0.1
    )
  }

  private static validateTestConfig(config: ABTestConfig): void {
    if (!config.testName || !config.category || !config.variations || config.variations.length < 2) {
      throw new Error('Invalid test configuration')
    }
    
    const totalPercentage = Object.values(config.trafficSplit).reduce((sum, pct) => sum + pct, 0)
    if (Math.abs(totalPercentage - 100) > 0.01) {
      throw new Error('Traffic split must total 100%')
    }
  }

  private static async getTestConfig(testName: string): Promise<ABTestConfig | null> {
    // Mock - would fetch from database
    return null
  }

  private static async getVariationById(variationId: string): Promise<PromptVariation | null> {
    const allVariations = await this.getAllVariations()
    return allVariations.find(v => v.id === variationId) || null
  }

  private static performStatisticalAnalysis(results: PromptPerformanceMetrics[], confidenceLevel: number): {
    winner?: string
    results: PromptPerformanceMetrics[]
    recommendation: string
    significanceLevel: number
  } {
    // Simple analysis - in production would use proper statistical tests
    const sortedResults = results.sort((a, b) => b.averageAccuracy - a.averageAccuracy)
    const best = sortedResults[0]
    const second = sortedResults[1]
    
    const improvementGap = best.averageAccuracy - (second?.averageAccuracy || 0)
    const isSignificant = improvementGap > 0.05 && best.totalTests > 30
    
    return {
      winner: isSignificant ? best.variationId : undefined,
      results: sortedResults,
      recommendation: isSignificant ? 
        `Promote ${best.variationName} as it shows ${improvementGap.toFixed(3)} improvement` :
        'Continue testing - no statistically significant winner yet',
      significanceLevel: isSignificant ? 0.95 : 0.5
    }
  }

  private static generateImprovementSuggestions(metrics: PromptPerformanceMetrics): {
    accomplishments: string[]
    suggestions: string[]
  } {
    const accomplishments: string[] = []
    const suggestions: string[] = []
    
    if (metrics.averageAccuracy > 0.9) {
      accomplishments.push('Excellent accuracy rate achieved')
    } else if (metrics.averageAccuracy > 0.8) {
      accomplishments.push('Good accuracy rate')
      suggestions.push('Focus on edge cases to improve accuracy further')
    } else {
      suggestions.push('Significant accuracy improvements needed')
    }
    
    if (metrics.averageProcessingTime < 2000) {
      accomplishments.push('Fast processing times')
    } else if (metrics.averageProcessingTime > 3000) {
      suggestions.push('Optimize prompt for faster processing')
    }
    
    if (metrics.errorRate < 5) {
      accomplishments.push('Low error rate')
    } else {
      suggestions.push('Reduce error rate with better error handling')
    }
    
    return { accomplishments, suggestions }
  }

  private static getBaselinePrompt(category: string): string {
    // Return baseline prompts for different categories
    switch (category) {
      case 'VAT_EXTRACTION':
        return 'Extract VAT amounts from this document. Focus on Irish VAT compliance.'
      case 'IRISH_VAT_OPTIMIZED':
        return 'Extract VAT data optimized for Irish businesses and tax rates.'
      case 'CLEAN_VAT_EXTRACTION':
        return 'Extract VAT data with high accuracy, especially from OCR text.'
      case 'BUSINESS_DETAILS':
        return 'Extract business information including VAT numbers and addresses.'
      default:
        return 'Extract relevant information from this document.'
    }
  }

  private static getEnhancedPrompt(category: string): string {
    // Return enhanced prompts with better context
    switch (category) {
      case 'VAT_EXTRACTION':
        return 'Carefully extract VAT amounts from this document, paying special attention to Irish VAT categories (STD23, RED13.5, TOU9, MIN). Consider document context and business type.'
      case 'IRISH_VAT_OPTIMIZED':
        return 'Extract VAT data specifically for Irish businesses. Recognize Irish VAT number formats (IE + 7 digits + letters) and standard Irish VAT rates (23%, 13.5%, 9%).'
      case 'CLEAN_VAT_EXTRACTION':
        return 'Extract VAT data with maximum accuracy. Handle OCR errors, currency formatting variations, and multiple VAT rates within documents.'
      case 'BUSINESS_DETAILS':
        return 'Extract comprehensive business information: company name, VAT number (especially Irish IE format), business address, invoice date, and contact details.'
      default:
        return 'Comprehensively extract relevant information with high accuracy and attention to detail.'
    }
  }
}

// Export for use in other modules
export { PromptOptimizer as default }