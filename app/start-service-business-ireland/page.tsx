'use client'

import { useState, useEffect } from 'react'
import SiteHeader from '../../components/site-header'
import Footer from '../../components/footer'

export default function StartServiceBusinessIreland() {
  const [currentSection, setCurrentSection] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    const handleScroll = () => {
      const sections = document.querySelectorAll('.scroll-section')
      const scrollPos = window.scrollY + 100
      
      sections.forEach((section, index) => {
        const element = section as HTMLElement
        if (scrollPos >= element.offsetTop && scrollPos < element.offsetTop + element.offsetHeight) {
          setCurrentSection(index)
        }
      })
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        {/* Hero Section */}
        <section className={`relative py-20 px-4 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 bg-green-50 rounded-full text-green-700 text-sm font-medium mb-6 animate-pulse">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Service Business Setup Guide
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Start a Service Business in 
              <span className="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                Ireland (2025)
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Complete guide to launching your service business in Ireland. From professional qualifications and VAT compliance to client acquisition and scaling strategies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/signup" 
                className="btn-primary px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                Start Your Service Business
              </a>
              <a 
                href="#service-checklist" 
                className="px-8 py-4 text-lg font-semibold text-green-600 border-2 border-green-200 rounded-xl hover:bg-green-50 transition-all duration-300"
              >
                View Setup Checklist
              </a>
            </div>
          </div>
        </section>

        {/* Service Business Types */}
        <section className="scroll-section py-16 px-4" id="service-types">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Types of Service Businesses in Ireland
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Service businesses have lower startup costs but specific professional requirements and VAT obligations.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="card-modern p-8 text-center hover:shadow-xl transition-all duration-300 group">
                <div className="icon-modern w-16 h-16 mx-auto mb-6 bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Professional Services</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Accounting, legal, consulting, architecture. Requires professional qualifications and indemnity insurance.
                </p>
                <div className="text-sm text-gray-500">
                  VAT: €42,500 threshold | Professional regulation
                </div>
              </div>
              
              <div className="card-modern p-8 text-center hover:shadow-xl transition-all duration-300 group">
                <div className="icon-modern w-16 h-16 mx-auto mb-6 bg-green-100 text-green-600 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Technical Services</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  IT support, web development, digital marketing, engineering. Skills-based with project billing.
                </p>
                <div className="text-sm text-gray-500">
                  VAT: €42,500 threshold | Contract-based work
                </div>
              </div>
              
              <div className="card-modern p-8 text-center hover:shadow-xl transition-all duration-300 group">
                <div className="icon-modern w-16 h-16 mx-auto mb-6 bg-orange-100 text-orange-600 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Personal Services</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Health, fitness, beauty, education, cleaning. Often requires certifications and premises licenses.
                </p>
                <div className="text-sm text-gray-500">
                  VAT: €42,500 threshold | Health & safety compliance
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Service Business Setup Checklist */}
        <section className="scroll-section py-16 px-4 bg-gray-50" id="service-checklist">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Service Business Setup Checklist (2025)
              </h2>
              <p className="text-lg text-gray-600">
                Complete step-by-step checklist for launching your service business in Ireland.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="card-premium p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Phase 1: Foundation & Qualifications (Weeks 1-3)</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Business Structure Selection</h4>
                      <p className="text-gray-600">Sole trader for simple services, limited company for growth and liability protection</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Professional Qualifications</h4>
                      <p className="text-gray-600">Verify required certifications, professional body membership, continuing education requirements</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">VAT Registration Decision</h4>
                      <p className="text-gray-600">Consider early registration for credibility and to reclaim setup costs (typically €2,000-8,000)</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card-premium p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Phase 2: Legal & Compliance (Weeks 2-4)</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">VAT Registration & Compliance</h4>
                      <p className="text-gray-600">Essential for service credibility. Early registration enables cost recovery and professional standing</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Terms of Service & Contracts</h4>
                      <p className="text-gray-600">Professional service agreements, liability limitations, payment terms, intellectual property clauses</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Data Protection Compliance</h4>
                      <p className="text-gray-600">GDPR compliance for client data, DPC registration if processing personal data (€35/year)</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card-premium p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Phase 3: Operations & Systems (Weeks 3-6)</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Business Banking & Finance</h4>
                      <p className="text-gray-600">Professional business account, payment processing for invoices, expense tracking systems</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Invoicing & Time Tracking</h4>
                      <p className="text-gray-600">Professional invoicing software with VAT compliance, time tracking for billable hours</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Workspace Setup</h4>
                      <p className="text-gray-600">Home office, co-working space, or professional premises. Consider client meeting requirements</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card-premium p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Phase 4: Marketing & Client Acquisition (Weeks 4-8)</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Professional Website & Portfolio</h4>
                      <p className="text-gray-600">Showcase expertise, case studies, testimonials, clear service descriptions and pricing</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Network & Referral System</h4>
                      <p className="text-gray-600">Professional associations, local business networks, referral partnerships, LinkedIn presence</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Content Marketing Strategy</h4>
                      <p className="text-gray-600">Blog, social media, speaking engagements, thought leadership to demonstrate expertise</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Service Business VAT Guide */}
        <section className="scroll-section py-16 px-4" id="service-vat">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Service Business VAT in Ireland
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Service businesses have a lower VAT threshold but complex cross-border and B2B rules to navigate.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="card-modern p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Service VAT Thresholds & Rates</h3>
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">VAT Registration Threshold</h4>
                    <div className="text-2xl font-bold text-green-700">€42,500</div>
                    <p className="text-green-800 text-sm">Annual turnover threshold for services (vs €85,000 for goods)</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Standard VAT Rate</h4>
                    <div className="text-2xl font-bold text-blue-700">23%</div>
                    <p className="text-blue-800 text-sm">Most professional and technical services</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">Exempt Services</h4>
                    <div className="text-2xl font-bold text-purple-700">0%</div>
                    <p className="text-purple-800 text-sm">Financial, insurance, medical, education services</p>
                  </div>
                </div>
              </div>
              
              <div className="card-modern p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Cross-Border Service Rules</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-gray-900">B2B Services</h4>
                      <p className="text-gray-600 text-sm">Reverse charge: Customer pays VAT in their country (with valid VAT number)</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-gray-900">B2C Services</h4>
                      <p className="text-gray-600 text-sm">Place of supply rules: Often where customer is located (complex rules apply)</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Digital Services</h4>
                      <p className="text-gray-600 text-sm">EU Mini One Stop Shop (MOSS) registration for digital services to consumers</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Property Services</h4>
                      <p className="text-gray-600 text-sm">VAT charged where property is located (not customer location)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card-premium p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Automate Service Business VAT Compliance
              </h3>
              <p className="text-lg text-gray-600 mb-6 max-w-3xl mx-auto">
                PayVat handles complex service VAT rules automatically. B2B reverse charge validation, place of supply calculations, cross-border compliance, and professional invoicing.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/signup" 
                  className="btn-primary px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105"
                >
                  Start Service Business VAT
                </a>
                <a 
                  href="/pricing" 
                  className="px-8 py-4 text-lg font-semibold text-green-600 border-2 border-green-200 rounded-xl hover:bg-green-50 transition-all duration-300"
                >
                  View Service Business Plans
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Service Business Costs */}
        <section className="scroll-section py-16 px-4 bg-gray-50" id="service-costs">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Service Business Startup Costs Ireland (2025)
              </h2>
              <p className="text-lg text-gray-600">
                Service businesses have the lowest startup costs of all business types in Ireland.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="card-modern p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Sole Trader Service</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700 text-sm">Business Registration</span>
                    <span className="font-semibold text-sm">€0</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700 text-sm">VAT Compliance Setup</span>
                    <span className="font-semibold text-sm">€500</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700 text-sm">Basic Website</span>
                    <span className="font-semibold text-sm">€800</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700 text-sm">Equipment & Software</span>
                    <span className="font-semibold text-sm">€1,500</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700 text-sm">Marketing Budget</span>
                    <span className="font-semibold text-sm">€500</span>
                  </div>
                  <div className="flex justify-between items-center font-bold pt-2">
                    <span className="text-gray-900">Total</span>
                    <span className="text-green-600">€3,300</span>
                  </div>
                </div>
              </div>
              
              <div className="card-modern p-6 border-2 border-green-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Limited Company</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700 text-sm">Company Registration</span>
                    <span className="font-semibold text-sm">€200</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700 text-sm">VAT Compliance Setup</span>
                    <span className="font-semibold text-sm">€1,200</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700 text-sm">Professional Website</span>
                    <span className="font-semibold text-sm">€3,000</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700 text-sm">Equipment & Software</span>
                    <span className="font-semibold text-sm">€3,000</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700 text-sm">Marketing & Branding</span>
                    <span className="font-semibold text-sm">€2,000</span>
                  </div>
                  <div className="flex justify-between items-center font-bold pt-2">
                    <span className="text-gray-900">Total</span>
                    <span className="text-green-600">€9,400</span>
                  </div>
                </div>
              </div>
              
              <div className="card-modern p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Professional Practice</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700 text-sm">Company Registration</span>
                    <span className="font-semibold text-sm">€200</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700 text-sm">Professional Setup</span>
                    <span className="font-semibold text-sm">€5,000</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700 text-sm">Office Setup</span>
                    <span className="font-semibold text-sm">€8,000</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700 text-sm">Equipment & Software</span>
                    <span className="font-semibold text-sm">€6,000</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700 text-sm">Marketing & Launch</span>
                    <span className="font-semibold text-sm">€5,000</span>
                  </div>
                  <div className="flex justify-between items-center font-bold pt-2">
                    <span className="text-gray-900">Total</span>
                    <span className="text-green-600">€24,200</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card-premium p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Monthly Operating Costs
              </h3>
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div>
                  <div className="text-sm text-gray-600">VAT Compliance</div>
                  <div className="text-lg font-bold text-gray-900">€50-400</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Software/Tools</div>
                  <div className="text-lg font-bold text-gray-900">€100-500</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Marketing</div>
                  <div className="text-lg font-bold text-gray-900">€200-2,000</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Office/Travel</div>
                  <div className="text-lg font-bold text-gray-900">€300-1,500</div>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Service businesses scale primarily through time and expertise, not inventory or equipment.
              </p>
              <a 
                href="/signup" 
                className="btn-primary px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105"
              >
                Get Your Service Business Setup Plan
              </a>
            </div>
          </div>
        </section>

        {/* Service Business Success Tips */}
        <section className="scroll-section py-16 px-4" id="service-success">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Service Business Success Strategies
              </h2>
              <p className="text-lg text-gray-600">
                Proven strategies to build a profitable service business in Ireland's competitive market.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="card-modern p-8 border-l-4 border-green-500">
                <h3 className="text-xl font-bold text-green-600 mb-3">Strategy: Specialise and Premium Pricing</h3>
                <p className="text-gray-700 mb-4">
                  Focus on a specific niche where you can command premium rates. Deep expertise in a narrow field beats generalist approaches.
                </p>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-green-800 font-semibold">Result: 2-5x higher hourly rates than generalist competitors</p>
                </div>
              </div>
              
              <div className="card-modern p-8 border-l-4 border-blue-500">
                <h3 className="text-xl font-bold text-blue-600 mb-3">Strategy: Value-Based Pricing Over Hourly</h3>
                <p className="text-gray-700 mb-4">
                  Price based on client outcomes and value delivered, not time spent. Package services into fixed-price offerings.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-800 font-semibold">Impact: 40-60% higher profit margins and predictable revenue</p>
                </div>
              </div>
              
              <div className="card-modern p-8 border-l-4 border-purple-500">
                <h3 className="text-xl font-bold text-purple-600 mb-3">Strategy: Build Recurring Revenue Streams</h3>
                <p className="text-gray-700 mb-4">
                  Develop ongoing service relationships: monthly retainers, maintenance contracts, subscription models.
                </p>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-purple-800 font-semibold">Benefit: Predictable cash flow and 3x higher business valuation</p>
                </div>
              </div>
              
              <div className="card-modern p-8 border-l-4 border-orange-500">
                <h3 className="text-xl font-bold text-orange-600 mb-3">Strategy: Systematise and Scale</h3>
                <p className="text-gray-700 mb-4">
                  Document processes, create templates, build systems that allow you to deliver consistent quality without working more hours.
                </p>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-orange-800 font-semibold">Growth: Enables hiring team members and geographic expansion</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="scroll-section py-20 px-4 bg-gradient-to-r from-green-600 to-teal-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Launch Your Service Business in Ireland?
            </h2>
            <p className="text-xl mb-8 text-green-100">
              Get your complete service business setup with automated VAT compliance and professional invoicing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/signup" 
                className="bg-white text-green-600 px-8 py-4 text-lg font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-105"
              >
                Start Service Business Setup
              </a>
              <a 
                href="/pricing" 
                className="border-2 border-white px-8 py-4 text-lg font-semibold rounded-xl hover:bg-white hover:text-green-600 transition-all duration-300"
              >
                View Service Business Plans
              </a>
            </div>
            <p className="text-sm text-green-200 mt-6">
              Join 3,400+ Irish service businesses using PayVat for seamless compliance
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}