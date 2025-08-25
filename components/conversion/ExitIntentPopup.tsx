"use client"

import { useState, useEffect, useRef } from 'react'
import { X, Gift, Clock, CheckCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'

interface ExitIntentPopupProps {
  enabled?: boolean
  delay?: number // milliseconds before showing after exit intent
  showOnMobile?: boolean
  currentPage?: string
}

export default function ExitIntentPopup({ 
  enabled = true, 
  delay = 1000,
  showOnMobile = false,
  currentPage = ''
}: ExitIntentPopupProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasShown, setHasShown] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const timeoutRef = useRef<NodeJS.Timeout>()
  const router = useRouter()

  // Check if user is already signed up or in trial
  const [userStatus, setUserStatus] = useState<'anonymous' | 'trial' | 'paid'>('anonymous')

  useEffect(() => {
    // Check user status (this would typically come from auth context)
    const checkUserStatus = async () => {
      try {
        const response = await fetch('/api/auth/profile')
        if (response.ok) {
          const user = await response.json()
          setUserStatus(user.subscriptionStatus === 'active' ? 'paid' : 'trial')
        }
      } catch (error) {
        // User is anonymous
        setUserStatus('anonymous')
      }
    }

    if (enabled) {
      checkUserStatus()
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled || hasShown || userStatus !== 'anonymous') return

    // Don't show on mobile unless explicitly enabled
    if (window.innerWidth <= 768 && !showOnMobile) return

    let exitIntentTriggered = false

    const handleMouseLeave = (event: MouseEvent) => {
      // Only trigger if mouse is leaving from the top of the page (typical exit behavior)
      if (event.clientY <= 0 && !exitIntentTriggered) {
        exitIntentTriggered = true
        
        timeoutRef.current = setTimeout(() => {
          setIsVisible(true)
          setHasShown(true)
          
          // Track exit intent event
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'exit_intent_triggered', {
              page_location: window.location.href,
              page_title: document.title
            })
          }
        }, delay)
      }
    }

    const handleMouseEnter = () => {
      exitIntentTriggered = false
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }

    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY })
    }

    document.addEventListener('mouseleave', handleMouseLeave)
    document.addEventListener('mouseenter', handleMouseEnter)
    document.addEventListener('mousemove', handleMouseMove)

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave)
      document.removeEventListener('mouseenter', handleMouseEnter)
      document.removeEventListener('mousemove', handleMouseMove)
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [enabled, hasShown, delay, showOnMobile, userStatus])

  const handleClose = () => {
    setIsVisible(false)
    
    // Track dismissal
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exit_intent_dismissed', {
        page_location: window.location.href
      })
    }
  }

  const handleCTAClick = (action: 'trial' | 'demo') => {
    // Track conversion
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exit_intent_conversion', {
        page_location: window.location.href,
        action_type: action
      })
    }

    setIsVisible(false)
    
    if (action === 'trial') {
      router.push('/signup?source=exit_intent&offer=extended_trial')
    } else {
      router.push('/contact?source=exit_intent&type=demo')
    }
  }

  const getPageSpecificOffer = () => {
    const offers = {
      '/pricing': {
        headline: "Wait! Get 30 Days Free Instead of 14",
        subtext: "Extended trial just for considering PayVAT",
        cta: "Get 30-Day Trial",
        urgency: "This offer expires when you leave"
      },
      '/vat-submission': {
        headline: "Automate This Process Forever",
        subtext: "Never manually fill VAT3 forms again",
        cta: "Start Free Trial",
        urgency: "Join 1,000+ Irish businesses"
      },
      '/dashboard': {
        headline: "Ready to Go Live?",
        subtext: "Your documents are processed, just one click to submit",
        cta: "Upgrade Now",
        urgency: "Complete your VAT submission today"
      },
      default: {
        headline: "Don't Miss Out on VAT Automation",
        subtext: "Join over 1,000 Irish businesses saving hours every month",
        cta: "Start Free Trial",
        urgency: "14-day free trial, no credit card required"
      }
    }

    return offers[currentPage as keyof typeof offers] || offers.default
  }

  const offer = getPageSpecificOffer()

  if (!isVisible || !enabled || userStatus !== 'anonymous') {
    return null
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-[9998] animate-in fade-in duration-300" />
      
      {/* Popup */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white shadow-2xl animate-in zoom-in duration-300 border-2 border-blue-200">
          <CardContent className="p-0">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-lg">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="flex items-center space-x-3 mb-2">
                <Gift className="h-8 w-8 text-blue-200" />
                <Badge className="bg-white/20 text-white border-white/30">
                  Special Offer
                </Badge>
              </div>
              
              <h3 className="text-xl font-bold mb-1">
                {offer.headline}
              </h3>
              <p className="text-blue-100 text-sm">
                {offer.subtext}
              </p>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="space-y-4">
                {/* Benefits */}
                <div className="space-y-2">
                  {[
                    "AI-powered VAT document processing",
                    "Automatic VAT3 form completion",
                    "Direct Revenue Ireland submission",
                    "Save 10+ hours per VAT return"
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* Urgency indicator */}
                <div className="flex items-center space-x-2 text-orange-600 bg-orange-50 p-3 rounded-lg">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {offer.urgency}
                  </span>
                </div>

                {/* CTAs */}
                <div className="space-y-3">
                  <Button
                    onClick={() => handleCTAClick('trial')}
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
                  >
                    <ArrowRight className="mr-2 h-5 w-5" />
                    {offer.cta}
                  </Button>
                  
                  <Button
                    onClick={() => handleCTAClick('demo')}
                    variant="outline"
                    size="sm"
                    className="w-full text-gray-600"
                  >
                    Or Request a Demo
                  </Button>
                </div>

                {/* Social proof */}
                <div className="text-center pt-2">
                  <p className="text-xs text-gray-500">
                    ⭐⭐⭐⭐⭐ Rated 4.8/5 by Irish businesses
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

// Hook for managing exit intent across the app
export function useExitIntent(enabled: boolean = true) {
  const [hasTriggered, setHasTriggered] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  const triggerExitIntent = () => {
    if (enabled && !hasTriggered) {
      setIsVisible(true)
      setHasTriggered(true)
    }
  }

  const hideExitIntent = () => {
    setIsVisible(false)
  }

  return {
    isVisible,
    hasTriggered,
    triggerExitIntent,
    hideExitIntent
  }
}