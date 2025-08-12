'use client'

import { useState, useEffect } from 'react'
import SiteHeader from '../../components/site-header'
import Footer from '../../components/footer'

export default function GalwayBusinessRegistration() {
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
            <div className="inline-flex items-center px-4 py-2 bg-cyan-50 rounded-full text-cyan-700 text-sm font-medium mb-6 animate-pulse">
              <span className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></span>
              Galway Business Registration Guide
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Start Your Business in 
              <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Galway (2025)
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Complete guide to business registration in Galway. Company formation, VAT registration, local supports, and Galway's thriving tech and tourism opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/signup" 
                className="btn-primary px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                Start Galway Business Setup
              </a>
              <a 
                href="#galway-registration-guide" 
                className="px-8 py-4 text-lg font-semibold text-cyan-600 border-2 border-cyan-200 rounded-xl hover:bg-cyan-50 transition-all duration-300"
              >
                View Local Supports
              </a>
            </div>
          </div>
        </section>

        {/* Galway Business Registration Steps */}
        <section className="scroll-section py-16 px-4" id="galway-registration-guide">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Business Registration Process in Galway
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Step-by-step process for registering your business in Galway, including local requirements and unique opportunities.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="card-modern p-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-cyan-600 font-bold text-sm">1</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Choose Business Structure</h3>
                      <ul className="space-y-2 text-gray-700 text-sm">
                        <li className="flex items-start space-x-2">
                          <span className="text-cyan-500">•</span>
                          <span>Sole Trader - Quick setup for individuals</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-cyan-500">•</span>
                          <span>Partnership - Multiple founders</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-cyan-500">•</span>
                          <span>Private Limited Company - Most common</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-cyan-500">•</span>
                          <span>DAC - Designated Activity Company</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="card-modern p-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-cyan-600 font-bold text-sm">2</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Companies Registration Office</h3>
                      <ul className="space-y-2 text-gray-700 text-sm">
                        <li className="flex items-start space-x-2">
                          <span className="text-cyan-500">•</span>
                          <span>Online CRO registration system</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-cyan-500">•</span>
                          <span>Company name reservation</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-cyan-500">•</span>
                          <span>Constitutional documents filing</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-cyan-500">•</span>
                          <span>Director and secretary appointments</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="card-modern p-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-cyan-600 font-bold text-sm">3</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Revenue Registration</h3>
                      <ul className="space-y-2 text-gray-700 text-sm">
                        <li className="flex items-start space-x-2">
                          <span className="text-cyan-500">•</span>
                          <span>Corporation tax registration</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-cyan-500">•</span>
                          <span>VAT registration (if thresholds met)</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-cyan-500">•</span>
                          <span>PAYE/PRSI for staff</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-cyan-500">•</span>
                          <span>ROS digital access</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="card-modern p-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-cyan-600 font-bold text-sm">4</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Insurance Requirements</h3>
                      <ul className="space-y-2 text-gray-700 text-sm">
                        <li className="flex items-start space-x-2">
                          <span className="text-cyan-500">•</span>
                          <span>Employer's Liability (mandatory)</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-cyan-500">•</span>
                          <span>Public Liability coverage</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-cyan-500">•</span>
                          <span>Professional Indemnity (if applicable)</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-cyan-500">•</span>
                          <span>Cyber liability for tech businesses</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="card-modern p-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-cyan-600 font-bold text-sm">5</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Sector-Specific Licenses</h3>
                      <ul className="space-y-2 text-gray-700 text-sm">
                        <li className="flex items-start space-x-2">
                          <span className="text-cyan-500">•</span>
                          <span>Food business registration (FSAI)</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-cyan-500">•</span>
                          <span>Tourism operator licenses</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-cyan-500">•</span>
                          <span>Professional service licenses</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-cyan-500">•</span>
                          <span>Environmental permits</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="card-modern p-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center mt-1">
                      <span className="text-cyan-600 font-bold text-sm">6</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Galway Local Requirements</h3>
                      <ul className="space-y-2 text-gray-700 text-sm">
                        <li className="flex items-start space-x-2">
                          <span className="text-cyan-500">•</span>
                          <span>Galway City/County Council registration</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-cyan-500">•</span>
                          <span>Planning permissions (if required)</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-cyan-500">•</span>
                          <span>Fire safety certificates</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-cyan-500">•</span>
                          <span>Commercial rates assessment</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Galway Business Supports */}
        <section className="scroll-section py-16 px-4 bg-gray-50" id="galway-supports">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Galway Business Support Ecosystem
              </h2>
              <p className="text-lg text-gray-600">
                Comprehensive support network for entrepreneurs and growing businesses in Galway.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="card-modern p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Local Enterprise Office Galway</h3>
                <div className="space-y-3">
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold mb-2">Start-up Support:</p>
                    <ul className="space-y-1">
                      <li>• Start-up grants up to €15,000</li>
                      <li>• Business plan development</li>
                      <li>• Mentoring programs</li>
                      <li>• Training workshops</li>
                    </ul>
                  </div>
                  <div className="bg-cyan-50 p-3 rounded">
                    <p className="text-cyan-800 text-xs font-medium">Contact: County Hall, Prospect Hill</p>
                  </div>
                </div>
              </div>
              
              <div className="card-modern p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Galway Chamber of Commerce</h3>
                <div className="space-y-3">
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold mb-2">Business Development:</p>
                    <ul className="space-y-1">
                      <li>• Networking events</li>
                      <li>• Export support</li>
                      <li>• Business advocacy</li>
                      <li>• Member benefits</li>
                    </ul>
                  </div>
                  <div className="bg-cyan-50 p-3 rounded">
                    <p className="text-cyan-800 text-xs font-medium">Active business community</p>
                  </div>
                </div>
              </div>
              
              <div className="card-modern p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">NUI Galway Innovation</h3>
                <div className="space-y-3">
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold mb-2">Research & Development:</p>
                    <ul className="space-y-1">
                      <li>• Technology transfer</li>
                      <li>• Research partnerships</li>
                      <li>• Graduate talent</li>
                      <li>• Innovation funding</li>
                    </ul>
                  </div>
                  <div className="bg-cyan-50 p-3 rounded">
                    <p className="text-cyan-800 text-xs font-medium">University collaboration</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Galway Business Sectors */}
        <section className="scroll-section py-16 px-4" id="galway-sectors">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Key Business Sectors in Galway
              </h2>
              <p className="text-lg text-gray-600">
                Galway's economy spans technology, tourism, life sciences, and creative industries.
              </p>
            </div>
            
            <div className="card-premium p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Technology Hub</h3>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Software & Tech</h4>
                      <ul className="text-blue-800 text-sm space-y-1">
                        <li>• Major multinational presence</li>
                        <li>• Emerging tech startups</li>
                        <li>• Software development</li>
                        <li>• Digital services</li>
                      </ul>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">Life Sciences</h4>
                      <ul className="text-green-800 text-sm space-y-1">
                        <li>• Medical devices</li>
                        <li>• Biotechnology</li>
                        <li>• Research institutions</li>
                        <li>• Regulatory expertise</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Tourism & Creative</h3>
                  <div className="space-y-4">
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-orange-900 mb-2">Tourism</h4>
                      <ul className="text-orange-800 text-sm space-y-1">
                        <li>• Wild Atlantic Way hub</li>
                        <li>• Cultural tourism</li>
                        <li>• Hospitality services</li>
                        <li>• Adventure activities</li>
                      </ul>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-2">Arts & Culture</h4>
                      <ul className="text-purple-800 text-sm space-y-1">
                        <li>• Festival city (Arts, Film, Oyster)</li>
                        <li>• Creative industries</li>
                        <li>• Film and media</li>
                        <li>• Traditional music</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Galway Advantages */}
        <section className="scroll-section py-16 px-4 bg-gray-50" id="galway-advantages">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Why Start Your Business in Galway?
              </h2>
              <p className="text-lg text-gray-600">
                Unique advantages that make Galway an attractive location for new businesses.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="card-modern p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Strategic Location</h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-2">
                      <span className="text-cyan-500">✓</span>
                      <span>Gateway to Atlantic economy</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-cyan-500">✓</span>
                      <span>EU's most westerly city</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-cyan-500">✓</span>
                      <span>Strong transport links</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-cyan-500">✓</span>
                      <span>Port access for trade</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="card-modern p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Talent Pool</h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-2">
                      <span className="text-cyan-500">✓</span>
                      <span>University graduates</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-cyan-500">✓</span>
                      <span>Skilled tech workforce</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-cyan-500">✓</span>
                      <span>Multilingual capabilities</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-cyan-500">✓</span>
                      <span>Research expertise</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="card-modern p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Quality of Life</h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-2">
                      <span className="text-cyan-500">✓</span>
                      <span>Vibrant cultural scene</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-cyan-500">✓</span>
                      <span>Natural beauty access</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-cyan-500">✓</span>
                      <span>Affordable compared to Dublin</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-cyan-500">✓</span>
                      <span>Strong community spirit</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Galway Business Registration Checklist */}
        <section className="scroll-section py-16 px-4" id="galway-checklist">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Galway Business Registration Checklist
              </h2>
              <p className="text-lg text-gray-600">
                Complete checklist for establishing your business in Galway successfully.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="card-premium p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Complete Setup Process</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Core Registrations</h4>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500">✓</span>
                        <span>Reserve and register company name</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500">✓</span>
                        <span>File with Companies Registration Office</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500">✓</span>
                        <span>Complete Revenue registrations</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500">✓</span>
                        <span>Setup VAT if threshold exceeded</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-green-500">✓</span>
                        <span>Open business bank account</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Galway-Specific</h4>
                    <ul className="space-y-2 text-gray-700 text-sm">
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-500">✓</span>
                        <span>Register with Galway City/County Council</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-500">✓</span>
                        <span>Obtain required business licenses</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-500">✓</span>
                        <span>Secure appropriate insurance</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-500">✓</span>
                        <span>Connect with LEO Galway supports</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-500">✓</span>
                        <span>Join Galway Chamber of Commerce</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="scroll-section py-20 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Launch Your Galway Business Today
            </h2>
            <p className="text-xl mb-8 text-cyan-100">
              Complete business registration support for Galway. From company formation to VAT compliance, leverage our expertise for your success in the City of the Tribes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/signup" 
                className="bg-white text-cyan-600 px-8 py-4 text-lg font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-105"
              >
                Start Galway Business Setup
              </a>
              <a 
                href="/pricing" 
                className="border-2 border-white px-8 py-4 text-lg font-semibold rounded-xl hover:bg-white hover:text-cyan-600 transition-all duration-300"
              >
                View Business Plans
              </a>
            </div>
            <p className="text-sm text-cyan-200 mt-6">
              Join 300+ Galway businesses using PayVat for compliance
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}