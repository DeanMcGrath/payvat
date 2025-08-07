"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Bell, Settings, LogOut, Search } from 'lucide-react'
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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
          businessName: businessName.trim(),
          vatNumber: vatNumber.trim() || undefined
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        toast.success('Account created successfully! Redirecting to dashboard...')
        // Redirect to dashboard after successful registration
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 1500)
      } else {
        const errorMessage = data.error || 'Registration failed'
        setErrors({ general: errorMessage })
        toast.error(errorMessage)
      }
    } catch (error) {
      const errorMessage = 'Network error occurred. Please try again.'
      setErrors({ general: errorMessage })
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-thin">PayVAT</h1>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Search"
                  className="w-64 bg-white text-gray-900 border-0"
                />
                <Button size="sm" className="bg-blue-700 hover:bg-blue-800">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" className="text-white hover:bg-teal-600">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-white hover:bg-teal-600">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-white hover:bg-teal-600">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="bg-teal-600 px-6 py-3">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-white">Sign Up</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-12">
              <p className="text-gray-600 text-lg">
                Create your account to get started.
              </p>
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
            <div>
              <Label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                Business Name *
              </Label>
              <Input
                id="businessName"
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className={`w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-gray-900 ${errors.businessName ? 'border-red-500' : ''}`}
                placeholder="Enter your business name"
                disabled={isLoading}
              />
              {errors.businessName && (
                <p className="text-red-500 text-sm mt-1">{errors.businessName}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="vatNumber" className="block text-sm font-medium text-gray-700 mb-2">
                VAT Number <span className="text-gray-400">(Optional)</span>
              </Label>
              <Input
                id="vatNumber"
                type="text"
                value={vatNumber}
                onChange={(e) => setVatNumber(e.target.value)}
                className={`w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-gray-900 ${errors.vatNumber ? 'border-red-500' : ''}`}
                placeholder="Enter your VAT number (optional)"
                disabled={isLoading}
              />
              {errors.vatNumber && (
                <p className="text-red-500 text-sm mt-1">{errors.vatNumber}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-gray-900 ${errors.email ? 'border-red-500' : ''}`}
                placeholder="Enter your email address"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password * <span className="text-gray-400">(min. 6 characters)</span>
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-gray-900 ${errors.password ? 'border-red-500' : ''}`}
                placeholder="Create a secure password"
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-gray-900 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                placeholder="Confirm your password"
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>
            
            <div className="pt-4">
              <Button 
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleRegister}
                disabled={isLoading || success}
              >
                {isLoading ? "Creating Account..." : success ? "Account Created!" : "Create Account"}
              </Button>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <button 
                className="text-teal-600 hover:text-teal-700 font-medium hover:underline"
                onClick={() => window.location.href = '/login'}
              >
                Sign in
              </button>
            </p>
          </div>
          
          {/* Live Chat */}
          <LiveChat />
          
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  )
}
