"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Bell, Settings, LogOut, Search, Euro, CheckCircle, Calendar, CreditCard, Shield, Clock, HelpCircle } from 'lucide-react'
import LiveChat from "@/components/live-chat"

export default function PricingPage() {
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
              <span className="text-white">Pricing</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Simple, Transparent Pricing</h2>
          <p className="text-gray-600">Choose the plan that suits your business</p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-4xl mx-auto">
          {/* Monthly Plan */}
          <Card className="relative">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-teal-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Monthly Plan</CardTitle>
              <div className="flex items-center justify-center space-x-1 mt-4">
                <Euro className="h-6 w-6 text-teal-600" />
                <span className="text-4xl font-bold text-gray-900">30</span>
                <span className="text-gray-500">/month</span>
              </div>
              <p className="text-teal-600 font-medium mt-2">Cancel anytime</p>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-center text-gray-600 mb-6">Perfect for seasonal businesses and short-term projects</p>
              <Button 
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3"
                onClick={() => window.location.href = '/signup?plan=monthly'}
              >
                Choose Monthly
              </Button>
            </CardContent>
          </Card>

          {/* Annual Plan */}
          <Card className="relative border-teal-200 bg-teal-50">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-teal-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                Most Popular
              </span>
            </div>
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-teal-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-8 w-8 text-teal-700" />
              </div>
              <CardTitle className="text-2xl font-bold text-teal-900">Annual Plan</CardTitle>
              <div className="flex items-center justify-center space-x-1 mt-4">
                <Euro className="h-6 w-6 text-teal-600" />
                <span className="text-4xl font-bold text-teal-900">300</span>
                <span className="text-teal-600">/year</span>
              </div>
              <p className="text-teal-700 font-medium mt-2">Two months free!</p>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-center text-teal-700 mb-6">Best value for steady-state SMEs and cost-savvy entrepreneurs</p>
              <Button 
                className="w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold py-3"
                onClick={() => window.location.href = '/signup?plan=annual'}
              >
                Choose Annual
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* What's Included */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 text-center">What&apos;s Included in Both Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-teal-600 flex-shrink-0 mt-1" />
                <div>
                  <span className="font-medium text-gray-800">Unlimited VAT submissions and payments via ROS</span>
                  <p className="text-gray-600 text-sm">No per-submission charges or hidden fees</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-teal-600 flex-shrink-0 mt-1" />
                <div>
                  <span className="font-medium text-gray-800">Automated deadline reminders</span>
                  <p className="text-gray-600 text-sm">Never miss a filing or payment deadline</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-teal-600 flex-shrink-0 mt-1" />
                <div>
                  <span className="font-medium text-gray-800">Secure, GDPR-compliant data storage</span>
                  <p className="text-gray-600 text-sm">Bank-grade encryption and EU-hosted data centers</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-teal-600 flex-shrink-0 mt-1" />
                <div>
                  <span className="font-medium text-gray-800">Email & in-app support</span>
                  <p className="text-gray-600 text-sm">9 am–5 pm GMT, Monday to Friday</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-teal-600 flex-shrink-0 mt-1" />
                <div>
                  <span className="font-medium text-gray-800">Access to Help Center articles</span>
                  <p className="text-gray-600 text-sm">Comprehensive guides and business resources</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-teal-600 flex-shrink-0 mt-1" />
                <div>
                  <span className="font-medium text-gray-800">Business guides and templates</span>
                  <p className="text-gray-600 text-sm">VAT compliance resources and best practices</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plan Comparison */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 text-center">Plan Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-800">Feature</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-800">Monthly</th>
                    <th className="text-center py-3 px-4 font-medium text-teal-800 bg-teal-50">Annual</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-700">Price</td>
                    <td className="py-3 px-4 text-center">€30/month</td>
                    <td className="py-3 px-4 text-center bg-teal-50 font-medium text-teal-800">€300/year</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-700">Commitment</td>
                    <td className="py-3 px-4 text-center">Cancel anytime</td>
                    <td className="py-3 px-4 text-center bg-teal-50">12-month term</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-700">Best For</td>
                    <td className="py-3 px-4 text-center text-sm">Seasonal businesses, trials</td>
                    <td className="py-3 px-4 text-center bg-teal-50 text-sm">Steady SMEs, cost-savvy</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-700">Annual Savings</td>
                    <td className="py-3 px-4 text-center">-</td>
                    <td className="py-3 px-4 text-center bg-teal-50 font-medium text-teal-800">€60 saved</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Choose PayVAT?</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Euro className="h-6 w-6 text-teal-600" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Save Money</h4>
                <p className="text-gray-600 text-sm">More cost-effective than traditional accounting or solicitor fees</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-teal-600" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Save Time</h4>
                <p className="text-gray-600 text-sm">Complete VAT returns in minutes with our step-by-step wizard</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-teal-600" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">Stay Secure</h4>
                <p className="text-gray-600 text-sm">Bank-grade encryption and GDPR-compliant data protection</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <HelpCircle className="h-5 w-5 text-teal-500 mr-2" />
              Pricing FAQ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-800 mb-1">Are there any setup fees or hidden charges?</h4>
                <p className="text-gray-600 text-sm">No setup fees, no hidden charges. Just the simple monthly or annual subscription.</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 mb-1">Can I switch between plans?</h4>
                <p className="text-gray-600 text-sm">Yes, you can upgrade or downgrade at any time. Changes take effect at your next billing cycle.</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 mb-1">What payment methods do you accept?</h4>
                <p className="text-gray-600 text-sm">We accept all major credit cards and direct debit for your subscription payments.</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 mb-1">Is there a free trial?</h4>
                <p className="text-gray-600 text-sm">Yes! We offer a 14-day free trial so you can explore all features before committing.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="text-center">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h3>
            <p className="text-gray-600 mb-6">Join thousands of Irish businesses who trust PayVAT for their VAT compliance</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-8 text-lg"
                onClick={() => window.location.href = '/signup'}
              >
                Start Free Trial
              </Button>
              <Button 
                variant="outline"
                className="border-teal-200 text-teal-700 hover:bg-teal-50 font-semibold py-3 px-8 text-lg"
              >
                Contact Sales
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Chat */}
      <LiveChat />

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm">© PayVAT</p>
        </div>
      </footer>
    </div>
  )
}