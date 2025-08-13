'use client'

import { useState, useEffect } from 'react'
import SiteHeader from '../../components/site-header'
import Footer from '../../components/footer'

export default function DublinBusinessRegistration() {
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
        {/* Hero Section */}
        <section className={`relative py-20 px-4 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6 ">
              <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
              Dublin Business Registration Guide
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Register Your Business in 
              <span className="text-gradient-primary">
                Dublin (2025)
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Complete guide to business registration in Dublin. Local requirements, Dublin City Council processes, premises licensing, and VAT compliance for Ireland's business capital.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/signup" 
                className="btn-primary px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                Register Dublin Business
              </a>
              <a 
                href="#dublin-checklist" 
                className="px-8 py-4 text-lg font-semibold text-primary border-2 border-primary/20 rounded-xl hover:bg-primary/10 transition-all duration-300"
              >
                View Local Requirements
              </a>
            </div>
          </div>
        </section>

        {/* Dublin Business Advantages */}
        <section className="scroll-section py-16 px-4" id="dublin-advantages">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Why Register Your Business in Dublin?
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Dublin offers unique advantages for business registration and growth in Ireland.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="card-modern p-8 text-center hover:shadow-xl transition-all duration-300 group">
                <div className="icon-modern w-16 h-16 mx-auto mb-6 bg-green-100 text-green-600 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H7m2 0v-4a2 2 0 012-2h2a2 2 0 012 2v4M7 7h10M7 11h10" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">EU Headquarters</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Access to EU Single Market. 700+ multinationals have European headquarters in Dublin.
                </p>
                <div className="text-sm text-gray-500">
                  English-speaking + EU access
                </div>
              </div>
              
              <div className="card-modern p-8 text-center hover:shadow-xl transition-all duration-300 group">
                <div className="icon-modern w-16 h-16 mx-auto mb-6 bg-gray-100 text-teal-600 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Financial Hub</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Irish Financial Services Centre (IFSC). Access to venture capital, angel investors, and banking.
                </p>
                <div className="text-sm text-gray-500">
                  €50B+ funding ecosystem
                </div>
              </div>
              
              <div className="card-modern p-8 text-center hover:shadow-xl transition-all duration-300 group">
                <div className="icon-modern w-16 h-16 mx-auto mb-6 bg-gray-100 text-teal-600 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Tech Innovation</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Silicon Docks tech cluster. Google, Facebook, LinkedIn, Twitter European operations based here.
                </p>
                <div className="text-sm text-gray-500">
                  200,000+ tech jobs
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dublin-Specific Registration Requirements */}
        <section className="scroll-section py-16 px-4 bg-gray-50" id="dublin-checklist">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Dublin Business Registration Checklist (2025)
              </h2>
              <p className="text-lg text-gray-600">
                Step-by-step requirements specific to registering your business in Dublin.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="card-premium p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Step 1: National Business Registration (Week 1)</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Companies Registration Office (CRO)</h4>
                      <p className="text-gray-600">Register limited company with CRO (€125 standard, €200 same-day). Located in Parnell Square, Dublin 1</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Revenue Online Service (ROS)</h4>
                      <p className="text-gray-600">Tax Reference Number and VAT registration. Dublin Revenue offices in IFSC and Tallaght</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Business Bank Account</h4>
                      <p className="text-gray-600">AIB, Bank of Ireland, Permanent TSB all have business banking centres in Dublin city centre</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card-premium p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Step 2: Dublin City Council Requirements (Week 1-2)</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Commercial Rates Registration</h4>
                      <p className="text-gray-600">Register commercial premises with Dublin City Council. Rates office in City Hall, Dame Street</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Planning Permission Verification</h4>
                      <p className="text-gray-600">Confirm premises has appropriate planning permission for your business use. Dublin Planning Office, Wood Quay</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Signage and Advertising Permissions</h4>
                      <p className="text-gray-600">Apply for outdoor advertising permissions. Dublin's strict signage rules in city centre conservation areas</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card-premium p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Step 3: Industry-Specific Licenses (Week 2-4)</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Food Business (if applicable)</h4>
                      <p className="text-gray-600">Register with FSAI and Dublin City Council Environmental Health Office. Higher standards in city centre</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Liquor License (if applicable)</h4>
                      <p className="text-gray-600">Dublin District Court applications. More complex due to concentration of licensed premises</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Late Night Premises License</h4>
                      <p className="text-gray-600">Required for businesses operating after 11:30pm. Dublin City Council licensing office</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card-premium p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Step 4: Dublin Business Supports & Networks (Week 2-8)</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Local Enterprise Office Dublin City</h4>
                      <p className="text-gray-600">Free mentoring, grants (€3,000-20,000), training programs. Office in Tom Clarke Bridge, Dublin 1</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Dublin Chamber of Commerce</h4>
                      <p className="text-gray-600">Business networking, advocacy, member benefits. Largest chamber in Ireland with 1,200+ members</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Enterprise Ireland Supports</h4>
                      <p className="text-gray-600">Export development, innovation vouchers (€5,000), employment incentives. Dublin headquarters</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dublin Business Costs */}
        <section className="scroll-section py-16 px-4" id="dublin-costs">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Dublin Business Setup & Operating Costs (2025)
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Dublin has higher costs than other Irish locations but offers greater market access and opportunities.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="card-modern p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Setup Costs in Dublin</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <span className="font-medium text-gray-900">Company Registration</span>
                    <span className="font-bold text-teal-600">€125-200</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <span className="font-medium text-gray-900">Dublin City Council Rates</span>
                    <span className="font-bold text-teal-600">€500-2,000</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <span className="font-medium text-gray-900">Business Insurance (Dublin)</span>
                    <span className="font-bold text-teal-600">€1,200-4,000</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <span className="font-medium text-gray-900">Professional Services</span>
                    <span className="font-bold text-teal-600">€2,000-8,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">Bank Account & Setup</span>
                    <span className="font-bold text-teal-600">€200-800</span>
                  </div>
                </div>
              </div>
              
              <div className="card-modern p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Monthly Operating Costs</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <span className="font-medium text-gray-900">Office Rent (City Centre)</span>
                    <span className="font-bold text-teal-600">€35-65/m²</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <span className="font-medium text-gray-900">Office Rent (Suburbs)</span>
                    <span className="font-bold text-teal-600">€20-35/m²</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <span className="font-medium text-gray-900">Utilities & Services</span>
                    <span className="font-bold text-teal-600">€300-1,200</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <span className="font-medium text-gray-900">Parking (if needed)</span>
                    <span className="font-bold text-teal-600">€150-400</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">Staff Costs (higher)</span>
                    <span className="font-bold text-teal-600">+15-25%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card-premium p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Dublin vs Ireland Average Costs
              </h3>
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div>
                  <div className="text-sm text-gray-600">Office Rent</div>
                  <div className="text-lg font-bold text-orange-600">+40-60%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Staff Costs</div>
                  <div className="text-lg font-bold text-orange-600">+15-25%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Business Rates</div>
                  <div className="text-lg font-bold text-orange-600">+30-50%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Revenue Potential</div>
                  <div className="text-lg font-bold text-green-600">+50-100%</div>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Higher costs balanced by greater market access, customer base, and networking opportunities.
              </p>
              <a 
                href="/signup" 
                className="btn-primary px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105"
              >
                Register Your Dublin Business
              </a>
            </div>
          </div>
        </section>

        {/* Dublin Business Districts */}
        <section className="scroll-section py-16 px-4 bg-gray-50" id="dublin-districts">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Choose Your Dublin Business Location
              </h2>
              <p className="text-lg text-gray-600">
                Different Dublin districts offer distinct advantages for various business types.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="card-modern p-8 border-l-4 border-teal-500">
                <h3 className="text-xl font-bold text-teal-600 mb-3">Dublin 1 & 2 - City Centre</h3>
                <p className="text-gray-700 mb-4">
                  Prime business address, excellent transport links, prestigious location. High costs but maximum visibility and accessibility.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-teal-800 font-semibold">Best for: Professional services, headquarters, client-facing businesses</p>
                </div>
              </div>
              
              <div className="card-modern p-8 border-l-4 border-green-500">
                <h3 className="text-xl font-bold text-green-600 mb-3">Dublin 4 - Ballsbridge & IFSC</h3>
                <p className="text-gray-700 mb-4">
                  Financial services hub, multinational headquarters, premium business district. Access to international companies and networking.
                </p>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-green-800 font-semibold">Best for: Financial services, consulting, B2B services, tech companies</p>
                </div>
              </div>
              
              <div className="card-modern p-8 border-l-4 border-teal-500">
                <h3 className="text-xl font-bold text-teal-600 mb-3">Silicon Docks - Dublin 2 & 4</h3>
                <p className="text-gray-700 mb-4">
                  Tech cluster around Grand Canal, Google, Facebook, LinkedIn offices. Startup ecosystem and tech talent concentration.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-teal-800 font-semibold">Best for: Tech startups, software companies, digital agencies, fintech</p>
                </div>
              </div>
              
              <div className="card-modern p-8 border-l-4 border-orange-500">
                <h3 className="text-xl font-bold text-orange-600 mb-3">Dublin Suburbs - D6W, D14, D18</h3>
                <p className="text-gray-700 mb-4">
                  Lower costs, good transport links, business parks. Sandyford, Leopardstown, Citywest offer modern facilities at lower rents.
                </p>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-orange-800 font-semibold">Best for: Manufacturing, distribution, back-office operations, cost-conscious businesses</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dublin Support Services */}
        <section className="scroll-section py-16 px-4" id="dublin-support">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Dublin Business Support Ecosystem
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Access Ireland's most comprehensive business support network in Dublin.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="card-modern p-8 text-center hover:shadow-xl transition-all duration-300">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Government Supports</h3>
                <ul className="text-gray-600 space-y-2 text-left">
                  <li>• Local Enterprise Office Dublin City</li>
                  <li>• Enterprise Ireland headquarters</li>
                  <li>• IDA Ireland offices</li>
                  <li>• Department of Enterprise</li>
                  <li>• Revenue Commissioner offices</li>
                </ul>
              </div>
              
              <div className="card-modern p-8 text-center hover:shadow-xl transition-all duration-300">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Professional Services</h3>
                <ul className="text-gray-600 space-y-2 text-left">
                  <li>• Big 4 accounting firms</li>
                  <li>• Leading law firms</li>
                  <li>• Management consultancies</li>
                  <li>• Business formation specialists</li>
                  <li>• Intellectual property attorneys</li>
                </ul>
              </div>
              
              <div className="card-modern p-8 text-center hover:shadow-xl transition-all duration-300">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Funding & Networks</h3>
                <ul className="text-gray-600 space-y-2 text-left">
                  <li>• HBAN angel investor network</li>
                  <li>• VC firms (Kernel, Atlantic Bridge)</li>
                  <li>• Dublin Chamber of Commerce</li>
                  <li>• Startup incubators & accelerators</li>
                  <li>• DCU Ryan Academy</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="scroll-section py-20 px-4 bg-teal-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Register Your Business in Dublin?
            </h2>
            <p className="text-xl mb-8 text-teal-100">
              Access Ireland's business capital with complete registration support and ongoing VAT compliance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/signup" 
                className="bg-white text-teal-600 px-8 py-4 text-lg font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-105"
              >
                Start Dublin Registration
              </a>
              <a 
                href="/pricing" 
                className="border-2 border-white px-8 py-4 text-lg font-semibold rounded-xl hover:bg-white hover:text-teal-600 transition-all duration-300"
              >
                View Dublin Business Plans
              </a>
            </div>
            <p className="text-sm text-teal-200 mt-6">
              Join 45,000+ Dublin businesses using PayVat for seamless compliance
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}