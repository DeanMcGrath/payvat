"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Clock, Users, Target, CheckCircle, Euro, Award, ChevronRight, TrendingUp, ArrowRight, Bell, FileText, Building, Calculator, MapPin } from 'lucide-react'
import Footer from "@/components/footer"
import SiteHeader from "@/components/site-header"

export default function AboutPayVat() {
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

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />


      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Who We Are */}
        <section className="py-20" data-animate>
          <div className="card-premium p-12 mb-2 hover-lift">
            <div className="text-center mb-2">
              <div className="icon-premium mb-3 mx-auto">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Who <span className="text-gradient-primary">We Are</span>
              </h2>
              <div className="w-24 h-1 gradient-primary mx-auto mb-4 rounded-full"></div>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  PayVat is an Irish company founded with a clear mission: simplify VAT compliance for Irish businesses. Founded by Irish entrepreneurs, we focus specifically on solving VAT submission challenges and helping businesses stay Revenue compliant.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Today, we provide dedicated VAT services including automated calculations, submissions, and compliance monitoring, plus comprehensive business setup guidance to help new businesses get started with proper VAT registration from day one.
                </p>
                
                <div className="flex items-center gap-4 p-6 card-modern hover-scale">
                  <div className="icon-modern bg-success">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">VAT Compliance Expertise</h3>
                    <p className="text-sm text-muted-foreground">Irish entrepreneurs with deep VAT and Revenue compliance knowledge</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-6 card-modern hover-scale">
                  <div className="text-3xl font-bold text-primary mb-2">€90</div>
                  <div className="text-sm text-muted-foreground">Monthly VAT service cost</div>
                </div>
                <div className="text-center p-6 card-modern hover-scale">
                  <div className="text-3xl font-bold text-primary mb-2">14</div>
                  <div className="text-sm text-muted-foreground">Day free trial</div>
                </div>
                <div className="text-center p-6 card-modern hover-scale">
                  <div className="text-3xl font-bold text-primary mb-2">2019</div>
                  <div className="text-sm text-muted-foreground">Founded & works with ROS</div>
                </div>
                <div className="text-center p-6 card-modern hover-scale">
                  <div className="text-3xl font-bold text-primary mb-2">100%</div>
                  <div className="text-sm text-muted-foreground">Irish business focused</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Vision */}
        <section className="py-20" data-animate>
          <div className="card-modern p-12 mb-2 hover-lift">
            <div className="text-center mb-2">
              <div className="icon-modern bg-primary mb-3 mx-auto">
                <Target className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Our <span className="text-gradient-primary">Vision</span>
              </h2>
              <div className="w-24 h-1 bg-primary mx-auto mb-4 rounded-full"></div>
            </div>
            
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-xl text-muted-foreground leading-relaxed mb-2">
                We believe every Irish business deserves simple, reliable VAT compliance without the complexity and high costs. From new businesses getting their first VAT number to established companies managing ongoing submissions - we make VAT management straightforward and affordable.
              </p>
              
              <div className="grid md:grid-cols-3 gap-8 mt-12">
                <div className="card-modern p-6 hover-lift group">
                  <div className="icon-modern bg-[#8FD0FC] mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">Time-Saving</h3>
                  <p className="text-sm text-muted-foreground">Automated VAT calculations and submissions</p>
                </div>
                
                <div className="card-modern p-6 hover-lift group">
                  <div className="icon-modern bg-[#73C2FB] mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">Revenue Compliant</h3>
                  <p className="text-sm text-muted-foreground">Built specifically for Irish Revenue requirements</p>
                </div>
                
                <div className="card-modern p-6 hover-lift group">
                  <div className="icon-modern bg-[#5BADEA] mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Euro className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">Affordable</h3>
                  <p className="text-sm text-muted-foreground">€90/month with no hidden fees</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Library Section */}
        <section className="py-20" data-animate>
          <div className="card-modern p-12 mb-2 hover-lift">
            <div className="text-center mb-2">
              <div className="icon-modern bg-primary mb-3 mx-auto">
                <FileText className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                <span className="text-gradient-primary">VAT Compliance</span> Resources
              </h2>
              <div className="w-24 h-1 bg-primary mx-auto mb-4 rounded-full"></div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Expert guides and tools covering VAT registration, submissions, and compliance for Irish businesses
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
              <div className="card-modern p-6 hover-lift group">
                <div className="icon-modern bg-[#8FD0FC] mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Building className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">Business Setup</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">€500 complete package with 6 months free VAT services</p>
                <div className="text-xs text-blue-600 font-medium">Full Service</div>
              </div>

              <div className="card-modern p-6 hover-lift group">
                <div className="icon-modern bg-[#73C2FB] mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Calculator className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">VAT Services</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">Automated calculations, submissions, and deadline reminders</p>
                <div className="text-xs text-blue-600 font-medium">€90/month</div>
              </div>

              <div className="card-modern p-6 hover-lift group">
                <div className="icon-modern bg-[#5BADEA] mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">Expert Support</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">Irish-based team available to help with VAT questions and issues</p>
                <div className="text-xs text-blue-600 font-medium">Always Available</div>
              </div>

              <div className="card-modern p-6 hover-lift group">
                <div className="icon-modern bg-[#004A75] mb-4 group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">Free Trial</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">14-day free trial to test our VAT services with no commitment</p>
                <div className="text-xs text-blue-600 font-medium">No Setup Fees</div>
              </div>
            </div>
          </div>
        </section>

        {/* What We Do */}
        <section className="py-20" data-animate>
          <div className="text-center mb-2">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">
              What <span className="text-gradient-primary">We Do</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive VAT management tools designed specifically for Irish businesses
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="card-modern p-8 hover-lift group">
              <div className="flex items-start gap-6">
                <div className="icon-premium mb-3 group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                    Self-Service VAT Filing
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Create your account on PayVat.ie and submit returns directly to the Revenue Commissioners.
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-success font-medium text-sm">
                    <CheckCircle className="h-4 w-4" />
                    <span>Direct to Revenue integration</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-modern p-8 hover-lift group">
              <div className="flex items-start gap-6">
                <div className="icon-modern bg-warning mb-2 group-hover:scale-110 transition-transform duration-300">
                  <Bell className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                    Automated Reminders
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Never miss a deadline—custom notifications keep you on track.
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-warning font-medium text-sm">
                    <Clock className="h-4 w-4" />
                    <span>7, 3, and 1 day alerts</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-modern p-8 hover-lift group">
              <div className="flex items-start gap-6">
                <div className="icon-modern bg-success mb-2 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                    Secure Payments
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    One-click VAT payments via Revenue's Online Service (ROS).
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-success font-medium text-sm">
                    <Shield className="h-4 w-4" />
                    <span>Secure encryption</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-premium p-8 hover-lift group">
              <div className="flex items-start gap-6">
                <div className="icon-premium mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Euro className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                    Transparent Pricing
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Flat monthly or annual fee—no surprises, no per-submission charges.
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-primary font-medium text-sm">
                    <Euro className="h-4 w-4" />
                    <span>€90/month or €900/year</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-20" data-animate>
          <div className="card-premium p-12 mb-4 hover-lift relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 gradient-mesh opacity-5"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-2">
                <div className="icon-premium mb-3 mx-auto">
                  <TrendingUp className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                  Why Choose <span className="text-gradient-primary">PayVat?</span>
                </h2>
                <div className="w-24 h-1 gradient-primary mx-auto mb-4 rounded-full"></div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="card-modern p-8 hover-lift group">
                  <div className="flex items-start gap-4">
                    <div className="icon-modern bg-success group-hover:scale-110 transition-transform duration-300">
                      <Euro className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">Save Money</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        At €90/month (or €900/year), more cost-effective than traditional accountant fees
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="card-modern p-8 hover-lift group">
                  <div className="flex items-start gap-4">
                    <div className="icon-modern bg-primary group-hover:scale-110 transition-transform duration-300">
                      <ChevronRight className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">Gain Control</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        You decide when and how to file—no waiting for your accountant's schedule
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="card-modern p-8 hover-lift group">
                  <div className="flex items-start gap-4">
                    <div className="icon-modern bg-[#8FD0FC] group-hover:scale-110 transition-transform duration-300">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">Speed & Simplicity</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Step-by-step wizard makes filing a breeze, even if VAT isn't your forte
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="card-modern p-8 hover-lift group">
                  <div className="flex items-start gap-4">
                    <div className="icon-modern bg-[#73C2FB] group-hover:scale-110 transition-transform duration-300">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">Dedicated Support</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Irish-based team available via email or chat to answer your questions
                      </p>
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
              {/* Background Elements */}
              <div className="absolute inset-0 gradient-mesh opacity-10"></div>
              
              <div className="relative z-10">
                <div className="mb-4">
                  <div className="icon-premium mb-3 mx-auto">
                    <Target className="h-12 w-12 text-white" />
                  </div>
                  
                  <h3 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">
                    Ready to Take <span className="text-gradient-primary">Control?</span>
                  </h3>
                  <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    Get back to focusing on growing your business. Experience streamlined VAT management today.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-2">
                  <Button 
                    size="lg"
                    className="btn-primary px-12 py-4 text-lg font-semibold hover-lift min-w-[220px]"
                    onClick={() => window.location.href = '/vat-guide'}
                  >
                    Get Started
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
      </div>

      {/* Live Chat */}

      {/* Footer */}
      <Footer />
    </div>
  )
}
