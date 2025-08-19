import { NextRequest, NextResponse } from 'next/server'
import { createGuestFriendlyRoute } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { AuthUser } from '@/lib/auth'
import { logError, logWarn, logInfo, logAudit, logPerformance } from '@/lib/secure-logger'

interface SearchFilters {
  query?: string
  dateFrom?: string
  dateTo?: string
  categories?: string[]
  validationStatus?: string[]
  minAmount?: number
  maxAmount?: number
  minVATAccuracy?: number
  maxVATAccuracy?: number
  complianceIssues?: string[]
  isDuplicate?: boolean
  year?: number
  month?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

interface SearchResult {
  id: string
  fileName: string
  originalName: string
  category: string
  extractedDate?: Date
  invoiceTotal?: number
  vatAccuracy?: number
  processingQuality?: number
  validationStatus: string
  complianceIssues: string[]
  isDuplicate: boolean
  duplicateOfId?: string
  uploadedAt: Date
  relevanceScore: number
}

/**
 * GET /api/documents/search - Advanced document search with filtering
 */
async function searchDocuments(request: NextRequest, user?: AuthUser) {
  try {
    const startTime = Date.now()
    const { searchParams } = new URL(request.url)
    
    logAudit('DOCUMENT_SEARCH_REQUEST', {
      userId: user?.id,
      operation: 'document-search',
      result: 'SUCCESS'
    })

    // Parse search parameters
    const filters: SearchFilters = {
      query: searchParams.get('query') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      categories: searchParams.get('categories')?.split(',').filter(Boolean) || [],
      validationStatus: searchParams.get('validationStatus')?.split(',').filter(Boolean) || [],
      minAmount: searchParams.get('minAmount') ? parseFloat(searchParams.get('minAmount')!) : undefined,
      maxAmount: searchParams.get('maxAmount') ? parseFloat(searchParams.get('maxAmount')!) : undefined,
      minVATAccuracy: searchParams.get('minVATAccuracy') ? parseFloat(searchParams.get('minVATAccuracy')!) : undefined,
      maxVATAccuracy: searchParams.get('maxVATAccuracy') ? parseFloat(searchParams.get('maxVATAccuracy')!) : undefined,
      complianceIssues: searchParams.get('complianceIssues')?.split(',').filter(Boolean) || [],
      isDuplicate: searchParams.get('isDuplicate') ? searchParams.get('isDuplicate') === 'true' : undefined,
      year: searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined,
      month: searchParams.get('month') ? parseInt(searchParams.get('month')!) : undefined,
      sortBy: searchParams.get('sortBy') || 'relevance',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      limit: Math.min(parseInt(searchParams.get('limit') || '50'), 100), // Max 100 results
      offset: parseInt(searchParams.get('offset') || '0')
    }

    // Build where clause for user access
    const userWhere: any = {}
    
    if (user) {
      userWhere.userId = user.id
    } else {
      // Guest user logic
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
          documents: [],
          totalResults: 0,
          message: 'No recent documents found'
        })
      }
      
      userWhere.userId = {
        in: recentGuestUsers.map(u => u.id)
      }
    }

    // Build search conditions
    const searchConditions: any[] = [userWhere]

    // Full-text search on filename and original name
    if (filters.query) {
      const searchQuery = filters.query.toLowerCase()
      searchConditions.push({
        OR: [
          {
            fileName: {
              contains: searchQuery,
              mode: 'insensitive'
            }
          },
          {
            originalName: {
              contains: searchQuery,
              mode: 'insensitive'
            }
          },
          {
            scanResult: {
              contains: searchQuery,
              mode: 'insensitive'
            }
          }
        ]
      })
    }

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      const dateCondition: any = {}
      if (filters.dateFrom) {
        dateCondition.gte = new Date(filters.dateFrom)
      }
      if (filters.dateTo) {
        dateCondition.lte = new Date(filters.dateTo)
      }
      
      searchConditions.push({
        OR: [
          { extractedDate: dateCondition },
          { uploadedAt: dateCondition }
        ]
      })
    }

    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      searchConditions.push({
        category: {
          in: filters.categories
        }
      })
    }

    // Validation status filter
    if (filters.validationStatus && filters.validationStatus.length > 0) {
      searchConditions.push({
        validationStatus: {
          in: filters.validationStatus
        }
      })
    }

    // Amount range filter
    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
      const amountCondition: any = {}
      if (filters.minAmount !== undefined) {
        amountCondition.gte = filters.minAmount
      }
      if (filters.maxAmount !== undefined) {
        amountCondition.lte = filters.maxAmount
      }
      
      searchConditions.push({
        invoiceTotal: amountCondition
      })
    }

    // VAT accuracy filter
    if (filters.minVATAccuracy !== undefined || filters.maxVATAccuracy !== undefined) {
      const vatAccuracyCondition: any = {}
      if (filters.minVATAccuracy !== undefined) {
        vatAccuracyCondition.gte = filters.minVATAccuracy
      }
      if (filters.maxVATAccuracy !== undefined) {
        vatAccuracyCondition.lte = filters.maxVATAccuracy
      }
      
      searchConditions.push({
        vatAccuracy: vatAccuracyCondition
      })
    }

    // Compliance issues filter
    if (filters.complianceIssues && filters.complianceIssues.length > 0) {
      searchConditions.push({
        complianceIssues: {
          hasSome: filters.complianceIssues
        }
      })
    }

    // Duplicate filter
    if (filters.isDuplicate !== undefined) {
      searchConditions.push({
        isDuplicate: filters.isDuplicate
      })
    }

    // Year/month filter
    if (filters.year !== undefined) {
      searchConditions.push({
        extractedYear: filters.year
      })
    }
    
    if (filters.month !== undefined) {
      searchConditions.push({
        extractedMonth: filters.month
      })
    }

    // Combine all search conditions
    const where = {
      AND: searchConditions
    }

    // Build order by clause
    let orderBy: any = []
    
    if (filters.sortBy === 'relevance' && filters.query) {
      // For relevance, we'll calculate relevance scores after fetching
      orderBy = [{ uploadedAt: filters.sortOrder }]
    } else {
      switch (filters.sortBy) {
        case 'uploadedAt':
          orderBy = [{ uploadedAt: filters.sortOrder }]
          break
        case 'extractedDate':
          orderBy = [{ extractedDate: filters.sortOrder }, { uploadedAt: filters.sortOrder }]
          break
        case 'invoiceTotal':
          orderBy = [{ invoiceTotal: filters.sortOrder }]
          break
        case 'vatAccuracy':
          orderBy = [{ vatAccuracy: filters.sortOrder }]
          break
        case 'fileName':
          orderBy = [{ originalName: filters.sortOrder }]
          break
        default:
          orderBy = [{ uploadedAt: filters.sortOrder }]
      }
    }

    // Get total count for pagination
    const totalResults = await prisma.document.count({ where })

    // Fetch documents
    const documents = await prisma.document.findMany({
      where,
      select: {
        id: true,
        fileName: true,
        originalName: true,
        category: true,
        extractedDate: true,
        invoiceTotal: true,
        vatAccuracy: true,
        processingQuality: true,
        validationStatus: true,
        complianceIssues: true,
        isDuplicate: true,
        duplicateOfId: true,
        uploadedAt: true,
        fileSize: true,
        mimeType: true
      },
      orderBy,
      skip: filters.offset || 0,
      take: filters.limit || 50
    })

    // Calculate relevance scores if searching by relevance
    const results: SearchResult[] = documents.map(doc => {
      let relevanceScore = 1.0
      
      if (filters.query && filters.sortBy === 'relevance') {
        const query = filters.query.toLowerCase()
        
        // Score based on filename match
        if (doc.originalName.toLowerCase().includes(query)) {
          relevanceScore += 2.0
        }
        
        // Boost exact matches
        if (doc.originalName.toLowerCase() === query) {
          relevanceScore += 5.0
        }
        
        // Boost for recent documents
        const daysSinceUpload = (Date.now() - doc.uploadedAt.getTime()) / (1000 * 60 * 60 * 24)
        if (daysSinceUpload < 30) {
          relevanceScore += 1.0 - (daysSinceUpload / 30)
        }
        
        // Boost for high quality documents
        if (doc.processingQuality && doc.processingQuality > 80) {
          relevanceScore += 0.5
        }
        
        // Boost for compliant documents
        if (doc.validationStatus === 'COMPLIANT') {
          relevanceScore += 0.3
        }
      }

      return {
        id: doc.id,
        fileName: doc.fileName,
        originalName: doc.originalName,
        category: doc.category,
        extractedDate: doc.extractedDate || undefined,
        invoiceTotal: doc.invoiceTotal ? parseFloat(doc.invoiceTotal.toString()) : undefined,
        vatAccuracy: doc.vatAccuracy || undefined,
        processingQuality: doc.processingQuality || undefined,
        validationStatus: doc.validationStatus,
        complianceIssues: doc.complianceIssues,
        isDuplicate: doc.isDuplicate,
        duplicateOfId: doc.duplicateOfId || undefined,
        uploadedAt: doc.uploadedAt,
        relevanceScore
      }
    })

    // Sort by relevance if needed
    if (filters.sortBy === 'relevance' && filters.query) {
      results.sort((a, b) => {
        if (filters.sortOrder === 'asc') {
          return a.relevanceScore - b.relevanceScore
        } else {
          return b.relevanceScore - a.relevanceScore
        }
      })
    }

    logPerformance('document-search', Date.now() - startTime, {
      operation: 'document-search',
      resultsCount: results.length,
      totalResults,
      hasQuery: !!filters.query,
      filterCount: Object.keys(filters).filter(key => {
        const value = filters[key as keyof SearchFilters]
        return value !== undefined && value !== null && 
               (Array.isArray(value) ? value.length > 0 : true)
      }).length
    })

    return NextResponse.json({
      success: true,
      documents: results,
      totalResults,
      pagination: {
        limit: filters.limit || 50,
        offset: filters.offset || 0,
        hasMore: (filters.offset || 0) + results.length < totalResults
      },
      searchTime: Date.now() - startTime,
      filters: {
        query: filters.query,
        activeFilters: Object.keys(filters).filter(key => {
          const value = filters[key as keyof SearchFilters]
          return value !== undefined && value !== null && 
                 (Array.isArray(value) ? value.length > 0 : true)
        }).length - 3 // Exclude sortBy, sortOrder, limit which are always present
      }
    })

  } catch (error) {
    logError('Document search failed', error, 'API_DOCUMENT_SEARCH')
    return NextResponse.json({
      success: false,
      error: 'Search failed',
      documents: [],
      totalResults: 0
    }, { status: 500 })
  }
}

export const GET = createGuestFriendlyRoute(searchDocuments)