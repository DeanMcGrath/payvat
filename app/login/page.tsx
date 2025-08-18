"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Bell, Settings, LogOut, Search, Shield, CheckCircle, Lock, Mail, UserCheck, AlertTriangle } from 'lucide-react'
import Footer from "@/components/footer"
import { z } from "zod"
import { toast } from "sonner"

// Security: Input validation schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters").max(128, "Password is too long") // Reduced from 8 to 6
})

// Security: Sanitize input
const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>\"']/g, '') // Remove potentially dangerous characters
    .trim()
    .slice(0, 254) // Limit length
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loginAttempts, setLoginAttempts] = useState(0)
  const router = useRouter()

  // Security: Handle login with proper validation and rate limiting
  const handleLogin = async () => {
    // Security: Rate limiting - max 5 attempts
    if (loginAttempts >= 5) {
      setErrors({ general: "Too many login attempts. Please wait before trying again." })
      return
    }

    // Security: Validate inputs
    const sanitizedEmail = sanitizeInput(email)
    const sanitizedPassword = sanitizeInput(password)

    try {
      const validatedData = loginSchema.parse({
        email: sanitizedEmail,
        password: sanitizedPassword
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
    setLoginAttempts(prev => prev + 1)

    try {
      // Production API authentication
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: sanitizedEmail,
          password: sanitizedPassword
        })
      })

      if (response.ok) {
        // Success - redirect to dashboard
        toast.success('Login successful! Redirecting to dashboard...')
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
      } else {
        const errorMessage = "Invalid email or password"
        setErrors({ general: errorMessage })
        toast.error(errorMessage)
      }
    } catch (error) {
      const errorMessage = "Network error occurred. Please try again."
      setErrors({ general: errorMessage })
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Security: Handle input changes with sanitization
  const handleEmailChange = (value: string) => {
    setEmail(sanitizeInput(value))
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }))
    }
  }

  const handlePasswordChange = (value: string) => {
    setPassword(sanitizeInput(value))
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: '' }))
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
                    <span>Secure Login</span>
                  </span>
                  <div className="hidden md:flex items-center space-x-6 text-white/70 text-sm">
                    <button className="hover:text-white transition-colors" onClick={() => router.push('/about')}>About</button>
                  </div>
                </div>
                <div className="text-white/60 text-xs hidden sm:block">
                  Access your VAT dashboard securely
                </div>
              </div>
            </div>
          </nav>
        </div>
      </header>


      <div className="max-w-lg mx-auto px-6 content-after-header pb-8 relative z-10">
        <div className="card-premium p-8">
          <div className="text-center mb-4">
            <div className="icon-premium mb-4 mx-auto">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-1">Sign In to Your Account</h2>
            <p className="text-muted-foreground">Access your secure VAT dashboard</p>
          </div>
          
          {/* Security: Display general errors */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {errors.general}
            </div>
          )}
          
          
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                className={`bg-white/50 border-gray-200 focus:border-primary focus:ring-primary text-foreground rounded-lg backdrop-blur-sm ${errors.email ? 'border-red-500' : ''}`}
                placeholder="your@email.com"
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
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                className={`bg-white/50 border-gray-200 focus:border-primary focus:ring-primary text-foreground rounded-lg backdrop-blur-sm ${errors.password ? 'border-red-500' : ''}`}
                placeholder="Enter your password"
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-destructive text-sm flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.password}
                </p>
              )}
            </div>
            
            <div className="pt-4">
              <Button 
                type="button"
                className="w-full btn-primary py-4 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleLogin}
                disabled={isLoading || loginAttempts >= 5}
              >
                {isLoading ? "Signing In..." : "Sign In Securely"}
              </Button>
            </div>
          </div>
          
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="form-checkbox h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Remember me</span>
              </label>
              <Button variant="link" className="text-primary hover:text-primary/80 p-0">
                Forgot password?
              </Button>
            </div>
            
            <div className="text-center pt-4 border-t">
              <p className="text-muted-foreground text-sm mb-3">
                Don't have an account?
              </p>
              <Button 
                type="button"
                variant="outline"
                className="btn-outline font-medium"
                onClick={() => router.push('/signup')}
              >
                Create Account
              </Button>
            </div>
          </div>
        </div>
        
        {/* Live Chat */}
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  )
}
