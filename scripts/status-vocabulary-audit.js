#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const CORE_FILES = [
  'app/dashboard/documents/page.tsx',
  'app/dashboard/vat-returns/page.tsx',
  'app/dashboard/payments/page.tsx',
  'app/vat-submission/page.tsx'
]

const bannedPatterns = [
  { regex: /\bAI Processed\b/i, reason: 'Use "Processed" for customer-facing status vocabulary' },
  { regex: /\bAI Processing\b/i, reason: 'Use "Processing" for customer-facing status vocabulary' },
  { regex: /\bReturn Paid\b/i, reason: 'Use "Paid" in status badges' },
  { regex: /\bReturn Recorded\b/i, reason: 'Use "Submitted" in status badges' },
  { regex: /\bReturn Overdue\b/i, reason: 'Use "Blocked" in status badges when needed' }
]

const violations = []

for (const relativePath of CORE_FILES) {
  const fullPath = path.join(process.cwd(), relativePath)
  if (!fs.existsSync(fullPath)) {
    violations.push({
      file: relativePath,
      line: 0,
      text: 'File not found',
      reason: 'Core file missing from status vocabulary audit'
    })
    continue
  }

  const lines = fs.readFileSync(fullPath, 'utf8').split('\n')
  lines.forEach((line, index) => {
    for (const rule of bannedPatterns) {
      if (rule.regex.test(line)) {
        violations.push({
          file: relativePath,
          line: index + 1,
          text: line.trim(),
          reason: rule.reason
        })
      }
    }
  })
}

if (violations.length === 0) {
  console.log('Status vocabulary audit: PASS (no legacy core status labels found)')
  process.exit(0)
}

console.error(`Status vocabulary audit: FAIL (${violations.length} issue(s))`)
for (const v of violations) {
  console.error(`${v.file}:${v.line}`)
  console.error(`  Reason: ${v.reason}`)
  console.error(`  Text:   ${v.text}`)
}
process.exit(1)
