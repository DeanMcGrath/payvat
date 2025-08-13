'use client'

import { useState, useEffect } from 'react'
import SiteHeader from '../../components/site-header'
import Footer from '../../components/footer'

export default function EcommerceVatIreland() {
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
            <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6 animate-pulse">
              <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
              E-commerce VAT Ireland Guide
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              E-commerce VAT Rules in 
              <span className="text-gradient-primary">
                Ireland (2025)
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Complete VAT compliance guide for Irish e-commerce. Distance selling, EU thresholds, marketplace rules, OSS registration, and Brexit implications.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/signup" 
                className="btn-primary px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                Setup E-commerce VAT
              </a>
              <a 
                href="#ecommerce-vat-guide" 
                className="px-8 py-4 text-lg font-semibold text-primary border-2 border-primary/20 rounded-xl hover:bg-primary/10 transition-all duration-300"
              >
                View Distance Selling Rules
              </a>
            </div>
          </div>
        </section>

        {/* Distance Selling Thresholds */}
        <section className="scroll-section py-16 px-4" id="distance-selling">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                EU Distance Selling Thresholds (2025)
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                New simplified €10,000 threshold applies across all EU countries for B2C e-commerce sales.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="card-modern p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Below €10,000 EU Sales</h3>
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Simple Compliance</h4>
                    <ul className="text-green-800 text-sm space-y-1">
                      <li>• Charge Irish 23% VAT to all EU customers</li>
                      <li>• No need for OSS registration</li>
                      <li>• Include VAT in Irish returns only</li>
                      <li>• Track total EU sales to monitor threshold</li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Record Keeping</h4>
                    <p className="text-blue-800 text-sm">Maintain evidence of annual EU sales to prove you're below threshold</p>
                  </div>
                </div>
              </div>
              
              <div className="card-modern p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Above €10,000 EU Sales</h3>
                <div className="space-y-4">
                  <div className="bg-teal-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-teal-900 mb-2">OSS Registration Required</h4>
                    <ul className="text-teal-800 text-sm space-y-1">
                      <li>• Charge customer's country VAT rate</li>
                      <li>• Register for One Stop Shop (OSS)</li>
                      <li>• File quarterly OSS returns</li>
                      <li>• Rates vary from 17% to 27% across EU</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-900 mb-2">Compliance Deadline</h4>
                    <p className="text-red-800 text-sm">Must register by 10th day of month following threshold breach</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Marketplace Facilitation */}
        <section className="scroll-section py-16 px-4 bg-gray-50" id="ecommerce-vat-guide">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Marketplace VAT Rules
              </h2>
              <p className="text-lg text-gray-600">
                Different VAT responsibilities apply when selling through marketplaces vs your own website.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="card-modern p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Amazon & eBay</h3>
                <div className="space-y-3">
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold mb-2">Platform Responsibilities:</p>
                    <ul className="space-y-1">
                      <li>• Collects VAT on B2C sales</li>
                      <li>• Handles OSS compliance</li>
                      <li>• Issues VAT invoices</li>
                    </ul>
                  </div>
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold mb-2">Your Responsibilities:</p>
                    <ul className="space-y-1">
                      <li>• Provide VAT number</li>
                      <li>• Track for Irish returns</li>
                      <li>• B2B sales compliance</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="card-modern p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Etsy & Others</h3>
                <div className="space-y-3">
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold mb-2">Platform Responsibilities:</p>
                    <ul className="space-y-1">
                      <li>• May collect VAT</li>
                      <li>• Provides reports</li>
                      <li>• Varies by platform</li>
                    </ul>
                  </div>
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold mb-2">Your Responsibilities:</p>
                    <ul className="space-y-1">
                      <li>• Verify VAT handling</li>
                      <li>• May need OSS</li>
                      <li>• Full compliance duty</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="card-modern p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Own Website</h3>
                <div className="space-y-3">
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold mb-2">Full Responsibility:</p>
                    <ul className="space-y-1">
                      <li>• Calculate correct VAT</li>
                      <li>• OSS registration if needed</li>
                      <li>• Customer location proof</li>
                      <li>• Issue VAT invoices</li>
                      <li>• File all returns</li>
                      <li>• Maintain records</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* UK Brexit Rules */}
        <section className="scroll-section py-16 px-4" id="brexit-ecommerce">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                UK E-commerce Post-Brexit
              </h2>
              <p className="text-lg text-gray-600">
                Special rules now apply for e-commerce between Ireland and the UK.
              </p>
            </div>
            
            <div className="card-premium p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Selling to UK Customers</h3>
                  <div className="space-y-4">
                    <div className="bg-teal-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-teal-900 mb-2">Under £135</h4>
                      <ul className="text-teal-800 text-sm space-y-1">
                        <li>• UK VAT registration required</li>
                        <li>• Charge 20% UK VAT at checkout</li>
                        <li>• File UK VAT returns</li>
                      </ul>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Over £135</h4>
                      <ul className="text-blue-800 text-sm space-y-1">
                        <li>• Zero-rate the sale</li>
                        <li>• Customer pays import VAT</li>
                        <li>• Customs declarations required</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Northern Ireland Exception</h3>
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">NI Protocol Benefits</h4>
                      <ul className="text-green-800 text-sm space-y-1">
                        <li>• Treated as EU for goods</li>
                        <li>• Standard EU VAT rules apply</li>
                        <li>• No customs for Ireland-NI</li>
                        <li>• Use Irish VAT number</li>
                      </ul>
                    </div>
                    <div className="bg-teal-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-teal-900 mb-2">Documentation</h4>
                      <p className="text-teal-800 text-sm">XI prefix for NI businesses. Verify status before applying EU rules.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* E-commerce VAT Compliance Checklist */}
        <section className="scroll-section py-16 px-4 bg-gray-50" id="ecommerce-checklist">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                E-commerce VAT Compliance Checklist
              </h2>
              <p className="text-lg text-gray-600">
                Essential steps for VAT compliance in Irish e-commerce.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="card-premium p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">1. Initial Setup</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Irish VAT Registration</h4>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500">✓</span>
                        <span>Register when exceeding €85,000</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500">✓</span>
                        <span>Consider early registration for credibility</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500">✓</span>
                        <span>Setup automated VAT calculations</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">EU Compliance</h4>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500">✓</span>
                        <span>Monitor €10,000 EU threshold</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500">✓</span>
                        <span>Register for OSS if exceeded</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500">✓</span>
                        <span>Implement location detection</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="card-premium p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">2. Ongoing Compliance</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Returns & Reporting</h4>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li className="flex items-start space-x-2">
                        <span className="text-teal-500">✓</span>
                        <span>Bi-monthly Irish VAT returns</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-teal-500">✓</span>
                        <span>Quarterly OSS returns if applicable</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-teal-500">✓</span>
                        <span>EC Sales Lists for B2B</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Documentation</h4>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li className="flex items-start space-x-2">
                        <span className="text-teal-500">✓</span>
                        <span>Customer location evidence</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-teal-500">✓</span>
                        <span>VAT invoices for all sales</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-teal-500">✓</span>
                        <span>10-year record retention</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="scroll-section py-20 px-4 bg-teal-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Automate Your E-commerce VAT Compliance
            </h2>
            <p className="text-xl mb-8 text-teal-100">
              PayVat handles complex e-commerce VAT rules automatically. OSS registration, real-time calculations, and marketplace integration.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/signup" 
                className="bg-white text-teal-600 px-8 py-4 text-lg font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-105"
              >
                Start E-commerce VAT Setup
              </a>
              <a 
                href="/pricing" 
                className="border-2 border-white px-8 py-4 text-lg font-semibold rounded-xl hover:bg-white hover:text-teal-600 transition-all duration-300"
              >
                View E-commerce Plans
              </a>
            </div>
            <p className="text-sm text-teal-200 mt-6">
              Join 3,200+ Irish e-commerce businesses using PayVat
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}