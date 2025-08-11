"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Bell, Settings, LogOut, Search, Shield, CheckCircle, Lock, Mail, UserPlus, Building, AlertTriangle } from 'lucide-react'
import LiveChat from "./components/live-chat"
import Footer from "./components/footer"
import { z } from "zod"
import { toast } from "sonner"

// Registration schema
const registerSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters").max(128, "Password is too long"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  vatNumber: z.string().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
})

export default function SignupPage() {
  const [businessName, setBusinessName] = useState("")
  const [vatNumber, setVatNumber] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)

  // Handle registration
  const handleRegister = async () => {
    try {
      const validatedData = registerSchema.parse({
        email: email.trim(),
        password,
        confirmPassword,
        businessName: businessName.trim(),
        vatNumber: vatNumber.trim() || undefined
      })
      setErrors({}) // Clear previous errors
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message
          }
        })
        setErrors(newErrors)
        return
      }
    }

    setIsLoading(true)

    try {
      console.log('📤 Starting registration request...')
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
          businessName: businessName.trim(),
          vatNumber: vatNumber.trim() || undefined
        })
      })

      // Log comprehensive response details for debugging
      console.log('📥 Registration response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        redirected: response.redirected,
        type: response.type,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries())
      })

      // Get response text first to check if it's valid JSON
      let responseText = ''
      let data: any = null
      
      try {
        responseText = await response.text()
        console.log('📄 Raw response text:', responseText)
        
        // Check if response text is empty
        if (!responseText || responseText.trim() === '') {
          throw new Error('Empty response body received')
        }
        
        // Try to parse as JSON
        data = JSON.parse(responseText)
        console.log('✅ Parsed JSON data:', data)
      } catch (parseError) {
        console.error('🚨 JSON parsing failed:', {
          parseError,
          responseText,
          responseLength: responseText.length,
          responsePreview: responseText.substring(0, 200)
        })
        throw new Error(`Failed to parse server response: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`)
      }

      if (response.ok) {
        console.log('✅ Registration successful!')
        setSuccess(true)
        toast.success('Account created successfully! Redirecting to dashboard...')
        // Redirect to dashboard after successful registration
        setTimeout(() => {
          console.log('🔄 Redirecting to dashboard...')
          window.location.href = '/dashboard'
        }, 1500)
      } else {
        console.log('❌ Registration failed with server error:', {
          status: response.status,
          statusText: response.statusText,
          data
        })
        const errorMessage = data?.error || `Registration failed (${response.status}: ${response.statusText})`
        setErrors({ general: errorMessage })
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('🚨 Registration request failed:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        name: error instanceof Error ? error.name : 'Unknown error type'
      })
      
      let errorMessage = 'Registration failed. Please try again.'
      
      if (error instanceof Error) {
        if (error.message.includes('parse')) {
          errorMessage = 'Server returned invalid response. Please try again or contact support.'
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Network connection failed. Please check your connection and try again.'
        } else if (error.message.includes('Empty response')) {
          errorMessage = 'Server returned empty response. Please try again.'
        } else {
          errorMessage = `Error: ${error.message}`
        }
      }
      
      setErrors({ general: errorMessage })
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

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
                      placeholder="Search..."
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
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/10 hidden sm:flex glass-white/10 backdrop-blur-sm border-white/20"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-white border-white/20 hover:bg-white/10 hidden sm:flex glass-white/10 backdrop-blur-sm"
                    onClick={() => window.location.href = '/login'}
                  >
                    Sign In
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
                    <span>Create Account</span>
                  </span>
                  <div className="hidden md:flex items-center space-x-6 text-white/70 text-sm">
                    <button className="hover:text-white transition-colors" onClick={() => window.location.href = '/about'}>About</button>
                    <button className="hover:text-white transition-colors" onClick={() => window.location.href = '/pricing'}>Pricing</button>
                    <button className="hover:text-white transition-colors" onClick={() => window.location.href = '/vat-guide'}>VAT Guide</button>
                    <button className="hover:text-white transition-colors" onClick={() => window.location.href = '/vat-registration'}>Get VAT Number</button>
                    <button className="hover:text-white transition-colors" onClick={() => window.location.href = '/login'}>Login</button>
                  </div>
                </div>
                <div className="text-white/60 text-xs hidden sm:block">
                  Join thousands of Irish businesses
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
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3 animate-bounce-gentle">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse-gentle"></div>
                  Join Irish businesses
                </div>
                
                <div className="icon-premium mb-3 mx-auto">
                  <UserPlus className="h-12 w-12 text-white" />
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-3">
                  <span className="text-gradient-primary">Start Your VAT</span>
                  <br />
                  <span className="text-foreground">Journey Today</span>
                </h1>
                
                <div className="w-32 h-1 gradient-primary mx-auto mb-4 rounded-full"></div>
                
                <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Create your account and join thousands of Irish businesses managing VAT effortlessly. 
                  <span className="text-primary font-semibold">Get started in minutes.</span>
                </p>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex items-center justify-center gap-8 text-muted-foreground text-sm mb-12">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-success" />
                  <span>Secure & compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-success" />
                  <span>Irish businesses</span>
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

      <div className="max-w-lg mx-auto px-6 py-8 -mt-16 relative z-10">
        <div className="card-premium p-8 hover-lift">
          <div className="text-center mb-8">
            <div className="icon-premium mb-4 mx-auto">
              <Building className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Create Your Business Account</h2>
            <p className="text-muted-foreground">Join thousands of Irish businesses</p>
          </div>
          
          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              Account created successfully! Redirecting to dashboard...
            </div>
          )}
          
          {/* Error Messages */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {errors.general}
            </div>
          )}
          
          {/* Form */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="businessName" className="text-foreground font-medium flex items-center gap-2">
                <Building className="h-4 w-4 text-primary" />
                Business Name *
              </Label>
              <Input
                id="businessName"
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className={`bg-white/50 border-gray-200 focus:border-primary focus:ring-primary text-foreground rounded-lg backdrop-blur-sm ${errors.businessName ? 'border-red-500' : ''}`}
                placeholder="Enter your business name"
                disabled={isLoading}
              />
              {errors.businessName && (
                <p className="text-destructive text-sm flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.businessName}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vatNumber" className="text-foreground font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                VAT Number
              </Label>
              <Input
                id="vatNumber"
                type="text"
                value={vatNumber}
                onChange={(e) => setVatNumber(e.target.value)}
                className={`bg-white/50 border-gray-200 focus:border-primary focus:ring-primary text-foreground rounded-lg backdrop-blur-sm ${errors.vatNumber ? 'border-red-500' : ''}`}
                placeholder="  "
                disabled={isLoading}
              />
              {errors.vatNumber && (
                <p className="text-destructive text-sm flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.vatNumber}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`bg-white/50 border-gray-200 focus:border-primary focus:ring-primary text-foreground rounded-lg backdrop-blur-sm ${errors.email ? 'border-red-500' : ''}`}
                placeholder="your@business.ie"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-destructive text-sm flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.email}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                Password * <span className="text-muted-foreground text-sm font-normal">(min. 6 characters)</span>
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`bg-white/50 border-gray-200 focus:border-primary focus:ring-primary text-foreground rounded-lg backdrop-blur-sm ${errors.password ? 'border-red-500' : ''}`}
                placeholder="Create a secure password"
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-destructive text-sm flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.password}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground font-medium flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" />
                Confirm Password *
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`bg-white/50 border-gray-200 focus:border-primary focus:ring-primary text-foreground rounded-lg backdrop-blur-sm ${errors.confirmPassword ? 'border-red-500' : ''}`}
                placeholder="Confirm your password"
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="text-destructive text-sm flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>
            
            <div className="pt-4">
              <Button 
                className="w-full btn-primary py-4 font-semibold text-lg hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleRegister}
                disabled={isLoading || success}
              >
                {isLoading ? "Creating Account..." : success ? "Account Created!" : "Start Free Trial"}
              </Button>
            </div>
          </div>
          
          <div className="mt-8 space-y-4">
            <div className="text-center text-xs text-muted-foreground px-4">
              By creating an account, you agree to our terms of service and privacy policy. 
              Your VAT data is encrypted and secure.
            </div>
            
            <div className="text-center pt-4 border-t">
              <p className="text-muted-foreground text-sm mb-3">
                Already have an account?
              </p>
              <Button 
                variant="outline"
                className="btn-outline font-medium"
                onClick={() => window.location.href = '/login'}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
        
        {/* Live Chat */}
        <LiveChat />
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  )
}
