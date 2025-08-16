'use client'

import { useState, useEffect } from 'react'
import SiteHeader from '../../components/site-header'
import Footer from '../../components/footer'

export default function DigitalServicesVatIreland() {
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

        {/* Digital Services Definition */}
        <section className="scroll-section py-16 px-4" id="digital-services-definition">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                What Are Digital Services for VAT Purposes?
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Digital services have specific VAT rules that differ from traditional services. Understanding the definition is crucial for compliance.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="card-modern p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Digital Services Include</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Software & Apps</h4>
                      <p className="text-gray-600 text-sm">SaaS platforms, mobile apps, cloud software, licenses</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Digital Content</h4>
                      <p className="text-gray-600 text-sm">E-books, music, videos, games, online courses</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Web Services</h4>
                      <p className="text-gray-600 text-sm">Website development, hosting, domain registration</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Online Platforms</h4>
                      <p className="text-gray-600 text-sm">Marketplaces, advertising platforms, subscription services</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Digital Training</h4>
                      <p className="text-gray-600 text-sm">Online courses, webinars, e-learning platforms</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card-modern p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">NOT Digital Services</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Traditional Consulting</h4>
                      <p className="text-gray-600 text-sm">Business advice, strategy consulting (even if delivered online)</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Professional Services</h4>
                      <p className="text-gray-600 text-sm">Legal advice, accounting, architectural services</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Physical Goods</h4>
                      <p className="text-gray-600 text-sm">Software sold on physical media, printed materials</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Telecommunications</h4>
                      <p className="text-gray-600 text-sm">Phone services, internet access provision</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Educational Services</h4>
                      <p className="text-gray-600 text-sm">Formal education, tutoring (personal instruction)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Place of Supply Rules */}
        <section className="scroll-section py-16 px-4 bg-gray-50" id="digital-vat-guide">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Digital Services Place of Supply Rules
              </h2>
              <p className="text-lg text-gray-600">
                Where you charge VAT depends on your customer type and location. Rules differ for B2B vs B2C transactions.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="card-modern p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">B2B Digital Services</h3>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">EU Business Customers</h4>
                    <ul className="text-blue-800 text-sm space-y-1">
                      <li>• Reverse charge applies (0% VAT in Ireland)</li>
                      <li>• Customer pays VAT in their country</li>
                      <li>• Must validate customer's VAT number</li>
                      <li>• Invoice must state "Reverse charge applies"</li>
                      <li>• Include in monthly EC Sales List</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Non-EU Business Customers</h4>
                    <ul className="text-green-800 text-sm space-y-1">
                      <li>• Zero-rated (0% VAT) as export</li>
                      <li>• Evidence of business status required</li>
                      <li>• No EU VAT obligations</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="card-modern p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">B2C Digital Services</h3>
                <div className="space-y-4">
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-900 mb-2">EU Consumer Customers</h4>
                    <ul className="text-orange-800 text-sm space-y-1">
                      <li>• VAT charged at customer's country rate</li>
                      <li>• Must register for OSS or country-specific VAT</li>
                      <li>• Need 2 pieces of location evidence</li>
                      <li>• From first €1 of sales (no threshold)</li>
                    </ul>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">Irish Consumer Customers</h4>
                    <ul className="text-purple-800 text-sm space-y-1">
                      <li>• Charge 23% Irish VAT</li>
                      <li>• Standard VAT registration thresholds apply</li>
                      <li>• €42,500 threshold for services</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* OSS Registration Guide */}
        <section className="scroll-section py-16 px-4" id="oss-registration">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                One Stop Shop (OSS) Registration
              </h2>
              <p className="text-lg text-gray-600">
                OSS simplifies VAT compliance for digital services to EU consumers from a single registration.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="card-premium p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">When You Need OSS Registration</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Mandatory Registration</h4>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li>• Selling digital services to EU consumers</li>
                      <li>• From the first €1 of sales (no threshold)</li>
                      <li>• Customer located in another EU country</li>
                      <li>• Including free trials that convert to paid</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Optional Registration</h4>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li>• Planning to sell to EU consumers</li>
                      <li>• Want simplified compliance</li>
                      <li>• Selling to both Irish and EU customers</li>
                      <li>• Freemium models with potential conversions</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="card-premium p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">OSS Registration Process</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-cyan-600 font-bold text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Apply Through ROS</h4>
                      <p className="text-gray-600">Submit OSS application via Revenue Online Service with business details and projected EU sales</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-cyan-600 font-bold text-sm">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Receive OSS Number</h4>
                      <p className="text-gray-600">Get unique OSS identification number starting with "IM" for Ireland</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-cyan-600 font-bold text-sm">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Setup Customer Location Detection</h4>
                      <p className="text-gray-600">Implement systems to identify customer location and apply correct VAT rates</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-cyan-600 font-bold text-sm">4</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Submit Quarterly OSS Returns</h4>
                      <p className="text-gray-600">File quarterly returns by 31st of month following quarter end</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card-premium p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Customer Location Evidence</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Required Evidence (2 pieces)</h4>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li>• Billing address</li>
                      <li>• IP address location</li>
                      <li>• Bank account country</li>
                      <li>• Country of mobile number</li>
                      <li>• Payment card issuing country</li>
                      <li>• Location of fixed landline</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Conflicting Evidence</h4>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li>• Use billing address if available</li>
                      <li>• Otherwise use IP address location</li>
                      <li>• Document decision-making process</li>
                      <li>• Keep evidence for 10 years</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VAT Rates by Country */}
        <section className="scroll-section py-16 px-4 bg-gray-50" id="eu-vat-rates">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                EU Digital Services VAT Rates (2025)
              </h2>
              <p className="text-lg text-gray-600">
                Standard VAT rates for digital services across EU member states.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="card-modern p-6">
                <h3 className="font-bold text-gray-900 mb-4">Western Europe</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Ireland</span>
                    <span className="font-semibold">23%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>United Kingdom</span>
                    <span className="font-semibold">20%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Germany</span>
                    <span className="font-semibold">19%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>France</span>
                    <span className="font-semibold">20%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Netherlands</span>
                    <span className="font-semibold">21%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Belgium</span>
                    <span className="font-semibold">21%</span>
                  </div>
                </div>
              </div>
              
              <div className="card-modern p-6">
                <h3 className="font-bold text-gray-900 mb-4">Northern Europe</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Denmark</span>
                    <span className="font-semibold">25%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sweden</span>
                    <span className="font-semibold">25%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Finland</span>
                    <span className="font-semibold">24%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Norway</span>
                    <span className="font-semibold">25%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estonia</span>
                    <span className="font-semibold">20%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Latvia</span>
                    <span className="font-semibold">21%</span>
                  </div>
                </div>
              </div>
              
              <div className="card-modern p-6">
                <h3 className="font-bold text-gray-900 mb-4">Southern & Eastern</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Spain</span>
                    <span className="font-semibold">21%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Italy</span>
                    <span className="font-semibold">22%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Portugal</span>
                    <span className="font-semibold">23%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Poland</span>
                    <span className="font-semibold">23%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Czech Republic</span>
                    <span className="font-semibold">21%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hungary</span>
                    <span className="font-semibold">27%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Digital Services Automation */}
        <section className="scroll-section py-16 px-4" id="digital-automation">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Automate Digital Services VAT Compliance
              </h2>
              <p className="text-lg text-gray-600">
                PayVat handles complex digital services VAT rules automatically for Irish businesses.
              </p>
            </div>
            
            <div className="card-premium p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Automated Compliance</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2"></div>
                      <span>Real-time customer location detection</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2"></div>
                      <span>Automatic VAT rate calculation by country</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2"></div>
                      <span>B2B reverse charge validation</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2"></div>
                      <span>OSS registration and returns</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Evidence & Documentation</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <span>Automatic location evidence collection</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <span>Compliant invoice generation</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <span>10-year audit trail storage</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <span>Quarterly OSS return preparation</span>
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
                    Start Digital Services VAT
                  </a>
                  <a 
                    href="/pricing" 
                    className="px-8 py-4 text-lg font-semibold text-cyan-600 border-2 border-cyan-200 rounded-xl hover:bg-cyan-50 transition-all duration-300"
                  >
                    View Digital Services Plans
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="scroll-section py-20 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Simplify Digital Services VAT Compliance?
            </h2>
            <p className="text-xl mb-8 text-cyan-100">
              Trusted by Irish digital businesses for automated EU VAT compliance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/signup" 
                className="bg-white text-cyan-600 px-8 py-4 text-lg font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-105"
              >
                Get Started Free
              </a>
              <a 
                href="/pricing" 
                className="border-2 border-white px-8 py-4 text-lg font-semibold rounded-xl hover:bg-white hover:text-cyan-600 transition-all duration-300"
              >
                View Pricing
              </a>
            </div>
            <p className="text-sm text-cyan-200 mt-6">
              Automated OSS compliance • Real-time VAT calculation • Audit-ready documentation
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
