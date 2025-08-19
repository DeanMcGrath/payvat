import { NextRequest, NextResponse } from 'next/server'
import { createGuestFriendlyRoute } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { AuthUser } from '@/lib/auth'
import { logError, logWarn, logInfo, logAudit, logPerformance } from '@/lib/secure-logger'

interface DocumentFolder {
  id: string
  year: number
  month: number
  totalSalesAmount: number
  totalPurchaseAmount: number
  totalSalesVAT: number
  totalPurchaseVAT: number
  totalNetVAT: number
  documentCount: number
  salesDocumentCount: number
  purchaseDocumentCount: number
  averageProcessingQuality?: number
  averageVATAccuracy?: number
  isComplete: boolean
  needsReview: boolean
  complianceStatus: string
  lastDocumentAt?: Date
  documents: any[]
}

/**
 * GET /api/documents/organize - Get documents organized by year/month folders
 */
async function getOrganizedDocuments(request: NextRequest, user?: AuthUser) {
  try {
    const startTime = Date.now()
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
    const month = searchParams.get('month')
    const includeDocuments = searchParams.get('includeDocuments') === 'true'
    
    // Test basic database connectivity
    try {
      await prisma.$queryRaw`SELECT 1`
    } catch (dbError) {
      logError('Database connection failed in documents organize', dbError, {
        userId: user?.id,
        operation: 'documents-organize-db-test'
      })
      return NextResponse.json({
        success: false,
        error: 'Database temporarily unavailable',
        folders: [],
        totalDocuments: 0,
        totalFolders: 0
      }, { status: 503 })
    }

    logAudit('DOCUMENTS_ORGANIZE_REQUEST', {
      userId: user?.id,
      operation: 'documents-organize',
      result: 'SUCCESS'
    })

    // Build where clause for user/guest access
    const userWhere: any = {}
    
    if (user) {
      userWhere.userId = user.id
    } else {
      // Guest user logic - find recent guest documents
      const recentGuestUsers = await prisma.user.findMany({
        where: {
          role: 'GUEST',
          createdAt: {
            gte: new Date(Date.now() - 1000 * 60 * 60 * 24) // Last 24 hours
          }
        },
        select: { id: true }
      })
      
      if (recentGuestUsers.length === 0) {
        return NextResponse.json({
          success: true,
          folders: [],
          message: 'No recent documents found'
        })
      }
      
      userWhere.userId = {
        in: recentGuestUsers.map(u => u.id)
      }
    }

    // Add date filters if provided
    if (year) {
      userWhere.extractedYear = parseInt(year)
    }
    if (month) {
      userWhere.extractedMonth = parseInt(month)
    }

    // First, get or create document folders
    const documentsWithDates = await prisma.document.findMany({
      where: {
        ...userWhere,
        extractedYear: { not: null },
        extractedMonth: { not: null }
      },
      select: {
        id: true,
        userId: true,
        fileName: true,
        originalName: true,
        category: true,
        extractedDate: true,
        extractedYear: true,
        extractedMonth: true,
        invoiceTotal: true,
        vatAccuracy: true,
        processingQuality: true,
        validationStatus: true,
        complianceIssues: true,
        uploadedAt: true,
        isDuplicate: true
      },
      orderBy: [
        { extractedYear: 'desc' },
        { extractedMonth: 'desc' },
        { uploadedAt: 'desc' }
      ]
    })

    // Group documents by year/month and calculate aggregates
    const folderMap = new Map<string, DocumentFolder>()

    for (const doc of documentsWithDates) {
      const key = `${doc.userId}-${doc.extractedYear}-${doc.extractedMonth}`
      
      if (!folderMap.has(key)) {
        folderMap.set(key, {
          id: key,
          year: doc.extractedYear!,
          month: doc.extractedMonth!,
          totalSalesAmount: 0,
          totalPurchaseAmount: 0,
          totalSalesVAT: 0,
          totalPurchaseVAT: 0,
          totalNetVAT: 0,
          documentCount: 0,
          salesDocumentCount: 0,
          purchaseDocumentCount: 0,
          averageProcessingQuality: 0,
          averageVATAccuracy: 0,
          isComplete: false,
          needsReview: false,
          complianceStatus: 'PENDING',
          lastDocumentAt: doc.uploadedAt,
          documents: []
        })
      }

      const folder = folderMap.get(key)!
      
      // Add document to folder
      if (includeDocuments) {
        folder.documents.push({
          id: doc.id,
          fileName: doc.fileName,
          originalName: doc.originalName,
          category: doc.category,
          extractedDate: doc.extractedDate,
          invoiceTotal: doc.invoiceTotal ? parseFloat(doc.invoiceTotal.toString()) : null,
          vatAccuracy: doc.vatAccuracy,
          processingQuality: doc.processingQuality,
          validationStatus: doc.validationStatus,
          complianceIssues: doc.complianceIssues,
          uploadedAt: doc.uploadedAt
        })
      }

      // Update folder aggregates
      folder.documentCount += 1
      
      if (doc.category?.includes('SALES')) {
        folder.salesDocumentCount += 1
        if (doc.invoiceTotal) {
          folder.totalSalesAmount += parseFloat(doc.invoiceTotal.toString())
        }
      } else if (doc.category?.includes('PURCHASE')) {
        folder.purchaseDocumentCount += 1
        if (doc.invoiceTotal) {
          folder.totalPurchaseAmount += parseFloat(doc.invoiceTotal.toString())
        }
      }

      // Track quality metrics
      if (doc.processingQuality) {
        folder.averageProcessingQuality += doc.processingQuality
      }
      if (doc.vatAccuracy) {
        folder.averageVATAccuracy += doc.vatAccuracy
      }

      // Check if needs review
      if (doc.validationStatus === 'NEEDS_REVIEW' || (doc.complianceIssues && doc.complianceIssues.length > 0) || doc.isDuplicate) {
        folder.needsReview = true
      }

      // Update last document date
      if (doc.uploadedAt > folder.lastDocumentAt!) {
        folder.lastDocumentAt = doc.uploadedAt
      }
    }

    // Calculate averages and compliance status for each folder
    const folders = Array.from(folderMap.values()).map(folder => {
      if (folder.documentCount > 0) {
        folder.averageProcessingQuality = folder.averageProcessingQuality / folder.documentCount
        folder.averageVATAccuracy = folder.averageVATAccuracy / folder.documentCount
        
        // Calculate compliance status (only if we have documents to analyze)
        let complianceRate = 0
        if (folder.documents && folder.documents.length > 0) {
          const compliantDocs = folder.documents.filter(doc => doc.validationStatus === 'COMPLIANT').length
          complianceRate = compliantDocs / folder.documentCount
        }
        
        if (complianceRate >= 0.9) {
          folder.complianceStatus = 'COMPLIANT'
        } else if (complianceRate >= 0.5) {
          folder.complianceStatus = 'NEEDS_REVIEW'
        } else {
          folder.complianceStatus = 'NON_COMPLIANT'
        }
        
        // Check if folder is complete (has both sales and purchase docs, or user-defined completeness)
        folder.isComplete = folder.salesDocumentCount > 0 && folder.purchaseDocumentCount > 0
      }

      // Calculate net VAT (will be populated when we integrate with VAT extraction)
      folder.totalNetVAT = folder.totalSalesVAT - folder.totalPurchaseVAT

      return folder
    })

    // Get VAT data for folders and update totals
    await updateFoldersWithVATData(folders, user?.id)

    logPerformance('documents-organize', Date.now() - startTime, {
      operation: 'documents-organize',
      folderCount: folders.length,
      documentCount: documentsWithDates.length
    })

    return NextResponse.json({
      success: true,
      folders,
      totalDocuments: documentsWithDates.length,
      totalFolders: folders.length
    })

  } catch (error) {
    logError('Documents organize failed', error, 'API_DOCUMENTS_ORGANIZE')
    return NextResponse.json({
      success: false,
      error: 'Failed to organize documents'
    }, { status: 500 })
  }
}

/**
 * Update folders with VAT extraction data
 */
async function updateFoldersWithVATData(folders: DocumentFolder[], userId?: string) {
  try {
    // This will be implemented when we enhance the VAT extraction system
    // For now, we'll use placeholder logic
    
    for (const folder of folders) {
      // Placeholder: Calculate estimated VAT based on document totals
      // This will be replaced with actual VAT extraction data
      const estimatedSalesVAT = folder.totalSalesAmount * 0.23 // 23% standard VAT rate
      const estimatedPurchaseVAT = folder.totalPurchaseAmount * 0.23
      
      folder.totalSalesVAT = estimatedSalesVAT
      folder.totalPurchaseVAT = estimatedPurchaseVAT
      folder.totalNetVAT = estimatedSalesVAT - estimatedPurchaseVAT
    }
  } catch (error) {
    logError('Failed to update folders with VAT data', error, 'API_DOCUMENTS_ORGANIZE')
  }
}

export const GET = createGuestFriendlyRoute(getOrganizedDocuments)