"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, FileText, CheckCircle, Clock, CreditCard, Download, Mail, Calendar, Shield, AlertTriangle } from 'lucide-react'
import LiveChat from "./components/live-chat"

export default function SubmitReturn() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [acceptDeclaration, setAcceptDeclaration] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Mock data - would come from previous pages
  const returnData = {
    period: "November - December 2024",
    dueDate: "15 Jan 2025",
    salesVAT: "9,450.00",
    purchaseVAT: "2,100.00",
    netVAT: "7,350.00",
    documentsUploaded: 4,
    submissionDate: "12 Jan 2025",
    referenceNumber: "VAT-2024-ND-001234"
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsSubmitted(true)
    setIsSubmitting(false)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-800">
                PAY <span className="text-emerald-500">VAT</span>
              </h1>
              <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                Submitted Successfully
              </Badge>
            </div>
          </div>
        </header>

        <div className="p-6 max-w-4xl mx-auto">
          {/* Success Message */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-6">
              <CheckCircle className="h-12 w-12 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">VAT Return Submitted Successfully!</h2>
            <p className="text-gray-600 text-lg">Your return has been processed and submitted to Revenue</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Submission Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-emerald-600" />
                  Submission Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Reference Number:</span>
                  <span className="font-mono font-medium text-emerald-600">{returnData.referenceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Period:</span>
                  <span className="font-medium">{returnData.period}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Submitted:</span>
                  <span className="font-medium">{returnData.submissionDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                    Processed
                  </Badge>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>VAT Due:</span>
                    <span className="text-emerald-600">€{returnData.netVAT}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-emerald-600" />
                  Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-emerald-600">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Make Payment</p>
                    <p className="text-sm text-gray-600">Pay €{returnData.netVAT} by {returnData.dueDate}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-gray-600">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Keep Records</p>
                    <p className="text-sm text-gray-600">Save confirmation for your records</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-gray-600">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Email Confirmation</p>
                    <p className="text-sm text-gray-600">Check your email for receipt</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3">
              <CreditCard className="h-4 w-4 mr-2" />
              Make Payment Now
            </Button>
            <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 px-8 py-3">
              <Download className="h-4 w-4 mr-2" />
              Download Confirmation
            </Button>
            <Button variant="outline" className="px-8 py-3">
              <Mail className="h-4 w-4 mr-2" />
              Email Receipt
            </Button>
          </div>

          {/* Important Notice */}
          <Card className="mt-8 border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800">Payment Reminder</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Your VAT payment of €{returnData.netVAT} is due by {returnData.dueDate}. 
                    Late payments may incur penalties and interest charges.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Business Info - Top Right */}
      <div className="flex justify-end mb-4">
        <div className="text-right">
          <h3 className="text-lg font-bold text-gray-800">Brian Cusack Trading Ltd</h3>
          <p className="text-emerald-600 font-mono text-sm">VAT: IE0352440A</p>
        </div>
      </div>
      
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-1">
            PAY <span className="text-emerald-500">VAT</span>
          </h1>
          
          <div className="w-16 h-0.5 bg-emerald-500 mt-3 mx-auto"></div>
        </div>

        <Card className="bg-white border border-gray-200 shadow-lg">
          <CardHeader className="bg-emerald-50 border-b border-emerald-100">
            <CardTitle className="text-emerald-800 text-xl font-semibold flex items-center gap-2">
              <CheckCircle className="h-6 w-6" />
              Submit VAT Return
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  Ready to Submit
                </h2>
                <p className="text-gray-600">
                  Please review your VAT return before final submission
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3">Final Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">VAT Period:</span>
                    <span className="font-medium">Q3 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">VAT on Sales:</span>
                    <span className="font-medium">€3,200.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">VAT on Purchases:</span>
                    <span className="font-medium">€750.00</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Amount Due:</span>
                    <span className="text-emerald-600">€2,450.00</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-blue-800 text-sm">
                  <strong>Important:</strong> Once submitted, this VAT return cannot be modified. 
                  Please ensure all information is correct before proceeding.
                </p>
              </div>

              <div className="flex gap-4">
                <Button 
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() => window.location.href = '/vat-submission'}
                >
                  Back to Review
                </Button>
                <Button 
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
                  onClick={() => window.location.href = '/vat-confirmation'}
                >
                  Submit Return
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
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
