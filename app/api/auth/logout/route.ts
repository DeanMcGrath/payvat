import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Get user from token before clearing it
    const user = await getUserFromRequest(request)
    
    // Create audit log if user was authenticated
    if (user) {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'LOGOUT',
          entityType: 'USER',
          entityId: user.id,
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          metadata: {
            timestamp: new Date().toISOString()
          }
        }
      })
    }
    
    // Clear the authentication cookie
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    })
    
    response.cookies.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Immediately expire
      path: '/',
    })
    
    return response
    
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}