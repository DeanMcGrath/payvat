import { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { createGuestFriendlyRoute } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { AuthUser } from '@/lib/auth'
import { logError, logAudit, logPerformance } from '@/lib/secure-logger'

// GET /api/documents - List user's documents
async function getDocuments(request: NextRequest, user?: AuthUser) {
  try {
    const startTime = Date.now()
    const { searchParams } = new URL(request.url)
    const vatReturnId = searchParams.get('vatReturnId')
    const category = searchParams.get('category')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50) // Max 50 per page
    
    logAudit('DOCUMENTS_LIST_REQUEST', {
      userId: user?.id,
      operation: 'documents-list',
      result: 'SUCCESS'
    })
    
    // Build where clause - FIXED: Use same logic as extracted-vat endpoint
    const where: any = {}
    
    if (user) {
      // Authenticated user - get their documents
      where.userId = user.id
    } else {
      // Guest user - find recent guest documents (same logic as extracted-vat endpoint)
      const recentGuestDocuments = await prisma.document.findMany({
        where: {
          user: {
            role: 'GUEST' // Find documents owned by users with GUEST role
          },
          uploadedAt: {
            gte: new Date(Date.now() - 1000 * 60 * 60 * 24) // Last 24 hours
          }
        },
        include: {
          user: true
        },
        orderBy: {
          uploadedAt: 'desc'
        },
        take: 50 // Reasonable limit for guests
      })
      
      // Return guest documents directly instead of using where clause
      const totalCount = recentGuestDocuments.length
      const paginatedDocs = recentGuestDocuments.slice(
        (page - 1) * limit,
        page * limit
      )
      
      const documents = paginatedDocs.map(doc => ({
        id: doc.id,
        fileName: doc.fileName,
        originalName: doc.originalName,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
        documentType: doc.documentType,
        category: doc.category,
        isScanned: doc.isScanned,
        scanResult: doc.scanResult,
        uploadedAt: doc.uploadedAt,
        vatReturnId: doc.vatReturnId,
      }))
      
      logPerformance('documents-list-guest', Date.now() - startTime, {
        operation: 'documents-list-guest'
      })
      
      return NextResponse.json({
        success: true,
        documents,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit)
        },
        isGuestUser: true,
        debugInfo: {
          foundDocuments: totalCount,
          timeWindow: '24 hours',
          queryTime: new Date().toISOString()
        }
      })
    }
    
    if (vatReturnId) {
      where.vatReturnId = vatReturnId
    }
    
    if (category) {
      where.category = category
    }
    
    // Get total count
    const totalCount = await prisma.document.count({ where })
    
    // Get documents with pagination
    const documents = await prisma.document.findMany({
      where,
      select: {
        id: true,
        fileName: true,
        originalName: true,
        fileSize: true,
        mimeType: true,
        documentType: true,
        category: true,
        isScanned: true,
        scanResult: true,
        uploadedAt: true,
        vatReturnId: true,
      },
      orderBy: {
        uploadedAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit,
    })
    
    logPerformance('documents-list-authenticated', Date.now() - startTime, {
      userId: user.id,
      operation: 'documents-list-authenticated'
    })

    return NextResponse.json({
      success: true,
      documents,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
    
  } catch (error) {
    logError('Documents fetch error', error, {
      userId: user?.id,
      operation: 'documents-list'
    })
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}

export const GET = createGuestFriendlyRoute(getDocuments)