'use client'

import { useState, useEffect } from 'react'
import SiteHeader from '../../components/site-header'
import Footer from '../../components/footer'

export default function BusinessStructureComparison() {
  const [selectedStructure, setSelectedStructure] = useState('sole-trader')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const structures = {
    'sole-trader': {
      name: 'Sole Trader',
      setup: 'Very Simple',
      liability: 'Unlimited Personal',
      tax: '20-40% Income Tax',
      cost: '€0-50',
      advantages: ['Quick setup', 'Low cost', 'Full control', 'Simple tax'],
      disadvantages: ['Personal liability', 'Hard to raise capital', 'No salary', 'Limited growth']
    },
    'partnership': {
      name: 'Partnership',
      setup: 'Simple',
      liability: 'Unlimited Joint',
      tax: '20-40% Income Tax',
      cost: '€100-300',
      advantages: ['Shared resources', 'Skill combination', 'Tax efficiency', 'Flexible'],
      disadvantages: ['Joint liability', 'Shared control', 'Partner disputes', 'Unlimited liability']
    },
    'limited-company': {
      name: 'Limited Company',
      setup: 'Moderate',
      liability: 'Limited to Shares',
      tax: '12.5% Corporation Tax',
      cost: '€300-1,000',
      advantages: ['Limited liability', 'Tax efficiency', 'Credibility', 'Investment ready'],
      disadvantages: ['More paperwork', 'Annual filings', 'Director duties', 'Higher costs']
    },
    'dac': {
      name: 'DAC',
      setup: 'Complex',
      liability: 'Limited to Shares',
      tax: '12.5% Corporation Tax',
      cost: '€500-2,000',
      advantages: ['Flexible objects', 'Limited liability', 'Professional image', 'Investment suitable'],
      disadvantages: ['Complex setup', 'Higher costs', 'More compliance', 'Director duties']
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        {/* Hero Section */}
        <section className={`relative py-20 px-4 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 bg-indigo-50 rounded-full text-indigo-700 text-sm font-medium mb-6 animate-pulse">
              <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
              Business Structure Comparison Tool
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Compare Irish 
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Business Structures
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Interactive tool to compare sole trader, partnership, limited company, and DAC structures. Find the best setup for your Irish business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/signup" 
                className="btn-primary px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                Get Structure Recommendation
              </a>
              <a 
                href="#structure-comparison" 
                className="px-8 py-4 text-lg font-semibold text-indigo-600 border-2 border-indigo-200 rounded-xl hover:bg-indigo-50 transition-all duration-300"
              >
                Compare Structures
              </a>
            </div>
          </div>
        </section>

        {/* Interactive Comparison Tool */}
        <section className="py-16 px-4" id="structure-comparison">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Interactive Business Structure Comparison
              </h2>
              <p className="text-lg text-gray-600">
                Select a business structure to see detailed comparisons and suitability.
              </p>
            </div>
            
            <div className="card-premium p-8">
              <div className="grid md:grid-cols-4 gap-4 mb-8">
                {Object.entries(structures).map(([key, structure]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedStructure(key)}
                    className={`p-4 text-center rounded-lg transition-all duration-300 ${
                      selectedStructure === key
                        ? 'bg-indigo-600 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-indigo-50'
                    }`}
                  >
                    <h3 className="font-bold">{structure.name}</h3>
                    <p className="text-sm mt-1">{structure.setup} Setup</p>
                  </button>
                ))}
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">{structures[selectedStructure as keyof typeof structures].name} Overview</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Setup Complexity</h4>
                      <p className="text-gray-700">{structures[selectedStructure as keyof typeof structures].setup}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Liability</h4>
                      <p className="text-gray-700">{structures[selectedStructure as keyof typeof structures].liability}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Tax Rate</h4>
                      <p className="text-gray-700">{structures[selectedStructure as keyof typeof structures].tax}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Setup Cost</h4>
                      <p className="text-gray-700">{structures[selectedStructure as keyof typeof structures].cost}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Pros & Cons</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-green-900 mb-3">Advantages</h4>
                      <ul className="space-y-2">
                        {structures[selectedStructure as keyof typeof structures].advantages.map((advantage, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-green-500 mt-1">✓</span>
                            <span className="text-green-800">{advantage}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-red-900 mb-3">Disadvantages</h4>
                      <ul className="space-y-2">
                        {structures[selectedStructure as keyof typeof structures].disadvantages.map((disadvantage, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-red-500 mt-1">×</span>
                            <span className="text-red-800">{disadvantage}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Structure Breakdown */}
        <section className="py-16 px-4 bg-gray-50" id="structure-details">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Detailed Business Structure Analysis
              </h2>
              <p className="text-lg text-gray-600">
                In-depth comparison across key business considerations.
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-lg shadow-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Criteria</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Sole Trader</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Partnership</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Limited Company</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">DAC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 font-medium text-gray-900">Setup Time</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">Same day</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">1-3 days</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">5-10 days</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">10-15 days</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">Annual Compliance</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">Form 11</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">Form 1</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">Form 1 + CRO</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">Form 1 + CRO</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-gray-900">Tax Efficiency</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">Low</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">Medium</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">High</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">High</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">Investment Appeal</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">Very Low</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">Low</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">High</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">Very High</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-gray-900">Credibility</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">Low</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">Medium</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">High</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">Very High</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">Ongoing Costs</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">€200/year</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">€400/year</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">€800/year</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-700">€1,200/year</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Decision Framework */}
        <section className="py-16 px-4" id="decision-framework">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Which Structure is Right for You?
              </h2>
              <p className="text-lg text-gray-600">
                Use this decision framework to determine the best business structure for your situation.
              </p>
            </div>
            
            <div className="space-y-8">
              <div className="card-premium p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Business Stage & Goals</h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Early Stage / Testing</h4>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="font-semibold text-green-900 mb-2">Recommended: Sole Trader</p>
                      <ul className="text-green-800 text-sm space-y-1">
                        <li>• Quick to start</li>
                        <li>• Low cost</li>
                        <li>• Easy to wind down</li>
                        <li>• Simple accounting</li>
                      </ul>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Growth / Investment</h4>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="font-semibold text-blue-900 mb-2">Recommended: Limited Company</p>
                      <ul className="text-blue-800 text-sm space-y-1">
                        <li>• Limited liability protection</li>
                        <li>• Tax efficiency</li>
                        <li>• Investment ready</li>
                        <li>• Professional credibility</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card-premium p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Risk & Liability</h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Low Risk Business</h4>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <p className="font-semibold text-yellow-900 mb-2">Consider: Sole Trader or Partnership</p>
                      <ul className="text-yellow-800 text-sm space-y-1">
                        <li>• Consulting services</li>
                        <li>• Digital services</li>
                        <li>• Professional services</li>
                        <li>• Low capital requirements</li>
                      </ul>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">High Risk Business</h4>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="font-semibold text-red-900 mb-2">Recommended: Limited Company/DAC</p>
                      <ul className="text-red-800 text-sm space-y-1">
                        <li>• Manufacturing</li>
                        <li>• Construction</li>
                        <li>• High liability sectors</li>
                        <li>• Large contracts</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card-premium p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Financial Considerations</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-indigo-600 font-bold text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Annual Turnover Under €50,000</h4>
                      <p className="text-gray-600">Sole trader often most tax-efficient due to low income tax bands</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-indigo-600 font-bold text-sm">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Annual Turnover €50,000-€200,000</h4>
                      <p className="text-gray-600">Limited company becomes more tax-efficient with 12.5% corporation tax</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-indigo-600 font-bold text-sm">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Annual Turnover Above €200,000</h4>
                      <p className="text-gray-600">Limited company strongly recommended for tax efficiency and credibility</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Structure Migration */}
        <section className="py-16 px-4 bg-gray-50" id="structure-migration">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Changing Business Structure
              </h2>
              <p className="text-lg text-gray-600">
                You can change your business structure as your business grows and needs evolve.
              </p>
            </div>
            
            <div className="card-premium p-8">
              <div className="space-y-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-blue-900 mb-4">Sole Trader to Limited Company</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">When to Consider:</h4>
                      <ul className="text-blue-800 text-sm space-y-1">
                        <li>• Profits exceeding €50,000</li>
                        <li>• Need liability protection</li>
                        <li>• Seeking investment</li>
                        <li>• Building credibility</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">Process:</h4>
                      <ul className="text-blue-800 text-sm space-y-1">
                        <li>• Cease sole trader business</li>
                        <li>• Incorporate new company</li>
                        <li>• Transfer assets/contracts</li>
                        <li>• Consider tax implications</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-green-900 mb-4">Partnership to Limited Company</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-green-900 mb-2">Benefits:</h4>
                      <ul className="text-green-800 text-sm space-y-1">
                        <li>• Remove personal liability</li>
                        <li>• Better tax efficiency</li>
                        <li>• Clear ownership structure</li>
                        <li>• Investment opportunities</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-900 mb-2">Considerations:</h4>
                      <ul className="text-green-800 text-sm space-y-1">
                        <li>• All partners must agree</li>
                        <li>• Asset transfer implications</li>
                        <li>• Shareholding structure</li>
                        <li>• Professional advice needed</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Get Expert Structure Advice
            </h2>
            <p className="text-xl mb-8 text-indigo-100">
              Unsure which business structure is right for you? Get personalized recommendations based on your specific situation and goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/signup" 
                className="bg-white text-indigo-600 px-8 py-4 text-lg font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-105"
              >
                Get Structure Consultation
              </a>
              <a 
                href="/complete-business-setup-guide-ireland" 
                className="border-2 border-white px-8 py-4 text-lg font-semibold rounded-xl hover:bg-white hover:text-indigo-600 transition-all duration-300"
              >
                Complete Setup Guide
              </a>
            </div>
            <p className="text-sm text-indigo-200 mt-6">
              Join 2,000+ Irish entrepreneurs who chose the right structure
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}