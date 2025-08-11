"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Bell, Settings, LogOut, Search, Euro, CheckCircle, Calendar, CreditCard, Shield, Clock, HelpCircle, Star, ArrowRight } from 'lucide-react'
import LiveChat from "@/components/live-chat"
import Footer from "@/components/footer"

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
      {/* Modern Header */}
      <header className="gradient-primary relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 gradient-mesh opacity-30"></div>
        
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center">
                <a href="/" className="text-2xl font-thin text-white tracking-tight hover:text-white/90 transition-colors">
                  PayVAT
                </a>
              </div>
              
              {/* Header Actions */}
              <div className="flex items-center space-x-4">
                {/* Search - Desktop */}
                <div className="hidden lg:flex items-center space-x-3">
                  <div className="relative">
                    <Input
                      placeholder="Search pricing plans..."
                      className="w-64 xl:w-80 bg-white/10 text-white placeholder-white/70 border-white/20 backdrop-blur-sm focus:bg-white/15 focus:border-white/40"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70" />
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/10 lg:hidden glass-white/10 backdrop-blur-sm border-white/20"
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/10 glass-white/10 backdrop-blur-sm border-white/20 relative"
                  >
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-warning rounded-full animate-pulse-gentle"></span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-white border-white/20 hover:bg-white/10 hidden sm:flex glass-white/10 backdrop-blur-sm"
                    onClick={() => window.location.href = '/login'}
                  >
                    Sign In
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-white border-white/20 hover:bg-white/10 hidden sm:flex glass-white/10 backdrop-blur-sm"
                    onClick={() => window.location.href = '/signup'}
                  >
                    Sign Up
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Modern Navigation */}
          <nav className="border-t border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-8">
                  <span className="text-white/90 text-sm font-medium flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>Pricing Plans</span>
                  </span>
                  <div className="hidden md:flex items-center space-x-6 text-white/70 text-sm">
                    <button className="hover:text-white transition-colors" onClick={() => window.location.href = '/signup'}>Signup</button>
                    <button className="hover:text-white transition-colors" onClick={() => window.location.href = '/about'}>About</button>
                    <button className="hover:text-white transition-colors" onClick={() => window.location.href = '/vat-guide'}>VAT Guide</button>
                    <button className="hover:text-white transition-colors" onClick={() => window.location.href = '/vat-registration'}>Get VAT Number</button>
                    <button className="hover:text-white transition-colors" onClick={() => window.location.href = '/login'}>Login</button>
                  </div>
                </div>
                <div className="text-white/60 text-xs hidden sm:block">
                  Simple, transparent pricing
                </div>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            {/* Hero Content */}
            <div className="max-w-4xl mx-auto animate-fade-in">
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-bounce-gentle">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse-gentle"></div>
                  Trusted by 10,000+ Irish businesses
                </div>
                
                <div className="icon-premium mb-6 mx-auto">
                  <Euro className="h-12 w-12 text-white" />
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                  <span className="text-gradient-primary">Simple, Transparent</span>
                  <br />
                  <span className="text-foreground">Pricing Plans</span>
                </h1>
                
                <div className="w-32 h-1 gradient-primary mx-auto mb-8 rounded-full"></div>
                
                <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Choose the plan that fits your business needs. 
                  <span className="text-primary font-semibold">No hidden fees, no surprises.</span>
                </p>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex items-center justify-center gap-8 text-muted-foreground text-sm mb-12">
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
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Choose Your 
              <span className="text-gradient-primary"> Perfect Plan</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Professional VAT management for Irish businesses of all sizes
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-4xl mx-auto">
            {/* Monthly Plan */}
            <div className="card-modern p-8 text-center hover-lift group relative">
              <div className="icon-premium mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">Monthly Plan</h3>
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Euro className="h-8 w-8 text-primary" />
                <span className="text-5xl font-bold text-foreground">30</span>
                <span className="text-muted-foreground text-lg">/month</span>
              </div>
              <p className="text-primary font-semibold mb-6">Cancel anytime</p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Perfect for seasonal businesses and short-term projects
              </p>
              <Button 
                size="lg"
                className="btn-primary px-8 py-3 text-lg font-semibold hover-lift w-full"
                onClick={() => window.location.href = '/signup?plan=monthly'}
              >
                Choose Monthly
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
              <div className="icon-premium mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">Annual Plan</h3>
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Euro className="h-8 w-8 text-primary" />
                <span className="text-5xl font-bold text-foreground">300</span>
                <span className="text-muted-foreground text-lg">/year</span>
              </div>
              <p className="text-primary font-semibold mb-6">Two months free!</p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Best value for steady-state SMEs and cost-savvy entrepreneurs
              </p>
              <Button 
                size="lg"
                className="btn-primary px-8 py-3 text-lg font-semibold hover-lift w-full"
                onClick={() => window.location.href = '/signup?plan=annual'}
              >
                Choose Annual
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Live Chat */}
      <LiveChat />
      
      {/* Footer */}
      <Footer />
    </div>
  )
}
