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
      title: "Paid Beta Pages",
      icon: Home,
      pages: [
        { title: "Homepage", url: "/", description: "PayVAT paid beta overview" },
        { title: "Pricing", url: "/pricing", description: "Paid beta access and scope" },
        { title: "Login", url: "/login", description: "Access your PayVAT workspace" },
        { title: "Sign Up", url: "/signup", description: "Create a paid beta account" },
        { title: "Contact", url: "/contact", description: "Reach the PayVAT team" },
      ]
    },
    workflow: {
      title: "Core Workflow",
      icon: Calculator,
      pages: [
        { title: "Documents", url: "/dashboard/documents", description: "Upload, review, and correct VAT documents" },
        { title: "VAT Returns", url: "/dashboard/vat-returns", description: "Review current draft and return history" },
        { title: "VAT Submission", url: "/vat-submission", description: "Record guided submission and export artifacts" },
        { title: "Payments", url: "/dashboard/payments", description: "Track payment state after submission" },
      ]
    },
    support: {
      title: "Support and Limitations",
      icon: HelpCircle,
      pages: [
        { title: "How PayVAT Works Today", url: "/beta-limitations", description: "Paid beta limitations and ROS boundary" },
        { title: "Privacy Policy", url: "/privacy", description: "How we handle your data" },
        { title: "Terms of Service", url: "/terms", description: "Service terms for paid beta use" },
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
              <div className="text-3xl font-normal text-primary mb-2">12</div>
              <div className="text-muted-foreground">Total Pages</div>
            </div>
            <div>
              <div className="text-3xl font-normal text-primary mb-2">3</div>
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
