"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Calculator, Shield, Clock, TrendingUp, ChevronRight, 
  CheckCircle, ArrowRight, BadgeCheck, Users, Award,
  FileText, BanknoteIcon, AlertCircle, Phone,
  Mail, Calendar, Download, Globe, Building2,
  Briefcase, Target, Euro, Receipt,
  BarChart3, PieChart, LineChart, DollarSign,
  Smartphone, Laptop, Tablet, HelpCircle
} from 'lucide-react'
import { useState } from 'react'
import Footer from "@/components/footer"
import SiteHeader from "@/components/site-header"

export default function VATServicesPage() {
  const [selectedPlan, setSelectedPlan] = useState<string>("annual")
  const [showCalculator, setShowCalculator] = useState(false)

  const services = [
    {
      id: "calculation",
      title: "VAT Calculation",
      icon: Calculator,
      description: "Accurate VAT calculations for all transaction types",
      features: [
        "Real-time rate updates",
        "Multiple VAT rates support",
        "Currency conversion",
        "Bulk calculations",
        "Export to Excel/PDF"
      ],
      color: "from-[#8FD0FC] to-[#2A7A8F]"
    },
    {
      id: "submission",
      title: "VAT Submission",
      icon: FileText,
      description: "Automated VAT return preparation and submission",
      features: [
        "Auto-generate VAT returns",
        "Direct Revenue submission",
        "Error checking & validation",
        "Deadline reminders",
        "Amendment support"
      ],
      color: "from-[#8FD0FC] to-green-600"
    },
    {
      id: "payment",
      title: "VAT Payment Processing",
      icon: BanknoteIcon,
      description: "Secure payment processing for VAT liabilities",
      features: [
        "Direct debit setup",
        "Payment scheduling",
        "Multiple payment methods",
        "Payment confirmations",
        "Late payment protection"
      ],
      color: "from-[#2A7A8F] to-[#216477]"
    },
    {
      id: "compliance",
      title: "Compliance Monitoring",
      icon: Shield,
      description: "Stay compliant with Irish VAT regulations",
      features: [
        "Compliance health checks",
        "Regulatory updates",
        "Risk assessments",
        "Audit preparation",
        "Expert consultations"
      ],
      color: "from-[#8FD0FC] to-cyan-600"
    }
  ]

  const pricingOptions = [
    {
      id: "monthly",
      name: "Monthly Plan",
      price: "€30",
      period: "/month",
      description: "Perfect for getting started",
      features: [
        "VAT calculations",
        "VAT submissions via ROS",
        "Payment processing",
        "Priority support",
        "Unlimited transactions",
        "Basic and custom reporting",
        "Deadline reminders",
        "Expert guidance when you need it"
      ],
      badge: null,
      buttonText: "Start Free Trial",
      popular: false,
      savings: null
    },
    {
      id: "annual",
      name: "Annual Plan",
      price: "€300",
      period: "/year",
      description: "Best value for growing businesses",
      features: [
        "VAT calculations",
        "VAT submissions via ROS",
        "Payment processing",
        "Priority support",
        "Unlimited transactions",
        "Basic and custom reporting",
        "Deadline reminders",
        "Expert guidance when you need it"
      ],
      badge: "Save €180",
      buttonText: "Get Started",
      popular: true,
      savings: "Two months free!"
    }
  ]

  const testimonials = [
    {
      name: "Sarah Mitchell",
      company: "Mitchell Digital Agency",
      role: "Finance Director",
      quote: "PayVAT has streamlined our VAT processing significantly. The automation is incredible and the support team is always helpful.",
      rating: 5,
      savings: "Time Saved"
    },
    {
      name: "James O'Connor",
      company: "O'Connor Construction",
      role: "Managing Director", 
      quote: "Since switching to PayVAT, we've never missed a VAT deadline. The peace of mind is worth every penny.",
      rating: 5,
      savings: "Peace of Mind"
    },
    {
      name: "Maria Santos",
      company: "Santos Consulting",
      role: "Founder",
      quote: "The VAT calculator alone pays for the subscription. Everything else is a bonus. Highly recommend to any Irish business.",
      rating: 5,
      savings: "Great Value"
    }
  ]

  const stats = [
    { number: "Growing", label: "Irish business community", icon: Building2 },
    { number: "Professional", label: "VAT compliance support", icon: Euro },
    { number: "Reliable", label: "Service you can trust", icon: Shield },
    { number: "Expert", label: "Guidance when needed", icon: HelpCircle }
  ]

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader 
        searchPlaceholder="Search VAT services and tools..."
        currentPage="VAT Services"
        pageSubtitle="Streamline your VAT compliance with PayVAT"
      />


      {/* Services Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-normal text-foreground mb-4">
              Complete VAT <span className="text-gradient-primary">Management Suite</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to stay VAT compliant, from calculations to submissions
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2">
            {services.map((service, index) => (
              <Card 
                key={service.id}
                className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden"
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div className={`h-2 bg-gradient-to-r ${service.color}`} />
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${service.color} p-0.5 flex-shrink-0`}>
                      <div className="w-full h-full rounded-xl bg-white flex items-center justify-center">
                        <service.icon className="h-8 w-8 text-gray-700" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-normal text-foreground mb-2 group-hover:text-petrol-base transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {service.description}
                      </p>
                      <ul className="space-y-2">
                        {service.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-petrol-base mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-normal text-foreground mb-4">
              Choose Your Plan
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transparent pricing that scales with your business. Start with a 14-day free trial.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            {pricingOptions.map((plan) => (
              <Card 
                key={plan.id}
                className={`relative transition-all duration-300 ${
                  plan.popular 
                    ? 'shadow-2xl scale-105 border-petrol-500' 
                    : 'hover:shadow-xl hover:-translate-y-1'
                } ${selectedPlan === plan.id ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-[#2A7A8F] to-cyan-600 text-white px-4 py-1">
                      {plan.badge}
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-normal text-foreground">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                  <CardDescription className="text-base mt-2">
                    {plan.description}
                  </CardDescription>
                  {plan.savings && (
                    <p className="text-primary font-normal text-sm mt-2">{plan.savings}</p>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-petrol-base mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    size="lg" 
                    className={`w-full font-normal ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-[#2A7A8F] to-cyan-600 text-white' 
                        : 'border border-petrol-600 text-petrol-base hover:bg-petrol-50'
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.buttonText}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              All plans include 14-day free trial • No setup fees • Cancel anytime
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                <span>SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                <span>GDPR Compliant</span>
              </div>
              <div className="flex items-center gap-1">
                <Award className="h-4 w-4" />
                <span>Irish Owned</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-normal text-foreground mb-4">
              PayVAT vs Traditional Methods
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how PayVAT compares to doing VAT manually or using an accountant
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-lg shadow-lg">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border-b border-gray-200 px-6 py-4 text-left font-normal">Feature</th>
                  <th className="border-b border-gray-200 px-6 py-4 text-center font-normal">Manual Process</th>
                  <th className="border-b border-gray-200 px-6 py-4 text-center font-normal">Traditional Accountant</th>
                  <th className="border-b border-gray-200 px-6 py-4 text-center font-normal bg-blue-50">
                    <div className="flex items-center justify-center gap-2">
                      <BadgeCheck className="h-5 w-5 text-petrol-base" />
                      PayVAT
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    feature: "Time Required",
                    manual: "8-12 hours/month",
                    accountant: "2-4 hours/month",
                    payvat: "15 minutes/month"
                  },
                  {
                    feature: "Cost per Month",
                    manual: "Your time (€25-50/hour)",
                    accountant: "€200-500",
                    payvat: "€35/month or €350/year"
                  },
                  {
                    feature: "Error Rate",
                    manual: "High (5-15%)",
                    accountant: "Low (1-3%)",
                    payvat: "Minimal (<0.1%)"
                  },
                  {
                    feature: "Real-time Updates",
                    manual: "❌ Never",
                    accountant: "❌ Rarely",
                    payvat: "✅ Always"
                  },
                  {
                    feature: "Support Availability",
                    manual: "❌ None",
                    accountant: "⚠️ Business hours",
                    payvat: "✅ Expert guidance"
                  }
                ].map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border-b border-gray-200 px-6 py-4 font-normal">{row.feature}</td>
                    <td className="border-b border-gray-200 px-6 py-4 text-center text-gray-600">{row.manual}</td>
                    <td className="border-b border-gray-200 px-6 py-4 text-center text-gray-600">{row.accountant}</td>
                    <td className="border-b border-gray-200 px-6 py-4 text-center font-normal text-petrol-base bg-blue-50">{row.payvat}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-normal text-foreground mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join Irish businesses who save time and money with PayVAT
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <BadgeCheck key={i} className="h-5 w-5 text-[#8FD0FC]" />
                    ))}
                  </div>
                  <blockquote className="text-gray-700 mb-6">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-normal text-foreground">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                      <div className="text-sm font-normal text-petrol-base">{testimonial.company}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Saves</div>
                      <div className="font-normal text-green-600">{testimonial.savings}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#2A7A8F] to-cyan-600">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12">
            <Calculator className="h-16 w-16 text-white mx-auto mb-6" />
            <h2 className="text-3xl lg:text-4xl font-normal text-white mb-4">
              Ready to Simplify Your VAT?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join Irish businesses who trust PayVAT for their VAT compliance. 
              Start your free trial today - no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Button 
                size="lg" 
                className="bg-white text-petrol-base hover:bg-gray-100 font-normal px-8"
              >
                Start 14-Day Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10 font-normal px-8"
              >
                <Phone className="mr-2 h-5 w-5" />
                Book a Demo
              </Button>
            </div>
            <p className="text-white/80 text-sm">
              ✓ No setup fees  ✓ Cancel anytime  ✓ Expert guidance
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
