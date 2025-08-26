"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HelpCircle, CreditCard, Shield, Clock, Euro, FileText, ChevronDown, ChevronUp, CheckCircle, BadgeCheck, Settings, Bell, Building, Users, Calculator, Calendar, AlertTriangle } from 'lucide-react'
import Footer from "@/components/footer"
import SiteHeader from "@/components/site-header"
import FAQSchema from "@/components/faq-schema"

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
      <FAQSchema />
      <SiteHeader />


      <div className="max-w-4xl mx-auto px-6 content-after-header pb-8">

        {/* FAQ Items */}
        <section className="py-12" data-animate>
        <div className="space-y-6">
          <div className="card-premium hover-lift group cursor-pointer transition-all duration-300" onClick={() => toggleExpanded(0)}>
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="icon-premium group-hover:scale-110 transition-transform duration-300">
                  <HelpCircle className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-normal text-foreground group-hover:text-primary transition-colors">
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
                <div className="icon-modern bg-petrol-light group-hover:scale-110 transition-transform duration-300">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-normal text-foreground group-hover:text-primary transition-colors">
                  Who can use PayVAT?
                </h3>
              </div>
              <div className="text-muted-foreground group-hover:text-primary transition-colors">
                {expandedItems.has(1) ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </div>
            {expandedItems.has(1) && (
              <div className="px-6 pb-6 animate-fade-in">
                <div className="w-full h-px bg-petrol-light/30 mb-4"></div>
                <p className="text-muted-foreground leading-relaxed">
                  Any Irish-registered business required to Submit VAT returns can use PayVAT. Whether you're a micro-enterprise, an SME, or a growing startup, our platform scales to suit your needs.
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
                <h3 className="text-lg font-normal text-foreground group-hover:text-primary transition-colors">
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
                    <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-normal">1</div>
                    <span className="text-muted-foreground">Visit PayVAT.ie/about for contact information</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-normal">2</div>
                    <span className="text-muted-foreground">Choose your plan (monthly or annual)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-normal">3</div>
                    <span className="text-muted-foreground">Enter your company details and create a password</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-normal">4</div>
                    <span className="text-muted-foreground">Verify your email, and you're ready to file your first VAT return!</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="card-modern hover-lift group cursor-pointer transition-all duration-300" onClick={() => toggleExpanded(3)}>
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="icon-modern bg-petrol-light group-hover:scale-110 transition-transform duration-300">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-normal text-foreground group-hover:text-primary transition-colors">
                  How does payment work?
                </h3>
              </div>
              <div className="text-muted-foreground group-hover:text-primary transition-colors">
                {expandedItems.has(3) ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </div>
            {expandedItems.has(3) && (
              <div className="px-6 pb-6 animate-fade-in">
                <div className="w-full h-px bg-petrol-light/30 mb-4"></div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  After you submit your VAT return through PayVAT, you can initiate your VAT payment via Revenue's Online Service (ROS) with one click—no need to log in separately.
                </p>
                <div className="flex items-center gap-2 text-success font-normal">
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
                <h3 className="text-lg font-normal text-foreground group-hover:text-primary transition-colors">
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
                          <span className="text-white font-normal text-sm">M</span>
                        </div>
                        <div>
                          <span className="font-normal text-foreground">Monthly Plan</span>
                          <p className="text-sm text-muted-foreground">Cancel anytime</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-normal text-primary">€90</span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                    </div>
                  </div>
                  <div className="card-premium p-4 hover-lift group relative">
                    <div className="absolute -top-2 -right-2">
                      <div className="bg-warning text-white px-2 py-1 rounded-full text-xs font-normal flex items-center gap-1">
                        <BadgeCheck className="h-3 w-3" />
                        Popular
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 gradient-primary rounded-full flex items-center justify-center">
                          <span className="text-white font-normal text-sm">A</span>
                        </div>
                        <div>
                          <span className="font-normal text-foreground">Annual Plan</span>
                          <p className="text-sm text-success font-normal">Save €180 with annual billing!</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-normal text-primary">€900</span>
                        <span className="text-muted-foreground">/year</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="card-modern hover-lift group cursor-pointer transition-all duration-300" onClick={() => toggleExpanded(14)}>
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="icon-modern bg-success group-hover:scale-110 transition-transform duration-300">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-normal text-foreground group-hover:text-primary transition-colors">
                  Is there a free trial?
                </h3>
              </div>
              <div className="text-muted-foreground group-hover:text-primary transition-colors">
                {expandedItems.has(14) ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </div>
            {expandedItems.has(14) && (
              <div className="px-6 pb-6 animate-fade-in">
                <div className="w-full h-px bg-success/30 mb-4"></div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Yes, 14-day free trial with no setup fees.
                </p>
                <div className="flex items-center gap-2 text-success font-normal">
                  <CheckCircle className="h-4 w-4" />
                  <span>No credit card required</span>
                </div>
              </div>
            )}
          </div>

          <div className="card-modern hover-lift group cursor-pointer transition-all duration-300" onClick={() => toggleExpanded(13)}>
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="icon-modern bg-petrol-light group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-normal text-foreground group-hover:text-primary transition-colors">
                  What's included in the service?
                </h3>
              </div>
              <div className="text-muted-foreground group-hover:text-primary transition-colors">
                {expandedItems.has(13) ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </div>
            {expandedItems.has(13) && (
              <div className="px-6 pb-6 animate-fade-in">
                <div className="w-full h-px bg-petrol-light/30 mb-4"></div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  VAT calculations, submissions via ROS, payment processing, unlimited transactions, reporting, and expert support.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-blue-500 text-sm font-normal">
                    <CheckCircle className="h-4 w-4" />
                    <span>VAT calculations</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-500 text-sm font-normal">
                    <CheckCircle className="h-4 w-4" />
                    <span>ROS submissions</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-500 text-sm font-normal">
                    <CheckCircle className="h-4 w-4" />
                    <span>Payment processing</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-500 text-sm font-normal">
                    <CheckCircle className="h-4 w-4" />
                    <span>Unlimited transactions</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-500 text-sm font-normal">
                    <CheckCircle className="h-4 w-4" />
                    <span>VAT reporting</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-500 text-sm font-normal">
                    <CheckCircle className="h-4 w-4" />
                    <span>Expert support</span>
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
                <h3 className="text-lg font-normal text-foreground group-hover:text-primary transition-colors">
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
                  <div className="flex items-center gap-2 text-success text-sm font-normal">
                    <CheckCircle className="h-4 w-4" />
                    <span>AES-256 Encryption</span>
                  </div>
                  <div className="flex items-center gap-2 text-success text-sm font-normal">
                    <CheckCircle className="h-4 w-4" />
                    <span>GDPR Compliant</span>
                  </div>
                  <div className="flex items-center gap-2 text-success text-sm font-normal">
                    <CheckCircle className="h-4 w-4" />
                    <span>Multi-factor Auth</span>
                  </div>
                  <div className="flex items-center gap-2 text-success text-sm font-normal">
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
                <h3 className="text-lg font-normal text-foreground group-hover:text-primary transition-colors">
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
                      <span className="font-normal text-warning">Smart Reminders</span>
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
                <div className="icon-modern bg-petrol-light group-hover:scale-110 transition-transform duration-300">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-normal text-foreground group-hover:text-primary transition-colors">
                  Can I switch plans?
                </h3>
              </div>
              <div className="text-muted-foreground group-hover:text-primary transition-colors">
                {expandedItems.has(7) ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </div>
            {expandedItems.has(7) && (
              <div className="px-6 pb-6 animate-fade-in">
                <div className="w-full h-px bg-petrol-light/30 mb-4"></div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Yes—upgrade or downgrade at any time from your account settings. Changes to billing take effect at your next renewal date.
                </p>
                <div className="flex items-center gap-2 text-blue-500 font-normal">
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
                <h3 className="text-lg font-normal text-foreground group-hover:text-primary transition-colors">
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
                  We provide live chat and email support during business hours. Our comprehensive Help Center is always available for self-service support.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 card-modern hover-scale">
                    <div className="text-2xl font-normal text-primary mb-1">7 days</div>
                    <div className="text-sm text-muted-foreground">Live Chat & Email</div>
                  </div>
                  <div className="text-center p-4 card-modern hover-scale">
                    <div className="text-2xl font-normal text-primary mb-1">Always</div>
                    <div className="text-sm text-muted-foreground">Help Center</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="card-modern hover-lift group cursor-pointer transition-all duration-300" onClick={() => toggleExpanded(9)}>
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="icon-modern bg-petrol-light group-hover:scale-110 transition-transform duration-300">
                  <Building className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-normal text-foreground group-hover:text-primary transition-colors">
                  Do you offer business setup?
                </h3>
              </div>
              <div className="text-muted-foreground group-hover:text-primary transition-colors">
                {expandedItems.has(9) ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </div>
            {expandedItems.has(9) && (
              <div className="px-6 pb-6 animate-fade-in">
                <div className="w-full h-px bg-petrol-light/30 mb-4"></div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Yes, €500 complete package that handles everything from company registration to VAT setup, plus 6 months free VAT services.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-blue-500 text-sm font-normal">
                    <CheckCircle className="h-4 w-4" />
                    <span>Company registration</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-500 text-sm font-normal">
                    <CheckCircle className="h-4 w-4" />
                    <span>VAT setup</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-500 text-sm font-normal">
                    <CheckCircle className="h-4 w-4" />
                    <span>6 months free VAT services</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-500 text-sm font-normal">
                    <CheckCircle className="h-4 w-4" />
                    <span>Complete done-for-you service</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="card-modern hover-lift group cursor-pointer transition-all duration-300" onClick={() => toggleExpanded(10)}>
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="icon-modern bg-green-500 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-normal text-foreground group-hover:text-primary transition-colors">
                  Do you cover my industry?
                </h3>
              </div>
              <div className="text-muted-foreground group-hover:text-primary transition-colors">
                {expandedItems.has(10) ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </div>
            {expandedItems.has(10) && (
              <div className="px-6 pb-6 animate-fade-in">
                <div className="w-full h-px bg-green-500/30 mb-4"></div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We provide specialized guidance for most Irish business types including construction, e-commerce, freelancers, property rental, restaurants, retail, and digital services.
                </p>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="font-normal text-green-800">Freelancers</div>
                    <div className="text-xs text-green-600">VAT & setup guidance</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="font-normal text-green-800">E-commerce</div>
                    <div className="text-xs text-green-600">Online business rules</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="font-normal text-green-800">Construction</div>
                    <div className="text-xs text-green-600">RCT & VAT guidance</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="card-modern hover-lift group cursor-pointer transition-all duration-300" onClick={() => toggleExpanded(11)}>
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="icon-modern bg-petrol-light group-hover:scale-110 transition-transform duration-300">
                  <Calculator className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-normal text-foreground group-hover:text-primary transition-colors">
                  Do you have business tools and calculators?
                </h3>
              </div>
              <div className="text-muted-foreground group-hover:text-primary transition-colors">
                {expandedItems.has(11) ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </div>
            {expandedItems.has(11) && (
              <div className="px-6 pb-6 animate-fade-in">
                <div className="w-full h-px bg-petrol-light/30 mb-4"></div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Yes! We provide free business tools including a VAT calculator, VAT registration checker, and various business planning resources.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg border border-petrol-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Calculator className="h-4 w-4 text-petrol-base" />
                      <span className="font-normal text-petrol-dark">VAT Calculator</span>
                    </div>
                    <div className="text-xs text-petrol-base">Instant VAT calculations for Irish rates</div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-petrol-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Settings className="h-4 w-4 text-petrol-base" />
                      <span className="font-normal text-petrol-dark">Registration Checker</span>
                    </div>
                    <div className="text-xs text-petrol-base">Check if you need VAT registration</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="card-modern hover-lift group cursor-pointer transition-all duration-300" onClick={() => toggleExpanded(12)}>
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="icon-modern bg-petrol-light group-hover:scale-110 transition-transform duration-300">
                  <Euro className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-normal text-foreground group-hover:text-primary transition-colors">
                  How much does business guidance cost?
                </h3>
              </div>
              <div className="text-muted-foreground group-hover:text-primary transition-colors">
                {expandedItems.has(12) ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </div>
            {expandedItems.has(12) && (
              <div className="px-6 pb-6 animate-fade-in">
                <div className="w-full h-px bg-petrol-light/30 mb-4"></div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  All our business guides, tools, and resources are completely free to access. Our comprehensive library of 40+ guides costs nothing - we believe every Irish entrepreneur deserves access to quality business information.
                </p>
                <div className="flex items-center gap-2 text-blue-500 font-normal">
                  <CheckCircle className="h-4 w-4" />
                  <span>100% free business guidance and resources</span>
                </div>
              </div>
            )}
          </div>

          {/* New VAT-Specific FAQs */}
          <div className="card-modern hover-lift group cursor-pointer transition-all duration-300" onClick={() => toggleExpanded(15)}>
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="icon-modern bg-warning group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-normal text-foreground group-hover:text-primary transition-colors">
                  What are the VAT filing deadlines in Ireland?
                </h3>
              </div>
              <div className="text-muted-foreground group-hover:text-primary transition-colors">
                {expandedItems.has(15) ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </div>
            {expandedItems.has(15) && (
              <div className="px-6 pb-6 animate-fade-in">
                <div className="w-full h-px bg-warning/30 mb-4"></div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  VAT returns are due on the 19th of the second month following each period. For example, January-February returns are due March 19th. Annual returns (if applicable) are due November 19th.
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
                    <div className="font-normal text-warning-foreground mb-1">Bi-monthly Returns</div>
                    <div className="text-xs text-muted-foreground">Due 19th of second month after period</div>
                  </div>
                  <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
                    <div className="font-normal text-warning-foreground mb-1">Annual Returns</div>
                    <div className="text-xs text-muted-foreground">Due November 19th (if eligible)</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="card-modern hover-lift group cursor-pointer transition-all duration-300" onClick={() => toggleExpanded(16)}>
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="icon-modern bg-success group-hover:scale-110 transition-transform duration-300">
                  <Euro className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-normal text-foreground group-hover:text-primary transition-colors">
                  What are the current VAT rates in Ireland?
                </h3>
              </div>
              <div className="text-muted-foreground group-hover:text-primary transition-colors">
                {expandedItems.has(16) ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </div>
            {expandedItems.has(16) && (
              <div className="px-6 pb-6 animate-fade-in">
                <div className="w-full h-px bg-success/30 mb-4"></div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Ireland has three main VAT rates. PayVAT automatically applies the correct rate based on your goods or services.
                </p>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="text-center p-4 bg-success/10 rounded-lg border border-success/20">
                    <div className="text-2xl font-normal text-success mb-1">23%</div>
                    <div className="font-normal text-success-foreground mb-1">Standard Rate</div>
                    <div className="text-xs text-muted-foreground">Most goods & services</div>
                  </div>
                  <div className="text-center p-4 bg-success/10 rounded-lg border border-success/20">
                    <div className="text-2xl font-normal text-success mb-1">13.5%</div>
                    <div className="font-normal text-success-foreground mb-1">Reduced Rate</div>
                    <div className="text-xs text-muted-foreground">Tourism, energy, some food</div>
                  </div>
                  <div className="text-center p-4 bg-success/10 rounded-lg border border-success/20">
                    <div className="text-2xl font-normal text-success mb-1">0%</div>
                    <div className="font-normal text-success-foreground mb-1">Zero Rate</div>
                    <div className="text-xs text-muted-foreground">Books, medicine, exports</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="card-modern hover-lift group cursor-pointer transition-all duration-300" onClick={() => toggleExpanded(17)}>
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="icon-modern bg-primary group-hover:scale-110 transition-transform duration-300">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-normal text-foreground group-hover:text-primary transition-colors">
                  What documents do I need for VAT returns?
                </h3>
              </div>
              <div className="text-muted-foreground group-hover:text-primary transition-colors">
                {expandedItems.has(17) ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </div>
            {expandedItems.has(17) && (
              <div className="px-6 pb-6 animate-fade-in">
                <div className="w-full h-px bg-primary/30 mb-4"></div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  PayVAT's AI processes your invoices, receipts, and expense documents automatically. Simply upload your documents and we handle the rest.
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-primary">
                    <CheckCircle className="h-4 w-4" />
                    <span>Sales invoices</span>
                  </div>
                  <div className="flex items-center gap-2 text-primary">
                    <CheckCircle className="h-4 w-4" />
                    <span>Purchase receipts</span>
                  </div>
                  <div className="flex items-center gap-2 text-primary">
                    <CheckCircle className="h-4 w-4" />
                    <span>Expense documents</span>
                  </div>
                  <div className="flex items-center gap-2 text-primary">
                    <CheckCircle className="h-4 w-4" />
                    <span>Import/export documents</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="card-modern hover-lift group cursor-pointer transition-all duration-300" onClick={() => toggleExpanded(18)}>
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="icon-modern bg-destructive group-hover:scale-110 transition-transform duration-300">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-normal text-foreground group-hover:text-primary transition-colors">
                  What happens if I miss a VAT deadline?
                </h3>
              </div>
              <div className="text-muted-foreground group-hover:text-primary transition-colors">
                {expandedItems.has(18) ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </div>
            {expandedItems.has(18) && (
              <div className="px-6 pb-6 animate-fade-in">
                <div className="w-full h-px bg-destructive/30 mb-4"></div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Revenue Ireland imposes penalties for late VAT returns. PayVAT's automated reminders and submissions help you avoid these costly penalties entirely.
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                    <div className="font-normal text-destructive-foreground mb-1">Late Filing</div>
                    <div className="text-xs text-muted-foreground">€4 per day (min €125, max €1,520)</div>
                  </div>
                  <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                    <div className="font-normal text-destructive-foreground mb-1">Late Payment</div>
                    <div className="text-xs text-muted-foreground">Interest at 0.0274% per day</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="card-premium hover-lift group cursor-pointer transition-all duration-300" onClick={() => toggleExpanded(19)}>
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="icon-premium group-hover:scale-110 transition-transform duration-300">
                  <Building className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-normal text-foreground group-hover:text-primary transition-colors">
                  Do I need to register for VAT if I'm a sole trader?
                </h3>
              </div>
              <div className="text-muted-foreground group-hover:text-primary transition-colors">
                {expandedItems.has(19) ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </div>
            {expandedItems.has(19) && (
              <div className="px-6 pb-6 animate-fade-in">
                <div className="w-full h-px gradient-primary mb-4"></div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Yes, VAT registration thresholds apply to all business structures including sole traders. If your annual turnover exceeds €42,500 (services) or €85,000 (goods), you must register.
                </p>
                <div className="flex items-center gap-2 text-primary font-normal">
                  <CheckCircle className="h-4 w-4" />
                  <span>Use our free VAT registration checker to find out if you need to register</span>
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
                <div className="mb-4">
                  <div className="icon-premium mb-3 mx-auto">
                    <HelpCircle className="h-12 w-12 text-white" />
                  </div>
                  
                  <h3 className="text-3xl lg:text-4xl font-normal text-foreground mb-3">
                    Still Have <span className="text-gradient-primary">Questions?</span>
                  </h3>
                  <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Our support team is here to help you get started with PayVAT
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-2">
                  <Button 
                    size="lg"
                    className="btn-primary px-12 py-4 text-lg font-normal hover-lift min-w-[220px]"
                  >
                    Contact Support
                    <HelpCircle className="ml-2 h-5 w-5" />
                  </Button>
                  <Button 
                    variant="outline"
                    size="lg"
                    className="btn-outline px-12 py-4 text-lg min-w-[220px]"
                    onClick={() => window.location.href = '/about'}
                  >
                    Contact Us
                    <CheckCircle className="ml-2 h-5 w-5" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-center gap-8 text-muted-foreground text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-success" />
                    <span>Live chat & email 7 days; phone Mon–Fri, 09:00–17:00 Ireland time</span>
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

      {/* Footer */}
      <Footer />
    </div>
  )
}