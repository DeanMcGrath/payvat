"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import LiveChat from "./components/live-chat"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Business Info - Top Right */}
      <div className="flex justify-end mb-4">
        <div className="text-right">
          <h3 className="text-lg font-bold text-gray-800">Brian Cusack Trading Ltd</h3>
          <p className="text-emerald-600 font-mono text-sm">VAT: IE0352440A</p>
        </div>
      </div>
      
      <div className="flex items-center justify-center">
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex flex-col items-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-1">
                PAY <span className="text-emerald-500">VAT</span>
              </h1>
              <div className="w-16 h-0.5 bg-emerald-500 mt-3"></div>
            </div>
          </div>
          
          <h2 className="text-gray-800 text-lg font-semibold mb-6 text-center">Login to Your Account</h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 text-sm font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-gray-900 rounded-lg"
                placeholder="your@email.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-gray-900 rounded-lg"
                placeholder="Enter your password"
              />
            </div>
            
            <div className="pt-4">
              <Button 
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
                onClick={() => window.location.href = '/dashboard'}
              >
                Login
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
