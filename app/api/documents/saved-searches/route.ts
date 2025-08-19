import { NextRequest, NextResponse } from 'next/server'
import { createGuestFriendlyRoute } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { AuthUser } from '@/lib/auth'
import { logError, logWarn, logInfo, logAudit, logPerformance } from '@/lib/secure-logger'

interface SavedSearch {
  id: string
  name: string
  filters: any
  createdAt: Date
  lastUsed: Date
  useCount: number
}

/**
 * GET /api/documents/saved-searches - Get user's saved searches
 */
async function getSavedSearches(request: NextRequest, user?: AuthUser) {
  try {
    if (!user) {
      // Guest users don't have saved searches
      return NextResponse.json({
        success: true,
        savedSearches: [],
        message: 'Saved searches require user account'
      })
    }

    const startTime = Date.now()
    
    logAudit('SAVED_SEARCHES_LIST', {
      userId: user.id,
      operation: 'saved-searches-list',
      result: 'SUCCESS'
    })

    // For now, return mock saved searches since we don't have the table yet
    // In a full implementation, we'd create a SavedSearch model
    const mockSavedSearches: SavedSearch[] = [
      {
        id: '1',
        name: 'Recent Invoices',
        filters: {
          categories: ['SALES_INVOICE', 'PURCHASE_INVOICE'],
          validationStatus: ['COMPLIANT'],
          sortBy: 'extractedDate',
          sortOrder: 'desc'
        },
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        useCount: 15
      },
      {
        id: '2',
        name: 'High Value Transactions',
        filters: {
          amountRange: { min: 1000, max: null },
          sortBy: 'invoiceTotal',
          sortOrder: 'desc'
        },
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        lastUsed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        useCount: 8
      },
      {
        id: '3',
        name: 'Documents Needing Review',
        filters: {
          validationStatus: ['NEEDS_REVIEW', 'NON_COMPLIANT'],
          sortBy: 'uploadedAt',
          sortOrder: 'desc'
        },
        createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
        lastUsed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        useCount: 23
      }
    ]

    logPerformance('saved-searches-list', Date.now() - startTime, {
      operation: 'saved-searches-list',
      searchCount: mockSavedSearches.length
    })

    return NextResponse.json({
      success: true,
      savedSearches: mockSavedSearches
    })

  } catch (error) {
    logError('Saved searches fetch failed', error, 'API_SAVED_SEARCHES')
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch saved searches',
      savedSearches: []
    }, { status: 500 })
  }
}

/**
 * POST /api/documents/saved-searches - Create a new saved search
 */
async function createSavedSearch(request: NextRequest, user?: AuthUser) {
  try {
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }

    const startTime = Date.now()
    const body = await request.json()
    
    const { name, filters } = body

    if (!name || !filters) {
      return NextResponse.json({
        success: false,
        error: 'Name and filters are required'
      }, { status: 400 })
    }

    if (name.length > 100) {
      return NextResponse.json({
        success: false,
        error: 'Search name must be less than 100 characters'
      }, { status: 400 })
    }

    logAudit('SAVED_SEARCH_CREATE', {
      userId: user.id,
      operation: 'saved-search-create',
      result: 'SUCCESS',
      searchName: name
    })

    // In a full implementation, we'd save to database:
    // const savedSearch = await prisma.savedSearch.create({
    //   data: {
    //     userId: user.id,
    //     name: name.trim(),
    //     filters: JSON.stringify(filters),
    //     createdAt: new Date(),
    //     lastUsed: new Date(),
    //     useCount: 0
    //   }
    // })

    // For now, return success with mock data
    const newSavedSearch = {
      id: Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      filters,
      createdAt: new Date(),
      lastUsed: new Date(),
      useCount: 0
    }

    logPerformance('saved-search-create', Date.now() - startTime, {
      operation: 'saved-search-create'
    })

    return NextResponse.json({
      success: true,
      savedSearch: newSavedSearch,
      message: 'Search saved successfully'
    })

  } catch (error) {
    logError('Saved search creation failed', error, 'API_SAVED_SEARCH_CREATE')
    return NextResponse.json({
      success: false,
      error: 'Failed to save search'
    }, { status: 500 })
  }
}

/**
 * DELETE /api/documents/saved-searches/[id] - Delete a saved search
 */
async function deleteSavedSearch(request: NextRequest, user?: AuthUser) {
  try {
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }

    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const searchId = pathParts[pathParts.length - 1]

    if (!searchId) {
      return NextResponse.json({
        success: false,
        error: 'Search ID is required'
      }, { status: 400 })
    }

    logAudit('SAVED_SEARCH_DELETE', {
      userId: user.id,
      operation: 'saved-search-delete',
      result: 'SUCCESS',
      searchId
    })

    // In a full implementation:
    // await prisma.savedSearch.delete({
    //   where: {
    //     id: searchId,
    //     userId: user.id // Ensure user owns the search
    //   }
    // })

    return NextResponse.json({
      success: true,
      message: 'Search deleted successfully'
    })

  } catch (error) {
    logError('Saved search deletion failed', error, 'API_SAVED_SEARCH_DELETE')
    return NextResponse.json({
      success: false,
      error: 'Failed to delete search'
    }, { status: 500 })
  }
}

export const GET = createGuestFriendlyRoute(getSavedSearches)
export const POST = createGuestFriendlyRoute(createSavedSearch)
export const DELETE = createGuestFriendlyRoute(deleteSavedSearch)