'use client'

import { useState, useEffect } from 'react'
import SiteHeader from '../../components/site-header'
import Footer from '../../components/footer'

export default function StartOnlineBusinessIreland() {
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

        {/* Online Business Types */}
        <section className="scroll-section py-16 px-4" id="online-types">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Types of Online Businesses in Ireland
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Different online business models have varying VAT obligations, registration requirements, and compliance needs.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="card-modern p-8 text-center hover:shadow-xl transition-all duration-300 group">
                <div className="icon-modern w-16 h-16 mx-auto mb-6 bg-gray-100 text-gray-600 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">E-commerce Store</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Selling physical products online with shipping. Complex VAT rules for EU sales and inventory management required.
                </p>
                <div className="text-sm text-gray-500">
                  VAT: €85,000 threshold | EU OSS registration
                </div>
              </div>
              
              <div className="card-modern p-8 text-center hover:shadow-xl transition-all duration-300 group">
                <div className="icon-modern w-16 h-16 mx-auto mb-6 bg-green-100 text-green-600 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Digital Services</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Software, apps, online courses, consultancy. Service VAT threshold €42,500. Special B2B/B2C VAT place of supply rules.
                </p>
                <div className="text-sm text-gray-500">
                  VAT: €42,500 threshold | Place of supply rules
                </div>
              </div>
              
              <div className="card-modern p-8 text-center hover:shadow-xl transition-all duration-300 group">
                <div className="icon-modern w-16 h-16 mx-auto mb-6 bg-gray-100 text-blue-600 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Marketplace Seller</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Selling on Amazon, eBay, Etsy. Platform may collect VAT on your behalf. Still need Irish VAT registration for compliance.
                </p>
                <div className="text-sm text-gray-500">
                  VAT: Varies by platform | Marketplace facilitation
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Online Business Setup Checklist */}
        <section className="scroll-section py-16 px-4 bg-gray-50" id="online-checklist">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Online Business Setup Checklist (2025)
              </h2>
              <p className="text-lg text-gray-600">
                Complete step-by-step checklist for launching your online business in Ireland.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="card-premium p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Phase 1: Legal Foundation (Weeks 1-2)</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Business Structure & Registration</h4>
                      <p className="text-gray-600">Register limited company for liability protection and credibility. Essential for payment processing</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Data Protection Registration</h4>
                      <p className="text-gray-600">Register with Data Protection Commission if processing personal data (€35 annual fee)</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">VAT Registration Strategy</h4>
                      <p className="text-gray-600">Register early for EU sales compliance and professional credibility with suppliers</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card-premium p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Phase 2: Digital Infrastructure (Weeks 2-4)</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Website & E-commerce Platform</h4>
                      <p className="text-gray-600">Build website with Irish-compliant terms, privacy policy, and VAT-ready checkout system</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Payment Processing</h4>
                      <p className="text-gray-600">Setup merchant account with Stripe, PayPal, or Adyen. Ensure VAT compliance on receipts</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">EU VAT Compliance System</h4>
                      <p className="text-gray-600">Implement automated VAT calculation for EU sales and OSS registration if needed</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card-premium p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Phase 3: Operational Setup (Weeks 3-6)</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Business Bank Account & Finance</h4>
                      <p className="text-gray-600">Open online-friendly business account. Setup accounting software with e-commerce integration</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Insurance & Legal Protection</h4>
                      <p className="text-gray-600">Professional indemnity, cyber liability, product liability (if selling goods), legal expenses</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Fulfillment & Customer Service</h4>
                      <p className="text-gray-600">Setup shipping, returns process, customer support system, and order management</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card-premium p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Phase 4: Marketing & Launch (Weeks 4-8)</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">SEO & Content Strategy</h4>
                      <p className="text-gray-600">Optimize for Irish market, create valuable content, local SEO for Irish searches</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Digital Marketing Setup</h4>
                      <p className="text-gray-600">Google Ads, Facebook/Instagram advertising, email marketing, social media presence</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Analytics & Optimization</h4>
                      <p className="text-gray-600">Google Analytics, conversion tracking, A/B testing setup, performance monitoring</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* EU VAT Compliance for Online Business */}
        <section className="scroll-section py-16 px-4" id="eu-vat-compliance">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                EU VAT Compliance for Online Businesses
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Online businesses face complex EU VAT rules. Understanding these is crucial for compliance and avoiding penalties.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="card-modern p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">B2C Sales (to Consumers)</h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Goods (E-commerce)</h4>
                    <ul className="text-gray-800 text-sm space-y-1">
                      <li>• Irish VAT if customer in Ireland</li>
                      <li>• Distance selling thresholds apply</li>
                      <li>• €10,000 threshold per EU country</li>
                      <li>• OSS registration recommended</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Digital Services</h4>
                    <ul className="text-green-800 text-sm space-y-1">
                      <li>• Customer's country VAT rate</li>
                      <li>• From first €1 of sales</li>
                      <li>• OSS registration required</li>
                      <li>• Two pieces of evidence needed</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="card-modern p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">B2B Sales (to Businesses)</h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Goods & Services</h4>
                    <ul className="text-blue-800 text-sm space-y-1">
                      <li>• Reverse charge mechanism</li>
                      <li>• 0% VAT if valid EU VAT number</li>
                      <li>• Customer pays VAT in their country</li>
                      <li>• EC Sales List required</li>
                    </ul>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-900 mb-2">Validation Required</h4>
                    <ul className="text-orange-800 text-sm space-y-1">
                      <li>• VIES validation of VAT numbers</li>
                      <li>• Invoice must show reverse charge</li>
                      <li>• Keep validation evidence</li>
                      <li>• Monthly EC Sales Lists</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card-premium p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Automate EU VAT Compliance for Your Online Business
              </h3>
              <p className="text-lg text-gray-600 mb-6 max-w-3xl mx-auto">
                PayVat automatically handles EU VAT compliance for online businesses. OSS registration, real-time VAT calculation, customer location detection, and automated EC Sales Lists.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/signup" 
                  className="btn-primary px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105"
                >
                  Start EU VAT Automation
                </a>
                <a 
                  href="/pricing" 
                  className="px-8 py-4 text-lg font-semibold text-blue-600 border-2 border-blue-200 rounded-xl hover:bg-gray-50 transition-all duration-300"
                >
                  View Online Business Plans
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Online Business Costs */}
        <section className="scroll-section py-16 px-4 bg-gray-50" id="online-costs">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Online Business Startup Costs Ireland (2025)
              </h2>
              <p className="text-lg text-gray-600">
                Realistic budget breakdown for launching an online business in Ireland.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="card-modern p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Basic Online Store</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700 text-sm">Company Registration</span>
                    <span className="font-semibold text-sm">€200</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700 text-sm">Website Development</span>
                    <span className="font-semibold text-sm">€2,500</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700 text-sm">Payment Processing</span>
                    <span className="font-semibold text-sm">€300</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700 text-sm">Initial Marketing</span>
                    <span className="font-semibold text-sm">€1,500</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700 text-sm">Legal & Compliance</span>
                    <span className="font-semibold text-sm">€800</span>
                  </div>
                  <div className="flex justify-between items-center font-bold pt-2">
                    <span className="text-gray-900">Total</span>
                    <span className="text-blue-600">€5,300</span>
                  </div>
                </div>
              </div>
              
              <div className="card-modern p-6 border-2 border-blue-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Professional Store</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700 text-sm">Company Registration</span>
                    <span className="font-semibold text-sm">€200</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700 text-sm">Website Development</span>
                    <span className="font-semibold text-sm">€8,000</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700 text-sm">Payment & Systems</span>
                    <span className="font-semibold text-sm">€1,200</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700 text-sm">Marketing Budget</span>
                    <span className="font-semibold text-sm">€5,000</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700 text-sm">Legal & Insurance</span>
                    <span className="font-semibold text-sm">€2,000</span>
                  </div>
                  <div className="flex justify-between items-center font-bold pt-2">
                    <span className="text-gray-900">Total</span>
                    <span className="text-blue-600">€16,400</span>
                  </div>
                </div>
              </div>
              
              <div className="card-modern p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Enterprise Store</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700 text-sm">Company Registration</span>
                    <span className="font-semibold text-sm">€200</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700 text-sm">Custom Development</span>
                    <span className="font-semibold text-sm">€25,000</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700 text-sm">Enterprise Systems</span>
                    <span className="font-semibold text-sm">€5,000</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700 text-sm">Launch Marketing</span>
                    <span className="font-semibold text-sm">€15,000</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700 text-sm">Legal & Compliance</span>
                    <span className="font-semibold text-sm">€5,000</span>
                  </div>
                  <div className="flex justify-between items-center font-bold pt-2">
                    <span className="text-gray-900">Total</span>
                    <span className="text-blue-600">€50,200</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card-premium p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Monthly Operating Costs
              </h3>
              <div className="grid md:grid-cols-5 gap-4 mb-6">
                <div>
                  <div className="text-sm text-gray-600">Hosting</div>
                  <div className="text-lg font-bold text-gray-900">€50-500</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Marketing</div>
                  <div className="text-lg font-bold text-gray-900">€500-5,000</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Payment Fees</div>
                  <div className="text-lg font-bold text-gray-900">1.4-2.9%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Software</div>
                  <div className="text-lg font-bold text-gray-900">€200-2,000</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">VAT Service</div>
                  <div className="text-lg font-bold text-gray-900">€49-199</div>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Plus inventory costs for product-based businesses and staff costs as you scale.
              </p>
              <a 
                href="/signup" 
                className="btn-primary px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105"
              >
                Get Your Online Business Setup Plan
              </a>
            </div>
          </div>
        </section>

        {/* Common Online Business Mistakes */}
        <section className="scroll-section py-16 px-4" id="online-mistakes">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Common Online Business Mistakes to Avoid
              </h2>
              <p className="text-lg text-gray-600">
                Learn from mistakes that cost Irish online businesses thousands in penalties and lost revenue.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="card-modern p-8 border-l-4 border-red-500">
                <h3 className="text-xl font-bold text-red-600 mb-3">Mistake: Ignoring EU VAT Rules</h3>
                <p className="text-gray-700 mb-4">
                  Not registering for OSS when selling digital services to EU consumers, or incorrectly applying VAT rates to EU sales.
                </p>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-red-800 font-semibold">Penalty: Up to 100% of VAT due + €4,000 per missed return</p>
                </div>
              </div>
              
              <div className="card-modern p-8 border-l-4 border-orange-500">
                <h3 className="text-xl font-bold text-orange-600 mb-3">Mistake: Poor Data Protection Compliance</h3>
                <p className="text-gray-700 mb-4">
                  Not registering with DPC, inadequate privacy policies, no cookie consent, failing to secure customer data properly.
                </p>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-orange-800 font-semibold">Risk: GDPR fines up to €20M or 4% of global turnover</p>
                </div>
              </div>
              
              <div className="card-modern p-8 border-l-4 border-yellow-500">
                <h3 className="text-xl font-bold text-yellow-600 mb-3">Mistake: Inadequate Payment Security</h3>
                <p className="text-gray-700 mb-4">
                  Using non-PCI compliant payment systems, storing card details, insufficient fraud protection, poor checkout security.
                </p>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-yellow-800 font-semibold">Cost: Chargebacks (€15-25 each) + potential €10,000+ fraud losses</p>
                </div>
              </div>
              
              <div className="card-modern p-8 border-l-4 border-blue-500">
                <h3 className="text-xl font-bold text-gray-600 mb-3">Mistake: Manual Financial Management</h3>
                <p className="text-gray-700 mb-4">
                  Trying to track multi-currency sales, varying VAT rates, and platform fees manually without integrated accounting.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-800 font-semibold">Impact: Significant time on admin + accuracy errors costing money</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="scroll-section py-20 px-4 bg-blue-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Launch Your Online Business in Ireland?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Get your complete online business setup with automated EU VAT compliance from day one.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/signup" 
                className="bg-white text-blue-600 px-8 py-4 text-lg font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-105"
              >
                Start Online Business Setup
              </a>
              <a 
                href="/pricing" 
                className="border-2 border-white px-8 py-4 text-lg font-semibold rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-300"
              >
                View Online Business Plans
              </a>
            </div>
            <p className="text-sm text-blue-200 mt-6">
              Trusted by Irish online businesses for EU compliance
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}