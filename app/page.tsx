"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calculator, Building2, Lock, ArrowRight, CheckCircle, Shield, Clock, Users, TrendingUp, Award, BadgeCheck, Play } from 'lucide-react'
import { useEffect, useState } from 'react'
import Footer from "@/components/footer"
import SiteHeader from "@/components/site-header"
import { VideoModal } from "@/components/video-modal"

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredBox, setHoveredBox] = useState<number | null>(null)
  const [showVideoModal, setShowVideoModal] = useState(false)

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
      icon: Calculator,
      gradient: "from-teal-500 to-cyan-600",
      shadowColor: "rgba(20, 184, 166, 0.3)",
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
      gradient: "from-teal-500 to-teal-600",
      shadowColor: "rgba(99, 102, 241, 0.3)",
      features: ["Secure access", "Real-time updates", "Always available"]
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader 
        searchPlaceholder="Search guides, tools, and VAT help..."
        pageSubtitle="Irish VAT compliance made simple"
      />

      <main id="main-content" role="main" aria-label="PayVAT Ireland - VAT services">
        {/* Hero Section - Simplified and Elegant */}
        <section 
          className="relative pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden"
          aria-labelledby="hero-heading"
        >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <div className="max-w-4xl mx-auto animate-fade-in">
              {/* Premium Badge */}
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 text-teal-700 text-sm font-semibold mb-6 animate-bounce-gentle shadow-lg shadow-teal-500/10">
                <Shield className="w-4 h-4" />
                Ireland's Premium VAT Platform
                <BadgeCheck className="w-4 h-4" />
              </div>
              
              <h1 
                id="hero-heading"
                className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-foreground"
              >
                Irish VAT compliance
                <span className="block text-gradient-primary mt-2">made simple</span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
                Whether you're starting a business or managing VAT for an established company, 
                we have everything you need.
              </p>

              {/* Enhanced Trust Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto mb-12">
                <div className="flex items-center justify-center gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-teal-100 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="p-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-gray-900 text-sm">Revenue Compliant</div>
                    <div className="text-xs text-teal-600">✓ Officially approved</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-teal-100 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="p-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-gray-900 text-sm">5,000+ Businesses</div>
                    <div className="text-xs text-teal-600">✓ Trust PayVAT</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-teal-100 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="p-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl">
                    <Award className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-gray-900 text-sm">Award-winning</div>
                    <div className="text-xs text-teal-600">✓ Customer support</div>
                  </div>
                </div>
              </div>

              {/* Watch Demo Video Button */}
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowVideoModal(true)}
                  className="border-teal-600 text-teal-600 hover:bg-teal-50 hover:border-teal-700 hover:text-teal-700 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold transition-all duration-300 hover:shadow-lg min-h-[44px] hover:scale-105"
                >
                  <Play className="mr-2 sm:mr-3 h-4 sm:h-5 w-4 sm:w-5" />
                  Watch Demo Video
                </Button>
              </div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-full blur-3xl opacity-20 animate-float"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-br from-teal-400 to-teal-500 rounded-full blur-3xl opacity-20 animate-float" style={{animationDelay: '-2s'}}></div>
          <div className="absolute bottom-10 left-1/3 w-24 h-24 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-full blur-3xl opacity-20 animate-float" style={{animationDelay: '-4s'}}></div>
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
                
                <Card className="relative h-full overflow-hidden border-2 border-gray-100 bg-white shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 rounded-2xl cursor-pointer active:scale-[0.98]">
                  <div className={`absolute top-0 inset-x-0 h-2 bg-gradient-to-r ${box.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                  />
                  
                  <CardContent className="p-6 sm:p-8 space-y-4 sm:space-y-6">
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
                                <stop offset="0%" className="text-teal-500" stopColor="currentColor" />
                                <stop offset="100%" className="text-teal-600" stopColor="currentColor" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                      </div>
                      
                      {/* Premium Badge */}
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-teal-400 to-cyan-400 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
                      className={`w-full font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 bg-gradient-to-r ${box.gradient} min-h-[48px] text-base active:scale-95`}
                      onClick={() => window.location.href = box.link}
                    >
                      {box.buttonText}
                      <ArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>


        {/* Value Proposition Section */}
        <section 
          className="py-20 lg:py-32"
          aria-labelledby="value-proposition-heading"
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 id="value-proposition-heading" className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Why choose <span className="text-gradient-primary">PayVAT?</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join thousands of Irish businesses who trust PayVAT for their compliance needs
              </p>
            </div>
            
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" data-animate>
              <div className="flex items-center gap-4 p-4 sm:p-6 card-modern hover-scale group cursor-pointer min-h-[80px] active:scale-95 transition-all">
                <div className="icon-modern group-hover:scale-110 transition-transform flex-shrink-0">
                  <Clock className="h-5 sm:h-6 w-5 sm:w-6 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-foreground text-sm sm:text-base">Save Time</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Automate VAT tasks</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 sm:p-6 card-modern hover-scale group cursor-pointer min-h-[80px] active:scale-95 transition-all">
                <div className="icon-modern group-hover:scale-110 transition-transform flex-shrink-0">
                  <Shield className="h-5 sm:h-6 w-5 sm:w-6 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-foreground text-sm sm:text-base">Stay Compliant</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Revenue approved</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 sm:p-6 card-modern hover-scale group cursor-pointer min-h-[80px] active-scale-95 transition-all">
                <div className="icon-modern group-hover:scale-110 transition-transform flex-shrink-0">
                  <TrendingUp className="h-5 sm:h-6 w-5 sm:w-6 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-foreground text-sm sm:text-base">Grow Faster</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Focus on business</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 sm:p-6 card-modern hover-scale group cursor-pointer min-h-[80px] active:scale-95 transition-all">
                <div className="icon-modern group-hover:scale-110 transition-transform flex-shrink-0">
                  <Users className="h-5 sm:h-6 w-5 sm:w-6 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-foreground text-sm sm:text-base">Professional Support</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Always here to help</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />

      {/* Video Modal */}
      <VideoModal 
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
      />
    </div>
  )
}