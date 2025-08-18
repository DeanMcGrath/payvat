"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Clock, Users, Target, CheckCircle, Euro, Award, ChevronRight, TrendingUp, ArrowRight, Bell, FileText, Building, UserCheck, AlertTriangle, Calculator, Calendar, Globe, Settings } from 'lucide-react'
import Footer from "@/components/footer"
import SiteHeader from "@/components/site-header"

export default function StartABusinessIreland() {
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
        searchPlaceholder="Search business startup guides..."
        currentPage="Start a Business Ireland"
        pageSubtitle="Complete guide to starting your business in Ireland"
      />


      <div className="max-w-7xl mx-auto px-6 content-after-header pb-8">

        {/* Quick Start Roadmap */}
        <section className="py-20" data-animate>
          <div className="card-premium p-12 mb-2 hover-lift">
            <div className="text-center mb-2">
              <div className="icon-premium mb-3 mx-auto">
                <Target className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Your Business Launch <span className="text-gradient-primary">Roadmap</span>
              </h2>
              <div className="w-24 h-1 gradient-primary mx-auto mb-4 rounded-full"></div>
            </div>
            
            <div className="max-w-6xl mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 text-center">
                Follow this proven roadmap used by successful Irish businesses. Each phase builds on the previous one.
              </p>
              
              <div className="grid lg:grid-cols-4 gap-6">
                <div className="card-modern p-6 hover-lift text-center">
                  <div className="icon-modern bg-blue-500 mb-4 mx-auto">
                    <Settings className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">1. Planning</h3>
                  <p className="text-sm text-muted-foreground mb-3">Business idea validation, market research, business plan</p>
                  <div className="text-xs text-blue-600 font-medium">Weeks 1-2</div>
                </div>

                <div className="card-modern p-6 hover-lift text-center">
                  <div className="icon-modern bg-green-500 mb-4 mx-auto">
                    <Building className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">2. Structure</h3>
                  <p className="text-sm text-muted-foreground mb-3">Choose structure, register business, open accounts</p>
                  <div className="text-xs text-green-600 font-medium">Weeks 3-4</div>
                </div>

                <div className="card-modern p-6 hover-lift text-center">
                  <div className="icon-modern bg-purple-500 mb-4 mx-auto">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">3. Compliance</h3>
                  <p className="text-sm text-muted-foreground mb-3">Tax registration, VAT setup, insurance, licences</p>
                  <div className="text-xs text-purple-600 font-medium">Weeks 5-6</div>
                </div>

                <div className="card-modern p-6 hover-lift text-center">
                  <div className="icon-modern bg-warning mb-4 mx-auto">
                    <ChevronRight className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">4. Launch</h3>
                  <p className="text-sm text-muted-foreground mb-3">Marketing, first customers, operations, growth</p>
                  <div className="text-xs text-yellow-600 font-medium">Weeks 7-8</div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-green-50 rounded-lg border-l-4 border-green-500">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-800 mb-1">Fast Track with PayVat</h4>
                    <p className="text-sm text-green-700">
                      PayVat customers complete setup 50% faster by automating compliance steps. 
                      Focus on business building while we handle the bureaucracy.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Business Structure Decision */}
        <section className="py-20" data-animate>
          <div className="card-modern p-12 mb-2 hover-lift">
            <div className="text-center mb-2">
              <div className="icon-modern bg-primary mb-3 mx-auto">
                <Building className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Choose Your <span className="text-gradient-primary">Business Structure</span>
              </h2>
              <div className="w-24 h-1 bg-primary mx-auto mb-4 rounded-full"></div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 text-center">
                Your business structure affects liability, taxes, credibility, and growth options. Choose wisely from day one.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="card-modern p-8 hover-lift border-l-4 border-orange-500">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="icon-modern bg-orange-500">
                      <UserCheck className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">Sole Trader</h3>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Start trading immediately</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Minimal setup costs (€0-50)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Simple tax returns</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Keep all profits</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">Unlimited personal liability</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">Harder to raise investment</span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-orange-800">
                      <strong>Best for:</strong> Service providers, consultants, freelancers, low-risk businesses
                    </p>
                  </div>
                </div>

                <div className="card-modern p-8 hover-lift border-l-4 border-blue-500">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="icon-modern bg-blue-500">
                      <Building className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">Limited Company</h3>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Limited liability protection</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Professional credibility</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Tax planning opportunities</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Easier to raise finance</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">More complex setup (€125-200)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Annual compliance requirements</span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Best for:</strong> Growth businesses, multiple shareholders, higher risk activities, investment plans
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <Button 
                  size="lg"
                  className="btn-primary px-8 py-3 text-lg font-semibold hover-lift"
                  onClick={() => window.location.href = '/company-vs-sole-trader-ireland'}
                >
                  Compare Structures in Detail
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Registration & Setup Process */}
        <section className="py-20" data-animate>
          <div className="card-premium p-12 mb-2 hover-lift">
            <div className="text-center mb-2">
              <div className="icon-premium mb-3 mx-auto">
                <FileText className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Registration & <span className="text-gradient-primary">Setup Process</span>
              </h2>
              <div className="w-24 h-1 gradient-primary mx-auto mb-4 rounded-full"></div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 text-center">
                Step-by-step process to get your business legally established and ready to trade.
              </p>
              
              <div className="space-y-8">
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-full bg-primary text-white text-lg flex items-center justify-center font-semibold flex-shrink-0">1</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-3">Business Name & Structure</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-foreground mb-2">For Sole Traders:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Choose trading name (optional)</li>
                          <li>• Check domain availability</li>
                          <li>• Register trademark if needed</li>
                          <li>• Start trading immediately</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground mb-2">For Companies:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Reserve company name (€25)</li>
                          <li>• Prepare incorporation documents</li>
                          <li>• Submit to CRO (€100)</li>
                          <li>• Receive company number (7-10 days)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-full bg-primary text-white text-lg flex items-center justify-center font-semibold flex-shrink-0">2</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-3">Tax Registration</h3>
                    <div className="space-y-4">
                      <div className="p-4 card-modern">
                        <h4 className="font-medium text-foreground mb-2">Essential Registrations:</h4>
                        <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <ul className="space-y-1">
                            <li>• Tax Reference Number (TRN)</li>
                            <li>• VAT registration (if required)</li>
                            <li>• Revenue Online Service (ROS)</li>
                          </ul>
                          <ul className="space-y-1">
                            <li>• Employer PRSI (if hiring)</li>
                            <li>• Corporation tax (companies)</li>
                            <li>• Professional body registration</li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                        <h4 className="font-semibold text-yellow-800 mb-2">VAT Registration Trigger Points</h4>
                        <p className="text-sm text-yellow-700">
                          Must register when turnover exceeds <strong>€42,500 (services)</strong> or <strong>€85,000 (goods)</strong> 
                          in any 12-month period. Many register early for credibility and to reclaim startup VAT.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-full bg-primary text-white text-lg flex items-center justify-center font-semibold flex-shrink-0">3</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-3">Banking & Finance</h3>
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 card-modern">
                          <h4 className="font-medium text-foreground mb-2">Business Bank Account</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Separate business finances</li>
                            <li>• Professional appearance</li>
                            <li>• Easier VAT compliance</li>
                            <li>• Business credit building</li>
                          </ul>
                        </div>
                        <div className="p-4 card-modern">
                          <h4 className="font-medium text-foreground mb-2">Required Documents</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• ID and address proof</li>
                            <li>• Tax Reference Number</li>
                            <li>• Business plan/projections</li>
                            <li>• Initial deposit (varies)</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-full bg-primary text-white text-lg flex items-center justify-center font-semibold flex-shrink-0">4</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-3">Insurance & Protection</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 card-modern">
                        <h4 className="font-medium text-foreground mb-2">Essential Insurance</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Public liability (€2M minimum)</li>
                          <li>• Professional indemnity</li>
                          <li>• Employer liability (if hiring)</li>
                          <li>• Business interruption</li>
                        </ul>
                      </div>
                      <div className="p-4 card-modern">
                        <h4 className="font-medium text-foreground mb-2">Optional but Recommended</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Equipment insurance</li>
                          <li>• Cyber liability insurance</li>
                          <li>• Directors & officers (companies)</li>
                          <li>• Key person life insurance</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* First 90 Days Success Plan */}
        <section className="py-20" data-animate>
          <div className="card-modern p-12 mb-2 hover-lift">
            <div className="text-center mb-2">
              <div className="icon-modern bg-success mb-3 mx-auto">
                <Calendar className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                First 90 Days <span className="text-gradient-primary">Success Plan</span>
              </h2>
              <div className="w-24 h-1 bg-primary mx-auto mb-4 rounded-full"></div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 text-center">
                Critical milestones to hit in your first 90 days to set your business up for long-term success.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="card-modern p-6 hover-lift">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-semibold">30</div>
                    Days 1-30: Foundation
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Complete legal setup</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Open business accounts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Get essential insurance</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Set up basic systems</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Create PayVat account</span>
                    </div>
                  </div>
                </div>

                <div className="card-modern p-6 hover-lift">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-semibold">60</div>
                    Days 31-60: Launch
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Launch marketing campaigns</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Acquire first customers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Generate initial revenue</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Refine operations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Build online presence</span>
                    </div>
                  </div>
                </div>

                <div className="card-modern p-6 hover-lift">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center font-semibold">90</div>
                    Days 61-90: Scale
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Analyze performance data</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Optimize processes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Plan growth strategies</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Consider VAT registration</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Review legal compliance</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Common Startup Mistakes */}
        <section className="py-20" data-animate>
          <div className="card-premium p-12 mb-2 hover-lift">
            <div className="text-center mb-2">
              <div className="icon-premium mb-3 mx-auto" style={{background: 'linear-gradient(to bottom right, #dc2626, #991b1b)'}}>
                <AlertTriangle className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Common Startup <span className="text-gradient-primary">Mistakes</span>
              </h2>
              <div className="w-24 h-1 bg-red-500 mx-auto mb-4 rounded-full"></div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 text-center">
                Learn from others' mistakes. These are the most expensive errors new Irish businesses make.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-red-500 text-white text-sm flex items-center justify-center font-semibold">1</div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Choosing wrong business structure</h4>
                      <p className="text-sm text-muted-foreground">Switching later is expensive and complex. Consider liability, growth plans, and tax implications carefully.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-red-500 text-white text-sm flex items-center justify-center font-semibold">2</div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Mixing personal and business finances</h4>
                      <p className="text-sm text-muted-foreground">Makes accounting nightmare, VAT compliance impossible, and reduces credibility with banks.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-red-500 text-white text-sm flex items-center justify-center font-semibold">3</div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Delaying VAT registration</h4>
                      <p className="text-sm text-muted-foreground">Late registration triggers penalties up to €12,695 plus back-dated VAT liability.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-red-500 text-white text-sm flex items-center justify-center font-semibold">4</div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Poor record keeping from start</h4>
                      <p className="text-sm text-muted-foreground">Missing receipts, no invoice system, poor filing makes compliance expensive and stressful.</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-red-500 text-white text-sm flex items-center justify-center font-semibold">5</div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Inadequate insurance coverage</h4>
                      <p className="text-sm text-muted-foreground">One lawsuit or accident can destroy an uninsured business. Get proper coverage from day one.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-red-500 text-white text-sm flex items-center justify-center font-semibold">6</div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Ignoring legal compliance</h4>
                      <p className="text-sm text-muted-foreground">Missing deadlines, wrong tax rates, no data protection compliance can trigger investigations.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-red-500 text-white text-sm flex items-center justify-center font-semibold">7</div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Underpricing services/products</h4>
                      <p className="text-sm text-muted-foreground">Not accounting for all costs (including VAT, insurance, taxes) leads to unprofitable businesses.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-red-500 text-white text-sm flex items-center justify-center font-semibold">8</div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">No business plan or projections</h4>
                      <p className="text-sm text-muted-foreground">Banks won't lend, investors won't invest, and you can't plan growth without proper financials.</p>
                    </div>
                  </div>
                </div>
              </div>
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
                    Ready to <span className="text-gradient-primary">Start Your Business?</span>
                  </h3>
                  <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    Join successful Irish entrepreneurs. Get your business setup right from day one with PayVat's comprehensive support.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-2">
                  <Button 
                    size="lg"
                    className="btn-primary px-12 py-4 text-lg font-semibold hover-lift min-w-[220px]"
                    onClick={() => window.location.href = '/signup'}
                  >
                    Start Your Business
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button 
                    variant="outline"
                    size="lg"
                    className="btn-outline px-12 py-4 text-lg min-w-[220px]"
                    onClick={() => window.location.href = '/complete-business-setup-guide-ireland'}
                  >
                    Detailed Setup Guide
                    <FileText className="ml-2 h-5 w-5" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-center gap-8 text-muted-foreground text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span>14-day free trial</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-success" />
                    <span>Complete guidance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-success" />
                    <span>Launch in weeks</span>
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
              <a href="/complete-business-setup-guide-ireland" className="text-primary hover:underline">Complete setup guide</a>
              <a href="/company-vs-sole-trader-ireland" className="text-primary hover:underline">Company vs sole trader</a>
              <a href="/register-business-name-ireland" className="text-primary hover:underline">Business registration</a>
              <a href="/how-to-register-for-vat-ireland" className="text-primary hover:underline">VAT registration</a>
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
