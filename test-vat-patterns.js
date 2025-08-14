#!/usr/bin/env node

/**
 * Quick VAT Pattern Test Runner
 * Tests the enhanced VAT extraction patterns without requiring full Jest setup
 */

// Simplified test framework for quick validation
let testCount = 0;
let passCount = 0;
let failCount = 0;

function test(description, testFn) {
  testCount++;
  try {
    testFn();
    console.log(`✅ ${testCount}. ${description}`);
    passCount++;
  } catch (error) {
    console.log(`❌ ${testCount}. ${description}`);
    console.log(`   Error: ${error.message}`);
    failCount++;
  }
}

function expect(actual) {
  return {
    toBe: (expected) => {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, got ${actual}`);
      }
    },
    toContain: (expected) => {
      if (!Array.isArray(actual) || !actual.includes(expected)) {
        throw new Error(`Expected array to contain ${expected}, got ${actual}`);
      }
    },
    toBeGreaterThan: (expected) => {
      if (actual <= expected) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`);
      }
    },
    toBeTruthy: () => {
      if (!actual) {
        throw new Error(`Expected ${actual} to be truthy`);
      }
    },
    toEqual: (expected) => {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
      }
    }
  };
}

// Enhanced VAT extraction function for testing
function extractVATFromText(text) {
  console.log('🔍 VAT EXTRACTION: Starting extraction from text');
  console.log('📄 Full text preview:', text.substring(0, 200) + '...');
  
  // Clean and normalize the text
  const cleanText = text.replace(/\s+/g, ' ').trim().toLowerCase();
  
  // Enhanced VAT patterns to match more formats
  const vatPatterns = [
    // Pattern 1: VAT (23.00%): €92.00 (for BRIANC-0008.pdf)
    { pattern: /VAT\s*\(([0-9.]+)%?\)\s*:\s*€([0-9,]+\.?[0-9]*)/gi, priority: 1 },
    
    // Pattern 2: VAT 23%: €92.00
    { pattern: /VAT\s*([0-9.]+)%?\s*:\s*€([0-9,]+\.?[0-9]*)/gi, priority: 1 },
    
    // Pattern 3: VAT: €92.00
    { pattern: /VAT\s*:\s*€([0-9,]+\.?[0-9]*)/gi, priority: 2 },
    
    // Pattern 4: Total VAT €92.00
    { pattern: /Total\s*VAT\s*€([0-9,]+\.?[0-9]*)/gi, priority: 1 },
    
    // Pattern 5: VAT Amount: €92.00
    { pattern: /VAT\s*Amount\s*:\s*€([0-9,]+\.?[0-9]*)/gi, priority: 1 },
    
    // Pattern 6: 23% VAT €92.00
    { pattern: /([0-9.]+)%?\s*VAT\s*€([0-9,]+\.?[0-9]*)/gi, priority: 2 },
    
    // Pattern 7: Tax €92.00
    { pattern: /Tax\s*€([0-9,]+\.?[0-9]*)/gi, priority: 3 },
    
    // Pattern 8: VAT 92.00 (without currency symbol)
    { pattern: /VAT\s*([0-9,]+\.?[0-9]*)/gi, priority: 4 },
    
    // Pattern 9: Multiple currency formats
    { pattern: /VAT[^0-9]*([0-9,]+\.?[0-9]*)/gi, priority: 4 },
    
    // Pattern 10: Line items with percentages
    { pattern: /([0-9.]+)%[^€]*€([0-9,]+\.?[0-9]*)/gi, priority: 3 }
  ];
  
  const extractedAmounts = [];
  
  // Try each pattern
  vatPatterns.forEach((patternObj, index) => {
    console.log(`🔍 Trying pattern ${index + 1}: ${patternObj.pattern}`);
    
    let match;
    const patternMatches = [];
    
    // Reset regex lastIndex for global patterns
    patternObj.pattern.lastIndex = 0;
    
    while ((match = patternObj.pattern.exec(cleanText)) !== null) {
      let amount;
      
      // Handle different capture group arrangements
      if (match.length === 3) {
        // Pattern like VAT (23%): €92.00 - amount is in group 2
        amount = parseFloat(match[2].replace(/,/g, ''));
      } else if (match.length === 2) {
        // Pattern like VAT: €92.00 - amount is in group 1
        amount = parseFloat(match[1].replace(/,/g, ''));
      }
      
      if (amount && amount > 0) {
        patternMatches.push({
          amount,
          match: match[0],
          fullMatch: match,
          pattern: index + 1,
          priority: patternObj.priority
        });
        
        console.log(`✅ Pattern ${index + 1} found: ${match[0]} → €${amount}`);
      }
    }
    
    extractedAmounts.push(...patternMatches);
  });
  
  // Remove duplicates and sort by priority, then amount (descending)
  const uniqueAmounts = extractedAmounts
    .filter((item, index, self) => 
      index === self.findIndex(t => Math.abs(t.amount - item.amount) < 0.01)
    )
    .sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return b.amount - a.amount;
    });
  
  console.log('📊 All extracted amounts:', uniqueAmounts);
  
  if (uniqueAmounts.length === 0) {
    console.log('❌ No VAT amounts found');
    return { amounts: [], confidence: 0 };
  }
  
  // Calculate confidence based on pattern strength and consistency
  let confidence = 0.6; // Base confidence
  
  // Higher confidence for high-priority patterns
  if (uniqueAmounts.some(item => item.priority <= 2)) {
    confidence = 0.8;
  }
  
  // Higher confidence if multiple patterns agree
  if (uniqueAmounts.length > 1) {
    const mainAmount = uniqueAmounts[0].amount;
    const similarAmounts = uniqueAmounts.filter(item => 
      Math.abs(item.amount - mainAmount) < 0.01
    );
    
    if (similarAmounts.length > 1) {
      confidence = Math.min(0.95, confidence + 0.1);
    }
  }
  
  const result = {
    amounts: uniqueAmounts.map(item => item.amount),
    confidence,
    details: uniqueAmounts,
    primaryAmount: uniqueAmounts[0].amount
  };
  
  console.log('✅ VAT extraction result:', result);
  return result;
}

// Test data
const TEST_DOCUMENTS = {
  brianc0008Format: `
    Task Rate Hours Total
    DR HEMP MONTHLY FEES DEC 24 JAN 25 €200.00 2.00 €400.00
    
    Subtotal: €400.00
    VAT (23.00%): €92.00
    Total: €492.00
    Paid: €0.00
    Amount Due (EUR): €492.00
  `,

  standardInvoice: `
    Invoice Details
    Item Description: Professional Services
    Net Amount: €1000.00
    VAT 23%: €230.00
    Total Amount: €1230.00
  `,

  irishCategories: `
    VAT Summary:
    STD23: €109.85
    RED13.5: €15.50
    TOU9: €8.10
    MIN: €1.51
    NIL: €0.00
    
    Total Amount VAT: €134.96
  `,

  currencyFirst: `
    Tax Breakdown:
    €45.67 VAT (Standard Rate)
    €12.34 VAT (Reduced Rate)
    Total VAT Due: €58.01
  `,

  noCurrencySymbol: `
    Service Charge: 200.00
    VAT 23%: 46.00
    Total: 246.00
  `
};

// Run tests
console.log('🧪 Starting Enhanced VAT Pattern Tests\n');

test('BRIANC-0008 format extraction', () => {
  const result = extractVATFromText(TEST_DOCUMENTS.brianc0008Format);
  expect(result.amounts).toContain(92);
  expect(result.confidence).toBeGreaterThan(0.6);
  expect(result.primaryAmount).toBe(92);
});

test('Standard invoice format', () => {
  const result = extractVATFromText(TEST_DOCUMENTS.standardInvoice);
  expect(result.amounts).toContain(230);
  expect(result.confidence).toBeGreaterThan(0.5);
});

test('Irish VAT categories', () => {
  const result = extractVATFromText(TEST_DOCUMENTS.irishCategories);
  expect(result.amounts.length).toBeGreaterThan(1);
  expect(result.amounts).toContain(134.96);
});

test('Currency first format', () => {
  const result = extractVATFromText(TEST_DOCUMENTS.currencyFirst);
  expect(result.amounts.length).toBeGreaterThan(1);
  expect(result.amounts).toContain(58.01);
});

test('No currency symbol handling', () => {
  const result = extractVATFromText(TEST_DOCUMENTS.noCurrencySymbol);
  expect(result.amounts).toContain(46);
});

test('Confidence scoring', () => {
  const highConfResult = extractVATFromText(TEST_DOCUMENTS.brianc0008Format);
  const result = extractVATFromText('Some random text with no VAT');
  
  expect(highConfResult.confidence).toBeGreaterThan(result.confidence);
});

test('Priority ordering', () => {
  const conflictText = `
    VAT: €100.00
    VAT (23.00%): €92.00
    Total VAT: €150.00
  `;
  
  const result = extractVATFromText(conflictText);
  // High priority pattern (VAT (23.00%)) should be primary
  expect(result.primaryAmount).toBe(92);
});

test('Empty text handling', () => {
  const result = extractVATFromText('');
  expect(result.amounts).toEqual([]);
  expect(result.confidence).toBe(0);
});

// Performance test
test('Performance benchmark', () => {
  const start = Date.now();
  const iterations = 100;
  
  for (let i = 0; i < iterations; i++) {
    extractVATFromText(TEST_DOCUMENTS.brianc0008Format);
  }
  
  const duration = Date.now() - start;
  const avgTime = duration / iterations;
  
  console.log(`   ⏱️  Average extraction time: ${avgTime.toFixed(2)}ms`);
  expect(avgTime < 50).toBeTruthy(); // Should be fast
});

// Summary
console.log('\n📊 Test Summary:');
console.log(`✅ Passed: ${passCount}`);
console.log(`❌ Failed: ${failCount}`);
console.log(`📋 Total: ${testCount}`);

if (failCount === 0) {
  console.log('\n🎉 All tests passed! Enhanced VAT patterns are working correctly.');
} else {
  console.log('\n⚠️  Some tests failed. Please review the enhanced patterns.');
  process.exit(1);
}