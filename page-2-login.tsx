"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import LiveChat from "./components/live-chat"
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
          window.location.href = '/dashboard'
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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="flex items-center justify-center">
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 md:p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex flex-col items-center">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-1">
                PAY <span className="text-emerald-500">VAT</span>
              </h1>
              <div className="w-16 h-0.5 bg-emerald-500 mt-3"></div>
            </div>
          </div>
          
          <h2 className="text-gray-800 text-lg font-semibold mb-6 text-center">Login to Your Account</h2>
          
          {/* Security: Display general errors */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {errors.general}
            </div>
          )}
          
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 text-sm font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                className={`bg-white border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-gray-900 rounded-lg ${errors.email ? 'border-red-500' : ''}`}
                placeholder="your@email.com"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                className={`bg-white border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-gray-900 rounded-lg ${errors.password ? 'border-red-500' : ''}`}
                placeholder="Enter your password"
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password}</p>
              )}
            </div>
            
            <div className="pt-4">
              <Button 
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleLogin}
                disabled={isLoading || loginAttempts >= 5}
              >
                {isLoading ? "Signing In..." : "Login"}
              </Button>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm mb-2">
              Don't have an account?
            </p>
            <Button 
              variant="link"
              className="text-emerald-600 hover:text-emerald-700 font-medium"
              onClick={() => window.location.href = '/signup'}
            >
              Sign up here
            </Button>
          </div>

          {/* Live Chat */}
          <LiveChat />

          {/* Footer */}
          <footer className="mt-8 py-6 text-center border-t border-gray-200">
            <p className="text-gray-500 text-sm">payvat.ie</p>
          </footer>
        </div>
      </div>
    </div>
  )
}
