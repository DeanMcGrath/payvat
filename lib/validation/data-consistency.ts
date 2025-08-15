/**
 * Data Consistency Validation
 * Ensures VAT calculations match visible documents
 * CRITICAL for preventing ghost documents bug
 */

import { prisma } from '@/lib/prisma'
import { logError, logWarn } from '@/lib/secure-logger'

export interface ConsistencyCheck {
  documentsCount: number
  vatDocumentsCount: number
  isConsistent: boolean
  discrepancy?: string
}

/**
 * Check if document listing and VAT extraction are consistent
 */
export async function validateDocumentConsistency(
  userId?: string,
  timeWindow: number = 24 * 60 * 60 * 1000 // 24 hours
): Promise<ConsistencyCheck> {
  try {
    let documentsFromListAPI: number
    let documentsFromVATAPI: number

    if (userId) {
      // Authenticated user
      const listingDocs = await prisma.document.count({
        where: { userId }
      })

      const vatDocs = await prisma.document.count({
        where: {
          userId,
          isScanned: true
        }
      })

      documentsFromListAPI = listingDocs
      documentsFromVATAPI = vatDocs
    } else {
      // Guest user - use same logic as both endpoints
      const guestDocs = await prisma.document.findMany({
        where: {
          user: {
            role: 'GUEST'
          },
          uploadedAt: {
            gte: new Date(Date.now() - timeWindow)
          }
        },
        include: {
          user: true
        }
      })

      documentsFromListAPI = guestDocs.length
      documentsFromVATAPI = guestDocs.filter(doc => doc.isScanned).length
    }

    const isConsistent = documentsFromListAPI >= documentsFromVATAPI
    
    if (!isConsistent) {
      const discrepancy = `VAT API reports ${documentsFromVATAPI} documents but listing API shows ${documentsFromListAPI}`
      
      logError('Data consistency violation detected', null, {
        userId: userId || 'GUEST',
        operation: 'data-consistency-check'
      })

      return {
        documentsCount: documentsFromListAPI,
        vatDocumentsCount: documentsFromVATAPI,
        isConsistent: false,
        discrepancy
      }
    }

    return {
      documentsCount: documentsFromListAPI,
      vatDocumentsCount: documentsFromVATAPI,
      isConsistent: true
    }
  } catch (error) {
    logError('Data consistency check failed', error, {
      userId: userId || 'GUEST',
      operation: 'data-consistency-check'
    })

    return {
      documentsCount: 0,
      vatDocumentsCount: 0,
      isConsistent: false,
      discrepancy: 'Consistency check failed due to error'
    }
  }
}

/**
 * Validate that extracted VAT data matches the documents count
 */
export function validateVATExtraction(
  documentsShown: number,
  documentsWithVAT: number,
  vatSummary: any
): { isValid: boolean; warnings: string[] } {
  const warnings: string[] = []
  let isValid = true

  // Check if VAT data exists but no documents shown
  if ((vatSummary.totalSalesVAT > 0 || vatSummary.totalPurchaseVAT > 0) && documentsShown === 0) {
    warnings.push('VAT data found but no documents visible - ghost documents detected')
    isValid = false
  }

  // Check if documents shown but no VAT extracted
  if (documentsShown > 0 && documentsWithVAT === 0) {
    warnings.push('Documents uploaded but no VAT amounts extracted - check processing')
  }

  // Check for reasonable VAT amounts
  if (vatSummary.totalSalesVAT < 0 || vatSummary.totalPurchaseVAT < 0) {
    warnings.push('Negative VAT amounts detected - check calculation logic')
    isValid = false
  }

  // Check for suspicious high amounts (over €100,000)
  if (vatSummary.totalSalesVAT > 100000 || vatSummary.totalPurchaseVAT > 100000) {
    warnings.push('Unusually high VAT amounts detected - verify calculations')
  }

  return { isValid, warnings }
}

/**
 * Clean up orphaned guest users older than specified hours
 */
export async function cleanupOrphanedGuestUsers(olderThanHours: number = 24): Promise<number> {
  try {
    const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000)
    
    const orphanedGuests = await prisma.user.findMany({
      where: {
        role: 'GUEST',
        createdAt: {
          lt: cutoffTime
        }
      },
      include: {
        documents: true
      }
    })

    let deletedCount = 0
    
    for (const guestUser of orphanedGuests) {
      // Delete documents first
      await prisma.document.deleteMany({
        where: { userId: guestUser.id }
      })
      
      // Delete audit logs
      await prisma.auditLog.deleteMany({
        where: { userId: guestUser.id }
      })
      
      // Delete user
      await prisma.user.delete({
        where: { id: guestUser.id }
      })
      
      deletedCount++
    }

    if (deletedCount > 0) {
      logWarn(`Cleaned up ${deletedCount} orphaned guest users`, {
        operation: 'guest-cleanup'
      })
    }

    return deletedCount
  } catch (error) {
    logError('Guest user cleanup failed', error, {
      operation: 'guest-cleanup'
    })
    return 0
  }
}

/**
 * Get guest user statistics for monitoring
 */
export async function getGuestUserStats(): Promise<{
  total: number
  withDocuments: number
  oldestCreated: Date | null
  newestCreated: Date | null
}> {
  try {
    const guests = await prisma.user.findMany({
      where: { role: 'GUEST' },
      include: {
        _count: {
          select: { documents: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    return {
      total: guests.length,
      withDocuments: guests.filter(g => g._count.documents > 0).length,
      oldestCreated: guests.length > 0 ? guests[0].createdAt : null,
      newestCreated: guests.length > 0 ? guests[guests.length - 1].createdAt : null
    }
  } catch (error) {
    logError('Failed to get guest user stats', error, {
      operation: 'guest-stats'
    })
    
    return {
      total: 0,
      withDocuments: 0,
      oldestCreated: null,
      newestCreated: null
    }
  }
}