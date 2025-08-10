"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Upload, Calculator, FileText, CheckCircle, Sparkles, RefreshCw, X, AlertCircle, Bell, Settings, LogOut, Search, Loader2 } from 'lucide-react'
import LiveChat from "@/components/live-chat"
import FileUpload from "@/components/file-upload"
import Footer from "@/components/footer"
import { toast } from "sonner"
import { logger } from "@/lib/logger"

interface UserProfile {
  id: string
  email: string
  businessName: string
  vatNumber: string
  firstName?: string
  lastName?: string
}

export default function VATSubmissionPage() {
  const [salesVAT, setSalesVAT] = useState("9450.00")
  const [purchaseVAT, setPurchaseVAT] = useState("2100.00")
  const [netVAT, setNetVAT] = useState("7350.00")
  const [extractedVATData, setExtractedVATData] = useState<any>(null)
  const [loadingExtractedData, setLoadingExtractedData] = useState(false)
  const [useExtractedData, setUseExtractedData] = useState(false)
  const [uploadedDocuments, setUploadedDocuments] = useState<any[]>([])
  const [loadingDocuments, setLoadingDocuments] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [userLoading, setUserLoading] = useState(true)
  const [userError, setUserError] = useState<string | null>(null)

  // Mock selected period data (would come from previous page)
  const selectedPeriod = "November - December 2024"
  const dueDate = "15 Jan 2025"

  // Load data on component mount
  useEffect(() => {
    fetchUserProfile()
    loadExtractedVATData()
    loadUploadedDocuments()
  }, [])
  
  // Monitor changes to extracted VAT data
  useEffect(() => {
    console.log('🔄 FRONTEND: extractedVATData state changed:', extractedVATData)
    if (extractedVATData) {
      console.log('📊 FRONTEND: New extracted VAT data details:', {
        totalSalesVAT: extractedVATData.totalSalesVAT,
        totalPurchaseVAT: extractedVATData.totalPurchaseVAT,
        totalNetVAT: extractedVATData.totalNetVAT,
        processedDocuments: extractedVATData.processedDocuments,
        averageConfidence: extractedVATData.averageConfidence,
        documentCount: extractedVATData.documentCount
      })
    }
  }, [extractedVATData])
  
  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'GET',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.user) {
          setUser(data.user)
        } else {
          setUserError('Failed to load user profile')
        }
      } else if (response.status === 401) {
        window.location.href = '/login'
      } else {
        setUserError('Failed to fetch user profile')
      }
    } catch (err) {
      setUserError('Network error occurred')
    } finally {
      setUserLoading(false)
    }
  }
  
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      window.location.href = '/login'
    } catch (err) {
      window.location.href = '/login'
    }
  }
  
  const loadUploadedDocuments = async () => {
    try {
      setLoadingDocuments(true)
      const response = await fetch('/api/documents')
      
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.documents) {
          setUploadedDocuments(result.documents)
          logger.info('Loaded uploaded documents', { count: result.documents.length }, 'VAT_SUBMISSION')
        }
      }
    } catch (error) {
      logger.error('Failed to load uploaded documents', error, 'VAT_SUBMISSION')
    } finally {
      setLoadingDocuments(false)
    }
  }
  
  const removeDocument = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Remove from local state
        setUploadedDocuments(prev => prev.filter(doc => doc.id !== documentId))
        
        // Refresh VAT data since document was removed
        setTimeout(() => {
          loadExtractedVATData()
          // Reset calculator if no more documents with VAT data
          if (uploadedDocuments.length <= 1) {
            setSalesVAT("0.00")
            setPurchaseVAT("0.00") 
            setNetVAT("0.00")
            setUseExtractedData(false)
          }
        }, 500)
        
        toast.success('Document removed successfully')
        logger.info('Document removed successfully', { documentId }, 'VAT_SUBMISSION')
      } else {
        const result = await response.json()
        toast.error('Failed to remove document: ' + (result.error || 'Unknown error'))
        logger.error('Failed to remove document', result.error, 'VAT_SUBMISSION')
      }
    } catch (error) {
      toast.error('Network error occurred while removing document')
      logger.error('Delete error', error, 'VAT_SUBMISSION')
    }
  }

  const loadExtractedVATData = async (): Promise<any> => {
    try {
      setLoadingExtractedData(true)
      console.log('🔍 FRONTEND: Loading extracted VAT data...')
      
      const response = await fetch(`/api/documents/extracted-vat?t=${Date.now()}`)
      console.log('🌐 FRONTEND: API response status:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('📊 FRONTEND: Raw API response:', JSON.stringify(result, null, 2))
        
        if (result.success && result.extractedVAT) {
          console.log('✅ FRONTEND: Setting extracted VAT data:', {
            totalSalesVAT: result.extractedVAT.totalSalesVAT,
            totalPurchaseVAT: result.extractedVAT.totalPurchaseVAT,
            totalNetVAT: result.extractedVAT.totalNetVAT,
            processedDocuments: result.extractedVAT.processedDocuments,
            averageConfidence: result.extractedVAT.averageConfidence,
            salesDocuments: result.extractedVAT.salesDocuments?.length || 0,
            purchaseDocuments: result.extractedVAT.purchaseDocuments?.length || 0
          })
          
          setExtractedVATData(result.extractedVAT)
          logger.info('Loaded extracted VAT data', { totalSalesVAT: result.extractedVAT.totalSalesVAT, totalPurchaseVAT: result.extractedVAT.totalPurchaseVAT }, 'VAT_SUBMISSION')
          return result.extractedVAT // Return fresh data
        } else {
          console.log('❌ FRONTEND: API response indicates failure or no data:', {
            success: result.success,
            hasExtractedVAT: !!result.extractedVAT
          })
          return null
        }
      } else {
        console.log('❌ FRONTEND: API request failed:', response.status, response.statusText)
        return null
      }
    } catch (error) {
      console.error('🚨 FRONTEND: Error loading extracted VAT data:', error)
      logger.error('Failed to load extracted VAT data', error, 'VAT_SUBMISSION')
      return null
    } finally {
      setLoadingExtractedData(false)
      console.log('🏁 FRONTEND: Finished loading extracted VAT data')
    }
  }

  const useExtractedVATData = () => {
    console.log('🎯 FRONTEND: useExtractedVATData called')
    console.log('📊 FRONTEND: Current extractedVATData state:', extractedVATData)
    
    if (extractedVATData) {
      console.log('✅ FRONTEND: Applying extracted VAT data to calculator:', {
        salesVAT: extractedVATData.totalSalesVAT.toFixed(2),
        purchaseVAT: extractedVATData.totalPurchaseVAT.toFixed(2),
        netVAT: extractedVATData.totalNetVAT.toFixed(2)
      })
      
      setSalesVAT(extractedVATData.totalSalesVAT.toFixed(2))
      setPurchaseVAT(extractedVATData.totalPurchaseVAT.toFixed(2))
      setNetVAT(extractedVATData.totalNetVAT.toFixed(2))
      setUseExtractedData(true)
    } else {
      console.log('❌ FRONTEND: No extractedVATData available to use')
    }
  }

  const calculateNetVAT = async () => {
    try {
      const sales = parseFloat(salesVAT) || 0
      const purchases = parseFloat(purchaseVAT) || 0
      
      // Get current date for period calculation (using current month)
      const now = new Date()
      const periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
      const periodEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString()
      
      const response = await fetch('/api/vat/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          salesVAT: sales,
          purchaseVAT: purchases,
          periodStart,
          periodEnd
        })
      })
      
      const result = await response.json()
      
      if (response.ok && result.success) {
        setNetVAT(result.calculation.netVAT.toFixed(2))
        
        // Show warnings if any
        if (result.calculation.warnings) {
          result.calculation.warnings.forEach((warning: string) => {
            logger.warn('VAT Calculation Warning', warning, 'VAT_SUBMISSION')
          })
        }
      } else {
        logger.error('VAT calculation failed', result.error, 'VAT_SUBMISSION')
        // Fallback to client-side calculation
        const net = (sales - purchases).toFixed(2)
        setNetVAT(net)
      }
    } catch (error) {
      logger.error('VAT calculation error', error, 'VAT_SUBMISSION')
      // Fallback to client-side calculation
      const sales = parseFloat(salesVAT) || 0
      const purchases = parseFloat(purchaseVAT) || 0
      const net = (sales - purchases).toFixed(2)
      setNetVAT(net)
    }
  }

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-teal-700" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    )
  }

  if (userError || !user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="w-full max-w-md border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <span className="text-lg font-medium text-red-800">Error Loading Page</span>
            </div>
            <p className="text-red-600 text-center mb-4">{userError}</p>
            <div className="flex space-x-2">
              <Button onClick={fetchUserProfile} className="flex-1">
                Try Again
              </Button>
              <Button onClick={() => window.location.href = '/login'} variant="outline" className="flex-1">
                Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-thin">PayVAT</h1>
            
            <div className="flex items-center space-x-2 sm:space-x-6">
              <div className="hidden lg:flex items-center space-x-2">
                <Input
                  placeholder="Search"
                  className="w-32 xl:w-48 2xl:w-64 bg-white text-gray-900 border-0"
                />
                <Button size="sm" className="bg-teal-700 hover:bg-teal-800">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="text-right hidden sm:block max-w-48 lg:max-w-none">
                <h3 className="text-sm lg:text-base font-bold text-white truncate">{user.businessName}</h3>
                <p className="text-teal-100 font-mono text-xs">VAT: {user.vatNumber}</p>
              </div>
              
              <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
                <Button variant="ghost" size="sm" className="text-white hover:bg-teal-600 lg:hidden p-2 min-w-[44px] min-h-[44px]">
                  <Search className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-white hover:bg-teal-600 p-2 min-w-[44px] min-h-[44px]">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-white hover:bg-teal-600 hidden sm:flex p-2 min-w-[44px] min-h-[44px]">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-white hover:bg-teal-600 p-2 min-w-[44px] min-h-[44px]" onClick={handleLogout} title="Logout">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="bg-teal-600 px-4 sm:px-6 py-3">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-white">VAT Submission</span>
              </div>
              <div className="sm:hidden text-right max-w-40">
                <p className="text-xs text-teal-100 font-mono truncate">{user.businessName}</p>
                <p className="text-xs text-teal-200 font-mono">{user.vatNumber}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        <div className="mb-6 md:mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="inline-flex items-center justify-center w-8 md:w-10 h-8 md:h-10 bg-teal-100 rounded-full">
              <FileText className="h-4 md:h-5 w-4 md:w-5 text-teal-600" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">VAT Return Submission</h2>
              <p className="text-sm md:text-base text-gray-600">Complete your VAT calculations and submit your return</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Extracted VAT Data Card */}
            {extractedVATData && extractedVATData.processedDocuments > 0 && (
              <Card className="border-teal-200 bg-teal-50">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-teal-900 flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-teal-600" />
                    VAT Data Extracted from Documents
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-3 rounded-lg border border-teal-200">
                      <div className="text-sm text-gray-600">Sales VAT</div>
                      <div className="text-lg font-semibold text-teal-600">
                        €{extractedVATData.totalSalesVAT.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {extractedVATData.salesDocuments.length} document(s)
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg border border-teal-200">
                      <div className="text-sm text-gray-600">Purchase VAT</div>
                      <div className="text-lg font-semibold text-teal-600">
                        €{extractedVATData.totalPurchaseVAT.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {extractedVATData.purchaseDocuments.length} document(s)
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg border border-teal-200">
                      <div className="text-sm text-gray-600">Confidence</div>
                      <div className="text-lg font-semibold text-teal-600">
                        {extractedVATData.averageConfidence.toFixed(0)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {extractedVATData.processedDocuments} processed
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      onClick={useExtractedVATData}
                      className="bg-teal-600 hover:bg-teal-600 text-white"
                      disabled={useExtractedData}
                    >
                      <Calculator className="h-4 w-4 mr-2" />
                      {useExtractedData ? 'Using Extracted Data' : 'Use Extracted Amounts'}
                    </Button>
                    
                    <Button 
                      onClick={() => {
                        console.log('🔄 FRONTEND: Manual refresh button clicked')
                        loadExtractedVATData()
                      }}
                      variant="outline" 
                      className="border-teal-200 text-teal-700"
                      disabled={loadingExtractedData}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${loadingExtractedData ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <Calculator className="h-5 w-5 mr-2 text-teal-600" />
                  VAT Calculation
                  {useExtractedData && (
                    <Badge className="ml-2 bg-teal-100 text-teal-800">
                      From Documents
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="sales-vat" className="text-gray-700 font-medium">
                      VAT on Sales (Output VAT)
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                      <Input
                        id="sales-vat"
                        type="text"
                        value={salesVAT}
                        onChange={(e) => setSalesVAT(e.target.value)}
                        className="pl-8 bg-white border-gray-300 focus:border-teal-600 focus:ring-teal-600"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Total VAT collected on sales</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="purchase-vat" className="text-gray-700 font-medium">
                      VAT on Purchases (Input VAT)
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                      <Input
                        id="purchase-vat"
                        type="text"
                        value={purchaseVAT}
                        onChange={(e) => setPurchaseVAT(e.target.value)}
                        className="pl-8 bg-white border-gray-300 focus:border-teal-600 focus:ring-teal-600"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Total VAT paid on purchases</p>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-lg font-semibold text-teal-900">Net VAT Due</Label>
                        <p className="text-sm text-teal-700">Amount to pay to Revenue</p>
                      </div>
                      <div className="text-3xl font-bold text-teal-600">€{netVAT}</div>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={calculateNetVAT}
                  className="w-full bg-teal-600 hover:bg-teal-600 text-white"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Recalculate VAT
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <Upload className="h-5 w-5 mr-2 text-teal-600" />
                  Supporting Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* VAT on Sales Documents */}
                <FileUpload
                  category="SALES"
                  title="Section 1: VAT on Sales Documents"
                  description="Upload sales-related documents"
                  acceptedFiles={['.pdf', '.csv', '.xlsx', '.xls', '.jpg', '.jpeg', '.png']}
                  onUploadSuccess={(doc) => {
                    console.log('📤 FRONTEND: Sales document uploaded:', doc.fileName)
                    logger.info('Sales document uploaded', { fileName: doc.fileName }, 'VAT_SUBMISSION')
                    // Add to uploaded documents list
                    setUploadedDocuments(prev => [...prev, doc])
                    
                    console.log('⏳ FRONTEND: Waiting 5s for AI processing, then refreshing VAT data...')
                    // Refresh extracted VAT data when new documents are uploaded
                    setTimeout(() => {
                      console.log('🔄 FRONTEND: Refreshing extracted VAT data after sales document upload')
                      loadExtractedVATData().then((freshData) => {
                        console.log('🎯 FRONTEND: Post-upload VAT data refresh complete, using fresh API response for auto-populate')
                        console.log('📊 FRONTEND: Fresh data from API:', freshData)
                        
                        // CRITICAL DEBUGGING: Show key VAT extraction details
                        if (freshData) {
                          console.log('🔍 FRONTEND VAT EXTRACTION SUMMARY:')
                          console.log(`   💰 Total Sales VAT: €${freshData.totalSalesVAT || 0}`)
                          console.log(`   💰 Total Purchase VAT: €${freshData.totalPurchaseVAT || 0}`)
                          console.log(`   💰 Net VAT: €${freshData.totalNetVAT || 0}`)
                          console.log(`   📊 Confidence: ${Math.round((freshData.averageConfidence || 0) * 100)}%`)
                          console.log(`   📄 Documents processed: ${freshData.processedDocuments || 0}`)
                          
                          // MYSTERY INVESTIGATION: Check if we see expected €111.36
                          const expectedAmount = 111.36
                          const actualAmount = freshData.totalPurchaseVAT || freshData.totalSalesVAT || 0
                          
                          if (Math.abs(actualAmount - expectedAmount) < 0.01) {
                            console.log('✅ SUCCESS: Found expected €111.36!')
                          } else if (Math.abs(actualAmount - 103.16) < 0.01) {
                            console.log('🚨 MYSTERY: Got €103.16 instead of €111.36!')
                            console.log('   This confirms AI is extracting wrong amount from document')
                          } else {
                            console.log(`⚠️  UNEXPECTED: Got €${actualAmount}, expected €111.36`)
                          }
                        }
                        
                        // Use fresh data directly from API response, not stale state
                        if (freshData && freshData.processedDocuments > 0) {
                          console.log('✅ FRONTEND: Auto-populating calculator after sales document upload with fresh API data')
                          setSalesVAT(freshData.totalSalesVAT.toFixed(2))
                          setPurchaseVAT(freshData.totalPurchaseVAT.toFixed(2))
                          setNetVAT(freshData.totalNetVAT.toFixed(2))
                          setUseExtractedData(true)
                        } else {
                          console.log('❌ FRONTEND: No extracted data in fresh API response for auto-populate after sales upload')
                        }
                      }).catch((error) => {
                        console.error('🚨 FRONTEND: Error during post-upload VAT refresh:', error)
                      })
                    }, 5000) // Allow time for AI processing
                  }}
                />

                {/* VAT on Purchases Documents */}
                <FileUpload
                  category="PURCHASES"
                  title="Section 2: VAT on Purchases Documents"
                  description="Upload purchase-related documents"
                  acceptedFiles={['.pdf', '.csv', '.xlsx', '.xls', '.jpg', '.jpeg', '.png']}
                  onUploadSuccess={(doc) => {
                    console.log('📤 FRONTEND: Purchase document uploaded:', doc.fileName)
                    logger.info('Purchase document uploaded', { fileName: doc.fileName }, 'VAT_SUBMISSION')
                    // Add to uploaded documents list
                    setUploadedDocuments(prev => [...prev, doc])
                    
                    console.log('⏳ FRONTEND: Waiting 5s for AI processing, then refreshing VAT data...')
                    // Refresh extracted VAT data when new documents are uploaded
                    setTimeout(() => {
                      console.log('🔄 FRONTEND: Refreshing extracted VAT data after purchase document upload')
                      loadExtractedVATData().then((freshData) => {
                        console.log('🎯 FRONTEND: Post-upload VAT data refresh complete, using fresh API response for auto-populate')
                        console.log('📊 FRONTEND: Fresh data from API:', freshData)
                        
                        // CRITICAL DEBUGGING: Show key VAT extraction details
                        if (freshData) {
                          console.log('🔍 FRONTEND VAT EXTRACTION SUMMARY:')
                          console.log(`   💰 Total Sales VAT: €${freshData.totalSalesVAT || 0}`)
                          console.log(`   💰 Total Purchase VAT: €${freshData.totalPurchaseVAT || 0}`)
                          console.log(`   💰 Net VAT: €${freshData.totalNetVAT || 0}`)
                          console.log(`   📊 Confidence: ${Math.round((freshData.averageConfidence || 0) * 100)}%`)
                          console.log(`   📄 Documents processed: ${freshData.processedDocuments || 0}`)
                          
                          // MYSTERY INVESTIGATION: Check if we see expected €111.36
                          const expectedAmount = 111.36
                          const actualAmount = freshData.totalPurchaseVAT || freshData.totalSalesVAT || 0
                          
                          if (Math.abs(actualAmount - expectedAmount) < 0.01) {
                            console.log('✅ SUCCESS: Found expected €111.36!')
                          } else if (Math.abs(actualAmount - 103.16) < 0.01) {
                            console.log('🚨 MYSTERY: Got €103.16 instead of €111.36!')
                            console.log('   This confirms AI is extracting wrong amount from document')
                          } else {
                            console.log(`⚠️  UNEXPECTED: Got €${actualAmount}, expected €111.36`)
                          }
                        }
                        
                        // Use fresh data directly from API response, not stale state
                        if (freshData && freshData.processedDocuments > 0) {
                          console.log('✅ FRONTEND: Auto-populating calculator after purchase document upload with fresh API data')
                          setSalesVAT(freshData.totalSalesVAT.toFixed(2))
                          setPurchaseVAT(freshData.totalPurchaseVAT.toFixed(2))
                          setNetVAT(freshData.totalNetVAT.toFixed(2))
                          setUseExtractedData(true)
                        } else {
                          console.log('❌ FRONTEND: No extracted data in fresh API response for auto-populate after purchase upload')
                        }
                      }).catch((error) => {
                        console.error('🚨 FRONTEND: Error during post-upload VAT refresh:', error)
                      })
                    }, 5000) // Allow time for AI processing
                  }}
                />
              </CardContent>
            </Card>

            {/* Uploaded Documents Display - Separated by Category */}
            {uploadedDocuments.length > 0 && (
              <>
                {/* Sales Documents Section */}
                {uploadedDocuments.filter(doc => doc.category?.includes('SALES')).length > 0 && (
                  <Card className="border-teal-200">
                    <CardHeader className="bg-teal-50">
                      <CardTitle className="text-lg font-semibold text-teal-900 flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 mr-2 text-teal-600" />
                          Section 1: VAT on Sales Documents ({uploadedDocuments.filter(doc => doc.category?.includes('SALES')).length})
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-teal-600">
                            Sales VAT Total: €{extractedVATData?.totalSalesVAT?.toFixed(2) || '0.00'}
                          </div>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        {uploadedDocuments
                          .filter(doc => doc.category?.includes('SALES'))
                          .map((document) => {
                            // Find VAT data for this document
                            const docVATData = extractedVATData?.salesDocuments?.find((vatDoc: any) => vatDoc.id === document.id);
                            const vatAmounts = docVATData?.extractedAmounts || [];
                            const confidence = docVATData?.confidence || 0;
                            const totalVAT = vatAmounts.reduce((sum: number, amount: number) => sum + amount, 0);
                            
                            return (
                              <div key={document.id} className="flex items-center justify-between p-4 bg-teal-50 rounded-lg border border-teal-200">
                                <div className="flex items-center space-x-4">
                                  <div className="flex-shrink-0">
                                    {document.mimeType?.includes('pdf') ? (
                                      <FileText className="h-8 w-8 text-red-500" />
                                    ) : document.mimeType?.includes('image') ? (
                                      <FileText className="h-8 w-8 text-blue-500" />
                                    ) : (
                                      <FileText className="h-8 w-8 text-green-500" />
                                    )}
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {document.originalName || document.fileName}
                                    </p>
                                    <div className="flex items-center space-x-4 mt-1">
                                      <p className="text-xs text-gray-500">
                                        {Math.round(document.fileSize / 1024)}KB
                                      </p>
                                      
                                      {/* VAT Amount Display */}
                                      {document.isScanned && vatAmounts.length > 0 && (
                                        <div className="flex items-center text-xs">
                                          <span className="inline-flex items-center text-teal-700 font-medium">
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            €{totalVAT.toFixed(2)} ({Math.round(confidence * 100)}% confidence)
                                          </span>
                                        </div>
                                      )}
                                      
                                      {document.isScanned && vatAmounts.length === 0 && (
                                        <span className="inline-flex items-center text-green-600 text-xs">
                                          <CheckCircle className="h-3 w-3 mr-1" />
                                          AI Processed - No VAT detected
                                        </span>
                                      )}
                                      
                                      {!document.isScanned && (
                                        <span className="inline-flex items-center text-yellow-600 text-xs">
                                          <AlertCircle className="h-3 w-3 mr-1" />
                                          Processing...
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeDocument(document.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            );
                          })}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Purchase Documents Section */}
                {uploadedDocuments.filter(doc => doc.category?.includes('PURCHASE')).length > 0 && (
                  <Card className="border-green-200">
                    <CardHeader className="bg-green-50">
                      <CardTitle className="text-lg font-semibold text-green-900 flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 mr-2 text-green-600" />
                          Section 2: VAT on Purchases Documents ({uploadedDocuments.filter(doc => doc.category?.includes('PURCHASE')).length})
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-green-600">
                            Purchase VAT Total: €{extractedVATData?.totalPurchaseVAT?.toFixed(2) || '0.00'}
                          </div>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        {uploadedDocuments
                          .filter(doc => doc.category?.includes('PURCHASE'))
                          .map((document) => {
                            // Find VAT data for this document
                            const docVATData = extractedVATData?.purchaseDocuments?.find((vatDoc: any) => vatDoc.id === document.id);
                            const vatAmounts = docVATData?.extractedAmounts || [];
                            const confidence = docVATData?.confidence || 0;
                            const totalVAT = vatAmounts.reduce((sum: number, amount: number) => sum + amount, 0);
                            
                            return (
                              <div key={document.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                                <div className="flex items-center space-x-4">
                                  <div className="flex-shrink-0">
                                    {document.mimeType?.includes('pdf') ? (
                                      <FileText className="h-8 w-8 text-red-500" />
                                    ) : document.mimeType?.includes('image') ? (
                                      <FileText className="h-8 w-8 text-blue-500" />
                                    ) : (
                                      <FileText className="h-8 w-8 text-green-500" />
                                    )}
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {document.originalName || document.fileName}
                                    </p>
                                    <div className="flex items-center space-x-4 mt-1">
                                      <p className="text-xs text-gray-500">
                                        {Math.round(document.fileSize / 1024)}KB
                                      </p>
                                      
                                      {/* VAT Amount Display */}
                                      {document.isScanned && vatAmounts.length > 0 && (
                                        <div className="flex items-center text-xs">
                                          <span className="inline-flex items-center text-green-700 font-medium">
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            €{totalVAT.toFixed(2)} ({Math.round(confidence * 100)}% confidence)
                                          </span>
                                        </div>
                                      )}
                                      
                                      {document.isScanned && vatAmounts.length === 0 && (
                                        <span className="inline-flex items-center text-green-600 text-xs">
                                          <CheckCircle className="h-3 w-3 mr-1" />
                                          AI Processed - No VAT detected
                                        </span>
                                      )}
                                      
                                      {!document.isScanned && (
                                        <span className="inline-flex items-center text-yellow-600 text-xs">
                                          <AlertCircle className="h-3 w-3 mr-1" />
                                          Processing...
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeDocument(document.id)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            );
                          })}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Other Documents Section (if any exist that aren't SALES or PURCHASE) */}
                {uploadedDocuments.filter(doc => !doc.category?.includes('SALES') && !doc.category?.includes('PURCHASE')).length > 0 && (
                  <Card className="border-gray-200">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-gray-600" />
                        Other Documents ({uploadedDocuments.filter(doc => !doc.category?.includes('SALES') && !doc.category?.includes('PURCHASE')).length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {uploadedDocuments
                          .filter(doc => !doc.category?.includes('SALES') && !doc.category?.includes('PURCHASE'))
                          .map((document) => (
                            <div key={document.id} className="flex items-center justify-between p-4 bg-gray-100 rounded-lg border">
                              <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0">
                                  {document.mimeType?.includes('pdf') ? (
                                    <FileText className="h-8 w-8 text-red-500" />
                                  ) : document.mimeType?.includes('image') ? (
                                    <FileText className="h-8 w-8 text-blue-500" />
                                  ) : (
                                    <FileText className="h-8 w-8 text-green-500" />
                                  )}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {document.originalName || document.fileName}
                                  </p>
                                  <div className="flex items-center space-x-4 mt-1">
                                    <p className="text-xs text-gray-500">
                                      {Math.round(document.fileSize / 1024)}KB • {document.category?.replace('_', ' ')}
                                    </p>
                                    {document.isScanned && (
                                      <span className="inline-flex items-center text-green-600 text-xs">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        AI Processed
                                      </span>
                                    )}
                                    {!document.isScanned && (
                                      <span className="inline-flex items-center text-yellow-600 text-xs">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        Processing...
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeDocument(document.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Return Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Period:</span>
                  <span className="font-medium">{selectedPeriod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Due Date:</span>
                  <span className="font-medium text-red-600">{dueDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                    Draft
                  </Badge>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Due:</span>
                    <span className="text-teal-600">€{netVAT}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Checklist</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-teal-600" />
                  <span className="text-sm text-gray-700">Period selected</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-teal-600" />
                  <span className="text-sm text-gray-700">VAT amounts entered</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 border-2 border-gray-300 rounded-full"></div>
                  <span className="text-sm text-gray-500">Documents uploaded</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 border-2 border-gray-300 rounded-full"></div>
                  <span className="text-sm text-gray-500">Return submitted</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Save as Draft
                </Button>
                <Button 
                  className="w-full bg-teal-600 hover:bg-teal-600 text-white justify-start"
                  onClick={() => window.location.href = '/vat3-return'}
                >
                  Submit Return
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Live Chat */}
      <LiveChat />

      {/* Footer */}
      <Footer />
    </div>
  )
}