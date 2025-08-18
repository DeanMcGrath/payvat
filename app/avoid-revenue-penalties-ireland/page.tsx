"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Clock, Users, Target, CheckCircle, Euro, Award, ChevronRight, TrendingUp, ArrowRight, Bell, FileText, Building, UserCheck, AlertTriangle, Calculator, Calendar, DollarSign } from 'lucide-react'
import Footer from "@/components/footer"
import SiteHeader from "@/components/site-header"

export default function AvoidRevenuePenaltiesIreland() {
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
        searchPlaceholder="Search compliance guides..."
        currentPage="Avoid Revenue Penalties Ireland"
        pageSubtitle="Stay compliant and protect your business from costly penalties"
      />


      <div className="max-w-7xl mx-auto px-6 content-after-header pb-8">

        {/* Penalty Cost Calculator */}
        <section className="py-20" data-animate>
          <div className="card-premium p-12 mb-2 hover-lift" style={{background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(220, 38, 38, 0.1) 100%)'}}>
            <div className="text-center mb-2">
              <div className="icon-premium mb-3 mx-auto" style={{background: 'linear-gradient(to bottom right, #dc2626, #991b1b)'}}>
                <Calculator className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Real <span className="text-gradient-primary">Penalty Costs</span>
              </h2>
              <div className="w-24 h-1 bg-red-500 mx-auto mb-4 rounded-full"></div>
            </div>
            
            <div className="max-w-6xl mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 text-center">
                See what late filing and payment actually costs Irish businesses. These are real penalty rates from Revenue.
              </p>
              
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="card-modern p-8 hover-lift border-l-4 border-red-500">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600 mb-2">€1,500</div>
                    <h3 className="font-semibold text-foreground mb-3">Late VAT Return</h3>
                    <ul className="text-sm text-muted-foreground space-y-2 text-left">
                      <li>• €150 initial penalty</li>
                      <li>• €10 per day after 20 days</li>
                      <li>• €1,500 if over 6 months late</li>
                      <li>• Plus interest at 8% per year</li>
                    </ul>
                  </div>
                </div>

                <div className="card-modern p-8 hover-lift border-l-4 border-orange-500">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">€3,000</div>
                    <h3 className="font-semibold text-foreground mb-3">Late Company Return</h3>
                    <ul className="text-sm text-muted-foreground space-y-2 text-left">
                      <li>• €100 fixed penalty</li>
                      <li>• €3 per day from month 2</li>
                      <li>• €1,200 after 12 months</li>
                      <li>• Strike-off proceedings start</li>
                    </ul>
                  </div>
                </div>

                <div className="card-modern p-8 hover-lift border-l-4 border-red-700">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-700 mb-2">€12,695</div>
                    <h3 className="font-semibold text-foreground mb-3">Late Registration</h3>
                    <ul className="text-sm text-muted-foreground space-y-2 text-left">
                      <li>• 5% of tax due minimum €125</li>
                      <li>• Maximum €12,695 penalty</li>
                      <li>• Back-dated VAT liability</li>
                      <li>• Interest on all amounts</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-red-50 rounded-lg border-l-4 border-red-500">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-800 mb-2">Example: Small Business Late Filing</h4>
                    <p className="text-sm text-red-700 mb-2">
                      A consultancy with €60,000 annual turnover files VAT return 4 months late:
                    </p>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• Initial penalty: €150</li>
                      <li>• Daily penalties (100 days × €10): €1,000</li>
                      <li>• Interest on VAT due: €120</li>
                      <li>• <strong>Total cost: €1,270 for one late filing</strong></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Common Penalty Triggers */}
        <section className="py-20" data-animate>
          <div className="card-modern p-12 mb-2 hover-lift">
            <div className="text-center mb-2">
              <div className="icon-modern bg-warning mb-3 mx-auto">
                <AlertTriangle className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Most Common <span className="text-gradient-primary">Penalty Triggers</span>
              </h2>
              <div className="w-24 h-1 bg-primary mx-auto mb-4 rounded-full"></div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 text-center">
                Based on Revenue data, these are the mistakes that cost Irish businesses most. Avoid these traps.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-red-500 text-white text-sm flex items-center justify-center font-semibold">1</div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Missing VAT registration deadline</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Most expensive mistake. When turnover hits thresholds, you have 30 days to register.
                      </p>
                      <div className="text-xs text-red-600 font-medium">Cost: €125-€12,695 + back-dated VAT</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-red-500 text-white text-sm flex items-center justify-center font-semibold">2</div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Late VAT return filing</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Even if no tax due, returns must be filed by 19th (23rd for ROS users).
                      </p>
                      <div className="text-xs text-red-600 font-medium">Cost: €150 + €10/day after 20 days</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-red-500 text-white text-sm flex items-center justify-center font-semibold">3</div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Incorrect VAT rates on invoices</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Using wrong rates can trigger penalties and require customer refunds.
                      </p>
                      <div className="text-xs text-red-600 font-medium">Cost: Variable + interest + correction costs</div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-red-500 text-white text-sm flex items-center justify-center font-semibold">4</div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Missing company annual returns</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Annual Return (B1) due by anniversary. Strike-off proceedings after 12 months.
                      </p>
                      <div className="text-xs text-red-600 font-medium">Cost: €100 + €3/day + restoration fees</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-red-500 text-white text-sm flex items-center justify-center font-semibold">5</div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Poor record keeping</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Missing receipts, invoices, or VAT records trigger compliance reviews.
                      </p>
                      <div className="text-xs text-red-600 font-medium">Cost: Investigation time + estimated assessments</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-red-500 text-white text-sm flex items-center justify-center font-semibold">6</div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Mixing personal and business expenses</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Claiming personal expenses as business costs can trigger fraud investigations.
                      </p>
                      <div className="text-xs text-red-600 font-medium">Cost: 100% penalty + investigation + prosecution</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Penalty Prevention System */}
        <section className="py-20" data-animate>
          <div className="card-premium p-12 mb-2 hover-lift">
            <div className="text-center mb-2">
              <div className="icon-premium mb-3 mx-auto">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Your <span className="text-gradient-primary">Penalty Prevention</span> System
              </h2>
              <div className="w-24 h-1 gradient-primary mx-auto mb-4 rounded-full"></div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 text-center">
                Follow this systematic approach to stay compliant and penalty-free. Used by Irish businesses.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Deadline Management
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Set up deadline alerts 7, 3, and 1 day before</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Use automated reminders, not manual calendars</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Know the difference: 19th vs 23rd for ROS users</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">File early when possible, not on deadline day</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Record Keeping
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Store all receipts and invoices digitally</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Separate business and personal expenses</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Keep records for 6 years (Revenue requirement)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Regular bank reconciliation and review</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-primary" />
                    VAT Compliance
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Monitor turnover monthly vs thresholds</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Use correct VAT rates on all invoices</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">File nil returns even if no activity</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Keep VIES validation proof for EU sales</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Building className="h-5 w-5 text-primary" />
                    Company Compliance
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Annual Return filed by anniversary date</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Maintain statutory registers and meetings</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">File accounts within 28 days of AGM</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Notify changes in directors/secretary</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Real Customer Stories */}
        <section className="py-20" data-animate>
          <div className="card-modern p-12 mb-2 hover-lift">
            <div className="text-center mb-2">
              <div className="icon-modern bg-success mb-3 mx-auto">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Real <span className="text-gradient-primary">Customer Stories</span>
              </h2>
              <div className="w-24 h-1 bg-primary mx-auto mb-4 rounded-full"></div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 text-center">
                How PayVat customers avoided costly penalties and stayed compliant.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="p-6 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <div className="mb-4">
                    <h4 className="font-semibold text-green-800 mb-1">Sarah's Design Agency</h4>
                    <p className="text-sm text-green-700">Cork • €180,000 annual turnover</p>
                  </div>
                  <p className="text-sm text-green-700 mb-4">
                    "I was so focused on client work that I nearly missed VAT registration. PayVat's threshold monitoring 
                    alerted me when I hit €35,000 in services. Registered with weeks to spare."
                  </p>
                  <div className="text-xs font-semibold text-green-800">
                    Penalty avoided: €2,500+ in late registration fees
                  </div>
                </div>

                <div className="p-6 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <div className="mb-4">
                    <h4 className="font-semibold text-blue-800 mb-1">Michael's Construction</h4>
                    <p className="text-sm text-blue-700">Dublin • Limited company</p>
                  </div>
                  <p className="text-sm text-blue-700 mb-4">
                    "PayVat's automatic reminders saved me when I was on a big project. Would have completely forgotten 
                    the VAT return deadline. The system filed everything automatically."
                  </p>
                  <div className="text-xs font-semibold text-blue-800">
                    Penalty avoided: €1,200 in late filing fees
                  </div>
                </div>

                <div className="p-6 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                  <div className="mb-4">
                    <h4 className="font-semibold text-purple-800 mb-1">Emma's E-commerce</h4>
                    <p className="text-sm text-purple-700">Galway • Multi-channel retail</p>
                  </div>
                  <p className="text-sm text-purple-700 mb-4">
                    "Complex VAT rates across different product lines. PayVat's rate checker stopped me using 
                    wrong rates on hundreds of invoices. Would have been a nightmare to correct."
                  </p>
                  <div className="text-xs font-semibold text-purple-800">
                    Penalty avoided: €5,000+ in corrections + customer refunds
                  </div>
                </div>

                <div className="p-6 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                  <div className="mb-4">
                    <h4 className="font-semibold text-orange-800 mb-1">David's Tech Startup</h4>
                    <p className="text-sm text-orange-700">Remote • SaaS platform</p>
                  </div>
                  <p className="text-sm text-orange-700 mb-4">
                    "Rapid growth meant we went from €20k to €100k turnover in 6 months. PayVat tracked everything 
                    and handled cross-border VAT compliance automatically."
                  </p>
                  <div className="text-xs font-semibold text-orange-800">
                    Penalty avoided: €3,500 in missed EU VAT obligations
                  </div>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-100 rounded-full">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-semibold text-green-800">
                    Zero penalties reported by PayVat customers in 2024
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Penalty Protection Guarantee */}
        <section className="py-20" data-animate>
          <div className="card-premium p-12 mb-2 hover-lift" style={{background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(22, 163, 74, 0.1) 100%)'}}>
            <div className="text-center mb-2">
              <div className="icon-premium mb-3 mx-auto" style={{background: 'linear-gradient(to bottom right, #16a34a, #15803d)'}}>
                <Shield className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                PayVat <span className="text-gradient-primary">Penalty Protection</span>
              </h2>
              <div className="w-24 h-1 bg-green-500 mx-auto mb-4 rounded-full"></div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 text-center">
                We're so confident in our compliance system, we guarantee it. Here's how PayVat protects you.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 card-modern hover-lift">
                  <div className="icon-modern bg-green-500 mb-4 mx-auto">
                    <Bell className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Smart Alerts</h3>
                  <p className="text-sm text-muted-foreground">
                    Automated deadline reminders, threshold monitoring, and compliance notifications
                  </p>
                </div>

                <div className="text-center p-6 card-modern hover-lift">
                  <div className="icon-modern bg-blue-500 mb-4 mx-auto">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Auto Filing</h3>
                  <p className="text-sm text-muted-foreground">
                    Direct ROS integration ensures returns filed correctly and on time, every time
                  </p>
                </div>

                <div className="text-center p-6 card-modern hover-lift">
                  <div className="icon-modern bg-purple-500 mb-4 mx-auto">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Accuracy Checks</h3>
                  <p className="text-sm text-muted-foreground">
                    Built-in validation prevents common errors before they reach Revenue
                  </p>
                </div>
              </div>

              <div className="mt-8 p-6 bg-green-50 rounded-lg border border-green-200">
                <div className="text-center">
                  <h4 className="font-semibold text-green-800 mb-3">Our Guarantee to You</h4>
                  <p className="text-sm text-green-700 mb-4">
                    If you receive a penalty for late filing or incorrect information while using PayVat correctly, 
                    we'll cover the penalty cost up to €1,000 per incident.
                  </p>
                  <div className="text-xs text-green-600">
                    *Terms apply. Must be using PayVat's automated filing features. 
                    Excludes penalties for late payment of taxes due.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Take Action Today */}
        <section className="py-20" data-animate>
          <div className="card-modern p-12 mb-2 hover-lift">
            <div className="text-center mb-2">
              <div className="icon-modern bg-warning mb-3 mx-auto">
                <Clock className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Take Action <span className="text-gradient-primary">Today</span>
              </h2>
              <div className="w-24 h-1 bg-primary mx-auto mb-4 rounded-full"></div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 text-center">
                Don't wait for the next deadline. Set up your penalty protection system now.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">Immediate Actions (Next 24 Hours)</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-semibold">1</div>
                      <div>
                        <p className="font-medium text-foreground">Check your next deadline</p>
                        <p className="text-sm text-muted-foreground">VAT return, annual return, or registration deadline</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-semibold">2</div>
                      <div>
                        <p className="font-medium text-foreground">Review your turnover</p>
                        <p className="text-sm text-muted-foreground">Are you approaching VAT registration thresholds?</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-semibold">3</div>
                      <div>
                        <p className="font-medium text-foreground">Gather missing records</p>
                        <p className="text-sm text-muted-foreground">Collect any missing receipts or invoices</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">Long-term Protection</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-semibold">1</div>
                      <div>
                        <p className="font-medium text-foreground">Automate your compliance</p>
                        <p className="text-sm text-muted-foreground">Set up PayVat for automatic filing and reminders</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-semibold">2</div>
                      <div>
                        <p className="font-medium text-foreground">Separate business finances</p>
                        <p className="text-sm text-muted-foreground">Use dedicated business accounts and cards</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-semibold">3</div>
                      <div>
                        <p className="font-medium text-foreground">Regular reviews</p>
                        <p className="text-sm text-muted-foreground">Monthly compliance check and document review</p>
                      </div>
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
                    <Shield className="h-12 w-12 text-white" />
                  </div>
                  
                  <h3 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">
                    Protect Your Business <span className="text-gradient-primary">Today</span>
                  </h3>
                  <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    Join Irish businesses with zero penalty records. Start your 14-day free trial and never worry about compliance again.
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
                    <span>Penalty protection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-success" />
                    <span>Setup in minutes</span>
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
              <a href="/vat-deadlines-ireland" className="text-primary hover:underline">VAT deadlines</a>
              <a href="/how-to-register-for-vat-ireland" className="text-primary hover:underline">VAT registration</a>
              <a href="/complete-business-setup-guide-ireland" className="text-primary hover:underline">Business setup guide</a>
              <a href="/accountant-fees-vs-payvat-savings" className="text-primary hover:underline">Cost comparison</a>
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
