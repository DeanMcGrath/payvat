"use client"

import Link from 'next/link'
import { ArrowUp } from 'lucide-react'

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      {/* Utility Section */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 py-6 mt-12 sm:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-center">
            <button 
              onClick={scrollToTop}
              className="group text-gray-600 hover:text-teal-700 font-medium transition-all duration-300 flex items-center gap-2 py-2 px-4 rounded-full hover:bg-white hover:shadow-md"
            >
              Back to Top <ArrowUp className="h-4 w-4 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <footer className="gradient-primary text-white py-12 sm:py-16 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-700/20 to-transparent pointer-events-none"></div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-teal-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Column 1 - Company & Services */}
            <div className="animate-fade-in">
              <h4 className="text-xl font-bold text-white mb-6">Company & Services</h4>
              <ul className="space-y-4">
                <li>
                  <Link 
                    href="/about" 
                    className="text-teal-100 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-teal-300 rounded-full group-hover:scale-150 transition-transform"></span>
                    About PayVAT
                  </Link>
                </li>
                <li>
                  <a 
                    href="mailto:support@payvat.ie" 
                    className="text-teal-100 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-teal-300 rounded-full group-hover:scale-150 transition-transform"></span>
                    Contact Us
                  </a>
                </li>
                <li>
                  <Link 
                    href="/faq" 
                    className="text-teal-100 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-teal-300 rounded-full group-hover:scale-150 transition-transform"></span>
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/pricing" 
                    className="text-teal-100 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-teal-300 rounded-full group-hover:scale-150 transition-transform"></span>
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2 - VAT Resources */}
            <div className="animate-fade-in" style={{animationDelay: '0.2s'}}>
              <h4 className="text-xl font-bold text-white mb-6">VAT Resources</h4>
              <ul className="space-y-4">
                <li>
                  <Link 
                    href="/vat-guide" 
                    className="text-teal-100 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-teal-300 rounded-full group-hover:scale-150 transition-transform"></span>
                    Everything You Need to Know About VAT in Ireland
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/vat-registration" 
                    className="text-teal-100 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-teal-300 rounded-full group-hover:scale-150 transition-transform"></span>
                    How to Apply for a VAT Number
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3 - Legal & Compliance */}
            <div className="animate-fade-in" style={{animationDelay: '0.4s'}}>
              <h4 className="text-xl font-bold text-white mb-6">Legal & Compliance</h4>
              <ul className="space-y-4">
                <li>
                  <Link 
                    href="/privacy" 
                    className="text-teal-100 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-teal-300 rounded-full group-hover:scale-150 transition-transform"></span>
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/terms" 
                    className="text-teal-100 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-teal-300 rounded-full group-hover:scale-150 transition-transform"></span>
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>

          </div>
          
          {/* Bottom Section */}
          <div className="mt-12 pt-8 border-t border-teal-600/30">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
              <p className="text-teal-100 text-center sm:text-left">
                © 2024 PayVAT. All rights reserved.
              </p>
              <div className="flex items-center space-x-4">
                <span className="text-teal-100 text-center sm:text-right font-medium">Irish VAT compliance made simple</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}