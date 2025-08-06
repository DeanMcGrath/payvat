import { NextRequest, NextResponse } from 'next/server'
import { createAdminRoute } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { AuthUser } from '@/lib/auth'

// GET /api/admin/documents - View all documents (admin only)
async function getDocuments(request: NextRequest, user: AuthUser) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const category = searchParams.get('category')
    const documentType = searchParams.get('documentType')
    const isScanned = searchParams.get('isScanned')
    const vatReturnId = searchParams.get('vatReturnId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    
    // Build where clause
    const where: any = {}
    
    if (userId) {
      where.userId = userId
    }
    
    if (category) {
      where.category = category
    }
    
    if (documentType) {
      where.documentType = documentType
    }
    
    if (isScanned !== null && isScanned !== undefined) {
      where.isScanned = isScanned === 'true'
    }
    
    if (vatReturnId) {
      where.vatReturnId = vatReturnId
    }
    
    // Get total count
    const totalCount = await prisma.document.count({ where })
    
    // Get documents with user and VAT return info
    const documents = await prisma.document.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            businessName: true,
            vatNumber: true
          }
        },
        vatReturn: {
          select: {
            id: true,
            periodStart: true,
            periodEnd: true,
            status: true,
            revenueRefNumber: true
          }
        }
      },
      orderBy: [
        { uploadedAt: 'desc' }
      ],
      skip: (page - 1) * limit,
      take: limit
    })
    
    // Create admin audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'ADMIN_VIEW_DOCUMENTS',
        entityType: 'DOCUMENT',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        metadata: {
          filters: { userId, category, documentType, isScanned, vatReturnId },
          resultCount: documents.length,
          timestamp: new Date().toISOString()
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      documents: documents.map(doc => ({
        id: doc.id,
        fileName: doc.originalName,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
        documentType: doc.documentType,
        category: doc.category,
        isScanned: doc.isScanned,
        scanResult: doc.scanResult,
        uploadedAt: doc.uploadedAt,
        user: doc.user,
        vatReturn: doc.vatReturn ? {
          id: doc.vatReturn.id,
          period: `${doc.vatReturn.periodStart.toLocaleDateString('en-IE')} - ${doc.vatReturn.periodEnd.toLocaleDateString('en-IE')}`,
          status: doc.vatReturn.status,
          revenueRefNumber: doc.vatReturn.revenueRefNumber
        } : null
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
    
  } catch (error) {
    console.error('Admin documents fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}

export const GET = createAdminRoute(getDocuments)