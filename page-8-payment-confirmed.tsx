"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Download, ArrowRight, Calendar, Euro, FileText, Building, Mail, Phone } from 'lucide-react'
import LiveChat from "./components/live-chat"

export default function PaymentConfirmed() {
  // Mock payment data
  const paymentData = {
    amount: "7,350.00",
    period: "November - December 2024",
    paymentDate: "8 January 2025",
    paymentTime: "14:32",
    referenceNumber: "VAT-2024-ND-001234",
    transactionId: "TXN-20250108-143201",
    businessName: "Brian Cusack Trading Ltd",
    vatNumber: "IE0352440A",
    paymentMethod: "Credit Card ending in 4567"
  }

  const handleDownloadReceipt = () => {
    // Mock download functionality
    console.log("Downloading receipt...")
  }

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
              <CheckCircle className="h-3 w-3 mr-1" />
              Payment Confirmed
            </Badge>
          </div>
          <div className="text-right">
            <h3 className="text-lg font-bold text-emerald-600">Brian Cusack Trading Ltd</h3>
            <p className="text-emerald-600 font-mono text-sm">VAT: IE0352440A</p>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-4">
            <CheckCircle className="h-12 w-12 text-emerald-600" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 text-lg">Your VAT payment has been processed successfully</p>
        </div>

        {/* Payment Confirmation Card */}
        <Card className="mb-8 border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-lg font-medium text-gray-700 mb-2">Payment Amount</p>
              <div className="text-5xl font-bold text-emerald-600 mb-4">€{paymentData.amount}</div>
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-emerald-500" />
                  <span>Paid: {paymentData.paymentDate} at {paymentData.paymentTime}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span>Ref: {paymentData.referenceNumber}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Business Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <Building className="h-5 w-5 mr-2 text-emerald-600" />
                  Business Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Business Name</p>
                    <p className="font-semibold text-gray-900">{paymentData.businessName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">VAT Number</p>
                    <p className="font-mono font-semibold text-gray-900">{paymentData.vatNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">VAT Period</p>
                    <p className="font-semibold text-gray-900">{paymentData.period}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <p className="font-semibold text-gray-900">{paymentData.paymentMethod}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transaction Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <Euro className="h-5 w-5 mr-2 text-emerald-600" />
                  Transaction Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Transaction ID</p>
                    <p className="font-mono font-semibold text-gray-900">{paymentData.transactionId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Date & Time</p>
                    <p className="font-semibold text-gray-900">{paymentData.paymentDate} at {paymentData.paymentTime}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Amount Paid</p>
                    <p className="font-semibold text-emerald-600 text-lg">€{paymentData.amount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Important Information */}
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-blue-900">Important Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <p className="text-sm text-blue-800">
                    Your payment has been successfully processed and submitted to Revenue
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                  <p className="text-sm text-blue-800">
                    A confirmation email has been sent to your registered email address
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                  <p className="text-sm text-blue-800">
                    Keep this receipt for your records and tax filing purposes
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleDownloadReceipt}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Receipt
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.href = '/dashboard'}
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Return to Dashboard
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.print()}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Print Receipt
                </Button>
              </CardContent>
            </Card>

            {/* What Happens Next */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">What Happens Next?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-emerald-600">1</span>
                    </div>
                    <p className="text-sm text-gray-700">Payment processed by Revenue within 1-2 business days</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-emerald-600">2</span>
                    </div>
                    <p className="text-sm text-gray-700">Your VAT account will be updated automatically</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-emerald-600">3</span>
                    </div>
                    <p className="text-sm text-gray-700">You'll receive final confirmation from Revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <a href="mailto:support@payvat.ie" className="text-sm text-emerald-600 hover:text-emerald-700">
                    support@payvat.ie
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <a href="tel:+35318901234" className="text-sm text-emerald-600 hover:text-emerald-700">
                    +353 1 890 1234
                  </a>
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