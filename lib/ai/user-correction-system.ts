/**
 * User Correction & AI Training System
 * Allows users to correct VAT extractions and trains AI to improve accuracy
 */

// Import Prisma client
import { prisma } from '@/lib/prisma'

// User correction data structures
export interface VATCorrection {
  id: string
  documentId: string
  originalExtraction: {
    salesVAT: number[]
    purchaseVAT: number[]
    confidence: number
    extractionMethod: string
  }
  correctedExtraction: {
    salesVAT: number[]
    purchaseVAT: number[]
    confidence: number
    notes?: string
  }
  correctionReason: 'WRONG_AMOUNT' | 'WRONG_CATEGORY' | 'MISSING_VAT' | 'DUPLICATE_VAT' | 'OTHER'
  userFeedback: string
  documentText?: string
  documentType: string
  fileName: string
  userId: string
  timestamp: Date
  validated: boolean
  usedForTraining: boolean
}

export interface TrainingPattern {
  id: string
  documentType: string
  textPattern: string
  extractionPattern: string
  confidenceScore: number
  successRate: number
  totalAttempts: number
  lastUsed: Date
  createdFromCorrections: string[] // Array of correction IDs
}

export interface ConfidenceCalibration {
  documentType: string
  extractionMethod: string
  predictedConfidence: number
  actualAccuracy: number
  sampleSize: number
  calibrationFactor: number
}

export class UserCorrectionSystem {
  
  /**
   * Submit a user correction for a document
   */
  async submitCorrection(correction: Omit<VATCorrection, 'id' | 'timestamp' | 'validated' | 'usedForTraining'>): Promise<VATCorrection> {
    const correctionRecord: VATCorrection = {
      ...correction,
      id: `correction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      validated: false,
      usedForTraining: false
    }

    console.log(`📝 User correction submitted for document: ${correction.fileName}`)
    console.log(`   Original: Sales €${correction.originalExtraction.salesVAT.join(', €')}, Purchase €${correction.originalExtraction.purchaseVAT.join(', €')}`)
    console.log(`   Corrected: Sales €${correction.correctedExtraction.salesVAT.join(', €')}, Purchase €${correction.correctedExtraction.purchaseVAT.join(', €')}`)
    console.log(`   Reason: ${correction.correctionReason}`)

    // Store correction (in production, save to database)
    await this.saveCorrection(correctionRecord)

    // Immediately update confidence calibration
    await this.updateConfidenceCalibration(correctionRecord)

    // Extract patterns from successful corrections
    await this.extractTrainingPatterns(correctionRecord)

    // Trigger retraining if we have enough corrections
    await this.checkAndTriggerRetraining()

    return correctionRecord
  }

  /**
   * Get all corrections for analysis
   */
  async getCorrections(filters?: {
    documentType?: string
    userId?: string
    correctionReason?: string
    dateRange?: { start: Date, end: Date }
  }): Promise<VATCorrection[]> {
    // In production, implement proper database filtering
    const corrections = await this.loadStoredCorrections()
    
    return corrections.filter(correction => {
      if (filters?.documentType && correction.documentType !== filters.documentType) return false
      if (filters?.userId && correction.userId !== filters.userId) return false
      if (filters?.correctionReason && correction.correctionReason !== filters.correctionReason) return false
      if (filters?.dateRange) {
        const correctionDate = correction.timestamp
        if (correctionDate < filters.dateRange.start || correctionDate > filters.dateRange.end) return false
      }
      return true
    })
  }

  /**
   * Generate training data from corrections
   */
  async generateTrainingData(): Promise<{
    patterns: TrainingPattern[]
    calibration: ConfidenceCalibration[]
    trainingExamples: Array<{
      input: string
      expectedOutput: {
        salesVAT: number[]
        purchaseVAT: number[]
      }
      documentType: string
    }>
  }> {
    const corrections = await this.loadStoredCorrections()
    const patterns: TrainingPattern[] = []
    const calibrationData: Map<string, ConfidenceCalibration> = new Map()
    const trainingExamples: any[] = []

    // Process corrections to extract patterns
    for (const correction of corrections) {
      // Create training examples
      if (correction.documentText) {
        trainingExamples.push({
          input: correction.documentText,
          expectedOutput: {
            salesVAT: correction.correctedExtraction.salesVAT,
            purchaseVAT: correction.correctedExtraction.purchaseVAT
          },
          documentType: correction.documentType
        })
      }

      // Update confidence calibration data
      const calibrationKey = `${correction.documentType}_${correction.originalExtraction.extractionMethod}`
      const existing = calibrationData.get(calibrationKey)
      
      if (existing) {
        existing.sampleSize++
        // Calculate actual accuracy based on correction
        const wasAccurate = this.calculateAccuracy(correction)
        existing.actualAccuracy = (existing.actualAccuracy * (existing.sampleSize - 1) + wasAccurate) / existing.sampleSize
        existing.calibrationFactor = existing.actualAccuracy / existing.predictedConfidence
      } else {
        calibrationData.set(calibrationKey, {
          documentType: correction.documentType,
          extractionMethod: correction.originalExtraction.extractionMethod,
          predictedConfidence: correction.originalExtraction.confidence,
          actualAccuracy: this.calculateAccuracy(correction),
          sampleSize: 1,
          calibrationFactor: 1.0
        })
      }
    }

    return {
      patterns,
      calibration: Array.from(calibrationData.values()),
      trainingExamples
    }
  }

  /**
   * Apply corrections to improve future extractions
   */
  async applyLearnings(documentText: string, documentType: string, currentExtraction: any): Promise<{
    improvedExtraction: any
    confidenceAdjustment: number
    appliedPatterns: string[]
  }> {
    const patterns = await this.getRelevantPatterns(documentType, documentText)
    const calibration = await this.getConfidenceCalibration(documentType, currentExtraction.extractionMethod)
    
    let improvedExtraction = { ...currentExtraction }
    let confidenceAdjustment = 1.0
    const appliedPatterns: string[] = []

    // Apply learned patterns
    for (const pattern of patterns) {
      if (this.matchesPattern(documentText, pattern)) {
        // Apply pattern adjustments
        improvedExtraction = this.applyPatternAdjustments(improvedExtraction, pattern)
        appliedPatterns.push(pattern.id)
        console.log(`📚 Applied learned pattern: ${pattern.textPattern}`)
      }
    }

    // Apply confidence calibration
    if (calibration) {
      confidenceAdjustment = calibration.calibrationFactor
      improvedExtraction.confidence = Math.min(improvedExtraction.confidence * confidenceAdjustment, 1.0)
      console.log(`🎯 Confidence calibrated: ${currentExtraction.confidence} → ${improvedExtraction.confidence}`)
    }

    return {
      improvedExtraction,
      confidenceAdjustment,
      appliedPatterns
    }
  }

  /**
   * Get correction statistics for monitoring
   */
  async getCorrectionStats(): Promise<{
    totalCorrections: number
    correctionsByType: Record<string, number>
    correctionsByReason: Record<string, number>
    averageConfidenceImprovement: number
    mostCommonIssues: Array<{ issue: string, count: number }>
    learningProgress: {
      patternsDiscovered: number
      confidenceCalibrations: number
      retrainingTriggers: number
    }
  }> {
    const corrections = await this.loadStoredCorrections()
    
    const stats = {
      totalCorrections: corrections.length,
      correctionsByType: {} as Record<string, number>,
      correctionsByReason: {} as Record<string, number>,
      averageConfidenceImprovement: 0,
      mostCommonIssues: [] as Array<{ issue: string, count: number }>,
      learningProgress: {
        patternsDiscovered: 0,
        confidenceCalibrations: 0,
        retrainingTriggers: 0
      }
    }

    // Calculate statistics
    corrections.forEach(correction => {
      stats.correctionsByType[correction.documentType] = (stats.correctionsByType[correction.documentType] || 0) + 1
      stats.correctionsByReason[correction.correctionReason] = (stats.correctionsByReason[correction.correctionReason] || 0) + 1
    })

    // Calculate average confidence improvement
    const confidenceImprovements = corrections.map(c => 
      c.correctedExtraction.confidence - c.originalExtraction.confidence
    )
    stats.averageConfidenceImprovement = confidenceImprovements.reduce((a, b) => a + b, 0) / corrections.length

    // Find most common issues
    const issueCount = corrections.reduce((acc, correction) => {
      const issue = correction.userFeedback
      acc[issue] = (acc[issue] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    stats.mostCommonIssues = Object.entries(issueCount)
      .map(([issue, count]) => ({ issue, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return stats
  }

  // Private helper methods

  private async saveCorrection(correction: VATCorrection): Promise<void> {
    console.log(`💾 Saving correction ${correction.id} to database`)
    
    try {
      // Save to database using LearningFeedback table
      await prisma.learningFeedback.create({
        data: {
          documentId: correction.documentId,
          userId: correction.userId === 'anonymous' ? 'anonymous' : correction.userId,
          originalExtraction: {
            salesVAT: correction.originalExtraction.salesVAT,
            purchaseVAT: correction.originalExtraction.purchaseVAT,
            confidence: correction.originalExtraction.confidence,
            extractionMethod: correction.originalExtraction.extractionMethod
          },
          correctedExtraction: {
            salesVAT: correction.correctedExtraction.salesVAT,
            purchaseVAT: correction.correctedExtraction.purchaseVAT,
            confidence: correction.correctedExtraction.confidence,
            notes: correction.correctedExtraction.notes
          },
          feedback: this.mapCorrectionReasonToFeedback(correction.correctionReason),
          corrections: [{
            field: 'vatData.amounts',
            originalValue: {
              salesVAT: correction.originalExtraction.salesVAT,
              purchaseVAT: correction.originalExtraction.purchaseVAT
            },
            correctedValue: {
              salesVAT: correction.correctedExtraction.salesVAT,
              purchaseVAT: correction.correctedExtraction.purchaseVAT
            },
            confidence: correction.correctedExtraction.confidence
          }],
          confidenceScore: correction.correctedExtraction.confidence,
          notes: correction.userFeedback,
          wasProcessed: false,
          improvementMade: false
        }
      })

      // Also create an audit log
      await prisma.auditLog.create({
        data: {
          userId: correction.userId,
          action: 'VAT_CORRECTION_SUBMITTED',
          entityType: 'DOCUMENT',
          entityId: correction.documentId,
          ipAddress: 'system',
          userAgent: 'user-correction-system',
          metadata: {
            correctionId: correction.id,
            correctionReason: correction.correctionReason,
            documentType: correction.documentType,
            fileName: correction.fileName,
            originalAmounts: {
              salesVAT: correction.originalExtraction.salesVAT,
              purchaseVAT: correction.originalExtraction.purchaseVAT
            },
            correctedAmounts: {
              salesVAT: correction.correctedExtraction.salesVAT,
              purchaseVAT: correction.correctedExtraction.purchaseVAT
            },
            timestamp: correction.timestamp.toISOString()
          }
        }
      })

      console.log(`✅ Correction ${correction.id} saved to database successfully`)
    } catch (error) {
      console.error('Error saving correction to database:', error)
      // Fallback to file system for reliability
      try {
        const fs = require('fs').promises
        const path = `/tmp/corrections/${correction.id}.json`
        await fs.mkdir('/tmp/corrections', { recursive: true })
        await fs.writeFile(path, JSON.stringify(correction, null, 2))
        console.log(`📁 Correction ${correction.id} saved to fallback file system`)
      } catch (fileError) {
        console.error('Error saving correction to file system:', fileError)
      }
    }
  }

  private mapCorrectionReasonToFeedback(reason: string): 'CORRECT' | 'INCORRECT' | 'PARTIALLY_CORRECT' {
    switch (reason) {
      case 'WRONG_AMOUNT':
      case 'MISSING_VAT':
        return 'INCORRECT'
      case 'WRONG_CATEGORY':
      case 'DUPLICATE_VAT':
        return 'PARTIALLY_CORRECT'
      default:
        return 'PARTIALLY_CORRECT'
    }
  }

  private async loadStoredCorrections(): Promise<VATCorrection[]> {
    try {
      // Load from database
      const feedbacks = await prisma.learningFeedback.findMany({
        where: {
          corrections: {
            path: '[0].field',
            equals: 'vatData.amounts'
          }
        },
        include: {
          document: {
            select: {
              originalName: true,
              category: true,
              scanResult: true
            }
          },
          user: {
            select: {
              id: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      // Convert database records to VATCorrection format
      const corrections: VATCorrection[] = feedbacks.map(feedback => {
        const originalExtraction = feedback.originalExtraction as any
        const correctedExtraction = feedback.correctedExtraction as any
        
        return {
          id: `db_${feedback.id}`,
          documentId: feedback.documentId,
          originalExtraction: {
            salesVAT: originalExtraction.salesVAT || [],
            purchaseVAT: originalExtraction.purchaseVAT || [],
            confidence: originalExtraction.confidence || 0.5,
            extractionMethod: originalExtraction.extractionMethod || 'AI_VISION'
          },
          correctedExtraction: {
            salesVAT: correctedExtraction.salesVAT || [],
            purchaseVAT: correctedExtraction.purchaseVAT || [],
            confidence: correctedExtraction.confidence || 1.0,
            notes: correctedExtraction.notes
          },
          correctionReason: this.mapFeedbackToCorrectionReason(feedback.feedback),
          userFeedback: feedback.notes || 'Database correction',
          documentText: feedback.document?.scanResult,
          documentType: feedback.document?.category || 'UNKNOWN',
          fileName: feedback.document?.originalName || 'Unknown',
          userId: feedback.user?.id || feedback.userId,
          timestamp: feedback.createdAt,
          validated: feedback.wasProcessed,
          usedForTraining: feedback.improvementMade
        }
      })

      console.log(`📊 Loaded ${corrections.length} corrections from database`)
      return corrections
    } catch (error) {
      console.error('Error loading corrections from database:', error)
      
      // Fallback to file system
      try {
        const fs = require('fs').promises
        const files = await fs.readdir('/tmp/corrections').catch(() => [])
        const corrections: VATCorrection[] = []
        
        for (const file of files) {
          if (file.endsWith('.json')) {
            const data = await fs.readFile(`/tmp/corrections/${file}`, 'utf-8')
            corrections.push(JSON.parse(data))
          }
        }
        
        console.log(`📁 Loaded ${corrections.length} corrections from file system fallback`)
        return corrections
      } catch (fileError) {
        console.error('Error loading corrections from file system:', fileError)
        return []
      }
    }
  }

  private mapFeedbackToCorrectionReason(feedback: string): 'WRONG_AMOUNT' | 'WRONG_CATEGORY' | 'MISSING_VAT' | 'DUPLICATE_VAT' | 'OTHER' {
    switch (feedback) {
      case 'INCORRECT':
        return 'WRONG_AMOUNT'
      case 'PARTIALLY_CORRECT':
        return 'WRONG_CATEGORY'
      default:
        return 'OTHER'
    }
  }

  private async updateConfidenceCalibration(correction: VATCorrection): Promise<void> {
    // Update confidence calibration based on actual vs predicted accuracy
    const actualAccuracy = this.calculateAccuracy(correction)
    const predictedConfidence = correction.originalExtraction.confidence

    console.log(`📊 Confidence calibration update:`)
    console.log(`   Predicted: ${predictedConfidence}`)
    console.log(`   Actual: ${actualAccuracy}`)
    console.log(`   Calibration factor: ${actualAccuracy / predictedConfidence}`)
  }

  private async extractTrainingPatterns(correction: VATCorrection): Promise<void> {
    if (!correction.documentText) return

    // Extract successful patterns from the corrected extraction
    const patterns = this.identifySuccessfulPatterns(
      correction.documentText, 
      correction.correctedExtraction
    )

    console.log(`🔍 Extracted ${patterns.length} training patterns from correction`)
  }

  private async checkAndTriggerRetraining(): Promise<void> {
    const corrections = await this.loadStoredCorrections()
    const unusedCorrections = corrections.filter(c => !c.usedForTraining)

    // Trigger retraining if we have enough new corrections
    if (unusedCorrections.length >= 10) {
      console.log(`🔄 Triggering retraining with ${unusedCorrections.length} new corrections`)
      await this.triggerRetraining(unusedCorrections)
    }
  }

  private async triggerRetraining(corrections: VATCorrection[]): Promise<void> {
    // In production, trigger ML model retraining
    console.log(`🤖 Retraining AI model with ${corrections.length} corrections`)
    
    // Mark corrections as used for training
    corrections.forEach(correction => {
      correction.usedForTraining = true
    })
  }

  private calculateAccuracy(correction: VATCorrection): number {
    // Calculate how accurate the original extraction was
    const original = correction.originalExtraction
    const corrected = correction.correctedExtraction

    // Simple accuracy calculation based on VAT amount differences
    const originalTotal = [...original.salesVAT, ...original.purchaseVAT].reduce((a, b) => a + b, 0)
    const correctedTotal = [...corrected.salesVAT, ...corrected.purchaseVAT].reduce((a, b) => a + b, 0)

    if (correctedTotal === 0) return originalTotal === 0 ? 1.0 : 0.0
    
    const accuracy = 1.0 - Math.abs(originalTotal - correctedTotal) / correctedTotal
    return Math.max(0, Math.min(1, accuracy))
  }

  private async getRelevantPatterns(documentType: string, documentText: string): Promise<TrainingPattern[]> {
    // Return patterns relevant to this document type and text
    return [] // Placeholder
  }

  private async getConfidenceCalibration(documentType: string, extractionMethod: string): Promise<ConfidenceCalibration | null> {
    // Return confidence calibration for this document type and method
    return null // Placeholder
  }

  private matchesPattern(text: string, pattern: TrainingPattern): boolean {
    // Check if the text matches the learned pattern
    return text.includes(pattern.textPattern)
  }

  private applyPatternAdjustments(extraction: any, pattern: TrainingPattern): any {
    // Apply learned pattern adjustments to the extraction
    return extraction // Placeholder
  }

  private identifySuccessfulPatterns(text: string, extraction: any): string[] {
    // Identify patterns that led to successful extraction
    return [] // Placeholder
  }
}

// Export singleton instance
export const userCorrectionSystem = new UserCorrectionSystem()

console.log('📝 User Correction System initialized')