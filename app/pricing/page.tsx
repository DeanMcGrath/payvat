import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PayVAT Pricing - €30/Month VAT Software | 14-Day Free Trial',
  description: 'Simple, transparent pricing for Irish VAT submission. €30/month or €300/year. Save €180 annually. 14-day free trial, no credit card required. Try PayVAT today.',
}

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Euro, CheckCircle, Calendar, CreditCard, Shield, Clock, HelpCircle, BadgeCheck, ArrowRight } from 'lucide-react'
import Footer from "@/components/footer"
import SiteHeader from "@/components/site-header"
import ProductSchema from "@/components/product-schema"

export default function PricingPage() {
  const [isVisible, setIsVisible] = useState(false)
  const router = useRouter()

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
      <ProductSchema />
      <SiteHeader 
        searchPlaceholder="Search pricing plans..."
        currentPage="Pricing Plans"
        pageSubtitle="Simple, transparent pricing"
      />


      {/* Pricing Section */}
      <section className="py-20" data-animate>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">

          {/* Pricing Cards */}
          <div className="text-center mb-2 animate-slide-up">
            <h2 className="text-3xl lg:text-4xl font-normal text-foreground mb-1">
              <span className="text-gradient-primary">PayVAT</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Complete VAT management solution for Irish businesses
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="card-premium p-12 text-center hover-lift relative overflow-hidden">
              <div className="absolute inset-0 gradient-mesh opacity-10"></div>
              
              <div className="relative z-10">
                <div className="icon-premium mb-6 mx-auto">
                  <Euro className="h-12 w-12 text-white" />
                </div>
                
                <h3 className="text-3xl lg:text-4xl font-normal text-foreground mb-8">PayVAT</h3>
                
                {/* Features List */}
                <div className="grid md:grid-cols-2 gap-6 mb-12 text-left max-w-3xl mx-auto">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-foreground">VAT calculations</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-foreground">VAT submissions via ROS</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-foreground">Payment processing</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-foreground">Priority support</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-foreground">Unlimited transactions</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-foreground">Basic and custom reporting</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-foreground">Deadline reminders</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-foreground">Expert guidance when you need it</span>
                    </div>
                  </div>
                </div>
                
                {/* Pricing Options */}
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  {/* Monthly Option */}
                  <div className="card-modern p-8 text-center">
                    <div className="flex items-center justify-center space-x-2 mb-4">
                      <Euro className="h-8 w-8 text-primary" />
                      <span className="text-5xl font-normal text-foreground">30</span>
                      <span className="text-muted-foreground text-lg">/month</span>
                    </div>
                    <p className="text-muted-foreground mb-6">Perfect for getting started</p>
                    <Button 
                      size="lg"
                      className="btn-primary px-8 py-3 text-lg font-normal hover-lift w-full"
                      onClick={() => router.push('/signup')}
                    >
                      Try Free for 14 Days
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                  
                  {/* Annual Option */}
                  <div className="card-modern p-8 text-center border-2 border-primary relative">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-primary text-white px-4 py-2 rounded-full text-sm font-normal">
                        Save €180
                      </span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 mb-4">
                      <Euro className="h-8 w-8 text-primary" />
                      <span className="text-5xl font-normal text-foreground">300</span>
                      <span className="text-muted-foreground text-lg">/year</span>
                    </div>
                    <p className="text-primary font-normal mb-2">Two months free!</p>
                    <p className="text-muted-foreground mb-6">Best value for growing businesses</p>
                    <Button 
                      size="lg"
                      className="btn-primary px-8 py-3 text-lg font-normal hover-lift w-full"
                      onClick={() => router.push('/signup')}
                    >
                      Save €180 - Start Annual Plan
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>
                
                {/* Trust Message */}
                <div className="text-center text-muted-foreground">
                  <p className="text-lg">14-day free trial • No setup fees • Cancel anytime</p>
                </div>
              </div>
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
