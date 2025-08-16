"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, Calculator, Calendar, AlertTriangle, CheckCircle, ExternalLink, FileText, Clock, TrendingUp, Shield, ArrowRight, Euro, ChevronRight, Bell, Building, Globe, Home, UtensilsCrossed } from 'lucide-react'
import Footer from "@/components/footer"
import SiteHeader from "@/components/site-header"

export default function VATGuidePage() {
  const [isVisible, setIsVisible] = useState(false)
  const [expandedSection, setExpandedSection] = useState<number | null>(null)

  useEffect(() => {
    // Trigger animations after component mounts
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)

    // Add scroll-triggered animations
    const handleScroll = () => {
      const elements = document.querySelectorAll('[data-animate]')
      elements.forEach((element) => {
        const rect = element.getBoundingClientRect()
        const isInView = rect.top < window.innerHeight && rect.bottom > 0
        
        if (isInView) {
          element.classList.add('animate-slide-up')
          element.removeAttribute('data-animate')
        }
      })
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Run once on mount

    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader 
        searchPlaceholder="Search VAT guide..."
        currentPage="VAT Guide"
        pageSubtitle="Complete guide to Irish VAT compliance"
      />


      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* What Is VAT */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <BookOpen className="h-5 w-5 text-blue-500 mr-2" />
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
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <Users className="h-5 w-5 text-blue-500 mr-2" />
              2. VAT Registration Thresholds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">You must register for VAT if your annual turnover exceeds:</p>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-1">Services: €42,500</h4>
                <p className="text-blue-700 text-sm">Annual turnover threshold for service-based businesses (from 1 Jan 2025)</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-1">Goods: €85,000</h4>
                <p className="text-green-700 text-sm">Annual turnover threshold for goods-based businesses (from 1 Jan 2025)</p>
              </div>
            </div>
            <p className="text-gray-600 mb-4">If you're likely to exceed your threshold in the current or previous calendar year, register.</p>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <span className="text-gray-600">Distance sales into Ireland exceeding €10,000 annually</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <span className="text-gray-600">Voluntary registration to reclaim VAT on business purchases</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <span className="text-gray-600">Cash basis eligibility: ≤€2m turnover OR ≥90% supplies to customers not entitled to full VAT deduction</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* VAT Rates */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <Calculator className="h-5 w-5 text-blue-500 mr-2" />
              3. VAT Rates in Ireland
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-1">Standard Rate: 23%</h4>
                <p className="text-blue-700 text-sm">Most goods and services</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-1">Reduced Rate: 13.5%</h4>
                <p className="text-blue-700 text-sm">Food, hospitality</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-1">Second Reduced Rate: 9%</h4>
                <p className="text-green-700 text-sm">Newspapers, certain sporting facilities</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-1">Zero Rate: 0%</h4>
                <p className="text-gray-700 text-sm">Many basic foodstuffs (e.g., bread, milk), qualifying children's clothing/footwear, exports; check Revenue for product specifics</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filing & Payment Deadlines */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="h-5 w-5 text-blue-500 mr-2" />
              4. Filing Requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <span className="font-medium text-gray-800">Periodic Returns:</span>
                  <span className="text-gray-600 ml-1">Typically every two months</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <span className="font-medium text-gray-800">Submission Deadline:</span>
                  <span className="text-gray-600 ml-1">Due by the 19th; extended to the 23rd for ROS filers</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-1" />
                <div>
                  <span className="font-medium text-gray-800">Late filings:</span>
                  <span className="text-gray-600 ml-1">Can incur penalties and interest</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <span className="font-medium text-gray-800">RTD (Return of Trading Details):</span>
                  <span className="text-gray-600 ml-1">Due by the 23rd of the month after your accounting period ends (filed in ROS)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* VAT Return Preparation Steps */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <FileText className="h-5 w-5 text-blue-500 mr-2" />
              5. VAT Return Preparation Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                <span className="text-gray-700">Gather sales data (output VAT)</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                <span className="text-gray-700">Collect purchase data (input VAT)</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                <span className="text-gray-700">Calculate net VAT</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                <span className="text-gray-700">Review accuracy</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">5</span>
                <span className="text-gray-700">Compile supporting documents</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Common Mistakes to Avoid */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              6. Common Mistakes to Avoid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <h4 className="font-semibold text-red-800 mb-1">Common Mistakes</h4>
                <ul className="space-y-1 text-red-700 text-sm">
                  <li>• Mixing VAT rates</li>
                  <li>• Incorrect invoice dates</li>
                  <li>• Missing receipts</li>
                  <li>• Reverse charge confusion</li>
                </ul>
              </div>
              <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                <h4 className="font-semibold text-green-800 mb-1">Best Practices</h4>
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

        {/* Industry-Specific VAT Guidance */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <Users className="h-5 w-5 text-blue-500 mr-2" />
              Industry-Specific VAT Guidance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Get specialized VAT guidance tailored to your business type and industry requirements.</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <a href="/freelancer-vat-ireland" className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group">
                <Users className="h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform" />
                <div>
                  <span className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">Freelancers</span>
                  <p className="text-gray-600 text-sm">VAT obligations for freelancers</p>
                </div>
              </a>
              <a href="/construction-vat-ireland" className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group">
                <Building className="h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform" />
                <div>
                  <span className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">Construction</span>
                  <p className="text-gray-600 text-sm">RCT and VAT requirements</p>
                </div>
              </a>
              <a href="/ecommerce-vat-ireland" className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group">
                <Globe className="h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform" />
                <div>
                  <span className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">E-commerce</span>
                  <p className="text-gray-600 text-sm">Online sales VAT rules</p>
                </div>
              </a>
              <a href="/property-rental-vat-ireland" className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group">
                <Home className="h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform" />
                <div>
                  <span className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">Property Rental</span>
                  <p className="text-gray-600 text-sm">Rental property VAT guide</p>
                </div>
              </a>
              <a href="/digital-services-vat-ireland" className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group">
                <ChevronRight className="h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform" />
                <div>
                  <span className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">Digital Services</span>
                  <p className="text-gray-600 text-sm">Tech and digital VAT rules</p>
                </div>
              </a>
              <a href="/start-restaurant-business-ireland" className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group">
                <UtensilsCrossed className="h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform" />
                <div>
                  <span className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">Restaurants</span>
                  <p className="text-gray-600 text-sm">Food service VAT rates</p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* VAT Tools */}
        <Card className="mb-4 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-blue-800 flex items-center">
              <Calculator className="h-5 w-5 text-blue-600 mr-2" />
              VAT Tools & Calculators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700 mb-4">Free tools to help you calculate VAT and check registration requirements.</p>
            <div className="grid md:grid-cols-2 gap-4">
              <a href="/vat-calculator-ireland" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors group">
                <Calculator className="h-6 w-6 text-blue-600 group-hover:scale-110 transition-transform" />
                <div>
                  <span className="font-semibold text-blue-800 group-hover:text-blue-600 transition-colors">VAT Calculator Ireland</span>
                  <p className="text-blue-700 text-sm">Calculate VAT for Irish rates (23%, 13.5%, 9%, 0%)</p>
                </div>
              </a>
              <a href="/vat-registration-checker" className="flex items-center gap-3 p-4 bg-white rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors group">
                <CheckCircle className="h-6 w-6 text-blue-600 group-hover:scale-110 transition-transform" />
                <div>
                  <span className="font-semibold text-blue-800 group-hover:text-blue-600 transition-colors">VAT Registration Checker</span>
                  <p className="text-blue-700 text-sm">Check if your business needs VAT registration</p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* How Don't Be Like Me Simplifies VAT */}
        <Card className="mb-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-blue-800 flex items-center">
              <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
              7. How Don't Be Like Me Simplifies VAT
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Calculator className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <div>
                  <span className="font-medium text-blue-800">Automatic Calculations</span>
                  <p className="text-blue-700 text-sm">Upload or enter invoices and let Don't Be Like Me compute net VAT</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <div>
                  <span className="font-medium text-blue-800">Deadline Reminders</span>
                  <p className="text-blue-700 text-sm">Custom email and in-app alerts</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <div>
                  <span className="font-medium text-blue-800">One-Click Submission</span>
                  <p className="text-blue-700 text-sm">File directly to Revenue via ROS</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <div>
                  <span className="font-medium text-blue-800">Built-In Guidance</span>
                  <p className="text-blue-700 text-sm">Context-sensitive help at every step</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Further Resources */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <ExternalLink className="h-5 w-5 text-blue-500 mr-2" />
              8. Further Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <a href="https://revenue.ie" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <ExternalLink className="h-4 w-4 text-blue-600" />
                <div>
                  <span className="font-medium text-gray-800">Revenue Commissioners VAT Guide</span>
                  <p className="text-gray-600 text-sm">Official government VAT resources</p>
                </div>
              </a>
              <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                <BookOpen className="h-4 w-4 text-blue-600" />
                <div>
                  <span className="font-medium text-gray-800">Irish Tax Institute FAQs</span>
                  <p className="text-gray-600 text-sm">Professional tax guidance</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border border-blue-200 rounded-lg bg-blue-50">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <div>
                  <span className="font-medium text-blue-800">Don't Be Like Me Help Center</span>
                  <p className="text-blue-700 text-sm">Accessible once you register</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="text-center">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-1">Ready to Simplify Your VAT?</h3>
            <p className="text-gray-600 mb-2">Let Don't Be Like Me handle the complexity while you focus on growing your business</p>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 text-lg"
              onClick={() => window.location.href = '/about'}
            >
              Contact Us
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Live Chat */}

      {/* Footer */}
      <Footer />
    </div>
  )
}
