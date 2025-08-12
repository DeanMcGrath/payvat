#!/usr/bin/env node

/**
 * Test script to verify WooCommerce VAT extraction fix
 * Expected: €5,475.24 for country tax reports
 */

import { extractTextFromExcel, extractVATDataFromText } from '../lib/documentProcessor'
import { processWooCommerceVATReport } from '../lib/woocommerce-processor'
import * as XLSX from 'xlsx'

// Test data simulating WooCommerce country tax report structure
function createTestWooCommerceData(): Buffer {
  const data = [
    ['Country', 'Tax Rate', 'Gross Total', 'Net Total Tax'],
    ['Ireland', '23%', '32.85', '7.55'],
    ['United Kingdom', '20%', '203.80', '40.76'],
    ['Germany', '19%', '28073.26', '5333.62'],
    ['France', '20%', '291.85', '58.37'],
    ['Spain', '21%', '67.90', '14.26'],
    ['Italy', '22%', '94.00', '20.68']
  ]
  
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(data)
  XLSX.utils.book_append_sheet(wb, ws, 'Tax Report')
  
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
}

async function testWooCommerceFix(): Promise<void> {
  console.log('🧪 TESTING WOOCOMMERCE VAT EXTRACTION FIX')
  console.log('=' .repeat(60))
  
  try {
    // Create test data
    const testBuffer = createTestWooCommerceData()
    const base64Data = testBuffer.toString('base64')
    
    // Test filenames
    const testFiles = [
      'icwoocommercetaxpro_tax_report_page-product_list-2025-07-07-12-06-06.xls',
      'woocommerce_tax_report.xlsx',
      'regular_excel.xlsx'
    ]
    
    for (const fileName of testFiles) {
      console.log(`\n📄 Testing file: ${fileName}`)
      console.log('-'.repeat(40))
      
      // Test 1: Direct WooCommerce processor
      if (fileName.includes('woocommerce') || fileName.includes('icwoocommercetaxpro')) {
        console.log('🏪 Test 1: Direct WooCommerce processor')
        try {
          const wooResult = await processWooCommerceVATReport(testBuffer, fileName)
          console.log(`   Total VAT: €${wooResult.totalVAT}`)
          console.log(`   Expected: €5,475.24`)
          console.log(`   Match: ${Math.abs(wooResult.totalVAT - 5475.24) < 0.01 ? '✅ YES' : '❌ NO'}`)
          console.log(`   Report type: ${wooResult.reportType}`)
          console.log(`   Confidence: ${(wooResult.confidence * 100).toFixed(0)}%`)
        } catch (error) {
          console.error('   Error:', error)
        }
      }
      
      // Test 2: Excel text extraction route
      console.log('\n📊 Test 2: Excel text extraction route')
      try {
        const textResult = await extractTextFromExcel(base64Data, fileName)
        if (textResult.success && textResult.text) {
          console.log(`   Text extraction: ${textResult.success ? '✅ Success' : '❌ Failed'}`)
          console.log(`   Contains WooCommerce marker: ${textResult.text.includes('WOOCOMMERCE_TAX_REPORT_STRUCTURED') ? '✅ YES' : '❌ NO'}`)
          
          if (textResult.text.includes('VAT_EXTRACTION_MARKER')) {
            const markerMatch = textResult.text.match(/VAT_EXTRACTION_MARKER:\s*([\d.]+)/)
            if (markerMatch) {
              const extractedVAT = parseFloat(markerMatch[1])
              console.log(`   Extracted VAT: €${extractedVAT}`)
              console.log(`   Expected: €5,475.24`)
              console.log(`   Match: ${Math.abs(extractedVAT - 5475.24) < 0.01 ? '✅ YES' : '❌ NO'}`)
            }
          }
          
          // Test 3: VAT data extraction from text
          console.log('\n💰 Test 3: VAT data extraction from text')
          const vatData = extractVATDataFromText(textResult.text, 'SALES', fileName)
          const totalVAT = [...vatData.salesVAT, ...vatData.purchaseVAT].reduce((sum, val) => sum + val, 0)
          console.log(`   Total VAT extracted: €${totalVAT.toFixed(2)}`)
          console.log(`   Expected: €5,475.24`)
          console.log(`   Match: ${Math.abs(totalVAT - 5475.24) < 0.01 ? '✅ YES' : '❌ NO'}`)
          console.log(`   Confidence: ${(vatData.confidence * 100).toFixed(0)}%`)
          console.log(`   Processing method: ${vatData.processingMethod}`)
          console.log(`   Validation flags: ${vatData.validationFlags.join(', ')}`)
        } else {
          console.log(`   Text extraction failed: ${textResult.error}`)
        }
      } catch (error) {
        console.error('   Error:', error)
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 EXPECTED RESULTS SUMMARY:')
    console.log('   Country tax report (product_list): €5,475.24')
    console.log('   Calculation: 7.55 + 40.76 + 5333.62 + 58.37 + 14.26 + 20.68')
    console.log('   This fix ensures WooCommerce files use specialized processing')
    console.log('   instead of generic text extraction that sums all numbers.')
    
    console.log('\n✅ Test completed successfully!')
    
  } catch (error) {
    console.error('🚨 Test failed:', error)
    process.exit(1)
  }
}

// Run the test
if (require.main === module) {
  testWooCommerceFix().catch(error => {
    console.error('🚨 Test execution failed:', error)
    process.exit(1)
  })
}

export { testWooCommerceFix }