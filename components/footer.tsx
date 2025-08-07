"use client"

import Link from 'next/link'
import { ExternalLink, ArrowUp } from 'lucide-react'

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      {/* Utility Section */}
      <div className="bg-gray-100 py-4 mt-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center">
            <Link 
              href="/" 
              className="text-gray-600 hover:text-gray-800 text-sm underline transition-colors"
            >
              Back to Homepage
            </Link>
            <button 
              onClick={scrollToTop}
              className="text-gray-600 hover:text-gray-800 text-sm underline transition-colors flex items-center gap-1"
            >
              Back to Top <ArrowUp className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <footer className="bg-teal-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Column 1 - Company & Services */}
            <div>
              <h4 className="font-semibold text-white mb-4">Company & Services</h4>
              <ul className="space-y-3">
                <li>
                  <Link 
                    href="/about" 
                    className="text-white hover:text-teal-100 underline transition-colors"
                  >
                    About PayVAT
                  </Link>
                </li>
                <li>
                  <a 
                    href="mailto:support@payvat.ie" 
                    className="text-white hover:text-teal-100 underline transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <Link 
                    href="/faq" 
                    className="text-white hover:text-teal-100 underline transition-colors"
                  >
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/pricing" 
                    className="text-white hover:text-teal-100 underline transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <a 
                    href="mailto:support@payvat.ie" 
                    className="text-white hover:text-teal-100 underline transition-colors"
                  >
                    Customer Service
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 2 - VAT Resources */}
            <div>
              <h4 className="font-semibold text-white mb-4">VAT Resources</h4>
              <ul className="space-y-3">
                <li>
                  <Link 
                    href="/vat-guide" 
                    className="text-white hover:text-teal-100 underline transition-colors"
                  >
                    Everything You Need to Know About VAT in Ireland
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/vat-period" 
                    className="text-white hover:text-teal-100 underline transition-colors"
                  >
                    VAT Calculator
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/vat-guide" 
                    className="text-white hover:text-teal-100 underline transition-colors"
                  >
                    Tax Education
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/reports" 
                    className="text-white hover:text-teal-100 underline transition-colors"
                  >
                    VAT Statistics
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3 - Legal & Compliance */}
            <div>
              <h4 className="font-semibold text-white mb-4">Legal & Compliance</h4>
              <ul className="space-y-3">
                <li>
                  <Link 
                    href="/privacy" 
                    className="text-white hover:text-teal-100 underline transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/terms" 
                    className="text-white hover:text-teal-100 underline transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/accessibility" 
                    className="text-white hover:text-teal-100 underline transition-colors"
                  >
                    Accessibility
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/gdpr" 
                    className="text-white hover:text-teal-100 underline transition-colors"
                  >
                    GDPR Compliance
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/statutory" 
                    className="text-white hover:text-teal-100 underline transition-colors"
                  >
                    Statutory Obligations
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4 - External & Government */}
            <div>
              <h4 className="font-semibold text-white mb-4">External & Government</h4>
              <ul className="space-y-3">
                <li>
                  <a 
                    href="https://revenue.ie" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white hover:text-teal-100 underline transition-colors flex items-center gap-1"
                  >
                    Revenue.ie <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>
                  <a 
                    href="https://gov.ie" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white hover:text-teal-100 underline transition-colors flex items-center gap-1"
                  >
                    gov.ie <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>
                  <a 
                    href="mailto:feedback@payvat.ie" 
                    className="text-white hover:text-teal-100 underline transition-colors"
                  >
                    Website Feedback
                  </a>
                </li>
                <li>
                  <Link 
                    href="/" 
                    className="text-white hover:text-teal-100 underline transition-colors"
                  >
                    Back to Homepage
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Bottom Section */}
          <hr className="border-teal-600 my-8" />
          
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-teal-100 text-sm">
              © 2024 PayVAT. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-teal-100 text-sm">Irish VAT compliance made simple</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}