"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import LiveChat from "./components/live-chat"

export default function VATFilingPage() {
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
              VAT Submission Options
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">
                  Choose Your Submission Method
                </h2>
                <p className="text-gray-600">
                  Select how you would like to submit your VAT return
                </p>
              </div>

              <div className="grid gap-4">
                <Card className="border-2 border-emerald-200 hover:border-emerald-300 cursor-pointer transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800">Submit VAT Return</h3>
                        <p className="text-sm text-gray-600">Complete and submit your VAT return</p>
                      </div>
                      <Button 
                        className="bg-emerald-500 hover:bg-emerald-600 text-white"
                        onClick={() => window.location.href = '/vat-period'}
                      >
                        Start Submission
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-gray-200 hover:border-gray-300 cursor-pointer transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-800">Payment Only</h3>
                        <p className="text-sm text-gray-600">Make a VAT payment without filing</p>
                      </div>
                      <Button 
                        variant="outline"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        onClick={() => window.location.href = '/payment'}
                      >
                        Make Payment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-center">
                <Button 
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() => window.location.href = '/dashboard'}
                >
                  Back to Dashboard
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
