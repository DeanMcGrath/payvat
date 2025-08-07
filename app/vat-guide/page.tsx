"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Bell, Settings, LogOut, Search, BookOpen, Users, Calculator, Calendar, AlertTriangle, CheckCircle, ExternalLink, FileText, Clock } from 'lucide-react'
import LiveChat from "@/components/live-chat"
import Footer from "@/components/footer"

export default function VATGuidePage() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-thin">PAY <span className="text-teal-200">VAT</span></h1>
            
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
              <span className="text-white">Everything You Need to Know About VAT in Ireland</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Everything You Need to Know About VAT in Ireland</h2>
          <p className="text-gray-600">A comprehensive business guide to VAT compliance in Ireland</p>
        </div>

        {/* What Is VAT */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <BookOpen className="h-5 w-5 text-teal-500 mr-2" />
              1. What Is VAT?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Value-Added Tax (VAT) is an indirect tax applied to the sale of most goods and services in Ireland. Registered businesses charge VAT on their sales (output VAT) and reclaim VAT paid on purchases (input VAT). The difference is then remitted to the Revenue Commissioners.
            </p>
          </CardContent>
        </Card>

        {/* Registration Requirements */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <Users className="h-5 w-5 text-teal-500 mr-2" />
              2. Who Must Register for VAT?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">You must register if:</p>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-teal-600 flex-shrink-0" />
                <span className="text-gray-600">Your annual taxable turnover exceeds €37,500 for services or €75,000 for goods</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-teal-600 flex-shrink-0" />
                <span className="text-gray-600">You make distance sales into Ireland exceeding €10,000</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-teal-600 flex-shrink-0" />
                <span className="text-gray-600">You wish to reclaim VAT on business purchases before reaching the thresholds</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* VAT Rates */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <Calculator className="h-5 w-5 text-teal-500 mr-2" />
              3. VAT Rates in Ireland
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                <h4 className="font-semibold text-teal-800 mb-2">Standard Rate: 23%</h4>
                <p className="text-teal-700 text-sm">Most goods and services</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Reduced Rate: 13.5%</h4>
                <p className="text-blue-700 text-sm">Food, hospitality</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">Second Reduced Rate: 9%</h4>
                <p className="text-green-700 text-sm">Newspapers, certain sporting facilities</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-2">Zero Rate: 0%</h4>
                <p className="text-gray-700 text-sm">Exports, certain medical goods</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filing & Payment Deadlines */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 text-teal-500 mr-2" />
              4. Filing & Payment Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-teal-600 flex-shrink-0 mt-1" />
                <div>
                  <span className="font-medium text-gray-800">Periodic Returns:</span>
                  <span className="text-gray-600 ml-1">Usually every two months</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-teal-600 flex-shrink-0 mt-1" />
                <div>
                  <span className="font-medium text-gray-800">Payment & Submission Deadline:</span>
                  <span className="text-gray-600 ml-1">23rd day after the end of the tax period</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-1" />
                <div>
                  <span className="font-medium text-gray-800">Interest & Penalties:</span>
                  <span className="text-gray-600 ml-1">Late payments incur interest; returns filed more than six months late can incur penalties</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How to Prepare Your VAT Return */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <FileText className="h-5 w-5 text-teal-500 mr-2" />
              5. How to Prepare Your VAT Return
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                <span className="text-gray-700">Gather Sales Data: Total output VAT charged</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                <span className="text-gray-700">Gather Purchase Data: Total input VAT paid</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                <span className="text-gray-700">Calculate Net VAT: Output VAT minus input VAT</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                <span className="text-gray-700">Review for Accuracy: Ensure transactions are in the correct periods and rates</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold">5</span>
                <span className="text-gray-700">Compile Supporting Documents: Invoices, receipts, and credit notes</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Common Pitfalls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              6. Common Pitfalls & Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <h4 className="font-semibold text-red-800 mb-2">Common Mistakes</h4>
                <ul className="space-y-1 text-red-700 text-sm">
                  <li>• Mixing VAT rates</li>
                  <li>• Incorrect invoice dates</li>
                  <li>• Missing receipts</li>
                  <li>• Reverse charge confusion</li>
                </ul>
              </div>
              <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                <h4 className="font-semibold text-green-800 mb-2">Best Practices</h4>
                <ul className="space-y-1 text-green-700 text-sm">
                  <li>• Double-check reduced vs. standard rates</li>
                  <li>• Match dates to correct VAT period</li>
                  <li>• Maintain organized digital records</li>
                  <li>• Know when customer accounts for VAT</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How PayVat Simplifies VAT */}
        <Card className="mb-8 border-teal-200 bg-teal-50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-teal-800 flex items-center">
              <CheckCircle className="h-5 w-5 text-teal-600 mr-2" />
              7. How PayVat Simplifies VAT
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Calculator className="h-5 w-5 text-teal-600 flex-shrink-0" />
                <div>
                  <span className="font-medium text-teal-800">Automatic Calculations</span>
                  <p className="text-teal-700 text-sm">Upload or enter invoices and let PayVat compute net VAT</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-teal-600 flex-shrink-0" />
                <div>
                  <span className="font-medium text-teal-800">Deadline Reminders</span>
                  <p className="text-teal-700 text-sm">Custom email and in-app alerts</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-teal-600 flex-shrink-0" />
                <div>
                  <span className="font-medium text-teal-800">One-Click Submission</span>
                  <p className="text-teal-700 text-sm">File directly to Revenue via ROS</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-teal-600 flex-shrink-0" />
                <div>
                  <span className="font-medium text-teal-800">Built-In Guidance</span>
                  <p className="text-teal-700 text-sm">Context-sensitive help at every step</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Further Resources */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <ExternalLink className="h-5 w-5 text-teal-500 mr-2" />
              8. Further Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <a href="https://revenue.ie" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <ExternalLink className="h-4 w-4 text-teal-600" />
                <div>
                  <span className="font-medium text-gray-800">Revenue Commissioners VAT Guide</span>
                  <p className="text-gray-600 text-sm">Official government VAT resources</p>
                </div>
              </a>
              <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                <BookOpen className="h-4 w-4 text-teal-600" />
                <div>
                  <span className="font-medium text-gray-800">Irish Tax Institute FAQs</span>
                  <p className="text-gray-600 text-sm">Professional tax guidance</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border border-teal-200 rounded-lg bg-teal-50">
                <CheckCircle className="h-4 w-4 text-teal-600" />
                <div>
                  <span className="font-medium text-teal-800">PayVat Help Center</span>
                  <p className="text-teal-700 text-sm">Accessible once you register</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="text-center">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Simplify Your VAT?</h3>
            <p className="text-gray-600 mb-6">Let PayVat handle the complexity while you focus on growing your business</p>
            <Button 
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-8 text-lg"
              onClick={() => window.location.href = '/signup'}
            >
              Start Your Free Trial
            </Button>
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