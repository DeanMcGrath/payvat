/**
 * Confidence Learning System
 * Improves confidence calculations based on user feedback and corrections
 */

import { prisma } from '@/lib/prisma'

export interface ConfidencePattern {
  id: string
  documentType: string
  vatAmountRange: { min: number, max: number }
  extractionMethod: string
  originalConfidence: number
  actualAccuracy: number
  correctionCount: number
  lastUpdated: Date
}

export class ConfidenceLearningSystem {
  private patterns: Map<string, ConfidencePattern> = new Map()
  private calibrationFactors: Map<string, number> = new Map()

  /**
   * Learn from user corrections to improve future confidence scores
   */
  async learnFromCorrection(data: {
    documentId: string
    documentType: string
    extractionMethod: string
    originalConfidence: number
    originalVATAmounts: number[]
    correctedVATAmounts: number[]
    userFeedback: 'CORRECT' | 'INCORRECT' | 'PARTIALLY_CORRECT'
  }): Promise<void> {
    console.log(`🧠 Learning from user correction for ${data.documentType}`)
    
    // Calculate accuracy
    const accuracy = this.calculateAccuracy(data.originalVATAmounts, data.correctedVATAmounts, data.userFeedback)
    
    // Update calibration factor for this document type + method
    const key = `${data.documentType}_${data.extractionMethod}`
    await this.updateCalibration(key, data.originalConfidence, accuracy)
    
    // Store the learning pattern
    await this.storePattern(data, accuracy)
    
    console.log(`   Original confidence: ${(data.originalConfidence * 100).toFixed(1)}%`)
    console.log(`   Calculated accuracy: ${(accuracy * 100).toFixed(1)}%`)
    console.log(`   New calibration factor: ${this.calibrationFactors.get(key)?.toFixed(3)}`)
  }

  /**
   * Apply learned adjustments to confidence score
   */
  async calibrateConfidence(
    baseConfidence: number,
    documentType: string,
    extractionMethod: string,
    vatAmounts: number[]
  ): Promise<number> {
    // Get calibration factor for this document type + method
    const key = `${documentType}_${extractionMethod}`
    const calibrationFactor = this.calibrationFactors.get(key) || 1.0
    
    // Apply calibration
    let calibratedConfidence = baseConfidence * calibrationFactor
    
    // Apply pattern-based adjustments
    const patternAdjustment = await this.getPatternAdjustment(documentType, vatAmounts, extractionMethod)
    calibratedConfidence += patternAdjustment
    
    // Ensure confidence is within bounds
    calibratedConfidence = Math.max(0.1, Math.min(0.99, calibratedConfidence))
    
    if (Math.abs(calibratedConfidence - baseConfidence) > 0.05) {
      console.log(`🎯 Confidence calibration applied:`)
      console.log(`   Base: ${(baseConfidence * 100).toFixed(1)}%`)
      console.log(`   Calibrated: ${(calibratedConfidence * 100).toFixed(1)}%`)
      console.log(`   Calibration factor: ${calibrationFactor.toFixed(3)}`)
      console.log(`   Pattern adjustment: ${(patternAdjustment * 100).toFixed(1)}%`)
    }
    
    return calibratedConfidence
  }

  /**
   * Get pattern-based confidence adjustment
   */
  private async getPatternAdjustment(
    documentType: string,
    vatAmounts: number[],
    extractionMethod: string
  ): Promise<number> {
    const totalVAT = vatAmounts.reduce((sum, amount) => sum + amount, 0)
    
    // Find matching patterns
    const matchingPatterns = Array.from(this.patterns.values()).filter(pattern => 
      pattern.documentType === documentType &&
      pattern.extractionMethod === extractionMethod &&
      totalVAT >= pattern.vatAmountRange.min &&
      totalVAT <= pattern.vatAmountRange.max
    )
    
    if (matchingPatterns.length === 0) return 0
    
    // Calculate weighted average adjustment
    const totalWeight = matchingPatterns.reduce((sum, p) => sum + p.correctionCount, 0)
    const weightedAdjustment = matchingPatterns.reduce((sum, pattern) => {
      const weight = pattern.correctionCount / totalWeight
      const adjustment = pattern.actualAccuracy - pattern.originalConfidence
      return sum + (adjustment * weight)
    }, 0)
    
    return Math.max(-0.2, Math.min(0.2, weightedAdjustment)) // Cap adjustment at ±20%
  }

  /**
   * Calculate accuracy from user feedback
   */
  private calculateAccuracy(
    originalAmounts: number[],
    correctedAmounts: number[],
    feedback: string
  ): number {
    switch (feedback) {
      case 'CORRECT':
        return 1.0
      case 'INCORRECT':
        return 0.2
      case 'PARTIALLY_CORRECT':
        // Calculate how close the original was to the correction
        const originalTotal = originalAmounts.reduce((sum, amt) => sum + amt, 0)
        const correctedTotal = correctedAmounts.reduce((sum, amt) => sum + amt, 0)
        
        if (correctedTotal === 0) return 0.3
        
        const difference = Math.abs(originalTotal - correctedTotal)
        const accuracy = Math.max(0.3, 1 - (difference / correctedTotal))
        return Math.min(0.9, accuracy) // Cap at 90% for partial corrections
      default:
        return 0.5
    }
  }

  /**
   * Update calibration factor for document type + method combination
   */
  private async updateCalibration(key: string, originalConfidence: number, accuracy: number): Promise<void> {
    const currentFactor = this.calibrationFactors.get(key) || 1.0
    const targetFactor = accuracy / originalConfidence
    
    // Use exponential moving average for smooth updates
    const learningRate = 0.1 // Adjust learning rate as needed
    const newFactor = (1 - learningRate) * currentFactor + learningRate * targetFactor
    
    this.calibrationFactors.set(key, newFactor)
    
    // Persist to database
    try {
      await prisma.learningPattern.upsert({
        where: {
          patternKey: key
        },
        update: {
          confidence: newFactor,
          frequency: { increment: 1 },
          lastUsed: new Date()
        },
        create: {
          patternKey: key,
          patternType: 'CALIBRATION',
          documentType: key.split('_')[0],
          patternData: { calibrationFactor: newFactor },
          confidence: newFactor,
          frequency: 1,
          lastUsed: new Date()
        }
      })
    } catch (error) {
      console.warn('Failed to persist calibration factor:', error)
    }
  }

  /**
   * Store learning pattern from correction
   */
  private async storePattern(data: any, accuracy: number): Promise<void> {
    const totalVAT = data.originalVATAmounts.reduce((sum: number, amt: number) => sum + amt, 0)
    const rangeSize = Math.max(50, totalVAT * 0.2) // 20% range or minimum €50
    
    const patternId = `${data.documentType}_${Math.floor(totalVAT / rangeSize) * rangeSize}_${data.extractionMethod}`
    
    const existingPattern = this.patterns.get(patternId)
    if (existingPattern) {
      // Update existing pattern
      const totalCorrections = existingPattern.correctionCount + 1
      existingPattern.actualAccuracy = (existingPattern.actualAccuracy * existingPattern.correctionCount + accuracy) / totalCorrections
      existingPattern.correctionCount = totalCorrections
      existingPattern.lastUpdated = new Date()
    } else {
      // Create new pattern
      const newPattern: ConfidencePattern = {
        id: patternId,
        documentType: data.documentType,
        vatAmountRange: {
          min: Math.floor(totalVAT / rangeSize) * rangeSize,
          max: Math.floor(totalVAT / rangeSize) * rangeSize + rangeSize
        },
        extractionMethod: data.extractionMethod,
        originalConfidence: data.originalConfidence,
        actualAccuracy: accuracy,
        correctionCount: 1,
        lastUpdated: new Date()
      }
      this.patterns.set(patternId, newPattern)
    }
  }

  /**
   * Load calibration factors from database
   */
  async loadCalibrationFactors(): Promise<void> {
    try {
      const patterns = await prisma.learningPattern.findMany({
        where: { patternType: 'CALIBRATION' }
      })
      
      patterns.forEach(pattern => {
        this.calibrationFactors.set(pattern.patternKey, pattern.confidence)
      })
      
      console.log(`🧠 Loaded ${patterns.length} calibration factors from database`)
    } catch (error) {
      console.warn('Failed to load calibration factors:', error)
    }
  }

  /**
   * Get learning statistics
   */
  async getStats(): Promise<{
    totalPatterns: number
    totalCalibrations: number
    averageAccuracyImprovement: number
    documentTypeStats: Record<string, { patterns: number, avgAccuracy: number }>
  }> {
    const documentTypeStats: Record<string, { patterns: number, avgAccuracy: number }> = {}
    let totalAccuracy = 0
    let patternCount = 0
    
    this.patterns.forEach(pattern => {
      if (!documentTypeStats[pattern.documentType]) {
        documentTypeStats[pattern.documentType] = { patterns: 0, avgAccuracy: 0 }
      }
      
      documentTypeStats[pattern.documentType].patterns++
      documentTypeStats[pattern.documentType].avgAccuracy += pattern.actualAccuracy
      totalAccuracy += pattern.actualAccuracy
      patternCount++
    })
    
    // Calculate averages
    Object.keys(documentTypeStats).forEach(type => {
      documentTypeStats[type].avgAccuracy /= documentTypeStats[type].patterns
    })
    
    return {
      totalPatterns: this.patterns.size,
      totalCalibrations: this.calibrationFactors.size,
      averageAccuracyImprovement: patternCount > 0 ? totalAccuracy / patternCount : 0,
      documentTypeStats
    }
  }
}

// Export singleton instance
export const confidenceLearning = new ConfidenceLearningSystem()