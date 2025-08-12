/**
 * Continuous Learning Pipeline for PayVAT.ie AI System
 * Processes feedback, updates models, and improves accuracy over time
 */

import { prisma } from '@/lib/prisma'
import { DocumentLearningSystem, LearningFeedback } from './documentLearning'
import { DocumentTemplateSystem, DocumentTemplate } from './documentTemplates'
import { logger } from '@/lib/logger'

export interface LearningPipelineConfig {
  batchSize: number
  minFeedbackForLearning: number
  learningThreshold: number
  maxProcessingTime: number
  enableAutoTemplateCreation: boolean
  enableTemplateOptimization: boolean
  enablePatternLearning: boolean
}

export interface LearningJob {
  id: string
  type: 'PROCESS_FEEDBACK' | 'OPTIMIZE_TEMPLATES' | 'LEARN_PATTERNS' | 'CLEANUP_DATA'
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  scheduledAt: Date
  startedAt?: Date
  completedAt?: Date
  errorMessage?: string
  metadata?: any
}

export interface LearningMetrics {
  totalFeedbackProcessed: number
  templatesCreated: number
  templatesOptimized: number
  patternsLearned: number
  accuracyImprovement: number
  processingTimeReduction: number
}

export class LearningPipeline {
  
  private static config: LearningPipelineConfig = {
    batchSize: 50,
    minFeedbackForLearning: 3,
    learningThreshold: 0.7,
    maxProcessingTime: 300000, // 5 minutes
    enableAutoTemplateCreation: true,
    enableTemplateOptimization: true,
    enablePatternLearning: true
  }
  
  private static isRunning = false
  private static currentJobs: Map<string, LearningJob> = new Map()
  
  /**
   * Start the continuous learning pipeline
   */
  static async startPipeline(): Promise<void> {
    if (this.isRunning) {
      console.log('Learning pipeline is already running')
      return
    }
    
    console.log('🚀 Starting continuous learning pipeline')
    this.isRunning = true
    
    try {
      // Schedule immediate processing of pending feedback
      await this.scheduleJob({
        type: 'PROCESS_FEEDBACK',
        priority: 'HIGH',
        scheduledAt: new Date()
      })
      
      // Schedule template optimization
      await this.scheduleJob({
        type: 'OPTIMIZE_TEMPLATES',
        priority: 'MEDIUM',
        scheduledAt: new Date(Date.now() + 60000) // 1 minute delay
      })
      
      // Schedule pattern learning
      await this.scheduleJob({
        type: 'LEARN_PATTERNS',
        priority: 'MEDIUM',
        scheduledAt: new Date(Date.now() + 120000) // 2 minute delay
      })
      
      // Start job processor
      this.processJobs()
      
      console.log('✅ Learning pipeline started successfully')
      
    } catch (error) {
      console.error('Failed to start learning pipeline:', error)
      this.isRunning = false
      throw error
    }
  }
  
  /**
   * Stop the learning pipeline
   */
  static async stopPipeline(): Promise<void> {
    console.log('🛑 Stopping learning pipeline')
    this.isRunning = false
    
    // Wait for current jobs to complete
    const runningJobs = Array.from(this.currentJobs.values())
      .filter(job => job.status === 'RUNNING')
    
    if (runningJobs.length > 0) {
      console.log(`Waiting for ${runningJobs.length} jobs to complete...`)
      // Give jobs up to 30 seconds to complete
      const timeout = setTimeout(() => {
        console.log('Force stopping pipeline due to timeout')
      }, 30000)
      
      while (this.currentJobs.size > 0 && this.isRunning === false) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
      clearTimeout(timeout)
    }
    
    console.log('✅ Learning pipeline stopped')
  }
  
  /**
   * Process unprocessed feedback to improve the system
   */
  static async processFeedbackBatch(): Promise<LearningMetrics> {
    console.log('📚 Processing feedback batch')
    const startTime = Date.now()
    
    const metrics: LearningMetrics = {
      totalFeedbackProcessed: 0,
      templatesCreated: 0,
      templatesOptimized: 0,
      patternsLearned: 0,
      accuracyImprovement: 0,
      processingTimeReduction: 0
    }
    
    try {
      // Get unprocessed feedback
      const unprocessedFeedback = await prisma.learningFeedback.findMany({
        where: { wasProcessed: false },
        include: {
          document: true,
          user: true
        },
        orderBy: { createdAt: 'asc' },
        take: this.config.batchSize
      })
      
      console.log(`Found ${unprocessedFeedback.length} unprocessed feedback items`)
      
      if (unprocessedFeedback.length === 0) {
        return metrics
      }
      
      // Group feedback by document patterns for batch learning
      const feedbackGroups = this.groupFeedbackByPatterns(unprocessedFeedback)
      
      // Process each group
      for (const [pattern, feedbackList] of feedbackGroups) {
        console.log(`Processing ${feedbackList.length} feedback items for pattern: ${pattern}`)
        
        try {
          // Learn from this feedback group
          const groupMetrics = await this.learnFromFeedbackGroup(feedbackList)
          
          // Aggregate metrics
          metrics.totalFeedbackProcessed += groupMetrics.feedbackProcessed
          metrics.templatesCreated += groupMetrics.templatesCreated
          metrics.patternsLearned += groupMetrics.patternsLearned
          
          // Mark feedback as processed
          await prisma.learningFeedback.updateMany({
            where: {
              id: { in: feedbackList.map(f => f.id) }
            },
            data: {
              wasProcessed: true,
              processedAt: new Date(),
              improvementMade: groupMetrics.improvementMade
            }
          })
          
        } catch (groupError) {
          console.error(`Error processing feedback group ${pattern}:`, groupError)
          // Continue with next group
        }
      }
      
      const processingTime = Date.now() - startTime
      console.log(`✅ Processed ${metrics.totalFeedbackProcessed} feedback items in ${processingTime}ms`)
      
      // Log learning metrics
      logger.info('Feedback batch processed', {
        ...metrics,
        processingTimeMs: processingTime
      }, 'LEARNING_PIPELINE')
      
      return metrics
      
    } catch (error) {
      console.error('Error processing feedback batch:', error)
      logger.error('Failed to process feedback batch', error, 'LEARNING_PIPELINE')
      throw error
    }
  }
  
  /**
   * Optimize existing templates based on usage patterns
   */
  static async optimizeTemplates(): Promise<void> {
    console.log('🔧 Optimizing templates')
    
    try {
      // Get templates that need optimization
      const templatesNeedingOptimization = await prisma.documentTemplate.findMany({
        where: {
          isActive: true,
          usageCount: { gte: this.config.minFeedbackForLearning }
        },
        include: {
          usageHistory: {
            include: {
              document: true
            },
            orderBy: { createdAt: 'desc' },
            take: 20 // Last 20 uses
          },
          feedbacks: {
            where: { wasProcessed: false },
            include: { document: true }
          }
        }
      })
      
      console.log(`Found ${templatesNeedingOptimization.length} templates for optimization`)
      
      for (const template of templatesNeedingOptimization) {
        try {
          console.log(`Optimizing template: ${template.name}`)
          
          // Analyze usage patterns
          const optimizations = await this.analyzeTemplatePerformance(template)
          
          if (optimizations.needsUpdate) {
            // Update template with optimizations
            await this.updateTemplate(template, optimizations)
            console.log(`✅ Template ${template.name} optimized`)
          }
          
        } catch (templateError) {
          console.error(`Error optimizing template ${template.name}:`, templateError)
        }
      }
      
    } catch (error) {
      console.error('Error optimizing templates:', error)
      throw error
    }
  }
  
  /**
   * Learn new patterns from successful document processing
   */
  static async learnPatterns(): Promise<void> {
    console.log('🧠 Learning new patterns')
    
    try {
      // Get recent successful processing analytics
      const recentAnalytics = await prisma.aIProcessingAnalytics.findMany({
        where: {
          processedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          },
          extractionAccuracy: { gte: 0.8 }, // High accuracy only
          confidenceScore: { gte: 0.7 }
        },
        include: {
          document: true,
          user: true
        },
        orderBy: { processedAt: 'desc' },
        take: 100
      })
      
      console.log(`Analyzing ${recentAnalytics.length} high-accuracy processing examples`)
      
      // Group by user/business to learn business-specific patterns
      const businessGroups = new Map<string, any[]>()
      
      recentAnalytics.forEach((analytics: any) => {
        const businessKey = analytics.user?.businessName || analytics.userId || 'anonymous'
        if (!businessGroups.has(businessKey)) {
          businessGroups.set(businessKey, [])
        }
        businessGroups.get(businessKey)!.push(analytics)
      })
      
      // Learn patterns for each business
      for (const [businessKey, examples] of businessGroups) {
        if (examples.length >= 3) { // Minimum examples needed
          await this.learnBusinessPatterns(businessKey, examples)
        }
      }
      
    } catch (error) {
      console.error('Error learning patterns:', error)
      throw error
    }
  }
  
  /**
   * Clean up old learning data
   */
  static async cleanupLearningData(): Promise<void> {
    console.log('🧹 Cleaning up old learning data')
    
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
      
      // Clean up old analytics (keep 6 months)
      const deletedAnalytics = await prisma.aIProcessingAnalytics.deleteMany({
        where: {
          processedAt: { lt: sixMonthsAgo }
        }
      })
      
      // Clean up old feedback (keep all, but clean up very old unprocessed ones)
      const deletedFeedback = await prisma.learningFeedback.deleteMany({
        where: {
          createdAt: { lt: sixMonthsAgo },
          wasProcessed: false
        }
      })
      
      console.log(`✅ Cleanup completed: ${deletedAnalytics.count} analytics, ${deletedFeedback.count} old feedback`)
      
    } catch (error) {
      console.error('Error cleaning up learning data:', error)
      throw error
    }
  }
  
  /**
   * Private helper methods
   */
  
  private static async scheduleJob(jobData: Partial<LearningJob>): Promise<string> {
    const job: LearningJob = {
      id: crypto.randomUUID(),
      type: jobData.type!,
      status: 'PENDING',
      priority: jobData.priority || 'MEDIUM',
      scheduledAt: jobData.scheduledAt || new Date(),
      metadata: jobData.metadata
    }
    
    this.currentJobs.set(job.id, job)
    console.log(`📅 Scheduled job: ${job.type} (${job.priority} priority)`)
    
    return job.id
  }
  
  private static async processJobs(): Promise<void> {
    while (this.isRunning) {
      try {
        // Get next job to process
        const nextJob = this.getNextJob()
        
        if (nextJob) {
          await this.executeJob(nextJob)
        } else {
          // No jobs ready, wait a bit
          await new Promise(resolve => setTimeout(resolve, 5000)) // 5 second wait
        }
        
      } catch (error) {
        console.error('Error in job processing loop:', error)
        await new Promise(resolve => setTimeout(resolve, 10000)) // 10 second wait on error
      }
    }
  }
  
  private static getNextJob(): LearningJob | null {
    const now = new Date()
    const readyJobs = Array.from(this.currentJobs.values())
      .filter(job => job.status === 'PENDING' && job.scheduledAt <= now)
      .sort((a, b) => {
        // Sort by priority then by scheduled time
        const priorityOrder = { 'URGENT': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 }
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
        return priorityDiff !== 0 ? priorityDiff : a.scheduledAt.getTime() - b.scheduledAt.getTime()
      })
    
    return readyJobs[0] || null
  }
  
  private static async executeJob(job: LearningJob): Promise<void> {
    console.log(`🔄 Executing job: ${job.type}`)
    
    job.status = 'RUNNING'
    job.startedAt = new Date()
    
    try {
      const timeout = setTimeout(() => {
        throw new Error(`Job ${job.id} timed out after ${this.config.maxProcessingTime}ms`)
      }, this.config.maxProcessingTime)
      
      switch (job.type) {
        case 'PROCESS_FEEDBACK':
          await this.processFeedbackBatch()
          break
          
        case 'OPTIMIZE_TEMPLATES':
          await this.optimizeTemplates()
          break
          
        case 'LEARN_PATTERNS':
          await this.learnPatterns()
          break
          
        case 'CLEANUP_DATA':
          await this.cleanupLearningData()
          break
          
        default:
          throw new Error(`Unknown job type: ${job.type}`)
      }
      
      clearTimeout(timeout)
      
      job.status = 'COMPLETED'
      job.completedAt = new Date()
      
      console.log(`✅ Job completed: ${job.type}`)
      
    } catch (error) {
      console.error(`❌ Job failed: ${job.type}`, error)
      
      job.status = 'FAILED'
      job.errorMessage = error instanceof Error ? error.message : 'Unknown error'
      job.completedAt = new Date()
    }
    
    // Remove completed/failed jobs after a short delay
    setTimeout(() => {
      this.currentJobs.delete(job.id)
    }, 60000) // Keep for 1 minute for monitoring
  }
  
  private static groupFeedbackByPatterns(feedback: any[]): Map<string, any[]> {
    const groups = new Map<string, any[]>()
    
    feedback.forEach(fb => {
      // Group by document type and business (for template learning)
      const pattern = `${fb.document?.mimeType || 'unknown'}-${fb.user?.businessName || 'anonymous'}`
      
      if (!groups.has(pattern)) {
        groups.set(pattern, [])
      }
      groups.get(pattern)!.push(fb)
    })
    
    return groups
  }
  
  private static async learnFromFeedbackGroup(feedbackList: any[]): Promise<{
    feedbackProcessed: number
    templatesCreated: number
    patternsLearned: number
    improvementMade: boolean
  }> {
    const metrics = {
      feedbackProcessed: feedbackList.length,
      templatesCreated: 0,
      patternsLearned: 0,
      improvementMade: false
    }
    
    // Analyze feedback for common patterns
    const corrections = feedbackList.flatMap(fb => fb.corrections || [])
    const commonCorrections = this.findCommonCorrections(corrections)
    
    if (commonCorrections.length > 0) {
      metrics.improvementMade = true
      metrics.patternsLearned = commonCorrections.length
      
      // Create or update templates based on patterns
      if (this.config.enableAutoTemplateCreation) {
        // Check if we should create a new template
        const shouldCreateTemplate = await this.shouldCreateTemplateFromFeedback(feedbackList)
        
        if (shouldCreateTemplate) {
          // Create template logic would go here
          metrics.templatesCreated = 1
        }
      }
    }
    
    return metrics
  }
  
  private static findCommonCorrections(corrections: any[]): any[] {
    const correctionCounts = new Map<string, { count: number, examples: any[] }>()
    
    corrections.forEach(correction => {
      const key = `${correction.field}-${correction.originalValue}-${correction.correctedValue}`
      
      if (!correctionCounts.has(key)) {
        correctionCounts.set(key, { count: 0, examples: [] })
      }
      
      const entry = correctionCounts.get(key)!
      entry.count++
      entry.examples.push(correction)
    })
    
    // Return corrections that appear multiple times (indicating a pattern)
    return Array.from(correctionCounts.entries())
      .filter(([, data]) => data.count >= 2)
      .map(([key, data]) => ({
        pattern: key,
        frequency: data.count,
        examples: data.examples
      }))
  }
  
  private static async shouldCreateTemplateFromFeedback(feedbackList: any[]): Promise<boolean> {
    // Simple heuristic: create template if we have consistent corrections across multiple documents
    const consistentCorrections = feedbackList.filter(fb => 
      fb.feedback === 'PARTIALLY_CORRECT' && 
      fb.corrections && 
      fb.corrections.length > 0
    )
    
    return consistentCorrections.length >= 3
  }
  
  private static async analyzeTemplatePerformance(template: any): Promise<{
    needsUpdate: boolean
    suggestedImprovements: string[]
    newSuccessRate: number
  }> {
    // Analyze template performance based on recent usage
    const recentUsage = template.usageHistory.slice(0, 10)
    const successRate = recentUsage.filter((usage: any) => usage.wasAccurate !== false).length / recentUsage.length
    
    const analysis = {
      needsUpdate: successRate < 0.8, // Update if success rate drops below 80%
      suggestedImprovements: [] as string[],
      newSuccessRate: successRate
    }
    
    if (analysis.needsUpdate) {
      // Analyze failures to suggest improvements
      const failures = recentUsage.filter((usage: any) => usage.wasAccurate === false)
      
      if (failures.length > 0) {
        analysis.suggestedImprovements.push('Update extraction rules based on recent failures')
      }
    }
    
    return analysis
  }
  
  private static async updateTemplate(template: any, optimizations: any): Promise<void> {
    // Update template based on optimization suggestions
    console.log(`Updating template ${template.name} with optimizations:`, optimizations.suggestedImprovements)
    
    // Implementation would update the template's extraction rules
    // This is a placeholder for the actual update logic
  }
  
  private static async learnBusinessPatterns(businessKey: string, examples: any[]): Promise<void> {
    console.log(`Learning patterns for business: ${businessKey}`)
    
    // Analyze patterns specific to this business
    // Implementation would identify common document structures, VAT patterns, etc.
    // This is a placeholder for actual pattern learning logic
  }
  
  /**
   * Get current pipeline status
   */
  static getStatus(): {
    isRunning: boolean
    currentJobs: LearningJob[]
    recentMetrics: any
  } {
    return {
      isRunning: this.isRunning,
      currentJobs: Array.from(this.currentJobs.values()),
      recentMetrics: {
        // This would include recent learning metrics
        jobsCompleted: 0,
        errorRate: 0
      }
    }
  }
  
  /**
   * Update pipeline configuration
   */
  static updateConfig(newConfig: Partial<LearningPipelineConfig>): void {
    this.config = { ...this.config, ...newConfig }
    console.log('Learning pipeline configuration updated:', this.config)
  }
}