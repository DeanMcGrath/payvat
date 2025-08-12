"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Shield, Clock, FileText, Mail, Phone, MessageCircle, MapPin, Play, Bell } from 'lucide-react'
import { useEffect, useState } from 'react'
import Footer from "@/components/footer"
import { VideoModal } from "@/components/video-modal"
import SiteHeader from "@/components/site-header"

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [showVideoModal, setShowVideoModal] = useState(false)

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
      <SiteHeader 
        searchPlaceholder="Search..."
        pageSubtitle="Irish VAT compliance made simple"
      />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            {/* Hero Content */}
            <div className="max-w-4xl mx-auto animate-fade-in">
              <div className="mb-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3 animate-bounce-gentle">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse-gentle"></div>
                  Expert VAT Guidance, Trusted by Irish businesses
                </div>
                
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-3">
                  <span className="text-gradient-primary">Simplify Your VAT</span>
                  <br />
                  <span className="text-foreground">Submission & Payments</span>
                </h1>
                
                <div className="w-32 h-1 gradient-primary mx-auto mb-4 rounded-full"></div>
                
                <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Professional VAT return submission and payment processing for Irish businesses. 
                  <span className="text-primary font-semibold">Complete your obligations in minutes, not hours.</span>
                </p>
              </div>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-3">
                <Button size="lg" className="btn-primary px-8 py-4 text-lg font-semibold hover-lift" onClick={() => window.location.href = '/vat-guide'}>
                  Get Started
                  <CheckCircle className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" className="btn-outline px-8 py-4 text-lg" onClick={() => setShowVideoModal(true)}>
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex items-center justify-center gap-8 text-muted-foreground text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-success" />
                  <span>Secure</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>Revenue compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-success" />
                  <span>24/7 support</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Background Elements */}
          <div className="absolute top-20 left-10 w-16 h-16 gradient-accent rounded-full blur-xl opacity-20 animate-float"></div>
          <div className="absolute top-32 right-20 w-12 h-12 gradient-primary rounded-full blur-lg opacity-30 animate-float" style={{animationDelay: '-2s'}}></div>
          <div className="absolute bottom-20 left-20 w-20 h-20 gradient-glass rounded-full blur-2xl opacity-25 animate-float" style={{animationDelay: '-4s'}}></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-4 animate-slide-up">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
              Everything You Need for 
              <span className="text-gradient-primary"> VAT Management</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Professional tools designed specifically for Irish businesses to streamline VAT compliance
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8" data-animate>
            {/* Feature 1 */}
            <div className="card-modern p-8 text-center hover-lift group">
              <div className="icon-premium mb-3 mx-auto group-hover:scale-110 transition-transform duration-300">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Smart Submission</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Intelligent step-by-step VAT return process with automatic calculations and error checking
              </p>
              <div className="status-success inline-flex">
                <CheckCircle className="h-4 w-4 mr-1" />
                Works with ROS
              </div>
            </div>

            {/* Feature 2 */}
            <div className="card-modern p-8 text-center hover-lift group">
              <div className="icon-premium mb-3 mx-auto group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Secure Payments</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
              Secure encryption with simple payment using ROS Debit Instruction, you pay direct to Revenue with instant confirmation and charged to your bank account in 1-3 days.
              </p>
              <div className="status-success inline-flex">
                <Shield className="h-4 w-4 mr-1" />
                PCI Compliant
              </div>
            </div>

            {/* Feature 3 */}
            <div className="card-modern p-8 text-center hover-lift group">
              <div className="icon-premium mb-3 mx-auto group-hover:scale-110 transition-transform duration-300">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Save Time</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Complete VAT obligations in minutes with automated calculations and smart data import
              </p>
              <div className="status-success inline-flex">
                <Clock className="h-4 w-4 mr-1" />
                95% Time Saved
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="card-premium p-12 text-center relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 gradient-mesh opacity-10"></div>
            
            <div className="relative z-10">
              <div className="mb-2">
                <h3 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">
                  Ready to Modernize Your
                  <span className="text-gradient-primary"> VAT Process?</span>
                </h3>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Join today and be one of the first Irish businesses to streamlined their VAT compliance with PayVAT
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-2">
                <Button 
                  size="lg"
                  className="btn-primary px-12 py-4 text-lg font-semibold hover-lift min-w-[220px]"
                  onClick={() => window.location.href = '/vat-guide'}
                >
                  Get Started
                  <CheckCircle className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  className="btn-outline px-12 py-4 text-lg min-w-[220px]"
                  onClick={() => window.location.href = '/pricing'}
                >
                  View Pricing
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground">
                ✓ Revenue compliant  ✓ Expert support  ✓ Instant processing
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-4 animate-slide-up">
            <h4 className="text-3xl font-bold text-foreground mb-2">
              Why Choose <span className="text-gradient-primary">PayVAT?</span>
            </h4>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The most trusted VAT compliance platform in Ireland
            </p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" data-animate>
            <div className="flex items-center gap-4 p-6 card-modern hover-scale group">
              <div className="icon-modern group-hover:scale-110 transition-transform">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <div className="font-semibold text-foreground">Works with ROS</div>
                <div className="text-sm text-muted-foreground">Submit via ROS</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-6 card-modern hover-scale group">
              <div className="icon-modern group-hover:scale-110 transition-transform">
                <Shield className="h-6 w-6 text-success" />
              </div>
              <div>
                <div className="font-semibold text-foreground">Instant Confirmation</div>
                <div className="text-sm text-muted-foreground">Real-time processing</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-6 card-modern hover-scale group">
              <div className="icon-modern group-hover:scale-110 transition-transform">
                <Bell className="h-6 w-6 text-success" />
              </div>
              <div>
                <div className="font-semibold text-foreground">Smart Reminders</div>
                <div className="text-sm text-muted-foreground">Never miss deadlines</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-6 card-modern hover-scale group">
              <div className="icon-modern group-hover:scale-110 transition-transform">
                <MessageCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <div className="font-semibold text-foreground">24/7 Support</div>
                <div className="text-sm text-muted-foreground">Always here to help</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-4 animate-slide-up">
            <h3 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">
              Need Help? <span className="text-gradient-primary">We're Here</span>
            </h3>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Expert support team ready to assist with all your VAT compliance questions
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3" data-animate>
            <div className="card-modern p-8 text-center hover-lift group">
              <div className="icon-premium mb-3 mx-auto group-hover:scale-110 transition-transform">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-foreground mb-2">Email Support</h4>
              <p className="text-muted-foreground mb-2 leading-relaxed">
                Detailed help via email with expert guidance
              </p>
              <Button variant="outline" className="btn-outline">
                <Mail className="h-4 w-4 mr-2" />
                Email Us
              </Button>
            </div>

            <div className="card-modern p-8 text-center hover-lift group">
              <div className="icon-premium mb-3 mx-auto group-hover:scale-110 transition-transform">
                <Phone className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-foreground mb-2">Phone Support</h4>
              <p className="text-muted-foreground mb-2 leading-relaxed">
                Direct line: Mon-Fri, 9AM-5PM IST
              </p>
              <Button variant="outline" className="btn-outline">
                <Phone className="h-4 w-4 mr-2" />
                Call Us
              </Button>
            </div>

            <div className="card-modern p-8 text-center hover-lift group">
              <div className="icon-premium mb-3 mx-auto group-hover:scale-110 transition-transform">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-foreground mb-2">Live Chat</h4>
              <p className="text-muted-foreground mb-2 leading-relaxed">
                Instant help via our integrated chat system
              </p>
              <Button variant="outline" className="btn-outline">
                <MessageCircle className="h-4 w-4 mr-2" />
                Start Chat
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      
      {/* Footer Component */}
      <Footer />
      
      {/* Video Modal */}
      <VideoModal 
        isOpen={showVideoModal} 
        onClose={() => setShowVideoModal(false)} 
      />
    </div>
  )
}
