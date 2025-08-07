"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Bell, Settings, LogOut, Search, HelpCircle, CreditCard, Shield, Clock, Euro, FileText } from 'lucide-react'
import LiveChat from "@/components/live-chat"
import Footer from "@/components/footer"

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-thin">PayVAT</h1>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Search"
                  className="w-64 bg-white text-gray-900 border-0"
                />
                <Button size="sm" className="bg-blue-700 hover:bg-blue-800">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" className="text-white hover:bg-teal-600">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-white hover:bg-teal-600">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-white hover:bg-teal-600">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="bg-teal-600 px-6 py-3">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-white">FAQ</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h2>
          <p className="text-gray-600">Everything you need to know about PayVAT</p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <HelpCircle className="h-5 w-5 text-teal-500 mr-2" />
                What is PayVAT?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                PayVAT is an online platform that lets Irish businesses complete their VAT submissions and make payments directly to the Revenue Commissioners—without paying hefty third-party fees.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <FileText className="h-5 w-5 text-teal-500 mr-2" />
                Who can use PayVAT?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Any Irish-registered business required to file VAT returns can use PayVAT. Whether you&apos;re a micro-enterprise, an SME, or a growing startup, our platform scales to suit your needs.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <Settings className="h-5 w-5 text-teal-500 mr-2" />
                How do I register?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-gray-600">
                <p>1. Go to PayVAT.ie/signup</p>
                <p>2. Choose your plan (monthly or annual)</p>
                <p>3. Enter your company details and create a password</p>
                <p>4. Verify your email, and you&apos;re ready to file your first VAT return!</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <CreditCard className="h-5 w-5 text-teal-500 mr-2" />
                How does payment work?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                After you submit your VAT return through PayVAT, you can initiate your VAT payment via Revenue&apos;s Online Service (ROS) with one click—no need to log in separately.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <Euro className="h-5 w-5 text-teal-500 mr-2" />
                How much does it cost?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-teal-50 rounded-lg">
                  <span className="font-medium text-teal-800">Monthly Plan</span>
                  <span className="text-teal-700 font-semibold">€30/month, cancel anytime</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-teal-50 rounded-lg">
                  <span className="font-medium text-teal-800">Annual Plan</span>
                  <span className="text-teal-700 font-semibold">€300/year (two months free)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <Shield className="h-5 w-5 text-teal-500 mr-2" />
                Is my data secure?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Absolutely. We use bank-grade encryption (AES-256) and multi-factor authentication to protect your information. Data is hosted in EU-based, GDPR-compliant data centers.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <Clock className="h-5 w-5 text-teal-500 mr-2" />
                What if I miss a deadline?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                PayVAT will send you automated reminders well before your filing and payment deadlines. If you do miss a deadline, you&apos;ll need to contact Revenue directly for extensions or penalties.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <Settings className="h-5 w-5 text-teal-500 mr-2" />
                Can I switch plans?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Yes—upgrade or downgrade at any time from your account settings. Changes to billing take effect at your next renewal date.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <HelpCircle className="h-5 w-5 text-teal-500 mr-2" />
                Do you offer support?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                We provide email and in-app chat support from 9 am–5 pm GMT, Monday to Friday. Our comprehensive Help Center is also available 24/7.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <Card className="text-center mt-12">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Still Have Questions?</h3>
            <p className="text-gray-600 mb-6">Our support team is here to help you get started with PayVAT</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-8 text-lg">
                Contact Support
              </Button>
              <Button 
                variant="outline"
                className="border-teal-200 text-teal-700 hover:bg-teal-50 font-semibold py-3 px-8 text-lg"
                onClick={() => window.location.href = '/signup'}
              >
                Start Free Trial
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Chat */}
      <LiveChat />

      {/* Footer */}
      <Footer />
    </div>
  )
}