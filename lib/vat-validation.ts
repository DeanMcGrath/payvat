/**
 * VAT Extraction Validation System
 * Tests accuracy against known WooCommerce files and provides training feedback
 */

import { processWooCommerceVATReport, WOOCOMMERCE_TEST_CASES } from './woocommerce-processor'
import type { ExtractedVATData } from './documentProcessor'

export interface ValidationResult {
  file: string
  expectedTotal: number
  extractedTotal: number
  difference: number
  accuracyPercentage: number
  passed: boolean
  confidence: number
  reportType: string
  extractionMethod: string
  issues: string[]
  warnings: string[]
  timestamp: Date
}

export interface ValidationSummary {
  totalTests: number
  passedTests: number
  failedTests: number
  averageAccuracy: number
  averageConfidence: number
  overallScore: number
  issues: string[]
  recommendations: string[]
}

/**
 * Validate VAT extraction against known correct values for WooCommerce files
 */
export async function validateWooCommerceExtraction(
  buffer: Buffer,
  fileName: string,
  expectedTotal: number,
  reportType: 'country_summary' | 'order_detail' | 'unknown' = 'unknown'
): Promise<ValidationResult> {
  const timestamp = new Date()
  const issues: string[] = []
  const warnings: string[] = []

  console.log('🧪 VALIDATION: Starting WooCommerce extraction validation')
  console.log(`   File: ${fileName}`)
  console.log(`   Expected: €${expectedTotal}`)
  console.log(`   Report type: ${reportType}`)

  try {
    // Process with WooCommerce processor
    const result = await processWooCommerceVATReport(buffer, fileName)
    
    console.log(`   Extracted: €${result.totalVAT}`)
    console.log(`   Confidence: ${Math.round(result.confidence * 100)}%`)
    console.log(`   Method: ${result.extractionMethod}`)

    // Calculate accuracy
    const difference = Math.abs(result.totalVAT - expectedTotal)
    const accuracyPercentage = Math.max(0, 100 - (difference / expectedTotal) * 100)
    const passed = difference < 0.01 // Allow 1 cent difference

    // Validate report type detection
    if (reportType !== 'unknown' && result.reportType !== reportType) {
      warnings.push(`Report type mismatch: expected ${reportType}, got ${result.reportType}`)
    }

    // Validate extraction method
    if (reportType === 'country_summary' && !result.extractionMethod.includes('country')) {
      warnings.push(`Expected country-based extraction method for country summary report`)
    }

    if (reportType === 'order_detail' && !result.extractionMethod.includes('shipping') && !result.extractionMethod.includes('item')) {
      warnings.push(`Expected shipping/item tax extraction method for order detail report`)
    }

    // Check for country breakdown in country summary reports
    if (reportType === 'country_summary' && (!result.countryBreakdown || Object.keys(result.countryBreakdown).length === 0)) {
      warnings.push(`Country summary report should have country breakdown`)
    }

    // Confidence validation
    if (passed && result.confidence < 0.8) {
      warnings.push(`Low confidence (${Math.round(result.confidence * 100)}%) for accurate extraction`)
    }

    if (!passed && result.confidence > 0.8) {
      issues.push(`High confidence (${Math.round(result.confidence * 100)}%) for inaccurate extraction`)
    }

    // Accuracy thresholds
    if (accuracyPercentage < 95 && accuracyPercentage >= 90) {
      warnings.push(`Moderate accuracy: ${accuracyPercentage.toFixed(1)}%`)
    } else if (accuracyPercentage < 90) {
      issues.push(`Low accuracy: ${accuracyPercentage.toFixed(1)}%`)
    }

    const validationResult: ValidationResult = {
      file: fileName,
      expectedTotal,
      extractedTotal: result.totalVAT,
      difference,
      accuracyPercentage,
      passed,
      confidence: result.confidence,
      reportType: result.reportType,
      extractionMethod: result.extractionMethod,
      issues,
      warnings,
      timestamp
    }

    console.log('🧪 VALIDATION RESULTS:')
    console.log(`   ✅ Passed: ${passed}`)
    console.log(`   📊 Accuracy: ${accuracyPercentage.toFixed(1)}%`)
    console.log(`   🎯 Difference: €${difference.toFixed(2)}`)
    console.log(`   ⚠️ Issues: ${issues.length}`)
    console.log(`   ⚠️ Warnings: ${warnings.length}`)

    return validationResult

  } catch (error) {
    console.error('🚨 Validation failed:', error)
    
    return {
      file: fileName,
      expectedTotal,
      extractedTotal: 0,
      difference: expectedTotal,
      accuracyPercentage: 0,
      passed: false,
      confidence: 0,
      reportType: 'error',
      extractionMethod: 'failed',
      issues: [`Extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      warnings,
      timestamp
    }
  }
}

/**
 * Run validation tests against all known WooCommerce test cases
 */
export async function runWooCommerceValidationSuite(): Promise<ValidationSummary> {
  console.log('🧪 Starting WooCommerce Validation Suite')
  console.log(`   Test cases: ${WOOCOMMERCE_TEST_CASES.length}`)

  const results: ValidationResult[] = []
  
  for (const testCase of WOOCOMMERCE_TEST_CASES) {
    console.log(`\n🧪 Testing: ${testCase.fileName}`)
    console.log(`   Expected: €${testCase.expectedTotal}`)
    console.log(`   Type: ${testCase.reportType}`)
    
    try {
      // Note: In a real implementation, you would load the actual file
      // For now, we'll create a mock result
      const mockResult: ValidationResult = {
        file: testCase.fileName,
        expectedTotal: testCase.expectedTotal,
        extractedTotal: 0, // Would be populated from actual extraction
        difference: testCase.expectedTotal,
        accuracyPercentage: 0,
        passed: false,
        confidence: 0,
        reportType: 'mock',
        extractionMethod: 'mock_test',
        issues: ['Mock test - actual file processing not implemented'],
        warnings: [],
        timestamp: new Date()
      }
      
      results.push(mockResult)
      console.log(`   🔄 Mock result created (implement actual file processing)`)
      
    } catch (error) {
      console.error(`   🚨 Test failed: ${error}`)
    }
  }

  // Calculate summary statistics
  const totalTests = results.length
  const passedTests = results.filter(r => r.passed).length
  const failedTests = totalTests - passedTests
  
  const averageAccuracy = totalTests > 0 
    ? results.reduce((sum, r) => sum + r.accuracyPercentage, 0) / totalTests 
    : 0
    
  const averageConfidence = totalTests > 0
    ? results.reduce((sum, r) => sum + r.confidence, 0) / totalTests
    : 0

  const overallScore = (averageAccuracy + (averageConfidence * 100)) / 2

  // Collect issues and recommendations
  const allIssues = results.flatMap(r => r.issues)
  const allWarnings = results.flatMap(r => r.warnings)
  
  const recommendations: string[] = []
  
  if (passedTests < totalTests) {
    recommendations.push(`${failedTests} of ${totalTests} tests failed - review extraction logic`)
  }
  
  if (averageAccuracy < 95) {
    recommendations.push(`Average accuracy ${averageAccuracy.toFixed(1)}% is below 95% target`)
  }
  
  if (averageConfidence < 0.85) {
    recommendations.push(`Average confidence ${Math.round(averageConfidence * 100)}% is below 85% target`)
  }

  const summary: ValidationSummary = {
    totalTests,
    passedTests,
    failedTests,
    averageAccuracy,
    averageConfidence,
    overallScore,
    issues: Array.from(new Set(allIssues)), // Deduplicate
    recommendations
  }

  console.log('\n🧪 VALIDATION SUITE SUMMARY:')
  console.log(`   📊 Tests: ${passedTests}/${totalTests} passed`)
  console.log(`   📈 Average Accuracy: ${averageAccuracy.toFixed(1)}%`)
  console.log(`   🎯 Average Confidence: ${Math.round(averageConfidence * 100)}%`)
  console.log(`   ⭐ Overall Score: ${overallScore.toFixed(1)}`)
  console.log(`   ⚠️ Issues: ${summary.issues.length}`)
  console.log(`   💡 Recommendations: ${recommendations.length}`)

  return summary
}

/**
 * Validate standard VAT extraction (non-WooCommerce) against expected results
 */
export function validateVATExtraction(
  extractedData: ExtractedVATData,
  expectedSalesVAT: number[],
  expectedPurchaseVAT: number[],
  fileName: string = 'unknown'
): ValidationResult {
  const timestamp = new Date()
  const issues: string[] = []
  const warnings: string[] = []

  // Calculate totals
  const extractedSalesTotal = extractedData.salesVAT.reduce((sum, amt) => sum + amt, 0)
  const extractedPurchaseTotal = extractedData.purchaseVAT.reduce((sum, amt) => sum + amt, 0)
  const extractedTotal = extractedSalesTotal + extractedPurchaseTotal

  const expectedSalesTotal = expectedSalesVAT.reduce((sum, amt) => sum + amt, 0)
  const expectedPurchaseTotal = expectedPurchaseVAT.reduce((sum, amt) => sum + amt, 0)
  const expectedTotal = expectedSalesTotal + expectedPurchaseTotal

  // Calculate accuracy
  const difference = Math.abs(extractedTotal - expectedTotal)
  const accuracyPercentage = expectedTotal > 0 
    ? Math.max(0, 100 - (difference / expectedTotal) * 100)
    : (extractedTotal === 0 ? 100 : 0)
  
  const passed = difference < 0.01

  // Validate individual components
  const salesDifference = Math.abs(extractedSalesTotal - expectedSalesTotal)
  const purchaseDifference = Math.abs(extractedPurchaseTotal - expectedPurchaseTotal)

  if (salesDifference > 0.01) {
    issues.push(`Sales VAT mismatch: expected €${expectedSalesTotal}, got €${extractedSalesTotal}`)
  }

  if (purchaseDifference > 0.01) {
    issues.push(`Purchase VAT mismatch: expected €${expectedPurchaseTotal}, got €${extractedPurchaseTotal}`)
  }

  // Confidence validation
  if (extractedData.confidence < 0.5) {
    warnings.push(`Low confidence: ${Math.round(extractedData.confidence * 100)}%`)
  }

  // Document type validation
  if (extractedData.documentType === 'OTHER' && (extractedSalesTotal > 0 || extractedPurchaseTotal > 0)) {
    warnings.push(`Document type not classified but VAT amounts found`)
  }

  return {
    file: fileName,
    expectedTotal,
    extractedTotal,
    difference,
    accuracyPercentage,
    passed,
    confidence: extractedData.confidence,
    reportType: extractedData.documentType,
    extractionMethod: 'standard_vat_extraction',
    issues,
    warnings,
    timestamp
  }
}

/**
 * Create training data from validation results
 */
export function generateTrainingData(validationResults: ValidationResult[]): {
  successfulPatterns: string[]
  failedPatterns: string[]
  recommendedImprovements: string[]
} {
  const successfulPatterns: string[] = []
  const failedPatterns: string[] = []
  const recommendedImprovements: string[] = []

  const passedResults = validationResults.filter(r => r.passed)
  const failedResults = validationResults.filter(r => !r.passed)

  // Analyze successful patterns
  passedResults.forEach(result => {
    if (result.extractionMethod && result.confidence > 0.8) {
      successfulPatterns.push(`${result.extractionMethod} (${result.reportType}) - ${result.accuracyPercentage.toFixed(1)}% accuracy`)
    }
  })

  // Analyze failed patterns
  failedResults.forEach(result => {
    failedPatterns.push(`${result.extractionMethod} (${result.reportType}) - ${result.accuracyPercentage.toFixed(1)}% accuracy - ${result.issues.join(', ')}`)
  })

  // Generate recommendations
  if (failedResults.length > passedResults.length) {
    recommendedImprovements.push('More than 50% of tests failed - review core extraction logic')
  }

  const lowConfidenceResults = validationResults.filter(r => r.confidence < 0.7)
  if (lowConfidenceResults.length > validationResults.length * 0.3) {
    recommendedImprovements.push('More than 30% of extractions have low confidence - improve pattern detection')
  }

  const countryReports = validationResults.filter(r => r.reportType.includes('country'))
  if (countryReports.some(r => !r.passed)) {
    recommendedImprovements.push('Country summary report extraction needs improvement')
  }

  const orderReports = validationResults.filter(r => r.reportType.includes('order'))
  if (orderReports.some(r => !r.passed)) {
    recommendedImprovements.push('Order detail report extraction needs improvement')
  }

  return {
    successfulPatterns: Array.from(new Set(successfulPatterns)),
    failedPatterns: Array.from(new Set(failedPatterns)),
    recommendedImprovements: Array.from(new Set(recommendedImprovements))
  }
}

/**
 * Log validation results for monitoring and improvement
 */
export async function logValidationResult(result: ValidationResult): Promise<void> {
  try {
    console.log('📊 VALIDATION LOG:', {
      file: result.file,
      passed: result.passed,
      accuracy: `${result.accuracyPercentage.toFixed(1)}%`,
      confidence: `${Math.round(result.confidence * 100)}%`,
      method: result.extractionMethod,
      timestamp: result.timestamp.toISOString()
    })

    // In a real implementation, you would store this in a database
    // await prisma.validationLog.create({ data: result })
    
  } catch (error) {
    console.warn('Failed to log validation result:', error)
  }
}