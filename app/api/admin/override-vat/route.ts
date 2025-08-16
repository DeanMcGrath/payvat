/**
 * Admin Manual VAT Override API
 * Allows manual correction of wrong VAT extractions for tax compliance
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAdminRoute } from '@/lib/middleware'
import { AuthUser } from '@/lib/auth'

interface VATOverrideRequest {
  documentId: string
  correctVATAmount: number
  reason: string
  originalAmount?: number
}

/**
 * POST /api/admin/override-vat - Manually override VAT extraction
 */
async function postOverrideVAT(request: NextRequest, user: AuthUser) {
  try {
    const body: VATOverrideRequest = await request.json()
    const { documentId, correctVATAmount, reason, originalAmount } = body
    
    // Validation
    if (!documentId || typeof correctVATAmount !== 'number' || !reason) {
      return NextResponse.json(
        { error: 'Document ID, correct VAT amount, and reason are required' },
        { status: 400 }
      )
    }
    
    if (correctVATAmount < 0 || correctVATAmount > 99999) {
      return NextResponse.json(
        { error: 'VAT amount must be between 0 and 99,999' },
        { status: 400 }
      )
    }
    
    // Find the document
    const document = await prisma.document.findUnique({
      where: { id: documentId }
    })
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }
    
    // Create override record for audit trail
    const override = await prisma.auditLog.create({
      data: {
        userId: user.id, // Now using actual admin user ID from auth
        action: 'VAT_MANUAL_OVERRIDE',
        entityType: 'DOCUMENT',
        entityId: documentId,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        metadata: {
          documentName: document.originalName,
          correctVATAmount,
          originalAmount,
          reason,
          timestamp: new Date().toISOString(),
          category: document.category
        }
      }
    })
    
    // Update document scan result to reflect manual override
    const overrideScanResult = `MANUAL OVERRIDE: €${correctVATAmount.toFixed(2)} VAT (was €${originalAmount?.toFixed(2) || 'unknown'}). Reason: ${reason}`
    
    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: {
        scanResult: overrideScanResult,
        isScanned: true
      }
    })
    
    // console.log(`🔧 MANUAL VAT OVERRIDE: Document ${documentId} VAT corrected to €${correctVATAmount}`)
    // console.log(`   Original amount: €${originalAmount || 'unknown'}`)
    // console.log(`   Reason: ${reason}`)
    
    return NextResponse.json({
      success: true,
      message: 'VAT amount manually corrected',
      document: {
        id: updatedDocument.id,
        fileName: updatedDocument.originalName,
        correctedVATAmount: correctVATAmount,
        scanResult: updatedDocument.scanResult
      },
      override: {
        id: override.id,
        timestamp: override.createdAt,
        reason
      }
    })
    
  } catch (error) {
    console.error('Manual VAT override error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to apply manual override',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * GET /api/admin/override-vat?documentId=xxx - Get override history for a document
 */
async function getOverrideHistory(request: NextRequest, user: AuthUser) {
  try {
    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('documentId')
    
    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      )
    }
    
    // Get all VAT overrides for this document
    const overrides = await prisma.auditLog.findMany({
      where: {
        entityType: 'DOCUMENT',
        entityId: documentId,
        action: 'VAT_MANUAL_OVERRIDE'
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        createdAt: true,
        metadata: true,
        ipAddress: true
      }
    })
    
    return NextResponse.json({
      success: true,
      documentId,
      overrides: overrides.map(override => ({
        id: override.id,
        timestamp: override.createdAt,
        correctVATAmount: (override.metadata as any)?.correctVATAmount,
        originalAmount: (override.metadata as any)?.originalAmount,
        reason: (override.metadata as any)?.reason,
        ipAddress: override.ipAddress
      }))
    })
    
  } catch (error) {
    console.error('Get VAT override history error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to get override history',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Export handlers with admin middleware
export const POST = createAdminRoute(postOverrideVAT)
export const GET = createAdminRoute(getOverrideHistory)