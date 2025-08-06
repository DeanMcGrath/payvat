import { NextRequest } from 'next/server'
import { createProtectedRoute } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { AuthUser } from '@/lib/auth'

async function getProfile(request: NextRequest, user: AuthUser) {
  try {
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

export const GET = createProtectedRoute(getProfile)