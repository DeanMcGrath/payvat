import { NextRequest, NextResponse } from 'next/server'
import { createProtectedRoute } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { AuthUser } from '@/lib/auth'

// GET /api/vat/[id] - Get specific VAT return
async function getVATReturn(request: NextRequest, user: AuthUser) {
  try {
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()
    
    if (!id) {
      return NextResponse.json(
        { error: 'VAT return ID is required' },
        { status: 400 }
      )
    }
    
    const vatReturn = await prisma.vATReturn.findFirst({
      where: {
        id,
        userId: user.id // Ensure user can only access their own returns
      },
      include: {
        documents: {
          select: {
            id: true,
            originalName: true,
            fileName: true,
            fileSize: true,
            category: true,
            documentType: true,
            uploadedAt: true,
            isScanned: true
          }
        },
        payment: {
          select: {
            id: true,
            amount: true,
            currency: true,
            status: true,
            paymentMethod: true,
            processedAt: true,
            receiptNumber: true,
            receiptUrl: true,
            failureReason: true,
            createdAt: true
          }
        }
      }
    })
    
    if (!vatReturn) {
      return NextResponse.json(
        { error: 'VAT return not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      vatReturn
    })
    
  } catch (error) {
    console.error('VAT return fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch VAT return' },
      { status: 500 }
    )
  }
}

// DELETE /api/vat/[id] - Delete draft VAT return
async function deleteVATReturn(request: NextRequest, user: AuthUser) {
  try {
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()
    
    if (!id) {
      return NextResponse.json(
        { error: 'VAT return ID is required' },
        { status: 400 }
      )
    }
    
    const vatReturn = await prisma.vATReturn.findFirst({
      where: {
        id,
        userId: user.id,
        status: 'DRAFT' // Can only delete draft returns
      }
    })
    
    if (!vatReturn) {
      return NextResponse.json(
        { error: 'VAT return not found or cannot be deleted' },
        { status: 404 }
      )
    }
    
    // Unlink any documents first
    await prisma.document.updateMany({
      where: {
        vatReturnId: id
      },
      data: {
        vatReturnId: null
      }
    })
    
    // Delete the VAT return
    await prisma.vATReturn.delete({
      where: { id }
    })
    
    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'DELETE_VAT_RETURN',
        entityType: 'VAT_RETURN',
        entityId: id,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        metadata: {
          netVAT: vatReturn.netVAT,
          period: `${vatReturn.periodStart.toISOString()} to ${vatReturn.periodEnd.toISOString()}`,
          timestamp: new Date().toISOString()
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'VAT return deleted successfully'
    })
    
  } catch (error) {
    console.error('VAT return deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete VAT return' },
      { status: 500 }
    )
  }
}

export const GET = createProtectedRoute(getVATReturn)
export const DELETE = createProtectedRoute(deleteVATReturn)