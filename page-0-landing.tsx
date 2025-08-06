"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Shield, Clock, FileText, Mail, Phone, MessageCircle, MapPin } from 'lucide-react'
import LiveChat from "./components/live-chat"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            PAY <span className="text-emerald-500">VAT</span>
          </h1>
          
          <div className="w-20 h-0.5 bg-emerald-500 mx-auto mb-8"></div>
          
          <h2 className="text-2xl text-gray-700 mb-4">
            Simplify Your VAT Submission and Payments
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Fast, secure, and compliant VAT return submission and payment processing for Irish businesses. 
            Get your VAT obligations sorted in minutes, not hours.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white border border-gray-200 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Easy Submission</h3>
              <p className="text-gray-600 text-sm">
                Simple step-by-step VAT return submission process
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Secure Payments</h3>
              <p className="text-gray-600 text-sm">
                Safe and secure VAT payment options
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Save Time</h3>
              <p className="text-gray-600 text-sm">
                Complete your VAT obligations in minutes
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-gray-600">
              Join thousands of Irish businesses who trust PAY VAT for their compliance needs
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-8 text-lg"
              onClick={() => window.location.href = '/signup'}
            >
              Sign Up Now
            </Button>
            <Button 
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 px-8 text-lg"
              onClick={() => window.location.href = '/login'}
            >
              Login to Your Account
            </Button>
          </div>
        </div>

        <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200 mb-12">
          <h4 className="font-semibold text-emerald-800 mb-4 text-center">
            Why Choose PAY VAT?
          </h4>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              <span className="text-emerald-700 text-sm">Revenue approved platform</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              <span className="text-emerald-700 text-sm">Instant payment confirmation</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              <span className="text-emerald-700 text-sm">Automated deadline reminders</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              <span className="text-emerald-700 text-sm">24/7 customer support</span>
            </div>
          </div>
        </div>

        {/* Contact Us Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              Need Help? Contact Us
            </h3>
            <p className="text-gray-600">
              Our team is here to help you with any questions about VAT submission and payments
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Email Support</h4>
              <p className="text-gray-600 text-sm mb-3">Get help via email</p>
              <a 
                href="mailto:support@payvat.ie" 
                className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
              >
                support@payvat.ie
              </a>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Phone Support</h4>
              <p className="text-gray-600 text-sm mb-3">Mon-Fri, 9AM-5PM</p>
              <a 
                href="tel:+35318901234" 
                className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
              >
                +353 1 890 1234
              </a>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Live Chat</h4>
              <p className="text-gray-600 text-sm mb-3">24/7 instant support</p>
              <p className="text-emerald-600 font-medium text-sm">
                Available 24/7
              </p>
            </div>
          </div>
        </div>
        {/* Live Chat */}
        <LiveChat />
        {/* Footer */}
        <footer className="mt-16 py-8 border-t border-gray-200 text-center">
          <p className="text-gray-500 text-sm">payvat.ie</p>
          <p className="text-gray-400 text-xs mt-2">© 2024 PAY VAT. All rights reserved.</p>
        </footer>
      </div>
    </div>
  )
}
