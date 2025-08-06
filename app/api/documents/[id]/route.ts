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
    
    // Delete file from disk (only if filePath exists for legacy documents)
    if (document.filePath) {
      await deleteFile(document.filePath)
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
      message: 'Document deleted successfully'
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
    
    if (action !== 'download') {
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
      
      return new NextResponse(new Uint8Array(fileBuffer), {
        headers: {
          'Content-Type': document.mimeType,
          'Content-Disposition': `attachment; filename="${document.originalName}"`,
          'Content-Length': document.fileSize.toString(),
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