import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'VAT Automation Software Ireland: AI-Powered Submission System | PayVAT',
  description: 'Advanced VAT automation software for Irish businesses. AI-powered document processing, automated Revenue submissions, and 90% time savings. Free trial available.',
}

"use client"

import { useState, useEffect } from "react"
import { Bot, Zap, FileText, Upload, CheckCircle, ArrowRight, Clock, Shield, TrendingUp, Users, Star, Calculator, Smartphone, Cloud, HelpCircle, ChevronRight, Play } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import SiteHeader from "@/components/site-header"
import Footer from "@/components/footer"
import ArticleSchema from "@/components/article-schema"

export default function VATAutomationSoftwarePage() {
  const [isVisible, setIsVisible] = useState(false)
  const [activeDemo, setActiveDemo] = useState(0)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const automationFeatures = [
    {
      icon: Bot,
      title: "AI Document Processing",
      description: "Advanced AI extracts VAT amounts from receipts, invoices, and bank statements with 99.5% accuracy",
      benefit: "Eliminate manual data entry",
      timesSaved: "15 hours/month"
    },
    {
      icon: Calculator,
      title: "Automated VAT Calculations", 
      description: "Intelligent VAT rate detection and calculation for all Irish VAT categories and exemptions",
      benefit: "Zero calculation errors",
      timesSaved: "8 hours/month"
    },
    {
      icon: Upload,
      title: "One-Click Revenue Submission",
      description: "Direct integration with Revenue Ireland systems for automated VAT3 return submission",
      benefit: "Never miss deadlines",
      timesSaved: "5 hours/month"
    },
    {
      icon: Shield,
      title: "Compliance Monitoring",
      description: "Real-time compliance checking with alerts for potential issues or missed opportunities",
      benefit: "Avoid penalties automatically",
      timesSaved: "12 hours/month"
    }
  ]

  const traditionalVsAutomated = [
    {
      task: "Receipt Data Entry",
      traditional: "2-3 hours manual typing",
      automated: "30 seconds AI extraction",
      improvement: "95% faster"
    },
    {
      task: "VAT Rate Classification",
      traditional: "45 minutes research & application", 
      automated: "Instant automatic detection",
      improvement: "100% accurate"
    },
    {
      task: "Revenue Submission",
      traditional: "1-2 hours ROS navigation",
      automated: "One-click submission", 
      improvement: "90% time saved"
    },
    {
      task: "Compliance Checking",
      traditional: "4 hours monthly review",
      automated: "Real-time monitoring",
      improvement: "Continuous protection"
    }
  ]

  const integrations = [
    {
      category: "Accounting Software",
      systems: ["Sage", "QuickBooks", "Xero", "FreeAgent", "Receipt Bank"],
      description: "Seamless sync with your existing accounting system"
    },
    {
      category: "Banking Platforms", 
      systems: ["AIB", "Bank of Ireland", "Ulster Bank", "Permanent TSB", "Credit Unions"],
      description: "Direct bank feed integration for transaction processing"
    },
    {
      category: "E-commerce Platforms",
      systems: ["Shopify", "WooCommerce", "Magento", "BigCommerce", "Amazon"],
      description: "Automated sales data import and VAT calculation"
    },
    {
      category: "Revenue Systems",
      systems: ["ROS", "VAT3 Portal", "Revenue API", "Digital Certificates", "myAccount"],
      description: "Direct submission to all Irish Revenue platforms"
    }
  ]

  const customerResults = [
    {
      company: "Dublin Marketing Agency",
      sector: "Professional Services", 
      employees: "12 staff",
      results: {
        timeSaved: "25 hours/month",
        errorReduction: "100%",
        costSaving: "€8,400/year",
        complianceScore: "Perfect for 18 months"
      },
      testimonial: "PayVAT transformed our VAT processing from a monthly nightmare into a 5-minute task."
    },
    {
      company: "Cork Restaurant Group",
      sector: "Hospitality",
      employees: "45 staff", 
      results: {
        timeSaved: "40 hours/month",
        errorReduction: "98%", 
        costSaving: "€15,600/year",
        complianceScore: "Zero penalties since adoption"
      },
      testimonial: "The AI handles all our complex reduced-rate VAT calculations perfectly."
    },
    {
      company: "Galway Tech Startup",
      sector: "Software Development",
      employees: "8 staff",
      results: {
        timeSaved: "20 hours/month",
        errorReduction: "100%",
        costSaving: "€6,000/year", 
        complianceScore: "Automated compliance monitoring"
      },
      testimonial: "Finally we can focus on building products instead of VAT paperwork."
    }
  ]

  const pricingTiers = [
    {
      name: "Starter",
      price: "€49",
      period: "/month",
      description: "Perfect for small businesses and freelancers",
      features: [
        "Up to 100 documents/month",
        "AI VAT extraction",
        "Basic Revenue submission", 
        "Email support",
        "Mobile app access"
      ],
      popular: false
    },
    {
      name: "Professional", 
      price: "€99",
      period: "/month",
      description: "Ideal for growing businesses",
      features: [
        "Up to 500 documents/month",
        "Advanced AI processing",
        "Priority Revenue submission",
        "Accounting software integration",
        "Phone + email support",
        "Custom VAT rules",
        "Quarterly compliance reports"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "€199",
      period: "/month", 
      description: "For larger businesses with complex needs",
      features: [
        "Unlimited documents",
        "Multi-location support",
        "Dedicated account manager",
        "Custom integrations",
        "Priority phone support",
        "Advanced reporting",
        "SLA guarantees"
      ],
      popular: false
    }
  ]

  const faqItems = [
    {
      question: "How does VAT automation software work for Irish businesses?",
      answer: "VAT automation software uses AI to process your business documents, extract VAT information, apply correct Irish VAT rates (23%, 13.5%, 9%, 0%), and automatically submit VAT3 returns to Revenue Ireland. The system integrates with your existing accounting software and bank accounts to capture all VAT-eligible transactions without manual input."
    },
    {
      question: "Is automated VAT submission to Revenue Ireland secure and compliant?",
      answer: "Yes, PayVAT uses the same security protocols as Revenue's ROS system with 256-bit encryption and digital certificates. All submissions are made through official Revenue APIs with full audit trails. The system is designed to meet all Irish VAT compliance requirements and includes built-in validation checks."
    },
    {
      question: "Can VAT software handle complex Irish VAT scenarios?",
      answer: "Advanced VAT automation software handles all Irish VAT complexities including multiple VAT rates, EU reverse charges, input VAT recovery, exemptions, and mixed supplies. The AI learns your business patterns and applies the correct treatment for restaurant VAT (9%), reduced rates (13.5%), and standard rates (23%)."
    },
    {
      question: "How much time does automated VAT processing save monthly?", 
      answer: "Most Irish businesses save 20-40 hours per month with VAT automation. This includes eliminating manual receipt entry (15 hours), automatic VAT calculations (8 hours), simplified Revenue submission (5 hours), and continuous compliance monitoring (12 hours). ROI typically achieved within 2-3 months."
    },
    {
      question: "What happens if the VAT software makes an error in my submission?",
      answer: "Professional VAT automation systems include error protection with manual review options for flagged transactions. PayVAT provides error insurance covering any automated submission mistakes, plus dedicated support to handle any Revenue queries. All submissions include detailed audit trails for transparency."
    },
    {
      question: "Does VAT automation software integrate with Irish accounting systems?",
      answer: "Yes, leading VAT automation platforms integrate with all major Irish accounting software including Sage, QuickBooks, Xero, and FreeAgent. The integration syncs VAT data both ways, ensuring your accounting records stay current with automated VAT submissions while maintaining existing workflows."
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <ArticleSchema
        title="VAT Automation Software Ireland: AI-Powered Revenue Submission System"
        description="Advanced VAT automation software for Irish businesses featuring AI document processing, automated Revenue submissions, and comprehensive compliance monitoring."
        keywords={["VAT software Ireland", "automated VAT submission Ireland", "VAT automation Ireland", "AI VAT processing", "Revenue VAT integration"]}
        url="https://payvat.ie/vat-automation-software-ireland"
      />
      <SiteHeader />

      <div className="max-w-7xl mx-auto px-6 content-after-header pb-8">
        {/* Hero Section */}
        <section className="py-12 mb-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-normal text-foreground mb-6">
                VAT Automation Software Ireland: <span className="text-gradient-primary">AI-Powered Revenue Integration</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                Transform your VAT processing with <strong>VAT software Ireland</strong> that delivers AI-powered document processing, automated Revenue submissions, and 90% time savings for Irish businesses.
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="text-sm font-normal text-foreground">99.5% AI accuracy</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="text-sm font-normal text-foreground">Direct Revenue integration</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="text-sm font-normal text-foreground">30-day free trial</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="btn-primary px-8 py-3 text-lg">
                  <Play className="mr-2 h-5 w-5" />
                  Watch 2-Minute Demo
                </Button>
                <Button size="lg" variant="outline" className="px-8 py-3 text-lg">
                  <Upload className="mr-2 h-5 w-5" />
                  Start Free Trial
                </Button>
              </div>
            </div>
            <div className="card-premium p-8">
              <h3 className="text-xl font-normal text-foreground mb-6">See PayVAT in Action</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <Upload className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-normal text-foreground">Upload receipts</p>
                    <p className="text-sm text-muted-foreground">Drag & drop or photo upload</p>
                  </div>
                  <Badge className="bg-success text-white">2 seconds</Badge>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-normal text-foreground">AI processes data</p>
                    <p className="text-sm text-muted-foreground">Extract VAT & classify rates</p>
                  </div>
                  <Badge className="bg-success text-white">30 seconds</Badge>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-normal text-foreground">Submit to Revenue</p>
                    <p className="text-sm text-muted-foreground">Automatic VAT3 filing</p>
                  </div>
                  <Badge className="bg-success text-white">1 click</Badge>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Features */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-normal text-foreground mb-4">
              Why Choose <span className="text-gradient-primary">Automated VAT Submission Ireland</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Advanced automation features designed specifically for Irish VAT requirements and Revenue integration.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {automationFeatures.map((feature, index) => (
              <Card key={index} className="card-modern hover-lift p-6">
                <div className="flex items-start gap-4">
                  <div className="icon-modern bg-primary">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-normal text-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground mb-3">{feature.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span className="text-sm text-success font-normal">{feature.benefit}</span>
                      </div>
                      <Badge variant="outline">{feature.timesSaved} saved</Badge>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Traditional vs Automated Comparison */}
        <Card className="card-modern hover-lift mb-12">
          <CardHeader>
            <CardTitle className="text-2xl font-normal text-foreground flex items-center">
              <TrendingUp className="h-6 w-6 text-primary mr-2" />
              Traditional VAT Processing vs Automation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              See how <strong>VAT automation software</strong> transforms time-consuming manual processes into instant, accurate operations.
            </p>
            <div className="space-y-4">
              {traditionalVsAutomated.map((comparison, index) => (
                <div key={index} className="grid lg:grid-cols-4 gap-4 items-center p-4 border border-gray-200 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="lg:col-span-1">
                    <h4 className="font-normal text-foreground">{comparison.task}</h4>
                  </div>
                  <div className="lg:col-span-1">
                    <p className="text-sm text-muted-foreground">{comparison.traditional}</p>
                  </div>
                  <div className="lg:col-span-1">
                    <p className="text-sm text-primary font-normal">{comparison.automated}</p>
                  </div>
                  <div className="lg:col-span-1">
                    <Badge className="bg-success text-white">{comparison.improvement}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Integration Capabilities */}
        <Card className="card-modern hover-lift mb-12">
          <CardHeader>
            <CardTitle className="text-2xl font-normal text-foreground flex items-center">
              <Cloud className="h-6 w-6 text-primary mr-2" />
              Seamless Integration with Irish Business Systems
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Connect your existing business tools with PayVAT's automated VAT processing for a complete solution.
            </p>
            <div className="grid lg:grid-cols-2 gap-8">
              {integrations.map((integration, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 hover:bg-muted/30 transition-colors">
                  <h4 className="font-normal text-foreground mb-3">{integration.category}</h4>
                  <p className="text-sm text-muted-foreground mb-4">{integration.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {integration.systems.map((system, systemIndex) => (
                      <Badge key={systemIndex} variant="outline">{system}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Customer Success Stories */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-normal text-foreground mb-4">
              Real Results from <span className="text-gradient-primary">Irish Businesses</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              See how VAT automation software transforms VAT processing for businesses across Ireland.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {customerResults.map((customer, index) => (
              <Card key={index} className="card-modern hover-lift">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-normal">{customer.company}</CardTitle>
                      <p className="text-sm text-muted-foreground">{customer.sector} • {customer.employees}</p>
                    </div>
                    <div className="flex">
                      {[...Array(5)].map((_, starIndex) => (
                        <Star key={starIndex} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-primary/5 rounded-lg">
                      <div className="text-2xl font-normal text-primary">{customer.results.timeSaved}</div>
                      <div className="text-xs text-muted-foreground">Time Saved</div>
                    </div>
                    <div className="text-center p-3 bg-success/5 rounded-lg">
                      <div className="text-2xl font-normal text-success">{customer.results.costSaving}</div>
                      <div className="text-xs text-muted-foreground">Annual Savings</div>
                    </div>
                  </div>
                  <blockquote className="text-sm text-muted-foreground italic border-l-4 border-primary pl-4">
                    "{customer.testimonial}"
                  </blockquote>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <Card className="card-premium hover-lift mb-12">
          <CardHeader>
            <CardTitle className="text-3xl font-normal text-foreground text-center mb-4">
              Choose Your <span className="text-gradient-primary">VAT Automation Plan</span>
            </CardTitle>
            <p className="text-xl text-muted-foreground text-center max-w-2xl mx-auto">
              Flexible pricing for Irish businesses of all sizes. Start with a 30-day free trial, no commitment required.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid lg:grid-cols-3 gap-8">
              {pricingTiers.map((tier, index) => (
                <Card key={index} className={`relative ${tier.popular ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                  {tier.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-white">
                      MOST POPULAR
                    </Badge>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-xl font-normal">{tier.name}</CardTitle>
                    <div className="flex items-baseline justify-center">
                      <span className="text-3xl font-normal text-primary">{tier.price}</span>
                      <span className="text-muted-foreground ml-1">{tier.period}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{tier.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {tier.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button className={`w-full ${tier.popular ? 'btn-primary' : 'variant-outline'}`} size="lg">
                      Start Free Trial
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card className="card-modern hover-lift mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-normal text-foreground flex items-center">
              <HelpCircle className="h-6 w-6 text-primary mr-2" />
              VAT Automation Software Ireland: Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {faqItems.map((faq, index) => (
                <details key={index} className="group p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <summary className="cursor-pointer font-normal text-foreground list-none flex items-center justify-between">
                    <span>{faq.question}</span>
                    <ChevronRight className="h-5 w-5 text-gray-500 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="mt-3 text-muted-foreground">
                    <p>{faq.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Final CTA */}
        <Card className="card-premium hover-lift">
          <CardContent className="p-8 text-center">
            <h3 className="text-3xl font-normal text-foreground mb-4">
              Ready to Automate Your <span className="text-gradient-primary">VAT Processing?</span>
            </h3>
            <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join hundreds of Irish businesses saving 20-40 hours monthly with PayVAT's AI-powered VAT automation software.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="btn-primary px-8 py-3 text-lg">
                <Zap className="mr-2 h-5 w-5" />
                Start 30-Day Free Trial
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-3 text-lg">
                <Smartphone className="mr-2 h-5 w-5" />
                Schedule Live Demo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  )
}