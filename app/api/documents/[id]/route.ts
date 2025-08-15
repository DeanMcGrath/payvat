import { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { createProtectedRoute } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { deleteFile } from '@/lib/fileUtils'
import { base64ToBuffer } from '@/lib/serverlessFileUtils'
import { AuthUser } from '@/lib/auth'
import fs from 'fs/promises'
import path from 'path'

// GET /api/documents/[id] - Get specific document
async function getDocument(request: NextRequest, user: AuthUser) {
  try {
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      )
    }
    
    const document = await prisma.document.findFirst({
      where: {
        id,
        userId: user.id // Ensure user can only access their own documents
      },
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
    console.error('Document fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    )
  }
}

// DELETE /api/documents/[id] - Delete document
async function deleteDocument(request: NextRequest, user: AuthUser) {
  try {
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()
    
    if (!id) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      )
    }
    
    const document = await prisma.document.findFirst({
      where: {
        id,
        userId: user.id // Ensure user can only delete their own documents
      }
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
        console.log(`✅ Successfully deleted file: ${document.filePath}`)
      } catch (fileError) {
        console.warn(`⚠️ File deletion warning for ${document.filePath}:`, fileError)
        fileDeleteError = `File cleanup failed: ${fileError}`
        // Continue with database deletion even if file deletion fails
      }
    } else if (document.fileData) {
      // For base64 stored files, no physical file to delete
      console.log(`📄 Document uses base64 storage, no physical file to delete`)
    } else {
      console.warn(`⚠️ Document has no filePath or fileData - unusual but proceeding`)
    }
    
    // Delete related audit logs first to avoid foreign key constraints
    try {
      const deletedAuditLogs = await prisma.auditLog.deleteMany({
        where: {
          entityType: 'DOCUMENT',
          entityId: id
        }
      })
      console.log(`🗑️ Deleted ${deletedAuditLogs.count} related audit logs`)
    } catch (auditError) {
      console.warn(`⚠️ Failed to delete audit logs for document ${id}:`, auditError)
      // Continue anyway
    }
    
    // Delete related learning feedback
    try {
      const deletedFeedback = await prisma.learningFeedback.deleteMany({
        where: {
          documentId: id
        }
      })
      console.log(`🗑️ Deleted ${deletedFeedback.count} related learning feedback records`)
    } catch (feedbackError) {
      console.warn(`⚠️ Failed to delete learning feedback for document ${id}:`, feedbackError)
      // Continue anyway
    }
    
    // Delete document from database
    await prisma.document.delete({
      where: { id }
    })
    
    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'DELETE_DOCUMENT',
        entityType: 'DOCUMENT',
        entityId: id,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        metadata: {
          fileName: document.originalName,
          category: document.category,
          timestamp: new Date().toISOString()
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully',
      warnings: fileDeleteError ? [fileDeleteError] : undefined
    })
    
  } catch (error) {
    console.error('Document deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    )
  }
}

// Download document file
async function downloadDocument(request: NextRequest, user: AuthUser) {
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
    
    const document = await prisma.document.findFirst({
      where: {
        id,
        userId: user.id // Ensure user can only download their own documents
      }
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
      
      // Create audit log for download
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
    console.error('Document download error:', error)
    return NextResponse.json(
      { error: 'Failed to download document' },
      { status: 500 }
    )
  }
}

export const GET = createProtectedRoute(downloadDocument)
export const DELETE = createProtectedRoute(deleteDocument)