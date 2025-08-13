'use client'

import { useState, useEffect, useCallback } from 'react'
import SiteHeader from '../../components/site-header'
import Footer from '../../components/footer'

interface VatResult {
  net: string
  vat: string
  total: string
  rate: string
}

export default function VatCalculatorIreland() {
  const [amount, setAmount] = useState('')
  const [vatRate, setVatRate] = useState('23')
  const [calculationType, setCalculationType] = useState('exclusive')
  const [result, setResult] = useState<VatResult | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const calculateVat = useCallback(() => {
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) return

    const rate = parseFloat(vatRate) / 100
    let vatAmount, totalAmount, netAmount

    if (calculationType === 'exclusive') {
      // Amount is net, add VAT
      netAmount = numAmount
      vatAmount = numAmount * rate
      totalAmount = numAmount + vatAmount
    } else {
      // Amount is gross, extract VAT
      totalAmount = numAmount
      netAmount = numAmount / (1 + rate)
      vatAmount = totalAmount - netAmount
    }

    setResult({
      net: netAmount.toFixed(2),
      vat: vatAmount.toFixed(2),
      total: totalAmount.toFixed(2),
      rate: vatRate
    })
  }, [amount, vatRate, calculationType])

  useEffect(() => {
    if (amount) {
      calculateVat()
    }
  }, [amount, vatRate, calculationType, calculateVat])

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
              Irish VAT Calculator
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              VAT Calculator for 
              <span className="text-gradient-primary">
                Ireland (2025)
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Free Irish VAT calculator. Add or extract VAT at 23%, 13.5%, 9%, or 0% rates. Perfect for businesses, freelancers, and accountants.
            </p>
          </div>
        </section>

        {/* VAT Calculator Tool */}
        <section className="py-16 px-4" id="vat-calculator">
          <div className="max-w-4xl mx-auto">
            <div className="card-premium p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Irish VAT Calculator
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Amount (€)
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base sm:text-lg min-h-[48px] transition-all duration-200 bg-white"
                      inputMode="decimal"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      VAT Rate
                    </label>
                    <select
                      value={vatRate}
                      onChange={(e) => setVatRate(e.target.value)}
                      className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base sm:text-lg min-h-[48px] bg-white transition-all duration-200"
                    >
                      <option value="23">23% - Standard Rate</option>
                      <option value="13.5">13.5% - Reduced Rate</option>
                      <option value="9">9% - Second Reduced Rate</option>
                      <option value="0">0% - Zero Rate</option>
                      <option value="4.8">4.8% - Livestock Rate</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Calculation Type
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center p-3 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-teal-300 transition-colors min-h-[48px]">
                        <input
                          type="radio"
                          value="exclusive"
                          checked={calculationType === 'exclusive'}
                          onChange={(e) => setCalculationType(e.target.value)}
                          className="mr-3 text-teal-600 scale-125"
                        />
                        <span className="text-sm sm:text-base">Amount is VAT exclusive (add VAT)</span>
                      </label>
                      <label className="flex items-center p-3 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-teal-300 transition-colors min-h-[48px]">
                        <input
                          type="radio"
                          value="inclusive"
                          checked={calculationType === 'inclusive'}
                          onChange={(e) => setCalculationType(e.target.value)}
                          className="mr-3 text-teal-600 scale-125"
                        />
                        <span className="text-sm sm:text-base">Amount is VAT inclusive (extract VAT)</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-4 sm:p-6 rounded-2xl border border-teal-100">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 text-center">VAT Calculation Result</h3>
                  {result ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100 min-h-[48px]">
                        <span className="font-semibold text-gray-700 text-sm sm:text-base">Net Amount:</span>
                        <span className="font-bold text-gray-900 text-base sm:text-lg">€{result.net}</span>
                      </div>
                      <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-teal-200 min-h-[48px]">
                        <span className="font-semibold text-gray-700 text-sm sm:text-base">VAT ({result.rate}%):</span>
                        <span className="font-bold text-teal-600 text-base sm:text-lg">€{result.vat}</span>
                      </div>
                      <div className="flex justify-between items-center bg-teal-600 text-white p-4 rounded-lg shadow-lg min-h-[56px]">
                        <span className="font-bold text-base sm:text-lg">Total Amount:</span>
                        <span className="font-bold text-xl sm:text-2xl">€{result.total}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4 opacity-20">🧮</div>
                      <p className="text-gray-500 text-sm sm:text-base">Enter an amount to calculate VAT</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Irish VAT Rates Guide */}
        <section className="py-16 px-4 bg-gray-50" id="vat-rates-guide">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Irish VAT Rates Guide (2025)
              </h2>
              <p className="text-lg text-gray-600">
                Complete breakdown of VAT rates and what they apply to in Ireland.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="card-modern p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Standard & Reduced Rates</h3>
                <div className="space-y-4">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-bold text-red-600 text-lg mb-2">23% - Standard Rate</h4>
                    <ul className="text-red-800 text-sm space-y-1">
                      <li>• Most goods and services</li>
                      <li>• Electronics, clothing, professional services</li>
                      <li>• Equipment hire, plant hire</li>
                      <li>• Legal, accounting, consulting</li>
                    </ul>
                  </div>
                  
                  <div className="bg-teal-50 p-4 rounded-lg">
                    <h4 className="font-bold text-teal-600 text-lg mb-2">13.5% - Reduced Rate</h4>
                    <ul className="text-teal-800 text-sm space-y-1">
                      <li>• Construction services</li>
                      <li>• Restaurant meals and catering</li>
                      <li>• Fuel and heating</li>
                      <li>• Repair and maintenance services</li>
                    </ul>
                  </div>
                  
                  <div className="bg-teal-50 p-4 rounded-lg">
                    <h4 className="font-bold text-teal-600 text-lg mb-2">9% - Second Reduced Rate</h4>
                    <ul className="text-teal-800 text-sm space-y-1">
                      <li>• Newspapers and magazines</li>
                      <li>• Sporting facilities</li>
                      <li>• Hairdressing services</li>
                      <li>• Hotel accommodation</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="card-modern p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Zero & Special Rates</h3>
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-bold text-green-600 text-lg mb-2">0% - Zero Rate</h4>
                    <ul className="text-green-800 text-sm space-y-1">
                      <li>• Most food and drink</li>
                      <li>• Books and educational materials</li>
                      <li>• Children's clothing and footwear</li>
                      <li>• Medical equipment and medicines</li>
                      <li>• Exports outside EU</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-bold text-teal-600 text-lg mb-2">4.8% - Livestock Rate</h4>
                    <ul className="text-blue-800 text-sm space-y-1">
                      <li>• Cattle, sheep, pigs</li>
                      <li>• Horses for food production</li>
                      <li>• Greyhounds</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <h4 className="font-bold text-gray-600 text-lg mb-2">Exempt (No VAT)</h4>
                    <ul className="text-gray-700 text-sm space-y-1">
                      <li>• Financial services</li>
                      <li>• Insurance services</li>
                      <li>• Medical and dental services</li>
                      <li>• Education services</li>
                      <li>• Postal services</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VAT Registration Thresholds */}
        <section className="py-16 px-4" id="vat-thresholds">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                VAT Registration Thresholds Ireland
              </h2>
              <p className="text-lg text-gray-600">
                When you must register for VAT in Ireland depends on your turnover and business type.
              </p>
            </div>
            
            <div className="card-premium p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="text-5xl font-bold text-teal-600 mb-4">€42,500</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Services Threshold</h3>
                  <p className="text-gray-600">Annual turnover for service providers including freelancers, consultants, and professionals.</p>
                </div>
                
                <div className="text-center">
                  <div className="text-5xl font-bold text-teal-600 mb-4">€85,000</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Goods Threshold</h3>
                  <p className="text-gray-600">Annual turnover for businesses selling physical goods including retailers and manufacturers.</p>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <div className="bg-teal-50 p-4 rounded-lg mb-6">
                  <p className="text-teal-800 font-medium">
                    <strong>Important:</strong> You must register within 30 days of exceeding these thresholds. 
                    Many businesses register voluntarily before reaching thresholds to reclaim input VAT.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a 
                    href="/signup" 
                    className="btn-primary px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105"
                  >
                    Check VAT Registration
                  </a>
                  <a 
                    href="/vat-registration-checker" 
                    className="px-8 py-4 text-lg font-semibold text-green-600 border-2 border-green-200 rounded-xl hover:bg-green-50 transition-all duration-300"
                  >
                    Use Registration Checker
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 px-4 bg-teal-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Need More Than Just VAT Calculation?
            </h2>
            <p className="text-xl mb-8 text-green-100">
              Get complete VAT compliance automation for your Irish business. Invoicing, returns, and deadlines handled automatically.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/signup" 
                className="bg-white text-green-600 px-8 py-4 text-lg font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-105"
              >
                Start Free Trial
              </a>
              <a 
                href="/pricing" 
                className="border-2 border-white px-8 py-4 text-lg font-semibold rounded-xl hover:bg-white hover:text-green-600 transition-all duration-300"
              >
                View Pricing
              </a>
            </div>
            <p className="text-sm text-green-200 mt-6">
              Reliable VAT compliance service • Never miss a deadline
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}