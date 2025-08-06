import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { hashPassword, createJWTToken, toAuthUser } from '@/lib/auth'

// Input validation schema
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  vatNumber: z.string().regex(/^IE[0-9]{7}[A-Z]{1,2}$/, 'Invalid Irish VAT number format (IE1234567A)'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validationResult = registerSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }
    
    const { email, password, businessName, vatNumber, firstName, lastName, phone } = validationResult.data
    
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { vatNumber: vatNumber.toUpperCase() }
        ]
      }
    })
    
    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 409 }
        )
      }
      if (existingUser.vatNumber === vatNumber.toUpperCase()) {
        return NextResponse.json(
          { error: 'User with this VAT number already exists' },
          { status: 409 }
        )
      }
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password)
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        businessName,
        vatNumber: vatNumber.toUpperCase(),
        firstName,
        lastName,
        phone,
        role: 'USER', // Default role
      }
    })
    
    // Create JWT token
    const authUser = toAuthUser(user)
    const token = createJWTToken(authUser)
    
    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'REGISTER',
        entityType: 'USER',
        entityId: user.id,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        metadata: {
          businessName,
          vatNumber: vatNumber.toUpperCase(),
          timestamp: new Date().toISOString()
        }
      }
    })
    
    // Set secure HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: authUser.id,
        email: authUser.email,
        role: authUser.role,
        businessName: authUser.businessName,
        vatNumber: authUser.vatNumber
      }
    })
    
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    })
    
    return response
    
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}