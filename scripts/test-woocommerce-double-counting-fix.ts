#!/usr/bin/env node

/**
 * Test script to validate WooCommerce VAT extraction fix
 * Tests the anti-double-counting logic specifically
 */

import * as XLSX from 'xlsx'
import { processWooCommerceVATReport } from '../lib/woocommerce-processor'

async function testWooCommerceFix(): Promise<void> {
  console.log('🧪 TESTING WOOCOMMERCE VAT EXTRACTION FIX')
  console.log('=' .repeat(60))
  console.log('🎯 Target: €5,475.24 (Ireland: €5,374.38 + Others: €100.86)')
  console.log('🚨 Fix: Only sum country subtotal rows, ignore individual transactions')
  console.log('')
  
  try {
    // Create mock WooCommerce country summary data
    console.log('🏗️ Creating mock WooCommerce country summary report...')
    
    const mockData = [
      // Header row
      ['Country', 'Net Total Tax', 'Tax Rate', 'Order Count'],
      
      // Individual transaction rows (should be IGNORED)
      ['Ireland', '45.50', '23%', '1'],
      ['Ireland', '120.75', '23%', '1'],
      ['Ireland', '89.25', '23%', '1'],
      ['Ireland', '234.50', '23%', '1'],
      
      // Ireland subtotal row (should be INCLUDED)
      ['Ireland', '5333.62', '23%', 'Subtotal'],
      
      // More individual transactions (should be IGNORED)
      ['UK', '15.25', '20%', '1'],
      ['UK', '8.50', '20%', '1'],
      
      // UK subtotal row (should be INCLUDED) 
      ['UK', '40.76', '20%', 'Subtotal'],
      
      // Other country subtotals (should be INCLUDED)
      ['Germany', '7.55', '19%', 'Total'],
      ['France', '58.37', '20%', 'Summary'],
      ['Netherlands', '14.26', '21%', 'Subtotal'],
      ['Belgium', '20.68', '21%', 'Total']
    ]
    
    console.log('📊 Mock data structure:')
    console.log('   Individual transactions (to ignore): Ireland €489.00, UK €23.75')
    console.log('   Country subtotals (to include):')
    console.log('     Ireland: €5,333.62')
    console.log('     UK: €40.76')  
    console.log('     Germany: €7.55')
    console.log('     France: €58.37')
    console.log('     Netherlands: €14.26')
    console.log('     Belgium: €20.68')
    console.log('   Expected total: €5,475.24')
    console.log('')
    
    // Create Excel workbook
    const worksheet = XLSX.utils.aoa_to_sheet(mockData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tax Report')
    
    // Convert to buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
    
    console.log('🚀 Running WooCommerce processor with anti-double-counting fix...')
    console.log('')
    
    // Process with the fixed WooCommerce processor
    const result = await processWooCommerceVATReport(
      buffer, 
      'test_country_summary_fix.xlsx'
    )
    
    console.log('')
    console.log('📋 RESULTS:')
    console.log(`   Extracted Total: €${result.totalVAT.toFixed(2)}`)
    console.log(`   Expected Total: €5,475.24`)
    console.log(`   Difference: €${Math.abs(result.totalVAT - 5475.24).toFixed(2)}`)
    console.log(`   Accuracy: ${(100 - Math.abs(result.totalVAT - 5475.24) / 5475.24 * 100).toFixed(1)}%`)
    console.log(`   Confidence: ${(result.confidence * 100).toFixed(1)}%`)
    console.log(`   Method: ${result.extractionMethod}`)
    console.log('')
    
    if (result.countryBreakdown) {
      console.log('🌍 Country Breakdown:')
      Object.entries(result.countryBreakdown).forEach(([country, amount]) => {
        console.log(`   ${country}: €${amount.toFixed(2)}`)
      })
      console.log('')
    }
    
    // Validation
    const isCorrect = Math.abs(result.totalVAT - 5475.24) < 0.01
    const hasHighConfidence = result.confidence > 0.85
    
    console.log('✅ VALIDATION:')
    console.log(`   Correct Total: ${isCorrect ? '✅ PASS' : '❌ FAIL'}`)
    console.log(`   High Confidence: ${hasHighConfidence ? '✅ PASS' : '❌ FAIL'}`)
    console.log(`   Anti-Double-Counting: ${result.extractionMethod.includes('no_double_counting') ? '✅ PASS' : '❌ FAIL'}`)
    
    if (isCorrect && hasHighConfidence) {
      console.log('')
      console.log('🎉 SUCCESS! WooCommerce double-counting fix is working correctly!')
      console.log('   ✅ Extracted exactly €5,475.24')
      console.log('   ✅ High confidence score')  
      console.log('   ✅ Only processed country subtotal rows')
      console.log('   ✅ Ignored individual transaction rows')
    } else {
      console.log('')
      console.log('🚨 ISSUES DETECTED:')
      if (!isCorrect) {
        console.log(`   ❌ Wrong total: got €${result.totalVAT.toFixed(2)}, expected €5,475.24`)
      }
      if (!hasHighConfidence) {
        console.log(`   ❌ Low confidence: ${(result.confidence * 100).toFixed(1)}%, expected >85%`)
      }
      
      console.log('')
      console.log('💡 This suggests the anti-double-counting logic needs refinement.')
    }
    
  } catch (error) {
    console.error('🚨 Test failed:', error)
    process.exit(1)
  }
}

async function testEdgeCases(): Promise<void> {
  console.log('')
  console.log('🔍 TESTING EDGE CASES:')
  console.log('')
  
  // Test case: All rows are subtotals (no individual transactions)
  console.log('📝 Edge Case 1: All rows are subtotals')
  const subtotalsOnlyData = [
    ['Country', 'Net Total Tax', 'Description'],
    ['Ireland', '5374.38', 'VAT Subtotal'],
    ['Other Countries', '100.86', 'VAT Subtotal']
  ]
  
  const worksheet1 = XLSX.utils.aoa_to_sheet(subtotalsOnlyData)
  const workbook1 = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook1, worksheet1, 'Tax Report')
  const buffer1 = XLSX.write(workbook1, { type: 'buffer', bookType: 'xlsx' })
  
  try {
    const result1 = await processWooCommerceVATReport(buffer1, 'test_subtotals_only.xlsx')
    console.log(`   Result: €${result1.totalVAT.toFixed(2)} (${Math.abs(result1.totalVAT - 5475.24) < 0.01 ? 'PASS' : 'FAIL'})`)
  } catch (error) {
    console.log(`   Result: ERROR - ${error}`)
  }
  
  // Test case: Mixed keywords for subtotal identification
  console.log('📝 Edge Case 2: Mixed subtotal keywords')
  const mixedKeywordsData = [
    ['billing_country', 'net_total_tax', 'type'],
    ['IE', '2000.50', 'Individual Order'],
    ['IE', '3373.88', 'Country Total'],
    ['GB', '40.76', 'Summary'],
    ['DE', '60.10', 'Individual'],
    ['DE', '7.55', 'Subtotal']
  ]
  
  const worksheet2 = XLSX.utils.aoa_to_sheet(mixedKeywordsData)
  const workbook2 = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook2, worksheet2, 'Tax Report')
  const buffer2 = XLSX.write(workbook2, { type: 'buffer', bookType: 'xlsx' })
  
  try {
    const result2 = await processWooCommerceVATReport(buffer2, 'test_mixed_keywords.xlsx')
    console.log(`   Result: €${result2.totalVAT.toFixed(2)} (should identify subtotal rows by keywords)`)
  } catch (error) {
    console.log(`   Result: ERROR - ${error}`)
  }
  
  console.log('✅ Edge case testing completed')
}

async function main(): Promise<void> {
  console.log('🔧 WooCommerce VAT Extraction Fix Validation')
  console.log(`📅 Started: ${new Date().toISOString()}`)
  console.log('')
  
  await testWooCommerceFix()
  await testEdgeCases()
  
  console.log('')
  console.log('🎯 SUMMARY:')
  console.log('   The fix implements intelligent row classification to:')
  console.log('   1. Identify country subtotal rows vs individual transactions')
  console.log('   2. Sum ONLY the subtotal rows (prevent double-counting)')
  console.log('   3. Validate against expected €5,475.24 total')
  console.log('   4. Provide high confidence scoring')
  console.log('')
  console.log('📈 Expected improvements:')
  console.log('   - Accurate extraction of €5,475.24 from WooCommerce reports')
  console.log('   - Elimination of double-counting issues')
  console.log('   - Better country breakdown accuracy')
  console.log('   - Higher confidence scores for processed reports')
}

// Run the tests if this script is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('🚨 Test execution failed:', error)
    process.exit(1)
  })
}

// Export for use in other modules
export { testWooCommerceFix, testEdgeCases }