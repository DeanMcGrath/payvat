import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'

// Input validation schema for admin creation
const adminSetupSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  businessName: z.string().min(2, 'Business name is required'),
  vatNumber: z.string().min(5, 'VAT number is required'),
  setupKey: z.string().min(10, 'Setup key is required')
})

// POST /api/admin/setup - Create first admin user (one-time setup)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validationResult = adminSetupSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }
    
    const { email, password, businessName, vatNumber, setupKey } = validationResult.data
    
    // Security: Verify setup key (should be set in environment)
    const expectedSetupKey = process.env.ADMIN_SETUP_KEY
    
    // Debug logging (remove in production)
    console.log('Admin setup key validation:')
    console.log('- Environment key exists:', !!expectedSetupKey)
    console.log('- Environment key length:', expectedSetupKey?.length || 0)
    console.log('- Received key length:', setupKey?.length || 0)
    console.log('- Keys match (exact):', setupKey === expectedSetupKey)
    console.log('- Keys match (trimmed):', setupKey?.trim() === expectedSetupKey?.trim())
    
    // Improved validation with better error messages
    if (!expectedSetupKey) {
      console.error('ADMIN_SETUP_KEY environment variable not set')
      return NextResponse.json(
        { error: 'Admin setup not configured. Contact system administrator.' },
        { status: 500 }
      )
    }
    
    // Trim whitespace and compare
    const trimmedSetupKey = setupKey?.trim()
    const trimmedExpectedKey = expectedSetupKey?.trim()
    
    if (!trimmedSetupKey || trimmedSetupKey !== trimmedExpectedKey) {
      console.warn('Setup key validation failed:', {
        receivedLength: trimmedSetupKey?.length || 0,
        expectedLength: trimmedExpectedKey?.length || 0,
        receivedStart: trimmedSetupKey?.substring(0, 5) || 'empty',
        expectedStart: trimmedExpectedKey?.substring(0, 5) || 'empty'
      })
      
      return NextResponse.json(
        { 
          error: 'Invalid setup key',
          debug: process.env.NODE_ENV === 'development' ? {
            receivedLength: trimmedSetupKey?.length || 0,
            expectedLength: trimmedExpectedKey?.length || 0,
            hint: 'Check for whitespace or encoding issues'
          } : undefined
        },
        { status: 401 }
      )
    }
    
    // Check if any admin users already exist (prevent multiple setups)
    const existingAdmin = await prisma.user.findFirst({
      where: {
        role: {
          in: ['ADMIN', 'SUPER_ADMIN']
        }
      }
    })
    
    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin user already exists. Contact existing admin for access.' },
        { status: 403 }
      )
    }
    
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password)
    
    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'SUPER_ADMIN', // First admin gets super admin role
        businessName,
        vatNumber: vatNumber.toUpperCase(),
        emailVerified: new Date(), // Auto-verify admin email
      }
    })
    
    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: adminUser.id,
        action: 'ADMIN_SETUP',
        entityType: 'USER',
        entityId: adminUser.id,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        metadata: {
          role: 'SUPER_ADMIN',
          email: adminUser.email,
          timestamp: new Date().toISOString(),
          setupComplete: true
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully. You can now login with admin privileges.',
      user: {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        businessName: adminUser.businessName
      }
    })
    
  } catch (error) {
    console.error('Admin setup error:', error)
    return NextResponse.json(
      { error: 'Failed to create admin user' },
      { status: 500 }
    )
  }
}