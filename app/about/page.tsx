"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Bell, Settings, LogOut, Search, Shield, Clock, Users, Target, CheckCircle, Euro, Award, Zap, TrendingUp, ArrowRight } from 'lucide-react'
import LiveChat from "@/components/live-chat"
import Footer from "@/components/footer"

export default function AboutPayVAT() {
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
                <Link href="/" className="text-2xl font-thin text-white tracking-tight hover:text-white/90 transition-colors">
                  PayVAT
                </Link>
              </div>
              
              {/* Header Actions */}
              <div className="flex items-center space-x-4">
                {/* Search - Desktop */}
                <div className="hidden lg:flex items-center space-x-3">
                  <div className="relative">
                    <Input
                      placeholder="Search company info..."
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
                    <span>About PayVAT</span>
                  </span>
                  <div className="hidden md:flex items-center space-x-6 text-white/70 text-sm">
                    <button className="hover:text-white transition-colors" onClick={() => window.location.href = '/signup'}>Signup</button>
                    <button className="hover:text-white transition-colors" onClick={() => window.location.href = '/pricing'}>Pricing</button>
                    <button className="hover:text-white transition-colors" onClick={() => window.location.href = '/vat-guide'}>VAT Guide</button>
                    <button className="hover:text-white transition-colors" onClick={() => window.location.href = '/vat-registration'}>Get VAT Number</button>
                    <button className="hover:text-white transition-colors" onClick={() => window.location.href = '/login'}>Login</button>
                  </div>
                </div>
                <div className="text-white/60 text-xs hidden sm:block">
                  Ireland's fintech VAT platform
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
                  Founded by Irish entrepreneurs.
                </div>
                
                <div className="icon-premium mb-6 mx-auto">
                  <Target className="h-12 w-12 text-white" />
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                  <span className="text-gradient-primary">Putting Control Back</span>
                  <br />
                  <span className="text-foreground">In Your Hands</span>
                </h1>
                
                <div className="w-32 h-1 gradient-primary mx-auto mb-8 rounded-full"></div>
                
                <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  PayVAT is an Irish fintech company on a mission to simplify VAT submissions for every business. 
                  <span className="text-primary font-semibold">No more costly middlemen.</span>
                </p>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex items-center justify-center gap-8 text-muted-foreground text-sm mb-12">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-success" />
                  <span>Irish-founded</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>Revenue approved</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-success" />
                  <span>10,000+ businesses</span>
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

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Who We Are */}
        <section className="py-20" data-animate>
          <div className="card-premium p-12 mb-16 hover-lift">
            <div className="text-center mb-12">
              <div className="icon-premium mb-6 mx-auto">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                Who <span className="text-gradient-primary">We Are</span>
              </h2>
              <div className="w-24 h-1 gradient-primary mx-auto mb-8 rounded-full"></div>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  PayVAT is an Irish company on a mission to put control of VAT submissions and payments back in the hands of Irish businesses. Founded by Irish and technologists, we grew frustrated watching small and medium-sized enterprises (SMEs) pay exorbitant fees to solicitors or third-party accountants, simply to file their VAT returns.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  The old way is costly, slow, and opaque—so we built a better solution.
                </p>
                
                <div className="flex items-center gap-4 p-6 card-modern hover-scale">
                  <div className="icon-modern bg-success">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Founded by Experts</h3>
                    <p className="text-sm text-muted-foreground"> Irish entrepreneurs with a decade of experience</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-6 card-modern hover-scale">
                  <div className="text-3xl font-bold text-primary mb-2">€30</div>
                  <div className="text-sm text-muted-foreground">Monthly cost vs €500+ traditional</div>
                </div>
                <div className="text-center p-6 card-modern hover-scale">
                  <div className="text-3xl font-bold text-primary mb-2">10k+</div>
                  <div className="text-sm text-muted-foreground">Irish businesses trust us</div>
                </div>
                <div className="text-center p-6 card-modern hover-scale">
                  <div className="text-3xl font-bold text-primary mb-2">2019</div>
                  <div className="text-sm text-muted-foreground">Founded & revenue approved</div>
                </div>
                <div className="text-center p-6 card-modern hover-scale">
                  <div className="text-3xl font-bold text-primary mb-2">95%</div>
                  <div className="text-sm text-muted-foreground">Time saved vs manual process</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Vision */}
        <section className="py-20" data-animate>
          <div className="card-modern p-12 mb-16 hover-lift">
            <div className="text-center mb-8">
              <div className="icon-modern bg-primary mb-6 mx-auto">
                <Target className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                Our <span className="text-gradient-primary">Vision</span>
              </h2>
              <div className="w-24 h-1 bg-primary mx-auto mb-8 rounded-full"></div>
            </div>
            
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                We believe every Irish business, from startups to established SMEs, deserves an intuitive, secure, and affordable way to manage VAT. No more delays, no hidden fees, no hand-holding—just a streamlined platform that lets you submit and pay your VAT in minutes.
              </p>
              
              <div className="grid md:grid-cols-3 gap-8 mt-12">
                <div className="card-modern p-6 hover-lift group">
                  <div className="icon-modern bg-blue-500 mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Speed</h3>
                  <p className="text-sm text-muted-foreground">Submit VAT returns in minutes, not hours</p>
                </div>
                
                <div className="card-modern p-6 hover-lift group">
                  <div className="icon-modern bg-green-500 mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Security</h3>
                  <p className="text-sm text-muted-foreground">Secure encryption and compliance</p>
                </div>
                
                <div className="card-modern p-6 hover-lift group">
                  <div className="icon-modern bg-purple-500 mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Euro className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Affordability</h3>
                  <p className="text-sm text-muted-foreground">Transparent pricing with no hidden costs</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What We Do */}
        <section className="py-20" data-animate>
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
              What <span className="text-gradient-primary">We Do</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive VAT management tools designed specifically for Irish businesses
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="card-modern p-8 hover-lift group">
              <div className="flex items-start gap-6">
                <div className="icon-premium mb-6 group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground mb-4 group-hover:text-primary transition-colors">
                    Self-Service VAT Filing
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Create your account on PayVAT.ie and submit returns directly to the Revenue Commissioners.
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
                <div className="icon-modern bg-warning mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Bell className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground mb-4 group-hover:text-primary transition-colors">
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
                <div className="icon-modern bg-success mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground mb-4 group-hover:text-primary transition-colors">
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
                <div className="icon-premium mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Euro className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground mb-4 group-hover:text-primary transition-colors">
                    Transparent Pricing
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Flat monthly or annual fee—no surprises, no per-submission charges.
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-primary font-medium text-sm">
                    <Euro className="h-4 w-4" />
                    <span>€30/month or €300/year</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-20" data-animate>
          <div className="card-premium p-12 mb-16 hover-lift relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 gradient-mesh opacity-5"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-12">
                <div className="icon-premium mb-6 mx-auto">
                  <TrendingUp className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                  Why Choose <span className="text-gradient-primary">PayVAT?</span>
                </h2>
                <div className="w-24 h-1 gradient-primary mx-auto mb-8 rounded-full"></div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="card-modern p-8 hover-lift group">
                  <div className="flex items-start gap-4">
                    <div className="icon-modern bg-success group-hover:scale-110 transition-transform duration-300">
                      <Euro className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">Save Money</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        At just €30/month (or €300/year), more cost-effective than traditional solutions
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="card-modern p-8 hover-lift group">
                  <div className="flex items-start gap-4">
                    <div className="icon-modern bg-primary group-hover:scale-110 transition-transform duration-300">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">Gain Control</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        You decide when and how to file—no waiting for your accountant's schedule
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="card-modern p-8 hover-lift group">
                  <div className="flex items-start gap-4">
                    <div className="icon-modern bg-blue-500 group-hover:scale-110 transition-transform duration-300">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">Speed & Simplicity</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Step-by-step wizard makes filing a breeze, even if VAT isn't your forte
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="card-modern p-8 hover-lift group">
                  <div className="flex items-start gap-4">
                    <div className="icon-modern bg-purple-500 group-hover:scale-110 transition-transform duration-300">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">Dedicated Support</h3>
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
                <div className="mb-8">
                  <div className="icon-premium mb-6 mx-auto">
                    <Target className="h-12 w-12 text-white" />
                  </div>
                  
                  <h3 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                    Ready to Take <span className="text-gradient-primary">Control?</span>
                  </h3>
                  <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    Get back to focusing on growing your business. Sign up at PayVAT.ie today and experience VAT the easy way.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
                  <Button 
                    size="lg"
                    className="btn-primary px-12 py-4 text-lg font-semibold hover-lift min-w-[220px]"
                    onClick={() => window.location.href = '/signup'}
                  >
                    Sign Up Now
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
      <LiveChat />

      {/* Footer */}
      <Footer />
    </div>
  )
}