import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('Starting test documents query...')
    
    // Test 1: Simple count without any filters
    const totalCount = await prisma.document.count()
    console.log('Total document count:', totalCount)
    
    // Test 2: Simple findMany with basic fields only
    const docs = await prisma.document.findMany({
      take: 1,
      select: {
        id: true,
        fileName: true,
        uploadedAt: true
      }
    })
    console.log('Sample document found:', docs.length > 0)
    
    // Test 3: Test the exact query that's failing
    const dashboardDocs = await prisma.document.findMany({
      select: {
        id: true,
        fileName: true,
        originalName: true,
        fileSize: true,
        mimeType: true,
        documentType: true,
        category: true,
        isScanned: true,
        scanResult: true,
        uploadedAt: true,
        vatReturnId: true,
        extractedDate: true,
        extractedYear: true,
        extractedMonth: true
      },
      take: 1
    })
    console.log('Dashboard query result:', dashboardDocs.length)
    
    return NextResponse.json({
      success: true,
      totalCount,
      hasDocuments: docs.length > 0,
      dashboardQueryWorks: dashboardDocs.length >= 0,
      message: 'All tests passed'
    })
    
  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}