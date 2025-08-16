'use client'

import { useState, useEffect } from 'react'
import SiteHeader from '../../components/site-header'
import Footer from '../../components/footer'

export default function ExpenseTrackerIreland() {
  const [selectedCategory, setSelectedCategory] = useState('office')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const expenseCategories = {
    office: {
      name: 'Office & Equipment',
      deductible: '100%',
      vatRecoverable: 'Yes',
      examples: ['Office rent', 'Computer equipment', 'Software subscriptions', 'Office furniture', 'Stationery'],
      notes: 'Fully deductible for business use. VAT recoverable if registered.'
    },
    travel: {
      name: 'Travel & Transport',
      deductible: 'Varies',
      vatRecoverable: 'Partial',
      examples: ['Business mileage', 'Public transport', 'Hotel accommodation', 'Parking fees', 'Fuel'],
      notes: 'Business portion only. Mileage allowance: €0.3756 per km (first 6,437km), €0.2113 thereafter.'
    },
    entertainment: {
      name: 'Entertainment',
      deductible: '50%',
      vatRecoverable: 'No',
      examples: ['Client meals', 'Business entertainment', 'Hospitality', 'Corporate events'],
      notes: 'Maximum 50% deductible. VAT generally not recoverable on entertainment.'
    },
    training: {
      name: 'Training & Development',
      deductible: '100%',
      vatRecoverable: 'Yes',
      examples: ['Professional courses', 'Conferences', 'Skills training', 'Industry certifications'],
      notes: 'Fully deductible if business-related. VAT recoverable if registered.'
    },
    marketing: {
      name: 'Marketing & Advertising',
      deductible: '100%',
      vatRecoverable: 'Yes',
      examples: ['Digital advertising', 'Website development', 'Promotional materials', 'Trade shows'],
      notes: 'Fully deductible for business promotion. VAT recoverable if registered.'
    },
    professional: {
      name: 'Professional Services',
      deductible: '100%',
      vatRecoverable: 'Yes',
      examples: ['Legal fees', 'Accounting services', 'Consultancy', 'Insurance premiums'],
      notes: 'Fully deductible for business services. VAT recoverable if registered.'
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white">

        {/* Interactive Expense Categories */}
        <section className="py-16 px-4" id="expense-categories">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Interactive Expense Category Guide
              </h2>
              <p className="text-lg text-gray-600">
                Explore different expense categories to understand deductibility and VAT recovery rules.
              </p>
            </div>
            
            <div className="card-premium p-8">
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                {Object.entries(expenseCategories).slice(0, 3).map(([key, category]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`p-4 text-center rounded-lg transition-all duration-300 ${
                      selectedCategory === key
                        ? 'bg-[#0072B1] text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-blue-50'
                    }`}
                  >
                    <h3 className="font-bold text-sm">{category.name}</h3>
                  </button>
                ))}
              </div>
              
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                {Object.entries(expenseCategories).slice(3, 6).map(([key, category]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`p-4 text-center rounded-lg transition-all duration-300 ${
                      selectedCategory === key
                        ? 'bg-[#0072B1] text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-blue-50'
                    }`}
                  >
                    <h3 className="font-bold text-sm">{category.name}</h3>
                  </button>
                ))}
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{expenseCategories[selectedCategory as keyof typeof expenseCategories].name}</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Tax Deductibility</h4>
                      <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        expenseCategories[selectedCategory as keyof typeof expenseCategories].deductible === '100%' ? 'bg-green-100 text-green-800' :
                        expenseCategories[selectedCategory as keyof typeof expenseCategories].deductible === '50%' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {expenseCategories[selectedCategory as keyof typeof expenseCategories].deductible}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">VAT Recovery</h4>
                      <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        expenseCategories[selectedCategory as keyof typeof expenseCategories].vatRecoverable === 'Yes' ? 'bg-green-100 text-green-800' :
                        expenseCategories[selectedCategory as keyof typeof expenseCategories].vatRecoverable === 'No' ? 'bg-red-100 text-red-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {expenseCategories[selectedCategory as keyof typeof expenseCategories].vatRecoverable}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Important Notes</h4>
                      <p className="text-gray-700 text-sm">{expenseCategories[selectedCategory as keyof typeof expenseCategories].notes}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Common Examples</h4>
                    <ul className="space-y-1">
                      {expenseCategories[selectedCategory as keyof typeof expenseCategories].examples.map((example, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span className="text-gray-700 text-sm">{example}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mileage & Travel Allowances */}
        <section className="py-16 px-4 bg-gray-50" id="mileage-allowances">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Irish Mileage & Travel Allowances (2025)
              </h2>
              <p className="text-lg text-gray-600">
                Current Revenue-approved rates for business travel and subsistence.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="card-premium p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Motor Travel Allowances</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h4 className="text-xl font-bold text-blue-900 mb-4">Car/Van Mileage Rates</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center border-b border-blue-200 pb-2">
                        <span className="font-medium text-blue-800">First 6,437km annually:</span>
                        <span className="font-bold text-blue-900">€0.3756 per km</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-blue-200 pb-2">
                        <span className="font-medium text-blue-800">Over 6,437km annually:</span>
                        <span className="font-bold text-blue-900">€0.2113 per km</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-blue-800">Motorcycle:</span>
                        <span className="font-bold text-blue-900">€0.2439 per km</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h4 className="text-xl font-bold text-green-900 mb-4">Calculation Example</h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-green-800"><strong>Annual business mileage: 10,000km</strong></p>
                      <p className="text-green-700">First 6,437km: 6,437 × €0.3756 = €2,418</p>
                      <p className="text-green-700">Remaining 3,563km: 3,563 × €0.2113 = €753</p>
                      <p className="text-green-800 font-bold border-t border-green-200 pt-2">Total allowance: €3,171</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card-premium p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Subsistence Allowances</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <h4 className="font-bold text-orange-900 mb-2">Domestic Day Rate</h4>
                    <div className="text-2xl font-bold text-orange-600 mb-2">€34.84</div>
                    <p className="text-orange-800 text-sm">Over 5 hours away from normal workplace</p>
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <h4 className="font-bold text-orange-900 mb-2">Domestic Overnight</h4>
                    <div className="text-2xl font-bold text-orange-600 mb-2">€121.59</div>
                    <p className="text-orange-800 text-sm">Overnight stay in Ireland</p>
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <h4 className="font-bold text-orange-900 mb-2">Foreign Travel</h4>
                    <div className="text-2xl font-bold text-orange-600 mb-2">Varies</div>
                    <p className="text-orange-800 text-sm">Country-specific rates apply</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Expense Record Keeping */}
        <section className="py-16 px-4" id="record-keeping">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Expense Record Keeping Requirements
              </h2>
              <p className="text-lg text-gray-600">
                Essential documentation and record-keeping requirements for Irish businesses.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="card-modern p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Required Documentation</h3>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">VAT Invoices</h4>
                    <ul className="text-blue-800 text-sm space-y-1">
                      <li>• Supplier VAT number</li>
                      <li>• Invoice date and number</li>
                      <li>• VAT amount clearly shown</li>
                      <li>• Business name and address</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Receipt Requirements</h4>
                    <ul className="text-green-800 text-sm space-y-1">
                      <li>• Original receipts preferred</li>
                      <li>• Clear date and amount</li>
                      <li>• Business purpose documented</li>
                      <li>• Digital copies acceptable</li>
                    </ul>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-900 mb-2">Travel Records</h4>
                    <ul className="text-yellow-800 text-sm space-y-1">
                      <li>• Mileage logs with dates</li>
                      <li>• Start/end destinations</li>
                      <li>• Business purpose</li>
                      <li>• Odometer readings</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="card-modern p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Digital Record Keeping</h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Mobile Apps</h4>
                    <ul className="text-gray-800 text-sm space-y-1">
                      <li>• Photo receipts immediately</li>
                      <li>• GPS tracking for mileage</li>
                      <li>• Cloud storage backup</li>
                      <li>• Categorize expenses</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Accounting Software</h4>
                    <ul className="text-blue-800 text-sm space-y-1">
                      <li>• Bank transaction import</li>
                      <li>• Automatic categorization</li>
                      <li>• VAT tracking</li>
                      <li>• Report generation</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">Retention Period</h4>
                    <p className="text-gray-700 text-sm">Keep all business records for 6 years from end of relevant tax year. Digital copies must be clearly legible.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Common Expense Mistakes */}
        <section className="py-16 px-4 bg-gray-50" id="expense-mistakes">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Common Expense Tracking Mistakes
              </h2>
              <p className="text-lg text-gray-600">
                Avoid these common errors that can lead to disallowed deductions or VAT issues.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="card-premium p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Top 5 Mistakes to Avoid</h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-red-600 font-bold text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Mixing Personal & Business Expenses</h4>
                      <p className="text-gray-600">Keep separate accounts and only claim legitimate business expenses. Personal portions are not deductible.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-red-600 font-bold text-sm">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Poor Receipt Management</h4>
                      <p className="text-gray-600">Missing or illegible receipts can result in disallowed deductions. Implement digital scanning systems.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-red-600 font-bold text-sm">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Incorrect Mileage Claims</h4>
                      <p className="text-gray-600">Maintain accurate mileage logs. Estimates or inflated claims can trigger Revenue audits.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-red-600 font-bold text-sm">4</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Claiming Non-Deductible Items</h4>
                      <p className="text-gray-600">Entertainment over 50%, fines, personal life insurance, and capital expenditure have restrictions.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-red-600 font-bold text-sm">5</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">VAT Recovery Errors</h4>
                      <p className="text-gray-600">Only claim VAT on valid VAT invoices. Ensure supplier is VAT registered and invoice meets requirements.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Expense Tracking Best Practices */}
        <section className="py-16 px-4" id="best-practices">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Expense Tracking Best Practices
              </h2>
              <p className="text-lg text-gray-600">
                Implement these systems for efficient and compliant expense management.
              </p>
            </div>
            
            <div className="card-premium p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Monthly Routine</h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <span className="text-blue-500 mt-1">✓</span>
                      <span className="text-gray-700 text-sm">Categorize all expenses by type</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-blue-500 mt-1">✓</span>
                      <span className="text-gray-700 text-sm">Reconcile bank statements</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-blue-500 mt-1">✓</span>
                      <span className="text-gray-700 text-sm">Review mileage logs</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-blue-500 mt-1">✓</span>
                      <span className="text-gray-700 text-sm">File receipts digitally</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-blue-500 mt-1">✓</span>
                      <span className="text-gray-700 text-sm">Calculate VAT recoverable</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Annual Review</h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <span className="text-blue-500 mt-1">✓</span>
                      <span className="text-gray-700 text-sm">Analyze expense trends</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-blue-500 mt-1">✓</span>
                      <span className="text-gray-700 text-sm">Identify tax-saving opportunities</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-blue-500 mt-1">✓</span>
                      <span className="text-gray-700 text-sm">Update mileage calculations</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-blue-500 mt-1">✓</span>
                      <span className="text-gray-700 text-sm">Prepare tax return documentation</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-blue-500 mt-1">✓</span>
                      <span className="text-gray-700 text-sm">Archive old records securely</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 px-4 bg-[#0072B1] text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Automate Your Expense Tracking
            </h2>
            <p className="text-xl mb-8 text-blue-50">
              Stop losing money on missed deductions. PayVat helps you maintain compliant expense records and VAT documentation for maximum deductions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/signup" 
                className="bg-white text-blue-600 px-8 py-4 text-lg font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-105"
              >
                Start Expense Tracking
              </a>
              <a 
                href="/vat-calculator-ireland" 
                className="border-2 border-white px-8 py-4 text-lg font-semibold rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-300"
              >
                Calculate VAT Savings
              </a>
            </div>
            <p className="text-sm text-blue-100 mt-6">
              Trusted by Irish businesses maximizing expense deductions
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
