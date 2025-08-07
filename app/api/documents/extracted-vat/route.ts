import { NextRequest, NextResponse } from 'next/server'
import { createGuestFriendlyRoute } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { AuthUser } from '@/lib/auth'

interface ExtractedVATSummary {
  totalSalesVAT: number
  totalPurchaseVAT: number
  totalNetVAT: number
  documentCount: number
  processedDocuments: number
  averageConfidence: number
  salesDocuments: Array<{
    id: string
    fileName: string
    category: string
    extractedAmounts: number[]
    confidence: number
    scanResult: string
  }>
  purchaseDocuments: Array<{
    id: string
    fileName: string
    category: string
    extractedAmounts: number[]
    confidence: number
    scanResult: string
  }>
}

/**
 * GET /api/documents/extracted-vat - Get aggregated VAT data from user's documents
 */
async function getExtractedVAT(request: NextRequest, user?: AuthUser) {
  try {
    const { searchParams } = new URL(request.url)
    const vatReturnId = searchParams.get('vatReturnId')
    const category = searchParams.get('category') // 'SALES', 'PURCHASES', or null for all
    
    // For guest users, return empty data since they don't persist documents
    if (!user) {
      console.log('Getting extracted VAT data for guest user - returning empty')
      const emptySummary: ExtractedVATSummary = {
        totalSalesVAT: 0,
        totalPurchaseVAT: 0,
        totalNetVAT: 0,
        documentCount: 0,
        processedDocuments: 0,
        averageConfidence: 0,
        salesDocuments: [],
        purchaseDocuments: []
      }
      
      return NextResponse.json({
        success: true,
        extractedVAT: emptySummary
      })
    }
    
    console.log(`Getting extracted VAT data for user ${user.id}`, { vatReturnId, category })
    
    // Build query filters
    const whereClause: any = {
      userId: user.id,
      isScanned: true, // Only include processed documents
    }
    
    if (vatReturnId) {
      whereClause.vatReturnId = vatReturnId
    }
    
    if (category) {
      if (category === 'SALES') {
        whereClause.category = {
          in: ['SALES_INVOICE', 'SALES_RECEIPT', 'SALES_REPORT']
        }
      } else if (category === 'PURCHASES') {
        whereClause.category = {
          in: ['PURCHASE_INVOICE', 'PURCHASE_RECEIPT', 'PURCHASE_REPORT']
        }
      }
    }
    
    // Get processed documents
    const documents = await prisma.document.findMany({
      where: whereClause,
      orderBy: {
        uploadedAt: 'desc'
      }
    })
    
    console.log(`Found ${documents.length} processed documents`)
    
    // Get audit logs with extracted VAT data
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        userId: user.id,
        action: 'VAT_DATA_EXTRACTED',
        entityType: 'DOCUMENT',
        entityId: {
          in: documents.map(doc => doc.id)
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log(`Found ${auditLogs.length} audit logs with VAT data`)
    
    // Aggregate VAT data
    let totalSalesVAT = 0
    let totalPurchaseVAT = 0
    let totalConfidence = 0
    let processedDocuments = 0
    
    const salesDocuments: ExtractedVATSummary['salesDocuments'] = []
    const purchaseDocuments: ExtractedVATSummary['purchaseDocuments'] = []
    
    // Process each document
    for (const document of documents) {
      const auditLog = auditLogs.find(log => log.entityId === document.id)
      
      if (auditLog && auditLog.metadata) {
        const extractedData = auditLog.metadata as any
        
        if (extractedData.extractedData) {
          const { salesVAT = [], purchaseVAT = [], confidence = 0 } = extractedData.extractedData
          
          // Sum up VAT amounts
          const salesTotal = salesVAT.reduce((sum: number, amount: number) => sum + amount, 0)
          const purchaseTotal = purchaseVAT.reduce((sum: number, amount: number) => sum + amount, 0)
          
          totalSalesVAT += salesTotal
          totalPurchaseVAT += purchaseTotal
          totalConfidence += confidence
          processedDocuments++
          
          // Categorize documents
          if (salesTotal > 0 || document.category.includes('SALES')) {
            salesDocuments.push({
              id: document.id,
              fileName: document.originalName,
              category: document.category,
              extractedAmounts: salesVAT,
              confidence: confidence,
              scanResult: document.scanResult || 'Processed'
            })
          }
          
          if (purchaseTotal > 0 || document.category.includes('PURCHASE')) {
            purchaseDocuments.push({
              id: document.id,
              fileName: document.originalName,
              category: document.category,
              extractedAmounts: purchaseVAT,
              confidence: confidence,
              scanResult: document.scanResult || 'Processed'
            })
          }
        }
      }
    }
    
    const totalNetVAT = totalSalesVAT - totalPurchaseVAT
    const averageConfidence = processedDocuments > 0 ? totalConfidence / processedDocuments : 0
    
    const summary: ExtractedVATSummary = {
      totalSalesVAT: Math.round(totalSalesVAT * 100) / 100,
      totalPurchaseVAT: Math.round(totalPurchaseVAT * 100) / 100,
      totalNetVAT: Math.round(totalNetVAT * 100) / 100,
      documentCount: documents.length,
      processedDocuments,
      averageConfidence: Math.round(averageConfidence * 100) / 100,
      salesDocuments,
      purchaseDocuments
    }
    
    console.log('VAT summary:', {
      totalSalesVAT: summary.totalSalesVAT,
      totalPurchaseVAT: summary.totalPurchaseVAT,
      totalNetVAT: summary.totalNetVAT,
      processedDocuments: summary.processedDocuments
    })
    
    return NextResponse.json({
      success: true,
      extractedVAT: summary
    })
    
  } catch (error) {
    console.error('Error getting extracted VAT data:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve VAT data' },
      { status: 500 }
    )
  }
}

export const GET = createGuestFriendlyRoute(getExtractedVAT)