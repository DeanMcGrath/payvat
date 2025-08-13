"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Clock, Users, Target, CheckCircle, Euro, Award, Zap, TrendingUp, ArrowRight, Bell, FileText, Building, UserCheck, Search, AlertCircle } from 'lucide-react'
import Footer from "@/components/footer"
import SiteHeader from "@/components/site-header"

export default function RegisterBusinessNameIreland() {
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
        searchPlaceholder="Search business registration guides..."
        currentPage="Business Name Registration Ireland"
        pageSubtitle="Step-by-step guide to registering your business name"
      />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <div className="max-w-4xl mx-auto animate-fade-in">
              <div className="mb-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3 animate-bounce-gentle">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse-gentle"></div>
                  Updated for 2025 CRO requirements
                </div>
                
                <div className="icon-premium mb-3 mx-auto">
                  <FileText className="h-12 w-12 text-white" />
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-2">
                  <span className="text-gradient-primary">Register Your Business Name</span>
                  <br />
                  <span className="text-foreground">in Ireland</span>
                </h1>
                
                <div className="w-32 h-1 gradient-primary mx-auto mb-4 rounded-full"></div>
                
                <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Complete guide to business name registration in Ireland. From availability checks to incorporation—protect your brand and get trading legally.
                </p>
              </div>
              
              <div className="flex items-center justify-center gap-8 text-muted-foreground text-sm mb-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-success" />
                  <span>CRO compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>7-day registration</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-success" />
                  <span>Irish businesses served</span>
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

        {/* Quick Process Overview */}
        <section className="py-20" data-animate>
          <div className="card-premium p-12 mb-2 hover-lift">
            <div className="text-center mb-2">
              <div className="icon-premium mb-3 mx-auto">
                <Target className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Business Name Registration <span className="text-gradient-primary">Process</span>
              </h2>
              <div className="w-24 h-1 gradient-primary mx-auto mb-4 rounded-full"></div>
            </div>
            
            <div className="grid lg:grid-cols-4 gap-6">
              <div className="card-modern p-6 hover-lift text-center">
                <div className="icon-modern bg-blue-500 mb-4 mx-auto">
                  <Search className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">1. Check Availability</h3>
                <p className="text-sm text-muted-foreground">Search CRO database for existing names and trademarks</p>
                <div className="mt-3 text-xs text-blue-600 font-medium">FREE - 2 minutes</div>
              </div>

              <div className="card-modern p-6 hover-lift text-center">
                <div className="icon-modern bg-green-500 mb-4 mx-auto">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">2. Reserve Name</h3>
                <p className="text-sm text-muted-foreground">Secure your chosen name for 28 days while preparing documents</p>
                <div className="mt-3 text-xs text-green-600 font-medium">€25 - Same day</div>
              </div>

              <div className="card-modern p-6 hover-lift text-center">
                <div className="icon-modern bg-purple-500 mb-4 mx-auto">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">3. Prepare Documents</h3>
                <p className="text-sm text-muted-foreground">Complete Form A1 and gather required incorporation documents</p>
                <div className="mt-3 text-xs text-purple-600 font-medium">1-3 days prep</div>
              </div>

              <div className="card-modern p-6 hover-lift text-center">
                <div className="icon-modern bg-warning mb-4 mx-auto">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">4. Submit & Launch</h3>
                <p className="text-sm text-muted-foreground">File incorporation application and receive company number</p>
                <div className="mt-3 text-xs text-yellow-600 font-medium">€100 - 5-7 days</div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-green-50 rounded-lg border-l-4 border-green-500">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-800 mb-1">Total Cost: €125 | Total Time: 7-10 days</h4>
                  <p className="text-sm text-green-700">
                    This covers your complete business registration. Add VAT registration (free) and business banking to be fully operational.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Step 1: Name Availability Check */}
        <section className="py-20" data-animate>
          <div className="card-modern p-12 mb-2 hover-lift">
            <div className="text-center mb-2">
              <div className="icon-modern bg-blue-500 mb-3 mx-auto">
                <Search className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Step 1: Check Name <span className="text-gradient-primary">Availability</span>
              </h2>
              <div className="w-24 h-1 bg-primary mx-auto mb-4 rounded-full"></div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 text-center">
                Before you fall in love with a name, make sure it's available. Irish company names must be unique and follow specific rules.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">Where to Search</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">CRO Database</p>
                        <p className="text-sm text-muted-foreground">Search all existing Irish company names</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Trademark Registry</p>
                        <p className="text-sm text-muted-foreground">Check for existing trademarks in your sector</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Domain Names</p>
                        <p className="text-sm text-muted-foreground">Secure matching .ie and .com domains</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Social Media</p>
                        <p className="text-sm text-muted-foreground">Check handle availability across platforms</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">Name Requirements</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Must include "Limited" or "Teoranta"</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Cannot suggest government connection</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Must not be offensive or misleading</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Should reflect business activity</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-yellow-800">
                          <strong>Pro tip:</strong> Choose 3-5 name options. Similar names may be rejected even if not identical.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Step 2: Name Reservation */}
        <section className="py-20" data-animate>
          <div className="card-premium p-12 mb-2 hover-lift">
            <div className="text-center mb-2">
              <div className="icon-premium mb-3 mx-auto">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Step 2: Reserve Your <span className="text-gradient-primary">Name</span>
              </h2>
              <div className="w-24 h-1 gradient-primary mx-auto mb-4 rounded-full"></div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 text-center">
                Name reservation gives you 28 days to complete your incorporation while protecting your chosen name from other applicants.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">Reservation Process</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-semibold">1</div>
                      <div>
                        <p className="font-medium text-foreground">Submit online application</p>
                        <p className="text-sm text-muted-foreground">Through CRO website with proposed name</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-semibold">2</div>
                      <div>
                        <p className="font-medium text-foreground">Pay €25 reservation fee</p>
                        <p className="text-sm text-muted-foreground">Credit card payment processed immediately</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-semibold">3</div>
                      <div>
                        <p className="font-medium text-foreground">Receive confirmation</p>
                        <p className="text-sm text-muted-foreground">Usually within same business day</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-semibold">4</div>
                      <div>
                        <p className="font-medium text-foreground">Begin document preparation</p>
                        <p className="text-sm text-muted-foreground">28-day countdown starts from approval</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">What Happens Next</h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">If Approved</h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Name reserved for 28 days</li>
                        <li>• Proceed with incorporation documents</li>
                        <li>• Begin business setup (banking, VAT, etc.)</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-red-50 rounded-lg">
                      <h4 className="font-semibold text-red-800 mb-2">If Rejected</h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        <li>• Full refund processed automatically</li>
                        <li>• Feedback provided on rejection reason</li>
                        <li>• Submit alternative name immediately</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <p className="text-sm text-blue-800">
                      <strong>Extension possible:</strong> If you need more time, you can extend the reservation for another €25, up to maximum 12 months total.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Step 3: Document Preparation */}
        <section className="py-20" data-animate>
          <div className="card-modern p-12 mb-2 hover-lift">
            <div className="text-center mb-2">
              <div className="icon-modern bg-purple-500 mb-3 mx-auto">
                <FileText className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Step 3: Document <span className="text-gradient-primary">Preparation</span>
              </h2>
              <div className="w-24 h-1 bg-primary mx-auto mb-4 rounded-full"></div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 text-center">
                Proper document preparation ensures smooth incorporation. Get these right to avoid delays and queries from the CRO.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">Required Documents</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Form A1 (Incorporation Application)</p>
                        <p className="text-sm text-muted-foreground">Complete company details and officers</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Memorandum of Association</p>
                        <p className="text-sm text-muted-foreground">Company objects and share capital</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Articles of Association</p>
                        <p className="text-sm text-muted-foreground">Internal rules and procedures</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Statement of Compliance</p>
                        <p className="text-sm text-muted-foreground">Declaration by qualified person</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">Officer Requirements</h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-2">Directors</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Minimum one director (EU resident)</li>
                        <li>• Must be over 18 years old</li>
                        <li>• Cannot be an undischarged bankrupt</li>
                        <li>• Provide PPS number and ID</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-2">Company Secretary</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Can be individual or corporate body</li>
                        <li>• Cannot be sole director</li>
                        <li>• Must have Irish address</li>
                        <li>• Responsible for compliance</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-green-800">
                          <strong>PayVat helps:</strong> We can connect you with qualified professionals for company secretarial services and ensure all documents are CRO-compliant.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Step 4: Submission & Next Steps */}
        <section className="py-20" data-animate>
          <div className="card-premium p-12 mb-2 hover-lift">
            <div className="text-center mb-2">
              <div className="icon-premium mb-3 mx-auto">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Step 4: Submit & <span className="text-gradient-primary">Launch</span>
              </h2>
              <div className="w-24 h-1 gradient-primary mx-auto mb-4 rounded-full"></div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 text-center">
                Final submission to the CRO and immediate next steps to get your business operational and compliant.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">Submission Process</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-semibold">1</div>
                      <div>
                        <p className="font-medium text-foreground">Submit complete application</p>
                        <p className="text-sm text-muted-foreground">Online via CRO portal with €100 fee</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-semibold">2</div>
                      <div>
                        <p className="font-medium text-foreground">CRO review (5-7 days)</p>
                        <p className="text-sm text-muted-foreground">Automated checks and manual review</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-semibold">3</div>
                      <div>
                        <p className="font-medium text-foreground">Receive company number</p>
                        <p className="text-sm text-muted-foreground">Certificate of incorporation issued</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-semibold">4</div>
                      <div>
                        <p className="font-medium text-foreground">Begin trading</p>
                        <p className="text-sm text-muted-foreground">Company legally exists and can operate</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">Immediate Next Steps</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Get Tax Reference Number from Revenue</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Register for VAT (if required)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Set up ROS access for tax filing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Open business bank account</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Get business insurance</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm">Create PayVat account for VAT management</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <h4 className="font-semibold text-blue-800 mb-2">Annual Obligations</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Annual Return (Form B1) - due by anniversary</li>
                      <li>• Audited accounts filing - 28 days after AGM</li>
                      <li>• Corporation tax returns - 9 months after year-end</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Common Mistakes to Avoid */}
        <section className="py-20" data-animate>
          <div className="card-modern p-12 mb-2 hover-lift">
            <div className="text-center mb-2">
              <div className="icon-modern bg-destructive mb-3 mx-auto">
                <AlertCircle className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Common Mistakes <span className="text-gradient-primary">to Avoid</span>
              </h2>
              <div className="w-24 h-1 bg-primary mx-auto mb-4 rounded-full"></div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-destructive text-white text-sm flex items-center justify-center font-semibold">1</div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Not checking similar names</h4>
                      <p className="text-sm text-muted-foreground">CRO may reject names too similar to existing companies, even if not identical</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-destructive text-white text-sm flex items-center justify-center font-semibold">2</div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Incomplete or incorrect Form A1</h4>
                      <p className="text-sm text-muted-foreground">Errors cause delays and may require resubmission with new fees</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-destructive text-white text-sm flex items-center justify-center font-semibold">3</div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Missing EU resident director</h4>
                      <p className="text-sm text-muted-foreground">At least one director must be resident in EU/EEA for all Irish companies</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-destructive text-white text-sm flex items-center justify-center font-semibold">4</div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Forgetting about domain names</h4>
                      <p className="text-sm text-muted-foreground">Secure .ie and .com domains before finalising company name</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-destructive text-white text-sm flex items-center justify-center font-semibold">5</div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Delaying tax registration</h4>
                      <p className="text-sm text-muted-foreground">Get TRN and VAT setup immediately to avoid compliance issues</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-destructive text-white text-sm flex items-center justify-center font-semibold">6</div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">Poor registered office address</h4>
                      <p className="text-sm text-muted-foreground">Use a permanent Irish address where official mail can be received</p>
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
                    Ready to <span className="text-gradient-primary">Register Your Business?</span>
                  </h3>
                  <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    Join Irish entrepreneurs. Get your business name registered and VAT-ready in one streamlined process.
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
                    <span>Expert guidance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-success" />
                    <span>7-day registration</span>
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