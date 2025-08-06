"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, DollarSign, Calendar, AlertTriangle, CreditCard } from 'lucide-react'
import LiveChat from "./components/live-chat"

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Business Info - Top Right */}
      <div className="flex justify-end mb-4">
        <div className="text-right">
          <h3 className="text-lg font-bold text-gray-800">Brian Cusack Trading Ltd</h3>
          <p className="text-emerald-600 font-mono text-sm">VAT: IE0352440A</p>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-1">
            PAY <span className="text-emerald-500">VAT</span>
          </h1>
          <div className="w-16 h-0.5 bg-emerald-500 mt-3 mx-auto"></div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="bg-white border border-gray-200 shadow-lg">
            <CardHeader className="bg-emerald-50 border-b border-emerald-100">
              <CardTitle className="text-emerald-800 text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                VAT Returns
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Period:</span>
                  <span className="font-medium">Q3 2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-orange-600">Due</span>
                </div>
                <Button 
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold mt-4"
                  onClick={() => window.location.href = '/vat-submission'}
                >
                  Submit VAT Return
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-lg">
            <CardHeader className="bg-blue-50 border-b border-blue-100">
              <CardTitle className="text-blue-800 text-lg font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Payments
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount Due:</span>
                  <span className="font-medium text-red-600">€2,450.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Due Date:</span>
                  <span className="font-medium">23 Nov 2024</span>
                </div>
                <Button 
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold mt-4"
                  onClick={() => window.location.href = '/payment'}
                >
                  Make Payment
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-lg">
            <CardHeader className="bg-yellow-50 border-b border-yellow-100">
              <CardTitle className="text-yellow-800 text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Next Submission:</span>
                  <span className="font-medium">23 Nov 2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Days Left:</span>
                  <span className="font-medium text-red-600">8 days</span>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-700">Action required soon</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white border border-gray-200 shadow-lg">
          <CardHeader className="bg-gray-50 border-b border-gray-100">
            <CardTitle className="text-gray-800 text-xl font-semibold">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-800">Q2 2024 VAT Return</p>
                    <p className="text-sm text-gray-600">Submitted successfully</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">15 Aug 2024</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-800">Payment Processed</p>
                    <p className="text-sm text-gray-600">€1,850.00 - Q2 2024</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">16 Aug 2024</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Chat */}
      <LiveChat />

      {/* Footer */}
      <footer className="mt-12 py-8 border-t border-gray-200 text-center">
        <p className="text-gray-500 text-sm">payvat.ie</p>
      </footer>
    </div>
  )
}
