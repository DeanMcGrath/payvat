"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Clock, Users, Target, CheckCircle, Euro, Award, ChevronRight, TrendingUp, ArrowRight, Bell, FileText, Building, UserCheck, Calculator, DollarSign, Minus, Plus } from 'lucide-react'
import Footer from "@/components/footer"
import SiteHeader from "@/components/site-header"

export default function AccountantFeesVsPayVatSavings() {
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
        searchPlaceholder="Search cost comparisons..."
        currentPage="Accountant Fees vs PayVat Savings"
        pageSubtitle="Compare real costs and take control of your VAT compliance"
      />


      <div className="max-w-7xl mx-auto px-6 content-after-header pb-8">

        {/* Annual Cost Comparison */}
        <section className="py-20" data-animate>
          <div className="card-premium p-12 mb-2 hover-lift">
            <div className="text-center mb-2">
              <div className="icon-premium mb-3 mx-auto">
                <Euro className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Annual Cost <span className="text-gradient-primary">Comparison</span>
              </h2>
              <div className="w-24 h-1 gradient-primary mx-auto mb-4 rounded-full"></div>
            </div>
            
            <div className="max-w-6xl mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 text-center">
                Based on surveys of 500+ Irish SMEs and current market rates for VAT compliance services.
              </p>
              
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="card-modern p-8 hover-lift border-l-4 border-red-500">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-foreground mb-2">Traditional Accountant</h3>
                    <div className="text-4xl font-bold text-red-600 mb-2">€4,560</div>
                    <div className="text-sm text-muted-foreground">per year average</div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                      <span className="text-sm font-medium">VAT return preparation (6x)</span>
                      <span className="text-sm font-semibold text-red-600">€1,800</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                      <span className="text-sm font-medium">VAT return filing (6x)</span>
                      <span className="text-sm font-semibold text-red-600">€900</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                      <span className="text-sm font-medium">Annual VAT summary</span>
                      <span className="text-sm font-semibold text-red-600">€450</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                      <span className="text-sm font-medium">Ad hoc VAT advice</span>
                      <span className="text-sm font-semibold text-red-600">€600</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                      <span className="text-sm font-medium">Penalty insurance/corrections</span>
                      <span className="text-sm font-semibold text-red-600">€300</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                      <span className="text-sm font-medium">Record review/organization</span>
                      <span className="text-sm font-semibold text-red-600">€510</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-red-100 rounded-lg">
                    <div className="flex items-center gap-2 text-red-800">
                      <Minus className="h-4 w-4" />
                      <span className="text-sm font-semibold">Hidden Costs:</span>
                    </div>
                    <ul className="text-xs text-red-700 mt-2 space-y-1">
                      <li>• Waiting for accountant availability</li>
                      <li>• No real-time compliance monitoring</li>
                      <li>• Limited visibility into process</li>
                      <li>• Potential late filing penalties</li>
                    </ul>
                  </div>
                </div>

                <div className="card-modern p-8 hover-lift border-l-4 border-green-500">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-foreground mb-2">PayVat Platform</h3>
                    <div className="text-4xl font-bold text-green-600 mb-2">€360</div>
                    <div className="text-sm text-muted-foreground">per year</div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                      <span className="text-sm font-medium">Unlimited VAT calculations</span>
                      <span className="text-sm font-semibold text-green-600">Included</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                      <span className="text-sm font-medium">Automated ROS filing</span>
                      <span className="text-sm font-semibold text-green-600">Included</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                      <span className="text-sm font-medium">Real-time compliance monitoring</span>
                      <span className="text-sm font-semibold text-green-600">Included</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                      <span className="text-sm font-medium">VAT advice and support</span>
                      <span className="text-sm font-semibold text-green-600">Included</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                      <span className="text-sm font-medium">Penalty protection guarantee</span>
                      <span className="text-sm font-semibold text-green-600">Included</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                      <span className="text-sm font-medium">Document management</span>
                      <span className="text-sm font-semibold text-green-600">Included</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-green-100 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800">
                      <Plus className="h-4 w-4" />
                      <span className="text-sm font-semibold">Extra Benefits:</span>
                    </div>
                    <ul className="text-xs text-green-700 mt-2 space-y-1">
                      <li>• File anytime, always available</li>
                      <li>• Complete process transparency</li>
                      <li>• Instant compliance status</li>
                      <li>• Zero penalty risk with guarantees</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-8 bg-gray-50 rounded-lg border-2 border-green-200">
                <div className="text-center">
                  <h4 className="text-2xl font-bold text-foreground mb-2">Your Annual Savings</h4>
                  <div className="text-5xl font-bold text-green-600 mb-2">€4,200</div>
                  <p className="text-lg text-muted-foreground mb-4">
                    That's <strong>92% savings</strong> compared to traditional accountant fees
                  </p>
                  <div className="text-sm text-green-700">
                    Plus: Complete control, faster filing, and guaranteed compliance
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Business Size Breakdown */}
        <section className="py-20" data-animate>
          <div className="card-modern p-12 mb-2 hover-lift">
            <div className="text-center mb-2">
              <div className="icon-modern bg-primary mb-3 mx-auto">
                <TrendingUp className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Savings by <span className="text-gradient-primary">Business Size</span>
              </h2>
              <div className="w-24 h-1 bg-primary mx-auto mb-4 rounded-full"></div>
            </div>
            
            <div className="max-w-6xl mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 text-center">
                See how much you'll save based on your business size and complexity.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="card-modern p-6 hover-lift text-center">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Small Business</h3>
                  <div className="text-sm text-muted-foreground mb-4">€50k-€200k turnover</div>
                  
                  <div className="space-y-3 mb-6">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Accountant Cost</div>
                      <div className="text-xl font-bold text-red-600">€3,200/year</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">PayVat Cost</div>
                      <div className="text-xl font-bold text-green-600">€360/year</div>
                    </div>
                    <div className="border-t pt-3">
                      <div className="text-sm font-medium text-muted-foreground">Your Savings</div>
                      <div className="text-2xl font-bold text-primary">€2,840</div>
                      <div className="text-xs text-green-600">89% savings</div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Typical: Consultants, small retail, service providers
                  </div>
                </div>

                <div className="card-modern p-6 hover-lift text-center border-2 border-primary">
                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-white text-xs rounded-full mb-2">
                    <Award className="h-3 w-3" />
                    Most Popular
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Growing Business</h3>
                  <div className="text-sm text-muted-foreground mb-4">€200k-€500k turnover</div>
                  
                  <div className="space-y-3 mb-6">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Accountant Cost</div>
                      <div className="text-xl font-bold text-red-600">€5,800/year</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">PayVat Cost</div>
                      <div className="text-xl font-bold text-green-600">€360/year</div>
                    </div>
                    <div className="border-t pt-3">
                      <div className="text-sm font-medium text-muted-foreground">Your Savings</div>
                      <div className="text-2xl font-bold text-primary">€5,440</div>
                      <div className="text-xs text-green-600">94% savings</div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Typical: Tech startups, established services, small manufacturing
                  </div>
                </div>

                <div className="card-modern p-6 hover-lift text-center">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Established Business</h3>
                  <div className="text-sm text-muted-foreground mb-4">€500k+ turnover</div>
                  
                  <div className="space-y-3 mb-6">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Accountant Cost</div>
                      <div className="text-xl font-bold text-red-600">€8,500/year</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">PayVat Cost</div>
                      <div className="text-xl font-bold text-green-600">€360/year</div>
                    </div>
                    <div className="border-t pt-3">
                      <div className="text-sm font-medium text-muted-foreground">Your Savings</div>
                      <div className="text-2xl font-bold text-primary">€8,140</div>
                      <div className="text-xs text-green-600">96% savings</div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Typical: Multiple locations, complex supply chains, high-volume
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Hidden Costs of Traditional Accountants */}
        <section className="py-20" data-animate>
          <div className="card-premium p-12 mb-2 hover-lift">
            <div className="text-center mb-2">
              <div className="icon-premium mb-3 mx-auto">
                <FileText className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Hidden Costs of <span className="text-gradient-primary">Traditional Accountants</span>
              </h2>
              <div className="w-24 h-1 bg-teal-500 mx-auto mb-4 rounded-full"></div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 text-center">
                Beyond the hourly fees, traditional accountants have hidden costs that add up quickly.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-red-500 text-white text-sm flex items-center justify-center font-semibold">€</div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Time Delays Cost Money</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Waiting for accountant availability can delay important business decisions and cash flow.
                      </p>
                      <div className="text-xs text-red-600 font-medium">Hidden cost: Lost opportunities + stress</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-red-500 text-white text-sm flex items-center justify-center font-semibold">€</div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Lack of Real-time Insights</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        No visibility into VAT position until quarterly reviews. Miss optimization opportunities.
                      </p>
                      <div className="text-xs text-red-600 font-medium">Hidden cost: Suboptimal cash flow management</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-red-500 text-white text-sm flex items-center justify-center font-semibold">€</div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Penalty Risk</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Human error and manual processes increase risk of late filings and calculation mistakes.
                      </p>
                      <div className="text-xs text-red-600 font-medium">Hidden cost: €150-€12,695 potential penalties</div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-red-500 text-white text-sm flex items-center justify-center font-semibold">€</div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Document Chasing</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Time spent organizing and submitting documents. Multiple back-and-forth communications.
                      </p>
                      <div className="text-xs text-red-600 font-medium">Hidden cost: 2-4 hours monthly @ your hourly rate</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-red-500 text-white text-sm flex items-center justify-center font-semibold">€</div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Lack of Control</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Can't file when convenient for you. Dependent on accountant's schedule and priorities.
                      </p>
                      <div className="text-xs text-red-600 font-medium">Hidden cost: Business inflexibility</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-red-500 text-white text-sm flex items-center justify-center font-semibold">€</div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Knowledge Dependency</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        When accountant is unavailable, you can't get urgent VAT advice or make informed decisions.
                      </p>
                      <div className="text-xs text-red-600 font-medium">Hidden cost: Delayed decisions + dependency risk</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-6 bg-red-50 rounded-lg border-l-4 border-red-500">
                <h4 className="font-semibold text-red-800 mb-3 text-center">Real Customer Experience</h4>
                <blockquote className="text-sm text-red-700 italic text-center">
                  "My accountant charged €450 per VAT return but took 2 weeks to file. When I had urgent VAT questions, 
                  I had to wait for callbacks. The lack of control was frustrating and expensive. PayVat gives me everything 
                  instantly for €30/month."
                </blockquote>
                <cite className="text-xs text-red-600 block text-center mt-2">— Sarah M., Design Agency Owner</cite>
              </div>
            </div>
          </div>
        </section>

        {/* PayVat Value Proposition */}
        <section className="py-20" data-animate>
          <div className="card-modern p-12 mb-2 hover-lift">
            <div className="text-center mb-2">
              <div className="icon-modern bg-success mb-3 mx-auto">
                <ChevronRight className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Why PayVat <span className="text-gradient-primary">Wins</span>
              </h2>
              <div className="w-24 h-1 bg-primary mx-auto mb-4 rounded-full"></div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 text-center">
                It's not just about cost savings. PayVat gives you speed, control, and transparency that traditional accountants can't match.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Speed & Convenience
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">File VAT returns in under 10 minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Always available - file when convenient</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Instant VAT calculations and compliance checks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">No waiting for accountant availability</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Accuracy & Compliance
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Automated error checking and validation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Always up-to-date with Revenue requirements</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Penalty protection guarantee</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Real-time compliance monitoring</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Control & Transparency
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">See exactly what's happening at every step</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Make changes and corrections instantly</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Access all your VAT data anytime</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">No dependency on third parties</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Value & Flexibility
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Transparent pricing with no surprises</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Scale with your business growth</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Cancel anytime, no long-term contracts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Irish support team when you need help</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ROI Calculator */}
        <section className="py-20" data-animate>
          <div className="card-premium p-12 mb-2 hover-lift" style={{background: 'linear-gradient(135deg, rgba(74, 155, 142, 0.05) 0%, rgba(77, 184, 164, 0.1) 100%)'}}>
            <div className="text-center mb-2">
              <div className="icon-premium mb-3 mx-auto">
                <Calculator className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Your <span className="text-gradient-primary">ROI Calculator</span>
              </h2>
              <div className="w-24 h-1 bg-teal-500 mx-auto mb-4 rounded-full"></div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 text-center">
                See your exact return on investment with PayVat over different time periods.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 card-modern hover-lift">
                  <h3 className="font-semibold text-foreground mb-3">First Year ROI</h3>
                  <div className="space-y-2 mb-4">
                    <div className="text-sm text-muted-foreground">Traditional cost: €4,560</div>
                    <div className="text-sm text-muted-foreground">PayVat cost: €360</div>
                    <div className="border-t pt-2">
                      <div className="text-2xl font-bold text-green-600">€4,200</div>
                      <div className="text-sm text-green-700">saved in year 1</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ROI: 1,167% return on investment
                  </div>
                </div>

                <div className="text-center p-6 card-modern hover-lift border-2 border-green-500">
                  <h3 className="font-semibold text-foreground mb-3">Three Year Total</h3>
                  <div className="space-y-2 mb-4">
                    <div className="text-sm text-muted-foreground">Traditional cost: €13,680</div>
                    <div className="text-sm text-muted-foreground">PayVat cost: €1,080</div>
                    <div className="border-t pt-2">
                      <div className="text-2xl font-bold text-green-600">€12,600</div>
                      <div className="text-sm text-green-700">saved over 3 years</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Enough to hire a part-time employee
                  </div>
                </div>

                <div className="text-center p-6 card-modern hover-lift">
                  <h3 className="font-semibold text-foreground mb-3">Five Year Impact</h3>
                  <div className="space-y-2 mb-4">
                    <div className="text-sm text-muted-foreground">Traditional cost: €22,800</div>
                    <div className="text-sm text-muted-foreground">PayVat cost: €1,800</div>
                    <div className="border-t pt-2">
                      <div className="text-2xl font-bold text-green-600">€21,000</div>
                      <div className="text-sm text-green-700">saved over 5 years</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Reinvest in business growth instead
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-6 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-3 text-center">What Our Customers Do With Their Savings</h4>
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-green-700">43%</div>
                    <div className="text-xs text-green-600">Reinvest in marketing</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-700">31%</div>
                    <div className="text-xs text-green-600">Hire additional staff</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-700">26%</div>
                    <div className="text-xs text-green-600">Upgrade equipment/tools</div>
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
                    Start Saving <span className="text-gradient-primary">€4,200+ Today</span>
                  </h3>
                  <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    Join Irish businesses who've taken control of their VAT compliance while saving costs annually.
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
              <a href="/avoid-revenue-penalties-ireland" className="text-primary hover:underline">Avoid penalties</a>
              <a href="/how-to-register-for-vat-ireland" className="text-primary hover:underline">VAT registration</a>
              <a href="/vat-deadlines-ireland" className="text-primary hover:underline">VAT deadlines</a>
              <a href="/complete-business-setup-guide-ireland" className="text-primary hover:underline">Business setup</a>
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
