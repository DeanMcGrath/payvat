import { NextRequest } from 'next/server'
import { createGuestFriendlyRoute } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { AuthUser } from '@/lib/auth'
import { logAudit } from '@/lib/secure-logger'

async function getProfile(request: NextRequest, user?: AuthUser) {
  try {
    logAudit('PROFILE_REQUEST', {
      userId: user?.id,
      operation: 'profile',
      result: 'SUCCESS'
    })
    
    if (!user) {
      // Guest user - provide minimal profile
      return NextResponse.json({
        success: true,
        user: {
          id: 'guest',
          email: 'guest@payvat.ie',
          businessName: 'Guest User',
          vatNumber: 'GUEST',
          firstName: 'Guest',
          lastName: 'User',
          role: 'GUEST'
        }
      })
    }
    
    // Get full user profile from database
    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        role: true,
        businessName: true,
        vatNumber: true,
        firstName: true,
        lastName: true,
        phone: true,
        address: true,
        createdAt: true,
        lastLoginAt: true,
        emailVerified: true,
      }
    })
    
    if (!userProfile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      user: userProfile
    })
    
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export const GET = createGuestFriendlyRoute(getProfile)