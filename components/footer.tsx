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
              className="group text-gray-600 hover:text-[#065666] font-normal transition-all duration-300 flex items-center gap-2 py-2 px-4 rounded-full hover:bg-white hover:shadow-md"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Column 1 - Core */}
            <div className="animate-fade-in">
              <h4 className="text-xl font-normal text-white mb-2">Core Pages</h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="/"
                    className="text-blue-100 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-blue-300 rounded-full group-hover:scale-150 transition-transform"></span>
                    <span className="payvat-brand">PayVAT Home</span>
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
                    href="/faq" 
                    className="text-blue-100 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-blue-300 rounded-full group-hover:scale-150 transition-transform"></span>
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-blue-100 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-blue-300 rounded-full group-hover:scale-150 transition-transform"></span>
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="/beta-limitations"
                    className="text-blue-100 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-blue-300 rounded-full group-hover:scale-150 transition-transform"></span>
                    How PayVAT Works Today
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2 - Workflow */}
            <div className="animate-fade-in" style={{animationDelay: '0.2s'}}>
              <h4 className="text-xl font-normal text-white mb-2">Workflow</h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="/dashboard/documents"
                    className="text-blue-100 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-blue-300 rounded-full group-hover:scale-150 transition-transform"></span>
                    Documents
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/vat-returns"
                    className="text-blue-100 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-blue-300 rounded-full group-hover:scale-150 transition-transform"></span>
                    VAT Returns
                  </Link>
                </li>
                <li>
                  <Link
                    href="/vat-submission"
                    className="text-blue-100 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-blue-300 rounded-full group-hover:scale-150 transition-transform"></span>
                    VAT Submission
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/payments"
                    className="text-blue-100 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-blue-300 rounded-full group-hover:scale-150 transition-transform"></span>
                    Payments
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3 - Account & Legal */}
            <div className="animate-fade-in" style={{animationDelay: '0.4s'}}>
              <h4 className="text-xl font-normal text-white mb-2">Account & Legal</h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="/signup"
                    className="text-blue-100 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-blue-300 rounded-full group-hover:scale-150 transition-transform"></span>
                    Sign Up
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="text-blue-100 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-blue-300 rounded-full group-hover:scale-150 transition-transform"></span>
                    Login
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
                <li>
                  <Link
                    href="/terms"
                    className="text-blue-100 hover:text-white transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-blue-300 rounded-full group-hover:scale-150 transition-transform"></span>
                    Terms of Service
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
                <span className="text-blue-100 text-center sm:text-right font-normal">Ireland's complete business guidance platform</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
