import crypto from 'crypto'
import fs from 'fs/promises'
import path from 'path'
import { logError, logWarn, logInfo } from './secure-logger'

// File validation configuration
export const FILE_CONFIG = {
  MAX_SIZE: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
  ALLOWED_TYPES: (process.env.ALLOWED_FILE_TYPES || 'pdf,csv,xlsx,xls,jpg,jpeg,png').split(','),
  UPLOAD_DIR: path.join(process.cwd(), 'uploads'),
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

export interface UploadedFile {
  fileName: string
  originalName: string
  filePath: string
  fileSize: number
  mimeType: string
  fileHash: string
  extension: string
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
  const extension = path.extname(file.name).toLowerCase().slice(1)
  
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
  const extension = path.extname(originalName)
  
  return `${userId}_${timestamp}_${random}${extension}`
}

// Calculate file hash for integrity verification
export async function calculateFileHash(buffer: ArrayBuffer): Promise<string> {
  const hashSum = crypto.createHash('sha256')
  hashSum.update(new Uint8Array(buffer))
  return hashSum.digest('hex')
}

// Save file to disk
export async function saveFile(file: File, userId: string): Promise<UploadedFile> {
  // Ensure upload directory exists
  await fs.mkdir(FILE_CONFIG.UPLOAD_DIR, { recursive: true })
  
  // Create user-specific directory
  const userDir = path.join(FILE_CONFIG.UPLOAD_DIR, userId)
  await fs.mkdir(userDir, { recursive: true })
  
  // Generate secure filename
  const fileName = generateSecureFileName(file.name, userId)
  const filePath = path.join(userDir, fileName)
  
  // Get file buffer
  const buffer = await file.arrayBuffer()
  
  // Calculate file hash
  const fileHash = await calculateFileHash(buffer)
  
  // Save file
  await fs.writeFile(filePath, new Uint8Array(buffer))
  
  return {
    fileName,
    originalName: file.name,
    filePath: path.relative(process.cwd(), filePath),
    fileSize: file.size,
    mimeType: file.type,
    fileHash,
    extension: path.extname(file.name).toLowerCase().slice(1)
  }
}

// Delete file from disk
export async function deleteFile(filePath: string): Promise<void> {
  try {
    const fullPath = path.resolve(process.cwd(), filePath)
    
    // Check if file exists first
    try {
      await fs.access(fullPath)
    } catch (accessError: any) {
      if (accessError.code === 'ENOENT') {
        logInfo('File already deleted or does not exist', {
          filePath,
          operation: 'file-deletion'
        })
        return // File doesn't exist, consider it successfully "deleted"
      }
      throw accessError // Re-throw other access errors
    }
    
    // File exists, proceed with deletion
    await fs.unlink(fullPath)
    logInfo('Successfully deleted file', {
      filePath,
      operation: 'file-deletion'
    })
  } catch (error: any) {
    logError('Error deleting file', error, {
      filePath,
      operation: 'file-deletion'
    })
    
    // Don't throw error if file doesn't exist
    if (error.code === 'ENOENT') {
      logInfo('File not found during deletion (already gone)', {
        filePath,
        operation: 'file-deletion'
      })
      return
    }
    
    // For other errors, throw them so caller can handle appropriately
    throw new Error(`Failed to delete file ${filePath}: ${error.message}`)
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