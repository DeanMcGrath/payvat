"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Bell, Settings, LogOut, Search, BookOpen, Users, Calculator, Calendar, AlertTriangle, CheckCircle, ExternalLink, FileText, Clock, TrendingUp, Shield, ArrowRight, Euro, Zap } from 'lucide-react'
import LiveChat from "@/components/live-chat"
import Footer from "@/components/footer"

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
      {/* Modern Header */}
      <header className="gradient-primary relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 gradient-mesh opacity-30"></div>
        
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center">
                <Link href="/" className="text-2xl font-thin text-white tracking-tight hover:text-white/90 transition-colors">
                  PayVAT
                </Link>
              </div>
              
              {/* Header Actions */}
              <div className="flex items-center space-x-4">
                {/* Search - Desktop */}
                <div className="hidden lg:flex items-center space-x-3">
                  <div className="relative">
                    <Input
                      placeholder="Search VAT guide..."
                      className="w-64 xl:w-80 bg-white/10 text-white placeholder-white/70 border-white/20 backdrop-blur-sm focus:bg-white/15 focus:border-white/40"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70" />
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/10 lg:hidden glass-white/10 backdrop-blur-sm border-white/20"
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/10 glass-white/10 backdrop-blur-sm border-white/20 relative"
                  >
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-warning rounded-full animate-pulse-gentle"></span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-white border-white/20 hover:bg-white/10 hidden sm:flex glass-white/10 backdrop-blur-sm"
                    onClick={() => window.location.href = '/login'}
                  >
                    Sign In
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-white border-white/20 hover:bg-white/10 hidden sm:flex glass-white/10 backdrop-blur-sm"
                    onClick={() => window.location.href = '/signup'}
                  >
                    Sign Up
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Modern Navigation */}
          <nav className="border-t border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-8">
                  <span className="text-white/90 text-sm font-medium flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>VAT Guide</span>
                  </span>
                  <div className="hidden md:flex items-center space-x-6 text-white/70 text-sm">
                    <button className="hover:text-white transition-colors" onClick={() => window.location.href = '/about'}>About</button>
                    <button className="hover:text-white transition-colors" onClick={() => window.location.href = '/pricing'}>Pricing</button>
                    <button className="hover:text-white transition-colors" onClick={() => window.location.href = '/vat-registration'}>Get VAT Number</button>
                    <button className="hover:text-white transition-colors" onClick={() => window.location.href = '/login'}>Login</button>
                  </div>
                </div>
                <div className="text-white/60 text-xs hidden sm:block">
                  Complete guide to Irish VAT compliance
                </div>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            {/* Hero Content */}
            <div className="max-w-4xl mx-auto animate-fade-in">
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3 animate-bounce-gentle">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse-gentle"></div>
                  Expert VAT guidance
                </div>
                
                <div className="icon-premium mb-6 mx-auto">
                  <BookOpen className="h-12 w-12 text-white" />
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-3">
                  <span className="text-gradient-primary">Everything About</span>
                  <br />
                  <span className="text-foreground">VAT in Ireland</span>
                </h1>
                
                <div className="w-32 h-1 gradient-primary mx-auto mb-8 rounded-full"></div>
                
                <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  A comprehensive business guide to VAT compliance in Ireland. 
                  <span className="text-primary font-semibold">Master VAT with confidence.</span>
                </p>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex items-center justify-center gap-8 text-muted-foreground text-sm mb-12">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-success" />
                  <span>Revenue compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>Expert guidance</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-success" />
                  <span>Always updated</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Background Elements */}
          <div className="absolute top-20 left-10 w-16 h-16 gradient-accent rounded-full blur-xl opacity-20 animate-float"></div>
          <div className="absolute top-32 right-20 w-12 h-12 gradient-primary rounded-full blur-lg opacity-30 animate-float" style={{animationDelay: '-2s'}}></div>
          <div className="absolute bottom-20 left-20 w-20 h-20 gradient-glass rounded-full blur-2xl opacity-25 animate-float" style={{animationDelay: '-4s'}}></div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-8">

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
              2. VAT Registration Thresholds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">You must register for VAT if your annual turnover exceeds:</p>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Services: €37,500</h4>
                <p className="text-blue-700 text-sm">Annual turnover threshold for service-based businesses</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">Goods: €75,000</h4>
                <p className="text-green-700 text-sm">Annual turnover threshold for goods-based businesses</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-teal-600 flex-shrink-0" />
                <span className="text-gray-600">Distance sales into Ireland exceeding €10,000 annually</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-teal-600 flex-shrink-0" />
                <span className="text-gray-600">Voluntary registration to reclaim VAT on business purchases</span>
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
              4. Filing Requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-teal-600 flex-shrink-0 mt-1" />
                <div>
                  <span className="font-medium text-gray-800">Periodic Returns:</span>
                  <span className="text-gray-600 ml-1">Typically every two months</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-teal-600 flex-shrink-0 mt-1" />
                <div>
                  <span className="font-medium text-gray-800">Submission Deadline:</span>
                  <span className="text-gray-600 ml-1">23rd day after tax period end</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-1" />
                <div>
                  <span className="font-medium text-gray-800">Late filings:</span>
                  <span className="text-gray-600 ml-1">Can incur penalties and interest</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* VAT Return Preparation Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <FileText className="h-5 w-5 text-teal-500 mr-2" />
              5. VAT Return Preparation Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                <span className="text-gray-700">Gather sales data (output VAT)</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                <span className="text-gray-700">Collect purchase data (input VAT)</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                <span className="text-gray-700">Calculate net VAT</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                <span className="text-gray-700">Review accuracy</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold">5</span>
                <span className="text-gray-700">Compile supporting documents</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Common Mistakes to Avoid */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              6. Common Mistakes to Avoid
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
              7. How PayVAT Simplifies VAT
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Calculator className="h-5 w-5 text-teal-600 flex-shrink-0" />
                <div>
                  <span className="font-medium text-teal-800">Automatic Calculations</span>
                  <p className="text-teal-700 text-sm">Upload or enter invoices and let PayVAT compute net VAT</p>
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
                  <span className="font-medium text-teal-800">PayVAT Help Center</span>
                  <p className="text-teal-700 text-sm">Accessible once you register</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="text-center">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Simplify Your VAT?</h3>
            <p className="text-gray-600 mb-6">Let PayVAT handle the complexity while you focus on growing your business</p>
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