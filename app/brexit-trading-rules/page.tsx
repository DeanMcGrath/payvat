'use client'

import { useState, useEffect } from 'react'
import SiteHeader from '../../components/site-header'
import Footer from '../../components/footer'

export default function BrexitTradingRules() {
  const [selectedRoute, setSelectedRoute] = useState('eu-uk')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const tradingRoutes = {
    'eu-uk': {
      name: 'Ireland to UK',
      direction: 'Export',
      rules: [
        { title: 'Customs Declarations', description: 'Full customs procedures now apply for all goods', required: true },
        { title: 'VAT Zero-Rating', description: 'Export goods to UK are zero-rated for VAT', vat: '0%' },
        { title: 'Rules of Origin', description: 'Preferential tariffs under Trade and Cooperation Agreement', required: true },
        { title: 'Export Documentation', description: 'Commercial invoices, packing lists, transport documents', required: true }
      ]
    },
    'uk-eu': {
      name: 'UK to Ireland',
      direction: 'Import',
      rules: [
        { title: 'Import VAT', description: 'VAT payable on imports from UK (postponed accounting available)', vat: '23%' },
        { title: 'Customs Duty', description: 'Duties may apply depending on origin and tariff classification', required: true },
        { title: 'Import Licenses', description: 'May be required for certain controlled goods', required: false },
        { title: 'Border Controls', description: 'Full border checks and documentation required', required: true }
      ]
    },
    'ni-special': {
      name: 'Northern Ireland',
      direction: 'Special Rules',
      rules: [
        { title: 'NI Protocol Benefits', description: 'Northern Ireland remains aligned with EU single market for goods', vat: 'EU rates' },
        { title: 'Dual Market Access', description: 'Access to both UK and EU markets from Northern Ireland', required: true },
        { title: 'EU VAT Rules', description: 'EU VAT rules apply for goods in Northern Ireland', vat: 'EU VAT' },
        { title: 'Qualifying Supplier Relief', description: 'Businesses may qualify for reduced compliance burden', required: false }
      ]
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
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full text-blue-700 text-sm font-medium mb-6 animate-pulse">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Brexit Trading Rules Guide
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Brexit Trading Rules for 
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Ireland (2025)
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Complete guide to post-Brexit trading between Ireland and UK. VAT rules, customs procedures, Northern Ireland Protocol, and compliance requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/signup" 
                className="btn-primary px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                Get Brexit Trading Help
              </a>
              <a 
                href="#brexit-trading-guide" 
                className="px-8 py-4 text-lg font-semibold text-blue-600 border-2 border-blue-200 rounded-xl hover:bg-blue-50 transition-all duration-300"
              >
                View Trading Rules
              </a>
            </div>
          </div>
        </section>

        {/* Interactive Trading Routes Guide */}
        <section className="py-16 px-4" id="brexit-trading-guide">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Post-Brexit Trading Routes
              </h2>
              <p className="text-lg text-gray-600">
                Explore the different trading scenarios and their specific requirements.
              </p>
            </div>
            
            <div className="card-premium p-8">
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                {Object.entries(tradingRoutes).map(([key, route]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedRoute(key)}
                    className={`p-4 text-center rounded-lg transition-all duration-300 ${
                      selectedRoute === key
                        ? 'bg-blue-600 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-blue-50'
                    }`}
                  >
                    <h3 className="font-bold text-sm">{route.name}</h3>
                    <p className="text-xs mt-1">{route.direction}</p>
                  </button>
                ))}
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">{tradingRoutes[selectedRoute as keyof typeof tradingRoutes].name} - {tradingRoutes[selectedRoute as keyof typeof tradingRoutes].direction}</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {tradingRoutes[selectedRoute as keyof typeof tradingRoutes].rules.map((rule, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900">{rule.title}</h4>
                        <div className="flex gap-2">
                          {rule.vat && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                              {rule.vat}
                            </span>
                          )}
                          {rule.required !== undefined && (
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              rule.required ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {rule.required ? 'Required' : 'Optional'}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm">{rule.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VAT Changes Post-Brexit */}
        <section className="py-16 px-4 bg-gray-50" id="vat-changes">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                VAT Changes Post-Brexit
              </h2>
              <p className="text-lg text-gray-600">
                Key VAT rule changes affecting Ireland-UK trade.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="card-modern p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Before Brexit</h3>
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">EU Single Market</h4>
                    <ul className="text-green-800 text-sm space-y-1">
                      <li>• Zero-rated intra-EU supplies</li>
                      <li>• No customs procedures</li>
                      <li>• EC Sales Lists only</li>
                      <li>• Free movement of goods</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Simple Compliance</h4>
                    <ul className="text-blue-800 text-sm space-y-1">
                      <li>• VAT number validation</li>
                      <li>• Standard EU procedures</li>
                      <li>• No border delays</li>
                      <li>• Unified VAT system</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="card-modern p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">After Brexit</h3>
                <div className="space-y-4">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-900 mb-2">Third Country Rules</h4>
                    <ul className="text-red-800 text-sm space-y-1">
                      <li>• Full export/import procedures</li>
                      <li>• Customs declarations required</li>
                      <li>• Import VAT on UK goods</li>
                      <li>• Border controls and delays</li>
                    </ul>
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-900 mb-2">Complex Compliance</h4>
                    <ul className="text-orange-800 text-sm space-y-1">
                      <li>• Multiple documentation required</li>
                      <li>• Rules of origin certificates</li>
                      <li>• Separate UK VAT registration</li>
                      <li>• Dual compliance systems</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Northern Ireland Protocol */}
        <section className="py-16 px-4" id="ni-protocol">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Northern Ireland Protocol Benefits
              </h2>
              <p className="text-lg text-gray-600">
                Special arrangements for Northern Ireland businesses and traders.
              </p>
            </div>
            
            <div className="card-premium p-8">
              <div className="space-y-6">
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-green-900 mb-4">Dual Market Access</h3>
                  <p className="text-green-800 mb-4">Northern Ireland businesses enjoy unique access to both UK and EU markets with minimal barriers.</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-green-900 mb-2">EU Market Access</h4>
                      <ul className="text-green-700 text-sm space-y-1">
                        <li>• Continued EU single market rules</li>
                        <li>• No customs for Ireland-NI trade</li>
                        <li>• EU VAT rules apply</li>
                        <li>• Free movement to Ireland</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-900 mb-2">UK Market Access</h4>
                      <ul className="text-green-700 text-sm space-y-1">
                        <li>• Part of UK customs territory</li>
                        <li>• UK internal market access</li>
                        <li>• Qualifying supplier relief</li>
                        <li>• UK VAT number accepted</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-blue-900 mb-4">VAT Simplifications</h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <span className="text-blue-500 mt-1">✓</span>
                      <span className="text-blue-800 text-sm">EU VAT rules continue to apply for goods in Northern Ireland</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-blue-500 mt-1">✓</span>
                      <span className="text-blue-800 text-sm">No VAT on goods moving from Ireland to Northern Ireland</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-blue-500 mt-1">✓</span>
                      <span className="text-blue-800 text-sm">Standard EU distance selling thresholds apply</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-blue-500 mt-1">✓</span>
                      <span className="text-blue-800 text-sm">XI VAT numbers valid for EU transactions</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Customs & Documentation */}
        <section className="py-16 px-4 bg-gray-50" id="customs-documentation">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Customs & Documentation Requirements
              </h2>
              <p className="text-lg text-gray-600">
                Essential documentation for Ireland-UK trade post-Brexit.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="card-modern p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Export Documentation</h3>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Mandatory Documents</h4>
                    <ul className="text-blue-800 text-sm space-y-1">
                      <li>• Export customs declaration</li>
                      <li>• Commercial invoice</li>
                      <li>• Packing list</li>
                      <li>• Transport documents</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Preferential Trade</h4>
                    <ul className="text-green-800 text-sm space-y-1">
                      <li>• Rules of origin certificate</li>
                      <li>• Statement on origin</li>
                      <li>• Supplier declarations</li>
                      <li>• REX registration</li>
                    </ul>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">Additional Requirements</h4>
                    <ul className="text-purple-800 text-sm space-y-1">
                      <li>• Export licenses (controlled goods)</li>
                      <li>• Health certificates (food)</li>
                      <li>• Safety conformity marks</li>
                      <li>• Insurance documentation</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="card-modern p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Import Procedures</h3>
                <div className="space-y-4">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-900 mb-2">Import Declarations</h4>
                    <ul className="text-red-800 text-sm space-y-1">
                      <li>• Import customs declaration</li>
                      <li>• C88 or electronic equivalent</li>
                      <li>• Commodity code classification</li>
                      <li>• Value declaration</li>
                    </ul>
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-900 mb-2">Tax & Duty Payments</h4>
                    <ul className="text-orange-800 text-sm space-y-1">
                      <li>• Import VAT (23% standard rate)</li>
                      <li>• Customs duties (where applicable)</li>
                      <li>• Excise duties (alcohol, tobacco)</li>
                      <li>• Anti-dumping duties</li>
                    </ul>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-900 mb-2">Facilitations Available</h4>
                    <ul className="text-yellow-800 text-sm space-y-1">
                      <li>• Postponed accounting for VAT</li>
                      <li>• Duty deferment accounts</li>
                      <li>• Simplified procedures</li>
                      <li>• Authorized Economic Operator (AEO)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Brexit Trading Checklist */}
        <section className="py-16 px-4" id="brexit-checklist">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Brexit Trading Compliance Checklist
              </h2>
              <p className="text-lg text-gray-600">
                Essential steps for Ireland-UK trade compliance post-Brexit.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="card-premium p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Business Setup Requirements</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Registration & Licensing</h4>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-500">✓</span>
                        <span>EORI number registration</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-500">✓</span>
                        <span>UK VAT registration (if required)</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-500">✓</span>
                        <span>Customs intermediary appointment</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-500">✓</span>
                        <span>AEO status consideration</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Systems & Processes</h4>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-500">✓</span>
                        <span>Customs declaration software</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-500">✓</span>
                        <span>Origin documentation system</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-500">✓</span>
                        <span>Commodity code database</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-500">✓</span>
                        <span>Staff training on procedures</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="card-premium p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Ongoing Compliance</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-blue-600 font-bold text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Monitor Regulatory Changes</h4>
                      <p className="text-gray-600">Stay updated on evolving Brexit trade arrangements and rule changes</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-blue-600 font-bold text-sm">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Maintain Documentation</h4>
                      <p className="text-gray-600">Keep complete records of all cross-border transactions and declarations</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-blue-600 font-bold text-sm">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Review Supply Chains</h4>
                      <p className="text-gray-600">Regularly assess supply chain efficiency and cost impacts of new procedures</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Navigate Brexit Trading Complexity
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Don't let Brexit rules slow down your business. Get expert support for Ireland-UK trade compliance and VAT optimization.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/signup" 
                className="bg-white text-blue-600 px-8 py-4 text-lg font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-105"
              >
                Get Brexit Trading Support
              </a>
              <a 
                href="/pricing" 
                className="border-2 border-white px-8 py-4 text-lg font-semibold rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-300"
              >
                View Trading Plans
              </a>
            </div>
            <p className="text-sm text-blue-200 mt-6">
              Trusted by 600+ Irish businesses trading with the UK
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}