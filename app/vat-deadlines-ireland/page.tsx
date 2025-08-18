"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Clock, Users, Target, CheckCircle, Euro, Award, ChevronRight, TrendingUp, ArrowRight, Bell, FileText, Building, UserCheck, AlertTriangle, Calculator, Calendar, DollarSign } from 'lucide-react'
import Footer from "@/components/footer"
import SiteHeader from "@/components/site-header"

export default function VATDeadlinesIreland() {
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
        searchPlaceholder="Search VAT deadline guides..."
        currentPage="VAT Deadlines Ireland"
        pageSubtitle="Never miss a VAT deadline with this complete guide"
      />


      <div className="max-w-7xl mx-auto px-6 content-after-header pb-8">

        {/* Key Deadline Rules */}
        <section className="py-20" data-animate>
          <div className="card-premium p-12 mb-2 hover-lift">
            <div className="text-center mb-2">
              <div className="icon-premium mb-3 mx-auto">
                <Clock className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Key Deadline <span className="text-gradient-primary">Rules</span>
              </h2>
              <div className="w-24 h-1 gradient-primary mx-auto mb-4 rounded-full"></div>
            </div>
            
            <div className="max-w-6xl mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 text-center">
                Understanding these core rules will keep you compliant and penalty-free.
              </p>
              
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="card-modern p-8 hover-lift border-l-4 border-red-500">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-foreground mb-2">Standard Deadline</h3>
                    <div className="text-4xl font-bold text-red-600 mb-2">19th</div>
                    <div className="text-sm text-muted-foreground">of the month after period ends</div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground mb-2">Applies to:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Paper return filers</li>
                      <li>• Non-ROS users</li>
                      <li>• All payment deadlines (regardless of filing method)</li>
                      <li>• First-time filers without ROS setup</li>
                    </ul>
                  </div>
                  
                  <div className="mt-6 p-4 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-800">
                      <strong>Critical:</strong> Payment deadlines are always the 19th, even if you file online via ROS.
                    </p>
                  </div>
                </div>

                <div className="card-modern p-8 hover-lift border-l-4 border-green-500">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-foreground mb-2">ROS Extension</h3>
                    <div className="text-4xl font-bold text-green-600 mb-2">23rd</div>
                    <div className="text-sm text-muted-foreground">of the month after period ends</div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground mb-2">Applies to:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Revenue Online Service (ROS) filers only</li>
                      <li>• Both individual and company returns</li>
                      <li>• Return filing deadline only (not payment)</li>
                      <li>• Automatic extension - no application needed</li>
                    </ul>
                  </div>
                  
                  <div className="mt-6 p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Benefit:</strong> Extra 4 days to prepare and file your return, but payment still due 19th.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-800 mb-2">Important Distinction</h4>
                    <p className="text-sm text-yellow-700">
                      ROS users get until the 23rd to <strong>file</strong> their return, but <strong>payment</strong> is still due by the 19th. 
                      This means you need to calculate and pay your VAT by the 19th, then file the return by the 23rd.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2025 VAT Calendar */}
        <section className="py-20" data-animate>
          <div className="card-modern p-12 mb-2 hover-lift">
            <div className="text-center mb-2">
              <div className="icon-modern bg-primary mb-3 mx-auto">
                <Calendar className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                2025 VAT <span className="text-gradient-primary">Calendar</span>
              </h2>
              <div className="w-24 h-1 bg-primary mx-auto mb-4 rounded-full"></div>
            </div>
            
            <div className="max-w-6xl mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 text-center">
                Complete bi-monthly VAT periods and deadlines for 2025. Most Irish SMEs file bi-monthly returns.
              </p>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white rounded-lg shadow-soft">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-primary/20">
                      <th className="text-left p-4 font-semibold text-foreground">VAT Period</th>
                      <th className="text-center p-4 font-semibold text-foreground">Return Due</th>
                      <th className="text-center p-4 font-semibold text-foreground">Payment Due</th>
                      <th className="text-center p-4 font-semibold text-foreground">ROS Filing</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="p-4 font-medium text-foreground">Jan-Feb 2025</td>
                      <td className="p-4 text-center text-red-600 font-medium">19 Mar 2025</td>
                      <td className="p-4 text-center text-red-600 font-medium">19 Mar 2025</td>
                      <td className="p-4 text-center text-green-600 font-medium">23 Mar 2025</td>
                    </tr>
                    <tr className="border-b border-gray-200 hover:bg-gray-50 bg-blue-50">
                      <td className="p-4 font-medium text-foreground">Mar-Apr 2025</td>
                      <td className="p-4 text-center text-red-600 font-medium">19 May 2025</td>
                      <td className="p-4 text-center text-red-600 font-medium">19 May 2025</td>
                      <td className="p-4 text-center text-green-600 font-medium">23 May 2025</td>
                    </tr>
                    <tr className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="p-4 font-medium text-foreground">May-Jun 2025</td>
                      <td className="p-4 text-center text-red-600 font-medium">19 Jul 2025</td>
                      <td className="p-4 text-center text-red-600 font-medium">19 Jul 2025</td>
                      <td className="p-4 text-center text-green-600 font-medium">23 Jul 2025</td>
                    </tr>
                    <tr className="border-b border-gray-200 hover:bg-gray-50 bg-blue-50">
                      <td className="p-4 font-medium text-foreground">Jul-Aug 2025</td>
                      <td className="p-4 text-center text-red-600 font-medium">19 Sep 2025</td>
                      <td className="p-4 text-center text-red-600 font-medium">19 Sep 2025</td>
                      <td className="p-4 text-center text-green-600 font-medium">23 Sep 2025</td>
                    </tr>
                    <tr className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="p-4 font-medium text-foreground">Sep-Oct 2025</td>
                      <td className="p-4 text-center text-red-600 font-medium">19 Nov 2025</td>
                      <td className="p-4 text-center text-red-600 font-medium">19 Nov 2025</td>
                      <td className="p-4 text-center text-green-600 font-medium">23 Nov 2025</td>
                    </tr>
                    <tr className="hover:bg-gray-50 bg-blue-50">
                      <td className="p-4 font-medium text-foreground">Nov-Dec 2025</td>
                      <td className="p-4 text-center text-red-600 font-medium">19 Jan 2026</td>
                      <td className="p-4 text-center text-red-600 font-medium">19 Jan 2026</td>
                      <td className="p-4 text-center text-green-600 font-medium">23 Jan 2026</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-6 grid md:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-red-50 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-1">Return Filing</h4>
                  <p className="text-sm text-red-700">19th (23rd for ROS)</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-semibold text-orange-800 mb-1">Payment Due</h4>
                  <p className="text-sm text-orange-700">Always 19th</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-1">Next Period</h4>
                  <p className="text-sm text-green-700">Starts immediately</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Different Return Periods */}
        <section className="py-20" data-animate>
          <div className="card-premium p-12 mb-2 hover-lift">
            <div className="text-center mb-2">
              <div className="icon-premium mb-3 mx-auto">
                <Building className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Different Return <span className="text-gradient-primary">Periods</span>
              </h2>
              <div className="w-24 h-1 gradient-primary mx-auto mb-4 rounded-full"></div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 text-center">
                Revenue assigns return periods based on your business size and turnover. Here's what determines your filing frequency.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="card-modern p-6 hover-lift border-l-4 border-blue-500">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-500" />
                      Monthly Returns
                    </h3>
                    <div className="space-y-2 mb-4">
                      <div className="text-sm text-muted-foreground">Assigned to:</div>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• High-turnover businesses (usually €3M+)</li>
                        <li>• Import/export businesses</li>
                        <li>• Businesses with large VAT liabilities</li>
                        <li>• Some specific sectors (fuel, alcohol)</li>
                      </ul>
                    </div>
                    <div className="text-xs text-blue-600 font-medium">
                      Due: 19th of following month (23rd for ROS)
                    </div>
                  </div>
                  
                  <div className="card-modern p-6 hover-lift border-l-4 border-green-500">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      Bi-Monthly Returns
                    </h3>
                    <div className="space-y-2 mb-4">
                      <div className="text-sm text-muted-foreground">Assigned to:</div>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Most Irish SMEs and startups</li>
                        <li>• Businesses with moderate turnover</li>
                        <li>• Service providers and consultants</li>
                        <li>• Retail and hospitality businesses</li>
                      </ul>
                    </div>
                    <div className="text-xs text-green-600 font-medium">
                      Due: 19th after two-month period (23rd for ROS)
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="card-modern p-6 hover-lift border-l-4 border-purple-500">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-purple-500" />
                      Four-Monthly Returns
                    </h3>
                    <div className="space-y-2 mb-4">
                      <div className="text-sm text-muted-foreground">Assigned to:</div>
                      <ul className="text-sm text-purple-700 space-y-1">
                        <li>• Small businesses with low VAT liability</li>
                        <li>• Seasonal businesses</li>
                        <li>• Businesses with minimal VAT activity</li>
                        <li>• Some agricultural enterprises</li>
                      </ul>
                    </div>
                    <div className="text-xs text-purple-600 font-medium">
                      Due: 19th after four-month period (23rd for ROS)
                    </div>
                  </div>
                  
                  <div className="card-modern p-6 hover-lift border-l-4 border-orange-500">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Award className="h-5 w-5 text-orange-500" />
                      Half-Yearly Returns
                    </h3>
                    <div className="space-y-2 mb-4">
                      <div className="text-sm text-muted-foreground">Assigned to:</div>
                      <ul className="text-sm text-orange-700 space-y-1">
                        <li>• Very small businesses (rare)</li>
                        <li>• Businesses with very low turnover</li>
                        <li>• Special circumstances only</li>
                        <li>• Must apply for this frequency</li>
                      </ul>
                    </div>
                    <div className="text-xs text-orange-600 font-medium">
                      Due: 19th after six-month period (23rd for ROS)
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-6 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <h4 className="font-semibold text-blue-800 mb-3">Can I Change My Return Period?</h4>
                <p className="text-sm text-blue-700 mb-2">
                  Revenue assigns return periods based on your business profile. You can request a change, but it's usually only approved if:
                </p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Your business circumstances have significantly changed</li>
                  <li>• Your turnover has increased or decreased substantially</li>
                  <li>• You have a valid business reason (cash flow, seasonality)</li>
                  <li>• You apply in writing with supporting evidence</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Penalty Calculator */}
        <section className="py-20" data-animate>
          <div className="card-modern p-12 mb-2 hover-lift" style={{background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(220, 38, 38, 0.1) 100%)'}}>
            <div className="text-center mb-2">
              <div className="icon-modern bg-red-500 mb-3 mx-auto">
                <Calculator className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Late Filing <span className="text-gradient-primary">Penalties</span>
              </h2>
              <div className="w-24 h-1 bg-red-500 mx-auto mb-4 rounded-full"></div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 text-center">
                Understand exactly what late filing costs so you can prioritize deadlines and avoid expensive mistakes.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 card-modern hover-lift border-l-4 border-orange-500">
                  <h3 className="font-semibold text-foreground mb-3">Initial Penalty</h3>
                  <div className="text-3xl font-bold text-orange-600 mb-2">€150</div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Applied immediately when return is filed late, regardless of amount due
                  </p>
                  <div className="text-xs text-orange-600">
                    Even for nil returns
                  </div>
                </div>

                <div className="text-center p-6 card-modern hover-lift border-l-4 border-red-500">
                  <h3 className="font-semibold text-foreground mb-3">Daily Penalty</h3>
                  <div className="text-3xl font-bold text-red-600 mb-2">€10</div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Per day after 20 days late, can accumulate quickly for extended delays
                  </p>
                  <div className="text-xs text-red-600">
                    After initial 20-day grace
                  </div>
                </div>

                <div className="text-center p-6 card-modern hover-lift border-l-4 border-red-700">
                  <h3 className="font-semibold text-foreground mb-3">Maximum Penalty</h3>
                  <div className="text-3xl font-bold text-red-700 mb-2">€1,500</div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Applied if return is more than 6 months late, regardless of daily accumulation
                  </p>
                  <div className="text-xs text-red-700">
                    Plus 8% annual interest
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-6 bg-red-50 rounded-lg border-l-4 border-red-500">
                <h4 className="font-semibold text-red-800 mb-3">Penalty Calculation Examples</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h5 className="font-medium text-red-800 mb-2">30 days late:</h5>
                    <ul className="text-red-700 space-y-1">
                      <li>• Initial penalty: €150</li>
                      <li>• Daily penalty (10 days × €10): €100</li>
                      <li>• <strong>Total: €250</strong></li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-red-800 mb-2">60 days late:</h5>
                    <ul className="text-red-700 space-y-1">
                      <li>• Initial penalty: €150</li>
                      <li>• Daily penalty (40 days × €10): €400</li>
                      <li>• <strong>Total: €550</strong></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section className="py-20" data-animate>
          <div className="card-premium p-12 mb-2 hover-lift">
            <div className="text-center mb-2">
              <div className="icon-premium mb-3 mx-auto">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Deadline <span className="text-gradient-primary">Best Practices</span>
              </h2>
              <div className="w-24 h-1 gradient-primary mx-auto mb-4 rounded-full"></div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 text-center">
                Follow these proven strategies to never miss a VAT deadline again.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    Smart Reminder System
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Set alerts 7, 3, and 1 day before deadline</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Use multiple reminder methods (email, phone, calendar)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Set payment reminders for 17th (2 days early)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Create recurring calendar events for all periods</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Preparation Strategy
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Keep records updated throughout the period</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Reconcile accounts before deadline week</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Use automated systems to reduce manual work</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">File early when possible (10th-15th)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Payment Management
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Ensure sufficient funds 2-3 days early</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Use direct debit for automatic payments</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Keep payment confirmations and receipts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Monitor bank account for successful debits</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Backup Plans
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Have multiple payment methods available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Know ROS access details and backups</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Have emergency contact for technical issues</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Use PayVat for automated compliance backup</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PayVat Deadline Protection */}
        <section className="py-20" data-animate>
          <div className="card-modern p-12 mb-2 hover-lift" style={{background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(22, 163, 74, 0.1) 100%)'}}>
            <div className="text-center mb-2">
              <div className="icon-modern bg-success mb-3 mx-auto">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                PayVat <span className="text-gradient-primary">Deadline Protection</span>
              </h2>
              <div className="w-24 h-1 bg-green-500 mx-auto mb-4 rounded-full"></div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 text-center">
                Never miss another VAT deadline with PayVat's automated compliance system.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 card-modern hover-lift">
                  <div className="icon-modern bg-blue-500 mb-4 mx-auto">
                    <Bell className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Smart Alerts</h3>
                  <p className="text-sm text-muted-foreground">
                    Automated reminders 7, 3, and 1 day before every deadline. Never rely on memory again.
                  </p>
                </div>

                <div className="text-center p-6 card-modern hover-lift">
                  <div className="icon-modern bg-green-500 mb-4 mx-auto">
                    <ChevronRight className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Auto Filing</h3>
                  <p className="text-sm text-muted-foreground">
                    Direct ROS integration files your returns automatically. No manual entry or delays.
                  </p>
                </div>

                <div className="text-center p-6 card-modern hover-lift">
                  <div className="icon-modern bg-purple-500 mb-4 mx-auto">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Real-time Status</h3>
                  <p className="text-sm text-muted-foreground">
                    Dashboard shows exactly what's due when. Always know your compliance status.
                  </p>
                </div>
              </div>
              
              <div className="mt-8 p-6 bg-green-50 rounded-lg border border-green-200">
                <div className="text-center">
                  <h4 className="font-semibold text-green-800 mb-3">Zero Late Filings Guarantee</h4>
                  <p className="text-sm text-green-700 mb-4">
                    PayVat customers have zero late filing records. Our automated system ensures returns are filed 
                    on time, every time. Focus on your business while we handle compliance.
                  </p>
                  <div className="text-xs text-green-600">
                    *Guarantee applies when using PayVat's automated filing features correctly
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
                    Never Miss Another <span className="text-gradient-primary">Deadline</span>
                  </h3>
                  <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    Join Irish businesses with perfect compliance records. Automate your VAT deadlines and eliminate penalty risk.
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
                    <span>Zero late filings</span>
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
              <a href="/avoid-revenue-penalties-ireland" className="text-primary hover:underline">Avoid penalties</a>
              <a href="/how-to-register-for-vat-ireland" className="text-primary hover:underline">VAT registration</a>
              <a href="/vat-rates-ireland" className="text-primary hover:underline">VAT rates</a>
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
