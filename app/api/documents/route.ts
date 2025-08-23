import { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { createGuestFriendlyRoute } from '@/lib/middleware'
import { prisma, withDatabaseFallback } from '@/lib/prisma'
import { AuthUser } from '@/lib/auth'
import { logError, logAudit, logPerformance } from '@/lib/secure-logger'

// GET /api/documents - List user's documents
async function getDocuments(request: NextRequest, user?: AuthUser) {
  const startTime = Date.now()
  
  try {
    const { searchParams } = new URL(request.url)
    const vatReturnId = searchParams.get('vatReturnId')
    const category = searchParams.get('category')
    const dashboard = searchParams.get('dashboard') === 'true'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || (dashboard ? '50' : '10')), 50) // Max 50 per page
    
    // No fallback data - database must work
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
    
    // Use withDatabaseFallback for graceful degradation - OUTSIDE try-catch
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
        
        // Get total count with timeout protection
        const totalCount = await Promise.race([
          prisma.document.count({ where }),
          new Promise<number>((_, reject) => 
            setTimeout(() => reject(new Error('Count query timeout')), 10000)
          )
        ])
        
        // Get documents with pagination and timeout protection
        const documents = await Promise.race([
          prisma.document.findMany({
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
          }),
          new Promise<any[]>((_, reject) => 
            setTimeout(() => reject(new Error('Documents query timeout')), 15000)
          )
        ])
        
        // Process documents for dashboard format
        const processedDocuments = documents.map(doc => ({
          ...doc,
          // Ensure consistent field formatting for dashboard
          originalName: doc.originalName || doc.fileName,
          // Format new fields for dashboard
          ...(dashboard && {
            invoiceTotal: doc.invoiceTotal ? (typeof doc.invoiceTotal === 'string' ? parseFloat(doc.invoiceTotal) : doc.invoiceTotal) : null,
            extractedDate: doc.extractedDate ? doc.extractedDate.toISOString() : null,
            // Map missing fields to existing ones for dashboard compatibility
            vatAmount: doc.vatAccuracy || null,
            aiConfidence: doc.extractionConfidence || null,
            confidence: doc.extractionConfidence || null,
            // Ensure boolean values are properly set
            isScanned: Boolean(doc.isScanned),
            // Handle potential null values
            scanResult: doc.scanResult || null,
            category: doc.category || 'PURCHASE'
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
    // Only catch non-database errors here (URL parsing, etc.)
    logError('Documents route error (non-database)', error, {
      userId: user?.id,
      operation: 'documents-list-route-error'
    })
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Invalid request parameters',
        documents: [],
        pagination: {
          page: 1,
          limit: 10,
          totalCount: 0,
          totalPages: 0
        }
      },
      { status: 400 }
    )
  }
}

export const GET = createGuestFriendlyRoute(getDocuments)