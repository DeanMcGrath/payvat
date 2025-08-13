"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Lightbulb, Building2, Lock, ArrowRight, CheckCircle, Shield, Clock, Users, TrendingUp, Award, Sparkles, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import Footer from "@/components/footer"
import SiteHeader from "@/components/site-header"

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredBox, setHoveredBox] = useState<number | null>(null)

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

  const navigationBoxes = [
    {
      id: 1,
      title: "Startup?",
      heading: "Thinking of creating a business?",
      subtext: "Learn everything you need to know about starting a business in Ireland",
      buttonText: "Get Started",
      link: "/business-setup-guide",
      icon: Lightbulb,
      gradient: "from-amber-500 to-orange-600",
      shadowColor: "rgba(251, 146, 60, 0.3)",
      features: ["Complete guides", "Step-by-step process", "Expert advice"]
    },
    {
      id: 2,
      title: "Established Business?",
      heading: "Looking to simplify VAT?",
      subtext: "Discover how PayVAT streamlines your VAT submissions and payments",
      buttonText: "Learn More",
      link: "/vat-services",
      icon: Building2,
      gradient: "from-teal-500 to-cyan-600",
      shadowColor: "rgba(20, 184, 166, 0.3)",
      features: ["VAT automation", "Revenue compliance", "Save time & money"]
    },
    {
      id: 3,
      title: "Already signed up?",
      heading: "Sign in now",
      subtext: "Access your secure VAT dashboard",
      buttonText: "Sign In",
      link: "/login",
      icon: Lock,
      gradient: "from-indigo-500 to-purple-600",
      shadowColor: "rgba(99, 102, 241, 0.3)",
      features: ["Secure access", "Real-time updates", "24/7 availability"]
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader 
        searchPlaceholder="Search guides, tools, and VAT help..."
        pageSubtitle="Irish VAT compliance made simple"
      />

      {/* Hero Section - Simplified and Elegant */}
      <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <div className="max-w-4xl mx-auto animate-fade-in">
              {/* Premium Badge */}
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 text-teal-700 text-sm font-semibold mb-6 animate-bounce-gentle shadow-lg shadow-teal-500/10">
                <Sparkles className="w-4 h-4" />
                Ireland's Premium VAT Platform
                <Star className="w-4 h-4 fill-teal-500" />
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-foreground">
                Irish VAT compliance
                <span className="block text-gradient-primary mt-2">made simple</span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
                Whether you're starting a business or managing VAT for an established company, 
                we have everything you need.
              </p>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground mb-12">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-teal-600" />
                  <span className="font-medium">Revenue Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-teal-600" />
                  <span className="font-medium">Trusted by 15,000+ Irish businesses</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-teal-600" />
                  <span className="font-medium">Award-winning support</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-full blur-3xl opacity-20 animate-float"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full blur-3xl opacity-20 animate-float" style={{animationDelay: '-2s'}}></div>
          <div className="absolute bottom-10 left-1/3 w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full blur-3xl opacity-20 animate-float" style={{animationDelay: '-4s'}}></div>
        </div>
      </section>

      {/* Three Navigation Boxes - The Main Feature */}
      <section className="relative py-8 -mt-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3" data-animate>
            {navigationBoxes.map((box, index) => (
              <div
                key={box.id}
                className="group relative"
                onMouseEnter={() => setHoveredBox(box.id)}
                onMouseLeave={() => setHoveredBox(null)}
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div 
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                  style={{
                    background: `linear-gradient(135deg, ${box.shadowColor} 0%, transparent 100%)`,
                  }}
                />
                
                <Card className="relative h-full overflow-hidden border-2 border-gray-100 bg-white shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 rounded-2xl">
                  <div className={`absolute top-0 inset-x-0 h-2 bg-gradient-to-r ${box.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  />
                  
                  <CardContent className="p-8 space-y-6">
                    {/* Icon Container */}
                    <div className="relative">
                      <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${box.gradient} p-0.5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center">
                          <box.icon className={`h-10 w-10 bg-gradient-to-br ${box.gradient} bg-clip-text text-transparent`} 
                                    strokeWidth={2} 
                                    style={{
                                      stroke: `url(#${box.id}-gradient)`,
                                    }}
                          />
                          <svg width="0" height="0">
                            <defs>
                              <linearGradient id={`${box.id}-gradient`} x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" className={box.gradient.includes('amber') ? 'text-amber-500' : box.gradient.includes('teal') ? 'text-teal-500' : 'text-indigo-500'} stopColor="currentColor" />
                                <stop offset="100%" className={box.gradient.includes('amber') ? 'text-orange-600' : box.gradient.includes('teal') ? 'text-cyan-600' : 'text-purple-600'} stopColor="currentColor" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                      </div>
                      
                      {/* Premium Badge */}
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-amber-400 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {box.id === 1 ? 'NEW' : box.id === 2 ? 'POPULAR' : 'SECURE'}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h3 className={`text-2xl font-bold text-foreground group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text transition-all duration-300 group-hover:${box.gradient}`}
                            style={{
                              backgroundImage: hoveredBox === box.id ? `linear-gradient(to right, var(--tw-gradient-stops))` : 'none',
                            }}>
                          {box.heading}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {box.subtext}
                        </p>
                      </div>

                      {/* Features */}
                      <div className="space-y-2 pt-2">
                        {box.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="h-4 w-4 text-teal-600 flex-shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CTA Button */}
                    <Button 
                      size="lg" 
                      className={`w-full font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 bg-gradient-to-r ${box.gradient}`}
                      onClick={() => window.location.href = box.link}
                    >
                      {box.buttonText}
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Why choose <span className="text-gradient-primary">PayVAT?</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of Irish businesses who trust PayVAT for their compliance needs
            </p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" data-animate>
            <div className="flex items-center gap-4 p-6 card-modern hover-scale group">
              <div className="icon-modern group-hover:scale-110 transition-transform">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="font-semibold text-foreground">Save Time</div>
                <div className="text-sm text-muted-foreground">Automate VAT tasks</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-6 card-modern hover-scale group">
              <div className="icon-modern group-hover:scale-110 transition-transform">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="font-semibold text-foreground">Stay Compliant</div>
                <div className="text-sm text-muted-foreground">Revenue approved</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-6 card-modern hover-scale group">
              <div className="icon-modern group-hover:scale-110 transition-transform">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="font-semibold text-foreground">Grow Faster</div>
                <div className="text-sm text-muted-foreground">Focus on business</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-6 card-modern hover-scale group">
              <div className="icon-modern group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="font-semibold text-foreground">Expert Support</div>
                <div className="text-sm text-muted-foreground">Always here to help</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}