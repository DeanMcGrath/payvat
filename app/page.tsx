"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, CheckCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import SiteHeader from "@/components/site-header"
import { VideoModal } from "@/components/video-modal"

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredBox, setHoveredBox] = useState<number | null>(null)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [showFullScreenBrand, setShowFullScreenBrand] = useState(true)
  const [brandAnimationComplete, setBrandAnimationComplete] = useState(false)
  const [typewriterText, setTypewriterText] = useState("")
  const [showCursor, setShowCursor] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fullText = "PayVAT"
    let currentIndex = 0

    const typewriterTimer = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setTypewriterText(fullText.slice(0, currentIndex))
        currentIndex++
      } else {
        clearInterval(typewriterTimer)
        setTimeout(() => setShowCursor(false), 500)
      }
    }, 100)

    const brandTimer = setTimeout(() => {
      setShowFullScreenBrand(false)
      setTimeout(() => {
        setBrandAnimationComplete(true)
      }, 500)
    }, 2000)

    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)

    const handleScroll = () => {
      const elements = document.querySelectorAll("[data-animate]")
      elements.forEach((element) => {
        const rect = element.getBoundingClientRect()
        const isInView = rect.top < window.innerHeight && rect.bottom > 0

        if (isInView) {
          element.classList.add("animate-slide-up")
          element.removeAttribute("data-animate")
        }
      })
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll()

    return () => {
      clearInterval(typewriterTimer)
      clearTimeout(timer)
      clearTimeout(brandTimer)
      window.removeEventListener("scroll", handleScroll)
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
      features: ["Complete guides", "Step-by-step process", "Expert advice"],
    },
    {
      id: 2,
      title: "Established Business?",
      heading: "Looking to improve your Business?",
      subtext: "Discover how PayVAT streamlines your VAT submissions and payments",
      buttonText: "Learn More",
      link: "/vat-services",
      features: ["VAT automation", "Revenue compliance", "Save time & money"],
    },
    {
      id: 3,
      title: "Already signed up?",
      heading: "Sign in now",
      subtext: "Access your secure VAT dashboard",
      buttonText: "Sign In",
      link: "/login",
      features: ["Secure access", "Real-time updates", "Always available"],
    },
  ]

  return (
    <div className="min-h-screen relative" style={{background: 'linear-gradient(135deg, #2A7A8F 0%, #1A4F5C 100%)'}}>
      {showFullScreenBrand && (
        <div className="fixed inset-0 z-[10000] opening-animation flex items-center justify-center" style={{background: 'linear-gradient(135deg, #2A7A8F 0%, #1A4F5C 100%)'}}>
          <div className="text-center">
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-normal payvat-brand text-white drop-shadow-2xl">
              {typewriterText}
              {showCursor && <span className="animate-pulse">|</span>}
            </h1>
            <div className="mt-8 w-32 h-1 bg-white/50 mx-auto rounded-full"></div>
          </div>
        </div>
      )}

      {brandAnimationComplete && <SiteHeader />}

      <main
        id="main-content"
        role="main"
        aria-label="Don't Be Like Me! Ireland - VAT services"
        className={`relative z-10 transition-opacity duration-1000 ${brandAnimationComplete ? "opacity-100" : "opacity-0"}`}
      >
        <section className="relative section-after-header">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-3" data-animate>
              {navigationBoxes.map((box, index) => (
                <div
                  key={box.id}
                  className="group relative"
                  onMouseEnter={() => setHoveredBox(box.id)}
                  onMouseLeave={() => setHoveredBox(null)}
                  style={{
                    animationDelay: `${index * 150}ms`,
                  }}
                >
                  <Card className="relative h-full bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 rounded-lg cursor-pointer">
                    <CardContent className="p-8 space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <h3 className="text-2xl font-normal font-sans text-slate-800 leading-tight">{box.heading}</h3>
                          <p className="text-slate-600 leading-relaxed font-sans text-base">{box.subtext}</p>
                        </div>

                        <div className="space-y-3 pt-2">
                          {box.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-3 text-sm text-slate-600">
                              <div className="w-5 h-5 rounded-full bg-[#2A7A8F] flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="h-3 w-3 text-white" />
                              </div>
                              <span className="font-sans font-normal">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button
                        size="lg"
                        className="w-full font-normal font-sans text-white shadow-md hover:shadow-lg transition-all duration-300 min-h-[52px] text-base rounded-lg"
                        style={{background: 'linear-gradient(135deg, #2A7A8F 0%, #1A4F5C 100%)'}}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #216477 0%, #003F63 100%)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #2A7A8F 0%, #1A4F5C 100%)'
                        }}
                        onClick={() => router.push(box.link)}
                      >
                        <span className="font-normal">{box.buttonText}</span>
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <VideoModal isOpen={showVideoModal} onClose={() => setShowVideoModal(false)} />
    </div>
  )
}