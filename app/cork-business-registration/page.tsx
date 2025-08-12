'use client'

import { useState, useEffect } from 'react'
import SiteHeader from '../../components/site-header'
import Footer from '../../components/footer'

export default function CorkBusinessRegistration() {
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
            <div className="inline-flex items-center px-4 py-2 bg-red-50 rounded-full text-red-700 text-sm font-medium mb-6 animate-pulse">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              Cork Business Registration Guide
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Start Your Business in 
              <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                Cork (2025)
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Complete guide to business registration in Cork. Company formation, VAT registration, local supports, and Cork-specific opportunities for entrepreneurs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/signup" 
                className="btn-primary px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                Start Cork Business Setup
              </a>
              <a 
                href="#cork-registration-guide" 
                className="px-8 py-4 text-lg font-semibold text-red-600 border-2 border-red-200 rounded-xl hover:bg-red-50 transition-all duration-300"
              >
                View Local Supports
              </a>
            </div>
          </div>
        </section>

        {/* Cork Business Registration Steps */}
        <section className="scroll-section py-16 px-4" id="cork-registration-guide">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Business Registration Process in Cork
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Step-by-step process for registering your business in Cork, including local requirements and supports.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="card-modern p-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-red-600 font-bold text-sm">1</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Choose Business Structure</h3>
                      <ul className="space-y-2 text-gray-700 text-sm">
                        <li className="flex items-start space-x-2">
                          <span className="text-red-500">•</span>
                          <span>Sole Trader - Simplest for individuals</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-red-500">•</span>
                          <span>Partnership - For multiple owners</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-red-500">•</span>
                          <span>Limited Company - Most popular for growth</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-red-500">•</span>
                          <span>DAC/PLC - For larger enterprises</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="card-modern p-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-red-600 font-bold text-sm">2</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Register with CRO</h3>
                      <ul className="space-y-2 text-gray-700 text-sm">
                        <li className="flex items-start space-x-2">
                          <span className="text-red-500">•</span>
                          <span>Companies Registration Office filing</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-red-500">•</span>
                          <span>Form A1 for new companies</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-red-500">•</span>
                          <span>Constitution and compliance</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-red-500">•</span>
                          <span>Director appointments</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="card-modern p-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-red-600 font-bold text-sm">3</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Revenue Registration</h3>
                      <ul className="space-y-2 text-gray-700 text-sm">
                        <li className="flex items-start space-x-2">
                          <span className="text-red-500">•</span>
                          <span>Tax registration (Form TR1/TR2)</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-red-500">•</span>
                          <span>PAYE/PRSI for employees</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-red-500">•</span>
                          <span>VAT registration if required</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-red-500">•</span>
                          <span>ROS online access setup</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="card-modern p-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-red-600 font-bold text-sm">4</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Insurance & Compliance</h3>
                      <ul className="space-y-2 text-gray-700 text-sm">
                        <li className="flex items-start space-x-2">
                          <span className="text-red-500">•</span>
                          <span>Employer's Liability Insurance</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-red-500">•</span>
                          <span>Public Liability Insurance</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-red-500">•</span>
                          <span>Professional Indemnity if applicable</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-red-500">•</span>
                          <span>Data protection compliance (GDPR)</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="card-modern p-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-red-600 font-bold text-sm">5</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Business Licenses</h3>
                      <ul className="space-y-2 text-gray-700 text-sm">
                        <li className="flex items-start space-x-2">
                          <span className="text-red-500">•</span>
                          <span>Trading licenses (sector-specific)</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-red-500">•</span>
                          <span>Planning permissions if required</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-red-500">•</span>
                          <span>Food business registration</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-red-500">•</span>
                          <span>Waste collection permits</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="card-modern p-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-red-600 font-bold text-sm">6</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Cork Local Requirements</h3>
                      <ul className="space-y-2 text-gray-700 text-sm">
                        <li className="flex items-start space-x-2">
                          <span className="text-red-500">•</span>
                          <span>Cork City/County Council registration</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-red-500">•</span>
                          <span>Shop front/signage permits</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-red-500">•</span>
                          <span>Fire safety certificates</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-red-500">•</span>
                          <span>Commercial rates registration</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cork Business Supports */}
        <section className="scroll-section py-16 px-4 bg-gray-50" id="cork-supports">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Cork Business Support Services
              </h2>
              <p className="text-lg text-gray-600">
                Local and regional supports available to Cork entrepreneurs and businesses.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="card-modern p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Local Enterprise Office Cork</h3>
                <div className="space-y-3">
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold mb-2">Services Available:</p>
                    <ul className="space-y-1">
                      <li>• Business plan development</li>
                      <li>• Start-up grants up to €15,000</li>
                      <li>• Mentoring and training</li>
                      <li>• Feasibility study grants</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 p-3 rounded">
                    <p className="text-red-800 text-xs font-medium">Contact: Cork City Hall, Anglesea Street</p>
                  </div>
                </div>
              </div>
              
              <div className="card-modern p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Cork Chamber of Commerce</h3>
                <div className="space-y-3">
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold mb-2">Business Benefits:</p>
                    <ul className="space-y-1">
                      <li>• Networking opportunities</li>
                      <li>• Business development support</li>
                      <li>• Export assistance</li>
                      <li>• Policy advocacy</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 p-3 rounded">
                    <p className="text-red-800 text-xs font-medium">Member benefits and events</p>
                  </div>
                </div>
              </div>
              
              <div className="card-modern p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">UCC Innovation & Research</h3>
                <div className="space-y-3">
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold mb-2">Tech Supports:</p>
                    <ul className="space-y-1">
                      <li>• Technology transfer</li>
                      <li>• R&D partnerships</li>
                      <li>• Talent access</li>
                      <li>• Innovation funding</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 p-3 rounded">
                    <p className="text-red-800 text-xs font-medium">University-industry collaboration</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cork Industry Sectors */}
        <section className="scroll-section py-16 px-4" id="cork-sectors">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Key Business Sectors in Cork
              </h2>
              <p className="text-lg text-gray-600">
                Cork's diverse economy offers opportunities across multiple growing sectors.
              </p>
            </div>
            
            <div className="card-premium p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Established Sectors</h3>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Pharmaceuticals</h4>
                      <ul className="text-blue-800 text-sm space-y-1">
                        <li>• Major global companies present</li>
                        <li>• Supply chain opportunities</li>
                        <li>• Life sciences ecosystem</li>
                        <li>• Research collaborations</li>
                      </ul>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">Technology</h4>
                      <ul className="text-green-800 text-sm space-y-1">
                        <li>• Software development</li>
                        <li>• Fintech and cybersecurity</li>
                        <li>• Gaming and digital media</li>
                        <li>• Enterprise solutions</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Growing Opportunities</h3>
                  <div className="space-y-4">
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-orange-900 mb-2">Tourism & Hospitality</h4>
                      <ul className="text-orange-800 text-sm space-y-1">
                        <li>• Wild Atlantic Way gateway</li>
                        <li>• Food and beverage tourism</li>
                        <li>• Business tourism</li>
                        <li>• Cultural attractions</li>
                      </ul>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-2">Creative Industries</h4>
                      <ul className="text-purple-800 text-sm space-y-1">
                        <li>• Film and television</li>
                        <li>• Music and performing arts</li>
                        <li>• Design and architecture</li>
                        <li>• Digital content creation</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cork Business Registration Checklist */}
        <section className="scroll-section py-16 px-4 bg-gray-50" id="cork-checklist">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Cork Business Registration Checklist
              </h2>
              <p className="text-lg text-gray-600">
                Complete checklist for starting your business in Cork successfully.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="card-premium p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Essential Steps</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Legal & Compliance</h4>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500">✓</span>
                        <span>Choose and register business name</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500">✓</span>
                        <span>Select appropriate business structure</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500">✓</span>
                        <span>Register with Companies Registration Office</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500">✓</span>
                        <span>Obtain tax number from Revenue</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500">✓</span>
                        <span>Register for VAT if threshold exceeded</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Local Requirements</h4>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-500">✓</span>
                        <span>Register with Cork City/County Council</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-500">✓</span>
                        <span>Obtain required business licenses</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-500">✓</span>
                        <span>Secure appropriate insurance coverage</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-500">✓</span>
                        <span>Setup business bank account</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-500">✓</span>
                        <span>Consider Local Enterprise Office supports</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="scroll-section py-20 px-4 bg-gradient-to-r from-red-600 to-orange-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Start Your Cork Business Journey Today
            </h2>
            <p className="text-xl mb-8 text-red-100">
              Get complete business registration support for Cork. From company formation to VAT compliance, we handle the complexity so you can focus on growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/signup" 
                className="bg-white text-red-600 px-8 py-4 text-lg font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-105"
              >
                Start Cork Business Setup
              </a>
              <a 
                href="/pricing" 
                className="border-2 border-white px-8 py-4 text-lg font-semibold rounded-xl hover:bg-white hover:text-red-600 transition-all duration-300"
              >
                View Business Plans
              </a>
            </div>
            <p className="text-sm text-red-200 mt-6">
              Join 400+ Cork businesses using PayVat for compliance
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}