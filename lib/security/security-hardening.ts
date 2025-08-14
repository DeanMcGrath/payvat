/**
 * Security Hardening and Input Validation System
 * Comprehensive security measures for VAT extraction system
 */

import crypto from 'crypto'
import { rateLimit } from 'express-rate-limit'

// Security configuration
export interface SecurityConfig {
  rateLimit: {
    windowMs: number
    maxRequests: number
    skipSuccessfulRequests: boolean
  }
  fileValidation: {
    maxFileSize: number
    allowedMimeTypes: string[]
    allowedExtensions: string[]
    scanForMalware: boolean
  }
  inputSanitization: {
    maxTextLength: number
    stripHtmlTags: boolean
    removeScriptTags: boolean
    validateUTF8: boolean
  }
  encryption: {
    algorithm: string
    keyLength: number
    ivLength: number
  }
  auditLogging: {
    enabled: boolean
    logLevel: 'basic' | 'detailed' | 'verbose'
    retentionDays: number
  }
}

// Security audit log entry
export interface SecurityAuditLog {
  timestamp: string
  eventType: 'FILE_UPLOAD' | 'PROCESSING' | 'ACCESS_ATTEMPT' | 'SECURITY_VIOLATION' | 'DATA_EXPORT'
  userId?: string
  ip: string
  userAgent?: string
  resource: string
  action: string
  result: 'SUCCESS' | 'FAILURE' | 'BLOCKED'
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  details: any
  sessionId?: string
}

// Input validation result
export interface ValidationResult {
  isValid: boolean
  violations: SecurityViolation[]
  riskScore: number
  sanitizedInput?: any
}

export interface SecurityViolation {
  type: 'MALICIOUS_CONTENT' | 'SIZE_EXCEEDED' | 'INVALID_FORMAT' | 'SUSPICIOUS_PATTERN' | 'RATE_LIMIT_EXCEEDED'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  message: string
  field?: string
  value?: string
  blocked: boolean
}

// Security hardening class
export class SecurityHardening {
  private config: SecurityConfig
  private auditLogs: SecurityAuditLog[] = []
  private rateLimitStore = new Map<string, { count: number, resetTime: number }>()
  private suspiciousPatterns = new Map<string, number>()

  constructor(config?: Partial<SecurityConfig>) {
    this.config = {
      rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 100,
        skipSuccessfulRequests: false
      },
      fileValidation: {
        maxFileSize: 50 * 1024 * 1024, // 50MB
        allowedMimeTypes: [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
          'image/jpeg',
          'image/png',
          'image/gif',
          'text/plain',
          'text/csv'
        ],
        allowedExtensions: ['.pdf', '.xlsx', '.xls', '.jpg', '.jpeg', '.png', '.gif', '.txt', '.csv'],
        scanForMalware: true
      },
      inputSanitization: {
        maxTextLength: 10 * 1024 * 1024, // 10MB
        stripHtmlTags: true,
        removeScriptTags: true,
        validateUTF8: true
      },
      encryption: {
        algorithm: 'aes-256-gcm',
        keyLength: 32,
        ivLength: 16
      },
      auditLogging: {
        enabled: true,
        logLevel: 'detailed',
        retentionDays: 90
      },
      ...config
    }

    this.initializeSecurity()
  }

  // Validate file upload security
  validateFileUpload(
    fileData: string,
    mimeType: string,
    fileName: string,
    userContext: { ip: string, userId?: string, userAgent?: string }
  ): ValidationResult {
    const violations: SecurityViolation[] = []
    let riskScore = 0

    try {
      // 1. File size validation
      const fileSize = Buffer.byteLength(fileData, 'base64')
      if (fileSize > this.config.fileValidation.maxFileSize) {
        violations.push({
          type: 'SIZE_EXCEEDED',
          severity: 'HIGH',
          message: `File size ${Math.round(fileSize / 1024 / 1024)}MB exceeds limit of ${Math.round(this.config.fileValidation.maxFileSize / 1024 / 1024)}MB`,
          field: 'fileData',
          blocked: true
        })
        riskScore += 30
      }

      // 2. MIME type validation
      if (!this.config.fileValidation.allowedMimeTypes.includes(mimeType)) {
        violations.push({
          type: 'INVALID_FORMAT',
          severity: 'MEDIUM',
          message: `MIME type '${mimeType}' not allowed`,
          field: 'mimeType',
          value: mimeType,
          blocked: true
        })
        riskScore += 20
      }

      // 3. File extension validation
      const fileExtension = this.getFileExtension(fileName).toLowerCase()
      if (!this.config.fileValidation.allowedExtensions.includes(fileExtension)) {
        violations.push({
          type: 'INVALID_FORMAT',
          severity: 'MEDIUM',
          message: `File extension '${fileExtension}' not allowed`,
          field: 'fileName',
          value: fileExtension,
          blocked: true
        })
        riskScore += 20
      }

      // 4. Filename validation (security)
      if (!this.isValidFileName(fileName)) {
        violations.push({
          type: 'SUSPICIOUS_PATTERN',
          severity: 'MEDIUM',
          message: 'Invalid or suspicious filename format',
          field: 'fileName',
          value: fileName,
          blocked: true
        })
        riskScore += 15
      }

      // 5. Content validation (basic malware signatures)
      const contentViolations = this.scanFileContent(fileData, mimeType)
      violations.push(...contentViolations)
      riskScore += contentViolations.length * 25

      // 6. Rate limiting check
      const rateLimitResult = this.checkRateLimit(userContext.ip)
      if (!rateLimitResult.allowed) {
        violations.push({
          type: 'RATE_LIMIT_EXCEEDED',
          severity: 'HIGH',
          message: `Rate limit exceeded: ${rateLimitResult.requests}/${this.config.rateLimit.maxRequests}`,
          blocked: true
        })
        riskScore += 40
      }

      // Log security event
      this.logSecurityEvent({
        eventType: 'FILE_UPLOAD',
        userId: userContext.userId,
        ip: userContext.ip,
        userAgent: userContext.userAgent,
        resource: fileName,
        action: 'VALIDATE_UPLOAD',
        result: violations.some(v => v.blocked) ? 'BLOCKED' : 'SUCCESS',
        riskLevel: this.calculateRiskLevel(riskScore),
        details: {
          fileSize,
          mimeType,
          violations: violations.length,
          riskScore
        }
      })

      return {
        isValid: !violations.some(v => v.blocked),
        violations,
        riskScore: Math.min(100, riskScore)
      }

    } catch (error) {
      violations.push({
        type: 'MALICIOUS_CONTENT',
        severity: 'CRITICAL',
        message: `File validation error: ${(error as Error).message}`,
        blocked: true
      })

      return {
        isValid: false,
        violations,
        riskScore: 100
      }
    }
  }

  // Sanitize text input
  sanitizeTextInput(text: string, context?: string): { sanitized: string, violations: SecurityViolation[] } {
    const violations: SecurityViolation[] = []
    let sanitized = text

    try {
      // 1. Length validation
      if (text.length > this.config.inputSanitization.maxTextLength) {
        violations.push({
          type: 'SIZE_EXCEEDED',
          severity: 'MEDIUM',
          message: `Text length ${text.length} exceeds maximum ${this.config.inputSanitization.maxTextLength}`,
          field: context,
          blocked: false
        })
        sanitized = text.substring(0, this.config.inputSanitization.maxTextLength)
      }

      // 2. UTF-8 validation
      if (this.config.inputSanitization.validateUTF8) {
        try {
          Buffer.from(sanitized, 'utf8').toString('utf8')
        } catch (error) {
          violations.push({
            type: 'INVALID_FORMAT',
            severity: 'MEDIUM',
            message: 'Invalid UTF-8 encoding detected',
            field: context,
            blocked: false
          })
          sanitized = sanitized.replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII
        }
      }

      // 3. Remove script tags
      if (this.config.inputSanitization.removeScriptTags) {
        const scriptPattern = /<script[^>]*>.*?<\/script>/gis
        if (scriptPattern.test(sanitized)) {
          violations.push({
            type: 'MALICIOUS_CONTENT',
            severity: 'HIGH',
            message: 'Script tags detected and removed',
            field: context,
            blocked: false
          })
          sanitized = sanitized.replace(scriptPattern, '')
        }
      }

      // 4. Strip HTML tags
      if (this.config.inputSanitization.stripHtmlTags) {
        const htmlPattern = /<[^>]*>/g
        if (htmlPattern.test(sanitized)) {
          violations.push({
            type: 'SUSPICIOUS_PATTERN',
            severity: 'LOW',
            message: 'HTML tags detected and removed',
            field: context,
            blocked: false
          })
          sanitized = sanitized.replace(htmlPattern, '')
        }
      }

      // 5. Check for suspicious patterns
      const suspiciousPatterns = [
        /javascript:/gi,
        /vbscript:/gi,
        /on\w+\s*=/gi,
        /data:text\/html/gi,
        /base64,/gi
      ]

      suspiciousPatterns.forEach(pattern => {
        if (pattern.test(sanitized)) {
          violations.push({
            type: 'SUSPICIOUS_PATTERN',
            severity: 'HIGH',
            message: `Suspicious pattern detected: ${pattern}`,
            field: context,
            blocked: false
          })
          sanitized = sanitized.replace(pattern, '[REMOVED]')
        }
      })

      // 6. SQL injection patterns
      const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC)\s)/gi,
        /(UNION\s+SELECT)/gi,
        /(OR\s+1\s*=\s*1)/gi,
        /(AND\s+1\s*=\s*1)/gi
      ]

      sqlPatterns.forEach(pattern => {
        if (pattern.test(sanitized)) {
          violations.push({
            type: 'MALICIOUS_CONTENT',
            severity: 'HIGH',
            message: 'Potential SQL injection pattern detected',
            field: context,
            blocked: false
          })
          sanitized = sanitized.replace(pattern, '[SQL_BLOCKED]')
        }
      })

      return { sanitized, violations }

    } catch (error) {
      return {
        sanitized: '',
        violations: [{
          type: 'MALICIOUS_CONTENT',
          severity: 'CRITICAL',
          message: `Text sanitization error: ${(error as Error).message}`,
          field: context,
          blocked: true
        }]
      }
    }
  }

  // Encrypt sensitive data
  encryptSensitiveData(data: string, key?: string): { encrypted: string, iv: string } {
    const algorithm = this.config.encryption.algorithm
    const encryptionKey = key ? Buffer.from(key) : crypto.randomBytes(this.config.encryption.keyLength)
    const iv = crypto.randomBytes(this.config.encryption.ivLength)

    const cipher = crypto.createCipher(algorithm, encryptionKey)
    let encrypted = cipher.update(data, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    return {
      encrypted,
      iv: iv.toString('hex')
    }
  }

  // Decrypt sensitive data
  decryptSensitiveData(encryptedData: string, key: string, iv: string): string {
    const algorithm = this.config.encryption.algorithm
    const encryptionKey = Buffer.from(key)
    const ivBuffer = Buffer.from(iv, 'hex')

    const decipher = crypto.createDecipher(algorithm, encryptionKey)
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  }

  // Generate secure session token
  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex')
  }

  // Hash sensitive data (one-way)
  hashSensitiveData(data: string, salt?: string): { hash: string, salt: string } {
    const actualSalt = salt || crypto.randomBytes(16).toString('hex')
    const hash = crypto.pbkdf2Sync(data, actualSalt, 100000, 64, 'sha512').toString('hex')
    
    return { hash, salt: actualSalt }
  }

  // Get security audit logs
  getSecurityLogs(
    filters?: {
      eventType?: string
      riskLevel?: string
      startDate?: Date
      endDate?: Date
      userId?: string
      ip?: string
    }
  ): SecurityAuditLog[] {
    let filteredLogs = [...this.auditLogs]

    if (filters) {
      if (filters.eventType) {
        filteredLogs = filteredLogs.filter(log => log.eventType === filters.eventType)
      }
      if (filters.riskLevel) {
        filteredLogs = filteredLogs.filter(log => log.riskLevel === filters.riskLevel)
      }
      if (filters.startDate) {
        filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) >= filters.startDate!)
      }
      if (filters.endDate) {
        filteredLogs = filteredLogs.filter(log => new Date(log.timestamp) <= filters.endDate!)
      }
      if (filters.userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === filters.userId)
      }
      if (filters.ip) {
        filteredLogs = filteredLogs.filter(log => log.ip === filters.ip)
      }
    }

    return filteredLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  // Get security statistics
  getSecurityStats(days: number = 30): {
    totalEvents: number
    blockedEvents: number
    riskLevelBreakdown: Record<string, number>
    topThreats: Array<{ type: string, count: number }>
    topSourceIPs: Array<{ ip: string, events: number }>
  } {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    const recentLogs = this.auditLogs.filter(log => 
      new Date(log.timestamp) >= cutoffDate
    )

    const blockedEvents = recentLogs.filter(log => log.result === 'BLOCKED').length
    const riskLevelBreakdown: Record<string, number> = {}
    const threatTypes: Record<string, number> = {}
    const sourceIPs: Record<string, number> = {}

    recentLogs.forEach(log => {
      // Risk level breakdown
      riskLevelBreakdown[log.riskLevel] = (riskLevelBreakdown[log.riskLevel] || 0) + 1

      // Threat types (from violation types if available)
      if (log.details?.violations) {
        log.details.violations.forEach((violation: SecurityViolation) => {
          threatTypes[violation.type] = (threatTypes[violation.type] || 0) + 1
        })
      }

      // Source IPs
      sourceIPs[log.ip] = (sourceIPs[log.ip] || 0) + 1
    })

    const topThreats = Object.entries(threatTypes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([type, count]) => ({ type, count }))

    const topSourceIPs = Object.entries(sourceIPs)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([ip, events]) => ({ ip, events }))

    return {
      totalEvents: recentLogs.length,
      blockedEvents,
      riskLevelBreakdown,
      topThreats,
      topSourceIPs
    }
  }

  // Private helper methods
  private initializeSecurity(): void {
    // Start audit log cleanup timer
    setInterval(() => {
      this.cleanupOldAuditLogs()
    }, 24 * 60 * 60 * 1000) // Daily cleanup

    // Start rate limit cleanup timer
    setInterval(() => {
      this.cleanupRateLimitStore()
    }, 60 * 1000) // Every minute

    console.log('🔒 Security hardening initialized')
  }

  private scanFileContent(fileData: string, mimeType: string): SecurityViolation[] {
    const violations: SecurityViolation[] = []

    try {
      // Decode base64 content for scanning
      const content = Buffer.from(fileData, 'base64').toString('binary')

      // Check for suspicious binary signatures
      const malwareSignatures = [
        'MZ', // PE executable
        '%PDF-', // Check for embedded executables in PDF
        'PK', // ZIP format (could contain executables)
      ]

      // Basic signature check
      if (mimeType === 'application/pdf' && content.includes('/JavaScript')) {
        violations.push({
          type: 'MALICIOUS_CONTENT',
          severity: 'HIGH',
          message: 'PDF contains JavaScript code',
          blocked: true
        })
      }

      // Check for embedded executables
      const executablePatterns = [
        /\x4d\x5a.{0,100}\x50\x45\x00\x00/s, // PE header
        /#!/, // Script shebang
      ]

      executablePatterns.forEach(pattern => {
        if (pattern.test(content)) {
          violations.push({
            type: 'MALICIOUS_CONTENT',
            severity: 'CRITICAL',
            message: 'Embedded executable detected',
            blocked: true
          })
        }
      })

    } catch (error) {
      violations.push({
        type: 'MALICIOUS_CONTENT',
        severity: 'MEDIUM',
        message: 'Content scanning error - potentially corrupted file',
        blocked: true
      })
    }

    return violations
  }

  private checkRateLimit(ip: string): { allowed: boolean, requests: number } {
    const now = Date.now()
    const windowStart = now - this.config.rateLimit.windowMs

    const record = this.rateLimitStore.get(ip)
    
    if (!record || record.resetTime < windowStart) {
      this.rateLimitStore.set(ip, { count: 1, resetTime: now + this.config.rateLimit.windowMs })
      return { allowed: true, requests: 1 }
    }

    record.count++
    
    return {
      allowed: record.count <= this.config.rateLimit.maxRequests,
      requests: record.count
    }
  }

  private isValidFileName(fileName: string): boolean {
    // Check for path traversal attempts
    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
      return false
    }

    // Check for null bytes
    if (fileName.includes('\0')) {
      return false
    }

    // Check for reserved names (Windows)
    const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9']
    if (reservedNames.includes(fileName.toUpperCase())) {
      return false
    }

    // Must have valid characters
    const validFileNamePattern = /^[a-zA-Z0-9._-]+\.[a-zA-Z0-9]+$/
    return validFileNamePattern.test(fileName)
  }

  private getFileExtension(fileName: string): string {
    const lastDot = fileName.lastIndexOf('.')
    return lastDot >= 0 ? fileName.substring(lastDot) : ''
  }

  private calculateRiskLevel(riskScore: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (riskScore >= 80) return 'CRITICAL'
    if (riskScore >= 60) return 'HIGH'
    if (riskScore >= 30) return 'MEDIUM'
    return 'LOW'
  }

  private logSecurityEvent(event: Omit<SecurityAuditLog, 'timestamp' | 'sessionId'>): void {
    if (!this.config.auditLogging.enabled) return

    const logEntry: SecurityAuditLog = {
      ...event,
      timestamp: new Date().toISOString(),
      sessionId: this.generateSecureToken(16)
    }

    this.auditLogs.push(logEntry)

    // Console logging based on risk level
    const logLevel = event.riskLevel
    if (logLevel === 'CRITICAL' || logLevel === 'HIGH') {
      console.log(`🚨 SECURITY ALERT [${logLevel}]: ${event.eventType} - ${event.result}`)
      console.log(`   IP: ${event.ip}, Resource: ${event.resource}`)
      if (event.details) {
        console.log(`   Details: ${JSON.stringify(event.details)}`)
      }
    } else if (this.config.auditLogging.logLevel === 'verbose') {
      console.log(`🔒 Security Event [${logLevel}]: ${event.eventType} - ${event.result}`)
    }
  }

  private cleanupOldAuditLogs(): void {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - this.config.auditLogging.retentionDays)

    const beforeCount = this.auditLogs.length
    this.auditLogs = this.auditLogs.filter(log => 
      new Date(log.timestamp) >= cutoffDate
    )
    
    const removedCount = beforeCount - this.auditLogs.length
    if (removedCount > 0) {
      console.log(`🗑️ Cleaned up ${removedCount} old security audit logs`)
    }
  }

  private cleanupRateLimitStore(): void {
    const now = Date.now()
    
    for (const [ip, record] of this.rateLimitStore.entries()) {
      if (record.resetTime < now) {
        this.rateLimitStore.delete(ip)
      }
    }
  }

  // Cleanup resources
  destroy(): void {
    this.auditLogs = []
    this.rateLimitStore.clear()
    this.suspiciousPatterns.clear()
  }
}

// Export security instance
export const securityHardening = new SecurityHardening()

console.log('🔒 Security hardening system initialized')