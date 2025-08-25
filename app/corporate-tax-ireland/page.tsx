'use client'

import { useState, useEffect } from 'react'
import SiteHeader from '../../components/site-header'
import Footer from '../../components/footer'

export default function CorporateTaxIreland() {
  const [selectedTopic, setSelectedTopic] = useState('rates')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const topics = {
    rates: {
      name: 'Tax Rates',
      content: {
        title: 'Irish Corporation Tax Rates (2025)',
        items: [
          { label: 'Trading Income', rate: '12.5%', description: 'Active business trading profits' },
          { label: 'Passive Income', rate: '25%', description: 'Investment income, rental income (excluding property trading)' },
          { label: 'Capital Gains', rate: '33%', description: 'Gains on disposal of assets' },
          { label: 'Close Company Surcharge', rate: '20%', description: 'Undistributed investment income' }
        ]
      }
    },
    deadlines: {
      name: 'Filing Deadlines',
      content: {
        title: 'Corporation Tax Deadlines',
        items: [
          { label: 'Form CT1 Filing', rate: '9 months', description: 'After accounting period end' },
          { label: 'Tax Payment', rate: '9 months', description: 'After accounting period end for small companies' },
          { label: 'Large Company Payment', rate: '6 months', description: 'After accounting period end (turnover >€3m)' },
          { label: 'Preliminary Tax', rate: 'Month 6', description: '90% of current year liability' }
        ]
      }
    },
    reliefs: {
      name: 'Tax Reliefs',
      content: {
        title: 'Available Tax Reliefs',
        items: [
          { label: 'R&D Tax Credit', rate: '25%', description: 'Qualifying research and development expenditure' },
          { label: 'Capital Allowances', rate: 'Various', description: 'Plant, machinery, and equipment depreciation' },
          { label: 'Loss Relief', rate: '100%', description: 'Trading losses against profits' },
          { label: 'Group Relief', rate: '100%', description: 'Losses within company groups' }
        ]
      }
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white">

        {/* Interactive Tax Guide */}
        <section className="py-16 px-4" id="corporation-tax-guide">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-normal text-gray-900 mb-4">
                Interactive Corporation Tax Guide
              </h2>
              <p className="text-lg text-gray-600">
                Explore different aspects of Irish corporation tax with detailed breakdowns.
              </p>
            </div>
            
            <div className="card-premium p-8">
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                {Object.entries(topics).map(([key, topic]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedTopic(key)}
                    className={`p-4 text-center rounded-lg transition-all duration-300 ${
                      selectedTopic === key
                        ? 'bg-rose-600 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-rose-50'
                    }`}
                  >
                    <h3 className="font-normal">{topic.name}</h3>
                  </button>
                ))}
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-2xl font-normal text-gray-900 mb-6">{topics[selectedTopic as keyof typeof topics].content.title}</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {topics[selectedTopic as keyof typeof topics].content.items.map((item, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-normal text-gray-900">{item.label}</h4>
                        <span className="bg-rose-100 text-rose-800 px-2 py-1 rounded text-sm font-normal">
                          {item.rate}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Corporation Tax Calculation */}
        <section className="py-16 px-4 bg-gray-50" id="tax-calculation">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-normal text-gray-900 mb-4">
                Corporation Tax Calculation Example
              </h2>
              <p className="text-lg text-gray-600">
                See how corporation tax is calculated for a typical Irish company.
              </p>
            </div>
            
            <div className="card-premium p-8">
              <h3 className="text-2xl font-normal text-gray-900 mb-6">Example Company Calculation</h3>
              <div className="bg-blue-50 p-6 rounded-lg mb-6">
                <h4 className="font-normal text-blue-900 mb-4">Company Profile</h4>
                <ul className="text-petrol-dark text-sm space-y-1">
                  <li>• Software development company</li>
                  <li>• Annual trading profits: €500,000</li>
                  <li>• Property rental income: €50,000</li>
                  <li>• Capital gain on asset sale: €100,000</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <span className="font-normal text-gray-700">Trading Profits @ 12.5%:</span>
                  <span className="font-normal text-gray-900">€500,000 × 12.5% = €62,500</span>
                </div>
                
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <span className="font-normal text-gray-700">Rental Income @ 25%:</span>
                  <span className="font-normal text-gray-900">€50,000 × 25% = €12,500</span>
                </div>
                
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <span className="font-normal text-gray-700">Capital Gains @ 33%:</span>
                  <span className="font-normal text-gray-900">€100,000 × 33% = €33,000</span>
                </div>
                
                <div className="flex justify-between items-center pt-3 text-lg">
                  <span className="font-normal text-gray-900">Total Corporation Tax:</span>
                  <span className="font-normal text-rose-600">€108,000</span>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg mt-6">
                  <p className="text-green-800 text-sm">
                    <strong>Effective Rate:</strong> €108,000 ÷ €650,000 = 16.6% overall
                    (The low 12.5% rate on trading income keeps the overall rate competitive)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filing Requirements */}
        <section className="py-16 px-4" id="filing-requirements">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-normal text-gray-900 mb-4">
                Corporation Tax Filing Requirements
              </h2>
              <p className="text-lg text-gray-600">
                Key obligations and deadlines for Irish companies.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="card-modern p-8">
                <h3 className="text-2xl font-normal text-gray-900 mb-6">Annual Obligations</h3>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-normal text-blue-900 mb-2">Form CT1 Return</h4>
                    <ul className="text-petrol-dark text-sm space-y-1">
                      <li>• Due 9 months after year end</li>
                      <li>• Must be filed even if no tax due</li>
                      <li>• Include audited accounts</li>
                      <li>• Submit via ROS online</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-normal text-green-900 mb-2">Annual Return of Accounting Period</h4>
                    <ul className="text-green-800 text-sm space-y-1">
                      <li>• Due 9 months after year end</li>
                      <li>• Filed alongside CT1</li>
                      <li>• Details company activities</li>
                      <li>• Mandatory for all companies</li>
                    </ul>
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-normal text-orange-900 mb-2">CRO Annual Return</h4>
                    <ul className="text-orange-800 text-sm space-y-1">
                      <li>• Due by annual return date</li>
                      <li>• Filed with Companies Registration Office</li>
                      <li>• Include audited financial statements</li>
                      <li>• Penalties for late filing</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="card-modern p-8">
                <h3 className="text-2xl font-normal text-gray-900 mb-6">Payment Requirements</h3>
                <div className="space-y-4">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-normal text-purple-900 mb-2">Small Companies (Turnover ≤€3m)</h4>
                    <ul className="text-purple-800 text-sm space-y-1">
                      <li>• Pay in full 9 months after year end</li>
                      <li>• No preliminary tax required</li>
                      <li>• Late payment interest: 0.0274% per day</li>
                      <li>• Automatic entitlement</li>
                    </ul>
                  </div>
                  
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-normal text-red-900 mb-2">Large Companies (Turnover &gt;€3m)</h4>
                    <ul className="text-red-800 text-sm space-y-1">
                      <li>• Pay in full 6 months after year end</li>
                      <li>• Preliminary tax due in month 6</li>
                      <li>• Must pay 90% of current year liability</li>
                      <li>• Higher penalties for late payment</li>
                    </ul>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-normal text-yellow-900 mb-2">Payment Methods</h4>
                    <ul className="text-yellow-800 text-sm space-y-1">
                      <li>• ROS online payment</li>
                      <li>• Bank transfer to Revenue</li>
                      <li>• Direct debit arrangement</li>
                      <li>• Standing order for installments</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tax Planning Strategies */}
        <section className="py-16 px-4 bg-gray-50" id="tax-planning">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-normal text-gray-900 mb-4">
                Corporation Tax Planning Strategies
              </h2>
              <p className="text-lg text-gray-600">
                Legal strategies to optimize your company's tax position.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="card-premium p-8">
                <h3 className="text-2xl font-normal text-gray-900 mb-6">Key Planning Areas</h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-rose-600 font-normal text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="font-normal text-gray-900">Timing of Income & Expenses</h4>
                      <p className="text-gray-600">Accelerate deductible expenses and defer taxable income where possible to optimize cash flow.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-rose-600 font-normal text-sm">2</span>
                    </div>
                    <div>
                      <h4 className="font-normal text-gray-900">Capital Allowances Optimization</h4>
                      <p className="text-gray-600">Maximize capital allowances on plant, machinery, and equipment purchases to reduce taxable profits.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-rose-600 font-normal text-sm">3</span>
                    </div>
                    <div>
                      <h4 className="font-normal text-gray-900">R&D Tax Credits</h4>
                      <p className="text-gray-600">Claim 25% R&D tax credits for qualifying research and development expenditure.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-rose-600 font-normal text-sm">4</span>
                    </div>
                    <div>
                      <h4 className="font-normal text-gray-900">Pension Contributions</h4>
                      <p className="text-gray-600">Corporate pension contributions are fully deductible and provide valuable employee benefits.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-rose-600 font-normal text-sm">5</span>
                    </div>
                    <div>
                      <h4 className="font-normal text-gray-900">Loss Relief Planning</h4>
                      <p className="text-gray-600">Utilize trading losses effectively through carry forward or group relief arrangements.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Common Compliance Issues */}
        <section className="py-16 px-4" id="compliance-issues">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-normal text-gray-900 mb-4">
                Common Corporation Tax Compliance Issues
              </h2>
              <p className="text-lg text-gray-600">
                Avoid these common mistakes that can lead to penalties and interest.
              </p>
            </div>
            
            <div className="card-premium p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-normal text-gray-900 mb-4">Filing Errors</h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <span className="text-red-500 mt-1">×</span>
                      <span className="text-gray-700 text-sm">Late filing of CT1 returns</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-red-500 mt-1">×</span>
                      <span className="text-gray-700 text-sm">Incorrect income classification</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-red-500 mt-1">×</span>
                      <span className="text-gray-700 text-sm">Missing supporting documentation</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-red-500 mt-1">×</span>
                      <span className="text-gray-700 text-sm">Failure to file nil returns</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-normal text-gray-900 mb-4">Payment Mistakes</h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <span className="text-red-500 mt-1">×</span>
                      <span className="text-gray-700 text-sm">Late payment penalties</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-red-500 mt-1">×</span>
                      <span className="text-gray-700 text-sm">Insufficient preliminary tax</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-red-500 mt-1">×</span>
                      <span className="text-gray-700 text-sm">Missing payment deadlines</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-red-500 mt-1">×</span>
                      <span className="text-gray-700 text-sm">Incorrect ROS payments</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 bg-green-50 p-6 rounded-lg">
                <h4 className="font-normal text-green-900 mb-3">Best Practice Recommendations</h4>
                <ul className="text-green-800 text-sm space-y-2">
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Set up calendar reminders for all filing deadlines</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Use professional accounting software for accuracy</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Engage qualified accountants for complex matters</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>Keep detailed records and supporting documentation</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 px-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-normal mb-6">
              Simplify Your Corporation Tax Compliance
            </h2>
            <p className="text-xl mb-8 text-rose-100">
              Stop worrying about corporation tax deadlines and calculations. PayVat automates compliance and maximizes your tax efficiency.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/signup" 
                className="bg-white text-rose-600 px-8 py-4 text-lg font-normal rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-105"
              >
                Get Corporation Tax Help
              </a>
              <a 
                href="/pricing" 
                className="border-2 border-white px-8 py-4 text-lg font-normal rounded-xl hover:bg-white hover:text-rose-600 transition-all duration-300"
              >
                View Tax Plans
              </a>
            </div>
            <p className="text-sm text-rose-200 mt-6">
              Join Irish companies using PayVat for corporation tax
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
