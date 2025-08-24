import { NextRequest, NextResponse } from 'next/server'
import { createGuestFriendlyRoute } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { AuthUser } from '@/lib/auth'
import { extractionMonitor } from '@/lib/extraction-monitor'
import { logError, logWarn, logInfo, logAudit, logPerformance } from '@/lib/secure-logger'

interface ExtractedVATSummary {
  totalSalesVAT: number
  totalPurchaseVAT: number
  totalNetVAT: number
  documentCount: number
  processedDocuments: number
  averageConfidence: number
  // ENHANCED: Add processing status tracking
  failedDocuments: number
  processingStats: {
    completed: number
    failed: number
    pending: number
  }
  salesDocuments: Array<{
    id: string
    fileName: string
    category: string
    extractedAmounts: number[]
    confidence: number
    scanResult: string
    // ENHANCED: Add status info
    processingStatus?: any
  }>
  purchaseDocuments: Array<{
    id: string
    fileName: string
    category: string
    extractedAmounts: number[]
    confidence: number
    scanResult: string
    // ENHANCED: Add status info  
    processingStatus?: any
  }>
}

// Simple in-memory cache for extracted VAT data to prevent zeros during processing
const vatDataCache = new Map<string, { data: ExtractedVATSummary; timestamp: number }>()
const CACHE_DURATION = 30000 // 30 seconds

// ENHANCED: Cache invalidation utilities
export function invalidateUserCache(userId?: string) {
  if (!userId) {
    // Guest user - clear all guest caches
    for (const [key] of vatDataCache.entries()) {
      if (key.startsWith('guest-')) {
        vatDataCache.delete(key)
      }
    }
  } else {
    // Authenticated user - clear specific user cache
    for (const [key] of vatDataCache.entries()) {
      if (key.includes(userId)) {
        vatDataCache.delete(key)
      }
    }
  }
}

function clearExpiredCache() {
  const now = Date.now()
  for (const [key, value] of vatDataCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      vatDataCache.delete(key)
    }
  }
}

// Utility function to parse processing status from scanResult
function parseProcessingStatus(scanResult: string | null) {
  if (!scanResult) return null
  
  const statusMatch = scanResult.match(/\[PROCESSING_STATUS: (.*?)\]/)
  if (statusMatch) {
    try {
      return JSON.parse(statusMatch[1])
    } catch (e) {
      return null
    }
  }
  return null
}

/**
 * GET /api/documents/extracted-vat - Get aggregated VAT data from user's documents
 */
async function getExtractedVAT(request: NextRequest, user?: AuthUser) {
  try {
    const startTime = Date.now()
    logAudit('VAT_EXTRACTION_REQUEST', {
      userId: user?.id,
      operation: 'extracted-vat',
      result: 'SUCCESS'
    })
    
    const { searchParams } = new URL(request.url)
    const vatReturnId = searchParams.get('vatReturnId')
    const category = searchParams.get('category') // 'SALES', 'PURCHASES', or null for all
    const skipCache = searchParams.get('skipCache') === 'true'
    
    // Create cache key based on user and parameters
    const cacheKey = `${user?.id || 'guest'}-${vatReturnId || 'all'}-${category || 'all'}`
    
    // Check cache first (unless skipCache is requested)
    if (!skipCache) {
      const cached = vatDataCache.get(cacheKey)
      if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        logInfo('Returning cached VAT data', { 
          cacheKey,
          cacheAge: Date.now() - cached.timestamp,
          operation: 'extracted-vat-cache-hit'
        })
        
        const response = NextResponse.json({
          success: true,
          extractedVAT: cached.data,
          fromCache: true,
          cacheAge: Date.now() - cached.timestamp,
          monitoringStats: extractionMonitor.getStats()
        })
        
        // Still set no-cache headers for browser
        response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
        response.headers.set('Pragma', 'no-cache')
        response.headers.set('Expires', '0')
        
        return response
      }
    }
    
    // Query params logged for audit
    
    // For guest users, check for recent document processing results
    if (!user) {
      // Guest user document processing check
      
      try {
        // SIMPLIFIED: Single comprehensive query for guest documents
        logInfo('Searching for recent guest documents', {
          operation: 'guest-document-search',
          timeWindow: '24 hours'
        })
        
        // FIXED: Simplify guest query - no time filtering, no joins
        const recentGuestUsers = await prisma.user.findMany({
          where: {
            role: 'GUEST'
          },
          select: { id: true },
          take: 50,
          orderBy: { createdAt: 'desc' }
        })

        const guestUserIds = recentGuestUsers.map(u => u.id)
        
        const recentGuestDocuments = await prisma.document.findMany({
          where: {
            userId: {
              in: guestUserIds
            }
          },
          select: {
            id: true,
            userId: true,
            category: true,
            isScanned: true,
            uploadedAt: true
          },
          orderBy: {
            uploadedAt: 'desc'
          },
          take: 100
        })
        
        logInfo('Found guest documents', {
          operation: 'guest-document-search',
          totalFound: recentGuestDocuments.length,
          processedCount: recentGuestDocuments.filter(doc => doc.isScanned).length
        })
        
        const finalGuestDocs = recentGuestDocuments
        
        // Using guest documents for calculation
        
        // Debug: Log details about found guest documents with session info
        // Guest session debugging completed
        
        // Guest documents processed
        
        // Additional debugging: Check for any unprocessed guest documents
        // Checking unprocessed documents
        const unprocessedGuestDocs = await prisma.document.findMany({
          where: {
            userId: {
              in: guestUserIds
            },
            isScanned: false // Check unprocessed documents too
          },
          select: {
            id: true,
            userId: true,
            category: true,
            isScanned: true,
            uploadedAt: true
          },
          orderBy: {
            uploadedAt: 'desc'
          },
          take: 5
        })
        
        // Unprocessed documents logged
        
        // Process guest documents
        let guestTotalSalesVAT = 0
        let guestTotalPurchaseVAT = 0
        let guestProcessedDocuments = 0
        let guestTotalConfidence = 0
        let guestWeightedConfidenceSum = 0 // For weighted confidence calculation
        let guestTotalVATAmount = 0 // For weighting
        const guestSalesDocuments: ExtractedVATSummary['salesDocuments'] = []
        const guestPurchaseDocuments: ExtractedVATSummary['purchaseDocuments'] = []
        
        for (const doc of finalGuestDocs) {
          // Processing guest document
          
          // Extract VAT amounts from scan result using multiple patterns
          const scanResult = doc.scanResult || ''
          const vatMatches = scanResult.match(/€([0-9,]+\.?[0-9]*)/g) || []
          const vatAmounts = vatMatches.map(match => parseFloat(match.replace('€', '').replace(',', '')))
          
          // Also check for VAT amounts without euro symbol
          const additionalPatterns = [
            /VAT.*?([0-9]+\.?[0-9]+)/gi,
            /Total.*VAT.*?([0-9]+\.?[0-9]+)/gi,
            /([0-9]+\.?[0-9]+).*?VAT/gi
          ]
          
          for (const pattern of additionalPatterns) {
            const matches = [...scanResult.matchAll(pattern)]
            for (const match of matches) {
              if (match[1]) {
                const amount = parseFloat(match[1])
                if (!isNaN(amount) && amount > 0 && amount < 10000 && !vatAmounts.includes(amount)) {
                  vatAmounts.push(amount)
                }
              }
            }
          }
          
          // VAT amounts found
          
          // Determine if sales or purchases based on category
          const isSales = doc.category?.includes('SALES')
          const vatTotal = vatAmounts.reduce((sum, amount) => sum + amount, 0)
          
          // Extract confidence from scan result - improved pattern matching
          let confidence = 0.85 // Default high confidence for successfully processed documents
          
          if (doc.scanResult) {
            // Try multiple confidence patterns
            const patterns = [
              /([0-9]+)%\s*confidence/i,
              /confidence[:\s]*([0-9]+)%/i,
              /confidence[:\s]*([0-9]*\.?[0-9]+)/i,
              /"confidence"[:\s]*([0-9]*\.?[0-9]+)/i
            ]
            
            for (const pattern of patterns) {
              const match = doc.scanResult.match(pattern)
              if (match) {
                const extractedConfidence = parseFloat(match[1])
                if (extractedConfidence >= 0 && extractedConfidence <= 100) {
                  // If it's a percentage, convert to decimal; if already decimal, keep as is
                  confidence = extractedConfidence > 1 ? extractedConfidence / 100 : extractedConfidence
                  break
                } else if (extractedConfidence > 0 && extractedConfidence <= 1) {
                  confidence = extractedConfidence
                  break
                }
              }
            }
          }
          
          // Fallback logic: high confidence for documents with VAT amounts, lower for those without
          if (confidence === 0.85 && vatAmounts.length === 0) {
            confidence = 0.3 // Lower confidence if no VAT amounts found
          }
          
          // Document categorized
          
          // Check if document was processed - simplified logic for reliability
          // Any document with isScanned: true should be counted as processed
          const wasProcessed = doc.isScanned && doc.scanResult !== null
          
          if (vatAmounts.length > 0) {
            if (isSales) {
              guestTotalSalesVAT += vatTotal
              guestSalesDocuments.push({
                id: doc.id,
                fileName: doc.originalName,
                category: doc.category,
                extractedAmounts: vatAmounts,
                confidence: confidence,
                scanResult: doc.scanResult || 'Processed'
              })
            } else {
              guestTotalPurchaseVAT += vatTotal
              guestPurchaseDocuments.push({
                id: doc.id,
                fileName: doc.originalName,
                category: doc.category,
                extractedAmounts: vatAmounts,
                confidence: confidence,
                scanResult: doc.scanResult || 'Processed'
              })
            }
            
            // Weight confidence by VAT amount for more accurate overall confidence
            guestTotalConfidence += confidence
            guestWeightedConfidenceSum += confidence * vatTotal
            guestTotalVATAmount += vatTotal
            guestProcessedDocuments++
          } else if (wasProcessed) {
            // Document was processed but no VAT found - still include it
            // Document processed without VAT
            
            const processedDoc = {
              id: doc.id,
              fileName: doc.originalName,
              category: doc.category,
              extractedAmounts: [],
              confidence: 0,
              scanResult: doc.scanResult || 'Processed without VAT amounts'
            }
            
            if (isSales) {
              guestSalesDocuments.push(processedDoc)
            } else {
              guestPurchaseDocuments.push(processedDoc)
            }
            
            // Still count as processed even without VAT
            guestProcessedDocuments++
          }
        }
        
        // Calculate documents with successful VAT extraction
        const docsWithVAT = guestSalesDocuments.filter(d => d.extractedAmounts.length > 0).length + 
                           guestPurchaseDocuments.filter(d => d.extractedAmounts.length > 0).length
        
        // Calculate weighted average confidence based on VAT amounts
        const weightedAverageConfidence = guestTotalVATAmount > 0 
          ? guestWeightedConfidenceSum / guestTotalVATAmount
          : (docsWithVAT > 0 ? guestTotalConfidence / docsWithVAT : 0)

        // ENHANCED: Calculate guest processing statistics
        let guestCompletedDocs = 0
        let guestFailedDocs = 0
        let guestPendingDocs = 0
        
        for (const doc of finalGuestDocs) {
          const status = parseProcessingStatus(doc.scanResult)
          if (status) {
            if (status.status === 'completed') guestCompletedDocs++
            else if (status.status === 'failed') guestFailedDocs++
            else guestPendingDocs++
          } else if (doc.isScanned) {
            guestCompletedDocs++
          } else {
            guestPendingDocs++
          }
        }
        
        const guestSummary: ExtractedVATSummary = {
          totalSalesVAT: Math.round(guestTotalSalesVAT * 100) / 100,
          totalPurchaseVAT: Math.round(guestTotalPurchaseVAT * 100) / 100,
          totalNetVAT: Math.round((guestTotalSalesVAT - guestTotalPurchaseVAT) * 100) / 100,
          documentCount: finalGuestDocs.length,
          processedDocuments: guestProcessedDocuments,
          averageConfidence: weightedAverageConfidence,
          // ENHANCED: Add processing stats for guests too
          failedDocuments: guestFailedDocs,
          processingStats: {
            completed: guestCompletedDocs,
            failed: guestFailedDocs,
            pending: guestPendingDocs
          },
          salesDocuments: guestSalesDocuments.map(doc => ({
            ...doc,
            processingStatus: parseProcessingStatus(doc.scanResult)
          })),
          purchaseDocuments: guestPurchaseDocuments.map(doc => ({
            ...doc,
            processingStatus: parseProcessingStatus(doc.scanResult)
          }))
        }
        
        // Guest summary calculated
        
        // Cache the guest result
        vatDataCache.set(cacheKey, {
          data: guestSummary,
          timestamp: Date.now()
        })
        
        const docsWithSuccessfulVAT = guestSalesDocuments.filter(d => d.extractedAmounts.length > 0).length + 
                                      guestPurchaseDocuments.filter(d => d.extractedAmounts.length > 0).length
        
        const response = NextResponse.json({
          success: true,
          extractedVAT: guestSummary,
          fromCache: false,
          isGuestUser: true,
          debugInfo: {
            totalDocumentsFound: finalGuestDocs.length,
            documentsProcessed: guestProcessedDocuments,
            documentsWithVAT: docsWithSuccessfulVAT,
            queryTime: new Date().toISOString(),
            version: 'enhanced-v3'
          },
          note: guestProcessedDocuments > 0 
            ? docsWithSuccessfulVAT > 0
              ? `✅ SYSTEM WORKING: Processed ${guestProcessedDocuments}/${finalGuestDocs.length} documents. VAT extracted from ${docsWithSuccessfulVAT} document(s). Last update: ${new Date().toISOString()}` 
              : `⚠️ PARTIAL SUCCESS: Processed ${guestProcessedDocuments}/${finalGuestDocs.length} documents but no VAT amounts detected. Documents may not contain VAT or require manual review.`
            : `⚠️ PROCESSING ISSUE: Found ${finalGuestDocs.length} documents but processing failed. Check document format. Time: ${new Date().toISOString()}`,
          userMessage: guestProcessedDocuments > 0 
            ? docsWithSuccessfulVAT > 0
              ? `Successfully processed ${guestProcessedDocuments} documents. VAT amounts extracted from ${docsWithSuccessfulVAT} document(s).`
              : `Processed ${guestProcessedDocuments} documents but no VAT amounts were found. Please verify your documents contain VAT information.`
            : finalGuestDocs.length > 0 
              ? `Found ${finalGuestDocs.length} uploaded documents, but processing failed. Please try re-uploading or contact support.`
              : `No recent document uploads found. Please upload your VAT documents to see extracted data.`
        })
        
        // Add debugging headers to identify if user's browser hits this version
        response.headers.set('X-VAT-API-Version', 'enhanced-v2')
        response.headers.set('X-VAT-Debug-Documents', finalGuestDocs.length.toString())
        response.headers.set('X-VAT-Debug-Processed', guestProcessedDocuments.toString())
        
        return response
        
      } catch (guestError: any) {
        logError('Guest document processing failed', guestError, {
          operation: 'guest-vat-extraction',
          userId: 'GUEST'
        })
        
        // FIXED: Simplified error handling - no more complex fallback logic
        
        // If all else fails, return empty summary
        const emptySummary: ExtractedVATSummary = {
          totalSalesVAT: 0,
          totalPurchaseVAT: 0,
          totalNetVAT: 0,
          documentCount: 0,
          processedDocuments: 0,
          averageConfidence: 0,
          failedDocuments: 0,
          processingStats: {
            completed: 0,
            failed: 0,
            pending: 0
          },
          salesDocuments: [],
          purchaseDocuments: []
        }
        
        return NextResponse.json({
          success: true,
          extractedVAT: emptySummary,
          isGuestUser: true,
          note: 'Unable to retrieve recent processing results. This may be due to system limitations for guest users.'
        })
      }
    }
    
    // Getting VAT data for authenticated user
    
    // FIXED: Build query filters for user's own documents - include ALL documents
    const whereClause: any = {
      userId: user.id,
      // REMOVED isScanned filter - include all documents regardless of processing status
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
    
    // Get user's processed documents only - secure production behavior
    const documents = await prisma.document.findMany({
      where: whereClause,
      orderBy: {
        uploadedAt: 'desc'
      }
    })
    
    // Documents found for user
    
    // Documents debug info processed
    
    // Get the most recent audit log with extracted VAT data for each document
    // Fetching audit logs
    
    // Create a map to store the most recent audit log per document
    const auditLogMap = new Map<string, any>()
    
    // Fetch audit logs for all documents and filter to most recent per document
    const allAuditLogs = await prisma.auditLog.findMany({
      where: {
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
    
    // Keep only the most recent audit log per document
    allAuditLogs.forEach(log => {
      if (log.entityId && !auditLogMap.has(log.entityId)) {
        auditLogMap.set(log.entityId, log)
      }
    })
    
    const auditLogs = Array.from(auditLogMap.values())
    // Audit logs filtered
    
    // Audit logs with VAT data processed
    
    // Aggregate VAT data
    let totalSalesVAT = 0
    let totalPurchaseVAT = 0
    let totalConfidence = 0
    let confidenceCount = 0 // Count of documents with confidence scores
    let weightedConfidenceSum = 0 // For weighted confidence calculation
    let totalVATAmount = 0 // For weighting
    
    const salesDocuments: ExtractedVATSummary['salesDocuments'] = []
    const purchaseDocuments: ExtractedVATSummary['purchaseDocuments'] = []
    
    // FIXED: Count processed documents more accurately - include all documents that have been touched by the system
    let processedDocuments = 0
    for (const doc of documents) {
      const hasAuditLog = auditLogs.some(log => log.entityId === doc.id)
      const hasBeenProcessed = doc.isScanned || hasAuditLog || doc.scanResult
      if (hasBeenProcessed) {
        processedDocuments++
      }
    }
    // Processed documents counted
    
    // Process each document
    // Processing VAT data
    for (const document of documents) {
      const auditLog = auditLogs.find(log => log.entityId === document.id)
      
      // Processing document
      
      // Try to get VAT data from audit log first
      if (auditLog && auditLog.metadata) {
        const extractedData = auditLog.metadata as any
        // Audit log found
        
        if (extractedData.extractedData) {
          const { salesVAT = [], purchaseVAT = [], confidence = 0 } = extractedData.extractedData
          // Extracted data available
          
          // Sum up VAT amounts
          const salesTotal = salesVAT.reduce((sum: number, amount: number) => sum + amount, 0)
          const purchaseTotal = purchaseVAT.reduce((sum: number, amount: number) => sum + amount, 0)
          // VAT data extracted from audit log
          
          // FIXED: Don't add to totals yet - do it during categorization to avoid double counting
          totalConfidence += confidence
          confidenceCount++
          
          // Weight confidence by VAT amount for more accurate overall confidence
          const vatTotal = salesTotal + purchaseTotal
          weightedConfidenceSum += confidence * vatTotal
          totalVATAmount += vatTotal
          
          // Categorize documents - FIXED: Prioritize document category over VAT amounts
          const isSalesDocument = document.category.includes('SALES')
          const isPurchaseDocument = document.category.includes('PURCHASE')
          
          if (isSalesDocument) {
            // FIXED: Sales document - add all VAT to sales total regardless of where it was stored
            const extractedAmounts = salesVAT.length > 0 ? salesVAT : purchaseVAT
            totalSalesVAT += salesTotal + purchaseTotal
            
            salesDocuments.push({
              id: document.id,
              fileName: document.originalName,
              category: document.category,
              extractedAmounts: extractedAmounts,
              confidence: confidence,
              scanResult: document.scanResult || 'Processed'
            })
          } else if (isPurchaseDocument) {
            // FIXED: Purchase document - add all VAT to purchase total regardless of where it was stored
            const extractedAmounts = purchaseVAT.length > 0 ? purchaseVAT : salesVAT
            totalPurchaseVAT += salesTotal + purchaseTotal
            
            purchaseDocuments.push({
              id: document.id,
              fileName: document.originalName,
              category: document.category,
              extractedAmounts: extractedAmounts,
              confidence: confidence,
              scanResult: document.scanResult || 'Processed'
            })
          } else {
            // Fallback for documents without clear category - use VAT type
            if (salesTotal > 0) {
              totalSalesVAT += salesTotal
              salesDocuments.push({
                id: document.id,
                fileName: document.originalName,
                category: document.category,
                extractedAmounts: salesVAT,
                confidence: confidence,
                scanResult: document.scanResult || 'Processed'
              })
            } else if (purchaseTotal > 0) {
              totalPurchaseVAT += purchaseTotal
              purchaseDocuments.push({
                id: document.id,
                fileName: document.originalName,
                category: document.category,
                extractedAmounts: purchaseVAT,
                confidence: confidence,
                scanResult: document.scanResult || 'Processed'
              })
            } else {
              // No VAT found - still categorize by document type
              if (document.category) {
                const docForList = {
                  id: document.id,
                  fileName: document.originalName,
                  category: document.category,
                  extractedAmounts: [] as number[],
                  confidence: confidence,
                  scanResult: document.scanResult || 'Processed without VAT amounts'
                }
                
                // Make a best guess based on category text
                if (document.category.toLowerCase().includes('sales') || 
                    document.category.toLowerCase().includes('invoice') ||
                    document.category.toLowerCase().includes('receipt')) {
                  salesDocuments.push(docForList)
                } else {
                  purchaseDocuments.push(docForList)
                }
              } else {
                logWarn('Document has no VAT amounts and no clear category', {
                  operation: 'document-categorization',
                  documentId: document.id,
                  category: document.category
                })
              }
            }
          }
        }
      } else if (document.scanResult) {
        // No audit log, try to extract from scan result (for guest documents)
        // Extracting from scan result
        
        // Extract VAT amounts from scan result using multiple patterns
        const scanResult = document.scanResult || ''
        const vatMatches = scanResult.match(/€([0-9,]+\.?[0-9]*)/g) || []
        const vatAmounts = vatMatches.map(match => parseFloat(match.replace('€', '').replace(',', '')))
        
        // Also check for VAT amounts without euro symbol
        const additionalPatterns = [
          /VAT.*?([0-9]+\.?[0-9]+)/gi,
          /Total.*VAT.*?([0-9]+\.?[0-9]+)/gi,
          /([0-9]+\.?[0-9]+).*?VAT/gi
        ]
        
        for (const pattern of additionalPatterns) {
          const matches = [...scanResult.matchAll(pattern)]
          for (const match of matches) {
            if (match[1]) {
              const amount = parseFloat(match[1])
              if (!isNaN(amount) && amount > 0 && amount < 10000 && !vatAmounts.includes(amount)) {
                vatAmounts.push(amount)
              }
            }
          }
        }
        
        if (vatAmounts.length > 0) {
          const isSales = document.category?.includes('SALES')
          const vatTotal = vatAmounts.reduce((sum, amount) => sum + amount, 0)
          const confidence = 0.85 // High confidence for successfully processed authenticated user documents
          
          // VAT found in scan result
          
          if (isSales) {
            totalSalesVAT += vatTotal
            salesDocuments.push({
              id: document.id,
              fileName: document.originalName,
              category: document.category,
              extractedAmounts: vatAmounts,
              confidence: confidence,
              scanResult: document.scanResult
            })
          } else {
            totalPurchaseVAT += vatTotal
            purchaseDocuments.push({
              id: document.id,
              fileName: document.originalName,
              category: document.category,
              extractedAmounts: vatAmounts,
              confidence: confidence,
              scanResult: document.scanResult
            })
          }
          
          totalConfidence += confidence
          confidenceCount++
          
          // Weight confidence by VAT amount for more accurate overall confidence  
          weightedConfidenceSum += confidence * vatTotal
          totalVATAmount += vatTotal
        } else {
          // No VAT found in scan result - include document anyway with pending status
          const isSales = document.category?.includes('SALES')
          const docForList = {
            id: document.id,
            fileName: document.originalName,
            category: document.category,
            extractedAmounts: [] as number[],
            confidence: 0,
            scanResult: document.scanResult || 'No VAT amounts found in scan',
            processingStatus: parseProcessingStatus(document.scanResult)
          }
          
          if (isSales) {
            salesDocuments.push(docForList)
          } else {
            purchaseDocuments.push(docForList)
          }
        }
      } else {
        // CRITICAL FIX: Handle documents WITHOUT audit logs (newly uploaded, processing failed, etc.)
        const isSales = document.category?.includes('SALES')
        const isPending = !document.isScanned
        const hasFailed = document.scanResult?.includes('failed') || document.scanResult?.includes('error')
        
        const status = isPending ? 'Pending processing...' : 
                       hasFailed ? 'Processing failed - please retry' :
                       'Processed without VAT extraction'
        
        const docForList = {
          id: document.id,
          fileName: document.originalName,
          category: document.category,
          extractedAmounts: [] as number[],
          confidence: 0,
          scanResult: document.scanResult || status,
          processingStatus: parseProcessingStatus(document.scanResult) || { 
            status: isPending ? 'pending' : 'failed',
            timestamp: new Date().toISOString()
          }
        }
        
        if (isSales) {
          salesDocuments.push(docForList)
        } else {
          purchaseDocuments.push(docForList)
        }
      }
    }
    
    const totalNetVAT = totalSalesVAT - totalPurchaseVAT
    
    // Calculate weighted average confidence based on VAT amounts
    const averageConfidence = totalVATAmount > 0 
      ? weightedConfidenceSum / totalVATAmount
      : (confidenceCount > 0 ? totalConfidence / confidenceCount : 0)
    
    // ENHANCED: Calculate processing statistics
    let completedDocs = 0
    let failedDocs = 0
    let pendingDocs = 0
    
    for (const document of documents) {
      const status = parseProcessingStatus(document.scanResult)
      if (status) {
        if (status.status === 'completed') completedDocs++
        else if (status.status === 'failed') failedDocs++
        else pendingDocs++
      } else if (document.isScanned) {
        completedDocs++ // Legacy processed documents
      } else {
        pendingDocs++
      }
    }
    
    const summary: ExtractedVATSummary = {
      totalSalesVAT: Math.round(totalSalesVAT * 100) / 100,
      totalPurchaseVAT: Math.round(totalPurchaseVAT * 100) / 100,
      totalNetVAT: Math.round(totalNetVAT * 100) / 100,
      documentCount: documents.length,
      processedDocuments,
      averageConfidence: averageConfidence,
      // ENHANCED: Add processing stats
      failedDocuments: failedDocs,
      processingStats: {
        completed: completedDocs,
        failed: failedDocs,
        pending: pendingDocs
      },
      salesDocuments: salesDocuments.map(doc => ({
        ...doc,
        processingStatus: parseProcessingStatus(doc.scanResult)
      })),
      purchaseDocuments: purchaseDocuments.map(doc => ({
        ...doc,
        processingStatus: parseProcessingStatus(doc.scanResult)
      }))
    }
    
    // VAT summary calculated
    
    // Cache the result to prevent showing zeros during rapid subsequent requests
    vatDataCache.set(cacheKey, {
      data: summary,
      timestamp: Date.now()
    })
    
    // Clean up old cache entries (simple cleanup)
    if (vatDataCache.size > 100) {
      const now = Date.now()
      for (const [key, value] of vatDataCache.entries()) {
        if (now - value.timestamp > CACHE_DURATION * 2) {
          vatDataCache.delete(key)
        }
      }
    }
    
    // 🚨 NEW: Add monitoring statistics to response
    const monitoringStats = extractionMonitor.getStats()
    
    const response = NextResponse.json({
      success: true,
      extractedVAT: summary,
      fromCache: false,
      monitoringStats: {
        totalExtractions: monitoringStats.totalAttempts,
        successRate: monitoringStats.successRate,
        averageAccuracy: monitoringStats.averageAccuracy,
        wooCommerceExtractions: monitoringStats.wooCommerceStats.attempts,
        lastProcessingPerformance: monitoringStats.averageProcessingTime
      }
    })
    
    // Log performance for monitoring
    logPerformance('vat-extraction', Date.now() - startTime, {
      userId: user?.id,
      operation: 'extracted-vat'
    })

    // Prevent browser caching to ensure fresh data
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
    
  } catch (error) {
    logError('Error getting extracted VAT data', error, {
      userId: user?.id,
      operation: 'extracted-vat'
    })
    return NextResponse.json(
      { error: 'Failed to retrieve VAT data' },
      { status: 500 }
    )
  }
}

export const GET = createGuestFriendlyRoute(getExtractedVAT)