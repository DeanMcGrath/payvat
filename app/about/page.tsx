"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Bell, Settings, LogOut, Search, Shield, Clock, Users, Target, CheckCircle, Euro } from 'lucide-react'
import LiveChat from "@/components/live-chat"
import Footer from "@/components/footer"

export default function AboutPayVat() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-thin">PAY <span className="text-teal-200">VAT</span></h1>
            
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
              <span className="text-white">About PayVat</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">About PayVat</h2>
          <p className="text-gray-600">Putting control of VAT submissions back in the hands of Irish businesses</p>
        </div>

        {/* Who We Are */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <Users className="h-5 w-5 text-teal-500 mr-2" />
              Who We Are
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              PayVat is an Irish fintech company on a mission to put control of VAT submissions and payments back in the hands of Irish businesses. Founded by accountants and technologists, we grew frustrated watching small and medium-sized enterprises (SMEs) pay exorbitant fees to solicitors or third-party accountants, simply to file their VAT returns.
            </p>
            <p className="text-gray-600">
              The old way is costly, slow, and opaque—so we built a better solution.
            </p>
          </CardContent>
        </Card>

        {/* Our Vision */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <Target className="h-5 w-5 text-teal-500 mr-2" />
              Our Vision
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              We believe every Irish business, from startups to established SMEs, deserves an intuitive, secure, and affordable way to manage VAT. No more delays, no hidden fees, no hand-holding—just a streamlined platform that lets you submit and pay your VAT in minutes.
            </p>
          </CardContent>
        </Card>

        {/* What We Do */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">What We Do</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Self-Service VAT Filing</h4>
                    <p className="text-gray-600 text-sm">Create your account on PayVat.ie and submit returns directly to the Revenue Commissioners.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bell className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Automated Reminders</h4>
                    <p className="text-gray-600 text-sm">Never miss a deadline—custom notifications keep you on track.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Secure Payments</h4>
                    <p className="text-gray-600 text-sm">One-click VAT payments via Revenue&apos;s Online Service (ROS).</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Euro className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Transparent Pricing</h4>
                    <p className="text-gray-600 text-sm">Flat monthly or annual fee—no surprises, no per-submission charges.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="bg-teal-50 rounded-xl p-6 border border-teal-200 mb-8">
          <h4 className="font-semibold text-teal-800 mb-4 text-center text-xl">
            Why Choose PayVat?
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-teal-600 flex-shrink-0" />
              <div>
                <span className="text-teal-700 font-medium">Save Money</span>
                <p className="text-teal-600 text-sm">At just €30/month (or €300/year), more cost-effective than traditional solutions</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-teal-600 flex-shrink-0" />
              <div>
                <span className="text-teal-700 font-medium">Gain Control</span>
                <p className="text-teal-600 text-sm">You decide when and how to file—no waiting for your accountant&apos;s schedule</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-teal-600 flex-shrink-0" />
              <div>
                <span className="text-teal-700 font-medium">Speed & Simplicity</span>
                <p className="text-teal-600 text-sm">Step-by-step wizard makes filing a breeze, even if VAT isn&apos;t your forte</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-teal-600 flex-shrink-0" />
              <div>
                <span className="text-teal-700 font-medium">Dedicated Support</span>
                <p className="text-teal-600 text-sm">Irish-based team available via email or chat to answer your questions</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <Card className="text-center">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Take Control?</h3>
            <p className="text-gray-600 mb-6">Get back to focusing on growing your business. Sign up at PayVat.ie today and experience VAT the easy way.</p>
            <Button 
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-8 text-lg"
              onClick={() => window.location.href = '/signup'}
            >
              Sign Up Now
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Live Chat */}
      <LiveChat />

      {/* Footer */}
      <Footer />
    </div>
  )
}