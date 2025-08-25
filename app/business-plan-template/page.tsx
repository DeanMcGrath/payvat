"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  FileText, Download, Building2, TrendingUp, Euro, Users, 
  Target, BarChart3, Calendar, CheckCircle, ArrowRight,
  Lightbulb, Shield, Globe, Briefcase, PieChart, Calculator
} from 'lucide-react'
import Footer from "@/components/footer"
import SiteHeader from "@/components/site-header"

export default function BusinessPlanTemplatePage() {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [completedSections, setCompletedSections] = useState<string[]>([])

  const toggleSection = (sectionId: string) => {
    setCompletedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const templateSections = [
    {
      id: "executive-summary",
      title: "Executive Summary",
      icon: FileText,
      description: "Overview of your business concept and key success factors",
      content: {
        overview: "A concise overview of your business, its mission, and value proposition",
        keyPoints: [
          "Business name and legal structure",
          "Products/services offered",
          "Target market and competitive advantage",
          "Financial highlights and funding requirements",
          "Growth projections for next 3-5 years"
        ],
        irishConsiderations: [
          "CRO registration requirements",
          "VAT registration thresholds",
          "Revenue compliance obligations"
        ]
      }
    },
    {
      id: "company-description",
      title: "Company Description",
      icon: Building2,
      description: "Detailed description of your business and its structure",
      content: {
        overview: "Comprehensive description of your business, its history, and organizational structure",
        keyPoints: [
          "Company history and ownership",
          "Legal structure (Sole Trader, Limited Company, Partnership)",
          "Location and facilities",
          "Mission statement and company values",
          "Key personnel and their qualifications"
        ],
        irishConsiderations: [
          "Companies Registration Office (CRO) requirements",
          "Directors' duties under Irish company law",
          "Registered office requirements"
        ]
      }
    },
    {
      id: "market-analysis",
      title: "Market Analysis",
      icon: TrendingUp,
      description: "Research and analysis of your target market and competition",
      content: {
        overview: "Thorough analysis of your market, customers, and competitive landscape",
        keyPoints: [
          "Industry overview and trends",
          "Target market size and demographics",
          "Customer needs and buying behavior",
          "Competitive analysis and positioning",
          "Market share projections"
        ],
        irishConsiderations: [
          "Irish market size and characteristics",
          "Local competition and pricing",
          "Regulatory environment in Ireland"
        ]
      }
    },
    {
      id: "organization-management",
      title: "Organization & Management",
      icon: Users,
      description: "Your business structure and management team",
      content: {
        overview: "Organizational structure and key management personnel",
        keyPoints: [
          "Organizational chart",
          "Management team profiles",
          "Advisory board members",
          "Personnel plan and hiring strategy",
          "Compensation structure"
        ],
        irishConsiderations: [
          "Employment law compliance",
          "PAYE/PRSI obligations",
          "Health and safety requirements"
        ]
      }
    },
    {
      id: "marketing-sales",
      title: "Marketing & Sales Strategy",
      icon: Target,
      description: "How you'll attract and retain customers",
      content: {
        overview: "Comprehensive marketing and sales strategy to reach your target market",
        keyPoints: [
          "Marketing mix (Product, Price, Place, Promotion)",
          "Sales strategy and process",
          "Customer acquisition plan",
          "Brand positioning and messaging",
          "Digital marketing strategy"
        ],
        irishConsiderations: [
          "Irish consumer preferences",
          "Local marketing channels",
          "Data protection (GDPR) compliance"
        ]
      }
    },
    {
      id: "financial-projections",
      title: "Financial Projections",
      icon: Euro,
      description: "Financial forecasts and funding requirements",
      content: {
        overview: "Detailed financial projections and funding requirements",
        keyPoints: [
          "Income statements (3-5 years)",
          "Cash flow projections",
          "Balance sheet forecasts",
          "Break-even analysis",
          "Funding requirements and sources"
        ],
        irishConsiderations: [
          "Irish tax rates and allowances",
          "Corporation tax at 12.5%",
          "VAT implications and cash flow impact"
        ]
      }
    }
  ]

  const downloadableResources = [
    {
      title: "Executive Summary Template",
      description: "One-page executive summary template",
      icon: FileText,
      format: "DOCX"
    },
    {
      title: "Financial Projections Spreadsheet",
      description: "Excel template with Irish tax rates",
      icon: Calculator,
      format: "XLSX"
    },
    {
      title: "Market Research Guide",
      description: "How to research the Irish market",
      icon: BarChart3,
      format: "PDF"
    },
    {
      title: "Complete Business Plan Template",
      description: "Full template with all sections",
      icon: Briefcase,
      format: "DOCX"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader 
        searchPlaceholder="Search business templates..."
        currentPage="Business Plan Template"
        pageSubtitle="Professional template for Irish businesses"
      />

      {/* Hero Section */}
      <section className="section-after-header relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-normal text-gray-900 mb-6">
              Irish Business Plan Template
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Create a professional business plan tailored for Irish businesses. Includes CRO requirements, 
              VAT considerations, and Irish market analysis templates.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-[#2A7A8F] to-[#216477] text-white">
                <Download className="mr-2 h-5 w-5" />
                Download Complete Template
              </Button>
              <Button variant="outline" size="lg" className="text-[#2A7A8F] border-[#2A7A8F]">
                <Lightbulb className="mr-2 h-5 w-5" />
                Get Professional Help
              </Button>
            </div>
          </div>

          {/* Progress Tracker */}
          <Card className="shadow-xl border-2 border-petrol-100 mb-8">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Target className="h-6 w-6 text-[#2A7A8F]" />
                Your Progress
              </CardTitle>
              <CardDescription>
                Complete each section - {completedSections.length} of {templateSections.length} sections completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {templateSections.map((section) => (
                  <div
                    key={section.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                      completedSections.includes(section.id)
                        ? 'bg-blue-50 border-petrol-200 text-petrol-dark'
                        : 'bg-gray-50 border-gray-200 hover:border-petrol-300'
                    }`}
                    onClick={() => toggleSection(section.id)}
                  >
                    {completedSections.includes(section.id) ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <section.icon className="h-4 w-4" />
                    )}
                    <span className="text-sm font-normal">{section.title}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Template Sections */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="space-y-8">
            {templateSections.map((section, index) => (
              <Card 
                key={section.id}
                className={`overflow-hidden transition-all duration-300 ${
                  activeSection === section.id ? 'shadow-2xl scale-[1.02]' : 'shadow-lg hover:shadow-xl'
                } ${completedSections.includes(section.id) ? 'border-petrol-200' : ''}`}
              >
                <CardHeader 
                  className="cursor-pointer"
                  onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#8FD0FC] to-[#216477] p-0.5">
                        <div className="w-full h-full rounded-xl bg-white flex items-center justify-center">
                          <section.icon className="h-8 w-8 text-[#2A7A8F]" />
                        </div>
                      </div>
                      <div>
                        <CardTitle className="text-2xl flex items-center gap-2">
                          {index + 1}. {section.title}
                          {completedSections.includes(section.id) && (
                            <CheckCircle className="h-5 w-5 text-[#2A7A8F]" />
                          )}
                        </CardTitle>
                        <CardDescription className="text-base mt-1">
                          {section.description}
                        </CardDescription>
                      </div>
                    </div>
                    <ArrowRight className={`h-6 w-6 text-gray-400 transition-transform ${
                      activeSection === section.id ? 'rotate-90' : ''
                    }`} />
                  </div>
                </CardHeader>
                
                {activeSection === section.id && (
                  <CardContent className="animate-slide-down">
                    <div className="grid gap-6 lg:grid-cols-2">
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-normal text-lg mb-3 text-gray-900">Overview</h4>
                          <p className="text-gray-600">{section.content.overview}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-normal text-lg mb-3 text-gray-900">Key Elements to Include</h4>
                          <ul className="space-y-2">
                            {section.content.keyPoints.map((point, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-[#2A7A8F] mt-0.5 flex-shrink-0" />
                                <span className="text-gray-600">{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 p-6 rounded-lg">
                        <h4 className="font-normal text-lg mb-3 text-blue-900 flex items-center gap-2">
                          <Shield className="h-5 w-5" />
                          Irish Business Considerations
                        </h4>
                        <ul className="space-y-2">
                          {section.content.irishConsiderations.map((consideration, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <div className="w-2 h-2 bg-petrol-light rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-petrol-dark">{consideration}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex items-center justify-between">
                      <Button
                        variant={completedSections.includes(section.id) ? "outline" : "default"}
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleSection(section.id)
                        }}
                        className={completedSections.includes(section.id) 
                          ? "border-[#8FD0FC] text-[#216477] hover:bg-petrol-50" 
                          : "bg-gradient-to-r from-[#2A7A8F] to-[#216477] text-white"}
                      >
                        {completedSections.includes(section.id) ? (
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
                      
                      <Button variant="outline" className="text-[#2A7A8F] border-[#2A7A8F]">
                        <Download className="mr-2 h-4 w-4" />
                        Download Section Template
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Downloadable Resources */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-normal text-gray-900 mb-4">
              Downloadable Templates
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Ready-to-use templates formatted for Irish businesses
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {downloadableResources.map((resource, index) => (
              <Card key={index} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#8FD0FC] to-[#216477] p-0.5 mb-4 mx-auto">
                    <div className="w-full h-full rounded-lg bg-white flex items-center justify-center">
                      <resource.icon className="h-8 w-8 text-[#2A7A8F]" />
                    </div>
                  </div>
                  <h3 className="font-normal text-lg mb-2">{resource.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{resource.description}</p>
                  <div className="mb-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-petrol-dark">
                      {resource.format}
                    </span>
                  </div>
                  <Button variant="outline" className="w-full text-[#2A7A8F] border-[#2A7A8F] hover:bg-petrol-50">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Professional Help CTA */}
      <section className="py-20 bg-[#2A7A8F] text-white">
        <div className="max-w-4xl mx-auto text-center px-6 lg:px-8">
          <h2 className="text-4xl font-normal mb-6">
            Need Professional Business Plan Writing?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Our business advisors can help you create a comprehensive business plan tailored for Irish market conditions and investor requirements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-[#2A7A8F] hover:bg-gray-50">
              <Calendar className="mr-2 h-5 w-5" />
              Book Consultation
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#2A7A8F]">
              <Globe className="mr-2 h-5 w-5" />
              View Pricing
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}