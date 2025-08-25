"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { FileText, Shield, CheckCircle, Clock, Scale, BookOpen, ArrowUp, Bell } from 'lucide-react'
import Footer from "@/components/footer"
import SiteHeader from "@/components/site-header"

export default function TermsPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [activeSection, setActiveSection] = useState('')

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
      
      // Update active section for table of contents
      const sections = document.querySelectorAll('section[id]')
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect()
        if (rect.top <= 100 && rect.bottom >= 100) {
          setActiveSection(section.id)
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

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader 
        searchPlaceholder="Search terms..."
        currentPage="Terms of Service"
        pageSubtitle="Legal & compliance documentation"
      />


      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-4 gap-12">
          {/* Table of Contents - Sidebar */}
          <div className="lg:col-span-1">
            <div className="card-modern p-6 sticky top-6">
              <h2 className="text-lg font-normal text-foreground mb-2 flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-primary" />
                Contents
              </h2>
              <nav className="space-y-2">
                {[
                  { id: 'acceptance', title: '1. Acceptance of Terms' },
                  { id: 'service', title: '2. Service Description' },
                  { id: 'responsibilities', title: '3. User Responsibilities' },
                  { id: 'payment', title: '4. Payment Terms' },
                  { id: 'liability', title: '5. Limitation of Liability' },
                  { id: 'data', title: '6. Data Protection' },
                  { id: 'availability', title: '7. Service Availability' },
                  { id: 'termination', title: '8. Termination' },
                  { id: 'changes', title: '9. Changes to Terms' },
                  { id: 'contact', title: '10. Contact Information' },
                  { id: 'law', title: '11. Governing Law' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 hover:bg-primary/10 hover:text-primary ${
                      activeSection === item.id 
                        ? 'bg-primary/10 text-primary font-normal' 
                        : 'text-muted-foreground'
                    }`}
                  >
                    {item.title}
                  </button>
                ))}
              </nav>
              
              <div className="mt-8 pt-6 border-t border-border">
                <div className="text-xs text-muted-foreground mb-2">
                  <strong>Last updated:</strong><br />
                  {new Date().toLocaleDateString()}
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={scrollToTop}
                  className="w-full mt-4"
                >
                  <ArrowUp className="h-4 w-4 mr-2" />
                  Back to Top
                </Button>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="card-premium p-12 space-y-12">

            <section id="acceptance" data-animate>
              <div className="flex items-start gap-4 mb-2">
                <div className="icon-modern bg-primary">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-normal text-foreground mb-1">1. Acceptance of Terms</h2>
                  <div className="w-16 h-1 bg-primary rounded-full"></div>
                </div>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                By accessing and using PayVAT, you accept and agree to be bound by the terms 
                and provision of this agreement. If you do not agree to these terms, you should 
                not use this service.
              </p>
            </section>

            <section id="service" data-animate>
              <div className="flex items-start gap-4 mb-2">
                <div className="icon-modern bg-petrol-light">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-normal text-foreground mb-1">2. Service Description</h2>
                  <div className="w-16 h-1 bg-petrol-light rounded-full"></div>
                </div>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed mb-2">
                PayVAT provides automated VAT return processing services for Irish businesses, including:
              </p>
              <div className="grid gap-4">
                <div className="card-modern p-4 hover-lift">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span className="font-normal text-foreground">Document analysis and VAT extraction</span>
                  </div>
                </div>
                <div className="card-modern p-4 hover-lift">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span className="font-normal text-foreground">Automated VAT return generation</span>
                  </div>
                </div>
                <div className="card-modern p-4 hover-lift">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span className="font-normal text-foreground">Secure document storage</span>
                  </div>
                </div>
                <div className="card-modern p-4 hover-lift">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span className="font-normal text-foreground">Payment processing for VAT submissions</span>
                  </div>
                </div>
              </div>
            </section>

            <section id="responsibilities" data-animate>
              <div className="flex items-start gap-4 mb-2">
                <div className="icon-modern bg-green-500">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-normal text-foreground mb-1">3. User Responsibilities</h2>
                  <div className="w-16 h-1 bg-green-500 rounded-full"></div>
                </div>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed mb-2">
                You agree to:
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 card-modern hover-lift">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-normal mt-1">✓</div>
                  <span className="text-foreground">Provide accurate and complete information</span>
                </div>
                <div className="flex items-start gap-3 p-4 card-modern hover-lift">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-normal mt-1">✓</div>
                  <span className="text-foreground">Maintain the security of your account credentials</span>
                </div>
                <div className="flex items-start gap-3 p-4 card-modern hover-lift">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-normal mt-1">✓</div>
                  <span className="text-foreground">Use the service only for legitimate business purposes</span>
                </div>
                <div className="flex items-start gap-3 p-4 card-modern hover-lift">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-normal mt-1">✓</div>
                  <span className="text-foreground">Comply with all applicable Irish VAT regulations</span>
                </div>
                <div className="flex items-start gap-3 p-4 card-modern hover-lift">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-normal mt-1">✓</div>
                  <span className="text-foreground">Review all generated VAT returns before submission</span>
                </div>
              </div>
            </section>

            <section id="payment" data-animate>
              <div className="flex items-start gap-4 mb-2">
                <div className="icon-modern bg-purple-500">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-normal text-foreground mb-1">4. Payment Terms</h2>
                  <div className="w-16 h-1 bg-purple-500 rounded-full"></div>
                </div>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed mb-2">
                Payment for services is due at the time of use. We accept payments via:
              </p>
              <div className="grid gap-4 mb-2">
                <div className="card-modern p-6 hover-lift">
                  <div className="flex items-center gap-4">
                    <div className="icon-modern bg-success">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-normal text-foreground mb-0">Credit and Debit Cards</h3>
                      <p className="text-sm text-muted-foreground">Processed securely via Stripe with secure encryption</p>
                    </div>
                  </div>
                </div>
                <div className="card-modern p-6 hover-lift">
                  <div className="flex items-center gap-4">
                    <div className="icon-modern bg-petrol-light">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-normal text-foreground mb-0">Bank Transfers</h3>
                      <p className="text-sm text-muted-foreground">Available for enterprise accounts with special terms</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-modern p-4 bg-warning/10 border-warning/20">
                <p className="text-foreground font-normal">
                  ⚠️ All fees are non-refundable unless otherwise specified in your service agreement.
                </p>
              </div>
            </section>

            <section id="liability" data-animate>
              <div className="flex items-start gap-4 mb-2">
                <div className="icon-modern bg-warning">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-normal text-foreground mb-1">5. Limitation of Liability</h2>
                  <div className="w-16 h-1 bg-warning rounded-full"></div>
                </div>
              </div>
              <div className="card-modern p-8 bg-warning/5 border-warning/20">
                <div className="flex items-start gap-4">
                  <Shield className="h-6 w-6 text-warning mt-1" />
                  <div>
                    <p className="text-lg text-foreground leading-relaxed">
                      PayVAT provides automated assistance with VAT processing but does not replace 
                      professional accounting advice. Users are responsible for reviewing all generated 
                      returns and ensuring compliance with Irish Revenue requirements. We are not liable 
                      for any penalties or issues arising from VAT submissions.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section id="data" data-animate>
              <div className="flex items-start gap-4 mb-2">
                <div className="icon-premium">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-normal text-foreground mb-1">6. Data Protection</h2>
                  <div className="w-16 h-1 gradient-primary rounded-full"></div>
                </div>
              </div>
              <div className="card-premium p-8">
                <p className="text-lg text-muted-foreground leading-relaxed mb-2">
                  We are committed to protecting your data in accordance with GDPR and Irish data 
                  protection laws. For details on how we collect and use your information, please 
                  refer to our Privacy Policy.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-success/10 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span className="font-normal text-foreground">GDPR Compliant</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-success/10 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span className="font-normal text-foreground">Irish Data Protection Laws</span>
                  </div>
                </div>
              </div>
            </section>

            <section id="availability" data-animate>
              <div className="flex items-start gap-4 mb-2">
                <div className="icon-modern bg-petrol-light">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-normal text-foreground mb-1">7. Service Availability</h2>
                  <div className="w-16 h-1 bg-petrol-light rounded-full"></div>
                </div>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed mb-2">
                We strive to maintain high service availability but cannot guarantee uninterrupted 
                access. Scheduled maintenance will be communicated in advance where possible.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card-modern p-6 text-center hover-lift">
                  <div className="text-3xl font-normal text-success mb-2">Reliable</div>
                  <div className="text-sm text-muted-foreground">Service</div>
                </div>
                <div className="card-modern p-6 text-center hover-lift">
                  <div className="text-3xl font-normal text-primary mb-2">Expert</div>
                  <div className="text-sm text-muted-foreground">Monitoring</div>
                </div>
              </div>
            </section>

            <section id="termination" data-animate>
              <div className="flex items-start gap-4 mb-2">
                <div className="icon-modern bg-orange-500">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-normal text-foreground mb-1">8. Termination</h2>
                  <div className="w-16 h-1 bg-orange-500 rounded-full"></div>
                </div>
              </div>
              <div className="card-modern p-6">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Either party may terminate this agreement at any time. Upon termination, your 
                  access to the service will cease, but you remain responsible for any outstanding 
                  payments.
                </p>
              </div>
            </section>

            <section id="changes" data-animate>
              <div className="flex items-start gap-4 mb-2">
                <div className="icon-modern bg-indigo-500">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-normal text-foreground mb-1">9. Changes to Terms</h2>
                  <div className="w-16 h-1 bg-indigo-500 rounded-full"></div>
                </div>
              </div>
              <div className="card-modern p-6">
                <p className="text-lg text-muted-foreground leading-relaxed mb-4">
                  We reserve the right to modify these terms at any time. Users will be notified 
                  of significant changes via email or through the service interface.
                </p>
                <div className="flex items-center gap-3 p-4 bg-indigo-500/10 rounded-lg">
                  <Bell className="h-5 w-5 text-indigo-500" />
                  <span className="text-foreground font-normal">You'll receive 30 days notice of any significant changes</span>
                </div>
              </div>
            </section>

            <section id="contact" data-animate>
              <div className="flex items-start gap-4 mb-2">
                <div className="icon-modern bg-green-500">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-normal text-foreground mb-1">10. Contact Information</h2>
                  <div className="w-16 h-1 bg-green-500 rounded-full"></div>
                </div>
              </div>
              <div className="card-modern p-8">
                <p className="text-lg text-muted-foreground leading-relaxed mb-2">
                  For questions about these Terms of Service, please contact us at:
                </p>
                <div className="card-premium p-6 text-center">
                  <div className="icon-modern bg-success mb-4 mx-auto">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-normal text-foreground mb-1">Email Support</h3>
                  <a href="mailto:support@payvat.ie" className="text-primary hover:text-primary/80 font-normal transition-colors">
                    support@payvat.ie
                  </a>
                  <p className="text-sm text-muted-foreground mt-2">We respond within 24 hours</p>
                </div>
              </div>
            </section>

            <section id="law" data-animate>
              <div className="flex items-start gap-4 mb-2">
                <div className="icon-premium">
                  <Scale className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-normal text-foreground mb-1">11. Governing Law</h2>
                  <div className="w-16 h-1 gradient-primary rounded-full"></div>
                </div>
              </div>
              <div className="card-premium p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="icon-modern bg-success">
                    <Scale className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-normal text-foreground">Irish Law Jurisdiction</h3>
                    <p className="text-sm text-muted-foreground">All disputes subject to Irish courts</p>
                  </div>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  These terms are governed by Irish law and any disputes will be subject to the 
                  jurisdiction of Irish courts.
                </p>
              </div>
            </section>
            </div>
          </div>
        </div>
      </div>

      {/* Live Chat */}

      {/* Footer */}
      <Footer />
    </div>
  )
}
