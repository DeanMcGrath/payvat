import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest, hasRole, AuthUser } from '@/lib/auth'

// Middleware for protecting API routes
export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    return await handler(request, user)
    
  } catch (error) {
    console.error('Auth middleware error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    )
  }
}

// Middleware for role-based authorization
export async function withRole(
  request: NextRequest,
  requiredRole: string,
  handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const user = await getUserFromRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    if (!hasRole(user, requiredRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }
    
    return await handler(request, user)
    
  } catch (error) {
    console.error('Role middleware error:', error)
    return NextResponse.json(
      { error: 'Authorization failed' },
      { status: 403 }
    )
  }
}

// Helper function to create protected API routes
export function createProtectedRoute(
  handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    return withAuth(request, handler)
  }
}

// Helper function to create admin-only API routes
export function createAdminRoute(
  handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    return withRole(request, 'ADMIN', handler)
  }
}

// Helper function to create guest-friendly API routes (optional auth)
export function createGuestFriendlyRoute(
  handler: (request: NextRequest, user?: AuthUser) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      // Try to get user without aggressive timeout
      const user = await getUserFromRequest(request)
      
      return await handler(request, user || undefined)
    } catch (error) {
      console.warn('Guest-friendly route auth error, continuing as guest:', error)
      // Allow guest access - continue without user
      try {
        return await handler(request, undefined)
      } catch (handlerError) {
        console.error('Handler error in guest-friendly route:', handlerError)
        return NextResponse.json({
          success: false,
          error: 'Service temporarily unavailable'
        }, { status: 500 })
      }
    }
  }
}