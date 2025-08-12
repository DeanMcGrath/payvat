"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Calendar, Bell, Settings, LogOut, Search, CheckCircle, Clock, Shield } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Footer from "@/components/footer"
import { useVATData } from "@/contexts/vat-data-context"
import { VAT_PERIODS, getPeriodLabel } from "@/lib/vatUtils"
import ProtectedRoute from "@/components/protected-route"

function VATPeriodContent() {
  const { selectedYear: contextYear, selectedPeriod: contextPeriod, setPeriodData } = useVATData()
  const [selectedYear, setSelectedYear] = useState(contextYear || "2025")
  const [selectedPeriod, setSelectedPeriod] = useState(contextPeriod || "jan-feb")
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

  // Handle year and period changes
  const handleYearChange = (year: string) => {
    setSelectedYear(year)
    setPeriodData(year, selectedPeriod)
  }

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period)
    setPeriodData(selectedYear, period)
  }

  const getDueDate = (year: string, period: string) => {
    // VAT returns are due 15th of the month following the end of each taxable period
    const dueDates = {
      "jan-feb": `15 Mar ${year}`,
      "mar-apr": `15 May ${year}`,
      "may-jun": `15 Jul ${year}`,
      "jul-aug": `15 Sep ${year}`,
      "sep-oct": `15 Nov ${year}`,
      "nov-dec": `15 Jan ${parseInt(year) + 1}`
    }
    return dueDates[period as keyof typeof dueDates] || "TBD"
  }

  const isPastPeriod = (year: string, period: string) => {
    const currentYear = 2025
    const currentPeriod = "jan-feb" // Assuming we're in Jan-Feb 2025
    
    if (parseInt(year) < currentYear) return true
    if (parseInt(year) === currentYear) {
      const periodOrder = ["jan-feb", "mar-apr", "may-jun", "jul-aug", "sep-oct", "nov-dec"]
      return periodOrder.indexOf(period) < periodOrder.indexOf(currentPeriod)
    }
    return false
  }

  const getStatusMessage = () => {
    if (isPastPeriod(selectedYear, selectedPeriod)) {
      return {
        type: "past",
        message: "This is a past period. You can view or amend your previous submission.",
        color: "text-blue-800",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200"
      }
    } else {
      return {
        type: "current",
        message: "This covers the two-month taxable period as per VAT regulations",
        color: "text-teal-800",
        bgColor: "bg-teal-50",
        borderColor: "border-teal-200"
      }
    }
  }

  const status = getStatusMessage()

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
                      placeholder="Search VAT periods..."
                      className="w-64 xl:w-80 bg-white/10 text-white placeholder-white/70 border-white/20 backdrop-blur-sm focus:bg-white/15 focus:border-white/40"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70" />
                  </div>
                </div>
                
                {/* Company Info */}
                <div className="text-right glass-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                  <h3 className="text-lg font-semibold text-white"> </h3>
                  <p className="text-white/70 font-mono text-sm">VAT: </p>
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
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/10 hidden sm:flex glass-white/10 backdrop-blur-sm border-white/20"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/10 hidden sm:flex glass-white/10 backdrop-blur-sm border-white/20"
                  >
                    <LogOut className="h-5 w-5" />
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
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => window.location.href = '/dashboard'}
                    className="text-white/90 hover:text-white flex items-center space-x-2 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Button>
                  <span className="text-white/90 text-sm font-medium flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>VAT Return Period</span>
                  </span>
                </div>
                <div className="text-white/60 text-xs hidden sm:block">
                  Period Selection
                </div>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-8 pb-12 lg:pt-12 lg:pb-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            {/* Hero Content */}
            <div className="max-w-4xl mx-auto animate-fade-in">
              <div className="mb-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3 animate-bounce-gentle">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse-gentle"></div>
                  VAT Period Selection
                </div>
                
                <div className="icon-premium mb-3 mx-auto">
                  <Calendar className="h-12 w-12 text-white" />
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-2">
                  <span className="text-gradient-primary">Select Your</span>
                  <br />
                  <span className="text-foreground">VAT Return Period</span>
                </h1>
                
                <div className="w-32 h-1 gradient-primary mx-auto mb-3 rounded-full"></div>
                
                <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Choose the bi-monthly taxable period for your VAT return submission. 
                  <span className="text-primary font-semibold">Complete compliance in minutes.</span>
                </p>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex items-center justify-center gap-8 text-muted-foreground text-sm mb-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-success" />
                  <span>Revenue compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>Automatic calculations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-success" />
                  <span>Real-time validation</span>
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

      {/* Period Selection Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">

            {/* Period Selection Card */}
            <div className="card-premium p-8 mb-4 animate-fade-in" data-animate>
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                </h2>
                <p className="text-muted-foreground">
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div className="space-y-3">
                  <Label className="text-foreground font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Tax Year
                  </Label>
                  <Select value={selectedYear} onValueChange={handleYearChange}>
                    <SelectTrigger className="h-12 bg-background border-border hover:border-primary focus:border-primary focus:ring-primary/20 transition-colors">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2022">2022</SelectItem>
                      <SelectItem value="2021">2021</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <Label className="text-foreground font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Tax Period (Bi-Monthly)
                  </Label>
                  <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
                    <SelectTrigger className="h-12 bg-background border-border hover:border-primary focus:border-primary focus:ring-primary/20 transition-colors">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      {VAT_PERIODS.map((period) => (
                        <SelectItem key={period.key} value={period.key}>
                          {period.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* Status Information */}
              <div className="card-modern p-6 mb-2 group hover-lift">
                <div className="flex items-start gap-4">
                  <div className={`icon-modern ${status.type === 'past' ? 'bg-blue-500' : 'bg-primary'}`}>
                    {status.type === 'past' ? 
                      <CheckCircle className="h-5 w-5 text-white" /> : 
                      <Calendar className="h-5 w-5 text-white" />
                    }
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Selected Period: {getPeriodLabel(selectedPeriod)} {selectedYear}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {status.message}
                    </p>
                  </div>
                </div>
              </div>

              {/* Due Date Card */}
              <div className="card-modern p-6 mb-2 group hover-lift">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`icon-modern ${isPastPeriod(selectedYear, selectedPeriod) ? 'bg-muted' : 'bg-warning'}`}>
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {isPastPeriod(selectedYear, selectedPeriod) ? "Submission Was Due" : "Submission Due Date"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {isPastPeriod(selectedYear, selectedPeriod) ? "Past submission deadline" : "Submit your return by this date"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${isPastPeriod(selectedYear, selectedPeriod) ? 'text-muted-foreground' : 'text-destructive'}`}>
                      {getDueDate(selectedYear, selectedPeriod)}
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="flex justify-center mb-2">
                <Button 
                  size="lg"
                  className="btn-primary px-8 py-4 text-lg font-semibold hover-lift"
                  onClick={() => window.location.href = '/vat-submission'}
                >
                  {isPastPeriod(selectedYear, selectedPeriod) ? "View Past Submission" : "Continue to VAT Submission"}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>

              {/* Help Link */}
              <div className="text-center">
                <p className="text-muted-foreground">
                  Need help? <a href="/vat-guide" className="text-primary hover:text-primary/80 font-semibold transition-colors">View VAT submission guide</a>
                </p>
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

export default function VATPeriodPage() {
  return (
    <ProtectedRoute requiresSubscription={false}>
      <VATPeriodContent />
    </ProtectedRoute>
  )
}
