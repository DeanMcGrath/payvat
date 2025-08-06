"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, Building2 } from 'lucide-react'
import LiveChat from "./components/live-chat"

export default function PaymentMethodPage() {
  const [selectedMethod, setSelectedMethod] = useState("card")

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
              Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between text-lg font-bold">
                  <span>Amount to Pay:</span>
                  <span className="text-emerald-600">€2,450.00</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800">Choose Payment Method</h3>
                
                <div className="grid gap-4">
                  <div 
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedMethod === 'card' 
                        ? 'border-emerald-500 bg-emerald-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedMethod('card')}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-6 w-6 text-emerald-600" />
                      <div>
                        <h4 className="font-medium text-gray-800">Credit/Debit Card</h4>
                        <p className="text-sm text-gray-600">Pay securely with your card</p>
                      </div>
                    </div>
                  </div>

                  <div 
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedMethod === 'bank' 
                        ? 'border-emerald-500 bg-emerald-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedMethod('bank')}
                  >
                    <div className="flex items-center gap-3">
                      <Building2 className="h-6 w-6 text-emerald-600" />
                      <div>
                        <h4 className="font-medium text-gray-800">Bank Transfer</h4>
                        <p className="text-sm text-gray-600">Direct bank transfer</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={() => window.location.href = '/payment'}
                >
                  Back
                </Button>
                <Button 
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
                  onClick={() => window.location.href = '/secure-payment'}
                >
                  Continue to Payment
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
