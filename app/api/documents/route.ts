import { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { createGuestFriendlyRoute } from '@/lib/middleware'
import { prisma, withDatabaseRetry } from '@/lib/prisma'
import { AuthUser } from '@/lib/auth'
import { logError, logAudit, logPerformance } from '@/lib/secure-logger'

// GET /api/documents - List user's documents
async function getDocuments(request: NextRequest, user?: AuthUser) {
  try {
    const startTime = Date.now()
    const { searchParams } = new URL(request.url)
    const vatReturnId = searchParams.get('vatReturnId')
    const category = searchParams.get('category')
    const dashboard = searchParams.get('dashboard') === 'true'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || (dashboard ? '50' : '10')), 50) // Max 50 per page
    
    // Test basic database connectivity - FIXED: Removed Promise.race
    try {
      await prisma.$queryRaw`SELECT 1`
    } catch (dbError) {
      console.error('Database connection failed:', dbError)
      logError('Database connection failed', dbError, {
        userId: user?.id,
        operation: 'documents-list-db-test'
      })
      return NextResponse.json({
        success: true,
        documents: [],
        pagination: {
          page: 1,
          limit: 10,
          totalCount: 0,
          totalPages: 0
        },
        message: 'Service temporarily unavailable'
      })
    }
    
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
      // Guest user - simplified approach to avoid complex joins
      try {
        // FIXED: Simplify guest user query - no complex time filtering
        const guestUsers = await prisma.User.findMany({
          where: {
            role: 'GUEST'
          },
          select: { id: true },
          take: 100,
          orderBy: { createdAt: 'desc' }
        })
        
        if (guestUsers.length === 0) {
          return NextResponse.json({
            success: true,
            documents: [],
            pagination: {
              page: 1,
              limit: 10,
              totalCount: 0,
              totalPages: 0
            },
            message: 'No recent guest documents found'
          })
        }
        
        where.userId = {
          in: guestUsers.map(u => u.id)
        }
      } catch (guestError) {
        logError('Guest user lookup failed', guestError, {
          operation: 'documents-list-guest-lookup'
        })
        return NextResponse.json({
          success: true,
          documents: [],
          pagination: {
            page: 1,
            limit: 10,
            totalCount: 0,
            totalPages: 0
          },
          message: 'Unable to retrieve guest documents'
        })
      }
    }
    
    if (vatReturnId) {
      where.vatReturnId = vatReturnId
    }
    
    if (category) {
      where.category = category
    }
    
    // Add date filtering if provided
    if (startDate && endDate) {
      const startDateTime = new Date(startDate)
      const endDateTime = new Date(endDate)
      
      // Filter documents by upload date or extracted date within the specified range
      where.OR = [
        {
          uploadedAt: {
            gte: startDateTime,
            lte: endDateTime
          }
        },
        {
          extractedDate: {
            gte: startDateTime,
            lte: endDateTime
          }
        }
      ]
    }
    
    // FIXED: Remove Promise.race wrapper - let Prisma handle timeouts
    const totalCount = await prisma.Document.count({ where })
    
    // FIXED: Remove Promise.race wrapper - let Prisma handle timeouts
    const documents = await prisma.Document.findMany({
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
        vatReturnId: true
        // REMOVED: extractedDate, extractedYear, extractedMonth - columns don't exist in database
      },
      orderBy: {
        uploadedAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit,
    })
    
    // FIXED: Simplified document processing
    const processedDocuments = documents.map(doc => ({
      ...doc,
      // Basic compatibility fields
      confidence: 0.8, // Default confidence for existing documents
      vatAmount: null,
      aiConfidence: 0.8
    }))
    
    logPerformance('documents-list-authenticated', Date.now() - startTime, {
      userId: user?.id,
      operation: 'documents-list-authenticated'
    })

    return NextResponse.json({
      success: true,
      documents: processedDocuments,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
    
  } catch (error) {
    // FIXED: Log and return the actual error for debugging
    console.error('Documents API Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    logError('Documents fetch error', error, {
      userId: user?.id,
      operation: 'documents-list',
      errorMessage
    })
    return NextResponse.json(
      { 
        success: false,
        error: `Failed to fetch documents: ${errorMessage}`,
        documents: [],
        pagination: {
          page: 1,
          limit: 10,
          totalCount: 0,
          totalPages: 0
        }
      },
      { status: 500 }
    )
  }
}

export const GET = createGuestFriendlyRoute(getDocuments)