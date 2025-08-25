import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'VAT Compliance Checklist Ireland 2025: Complete Guide | PayVAT',
  description: 'Essential VAT compliance checklist for Irish businesses. Ensure Revenue compliance with monthly tasks, VAT rules, exemptions, and invoicing requirements. Free PDF download.',
}

"use client"

import { useState, useEffect } from "react"
import { CheckCircle, FileText, Download, AlertTriangle, Calendar, Shield, Calculator, Clock, Users, TrendingUp, HelpCircle, ChevronRight, Bookmark, Star } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import SiteHeader from "@/components/site-header"
import Footer from "@/components/footer"
import ArticleSchema from "@/components/article-schema"

export default function VATComplianceChecklistPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }))
  }

  const monthlyTasks = [
    {
      id: "monthly-1",
      task: "Review all sales invoices issued",
      description: "Ensure all VAT-liable sales are properly recorded with correct VAT rates",
      importance: "Critical",
      timeRequired: "30 minutes"
    },
    {
      id: "monthly-2", 
      task: "Collect and organize purchase receipts",
      description: "Gather all business expense receipts for input VAT claims",
      importance: "High",
      timeRequired: "45 minutes"
    },
    {
      id: "monthly-3",
      task: "Verify VAT registration numbers",
      description: "Check EU suppliers' VAT numbers are valid for reverse charge rules",
      importance: "High", 
      timeRequired: "15 minutes"
    },
    {
      id: "monthly-4",
      task: "Update VAT-exempt transactions record",
      description: "Document any exempt supplies or acquisitions",
      importance: "Medium",
      timeRequired: "20 minutes"
    }
  ]

  const quarterlyTasks = [
    {
      id: "quarterly-1",
      task: "Complete bimonthly VAT3 return",
      description: "Submit VAT return to Revenue by 19th of second month",
      importance: "Critical",
      timeRequired: "2-3 hours"
    },
    {
      id: "quarterly-2",
      task: "Reconcile VAT accounts",
      description: "Match VAT returns with accounting records for accuracy",
      importance: "High", 
      timeRequired: "1 hour"
    },
    {
      id: "quarterly-3",
      task: "Review VAT threshold compliance",
      description: "Check if turnover still meets VAT registration requirements",
      importance: "Medium",
      timeRequired: "30 minutes"
    },
    {
      id: "quarterly-4",
      task: "Archive VAT documentation",
      description: "Organize and store VAT records for 6-year retention period",
      importance: "Medium",
      timeRequired: "45 minutes"
    }
  ]

  const annualTasks = [
    {
      id: "annual-1",
      task: "Complete VAT annual review",
      description: "Comprehensive review of VAT procedures and compliance",
      importance: "Critical",
      timeRequired: "4-5 hours"
    },
    {
      id: "annual-2",
      task: "Update VAT registration details",
      description: "Notify Revenue of any business changes affecting VAT status",
      importance: "High",
      timeRequired: "1 hour"
    },
    {
      id: "annual-3",
      task: "Review VAT exemption eligibility",
      description: "Assess if business still qualifies for any VAT exemptions",
      importance: "Medium",
      timeRequired: "2 hours"
    }
  ]

  const vatRates2025 = [
    { category: "Standard Rate", rate: "23%", applies: "Most goods and services" },
    { category: "Reduced Rate", rate: "13.5%", applies: "Fuel, electricity, newspapers, restaurants" },
    { category: "Second Reduced Rate", rate: "9%", applies: "Tourism services, hairdressing" },
    { category: "Zero Rate", rate: "0%", applies: "Exports, books, children's clothing" },
    { category: "Exempt", rate: "N/A", applies: "Financial services, education, healthcare" }
  ]

  const commonViolations = [
    {
      violation: "Incorrect VAT rate applied",
      penalty: "Interest charges + penalties up to 100% of tax",
      prevention: "Use updated VAT rate tables, verify product classifications"
    },
    {
      violation: "Late VAT return submission",
      penalty: "€4 per day (minimum €125), interest on unpaid VAT",
      prevention: "Set automated reminders, use VAT software with deadlines"
    },
    {
      violation: "Missing input VAT claims",
      penalty: "Lost tax recovery opportunities",
      prevention: "Maintain organized receipt system, monthly reconciliation"
    },
    {
      violation: "Inadequate VAT records",
      penalty: "Estimated assessments, loss of input VAT claims",
      prevention: "Digital record keeping, 6-year retention policy"
    }
  ]

  const exemptionCategories = [
    {
      category: "Financial Services",
      examples: ["Banking services", "Insurance", "Investment management", "Currency exchange"],
      note: "Some exceptions apply for specific financial products"
    },
    {
      category: "Healthcare",
      examples: ["Medical services", "Dental care", "Hospital services", "Pharmaceutical supplies"],
      note: "Private healthcare may have different VAT treatment"
    },
    {
      category: "Education",
      examples: ["School fees", "University tuition", "Vocational training", "Educational materials"],
      note: "Commercial training courses may be VAT-liable"
    },
    {
      category: "Property",
      examples: ["Residential rent", "Property sales", "Land transactions", "Letting services"],
      note: "Commercial property and new buildings have different rules"
    }
  ]

  const faqItems = [
    {
      question: "What are the key VAT compliance requirements for Irish businesses in 2025?",
      answer: "Irish businesses must register for VAT if turnover exceeds €37,500 (services) or €75,000 (goods). Key requirements include filing bimonthly VAT3 returns by the 19th of the second month, maintaining detailed VAT records for 6 years, applying correct VAT rates (23% standard, 13.5% reduced, 9% tourism), and ensuring proper invoicing with VAT registration numbers."
    },
    {
      question: "How often do I need to file VAT returns in Ireland?",
      answer: "Most Irish businesses file bimonthly VAT returns (every two months) with deadlines on the 19th of the second month after the period end. Large traders with annual turnover over €3 million must file monthly returns, while some small businesses may qualify for annual filing with special authorization from Revenue."
    },
    {
      question: "What VAT records must I keep for Revenue compliance?",
      answer: "You must maintain all sales invoices, purchase receipts, VAT returns filed, bank statements, cash books, and any correspondence with Revenue for at least 6 years. Records should show VAT charged on sales, VAT paid on purchases, and support all VAT return entries. Digital records are acceptable if properly backed up."
    },
    {
      question: "When can I claim input VAT on business expenses?",
      answer: "Input VAT can be claimed on business purchases used for VAT-liable supplies, including equipment, professional services, materials, and utilities. You cannot claim VAT on exempt supplies, entertainment expenses, or personal use items. Claims must be supported by proper VAT invoices showing the supplier's VAT number."
    },
    {
      question: "What are the penalties for VAT non-compliance in Ireland?",
      answer: "Late filing incurs €4 daily penalties (minimum €125) plus 0.0274% daily interest on unpaid VAT. Incorrect returns may result in penalties up to 100% of the underpaid tax. Failure to register when required can lead to penalties of €4,000 plus retrospective VAT assessments."
    },
    {
      question: "Do I need to charge VAT on digital services to EU customers?",
      answer: "For B2C digital services to EU customers, you must charge VAT at the customer's country rate and may need to register for EU VAT MOSS scheme. For B2B digital services, the reverse charge mechanism applies - no Irish VAT is charged if you have the customer's valid EU VAT number."
    }
  ]

  const completionRate = Object.keys(completedTasks).length > 0 
    ? Math.round((Object.values(completedTasks).filter(Boolean).length / Object.keys(completedTasks).length) * 100)
    : 0

  return (
    <div className="min-h-screen bg-background">
      <ArticleSchema
        title="VAT Compliance Checklist Ireland 2025: Complete Guide"
        description="Essential VAT compliance checklist for Irish businesses covering monthly tasks, VAT rules, exemptions, and invoicing requirements with Revenue Ireland."
        keywords={["VAT compliance Ireland", "VAT rules Ireland", "VAT checklist Ireland", "Revenue VAT compliance", "Irish VAT requirements 2025"]}
        url="https://payvat.ie/vat-compliance-checklist-ireland"
      />
      <SiteHeader />

      <div className="max-w-7xl mx-auto px-6 content-after-header pb-8">
        {/* Hero Section */}
        <section className="py-12 mb-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl lg:text-5xl font-normal text-foreground mb-4">
              VAT Compliance Checklist Ireland: <span className="text-gradient-primary">2025 Complete Guide</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Essential <strong>VAT compliance checklist Ireland</strong> covering Revenue requirements, VAT rules, exemptions, and monthly tasks. Ensure perfect compliance with Irish VAT regulations in 2025.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <div className="px-4 py-2 bg-primary/10 rounded-full">
                <span className="text-sm font-normal text-primary">Monthly & quarterly tasks</span>
              </div>
              <div className="px-4 py-2 bg-success/10 rounded-full">
                <span className="text-sm font-normal text-success">Revenue compliance assured</span>
              </div>
              <div className="px-4 py-2 bg-warning/10 rounded-full">
                <span className="text-sm font-normal text-warning">Avoid costly penalties</span>
              </div>
            </div>
          </div>

          {/* Progress Tracker */}
          {Object.keys(completedTasks).length > 0 && (
            <Card className="card-modern hover-lift mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-normal text-foreground">Your Compliance Progress</h3>
                  <Badge variant="outline" className="px-3 py-1">
                    {completionRate}% Complete
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary rounded-full h-2 transition-all duration-300"
                    style={{ width: `${completionRate}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Monthly Compliance Tasks */}
        <Card className="card-modern hover-lift mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-normal text-foreground flex items-center">
              <Calendar className="h-6 w-6 text-primary mr-2" />
              Monthly VAT Compliance Tasks Ireland
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Essential monthly tasks to maintain <strong>VAT compliance Ireland</strong> and stay current with Revenue requirements.
            </p>
            <div className="space-y-4">
              {monthlyTasks.map((task) => (
                <div key={task.id} className="border border-gray-200 rounded-lg p-6 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={completedTasks[task.id] || false}
                      onCheckedChange={() => toggleTask(task.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`font-normal ${completedTasks[task.id] ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {task.task}
                        </h4>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            task.importance === 'Critical' ? 'destructive' :
                            task.importance === 'High' ? 'default' : 'secondary'
                          }>
                            {task.importance}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{task.timeRequired}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quarterly Compliance Tasks */}
        <Card className="card-modern hover-lift mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-normal text-foreground flex items-center">
              <Clock className="h-6 w-6 text-primary mr-2" />
              Quarterly VAT Compliance Requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Bimonthly and quarterly tasks essential for Revenue VAT compliance and accurate record-keeping.
            </p>
            <div className="space-y-4">
              {quarterlyTasks.map((task) => (
                <div key={task.id} className="border border-gray-200 rounded-lg p-6 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={completedTasks[task.id] || false}
                      onCheckedChange={() => toggleTask(task.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`font-normal ${completedTasks[task.id] ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {task.task}
                        </h4>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            task.importance === 'Critical' ? 'destructive' :
                            task.importance === 'High' ? 'default' : 'secondary'
                          }>
                            {task.importance}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{task.timeRequired}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Annual Compliance Tasks */}
        <Card className="card-modern hover-lift mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-normal text-foreground flex items-center">
              <Star className="h-6 w-6 text-primary mr-2" />
              Annual VAT Compliance Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Comprehensive annual tasks to ensure ongoing VAT compliance and optimize your VAT position.
            </p>
            <div className="space-y-4">
              {annualTasks.map((task) => (
                <div key={task.id} className="border border-gray-200 rounded-lg p-6 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={completedTasks[task.id] || false}
                      onCheckedChange={() => toggleTask(task.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`font-normal ${completedTasks[task.id] ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {task.task}
                        </h4>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            task.importance === 'Critical' ? 'destructive' :
                            task.importance === 'High' ? 'default' : 'secondary'
                          }>
                            {task.importance}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{task.timeRequired}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* VAT Rates 2025 */}
        <Card className="card-modern hover-lift mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-normal text-foreground flex items-center">
              <Calculator className="h-6 w-6 text-primary mr-2" />
              Ireland VAT Rates 2025: Complete Reference
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Current <strong>VAT rules Ireland</strong> with all applicable rates for 2025. Essential for accurate VAT calculations and compliance.
            </p>
            <div className="grid lg:grid-cols-2 gap-4">
              {vatRates2025.map((rate, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-normal text-foreground">{rate.category}</h4>
                    <Badge className="bg-primary text-white">{rate.rate}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{rate.applies}</p>
                </div>
              ))}
            </div>
            <Alert className="mt-6 border-blue-200 bg-blue-50">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Rate Changes:</strong> VAT rates can change with Budget announcements. Always verify current rates on Revenue.ie before invoicing.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* VAT Exemptions Guide */}
        <Card className="card-premium hover-lift mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-normal text-foreground flex items-center">
              <Shield className="h-6 w-6 text-white mr-2" />
              VAT Exemptions Ireland: What Qualifies?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <p className="text-muted-foreground leading-relaxed">
                  Understanding <strong>VAT exemptions Ireland</strong> is crucial for compliance. Exempt supplies don't carry VAT but also don't allow input VAT recovery.
                </p>
                {exemptionCategories.map((category, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-normal text-foreground mb-3">{category.category}</h4>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {category.examples.map((example, exampleIndex) => (
                        <div key={exampleIndex} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-success flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{example}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-warning font-normal">{category.note}</p>
                  </div>
                ))}
              </div>
              <div className="card-modern p-6">
                <h4 className="font-normal text-foreground mb-4">PayVAT Exemption Management</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <FileText className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm text-muted-foreground">Automatic exemption classification</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <Calculator className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm text-muted-foreground">Input VAT recovery optimization</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <Shield className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm text-muted-foreground">Compliance monitoring alerts</span>
                  </div>
                </div>
                <Button className="w-full mt-4 btn-primary">
                  Automate VAT Compliance
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Common Violations & Penalties */}
        <Card className="card-modern hover-lift mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-normal text-foreground flex items-center">
              <AlertTriangle className="h-6 w-6 text-warning mr-2" />
              Common VAT Violations & Penalties Ireland
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Avoid these common VAT compliance failures that result in Revenue penalties and interest charges.
            </p>
            <div className="space-y-4">
              {commonViolations.map((violation, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start gap-4">
                    <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-normal text-foreground mb-2">{violation.violation}</h4>
                      <p className="text-sm text-destructive mb-2">
                        <strong>Penalty:</strong> {violation.penalty}
                      </p>
                      <p className="text-sm text-success">
                        <strong>Prevention:</strong> {violation.prevention}
                      </p>
                    </div>
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
              VAT Compliance Ireland: Frequently Asked Questions
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

        {/* Download CTA */}
        <Card className="card-premium hover-lift">
          <CardContent className="p-8 text-center">
            <h3 className="text-3xl font-normal text-foreground mb-4">
              Download Your <span className="text-gradient-primary">VAT Compliance Checklist</span>
            </h3>
            <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
              Get the complete VAT compliance checklist as a PDF. Perfect for monthly compliance reviews and ensuring you never miss critical Revenue requirements.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="btn-primary px-8 py-3 text-lg">
                <Download className="mr-2 h-5 w-5" />
                Download Free Checklist
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-3 text-lg">
                <Calculator className="mr-2 h-5 w-5" />
                Try Automated Compliance
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  )
}