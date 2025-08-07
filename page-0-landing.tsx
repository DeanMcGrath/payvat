"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CheckCircle, Shield, Clock, FileText, Mail, Phone, MessageCircle, MapPin, Bell, Settings, LogOut, Search } from 'lucide-react'
import LiveChat from "./components/live-chat"
import Footer from "./components/footer"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-thin">PayVAT</h1>
            
            <div className="flex items-center space-x-2 sm:space-x-6">
              <div className="hidden md:flex items-center space-x-2">
                <Input
                  placeholder="Search"
                  className="w-32 sm:w-40 lg:w-48 xl:w-64 bg-white text-gray-900 border-0"
                />
                <Button size="sm" className="bg-blue-700 hover:bg-blue-800">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
                <Button variant="ghost" size="sm" className="text-white hover:bg-teal-600 md:hidden p-2 min-w-[44px] min-h-[44px]">
                  <Search className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-white hover:bg-teal-600 p-2 min-w-[44px] min-h-[44px]">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-white hover:bg-teal-600 hidden sm:flex p-2 min-w-[44px] min-h-[44px]">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-white hover:bg-teal-600 hidden sm:flex p-2 min-w-[44px] min-h-[44px]">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="bg-teal-600 px-4 sm:px-6 py-3">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-white">Home</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Simplify Your VAT Submission and Payments
          </h2>
          
          <div className="w-20 h-0.5 bg-teal-600 mx-auto mb-8"></div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Fast, secure, and compliant VAT return submission and payment processing for Irish businesses. 
            Get your VAT obligations sorted in minutes, not hours.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <Card className="bg-white border border-gray-200 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6 text-teal-700" />
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
              Join thousands of Irish businesses who trust PayVAT for their compliance needs
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button 
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 sm:px-8 text-base sm:text-lg"
              onClick={() => window.location.href = '/signup'}
            >
              Sign Up Now
            </Button>
            <Button 
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 px-6 sm:px-8 text-base sm:text-lg"
              onClick={() => window.location.href = '/login'}
            >
              Login to Your Account
            </Button>
          </div>
        </div>

        <div className="bg-teal-50 rounded-xl p-6 border border-teal-200 mb-12">
          <h4 className="font-semibold text-teal-800 mb-4 text-center">
            Why Choose PayVAT?
          </h4>
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-teal-700 flex-shrink-0" />
              <span className="text-teal-700 text-sm">Revenue approved platform</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-teal-700 flex-shrink-0" />
              <span className="text-teal-700 text-sm">Instant payment confirmation</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-teal-700 flex-shrink-0" />
              <span className="text-teal-700 text-sm">Automated deadline reminders</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-teal-700 flex-shrink-0" />
              <span className="text-teal-700 text-sm">24/7 customer support</span>
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

          <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Email Support</h4>
              <p className="text-gray-600 text-sm mb-3">Get help via email</p>
              <a 
                href="mailto:support@payvat.ie" 
                className="text-teal-600 hover:text-teal-700 font-medium text-sm"
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
                className="text-teal-600 hover:text-teal-700 font-medium text-sm"
              >
                +353 1 890 1234
              </a>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-6 w-6 text-teal-700" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Live Chat</h4>
              <p className="text-gray-600 text-sm mb-3">24/7 instant support</p>
              <p className="text-teal-600 font-medium text-sm">
                Available 24/7
              </p>
            </div>
          </div>
        </div>
        {/* Live Chat */}
        <LiveChat />
        
        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}
