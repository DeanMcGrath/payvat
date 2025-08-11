"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Upload, Calculator, FileText, CheckCircle, Sparkles, RefreshCw, X, AlertCircle, Bell, Settings, LogOut, Search, Loader2, Shield } from 'lucide-react'
import LiveChat from "@/components/live-chat"
import FileUpload from "@/components/file-upload"
import Footer from "@/components/footer"
import { toast } from "sonner"
import { logger } from "@/lib/logger"
import { useVATData } from "@/contexts/vat-data-context"
import { getPeriodLabel, formatEuroAmount } from "@/lib/vat-utils"

interface UserProfile {
  id: string
  email: string
  businessName: string
  vatNumber: string
  firstName?: string
  lastName?: string
}

export default function VATSubmissionPage() {
  const { selectedYear, selectedPeriod, setVATAmounts, totalSalesVAT: contextSalesVAT, totalPurchaseVAT: contextPurchaseVAT } = useVATData()
  const [salesVAT, setSalesVAT] = useState("0.00")
  const [purchaseVAT, setPurchaseVAT] = useState("0.00")
  const [netVAT, setNetVAT] = useState("0.00")
  const [extractedVATData, setExtractedVATData] = useState<any>(null)
  const [loadingExtractedData, setLoadingExtractedData] = useState(false)
  const [useExtractedData, setUseExtractedData] = useState(false)
  const [uploadedDocuments, setUploadedDocuments] = useState<any[]>([])
  const [loadingDocuments, setLoadingDocuments] = useState(false)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [userLoading, setUserLoading] = useState(true)
  const [userError, setUserError] = useState<string | null>(null)

  // Use period data from context or fallback
  // Calculate current period if none selected
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() // 0-based
  
  // Determine current VAT period (bi-monthly)
  let defaultPeriod = "jan-feb"
  if (currentMonth >= 2 && currentMonth < 4) defaultPeriod = "mar-apr"
  else if (currentMonth >= 4 && currentMonth < 6) defaultPeriod = "may-jun"
  else if (currentMonth >= 6 && currentMonth < 8) defaultPeriod = "jul-aug"
  else if (currentMonth >= 8 && currentMonth < 10) defaultPeriod = "sep-oct"
  else if (currentMonth >= 10) defaultPeriod = "nov-dec"
  
  const displayPeriod = selectedPeriod ? getPeriodLabel(selectedPeriod) + " " + selectedYear : getPeriodLabel(defaultPeriod) + " " + currentYear
  
  // Calculate due date dynamically (19th of month after period end)
  const calculateDueDate = () => {
    const year = selectedYear ? parseInt(selectedYear) : currentYear
    const period = selectedPeriod || defaultPeriod
    
    // Get period end month
    let endMonth = 1 // Default Jan-Feb ends in Feb (month 1)
    if (period === "mar-apr") endMonth = 3
    else if (period === "may-jun") endMonth = 5
    else if (period === "jul-aug") endMonth = 7
    else if (period === "sep-oct") endMonth = 9
    else if (period === "nov-dec") endMonth = 11
    
    // Due date is 19th of the month after period ends
    const dueDate = new Date(year, endMonth + 1, 19)
    return dueDate.toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })
  }
  
  const dueDate = calculateDueDate()

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
      
      // Save VAT amounts to context for VAT3 form autofill
      setVATAmounts(extractedVATData.totalSalesVAT, extractedVATData.totalPurchaseVAT)
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
              <Button onClick={() => window.location.href = '/'} variant="outline" className="flex-1">
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Modern Header */}
      <header className="gradient-primary relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 gradient-mesh opacity-30"></div>
        
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center">
                <h1 className="text-2xl font-thin text-white tracking-tight">
                  PayVAT
                </h1>
              </div>
              
              {/* Header Actions */}
              <div className="flex items-center space-x-4">
                {/* Search - Desktop */}
                <div className="hidden lg:flex items-center space-x-3">
                  <div className="relative">
                    <Input
                      placeholder="Search..."
                      className="w-64 xl:w-80 bg-white/10 text-white placeholder-white/70 border-white/20 backdrop-blur-sm focus:bg-white/15 focus:border-white/40"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70" />
                  </div>
                </div>

                <div className="text-right hidden sm:block max-w-48 lg:max-w-none">
                  <h3 className="text-sm lg:text-base font-bold text-white truncate">{user.businessName}</h3>
                  <p className="text-white/70 font-mono text-xs">VAT: {user.vatNumber}</p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/10 lg:hidden glass-white/10 backdrop-blur-sm border-white/20"
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/10 glass-white/10 backdrop-blur-sm border-white/20 relative"
                  >
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-warning rounded-full animate-pulse-gentle"></span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/10 hidden sm:flex glass-white/10 backdrop-blur-sm border-white/20"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/10 hidden sm:flex glass-white/10 backdrop-blur-sm border-white/20" 
                    onClick={handleLogout} 
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Modern Navigation */}
          <nav className="border-t border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-8">
                  <span className="text-white/90 text-sm font-medium flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>VAT Submission</span>
                  </span>
                </div>
                <div className="text-white/60 text-xs hidden sm:block">
                  Complete your VAT calculations and submit
                </div>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            {/* Hero Content */}
            <div className="max-w-4xl mx-auto animate-fade-in">
              <div className="mb-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3 animate-bounce-gentle">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse-gentle"></div>
                  Smart VAT calculations
                </div>
                
                <div className="icon-premium mb-3 mx-auto">
                  <Calculator className="h-12 w-12 text-white" />
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-2">
                  <span className="text-gradient-primary">VAT Return</span>
                  <br />
                  <span className="text-foreground">Submission</span>
                </h1>
                
                <div className="w-32 h-1 gradient-primary mx-auto mb-4 rounded-full"></div>
                
                <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Complete your VAT calculations with AI-powered document scanning. 
                  <span className="text-primary font-semibold">Submit directly to Revenue.</span>
                </p>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex items-center justify-center gap-8 text-muted-foreground text-sm mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>AI document scanning</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>Auto calculations</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>Revenue compliant</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Background Elements */}
          <div className="absolute top-20 left-10 w-16 h-16 gradient-accent rounded-full blur-xl opacity-20 animate-float"></div>
          <div className="absolute top-32 right-20 w-12 h-12 gradient-primary rounded-full blur-lg opacity-30 animate-float" style={{animationDelay: '-2s'}}></div>
          <div className="absolute bottom-20 left-20 w-20 h-20 gradient-glass rounded-full blur-2xl opacity-25 animate-float" style={{animationDelay: '-4s'}}></div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Extracted VAT Data Card */}
            {extractedVATData && extractedVATData.processedDocuments > 0 && (
              <Card className="card-premium hover-lift">
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

            <Card className="card-modern hover-lift">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground flex items-center">
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
                        onChange={(e) => {
                          setSalesVAT(e.target.value)
                          // Update context with new value
                          const salesValue = parseFloat(e.target.value) || 0
                          const purchaseValue = parseFloat(purchaseVAT) || 0
                          setVATAmounts(salesValue, purchaseValue)
                        }}
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
                        onChange={(e) => {
                          setPurchaseVAT(e.target.value)
                          // Update context with new value
                          const salesValue = parseFloat(salesVAT) || 0
                          const purchaseValue = parseFloat(e.target.value) || 0
                          setVATAmounts(salesValue, purchaseValue)
                        }}
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

            <Card className="card-modern hover-lift">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground flex items-center">
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
                  <Card className="card-modern hover-lift border-teal-200">
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
                  <Card className="card-modern hover-lift border-green-200">
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
                  <Card className="card-modern hover-lift border-gray-200">
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
            <Card className="card-modern hover-lift">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">Return Summary</CardTitle>
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

            <Card className="card-modern hover-lift">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">Checklist</CardTitle>
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

            <Card className="card-premium hover-lift">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Save as Draft
                </Button>
                <Button 
                  className="w-full bg-teal-600 hover:bg-teal-600 text-white justify-start"
                  onClick={() => {
                    // Save current VAT amounts to context before navigating
                    const salesValue = parseFloat(salesVAT) || 0
                    const purchaseValue = parseFloat(purchaseVAT) || 0
                    setVATAmounts(salesValue, purchaseValue)
                    
                    // Navigate to VAT3 return page
                    setTimeout(() => {
                      window.location.href = '/vat3-return'
                    }, 100) // Small delay to ensure context updates
                  }}
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