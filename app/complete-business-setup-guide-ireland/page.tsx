"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Clock, Users, Target, CheckCircle, Euro, Award, ChevronRight, TrendingUp, ArrowRight, Bell, FileText, Building, UserCheck, CreditCard } from 'lucide-react'
import Footer from "@/components/footer"
import SiteHeader from "@/components/site-header"

export default function CompleteBusinessSetupGuideIreland() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)

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
    handleScroll()

    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader 
        searchPlaceholder="Search business setup guides..."
        currentPage="Complete Business Setup Guide Ireland"
        pageSubtitle="Everything you need to start your Irish business"
      />



      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Quick Start Checklist */}
        <section className="py-20" data-animate>
          <div className="card-premium p-12 mb-2 hover-lift">
            <div className="text-center mb-2">
              <div className="icon-premium mb-3 mx-auto">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Your <span className="text-gradient-primary">90-Day Launch Plan</span>
              </h2>
              <div className="w-24 h-1 gradient-primary mx-auto mb-4 rounded-full"></div>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="card-modern p-6 hover-lift">
                <div className="icon-modern bg-[#0072B1] mb-4">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Days 1-30: Foundation</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Choose business structure</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Register business name</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Get Tax Reference Number</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Open business bank account</span>
                  </li>
                </ul>
              </div>

              <div className="card-modern p-6 hover-lift">
                <div className="icon-modern bg-green-500 mb-4">
                  <UserCheck className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Days 31-60: Registration</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Register for VAT (if required)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Set up ROS access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Complete compliance setup</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Register for employer PRSI</span>
                  </li>
                </ul>
              </div>

              <div className="card-modern p-6 hover-lift">
                <div className="icon-modern bg-[#0072B1] mb-4">
                  <ChevronRight className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Days 61-90: Launch Ready</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Accounting Software - Coming Soon</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Create PayVat account</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Launch marketing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>Make first sale</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Step 1: Choose Your Business Structure */}
        <section className="py-20" data-animate>
          <div className="card-modern p-12 mb-2 hover-lift">
            <div className="text-center mb-2">
              <div className="icon-modern bg-primary mb-3 mx-auto">
                <Building className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Step 1: Choose Your <span className="text-gradient-primary">Business Structure</span>
              </h2>
              <div className="w-24 h-1 bg-primary mx-auto mb-4 rounded-full"></div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 text-center">
                Your business structure affects everything from liability to taxes. Choose wisely—it's easier to start right than change later.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="card-modern p-8 hover-lift border-l-4 border-green-500">
                  <h3 className="text-xl font-semibold text-foreground mb-3">Sole Trader</h3>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Quick setup (24-48 hours)</span>
                    </div>
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Lower admin burden</span>
                    </div>
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Keep all profits</span>
                    </div>
                  </div>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-destructive">
                      <span className="w-4 h-4 rounded-full bg-destructive flex items-center justify-center text-white text-xs">!</span>
                      <span className="text-sm">Unlimited personal liability</span>
                    </div>
                    <div className="flex items-center gap-2 text-destructive">
                      <span className="w-4 h-4 rounded-full bg-destructive flex items-center justify-center text-white text-xs">!</span>
                      <span className="text-sm">Limited credibility with suppliers</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <strong>Best for:</strong> Service providers, consultants, freelancers with low risk
                  </p>
                </div>

                <div className="card-modern p-8 hover-lift border-l-4 border-primary">
                  <h3 className="text-xl font-semibold text-foreground mb-3">Limited Company</h3>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Limited liability protection</span>
                    </div>
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Professional credibility</span>
                    </div>
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Tax planning opportunities</span>
                    </div>
                  </div>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-warning">
                      <span className="w-4 h-4 rounded-full bg-warning flex items-center justify-center text-white text-xs">!</span>
                      <span className="text-sm">More complex setup (7-10 days)</span>
                    </div>
                    <div className="flex items-center gap-2 text-warning">
                      <span className="w-4 h-4 rounded-full bg-warning flex items-center justify-center text-white text-xs">!</span>
                      <span className="text-sm">Annual CRO filings required</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <strong>Best for:</strong> Growth-focused businesses, multiple shareholders, higher risk activities
                  </p>
                </div>
              </div>
              
              <div className="mt-8 p-6 card-modern bg-blue-50 border-l-4 border-[#0085D1]">
                <h4 className="font-semibold text-foreground mb-2">VAT Consideration</h4>
                <p className="text-muted-foreground text-sm">
                  Both structures must register for VAT when turnover exceeds <strong>€42,500 (services)</strong> or <strong>€85,000 (goods)</strong> in any 12-month period. 
                  Many businesses register early to reclaim input VAT on startup costs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Step 2: Register Your Business */}
        <section className="py-20" data-animate>
          <div className="card-premium p-12 mb-2 hover-lift">
            <div className="text-center mb-2">
              <div className="icon-premium mb-3 mx-auto">
                <FileText className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Step 2: Register Your <span className="text-gradient-primary">Business</span>
              </h2>
              <div className="w-24 h-1 gradient-primary mx-auto mb-4 rounded-full"></div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">Business Name Registration</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-semibold">1</div>
                      <div>
                        <p className="font-medium text-foreground">Check name availability</p>
                        <p className="text-sm text-muted-foreground">Search the CRO database for existing names</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-semibold">2</div>
                      <div>
                        <p className="font-medium text-foreground">Reserve your name</p>
                        <p className="text-sm text-muted-foreground">Valid for 28 days</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-semibold">3</div>
                      <div>
                        <p className="font-medium text-foreground">Complete incorporation</p>
                        <p className="text-sm text-muted-foreground">Submit Form A1 with required documents</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">Required Documents</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Memorandum and Articles of Association</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Form A1 (incorporation application)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Director and secretary details</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Statement of compliance</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Registered office address</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <p className="text-sm text-green-800">
                      <strong>PayVat helps:</strong> We can guide you through business registration and set up your VAT obligations simultaneously—saving time and ensuring compliance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Step 3: Tax Registration */}
        <section className="py-20" data-animate>
          <div className="card-modern p-12 mb-2 hover-lift">
            <div className="text-center mb-2">
              <div className="icon-modern bg-success mb-3 mx-auto">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Step 3: Tax <span className="text-gradient-primary">Registration</span>
              </h2>
              <div className="w-24 h-1 bg-primary mx-auto mb-4 rounded-full"></div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="card-modern p-6 hover-lift text-center">
                  <div className="icon-modern bg-[#0072B1] mb-4 mx-auto">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Tax Reference Number</h3>
                  <p className="text-sm text-muted-foreground mb-4">Essential for all tax obligations</p>
                  <div className="text-xs text-muted-foreground">
                    Apply through Revenue's MyAccount or Form TR1/TR2
                  </div>
                </div>

                <div className="card-modern p-6 hover-lift text-center">
                  <div className="icon-modern bg-green-500 mb-4 mx-auto">
                    <Euro className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">VAT Registration</h3>
                  <p className="text-sm text-muted-foreground mb-4">When turnover exceeds thresholds</p>
                  <div className="text-xs text-muted-foreground">
                    €42,500 services / €85,000 goods
                  </div>
                </div>

                <div className="card-modern p-6 hover-lift text-center">
                  <div className="icon-modern bg-[#0072B1] mb-4 mx-auto">
                    <UserCheck className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">ROS Access</h3>
                  <p className="text-sm text-muted-foreground mb-4">Online tax filing system</p>
                  <div className="text-xs text-muted-foreground">
                    Digital certificate required
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 card-premium bg-gradient-to-r from-blue-50 to-blue-50">
                <h4 className="font-semibold text-foreground mb-3 text-center">Early VAT Registration Benefits</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Reclaim VAT on startup costs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Professional credibility</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Avoid registration delays</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">Better cash flow management</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Step 4: Banking & Finance */}
        <section className="py-20" data-animate>
          <div className="card-modern p-12 mb-2 hover-lift">
            <div className="text-center mb-2">
              <div className="icon-modern bg-warning mb-3 mx-auto">
                <CreditCard className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Step 4: Banking & <span className="text-gradient-primary">Finance</span>
              </h2>
              <div className="w-24 h-1 bg-primary mx-auto mb-4 rounded-full"></div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 text-center">
                Separate business and personal finances from day one. It makes accounting, VAT management, and tax compliance infinitely easier.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">Business Bank Account Requirements</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Certificate of incorporation (companies)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Tax Reference Number</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Director/owner identification</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Proof of business address</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Business plan (some banks)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">Account Features to Consider</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Euro className="h-4 w-4 text-primary" />
                      <span className="text-sm">Monthly fees and transaction limits</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Euro className="h-4 w-4 text-primary" />
                      <span className="text-sm">Online banking and mobile apps</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Euro className="h-4 w-4 text-primary" />
                      <span className="text-sm">Direct debit facilities</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Euro className="h-4 w-4 text-primary" />
                      <span className="text-sm">International payment options</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Euro className="h-4 w-4 text-primary" />
                      <span className="text-sm">Integration with accounting software</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Common Mistakes to Avoid */}
        <section className="py-20" data-animate>
          <div className="card-premium p-12 mb-2 hover-lift">
            <div className="text-center mb-2">
              <div className="icon-premium mb-3 mx-auto">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Common Mistakes <span className="text-gradient-primary">to Avoid</span>
              </h2>
              <div className="w-24 h-1 gradient-primary mx-auto mb-4 rounded-full"></div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-destructive text-white text-sm flex items-center justify-center font-semibold">1</div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Leaving VAT registration too late</h4>
                      <p className="text-sm text-muted-foreground">Can result in back-dated liabilities and penalties</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-destructive text-white text-sm flex items-center justify-center font-semibold">2</div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Mixing personal and business finances</h4>
                      <p className="text-sm text-muted-foreground">Makes accounting and VAT compliance extremely difficult</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-destructive text-white text-sm flex items-center justify-center font-semibold">3</div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Poor record keeping from day one</h4>
                      <p className="text-sm text-muted-foreground">Digital receipts and systematic filing prevent future headaches</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-destructive text-white text-sm flex items-center justify-center font-semibold">4</div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Ignoring compliance deadlines</h4>
                      <p className="text-sm text-muted-foreground">Set up reminders for VAT, company filings, and tax payments</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-destructive text-white text-sm flex items-center justify-center font-semibold">5</div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Not planning for growth</h4>
                      <p className="text-sm text-muted-foreground">Consider future needs when choosing structure and systems</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-destructive text-white text-sm flex items-center justify-center font-semibold">6</div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Not setting up proper systems</h4>
                      <p className="text-sm text-muted-foreground">Establish accounting and compliance systems from the start</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Complete Startup Package Section */}
        <section id="contact-form" className="py-20 bg-[#0072B1]">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <div className="text-center text-white mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Complete Startup Guide For FREE!
              </h2>
              <p className="text-xl leading-relaxed">
                Learn how to setup your Business from start to finish!
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-2xl">
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0072B1] focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0072B1] focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0072B1] focus:border-transparent"
                      placeholder="+353..."
                    />
                  </div>
                  <div>
                    <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-2">
                      Business Type *
                    </label>
                    <select
                      id="businessType"
                      name="businessType"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0072B1] focus:border-transparent"
                    >
                      <option value="">Select business type</option>
                      <option value="sole-trader">Sole Trader</option>
                      <option value="limited-company">Limited Company</option>
                      <option value="not-sure">Not Sure Yet</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="currentStage" className="block text-sm font-medium text-gray-700 mb-2">
                    Current Stage *
                  </label>
                  <select
                    id="currentStage"
                    name="currentStage"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0072B1] focus:border-transparent"
                  >
                    <option value="">Select current stage</option>
                    <option value="just-starting">Just Starting</option>
                    <option value="name-registered">Name Registered</option>
                    <option value="need-vat-number">Need VAT Number</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message/Additional Information
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0072B1] focus:border-transparent"
                    placeholder="Tell us about your business goals or any specific requirements..."
                  ></textarea>
                </div>
                
                <div className="text-center">
                  <Button
                    type="submit"
                    size="lg"
                    className="bg-[#0072B1] hover:bg-[#005A91] text-white px-12 py-4 text-lg font-semibold"
                  >
                    Get Your FREE Guide
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <div className="card-premium p-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 gradient-mesh opacity-10"></div>
              
              <div className="relative z-10">
                <div className="mb-4">
                  <div className="icon-premium mb-3 mx-auto">
                    <Target className="h-12 w-12 text-white" />
                  </div>
                  
                  <h3 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">
                    Ready to <span className="text-gradient-primary">Launch Your Business?</span>
                  </h3>
                  <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    Join Irish entrepreneurs who trust PayVat for their business setup and ongoing VAT compliance.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-2">
                  <Button 
                    size="lg"
                    className="btn-primary px-12 py-4 text-lg font-semibold hover-lift min-w-[220px]"
                    onClick={() => window.location.href = '/signup'}
                  >
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button 
                    variant="outline"
                    size="lg"
                    className="btn-outline px-12 py-4 text-lg min-w-[220px]"
                    onClick={() => window.location.href = '/pricing'}
                  >
                    View Pricing
                    <Euro className="ml-2 h-5 w-5" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-center gap-8 text-muted-foreground text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>14-day free trial</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-success" />
                    <span>No setup fees</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-success" />
                    <span>Cancel anytime</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Links */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto">
            <p className="text-center text-sm text-muted-foreground mb-4">Related guides:</p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <a href="/register-business-name-ireland" className="text-primary hover:underline">Business name registration</a>
              <a href="/company-vs-sole-trader-ireland" className="text-primary hover:underline">Company vs sole trader</a>
              <a href="/how-to-register-for-vat-ireland" className="text-primary hover:underline">VAT registration</a>
              <a href="/vat-deadlines-ireland" className="text-primary hover:underline">VAT deadlines</a>
              <a href="/pricing" className="text-primary hover:underline">Pricing</a>
            </div>
          </div>
        </section>

        <p className="text-center text-xs text-muted-foreground">Last updated: August 12, 2025</p>
      </div>

      <Footer />
    </div>
  )
}
