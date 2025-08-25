"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Building, Calculator, FileText, Shield, MapPin, Briefcase, HelpCircle, Settings, Home } from 'lucide-react'
import Footer from "@/components/footer"
import SiteHeader from "@/components/site-header"

export default function SitemapPage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  const sitePages = {
    core: {
      title: "Core Pages",
      icon: Home,
      pages: [
        { title: "Homepage", url: "/", description: "Main landing page" },
        { title: "About PayVat", url: "/about", description: "Learn about our company and mission" },
        { title: "Pricing", url: "/pricing", description: "Simple, transparent pricing for VAT services" },
        { title: "Login", url: "/login", description: "Access your PayVat account" },
        { title: "Sign Up", url: "/signup", description: "Create a new PayVat account" },
        { title: "Dashboard", url: "/dashboard", description: "Main user dashboard" },
        { title: "Search", url: "/search", description: "Search site content" },
      ]
    },
    businessSetup: {
      title: "Business Setup & Registration",
      icon: Building,
      pages: [
        { title: "Complete Business Setup Guide Ireland", url: "/complete-business-setup-guide-ireland", description: "Comprehensive guide to starting a business" },
        { title: "Business Setup Guide", url: "/business-setup-guide", description: "Essential business setup information" },
        { title: "Start a Business Ireland", url: "/start-a-business-ireland", description: "How to start your business in Ireland" },
        { title: "Company vs Sole Trader Ireland", url: "/company-vs-sole-trader-ireland", description: "Choose the right business structure" },
        { title: "Business Structure Comparison", url: "/business-structure-comparison", description: "Compare different business structures" },
        { title: "Register Business Name Ireland", url: "/register-business-name-ireland", description: "Guide to business name registration" },
        { title: "Start Online Business Ireland", url: "/start-online-business-ireland", description: "Launch your online business" },
        { title: "Start Restaurant Business Ireland", url: "/start-restaurant-business-ireland", description: "Restaurant business setup guide" },
        { title: "Start Retail Business Ireland", url: "/start-retail-business-ireland", description: "Retail business startup guide" },
        { title: "Start Service Business Ireland", url: "/start-service-business-ireland", description: "Service business setup guide" },
      ]
    },
    vatTax: {
      title: "VAT & Tax Services",
      icon: Calculator,
      pages: [
        { title: "VAT Guide", url: "/vat-guide", description: "Everything about VAT in Ireland" },
        { title: "VAT Services", url: "/vat-services", description: "Our VAT management services" },
        { title: "How to Register for VAT Ireland", url: "/how-to-register-for-vat-ireland", description: "VAT registration guide" },
        { title: "VAT Registration", url: "/vat-registration", description: "VAT registration process" },
        { title: "VAT Calculator Ireland", url: "/vat-calculator-ireland", description: "Calculate VAT for your business" },
        { title: "VAT Registration Checker", url: "/vat-registration-checker", description: "Check VAT registration requirements" },
        { title: "VAT Deadlines Ireland", url: "/vat-deadlines-ireland", description: "Important VAT filing deadlines" },
        { title: "VAT Submission", url: "/vat-submission", description: "Submit your VAT returns" },
        { title: "VAT Filing", url: "/vat-filing", description: "VAT filing information" },
        { title: "VAT Period", url: "/vat-period", description: "Understand VAT periods" },
        { title: "VAT3 Return", url: "/vat3-return", description: "File your VAT3 return" },
        { title: "Submit Return", url: "/submit-return", description: "Submit VAT returns" },
        { title: "Corporate Tax Ireland", url: "/corporate-tax-ireland", description: "Corporate tax guide" },
        { title: "Avoid Revenue Penalties Ireland", url: "/avoid-revenue-penalties-ireland", description: "Avoid tax penalties" },
        { title: "Revenue Audit Preparation", url: "/revenue-audit-preparation", description: "Prepare for Revenue audits" },
      ]
    },
    industrySpecific: {
      title: "Industry-Specific Guides",
      icon: Briefcase,
      pages: [
        { title: "Construction VAT Ireland", url: "/construction-vat-ireland", description: "VAT for construction businesses" },
        { title: "E-commerce VAT Ireland", url: "/ecommerce-vat-ireland", description: "VAT for online businesses" },
        { title: "Freelancer VAT Ireland", url: "/freelancer-vat-ireland", description: "VAT for freelancers" },
        { title: "Property Rental VAT Ireland", url: "/property-rental-vat-ireland", description: "VAT for rental properties" },
        { title: "Digital Services VAT Ireland", url: "/digital-services-vat-ireland", description: "VAT for digital services" },
      ]
    },
    locationSpecific: {
      title: "Location-Specific Services",
      icon: MapPin,
      pages: [
        { title: "Dublin Business Registration", url: "/dublin-business-registration", description: "Business setup in Dublin" },
        { title: "Cork Business Registration", url: "/cork-business-registration", description: "Business setup in Cork" },
        { title: "Galway Business Registration", url: "/galway-business-registration", description: "Business setup in Galway" },
      ]
    },
    toolsServices: {
      title: "Tools & Additional Services",
      icon: Settings,
      pages: [
        { title: "Reports", url: "/reports", description: "Business reporting tools" },
        { title: "Expense Tracker Ireland", url: "/expense-tracker-ireland", description: "Track business expenses" },
        { title: "Payroll Setup Ireland", url: "/payroll-setup-ireland", description: "Set up payroll system" },
        { title: "Accountant Fees vs PayVat Savings", url: "/accountant-fees-vs-payvat-savings", description: "Compare costs" },
        { title: "Brexit Trading Rules", url: "/brexit-trading-rules", description: "Post-Brexit trading information" },
        { title: "Confirmation Payment", url: "/confirmation-payment", description: "Payment confirmation" },
      ]
    },
    legalSupport: {
      title: "Legal & Support",
      icon: HelpCircle,
      pages: [
        { title: "FAQ", url: "/faq", description: "Frequently asked questions" },
        { title: "Privacy Policy", url: "/privacy", description: "Our privacy policy" },
        { title: "Terms of Service", url: "/terms", description: "Terms and conditions" },
        { title: "Sitemap", url: "/sitemap", description: "This page - complete site navigation" },
      ]
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader 
        searchPlaceholder="Search sitemap..."
        currentPage="Sitemap"
        pageSubtitle="Complete site navigation"
      />


      {/* Sitemap Content */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {Object.entries(sitePages).map(([key, section], index) => {
              const IconComponent = section.icon
              return (
                <Card key={key} className="card-modern hover-lift" data-animate>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl font-normal text-foreground">
                      <div className="icon-modern bg-primary">
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {section.pages.map((page, pageIndex) => (
                        <Link
                          key={pageIndex}
                          href={page.url}
                          className="group flex items-start gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors"
                        >
                          <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-normal text-foreground group-hover:text-primary transition-colors">
                              {page.title}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {page.description}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-normal text-primary mb-2">70+</div>
              <div className="text-muted-foreground">Total Pages</div>
            </div>
            <div>
              <div className="text-3xl font-normal text-primary mb-2">7</div>
              <div className="text-muted-foreground">Main Categories</div>
            </div>
            <div>
              <div className="text-3xl font-normal text-primary mb-2">100%</div>
              <div className="text-muted-foreground">Coverage</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
