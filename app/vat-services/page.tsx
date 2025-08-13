"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Calculator, Shield, Clock, TrendingUp, Zap, 
  CheckCircle, ArrowRight, Star, Users, Award,
  FileText, BanknoteIcon, AlertCircle, Phone,
  Mail, Calendar, Download, Globe, Building2,
  Briefcase, Target, Sparkles, Euro, Receipt,
  BarChart3, PieChart, LineChart, DollarSign,
  Smartphone, Laptop, Tablet, HelpCircle
} from 'lucide-react'
import { useState } from 'react'
import Footer from "@/components/footer"
import SiteHeader from "@/components/site-header"

export default function VATServicesPage() {
  const [selectedPlan, setSelectedPlan] = useState<string>("professional")
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
      color: "from-blue-500 to-cyan-600"
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
      color: "from-teal-500 to-green-600"
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
      color: "from-purple-500 to-indigo-600"
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
      color: "from-teal-500 to-cyan-600"
    }
  ]

  const pricingPlans = [
    {
      id: "starter",
      name: "Starter",
      price: "€29",
      period: "/month",
      description: "Perfect for small businesses and sole traders",
      features: [
        "VAT calculations",
        "Basic reporting",
        "Email support",
        "Up to 50 transactions/month",
        "Mobile app access"
      ],
      badge: null,
      buttonText: "Start Free Trial",
      popular: false
    },
    {
      id: "professional",
      name: "Professional",
      price: "€79",
      period: "/month",
      description: "Ideal for growing businesses with regular VAT obligations",
      features: [
        "Everything in Starter",
        "VAT submissions",
        "Payment processing",
        "Priority support",
        "Up to 500 transactions/month",
        "API access",
        "Custom reporting"
      ],
      badge: "Most Popular",
      buttonText: "Start Free Trial",
      popular: true
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "€199",
      period: "/month",
      description: "For large businesses with complex VAT requirements",
      features: [
        "Everything in Professional",
        "Unlimited transactions",
        "Dedicated account manager",
        "Custom integrations",
        "Advanced analytics",
        "Multi-entity support",
        "Expert guidance when you need it"
      ],
      badge: "Premium",
      buttonText: "Contact Sales",
      popular: false
    }
  ]

  const testimonials = [
    {
      name: "Sarah Mitchell",
      company: "Mitchell Digital Agency",
      role: "Finance Director",
      quote: "PayVAT saved us 15 hours per month on VAT processing. The automation is incredible and the support team is always helpful.",
      rating: 5,
      savings: "€2,400/year"
    },
    {
      name: "James O'Connor",
      company: "O'Connor Construction",
      role: "Managing Director", 
      quote: "Since switching to PayVAT, we've never missed a VAT deadline. The peace of mind is worth every penny.",
      rating: 5,
      savings: "€1,800/year"
    },
    {
      name: "Maria Santos",
      company: "Santos Consulting",
      role: "Founder",
      quote: "The VAT calculator alone pays for the subscription. Everything else is a bonus. Highly recommend to any Irish business.",
      rating: 5,
      savings: "€3,200/year"
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

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden bg-gradient-to-br from-teal-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <div className="max-w-4xl mx-auto animate-fade-in">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 text-teal-800 text-sm font-medium mb-6">
                <Building2 className="w-4 h-4" />
                For Established Businesses
                <Award className="w-4 h-4 fill-teal-600" />
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Simplify Your VAT
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600 mt-2">
                  Save Time & Money
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
                Automate your VAT calculations, submissions, and payments with Ireland's most trusted VAT compliance platform. 
                Focus on growing your business while we handle the paperwork.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <Button size="lg" className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-8 py-4 text-lg font-semibold hover:shadow-xl">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" className="border-teal-600 text-teal-600 hover:bg-teal-50 px-8 py-4 text-lg">
                  <Calculator className="mr-2 h-5 w-5" />
                  Try VAT Calculator
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 p-0.5 mx-auto mb-2">
                      <div className="w-full h-full rounded-lg bg-white flex items-center justify-center">
                        <stat.icon className="h-6 w-6 text-teal-600" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stat.number}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-20 right-10 w-24 h-24 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-full blur-3xl opacity-20 animate-float"></div>
          <div className="absolute bottom-20 left-10 w-32 h-32 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-full blur-3xl opacity-20 animate-float" style={{animationDelay: '-2s'}}></div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
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
                      <h3 className="text-2xl font-bold text-foreground mb-2 group-hover:text-teal-600 transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {service.description}
                      </p>
                      <ul className="space-y-2">
                        {service.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
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
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Choose Your Plan
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transparent pricing that scales with your business. Start with a 14-day free trial.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {pricingPlans.map((plan) => (
              <Card 
                key={plan.id}
                className={`relative transition-all duration-300 ${
                  plan.popular 
                    ? 'shadow-2xl scale-105 border-teal-500' 
                    : 'hover:shadow-xl hover:-translate-y-1'
                } ${selectedPlan === plan.id ? 'ring-2 ring-teal-500' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-4 py-1">
                      {plan.badge}
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                  <CardDescription className="text-base mt-2">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    size="lg" 
                    className={`w-full font-semibold ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white' 
                        : 'border border-teal-600 text-teal-600 hover:bg-teal-50'
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.buttonText}
                    {plan.id !== "enterprise" && <ArrowRight className="ml-2 h-4 w-4" />}
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
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
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
                  <th className="border-b border-gray-200 px-6 py-4 text-left font-semibold">Feature</th>
                  <th className="border-b border-gray-200 px-6 py-4 text-center font-semibold">Manual Process</th>
                  <th className="border-b border-gray-200 px-6 py-4 text-center font-semibold">Traditional Accountant</th>
                  <th className="border-b border-gray-200 px-6 py-4 text-center font-semibold bg-teal-50">
                    <div className="flex items-center justify-center gap-2">
                      <Sparkles className="h-5 w-5 text-teal-600" />
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
                    payvat: "€29-199"
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
                    <td className="border-b border-gray-200 px-6 py-4 font-medium">{row.feature}</td>
                    <td className="border-b border-gray-200 px-6 py-4 text-center text-gray-600">{row.manual}</td>
                    <td className="border-b border-gray-200 px-6 py-4 text-center text-gray-600">{row.accountant}</td>
                    <td className="border-b border-gray-200 px-6 py-4 text-center font-semibold text-teal-600 bg-teal-50">{row.payvat}</td>
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
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of Irish businesses saving time and money with PayVAT
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <blockquote className="text-gray-700 mb-6">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-foreground">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                      <div className="text-sm font-medium text-teal-600">{testimonial.company}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Saves</div>
                      <div className="font-bold text-green-600">{testimonial.savings}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-teal-600 to-cyan-600">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12">
            <Calculator className="h-16 w-16 text-white mx-auto mb-6" />
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready to Simplify Your VAT?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join over 15,000 Irish businesses who trust PayVAT for their VAT compliance. 
              Start your free trial today - no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Button 
                size="lg" 
                className="bg-white text-teal-600 hover:bg-gray-100 font-semibold px-8"
              >
                Start 14-Day Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white/10 font-semibold px-8"
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