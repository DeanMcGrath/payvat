"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Euro, CheckCircle, Calendar, CreditCard, Shield, Clock, HelpCircle, Star, ArrowRight } from 'lucide-react'
import Footer from "@/components/footer"
import SiteHeader from "@/components/site-header"

export default function PricingPage() {
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
      <SiteHeader 
        searchPlaceholder="Search pricing plans..."
        currentPage="Pricing Plans"
        pageSubtitle="Simple, transparent pricing"
      />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            {/* Hero Content */}
            <div className="max-w-4xl mx-auto animate-fade-in">
              <div className="mb-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3 animate-bounce-gentle">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse-gentle"></div>
                  Trusted by Irish businesses
                </div>
                
                <div className="icon-premium mb-3 mx-auto">
                  <Euro className="h-12 w-12 text-white" />
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-2">
                  <span className="text-gradient-primary">Simple, Transparent</span>
                  <br />
                  <span className="text-foreground">Pricing Plans</span>
                </h1>
                
                <div className="w-32 h-1 gradient-primary mx-auto mb-4 rounded-full"></div>
                
                <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Choose the plan that fits your business needs. 
                  <span className="text-primary font-semibold">No hidden fees, no surprises.</span>
                </p>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex items-center justify-center gap-8 text-muted-foreground text-sm mb-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-success" />
                  <span>No setup fees</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>Cancel anytime</span>
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

      {/* Pricing Section */}
      <section className="py-20" data-animate>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">

          {/* Pricing Cards */}
          <div className="text-center mb-2 animate-slide-up">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-1">
              Choose Your 
              <span className="text-gradient-primary"> Perfect Plan</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Professional VAT management for Irish businesses of all sizes
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-2 max-w-4xl mx-auto">
            {/* Monthly Plan */}
            <div className="card-modern p-8 text-center hover-lift group relative">
              <div className="icon-premium mb-3 mx-auto group-hover:scale-110 transition-transform duration-300">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-1">Monthly Plan</h3>
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Euro className="h-8 w-8 text-primary" />
                <span className="text-5xl font-bold text-foreground">90</span>
                <span className="text-muted-foreground text-lg">/month</span>
              </div>
              <p className="text-primary font-semibold mb-2">Cancel anytime</p>
              <p className="text-muted-foreground leading-relaxed mb-2">
                Perfect for seasonal businesses and short-term projects
              </p>
              <Button 
                size="lg"
                className="btn-primary px-8 py-3 text-lg font-semibold hover-lift w-full"
                onClick={() => window.location.href = '/vat-guide'}
              >
                Learn More
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* Annual Plan */}
            <div className="card-premium p-8 text-center hover-lift group relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-white px-4 py-2 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <div className="icon-premium mb-3 mx-auto group-hover:scale-110 transition-transform duration-300">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-1">Annual Plan</h3>
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Euro className="h-8 w-8 text-primary" />
                <span className="text-5xl font-bold text-foreground">900</span>
                <span className="text-muted-foreground text-lg">/year</span>
              </div>
              <p className="text-primary font-semibold mb-2">Two months free!</p>
              <p className="text-muted-foreground leading-relaxed mb-2">
                Best value for steady-state SMEs and cost-savvy entrepreneurs
              </p>
              <Button 
                size="lg"
                className="btn-primary px-8 py-3 text-lg font-semibold hover-lift w-full"
                onClick={() => window.location.href = '/about'}
              >
                Contact Us
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Live Chat */}
      
      {/* Footer */}
      <Footer />
    </div>
  )
}
