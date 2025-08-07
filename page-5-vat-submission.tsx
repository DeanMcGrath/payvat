"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Upload, Calculator, FileText, CheckCircle, Sparkles, RefreshCw } from 'lucide-react'
import LiveChat from "@/components/live-chat"
import FileUpload from "@/components/file-upload"

export default function VATReturnSubmission() {
  const [salesVAT, setSalesVAT] = useState("9450.00")
  const [purchaseVAT, setPurchaseVAT] = useState("2100.00")
  const [netVAT, setNetVAT] = useState("7350.00")
  const [extractedVATData, setExtractedVATData] = useState<any>(null)
  const [loadingExtractedData, setLoadingExtractedData] = useState(false)
  const [useExtractedData, setUseExtractedData] = useState(false)

  // Mock selected period data (would come from previous page)
  const selectedPeriod = "November - December 2024"
  const dueDate = "15 Jan 2025"

  // Load extracted VAT data from documents on component mount
  useEffect(() => {
    loadExtractedVATData()
  }, [])

  const loadExtractedVATData = async () => {
    try {
      setLoadingExtractedData(true)
      const response = await fetch('/api/documents/extracted-vat')
      
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.extractedVAT) {
          setExtractedVATData(result.extractedVAT)
          console.log('Loaded extracted VAT data:', result.extractedVAT)
        }
      }
    } catch (error) {
      console.error('Failed to load extracted VAT data:', error)
    } finally {
      setLoadingExtractedData(false)
    }
  }

  const useExtractedVATData = () => {
    if (extractedVATData) {
      setSalesVAT(extractedVATData.totalSalesVAT.toFixed(2))
      setPurchaseVAT(extractedVATData.totalPurchaseVAT.toFixed(2))
      setNetVAT(extractedVATData.totalNetVAT.toFixed(2))
      setUseExtractedData(true)
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
            console.warn('VAT Calculation Warning:', warning)
          })
        }
      } else {
        console.error('VAT calculation failed:', result.error)
        // Fallback to client-side calculation
        const net = (sales - purchases).toFixed(2)
        setNetVAT(net)
      }
    } catch (error) {
      console.error('VAT calculation error:', error)
      // Fallback to client-side calculation
      const sales = parseFloat(salesVAT) || 0
      const purchases = parseFloat(purchaseVAT) || 0
      const net = (sales - purchases).toFixed(2)
      setNetVAT(net)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">
              PAY <span className="text-emerald-500">VAT</span>
            </h1>
          </div>
          <div className="text-right">
            <h3 className="text-lg font-bold text-gray-800">Brian Cusack Trading Ltd</h3>
            <p className="text-emerald-600 font-mono text-sm">VAT: IE0352440A</p>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-emerald-100 rounded-full">
              <FileText className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">VAT Return Submission</h2>
              <p className="text-gray-600">Complete your VAT calculations and submit your return</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Extracted VAT Data Card */}
            {extractedVATData && extractedVATData.processedDocuments > 0 && (
              <Card className="border-emerald-200 bg-emerald-50">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-emerald-900 flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-emerald-600" />
                    VAT Data Extracted from Documents
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-3 rounded-lg border border-emerald-200">
                      <div className="text-sm text-gray-600">Sales VAT</div>
                      <div className="text-lg font-semibold text-emerald-600">
                        €{extractedVATData.totalSalesVAT.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {extractedVATData.salesDocuments.length} document(s)
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg border border-emerald-200">
                      <div className="text-sm text-gray-600">Purchase VAT</div>
                      <div className="text-lg font-semibold text-emerald-600">
                        €{extractedVATData.totalPurchaseVAT.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {extractedVATData.purchaseDocuments.length} document(s)
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg border border-emerald-200">
                      <div className="text-sm text-gray-600">Confidence</div>
                      <div className="text-lg font-semibold text-emerald-600">
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
                      className="bg-emerald-500 hover:bg-emerald-600 text-white"
                      disabled={useExtractedData}
                    >
                      <Calculator className="h-4 w-4 mr-2" />
                      {useExtractedData ? 'Using Extracted Data' : 'Use Extracted Amounts'}
                    </Button>
                    
                    <Button 
                      onClick={loadExtractedVATData}
                      variant="outline" 
                      className="border-emerald-200 text-emerald-700"
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
                  <Calculator className="h-5 w-5 mr-2 text-emerald-600" />
                  VAT Calculation
                  {useExtractedData && (
                    <Badge className="ml-2 bg-emerald-100 text-emerald-800">
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
                        className="pl-8 bg-white border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
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
                        className="pl-8 bg-white border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Total VAT paid on purchases</p>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-lg font-semibold text-emerald-900">Net VAT Due</Label>
                        <p className="text-sm text-emerald-700">Amount to pay to Revenue</p>
                      </div>
                      <div className="text-3xl font-bold text-emerald-600">€{netVAT}</div>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={calculateNetVAT}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Recalculate VAT
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <Upload className="h-5 w-5 mr-2 text-emerald-600" />
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
                    console.log('Sales document uploaded:', doc)
                    // Refresh extracted VAT data when new documents are uploaded
                    setTimeout(() => loadExtractedVATData(), 1000) // Small delay to allow processing
                  }}
                />

                {/* VAT on Purchases Documents */}
                <FileUpload
                  category="PURCHASES"
                  title="Section 2: VAT on Purchases Documents"
                  description="Upload purchase-related documents"
                  acceptedFiles={['.pdf', '.csv', '.xlsx', '.xls', '.jpg', '.jpeg', '.png']}
                  onUploadSuccess={(doc) => {
                    console.log('Purchase document uploaded:', doc)
                    // Refresh extracted VAT data when new documents are uploaded
                    setTimeout(() => loadExtractedVATData(), 1000) // Small delay to allow processing
                  }}
                />
              </CardContent>
            </Card>
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
                    <span className="text-emerald-600">€{netVAT}</span>
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
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm text-gray-700">Period selected</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
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
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white justify-start"
                  onClick={() => window.location.href = '/submit-return'}
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
      <footer className="mt-8 py-6 text-center border-t border-gray-200">
        <p className="text-gray-500 text-sm">payvat.ie</p>
      </footer>
    </div>
  )
}
