'use client'

import { useState, useEffect } from 'react'
import SiteHeader from '../../components/site-header'
import Footer from '../../components/footer'

export default function StartRetailBusinessIreland() {
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
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full text-blue-700 text-sm font-medium mb-6 animate-pulse">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Retail Business Setup Guide
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Start a Retail Business in 
              <span className="bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent">
                Ireland (2025)
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Complete guide to launching your retail store in Ireland. From shop licensing and VAT compliance to inventory management and customer acquisition.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/signup" 
                className="btn-primary px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                Start Your Retail Setup
              </a>
              <a 
                href="#retail-checklist" 
                className="px-8 py-4 text-lg font-semibold text-blue-600 border-2 border-blue-200 rounded-xl hover:bg-blue-50 transition-all duration-300"
              >
                View Setup Checklist
              </a>
            </div>
          </div>
        </section>

        {/* Retail Business Types */}
        <section className="scroll-section py-16 px-4" id="retail-types">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Types of Retail Businesses in Ireland
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Different retail formats have varying setup requirements, costs, and VAT obligations.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="card-modern p-8 text-center hover:shadow-xl transition-all duration-300 group">
                <div className="icon-modern w-16 h-16 mx-auto mb-6 bg-green-100 text-green-600 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H7m2 0v-4a2 2 0 012-2h2a2 2 0 012 2v4M7 7h10M7 11h10" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Physical Shop</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Traditional brick-and-mortar store with walk-in customers. Requires premises license and planning permission.
                </p>
                <div className="text-sm text-gray-500">
                  Setup: €15,000-75,000 | VAT: €85,000 threshold
                </div>
              </div>
              
              <div className="card-modern p-8 text-center hover:shadow-xl transition-all duration-300 group">
                <div className="icon-modern w-16 h-16 mx-auto mb-6 bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Online Store</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  E-commerce business selling products online. Lower startup costs but complex EU VAT rules for cross-border sales.
                </p>
                <div className="text-sm text-gray-500">
                  Setup: €3,000-25,000 | VAT: €85,000 threshold
                </div>
              </div>
              
              <div className="card-modern p-8 text-center hover:shadow-xl transition-all duration-300 group">
                <div className="icon-modern w-16 h-16 mx-auto mb-6 bg-teal-100 text-teal-600 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 0v1m-2 0V5.5A2.5 2.5 0 109.5 8v.5m3 0V9a2 2 0 012 0 2 2 0 012 2v1a2 2 0 01-2 2 2 2 0 01-2-2" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Market Stall</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Temporary or permanent market trading. Requires casual trading license and market authority permits.
                </p>
                <div className="text-sm text-gray-500">
                  Setup: €500-5,000 | VAT: €85,000 threshold
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Retail Setup Checklist */}
        <section className="scroll-section py-16 px-4 bg-gray-50" id="retail-checklist">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Retail Business Setup Checklist (2025)
              </h2>
              <p className="text-lg text-gray-600">
                Complete step-by-step checklist for opening your retail business in Ireland.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="card-premium p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Phase 1: Business Foundation (Weeks 1-4)</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Business Structure Selection</h4>
                      <p className="text-gray-600">Limited company recommended for retail (liability protection, credibility). Register with CRO (€125-200)</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Business Bank Account</h4>
                      <p className="text-gray-600">Open business account with merchant services for card payments. Essential for retail operations</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">VAT Registration</h4>
                      <p className="text-gray-600">Register early to reclaim VAT on shop fittings, equipment, and initial stock (typically €5,000-15,000)</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card-premium p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Phase 2: Premises & Licensing (Weeks 2-8)</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Shop Premises License</h4>
                      <p className="text-gray-600">Apply for commercial premises license with local authority. Required before opening</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Planning Permission</h4>
                      <p className="text-gray-600">Verify premises has retail planning permission. Apply for change of use if needed (€65-700)</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Signage Permissions</h4>
                      <p className="text-gray-600">Apply for advertising display permissions for external signage with local council</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card-premium p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Phase 3: Operational Setup (Weeks 4-10)</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-teal-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">POS System & Equipment</h4>
                      <p className="text-gray-600">Install till system, card readers, security, and inventory management software</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-teal-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Insurance Coverage</h4>
                      <p className="text-gray-600">Shop insurance, public liability (€2M+), employer liability, stock insurance, and business interruption</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-teal-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Staff & Payroll Setup</h4>
                      <p className="text-gray-600">Register employees with Revenue, setup employee contracts and VAT compliance for staff expenses</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card-premium p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Phase 4: Stock & Launch Preparation (Weeks 6-12)</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-teal-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Supplier Agreements</h4>
                      <p className="text-gray-600">Establish wholesale supplier relationships, negotiate terms, and setup delivery schedules</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-teal-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Initial Stock Purchase</h4>
                      <p className="text-gray-600">Order opening stock, setup inventory tracking, and implement stock control procedures</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-teal-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Marketing & Launch</h4>
                      <p className="text-gray-600">Local advertising, social media setup, grand opening promotions, and customer loyalty programs</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Retail VAT Guide */}
        <section className="scroll-section py-16 px-4" id="retail-vat">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Retail VAT Compliance in Ireland
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Retail businesses must comply with complex VAT rules covering different product categories and sales channels.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="card-modern p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Common Retail VAT Rates</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <span className="font-medium text-gray-900">Most Goods (clothing, electronics)</span>
                    <span className="font-bold text-blue-600">23%</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <span className="font-medium text-gray-900">Food & Beverages</span>
                    <span className="font-bold text-gray-600">0%</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <span className="font-medium text-gray-900">Books & Newspapers</span>
                    <span className="font-bold text-gray-600">0%</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <span className="font-medium text-gray-900">Children's Clothing & Footwear</span>
                    <span className="font-bold text-gray-600">0%</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <span className="font-medium text-gray-900">Medical Equipment</span>
                    <span className="font-bold text-gray-600">0%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">Fuel & Energy</span>
                    <span className="font-bold text-teal-600">13.5%</span>
                  </div>
                </div>
              </div>
              
              <div className="card-modern p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Retail VAT Benefits</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Input VAT Recovery</h4>
                      <p className="text-gray-600 text-sm">Reclaim VAT on shop fittings, equipment, stock purchases, and business expenses</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Wholesale Purchasing</h4>
                      <p className="text-gray-600 text-sm">Access to VAT-free wholesale prices from suppliers, improving profit margins</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Business Credibility</h4>
                      <p className="text-gray-600 text-sm">VAT number establishes credibility with suppliers and business customers</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Cross-Border Trading</h4>
                      <p className="text-gray-600 text-sm">Required for EU sales over €10,000 and B2B transactions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card-premium p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Automate Your Retail VAT Compliance
              </h3>
              <p className="text-lg text-gray-600 mb-6 max-w-3xl mx-auto">
                PayVat integrates with retail POS systems to automatically track mixed VAT rates, manage stock VAT, handle EU sales rules, and file bi-monthly returns. Perfect for retail complexity.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/signup" 
                  className="btn-primary px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105"
                >
                  Start Free Retail VAT Setup
                </a>
                <a 
                  href="/pricing" 
                  className="px-8 py-4 text-lg font-semibold text-blue-600 border-2 border-blue-200 rounded-xl hover:bg-blue-50 transition-all duration-300"
                >
                  View Retail Pricing
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Retail Startup Costs */}
        <section className="scroll-section py-16 px-4 bg-gray-50" id="retail-costs">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Retail Business Startup Costs Ireland (2025)
              </h2>
              <p className="text-lg text-gray-600">
                Realistic budget breakdown for opening a retail store in Ireland by category.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="card-modern p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Small Shop (50m²)</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700 text-sm">Setup & Legal</span>
                    <span className="font-semibold text-sm">€2,000</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700 text-sm">Shop Fittings</span>
                    <span className="font-semibold text-sm">€8,000</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700 text-sm">POS & Tech</span>
                    <span className="font-semibold text-sm">€3,000</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700 text-sm">Initial Stock</span>
                    <span className="font-semibold text-sm">€12,000</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700 text-sm">Insurance</span>
                    <span className="font-semibold text-sm">€1,500</span>
                  </div>
                  <div className="flex justify-between items-center font-bold pt-2">
                    <span className="text-gray-900">Total</span>
                    <span className="text-blue-600">€26,500</span>
                  </div>
                </div>
              </div>
              
              <div className="card-modern p-6 border-2 border-blue-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Medium Shop (100m²)</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700 text-sm">Setup & Legal</span>
                    <span className="font-semibold text-sm">€3,000</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700 text-sm">Shop Fittings</span>
                    <span className="font-semibold text-sm">€20,000</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700 text-sm">POS & Tech</span>
                    <span className="font-semibold text-sm">€6,000</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700 text-sm">Initial Stock</span>
                    <span className="font-semibold text-sm">€25,000</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700 text-sm">Insurance</span>
                    <span className="font-semibold text-sm">€2,500</span>
                  </div>
                  <div className="flex justify-between items-center font-bold pt-2">
                    <span className="text-gray-900">Total</span>
                    <span className="text-blue-600">€56,500</span>
                  </div>
                </div>
              </div>
              
              <div className="card-modern p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Large Shop (200m²)</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700 text-sm">Setup & Legal</span>
                    <span className="font-semibold text-sm">€5,000</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700 text-sm">Shop Fittings</span>
                    <span className="font-semibold text-sm">€45,000</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700 text-sm">POS & Tech</span>
                    <span className="font-semibold text-sm">€12,000</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700 text-sm">Initial Stock</span>
                    <span className="font-semibold text-sm">€50,000</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700 text-sm">Insurance</span>
                    <span className="font-semibold text-sm">€4,000</span>
                  </div>
                  <div className="flex justify-between items-center font-bold pt-2">
                    <span className="text-gray-900">Total</span>
                    <span className="text-blue-600">€116,000</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card-premium p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Plus Ongoing Monthly Costs
              </h3>
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div>
                  <div className="text-sm text-gray-600">Rent</div>
                  <div className="text-lg font-bold text-gray-900">€1,500-8,000</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Staff</div>
                  <div className="text-lg font-bold text-gray-900">€2,000-12,000</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Utilities</div>
                  <div className="text-lg font-bold text-gray-900">€300-1,200</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Marketing</div>
                  <div className="text-lg font-bold text-gray-900">€500-2,000</div>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Include 3-6 months working capital (€15,000-75,000) for initial trading period.
              </p>
              <a 
                href="/signup" 
                className="btn-primary px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105"
              >
                Get Your Retail VAT Setup Plan
              </a>
            </div>
          </div>
        </section>

        {/* Common Retail Mistakes */}
        <section className="scroll-section py-16 px-4" id="retail-mistakes">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Common Retail Business Mistakes to Avoid
              </h2>
              <p className="text-lg text-gray-600">
                Learn from costly mistakes that shut down 35% of retail businesses within 3 years.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="card-modern p-8 border-l-4 border-red-500">
                <h3 className="text-xl font-bold text-red-600 mb-3">Mistake: Poor Stock Management</h3>
                <p className="text-gray-700 mb-4">
                  Overstocking slow-moving items or understocking popular products. Not tracking stock turns or implementing reorder points.
                </p>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-red-800 font-semibold">Cost: 30-50% of retail failures due to cash flow tied up in dead stock</p>
                </div>
              </div>
              
              <div className="card-modern p-8 border-l-4 border-orange-500">
                <h3 className="text-xl font-bold text-orange-600 mb-3">Mistake: Ignoring VAT Recovery Opportunities</h3>
                <p className="text-gray-700 mb-4">
                  Not registering for VAT early to reclaim setup costs, or incorrectly applying VAT rates to different product categories.
                </p>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-orange-800 font-semibold">Cost: €5,000-20,000 in non-recoverable VAT and compliance penalties</p>
                </div>
              </div>
              
              <div className="card-modern p-8 border-l-4 border-yellow-500">
                <h3 className="text-xl font-bold text-yellow-600 mb-3">Mistake: Inadequate Security Measures</h3>
                <p className="text-gray-700 mb-4">
                  No CCTV, basic till security, inadequate stock protection. Retail theft averages 1.4% of turnover in Ireland.
                </p>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-yellow-800 font-semibold">Cost: €1,400 theft loss per €100,000 turnover + insurance claims</p>
                </div>
              </div>
              
              <div className="card-modern p-8 border-l-4 border-blue-500">
                <h3 className="text-xl font-bold text-blue-600 mb-3">Mistake: No Digital Presence</h3>
                <p className="text-gray-700 mb-4">
                  Relying solely on walk-in customers without online presence, social media, or click-and-collect options.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-800 font-semibold">Impact: Missing 60% of customers who research products online first</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="scroll-section py-20 px-4 bg-gradient-to-r from-teal-600 to-teal-700 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Launch Your Retail Business in Ireland?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Get your complete retail setup with automated VAT compliance and inventory tracking from day one.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/signup" 
                className="bg-white text-blue-600 px-8 py-4 text-lg font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-105"
              >
                Start Retail Business Setup
              </a>
              <a 
                href="/pricing" 
                className="border-2 border-white px-8 py-4 text-lg font-semibold rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-300"
              >
                View Retail Plans
              </a>
            </div>
            <p className="text-sm text-blue-200 mt-6">
              Trusted by Irish retailers for seamless compliance
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}