'use client'

import { useState, useEffect } from 'react'
import SiteHeader from '../../components/site-header'
import Footer from '../../components/footer'

export default function FreelancerVatIreland() {
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
            <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
              Freelancer VAT Guide Ireland
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Freelancer VAT Rules in 
              <span className="text-gradient-primary">
                Ireland (2025)
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Complete VAT compliance guide for Irish freelancers. Thresholds, registration, invoicing, expenses, and cross-border client rules.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/signup" 
                className="btn-primary px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                Setup Freelancer VAT
              </a>
              <a 
                href="#freelancer-guide" 
                className="px-8 py-4 text-lg font-semibold text-primary border-2 border-primary/20 rounded-xl hover:bg-primary/10 transition-all duration-300"
              >
                View VAT Requirements
              </a>
            </div>
          </div>
        </section>

        {/* Freelancer VAT Thresholds */}
        <section className="scroll-section py-16 px-4" id="freelancer-thresholds">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                VAT Registration Thresholds for Freelancers
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Freelancers providing services have different VAT thresholds than businesses selling goods.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="card-modern p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Service VAT Threshold</h3>
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold text-teal-600 mb-2">€42,500</div>
                  <p className="text-gray-600">Annual turnover threshold for freelance services</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">Consulting & advice</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">Design & creative services</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">IT & software development</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">Writing & marketing</span>
                  </div>
                </div>
              </div>
              
              <div className="card-modern p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Registration Timing</h3>
                <div className="space-y-4">
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-900 mb-2">Mandatory Registration</h4>
                    <p className="text-yellow-800 text-sm">Must register within 30 days of exceeding €42,500 threshold</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Voluntary Registration</h4>
                    <p className="text-gray-800 text-sm">Can register early for credibility and expense recovery</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Benefits of Early Registration</h4>
                    <p className="text-green-800 text-sm">Reclaim VAT on equipment, software, training costs</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Freelancer VAT Guide */}
        <section className="scroll-section py-16 px-4 bg-gray-50" id="freelancer-guide">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Complete Freelancer VAT Compliance Guide
              </h2>
              <p className="text-lg text-gray-600">
                Everything Irish freelancers need to know about VAT registration, invoicing, and compliance.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="card-premium p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">1. VAT Registration Process</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-teal-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Obtain Tax Reference Number (TRN)</h4>
                      <p className="text-gray-600">Apply through myAccount on revenue.ie or submit Form TR1 (individuals)</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-teal-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">VAT Registration Application</h4>
                      <p className="text-gray-600">Submit through ROS with evidence of trading and projected turnover</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-teal-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Receive VAT Number</h4>
                      <p className="text-gray-600">Typically issued within 15-30 days. Start charging VAT from registration date</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card-premium p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">2. VAT Invoicing Requirements</h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Required Invoice Information</h4>
                    <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
                      <div>• Your VAT number</div>
                      <div>• Invoice date and number</div>
                      <div>• Client's VAT number (if applicable)</div>
                      <div>• Description of services</div>
                      <div>• Net amount before VAT</div>
                      <div>• VAT rate applied (23%)</div>
                      <div>• VAT amount charged</div>
                      <div>• Total amount including VAT</div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Reverse Charge for B2B EU Services</h4>
                    <p className="text-gray-800 text-sm">For services to EU businesses with valid VAT numbers, apply 0% VAT and state "Reverse charge applies"</p>
                  </div>
                </div>
              </div>
              
              <div className="card-premium p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">3. Allowable Business Expenses</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Claimable Expenses (with VAT)</h4>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li>• Office equipment & software</li>
                      <li>• Professional development courses</li>
                      <li>• Business travel & accommodation</li>
                      <li>• Professional services (legal, accounting)</li>
                      <li>• Marketing & advertising</li>
                      <li>• Business insurance</li>
                      <li>• Stationery & office supplies</li>
                      <li>• Business phone & internet</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Home Office Expenses</h4>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li>• Utilities (proportional usage)</li>
                      <li>• Rent (business use portion)</li>
                      <li>• Heating & lighting</li>
                      <li>• Property insurance (business portion)</li>
                      <li>• Repairs & maintenance</li>
                      <li>• Cleaning (office area)</li>
                    </ul>
                    <p className="text-yellow-600 text-xs mt-2">Keep detailed records and calculate business use percentage</p>
                  </div>
                </div>
              </div>
              
              <div className="card-premium p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">4. VAT Return Filing</h3>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-teal-600">Bi-Monthly</div>
                      <p className="text-gray-600 text-sm">Most freelancers file every 2 months</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-teal-600">19th</div>
                      <p className="text-gray-600 text-sm">Payment due date</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-teal-600">23rd</div>
                      <p className="text-gray-600 text-sm">ROS filing deadline</p>
                    </div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-900 mb-2">Late Filing Penalties</h4>
                    <p className="text-red-800 text-sm">€150 initial penalty + €10/day after 20 days + 8% annual interest on tax due</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cross-Border VAT Rules */}
        <section className="scroll-section py-16 px-4" id="cross-border-vat">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Cross-Border VAT Rules for Freelancers
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Special VAT rules apply when working with international clients.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="card-modern p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">EU Business Clients (B2B)</h3>
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Reverse Charge Applies</h4>
                    <ul className="text-green-800 text-sm space-y-1">
                      <li>• Charge 0% VAT on invoice</li>
                      <li>• Client must have valid EU VAT number</li>
                      <li>• State "Reverse charge applies" on invoice</li>
                      <li>• Client pays VAT in their country</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">EC Sales List Required</h4>
                    <p className="text-gray-800 text-sm">Monthly return listing all EU B2B sales. Due by 15th of following month.</p>
                  </div>
                </div>
              </div>
              
              <div className="card-modern p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">EU Consumer Clients (B2C)</h3>
                <div className="space-y-4">
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-900 mb-2">Place of Supply Rules</h4>
                    <ul className="text-yellow-800 text-sm space-y-1">
                      <li>• Generally where client is established</li>
                      <li>• May need to register for VAT in client's country</li>
                      <li>• Digital services follow customer location</li>
                      <li>• Consider OSS registration for simplified compliance</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Non-EU Clients</h4>
                    <p className="text-gray-800 text-sm">Generally zero-rated (0% VAT) as exports of services outside EU.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Freelancer VAT Tools */}
        <section className="scroll-section py-16 px-4 bg-gray-50" id="freelancer-tools">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Essential Tools for Freelancer VAT Compliance
              </h2>
              <p className="text-lg text-gray-600">
                Streamline your VAT compliance with the right tools and systems.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="card-modern p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Invoicing & Accounting</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-2"></div>
                    <span>VAT-compliant invoicing software</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-2"></div>
                    <span>Automated VAT calculations</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-2"></div>
                    <span>Expense tracking and categorization</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-2"></div>
                    <span>Digital receipt storage</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-2"></div>
                    <span>Bank reconciliation</span>
                  </li>
                </ul>
              </div>
              
              <div className="card-modern p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">VAT Return Filing</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <span>Automated VAT return preparation</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <span>Cross-border validation</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <span>EC Sales List generation</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <span>Deadline reminders and alerts</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <span>Direct ROS submission</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="card-premium p-8 mt-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                PayVat: Complete Freelancer VAT Solution
              </h3>
              <p className="text-lg text-gray-600 mb-6 max-w-3xl mx-auto">
                Designed specifically for Irish freelancers. Automatic VAT calculations, compliant invoicing, expense tracking, and hassle-free VAT returns.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/signup" 
                  className="btn-primary px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105"
                >
                  Start Free Freelancer Setup
                </a>
                <a 
                  href="/pricing" 
                  className="px-8 py-4 text-lg font-semibold text-teal-600 border-2 border-teal-200 rounded-xl hover:bg-teal-50 transition-all duration-300"
                >
                  View Freelancer Plans
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="scroll-section py-20 px-4 bg-teal-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Simplify Your Freelancer VAT Compliance?
            </h2>
            <p className="text-xl mb-8 text-teal-100">
              Join 5,200+ Irish freelancers using PayVat for automated VAT compliance and stress-free returns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/signup" 
                className="bg-white text-teal-600 px-8 py-4 text-lg font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-105"
              >
                Get Started Free
              </a>
              <a 
                href="/pricing" 
                className="border-2 border-white px-8 py-4 text-lg font-semibold rounded-xl hover:bg-white hover:text-teal-600 transition-all duration-300"
              >
                View Pricing
              </a>
            </div>
            <p className="text-sm text-teal-200 mt-6">
              30-day free trial • No setup fees • Cancel anytime
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}