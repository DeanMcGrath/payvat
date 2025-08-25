import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'VAT Payment Ireland 2025: Deadlines, Methods & Penalties | PayVAT',
  description: 'Complete guide to VAT payment Ireland including payment deadlines, online payment methods, late penalties, and automated payment solutions for Irish businesses.',
}

"use client"

import { useState, useEffect } from "react"
import { ArrowRight, Calculator, CheckCircle, CreditCard, FileText, Clock, Shield, AlertCircle, Calendar, AlertTriangle, HelpCircle, ChevronRight, Banknote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import SiteHeader from "@/components/site-header"
import Footer from "@/components/footer"
import ArticleSchema from "@/components/article-schema"

export default function VATPaymentIrelandPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [currentSection, setCurrentSection] = useState("")

  useEffect(() => {
    setIsVisible(true)

    const handleScroll = () => {
      const sections = document.querySelectorAll("section[id]")
      const scrollPosition = window.scrollY + window.innerHeight / 3

      sections.forEach((section) => {
        if (section instanceof HTMLElement && 
            section.offsetTop <= scrollPosition && 
            section.offsetTop + section.offsetHeight > scrollPosition) {
          setCurrentSection(section.id)
        }
      })
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll()

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const paymentMethods = [
    {
      icon: CreditCard,
      title: "ROS Online Payment",
      description: "Pay directly through Revenue Online Service using your bank account",
      timeframe: "Immediate processing",
      fees: "No processing fees"
    },
    {
      icon: FileText,
      title: "Direct Debit",
      description: "Set up automatic VAT payments from your business bank account",
      timeframe: "Processed on due date",
      fees: "No additional charges"
    },
    {
      icon: Calculator,
      title: "Bank Transfer",
      description: "Transfer VAT payment directly to Revenue's designated accounts",
      timeframe: "1-2 business days",
      fees: "Standard bank charges apply"
    }
  ]

  const paymentSchedule = [
    {
      period: "Bi-monthly Returns",
      dueDate: "19th of following month",
      description: "For businesses with annual turnover over €3 million",
      example: "January-February VAT due by March 19th"
    },
    {
      period: "Monthly Returns", 
      dueDate: "19th of following month",
      description: "Required for certain business types and large traders",
      example: "January VAT due by February 19th"
    },
    {
      period: "Annual Returns",
      dueDate: "January 19th",
      description: "For smaller businesses under VAT thresholds",
      example: "Full year VAT due by January 19th"
    }
  ]

  const keyDeadlines = [
    { date: "March 19, 2025", period: "January-February 2025", type: "Bi-monthly" },
    { date: "May 19, 2025", period: "March-April 2025", type: "Bi-monthly" },
    { date: "July 19, 2025", period: "May-June 2025", type: "Bi-monthly" },
    { date: "September 19, 2025", period: "July-August 2025", type: "Bi-monthly" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <ArticleSchema
        title="VAT Payment Ireland 2025: Complete Guide to Deadlines and Methods"
        description="Comprehensive guide to VAT payment Ireland covering payment deadlines, online methods, late penalties, and automated payment solutions for Irish businesses."
        keywords={["VAT payment Ireland", "VAT deadlines Ireland", "pay VAT online Ireland", "VAT penalty Ireland", "Revenue VAT payment"]}
        url="https://payvat.ie/vat-payment-ireland"
      />
      <SiteHeader />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="max-w-4xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                VAT Payment Ireland 2025: Complete Guide to Deadlines & Methods
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8">
                Everything you need to know about VAT payment Ireland - payment deadlines, online methods, penalties, and automated solutions for seamless Revenue compliance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                  <Calculator className="mr-2 h-5 w-5" />
                  Calculate Your VAT
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  <FileText className="mr-2 h-5 w-5" />
                  Download VAT Guide
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Payment Deadlines Alert */}
        <section className="py-8 bg-amber-50 border-b border-amber-200">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <Alert className="border-amber-300 bg-amber-100">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 font-medium">
                <strong>Next VAT Payment Deadline:</strong> {keyDeadlines[0].date} - {keyDeadlines[0].period} VAT returns and payment due
              </AlertDescription>
            </Alert>
          </div>
        </section>

        {/* Payment Methods Section */}
        <section id="payment-methods" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                How to Pay VAT to Irish Revenue
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Choose from multiple secure payment methods accepted by Revenue Ireland for VAT submissions.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {paymentMethods.map((method, index) => (
                <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <method.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-gray-900">
                      {method.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{method.description}</p>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-gray-700">{method.timeframe}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <CreditCard className="h-4 w-4 text-blue-500 mr-2" />
                        <span className="text-gray-700">{method.fees}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Payment Schedule Section */}
        <section id="payment-schedule" className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                VAT Payment Schedules & Deadlines
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Understand when your VAT payments are due based on your business type and turnover.
              </p>
            </div>

            <div className="space-y-6">
              {paymentSchedule.map((schedule, index) => (
                <Card key={index} className="p-6">
                  <div className="grid md:grid-cols-4 gap-4 items-center">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{schedule.period}</h3>
                      <p className="text-sm text-gray-500 mt-1">{schedule.description}</p>
                    </div>
                    <div className="text-center">
                      <div className="bg-red-100 text-red-800 px-3 py-2 rounded-lg font-semibold">
                        Due: {schedule.dueDate}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-gray-600 italic">{schedule.example}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Upcoming Deadlines */}
        <section id="upcoming-deadlines" className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                2025 VAT Payment Calendar
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Mark these key dates in your calendar to avoid late payment penalties.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {keyDeadlines.map((deadline, index) => (
                <Card key={index} className="text-center p-6 border-2 hover:border-blue-300 transition-colors duration-300">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {deadline.date.split(',')[0]}
                  </div>
                  <div className="text-sm text-gray-500 mb-2">
                    {deadline.date.split(',')[1]}
                  </div>
                  <div className="text-sm font-medium text-gray-900 mb-1">
                    {deadline.period}
                  </div>
                  <div className="text-xs text-gray-500">
                    {deadline.type} Return
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* PayVAT Automation Section */}
        <section id="automation" className="py-16 bg-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Automate Your VAT Payments with PayVAT
              </h2>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                Never miss a VAT deadline again. PayVAT automatically calculates and prepares your VAT returns for seamless Revenue submission.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Shield,
                  title: "Automatic Calculations",
                  description: "AI-powered document processing ensures accurate VAT calculations every time"
                },
                {
                  icon: Clock,
                  title: "Deadline Reminders",
                  description: "Get notified before VAT payment deadlines with automated email alerts"
                },
                {
                  icon: FileText,
                  title: "Direct Revenue Integration",
                  description: "Submit VAT returns directly to Irish Revenue through secure ROS integration"
                }
              ].map((feature, index) => (
                <Card key={index} className="bg-white/10 border-white/20 text-white">
                  <CardContent className="p-6 text-center">
                    <feature.icon className="h-12 w-12 mx-auto mb-4 text-blue-200" />
                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-blue-100">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                <ArrowRight className="mr-2 h-5 w-5" />
                Start Free Trial
              </Button>
            </div>
          </div>
        </section>

        {/* Late Payment Penalties Section */}
        <section id="penalties" className="py-16 bg-red-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                VAT Late Payment Penalties Ireland
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Avoid costly penalties by understanding the true cost of late VAT payments to Revenue Ireland.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-red-200 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-900">Daily Penalties</h3>
                  </div>
                  <div className="text-2xl font-bold text-red-600 mb-2">€4 per day</div>
                  <p className="text-gray-600">Minimum €125 penalty for late VAT payments, charged daily until full payment received.</p>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Banknote className="h-8 w-8 text-red-500 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-900">Interest Charges</h3>
                  </div>
                  <div className="text-2xl font-bold text-red-600 mb-2">0.0274% daily</div>
                  <p className="text-gray-600">Interest charged daily on outstanding VAT amount until payment is made in full.</p>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Calculator className="h-8 w-8 text-red-500 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-900">Example Cost</h3>
                  </div>
                  <div className="text-2xl font-bold text-red-600 mb-2">€161 extra</div>
                  <p className="text-gray-600">€5,000 VAT paid 30 days late costs €161 in penalties and interest charges.</p>
                </CardContent>
              </Card>
            </div>

            <Alert className="mt-8 border-red-300 bg-red-100">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Important:</strong> Contact Revenue immediately if you cannot meet a payment deadline to discuss alternative arrangements and minimize penalties.
              </AlertDescription>
            </Alert>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                VAT Payment Ireland: Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600">
                Common questions about VAT payment methods, deadlines, and compliance requirements.
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  question: "When is VAT payment due in Ireland 2025?",
                  answer: "VAT payment Ireland is due on the same date as your VAT return filing. Most businesses file bimonthly with payment due by the 19th of the second month after the period end. For example, January-February VAT is due by March 19th."
                },
                {
                  question: "What are the accepted methods to pay VAT to Revenue Ireland?",
                  answer: "You can pay VAT through ROS online payment system, online banking with your VAT registration number as reference, direct debit arrangement with Revenue, or debit card payments through ROS. Electronic payments are processed faster."
                },
                {
                  question: "What happens if I pay VAT late in Ireland?",
                  answer: "Late VAT payments incur daily penalties of €4 per day (minimum €125) plus daily interest of 0.0274% on the outstanding amount. These charges continue until full payment is made."
                },
                {
                  question: "How can I set up automatic VAT payments?",
                  answer: "Set up automatic VAT payments through Revenue's direct debit scheme by completing Form DD1, use your bank's standing order facility, or use automated VAT software like PayVAT for integrated filing and payment."
                },
                {
                  question: "Can I pay VAT in installments if I can't afford the full amount?",
                  answer: "Revenue may allow VAT payment arrangements in cases of genuine financial difficulty. Contact Revenue's Business Division before the due date to discuss installment options. Interest charges still apply."
                },
                {
                  question: "What information do I need when paying VAT to Revenue?",
                  answer: "Include your VAT registration number as payment reference, specify the VAT period being paid (e.g., 01/25-02/25), and ensure the payment amount matches your filed VAT3 return exactly."
                }
              ].map((faq, index) => (
                <details key={index} className="group p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <summary className="cursor-pointer font-semibold text-gray-900 list-none flex items-center justify-between">
                    <span>{faq.question}</span>
                    <ChevronRight className="h-5 w-5 text-gray-500 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="mt-3 text-gray-600">
                    <p>{faq.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}