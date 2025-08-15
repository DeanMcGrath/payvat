/**
 * Guest User Cleanup System
 * Automatically removes orphaned guest users and their data
 * CRITICAL: Prevents database bloat from unlimited guest accumulation
 */

import { prisma } from '@/lib/prisma'
import { logInfo, logWarn, logAudit, logError } from '@/lib/secure-logger'
import { secureStorage } from '@/lib/storage/secure-storage'

export interface CleanupResult {
  guestUsersDeleted: number
  documentsDeleted: number
  auditLogsDeleted: number
  filesDeleted: number
  errors: string[]
  duration: number
}

export interface CleanupConfig {
  maxAgeHours: number
  batchSize: number
  preserveDocuments: boolean
  dryRun: boolean
}

const DEFAULT_CONFIG: CleanupConfig = {
  maxAgeHours: 24,
  batchSize: 100,
  preserveDocuments: false,
  dryRun: false
}

/**
 * Main cleanup function - removes guest users older than specified hours
 */
export async function cleanupGuestUsers(config: Partial<CleanupConfig> = {}): Promise<CleanupResult> {
  const startTime = Date.now()
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  
  logInfo('Starting guest user cleanup', {
    operation: 'guest-cleanup',
    maxAgeHours: finalConfig.maxAgeHours,
    dryRun: finalConfig.dryRun
  })

  const result: CleanupResult = {
    guestUsersDeleted: 0,
    documentsDeleted: 0,
    auditLogsDeleted: 0,
    filesDeleted: 0,
    errors: [],
    duration: 0
  }

  try {
    const cutoffTime = new Date(Date.now() - finalConfig.maxAgeHours * 60 * 60 * 1000)
    
    // Find guest users to clean up
    const guestUsers = await prisma.user.findMany({
      where: {
        role: 'GUEST',
        createdAt: {
          lt: cutoffTime
        }
      },
      include: {
        documents: true,
        auditLogs: true
      },
      take: finalConfig.batchSize
    })

    logInfo(`Found ${guestUsers.length} guest users for cleanup`, {
      operation: 'guest-cleanup'
    })

    for (const guestUser of guestUsers) {
      try {
        await cleanupSingleGuest(guestUser, finalConfig, result)
      } catch (error: any) {
        result.errors.push(`Failed to cleanup guest ${guestUser.id}: ${error.message}`)
        logError('Failed to cleanup individual guest', error, {
          userId: guestUser.id,
          operation: 'guest-cleanup'
        })
      }
    }

    result.duration = Date.now() - startTime

    // Log summary
    logAudit('GUEST_CLEANUP_COMPLETED', {
      operation: 'guest-cleanup',
      result: 'SUCCESS'
    })

    logInfo('Guest cleanup completed', {
      operation: 'guest-cleanup',
      ...result
    })

  } catch (error: any) {
    result.errors.push(`Cleanup failed: ${error.message}`)
    result.duration = Date.now() - startTime
    
    logError('Guest cleanup failed', error, {
      operation: 'guest-cleanup'
    })
  }

  return result
}

/**
 * Clean up a single guest user and their data
 */
async function cleanupSingleGuest(
  guestUser: any,
  config: CleanupConfig,
  result: CleanupResult
): Promise<void> {
  
  logInfo(`Cleaning up guest user: ${guestUser.id}`, {
    operation: 'guest-cleanup',
    userId: guestUser.id
  })

  if (config.dryRun) {
    // Dry run - just count what would be deleted
    result.guestUsersDeleted++
    result.documentsDeleted += guestUser.documents.length
    result.auditLogsDeleted += guestUser.auditLogs.length
    return
  }

  // 1. Clean up document files from storage
  for (const document of guestUser.documents) {
    try {
      if (document.filePath) {
        const deleted = await secureStorage.deleteFile(document.filePath, guestUser.id)
        if (deleted) {
          result.filesDeleted++
        }
      }
    } catch (error: any) {
      result.errors.push(`Failed to delete file for document ${document.id}: ${error.message}`)
    }
  }

  // 2. Delete documents from database
  const deletedDocs = await prisma.document.deleteMany({
    where: { userId: guestUser.id }
  })
  result.documentsDeleted += deletedDocs.count

  // 3. Delete audit logs
  const deletedAuditLogs = await prisma.auditLog.deleteMany({
    where: { userId: guestUser.id }
  })
  result.auditLogsDeleted += deletedAuditLogs.count

  // 4. Delete any related data (VAT returns, payments, etc.)
  await prisma.vATReturn.deleteMany({
    where: { userId: guestUser.id }
  })

  await prisma.payment.deleteMany({
    where: { userId: guestUser.id }
  })

  // 5. Finally, delete the guest user
  await prisma.user.delete({
    where: { id: guestUser.id }
  })
  result.guestUsersDeleted++

  logAudit('GUEST_USER_DELETED', {
    userId: guestUser.id,
    operation: 'guest-cleanup',
    result: 'SUCCESS'
  })
}

/**
 * Get guest user statistics for monitoring
 */
export async function getGuestUserStats(): Promise<{
  total: number
  withDocuments: number
  totalDocuments: number
  oldestAge: number // hours
  newestAge: number // hours
  totalSize: number // bytes
}> {
  try {
    const guests = await prisma.user.findMany({
      where: { role: 'GUEST' },
      include: {
        documents: {
          select: {
            fileSize: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    const now = Date.now()
    const totalDocuments = guests.reduce((sum, guest) => sum + guest.documents.length, 0)
    const totalSize = guests.reduce((sum, guest) => 
      sum + guest.documents.reduce((docSum, doc) => docSum + doc.fileSize, 0), 0
    )

    return {
      total: guests.length,
      withDocuments: guests.filter(g => g.documents.length > 0).length,
      totalDocuments,
      oldestAge: guests.length > 0 ? Math.round((now - guests[0].createdAt.getTime()) / (1000 * 60 * 60)) : 0,
      newestAge: guests.length > 0 ? Math.round((now - guests[guests.length - 1].createdAt.getTime()) / (1000 * 60 * 60)) : 0,
      totalSize
    }
  } catch (error: any) {
    logError('Failed to get guest stats', error, {
      operation: 'guest-stats'
    })
    return {
      total: 0,
      withDocuments: 0,
      totalDocuments: 0,
      oldestAge: 0,
      newestAge: 0,
      totalSize: 0
    }
  }
}

/**
 * Schedule cleanup to run automatically
 */
export function scheduleGuestCleanup(intervalHours: number = 6): NodeJS.Timeout {
  const interval = intervalHours * 60 * 60 * 1000 // Convert to milliseconds
  
  return setInterval(async () => {
    try {
      const result = await cleanupGuestUsers({
        maxAgeHours: 24,
        batchSize: 50,
        dryRun: false
      })
      
      if (result.guestUsersDeleted > 0) {
        logInfo(`Scheduled cleanup completed: ${result.guestUsersDeleted} guests removed`, {
          operation: 'scheduled-guest-cleanup'
        })
      }
    } catch (error) {
      logError('Scheduled guest cleanup failed', error, {
        operation: 'scheduled-guest-cleanup'
      })
    }
  }, interval)
}

/**
 * Emergency cleanup for production - more aggressive
 */
export async function emergencyGuestCleanup(): Promise<CleanupResult> {
  logWarn('Emergency guest cleanup initiated', {
    operation: 'emergency-guest-cleanup'
  })

  // More aggressive cleanup - 6 hours instead of 24
  return cleanupGuestUsers({
    maxAgeHours: 6,
    batchSize: 200,
    preserveDocuments: false,
    dryRun: false
  })
}

/**
 * Convert guest user to regular user (when they sign up)
 */
export async function convertGuestToUser(
  guestUserId: string,
  userEmail: string,
  userPassword: string,
  businessName: string
): Promise<{ success: boolean; userId?: string; error?: string }> {
  try {
    // Check if guest user exists
    const guestUser = await prisma.user.findUnique({
      where: { id: guestUserId },
      include: { documents: true, auditLogs: true }
    })

    if (!guestUser || guestUser.role !== 'GUEST') {
      return { success: false, error: 'Guest user not found' }
    }

    // Update guest user to regular user
    const updatedUser = await prisma.user.update({
      where: { id: guestUserId },
      data: {
        email: userEmail,
        password: userPassword,
        businessName,
        role: 'USER',
        emailVerified: new Date()
      }
    })

    // Log the conversion
    logAudit('GUEST_CONVERTED_TO_USER', {
      userId: guestUserId,
      operation: 'guest-conversion',
      result: 'SUCCESS'
    })

    return { success: true, userId: updatedUser.id }

  } catch (error: any) {
    logError('Guest to user conversion failed', error, {
      guestUserId,
      operation: 'guest-conversion'
    })
    return { success: false, error: error.message }
  }
}