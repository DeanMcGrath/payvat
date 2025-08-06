"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, FileText, CheckCircle, AlertTriangle, Calendar, Euro, Building, CreditCard } from 'lucide-react'
import LiveChat from "./components/live-chat"

export default function SubmitReturn() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Mock data from previous pages
  const returnData = {
    period: "November - December 2024",
    dueDate: "15 January 2025",
    salesVAT: "9,450.00",
    purchaseVAT: "2,100.00",
    netVAT: "7,350.00",
    businessName: "Brian Cusack Trading Ltd",
    vatNumber: "IE0352440A",
    referenceNumber: "VAT-2024-ND-001234"
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    // Simulate submission processing
    await new Promise(resolve => setTimeout(resolve, 3000))
    setIsSubmitting(false)
    // Navigate to confirmation page
    window.location.href = '/payment-confirmed'
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

      <div className="p-6 max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
            <FileText className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Submit VAT Return</h2>
          <p className="text-gray-600">Review your return details and submit to Revenue</p>
        </div>

        {/* Business Information */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Building className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="text-xl font-bold text-blue-900">{returnData.businessName}</h3>
                  <p className="text-blue-700 font-mono text-lg">VAT Number: {returnData.vatNumber}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-600 font-medium">Return Period:</p>
                <p className="text-lg font-semibold text-blue-900">{returnData.period}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* VAT Calculation Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <Euro className="h-5 w-5 mr-2 text-emerald-600" />
                  VAT Calculation Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">VAT on Sales</h4>
                    <p className="text-2xl font-bold text-gray-800">€{returnData.salesVAT}</p>
                    <p className="text-sm text-gray-600">Output VAT collected</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">VAT on Purchases</h4>
                    <p className="text-2xl font-bold text-gray-800">€{returnData.purchaseVAT}</p>
                    <p className="text-sm text-gray-600">Input VAT paid</p>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-emerald-900">Net VAT Due</h4>
                        <p className="text-sm text-emerald-700">Amount to pay to Revenue</p>
                      </div>
                      <div className="text-3xl font-bold text-emerald-600">€{returnData.netVAT}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submission Checklist */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Submission Checklist</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                    <span className="text-gray-700">VAT period selected and confirmed</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                    <span className="text-gray-700">VAT calculations completed</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                    <span className="text-gray-700">Supporting documents uploaded</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                    <span className="text-gray-700">Return details reviewed</span>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-amber-900">Important Notice</h4>
                      <p className="text-sm text-amber-800 mt-1">
                        Once submitted, this VAT return cannot be modified. Please ensure all information is correct before proceeding.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Declaration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Declaration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    I declare that the information given in this return is true and complete to the best of my knowledge and belief. 
                    I understand that giving false information may lead to prosecution and/or penalties.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Return Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Period:</span>
                    <span className="font-medium">{returnData.period}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Due Date:</span>
                    <span className="font-medium text-red-600">{returnData.dueDate}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Reference:</span>
                    <span className="font-mono font-medium text-xs">{returnData.referenceNumber}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <Badge variant="outline" className="text-amber-600 border-amber-200">
                      Ready to Submit
                    </Badge>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-gray-900">Net VAT Due:</span>
                    <span className="text-2xl font-bold text-emerald-600">€{returnData.netVAT}</span>
                  </div>
                  
                  <div className="space-y-3">
                    <Button 
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <FileText className="h-5 w-5 mr-2 animate-pulse" />
                          Submitting Return...
                        </>
                      ) : (
                        <>
                          <FileText className="h-5 w-5 mr-2" />
                          Submit VAT Return
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => window.location.href = '/vat-submission'}
                    >
                      Back to Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">What Happens Next?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-emerald-600">1</span>
                  </div>
                  <p className="text-sm text-gray-700">Your return will be submitted to Revenue</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-emerald-600">2</span>
                  </div>
                  <p className="text-sm text-gray-700">You'll receive a confirmation email</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-emerald-600">3</span>
                  </div>
                  <p className="text-sm text-gray-700">Proceed to payment if VAT is due</p>
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
