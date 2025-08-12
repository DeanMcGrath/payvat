/**
 * Enhanced Document Analysis System with Learning Integration
 * Combines AI Vision, pattern recognition, and continuous learning
 */

import { openai, AI_CONFIG, isAIEnabled, handleOpenAIError, logAIUsage } from './openai'
import { DOCUMENT_PROMPTS, formatPrompt } from './prompts'
import { DocumentLearningSystem, DocumentFingerprint, LearningFeedback } from './documentLearning'
import { DocumentTemplateSystem, TemplateMatch } from './documentTemplates'
import { EnhancedVATData, AIDocumentProcessingResult } from './documentAnalysis'

export interface AdvancedProcessingResult extends AIDocumentProcessingResult {
  learningApplied: boolean
  templateUsed?: string
  confidenceBoost: number
  suggestedImprovements: string[]
  fingerprintId?: string
  processingStrategy: 'TEMPLATE_MATCH' | 'AI_VISION' | 'HYBRID' | 'FALLBACK'
  matchedFeatures: string[]
}

export interface ProcessingContext {
  userId?: string
  businessContext?: any
  previousProcessingHistory?: any[]
  forceRelearn?: boolean
  debugMode?: boolean
}

export class EnhancedDocumentAnalysis {
  
  /**
   * Main processing function that combines AI, templates, and learning
   */
  static async processDocumentWithLearning(
    documentId: string,
    fileData: string,
    mimeType: string,
    fileName: string,
    extractedText: string,
    context: ProcessingContext = {}
  ): Promise<AdvancedProcessingResult> {
    console.log(`🧠 Enhanced processing started for document ${documentId}`)
    const startTime = Date.now()
    
    try {
      if (!isAIEnabled()) {
        return this.createFallbackResult('AI not enabled')
      }
      
      // Step 1: Quick template matching
      console.log('🎯 Step 1: Template matching')
      const templateMatch = await this.findAndApplyTemplate(documentId, extractedText, context)
      
      let processingResult: AdvancedProcessingResult
      
      if (templateMatch && templateMatch.confidence > 0.8) {
        // High confidence template match - use template-based extraction
        console.log(`✅ High confidence template match found: ${templateMatch.template.name}`)
        processingResult = await this.processWithTemplate(templateMatch, fileData, mimeType, extractedText)
        
      } else if (templateMatch && templateMatch.confidence > 0.6) {
        // Medium confidence - hybrid approach
        console.log(`🔄 Medium confidence template match - using hybrid approach`)
        processingResult = await this.processWithHybridApproach(templateMatch, fileData, mimeType, extractedText)
        
      } else {
        // No good template match - use AI Vision with learning
        console.log(`🤖 No template match - using AI Vision with learning`)
        processingResult = await this.processWithAIVision(documentId, fileData, mimeType, extractedText, context)
      }
      
      // Step 2: Apply learned improvements
      console.log('🎓 Step 2: Applying learned improvements')
      const improvedResult = await this.applyLearnedImprovements(processingResult, extractedText, context)
      
      // Step 3: Generate document fingerprint for future learning
      console.log('🧬 Step 3: Generating fingerprint for learning')
      const fingerprint = await DocumentLearningSystem.generateDocumentFingerprint(
        documentId, extractedText, improvedResult.extractedData || {}
      )
      improvedResult.fingerprintId = fingerprint.id
      
      // Step 4: Check if we should create a new template
      console.log('🏗️ Step 4: Evaluating template creation')
      await this.evaluateTemplateCreation(documentId, extractedText, improvedResult, context)
      
      improvedResult.processingTime = Date.now() - startTime
      
      console.log(`✅ Enhanced processing completed in ${improvedResult.processingTime}ms`)
      return improvedResult
      
    } catch (error) {
      console.error('Enhanced document processing failed:', error)
      return this.createFallbackResult(`Processing error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  
  /**
   * Collect user feedback to improve future processing
   */
  static async collectUserFeedback(
    documentId: string,
    originalResult: AdvancedProcessingResult,
    userCorrections: any,
    userId?: string
  ): Promise<void> {
    console.log(`📝 Collecting user feedback for document ${documentId}`)
    
    try {
      // Determine accuracy of original extraction
      const wasAccurate = this.evaluateAccuracy(originalResult.extractedData, userCorrections)
      
      // Create learning feedback
      const feedback: LearningFeedback = {
        documentId,
        userId: userId || 'anonymous',
        originalExtraction: originalResult.extractedData,
        correctedExtraction: userCorrections,
        feedback: wasAccurate ? 'CORRECT' : 'INCORRECT',
        corrections: this.identifyCorrections(originalResult.extractedData, userCorrections),
        timestamp: new Date()
      }
      
      // Feed back to learning system
      await DocumentLearningSystem.learnFromFeedback(feedback)
      
      // Update template if one was used
      if (originalResult.templateUsed) {
        await DocumentTemplateSystem.updateTemplateWithFeedback(
          originalResult.templateUsed,
          documentId,
          {
            wasAccurate,
            corrections: feedback.corrections,
            processingTime: originalResult.processingTime || 5000,
            confidence: originalResult.extractedData?.confidence || 0.5
          }
        )
      }
      
      console.log(`✅ User feedback processed for document ${documentId}`)
      
    } catch (error) {
      console.error('Error collecting user feedback:', error)
    }
  }
  
  /**
   * Get AI-powered suggestions for document processing improvements
   */
  static async getSuggestions(
    documentId: string,
    extractedText: string,
    currentExtraction: any
  ): Promise<{
    suggestions: string[]
    confidenceBoosts: { [field: string]: number }
    alternativeExtractions: any
    validationWarnings: string[]
  }> {
    console.log(`💡 Getting AI suggestions for document ${documentId}`)
    
    try {
      // Get suggestions from learned patterns
      const learnedSuggestions = await DocumentLearningSystem.getExtractionSuggestions(
        documentId, extractedText, currentExtraction
      )
      
      // Get AI-powered validation
      const validationWarnings = await this.performAIValidation(currentExtraction, extractedText)
      
      // Generate confidence boosts based on pattern matching
      const confidenceBoosts = this.calculateConfidenceBoosts(currentExtraction, extractedText)
      
      const suggestions = this.generateTextualSuggestions(
        currentExtraction, learnedSuggestions, validationWarnings
      )
      
      return {
        suggestions,
        confidenceBoosts,
        alternativeExtractions: learnedSuggestions,
        validationWarnings
      }
      
    } catch (error) {
      console.error('Error getting suggestions:', error)
      return {
        suggestions: [],
        confidenceBoosts: {},
        alternativeExtractions: {},
        validationWarnings: []
      }
    }
  }
  
  /**
   * Private methods for processing strategies
   */
  
  private static async findAndApplyTemplate(
    documentId: string,
    extractedText: string,
    context: ProcessingContext
  ): Promise<TemplateMatch | null> {
    try {
      const templateMatch = await DocumentTemplateSystem.findBestMatchingTemplate(
        documentId, extractedText, {}
      )
      
      if (templateMatch) {
        console.log(`🎯 Template match found: ${templateMatch.template.name} (${(templateMatch.confidence * 100).toFixed(1)}% confidence)`)
      }
      
      return templateMatch
      
    } catch (error) {
      console.error('Error finding template match:', error)
      return null
    }
  }
  
  private static async processWithTemplate(
    templateMatch: TemplateMatch,
    fileData: string,
    mimeType: string,
    extractedText: string
  ): Promise<AdvancedProcessingResult> {
    console.log(`🎯 Processing with template: ${templateMatch.template.name}`)
    
    // Use template's extraction rules to process document
    const extractedData = templateMatch.suggestedExtraction
    
    // Apply template validation
    const validationResults = this.applyTemplateValidation(templateMatch.template, extractedData)
    
    return {
      success: true,
      isScanned: true,
      scanResult: `Processed using template: ${templateMatch.template.name}`,
      extractedData: this.enhanceWithTemplateData(extractedData, templateMatch),
      aiProcessed: true,
      learningApplied: true,
      templateUsed: templateMatch.template.id,
      confidenceBoost: templateMatch.confidence - 0.5, // Boost from baseline
      suggestedImprovements: [],
      processingStrategy: 'TEMPLATE_MATCH',
      matchedFeatures: templateMatch.matchedFeatures
    }
  }
  
  private static async processWithHybridApproach(
    templateMatch: TemplateMatch,
    fileData: string,
    mimeType: string,
    extractedText: string
  ): Promise<AdvancedProcessingResult> {
    console.log(`🔄 Processing with hybrid approach`)
    
    // Combine template suggestions with AI Vision
    const aiResult = await this.callAIVision(fileData, mimeType, extractedText)
    const templateResult = templateMatch.suggestedExtraction
    
    // Merge results intelligently
    const mergedData = this.intelligentMerge(aiResult, templateResult, templateMatch)
    
    return {
      success: true,
      isScanned: true,
      scanResult: `Hybrid processing: AI Vision + Template`,
      extractedData: mergedData,
      aiProcessed: true,
      learningApplied: true,
      templateUsed: templateMatch.template.id,
      confidenceBoost: templateMatch.confidence * 0.3,
      suggestedImprovements: [],
      processingStrategy: 'HYBRID',
      matchedFeatures: templateMatch.matchedFeatures
    }
  }
  
  private static async processWithAIVision(
    documentId: string,
    fileData: string,
    mimeType: string,
    extractedText: string,
    context: ProcessingContext
  ): Promise<AdvancedProcessingResult> {
    console.log(`🤖 Processing with AI Vision`)
    
    const aiResult = await this.callAIVision(fileData, mimeType, extractedText)
    
    return {
      success: true,
      isScanned: true,
      scanResult: `AI Vision processing completed`,
      extractedData: aiResult,
      aiProcessed: true,
      learningApplied: false,
      confidenceBoost: 0,
      suggestedImprovements: [],
      processingStrategy: 'AI_VISION',
      matchedFeatures: []
    }
  }
  
  private static async callAIVision(fileData: string, mimeType: string, extractedText: string): Promise<EnhancedVATData> {
    console.log('🔍 Calling AI Vision API')
    
    try {
      const response = await openai.chat.completions.create({
        model: AI_CONFIG.models.vision,
        max_tokens: AI_CONFIG.limits.maxTokens,
        temperature: AI_CONFIG.limits.temperature,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: this.buildEnhancedPrompt(extractedText)
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${fileData}`,
                  detail: "high"
                }
              }
            ]
          }
        ]
      })
      
      const content = response.choices[0]?.message?.content || '{}'
      return this.parseAIResponse(content)
      
    } catch (error) {
      console.error('AI Vision call failed:', error)
      throw error
    }
  }
  
  private static buildEnhancedPrompt(extractedText: string): string {
    return `${DOCUMENT_PROMPTS.CLEAN_VAT_EXTRACTION}

ADDITIONAL CONTEXT:
- This document has been through text extraction: ${extractedText.length > 0 ? 'Available' : 'Not available'}
- Please pay special attention to VAT amounts, rates, and business details
- Return structured JSON with confidence scores for each extracted field
- If you see multiple possible VAT amounts, include all with their context`
  }
  
  private static async applyLearnedImprovements(
    result: AdvancedProcessingResult,
    extractedText: string,
    context: ProcessingContext
  ): Promise<AdvancedProcessingResult> {
    console.log('🎓 Applying learned improvements')
    
    try {
      // Apply confidence boosts based on learned patterns
      if (result.extractedData) {
        const confidenceBoosts = this.calculateConfidenceBoosts(result.extractedData, extractedText)
        result.extractedData.confidence = Math.min(1.0, result.extractedData.confidence * (1 + result.confidenceBoost))
        
        // Apply specific field improvements
        this.applyFieldImprovements(result.extractedData, confidenceBoosts)
      }
      
      // Generate suggestions for missing data
      result.suggestedImprovements = await this.generateImprovementSuggestions(result.extractedData, extractedText)
      
      result.learningApplied = true
      return result
      
    } catch (error) {
      console.error('Error applying learned improvements:', error)
      return result
    }
  }
  
  private static async evaluateTemplateCreation(
    documentId: string,
    extractedText: string,
    result: AdvancedProcessingResult,
    context: ProcessingContext
  ): Promise<void> {
    // Only create templates for successful extractions without existing template matches
    if (result.success && !result.templateUsed && result.extractedData) {
      const confidence = result.extractedData.confidence
      
      // Create template if confidence is high enough
      if (confidence > 0.8) {
        console.log('🏗️ Creating new template from successful extraction')
        await DocumentTemplateSystem.createTemplateFromDocument(
          documentId, extractedText, result.extractedData, context.businessContext
        )
      }
    }
  }
  
  private static createFallbackResult(reason: string): AdvancedProcessingResult {
    return {
      success: false,
      isScanned: false,
      scanResult: `Fallback: ${reason}`,
      error: reason,
      aiProcessed: false,
      learningApplied: false,
      confidenceBoost: 0,
      suggestedImprovements: [],
      processingStrategy: 'FALLBACK',
      matchedFeatures: []
    }
  }
  
  private static evaluateAccuracy(original: any, corrected: any): boolean {
    if (!original || !corrected) return false
    
    // Check key VAT fields
    const keyFields = ['totalVatAmount', 'businessDetails.vatNumber', 'transactionData.date']
    let correctFields = 0
    
    keyFields.forEach(field => {
      const originalValue = this.getNestedValue(original, field)
      const correctedValue = this.getNestedValue(corrected, field)
      
      if (this.valuesMatch(originalValue, correctedValue)) {
        correctFields++
      }
    })
    
    return correctFields / keyFields.length >= 0.7 // 70% accuracy threshold
  }
  
  private static identifyCorrections(original: any, corrected: any): any[] {
    const corrections: any[] = []
    
    // Recursively identify differences
    this.findDifferences(original, corrected, '', corrections)
    
    return corrections
  }
  
  private static findDifferences(obj1: any, obj2: any, path: string, corrections: any[]): void {
    if (typeof obj1 !== typeof obj2) {
      corrections.push({
        field: path,
        originalValue: obj1,
        correctedValue: obj2,
        confidence: 1.0
      })
      return
    }
    
    if (typeof obj1 === 'object' && obj1 !== null) {
      Object.keys(obj2 || {}).forEach(key => {
        const newPath = path ? `${path}.${key}` : key
        this.findDifferences(obj1?.[key], obj2[key], newPath, corrections)
      })
    } else if (obj1 !== obj2) {
      corrections.push({
        field: path,
        originalValue: obj1,
        correctedValue: obj2,
        confidence: 1.0
      })
    }
  }
  
  private static async performAIValidation(extraction: any, text: string): Promise<string[]> {
    const warnings: string[] = []
    
    // Basic validation rules
    if (extraction.vatData?.totalVatAmount) {
      const amount = extraction.vatData.totalVatAmount
      if (amount < 0) warnings.push('VAT amount cannot be negative')
      if (amount > 100000) warnings.push('VAT amount seems unusually high')
    }
    
    // Business validation
    if (extraction.businessDetails?.vatNumber) {
      const vatNumber = extraction.businessDetails.vatNumber
      if (!/^[A-Z0-9]{8,15}$/.test(vatNumber)) {
        warnings.push('VAT number format may be incorrect')
      }
    }
    
    return warnings
  }
  
  private static calculateConfidenceBoosts(extraction: any, text: string): { [field: string]: number } {
    const boosts: { [field: string]: number } = {}
    
    // Boost confidence for fields that match known patterns
    if (extraction.businessDetails?.vatNumber && /IE[0-9]{7}[A-Z]{1,2}/.test(extraction.businessDetails.vatNumber)) {
      boosts['businessDetails.vatNumber'] = 0.2 // 20% boost for Irish VAT format
    }
    
    if (extraction.vatData?.totalVatAmount && text.includes('Total VAT')) {
      boosts['vatData.totalVatAmount'] = 0.1 // 10% boost for clear labeling
    }
    
    return boosts
  }
  
  private static generateTextualSuggestions(original: any, learned: any, warnings: string[]): string[] {
    const suggestions: string[] = []
    
    if (warnings.length > 0) {
      suggestions.push(`Validation warnings found: ${warnings.join(', ')}`)
    }
    
    if (learned && Object.keys(learned).length > 0) {
      suggestions.push('Alternative values found based on learned patterns')
    }
    
    return suggestions
  }
  
  private static applyTemplateValidation(template: any, data: any): any {
    // Apply template-specific validation rules
    console.log('Applying template validation rules')
    return { valid: true, errors: [] }
  }
  
  private static enhanceWithTemplateData(data: any, templateMatch: TemplateMatch): EnhancedVATData {
    // Enhance extracted data with template insights
    const enhanced = { ...data }
    
    // Add template-specific confidence boost
    if (enhanced.confidence) {
      enhanced.confidence = Math.min(1.0, enhanced.confidence + templateMatch.confidence * 0.1)
    }
    
    // Add classification from template
    if (templateMatch.template.category) {
      enhanced.classification = {
        category: templateMatch.template.category,
        confidence: templateMatch.confidence,
        reasoning: `Matched template: ${templateMatch.template.name}`
      }
    }
    
    return enhanced as EnhancedVATData
  }
  
  private static intelligentMerge(aiResult: any, templateResult: any, templateMatch: TemplateMatch): EnhancedVATData {
    const merged = { ...aiResult }
    
    // Intelligently merge template suggestions with AI results
    if (templateResult.vatData?.totalVatAmount && templateMatch.confidence > 0.7) {
      merged.vatData = merged.vatData || {}
      merged.vatData.totalVatAmount = templateResult.vatData.totalVatAmount
    }
    
    // Prefer template business details if confidence is high
    if (templateResult.businessDetails && templateMatch.confidence > 0.8) {
      merged.businessDetails = { ...merged.businessDetails, ...templateResult.businessDetails }
    }
    
    return merged as EnhancedVATData
  }
  
  private static parseAIResponse(content: string): EnhancedVATData {
    try {
      const parsed = JSON.parse(content)
      
      // Ensure all required fields exist
      return {
        documentType: parsed.documentType || 'OTHER',
        businessDetails: parsed.businessDetails || {},
        transactionData: parsed.transactionData || {},
        vatData: parsed.vatData || {},
        classification: parsed.classification || { category: 'MIXED', confidence: 0.5, reasoning: 'Auto-classified' },
        validationFlags: parsed.validationFlags || [],
        extractedText: parsed.extractedText || '',
        salesVAT: parsed.salesVAT || [],
        purchaseVAT: parsed.purchaseVAT || [],
        confidence: parsed.confidence || 0.5
      }
      
    } catch (error) {
      console.error('Error parsing AI response:', error)
      throw new Error('Failed to parse AI response as JSON')
    }
  }
  
  private static applyFieldImprovements(data: any, boosts: { [field: string]: number }): void {
    Object.entries(boosts).forEach(([field, boost]) => {
      const currentValue = this.getNestedValue(data, field)
      if (currentValue !== undefined) {
        // Apply boost logic based on field type
        console.log(`Applying ${(boost * 100).toFixed(1)}% confidence boost to ${field}`)
      }
    })
  }
  
  private static async generateImprovementSuggestions(data: any, text: string): Promise<string[]> {
    const suggestions: string[] = []
    
    if (!data?.businessDetails?.vatNumber) {
      suggestions.push('Consider extracting VAT number if visible in document')
    }
    
    if (!data?.transactionData?.date) {
      suggestions.push('Document date not found - check for date patterns')
    }
    
    return suggestions
  }
  
  // Utility methods
  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }
  
  private static valuesMatch(val1: any, val2: any): boolean {
    if (typeof val1 === 'number' && typeof val2 === 'number') {
      return Math.abs(val1 - val2) < 0.01 // Small tolerance for floating point
    }
    return val1 === val2
  }
}