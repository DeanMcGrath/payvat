'use client'

import { useState, useEffect } from 'react'
import SiteHeader from '../../components/site-header'
import Footer from '../../components/footer'

export default function PayrollSetupIreland() {
  const [selectedTopic, setSelectedTopic] = useState('setup')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const topics = {
    setup: {
      name: 'Initial Setup',
      items: [
        { title: 'PAYE Registration', description: 'Register as employer with Revenue Commissioners', required: true },
        { title: 'PRSI Registration', description: 'Register for Pay Related Social Insurance', required: true },
        { title: 'USC Setup', description: 'Universal Social Charge configuration', required: true },
        { title: 'Payroll Software', description: 'Choose Revenue-approved payroll system', required: false }
      ]
    },
    rates: {
      name: 'Tax Rates (2025)',
      items: [
        { title: 'PAYE Tax Bands', description: 'Single: 20% up to €42,000, 40% thereafter', required: true },
        { title: 'PRSI Class A1', description: '4% employee, 11.05% employer on income over €352/week', required: true },
        { title: 'USC Rates', description: '0.5% up to €12,012, 2% up to €22,920, 4.5% thereafter', required: true },
        { title: 'Tax Credits', description: 'Personal credit €1,875, PAYE credit €1,875', required: true }
      ]
    },
    compliance: {
      name: 'Compliance',
      items: [
        { title: 'Monthly Returns', description: 'P30 returns due by 14th of following month', required: true },
        { title: 'Annual Returns', description: 'P35 return due by 28th February', required: true },
        { title: 'P60 Certificates', description: 'Issue to employees by 15th February', required: true },
        { title: 'Minimum Wage', description: 'Current rate: €12.70 per hour (2025)', required: true }
      ]
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white">

        {/* Interactive Payroll Guide */}
        <section className="py-16 px-4" id="payroll-guide">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-normal text-gray-900 mb-4">
                Interactive Payroll Setup Guide
              </h2>
              <p className="text-lg text-gray-600">
                Explore different aspects of Irish payroll setup and compliance.
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
                        ? 'bg-[#2A7A8F] text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-petrol-50'
                    }`}
                  >
                    <h3 className="font-normal">{topic.name}</h3>
                  </button>
                ))}
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-2xl font-normal text-gray-900 mb-6">{topics[selectedTopic as keyof typeof topics].name}</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {topics[selectedTopic as keyof typeof topics].items.map((item, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-normal text-gray-900">{item.title}</h4>
                        {item.required && (
                          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-normal">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Payroll Setup Steps */}
        <section className="py-16 px-4 bg-gray-50" id="setup-steps">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-normal text-gray-900 mb-4">
                Step-by-Step Payroll Setup Process
              </h2>
              <p className="text-lg text-gray-600">
                Complete checklist for setting up payroll in Ireland.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="card-premium p-8">
                <h3 className="text-2xl font-normal text-gray-900 mb-6">Pre-Setup Requirements</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-[#2A7A8F] font-normal text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="font-normal text-gray-900">Company Registration</h4>
                      <p className="text-gray-600">Ensure company is registered with CRO and has tax number from Revenue</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-[#2A7A8F] font-normal text-sm">2</span>
                    </div>
                    <div>
                      <h4 className="font-normal text-gray-900">Employment Contracts</h4>
                      <p className="text-gray-600">Prepare written employment contracts complying with Irish employment law</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-[#2A7A8F] font-normal text-sm">3</span>
                    </div>
                    <div>
                      <h4 className="font-normal text-gray-900">Employee Information</h4>
                      <p className="text-gray-600">Collect PPS numbers, bank details, tax certificates, and emergency contacts</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card-premium p-8">
                <h3 className="text-2xl font-normal text-gray-900 mb-6">Revenue Registration</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-gray-600 font-normal text-sm">4</span>
                    </div>
                    <div>
                      <h4 className="font-normal text-gray-900">PAYE/PRSI Registration</h4>
                      <p className="text-gray-600">Register as employer through ROS or Form TR2. Processing takes 7-10 days</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-gray-600 font-normal text-sm">5</span>
                    </div>
                    <div>
                      <h4 className="font-normal text-gray-900">ROS Access Setup</h4>
                      <p className="text-gray-600">Establish online access for payroll returns and payments</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-gray-600 font-normal text-sm">6</span>
                    </div>
                    <div>
                      <h4 className="font-normal text-gray-900">Employer Registration Number</h4>
                      <p className="text-gray-600">Receive unique employer registration number for payroll submissions</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card-premium p-8">
                <h3 className="text-2xl font-normal text-gray-900 mb-6">System Setup</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-gray-600 font-normal text-sm">7</span>
                    </div>
                    <div>
                      <h4 className="font-normal text-gray-900">Choose Payroll Software</h4>
                      <p className="text-gray-600">Select Revenue-approved payroll system with RPN and PSC support</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-gray-600 font-normal text-sm">8</span>
                    </div>
                    <div>
                      <h4 className="font-normal text-gray-900">Configure Tax Settings</h4>
                      <p className="text-gray-600">Setup current PAYE, PRSI, and USC rates and thresholds</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-gray-600 font-normal text-sm">9</span>
                    </div>
                    <div>
                      <h4 className="font-normal text-gray-900">Test Payroll Run</h4>
                      <p className="text-gray-600">Process test payroll to verify calculations and reporting</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tax Rates & Calculations */}
        <section className="py-16 px-4" id="tax-rates">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-normal text-gray-900 mb-4">
                Irish Payroll Tax Rates (2025)
              </h2>
              <p className="text-lg text-gray-600">
                Current rates for PAYE, PRSI, USC, and other payroll taxes.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="card-modern p-8">
                <h3 className="text-2xl font-normal text-gray-900 mb-6">Employee Deductions</h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-normal text-gray-900 mb-2">PAYE (Pay As You Earn)</h4>
                    <ul className="text-gray-800 text-sm space-y-1">
                      <li>• Single: 20% up to €42,000, 40% thereafter</li>
                      <li>• Married: 20% up to €84,000, 40% thereafter</li>
                      <li>• Personal credit: €1,875</li>
                      <li>• PAYE credit: €1,875</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-normal text-gray-900 mb-2">PRSI Class A1</h4>
                    <ul className="text-gray-800 text-sm space-y-1">
                      <li>• Employee: 4% on income over €352/week</li>
                      <li>• No upper limit</li>
                      <li>• Covers social welfare benefits</li>
                      <li>• State pension contributions</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-normal text-gray-900 mb-2">USC (Universal Social Charge)</h4>
                    <ul className="text-gray-800 text-sm space-y-1">
                      <li>• 0.5% on income up to €12,012</li>
                      <li>• 2% on income €12,013 to €22,920</li>
                      <li>• 4.5% on income over €22,920</li>
                      <li>• 8% on income over €70,044 (self-employed)</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="card-modern p-8">
                <h3 className="text-2xl font-normal text-gray-900 mb-6">Employer Costs</h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-normal text-gray-900 mb-2">PRSI Employer</h4>
                    <ul className="text-gray-800 text-sm space-y-1">
                      <li>• 11.05% on income over €352/week</li>
                      <li>• 8.8% on income €352-€424/week</li>
                      <li>• No upper limit</li>
                      <li>• Significant cost consideration</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-normal text-blue-900 mb-2">Additional Costs</h4>
                    <ul className="text-petrol-dark text-sm space-y-1">
                      <li>• Employer liability insurance</li>
                      <li>• Workplace pension contributions</li>
                      <li>• Payroll software costs</li>
                      <li>• Professional payroll services</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-normal text-gray-900 mb-2">Statutory Benefits</h4>
                    <ul className="text-gray-800 text-sm space-y-1">
                      <li>• Minimum 20 days annual leave</li>
                      <li>• 9 public holidays</li>
                      <li>• Sick leave (3 days statutory)</li>
                      <li>• Maternity/paternity leave</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Payroll Compliance Calendar */}
        <section className="py-16 px-4 bg-gray-50" id="compliance-calendar">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-normal text-gray-900 mb-4">
                Payroll Compliance Calendar
              </h2>
              <p className="text-lg text-gray-600">
                Key dates and deadlines for Irish payroll compliance.
              </p>
            </div>
            
            <div className="card-premium p-8">
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <h3 className="text-lg font-normal text-gray-900 mb-2">Monthly</h3>
                    <div className="text-3xl font-normal text-gray-800 mb-2">14th</div>
                    <p className="text-gray-800 text-sm">P30 return and payment due</p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <h3 className="text-lg font-normal text-gray-900 mb-2">February</h3>
                    <div className="text-3xl font-normal text-gray-800 mb-2">15th</div>
                    <p className="text-gray-800 text-sm">P60s to employees</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <h3 className="text-lg font-normal text-gray-900 mb-2">February</h3>
                    <div className="text-3xl font-normal text-gray-800 mb-2">28th</div>
                    <p className="text-gray-800 text-sm">P35 annual return due</p>
                  </div>
                </div>
                
                <div className="bg-gray-100 p-6 rounded-lg">
                  <h4 className="font-normal text-gray-900 mb-4">Additional Compliance Requirements</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <ul className="text-gray-700 text-sm space-y-2">
                      <li className="flex items-start space-x-2">
                        <span className="text-[#8FD0FC] mt-1">•</span>
                        <span>P45 when employee leaves</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-[#8FD0FC] mt-1">•</span>
                        <span>P46 for new employees without P45</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-[#8FD0FC] mt-1">•</span>
                        <span>Benefits-in-kind reporting</span>
                      </li>
                    </ul>
                    <ul className="text-gray-700 text-sm space-y-2">
                      <li className="flex items-start space-x-2">
                        <span className="text-[#8FD0FC] mt-1">•</span>
                        <span>Pension auto-enrolment preparation</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-[#8FD0FC] mt-1">•</span>
                        <span>Employment permit compliance</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-[#8FD0FC] mt-1">•</span>
                        <span>Workplace Relations Commission</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Payroll Software Features */}
        <section className="py-16 px-4" id="software-features">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-normal text-gray-900 mb-4">
                Essential Payroll Software Features
              </h2>
              <p className="text-lg text-gray-600">
                Key features to look for in Irish payroll software.
              </p>
            </div>
            
            <div className="card-premium p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-normal text-gray-900 mb-4">Core Features</h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <span className="text-[#8FD0FC] mt-1">✓</span>
                      <span className="text-gray-700 text-sm">Automatic PAYE/PRSI/USC calculations</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-[#8FD0FC] mt-1">✓</span>
                      <span className="text-gray-700 text-sm">RPN (Revenue Payroll Notification) support</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-[#8FD0FC] mt-1">✓</span>
                      <span className="text-gray-700 text-sm">P30 return generation and submission</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-[#8FD0FC] mt-1">✓</span>
                      <span className="text-gray-700 text-sm">Payslip generation and distribution</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-[#8FD0FC] mt-1">✓</span>
                      <span className="text-gray-700 text-sm">Bank file generation for payments</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-normal text-gray-900 mb-4">Advanced Features</h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <span className="text-[#8FD0FC] mt-1">✓</span>
                      <span className="text-gray-700 text-sm">Employee self-service portal</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-[#8FD0FC] mt-1">✓</span>
                      <span className="text-gray-700 text-sm">Leave management system</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-[#8FD0FC] mt-1">✓</span>
                      <span className="text-gray-700 text-sm">Pension scheme integration</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-[#8FD0FC] mt-1">✓</span>
                      <span className="text-gray-700 text-sm">Time and attendance tracking</span>
                    </div>
                    <div className="flex items-start space-x-3">
                      <span className="text-[#8FD0FC] mt-1">✓</span>
                      <span className="text-gray-700 text-sm">Benefits-in-kind reporting</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 px-4 bg-gradient-to-r from-[#2A7A8F] to-[#216477] text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-normal mb-6">
              Simplify Your Irish Payroll Setup
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Need guidance on payroll setup? PayVat provides expert consultation and connects you with qualified payroll specialists for PAYE, PRSI, USC compliance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/signup" 
                className="bg-white text-[#2A7A8F] px-8 py-4 text-lg font-normal rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-105"
              >
                Get Payroll Guidance
              </a>
              <a 
                href="/pricing" 
                className="border-2 border-white px-8 py-4 text-lg font-normal rounded-xl hover:bg-white hover:text-[#2A7A8F] transition-all duration-300"
              >
                Contact for Advice
              </a>
            </div>
            <p className="text-sm text-blue-200 mt-6">
              Get expert guidance on payroll compliance and setup
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
