import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

// File validation constants
export const ALLOWED_FILE_TYPES = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'text/csv': '.csv',
} as const

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const CHAT_UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'chat')
export const PREVIEW_DIR = path.join(CHAT_UPLOAD_DIR, 'previews')

// File validation interface
export interface FileValidationResult {
  isValid: boolean
  error?: string
  sanitizedName?: string
  mimeType?: string
  extension?: string
}

// Security scan result
export interface SecurityScanResult {
  isClean: boolean
  result: 'CLEAN' | 'INFECTED' | 'SUSPICIOUS' | 'ERROR'
  details?: string
  threats?: string[]
}

// Ensure upload directories exist
export async function ensureUploadDirectories(): Promise<void> {
  try {
    await fs.promises.mkdir(CHAT_UPLOAD_DIR, { recursive: true })
    await fs.promises.mkdir(PREVIEW_DIR, { recursive: true })
  } catch (error) {
    console.error('Failed to create upload directories:', error)
    throw new Error('Failed to initialize file storage')
  }
}

// Validate file before upload
export function validateFile(
  file: File | { name: string; size: number; type: string }
): FileValidationResult {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size exceeds limit of ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB`
    }
  }

  // Check MIME type
  if (!ALLOWED_FILE_TYPES[file.type as keyof typeof ALLOWED_FILE_TYPES]) {
    return {
      isValid: false,
      error: 'File type not supported. Allowed: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, CSV'
    }
  }

  // Sanitize filename
  const extension = ALLOWED_FILE_TYPES[file.type as keyof typeof ALLOWED_FILE_TYPES]
  const baseName = path.parse(file.name).name
    .replace(/[^a-zA-Z0-9\s\-_]/g, '') // Remove special chars
    .replace(/\s+/g, '_') // Replace spaces
    .substring(0, 50) // Limit length

  const sanitizedName = `${baseName}${extension}`

  return {
    isValid: true,
    sanitizedName,
    mimeType: file.type,
    extension
  }
}

// Generate secure file path
export function generateSecureFilePath(originalName: string, sessionId: string): string {
  const timestamp = Date.now()
  const randomId = crypto.randomBytes(8).toString('hex')
  const extension = path.extname(originalName)
  const secureFileName = `${sessionId}_${timestamp}_${randomId}${extension}`
  return path.join(CHAT_UPLOAD_DIR, secureFileName)
}

// Calculate file hash
export async function calculateFileHash(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256')
    const stream = fs.createReadStream(filePath)

    stream.on('data', data => hash.update(data))
    stream.on('end', () => resolve(hash.digest('hex')))
    stream.on('error', reject)
  })
}

// Basic virus scanning (placeholder for real implementation)
export async function scanFileForViruses(filePath: string): Promise<SecurityScanResult> {
  try {
    // Basic file extension and content checks
    const extension = path.extname(filePath).toLowerCase()
    const stats = await fs.promises.stat(filePath)

    // Check for suspicious file sizes
    if (stats.size === 0) {
      return {
        isClean: false,
        result: 'SUSPICIOUS',
        details: 'Empty file detected'
      }
    }

    // Check for executable extensions (should not be allowed)
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.com', '.vbs', '.js', '.jar']
    if (dangerousExtensions.includes(extension)) {
      return {
        isClean: false,
        result: 'SUSPICIOUS',
        details: 'Potentially dangerous file extension'
      }
    }

    // Basic content validation for known file types
    const buffer = await fs.promises.readFile(filePath, { encoding: null })
    const isValidContent = await validateFileContent(buffer, extension)
    
    if (!isValidContent) {
      return {
        isClean: false,
        result: 'SUSPICIOUS',
        details: 'File content does not match extension'
      }
    }

    // TODO: Integrate with ClamAV or similar antivirus scanner
    // For now, return clean if basic checks pass
    return {
      isClean: true,
      result: 'CLEAN',
      details: 'Basic security checks passed'
    }

  } catch (error) {
    console.error('File scan error:', error)
    return {
      isClean: false,
      result: 'ERROR',
      details: 'Failed to scan file'
    }
  }
}

// Validate file content matches extension
async function validateFileContent(buffer: Buffer, extension: string): Promise<boolean> {
  const fileStart = buffer.subarray(0, 16)

  switch (extension) {
    case '.pdf':
      return fileStart.toString('ascii', 0, 4) === '%PDF'
    
    case '.png':
      return fileStart[0] === 0x89 && 
             fileStart.toString('ascii', 1, 4) === 'PNG'
    
    case '.jpg':
    case '.jpeg':
      return fileStart[0] === 0xFF && fileStart[1] === 0xD8

    case '.docx':
    case '.xlsx':
      // Check for ZIP signature (Office files are ZIP archives)
      return fileStart[0] === 0x50 && fileStart[1] === 0x4B
    
    case '.csv':
      // Basic CSV validation - check for printable ASCII
      const sample = buffer.subarray(0, 1024).toString('utf8')
      return /^[\x20-\x7E\r\n\t]*$/.test(sample)
    
    default:
      return true // Allow unknown extensions if they passed MIME type check
  }
}

// Generate file preview/thumbnail
export async function generateFilePreview(
  filePath: string, 
  mimeType: string
): Promise<string | null> {
  try {
    const fileName = path.basename(filePath)
    const extension = path.extname(fileName)
    const previewName = `preview_${path.parse(fileName).name}.png`
    const previewPath = path.join(PREVIEW_DIR, previewName)

    // For images, create thumbnail
    if (mimeType.startsWith('image/')) {
      // TODO: Implement image thumbnail generation using sharp or similar
      // For now, return the original file path for images
      return `/api/chat/files/${path.basename(filePath)}?preview=true`
    }

    // For PDFs, generate first page thumbnail
    if (mimeType === 'application/pdf') {
      // TODO: Implement PDF thumbnail generation using pdf2pic
      return null // Return null for now
    }

    // For other file types, return appropriate icon
    return null
  } catch (error) {
    console.error('Preview generation error:', error)
    return null
  }
}

// Clean up expired files
export async function cleanupExpiredFiles(): Promise<void> {
  try {
    const files = await fs.promises.readdir(CHAT_UPLOAD_DIR)
    const now = Date.now()
    const maxAge = 30 * 24 * 60 * 60 * 1000 // 30 days

    for (const file of files) {
      const filePath = path.join(CHAT_UPLOAD_DIR, file)
      const stats = await fs.promises.stat(filePath)
      
      if (now - stats.mtime.getTime() > maxAge) {
        await fs.promises.unlink(filePath)
        console.log('Deleted expired file:', file)
      }
    }
  } catch (error) {
    console.error('Cleanup error:', error)
  }
}

// Get file type icon
export function getFileTypeIcon(mimeType: string): string {
  switch (mimeType) {
    case 'application/pdf':
      return '📄'
    case 'application/msword':
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return '📝'
    case 'application/vnd.ms-excel':
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      return '📊'
    case 'image/png':
    case 'image/jpeg':
    case 'image/jpg':
      return '🖼️'
    case 'text/csv':
      return '📈'
    default:
      return '📎'
  }
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}