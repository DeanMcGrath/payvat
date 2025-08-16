"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Clock, Users, Target, CheckCircle, Euro, Award, ChevronRight, TrendingUp, ArrowRight, Bell, FileText, Building, UserCheck, Scale, AlertTriangle } from 'lucide-react'
import Footer from "@/components/footer"
import SiteHeader from "@/components/site-header"

export default function CompanyVsSoleTraderIreland() {
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
        searchPlaceholder="Search business structure guides..."
        currentPage="Company vs Sole Trader Ireland"
        pageSubtitle="Choose the right business structure for your venture"
      />


      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Quick Decision Matrix */}
        <section className="py-20" data-animate>
          <div className="card-premium p-12 mb-2 hover-lift">
            <div className="text-center mb-2">
              <div className="icon-premium mb-3 mx-auto">
                <Target className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Quick <span className="text-gradient-primary">Decision Matrix</span>
              </h2>
              <div className="w-24 h-1 gradient-primary mx-auto mb-4 rounded-full"></div>
            </div>
            
            <div className="max-w-6xl mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 text-center">
                Use this quick assessment to identify which structure suits your situation best.
              </p>
              
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="card-modern p-8 hover-lift border-l-4 border-[#0085D1]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="icon-modern bg-[#0072B1]">
                      <UserCheck className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">Choose Sole Trader If:</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">You want to start trading immediately</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Your business has low liability risk</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">You're a service provider or consultant</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">You want minimal admin and compliance</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Annual turnover likely under €100k</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">You don't need business credit/loans</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Best for:</strong> Freelancers, consultants, tradespeople, creative professionals
                    </p>
                  </div>
                </div>

                <div className="card-modern p-8 hover-lift border-l-4 border-[#0085D1]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="icon-modern bg-gray-500">
                      <Building className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">Choose Limited Company If:</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">You want limited liability protection</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">You plan to raise investment or take loans</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">You'll have employees or partners</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">You want professional credibility</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Annual turnover likely over €100k</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">You want tax planning flexibility</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Best for:</strong> Growth businesses, tech startups, retail, manufacturing, professional services
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Comparison */}
        <section className="py-20" data-animate>
          <div className="card-modern p-12 mb-2 hover-lift">
            <div className="text-center mb-2">
              <div className="icon-modern bg-primary mb-3 mx-auto">
                <Scale className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Detailed <span className="text-gradient-primary">Comparison</span>
              </h2>
              <div className="w-24 h-1 bg-primary mx-auto mb-4 rounded-full"></div>
            </div>
            
            <div className="max-w-6xl mx-auto">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-primary/20">
                      <th className="text-left p-4 font-semibold text-foreground">Aspect</th>
                      <th className="text-center p-4 font-semibold text-foreground">Sole Trader</th>
                      <th className="text-center p-4 font-semibold text-foreground">Limited Company</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="border-b border-gray-200">
                      <td className="p-4 font-medium text-foreground">Setup Time</td>
                      <td className="p-4 text-center text-[#0072B1]">24-48 hours</td>
                      <td className="p-4 text-center text-[#0072B1]">7-10 days</td>
                    </tr>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <td className="p-4 font-medium text-foreground">Setup Cost</td>
                      <td className="p-4 text-center text-[#0072B1]">€0-50</td>
                      <td className="p-4 text-center text-[#0072B1]">€125-200</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="p-4 font-medium text-foreground">Personal Liability</td>
                      <td className="p-4 text-center text-red-600">Unlimited</td>
                      <td className="p-4 text-center text-green-600">Limited to shares</td>
                    </tr>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <td className="p-4 font-medium text-foreground">Tax on Profits</td>
                      <td className="p-4 text-center text-muted-foreground">20-40% income tax</td>
                      <td className="p-4 text-center text-muted-foreground">12.5-25% corporation tax</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="p-4 font-medium text-foreground">Annual Filings</td>
                      <td className="p-4 text-center text-[#0072B1]">Tax return only</td>
                      <td className="p-4 text-center text-[#0072B1]">Annual return + accounts</td>
                    </tr>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <td className="p-4 font-medium text-foreground">Business Credibility</td>
                      <td className="p-4 text-center text-[#0072B1]">Moderate</td>
                      <td className="p-4 text-center text-green-600">High</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="p-4 font-medium text-foreground">Raising Investment</td>
                      <td className="p-4 text-center text-red-600">Very difficult</td>
                      <td className="p-4 text-center text-green-600">Straightforward</td>
                    </tr>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <td className="p-4 font-medium text-foreground">VAT Registration</td>
                      <td className="p-4 text-center text-muted-foreground">Same thresholds</td>
                      <td className="p-4 text-center text-muted-foreground">Same thresholds</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Liability Deep Dive */}
        <section className="py-20" data-animate>
          <div className="card-premium p-12 mb-2 hover-lift">
            <div className="text-center mb-2">
              <div className="icon-premium mb-3 mx-auto">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Understanding <span className="text-gradient-primary">Liability</span>
              </h2>
              <div className="w-24 h-1 gradient-primary mx-auto mb-4 rounded-full"></div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 text-center">
                Personal liability is often the deciding factor. Here's what it means in practice.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Sole Trader Liability
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                      <h4 className="font-semibold text-red-800 mb-2">Personal Assets at Risk</h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        <li>• Your home, car, and savings</li>
                        <li>• No separation between business and personal debts</li>
                        <li>• Creditors can pursue all your assets</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                      <h4 className="font-semibold text-yellow-800 mb-2">When This Matters Most</h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Professional services (advice liability)</li>
                        <li>• Manufacturing or retail (product liability)</li>
                        <li>• Any business with employees</li>
                        <li>• High-value contracts or equipment</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-500" />
                    Limited Company Protection
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                      <h4 className="font-semibold text-green-800 mb-2">Your Assets Protected</h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Personal assets generally safe</li>
                        <li>• Liability limited to company shares</li>
                        <li>• Company debts stay with company</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-[#0085D1]">
                      <h4 className="font-semibold text-blue-800 mb-2">Important Exceptions</h4>
                      <ul className="text-sm text-[#005A91] space-y-1">
                        <li>• Personal guarantees on loans/leases</li>
                        <li>• Director wrongful trading</li>
                        <li>• Fraud or criminal activities</li>
                        <li>• Some professional negligence claims</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg">
                <h4 className="font-semibold text-foreground mb-3 text-center">Insurance vs Structure</h4>
                <p className="text-sm text-muted-foreground text-center">
                  Professional indemnity and public liability insurance can protect sole traders, but company structure 
                  provides additional legal separation. Many choose limited companies for peace of mind alone.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tax Implications */}
        <section className="py-20" data-animate>
          <div className="card-modern p-12 mb-2 hover-lift">
            <div className="text-center mb-2">
              <div className="icon-modern bg-warning mb-3 mx-auto">
                <Euro className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Tax <span className="text-gradient-primary">Implications</span>
              </h2>
              <div className="w-24 h-1 bg-primary mx-auto mb-4 rounded-full"></div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 text-center">
                Tax treatment can significantly impact your take-home income, especially as profits grow.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">Sole Trader Taxation</h3>
                  <div className="space-y-4">
                    <div className="p-4 card-modern">
                      <h4 className="font-semibold text-foreground mb-2">Income Tax Rates (2025)</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• 20% on first €42,000</li>
                        <li>• 40% on income above €42,000</li>
                        <li>• Plus USC (0.5-8%) and PRSI (4%)</li>
                        <li>• Effective rate: 24-56%</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Tax Benefits</h4>
                      <ul className="text-sm text-[#005A91] space-y-1">
                        <li>• Simple tax return process</li>
                        <li>• No separate corporate filings</li>
                        <li>• Access to personal tax credits</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">Limited Company Taxation</h3>
                  <div className="space-y-4">
                    <div className="p-4 card-modern">
                      <h4 className="font-semibold text-foreground mb-2">Corporation Tax Rates (2025)</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• 12.5% on trading profits</li>
                        <li>• 25% on passive income</li>
                        <li>• Director salary: income tax applies</li>
                        <li>• Dividends: tax efficient extraction</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Tax Planning Options</h4>
                      <ul className="text-sm text-[#005A91] space-y-1">
                        <li>• Salary/dividend optimisation</li>
                        <li>• Pension contributions up to €115k</li>
                        <li>• Capital gains relief options</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-6 card-premium bg-gradient-to-r from-gray-50 to-gray-100">
                <h4 className="font-semibold text-foreground mb-3 text-center">Example: €80,000 Annual Profit</h4>
                <div className="grid md:grid-cols-2 gap-6 text-center">
                  <div>
                    <h5 className="font-semibold text-foreground mb-2">Sole Trader</h5>
                    <div className="text-2xl font-bold text-red-600 mb-1">€43,600</div>
                    <div className="text-sm text-muted-foreground">Take-home after tax</div>
                    <div className="text-xs text-red-600 mt-1">Effective rate: 45.5%</div>
                  </div>
                  <div>
                    <h5 className="font-semibold text-foreground mb-2">Limited Company</h5>
                    <div className="text-2xl font-bold text-[#0072B1] mb-1">€58,000</div>
                    <div className="text-sm text-muted-foreground">Take-home optimised</div>
                    <div className="text-xs text-[#0072B1] mt-1">Effective rate: 27.5%</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-4">
                  *Example assumes optimal salary/dividend split. Actual results depend on personal circumstances.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* VAT Considerations */}
        <section className="py-20" data-animate>
          <div className="card-premium p-12 mb-2 hover-lift">
            <div className="text-center mb-2">
              <div className="icon-premium mb-3 mx-auto">
                <FileText className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                VAT <span className="text-gradient-primary">Considerations</span>
              </h2>
              <div className="w-24 h-1 gradient-primary mx-auto mb-4 rounded-full"></div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 text-center">
                VAT registration thresholds and obligations are the same for both structures, but timing and strategy may differ.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">Registration Thresholds (2025)</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 card-modern">
                      <div className="icon-modern bg-gray-500">
                        <Euro className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">€42,500</h4>
                        <p className="text-sm text-muted-foreground">Services in rolling 12 months</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 card-modern">
                      <div className="icon-modern bg-[#0072B1]">
                        <Euro className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">€85,000</h4>
                        <p className="text-sm text-muted-foreground">Goods in rolling 12 months</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg border-l-4 border-[#0085D1]">
                    <h4 className="font-semibold text-blue-800 mb-2">Same Rules Apply</h4>
                    <p className="text-sm text-[#005A91]">
                      Both sole traders and companies must register when turnover exceeds thresholds. 
                      Structure choice doesn't affect VAT obligations.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">Strategic Differences</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Sole Traders</h4>
                      <ul className="text-sm text-[#005A91] space-y-1">
                        <li>• May delay registration until threshold hit</li>
                        <li>• Simpler VAT return process</li>
                        <li>• Less likely to register voluntarily early</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Limited Companies</h4>
                      <ul className="text-sm text-[#005A91] space-y-1">
                        <li>• Often register early for credibility</li>
                        <li>• Can reclaim VAT on incorporation costs</li>
                        <li>• Better positioned for B2B contracts</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-green-800 mb-1">PayVat Advantage</h4>
                        <p className="text-sm text-green-700">
                          Regardless of structure, PayVat simplifies VAT compliance with automated calculations, 
                          ROS integration, and deadline reminders.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Making the Change */}
        <section className="py-20" data-animate>
          <div className="card-modern p-12 mb-2 hover-lift">
            <div className="text-center mb-2">
              <div className="icon-modern bg-[#0085D1] mb-3 mx-auto">
                <ArrowRight className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Can You <span className="text-gradient-primary">Change Later?</span>
              </h2>
              <div className="w-24 h-1 bg-primary mx-auto mb-4 rounded-full"></div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 text-center">
                Yes, but it's easier to start with the right structure. Here's what changing involves.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">Sole Trader → Limited Company</h3>
                  <div className="space-y-4">
                    <div className="p-4 card-modern">
                      <h4 className="font-semibold text-foreground mb-2">Process</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Incorporate new company</li>
                        <li>• Transfer business assets</li>
                        <li>• Close sole trader tax affairs</li>
                        <li>• Update all contracts and accounts</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Considerations</h4>
                      <ul className="text-sm text-[#005A91] space-y-1">
                        <li>• Potential capital gains tax</li>
                        <li>• VAT registration transfer</li>
                        <li>• Customer/supplier notifications</li>
                        <li>• Professional fees: €500-2,000</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">Limited Company → Sole Trader</h3>
                  <div className="space-y-4">
                    <div className="p-4 card-modern">
                      <h4 className="font-semibold text-foreground mb-2">Process</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Liquidate or strike off company</li>
                        <li>• Extract remaining assets</li>
                        <li>• Register as sole trader</li>
                        <li>• Transfer contracts and relationships</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-red-50 rounded-lg">
                      <h4 className="font-semibold text-red-800 mb-2">Challenges</h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        <li>• More complex and expensive</li>
                        <li>• Potential tax on asset extraction</li>
                        <li>• Loss of limited liability</li>
                        <li>• Professional fees: €1,000-5,000</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-6 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg border-l-4 border-slate-400">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-slate-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-2">Key Takeaway</h4>
                    <p className="text-sm text-slate-700">
                      While changing structure is possible, it involves costs, complexity, and potential tax implications. 
                      It's usually better to choose the right structure from the start based on your 3-5 year business plan.
                    </p>
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
                <AlertTriangle className="h-10 w-10 text-white" />
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
                      <h4 className="font-semibold text-foreground mb-1">Choosing based on tax alone</h4>
                      <p className="text-sm text-muted-foreground">Liability protection and business credibility often matter more than small tax differences</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-destructive text-white text-sm flex items-center justify-center font-semibold">2</div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Ignoring future growth plans</h4>
                      <p className="text-sm text-muted-foreground">Consider where you'll be in 3-5 years, not just current turnover</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-destructive text-white text-sm flex items-center justify-center font-semibold">3</div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Underestimating liability risks</h4>
                      <p className="text-sm text-muted-foreground">Even low-risk businesses can face unexpected claims or disputes</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-destructive text-white text-sm flex items-center justify-center font-semibold">4</div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Forgetting about investment needs</h4>
                      <p className="text-sm text-muted-foreground">Sole traders struggle to raise finance for growth or expansion</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-destructive text-white text-sm flex items-center justify-center font-semibold">5</div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Delaying the decision</h4>
                      <p className="text-sm text-muted-foreground">Starting as sole trader "temporarily" often leads to costly changes later</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-destructive text-white text-sm flex items-center justify-center font-semibold">6</div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Not considering industry norms</h4>
                      <p className="text-sm text-muted-foreground">Some sectors expect limited companies for credibility and contracts</p>
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
                    Whatever structure you choose, PayVat helps with business registration, VAT setup, and ongoing compliance. Get started today.
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
                    <span>Expert guidance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-success" />
                    <span>Setup in days</span>
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
              <a href="/complete-business-setup-guide-ireland" className="text-primary hover:underline">Complete business setup</a>
              <a href="/register-business-name-ireland" className="text-primary hover:underline">Business name registration</a>
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
