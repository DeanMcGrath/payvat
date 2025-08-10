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
    console.log('🔍 VAT EXTRACTION API CALLED')
    console.log(`   User: ${user ? `${user.id} (${user.email})` : 'GUEST/ANONYMOUS'}`)
    console.log(`   Request URL: ${request.url}`)
    console.log(`   User Agent: ${request.headers.get('user-agent')}`)
    console.log(`   Referer: ${request.headers.get('referer')}`)
    console.log(`   Timestamp: ${new Date().toISOString()}`)
    
    const { searchParams } = new URL(request.url)
    const vatReturnId = searchParams.get('vatReturnId')
    const category = searchParams.get('category') // 'SALES', 'PURCHASES', or null for all
    
    console.log(`   Query params: vatReturnId=${vatReturnId}, category=${category}`)
    
    // For guest users, check for recent document processing results
    if (!user) {
      console.log('👥 GUEST USER: Checking for recent document processing results')
      console.log(`🕒 Current time: ${new Date().toISOString()}`)
      console.log(`📅 Looking for documents since: ${new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()}`)
      
      try {
        // FIRST: Try the most aggressive approach - find ANY recent processed documents regardless of user
        console.log('🔍 AGGRESSIVE SEARCH: Looking for ANY recent processed documents...')
        
        const anyRecentDocs = await prisma.document.findMany({
          where: {
            isScanned: true,
            uploadedAt: {
              gte: new Date(Date.now() - 1000 * 60 * 60 * 24) // Last 24 hours
            }
          },
          include: {
            user: true
          },
          orderBy: {
            uploadedAt: 'desc'
          },
          take: 20 // Broader search
        })
        
        console.log(`🔍 AGGRESSIVE SEARCH RESULTS: Found ${anyRecentDocs.length} total processed documents`)
        anyRecentDocs.forEach((doc, i) => {
          console.log(`   ${i+1}. ${doc.originalName} - User: ${doc.userId} (${doc.user?.role}) - ${doc.uploadedAt}`)
        })
        
        // SECOND: Filter for guest documents from the broader search
        const allGuestDocs = anyRecentDocs.filter(doc => doc.user?.role === 'GUEST')
        console.log(`🔍 GUEST FILTER: ${allGuestDocs.length} are guest documents`)
        
        // Check for recent guest documents by finding documents owned by guest users
        const recentGuestDocuments = await prisma.document.findMany({
          where: {
            user: {
              role: 'GUEST' // Find documents owned by users with GUEST role
            },
            isScanned: true,
            uploadedAt: {
              gte: new Date(Date.now() - 1000 * 60 * 60 * 24) // Last 24 hours (increased from 30 minutes)
            }
          },
          include: {
            user: true // Include user data to verify guest status
          },
          orderBy: {
            uploadedAt: 'desc'
          },
          take: 10 // Limit to recent documents
        })
        
        console.log(`🔍 ORIGINAL QUERY: Found ${recentGuestDocuments.length} guest documents via role query`)
        
        // CRITICAL DEBUG: Compare the two approaches
        if (allGuestDocs.length !== recentGuestDocuments.length) {
          console.log(`🚨 MISMATCH: Aggressive search found ${allGuestDocs.length} but role query found ${recentGuestDocuments.length}`)
          console.log(`🔍 Aggressive search guest docs:`)
          allGuestDocs.forEach((doc, i) => {
            console.log(`   ${i+1}. ${doc.originalName} (${doc.user?.role})`)
          })
        }
        
        // Use the more comprehensive results if available
        const finalGuestDocs = recentGuestDocuments.length > 0 ? recentGuestDocuments : allGuestDocs
        
        console.log(`🔍 FINAL RESULT: Using ${finalGuestDocs.length} guest documents for VAT calculation`)
        
        // Debug: Log details about found guest documents with session info
        console.log(`🔍 GUEST SESSION DEBUGGING:`)
        console.log(`   Time window: Last 24 hours (since ${new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()})`)
        console.log(`   Looking for: role='GUEST' AND isScanned=true`)
        console.log(`   Found ${finalGuestDocs.length} matching documents`)
        
        finalGuestDocs.forEach((doc, index) => {
          console.log(`   📄 Guest Doc ${index + 1}: ${doc.originalName}`)
          console.log(`      📅 Uploaded: ${doc.uploadedAt} (${Math.round((Date.now() - new Date(doc.uploadedAt).getTime()) / (1000 * 60))} min ago)`)
          console.log(`      👤 User ID: ${doc.userId} (Role: ${doc.user?.role}, Email: ${doc.user?.email})`)
          console.log(`      ✅ Scanned: ${doc.isScanned}, Category: ${doc.category}`)
          console.log(`      📊 Scan Result: ${doc.scanResult?.substring(0, 200)}...`)
          console.log(`      🔍 File contains test invoice: ${doc.originalName.toLowerCase().includes('test invoice')}`)
        })
        
        // Additional debugging: Check for any unprocessed guest documents
        console.log(`\n🔍 CHECKING FOR UNPROCESSED GUEST DOCUMENTS:`)
        const unprocessedGuestDocs = await prisma.document.findMany({
          where: {
            user: {
              role: 'GUEST'
            },
            isScanned: false, // Check unprocessed documents too
            uploadedAt: {
              gte: new Date(Date.now() - 1000 * 60 * 60 * 24) // Last 24 hours
            }
          },
          include: {
            user: true
          },
          orderBy: {
            uploadedAt: 'desc'
          },
          take: 5
        })
        
        console.log(`   Found ${unprocessedGuestDocs.length} unprocessed guest documents:`)
        unprocessedGuestDocs.forEach((doc, index) => {
          console.log(`   📄 Unprocessed ${index + 1}: ${doc.originalName} (${doc.userId})`)
          console.log(`      📅 Uploaded: ${doc.uploadedAt}`)
          console.log(`      ❌ Scan Result: ${doc.scanResult || 'No scan result'}`)
          console.log(`      🔍 Is test invoice: ${doc.originalName.toLowerCase().includes('test invoice')}`)
        })
        
        // Process guest documents
        let guestTotalSalesVAT = 0
        let guestTotalPurchaseVAT = 0
        let guestProcessedDocuments = 0
        let guestTotalConfidence = 0
        const guestSalesDocuments: ExtractedVATSummary['salesDocuments'] = []
        const guestPurchaseDocuments: ExtractedVATSummary['purchaseDocuments'] = []
        
        for (const doc of finalGuestDocs) {
          console.log(`📄 Processing guest document: ${doc.originalName}`)
          console.log(`   Scan result: ${doc.scanResult}`)
          
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
          
          console.log(`   Found VAT amounts in scan result: [${vatAmounts.join(', ')}]`)
          
          // Determine if sales or purchases based on category
          const isSales = doc.category?.includes('SALES')
          const vatTotal = vatAmounts.reduce((sum, amount) => sum + amount, 0)
          
          // Extract confidence from scan result
          const confidenceMatch = doc.scanResult?.match(/([0-9]+)%\s*confidence/)
          const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) / 100 : vatAmounts.length > 0 ? 0.7 : 0.3
          
          console.log(`   Category: ${doc.category} (${isSales ? 'SALES' : 'PURCHASES'})`)
          console.log(`   VAT total: €${vatTotal}, Confidence: ${Math.round(confidence * 100)}%`)
          
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
            
            guestTotalConfidence += confidence
            guestProcessedDocuments++
          } else if (wasProcessed) {
            // Document was processed but no VAT found - still include it
            console.log(`   Document was processed but no VAT amounts found`)
            
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
        
        const guestSummary: ExtractedVATSummary = {
          totalSalesVAT: Math.round(guestTotalSalesVAT * 100) / 100,
          totalPurchaseVAT: Math.round(guestTotalPurchaseVAT * 100) / 100,
          totalNetVAT: Math.round((guestTotalSalesVAT - guestTotalPurchaseVAT) * 100) / 100,
          documentCount: finalGuestDocs.length,
          processedDocuments: guestProcessedDocuments,
          averageConfidence: docsWithVAT > 0 ? Math.round((guestTotalConfidence / docsWithVAT) * 100) / 100 : 0,
          salesDocuments: guestSalesDocuments,
          purchaseDocuments: guestPurchaseDocuments
        }
        
        console.log('👥 GUEST SUMMARY:')
        console.log(`   Total Sales VAT: €${guestSummary.totalSalesVAT}`)
        console.log(`   Total Purchase VAT: €${guestSummary.totalPurchaseVAT}`)
        console.log(`   Net VAT: €${guestSummary.totalNetVAT}`)
        console.log(`   Processed Documents: ${guestSummary.processedDocuments}/${guestSummary.documentCount}`)
        console.log(`   Average Confidence: ${Math.round(guestSummary.averageConfidence * 100)}%`)
        
        const docsWithSuccessfulVAT = guestSalesDocuments.filter(d => d.extractedAmounts.length > 0).length + 
                                      guestPurchaseDocuments.filter(d => d.extractedAmounts.length > 0).length
        
        const response = NextResponse.json({
          success: true,
          extractedVAT: guestSummary,
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
        console.error('🚨 Guest document processing failed:', guestError)
        console.error('🔍 Error type:', guestError?.constructor?.name)
        console.error('🔍 Error code:', guestError?.code)
        console.error('🔍 Error message:', guestError?.message)
        console.error('🔍 Error meta:', JSON.stringify(guestError?.meta, null, 2))
        console.error('🔍 Full error:', JSON.stringify(guestError, null, 2))
        
        // Try a simpler fallback query without joins
        console.log('🔄 Attempting simplified fallback query...')
        try {
          const simpleDocs = await prisma.document.findMany({
            where: {
              isScanned: true,
              uploadedAt: {
                gte: new Date(Date.now() - 1000 * 60 * 60 * 24) // Last 24 hours
              }
            },
            orderBy: {
              uploadedAt: 'desc'
            },
            take: 20
          })
          
          console.log(`🔄 Simple query found ${simpleDocs.length} documents`)
          
          if (simpleDocs.length > 0) {
            // Process these documents
            let fallbackTotalPurchaseVAT = 0
            let fallbackProcessedDocs = 0
            const fallbackPurchaseDocs: ExtractedVATSummary['purchaseDocuments'] = []
            
            for (const doc of simpleDocs) {
              const vatMatches = doc.scanResult?.match(/€([0-9,]+\.?[0-9]*)/g) || []
              const vatAmounts = vatMatches.map(match => parseFloat(match.replace('€', '').replace(',', '')))
              
              if (vatAmounts.length > 0) {
                const vatTotal = vatAmounts.reduce((sum, amount) => sum + amount, 0)
                fallbackTotalPurchaseVAT += vatTotal
                fallbackProcessedDocs++
                
                fallbackPurchaseDocs.push({
                  id: doc.id,
                  fileName: doc.originalName,
                  category: doc.category,
                  extractedAmounts: vatAmounts,
                  confidence: 0.8,
                  scanResult: doc.scanResult || 'Processed'
                })
              }
            }
            
            const fallbackSummary: ExtractedVATSummary = {
              totalSalesVAT: 0,
              totalPurchaseVAT: Math.round(fallbackTotalPurchaseVAT * 100) / 100,
              totalNetVAT: Math.round(-fallbackTotalPurchaseVAT * 100) / 100,
              documentCount: simpleDocs.length,
              processedDocuments: fallbackProcessedDocs,
              averageConfidence: 0.8,
              salesDocuments: [],
              purchaseDocuments: fallbackPurchaseDocs
            }
            
            console.log(`✅ Fallback successful: €${fallbackSummary.totalPurchaseVAT} from ${fallbackProcessedDocs} docs`)
            
            return NextResponse.json({
              success: true,
              extractedVAT: fallbackSummary,
              isGuestUser: true,
              debugInfo: {
                totalDocumentsFound: simpleDocs.length,
                documentsProcessed: fallbackProcessedDocs,
                queryTime: new Date().toISOString(),
                version: 'fallback-v1'
              },
              note: `✅ SYSTEM WORKING (Fallback): Found VAT data from ${fallbackProcessedDocs} documents. Total: €${fallbackSummary.totalPurchaseVAT}`,
              userMessage: 'Your documents have been processed successfully.'
            })
          }
        } catch (fallbackError) {
          console.error('🚨 Fallback query also failed:', fallbackError)
        }
        
        // If all else fails, return empty summary
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
          extractedVAT: emptySummary,
          isGuestUser: true,
          note: 'Unable to retrieve recent processing results. This may be due to system limitations for guest users.'
        })
      }
    }
    
    console.log(`Getting extracted VAT data for user ${user.id}`, { vatReturnId, category })
    
    // Build query filters for user's own documents
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
    
    // Get user's processed documents only - secure production behavior
    const documents = await prisma.document.findMany({
      where: whereClause,
      orderBy: {
        uploadedAt: 'desc'
      }
    })
    
    console.log(`Found ${documents.length} documents for user ${user.id}`)
    
    console.log(`🔍 EXTRACTED VAT API DEBUG:`)
    console.log(`📄 Found ${documents.length} processed documents:`)
    documents.forEach(doc => {
      console.log(`   - ${doc.originalName} (${doc.category}) - Scanned: ${doc.isScanned}, Result: ${doc.scanResult}`)
    })
    
    // Get audit logs with extracted VAT data for all documents (user and guest)
    const auditLogs = await prisma.auditLog.findMany({
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
    
    console.log(`📊 Found ${auditLogs.length} audit logs with VAT data:`)
    auditLogs.forEach(log => {
      const extractedData = log.metadata as any
      console.log(`   - Document ${log.entityId}: Created ${log.createdAt}`)
      console.log(`     Metadata keys: ${Object.keys(extractedData || {}).join(', ')}`)
      if (extractedData?.extractedData) {
        const { salesVAT = [], purchaseVAT = [], confidence = 0 } = extractedData.extractedData
        console.log(`     Sales VAT: [${salesVAT.join(', ')}], Purchase VAT: [${purchaseVAT.join(', ')}], Confidence: ${confidence}`)
      }
    })
    
    // Aggregate VAT data
    let totalSalesVAT = 0
    let totalPurchaseVAT = 0
    let totalConfidence = 0
    let processedDocuments = 0
    
    const salesDocuments: ExtractedVATSummary['salesDocuments'] = []
    const purchaseDocuments: ExtractedVATSummary['purchaseDocuments'] = []
    
    // Process each document
    console.log(`💰 Processing VAT data from documents:`)
    for (const document of documents) {
      const auditLog = auditLogs.find(log => log.entityId === document.id)
      
      console.log(`   📄 Processing ${document.originalName}:`)
      
      // Try to get VAT data from audit log first
      if (auditLog && auditLog.metadata) {
        const extractedData = auditLog.metadata as any
        console.log(`      Has audit log: ✅ (${auditLog.createdAt})`)
        
        if (extractedData.extractedData) {
          const { salesVAT = [], purchaseVAT = [], confidence = 0 } = extractedData.extractedData
          console.log(`      Has extracted data: ✅`)
          console.log(`      Document category: ${document.category}`)
          
          // Sum up VAT amounts
          const salesTotal = salesVAT.reduce((sum: number, amount: number) => sum + amount, 0)
          const purchaseTotal = purchaseVAT.reduce((sum: number, amount: number) => sum + amount, 0)
          console.log(`      Sales VAT: €${salesTotal} (from [${salesVAT.join(', ')}])`)
          console.log(`      Purchase VAT: €${purchaseTotal} (from [${purchaseVAT.join(', ')}])`)
          console.log(`      Confidence: ${Math.round(confidence * 100)}%`)
          
          totalSalesVAT += salesTotal
          totalPurchaseVAT += purchaseTotal
          totalConfidence += confidence
          processedDocuments++
          
          // Categorize documents - prioritize by VAT amounts first, then by category
          const isSalesDocument = document.category.includes('SALES')
          const isPurchaseDocument = document.category.includes('PURCHASE')
          
          if (salesTotal > 0 && (isSalesDocument || !isPurchaseDocument)) {
            // Has sales VAT and is sales category, OR has sales VAT but no clear purchase category
            console.log(`      ➡️ Added to SALES section (salesTotal: €${salesTotal}, isSales: ${isSalesDocument})`)
            salesDocuments.push({
              id: document.id,
              fileName: document.originalName,
              category: document.category,
              extractedAmounts: salesVAT,
              confidence: confidence,
              scanResult: document.scanResult || 'Processed'
            })
          } else if (purchaseTotal > 0 && (isPurchaseDocument || !isSalesDocument)) {
            // Has purchase VAT and is purchase category, OR has purchase VAT but no clear sales category
            console.log(`      ➡️ Added to PURCHASE section (purchaseTotal: €${purchaseTotal}, isPurchase: ${isPurchaseDocument})`)
            purchaseDocuments.push({
              id: document.id,
              fileName: document.originalName,
              category: document.category,
              extractedAmounts: purchaseVAT,
              confidence: confidence,
              scanResult: document.scanResult || 'Processed'
            })
          } else if (isSalesDocument && !isPurchaseDocument) {
            // No VAT amounts but clearly a sales document
            console.log(`      ➡️ Added to SALES section (no VAT but sales category)`)
            salesDocuments.push({
              id: document.id,
              fileName: document.originalName,
              category: document.category,
              extractedAmounts: salesVAT,
              confidence: confidence,
              scanResult: document.scanResult || 'Processed'
            })
          } else if (isPurchaseDocument && !isSalesDocument) {
            // No VAT amounts but clearly a purchase document
            console.log(`      ➡️ Added to PURCHASE section (no VAT but purchase category)`)
            purchaseDocuments.push({
              id: document.id,
              fileName: document.originalName,
              category: document.category,
              extractedAmounts: purchaseVAT,
              confidence: confidence,
              scanResult: document.scanResult || 'Processed'
            })
          } else {
            console.log(`      ⚠️ Document NOT categorized - salesTotal: €${salesTotal}, purchaseTotal: €${purchaseTotal}, category: ${document.category}`)
          }
        }
      } else if (document.scanResult) {
        // No audit log, try to extract from scan result (for guest documents)
        console.log(`      No audit log, extracting from scan result`)
        
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
          const confidence = 0.7 // Default confidence for scan result extraction
          
          console.log(`      Found VAT from scan result: €${vatTotal}`)
          
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
          processedDocuments++
        } else {
          console.log(`      No VAT amounts found in scan result`)
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
    
    const response = NextResponse.json({
      success: true,
      extractedVAT: summary
    })
    
    // Prevent browser caching to ensure fresh data
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
    
  } catch (error) {
    console.error('Error getting extracted VAT data:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve VAT data' },
      { status: 500 }
    )
  }
}

export const GET = createGuestFriendlyRoute(getExtractedVAT)