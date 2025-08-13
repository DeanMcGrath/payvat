"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Clock, Users, Target, CheckCircle, Euro, Award, ChevronRight, TrendingUp, ArrowRight, Bell, FileText, Building, UserCheck, AlertTriangle, Calculator, Calendar, Globe } from 'lucide-react'
import Footer from "@/components/footer"
import SiteHeader from "@/components/site-header"

export default function HowToRegisterForVATIreland() {
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
        searchPlaceholder="Search VAT registration guides..."
        currentPage="How to Register for VAT Ireland"
        pageSubtitle="Complete guide to Irish VAT registration in 2025"
      />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <div className="max-w-4xl mx-auto animate-fade-in">
              <div className="mb-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3 animate-bounce-gentle">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse-gentle"></div>
                  Updated for 2025 thresholds and deadlines
                </div>
                
                <div className="icon-premium mb-3 mx-auto">
                  <FileText className="h-12 w-12 text-white" />
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-2">
                  <span className="text-gradient-primary">How to Register for VAT</span>
                  <br />
                  <span className="text-foreground">in Ireland</span>
                </h1>
                
                <div className="w-32 h-1 gradient-primary mx-auto mb-4 rounded-full"></div>
                
                <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Step-by-step guide to VAT registration in Ireland. Understand thresholds, gather documents, submit applications, and avoid costly delays. Get registered correctly and on time.
                </p>
              </div>
              
              <div className="flex items-center justify-center gap-8 text-muted-foreground text-sm mb-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-success" />
                  <span>Revenue approved</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>2025 thresholds</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-success" />
                  <span>Irish businesses registered</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="absolute top-20 left-10 w-16 h-16 gradient-accent rounded-full blur-xl opacity-20 animate-float"></div>
          <div className="absolute top-32 right-20 w-12 h-12 gradient-primary rounded-full blur-lg opacity-30 animate-float" style={{animationDelay: '-2s'}}></div>
          <div className="absolute bottom-20 left-20 w-20 h-20 gradient-glass rounded-full blur-2xl opacity-25 animate-float" style={{animationDelay: '-4s'}}></div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Registration Thresholds 2025 */}
        <section className="py-20" data-animate>
          <div className="card-premium p-12 mb-2 hover-lift">
            <div className="text-center mb-2">
              <div className="icon-premium mb-3 mx-auto">
                <Calculator className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                VAT Registration <span className="text-gradient-primary">Thresholds 2025</span>
              </h2>
              <div className="w-24 h-1 gradient-primary mx-auto mb-4 rounded-full"></div>
            </div>
            
            <div className="max-w-6xl mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 text-center">
                You must register for VAT when your taxable turnover exceeds these thresholds in any rolling 12-month period.
              </p>
              
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="card-modern p-8 hover-lift border-l-4 border-blue-500">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="icon-modern bg-blue-500">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">€42,500</h3>
                      <p className="text-muted-foreground">Services threshold</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <h4 className="font-semibold text-foreground">Includes:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Professional services (legal, accounting, consulting)</li>
                      <li>• Digital services and software</li>
                      <li>• Marketing and advertising services</li>
                      <li>• Repair and maintenance services</li>
                      <li>• Training and education services</li>
                      <li>• Financial and insurance services</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Key point:</strong> This is for services where the place of supply is Ireland, 
                      regardless of where you're physically located.
                    </p>
                  </div>
                </div>

                <div className="card-modern p-8 hover-lift border-l-4 border-green-500">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="icon-modern bg-green-500">
                      <Building className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">€85,000</h3>
                      <p className="text-muted-foreground">Goods threshold</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <h4 className="font-semibold text-foreground">Includes:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Physical products and merchandise</li>
                      <li>• Food, drinks, and groceries</li>
                      <li>• Electronics and appliances</li>
                      <li>• Clothing and accessories</li>
                      <li>• Books, magazines, and media</li>
                      <li>• Tools, equipment, and machinery</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Key point:</strong> Applies to goods supplied within Ireland, 
                      including distance sales from other EU countries.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-800 mb-2">Mixed Business Alert</h4>
                    <p className="text-sm text-yellow-700">
                      If you supply both goods and services, monitor both thresholds separately. 
                      You must register when either threshold is exceeded, not the combined total.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* When to Register */}
        <section className="py-20" data-animate>
          <div className="card-modern p-12 mb-2 hover-lift">
            <div className="text-center mb-2">
              <div className="icon-modern bg-warning mb-3 mx-auto">
                <Calendar className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                When to <span className="text-gradient-primary">Register</span>
              </h2>
              <div className="w-24 h-1 bg-primary mx-auto mb-4 rounded-full"></div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 text-center">
                Timing is critical. Register too late and face penalties. Register strategically and optimize your VAT position.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Mandatory Registration
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                      <h4 className="font-semibold text-red-800 mb-2">You MUST register within 30 days if:</h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        <li>• Turnover has exceeded the threshold</li>
                        <li>• You expect to exceed threshold in next 30 days</li>
                        <li>• You're making taxable supplies in Ireland</li>
                        <li>• You're acquiring goods from other EU countries</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <h4 className="font-semibold text-orange-800 mb-2">Penalty for Late Registration</h4>
                      <ul className="text-sm text-orange-700 space-y-1">
                        <li>• 5% of tax due (minimum €125, maximum €12,695)</li>
                        <li>• Back-dated VAT liability from threshold date</li>
                        <li>• Interest at 8% per year on all amounts</li>
                        <li>• Potential investigation and further penalties</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Voluntary Registration
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                      <h4 className="font-semibold text-green-800 mb-2">You MAY register early if:</h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• You want to reclaim input VAT on startup costs</li>
                        <li>• Customers expect you to be VAT registered</li>
                        <li>• You're planning rapid business growth</li>
                        <li>• You want to appear more established</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Benefits of Early Registration</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Reclaim VAT on pre-registration expenses</li>
                        <li>• Professional credibility with B2B customers</li>
                        <li>• No surprise compliance requirements</li>
                        <li>• Better cash flow management planning</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Registration Process */}
        <section className="py-20" data-animate>
          <div className="card-premium p-12 mb-2 hover-lift">
            <div className="text-center mb-2">
              <div className="icon-premium mb-3 mx-auto">
                <UserCheck className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Registration <span className="text-gradient-primary">Process</span>
              </h2>
              <div className="w-24 h-1 gradient-primary mx-auto mb-4 rounded-full"></div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 text-center">
                Follow these steps to register correctly and avoid delays or rejections.
              </p>
              
              <div className="space-y-8">
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-full bg-primary text-white text-lg flex items-center justify-center font-semibold flex-shrink-0">1</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-3">Get Your Tax Reference Number (TRN)</h3>
                    <p className="text-muted-foreground mb-4">
                      You need a TRN before applying for VAT registration. If you don't have one, apply through Revenue's MyAccount or submit Form TR1 (individuals) or TR2 (companies).
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 card-modern">
                        <h4 className="font-semibold text-foreground mb-2">For Individuals/Sole Traders</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Complete Form TR1</li>
                          <li>• Provide PPS number and ID</li>
                          <li>• Processing time: 5-10 days</li>
                        </ul>
                      </div>
                      <div className="p-4 card-modern">
                        <h4 className="font-semibold text-foreground mb-2">For Companies</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Complete Form TR2</li>
                          <li>• Provide CRO number and incorporation cert</li>
                          <li>• Processing time: 7-14 days</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-full bg-primary text-white text-lg flex items-center justify-center font-semibold flex-shrink-0">2</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-3">Complete VAT Registration Application</h3>
                    <p className="text-muted-foreground mb-4">
                      Apply through ROS or submit paper forms. Online applications are processed faster and are less prone to errors.
                    </p>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-blue-800 mb-2">Required Information</h4>
                        <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-700">
                          <ul className="space-y-1">
                            <li>• Business name and address</li>
                            <li>• Nature of business activities</li>
                            <li>• Expected annual turnover</li>
                            <li>• Date business commenced</li>
                          </ul>
                          <ul className="space-y-1">
                            <li>• Bank account details</li>
                            <li>• Accounting period dates</li>
                            <li>• Principal place of business</li>
                            <li>• Contact details</li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-semibold text-green-800 mb-2">Documents to Provide</h4>
                        <div className="grid md:grid-cols-2 gap-4 text-sm text-green-700">
                          <ul className="space-y-1">
                            <li>• Evidence of business activity</li>
                            <li>• Sample invoices or contracts</li>
                            <li>• Proof of business premises</li>
                            <li>• Director/owner identification</li>
                          </ul>
                          <ul className="space-y-1">
                            <li>• Bank statements (business account)</li>
                            <li>• Business plan or projections</li>
                            <li>• CRO certificate (companies)</li>
                            <li>• Professional body membership</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-full bg-primary text-white text-lg flex items-center justify-center font-semibold flex-shrink-0">3</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-3">Submit Application and Await Processing</h3>
                    <p className="text-muted-foreground mb-4">
                      Revenue will review your application and may request additional information. Response time is typically 15-30 days.
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 card-modern">
                        <h4 className="font-semibold text-foreground mb-2">If Approved</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• VAT number issued (IE + 7 digits + letter)</li>
                          <li>• VAT certificate posted to you</li>
                          <li>• Return periods assigned (usually bi-monthly)</li>
                          <li>• First return due date notified</li>
                        </ul>
                      </div>
                      <div className="p-4 card-modern">
                        <h4 className="font-semibold text-foreground mb-2">If Queries Raised</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Respond quickly with requested info</li>
                          <li>• Delays can push effective date back</li>
                          <li>• Keep monitoring ROS inbox</li>
                          <li>• Follow up if no response within 30 days</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-full bg-primary text-white text-lg flex items-center justify-center font-semibold flex-shrink-0">4</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-3">Set Up Compliance Systems</h3>
                    <p className="text-muted-foreground mb-4">
                      Once registered, implement systems to stay compliant and avoid penalties.
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span className="text-sm">Update invoices with VAT number and correct rates</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span className="text-sm">Set up deadline reminders for VAT returns</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span className="text-sm">Create system for tracking input VAT</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span className="text-sm">Create PayVat account for automated compliance</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Special Situations */}
        <section className="py-20" data-animate>
          <div className="card-modern p-12 mb-2 hover-lift">
            <div className="text-center mb-2">
              <div className="icon-modern bg-purple-500 mb-3 mx-auto">
                <Globe className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Special <span className="text-gradient-primary">Situations</span>
              </h2>
              <div className="w-24 h-1 bg-primary mx-auto mb-4 rounded-full"></div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 text-center">
                Some business situations have specific VAT registration requirements or considerations.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="p-6 card-modern hover-lift">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Building className="h-5 w-5 text-primary" />
                      Non-Resident Businesses
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Businesses located outside Ireland but making taxable supplies here.
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Must register if threshold exceeded</li>
                      <li>• No fiscal representative required</li>
                      <li>• Need Irish bank account or payment system</li>
                      <li>• Additional compliance reporting may apply</li>
                    </ul>
                  </div>
                  
                  <div className="p-6 card-modern hover-lift">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Distance Sales (E-commerce)
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Selling goods online to Irish customers from other EU countries.
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• €10,000 EU-wide threshold applies</li>
                      <li>• Consider OSS (One Stop Shop) scheme</li>
                      <li>• B2C vs B2B rules differ</li>
                      <li>• Platform sales may have special rules</li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="p-6 card-modern hover-lift">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <UserCheck className="h-5 w-5 text-primary" />
                      Exempt Businesses
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Businesses normally exempt but receiving services from abroad.
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• May need to register for reverse charge</li>
                      <li>• Common for financial, medical, education</li>
                      <li>• Registration required regardless of value</li>
                      <li>• Limited input VAT recovery rights</li>
                    </ul>
                  </div>
                  
                  <div className="p-6 card-modern hover-lift">
                    <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-primary" />
                      Acquisitions from EU
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Acquiring goods from other EU member states.
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• €41,000 annual threshold</li>
                      <li>• Automatic registration above threshold</li>
                      <li>• Self-accounting for acquisition VAT</li>
                      <li>• VIES reporting requirements</li>
                    </ul>
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
              <div className="icon-premium mb-3 mx-auto" style={{background: 'linear-gradient(to bottom right, #dc2626, #991b1b)'}}>
                <AlertTriangle className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Common Mistakes <span className="text-gradient-primary">to Avoid</span>
              </h2>
              <div className="w-24 h-1 bg-red-500 mx-auto mb-4 rounded-full"></div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-red-500 text-white text-sm flex items-center justify-center font-semibold">1</div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Leaving registration too late</h4>
                      <p className="text-sm text-muted-foreground">Monitor turnover monthly. Register when you expect to hit threshold, not after you've exceeded it.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-red-500 text-white text-sm flex items-center justify-center font-semibold">2</div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Insufficient evidence of trade</h4>
                      <p className="text-sm text-muted-foreground">Provide real invoices, contracts, or evidence of actual business activity. Revenue checks thoroughly.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-red-500 text-white text-sm flex items-center justify-center font-semibold">3</div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Mixing personal and business</h4>
                      <p className="text-sm text-muted-foreground">Keep business and personal finances completely separate from day one of trading.</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-red-500 text-white text-sm flex items-center justify-center font-semibold">4</div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Vague business description</h4>
                      <p className="text-sm text-muted-foreground">Be specific about what you do. "Consultancy" is too vague. "IT security consulting" is better.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-red-500 text-white text-sm flex items-center justify-center font-semibold">5</div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Not setting up ROS access</h4>
                      <p className="text-sm text-muted-foreground">Get ROS set up immediately. You'll need it for filing returns and avoiding penalties.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-red-500 text-white text-sm flex items-center justify-center font-semibold">6</div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Ignoring ongoing compliance</h4>
                      <p className="text-sm text-muted-foreground">Registration is just the start. Set up systems to stay compliant with returns and payments.</p>
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
                    Ready to <span className="text-gradient-primary">Register for VAT?</span>
                  </h3>
                  <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    Get registered correctly and stay compliant with PayVat. We guide you through registration and handle ongoing compliance automatically.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-2">
                  <Button 
                    size="lg"
                    className="btn-primary px-12 py-4 text-lg font-semibold hover-lift min-w-[220px]"
                    onClick={() => window.location.href = '/signup'}
                  >
                    Start Registration
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
                    <span>Registration guidance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-success" />
                    <span>Ongoing compliance</span>
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
              <a href="/vat-thresholds-ireland" className="text-primary hover:underline">VAT thresholds</a>
              <a href="/vat-deadlines-ireland" className="text-primary hover:underline">VAT deadlines</a>
              <a href="/avoid-revenue-penalties-ireland" className="text-primary hover:underline">Avoid penalties</a>
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