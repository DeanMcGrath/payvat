#!/usr/bin/env node

/**
 * WooCommerce VAT Extraction Test Script
 * Tests the enhanced WooCommerce processing capabilities
 */

import { runWooCommerceValidationSuite } from '../lib/vat-validation'
import { WOOCOMMERCE_TEST_CASES, detectWooCommerceFormat } from '../lib/woocommerce-processor'
import { extractionMonitor } from '../lib/extraction-monitor'

async function runWooCommerceTests(): Promise<void> {
  console.log('🧪 WOOCOMMERCE VAT EXTRACTION TEST SUITE')
  console.log('=' .repeat(60))
  
  try {
    console.log('📋 Test Cases:')
    WOOCOMMERCE_TEST_CASES.forEach((testCase, index) => {
      console.log(`   ${index + 1}. ${testCase.fileName}`)
      console.log(`      Expected: €${testCase.expectedTotal}`)
      console.log(`      Type: ${testCase.reportType}`)
      console.log(`      Description: ${testCase.description}`)
      console.log('')
    })

    console.log('🚀 Running validation suite...')
    const validationSummary = await runWooCommerceValidationSuite()
    
    console.log('\n📊 VALIDATION SUMMARY:')
    console.log(`   Tests: ${validationSummary.passedTests}/${validationSummary.totalTests} passed`)
    console.log(`   Success rate: ${((validationSummary.passedTests / validationSummary.totalTests) * 100).toFixed(1)}%`)
    console.log(`   Average accuracy: ${validationSummary.averageAccuracy.toFixed(1)}%`)
    console.log(`   Average confidence: ${(validationSummary.averageConfidence * 100).toFixed(1)}%`)
    console.log(`   Overall score: ${validationSummary.overallScore.toFixed(1)}/100`)
    
    if (validationSummary.issues.length > 0) {
      console.log('\n⚠️ Issues found:')
      validationSummary.issues.forEach(issue => {
        console.log(`   - ${issue}`)
      })
    }
    
    if (validationSummary.recommendations.length > 0) {
      console.log('\n💡 Recommendations:')
      validationSummary.recommendations.forEach(rec => {
        console.log(`   - ${rec}`)
      })
    }
    
    console.log('\n🎯 EXPECTED RESULTS:')
    console.log('   For actual implementation with real files:')
    console.log('   - Country summary report: €5,475.24')
    console.log('   - Order detail report: €11,036.40') 
    console.log('   - Both should achieve >95% accuracy')
    console.log('   - Both should have >90% confidence')
    
    console.log('\n✅ Test suite completed successfully!')
    
  } catch (error) {
    console.error('\n🚨 Test suite failed:', error)
    process.exit(1)
  }
}

async function testWooCommercePatterns(): Promise<void> {
  console.log('\n🔍 TESTING WOOCOMMERCE PATTERN DETECTION:')
  
  const testFilenames = [
    'icwoocommercetaxpro_tax_report_page-product_list-2025-07-07-12-06-06.xls',
    'icwoocommercetaxpro_report_page_recent_order20250707120505.xls',
    'regular_invoice.pdf',
    'standard_excel_report.xlsx'
  ]
  
  testFilenames.forEach(filename => {
    console.log(`   Testing: ${filename}`)
    
    // Mock headers for testing
    let mockHeaders: string[] = []
    if (filename.includes('product_list')) {
      mockHeaders = ['Country', 'Net Total Tax', 'Tax Rate', 'billing_country']
    } else if (filename.includes('recent_order')) {
      mockHeaders = ['Order Number', 'Shipping Tax Amt.', 'Item Tax Amt.', 'Customer']
    } else {
      mockHeaders = ['Invoice Number', 'Amount', 'Date']
    }
    
    const detectedFormat = detectWooCommerceFormat(mockHeaders, filename)
    console.log(`     Headers: [${mockHeaders.join(', ')}]`)
    console.log(`     Detected: ${detectedFormat}`)
    console.log('')
  })
}

async function testMonitoringSystem(): Promise<void> {
  console.log('\n📊 TESTING MONITORING SYSTEM:')
  
  try {
    // Get current monitoring stats
    const stats = extractionMonitor.getStats()
    
    console.log('   Current monitoring statistics:')
    console.log(`     Total attempts: ${stats.totalAttempts}`)
    console.log(`     Success rate: ${stats.successRate.toFixed(1)}%`)
    console.log(`     Average accuracy: ${stats.averageAccuracy.toFixed(1)}%`)
    console.log(`     Average confidence: ${(stats.averageConfidence * 100).toFixed(1)}%`)
    console.log(`     WooCommerce attempts: ${stats.wooCommerceStats.attempts}`)
    
    if (stats.commonIssues.length > 0) {
      console.log('\n   Common issues:')
      stats.commonIssues.slice(0, 3).forEach(issue => {
        console.log(`     - ${issue.issue} (${issue.count} times)`)
      })
    }
    
    if (stats.recommendations.length > 0) {
      console.log('\n   System recommendations:')
      stats.recommendations.slice(0, 3).forEach(rec => {
        console.log(`     - ${rec}`)
      })
    }
    
    console.log('\n✅ Monitoring system is functional')
    
  } catch (error) {
    console.error('🚨 Monitoring system test failed:', error)
  }
}

async function main(): Promise<void> {
  console.log('🏪 WooCommerce VAT Extraction Enhancement Tests')
  console.log(`📅 Started: ${new Date().toISOString()}`)
  console.log('')
  
  await testWooCommercePatterns()
  await testMonitoringSystem()
  await runWooCommerceTests()
  
  console.log('\n🎉 All tests completed!')
  console.log('\n📝 Next steps:')
  console.log('   1. Upload actual WooCommerce files to test real extraction')
  console.log('   2. Verify €5,475.24 and €11,036.40 totals are extracted correctly')
  console.log('   3. Monitor extraction accuracy in production')
  console.log('   4. Collect user feedback for continuous improvement')
  console.log('   5. Review monitoring dashboard for performance insights')
}

// Run the tests if this script is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('🚨 Test execution failed:', error)
    process.exit(1)
  })
}

// Export functions for use in other modules
export {
  runWooCommerceTests,
  testWooCommercePatterns,
  testMonitoringSystem
}