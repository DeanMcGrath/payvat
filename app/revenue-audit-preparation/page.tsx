'use client'

import { useState, useEffect } from 'react'
import SiteHeader from '../../components/site-header'
import Footer from '../../components/footer'

export default function RevenueAuditPreparation() {
  const [selectedPhase, setSelectedPhase] = useState('preparation')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const auditPhases = {
    preparation: {
      name: 'Pre-Audit Preparation',
      items: [
        { title: 'Documentation Review', description: 'Gather and organize all financial records, invoices, and supporting documents', priority: 'High' },
        { title: 'VAT Records Check', description: 'Ensure VAT invoices meet legal requirements and input VAT is properly supported', priority: 'High' },
        { title: 'Payroll Documentation', description: 'Compile P30 returns, P60s, employment contracts, and PAYE/PRSI records', priority: 'Medium' },
        { title: 'Professional Advice', description: 'Engage tax advisor or accountant familiar with Revenue audit procedures', priority: 'High' }
      ]
    },
    during: {
      name: 'During the Audit',
      items: [
        { title: 'Professional Representation', description: 'Have qualified tax advisor present during audit meetings', priority: 'High' },
        { title: 'Controlled Communication', description: 'Provide only requested information, avoid volunteering additional details', priority: 'High' },
        { title: 'Document Everything', description: 'Keep detailed records of all interactions and requests from Revenue', priority: 'Medium' },
        { title: 'Timely Responses', description: 'Respond to Revenue requests within specified timeframes', priority: 'High' }
      ]
    },
    resolution: {
      name: 'Post-Audit Resolution',
      items: [
        { title: 'Review Findings', description: 'Carefully analyze Revenue audit report and any proposed adjustments', priority: 'High' },
        { title: 'Negotiate Settlement', description: 'Discuss penalties and interest charges, seek to minimize where possible', priority: 'High' },
        { title: 'Appeal Process', description: 'Consider formal appeal if you disagree with Revenue findings', priority: 'Medium' },
        { title: 'Compliance Improvements', description: 'Implement systems to prevent future audit issues', priority: 'High' }
      ]
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white">

        {/* Interactive Audit Guide */}
        <section className="py-16 px-4" id="audit-preparation">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-normal text-gray-900 mb-4">
                Revenue Audit Process Guide
              </h2>
              <p className="text-lg text-gray-600">
                Navigate through the three key phases of a Revenue audit.
              </p>
            </div>
            
            <div className="card-premium p-8">
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                {Object.entries(auditPhases).map(([key, phase]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedPhase(key)}
                    className={`p-4 text-center rounded-lg transition-all duration-300 ${
                      selectedPhase === key
                        ? 'bg-amber-600 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-amber-50'
                    }`}
                  >
                    <h3 className="font-normal text-sm">{phase.name}</h3>
                  </button>
                ))}
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-2xl font-normal text-gray-900 mb-6">{auditPhases[selectedPhase as keyof typeof auditPhases].name}</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {auditPhases[selectedPhase as keyof typeof auditPhases].items.map((item, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-normal text-gray-900">{item.title}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-normal ${
                          item.priority === 'High' ? 'bg-red-100 text-red-800' :
                          item.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {item.priority}
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

        {/* Types of Revenue Audits */}
        <section className="py-16 px-4 bg-gray-50" id="audit-types">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-normal text-gray-900 mb-4">
                Types of Revenue Audits
              </h2>
              <p className="text-lg text-gray-600">
                Understanding different audit types and their scope.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="card-modern p-8">
                <h3 className="text-xl font-normal text-gray-900 mb-4">Comprehensive Audit</h3>
                <div className="space-y-3">
                  <div className="text-sm text-gray-700">
                    <p className="font-normal mb-2">Scope:</p>
                    <ul className="space-y-1">
                      <li>• All tax types</li>
                      <li>• Multiple years (typically 4)</li>
                      <li>• Complete business review</li>
                      <li>• On-site examination</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 p-3 rounded">
                    <p className="text-red-800 text-xs font-normal">Most intensive audit type</p>
                  </div>
                </div>
              </div>
              
              <div className="card-modern p-8">
                <h3 className="text-xl font-normal text-gray-900 mb-4">Aspect Audit</h3>
                <div className="space-y-3">
                  <div className="text-sm text-gray-700">
                    <p className="font-normal mb-2">Scope:</p>
                    <ul className="space-y-1">
                      <li>• Specific tax areas</li>
                      <li>• VAT or PAYE focus</li>
                      <li>• Targeted issues</li>
                      <li>• Limited timeframe</li>
                    </ul>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded">
                    <p className="text-yellow-800 text-xs font-normal">Focused examination</p>
                  </div>
                </div>
              </div>
              
              <div className="card-modern p-8">
                <h3 className="text-xl font-normal text-gray-900 mb-4">Desktop Audit</h3>
                <div className="space-y-3">
                  <div className="text-sm text-gray-700">
                    <p className="font-normal mb-2">Scope:</p>
                    <ul className="space-y-1">
                      <li>• Correspondence based</li>
                      <li>• Specific queries</li>
                      <li>• Document requests</li>
                      <li>• No site visit</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <p className="text-green-800 text-xs font-normal">Less intrusive process</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Documentation Checklist */}
        <section className="py-16 px-4" id="documentation-checklist">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-normal text-gray-900 mb-4">
                Essential Documentation Checklist
              </h2>
              <p className="text-lg text-gray-600">
                Complete list of documents to prepare for a Revenue audit.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="card-premium p-8">
                <h3 className="text-2xl font-normal text-gray-900 mb-6">Core Financial Records</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-normal text-gray-900 mb-3">Accounting Records</h4>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li className="flex items-start space-x-2">
                        <span className="text-amber-500">✓</span>
                        <span>General ledger and trial balance</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-amber-500">✓</span>
                        <span>Profit & loss accounts</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-amber-500">✓</span>
                        <span>Balance sheets</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-amber-500">✓</span>
                        <span>Cash flow statements</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-amber-500">✓</span>
                        <span>Bank statements and reconciliations</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-normal text-gray-900 mb-3">Supporting Documents</h4>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li className="flex items-start space-x-2">
                        <span className="text-amber-500">✓</span>
                        <span>Sales invoices and receipts</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-amber-500">✓</span>
                        <span>Purchase invoices and receipts</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-amber-500">✓</span>
                        <span>Expense receipts and vouchers</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-amber-500">✓</span>
                        <span>Contracts and agreements</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-amber-500">✓</span>
                        <span>Asset registers and depreciation</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="card-premium p-8">
                <h3 className="text-2xl font-normal text-gray-900 mb-6">Tax-Specific Records</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-normal text-gray-900 mb-3">VAT Documentation</h4>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li className="flex items-start space-x-2">
                        <span className="text-amber-500">✓</span>
                        <span>VAT returns (bi-monthly)</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-amber-500">✓</span>
                        <span>VAT invoice files</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-amber-500">✓</span>
                        <span>Input VAT supporting documents</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-amber-500">✓</span>
                        <span>Bad debt relief records</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-amber-500">✓</span>
                        <span>VAT payment confirmations</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-normal text-gray-900 mb-3">PAYE/Payroll Records</h4>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li className="flex items-start space-x-2">
                        <span className="text-amber-500">✓</span>
                        <span>P30 monthly returns</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-amber-500">✓</span>
                        <span>P35 annual returns</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-amber-500">✓</span>
                        <span>Employee P60 certificates</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-amber-500">✓</span>
                        <span>Employment contracts</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-amber-500">✓</span>
                        <span>Payroll journals and summaries</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Rights & Obligations */}
        <section className="py-16 px-4 bg-gray-50" id="rights-obligations">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-normal text-gray-900 mb-4">
                Your Rights & Obligations During Audit
              </h2>
              <p className="text-lg text-gray-600">
                Understanding what Revenue can and cannot do, and your rights as a taxpayer.
              </p>
            </div>
            
            <div className="card-premium p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-normal text-gray-900 mb-4">Your Rights</h3>
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-normal text-green-900 mb-2">Professional Representation</h4>
                      <p className="text-green-800 text-sm">Right to have qualified tax advisor represent you during audit proceedings</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-normal text-blue-900 mb-2">Reasonable Notice</h4>
                      <p className="text-petrol-dark text-sm">Revenue must provide reasonable advance notice of audit commencement</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-normal text-purple-900 mb-2">Appeal Process</h4>
                      <p className="text-purple-800 text-sm">Right to appeal Revenue findings through formal appeals process</p>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <h4 className="font-normal text-indigo-900 mb-2">Confidentiality</h4>
                      <p className="text-indigo-800 text-sm">Revenue must maintain confidentiality of your business information</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-normal text-gray-900 mb-4">Your Obligations</h3>
                  <div className="space-y-4">
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-normal text-red-900 mb-2">Cooperation Duty</h4>
                      <p className="text-red-800 text-sm">Must cooperate fully with Revenue audit and provide requested information</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="font-normal text-orange-900 mb-2">Document Production</h4>
                      <p className="text-orange-800 text-sm">Required to produce all books, records, and documents within specified timeframe</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-normal text-yellow-900 mb-2">Truthful Information</h4>
                      <p className="text-yellow-800 text-sm">All information provided must be accurate and complete</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-normal text-gray-900 mb-2">Access Provision</h4>
                      <p className="text-gray-700 text-sm">Must provide reasonable access to business premises and records</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Audit Settlement Options */}
        <section className="py-16 px-4" id="settlement-options">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-normal text-gray-900 mb-4">
                Audit Settlement Options
              </h2>
              <p className="text-lg text-gray-600">
                Understanding different ways to resolve audit findings and minimize penalties.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="card-premium p-8">
                <h3 className="text-2xl font-normal text-gray-900 mb-6">Settlement Strategies</h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-amber-600 font-normal text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="font-normal text-gray-900">Voluntary Disclosure</h4>
                      <p className="text-gray-600">Proactively disclose any errors or omissions to reduce penalties and show cooperation</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-amber-600 font-normal text-sm">2</span>
                    </div>
                    <div>
                      <h4 className="font-normal text-gray-900">Agreed Settlement</h4>
                      <p className="text-gray-600">Negotiate agreed settlement covering all audit findings and outstanding liabilities</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-amber-600 font-normal text-sm">3</span>
                    </div>
                    <div>
                      <h4 className="font-normal text-gray-900">Payment Arrangements</h4>
                      <p className="text-gray-600">Arrange installment payments for large liabilities to manage cash flow impact</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-amber-600 font-normal text-sm">4</span>
                    </div>
                    <div>
                      <h4 className="font-normal text-gray-900">Penalty Mitigation</h4>
                      <p className="text-gray-600">Present mitigating factors to reduce penalty rates applied to underdeclared liabilities</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card-premium p-8">
                <h3 className="text-2xl font-normal text-gray-900 mb-6">Penalty Factors</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-normal text-gray-900 mb-3">Aggravating Factors</h4>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li className="flex items-start space-x-2">
                        <span className="text-red-500">×</span>
                        <span>Deliberate concealment</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-red-500">×</span>
                        <span>Lack of cooperation</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-red-500">×</span>
                        <span>Previous audit history</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-red-500">×</span>
                        <span>Large understatement</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-normal text-gray-900 mb-3">Mitigating Factors</h4>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500">✓</span>
                        <span>Full cooperation</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500">✓</span>
                        <span>Voluntary disclosure</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500">✓</span>
                        <span>Good compliance history</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500">✓</span>
                        <span>Reasonable care taken</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 px-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-normal mb-6">
              Professional Revenue Audit Support
            </h2>
            <p className="text-xl mb-8 text-amber-100">
              Don't face a Revenue audit alone. Get expert representation and ensure your rights are protected throughout the process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/signup" 
                className="bg-white text-amber-600 px-8 py-4 text-lg font-normal rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-105"
              >
                Get Audit Representation
              </a>
              <a 
                href="/pricing" 
                className="border-2 border-white px-8 py-4 text-lg font-normal rounded-xl hover:bg-white hover:text-amber-600 transition-all duration-300"
              >
                View Support Plans
              </a>
            </div>
            <p className="text-sm text-amber-200 mt-6">
              Trusted by Irish businesses during Revenue audits
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
