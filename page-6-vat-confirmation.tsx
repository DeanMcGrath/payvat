"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, FileText, Calendar, DollarSign } from 'lucide-react'
import LiveChat from "./components/live-chat"

export default function VATConfirmationPage() {
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
          <CardHeader className="bg-green-50 border-b border-green-100">
            <CardTitle className="text-green-800 text-xl font-semibold flex items-center gap-2">
              <CheckCircle className="h-6 w-6" />
              VAT Return Confirmed
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  Return Successfully Submitted
                </h2>
                <p className="text-gray-600">
                  Your VAT return has been filed with Revenue
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3">Confirmation Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-500" />
                    <div>
                      <span className="text-gray-600">Reference:</span>
                      <span className="font-medium ml-2">VAT-Q3-2024-001234</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <div>
                      <span className="text-gray-600">Filed:</span>
                      <span className="font-medium ml-2">15 Nov 2024</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-gray-500" />
                    <div>
                      <span className="text-gray-600">Amount Due:</span>
                      <span className="font-medium ml-2 text-emerald-600">€2,450.00</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">Payment Required</h4>
                <p className="text-blue-700 text-sm">
                  Payment of €2,450.00 is due by 23 Nov 2024. 
                  Click below to proceed with payment.
                </p>
              </div>

              <div className="flex gap-4">
                <Button 
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() => window.location.href = '/dashboard'}
                >
                  Back to Dashboard
                </Button>
                <Button 
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
                  onClick={() => window.location.href = '/payment'}
                >
                  Proceed to Payment
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
