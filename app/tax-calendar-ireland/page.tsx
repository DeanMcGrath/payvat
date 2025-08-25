"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, Clock, AlertTriangle, CheckCircle, Bell, 
  Euro, FileText, Building2, Users, TrendingUp,
  ArrowRight, Download, Mail, Smartphone, CalendarDays
} from 'lucide-react'
import Footer from "@/components/footer"
import SiteHeader from "@/components/site-header"

export default function TaxCalendarIrelandPage() {
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth())
  const [currentYear] = useState(new Date().getFullYear())
  const [reminderSettings, setReminderSettings] = useState({
    email: false,
    sms: false,
    app: false
  })

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const taxDeadlines = [
    {
      id: "vat-jan-feb",
      title: "VAT Return - Jan/Feb Period",
      date: "19 March 2025",
      type: "VAT",
      priority: "high",
      description: "Submit VAT3 return and payment for January-February period",
      month: 2, // March (0-indexed)
      daysBefore: 30
    },
    {
      id: "vat-mar-apr",
      title: "VAT Return - Mar/Apr Period",
      date: "19 May 2025",
      type: "VAT",
      priority: "high",
      description: "Submit VAT3 return and payment for March-April period",
      month: 4, // May
      daysBefore: 30
    },
    {
      id: "vat-may-jun",
      title: "VAT Return - May/Jun Period",
      date: "19 July 2025",
      type: "VAT",
      priority: "high",
      description: "Submit VAT3 return and payment for May-June period",
      month: 6, // July
      daysBefore: 30
    },
    {
      id: "vat-jul-aug",
      title: "VAT Return - Jul/Aug Period",
      date: "19 September 2025",
      type: "VAT",
      priority: "high",
      description: "Submit VAT3 return and payment for July-August period",
      month: 8, // September
      daysBefore: 30
    },
    {
      id: "vat-sep-oct",
      title: "VAT Return - Sep/Oct Period",
      date: "19 November 2025",
      type: "VAT",
      priority: "high",
      description: "Submit VAT3 return and payment for September-October period",
      month: 10, // November
      daysBefore: 30
    },
    {
      id: "vat-nov-dec",
      title: "VAT Return - Nov/Dec Period",
      date: "19 January 2026",
      type: "VAT",
      priority: "high",
      description: "Submit VAT3 return and payment for November-December period",
      month: 0, // January next year
      daysBefore: 30
    },
    {
      id: "corp-tax-2024",
      title: "Corporation Tax Return 2024",
      date: "21 October 2025",
      type: "Corporation Tax",
      priority: "high",
      description: "Submit Form CT1 for accounting period ending 31 December 2024",
      month: 9, // October
      daysBefore: 60
    },
    {
      id: "annual-return-2024",
      title: "Annual Return to CRO",
      date: "31 August 2025",
      type: "CRO Filing",
      priority: "medium",
      description: "Submit Annual Return Form B1 to Companies Registration Office",
      month: 7, // August
      daysBefore: 45
    },
    {
      id: "paye-jan",
      title: "PAYE/PRSI Return - January",
      date: "14 February 2025",
      type: "PAYE",
      priority: "medium",
      description: "Submit P30 return and payment for January payroll",
      month: 1, // February
      daysBefore: 14
    },
    {
      id: "paye-feb",
      title: "PAYE/PRSI Return - February",
      date: "14 March 2025",
      type: "PAYE",
      priority: "medium",
      description: "Submit P30 return and payment for February payroll",
      month: 2, // March
      daysBefore: 14
    },
    {
      id: "paye-mar",
      title: "PAYE/PRSI Return - March",
      date: "14 April 2025",
      type: "PAYE",
      priority: "medium",
      description: "Submit P30 return and payment for March payroll",
      month: 3, // April
      daysBefore: 14
    },
    {
      id: "paye-apr",
      title: "PAYE/PRSI Return - April",
      date: "14 May 2025",
      type: "PAYE",
      priority: "medium",
      description: "Submit P30 return and payment for April payroll",
      month: 4, // May
      daysBefore: 14
    },
    {
      id: "paye-may",
      title: "PAYE/PRSI Return - May",
      date: "14 June 2025",
      type: "PAYE",
      priority: "medium",
      description: "Submit P30 return and payment for May payroll",
      month: 5, // June
      daysBefore: 14
    },
    {
      id: "paye-jun",
      title: "PAYE/PRSI Return - June",
      date: "14 July 2025",
      type: "PAYE",
      priority: "medium",
      description: "Submit P30 return and payment for June payroll",
      month: 6, // July
      daysBefore: 14
    },
    {
      id: "rct-q1",
      title: "RCT Return - Q1 2025",
      date: "12 May 2025",
      type: "RCT",
      priority: "medium",
      description: "Submit Relevant Contracts Tax return for Q1 (Jan-Mar)",
      month: 4, // May
      daysBefore: 30
    },
    {
      id: "rct-q2",
      title: "RCT Return - Q2 2025",
      date: "12 August 2025",
      type: "RCT",
      priority: "medium",
      description: "Submit Relevant Contracts Tax return for Q2 (Apr-Jun)",
      month: 7, // August
      daysBefore: 30
    }
  ]

  const getDeadlinesForMonth = (month: number) => {
    return taxDeadlines.filter(deadline => deadline.month === month)
  }

  const getUpcomingDeadlines = () => {
    const currentDate = new Date()
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(currentDate.getDate() + 30)
    
    return taxDeadlines.filter(deadline => {
      const deadlineDate = new Date(deadline.date)
      return deadlineDate >= currentDate && deadlineDate <= thirtyDaysFromNow
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'VAT':
        return <Euro className="h-4 w-4" />
      case 'Corporation Tax':
        return <Building2 className="h-4 w-4" />
      case 'PAYE':
        return <Users className="h-4 w-4" />
      case 'CRO Filing':
        return <FileText className="h-4 w-4" />
      case 'RCT':
        return <TrendingUp className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader 
        searchPlaceholder="Search tax deadlines..."
        currentPage="Tax Calendar Ireland"
        pageSubtitle="Important tax dates and deadlines for Irish businesses"
      />

      {/* Hero Section */}
      <section className="section-after-header relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-normal text-gray-900 mb-6">
              Irish Tax Calendar 2025
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Never miss a tax deadline again. Complete calendar of VAT returns, corporation tax, 
              PAYE deadlines, and other important dates for Irish businesses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-[#2A7A8F] to-[#216477] text-white">
                <Bell className="mr-2 h-5 w-5" />
                Set Up Reminders
              </Button>
              <Button variant="outline" size="lg" className="text-[#2A7A8F] border-[#2A7A8F]">
                <Download className="mr-2 h-5 w-5" />
                Download Calendar
              </Button>
            </div>
          </div>

          {/* Upcoming Deadlines Alert */}
          <Card className="shadow-xl border-2 border-red-100 mb-8">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-6 w-6" />
                Upcoming Deadlines (Next 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getUpcomingDeadlines().length > 0 ? (
                <div className="space-y-3">
                  {getUpcomingDeadlines().map((deadline) => (
                    <div key={deadline.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(deadline.type)}
                        <div>
                          <h4 className="font-normal text-red-900">{deadline.title}</h4>
                          <p className="text-sm text-red-700">{deadline.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-normal text-red-900">{deadline.date}</div>
                        <Badge className={getPriorityColor(deadline.priority)}>
                          {deadline.priority.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <p className="text-green-700 font-normal">No deadlines in the next 30 days!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Month Navigation */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {months.map((month, index) => (
              <Button
                key={month}
                variant={selectedMonth === index ? "default" : "outline"}
                onClick={() => setSelectedMonth(index)}
                className={selectedMonth === index 
                  ? "bg-gradient-to-r from-[#2A7A8F] to-[#216477] text-white" 
                  : "text-[#2A7A8F] border-[#2A7A8F] hover:bg-petrol-50"
                }
              >
                {month}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Calendar View */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl font-normal text-gray-900 mb-4">
              {months[selectedMonth]} {currentYear} - Tax Deadlines
            </h2>
            <p className="text-lg text-gray-600">
              {getDeadlinesForMonth(selectedMonth).length} deadline(s) this month
            </p>
          </div>

          {getDeadlinesForMonth(selectedMonth).length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {getDeadlinesForMonth(selectedMonth).map((deadline) => (
                <Card key={deadline.id} className="hover:shadow-xl transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(deadline.type)}
                        <Badge className={getPriorityColor(deadline.priority)}>
                          {deadline.priority.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-normal text-[#2A7A8F]">
                          {new Date(deadline.date).getDate()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {months[new Date(deadline.date).getMonth()]}
                        </div>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{deadline.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{deadline.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Due: {deadline.date}
                      </span>
                      <Button variant="outline" size="sm" className="text-[#2A7A8F] border-[#2A7A8F]">
                        <Bell className="mr-1 h-3 w-3" />
                        Remind Me
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <CalendarDays className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-normal text-gray-600 mb-2">No Deadlines This Month</h3>
                <p className="text-gray-500">Enjoy a deadline-free month!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Tax Types Overview */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-normal text-gray-900 mb-4">
              Irish Tax Types & Deadlines
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Understanding different tax obligations for Irish businesses
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#8FD0FC] to-[#216477] p-0.5 mb-4">
                  <div className="w-full h-full rounded-lg bg-white flex items-center justify-center">
                    <Euro className="h-6 w-6 text-[#2A7A8F]" />
                  </div>
                </div>
                <CardTitle>VAT Returns</CardTitle>
                <CardDescription>Bi-monthly VAT3 submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Due 19th of every odd month</li>
                  <li>• Covers 2-month periods</li>
                  <li>• Payment due with return</li>
                  <li>• Late filing penalty: €4,000</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#8FD0FC] to-[#216477] p-0.5 mb-4">
                  <div className="w-full h-full rounded-lg bg-white flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-[#2A7A8F]" />
                  </div>
                </div>
                <CardTitle>Corporation Tax</CardTitle>
                <CardDescription>Annual CT1 returns</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Due 9 months after year end</li>
                  <li>• 12.5% rate for trading income</li>
                  <li>• Preliminary tax due month 6</li>
                  <li>• Late filing penalty: €1,520</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#8FD0FC] to-[#216477] p-0.5 mb-4">
                  <div className="w-full h-full rounded-lg bg-white flex items-center justify-center">
                    <Users className="h-6 w-6 text-[#2A7A8F]" />
                  </div>
                </div>
                <CardTitle>PAYE/PRSI</CardTitle>
                <CardDescription>Monthly payroll returns</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Due 14th of following month</li>
                  <li>• P30 return and payment</li>
                  <li>• Annual P35 return</li>
                  <li>• Late payment interest: 0.0219% daily</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#8FD0FC] to-[#216477] p-0.5 mb-4">
                  <div className="w-full h-full rounded-lg bg-white flex items-center justify-center">
                    <FileText className="h-6 w-6 text-[#2A7A8F]" />
                  </div>
                </div>
                <CardTitle>CRO Filings</CardTitle>
                <CardDescription>Annual returns to CRO</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Annual Return (Form B1)</li>
                  <li>• Due within 28 days of AGM</li>
                  <li>• Financial statements filing</li>
                  <li>• Late filing penalty: €100</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#8FD0FC] to-[#216477] p-0.5 mb-4">
                  <div className="w-full h-full rounded-lg bg-white flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-[#2A7A8F]" />
                  </div>
                </div>
                <CardTitle>RCT Returns</CardTitle>
                <CardDescription>Relevant Contracts Tax</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Quarterly returns</li>
                  <li>• Due 12th of month after quarter</li>
                  <li>• Construction industry focus</li>
                  <li>• 20% withholding rate</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#8FD0FC] to-[#216477] p-0.5 mb-4">
                  <div className="w-full h-full rounded-lg bg-white flex items-center justify-center">
                    <Clock className="h-6 w-6 text-[#2A7A8F]" />
                  </div>
                </div>
                <CardTitle>Other Deadlines</CardTitle>
                <CardDescription>Additional compliance dates</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Form 11 (Income Tax)</li>
                  <li>• Benefit-in-Kind returns</li>
                  <li>• VIES declarations</li>
                  <li>• Statistical surveys</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Reminder Setup */}
      <section className="py-20 bg-[#2A7A8F] text-white">
        <div className="max-w-4xl mx-auto text-center px-6 lg:px-8">
          <h2 className="text-4xl font-normal mb-6">
            Never Miss a Deadline Again
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Set up automated reminders and let us handle your tax compliance calendar. 
            Get notifications 30, 14, and 7 days before each deadline.
          </p>
          
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="p-6 text-center">
                <Mail className="h-12 w-12 mx-auto mb-4 text-blue-200" />
                <h3 className="font-normal mb-2">Email Reminders</h3>
                <p className="text-sm text-blue-100">Get detailed deadline information via email</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="p-6 text-center">
                <Smartphone className="h-12 w-12 mx-auto mb-4 text-blue-200" />
                <h3 className="font-normal mb-2">SMS Alerts</h3>
                <p className="text-sm text-blue-100">Quick text reminders on your phone</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="p-6 text-center">
                <Bell className="h-12 w-12 mx-auto mb-4 text-blue-200" />
                <h3 className="font-normal mb-2">App Notifications</h3>
                <p className="text-sm text-blue-100">Push notifications in our mobile app</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-[#2A7A8F] hover:bg-gray-50">
              <Bell className="mr-2 h-5 w-5" />
              Set Up Reminders
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#2A7A8F]">
              <Download className="mr-2 h-5 w-5" />
              Download Full Calendar
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}