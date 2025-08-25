import { Metadata } from 'next'
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Calculator, Clock, CheckCircle, ArrowRight, Upload, Shield, AlertTriangle, Download, HelpCircle, ChevronRight, Calendar } from 'lucide-react'
import SiteHeader from "@/components/site-header"
import Footer from "@/components/footer"
import ArticleSchema from "@/components/article-schema"

export const metadata: Metadata = {
  title: 'VAT Filing Ireland: Automated Submission Software | PayVAT',
  description: 'Complete guide to VAT filing Ireland. Learn bimonthly VAT filing process, input VAT reclaim, and automated VAT submission software. Ensure Revenue compliance.',
}

export default function VATFilingPage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const filingFrequency = [
    {
      type: "Bi-monthly (Most businesses)",
      deadline: "19th of second month",
      example: "Jan-Feb VAT due March 19th",
      applies: "Most VAT-registered businesses",
      icon: Calendar
    },
    {
      type: "Monthly (Large traders)",
      deadline: "19th of following month", 
      example: "January VAT due February 19th",
      applies: "Annual turnover >€3 million",
      icon: Clock
    },
    {
      type: "Annual (Small businesses)",
      deadline: "January 19th",
      example: "Annual return due January 19th",
      applies: "Special authorization required",
      icon: FileText
    }
  ]

  const vatReturnSections = [
    {
      section: "Sales and Output VAT",
      description: "All taxable sales made during the VAT period",
      includes: ["Standard rate sales (23%)", "Reduced rate sales (13.5%)", "Zero rate sales (0%)", "Exempt sales"]
    },
    {
      section: "Purchases and Input VAT", 
      description: "All business purchases with reclaimable VAT",
      includes: ["Goods for resale", "Business expenses", "Equipment and assets", "Professional services"]
    },
    {
      section: "EU Transactions",
      description: "Intra-EU supplies and acquisitions",
      includes: ["EU sales (dispatches)", "EU purchases (acquisitions)", "Services to/from EU"]
    }
  ]

  const commonMistakes = [
    {
      mistake: "Incorrect VAT calculations",
      impact: "Penalties and interest charges",
      prevention: "Use automated VAT calculation software"
    },
    {
      mistake: "Missing input VAT claims",
      impact: "Lost tax reclaim opportunities",
      prevention: "Systematic record-keeping and document management"
    },
    {
      mistake: "Late submission",
      impact: "€4 daily penalty (min €125)",
      prevention: "Automated submission reminders and processing"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <ArticleSchema
        title="VAT Filing Ireland: Complete Guide to Automated Submission"
        description="Comprehensive guide to VAT filing Ireland covering bimonthly returns, input VAT reclaim, and automated submission software for Revenue compliance."
        keywords={["VAT filing Ireland", "VAT submission Ireland", "bimonthly VAT filing", "input VAT reclaim", "Revenue VAT submission"]}
        url="https://payvat.ie/vat-filing"
      />
      <SiteHeader />

      <div className="max-w-7xl mx-auto px-6 content-after-header pb-8">
        {/* Hero Section */}
        <section className="py-12 mb-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl lg:text-5xl font-normal text-foreground mb-4">
              VAT Filing Ireland: <span className="text-gradient-primary">Automated Submission Guide</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Complete guide to <strong>VAT filing Ireland</strong> including bimonthly VAT filing requirements, input VAT reclaim procedures, and automated VAT submission software for seamless Revenue compliance.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <div className="px-4 py-2 bg-primary/10 rounded-full">
                <span className="text-sm font-normal text-primary">Due 19th of second month</span>
              </div>
              <div className="px-4 py-2 bg-success/10 rounded-full">
                <span className="text-sm font-normal text-success">Automated submissions available</span>
              </div>
              <div className="px-4 py-2 bg-warning/10 rounded-full">
                <span className="text-sm font-normal text-warning">Avoid €4/day penalties</span>
              </div>
            </div>
          </div>
        </section>

        {/* Filing Frequency */}
        <Card className="card-modern hover-lift mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-normal text-foreground flex items-center">
              <Calendar className="h-6 w-6 text-primary mr-2" />
              VAT Filing Frequency Ireland
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Most Irish businesses file <strong>bimonthly VAT returns</strong>, but frequency depends on your annual turnover and business type.
            </p>
            <div className="grid lg:grid-cols-3 gap-6">
              {filingFrequency.map((freq, index) => (
                <div key={index} className="card-modern p-6 hover-lift">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="icon-modern bg-primary">
                      <freq.icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-normal text-foreground">{freq.type}</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">{freq.applies}</p>
                    <p className="font-normal text-primary">Deadline: {freq.deadline}</p>
                    <p className="text-success">{freq.example}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* VAT Return Components */}
        <Card className="card-modern hover-lift mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-normal text-foreground flex items-center">
              <FileText className="h-6 w-6 text-primary mr-2" />
              What to Include in Your VAT Returns Ireland
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Your <strong>VAT submission Ireland</strong> must include all taxable transactions during the filing period.
            </p>
            <div className="space-y-6">
              {vatReturnSections.map((section, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 hover:bg-muted/30 transition-colors">
                  <h3 className="text-lg font-normal text-foreground mb-2">{section.section}</h3>
                  <p className="text-muted-foreground mb-4">{section.description}</p>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {section.includes.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Input VAT Reclaim Section */}
        <Card className="card-premium hover-lift mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-normal text-foreground flex items-center">
              <Calculator className="h-6 w-6 text-white mr-2" />
              Input VAT Reclaim: Maximize Your Tax Recovery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  <strong>Input VAT reclaim</strong> allows you to recover VAT paid on business purchases and expenses. This is a crucial part of your VAT filing Ireland process.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-normal text-foreground">Business Equipment</span>
                      <p className="text-sm text-muted-foreground">Computers, machinery, office furniture</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-normal text-foreground">Professional Services</span>
                      <p className="text-sm text-muted-foreground">Legal, accounting, consultancy fees</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-normal text-foreground">Business Expenses</span>
                      <p className="text-sm text-muted-foreground">Travel, training, marketing costs</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-modern p-6">
                <h4 className="font-normal text-foreground mb-4">PayVAT Input VAT Processing</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <Upload className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm text-muted-foreground">Upload receipts and invoices</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <Calculator className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm text-muted-foreground">AI extracts VAT amounts</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm text-muted-foreground">Automatic filing with Revenue</span>
                  </div>
                </div>
                <Button className="w-full mt-4 btn-primary">
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Try Input VAT Automation
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Common Filing Mistakes */}
        <Card className="card-modern hover-lift mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-normal text-foreground flex items-center">
              <AlertTriangle className="h-6 w-6 text-warning mr-2" />
              Common VAT Filing Mistakes to Avoid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Avoid costly penalties and ensure accurate <strong>Revenue VAT submission</strong> by preventing these common errors.
            </p>
            <div className="space-y-4">
              {commonMistakes.map((mistake, index) => (
                <div key={index} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-muted/30 transition-colors">
                  <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-normal text-foreground mb-1">{mistake.mistake}</h4>
                    <p className="text-sm text-muted-foreground mb-2">Impact: {mistake.impact}</p>
                    <p className="text-sm text-success">Solution: {mistake.prevention}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card className="card-modern hover-lift mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-normal text-foreground flex items-center">
              <HelpCircle className="h-6 w-6 text-primary mr-2" />
              VAT Filing Ireland: Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <details className="group p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <summary className="cursor-pointer font-normal text-foreground list-none flex items-center justify-between">
                  <span>How to file VAT returns in Ireland online?</span>
                  <ChevronRight className="h-5 w-5 text-gray-500 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="mt-3 text-muted-foreground space-y-2">
                  <p>File VAT returns online through Revenue's ROS system or use automated VAT submission software like PayVAT. Log in to ROS, complete Form VAT3, verify calculations, and submit before the deadline.</p>
                  <p><strong>Benefits of online filing:</strong> Faster processing, immediate confirmation, reduced errors, and automatic deadline reminders.</p>
                </div>
              </details>

              <details className="group p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <summary className="cursor-pointer font-normal text-foreground list-none flex items-center justify-between">
                  <span>Steps to submit VAT to Revenue Ireland?</span>
                  <ChevronRight className="h-5 w-5 text-gray-500 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="mt-3 text-muted-foreground space-y-2">
                  <p>1. Gather all sales and purchase records for the VAT period<br/>2. Calculate output VAT on sales and input VAT on purchases<br/>3. Complete VAT3 form on ROS or via automated software<br/>4. Submit return by the 19th of the second month after period end<br/>5. Make payment if VAT is due</p>
                </div>
              </details>

              <details className="group p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <summary className="cursor-pointer font-normal text-foreground list-none flex items-center justify-between">
                  <span>Automated VAT submission software Ireland benefits?</span>
                  <ChevronRight className="h-5 w-5 text-gray-500 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="mt-3 text-muted-foreground space-y-2">
                  <p>Automated VAT software saves time, reduces errors, ensures compliance, and provides audit trails. PayVAT processes documents with AI, calculates VAT automatically, and submits directly to Revenue.</p>
                  <p><strong>Key benefits:</strong> 90% time savings, zero calculation errors, automatic deadline management, and complete audit documentation.</p>
                </div>
              </details>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="card-premium hover-lift">
          <CardContent className="p-8 text-center">
            <h3 className="text-3xl font-normal text-foreground mb-4">
              Simplify Your <span className="text-gradient-primary">VAT Filing Ireland</span>
            </h3>
            <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
              Let PayVAT handle your bimonthly VAT filing, input VAT reclaim, and Revenue submissions. Focus on your business while we ensure perfect compliance.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="btn-primary px-8 py-3 text-lg">
                <Calculator className="mr-2 h-5 w-5" />
                Start Free Trial
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-3 text-lg">
                <FileText className="mr-2 h-5 w-5" />
                Learn More
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  )
}
