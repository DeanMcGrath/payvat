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
      <div className="py-6 mt-12 sm:mt-16" style={{background: 'linear-gradient(to right, #f9fafb, rgba(129, 230, 217, 0.1))'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-center">
            <button 
              onClick={scrollToTop}
              className="group text-gray-600 hover:text-[#065666] font-medium transition-all duration-300 flex items-center gap-2 py-2 px-4 rounded-full hover:bg-white hover:shadow-md"
            >
              Back to Top <ArrowUp className="h-4 w-4 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <footer className="gradient-primary text-white py-12 sm:py-16 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#81E6D9]/20 to-transparent pointer-events-none"></div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#065666]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#81E6D9]/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Column 1 - Company & Services */}
            <div className="animate-fade-in">
              <h4 className="text-xl font-bold text-white mb-2">Company & Services</h4>
              <ul className="space-y-4">
                <li>
                  <Link 
                    href="/about" 
                    className="text-blue-100 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-blue-300 rounded-full group-hover:scale-150 transition-transform"></span>
                    <span className="payvat-brand">About PayVAT</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/contact" 
                    className="text-blue-100 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-blue-300 rounded-full group-hover:scale-150 transition-transform"></span>
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/faq" 
                    className="text-blue-100 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-blue-300 rounded-full group-hover:scale-150 transition-transform"></span>
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/pricing" 
                    className="text-blue-100 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-blue-300 rounded-full group-hover:scale-150 transition-transform"></span>
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/sitemap" 
                    className="text-blue-100 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-blue-300 rounded-full group-hover:scale-150 transition-transform"></span>
                    Sitemap
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2 - Business Setup */}
            <div className="animate-fade-in" style={{animationDelay: '0.2s'}}>
              <h4 className="text-xl font-bold text-white mb-2">Business Setup</h4>
              <ul className="space-y-4">
                <li>
                  <Link 
                    href="/complete-business-setup-guide-ireland" 
                    className="text-blue-100 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-blue-300 rounded-full group-hover:scale-150 transition-transform"></span>
                    Complete Business Setup Guide
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/start-a-business-ireland" 
                    className="text-blue-100 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-blue-300 rounded-full group-hover:scale-150 transition-transform"></span>
                    Start a Business Ireland
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/company-vs-sole-trader-ireland" 
                    className="text-blue-100 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-blue-300 rounded-full group-hover:scale-150 transition-transform"></span>
                    Company vs Sole Trader
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/dublin-business-registration" 
                    className="text-blue-100 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-blue-300 rounded-full group-hover:scale-150 transition-transform"></span>
                    Dublin Business Registration
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3 - VAT & Tax */}
            <div className="animate-fade-in" style={{animationDelay: '0.4s'}}>
              <h4 className="text-xl font-bold text-white mb-2">VAT & Tax</h4>
              <ul className="space-y-4">
                <li>
                  <Link 
                    href="/vat-guide" 
                    className="text-blue-100 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-blue-300 rounded-full group-hover:scale-150 transition-transform"></span>
                    Everything About VAT in Ireland
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/how-to-register-for-vat-ireland" 
                    className="text-blue-100 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-blue-300 rounded-full group-hover:scale-150 transition-transform"></span>
                    How to Register for VAT
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/vat-calculator-ireland" 
                    className="text-blue-100 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-blue-300 rounded-full group-hover:scale-150 transition-transform"></span>
                    VAT Calculator Ireland
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/freelancer-vat-ireland" 
                    className="text-blue-100 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-blue-300 rounded-full group-hover:scale-150 transition-transform"></span>
                    Freelancer VAT Ireland
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4 - Industry & Tools */}
            <div className="animate-fade-in" style={{animationDelay: '0.6s'}}>
              <h4 className="text-xl font-bold text-white mb-2">Industry & Tools</h4>
              <ul className="space-y-4">
                <li>
                  <Link 
                    href="/ecommerce-vat-ireland" 
                    className="text-blue-100 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-blue-300 rounded-full group-hover:scale-150 transition-transform"></span>
                    E-commerce VAT Ireland
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/accountant-fees-vs-payvat-savings" 
                    className="text-blue-100 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-blue-300 rounded-full group-hover:scale-150 transition-transform"></span>
                    <span className="payvat-brand">PayVAT</span> vs Accountant Fees
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/privacy" 
                    className="text-blue-100 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-blue-300 rounded-full group-hover:scale-150 transition-transform"></span>
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>

          </div>
          
          {/* Bottom Section */}
          <div className="mt-12 pt-8 border-t border-[#81E6D9]/30">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
              <p className="text-blue-100 text-center sm:text-left">
                © 2025 <span className="payvat-brand">PayVAT</span>. All rights reserved.
              </p>
              <div className="flex items-center space-x-4">
                <span className="text-blue-100 text-center sm:text-right font-medium">Ireland's complete business guidance platform</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}