/**
 * Safe PDF parsing wrapper for server/runtime environments where the package
 * entrypoint can trigger debug/test file resolution.
 */

interface PdfParseResult {
  numpages: number
  numrender: number
  info: any
  metadata: any
  text: string
  version: string
}

interface PdfParseOptions {
  max?: number
  version?: string
  normalizeWhitespace?: boolean
  disableFontFace?: boolean
}

export async function safePdfParse(buffer: Buffer, options?: PdfParseOptions): Promise<PdfParseResult> {
  // Import library entry directly to avoid package-level debug bootstrapping.
  const pdfParse = require('pdf-parse/lib/pdf-parse.js')
  return pdfParse(buffer, options)
}

