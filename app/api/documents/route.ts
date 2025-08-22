import { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { createGuestFriendlyRoute } from '@/lib/middleware'
import { prisma, withDatabaseFallback } from '@/lib/prisma'
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
    
    // Define fallback data structure
    const fallbackDocuments = {
      documents: [],
      pagination: {
        page: 1,
        limit: 10,
        totalCount: 0,
        totalPages: 0
      }
    }
    
    const fallbackKey = `documents-${user?.id || 'guest'}-${vatReturnId || 'all'}-${category || 'all'}`
    
    // Use withDatabaseFallback for graceful degradation
    const result = await withDatabaseFallback(
      async () => {
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
            return fallbackDocuments
          }
          
          where.userId = {
            in: guestUsers.map(u => u.id)
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
            // New dashboard fields - conditionally selected (only existing fields)
            ...(dashboard && {
              extractedDate: true,
              extractedYear: true,
              extractedMonth: true,
              invoiceTotal: true,
              vatAccuracy: true,
              processingQuality: true,
              isDuplicate: true,
              duplicateOfId: true,
              validationStatus: true,
              complianceIssues: true,
              extractionConfidence: true,
              dateExtractionConfidence: true,
              totalExtractionConfidence: true
            })
          },
          orderBy: {
            uploadedAt: 'desc'
          },
          skip: (page - 1) * limit,
          take: limit,
        })
        
        // Process documents for dashboard format
        const processedDocuments = documents.map(doc => ({
          ...doc,
          // Format new fields for dashboard
          ...(dashboard && {
            invoiceTotal: doc.invoiceTotal ? parseFloat(doc.invoiceTotal.toString()) : null,
            extractedDate: doc.extractedDate ? doc.extractedDate : null,
            // Map missing fields to existing ones for dashboard compatibility
            vatAmount: doc.vatAccuracy || null,
            aiConfidence: doc.extractionConfidence || null,
            confidence: doc.extractionConfidence || null
          })
        }))
        
        return {
          documents: processedDocuments,
          pagination: {
            page,
            limit,
            totalCount,
            totalPages: Math.ceil(totalCount / limit)
          }
        }
      },
      fallbackKey,
      fallbackDocuments
    )

    logPerformance('documents-list-authenticated', Date.now() - startTime, {
      userId: user?.id,
      operation: 'documents-list-authenticated'
    })

    return NextResponse.json({
      success: true,
      ...result.data,
      fromFallback: result.fromFallback,
      message: result.fromFallback ? 'Service temporarily unavailable - showing cached data' : undefined
    })
    
  } catch (error) {
    logError('Documents fetch error', error, {
      userId: user?.id,
      operation: 'documents-list'
    })
    
    // Determine appropriate error status and response
    const isTimeoutError = error instanceof Error && error.message.includes('timeout')
    const isConnectionError = error instanceof Error && error.message.includes('connection')
    
    const response = NextResponse.json(
      { 
        success: false,
        error: isTimeoutError ? 'Database query timeout - please try again' :
               isConnectionError ? 'Database connection failed - please try again' :
               'Failed to fetch documents',
        documents: [],
        pagination: {
          page: 1,
          limit: 10,
          totalCount: 0,
          totalPages: 0
        },
        retryAfter: isTimeoutError || isConnectionError ? 30 : 5 // seconds
      },
      { status: isTimeoutError ? 503 : isConnectionError ? 503 : 500 }
    )
    
    // Add retry hints for client
    if (isTimeoutError || isConnectionError) {
      response.headers.set('Retry-After', '30')
    }
    
    return response
  }
}

export const GET = createGuestFriendlyRoute(getDocuments)