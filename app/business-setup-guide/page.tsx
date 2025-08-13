"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  FileText, Shield, Users, Building2, Euro, BanknoteIcon, 
  CheckCircle, ArrowRight, BookOpen, Calculator, Briefcase, 
  Globe, Home, Scale, Clock, AlertCircle, TrendingUp,
  Lightbulb, Target, Rocket, Star, ChevronRight, Download,
  Phone, Mail, MapPin, CreditCard, Receipt
} from 'lucide-react'
import { useState } from 'react'
import Footer from "@/components/footer"
import SiteHeader from "@/components/site-header"

export default function BusinessSetupGuidePage() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])

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
          steps: ["Choose company name", "Prepare constitution", "Submit Form A1", "Pay €50-100 fee"],
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
          steps: ["Check name availability", "Submit RBN1 form", "Pay €20 fee"],
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
          name: "Accounting Software",
          recommended: ["Xero", "QuickBooks", "Sage", "Wave"],
          features: "Invoice generation, expense tracking, VAT reporting"
        }
      ]
    },
    {
      id: "insurance",
      title: "Business Insurance",
      icon: Shield,
      description: "Protect your business with appropriate coverage",
      content: [
        {
          name: "Essential Coverage",
          types: [
            "Public Liability - €6.5M recommended",
            "Professional Indemnity - For service businesses",
            "Employer's Liability - If you have employees",
            "Commercial Property - For premises"
          ]
        },
        {
          name: "Additional Protection",
          types: [
            "Cyber Insurance - Data breach protection",
            "Business Interruption - Income protection",
            "Key Person Insurance - Protect against loss of key staff",
            "Directors & Officers - Board member protection"
          ]
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

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <div className="max-w-4xl mx-auto animate-fade-in">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-800 text-sm font-medium mb-6">
                <Rocket className="w-4 h-4" />
                Complete Startup Guide
                <Star className="w-4 h-4 fill-amber-600" />
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Start Your Irish Business
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600 mt-2">
                  The Right Way
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
                From choosing your business structure to VAT registration and compliance - 
                we'll guide you through every step of starting your business in Ireland.
              </p>

              {/* Quick Stats */}
              <div className="flex flex-wrap items-center justify-center gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium">10,000+ businesses started</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Setup in 7-14 days</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">100% compliant</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-20 right-10 w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full blur-3xl opacity-20 animate-float"></div>
          <div className="absolute bottom-20 left-10 w-32 h-32 bg-gradient-to-br from-yellow-400 to-amber-400 rounded-full blur-3xl opacity-20 animate-float" style={{animationDelay: '-2s'}}></div>
        </div>
      </section>

      {/* Progress Tracker */}
      <section className="py-8 -mt-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <Card className="shadow-xl border-2 border-amber-100">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Target className="h-6 w-6 text-amber-600" />
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
                  className="absolute left-0 top-0 h-2 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full transition-all duration-500"
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
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white' 
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
                } ${completedSteps.includes(step.id) ? 'border-green-200' : ''}`}
              >
                <CardHeader 
                  className="cursor-pointer"
                  onClick={() => setExpandedSection(expandedSection === step.id ? null : step.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 p-0.5`}>
                        <div className="w-full h-full rounded-xl bg-white flex items-center justify-center">
                          <step.icon className="h-8 w-8 text-amber-600" />
                        </div>
                      </div>
                      <div>
                        <CardTitle className="text-2xl flex items-center gap-2">
                          Step {index + 1}: {step.title}
                          {completedSteps.includes(step.id) && (
                            <CheckCircle className="h-5 w-5 text-green-600" />
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
                                <p className="text-sm font-medium text-green-700 mb-1">Pros:</p>
                                <ul className="text-sm text-gray-600 space-y-1">
                                  {item.pros?.map((pro, i) => (
                                    <li key={i} className="flex items-start gap-1">
                                      <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                      {pro}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-red-700 mb-1">Cons:</p>
                                <ul className="text-sm text-gray-600 space-y-1">
                                  {item.cons?.map((con, i) => (
                                    <li key={i} className="flex items-start gap-1">
                                      <AlertCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
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
                                    <span className="font-medium text-amber-600">{i + 1}.</span>
                                    {s}
                                  </li>
                                ))}
                              </ol>
                              {item.timeline && (
                                <div className="flex items-center gap-2 pt-3 border-t">
                                  <Clock className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm text-gray-600">Timeline: {item.timeline}</span>
                                </div>
                              )}
                              {item.link && (
                                <a href={`https://${item.link}`} target="_blank" rel="noopener noreferrer" 
                                   className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
                                  Visit {item.link}
                                  <ArrowRight className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          )}
                          
                          {step.id === 'vat' && (
                            <div className="space-y-3">
                              {item.services && (
                                <div className="text-sm">
                                  <p className="text-gray-700"><span className="font-medium">Services:</span> {item.services}</p>
                                  <p className="text-gray-700"><span className="font-medium">Goods:</span> {item.goods}</p>
                                  {item.note && <p className="text-gray-600 italic mt-2">{item.note}</p>}
                                </div>
                              )}
                              {item.steps && (
                                <ol className="text-sm text-gray-600 space-y-1">
                                  {item.steps.map((s, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                      <span className="font-medium text-amber-600">{i + 1}.</span>
                                      {s}
                                    </li>
                                  ))}
                                </ol>
                              )}
                              {item.standard && (
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Standard:</span>
                                    <span className="font-medium">{item.standard}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Reduced:</span>
                                    <span className="font-medium">{item.reduced}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Special:</span>
                                    <span className="font-medium">{item.special}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Zero:</span>
                                    <span className="font-medium">{item.zero}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {step.id === 'banking' && (
                            <div className="space-y-3 text-sm">
                              {item.requirements && (
                                <div>
                                  <p className="font-medium text-gray-700 mb-2">Requirements:</p>
                                  <ul className="text-gray-600 space-y-1">
                                    {item.requirements.map((req, i) => (
                                      <li key={i} className="flex items-start gap-1">
                                        <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                        {req}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {item.banks && (
                                <div>
                                  <p className="font-medium text-gray-700 mb-1">Major Banks:</p>
                                  <p className="text-gray-600">{item.banks.join(', ')}</p>
                                </div>
                              )}
                              {item.options && (
                                <div>
                                  <p className="font-medium text-gray-700 mb-1">Options:</p>
                                  <p className="text-gray-600">{item.options.join(', ')}</p>
                                </div>
                              )}
                              {item.recommended && (
                                <div>
                                  <p className="font-medium text-gray-700 mb-1">Recommended:</p>
                                  <p className="text-gray-600">{item.recommended.join(', ')}</p>
                                </div>
                              )}
                              {item.features && (
                                <p className="text-gray-600 italic">{item.features}</p>
                              )}
                              {item.considerations && (
                                <p className="text-gray-600 italic">{item.considerations}</p>
                              )}
                            </div>
                          )}
                          
                          {step.id === 'insurance' && 'types' in item && (
                            <ul className="text-sm text-gray-600 space-y-2">
                              {item.types?.map((type, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <Shield className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                  {type}
                                </li>
                              ))}
                            </ul>
                          )}
                          
                          {step.id === 'compliance' && (
                            <div className="space-y-3 text-sm">
                              {item.items && (
                                <ul className="text-gray-600 space-y-1">
                                  {item.items.map((itm, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                      <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                      {itm}
                                    </li>
                                  ))}
                                </ul>
                              )}
                              {item.requirement && (
                                <div className="pt-3 border-t">
                                  <p className="font-medium text-gray-700">Retention: {item.requirement}</p>
                                  {item.includes && (
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
                          ? "border-green-500 text-green-700 hover:bg-green-50" 
                          : "bg-gradient-to-r from-amber-500 to-orange-600 text-white"}
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
                          className="text-amber-600 hover:text-amber-700"
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
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 p-0.5 mb-4">
                    <div className="w-full h-full rounded-lg bg-white flex items-center justify-center">
                      <resource.icon className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{resource.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{resource.description}</p>
                  <Button variant="outline" className="w-full text-amber-600 border-amber-600 hover:bg-amber-50">
                    {resource.action}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-amber-500 to-orange-600">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12">
            <Lightbulb className="h-16 w-16 text-white mx-auto mb-6" />
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready to Start Your Business?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Let PayVAT handle your VAT compliance from day one. Focus on growing your business while we manage the paperwork.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-amber-600 hover:bg-gray-100 font-semibold px-8"
                onClick={() => window.location.href = '/signup'}
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10 font-semibold px-8"
                onClick={() => window.location.href = '/contact'}
              >
                <Phone className="mr-2 h-5 w-5" />
                Talk to an Expert
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}