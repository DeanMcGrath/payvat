'use client'

import { useState, useEffect } from 'react'
import SiteHeader from '../../components/site-header'
import Footer from '../../components/footer'

export default function ConstructionVatIreland() {
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
            <div className="inline-flex items-center px-4 py-2 bg-orange-50 rounded-full text-orange-700 text-sm font-medium mb-6 animate-pulse">
              <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
              Construction VAT Ireland Guide
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Construction VAT Rules in 
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Ireland (2025)
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Complete guide to VAT compliance for Irish construction businesses. RCT system, subcontractor rules, materials vs services, and VAT reverse charges.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/signup" 
                className="btn-primary px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                Setup Construction VAT
              </a>
              <a 
                href="#construction-vat-guide" 
                className="px-8 py-4 text-lg font-semibold text-orange-600 border-2 border-orange-200 rounded-xl hover:bg-orange-50 transition-all duration-300"
              >
                View RCT Requirements
              </a>
            </div>
          </div>
        </section>

        {/* RCT System Overview */}
        <section className="scroll-section py-16 px-4" id="rct-system">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                RCT (Relevant Contracts Tax) System
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Ireland's construction industry operates under the RCT system, which affects how VAT and income tax are handled.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="card-modern p-8 text-center hover:shadow-xl transition-all duration-300 group">
                <div className="icon-modern w-16 h-16 mx-auto mb-6 bg-red-100 text-red-600 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Principal Contractors</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Main contractors hiring subcontractors for construction work. Must operate RCT deductions and submit monthly returns.
                </p>
                <div className="text-sm text-gray-500">
                  Monthly RCT returns required
                </div>
              </div>
              
              <div className="card-modern p-8 text-center hover:shadow-xl transition-all duration-300 group">
                <div className="icon-modern w-16 h-16 mx-auto mb-6 bg-orange-100 text-orange-600 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Subcontractors</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Specialists providing services to main contractors. Subject to RCT deductions unless holding C2 certificate.
                </p>
                <div className="text-sm text-gray-500">
                  0%, 20% or 35% RCT rates
                </div>
              </div>
              
              <div className="card-modern p-8 text-center hover:shadow-xl transition-all duration-300 group">
                <div className="icon-modern w-16 h-16 mx-auto mb-6 bg-yellow-100 text-yellow-600 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H7m2 0v-4a2 2 0 012-2h2a2 2 0 012 2v4M7 7h10M7 11h10" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Material Suppliers</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Suppliers of construction materials and equipment. Standard VAT rules apply, not subject to RCT system.
                </p>
                <div className="text-sm text-gray-500">
                  Standard 23% VAT on materials
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Construction VAT Rates */}
        <section className="scroll-section py-16 px-4 bg-gray-50" id="construction-vat-guide">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Construction VAT Rates & Applications
              </h2>
              <p className="text-lg text-gray-600">
                Different VAT rates apply to construction services, materials, and property types.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="card-modern p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Construction Services VAT</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <span className="font-medium text-gray-900">General Construction Services</span>
                    <span className="font-bold text-orange-600">13.5%</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <span className="font-medium text-gray-900">House Building Services</span>
                    <span className="font-bold text-orange-600">13.5%</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <span className="font-medium text-gray-900">Repair & Maintenance</span>
                    <span className="font-bold text-orange-600">13.5%</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <span className="font-medium text-gray-900">Cleaning Services</span>
                    <span className="font-bold text-orange-600">13.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">Security Services</span>
                    <span className="font-bold text-red-600">23%</span>
                  </div>
                </div>
              </div>
              
              <div className="card-modern p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Materials & Equipment VAT</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <span className="font-medium text-gray-900">Building Materials</span>
                    <span className="font-bold text-red-600">23%</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <span className="font-medium text-gray-900">Plant & Equipment Hire</span>
                    <span className="font-bold text-red-600">23%</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <span className="font-medium text-gray-900">Scaffolding Hire</span>
                    <span className="font-bold text-red-600">23%</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <span className="font-medium text-gray-900">Tool Hire</span>
                    <span className="font-bold text-red-600">23%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">Fuel & Energy</span>
                    <span className="font-bold text-orange-600">13.5%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card-premium p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Mixed Supplies: Materials + Services</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Two-Third Rule Application</h4>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• If services >2/3 of total: Apply 13.5% to entire supply</li>
                    <li>• If materials >2/3 of total: Apply 23% to entire supply</li>
                    <li>• If neither >2/3: Split and apply appropriate rates</li>
                    <li>• Must keep detailed records of breakdown</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Common Examples</h4>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Kitchen fitting: Usually 13.5% (service dominant)</li>
                    <li>• Electrical installation: Often 13.5% (service dominant)</li>
                    <li>• Material supply + fitting: Depends on ratio</li>
                    <li>• Roofing with materials: Check two-third rule</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* RCT Compliance Guide */}
        <section className="scroll-section py-16 px-4" id="rct-compliance">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                RCT Compliance for Construction Businesses
              </h2>
              <p className="text-lg text-gray-600">
                Step-by-step guide to RCT registration, deductions, and monthly returns.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="card-premium p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">1. RCT Registration Requirements</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Principal Contractor Registration</h4>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li>• Tax Reference Number (TRN) required</li>
                      <li>• Apply through ROS or Form RCT-R</li>
                      <li>• Must register before first subcontractor payment</li>
                      <li>• C1 certificate issued upon approval</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Subcontractor Registration</h4>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li>• Automatic registration with tax compliance</li>
                      <li>• C2 certificate for 0% RCT rate</li>
                      <li>• Requires good tax compliance history</li>
                      <li>• Renewed annually if eligible</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="card-premium p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">2. RCT Deduction Rates</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">0%</div>
                    <p className="text-green-800 text-sm mt-2">C2 certificate holders (tax compliant)</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-yellow-600">20%</div>
                    <p className="text-yellow-800 text-sm mt-2">Standard rate for registered subcontractors</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-600">35%</div>
                    <p className="text-red-800 text-sm mt-2">Unregistered or non-compliant subcontractors</p>
                  </div>
                </div>
              </div>
              
              <div className="card-premium p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">3. Monthly RCT Returns</h3>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Return Requirements</h4>
                    <ul className="text-blue-800 text-sm space-y-1">
                      <li>• Due by 14th of following month</li>
                      <li>• Submit even if no payments made (nil return)</li>
                      <li>• Include all subcontractor payments</li>
                      <li>• Deductions must be remitted to Revenue</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-900 mb-2">Penalties for Late Returns</h4>
                    <p className="text-red-800 text-sm">€1,520 penalty for late RCT returns, plus 10% surcharge on unpaid deductions.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Construction VAT Registration */}
        <section className="scroll-section py-16 px-4 bg-gray-50" id="construction-vat-registration">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                VAT Registration for Construction Businesses
              </h2>
              <p className="text-lg text-gray-600">
                Construction businesses should register for VAT early to maximise input VAT recovery.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="card-modern p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">VAT Registration Benefits</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-gray-900">High Input VAT Recovery</h4>
                      <p className="text-gray-600 text-sm">Reclaim 23% VAT on equipment, vehicles, materials purchases</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Professional Credibility</h4>
                      <p className="text-gray-600 text-sm">VAT number essential for commercial contracts and tenders</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Supplier Relationships</h4>
                      <p className="text-gray-600 text-sm">Access to trade suppliers offering VAT-exclusive pricing</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Cash Flow Management</h4>
                      <p className="text-gray-600 text-sm">Monthly VAT refunds during equipment purchase phases</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card-modern p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Typical VAT Recovery Amounts</h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Small Construction Business</h4>
                    <div className="text-2xl font-bold text-orange-600">€8,000-15,000</div>
                    <p className="text-gray-600 text-sm">Annual VAT recovery on equipment and materials</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Medium Construction Company</h4>
                    <div className="text-2xl font-bold text-orange-600">€25,000-60,000</div>
                    <p className="text-gray-600 text-sm">Annual VAT recovery including vehicles and plant</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Large Construction Enterprise</h4>
                    <div className="text-2xl font-bold text-orange-600">€100,000+</div>
                    <p className="text-gray-600 text-sm">Substantial VAT recovery on major equipment purchases</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Automation Solution */}
        <section className="scroll-section py-16 px-4" id="construction-automation">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Automate Construction VAT & RCT Compliance
              </h2>
              <p className="text-lg text-gray-600">
                PayVat handles the complex VAT and RCT requirements specific to Irish construction businesses.
              </p>
            </div>
            
            <div className="card-premium p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">VAT Automation</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                      <span>Automatic 13.5% vs 23% VAT calculation</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                      <span>Two-third rule application for mixed supplies</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                      <span>Input VAT tracking for materials and equipment</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                      <span>Bi-monthly VAT return generation</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">RCT Integration</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <span>Subcontractor rate verification (0%, 20%, 35%)</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <span>Monthly RCT return preparation</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <span>Automated deduction calculations</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <span>Deadline reminders and compliance alerts</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="text-center mt-8">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a 
                    href="/signup" 
                    className="btn-primary px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105"
                  >
                    Start Construction VAT Setup
                  </a>
                  <a 
                    href="/pricing" 
                    className="px-8 py-4 text-lg font-semibold text-orange-600 border-2 border-orange-200 rounded-xl hover:bg-orange-50 transition-all duration-300"
                  >
                    View Construction Plans
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="scroll-section py-20 px-4 bg-gradient-to-r from-orange-600 to-red-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Simplify Construction VAT & RCT Compliance?
            </h2>
            <p className="text-xl mb-8 text-orange-100">
              Join 1,800+ Irish construction businesses using PayVat for automated VAT and RCT compliance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/signup" 
                className="bg-white text-orange-600 px-8 py-4 text-lg font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-105"
              >
                Get Started Free
              </a>
              <a 
                href="/pricing" 
                className="border-2 border-white px-8 py-4 text-lg font-semibold rounded-xl hover:bg-white hover:text-orange-600 transition-all duration-300"
              >
                View Pricing
              </a>
            </div>
            <p className="text-sm text-orange-200 mt-6">
              Save 20+ hours monthly on VAT and RCT compliance
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}