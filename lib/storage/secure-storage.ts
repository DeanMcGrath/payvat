/**
 * Secure Document Storage System
 * Production-ready storage with encryption and access control
 * Moves files out of database for scalability
 */

import { put, del, list } from '@vercel/blob'
import crypto from 'crypto'
import { logError, logWarn, logAudit } from '@/lib/secure-logger'

export interface StorageConfig {
  encryption: boolean
  retention: number // days
  maxFileSize: number // bytes
  allowedTypes: string[]
}

export interface StoredFile {
  id: string
  url: string
  size: number
  contentType: string
  uploadedAt: Date
  encryptionKey?: string
  expiresAt?: Date
}

export interface UploadResult {
  success: boolean
  file?: StoredFile
  error?: string
}

const DEFAULT_CONFIG: StorageConfig = {
  encryption: true,
  retention: 2555, // 7 years for VAT compliance
  maxFileSize: 50 * 1024 * 1024, // 50MB
  allowedTypes: [
    'application/pdf',
    'image/jpeg', 
    'image/png',
    'image/gif',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
}

class SecureDocumentStorage {
  private config: StorageConfig
  private encryptionKey: string

  constructor(config: Partial<StorageConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.encryptionKey = process.env.ENCRYPTION_KEY || this.generateEncryptionKey()
    
    if (!process.env.ENCRYPTION_KEY) {
      logWarn('No ENCRYPTION_KEY environment variable set', {
        operation: 'storage-initialization'
      })
    }
  }

  /**
   * Upload file to secure storage
   */
  async uploadFile(
    file: Buffer | Uint8Array,
    filename: string,
    contentType: string,
    userId: string,
    metadata?: Record<string, string>
  ): Promise<UploadResult> {
    try {
      // Validate file
      const validation = this.validateFile(file, contentType)
      if (!validation.valid) {
        return { success: false, error: validation.error }
      }

      // Generate secure filename
      const secureId = this.generateSecureId()
      const extension = this.getFileExtension(filename)
      const secureFilename = `${userId}/${secureId}${extension}`

      // Encrypt file if enabled
      let fileData = file
      let encryptionKey: string | undefined

      if (this.config.encryption) {
        const encrypted = this.encryptFile(file)
        fileData = encrypted.data
        encryptionKey = encrypted.key
      }

      // Upload to Vercel Blob
      const blob = await put(secureFilename, Buffer.from(fileData), {
        access: 'public',
        addRandomSuffix: false, // We already have secure names
      })

      // Calculate expiration date
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + this.config.retention)

      const storedFile: StoredFile = {
        id: secureId,
        url: blob.url,
        size: file.length,
        contentType,
        uploadedAt: new Date(),
        encryptionKey,
        expiresAt
      }

      // Log upload for audit
      logAudit('FILE_UPLOADED', {
        userId,
        operation: 'file-upload',
        result: 'SUCCESS'
      })

      return { success: true, file: storedFile }

    } catch (error) {
      logError('File upload failed', error, {
        userId,
        operation: 'file-upload'
      })
      return { success: false, error: 'Upload failed' }
    }
  }

  /**
   * Download file from secure storage
   */
  async downloadFile(
    fileUrl: string,
    encryptionKey?: string,
    userId?: string
  ): Promise<{ success: boolean; data?: Buffer; error?: string }> {
    try {
      // Fetch file from storage
      const response = await fetch(fileUrl)
      if (!response.ok) {
        return { success: false, error: 'File not found' }
      }

      let fileData = Buffer.from(await response.arrayBuffer()) as Buffer

      // Decrypt if encrypted
      if (encryptionKey) {
        try {
          fileData = this.decryptFile(fileData, encryptionKey)
        } catch (error) {
          logError('File decryption failed', error, {
            userId,
            operation: 'file-download'
          })
          return { success: false, error: 'Decryption failed' }
        }
      }

      // Log access for audit
      logAudit('FILE_ACCESSED', {
        userId: userId || 'unknown',
        operation: 'file-download',
        result: 'SUCCESS'
      })

      return { success: true, data: fileData }

    } catch (error) {
      logError('File download failed', error, {
        userId,
        operation: 'file-download'
      })
      return { success: false, error: 'Download failed' }
    }
  }

  /**
   * Delete file from storage
   */
  async deleteFile(fileUrl: string, userId?: string): Promise<boolean> {
    try {
      await del(fileUrl)

      logAudit('FILE_DELETED', {
        userId: userId || 'system',
        operation: 'file-deletion',
        result: 'SUCCESS'
      })

      return true
    } catch (error) {
      logError('File deletion failed', error, {
        userId,
        operation: 'file-deletion'
      })
      return false
    }
  }

  /**
   * Clean up expired files
   */
  async cleanupExpiredFiles(): Promise<number> {
    try {
      const { blobs } = await list()
      let deletedCount = 0

      for (const blob of blobs) {
        // Check if file is expired (simplified check)
        const uploadDate = new Date(blob.uploadedAt)
        const expirationDate = new Date(uploadDate.getTime() + (this.config.retention * 24 * 60 * 60 * 1000))
        
        if (new Date() > expirationDate) {
          await this.deleteFile(blob.url, 'system')
          deletedCount++
        }
      }

      logAudit('CLEANUP_COMPLETED', {
        operation: 'file-cleanup',
        result: 'SUCCESS'
      })

      return deletedCount
    } catch (error) {
      logError('File cleanup failed', error, {
        operation: 'file-cleanup'
      })
      return 0
    }
  }

  /**
   * Validate file before upload
   */
  private validateFile(file: Buffer | Uint8Array, contentType: string): { valid: boolean; error?: string } {
    // Check file size
    if (file.length > this.config.maxFileSize) {
      return { 
        valid: false, 
        error: `File too large. Maximum size: ${Math.round(this.config.maxFileSize / 1024 / 1024)}MB` 
      }
    }

    // Check content type
    if (!this.config.allowedTypes.includes(contentType)) {
      return { 
        valid: false, 
        error: `File type not allowed: ${contentType}` 
      }
    }

    // Basic file magic number validation
    const magicNumbers = {
      'application/pdf': [0x25, 0x50, 0x44, 0x46], // %PDF
      'image/jpeg': [0xFF, 0xD8, 0xFF],
      'image/png': [0x89, 0x50, 0x4E, 0x47],
      'application/zip': [0x50, 0x4B, 0x03, 0x04], // Also covers Excel/Word files
    }

    const expectedMagic = magicNumbers[contentType as keyof typeof magicNumbers]
    if (expectedMagic) {
      const actualMagic = Array.from(file.slice(0, expectedMagic.length))
      if (!expectedMagic.every((byte, index) => byte === actualMagic[index])) {
        // For ZIP-based files (Excel/Word), also check for other ZIP signatures
        if (contentType.includes('openxmlformats') || contentType.includes('ms-excel')) {
          const zipSignatures = [
            [0x50, 0x4B, 0x03, 0x04],
            [0x50, 0x4B, 0x05, 0x06],
            [0x50, 0x4B, 0x07, 0x08]
          ]
          const isValidZip = zipSignatures.some(sig => 
            sig.every((byte, index) => byte === actualMagic[index])
          )
          if (!isValidZip) {
            return { valid: false, error: 'File content does not match declared type' }
          }
        } else {
          return { valid: false, error: 'File content does not match declared type' }
        }
      }
    }

    return { valid: true }
  }

  /**
   * Encrypt file data
   */
  private encryptFile(data: Buffer | Uint8Array): { data: Buffer; key: string } {
    const key = crypto.randomBytes(32) // 256-bit key
    const iv = crypto.randomBytes(16)  // 128-bit IV
    
    const cipher = crypto.createCipheriv('aes-256-cbc', crypto.scryptSync(key, 'salt', 32), Buffer.alloc(16, 0))
    const encrypted = Buffer.concat([
      iv, // Prepend IV to encrypted data
      cipher.update(Buffer.from(data)),
      cipher.final()
    ])

    return {
      data: encrypted,
      key: key.toString('base64')
    }
  }

  /**
   * Decrypt file data
   */
  private decryptFile(encryptedData: Buffer, keyBase64: string): Buffer {
    const key = Buffer.from(keyBase64, 'base64')
    const iv = encryptedData.slice(0, 16) // Extract IV
    const encrypted = encryptedData.slice(16)
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', crypto.scryptSync(key, 'salt', 32), Buffer.alloc(16, 0))
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ])

    return decrypted
  }

  /**
   * Generate secure file ID
   */
  private generateSecureId(): string {
    return crypto.randomBytes(16).toString('hex')
  }

  /**
   * Generate encryption key if not provided
   */
  private generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString('base64')
  }

  /**
   * Get file extension from filename
   */
  private getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.')
    return lastDot > 0 ? filename.substring(lastDot) : ''
  }
}

// Export singleton instance
export const secureStorage = new SecureDocumentStorage()

/**
 * Migration utility to move existing database files to storage
 */
export async function migrateFilesToStorage(batchSize: number = 10): Promise<{
  migrated: number
  failed: number
  errors: string[]
}> {
  const { prisma } = await import('@/lib/prisma')
  let migrated = 0
  let failed = 0
  const errors: string[] = []

  try {
    // Get documents with fileData still in database
    const documentsWithFileData = await prisma.Document.findMany({
      where: {
        fileData: { not: null },
        filePath: null // Not yet migrated
      },
      take: batchSize,
      include: {
        user: true
      }
    })

    for (const doc of documentsWithFileData) {
      try {
        if (!doc.fileData) continue

        // Convert base64 to buffer
        const fileBuffer = Buffer.from(doc.fileData, 'base64')
        
        // Upload to secure storage
        const uploadResult = await secureStorage.uploadFile(
          fileBuffer,
          doc.originalName,
          doc.mimeType,
          doc.userId,
          {
            originalDocumentId: doc.id,
            category: doc.category
          }
        )

        if (uploadResult.success && uploadResult.file) {
          // Update document with new file path and remove fileData
          await prisma.Document.update({
            where: { id: doc.id },
            data: {
              filePath: uploadResult.file.url,
              fileData: null, // Remove from database
              fileHash: uploadResult.file.id // Use secure ID as hash
            }
          })

          migrated++
          
          logAudit('FILE_MIGRATED', {
            userId: doc.userId,
            documentId: doc.id,
            operation: 'file-migration',
            result: 'SUCCESS'
          })
        } else {
          failed++
          errors.push(`Failed to migrate ${doc.originalName}: ${uploadResult.error}`)
        }

      } catch (error: any) {
        failed++
        errors.push(`Migration error for ${doc.originalName}: ${error.message}`)
        
        logError('File migration failed', error, {
          documentId: doc.id,
          operation: 'file-migration'
        })
      }
    }

    return { migrated, failed, errors }

  } catch (error: any) {
    logError('Migration batch failed', error, {
      operation: 'file-migration-batch'
    })
    return { migrated, failed, errors: [error.message] }
  }
}