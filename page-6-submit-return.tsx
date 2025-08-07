"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle, FileText, Calculator, Euro, Calendar, Upload } from 'lucide-react'
import LiveChat from "./components/live-chat"

interface VATReturnData {
  period: string
  salesVAT: string
  purchaseVAT: string
  netVAT: string
  dueDate: string
  businessName: string
  vatNumber: string
}

export default function SubmitReturn() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [returnData, setReturnData] = useState<VATReturnData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadReturnData = async () => {
      try {
        // Get return data from URL params or session storage
        const urlParams = new URLSearchParams(window.location.search)
        const returnId = urlParams.get('return_id') || sessionStorage.getItem('current_return_id')
        
        if (returnId) {
          const response = await fetch(`/api/vat/${returnId}`)
          if (response.ok) {
            const data = await response.json()
            setReturnData(data.vatReturn)
          } else {
            setError('VAT return data not found')
          }
        } else {
          setError('No VAT return data provided')
        }
      } catch (err) {
        setError('Failed to load VAT return data')
      } finally {
        setIsLoading(false)
      }
    }

    loadReturnData()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading VAT return data...</p>
        </div>
      </div>
    )
  }

  if (error || !returnData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4">VAT Return Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'VAT return data could not be loaded'}</p>
            <Button 
              onClick={() => window.location.href = '/vat-submission'}
              className="bg-teal-600 hover:bg-teal-700"
            >
              Return to VAT Submission
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSubmit = async () => {
    if (!returnData) return
    
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/vat/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnId: new URLSearchParams(window.location.search).get('return_id'),
          confirmSubmission: true,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Store payment info for next page
          sessionStorage.setItem('payment_amount', returnData.netVAT)
          sessionStorage.setItem('payment_period', returnData.period)
          // Redirect to payment page
          window.location.href = '/secure-payment'
        } else {
          alert('Failed to submit VAT return: ' + result.error)
        }
      } else {
        alert('Failed to submit VAT return. Please try again.')
      }
    } catch (error) {
      console.error('Submission error:', error)
      alert('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-thin text-gray-800">
              PAY <span className="text-teal-600">VAT</span>
            </h1>
          </div>
          <div className="text-right">
            <h3 className="text-lg font-bold text-teal-600">{returnData.businessName}</h3>
            <p className="text-teal-600 font-mono text-sm">VAT: {returnData.vatNumber}</p>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-teal-100 rounded-full">
              <CheckCircle className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Submit VAT Return</h2>
              <p className="text-gray-600">Review and submit your VAT return to Revenue</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-teal-600" />
                  Return Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600">VAT Period</Label>
                    <p className="font-medium text-gray-900">{returnData.period}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Due Date</Label>
                    <p className="font-medium text-red-600">{returnData.dueDate}</p>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">VAT on Sales (Output VAT):</span>
                      <span className="font-medium">€{returnData.salesVAT}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">VAT on Purchases (Input VAT):</span>
                      <span className="font-medium">€{returnData.purchaseVAT}</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Net VAT Due:</span>
                      <span className="text-2xl font-bold text-teal-600">€{returnData.netVAT}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <Upload className="h-5 w-5 mr-2 text-teal-600" />
                  Supporting Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Sales invoices uploaded</span>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      3 files
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Purchase invoices uploaded</span>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      2 files
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Declaration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">VAT Return Declaration</h4>
                  <p className="text-sm text-blue-800">
                    I declare that the information given in this return is true and complete to the best of my knowledge and belief, 
                    and that the VAT shown as due to be paid to Revenue has been calculated in accordance with the Value-Added Tax Acts.
                  </p>
                </div>
                
                <div className="flex items-start space-x-2">
                  <input type="checkbox" id="declaration" className="mt-1" />
                  <label htmlFor="declaration" className="text-sm text-gray-700">
                    I acknowledge that I have read and agree to the above declaration
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Final Check</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">VAT calculations reviewed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">Documents uploaded</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">Declaration acknowledged</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="text-center mb-4">
                    <div className="text-sm text-gray-600">Amount to Pay</div>
                    <div className="text-3xl font-bold text-teal-600">€{returnData.netVAT}</div>
                  </div>

                  <Button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full bg-teal-500 hover:bg-teal-600 text-white py-3 text-lg font-bold disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Calculator className="h-4 w-4 mr-2 animate-spin" />
                        Submitting Return...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Submit VAT Return
                      </>
                    )}
                  </Button>
                </div>
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