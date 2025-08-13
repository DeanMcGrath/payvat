'use client'

import { useState, useEffect } from 'react'
import SiteHeader from '../../components/site-header'
import Footer from '../../components/footer'

export default function StartRestaurantBusinessIreland() {
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
            <div className="inline-flex items-center px-4 py-2 bg-teal-50 rounded-full text-teal-700 text-sm font-medium mb-6 animate-pulse">
              <span className="w-2 h-2 bg-teal-500 rounded-full mr-2"></span>
              Restaurant Business Setup Guide
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Start a Restaurant Business in 
              <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Ireland (2025)
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Complete guide to launching your restaurant in Ireland. From licenses and VAT compliance to food safety and profitability strategies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/signup" 
                className="btn-primary px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                Start Your Restaurant Setup
              </a>
              <a 
                href="#restaurant-checklist" 
                className="px-8 py-4 text-lg font-semibold text-teal-600 border-2 border-teal-200 rounded-xl hover:bg-teal-50 transition-all duration-300"
              >
                View Setup Checklist
              </a>
            </div>
          </div>
        </section>

        {/* Restaurant Requirements Overview */}
        <section className="scroll-section py-16 px-4" id="restaurant-requirements">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Restaurant Business Requirements in Ireland
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Restaurants have unique licensing, VAT, and compliance requirements beyond standard business setup.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="card-modern p-8 text-center hover:shadow-xl transition-all duration-300 group">
                <div className="icon-modern w-16 h-16 mx-auto mb-6 bg-red-100 text-red-600 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Food Business Registration</h3>
                <p className="text-gray-600 leading-relaxed">
                  Register with FSAI and local authority. Food safety management system required.
                </p>
              </div>
              
              <div className="card-modern p-8 text-center hover:shadow-xl transition-all duration-300 group">
                <div className="icon-modern w-16 h-16 mx-auto mb-6 bg-orange-100 text-orange-600 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H7m2 0v-4a2 2 0 012-2h2a2 2 0 012 2v4M7 7h10M7 11h10" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Planning Permission</h3>
                <p className="text-gray-600 leading-relaxed">
                  Commercial premises license and planning permission for restaurant use.
                </p>
              </div>
              
              <div className="card-modern p-8 text-center hover:shadow-xl transition-all duration-300 group">
                <div className="icon-modern w-16 h-16 mx-auto mb-6 bg-green-100 text-green-600 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">VAT Registration</h3>
                <p className="text-gray-600 leading-relaxed">
                  13.5% VAT rate on restaurant meals. Register early to reclaim setup VAT.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Restaurant Setup Checklist */}
        <section className="scroll-section py-16 px-4 bg-gray-50" id="restaurant-checklist">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Restaurant Setup Checklist (2025)
              </h2>
              <p className="text-lg text-gray-600">
                Complete step-by-step checklist for opening your restaurant in Ireland.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="card-premium p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Phase 1: Business Foundation (Weeks 1-4)</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-teal-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Business Structure & Registration</h4>
                      <p className="text-gray-600">Choose limited company for liability protection. Register with CRO (€125-200)</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-teal-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Business Bank Account</h4>
                      <p className="text-gray-600">Open dedicated business account. Expect €5,000-15,000 initial deposit requirements</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-teal-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Tax Registration</h4>
                      <p className="text-gray-600">Obtain Tax Reference Number and register for VAT (13.5% on meals)</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card-premium p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Phase 2: Food Business Registration (Weeks 2-6)</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">FSAI Registration</h4>
                      <p className="text-gray-600">Register with Food Safety Authority. Submit food safety management system plan</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Local Authority Registration</h4>
                      <p className="text-gray-600">Register food business with local council. Inspection required before opening</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">HACCP Training</h4>
                      <p className="text-gray-600">Complete food safety training. Owner/manager must have certified HACCP training</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card-premium p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Phase 3: Premises & Licensing (Weeks 4-12)</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Planning Permission</h4>
                      <p className="text-gray-600">Apply for change of use to restaurant. Can take 8-12 weeks (€65-700 fee)</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Liquor License (if applicable)</h4>
                      <p className="text-gray-600">Apply for on-license. District Court application (€630 + legal costs €3,000+)</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Fire Safety Certificate</h4>
                      <p className="text-gray-600">Building Control Authority certificate required for &gt;30 occupancy</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card-premium p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Phase 4: Operational Setup (Weeks 8-16)</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Staff Registration</h4>
                      <p className="text-gray-600">Register employees with Revenue. Setup employment contracts and VAT compliance for staff costs</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">VAT Compliance Setup</h4>
                      <p className="text-gray-600">Automated VAT calculation, compliance monitoring, and deadline reminders for restaurants</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">POS System & VAT Compliance</h4>
                      <p className="text-gray-600">Install certified till system for VAT-compliant receipts. Setup PayVat for automated compliance</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Restaurant-Specific VAT Guide */}
        <section className="scroll-section py-16 px-4" id="restaurant-vat">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Restaurant VAT Compliance in Ireland
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Restaurants have complex VAT requirements with different rates for dine-in, takeaway, and catering.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="card-modern p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">VAT Rates for Restaurants</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <span className="font-medium text-gray-900">Restaurant Meals (dine-in)</span>
                    <span className="font-bold text-teal-600">13.5%</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <span className="font-medium text-gray-900">Hot Takeaway Food</span>
                    <span className="font-bold text-teal-600">13.5%</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <span className="font-medium text-gray-900">Cold Takeaway Food</span>
                    <span className="font-bold text-gray-600">0%</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <span className="font-medium text-gray-900">Alcohol</span>
                    <span className="font-bold text-red-600">23%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">Catering Services</span>
                    <span className="font-bold text-teal-600">13.5%</span>
                  </div>
                </div>
              </div>
              
              <div className="card-modern p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">VAT Registration Benefits</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Reclaim Setup VAT</h4>
                      <p className="text-gray-600 text-sm">Equipment, fixtures, renovations - typically €10,000-50,000 in recoverable VAT</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Professional Credibility</h4>
                      <p className="text-gray-600 text-sm">VAT number signals established business to suppliers and customers</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Cash Flow Management</h4>
                      <p className="text-gray-600 text-sm">Bi-monthly filings help manage seasonal restaurant cash flows</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-gray-900">B2B Opportunities</h4>
                      <p className="text-gray-600 text-sm">Catering contracts, corporate accounts often require VAT registration</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card-premium p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Automate Your Restaurant VAT Compliance
              </h3>
              <p className="text-lg text-gray-600 mb-6 max-w-3xl mx-auto">
                PayVat provides automated VAT calculation for restaurant sales, generates compliant receipts, and files bi-monthly returns. Save 15+ hours per month on compliance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/signup" 
                  className="btn-primary px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105"
                >
                  Start Free Restaurant VAT Setup
                </a>
                <a 
                  href="/pricing" 
                  className="px-8 py-4 text-lg font-semibold text-teal-600 border-2 border-teal-200 rounded-xl hover:bg-teal-50 transition-all duration-300"
                >
                  View Restaurant Pricing
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Startup Costs Breakdown */}
        <section className="scroll-section py-16 px-4 bg-gray-50" id="restaurant-costs">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Restaurant Startup Costs Ireland (2025)
              </h2>
              <p className="text-lg text-gray-600">
                Realistic budget breakdown for opening a restaurant in Ireland.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="card-modern p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Essential Setup Costs</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700">Company Registration</span>
                    <span className="font-semibold">€125-200</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700">Food Business Registration</span>
                    <span className="font-semibold">€150-500</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700">Planning Permission</span>
                    <span className="font-semibold">€65-700</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700">Liquor License</span>
                    <span className="font-semibold">€4,000-8,000</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700">VAT Compliance Service</span>
                    <span className="font-semibold">€500-1,200</span>
                  </div>
                  <div className="flex justify-between items-center font-bold text-lg pt-2">
                    <span className="text-gray-900">Legal/Admin Total</span>
                    <span className="text-teal-600">€6,000-14,000</span>
                  </div>
                </div>
              </div>
              
              <div className="card-modern p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Operational Setup Costs</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700">Kitchen Equipment</span>
                    <span className="font-semibold">€25,000-75,000</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700">Furniture & Fittings</span>
                    <span className="font-semibold">€15,000-40,000</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700">POS System & Technology</span>
                    <span className="font-semibold">€3,000-8,000</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700">Initial Stock</span>
                    <span className="font-semibold">€5,000-15,000</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-gray-700">Marketing & Signage</span>
                    <span className="font-semibold">€3,000-10,000</span>
                  </div>
                  <div className="flex justify-between items-center font-bold text-lg pt-2">
                    <span className="text-gray-900">Operational Total</span>
                    <span className="text-teal-600">€51,000-148,000</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card-premium p-8 mt-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Total Restaurant Startup Investment
                </h3>
                <div className="flex justify-center items-center gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Minimum</div>
                    <div className="text-3xl font-bold text-teal-600">€57,000</div>
                  </div>
                  <div className="text-gray-400 text-2xl">-</div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Typical</div>
                    <div className="text-3xl font-bold text-teal-600">€162,000</div>
                  </div>
                </div>
                <p className="text-gray-600 mb-6">
                  Plus 3-6 months working capital (€15,000-30,000) and premises costs (rent, deposits, renovations).
                </p>
                <a 
                  href="/signup" 
                  className="btn-primary px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105"
                >
                  Get Your Restaurant VAT Setup Plan
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Common Mistakes Section */}
        <section className="scroll-section py-16 px-4" id="restaurant-mistakes">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Common Restaurant Startup Mistakes to Avoid
              </h2>
              <p className="text-lg text-gray-600">
                Learn from others' costly mistakes when opening your restaurant in Ireland.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="card-modern p-8 border-l-4 border-red-500">
                <h3 className="text-xl font-bold text-red-600 mb-3">Mistake: Not Registering for VAT Early</h3>
                <p className="text-gray-700 mb-4">
                  Many restaurants wait until they hit the €85,000 threshold, missing out on reclaiming setup VAT on equipment and renovations.
                </p>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-red-800 font-semibold">Cost: €5,000-15,000 in non-recoverable VAT</p>
                </div>
              </div>
              
              <div className="card-modern p-8 border-l-4 border-orange-500">
                <h3 className="text-xl font-bold text-orange-600 mb-3">Mistake: Poor VAT Registration Timing</h3>
                <p className="text-gray-700 mb-4">
                  Delaying VAT registration until mandatory threshold, missing opportunities to reclaim setup costs and establish professional credibility.
                </p>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-orange-800 font-semibold">Cost: €10,000+ in non-recoverable setup VAT and credibility issues</p>
                </div>
              </div>
              
              <div className="card-modern p-8 border-l-4 border-yellow-500">
                <h3 className="text-xl font-bold text-yellow-600 mb-3">Mistake: Poor Cash Flow Planning</h3>
                <p className="text-gray-700 mb-4">
                  Underestimating working capital needs and not accounting for 3-6 month ramp-up period before profitability.
                </p>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-yellow-800 font-semibold">Result: 40% of restaurants fail within first year due to cash flow</p>
                </div>
              </div>
              
              <div className="card-modern p-8 border-l-4 border-blue-500">
                <h3 className="text-xl font-bold text-blue-600 mb-3">Mistake: Manual VAT Management</h3>
                <p className="text-gray-700 mb-4">
                  Trying to handle complex restaurant VAT rates, different tax rates for dine-in vs takeaway, and bi-monthly filings manually.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-800 font-semibold">Cost: 15-20 hours per month + penalties for errors</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="scroll-section py-20 px-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Open Your Restaurant in Ireland?
            </h2>
            <p className="text-xl mb-8 text-teal-100">
              Get your complete restaurant business setup with automated VAT compliance, from day one.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/signup" 
                className="bg-white text-teal-600 px-8 py-4 text-lg font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-105"
              >
                Start Restaurant Setup Now
              </a>
              <a 
                href="/pricing" 
                className="border-2 border-white px-8 py-4 text-lg font-semibold rounded-xl hover:bg-white hover:text-teal-600 transition-all duration-300"
              >
                View Restaurant Plans
              </a>
            </div>
            <p className="text-sm text-teal-200 mt-6">
              Join 1,200+ Irish restaurants using PayVat for seamless compliance
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}