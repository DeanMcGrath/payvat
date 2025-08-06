import { prisma } from './prisma'

export interface DatabaseResult<T> {
  success: boolean
  data?: T
  error?: string
  code?: string
}

// Wrapper for safe database operations
export async function safeDbOperation<T>(
  operation: () => Promise<T>,
  operationName: string = 'Database operation'
): Promise<DatabaseResult<T>> {
  try {
    const data = await operation()
    return {
      success: true,
      data
    }
  } catch (error) {
    console.error(`${operationName} failed:`, error)
    
    // Handle specific Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as any
      
      switch (prismaError.code) {
        case 'P2002':
          return {
            success: false,
            error: 'A record with this information already exists',
            code: 'DUPLICATE_RECORD'
          }
        case 'P2025':
          return {
            success: false,
            error: 'Record not found',
            code: 'NOT_FOUND'
          }
        case 'P1001':
        case 'P1008':
        case 'P1012':
          return {
            success: false,
            error: 'Database connection error. Please try again.',
            code: 'CONNECTION_ERROR'
          }
        case 'P2003':
          return {
            success: false,
            error: 'Referenced record not found',
            code: 'FOREIGN_KEY_ERROR'
          }
        default:
          return {
            success: false,
            error: `Database error: ${prismaError.message || 'Unknown error'}`,
            code: prismaError.code
          }
      }
    }
    
    // Handle general errors
    return {
      success: false,
      error: 'An unexpected database error occurred',
      code: 'UNKNOWN_ERROR'
    }
  }
}

// Common database operations with error handling
export class SafeDatabase {
  static async findUser(email: string) {
    return safeDbOperation(
      () => prisma.user.findUnique({ where: { email: email.toLowerCase() } }),
      'Find user by email'
    )
  }
  
  static async createUser(userData: any) {
    return safeDbOperation(
      () => prisma.user.create({ data: userData }),
      'Create user'
    )
  }
  
  static async updateUser(id: string, userData: any) {
    return safeDbOperation(
      () => prisma.user.update({ where: { id }, data: userData }),
      'Update user'
    )
  }
  
  static async findVATReturn(id: string, userId: string) {
    return safeDbOperation(
      () => prisma.vATReturn.findFirst({ 
        where: { id, userId },
        include: {
          documents: true,
          payment: true
        }
      }),
      'Find VAT return'
    )
  }
  
  static async createVATReturn(vatData: any) {
    return safeDbOperation(
      () => prisma.vATReturn.create({ data: vatData }),
      'Create VAT return'
    )
  }
  
  static async createDocument(docData: any) {
    return safeDbOperation(
      () => prisma.document.create({ data: docData }),
      'Create document'
    )
  }
  
  static async createAuditLog(logData: any) {
    return safeDbOperation(
      () => prisma.auditLog.create({ data: logData }),
      'Create audit log'
    )
  }
  
  static async createPayment(paymentData: any) {
    return safeDbOperation(
      () => prisma.payment.create({ data: paymentData }),
      'Create payment'
    )
  }
}

// Health check function
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database health check failed:', error)
    return false
  }
}