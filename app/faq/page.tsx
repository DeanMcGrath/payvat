"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Bell, Settings, LogOut, Search, HelpCircle, CreditCard, Shield, Clock, Euro, FileText, ChevronDown, ChevronUp, CheckCircle, Star } from 'lucide-react'
import LiveChat from "@/components/live-chat"
import Footer from "@/components/footer"

export default function FAQPage() {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set())
  const [isVisible, setIsVisible] = useState(false)

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

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedItems(newExpanded)
  }

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
                      placeholder="Search FAQ..."
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
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/10 hidden sm:flex glass-white/10 backdrop-blur-sm border-white/20"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/10 hidden sm:flex glass-white/10 backdrop-blur-sm border-white/20"
                  >
                    <LogOut className="h-5 w-5" />
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
                    <span>Frequently Asked Questions</span>
                  </span>
                </div>
                <div className="text-white/60 text-xs hidden sm:block">
                  Quick answers to common questions
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
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-bounce-gentle">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse-gentle"></div>
                  Get instant answers
                </div>
                
                <div className="icon-premium mb-6 mx-auto">
                  <HelpCircle className="h-12 w-12 text-white" />
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                  <span className="text-gradient-primary">Frequently Asked</span>
                  <br />
                  <span className="text-foreground">Questions</span>
                </h1>
                
                <div className="w-32 h-1 gradient-primary mx-auto mb-8 rounded-full"></div>
                
                <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Everything you need to know about PayVAT. 
                  <span className="text-primary font-semibold">Quick answers to help you get started.</span>
                </p>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex items-center justify-center gap-8 text-muted-foreground text-sm mb-12">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-success" />
                  <span> Expert VAT Guidance, Trusted by Irish businesses </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>Revenue compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-success" />
                  <span>24/7 support</span>
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

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* FAQ Items */}
        <section className="py-12" data-animate>
        <div className="space-y-6">
          <div className="card-premium hover-lift group cursor-pointer transition-all duration-300" onClick={() => toggleExpanded(0)}>
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="icon-premium group-hover:scale-110 transition-transform duration-300">
                  <HelpCircle className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                  What is PayVAT?
                </h3>
              </div>
              <div className="text-muted-foreground group-hover:text-primary transition-colors">
                {expandedItems.has(0) ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </div>
            {expandedItems.has(0) && (
              <div className="px-6 pb-6 animate-fade-in">
                <div className="w-full h-px gradient-primary mb-4"></div>
                <p className="text-muted-foreground leading-relaxed">
                  PayVAT is an online platform that lets Irish businesses complete their VAT submissions and make payments directly to the Revenue Commissioners—without paying hefty third-party fees.
                </p>
              </div>
            )}
          </div>

          <div className="card-modern hover-lift group cursor-pointer transition-all duration-300" onClick={() => toggleExpanded(1)}>
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="icon-modern bg-blue-500 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                  Who can use PayVAT?
                </h3>
              </div>
              <div className="text-muted-foreground group-hover:text-primary transition-colors">
                {expandedItems.has(1) ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </div>
            {expandedItems.has(1) && (
              <div className="px-6 pb-6 animate-fade-in">
                <div className="w-full h-px bg-blue-500/30 mb-4"></div>
                <p className="text-muted-foreground leading-relaxed">
                  Any Irish-registered business required to file VAT returns can use PayVAT. Whether you're a micro-enterprise, an SME, or a growing startup, our platform scales to suit your needs.
                </p>
              </div>
            )}
          </div>

          <div className="card-modern hover-lift group cursor-pointer transition-all duration-300" onClick={() => toggleExpanded(2)}>
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="icon-modern bg-green-500 group-hover:scale-110 transition-transform duration-300">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                  How do I register?
                </h3>
              </div>
              <div className="text-muted-foreground group-hover:text-primary transition-colors">
                {expandedItems.has(2) ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </div>
            {expandedItems.has(2) && (
              <div className="px-6 pb-6 animate-fade-in">
                <div className="w-full h-px bg-green-500/30 mb-4"></div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <span className="text-muted-foreground">Go to PayVAT.ie/signup</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <span className="text-muted-foreground">Choose your plan (monthly or annual)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <span className="text-muted-foreground">Enter your company details and create a password</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                    <span className="text-muted-foreground">Verify your email, and you're ready to file your first VAT return!</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="card-modern hover-lift group cursor-pointer transition-all duration-300" onClick={() => toggleExpanded(3)}>
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="icon-modern bg-purple-500 group-hover:scale-110 transition-transform duration-300">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                  How does payment work?
                </h3>
              </div>
              <div className="text-muted-foreground group-hover:text-primary transition-colors">
                {expandedItems.has(3) ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </div>
            {expandedItems.has(3) && (
              <div className="px-6 pb-6 animate-fade-in">
                <div className="w-full h-px bg-purple-500/30 mb-4"></div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  After you submit your VAT return through PayVAT, you can initiate your VAT payment via Revenue's Online Service (ROS) with one click—no need to log in separately.
                </p>
                <div className="flex items-center gap-2 text-success font-medium">
                  <Shield className="h-4 w-4" />
                  <span>Secure security for all payments</span>
                </div>
              </div>
            )}
          </div>

          <div className="card-premium hover-lift group cursor-pointer transition-all duration-300" onClick={() => toggleExpanded(4)}>
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="icon-premium group-hover:scale-110 transition-transform duration-300">
                  <Euro className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                  How much does it cost?
                </h3>
              </div>
              <div className="text-muted-foreground group-hover:text-primary transition-colors">
                {expandedItems.has(4) ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </div>
            {expandedItems.has(4) && (
              <div className="px-6 pb-6 animate-fade-in">
                <div className="w-full h-px gradient-primary mb-4"></div>
                <div className="grid gap-4">
                  <div className="card-modern p-4 hover-lift group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">M</span>
                        </div>
                        <div>
                          <span className="font-semibold text-foreground">Monthly Plan</span>
                          <p className="text-sm text-muted-foreground">Cancel anytime</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-primary">€30</span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                    </div>
                  </div>
                  <div className="card-premium p-4 hover-lift group relative">
                    <div className="absolute -top-2 -right-2">
                      <div className="bg-warning text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        Popular
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 gradient-primary rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">A</span>
                        </div>
                        <div>
                          <span className="font-semibold text-foreground">Annual Plan</span>
                          <p className="text-sm text-success font-medium">Two months free!</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-primary">€300</span>
                        <span className="text-muted-foreground">/year</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="card-modern hover-lift group cursor-pointer transition-all duration-300" onClick={() => toggleExpanded(5)}>
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="icon-modern bg-success group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                  Is my data secure?
                </h3>
              </div>
              <div className="text-muted-foreground group-hover:text-primary transition-colors">
                {expandedItems.has(5) ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </div>
            {expandedItems.has(5) && (
              <div className="px-6 pb-6 animate-fade-in">
                <div className="w-full h-px bg-success/30 mb-4"></div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Absolutely. We use secure encryption (AES-256) and multi-factor authentication to protect your information. Data is hosted in EU-based, GDPR-compliant data centers.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-success text-sm font-medium">
                    <CheckCircle className="h-4 w-4" />
                    <span>AES-256 Encryption</span>
                  </div>
                  <div className="flex items-center gap-2 text-success text-sm font-medium">
                    <CheckCircle className="h-4 w-4" />
                    <span>GDPR Compliant</span>
                  </div>
                  <div className="flex items-center gap-2 text-success text-sm font-medium">
                    <CheckCircle className="h-4 w-4" />
                    <span>Multi-factor Auth</span>
                  </div>
                  <div className="flex items-center gap-2 text-success text-sm font-medium">
                    <CheckCircle className="h-4 w-4" />
                    <span>EU Data Centers</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="card-modern hover-lift group cursor-pointer transition-all duration-300" onClick={() => toggleExpanded(6)}>
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="icon-modern bg-warning group-hover:scale-110 transition-transform duration-300">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                  What if I miss a deadline?
                </h3>
              </div>
              <div className="text-muted-foreground group-hover:text-primary transition-colors">
                {expandedItems.has(6) ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </div>
            {expandedItems.has(6) && (
              <div className="px-6 pb-6 animate-fade-in">
                <div className="w-full h-px bg-warning/30 mb-4"></div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  PayVAT will send you automated reminders well before your filing and payment deadlines. If you do miss a deadline, you'll need to contact Revenue directly for extensions or penalties.
                </p>
                <div className="card-modern p-4 bg-warning/10 border-warning/20">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-warning" />
                    <div>
                      <span className="font-semibold text-warning">Smart Reminders</span>
                      <p className="text-sm text-muted-foreground mt-1">Email and in-app notifications 7, 3, and 1 days before deadlines</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="card-modern hover-lift group cursor-pointer transition-all duration-300" onClick={() => toggleExpanded(7)}>
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="icon-modern bg-indigo-500 group-hover:scale-110 transition-transform duration-300">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                  Can I switch plans?
                </h3>
              </div>
              <div className="text-muted-foreground group-hover:text-primary transition-colors">
                {expandedItems.has(7) ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </div>
            {expandedItems.has(7) && (
              <div className="px-6 pb-6 animate-fade-in">
                <div className="w-full h-px bg-indigo-500/30 mb-4"></div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Yes—upgrade or downgrade at any time from your account settings. Changes to billing take effect at your next renewal date.
                </p>
                <div className="flex items-center gap-2 text-indigo-500 font-medium">
                  <CheckCircle className="h-4 w-4" />
                  <span>No cancellation fees</span>
                </div>
              </div>
            )}
          </div>

          <div className="card-premium hover-lift group cursor-pointer transition-all duration-300" onClick={() => toggleExpanded(8)}>
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="icon-premium group-hover:scale-110 transition-transform duration-300">
                  <HelpCircle className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                  Do you offer support?
                </h3>
              </div>
              <div className="text-muted-foreground group-hover:text-primary transition-colors">
                {expandedItems.has(8) ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </div>
            {expandedItems.has(8) && (
              <div className="px-6 pb-6 animate-fade-in">
                <div className="w-full h-px gradient-primary mb-4"></div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We provide email and in-app chat support from 9 am–5 pm GMT, Monday to Friday. Our comprehensive Help Center is also available 24/7.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 card-modern hover-scale">
                    <div className="text-2xl font-bold text-primary mb-1">9-5</div>
                    <div className="text-sm text-muted-foreground">Live Support</div>
                  </div>
                  <div className="text-center p-4 card-modern hover-scale">
                    <div className="text-2xl font-bold text-primary mb-1">24/7</div>
                    <div className="text-sm text-muted-foreground">Help Center</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 mt-12">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <div className="card-premium p-12 text-center relative overflow-hidden">
              {/* Background Elements */}
              <div className="absolute inset-0 gradient-mesh opacity-10"></div>
              
              <div className="relative z-10">
                <div className="mb-8">
                  <div className="icon-premium mb-6 mx-auto">
                    <HelpCircle className="h-12 w-12 text-white" />
                  </div>
                  
                  <h3 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                    Still Have <span className="text-gradient-primary">Questions?</span>
                  </h3>
                  <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Our expert support team is here to help you get started with PayVAT
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
                  <Button 
                    size="lg"
                    className="btn-primary px-12 py-4 text-lg font-semibold hover-lift min-w-[220px]"
                  >
                    Contact Support
                    <HelpCircle className="ml-2 h-5 w-5" />
                  </Button>
                  <Button 
                    variant="outline"
                    size="lg"
                    className="btn-outline px-12 py-4 text-lg min-w-[220px]"
                    onClick={() => window.location.href = '/signup'}
                  >
                    Start Free Trial
                    <CheckCircle className="ml-2 h-5 w-5" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-center gap-8 text-muted-foreground text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-success" />
                    <span>9-5 GMT Support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>14-day free trial</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-success" />
                    <span>No setup fees</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Live Chat */}
      <LiveChat />

      {/* Footer */}
      <Footer />
    </div>
  )
}