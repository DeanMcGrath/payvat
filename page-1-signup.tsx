"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import LiveChat from "./components/live-chat"

export default function SignupPage() {
  const [businessName, setBusinessName] = useState("")
  const [vatNumber, setVatNumber] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  return (
    <div className="min-h-screen bg-white">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="text-gray-600 text-lg">
              Create your account to get started.
            </p>
          </div>
          
          {/* Form */}
          <div className="space-y-6">
            <div>
              <Label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                Business Name
              </Label>
              <Input
                id="businessName"
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
                placeholder="Enter your business name"
              />
            </div>
            
            <div>
              <Label htmlFor="vatNumber" className="block text-sm font-medium text-gray-700 mb-2">
                VAT Number
              </Label>
              <Input
                id="vatNumber"
                type="text"
                value={vatNumber}
                onChange={(e) => setVatNumber(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
                placeholder="IE0000000AA"
              />
            </div>
            
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
                placeholder="Enter your email address"
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
                placeholder="Create a secure password"
              />
            </div>
            
            <div>
              <Label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
                placeholder="Confirm your password"
              />
            </div>
            
            <div className="pt-4">
              <Button 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200"
                onClick={() => window.location.href = '/dashboard'}
              >
                Create Account
              </Button>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <button 
                className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
                onClick={() => window.location.href = '/login'}
              >
                Sign in
              </button>
            </p>
          </div>
          
          {/* Live Chat */}
          <LiveChat />
          
          {/* Footer */}
          <div className="mt-16 text-center border-t border-gray-200 pt-8">
            <p className="text-gray-500 text-sm">payvat.ie</p>
            <p className="text-xs text-gray-400 mt-2">
              Secure VAT submission and payment processing
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
