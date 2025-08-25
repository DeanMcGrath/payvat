"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, Calculator, Calendar, AlertTriangle, CheckCircle, ExternalLink, FileText, Clock, TrendingUp, Shield, ArrowRight, Euro, ChevronRight, Bell, Building, Globe, Home, UtensilsCrossed } from 'lucide-react'
import Footer from "@/components/footer"
import SiteHeader from "@/components/site-header"

export default function VATGuidePage() {
  const [isVisible, setIsVisible] = useState(false)
  const [expandedSection, setExpandedSection] = useState<number | null>(null)

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
        searchPlaceholder="Search VAT guide..."
        currentPage="VAT Guide"
        pageSubtitle="Complete guide to Irish VAT compliance"
      />

      <div className="max-w-7xl mx-auto px-6 content-after-header pb-8">
        {/* What Is VAT */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg font-normal text-gray-900 flex items-center">
              <BookOpen className="h-5 w-5 text-blue-500 mr-2" />
              1. What Is VAT?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Value-Added Tax (VAT) is a consumption tax placed on goods and services at each stage of the supply chain where value is added, from initial production to the point of sale.</p>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-petrol-base flex-shrink-0" />
                <span className="text-gray-600">VAT is charged on most goods and services sold in Ireland</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-petrol-base flex-shrink-0" />
                <span className="text-gray-600">Businesses collect VAT on behalf of Revenue</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-petrol-base flex-shrink-0" />
                <span className="text-gray-600">Regular filing and payment is required</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* VAT Registration Thresholds */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg font-normal text-gray-900 flex items-center">
              <Users className="h-5 w-5 text-blue-500 mr-2" />
              2. VAT Registration Thresholds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">You must register for VAT if your annual turnover exceeds:</p>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-petrol-200">
                <h4 className="font-normal text-petrol-dark mb-1">Services: €42,500</h4>
                <p className="text-petrol-dark text-sm">Annual turnover threshold for service-based businesses (from 1 Jan 2025)</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-normal text-green-800 mb-1">Goods: €85,000</h4>
                <p className="text-green-700 text-sm">Annual turnover threshold for goods-based businesses (from 1 Jan 2025)</p>
              </div>
            </div>
            <p className="text-gray-600 mb-4">If you're likely to exceed your threshold in the current or previous calendar year, register.</p>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="text-center">
          <CardContent className="p-8">
            <h3 className="text-2xl font-normal text-gray-900 mb-1">Ready to Simplify Your VAT?</h3>
            <p className="text-gray-600 mb-2">Let PayVAT handle the complexity while you focus on growing your business</p>
            <Button 
              className="bg-petrol-base hover:bg-petrol-dark text-white font-normal py-3 px-8 text-lg"
              onClick={() => window.location.href = '/about'}
            >
              Contact Us
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}