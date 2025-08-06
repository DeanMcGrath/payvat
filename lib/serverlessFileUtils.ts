import crypto from 'crypto'

// File validation configuration
export const FILE_CONFIG = {
  MAX_SIZE: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
  ALLOWED_TYPES: (process.env.ALLOWED_FILE_TYPES || 'pdf,csv,xlsx,xls,jpg,jpeg,png').split(','),
}

// MIME type mappings
const MIME_TYPES: Record<string, string[]> = {
  'pdf': ['application/pdf'],
  'csv': ['text/csv', 'application/csv'],
  'xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  'xls': ['application/vnd.ms-excel'],
  'jpg': ['image/jpeg'],
  'jpeg': ['image/jpeg'],
  'png': ['image/png'],
}

export interface FileValidationResult {
  isValid: boolean
  error?: string
  fileType?: string
  extension?: string
}

export interface ServerlessUploadedFile {
  fileName: string
  originalName: string
  fileSize: number
  mimeType: string
  fileHash: string
  extension: string
  fileData: string // base64 encoded file data for serverless storage
}

// Validate file
export function validateFile(file: File): FileValidationResult {
  // Check file size
  if (file.size > FILE_CONFIG.MAX_SIZE) {
    return {
      isValid: false,
      error: `File size exceeds maximum limit of ${FILE_CONFIG.MAX_SIZE / 1024 / 1024}MB`
    }
  }
  
  // Get file extension
  const extension = file.name.split('.').pop()?.toLowerCase() || ''
  
  // Check if extension is allowed
  if (!FILE_CONFIG.ALLOWED_TYPES.includes(extension)) {
    return {
      isValid: false,
      error: `File type '${extension}' is not allowed. Allowed types: ${FILE_CONFIG.ALLOWED_TYPES.join(', ')}`
    }
  }
  
  // Check MIME type
  const allowedMimeTypes = MIME_TYPES[extension] || []
  if (!allowedMimeTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Invalid MIME type for ${extension} file`
    }
  }
  
  return {
    isValid: true,
    fileType: extension.toUpperCase(),
    extension
  }
}

// Generate secure filename
export function generateSecureFileName(originalName: string, userId: string): string {
  const timestamp = Date.now()
  const random = crypto.randomBytes(8).toString('hex')
  const extension = originalName.split('.').pop()
  
  return `${userId}_${timestamp}_${random}.${extension}`
}

// Calculate file hash for integrity verification
export async function calculateFileHash(buffer: ArrayBuffer): Promise<string> {
  const hashSum = crypto.createHash('sha256')
  hashSum.update(new Uint8Array(buffer))
  return hashSum.digest('hex')
}

// Process file for serverless environment (store as base64 in database)
export async function processFileForServerless(file: File, userId: string): Promise<ServerlessUploadedFile> {
  // Generate secure filename
  const fileName = generateSecureFileName(file.name, userId)
  
  // Get file buffer
  const buffer = await file.arrayBuffer()
  
  // Calculate file hash
  const fileHash = await calculateFileHash(buffer)
  
  // Convert to base64 for database storage
  const fileData = Buffer.from(buffer).toString('base64')
  
  return {
    fileName,
    originalName: file.name,
    fileSize: file.size,
    mimeType: file.type,
    fileHash,
    extension: file.name.split('.').pop()?.toLowerCase() || '',
    fileData
  }
}

// Sanitize filename for security
export function sanitizeFileName(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 100) // Limit filename length
}

// Map file extension to DocumentType enum
export function getDocumentType(extension: string): string {
  switch (extension.toLowerCase()) {
    case 'pdf':
      return 'PDF'
    case 'xlsx':
    case 'xls':
      return 'EXCEL'
    case 'csv':
      return 'CSV'
    case 'jpg':
    case 'jpeg':
    case 'png':
      return 'IMAGE'
    default:
      return 'PDF' // Default fallback
  }
}

// Convert base64 data back to file for download
export function base64ToBuffer(base64Data: string): Buffer {
  return Buffer.from(base64Data, 'base64')
}