#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const pdfParse = require('pdf-parse')

const TOLERANCE = 0.05

const fixtures = [
  { file: '3 -JAn.pdf', vendor: 'Three Ireland', invoiceDate: '2026-01-09', totalOnDoc: 73.8, vatAmount: 11.37 },
  { file: '3- Feb.pdf', vendor: 'Three Ireland', invoiceDate: '2026-02-09', totalOnDoc: 74.1, vatAmount: 11.43 },
  { file: '13924638First_Invoice_IE_IN_001.pdf', totalOnDoc: 610.5, vatAmount: 111.36 },
  { file: '5503236375.pdf', invoiceDate: '2026-02-28', totalOnDoc: 39.85, vatAmount: 7.45 },
  { file: '5479963115.pdf', invoiceDate: '2026-01-31', totalOnDoc: 39.85, vatAmount: 7.45 },
  { file: 'SIN-100409.pdf', invoiceDate: '2026-01-08', totalOnDoc: 1190.16, vatAmount: 222.55 },
  { file: 'invoice 37663.pdf', invoiceDate: '2025-12-16', totalOnDoc: 49.2, vatAmount: 9.2 },
  { file: 'BRIANC-0006.pdf', invoiceDate: '2024-09-26', totalOnDoc: 492.0, vatAmount: 92.0 }
]

function parseMoney(raw) {
  if (!raw) return null
  const normalized = String(raw).replace(/€/g, '').replace(/,/g, '').replace(/\s/g, '')
  const value = Number(normalized)
  return Number.isFinite(value) ? Math.round(value * 100) / 100 : null
}

function parseDate(text) {
  const monthMap = {
    jan: '01', january: '01',
    feb: '02', february: '02',
    mar: '03', march: '03',
    apr: '04', april: '04',
    may: '05',
    jun: '06', june: '06',
    jul: '07', july: '07',
    aug: '08', august: '08',
    sep: '09', september: '09',
    oct: '10', october: '10',
    nov: '11', november: '11',
    dec: '12', december: '12'
  }
  const patterns = [
    /invoice date\s*[:\s]*([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4})/i,
    /bill date\s*[:\s]*([0-9]{1,2}\s+[a-z]{3,9}\s+[0-9]{2,4})/i,
    /document date\s*[:\s]*([0-9]{1,2}\s+[a-z]{3,9}\s+[0-9]{2,4})/i,
    /document date\s*[:\s]*([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4})/i,
    /issue date\s*[:\s]*([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4})/i,
    /([a-z]{3,9}\s+[0-9]{1,2},\s+[0-9]{4})/i,
    /([0-9]{1,2}\s+[a-z]{3,9}\s+[0-9]{2,4})/i,
    /([0-9]{1,2}\s+[a-z]{3,9}\s+[0-9]{4})/i,
    /\b([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4})\b/,
    /\b([0-9]{4}-[0-9]{2}-[0-9]{2})\b/
  ]
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (!match || !match[1]) continue
    const raw = match[1]
    const monthNameFirst = raw.match(/([a-z]{3,9})\s+([0-9]{1,2}),\s*([0-9]{4})/i)
    if (monthNameFirst) {
      const month = monthMap[monthNameFirst[1].toLowerCase()]
      if (month) return `${monthNameFirst[3]}-${month}-${monthNameFirst[2].padStart(2, '0')}`
    }
    const dayMonthName = raw.match(/([0-9]{1,2})\s+([a-z]{3,9})\s+([0-9]{2,4})/i)
    if (dayMonthName) {
      const month = monthMap[dayMonthName[2].toLowerCase()]
      const year = dayMonthName[3].length === 2 ? `20${dayMonthName[3]}` : dayMonthName[3]
      if (month) return `${year}-${month}-${dayMonthName[1].padStart(2, '0')}`
    }
    if (raw.includes('-') && raw.length === 10 && raw.indexOf('-') === 4) return raw
    const parts = raw.split(/[\/\-]/)
    if (parts.length !== 3) continue
    const [day, month, yearRaw] = parts
    const year = yearRaw.length === 2 ? `20${yearRaw}` : yearRaw
    const iso = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    const parsed = new Date(iso)
    if (!Number.isNaN(parsed.getTime())) return iso
  }
  return null
}

function extractFromText(text) {
  const compact = text.replace(/\u00a0/g, ' ').replace(/\r/g, '')
  const normalized = compact.toLowerCase().replace(/\s+/g, ' ').trim()
  const isThree = /three ireland|this month'?s invoice/i.test(compact)
  const isGoogle = /google workspace|google cloud emea/i.test(compact)
  const isVW = /volkswagen financial|invoice amount including vat/i.test(compact)
  const isCCOrTas = /callcentre solutions|tas consulting|brianc-/i.test(compact)

  const quickMoney = (raw) => parseMoney((raw || '').replace(/[¤]/g, '€'))

  if (isThree) {
    const vat = quickMoney(compact.match(/vat at\s*([0-9.,\s]+)\s*23%/i)?.[1])
    const total = quickMoney(compact.match(/this month'?s invoice\s*\(incl\.?\s*vat\)\s*[:\s]*[€¤]?([0-9.,\s]+)/i)?.[1])
    const date = parseDate(
      compact.match(/([0-9]{1,2}\s+[a-z]{3,9}\s+[0-9]{2,4})\s+your bill number/i)?.[1]
      || compact.match(/bill date[^0-9]{0,40}([0-9]{1,2}\s+[a-z]{3,9}\s+[0-9]{2,4})/i)?.[1]
      || compact.match(/payments received by\s+([0-9]{1,2}\s+[a-z]{3,9}\s+[0-9]{2,4})/i)?.[1]
      || compact
    )
    const reasons = []
    if (!date) reasons.push('invoice date missing')
    if (!total) reasons.push('invoice total missing')
    if (!vat) reasons.push('VAT amount missing')
    return { invoiceDate: date, totalOnDoc: total, vatAmount: vat, status: reasons.length ? 'needs_review' : 'processed', reasons }
  }

  if (isGoogle) {
    const totalsTriple = compact.match(/total in eur\s*[€¤]?([0-9.,]+)\s*[€¤]?([0-9.,]+)\s*[€¤]?([0-9.,]+)/i)
    const total = quickMoney(totalsTriple?.[3])
    const vat = quickMoney(totalsTriple?.[2] || compact.match(/vat\s*\(23%\)\s*[€¤]?([0-9.,]+)/i)?.[1])
    const date = parseDate(compact.match(/invoice date[^0-9a-z]{0,20}([a-z]{3,9}\s+\d{1,2},\s+\d{4}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i)?.[1] || compact)
    const reasons = []
    if (!date) reasons.push('invoice date missing')
    if (!total) reasons.push('invoice total missing')
    if (!vat) reasons.push('VAT amount missing')
    return { invoiceDate: date, totalOnDoc: total, vatAmount: vat, status: reasons.length ? 'needs_review' : 'processed', reasons }
  }

  if (isVW) {
    let vat = quickMoney(compact.match(/total amount vat[^0-9€¤]{0,30}[€¤]?([0-9.,]+)/i)?.[1])
      || quickMoney(compact.match(/([0-9.,]+)\s*total amount vat/i)?.[1])
    const euroAmounts = [...compact.matchAll(/[€¤]\s*([0-9]+\.[0-9]{2})/g)].map(m => quickMoney(m[1])).filter(Boolean)
    const total = quickMoney(compact.match(/invoice amount including vat[^0-9€¤]{0,30}[€¤]?([0-9.,]+)/i)?.[1])
      || quickMoney(compact.match(/€\s*([0-9.,]+)\s*contract\/vehicle registration number/i)?.[1])
      || (euroAmounts.length ? Math.max(...euroAmounts) : null)
    const date = parseDate(
      compact.match(/invoice date[^0-9]{0,40}([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4})/i)?.[1]
      || compact.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/)?.[1]
      || compact
    )
    if (total && (!vat || vat > total * 0.6)) {
      const candidates = euroAmounts.filter(a => a > 0 && a < total * 0.5)
      if (candidates.length) {
        const target = total * 0.23
        candidates.sort((a, b) => Math.abs(a - target) - Math.abs(b - target))
        vat = candidates[0]
      }
    }
    const reasons = []
    if (!date) reasons.push('invoice date missing')
    if (!total) reasons.push('invoice total missing')
    if (!vat) reasons.push('VAT amount missing')
    return { invoiceDate: date, totalOnDoc: total, vatAmount: vat, status: reasons.length ? 'needs_review' : 'processed', reasons }
  }

  if (/sin-\d+/i.test(compact)) {
    const vatCandidates = [
      ...compact.matchAll(/\bvat\s*amount\b\D{0,40}([0-9]+(?:[.,][0-9]{2})?)/gi),
      ...compact.matchAll(/\bvat\s*amount\b([0-9]+(?:[.,][0-9]{2})?)/gi)
    ].map((match) => quickMoney(match[1])).filter((value) => typeof value === 'number')
    const total = quickMoney(compact.match(/total\s*[€¤]?\s*incl\.?\s*vat[^0-9€¤]{0,20}[€¤]?\s*([0-9.,]+)/i)?.[1])
      || quickMoney(compact.match(/total[^0-9€¤]{0,15}[€¤]\s*incl\.?\s*vat[^0-9€¤]{0,20}([0-9.,]+)/i)?.[1])
    const subtotal = quickMoney(compact.match(/subtotal[^0-9€¤]{0,20}[€¤]?\s*([0-9.,]+)/i)?.[1])
    let vat = vatCandidates.length > 0 ? vatCandidates[vatCandidates.length - 1] : null
    if (total && vatCandidates.length > 0) {
      const plausibleVatCandidates = vatCandidates.filter((value) => value > 0 && value < total * 0.6)
      if (plausibleVatCandidates.length > 0) {
        const target = total * 0.23
        plausibleVatCandidates.sort((a, b) => Math.abs(a - target) - Math.abs(b - target))
        vat = plausibleVatCandidates[0]
      }
    }
    if (!vat && subtotal && total && total > subtotal) {
      const derivedVat = Math.round((total - subtotal) * 100) / 100
      if (derivedVat > 0 && derivedVat < total * 0.6) {
        vat = derivedVat
      }
    }
    const date = parseDate(
      compact.match(/document date[^0-9]{0,20}([0-9]{1,2}\s+[a-z]{3,9}\s+[0-9]{2,4})/i)?.[1]
      || compact.match(/invoice date[^0-9]{0,20}([0-9]{1,2}\s+[a-z]{3,9}\s+[0-9]{2,4})/i)?.[1]
      || compact
    )
    const reasons = []
    if (!date) reasons.push('invoice date missing')
    if (!total) reasons.push('invoice total missing')
    if (!vat) reasons.push('VAT amount missing')
    return { invoiceDate: date, totalOnDoc: total, vatAmount: vat, status: reasons.length ? 'needs_review' : 'processed', reasons }
  }

  if (isCCOrTas) {
    const vat = quickMoney(compact.match(/vat[^0-9]{0,12}23%[^0-9]{0,12}([0-9]+\.[0-9]{2})/i)?.[1])
      || quickMoney(compact.match(/vat\s*\(23\.?0*%?\)\s*[:\s]*[€¤]?([0-9.,]+)/i)?.[1])
    const total = quickMoney(compact.match(/total now due\s*[€¤]?([0-9.,]+)/i)?.[1])
      || quickMoney(compact.match(/\btotal\b:\s*[€¤]?([0-9.,]+)/i)?.[1])
      || quickMoney(compact.match(/invoice total\s*[:\s]*[€¤]?([0-9.,]+)/i)?.[1])
      || quickMoney(compact.match(/amount due\s*\(eur\)\s*[:\s]*[€¤]?([0-9.,]+)/i)?.[1])
      || quickMoney(compact.match(/[€¤]\s*([0-9]+\.[0-9]{2})\s*terms/i)?.[1])
    const date = parseDate(compact.match(/invoice date[:\s]*([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4})/i)?.[1] || compact)
    const reasons = []
    if (!date) reasons.push('invoice date missing')
    if (!total) reasons.push('invoice total missing')
    if (!vat) reasons.push('VAT amount missing')
    return { invoiceDate: date, totalOnDoc: total, vatAmount: vat, status: reasons.length ? 'needs_review' : 'processed', reasons }
  }

  const vatPatterns = [
    /total amount vat[:\s]*€?([0-9,\s]+\.?[0-9]*)/gi,
    /vat amount[:\s]*€?([0-9,\s]+\.?[0-9]*)/gi,
    /vat at\s*23%[:\s]*€?([0-9,\s]+\.?[0-9]*)/gi,
    /\+\s*vat\s*\(23%?\)\s*[:\s]*€?([0-9,\s]+\.?[0-9]*)/gi,
    /vat\s*\(23\.?0?0?%?\)[:\s]*€?([0-9,\s]+\.?[0-9]*)/gi,
    /vat\s*\([0-9.]+%?\)[:\s]*€?([0-9,\s]+\.?[0-9]*)/gi,
    /\bvat[:\s]*€([0-9,\s]+\.?[0-9]*)/gi
  ]

  const totalPatterns = [
    /this month'?s invoice\s*\(incl\.?\s*vat\)\s*[:\s]*€?([0-9,\s]+\.?[0-9]*)/gi,
    /invoice total[:\s]*€?([0-9,\s]+\.?[0-9]*)/gi,
    /total\s*[€¤]?\s*incl\.?\s*vat[:\s]*€?([0-9,\s]+\.?[0-9]*)/gi,
    /total incl(?:uding)? vat[:\s]*€?([0-9,\s]+\.?[0-9]*)/gi,
    /total\s*incl(?:uding)?\s*vat[:\s]*€?([0-9,\s]+\.?[0-9]*)/gi,
    /total now due[:\s]*€?([0-9,\s]+\.?[0-9]*)/gi,
    /amount due[:\s]*€?([0-9,\s]+\.?[0-9]*)/gi,
    /grand total[:\s]*€?([0-9,\s]+\.?[0-9]*)/gi,
    /\btotal\b[:\s]*€?([0-9,\s]+\.?[0-9]*)/gi
  ]

  const noisePattern = /(phone|account|bill\s*(no|number)|page\s*\d|usage|mb|gb|minutes|customer\s*number|sim|mobile)/i

  const vatCandidates = []
  for (const pattern of vatPatterns) {
    let match
    while ((match = pattern.exec(normalized)) !== null) {
      const index = match.index || 0
      const context = normalized.slice(Math.max(0, index - 40), Math.min(normalized.length, index + 80))
      if (noisePattern.test(context) && !/(vat|tax|invoice|total)/i.test(context)) continue
      const amount = parseMoney(match[1])
      if (amount && amount > 0 && amount < 1000000) vatCandidates.push(amount)
    }
  }

  const totalCandidates = []
  for (const pattern of totalPatterns) {
    const patternCandidates = []
    let match
    while ((match = pattern.exec(normalized)) !== null) {
      const amount = parseMoney(match[1])
      if (amount && amount > 0 && amount < 1000000) patternCandidates.push(amount)
    }
    if (patternCandidates.length) {
      totalCandidates.push(Math.max(...patternCandidates))
      break
    }
  }

  const vatAmount = vatCandidates.length ? Math.max(...vatCandidates.filter(v => v < 10000)) : null
  const totalOnDoc = totalCandidates.length ? Math.max(...totalCandidates) : null
  const invoiceDate = parseDate(compact)

  const reasons = []
  if (!invoiceDate) reasons.push('invoice date missing')
  if (!totalOnDoc) reasons.push('invoice total missing')
  if (!vatAmount) reasons.push('VAT amount missing')
  if (vatAmount && totalOnDoc && vatAmount / totalOnDoc > 0.6) reasons.push('VAT ratio implausible')

  let status = 'processed'
  if (reasons.length > 0) status = 'needs_review'
  if (!compact.trim().length) status = 'failed'

  return { invoiceDate, totalOnDoc, vatAmount, status, reasons }
}

function isClose(a, b) {
  if (typeof a !== 'number' || typeof b !== 'number') return false
  return Math.abs(a - b) <= TOLERANCE
}

async function run() {
  let failures = 0
  let reviews = 0

  console.log('\nExtraction Fixture Check\n')

  for (const fixture of fixtures) {
    const filePath = path.join(process.cwd(), 'samples', fixture.file)
    const buffer = fs.readFileSync(filePath)
    const parsed = await pdfParse(buffer)
    const result = extractFromText(parsed.text || '')

    const checks = []
    if (fixture.invoiceDate) checks.push(result.invoiceDate === fixture.invoiceDate)
    if (typeof fixture.totalOnDoc === 'number') checks.push(isClose(result.totalOnDoc, fixture.totalOnDoc))
    if (typeof fixture.vatAmount === 'number') checks.push(isClose(result.vatAmount, fixture.vatAmount))
    const passed = checks.length > 0 && checks.every(Boolean)

    const finalStatus = passed ? 'processed' : result.status === 'failed' ? 'failed' : 'needs_review'
    if (finalStatus === 'failed') failures++
    if (finalStatus === 'needs_review') reviews++

    console.log(`- ${fixture.file}`)
    console.log(`  status: ${finalStatus}`)
    console.log(`  extracted: date=${result.invoiceDate || '—'} total=${result.totalOnDoc ?? '—'} vat=${result.vatAmount ?? '—'}`)
    if (!passed) {
      const reason = result.reasons.length ? result.reasons.join('; ') : 'mismatch with expected fixture values'
      console.log(`  reason: ${reason}`)
    }
  }

  const processed = fixtures.length - failures - reviews
  console.log(`\nSummary: processed=${processed} needs_review=${reviews} failed=${failures}\n`)

  if (failures > 0 || reviews > 0) {
    process.exitCode = 1
  }
}

run().catch((error) => {
  console.error('Fixture check failed:', error)
  process.exit(1)
})
