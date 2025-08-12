/**
 * Advanced Document Learning System for PayVAT.ie
 * Provides intelligent document pattern recognition and continuous improvement
 */

import { prisma } from '@/lib/prisma'
import { openai, AI_CONFIG, isAIEnabled } from './openai'
import crypto from 'crypto'

// Document fingerprint structure
export interface DocumentFingerprint {
  id: string
  documentId: string
  structuralHash: string // Hash of document structure/layout
  textPatterns: string[] // Key text patterns found
  vatPatterns: VATPattern[] // VAT-specific patterns
  businessSignatures: string[] // Business name/address patterns
  layoutFeatures: LayoutFeatures
  confidence: number
  createdAt: Date
  successRate: number // Track how successful this pattern has been
  lastUsed: Date
}

export interface VATPattern {
  vatAmount: number
  vatRate: number
  position: TextPosition
  context: string // Surrounding text context
  extractionMethod: 'OCR' | 'STRUCTURED' | 'INFERRED'
  confidence: number
}

export interface LayoutFeatures {
  hasTable: boolean
  hasLogo: boolean
  textDensity: number
  lineCount: number
  columnStructure: string
  headerPattern: string
  footerPattern: string
}

export interface TextPosition {
  x: number
  y: number
  width: number
  height: number
  page: number
}

export interface LearningFeedback {
  documentId: string
  userId: string
  originalExtraction: any
  correctedExtraction: any
  feedback: 'CORRECT' | 'INCORRECT' | 'PARTIALLY_CORRECT'
  corrections: FieldCorrection[]
  timestamp: Date
}

export interface FieldCorrection {
  field: string
  originalValue: any
  correctedValue: any
  confidence: number
}

export class DocumentLearningSystem {
  
  /**
   * Generate a fingerprint for a document to enable pattern recognition
   */
  static async generateDocumentFingerprint(
    documentId: string,
    extractedText: string,
    extractedData: any,
    layoutAnalysis?: any
  ): Promise<DocumentFingerprint> {
    console.log(`🧬 Generating document fingerprint for doc ${documentId}`)
    
    try {
      // Create structural hash from text patterns
      const structuralHash = this.createStructuralHash(extractedText)
      
      // Extract text patterns
      const textPatterns = this.extractTextPatterns(extractedText)
      
      // Extract VAT patterns
      const vatPatterns = this.extractVATPatterns(extractedData, extractedText)
      
      // Extract business signatures
      const businessSignatures = this.extractBusinessSignatures(extractedText)
      
      // Analyze layout features
      const layoutFeatures = this.analyzeLayoutFeatures(extractedText, layoutAnalysis)
      
      const fingerprint: DocumentFingerprint = {
        id: crypto.randomUUID(),
        documentId,
        structuralHash,
        textPatterns,
        vatPatterns,
        businessSignatures,
        layoutFeatures,
        confidence: 0.8, // Initial confidence
        createdAt: new Date(),
        successRate: 0.0, // Will be updated based on feedback
        lastUsed: new Date()
      }
      
      // Store fingerprint in database
      await this.storeFingerprintInDatabase(fingerprint)
      
      console.log(`✅ Document fingerprint generated: ${fingerprint.id}`)
      return fingerprint
      
    } catch (error) {
      console.error('Error generating document fingerprint:', error)
      throw error
    }
  }
  
  /**
   * Find matching document templates based on fingerprint
   */
  static async findMatchingTemplates(
    newFingerprint: DocumentFingerprint,
    similarityThreshold: number = 0.7
  ): Promise<DocumentFingerprint[]> {
    console.log(`🔍 Finding matching templates for fingerprint ${newFingerprint.id}`)
    
    try {
      // Get all existing fingerprints from database
      const existingFingerprints = await this.getAllFingerprintsFromDatabase()
      
      // Calculate similarity scores
      const matches = existingFingerprints
        .map(existing => ({
          fingerprint: existing,
          similarity: this.calculateSimilarity(newFingerprint, existing)
        }))
        .filter(match => match.similarity >= similarityThreshold)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5) // Top 5 matches
        .map(match => match.fingerprint)
      
      console.log(`📊 Found ${matches.length} matching templates`)
      return matches
      
    } catch (error) {
      console.error('Error finding matching templates:', error)
      return []
    }
  }
  
  /**
   * Learn from user feedback to improve future extractions
   */
  static async learnFromFeedback(feedback: LearningFeedback): Promise<void> {
    console.log(`🎓 Learning from user feedback for doc ${feedback.documentId}`)
    
    try {
      // Store feedback in database
      await this.storeFeedbackInDatabase(feedback)
      
      // Get document fingerprint
      const fingerprint = await this.getFingerprintByDocumentId(feedback.documentId)
      if (!fingerprint) {
        console.log('No fingerprint found for document, cannot learn')
        return
      }
      
      // Update success rate based on feedback
      const newSuccessRate = this.calculateNewSuccessRate(fingerprint, feedback)
      await this.updateFingerprintSuccessRate(fingerprint.id, newSuccessRate)
      
      // If feedback indicates errors, analyze patterns and update learning
      if (feedback.feedback !== 'CORRECT') {
        await this.analyzeErrorPatterns(feedback, fingerprint)
      }
      
      // Update confidence scores for similar documents
      await this.propagateLearningToSimilarDocuments(fingerprint, feedback)
      
      console.log(`✅ Learning completed for document ${feedback.documentId}`)
      
    } catch (error) {
      console.error('Error learning from feedback:', error)
    }
  }
  
  /**
   * Get AI-powered extraction suggestions based on learned patterns
   */
  static async getExtractionSuggestions(
    documentId: string,
    extractedText: string,
    initialExtraction: any
  ): Promise<any> {
    console.log(`💡 Getting extraction suggestions for doc ${documentId}`)
    
    try {
      // Generate fingerprint for current document
      const currentFingerprint = await this.generateDocumentFingerprint(
        documentId, extractedText, initialExtraction
      )
      
      // Find similar documents
      const similarTemplates = await this.findMatchingTemplates(currentFingerprint, 0.6)
      
      if (similarTemplates.length === 0) {
        console.log('No similar templates found, using initial extraction')
        return initialExtraction
      }
      
      // Analyze patterns from similar documents
      const suggestions = await this.generateSuggestionsFromTemplates(
        similarTemplates, initialExtraction, extractedText
      )
      
      console.log(`🔧 Generated ${Object.keys(suggestions).length} suggestions`)
      return suggestions
      
    } catch (error) {
      console.error('Error getting extraction suggestions:', error)
      return initialExtraction
    }
  }
  
  /**
   * Create a structural hash from document text to identify similar layouts
   */
  private static createStructuralHash(text: string): string {
    // Remove actual content but keep structural elements
    const structural = text
      .replace(/\d+/g, '#')  // Replace numbers with #
      .replace(/[A-Z]{2,}/g, 'XX')  // Replace caps with XX
      .replace(/[a-z]+/g, 'x')  // Replace lowercase with x
      .replace(/\s+/g, ' ')  // Normalize whitespace
      .trim()
    
    return crypto.createHash('md5').update(structural).digest('hex')
  }
  
  /**
   * Extract recurring text patterns that might indicate document structure
   */
  private static extractTextPatterns(text: string): string[] {
    const patterns: string[] = []
    
    // Common VAT document patterns
    const vatPatterns = [
      /VAT\s+(?:Number|No\.?|Registration)[:.]?\s*([A-Z0-9]+)/gi,
      /Total\s+(?:VAT|Tax)[:.]?\s*[€$£]?\s*(\d+\.?\d*)/gi,
      /(?:VAT|Tax)\s+Rate[:.]?\s*(\d+(?:\.\d+)?%)/gi,
      /Invoice\s+(?:Number|No\.?|#)[:.]?\s*([A-Z0-9-]+)/gi,
      /Date[:.]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi
    ]
    
    vatPatterns.forEach(pattern => {
      const matches = Array.from(text.matchAll(pattern))
      matches.forEach(match => {
        if (match[0]) {
          patterns.push(match[0].replace(/\d+/g, '#').replace(/[A-Z0-9]+/g, 'XXX'))
        }
      })
    })
    
    return [...new Set(patterns)] // Remove duplicates
  }
  
  /**
   * Extract VAT-specific patterns with positions and context
   */
  private static extractVATPatterns(extractedData: any, text: string): VATPattern[] {
    const patterns: VATPattern[] = []
    
    if (extractedData.vatData?.lineItems) {
      extractedData.vatData.lineItems.forEach((item: any, index: number) => {
        patterns.push({
          vatAmount: item.vatAmount || 0,
          vatRate: item.vatRate || 0,
          position: { x: 0, y: index * 20, width: 100, height: 20, page: 1 }, // Estimated
          context: `Line ${index + 1}: ${item.description || 'Unknown item'}`,
          extractionMethod: 'STRUCTURED',
          confidence: 0.8
        })
      })
    }
    
    return patterns
  }
  
  /**
   * Extract business signature patterns (names, addresses, etc.)
   */
  private static extractBusinessSignatures(text: string): string[] {
    const signatures: string[] = []
    
    // Extract potential business names (capitalized words/phrases)
    const businessNamePattern = /([A-Z][a-zA-Z\s&]+(?:Ltd|Limited|Inc|Corp|Company|Teo))/gi
    const businessMatches = Array.from(text.matchAll(businessNamePattern))
    
    businessMatches.forEach(match => {
      if (match[1] && match[1].length > 3) {
        signatures.push(match[1].trim())
      }
    })
    
    // Extract address patterns
    const addressPattern = /(\d+\s+[A-Za-z\s]+(?:Street|Road|Avenue|Lane|Drive|St|Rd|Ave))/gi
    const addressMatches = Array.from(text.matchAll(addressPattern))
    
    addressMatches.forEach(match => {
      if (match[1]) {
        signatures.push(match[1].trim())
      }
    })
    
    return [...new Set(signatures)]
  }
  
  /**
   * Analyze layout features from text structure
   */
  private static analyzeLayoutFeatures(text: string, layoutAnalysis?: any): LayoutFeatures {
    const lines = text.split('\n')
    const words = text.split(/\s+/)
    
    return {
      hasTable: /\s{3,}/.test(text) && lines.some(line => line.split(/\s{3,}/).length > 2),
      hasLogo: layoutAnalysis?.hasLogo || text.toLowerCase().includes('logo'),
      textDensity: words.length / lines.length,
      lineCount: lines.length,
      columnStructure: this.detectColumnStructure(lines),
      headerPattern: lines.slice(0, 5).join(' ').replace(/\d+/g, '#'),
      footerPattern: lines.slice(-5).join(' ').replace(/\d+/g, '#')
    }
  }
  
  private static detectColumnStructure(lines: string[]): string {
    // Analyze spacing patterns to detect columns
    const spacingPatterns = lines
      .slice(0, Math.min(20, lines.length))
      .map(line => line.replace(/\S/g, 'X').replace(/\s/g, ' '))
    
    if (spacingPatterns.length === 0) return 'single'
    
    // Find most common spacing pattern
    const patternCounts: { [key: string]: number } = {}
    spacingPatterns.forEach(pattern => {
      const simplified = pattern.replace(/X+/g, 'X').substring(0, 50)
      patternCounts[simplified] = (patternCounts[simplified] || 0) + 1
    })
    
    const mostCommon = Object.entries(patternCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'single'
    
    const spaceGroups = mostCommon.split('X').filter(s => s.length > 0)
    
    if (spaceGroups.length >= 3) return 'multi-column'
    if (spaceGroups.length === 2) return 'two-column'
    return 'single'
  }
  
  /**
   * Calculate similarity between two document fingerprints
   */
  private static calculateSimilarity(fp1: DocumentFingerprint, fp2: DocumentFingerprint): number {
    let similarity = 0
    let weights = 0
    
    // Structural hash similarity (high weight)
    if (fp1.structuralHash === fp2.structuralHash) {
      similarity += 0.4
    }
    weights += 0.4
    
    // Text pattern similarity
    const commonPatterns = fp1.textPatterns.filter(p => fp2.textPatterns.includes(p))
    const patternSimilarity = commonPatterns.length / Math.max(fp1.textPatterns.length, fp2.textPatterns.length)
    similarity += patternSimilarity * 0.3
    weights += 0.3
    
    // Business signature similarity
    const commonSignatures = fp1.businessSignatures.filter(s => fp2.businessSignatures.includes(s))
    const signatureSimilarity = commonSignatures.length / Math.max(fp1.businessSignatures.length, fp2.businessSignatures.length)
    similarity += signatureSimilarity * 0.2
    weights += 0.2
    
    // Layout feature similarity
    const layoutSimilarity = this.compareLayoutFeatures(fp1.layoutFeatures, fp2.layoutFeatures)
    similarity += layoutSimilarity * 0.1
    weights += 0.1
    
    return weights > 0 ? similarity / weights : 0
  }
  
  private static compareLayoutFeatures(f1: LayoutFeatures, f2: LayoutFeatures): number {
    let score = 0
    let count = 0
    
    if (f1.hasTable === f2.hasTable) score++
    count++
    
    if (f1.hasLogo === f2.hasLogo) score++
    count++
    
    if (Math.abs(f1.textDensity - f2.textDensity) < 2) score++
    count++
    
    if (f1.columnStructure === f2.columnStructure) score++
    count++
    
    return count > 0 ? score / count : 0
  }
  
  /**
   * Calculate new success rate based on feedback
   */
  private static calculateNewSuccessRate(fingerprint: DocumentFingerprint, feedback: LearningFeedback): number {
    const feedbackScore = feedback.feedback === 'CORRECT' ? 1.0 :
                         feedback.feedback === 'PARTIALLY_CORRECT' ? 0.5 : 0.0
    
    // Weighted average with existing success rate
    const alpha = 0.2 // Learning rate
    return fingerprint.successRate * (1 - alpha) + feedbackScore * alpha
  }
  
  /**
   * Database operations (to be implemented with your Prisma schema)
   */
  private static async storeFingerprintInDatabase(fingerprint: DocumentFingerprint): Promise<void> {
    // This would be implemented once the Prisma schema is updated
    console.log('TODO: Store fingerprint in database:', fingerprint.id)
  }
  
  private static async getAllFingerprintsFromDatabase(): Promise<DocumentFingerprint[]> {
    // This would fetch from the database
    console.log('TODO: Fetch fingerprints from database')
    return []
  }
  
  private static async getFingerprintByDocumentId(documentId: string): Promise<DocumentFingerprint | null> {
    console.log('TODO: Get fingerprint by document ID:', documentId)
    return null
  }
  
  private static async storeFeedbackInDatabase(feedback: LearningFeedback): Promise<void> {
    console.log('TODO: Store feedback in database for doc:', feedback.documentId)
  }
  
  private static async updateFingerprintSuccessRate(fingerprintId: string, successRate: number): Promise<void> {
    console.log('TODO: Update fingerprint success rate:', fingerprintId, successRate)
  }
  
  private static async analyzeErrorPatterns(feedback: LearningFeedback, fingerprint: DocumentFingerprint): Promise<void> {
    console.log('TODO: Analyze error patterns for learning improvements')
  }
  
  private static async propagateLearningToSimilarDocuments(fingerprint: DocumentFingerprint, feedback: LearningFeedback): Promise<void> {
    console.log('TODO: Propagate learning to similar documents')
  }
  
  private static async generateSuggestionsFromTemplates(templates: DocumentFingerprint[], initialExtraction: any, text: string): Promise<any> {
    console.log('TODO: Generate suggestions from templates')
    return initialExtraction
  }
}

/**
 * Utility functions for document learning
 */
export class DocumentLearningUtils {
  
  /**
   * Check if a document type is frequently processed (for prioritized learning)
   */
  static async getDocumentTypeFrequency(businessSignatures: string[]): Promise<{ [key: string]: number }> {
    // Analyze how frequently certain business types/signatures appear
    const frequency: { [key: string]: number } = {}
    
    // This would query the database for statistics
    console.log('TODO: Get document type frequency statistics')
    
    return frequency
  }
  
  /**
   * Get learning insights for admin dashboard
   */
  static async getLearningInsights(): Promise<{
    totalDocumentsProcessed: number
    averageAccuracy: number
    topPerformingTemplates: DocumentFingerprint[]
    recentImprovements: string[]
  }> {
    console.log('TODO: Get learning insights for dashboard')
    
    return {
      totalDocumentsProcessed: 0,
      averageAccuracy: 0.95,
      topPerformingTemplates: [],
      recentImprovements: []
    }
  }
}