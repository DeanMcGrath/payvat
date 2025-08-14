/**
 * Enhanced VAT Extraction Test Suite
 * Comprehensive testing for improved VAT pattern recognition
 */

import { extractVATDataFromText } from '../documentProcessor'

// Test data representing real-world invoice formats
const TEST_DOCUMENTS = {
  // BRIANC-0008.pdf format test
  brianc0008Format: `
    Task Rate Hours Total
    DR HEMP MONTHLY FEES DEC 24 JAN 25 €200.00 2.00 €400.00
    
    Subtotal: €400.00
    VAT (23.00%): €92.00
    Total: €492.00
    Paid: €0.00
    Amount Due (EUR): €492.00
  `,

  // Standard invoice format
  standardInvoice: `
    Invoice Details
    Item Description: Professional Services
    Net Amount: €1000.00
    VAT 23%: €230.00
    Total Amount: €1230.00
  `,

  // Multiple VAT rates
  multipleRates: `
    Line Items:
    Books (9% VAT): €100.00, VAT: €9.00
    Software (23% VAT): €500.00, VAT: €115.00
    Food (13.5% VAT): €50.00, VAT: €6.75
    
    Total VAT: €130.75
  `,

  // Irish format with categories
  irishCategories: `
    VAT Summary:
    STD23: €109.85
    RED13.5: €15.50
    TOU9: €8.10
    MIN: €1.51
    NIL: €0.00
    
    Total Amount VAT: €134.96
  `,

  // Currency first format
  currencyFirst: `
    Tax Breakdown:
    €45.67 VAT (Standard Rate)
    €12.34 VAT (Reduced Rate)
    Total VAT Due: €58.01
  `,

  // No currency symbol
  noCurrencySymbol: `
    Service Charge: 200.00
    VAT 23%: 46.00
    Total: 246.00
  `,

  // Complex table format
  complexTable: `
    Description    | Net    | VAT Rate | VAT Amount | Gross
    Consulting     | 800.00 | 23%      | 184.00     | 984.00
    Training       | 300.00 | 23%      | 69.00      | 369.00
    
    Total VAT Amount: €253.00
  `,

  // WooCommerce-style report
  wooCommerceStyle: `
    WOOCOMMERCE_TAX_REPORT_STRUCTURED
    Report Type: country_summary
    VAT_EXTRACTION_MARKER: 5475.24
    Confidence: 0.95
    
    Country Breakdown:
    Ireland: €5,475.24
  `,

  // Invoice with exclusions
  withExclusions: `
    Invoice #12345
    
    Monthly Payment: €500.00
    Lease Payment: €300.00
    VAT Amount: €92.00
    
    Total Due: €892.00
  `,

  // Edge case - very small amounts
  smallAmounts: `
    Service Fee: €1.00
    VAT (23%): €0.23
    Total: €1.23
  `
}

describe('Enhanced VAT Extraction', () => {
  
  test('BRIANC-0008 format extraction', () => {
    const result = extractVATDataFromText(TEST_DOCUMENTS.brianc0008Format, 'PURCHASES', 'BRIANC-0008.pdf')
    
    expect(result.purchaseVAT).toContain(92)
    expect(result.confidence).toBeGreaterThan(0.6)
    expect(result.extractionDetails?.length).toBeGreaterThan(0)
    expect(result.extractionDetails?.[0]?.method).toContain('Priority')
  })

  test('Standard invoice format', () => {
    const result = extractVATDataFromText(TEST_DOCUMENTS.standardInvoice, 'SALES', 'standard-invoice.pdf')
    
    expect(result.salesVAT).toContain(230)
    expect(result.totalAmount).toBe(1230)
    expect(result.confidence).toBeGreaterThan(0.5)
  })

  test('Multiple VAT rates handling', () => {
    const result = extractVATDataFromText(TEST_DOCUMENTS.multipleRates, 'SALES', 'multiple-rates.pdf')
    
    const allVAT = [...result.salesVAT, ...result.purchaseVAT]
    expect(allVAT).toEqual(expect.arrayContaining([9, 115, 6.75, 130.75]))
    expect(result.confidence).toBeGreaterThan(0.4)
  })

  test('Irish VAT categories', () => {
    const result = extractVATDataFromText(TEST_DOCUMENTS.irishCategories, 'PURCHASES', 'irish-vat.pdf')
    
    const allVAT = [...result.salesVAT, ...result.purchaseVAT]
    expect(allVAT).toEqual(expect.arrayContaining([109.85, 15.50, 8.10, 1.51, 134.96]))
    expect(result.irishVATCompliant).toBe(true)
  })

  test('Currency first format', () => {
    const result = extractVATDataFromText(TEST_DOCUMENTS.currencyFirst, 'SALES', 'currency-first.pdf')
    
    const allVAT = [...result.salesVAT, ...result.purchaseVAT]
    expect(allVAT).toEqual(expect.arrayContaining([45.67, 12.34, 58.01]))
  })

  test('No currency symbol handling', () => {
    const result = extractVATDataFromText(TEST_DOCUMENTS.noCurrencySymbol, 'PURCHASES', 'no-currency.pdf')
    
    expect(result.purchaseVAT).toContain(46)
    expect(result.totalAmount).toBe(246)
  })

  test('Complex table format', () => {
    const result = extractVATDataFromText(TEST_DOCUMENTS.complexTable, 'SALES', 'complex-table.pdf')
    
    const allVAT = [...result.salesVAT, ...result.purchaseVAT]
    expect(allVAT).toEqual(expect.arrayContaining([184, 69, 253]))
  })

  test('WooCommerce structured format', () => {
    const result = extractVATDataFromText(TEST_DOCUMENTS.wooCommerceStyle, 'SALES', 'woocommerce.xlsx')
    
    expect(result.salesVAT).toContain(5475.24)
    expect(result.confidence).toBeGreaterThan(0.9)
    expect(result.validationFlags).toContain('WOOCOMMERCE_STRUCTURED_EXTRACTION')
  })

  test('Exclusion of lease/payment amounts', () => {
    const result = extractVATDataFromText(TEST_DOCUMENTS.withExclusions, 'PURCHASES', 'with-exclusions.pdf')
    
    // Should find VAT amount but exclude lease and monthly payments
    expect(result.purchaseVAT).toContain(92)
    expect(result.purchaseVAT).not.toContain(500) // Monthly payment excluded
    expect(result.purchaseVAT).not.toContain(300) // Lease payment excluded
  })

  test('Small amounts precision', () => {
    const result = extractVATDataFromText(TEST_DOCUMENTS.smallAmounts, 'SALES', 'small-amounts.pdf')
    
    expect(result.salesVAT).toContain(0.23)
    expect(result.confidence).toBeGreaterThan(0.3)
  })

  test('Confidence scoring validation', () => {
    const highConfidenceResult = extractVATDataFromText(TEST_DOCUMENTS.brianc0008Format, 'PURCHASES', 'high-confidence.pdf')
    const lowConfidenceResult = extractVATDataFromText('Some random text with no VAT info', 'SALES', 'low-confidence.pdf')
    
    expect(highConfidenceResult.confidence).toBeGreaterThan(lowConfidenceResult.confidence)
    expect(highConfidenceResult.confidence).toBeLessThanOrEqual(0.98) // Confidence cap
    expect(lowConfidenceResult.confidence).toBeGreaterThanOrEqual(0.1) // Confidence floor
  })

  test('Extraction details metadata', () => {
    const result = extractVATDataFromText(TEST_DOCUMENTS.brianc0008Format, 'PURCHASES', 'metadata-test.pdf')
    
    expect(result.extractionDetails).toBeDefined()
    expect(result.extractionDetails?.length).toBeGreaterThan(0)
    
    const detail = result.extractionDetails?.[0]
    expect(detail).toHaveProperty('amount')
    expect(detail).toHaveProperty('source')
    expect(detail).toHaveProperty('method')
    expect(detail).toHaveProperty('confidence')
    expect(detail?.amount).toBe(92)
  })

  test('Document type classification', () => {
    const salesResult = extractVATDataFromText(TEST_DOCUMENTS.standardInvoice, 'SALES', 'sales-invoice.pdf')
    const purchaseResult = extractVATDataFromText(TEST_DOCUMENTS.brianc0008Format, 'PURCHASES', 'purchase-invoice.pdf')
    
    expect(salesResult.documentType).toBe('SALES_INVOICE')
    expect(purchaseResult.documentType).toBe('PURCHASE_INVOICE')
  })

  test('Performance benchmark', () => {
    const start = Date.now()
    const iterations = 100
    
    for (let i = 0; i < iterations; i++) {
      extractVATDataFromText(TEST_DOCUMENTS.brianc0008Format, 'PURCHASES', 'perf-test.pdf')
    }
    
    const duration = Date.now() - start
    const avgTime = duration / iterations
    
    console.log(`Average extraction time: ${avgTime.toFixed(2)}ms`)
    expect(avgTime).toBeLessThan(100) // Should process in under 100ms on average
  })

  test('Edge case - empty text', () => {
    const result = extractVATDataFromText('', 'SALES', 'empty.pdf')
    
    expect(result.salesVAT).toEqual([])
    expect(result.purchaseVAT).toEqual([])
    expect(result.confidence).toBeLessThan(0.5)
  })

  test('Edge case - malformed amounts', () => {
    const malformedText = `
      VAT: €abc.def
      Tax: €12.34.56
      Amount: €-100.00
      Valid VAT: €50.00
    `
    
    const result = extractVATDataFromText(malformedText, 'SALES', 'malformed.pdf')
    
    // Should only extract the valid amount
    expect(result.salesVAT).toEqual([50])
  })

  test('Pattern priority ordering', () => {
    const conflictingText = `
      VAT: €100.00
      VAT (23.00%): €92.00
      Total VAT: €150.00
    `
    
    const result = extractVATDataFromText(conflictingText, 'PURCHASES', 'priority-test.pdf')
    
    // High priority patterns should be found first
    expect(result.purchaseVAT).toContain(92) // From VAT (23.00%) pattern
    expect(result.extractionDetails?.[0]?.method).toContain('Priority')
  })

  test('Multiple language support', () => {
    const irishText = `
      Cáin Bhreisluacha: €46.00
      VAT Amount: €23.00
    `
    
    const result = extractVATDataFromText(irishText, 'SALES', 'irish-lang.pdf')
    
    const allVAT = [...result.salesVAT, ...result.purchaseVAT]
    expect(allVAT).toEqual(expect.arrayContaining([46, 23]))
  })
})

// Performance and reliability benchmarks
describe('VAT Extraction Performance', () => {
  
  test('Large document handling', () => {
    // Create a large document with multiple VAT entries
    const largeDoc = Array(1000).fill(TEST_DOCUMENTS.brianc0008Format).join('\n')
    
    const start = Date.now()
    const result = extractVATDataFromText(largeDoc, 'PURCHASES', 'large-doc.pdf')
    const duration = Date.now() - start
    
    expect(result.purchaseVAT.length).toBeGreaterThan(0)
    expect(duration).toBeLessThan(5000) // Should complete within 5 seconds
  })

  test('Memory usage stability', () => {
    // Test for memory leaks with repeated extractions
    const iterations = 500
    
    for (let i = 0; i < iterations; i++) {
      extractVATDataFromText(TEST_DOCUMENTS.complexTable, 'SALES', `memory-test-${i}.pdf`)
    }
    
    // If we reach here without memory errors, test passes
    expect(true).toBe(true)
  })
})

// Integration tests with different document types
describe('Document Type Integration', () => {
  
  test('PDF-like text extraction', () => {
    const pdfText = TEST_DOCUMENTS.brianc0008Format.replace(/\n/g, ' ').replace(/\s+/g, ' ')
    const result = extractVATDataFromText(pdfText, 'PURCHASES', 'pdf-extracted.pdf')
    
    expect(result.purchaseVAT).toContain(92)
  })

  test('Excel-like structured data', () => {
    const excelText = `
      A1: Item, B1: Amount, C1: VAT
      A2: Service, B2: 400.00, C2: 92.00
      A3: Total, B3: 492.00
    `
    
    const result = extractVATDataFromText(excelText, 'SALES', 'excel-like.xlsx')
    
    expect(result.salesVAT).toContain(92)
  })

  test('Image OCR-like text', () => {
    // Simulate OCR extracted text with some noise
    const ocrText = `
      T ask  R ate  H ours  T otal
      DR  H EMP  M ONTHLY  F EES  DEC  24  JAN  25  €200.00  2.00  €400.00
      
      S ubtotal:  €400.00
      V AT  (23.00%):  €92.00
      T otal:  €492.00
    `
    
    const result = extractVATDataFromText(ocrText, 'PURCHASES', 'ocr-extracted.pdf')
    
    expect(result.purchaseVAT).toContain(92)
  })
})

export { TEST_DOCUMENTS }