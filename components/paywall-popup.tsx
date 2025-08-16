"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { X, Crown, Check, Gift, Lock } from 'lucide-react'

interface PaywallPopupProps {
  isOpen: boolean
  onClose: () => void
  onSubscribe: (plan: 'monthly' | 'annual') => void
  onFreeTrial: () => void
}

export default function PaywallPopup({ isOpen, onClose, onSubscribe, onFreeTrial }: PaywallPopupProps) {
  const [showFreeTrialInput, setShowFreeTrialInput] = useState(false)
  const [freeTrialCode, setFreeTrialCode] = useState("")
  const [codeError, setCodeError] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  if (!isOpen) return null

  const handleFreeTrialSubmit = async () => {
    setIsProcessing(true)
    setCodeError("")
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (freeTrialCode.toLowerCase() === "freetrial") {
      onFreeTrial()
    } else {
      setCodeError("Invalid code. Please try again.")
    }
    
    setIsProcessing(false)
  }

  const handleSubscribe = async (plan: 'monthly' | 'annual') => {
    setIsProcessing(true)
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    onSubscribe(plan)
    setIsProcessing(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl bg-white shadow-2xl">
        <CardHeader className="relative bg-gradient-to-r from-[#73C2FB] to-[#5BADEA] text-white rounded-t-lg">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-2 top-2 text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold mb-2">Unlock Premium VAT Features</CardTitle>
            <p className="text-blue-100">
              Get full access to VAT submissions, payments, and advanced reporting
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="p-8">
          {!showFreeTrialInput ? (
            <div className="space-y-6">
              {/* Premium Features */}
              <div className="bg-gray-100 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Lock className="h-5 w-5 mr-2 text-blue-600" />
                  Premium Features Include:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-700">Unlimited VAT submissions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-700">Secure payment processing</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-700">Advanced reporting & analytics</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-700">Priority customer support</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-700">Document storage & backup</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-700">Automated deadline reminders</span>
                  </div>
                </div>
              </div>

              {/* Pricing Plans */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Monthly Plan */}
                <Card className="border-2 border-gray-200 hover:border-[#73C2FB] transition-colors">
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-lg font-semibold text-gray-900">Monthly Plan</CardTitle>
                    <div className="text-3xl font-bold text-gray-900">€90</div>
                    <p className="text-sm text-gray-600">per month</p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button 
                      onClick={() => handleSubscribe('monthly')}
                      disabled={isProcessing}
                      className="w-full bg-[#8FD0FC] hover:bg-[#73C2FB] text-white"
                    >
                      {isProcessing ? "Processing..." : "Choose Monthly"}
                    </Button>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Cancel anytime
                    </p>
                  </CardContent>
                </Card>

                {/* Annual Plan */}
                <Card className="border-2 border-[#73C2FB] bg-blue-50 relative">
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-[#8FD0FC] text-white">
                    Save €180
                  </Badge>
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-lg font-semibold text-[#5BADEA]">Annual Plan</CardTitle>
                    <div className="text-3xl font-bold text-[#5BADEA]">€900</div>
                    <p className="text-sm text-blue-700">per year</p>
                    <p className="text-xs text-blue-600">€75/month when paid annually</p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button 
                      onClick={() => handleSubscribe('annual')}
                      disabled={isProcessing}
                      className="w-full bg-[#73C2FB] hover:bg-[#5BADEA] text-white"
                    >
                      {isProcessing ? "Processing..." : "Choose Annual"}
                    </Button>
                    <p className="text-xs text-blue-600 text-center mt-2">
                      Best value - 2 months free!
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Free Trial Option */}
              <div className="border-t pt-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-3">
                    <Gift className="h-5 w-5 text-amber-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Have a promotional code?</span>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowFreeTrialInput(true)}
                    className="border-amber-200 text-amber-700 hover:bg-amber-50"
                  >
                    Enter Code for Free Trial
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    Get 2 months free access with a valid promotional code
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full mb-4">
                  <Gift className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Enter Promotional Code</h3>
                <p className="text-gray-600">
                  Enter your promotional code to get 2 months of free access
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="promo-code" className="text-gray-700 font-medium">
                    Promotional Code
                  </Label>
                  <Input
                    id="promo-code"
                    type="text"
                    value={freeTrialCode}
                    onChange={(e) => {
                      setFreeTrialCode(e.target.value)
                      setCodeError("")
                    }}
                    placeholder="Enter your code here"
                    className="bg-white border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                  />
                  {codeError && (
                    <p className="text-sm text-red-600 mt-1">{codeError}</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="outline"
                    onClick={() => setShowFreeTrialInput(false)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleFreeTrialSubmit}
                    disabled={!freeTrialCode.trim() || isProcessing}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    {isProcessing ? "Verifying..." : "Apply Code"}
                  </Button>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-medium text-amber-900 mb-2">Free Trial Includes:</h4>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>• 2 months of full access</li>
                  <li>• 1 complete VAT submission cycle</li>
                  <li>• All premium features unlocked</li>
                  <li>• No payment required during trial</li>
                </ul>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Secure payment processing • Cancel anytime • 30-day money-back guarantee
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
