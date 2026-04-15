#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const appRoot = path.join(process.cwd(), 'app')

const prohibitedPatterns = [
  { regex: /\bsubmit(?:ted|s|ting)?\s+(?:vat\s+returns?\s+)?directly\s+to\s+revenue\b/i, reason: 'Implies direct in-app Revenue filing' },
  { regex: /\bdirect\s+revenue\s+submission\b/i, reason: 'Implies direct in-app Revenue filing' },
  { regex: /\bone-?click\s+submission\b/i, reason: 'Implies direct filing completion without ROS handoff' },
  { regex: /\bautomated\s+revenue\s+submissions?\b/i, reason: 'Implies live Revenue submission automation' },
  { regex: /\bautomatic\s+vat3?\s+filing\b/i, reason: 'Implies live automatic ROS filing' },
  { regex: /\bros\s+submissions?\b/i, reason: 'Implies PayVAT performs ROS submission directly' },
  { regex: /\bsubmissions?\s+via\s+ros\b/i, reason: 'Implies PayVAT performs ROS submission directly' },
  { regex: /\brevenue\s+receipt\b/i, reason: 'Implies official ROS receipt from PayVAT artifacts' },
  { regex: /\bofficial\s+filing\s+(?:proof|receipt)\b/i, reason: 'Implies official filing proof/receipt' }
]

function listFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (['node_modules', '.next', '.git'].includes(entry.name)) continue
      files.push(...listFiles(fullPath))
      continue
    }
    if (/\.(ts|tsx)$/.test(entry.name)) {
      files.push(fullPath)
    }
  }
  return files
}

function lineMatches(filePath, regex) {
  const content = fs.readFileSync(filePath, 'utf8')
  const lines = content.split('\n')
  const matches = []
  for (let i = 0; i < lines.length; i++) {
    if (regex.test(lines[i])) {
      matches.push({
        line: i + 1,
        text: lines[i].trim()
      })
    }
  }
  return matches
}

const files = listFiles(appRoot)
const pageFiles = files.filter((file) => file.endsWith('page.tsx'))
const routeFiles = files.filter((file) => file.endsWith(path.join('route.ts')) || file.endsWith(path.join('route.tsx')))

const violations = []
for (const filePath of files) {
  for (const pattern of prohibitedPatterns) {
    const matches = lineMatches(filePath, pattern.regex)
    for (const match of matches) {
      violations.push({
        filePath,
        line: match.line,
        text: match.text,
        reason: pattern.reason
      })
    }
  }
}

console.log(`Route inventory: ${pageFiles.length} pages, ${routeFiles.length} route handlers`)

if (violations.length === 0) {
  console.log('Trust copy audit: PASS (0 prohibited claims found)')
  process.exit(0)
}

console.error(`Trust copy audit: FAIL (${violations.length} prohibited claim(s) found)\n`)
for (const violation of violations) {
  const rel = path.relative(process.cwd(), violation.filePath)
  console.error(`${rel}:${violation.line}`)
  console.error(`  Reason: ${violation.reason}`)
  console.error(`  Text:   ${violation.text}\n`)
}

process.exit(1)
