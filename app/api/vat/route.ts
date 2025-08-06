import { NextRequest, NextResponse } from 'next/server'
import { createProtectedRoute } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { AuthUser } from '@/lib/auth'

// GET /api/vat - List user's VAT returns
async function getVATReturns(request: NextRequest, user: AuthUser) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const year = searchParams.get('year')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)
    
    // Build where clause
    const where: any = {
      userId: user.id
    }
    
    if (status) {
      where.status = status
    }
    
    if (year) {
      const yearNum = parseInt(year)
      where.periodStart = {
        gte: new Date(yearNum, 0, 1),
        lt: new Date(yearNum + 1, 0, 1)
      }
    }
    
    // Get total count
    const totalCount = await prisma.vATReturn.count({ where })
    
    // Get VAT returns with related data
    const vatReturns = await prisma.vATReturn.findMany({
      where,
      include: {
        documents: {
          select: {
            id: true,
            originalName: true,
            category: true,
            uploadedAt: true,
            isScanned: true
          }
        },
        payment: {
          select: {
            id: true,
            amount: true,
            status: true,
            processedAt: true,
            receiptNumber: true
          }
        }
      },
      orderBy: [
        { periodEnd: 'desc' },
        { createdAt: 'desc' }
      ],
      skip: (page - 1) * limit,
      take: limit
    })
    
    return NextResponse.json({
      success: true,
      vatReturns,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
    
  } catch (error) {
    console.error('VAT returns fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch VAT returns' },
      { status: 500 }
    )
  }
}

export const GET = createProtectedRoute(getVATReturns)