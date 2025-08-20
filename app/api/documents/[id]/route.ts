import { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { createProtectedRoute, createGuestFriendlyRoute } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { deleteFile } from '@/lib/fileUtils'
import { base64ToBuffer } from '@/lib/serverlessFileUtils'
import { AuthUser } from '@/lib/auth'
import { logError, logWarn, logInfo, logAudit } from '@/lib/secure-logger'
import fs from 'fs/promises'
import path from 'path'

// GET /api/documents/[id] - Get specific document
async function getDocument(request: NextRequest, user?: AuthUser) {
  try {
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      )
    }
    
    const whereClause: any = { id }
    
    if (user) {
      // Authenticated user - ensure they can only access their own documents
      whereClause.userId = user.id
    } else {
      // Guest user - find documents from recent guest users (last 24 hours)
      const guestUsers = await prisma.user.findMany({
        where: {
          role: 'GUEST',
          createdAt: {
            gte: new Date(Date.now() - 1000 * 60 * 60 * 24) // Last 24 hours
          }
        },
        select: { id: true },
        take: 50
      })
      
      if (guestUsers.length === 0) {
        return NextResponse.json(
          { error: 'Document not found' },
          { status: 404 }
        )
      }
      
      whereClause.userId = {
        in: guestUsers.map(u => u.id)
      }
    }
    
    const document = await prisma.document.findFirst({
      where: whereClause,
      include: {
        vatReturn: {
          select: {
            id: true,
            periodStart: true,
            periodEnd: true,
            status: true
          }
        }
      }
    })
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      document
    })
    
  } catch (error) {
    logError('Document fetch error', error, {
      userId: user?.id,
      operation: 'document-fetch'
    })
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    )
  }
}

// DELETE /api/documents/[id] - Delete document
async function deleteDocument(request: NextRequest, user?: AuthUser) {
  const url = new URL(request.url)
  const id = url.pathname.split('/').pop()
  
  try {
    if (!id) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      )
    }

    // Test database connectivity first
    try {
      await Promise.race([
        prisma.$queryRaw`SELECT 1`,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database connection timeout')), 10000)
        )
      ])
    } catch (dbError) {
      logError('Database connection failed during document deletion', dbError, {
        userId: user?.id,
        documentId: id,
        operation: 'delete-document-db-test'
      })
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again later.' },
        { status: 503 }
      )
    }
    
    const whereClause: any = { id }
    
    if (user) {
      // Authenticated user - ensure they can only delete their own documents
      whereClause.userId = user.id
    } else {
      // Guest user - find documents from recent guest users (last 24 hours)
      const guestUsers = await prisma.user.findMany({
        where: {
          role: 'GUEST',
          createdAt: {
            gte: new Date(Date.now() - 1000 * 60 * 60 * 24) // Last 24 hours
          }
        },
        select: { id: true },
        take: 50
      })
      
      if (guestUsers.length === 0) {
        return NextResponse.json(
          { error: 'Document not found' },
          { status: 404 }
        )
      }
      
      whereClause.userId = {
        in: guestUsers.map(u => u.id)
      }
    }
    
    const document = await prisma.document.findFirst({
      where: whereClause
    })
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }
    
    // Check if document is attached to a submitted VAT return
    if (document.vatReturnId) {
      const vatReturn = await prisma.vATReturn.findFirst({
        where: {
          id: document.vatReturnId,
          status: {
            in: ['SUBMITTED', 'PROCESSING', 'APPROVED', 'PAID']
          }
        }
      })
      
      if (vatReturn) {
        return NextResponse.json(
          { error: 'Cannot delete document attached to submitted VAT return' },
          { status: 400 }
        )
      }
    }
    
    // Delete file from disk with improved error handling
    let fileDeleteError: string | null = null
    
    if (document.filePath) {
      try {
        await deleteFile(document.filePath)
        logInfo('Successfully deleted file', {
          userId: user?.id,
          documentId: id,
          filePath: document.filePath,
          operation: 'file-deletion'
        })
      } catch (fileError) {
        logWarn('File deletion warning', {
          userId: user?.id,
          documentId: id,
          filePath: document.filePath,
          operation: 'file-deletion'
        })
        fileDeleteError = `File cleanup failed: ${fileError}`
        // Continue with database deletion even if file deletion fails
      }
    } else if (document.fileData) {
      // For base64 stored files, no physical file to delete
      logInfo('Document uses base64 storage, no physical file to delete', {
        userId: user?.id,
        documentId: id,
        operation: 'file-deletion'
      })
    } else {
      logWarn('Document has no filePath or fileData - unusual but proceeding', {
        userId: user?.id,
        documentId: id,
        operation: 'file-deletion'
      })
    }
    
    // Delete all related records first to avoid foreign key constraints
    
    // Delete related document fingerprint
    try {
      const deletedFingerprint = await prisma.documentFingerprint.deleteMany({
        where: {
          documentId: id
        }
      })
      if (deletedFingerprint.count > 0) {
        logInfo('Deleted related document fingerprint', {
          userId: user?.id,
          documentId: id,
          count: deletedFingerprint.count,
          operation: 'fingerprint-deletion'
        })
      }
    } catch (fingerprintError) {
      logWarn('Failed to delete document fingerprint', {
        userId: user?.id,
        documentId: id,
        operation: 'fingerprint-deletion'
      })
      // Continue anyway
    }
    
    // Delete related template usages
    try {
      const deletedUsages = await prisma.templateUsage.deleteMany({
        where: {
          documentId: id
        }
      })
      if (deletedUsages.count > 0) {
        logInfo('Deleted related template usages', {
          userId: user?.id,
          documentId: id,
          count: deletedUsages.count,
          operation: 'template-usage-deletion'
        })
      }
    } catch (usageError) {
      logWarn('Failed to delete template usages for document', {
        userId: user?.id,
        documentId: id,
        operation: 'template-usage-deletion'
      })
      // Continue anyway
    }
    
    // Delete related AI processing analytics
    try {
      const deletedAnalytics = await prisma.aIProcessingAnalytics.deleteMany({
        where: {
          documentId: id
        }
      })
      if (deletedAnalytics.count > 0) {
        logInfo('Deleted related AI processing analytics', {
          userId: user?.id,
          documentId: id,
          count: deletedAnalytics.count,
          operation: 'ai-analytics-deletion'
        })
      }
    } catch (analyticsError) {
      logWarn('Failed to delete AI processing analytics for document', {
        userId: user?.id,
        documentId: id,
        operation: 'ai-analytics-deletion'
      })
      // Continue anyway
    }
    
    // Delete related audit logs
    try {
      const deletedAuditLogs = await prisma.auditLog.deleteMany({
        where: {
          entityType: 'DOCUMENT',
          entityId: id
        }
      })
      if (deletedAuditLogs.count > 0) {
        logInfo('Deleted related audit logs', {
          userId: user?.id,
          documentId: id,
          count: deletedAuditLogs.count,
          operation: 'audit-logs-deletion'
        })
      }
    } catch (auditError) {
      logWarn('Failed to delete audit logs for document', {
        userId: user?.id,
        documentId: id,
        operation: 'audit-logs-deletion'
      })
      // Continue anyway
    }
    
    // Delete related learning feedback
    try {
      const deletedFeedback = await prisma.learningFeedback.deleteMany({
        where: {
          documentId: id
        }
      })
      logInfo('Deleted related learning feedback records', {
        userId: user?.id,
        documentId: id,
        count: deletedFeedback.count,
        operation: 'learning-feedback-deletion'
      })
    } catch (feedbackError) {
      logWarn('Failed to delete learning feedback for document', {
        userId: user?.id,
        documentId: id,
        operation: 'learning-feedback-deletion'
      })
      // Continue anyway
    }
    
    // Delete document from database
    await prisma.document.delete({
      where: { id }
    })
    
    // Create audit log (only for authenticated users)
    if (user) {
      await logAudit('DELETE_DOCUMENT', {
        userId: user.id,
        documentId: id,
        operation: 'document-deletion',
        result: 'SUCCESS'
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully',
      warnings: fileDeleteError ? [fileDeleteError] : undefined
    })
    
  } catch (error) {
    logError('Document deletion error', error, {
      userId: user?.id,
      documentId: id,
      operation: 'document-deletion'
    })
    
    // Provide more specific error messages based on error type
    let errorMessage = 'Failed to delete document'
    if (error instanceof Error) {
      if (error.message.includes('Foreign key constraint')) {
        errorMessage = 'Cannot delete document due to related data constraints'
      } else if (error.message.includes('Record not found')) {
        errorMessage = 'Document not found or already deleted'
      } else if (error.message.includes('permission')) {
        errorMessage = 'Insufficient permissions to delete document'
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? (error as Error)?.message : undefined
      },
      { status: 500 }
    )
  }
}

// Download document file
async function downloadDocument(request: NextRequest, user?: AuthUser) {
  try {
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()
    const action = url.searchParams.get('action')
    
    if (action !== 'download' && action !== 'preview') {
      return getDocument(request, user)
    }
    
    if (!id) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      )
    }
    
    const whereClause: any = { id }
    
    if (user) {
      // Authenticated user - ensure they can only download their own documents
      whereClause.userId = user.id
    } else {
      // Guest user - find documents from recent guest users (last 24 hours)
      const guestUsers = await prisma.user.findMany({
        where: {
          role: 'GUEST',
          createdAt: {
            gte: new Date(Date.now() - 1000 * 60 * 60 * 24) // Last 24 hours
          }
        },
        select: { id: true },
        take: 50
      })
      
      if (guestUsers.length === 0) {
        return NextResponse.json(
          { error: 'Document not found' },
          { status: 404 }
        )
      }
      
      whereClause.userId = {
        in: guestUsers.map(u => u.id)
      }
    }
    
    const document = await prisma.document.findFirst({
      where: whereClause
    })
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }
    
    // Get file data (either from disk for legacy or from base64)
    let fileBuffer: Buffer
    
    try {
      if (document.fileData) {
        // New base64 storage
        fileBuffer = base64ToBuffer(document.fileData)
      } else if (document.filePath) {
        // Legacy file storage
        const fullPath = path.resolve(process.cwd(), document.filePath)
        fileBuffer = await fs.readFile(fullPath)
      } else {
        return NextResponse.json(
          { error: 'File data not found' },
          { status: 404 }
        )
      }
      
      // Create audit log for download (only if user is authenticated)
      if (user) {
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'DOWNLOAD_DOCUMENT',
            entityType: 'DOCUMENT',
            entityId: id,
            ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown',
            metadata: {
              fileName: document.originalName,
              timestamp: new Date().toISOString()
            }
          }
        })
      }
      
      // Determine content disposition based on action
      const isPreview = action === 'preview'
      const contentDisposition = isPreview 
        ? 'inline' 
        : `attachment; filename="${document.originalName}"`
      
      return new NextResponse(new Uint8Array(fileBuffer), {
        headers: {
          'Content-Type': document.mimeType,
          'Content-Disposition': contentDisposition,
          'Content-Length': document.fileSize.toString(),
          // Add headers for better PDF viewing
          ...(isPreview && document.mimeType === 'application/pdf' && {
            'X-Frame-Options': 'SAMEORIGIN',
            'Cache-Control': 'private, max-age=300'
          })
        }
      })
      
    } catch (fileError) {
      return NextResponse.json(
        { error: 'File not found on disk' },
        { status: 404 }
      )
    }
    
  } catch (error) {
    logError('Document download error', error, {
      userId: user?.id,
      operation: 'document-download'
    })
    return NextResponse.json(
      { error: 'Failed to download document' },
      { status: 500 }
    )
  }
}

export const GET = createGuestFriendlyRoute(downloadDocument)
export const DELETE = createGuestFriendlyRoute(deleteDocument)