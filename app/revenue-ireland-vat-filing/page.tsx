"use client"

import { useState, useEffect } from "react"
import { ArrowRight, Calculator, FileText, CheckCircle, Clock, Shield, Users, TrendingUp, AlertCircle, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import SiteHeader from "@/components/site-header"

export default function RevenueIrelandVATFilingPage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const filingMethods = [
    {
      method: "ROS Online",
      description: "Revenue Online Service - the official digital platform",
      features: ["Direct to Revenue systems", "Real-time validation", "Immediate confirmation"],
      difficulty: "Medium",
      timeRequired: "30-60 minutes",
      icon: FileText
    },
    {
      method: "PayVAT Automation",
      description: "AI-powered automated VAT filing with Revenue integration",
      features: ["Automated data extraction", "Pre-filled VAT3 forms", "One-click submission"],
      difficulty: "Easy",
      timeRequired: "5-10 minutes",
      icon: Calculator
    },
    {
      method: "Paper Forms",
      description: "Traditional paper VAT3 forms posted to Revenue",
      features: ["Manual completion required", "Posted to Revenue offices", "Longer processing time"],
      difficulty: "Hard",
      timeRequired: "2-3 hours",
      icon: AlertCircle
    }
  ]

  const rosRequirements = [
    "Valid TRN (Tax Reference Number)",
    "Revenue PIN for online access",
    "Digital certificate or password authentication",
    "Completed VAT3 return form",
    "Supporting documentation ready"
  ]

  const filingDeadlines = [
    { period: "Bi-monthly (Most businesses)", deadline: "19th of following month", example: "Jan-Feb VAT due by March 19th" },
    { period: "Monthly (Large traders)", deadline: "19th of following month", example: "January VAT due by February 19th" },
    { period: "Annual (Small businesses)", deadline: "19th January", example: "Annual return due by January 19th" }
  ]

  const commonErrors = [
    {
      error: "Incorrect VAT calculations",
      impact: "Delays in processing, potential penalties",
      prevention: "Use automated calculation tools, double-check figures"
    },
    {
      error: "Missing supporting documents",
      impact: "Revenue queries, extended processing time",
      prevention: "Keep detailed records, submit all required documentation"
    },
    {
      error: "Late submission",
      impact: "Interest charges (0.0274% daily), late filing penalties",
      prevention: "Set up deadline reminders, use automated submission"
    },
    {
      error: "Wrong filing period selected",
      impact: "Confusion in records, potential compliance issues",
      prevention: "Verify filing period matches your business requirements"
    }
  ]

  const benefits = [
    {
      icon: Clock,
      title: "Faster Processing",
      description: "Electronic submissions processed within 24-48 hours vs weeks for paper"
    },
    {
      icon: Shield,
      title: "Enhanced Security",
      description: "Encrypted transmission directly to Revenue systems with audit trail"
    },
    {
      icon: CheckCircle,
      title: "Immediate Confirmation",
      description: "Instant acknowledgment and receipt for your VAT submission"
    },
    {
      icon: TrendingUp,
      title: "Better Compliance",
      description: "Built-in validation reduces errors and ensures compliance"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50">
      <SiteHeader />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-green-700 to-green-900 text-white py-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="max-w-4xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Revenue Ireland VAT Filing: Complete Submission Guide
              </h1>
              <p className="text-xl md:text-2xl text-green-100 mb-8">
                Everything you need to know about filing VAT returns with Irish Revenue. Step-by-step guide to ROS submissions, deadlines, and compliance requirements for 2025.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-white text-green-700 hover:bg-green-50">
                  <Calculator className="mr-2 h-5 w-5" />
                  Start Filing Now
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-700">
                  <Download className="mr-2 h-5 w-5" />
                  Download Filing Guide
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Filing Methods Comparison */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                VAT Filing Methods with Revenue Ireland
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Compare the different ways to submit your VAT returns to Irish Revenue and choose the best method for your business.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {filingMethods.map((method, index) => (
                <Card key={index} className={`relative ${method.method === 'PayVAT Automation' ? 'ring-2 ring-green-500 ring-offset-2' : ''}`}>
                  {method.method === 'PayVAT Automation' && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500">
                      RECOMMENDED
                    </Badge>
                  )}
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <method.icon className={`h-8 w-8 ${
                        method.method === 'PayVAT Automation' ? 'text-green-600' : 
                        method.method === 'ROS Online' ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                      <div>
                        <CardTitle className="text-xl">{method.method}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="font-medium">Difficulty:</span>
                          <Badge variant={
                            method.difficulty === 'Easy' ? 'default' :
                            method.difficulty === 'Medium' ? 'secondary' : 'destructive'
                          } className="ml-2">
                            {method.difficulty}
                          </Badge>
                        </div>
                        <div>
                          <span className="font-medium">Time:</span>
                          <span className="ml-2 text-gray-600">{method.timeRequired}</span>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Features:</h4>
                        <ul className="space-y-1">
                          {method.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                              <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ROS Requirements */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  ROS Filing Requirements
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  What you need to file your VAT return through Revenue Online Service (ROS).
                </p>
                
                <div className="space-y-4">
                  {rosRequirements.map((requirement, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{requirement}</span>
                    </div>
                  ))}
                </div>

                <Alert className="mt-8 border-blue-200 bg-blue-50">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>First-time ROS users:</strong> You'll need to register for ROS access through Revenue.ie and may need to visit a Revenue office for identity verification.
                  </AlertDescription>
                </Alert>
              </div>

              <Card className="lg:mt-12">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 text-blue-600 mr-2" />
                    PayVAT Alternative
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Skip the complex ROS setup with PayVAT's automated filing system:
                  </p>
                  <ul className="space-y-2">
                    {[
                      "No ROS registration required",
                      "Automated document processing", 
                      "Pre-filled VAT3 forms",
                      "Direct Revenue submission",
                      "Built-in compliance checking"
                    ].map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-6" size="lg">
                    Try PayVAT Free
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Filing Deadlines */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Revenue Ireland VAT Filing Deadlines
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Know your VAT filing schedule to avoid late penalties and interest charges.
              </p>
            </div>

            <div className="space-y-6">
              {filingDeadlines.map((deadline, index) => (
                <Card key={index} className="p-6">
                  <div className="grid md:grid-cols-3 gap-4 items-center">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{deadline.period}</h3>
                    </div>
                    <div className="text-center">
                      <Badge className="bg-red-100 text-red-800 px-4 py-2">
                        Due: {deadline.deadline}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-gray-600 italic text-sm">{deadline.example}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Common Errors */}
        <section className="py-16 bg-red-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Avoid Common VAT Filing Mistakes
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Learn from the most common errors that cause delays and penalties in Revenue VAT submissions.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {commonErrors.map((error, index) => (
                <Card key={index} className="border-red-200">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-6 w-6 text-red-500 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">{error.error}</h3>
                        <p className="text-sm text-gray-600 mb-3">
                          <strong>Impact:</strong> {error.impact}
                        </p>
                        <p className="text-sm text-green-700">
                          <strong>Prevention:</strong> {error.prevention}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Benefits of Electronic VAT Filing
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Why more Irish businesses are switching from paper to electronic VAT submissions.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <Card key={index} className="text-center p-6">
                  <benefit.icon className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm">{benefit.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-green-600 text-white">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Simplify Your Revenue VAT Filing?
            </h2>
            <p className="text-xl text-green-100 mb-8">
              Join thousands of Irish businesses using PayVAT for automated, accurate VAT submissions to Revenue Ireland.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-green-600 hover:bg-green-50">
                <ArrowRight className="mr-2 h-5 w-5" />
                Start Your Free Trial
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                <Users className="mr-2 h-5 w-5" />
                See Customer Stories
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}