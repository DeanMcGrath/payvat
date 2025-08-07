import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { User } from './generated/prisma'

// Types for authentication
export interface AuthUser {
  id: string
  email: string
  role: string
  businessName: string
  vatNumber: string
}

export interface JWTPayload {
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET!
const TOKEN_EXPIRY = '24h'

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

// JWT token creation and verification
export function createJWTToken(user: AuthUser): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  }
  
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: TOKEN_EXPIRY,
    issuer: 'payvat.ie',
    audience: 'payvat.ie'
  })
}

export function verifyJWTToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'payvat.ie',
      audience: 'payvat.ie'
    }) as JWTPayload
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

// Extract user from request
export async function getUserFromRequest(request: NextRequest): Promise<AuthUser | null> {
  try {
    const token = request.cookies.get('auth_token')?.value
    
    if (!token) {
      return null
    }
    
    const payload = verifyJWTToken(token)
    if (!payload) {
      return null
    }
    
    // Load full user data from database
    const { prisma } = await import('./prisma')
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        businessName: true,
        vatNumber: true
      }
    })
    
    if (!user) {
      return null
    }
    
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      businessName: user.businessName,
      vatNumber: user.vatNumber
    }
  } catch (error) {
    console.error('Error extracting user from request:', error)
    return null
  }
}

// Role-based authorization
export function hasRole(user: AuthUser | null, requiredRole: string): boolean {
  if (!user) return false
  
  const roles = ['USER', 'ADMIN', 'SUPER_ADMIN']
  const userRoleIndex = roles.indexOf(user.role)
  const requiredRoleIndex = roles.indexOf(requiredRole)
  
  return userRoleIndex >= requiredRoleIndex
}

// Convert Prisma User to AuthUser
export function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    businessName: user.businessName,
    vatNumber: user.vatNumber
  }
}