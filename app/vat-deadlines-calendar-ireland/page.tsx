"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, AlertTriangle, Download, Bell, CheckCircle2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import SiteHeader from "@/components/site-header"

export default function VATDeadlinesCalendarPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [selectedYear, setSelectedYear] = useState(2025)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Generate VAT deadlines for the year
  const generateVATDeadlines = (year: number) => {
    const deadlines = []
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]

    // Bi-monthly deadlines (every 2 months on 19th)
    for (let month = 2; month <= 12; month += 2) {
      const period = `${months[month-2]}-${months[month-1]} ${year}`
      deadlines.push({
        date: `${year}-${month.toString().padStart(2, '0')}-19`,
        displayDate: `19 ${months[month-1]} ${year}`,
        period,
        type: 'Bi-monthly',
        status: month <= new Date().getMonth() + 1 ? 'past' : 'upcoming',
        description: `VAT3 return and payment for ${period}`
      })
    }

    // Annual deadline
    deadlines.push({
      date: `${year+1}-01-19`,
      displayDate: `19 January ${year+1}`,
      period: `Annual ${year}`,
      type: 'Annual',
      status: 'upcoming',
      description: `Annual VAT return for qualifying businesses`
    })

    return deadlines.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  const deadlines = generateVATDeadlines(selectedYear)
  const nextDeadline = deadlines.find(d => d.status === 'upcoming')

  const deadlineTypes = [
    {
      type: 'Bi-monthly Returns',
      frequency: 'Every 2 months (19th)',
      applies: 'Most VAT-registered businesses',
      description: 'Standard VAT return filing schedule for businesses with annual turnover over VAT thresholds'
    },
    {
      type: 'Monthly Returns',
      frequency: 'Every month (19th)',
      applies: 'Large traders (€3M+ turnover)',
      description: 'Required for businesses with high VAT volumes or specific Revenue requirements'
    },
    {
      type: 'Annual Returns',
      frequency: 'Once per year (19 January)',
      applies: 'Small businesses below thresholds',
      description: 'Simplified annual reporting for qualifying small businesses'
    }
  ]

  const importantReminders = [
    {
      icon: AlertTriangle,
      title: 'Payment & Return Together',
      description: 'Both VAT3 return filing AND payment are due on the same deadline date',
      color: 'red'
    },
    {
      icon: Clock,
      title: 'Revenue Processing Time',
      description: 'Allow 2-3 business days for bank transfers to appear in your ROS account',
      color: 'amber'
    },
    {
      icon: Bell,
      title: 'Late Payment Penalties',
      description: 'Interest charged daily at 0.0274% on late payments plus potential penalties',
      color: 'orange'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <SiteHeader />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-green-600 to-green-800 text-white py-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="max-w-4xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                VAT Deadlines Calendar Ireland 2025
              </h1>
              <p className="text-xl md:text-2xl text-green-100 mb-8">
                Never miss a VAT deadline again. Complete calendar of Irish Revenue VAT submission dates and payment deadlines for 2025.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-white text-green-600 hover:bg-green-50">
                  <Download className="mr-2 h-5 w-5" />
                  Download Calendar
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                  <Bell className="mr-2 h-5 w-5" />
                  Set Up Reminders
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Next Deadline Alert */}
        {nextDeadline && (
          <section className="py-8 bg-red-50 border-b border-red-200">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <Alert className="border-red-300 bg-red-100">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 font-medium">
                  <strong>Next VAT Deadline:</strong> {nextDeadline.displayDate} - {nextDeadline.description}
                </AlertDescription>
              </Alert>
            </div>
          </section>
        )}

        {/* Calendar Overview */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                2025 VAT Deadline Calendar
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                All Irish Revenue VAT submission deadlines for {selectedYear}. Mark these dates in your business calendar.
              </p>
            </div>

            <div className="grid gap-6">
              {deadlines.map((deadline, index) => (
                <Card key={index} className={`p-6 border-l-4 ${
                  deadline.status === 'past' 
                    ? 'border-l-gray-400 bg-gray-50' 
                    : deadline === nextDeadline 
                      ? 'border-l-red-500 bg-red-50 ring-2 ring-red-200' 
                      : 'border-l-green-500 bg-white'
                }`}>
                  <div className="grid md:grid-cols-4 gap-4 items-center">
                    <div className="flex items-center space-x-3">
                      <Calendar className={`h-8 w-8 ${
                        deadline.status === 'past' 
                          ? 'text-gray-400' 
                          : deadline === nextDeadline 
                            ? 'text-red-500' 
                            : 'text-green-500'
                      }`} />
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {deadline.displayDate.split(' ')[0]}
                        </div>
                        <div className="text-sm text-gray-500">
                          {deadline.displayDate.split(' ').slice(1).join(' ')}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <Badge variant={deadline.type === 'Bi-monthly' ? 'default' : 'secondary'}>
                        {deadline.type}
                      </Badge>
                      <div className="text-sm text-gray-600 mt-1">{deadline.period}</div>
                    </div>

                    <div className="md:col-span-2">
                      <p className="text-gray-700">{deadline.description}</p>
                      {deadline === nextDeadline && (
                        <div className="mt-2 text-sm font-medium text-red-600">
                          ⚠️ Coming up - ensure your VAT3 return and payment are ready
                        </div>
                      )}
                      {deadline.status === 'past' && (
                        <div className="mt-2 text-sm text-gray-500 flex items-center">
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Deadline passed
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Deadline Types Explanation */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Understanding VAT Filing Schedules
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Different businesses have different VAT filing requirements. Find out which schedule applies to you.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {deadlineTypes.map((schedule, index) => (
                <Card key={index} className="h-full">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-gray-900">
                      {schedule.type}
                    </CardTitle>
                    <div className="text-lg font-medium text-blue-600">
                      {schedule.frequency}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Applies to:</h4>
                        <p className="text-gray-600">{schedule.applies}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Description:</h4>
                        <p className="text-gray-600">{schedule.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Important Reminders */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Critical VAT Deadline Reminders
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Important points to remember when planning your VAT submissions.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {importantReminders.map((reminder, index) => (
                <Card key={index} className={`border-l-4 border-l-${reminder.color}-500`}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-3">
                      <reminder.icon className={`h-6 w-6 text-${reminder.color}-500 mt-1 flex-shrink-0`} />
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">{reminder.title}</h3>
                        <p className="text-gray-600">{reminder.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* PayVAT Automation */}
        <section className="py-16 bg-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Never Miss a VAT Deadline Again
              </h2>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                PayVAT automatically tracks your VAT deadlines and sends you reminders, so you can focus on running your business.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="space-y-6">
                  {[
                    "Automatic deadline reminders via email",
                    "Pre-calculated VAT returns ready for submission",
                    "Integration with Revenue's ROS system",
                    "Compliance tracking and penalty prevention"
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle2 className="h-6 w-6 text-green-300 flex-shrink-0" />
                      <span className="text-blue-100">{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                    <ArrowRight className="mr-2 h-5 w-5" />
                    Start Free Trial
                  </Button>
                </div>
              </div>
              
              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Deadline Notification</h3>
                  <div className="bg-white/20 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Bell className="h-5 w-5 text-yellow-300" />
                      <span className="font-medium">VAT Reminder</span>
                    </div>
                    <p className="text-sm text-blue-100">
                      Your VAT return for January-February 2025 is due on March 19th. 
                      Your return is ready for submission.
                    </p>
                    <Button size="sm" className="mt-3 bg-white text-blue-600">
                      Submit Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}