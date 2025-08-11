"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Download, ArrowRight, Calendar, Euro, FileText, Building, Mail, Phone, Bell, Settings, LogOut, Search, Loader2, AlertCircle } from 'lucide-react'
import Footer from "./components/footer"
import { Input } from "@/components/ui/input"

interface PaymentData {
  amount: string
  period: string
  paymentDate: string
  paymentTime: string
  referenceNumber: string
  transactionId: string
  businessName: string
  vatNumber: string
  paymentMethod: string
}

interface UserProfile {
  id: string
  email: string
  businessName: string
  vatNumber: string
  firstName?: string
  lastName?: string
}

export default function PaymentConfirmed() {
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [userLoading, setUserLoading] = useState(true)
  const [userError, setUserError] = useState<string | null>(null)

  useEffect(() => {
    fetchUserProfile()
    fetchPaymentData()
  }, [])
  
  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'GET',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.user) {
          setUser(data.user)
        } else {
          setUserError('Failed to load user profile')
        }
      } else if (response.status === 401) {
        window.location.href = '/login'
      } else {
        setUserError('Failed to fetch user profile')
      }
    } catch (err) {
      setUserError('Network error occurred')
    } finally {
      setUserLoading(false)
    }
  }
  
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      window.location.href = '/login'
    } catch (err) {
      window.location.href = '/login'
    }
  }
  
  // Fetch payment data from URL params or API
  const fetchPaymentData = async () => {
      try {
        // Get payment ID from URL or session storage
        const urlParams = new URLSearchParams(window.location.search)
        const paymentId = urlParams.get('payment_id') || sessionStorage.getItem('last_payment_id')
        
        if (paymentId) {
          const response = await fetch(`/api/payments/${paymentId}`)
          if (response.ok) {
            const data = await response.json()
            setPaymentData(data.payment)
          }
        }
      } catch (error) {
        console.error('Failed to fetch payment data:', error)
      } finally {
        setIsLoading(false)
      }
    }

  const handleDownloadReceipt = async () => {
    try {
      if (!paymentData) return
      
      const response = await fetch(`/api/payments/${paymentData.transactionId}/receipt`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `VAT-Receipt-${paymentData.referenceNumber}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Failed to download receipt:', error)
    }
  }

  if (userLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-teal-700" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    )
  }

  if (userError || !user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="w-full max-w-md border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <span className="text-lg font-medium text-red-800">Error Loading Page</span>
            </div>
            <p className="text-red-600 text-center mb-4">{userError}</p>
            <div className="flex space-x-2">
              <Button onClick={fetchUserProfile} className="flex-1">
                Try Again
              </Button>
              <Button onClick={() => window.location.href = '/login'} variant="outline" className="flex-1">
                Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Not Found</h2>
            <p className="text-gray-600 mb-6">We could not locate your payment information.</p>
            <Button 
              onClick={() => window.location.href = '/dashboard'}
              className="bg-teal-600 hover:bg-teal-700"
            >
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="text-xl sm:text-2xl font-thin hover:text-teal-100 transition-colors">PayVAT</a>
            
            <div className="flex items-center space-x-2 sm:space-x-6">
              <div className="hidden lg:flex items-center space-x-2">
                <Input
                  placeholder="Search"
                  className="w-32 xl:w-48 2xl:w-64 bg-white text-gray-900 border-0"
                />
                <Button size="sm" className="bg-blue-700 hover:bg-blue-800">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="text-right hidden sm:block max-w-48 lg:max-w-none">
                <h3 className="text-sm lg:text-base font-bold text-white truncate">{user.businessName}</h3>
                <p className="text-teal-100 font-mono text-xs">VAT: {user.vatNumber}</p>
              </div>
              
              <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
                <Button variant="ghost" size="sm" className="text-white hover:bg-teal-600 lg:hidden p-2 min-w-[44px] min-h-[44px]">
                  <Search className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-white hover:bg-teal-600 p-2 min-w-[44px] min-h-[44px]">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-white hover:bg-teal-600 hidden sm:flex p-2 min-w-[44px] min-h-[44px]">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-white hover:bg-teal-600 p-2 min-w-[44px] min-h-[44px]" onClick={handleLogout} title="Logout">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="bg-teal-600 px-4 sm:px-6 py-3">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-white">Payment Confirmed</span>
              </div>
              <div className="sm:hidden text-right max-w-40">
                <p className="text-xs text-teal-100 font-mono truncate">{user.businessName}</p>
                <p className="text-xs text-teal-200 font-mono">{user.vatNumber}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-teal-100 rounded-full mb-4">
            <CheckCircle className="h-12 w-12 text-teal-600" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 text-lg">Your VAT payment has been processed successfully</p>
        </div>

        {/* Payment Confirmation Card */}
        <Card className="mb-8 border-teal-200 bg-gradient-to-r from-teal-50 to-green-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-lg font-medium text-gray-700 mb-2">Payment Amount</p>
              <div className="text-5xl font-bold text-teal-600 mb-4">€{paymentData.amount}</div>
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-teal-500" />
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
                  <Building className="h-5 w-5 mr-2 text-teal-600" />
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
                  <Euro className="h-5 w-5 mr-2 text-teal-600" />
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
                    <p className="font-semibold text-teal-600 text-lg">€{paymentData.amount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <Badge className="bg-teal-100 text-teal-800 border-teal-200">
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
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white"
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
                    <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-teal-600">1</span>
                    </div>
                    <p className="text-sm text-gray-700">Payment processed by Revenue within 1-2 business days</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-teal-600">2</span>
                    </div>
                    <p className="text-sm text-gray-700">Your VAT account will be updated automatically</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-teal-600">3</span>
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
                  <a href="mailto:support@payvat.ie" className="text-sm text-teal-600 hover:text-teal-700">
                    support@payvat.ie
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <a href="tel:+35318901234" className="text-sm text-teal-600 hover:text-teal-700">
                    +353 1 890 1234
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Live Chat */}

      {/* Footer */}
      <Footer />
    </div>
  )
}