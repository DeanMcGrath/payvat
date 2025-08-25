import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'VAT Threshold Changes 2025: What Irish Businesses Need to Know | PayVAT Blog',
  description: 'Complete guide to Ireland VAT registration thresholds for 2025. Learn how Revenue threshold changes affect your business and what you need to do to stay compliant.',
}

"use client"

import { useState, useEffect } from "react"
import { TrendingUp, AlertCircle, CheckCircle, Calculator, Calendar, Clock, ArrowLeft, ArrowRight, BookOpen, Shield, FileText, Banknote } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import SiteHeader from "@/components/site-header"
import Footer from "@/components/footer"
import ArticleSchema from "@/components/article-schema"
import Link from 'next/link'

export default function VATThresholdChanges2025Blog() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const thresholdChanges = [
    {
      category: "Goods Supply",
      oldThreshold: "€75,000",
      newThreshold: "€82,500", 
      changeAmount: "+€7,500",
      changeType: "increase",
      effectiveDate: "January 1, 2025",
      impact: "10% increase allows more businesses to operate below VAT threshold",
      whoAffected: "Retail, manufacturing, and product-based businesses"
    },
    {
      category: "Services Supply",
      oldThreshold: "€37,500", 
      newThreshold: "€41,250",
      changeAmount: "+€3,750",
      changeType: "increase",
      effectiveDate: "January 1, 2025",
      impact: "10% increase provides relief for service businesses",
      whoAffected: "Consultants, contractors, and service providers"
    },
    {
      category: "Intra-EU Acquisitions",
      oldThreshold: "€41,000",
      newThreshold: "€45,100",
      changeAmount: "+€4,100", 
      changeType: "increase",
      effectiveDate: "January 1, 2025",
      impact: "Reduced VAT registration requirements for EU purchases",
      whoAffected: "Businesses importing goods from EU member states"
    }
  ]

  const actionSteps = [
    {
      step: 1,
      title: "Review Your Current Turnover",
      description: "Calculate your annual turnover for both goods and services to determine your position relative to new thresholds.",
      timeline: "By February 15, 2025",
      urgency: "Critical"
    },
    {
      step: 2,
      title: "Assess Registration Status",
      description: "Determine if you can deregister from VAT or if you need to register due to threshold changes.",
      timeline: "By March 1, 2025", 
      urgency: "High"
    },
    {
      step: 3,
      title: "Update Business Systems",
      description: "Modify accounting, invoicing, and pricing systems to reflect your new VAT status if applicable.",
      timeline: "By March 31, 2025",
      urgency: "Medium"
    },
    {
      step: 4,
      title: "Notify Customers and Suppliers",
      description: "Inform business contacts of any changes to your VAT registration and pricing structure.",
      timeline: "By April 15, 2025",
      urgency: "Medium"
    }
  ]

  const complianceConsiderations = [
    {
      scenario: "Currently Below New Threshold",
      description: "If your turnover is below the new threshold, you can apply for VAT deregistration",
      benefits: ["Simplified accounting", "No VAT return filing", "Competitive pricing advantage"],
      drawbacks: ["Cannot recover input VAT", "May appear less established", "Potential pricing adjustments"],
      recommendation: "Consider deregistration if input VAT recovery is minimal"
    },
    {
      scenario: "Approaching New Threshold",
      description: "Businesses nearing the new threshold should prepare for potential registration",
      benefits: ["More time before mandatory registration", "Input VAT recovery opportunities", "Professional business image"],
      drawbacks: ["Additional compliance burden", "VAT return preparation time", "Potential customer price increases"],
      recommendation: "Plan for voluntary registration to avoid sudden compliance requirements"
    },
    {
      scenario: "Exceeding New Threshold",
      description: "Must maintain VAT registration and ensure full compliance with all requirements",
      benefits: ["Full input VAT recovery", "Established business credibility", "EU trading advantages"],
      drawbacks: ["Ongoing compliance obligations", "Regular return filing", "Administrative overhead"],
      recommendation: "Optimize VAT processes with automated systems to minimize administrative burden"
    }
  ]

  const calculatorExample = {
    businessType: "Consulting Services",
    annualTurnover: "€39,000",
    oldThresholdStatus: "Above threshold (€37,500) - Required registration",
    newThresholdStatus: "Below threshold (€41,250) - Optional registration", 
    potentialSavings: "€2,400 annual compliance costs if deregistering",
    considerations: [
      "Loss of €3,600 annual input VAT recovery",
      "Need to adjust pricing to remain competitive",
      "Simplified quarterly compliance requirements"
    ]
  }

  const relatedArticles = [
    {
      title: "VAT Registration Ireland: Complete 2025 Guide",
      slug: "/vat-registration",
      category: "Registration Guide"
    },
    {
      title: "VAT Deregistration Process: When and How to Cancel",
      slug: "/vat-deregistration-ireland",
      category: "Business Changes"
    },
    {
      title: "Small Business VAT Scheme Ireland 2025",
      slug: "/small-business-vat-scheme",
      category: "Tax Planning"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <ArticleSchema
        title="VAT Threshold Changes 2025: What Irish Businesses Need to Know"
        description="Comprehensive guide to Ireland VAT registration threshold changes for 2025, including compliance requirements and business impact analysis."
        keywords={["VAT threshold Ireland 2025", "VAT registration threshold changes", "Ireland VAT limit 2025", "Revenue VAT threshold update", "VAT compliance 2025"]}
        url="https://payvat.ie/blog/vat-threshold-changes-2025"
      />
      <SiteHeader />

      <div className="max-w-4xl mx-auto px-6 content-after-header pb-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link href="/blog" className="inline-flex items-center text-primary hover:text-primary/80">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
        </nav>

        {/* Article Header */}
        <article>
          <header className="mb-12">
            <div className="flex items-center gap-4 mb-4">
              <Badge className="bg-blue-500 text-white">VAT Updates</Badge>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Jan 15, 2025</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>6 min read</span>
                </div>
              </div>
            </div>
            <h1 className="text-4xl lg:text-5xl font-normal text-foreground mb-6">
              VAT Threshold Changes 2025: 
              <span className="text-gradient-primary"> What Irish Businesses Need to Know</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Revenue Ireland has updated VAT registration thresholds for 2025, providing relief for smaller businesses. Learn how these changes affect your business and what actions you need to take to stay compliant.
            </p>
          </header>

          {/* Breaking News Alert */}
          <Alert className="mb-12 border-blue-200 bg-blue-50">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Breaking:</strong> Revenue Ireland confirmed VAT threshold increases effective January 1, 2025. Businesses have until March 31, 2025, to adjust their registration status.
            </AlertDescription>
          </Alert>

          {/* Introduction */}
          <div className="prose prose-lg max-w-none mb-12">
            <p className="text-muted-foreground leading-relaxed">
              For the first time since 2019, Revenue Ireland has increased VAT registration thresholds across all categories. These changes, announced in the 2025 Finance Act, provide significant relief for small and medium businesses struggling with compliance costs during economic uncertainty.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The threshold increases range from 10% to 12% across different business categories, potentially affecting over 25,000 Irish businesses currently registered for VAT. This comprehensive guide explains the changes, their implications, and the specific actions your business needs to take.
            </p>
          </div>

          {/* Threshold Changes Table */}
          <Card className="card-modern hover-lift mb-12">
            <CardHeader>
              <CardTitle className="text-2xl font-normal text-foreground">
                2025 VAT Threshold Changes Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {thresholdChanges.map((change, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6 hover:bg-muted/30 transition-colors">
                    <div className="grid lg:grid-cols-4 gap-4 items-center">
                      <div>
                        <h4 className="font-normal text-foreground mb-2">{change.category}</h4>
                        <Badge variant="outline" className="text-xs">{change.whoAffected}</Badge>
                      </div>
                      <div className="text-center">
                        <div className="text-lg text-muted-foreground line-through mb-1">
                          {change.oldThreshold}
                        </div>
                        <div className="text-2xl font-bold text-success">
                          {change.newThreshold}
                        </div>
                        <Badge className="bg-success text-white text-xs">
                          {change.changeAmount}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          <strong>Effective:</strong> {change.effectiveDate}
                        </p>
                        <p className="text-sm text-foreground">{change.impact}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Impact Analysis */}
          <section className="mb-12">
            <h2 className="text-3xl font-normal text-foreground mb-8">Business Impact Analysis</h2>
            
            <div className="grid lg:grid-cols-3 gap-8">
              {complianceConsiderations.map((consideration, index) => (
                <Card key={index} className="card-modern hover-lift">
                  <CardHeader>
                    <CardTitle className="text-lg font-normal text-foreground">
                      {consideration.scenario}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {consideration.description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h5 className="text-sm font-normal text-success mb-2 flex items-center gap-2">
                          <CheckCircle className="h-3 w-3" />
                          Benefits
                        </h5>
                        <ul className="space-y-1">
                          {consideration.benefits.map((benefit, benefitIndex) => (
                            <li key={benefitIndex} className="text-xs text-muted-foreground">
                              • {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-sm font-normal text-warning mb-2 flex items-center gap-2">
                          <AlertCircle className="h-3 w-3" />
                          Drawbacks
                        </h5>
                        <ul className="space-y-1">
                          {consideration.drawbacks.map((drawback, drawbackIndex) => (
                            <li key={drawbackIndex} className="text-xs text-muted-foreground">
                              • {drawback}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-3 bg-primary/5 rounded-lg">
                        <p className="text-xs text-primary">
                          <strong>Recommendation:</strong> {consideration.recommendation}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Action Timeline */}
          <Card className="card-premium hover-lift mb-12">
            <CardHeader>
              <CardTitle className="text-2xl font-normal text-foreground flex items-center gap-3">
                <Calendar className="h-6 w-6 text-white" />
                Your Action Timeline for 2025 Threshold Changes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {actionSteps.map((action, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-muted/30 transition-colors">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      action.urgency === 'Critical' ? 'bg-destructive text-destructive-foreground' :
                      action.urgency === 'High' ? 'bg-warning text-warning-foreground' : 'bg-primary text-primary-foreground'
                    }`}>
                      <span className="font-bold">{action.step}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-normal text-foreground">{action.title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            action.urgency === 'Critical' ? 'destructive' :
                            action.urgency === 'High' ? 'default' : 'secondary'
                          } className="text-xs">
                            {action.urgency}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{action.timeline}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Real Example Calculator */}
          <Card className="card-modern hover-lift mb-12">
            <CardHeader>
              <CardTitle className="text-2xl font-normal text-foreground flex items-center gap-2">
                <Calculator className="h-6 w-6 text-primary" />
                Real Business Example: Impact Calculator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-normal text-foreground mb-4">Sample Business Profile</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Business Type:</span>
                      <span className="font-normal text-foreground">{calculatorExample.businessType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Annual Turnover:</span>
                      <span className="font-normal text-foreground">{calculatorExample.annualTurnover}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Old Status:</span>
                      <span className="text-destructive text-sm">{calculatorExample.oldThresholdStatus}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">New Status:</span>
                      <span className="text-success text-sm">{calculatorExample.newThresholdStatus}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-normal text-foreground mb-4">Financial Impact Analysis</h4>
                  <div className="p-4 bg-success/10 rounded-lg mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Banknote className="h-4 w-4 text-success" />
                      <span className="font-normal text-success">Potential Annual Savings</span>
                    </div>
                    <div className="text-2xl font-bold text-success">
                      {calculatorExample.potentialSavings}
                    </div>
                  </div>
                  <div>
                    <h5 className="text-sm font-normal text-foreground mb-2">Key Considerations:</h5>
                    <ul className="space-y-1">
                      {calculatorExample.considerations.map((consideration, index) => (
                        <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                          <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          {consideration}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conclusion & CTA */}
          <div className="prose prose-lg max-w-none mb-12">
            <h2 className="text-2xl font-normal text-foreground mb-4">Don't Miss the Opportunity</h2>
            <p className="text-muted-foreground leading-relaxed">
              The 2025 VAT threshold changes represent the most significant relief for Irish businesses in over five years. However, the benefits are only available to businesses that take proactive action to assess their position and adjust their registration status accordingly.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Whether you're considering deregistration to simplify operations or planning for future threshold management, automated VAT systems help you navigate these changes while maintaining full compliance with Revenue requirements.
            </p>
          </div>

          {/* CTA Section */}
          <Card className="card-premium hover-lift mb-12">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-normal text-foreground mb-4">
                Navigate 2025 Changes with <span className="text-gradient-primary">PayVAT Confidence</span>
              </h3>
              <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
                Our automated system handles threshold monitoring, compliance adjustments, and Revenue communications for seamless transitions.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button size="lg" className="btn-primary px-8 py-3">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Calculate Your Impact
                </Button>
                <Button size="lg" variant="outline" className="px-8 py-3">
                  <Shield className="mr-2 h-5 w-5" />
                  Get Expert Guidance
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Related Articles */}
          <Card className="card-modern">
            <CardHeader>
              <CardTitle className="text-xl font-normal text-foreground flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Related Articles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {relatedArticles.map((article, index) => (
                  <Link key={index} href={article.slug}>
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-muted/30 transition-colors group">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-primary" />
                        <div>
                          <h4 className="font-normal text-foreground group-hover:text-primary transition-colors">
                            {article.title}
                          </h4>
                          <Badge variant="outline" className="text-xs mt-1">
                            {article.category}
                          </Badge>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </article>
      </div>

      <Footer />
    </div>
  )
}