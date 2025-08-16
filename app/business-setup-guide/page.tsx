"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { 
  FileText, Shield, Users, Building2, Euro, BanknoteIcon, 
  CheckCircle, ArrowRight, BookOpen, Calculator, Briefcase, 
  Globe, Home, Scale, Clock, AlertCircle, TrendingUp,
  Target, BadgeCheck, ChevronRight, Download,
  Phone, Mail, MapPin, CreditCard, Receipt
} from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Footer from "@/components/footer"
import SiteHeader from "@/components/site-header"

type ContactFormData = {
  fullName: string
  email: string
  phone: string
  businessType: string
  currentStage: string
  message?: string
}

export default function BusinessSetupGuidePage() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  
  const form = useForm<ContactFormData>({
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      businessType: '',
      currentStage: '',
      message: ''
    }
  })

  const onSubmit = async (data: ContactFormData) => {
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          source: 'business-setup-guide',
          timestamp: new Date().toISOString()
        }),
      })

      if (response.ok) {
        alert('Thank you! We will contact you within 24 hours to discuss your business setup package.')
        // Reset form or redirect as needed
      } else {
        alert('Something went wrong. Please try again or contact us directly at support@payvat.ie')
      }
    } catch (error) {
      console.error('Form submission error:', error)
      alert('Something went wrong. Please try again or contact us directly at support@payvat.ie')
    }
  }

  const scrollToContactForm = () => {
    const contactSection = document.getElementById('contact-form-section')
    contactSection?.scrollIntoView({ behavior: 'smooth' })
  }

  const toggleStep = (stepId: string) => {
    setCompletedSteps(prev => 
      prev.includes(stepId) 
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    )
  }

  const setupSteps = [
    {
      id: "structure",
      title: "Choose Your Business Structure",
      icon: Building2,
      description: "Select the right legal structure for your Irish business",
      content: [
        {
          name: "Sole Trader",
          pros: ["Simple setup", "Full control", "Lower costs", "Easy tax filing"],
          cons: ["Unlimited liability", "Harder to raise capital", "Less credibility"],
          bestFor: "Freelancers, consultants, small services"
        },
        {
          name: "Limited Company (LTD)",
          pros: ["Limited liability", "Tax benefits", "Professional image", "Easier to sell"],
          cons: ["More paperwork", "Annual filing requirements", "Higher setup costs"],
          bestFor: "Growing businesses, multiple owners, higher revenue"
        },
        {
          name: "Partnership",
          pros: ["Shared responsibility", "Combined expertise", "Tax flexibility"],
          cons: ["Joint liability", "Potential conflicts", "Profit sharing"],
          bestFor: "Professional services, joint ventures"
        }
      ]
    },
    {
      id: "registration",
      title: "Register Your Business",
      icon: FileText,
      description: "Official registration with Irish authorities",
      content: [
        {
          name: "Companies Registration Office (CRO)",
          steps: ["Choose company name", "Prepare constitution", "Submit Form A1"],
          timeline: "5-10 business days",
          link: "www.cro.ie"
        },
        {
          name: "Revenue Registration",
          steps: ["Register for taxes", "Get tax registration number", "Set up ROS access"],
          timeline: "1-2 business days",
          link: "www.revenue.ie"
        },
        {
          name: "Business Name Registration",
          steps: ["Check name availability", "Submit RBN1 form"],
          timeline: "5 business days",
          link: "www.cro.ie/rbn"
        }
      ]
    },
    {
      id: "vat",
      title: "VAT Registration",
      icon: Receipt,
      description: "Register for VAT when required or beneficial",
      content: [
        {
          name: "VAT Thresholds",
          services: "€37,500 annual turnover",
          goods: "€75,000 annual turnover",
          note: "Can register voluntarily below thresholds"
        },
        {
          name: "Registration Process",
          steps: [
            "Complete Form TR1 or TR2",
            "Provide business details",
            "Submit bank information",
            "Wait for VAT number (5-10 days)"
          ]
        },
        {
          name: "VAT Rates in Ireland",
          standard: "23% - Most goods and services",
          reduced: "13.5% - Certain services",
          special: "9% - Tourism, hospitality",
          zero: "0% - Exports, certain foods"
        }
      ]
    },
    {
      id: "banking",
      title: "Business Banking",
      icon: CreditCard,
      description: "Set up your business financial infrastructure",
      content: [
        {
          name: "Business Bank Account",
          requirements: ["Business registration docs", "Photo ID", "Proof of address", "Tax number"],
          banks: ["AIB", "Bank of Ireland", "Ulster Bank", "Permanent TSB"],
          features: "Online banking, business debit card, overdraft facility"
        },
        {
          name: "Payment Processing",
          options: ["Stripe", "Square", "PayPal", "Worldpay"],
          considerations: "Transaction fees, settlement times, integration options"
        },
        {
          name: "Accounting Software - Coming Soon",
          features: "Invoice generation, expense tracking, VAT reporting"
        }
      ]
    },
    {
      id: "compliance",
      title: "Ongoing Compliance",
      icon: Scale,
      description: "Stay compliant with Irish regulations",
      content: [
        {
          name: "Annual Requirements",
          items: [
            "Annual Return to CRO",
            "Financial Statements filing",
            "Corporation Tax Return",
            "VAT Returns (bi-monthly)"
          ]
        },
        {
          name: "Employment Compliance",
          items: [
            "PAYE/PRSI registration",
            "Employment contracts",
            "Health & Safety compliance",
            "GDPR requirements"
          ]
        },
        {
          name: "Record Keeping",
          requirement: "6 years minimum",
          includes: ["Invoices", "Receipts", "Bank statements", "Tax returns", "Employment records"]
        }
      ]
    }
  ]

  const resources = [
    { 
      title: "Business Plan Template", 
      icon: FileText, 
      description: "Professional template for Irish businesses",
      action: "Download"
    },
    { 
      title: "VAT Calculator", 
      icon: Calculator, 
      description: "Calculate VAT for your transactions",
      action: "Open Tool"
    },
    { 
      title: "Tax Calendar", 
      icon: Clock, 
      description: "Important tax dates and deadlines",
      action: "View Calendar"
    },
    { 
      title: "Expert Consultation", 
      icon: Users, 
      description: "Book a call with our business advisors",
      action: "Book Now"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader 
        searchPlaceholder="Search business setup guides..."
        currentPage="Business Setup Guide"
        pageSubtitle="Everything you need to start your Irish business"
      />


      {/* Service Announcement */}
      <section className="py-12 bg-teal-600">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <Card className="border-0 shadow-2xl">
            <CardContent className="p-8 md:p-12">
              <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-teal-800 mb-6">
                  Let Us Handle Everything For You!
                </h2>
                <p className="text-lg text-gray-700 max-w-4xl mx-auto mb-6 leading-relaxed">
                  Don't want to navigate the complexities alone? PayVAT offers a complete done-for-you business setup service. 
                  We handle every step from company registration to VAT setup, so you can focus on growing your business.
                </p>
                <div className="bg-teal-50 rounded-lg p-6 mb-8 inline-block">
                  <p className="text-2xl font-bold text-teal-800 mb-2">
                    €500 Complete Package + 6 Months FREE VAT Services
                  </p>
                </div>
                <Button 
                  size="lg"
                  onClick={scrollToContactForm}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8"
                >
                  Learn More
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Progress Tracker */}
      <section className="py-8 -mt-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <Card className="shadow-xl border-2 border-teal-100">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Target className="h-6 w-6 text-teal-600" />
                Your Setup Progress
              </CardTitle>
              <CardDescription>
                Track your business setup journey - {completedSteps.length} of {setupSteps.length} steps completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-0 top-0 h-2 w-full bg-gray-200 rounded-full"></div>
                <div 
                  className="absolute left-0 top-0 h-2 bg-gradient-to-r from-teal-500 to-teal-700 rounded-full transition-all duration-500"
                  style={{ width: `${(completedSteps.length / setupSteps.length) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-6">
                {setupSteps.map((step, index) => (
                  <div 
                    key={step.id}
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => toggleStep(step.id)}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      completedSteps.includes(step.id) 
                        ? 'bg-gradient-to-r from-teal-500 to-teal-700 text-white' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {completedSteps.includes(step.id) ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <span className="text-sm font-semibold">{index + 1}</span>
                      )}
                    </div>
                    <span className="text-xs mt-2 text-gray-600 hidden md:block">{step.title.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Setup Steps */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="space-y-8">
            {setupSteps.map((step, index) => (
              <Card 
                key={step.id}
                className={`overflow-hidden transition-all duration-300 ${
                  expandedSection === step.id ? 'shadow-2xl scale-[1.02]' : 'shadow-lg hover:shadow-xl'
                } ${completedSteps.includes(step.id) ? 'border-teal-200' : ''}`}
              >
                <CardHeader 
                  className="cursor-pointer"
                  onClick={() => setExpandedSection(expandedSection === step.id ? null : step.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 p-0.5`}>
                        <div className="w-full h-full rounded-xl bg-white flex items-center justify-center">
                          <step.icon className="h-8 w-8 text-teal-600" />
                        </div>
                      </div>
                      <div>
                        <CardTitle className="text-2xl flex items-center gap-2">
                          Step {index + 1}: {step.title}
                          {completedSteps.includes(step.id) && (
                            <CheckCircle className="h-5 w-5 text-teal-600" />
                          )}
                        </CardTitle>
                        <CardDescription className="text-base mt-1">
                          {step.description}
                        </CardDescription>
                      </div>
                    </div>
                    <ChevronRight className={`h-6 w-6 text-gray-400 transition-transform ${
                      expandedSection === step.id ? 'rotate-90' : ''
                    }`} />
                  </div>
                </CardHeader>
                
                {expandedSection === step.id && (
                  <CardContent className="animate-slide-down">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {step.content.map((item, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-lg p-6">
                          <h4 className="font-semibold text-lg mb-3 text-gray-900">{item.name}</h4>
                          
                          {/* Different content layouts based on step type */}
                          {step.id === 'structure' && 'pros' in item && (
                            <div className="space-y-3">
                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-1">Pros:</p>
                                <ul className="text-sm text-gray-600 space-y-1">
                                  {item.pros?.map((pro, i) => (
                                    <li key={i} className="flex items-start gap-1">
                                      <CheckCircle className="h-3 w-3 text-teal-600 mt-0.5 flex-shrink-0" />
                                      {pro}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-1">Cons:</p>
                                <ul className="text-sm text-gray-600 space-y-1">
                                  {item.cons?.map((con, i) => (
                                    <li key={i} className="flex items-start gap-1">
                                      <AlertCircle className="h-3 w-3 text-gray-600 mt-0.5 flex-shrink-0" />
                                      {con}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div className="pt-2 border-t">
                                <p className="text-sm text-gray-700">
                                  <span className="font-medium">Best for:</span> {item.bestFor}
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {step.id === 'registration' && 'steps' in item && (
                            <div className="space-y-3">
                              <ol className="text-sm text-gray-600 space-y-2">
                                {item.steps?.map((s, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="font-medium text-teal-600">{i + 1}.</span>
                                    {s}
                                  </li>
                                ))}
                              </ol>
                              {'timeline' in item && item.timeline && (
                                <div className="flex items-center gap-2 pt-3 border-t">
                                  <Clock className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm text-gray-600">Timeline: {item.timeline}</span>
                                </div>
                              )}
                              {'link' in item && item.link && (
                                <a href={`https://${item.link}`} target="_blank" rel="noopener noreferrer" 
                                   className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1">
                                  Visit {item.link}
                                  <ArrowRight className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          )}
                          
                          {step.id === 'vat' && (
                            <div className="space-y-3">
                              {'services' in item && item.services && (
                                <div className="text-sm">
                                  <p className="text-gray-700"><span className="font-medium">Services:</span> {item.services}</p>
                                  {'goods' in item && item.goods && <p className="text-gray-700"><span className="font-medium">Goods:</span> {item.goods}</p>}
                                  {'note' in item && item.note && <p className="text-gray-600 italic mt-2">{item.note}</p>}
                                </div>
                              )}
                              {'steps' in item && item.steps && (
                                <ol className="text-sm text-gray-600 space-y-1">
                                  {item.steps.map((s, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                      <span className="font-medium text-teal-600">{i + 1}.</span>
                                      {s}
                                    </li>
                                  ))}
                                </ol>
                              )}
                              {'standard' in item && item.standard && (
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Standard:</span>
                                    <span className="font-medium">{item.standard}</span>
                                  </div>
                                  {'reduced' in item && item.reduced && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Reduced:</span>
                                      <span className="font-medium">{item.reduced}</span>
                                    </div>
                                  )}
                                  {'special' in item && item.special && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Special:</span>
                                      <span className="font-medium">{item.special}</span>
                                    </div>
                                  )}
                                  {'zero' in item && item.zero && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Zero:</span>
                                      <span className="font-medium">{item.zero}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                          
                          {step.id === 'banking' && (
                            <div className="space-y-3 text-sm">
                              {'requirements' in item && item.requirements && (
                                <div>
                                  <p className="font-medium text-gray-700 mb-2">Requirements:</p>
                                  <ul className="text-gray-600 space-y-1">
                                    {item.requirements.map((req, i) => (
                                      <li key={i} className="flex items-start gap-1">
                                        <CheckCircle className="h-3 w-3 text-teal-600 mt-0.5 flex-shrink-0" />
                                        {req}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {'banks' in item && item.banks && (
                                <div>
                                  <p className="font-medium text-gray-700 mb-1">Major Banks:</p>
                                  <p className="text-gray-600">{item.banks.join(', ')}</p>
                                </div>
                              )}
                              {'options' in item && item.options && (
                                <div>
                                  <p className="font-medium text-gray-700 mb-1">Options:</p>
                                  <p className="text-gray-600">{item.options.join(', ')}</p>
                                </div>
                              )}
                              {('recommended' in item && item.recommended && Array.isArray(item.recommended)) ? (
                                <div>
                                  <p className="font-medium text-gray-700 mb-1">Recommended:</p>
                                  <p className="text-gray-600">{item.recommended.join(', ')}</p>
                                </div>
                              ) : null}
                              {'features' in item && item.features && (
                                <p className="text-gray-600 italic">{item.features}</p>
                              )}
                              {'considerations' in item && item.considerations && (
                                <p className="text-gray-600 italic">{item.considerations}</p>
                              )}
                            </div>
                          )}
                          
                          {step.id === 'compliance' && (
                            <div className="space-y-3 text-sm">
                              {'items' in item && item.items && (
                                <ul className="text-gray-600 space-y-1">
                                  {item.items.map((itm, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                      <CheckCircle className="h-3 w-3 text-teal-600 mt-0.5 flex-shrink-0" />
                                      {itm}
                                    </li>
                                  ))}
                                </ul>
                              )}
                              {'requirement' in item && item.requirement && (
                                <div className="pt-3 border-t">
                                  <p className="font-medium text-gray-700">Retention: {item.requirement}</p>
                                  {'includes' in item && item.includes && (
                                    <p className="text-gray-600 mt-1">Includes: {item.includes.join(', ')}</p>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 flex items-center justify-between">
                      <Button
                        variant={completedSteps.includes(step.id) ? "outline" : "default"}
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleStep(step.id)
                        }}
                        className={completedSteps.includes(step.id) 
                          ? "border-teal-500 text-teal-700 hover:bg-teal-50" 
                          : "bg-gradient-to-r from-teal-600 to-teal-700 text-white"}
                      >
                        {completedSteps.includes(step.id) ? (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Completed
                          </>
                        ) : (
                          <>
                            Mark as Complete
                            <CheckCircle className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                      
                      {index < setupSteps.length - 1 && (
                        <Button
                          variant="ghost"
                          onClick={() => setExpandedSection(setupSteps[index + 1].id)}
                          className="text-teal-600 hover:text-teal-700"
                        >
                          Next Step
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Helpful Resources
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Additional tools and templates to help you succeed
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {resources.map((resource, index) => (
              <Card key={index} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 p-0.5 mb-4">
                    <div className="w-full h-full rounded-lg bg-white flex items-center justify-center">
                      <resource.icon className="h-6 w-6 text-teal-600" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{resource.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{resource.description}</p>
                  <Button variant="outline" className="w-full text-teal-600 border-teal-600 hover:bg-teal-50">
                    {resource.action}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Complete Service Offering & Contact Form */}
      <section id="contact-form-section" className="py-20 bg-teal-600">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-2xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-teal-800 mb-4">
                Complete Startup Package: €500
              </h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                We handle your entire business setup from start to finish, plus you get your first 6 months of PayVAT VAT processing and submission services FREE.
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="fullName"
                    rules={{ required: "Full name is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    rules={{ 
                      required: "Email is required",
                      pattern: {
                        value: /\S+@\S+\.\S+/,
                        message: "Please enter a valid email address"
                      }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter your email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="phone"
                    rules={{ required: "Phone number is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="businessType"
                    rules={{ required: "Please select a business type" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select business type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="sole-trader">Sole Trader</SelectItem>
                            <SelectItem value="limited-company">Limited Company</SelectItem>
                            <SelectItem value="not-sure">Not Sure Yet</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="currentStage"
                  rules={{ required: "Please select your current stage" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Stage *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your current stage" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="just-starting">Just Starting</SelectItem>
                          <SelectItem value="researching-options">Researching Business Options</SelectItem>
                          <SelectItem value="name-registered">Business Name Registered</SelectItem>
                          <SelectItem value="company-incorporated">Company Incorporated</SelectItem>
                          <SelectItem value="need-vat-number">Need VAT Number</SelectItem>
                          <SelectItem value="have-vat-need-help">Have VAT Number - Need Help with Compliance</SelectItem>
                          <SelectItem value="switching-provider">Established Business - Switching VAT Provider</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message/Additional Information</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell us more about your business setup needs (optional)"
                          rows={4}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="text-center">
                  <Button 
                    type="submit"
                    size="lg"
                    className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-12 py-3"
                  >
                    Get Your Startup Package
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}