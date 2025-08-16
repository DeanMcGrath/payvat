'use client'

import { useState, useEffect } from 'react'
import SiteHeader from '../../components/site-header'
import Footer from '../../components/footer'

export default function PropertyRentalVatIreland() {
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

        {/* Residential vs Commercial VAT */}
        <section className="scroll-section py-16 px-4" id="rental-vat-guide">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Residential vs Commercial Property VAT
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                VAT treatment differs significantly between residential and commercial property rentals in Ireland.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="card-modern p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Residential Rentals</h3>
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">VAT Exempt</h4>
                    <ul className="text-green-800 text-sm space-y-1">
                      <li>• Long-term residential lettings exempt from VAT</li>
                      <li>• No VAT charged on rent</li>
                      <li>• Cannot reclaim VAT on property expenses</li>
                      <li>• No VAT registration required for residential only</li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Tax Treatment</h4>
                    <ul className="text-blue-800 text-sm space-y-1">
                      <li>• Income tax on rental profits</li>
                      <li>• PRSI and USC apply</li>
                      <li>• LPT responsibility</li>
                      <li>• RTB registration required</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="card-modern p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Commercial Rentals</h3>
                <div className="space-y-4">
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-900 mb-2">VAT Applicable</h4>
                    <ul className="text-orange-800 text-sm space-y-1">
                      <li>• Option to charge 23% VAT on rent</li>
                      <li>• Landlord and tenant must opt for VAT</li>
                      <li>• Can reclaim VAT on property expenses</li>
                      <li>• VAT registration required if opted</li>
                    </ul>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">Benefits of VAT Option</h4>
                    <ul className="text-purple-800 text-sm space-y-1">
                      <li>• Recover VAT on purchase/development</li>
                      <li>• Reclaim VAT on repairs/maintenance</li>
                      <li>• Better for VAT-registered tenants</li>
                      <li>• Avoid VAT clawback on new properties</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Short-Term Rentals & Airbnb */}
        <section className="scroll-section py-16 px-4 bg-gray-50" id="short-term-rentals">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Short-Term Rentals & Airbnb VAT
              </h2>
              <p className="text-lg text-gray-600">
                Special VAT rules apply to holiday homes and short-term accommodation.
              </p>
            </div>
            
            <div className="card-premium p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">VAT Treatment</h3>
                  <div className="space-y-4">
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-red-900 mb-2">Subject to VAT</h4>
                      <ul className="text-red-800 text-sm space-y-1">
                        <li>• Short-term lets are accommodation services</li>
                        <li>• 9% VAT rate applies (hospitality rate)</li>
                        <li>• Must register if exceeding €42,500</li>
                        <li>• Includes Airbnb, Booking.com, VRBO</li>
                      </ul>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-yellow-900 mb-2">Threshold Monitoring</h4>
                      <p className="text-yellow-800 text-sm">Track all short-term rental income across all platforms to monitor VAT threshold</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Compliance Requirements</h3>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Registration & Returns</h4>
                      <ul className="text-blue-800 text-sm space-y-1">
                        <li>• Register for VAT within 30 days</li>
                        <li>• Charge 9% VAT on accommodation</li>
                        <li>• File bi-monthly VAT returns</li>
                        <li>• Issue VAT receipts to guests</li>
                      </ul>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">Input VAT Recovery</h4>
                      <p className="text-green-800 text-sm">Can reclaim VAT on property expenses, utilities, cleaning, maintenance once registered</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VAT on Property Development */}
        <section className="scroll-section py-16 px-4" id="property-development">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                VAT on Property Development & Sales
              </h2>
              <p className="text-lg text-gray-600">
                Complex VAT rules apply to property development, sales, and transitions.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="card-modern p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">New Properties</h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <p className="font-semibold">13.5% VAT applies to:</p>
                  <ul className="space-y-1">
                    <li>• New residential properties</li>
                    <li>• Completed within 5 years</li>
                    <li>• First supply only</li>
                  </ul>
                  <div className="bg-gray-50 p-3 rounded mt-4">
                    <p className="text-xs">Subsequent sales exempt unless substantially developed</p>
                  </div>
                </div>
              </div>
              
              <div className="card-modern p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Commercial Properties</h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <p className="font-semibold">23% VAT on:</p>
                  <ul className="space-y-1">
                    <li>• New commercial buildings</li>
                    <li>• Substantially developed properties</li>
                    <li>• Option to tax older properties</li>
                  </ul>
                  <div className="bg-gray-50 p-3 rounded mt-4">
                    <p className="text-xs">Capital Goods Scheme may apply for adjustment</p>
                  </div>
                </div>
              </div>
              
              <div className="card-modern p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Transitional Properties</h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <p className="font-semibold">Two-Third Rule:</p>
                  <ul className="space-y-1">
                    <li>• Residential to commercial conversion</li>
                    <li>• Mixed-use developments</li>
                    <li>• Change of use planning</li>
                  </ul>
                  <div className="bg-gray-50 p-3 rounded mt-4">
                    <p className="text-xs">VAT clawback may apply on change of use</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Landlord Compliance Checklist */}
        <section className="scroll-section py-16 px-4 bg-gray-50" id="landlord-compliance">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Landlord VAT Compliance Checklist
              </h2>
              <p className="text-lg text-gray-600">
                Essential VAT considerations for Irish property landlords.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="card-premium p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Decision Points</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Should I Register for VAT?</h4>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li className="flex items-start space-x-2">
                        <span className="text-amber-500">✓</span>
                        <span>Commercial property - usually yes</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-amber-500">✓</span>
                        <span>Short-term lets over €42,500 - mandatory</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-amber-500">✓</span>
                        <span>Residential only - generally no</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-amber-500">✓</span>
                        <span>Mixed portfolio - consider carefully</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">VAT Recovery Opportunities</h4>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500">✓</span>
                        <span>Development and construction costs</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500">✓</span>
                        <span>Professional fees (legal, estate agents)</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500">✓</span>
                        <span>Repairs and maintenance</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500">✓</span>
                        <span>Property management services</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="card-premium p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Ongoing Obligations</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-amber-600 font-bold text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Monitor Thresholds</h4>
                      <p className="text-gray-600">Track rental income to identify VAT registration triggers</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-amber-600 font-bold text-sm">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Maintain Records</h4>
                      <p className="text-gray-600">Keep all invoices, receipts, and rental agreements for 6 years</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-amber-600 font-bold text-sm">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">File Returns</h4>
                      <p className="text-gray-600">Submit bi-monthly VAT returns if registered, even for nil amounts</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-amber-600 font-bold text-sm">4</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Review Portfolio</h4>
                      <p className="text-gray-600">Annual review of VAT position as portfolio changes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="scroll-section py-20 px-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Simplify Property Rental VAT Compliance
            </h2>
            <p className="text-xl mb-8 text-amber-100">
              PayVat handles complex property VAT rules automatically. From residential exemptions to commercial options and short-term rental compliance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/signup" 
                className="bg-white text-amber-600 px-8 py-4 text-lg font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-105"
              >
                Start Property VAT Setup
              </a>
              <a 
                href="/pricing" 
                className="border-2 border-white px-8 py-4 text-lg font-semibold rounded-xl hover:bg-white hover:text-amber-600 transition-all duration-300"
              >
                View Property Plans
              </a>
            </div>
            <p className="text-sm text-amber-200 mt-6">
              Join 1,500+ Irish landlords using PayVat for rental compliance
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
