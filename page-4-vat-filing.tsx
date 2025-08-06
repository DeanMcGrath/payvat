"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import LiveChat from "./components/live-chat"

export default function VATSubmissionDetailsPage() {
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
            <CardTitle className="text-emerald-800 text-xl font-semibold">
              VAT Submission Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3">Submission Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">VAT Period:</span>
                    <span className="font-medium">Q3 2024 (Jul-Sep)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Due Date:</span>
                    <span className="font-medium text-red-600">23 Nov 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium text-orange-600">Pending</span>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                <h3 className="font-semibold text-emerald-800 mb-3">VAT Calculation</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-emerald-700">VAT on Sales:</span>
                    <span className="font-medium">€3,200.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-700">VAT on Purchases:</span>
                    <span className="font-medium">€750.00</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-emerald-200 pt-2">
                    <span className="text-emerald-800">Amount Due:</span>
                    <span className="text-emerald-600">€2,450.00</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() => window.location.href = '/vat-period'}
                >
                  Back
                </Button>
                <Button 
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
                  onClick={() => window.location.href = '/vat-submission'}
                >
                  Continue
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Chat */}
        <LiveChat />

        {/* Footer */}
        <footer className="mt-8 py-6 text-center border-t border-gray-200">
          <p className="text-gray-500 text-sm">payvat.ie</p>
        </footer>
      </div>
    </div>
  )
}
