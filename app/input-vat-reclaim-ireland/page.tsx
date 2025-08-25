import { Metadata } from 'next'
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Euro, Calculator, CheckCircle, ArrowRight, Receipt, Clock, AlertTriangle, HelpCircle, ChevronRight, FileText, Shield, TrendingUp } from 'lucide-react'
import SiteHeader from "@/components/site-header"
import Footer from "@/components/footer"
import ArticleSchema from "@/components/article-schema"

export const metadata: Metadata = {
  title: 'Input VAT Reclaim Ireland: Complete Guide to VAT Refunds 2025 | PayVAT',
  description: 'Comprehensive guide to input VAT reclaim Ireland. Learn eligible expenses, claim processes, VAT refund procedures, and maximize your tax recovery with automated software.',
}

"use client"

export default function InputVATReclaimPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [selectedCalculator, setSelectedCalculator] = useState<string | null>(null)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const reclaimableItems = [
    {
      category: "Business Equipment",
      description: "Computers, machinery, vehicles, office furniture",
      vatRate: "23%",
      examples: ["Laptops and computers", "Manufacturing equipment", "Company vehicles", "Office desks and chairs"],
      icon: Calculator
    },
    {
      category: "Professional Services", 
      description: "Legal, accounting, consultancy, and professional fees",
      vatRate: "23%",
      examples: ["Accounting fees", "Legal consultancy", "Marketing services", "IT support"],
      icon: FileText
    },
    {
      category: "Business Expenses",
      description: "Travel, training, marketing, and operational costs",
      vatRate: "23%",
      examples: ["Business travel", "Staff training", "Advertising costs", "Rent and utilities"],
      icon: Receipt
    },
    {
      category: "Construction Materials",
      description: "Building materials and construction services",
      vatRate: "13.5%",
      examples: ["Building materials", "Construction services", "Property improvements", "Equipment hire"],
      icon: Shield
    }
  ]

  const nonReclaimableItems = [
    {
      item: "Entertainment Expenses",
      reason: "Business entertainment is not eligible for input VAT recovery",
      examples: ["Client dinners", "Corporate events", "Staff parties"]
    },
    {
      item: "Private Use Items",
      reason: "Items with personal use element cannot claim full VAT",
      examples: ["Mixed-use vehicles", "Home office equipment", "Mobile phones"]
    },
    {
      item: "Certain Financial Services",
      reason: "Exempt supplies don't qualify for input VAT claims",
      examples: ["Bank charges", "Insurance premiums", "Loan interest"]
    }
  ]

  const claimProcess = [
    {
      step: 1,
      title: "Collect VAT Receipts",
      description: "Gather all invoices and receipts showing VAT charges",
      duration: "Ongoing",
      icon: Receipt
    },
    {
      step: 2,
      title: "Verify Eligibility",
      description: "Ensure expenses are for business use and VAT-eligible",
      duration: "Monthly review",
      icon: CheckCircle
    },
    {
      step: 3,
      title: "Calculate VAT Amount",
      description: "Extract VAT amounts from invoices and receipts",
      duration: "End of VAT period",
      icon: Calculator
    },
    {
      step: 4,
      title: "Submit VAT Return",
      description: "Include input VAT claims in your VAT3 return",
      duration: "By 19th deadline",
      icon: FileText
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <ArticleSchema
        title="Input VAT Reclaim Ireland: Complete Guide to Maximizing VAT Refunds"
        description="Comprehensive guide to input VAT reclaim in Ireland covering eligible expenses, claim processes, and automated VAT recovery systems."
        keywords={["input VAT reclaim", "VAT refund Ireland", "VAT recovery Ireland", "reclaim VAT Ireland", "business VAT claims"]}
        url="https://payvat.ie/input-vat-reclaim-ireland"
      />
      <SiteHeader />

      <div className="max-w-7xl mx-auto px-6 content-after-header pb-8">
        {/* Hero Section */}
        <section className="py-12 mb-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl lg:text-5xl font-normal text-foreground mb-4">
              Input VAT Reclaim Ireland: <span className="text-gradient-primary">Maximize Your Tax Recovery</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Complete guide to <strong>input VAT reclaim Ireland</strong> including eligible expenses, claim processes, VAT refund procedures, and automated recovery systems to maximize your business tax savings.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <div className="px-4 py-2 bg-success/10 rounded-full">
                <span className="text-sm font-normal text-success">Reclaim up to 23% VAT</span>
              </div>
              <div className="px-4 py-2 bg-primary/10 rounded-full">
                <span className="text-sm font-normal text-primary">Automated processing</span>
              </div>
              <div className="px-4 py-2 bg-warning/10 rounded-full">
                <span className="text-sm font-normal text-warning">Claim within 4 years</span>
              </div>
            </div>
          </div>
        </section>

        {/* What is Input VAT */}
        <Card className="card-modern hover-lift mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-normal text-foreground flex items-center">
              <Euro className="h-6 w-6 text-primary mr-2" />
              What is Input VAT Reclaim Ireland?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  <strong>Input VAT reclaim</strong> allows VAT-registered businesses in Ireland to recover VAT paid on business purchases and expenses. This reduces your net VAT liability to Revenue and can result in VAT refunds if input VAT exceeds output VAT.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-normal text-foreground">Reduce VAT Liability</span>
                      <p className="text-sm text-muted-foreground">Lower your overall VAT payment to Revenue</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-normal text-foreground">Get VAT Refunds</span>
                      <p className="text-sm text-muted-foreground">Receive money back when input exceeds output VAT</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-normal text-foreground">Improve Cash Flow</span>
                      <p className="text-sm text-muted-foreground">Better working capital through VAT recovery</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-premium p-6">
                <h4 className="font-normal text-white mb-4">VAT Recovery Example</h4>
                <div className="space-y-3 text-white">
                  <div className="flex justify-between">
                    <span>Output VAT (Sales)</span>
                    <span>€2,300</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Input VAT (Purchases)</span>
                    <span>€1,500</span>
                  </div>
                  <hr className="border-white/20" />
                  <div className="flex justify-between font-normal">
                    <span>Net VAT Due</span>
                    <span>€800</span>
                  </div>
                  <p className="text-sm text-white/80 mt-3">
                    Without input VAT reclaim, you'd pay €2,300. With proper claims, you only pay €800.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reclaimable Items */}
        <Card className="card-modern hover-lift mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-normal text-foreground flex items-center">
              <CheckCircle className="h-6 w-6 text-success mr-2" />
              What VAT Can You Reclaim Ireland?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              You can <strong>reclaim VAT Ireland</strong> on most business purchases and expenses. Here are the main categories:
            </p>
            <div className="grid lg:grid-cols-2 gap-6">
              {reclaimableItems.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="icon-modern bg-success">
                      <item.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-normal text-foreground">{item.category}</h3>
                      <Badge variant="secondary" className="text-xs">{item.vatRate} reclaimable</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                  <div className="space-y-1">
                    {item.examples.map((example, exIndex) => (
                      <div key={exIndex} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-success rounded-full"></div>
                        <span className="text-xs text-muted-foreground">{example}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Non-Reclaimable Items */}
        <Card className="card-modern hover-lift mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-normal text-foreground flex items-center">
              <AlertTriangle className="h-6 w-6 text-warning mr-2" />
              What VAT Cannot Be Reclaimed Ireland
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Certain expenses are not eligible for <strong>VAT recovery Ireland</strong>. Understanding these restrictions prevents incorrect claims:
            </p>
            <div className="space-y-4">
              {nonReclaimableItems.map((item, index) => (
                <div key={index} className="flex items-start gap-4 p-4 border border-warning/20 bg-warning/5 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-normal text-foreground mb-1">{item.item}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{item.reason}</p>
                    <div className="flex flex-wrap gap-2">
                      {item.examples.map((example, exIndex) => (
                        <Badge key={exIndex} variant="outline" className="text-xs">
                          {example}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Claim Process */}
        <Card className="card-modern hover-lift mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-normal text-foreground flex items-center">
              <FileText className="h-6 w-6 text-primary mr-2" />
              Input VAT Claim Process Ireland
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Follow this step-by-step process to <strong>claim VAT back Ireland</strong> and ensure maximum recovery:
            </p>
            <div className="grid lg:grid-cols-2 gap-6">
              {claimProcess.map((step, index) => (
                <div key={index} className="flex items-start gap-4 p-6 border border-gray-200 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-normal flex-shrink-0">
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-normal text-foreground mb-2">{step.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-xs text-primary font-normal">{step.duration}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-6 bg-primary/5 border border-primary/20 rounded-lg">
              <h4 className="font-normal text-foreground mb-3 flex items-center">
                <TrendingUp className="h-5 w-5 text-primary mr-2" />
                PayVAT Automated Input VAT Processing
              </h4>
              <p className="text-muted-foreground mb-4">
                PayVAT's AI automatically processes your receipts, identifies reclaimable VAT, and includes claims in your returns.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-normal text-primary mb-1">99%</div>
                  <div className="text-xs text-muted-foreground">Accuracy rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-normal text-primary mb-1">85%</div>
                  <div className="text-xs text-muted-foreground">Time saved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-normal text-primary mb-1">€3,200</div>
                  <div className="text-xs text-muted-foreground">Avg. annual recovery</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card className="card-modern hover-lift mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-normal text-foreground flex items-center">
              <HelpCircle className="h-6 w-6 text-primary mr-2" />
              Input VAT Reclaim Ireland: Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <details className="group p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <summary className="cursor-pointer font-normal text-foreground list-none flex items-center justify-between">
                  <span>How much VAT can I reclaim in Ireland?</span>
                  <ChevronRight className="h-5 w-5 text-gray-500 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="mt-3 text-muted-foreground space-y-2">
                  <p>You can reclaim up to 23% VAT on eligible business purchases in Ireland. The amount depends on your business expenses - typical businesses recover €2,000-€5,000 annually through input VAT claims.</p>
                  <p><strong>Maximum recovery:</strong> Standard rate 23%, reduced rate 13.5%, with no upper limit on total claims if properly documented.</p>
                </div>
              </details>

              <details className="group p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <summary className="cursor-pointer font-normal text-foreground list-none flex items-center justify-between">
                  <span>What documents do I need for VAT refund Ireland?</span>
                  <ChevronRight className="h-5 w-5 text-gray-500 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="mt-3 text-muted-foreground space-y-2">
                  <p>You need valid VAT invoices or receipts showing: supplier VAT number, your business details, date of supply, description of goods/services, VAT amount charged, and total amount paid.</p>
                  <p><strong>Essential requirements:</strong> Original invoices, business bank statements, proof of payment, and evidence the expense was for business purposes.</p>
                </div>
              </details>

              <details className="group p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <summary className="cursor-pointer font-normal text-foreground list-none flex items-center justify-between">
                  <span>How long does VAT refund take Ireland?</span>
                  <ChevronRight className="h-5 w-5 text-gray-500 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="mt-3 text-muted-foreground space-y-2">
                  <p>VAT refunds in Ireland typically take 10-15 business days after Revenue processes your return. Electronic submissions through ROS or automated software like PayVAT are processed faster than paper returns.</p>
                  <p><strong>Processing times:</strong> Electronic filing: 10-15 days, Paper filing: 4-6 weeks, Large refunds may require additional verification.</p>
                </div>
              </details>

              <details className="group p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <summary className="cursor-pointer font-normal text-foreground list-none flex items-center justify-between">
                  <span>Can I claim VAT back on company car Ireland?</span>
                  <ChevronRight className="h-5 w-5 text-gray-500 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="mt-3 text-muted-foreground space-y-2">
                  <p>VAT recovery on company cars is restricted in Ireland. You cannot reclaim VAT on car purchases, but can reclaim VAT on commercial vehicles, car repairs, fuel (if business use exceeds 60%), and leasing costs in certain circumstances.</p>
                  <p><strong>Exceptions:</strong> Taxis, driving school cars, car dealers, and vehicles over 3.5 tonnes are eligible for full VAT recovery.</p>
                </div>
              </details>

              <details className="group p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <summary className="cursor-pointer font-normal text-foreground list-none flex items-center justify-between">
                  <span>What is the time limit for VAT claims Ireland?</span>
                  <ChevronRight className="h-5 w-5 text-gray-500 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="mt-3 text-muted-foreground space-y-2">
                  <p>You can claim input VAT within 4 years of the end of the VAT period when the expense was incurred. However, it's best to claim VAT in the same period as the expense to maintain good cash flow.</p>
                  <p><strong>Best practice:</strong> Claim VAT in the same return period as the expense, keep records for 6 years, and review unclaimed items quarterly.</p>
                </div>
              </details>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="card-premium hover-lift">
          <CardContent className="p-8 text-center">
            <h3 className="text-3xl font-normal text-white mb-4">
              Maximize Your Input VAT Recovery
            </h3>
            <p className="text-xl text-white/90 mb-6 max-w-2xl mx-auto">
              Let PayVAT's AI automatically identify and claim all eligible input VAT. Recover thousands in VAT refunds with zero effort.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-50 px-8 py-3 text-lg">
                <Calculator className="mr-2 h-5 w-5" />
                Start VAT Recovery
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary px-8 py-3 text-lg">
                <FileText className="mr-2 h-5 w-5" />
                Calculate Potential Savings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  )
}