"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, CreditCard, Building, Shield, Lock, CheckCircle, AlertTriangle, Clock, Calendar, Euro, FileText } from 'lucide-react'

export default function SecurePayment() {
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [isProcessing, setIsProcessing] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [cardNumber, setCardNumber] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvv, setCvv] = useState("")
  const [cardholderName, setCardholderName] = useState("Brian Cusack")

  // Mock data from previous page
  const paymentData = {
    amount: "7,350.00",
    period: "November - December 2024",
    dueDate: "15 January 2025",
    daysRemaining: 3,
    referenceNumber: "VAT-2024-ND-001234",
    businessName: "Brian Cusack Trading Ltd",
    vatNumber: "IE0352440A"
  }

  const handlePayment = async () => {
    setIsProcessing(true)
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 3000))
    setIsProcessing(false)
    // Would redirect to success page
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">
              PAY <span className="text-emerald-500">VAT</span>
            </h1>
            <Badge variant="outline" className="text-emerald-600 border-emerald-200">
              <Lock className="h-3 w-3 mr-1" />
              Secure Payment
            </Badge>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Shield className="h-4 w-4 text-emerald-500" />
            <span className="font-medium">256-bit SSL Encryption</span>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-6xl mx-auto">
        {/* Business Information Card - Add this section */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Building className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="text-xl font-bold text-blue-900">{paymentData.businessName}</h3>
                  <p className="text-blue-700 font-mono text-lg">VAT Number: {paymentData.vatNumber}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-600 font-medium">Making payment for:</p>
                <p className="text-lg font-semibold text-blue-900">{paymentData.period}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
            <Euro className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Secure VAT Payment</h2>
          <p className="text-gray-600 text-lg">Complete your payment safely and securely</p>
        </div>

        {/* Payment Amount Card - Prominent */}
        <Card className="mb-8 border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-lg font-medium text-gray-700 mb-2">Total Amount Due</p>
              <div className="text-5xl font-bold text-emerald-600 mb-4">€{paymentData.amount}</div>
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-red-500" />
                  <span>Due: {paymentData.dueDate}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span>{paymentData.daysRemaining} days remaining</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span>Ref: {paymentData.referenceNumber}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Method Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-emerald-600" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:bg-gray-50 border-emerald-200 bg-emerald-50">
                    <RadioGroupItem value="card" id="card" />
                    <CreditCard className="h-6 w-6 text-emerald-600" />
                    <div className="flex-1">
                      <Label htmlFor="card" className="font-semibold cursor-pointer text-gray-900">Credit/Debit Card</Label>
                      <p className="text-sm text-gray-600">Visa, Mastercard, American Express</p>
                      <div className="flex items-center space-x-1 mt-1">
                        <CheckCircle className="h-3 w-3 text-emerald-500" />
                        <span className="text-xs text-emerald-600">Instant Processing</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="bank" id="bank" />
                    <Building className="h-6 w-6 text-gray-600" />
                    <div className="flex-1">
                      <Label htmlFor="bank" className="font-semibold cursor-pointer text-gray-900">Bank Transfer</Label>
                      <p className="text-sm text-gray-600">Direct bank transfer</p>
                      <div className="flex items-center space-x-1 mt-1">
                        <Clock className="h-3 w-3 text-amber-500" />
                        <span className="text-xs text-amber-600">1-2 business days</span>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Card Details Form */}
            {paymentMethod === "card" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center justify-between">
                    <div className="flex items-center">
                      <Lock className="h-5 w-5 mr-2 text-emerald-600" />
                      Card Details
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm text-emerald-600 font-medium">Secured</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="card-number" className="text-gray-700 font-medium flex items-center">
                      Card Number
                      <Lock className="h-3 w-3 ml-1 text-emerald-500" />
                    </Label>
                    <Input
                      id="card-number"
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="1234 5678 9012 3456"
                      className="bg-white border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-lg py-3"
                      maxLength={19}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry" className="text-gray-700 font-medium">
                        Expiry Date
                      </Label>
                      <Input
                        id="expiry"
                        type="text"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        placeholder="MM/YY"
                        className="bg-white border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-lg py-3"
                        maxLength={5}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv" className="text-gray-700 font-medium flex items-center">
                        CVV
                        <Shield className="h-3 w-3 ml-1 text-emerald-500" />
                      </Label>
                      <Input
                        id="cvv"
                        type="text"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        placeholder="123"
                        className="bg-white border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-lg py-3"
                        maxLength={4}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardholder" className="text-gray-700 font-medium">
                      Cardholder Name
                    </Label>
                    <Input
                      id="cardholder"
                      type="text"
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                      className="bg-white border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-lg py-3"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Bank Transfer Details */}
            {paymentMethod === "bank" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Bank Transfer Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Payment Instructions</h4>
                    <div className="space-y-2 text-sm text-blue-800">
                      <p><strong>Account Name:</strong> Revenue Commissioners</p>
                      <p><strong>Bank:</strong> Bank of Ireland</p>
                      <p><strong>IBAN:</strong> IE29 BOFI 9000 0112 3456 78</p>
                      <p><strong>BIC:</strong> BOFIIE2D</p>
                      <p><strong>Reference:</strong> {paymentData.referenceNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <AlertTriangle className="h-4 w-4 mt-0.5" />
                    <p>Bank transfers take 1-2 business days to process. Ensure payment is received before the due date to avoid penalties.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Terms and Security */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Security & Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="terms" 
                    checked={acceptTerms}
                    onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                    className="mt-1"
                  />
                  <div className="space-y-1">
                    <label htmlFor="terms" className="text-sm font-medium text-gray-900 cursor-pointer">
                      I agree to the payment terms and conditions
                    </label>
                    <p className="text-xs text-gray-600">
                      By proceeding with this payment, you acknowledge that the amount will be debited from your account and 
                      transferred to the Revenue Commissioners for VAT payment.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Shield className="h-4 w-4 text-emerald-500" />
                    <span>256-bit SSL</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Lock className="h-4 w-4 text-emerald-500" />
                    <span>PCI Compliant</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span>Bank Grade Security</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Summary Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Business:</span>
                    <span className="font-medium">{paymentData.businessName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">VAT Number:</span>
                    <span className="font-mono font-medium">{paymentData.vatNumber}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Period:</span>
                    <span className="font-medium">{paymentData.period}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Due Date:</span>
                    <span className="font-medium text-red-600">{paymentData.dueDate}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium capitalize">
                      {paymentMethod === "card" ? "Credit Card" : "Bank Transfer"}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                    <span className="text-2xl font-bold text-emerald-600">€{paymentData.amount}</span>
                  </div>
                </div>

                <Button 
                  onClick={handlePayment}
                  disabled={!acceptTerms || isProcessing || (paymentMethod === "card" && (!cardNumber || !expiryDate || !cvv))}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isProcessing ? (
                    <>
                      <Lock className="h-5 w-5 mr-2 animate-pulse" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <Shield className="h-5 w-5 mr-2" />
                      PAY €{paymentData.amount}
                    </>
                  )}
                </Button>

                {paymentMethod === "bank" && (
                  <p className="text-xs text-center text-gray-500 mt-2">
                    Click to confirm bank transfer instructions
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card className="border-emerald-200 bg-emerald-50">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <Shield className="h-6 w-6 text-emerald-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-emerald-900 mb-2">Your Payment is Secure</h4>
                    <ul className="text-sm text-emerald-800 space-y-1">
                      <li>• All data encrypted with 256-bit SSL</li>
                      <li>• PCI DSS Level 1 compliant</li>
                      <li>• No card details stored</li>
                      <li>• Instant email confirmation</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
