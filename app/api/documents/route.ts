import { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { createGuestFriendlyRoute } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { AuthUser } from '@/lib/auth'

// GET /api/documents - List user's documents
async function getDocuments(request: NextRequest, user?: AuthUser) {
  try {
    const { searchParams } = new URL(request.url)
    const vatReturnId = searchParams.get('vatReturnId')
    const category = searchParams.get('category')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50) // Max 50 per page
    
    // Build where clause - for guests, return empty or session-based results
    const where: any = {}
    
    if (user) {
      where.userId = user.id
    } else {
      // For guest users, return no documents (they get session-based storage)
      return NextResponse.json({
        success: true,
        documents: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: page
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
    console.error('Documents fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}

export const GET = createGuestFriendlyRoute(getDocuments)