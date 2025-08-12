'use client'

import { useState, useEffect } from 'react'
import SiteHeader from '../../components/site-header'
import Footer from '../../components/footer'

export default function VatRegistrationChecker() {
  const [businessType, setBusinessType] = useState('')
  const [annualTurnover, setAnnualTurnover] = useState('')
  const [projectedTurnover, setProjectedTurnover] = useState('')
  const [result, setResult] = useState(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const checkVatRequirement = () => {
    if (!businessType || !annualTurnover) return

    const turnover = parseFloat(annualTurnover)
    const projected = parseFloat(projectedTurnover) || 0
    const threshold = businessType === 'goods' ? 85000 : 42500
    
    let status = 'not-required'
    let message = ''
    let recommendation = ''
    let timeline = ''

    if (turnover >= threshold) {
      status = 'required'
      message = `VAT registration is mandatory. You've exceeded the €${threshold.toLocaleString()} threshold.`
      recommendation = 'You must register for VAT within 30 days of exceeding the threshold.'
      timeline = 'Register immediately'
    } else if (projected >= threshold) {
      status = 'will-be-required'
      message = `VAT registration will be required. Your projected turnover exceeds €${threshold.toLocaleString()}.`
      recommendation = 'Register for VAT when you expect to exceed the threshold in the next 30 days.'
      timeline = 'Register before threshold is reached'
    } else if (turnover >= threshold * 0.8) {
      status = 'consider'
      message = `VAT registration not required yet, but consider voluntary registration.`
      recommendation = 'Voluntary registration may be beneficial for credibility and input VAT recovery.'
      timeline = 'Optional - consider benefits'
    } else {
      status = 'not-required'
      message = `VAT registration not required. Current turnover is below €${threshold.toLocaleString()}.`
      recommendation = 'Monitor turnover and register when approaching threshold.'
      timeline = 'No action needed currently'
    }

    setResult({
      status,
      message,
      recommendation,
      timeline,
      threshold,
      turnover,
      businessType
    })
  }

  useEffect(() => {
    if (businessType && annualTurnover) {
      checkVatRequirement()
    }
  }, [businessType, annualTurnover, projectedTurnover])

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        {/* Hero Section */}
        <section className={`relative py-20 px-4 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 bg-emerald-50 rounded-full text-emerald-700 text-sm font-medium mb-6 animate-pulse">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
              VAT Registration Checker Tool
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              VAT Registration 
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Checker Ireland
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Free tool to check if you need VAT registration in Ireland. Instant analysis based on your business type and turnover with personalized recommendations.
            </p>
          </div>
        </section>

        {/* VAT Registration Checker Tool */}
        <section className="py-16 px-4" id="vat-checker">
          <div className="max-w-4xl mx-auto">
            <div className="card-premium p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                VAT Registration Requirement Checker
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Type
                    </label>
                    <select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg"
                    >
                      <option value="">Select business type</option>
                      <option value="services">Services (€42,500 threshold)</option>
                      <option value="goods">Goods (€85,000 threshold)</option>
                      <option value="mixed">Mixed Goods & Services</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Annual Turnover (€)
                    </label>
                    <input
                      type="number"
                      value={annualTurnover}
                      onChange={(e) => setAnnualTurnover(e.target.value)}
                      placeholder="Enter current annual turnover"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Projected Annual Turnover (€) - Optional
                    </label>
                    <input
                      type="number"
                      value={projectedTurnover}
                      onChange={(e) => setProjectedTurnover(e.target.value)}
                      placeholder="Enter projected turnover if growing"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg"
                    />
                  </div>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">VAT Registration Status</h3>
                  {result ? (
                    <div className="space-y-4">
                      <div className={`p-4 rounded-lg ${
                        result.status === 'required' ? 'bg-red-50 border border-red-200' :
                        result.status === 'will-be-required' ? 'bg-yellow-50 border border-yellow-200' :
                        result.status === 'consider' ? 'bg-blue-50 border border-blue-200' :
                        'bg-green-50 border border-green-200'
                      }`}>
                        <div className={`text-lg font-bold mb-2 ${
                          result.status === 'required' ? 'text-red-900' :
                          result.status === 'will-be-required' ? 'text-yellow-900' :
                          result.status === 'consider' ? 'text-blue-900' :
                          'text-green-900'
                        }`}>
                          {result.status === 'required' ? 'Registration Required' :
                           result.status === 'will-be-required' ? 'Registration Will Be Required' :
                           result.status === 'consider' ? 'Consider Registration' :
                           'Registration Not Required'}
                        </div>
                        <p className={`text-sm mb-3 ${
                          result.status === 'required' ? 'text-red-800' :
                          result.status === 'will-be-required' ? 'text-yellow-800' :
                          result.status === 'consider' ? 'text-blue-800' :
                          'text-green-800'
                        }`}>
                          {result.message}
                        </p>
                        <p className={`text-sm font-medium ${
                          result.status === 'required' ? 'text-red-900' :
                          result.status === 'will-be-required' ? 'text-yellow-900' :
                          result.status === 'consider' ? 'text-blue-900' :
                          'text-green-900'
                        }`}>
                          Timeline: {result.timeline}
                        </p>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg border">
                        <h4 className="font-semibold text-gray-900 mb-2">Recommendation</h4>
                        <p className="text-gray-700 text-sm">{result.recommendation}</p>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg border">
                        <h4 className="font-semibold text-gray-900 mb-2">Key Details</h4>
                        <ul className="text-gray-700 text-sm space-y-1">
                          <li>• Threshold: €{result.threshold.toLocaleString()}</li>
                          <li>• Current turnover: €{result.turnover.toLocaleString()}</li>
                          <li>• Business type: {result.businessType}</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center">Enter your business details to check VAT registration requirements</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VAT Thresholds Guide */}
        <section className="py-16 px-4 bg-gray-50" id="vat-thresholds">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Irish VAT Registration Thresholds (2025)
              </h2>
              <p className="text-lg text-gray-600">
                Current VAT registration requirements and thresholds for Irish businesses.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="card-modern p-8">
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold text-emerald-600 mb-2">€42,500</div>
                  <h3 className="text-2xl font-bold text-gray-900">Services Threshold</h3>
                  <p className="text-gray-600">Annual turnover for service providers</p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Includes:</h4>
                  <ul className="text-gray-700 text-sm space-y-1">
                    <li>• Consulting and professional services</li>
                    <li>• Digital and online services</li>
                    <li>• Training and education</li>
                    <li>• Financial and legal services</li>
                    <li>• Maintenance and repair services</li>
                    <li>• Most freelancer activities</li>
                  </ul>
                </div>
              </div>
              
              <div className="card-modern p-8">
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold text-blue-600 mb-2">€85,000</div>
                  <h3 className="text-2xl font-bold text-gray-900">Goods Threshold</h3>
                  <p className="text-gray-600">Annual turnover for goods suppliers</p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Includes:</h4>
                  <ul className="text-gray-700 text-sm space-y-1">
                    <li>• Physical product sales</li>
                    <li>• Manufacturing and production</li>
                    <li>• Retail and wholesale</li>
                    <li>• Import and export</li>
                    <li>• Construction materials</li>
                    <li>• E-commerce physical goods</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits of VAT Registration */}
        <section className="py-16 px-4" id="vat-benefits">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Benefits of VAT Registration
              </h2>
              <p className="text-lg text-gray-600">
                Why some businesses choose voluntary VAT registration even below thresholds.
              </p>
            </div>
            
            <div className="card-premium p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Financial Benefits</h3>
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">Input VAT Recovery</h4>
                      <p className="text-green-800 text-sm">Reclaim VAT on business expenses, equipment, and services - can save thousands annually</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Cash Flow Benefits</h4>
                      <p className="text-blue-800 text-sm">Monthly VAT refunds if input VAT exceeds output VAT in early trading periods</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-2">B2B Advantages</h4>
                      <p className="text-purple-800 text-sm">VAT-registered clients can reclaim VAT, making your services effectively cheaper</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Business Benefits</h3>
                  <div className="space-y-4">
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-orange-900 mb-2">Professional Credibility</h4>
                      <p className="text-orange-800 text-sm">VAT number signals established business status to clients and suppliers</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-red-900 mb-2">Future-Proofing</h4>
                      <p className="text-red-800 text-sm">Avoid mandatory registration disruption when rapidly approaching thresholds</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-yellow-900 mb-2">EU Trading</h4>
                      <p className="text-yellow-800 text-sm">Essential for B2B EU trading and accessing certain business opportunities</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VAT Registration Process */}
        <section className="py-16 px-4 bg-gray-50" id="registration-process">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                VAT Registration Process
              </h2>
              <p className="text-lg text-gray-600">
                Step-by-step guide to registering for VAT in Ireland.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="card-premium p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Registration Steps</h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-emerald-600 font-bold text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Determine Registration Need</h4>
                      <p className="text-gray-600">Use this checker tool or consult with accountant to confirm requirement</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-emerald-600 font-bold text-sm">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Prepare Documentation</h4>
                      <p className="text-gray-600">Business registration, bank details, activity description, and projected turnover</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-emerald-600 font-bold text-sm">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Submit Application</h4>
                      <p className="text-gray-600">Complete Form TR1 online through ROS or paper submission to Revenue</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-emerald-600 font-bold text-sm">4</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Receive VAT Number</h4>
                      <p className="text-gray-600">Processing takes 10-15 business days for complete applications</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-emerald-600 font-bold text-sm">5</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Setup VAT Systems</h4>
                      <p className="text-gray-600">Update invoicing, accounting, and start filing bi-monthly returns</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Need Help with VAT Registration?
            </h2>
            <p className="text-xl mb-8 text-emerald-100">
              Get expert VAT registration support and ongoing compliance management. We handle the complexity so you can focus on your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/signup" 
                className="bg-white text-emerald-600 px-8 py-4 text-lg font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-105"
              >
                Get VAT Registration Help
              </a>
              <a 
                href="/vat-calculator-ireland" 
                className="border-2 border-white px-8 py-4 text-lg font-semibold rounded-xl hover:bg-white hover:text-emerald-600 transition-all duration-300"
              >
                Use VAT Calculator
              </a>
            </div>
            <p className="text-sm text-emerald-200 mt-6">
              Join 4,000+ Irish businesses using PayVat for VAT compliance
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}