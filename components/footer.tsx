"use client"

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company */}
          <div>
            <h3 className="font-semibold text-white mb-4">PAY VAT</h3>
            <p className="text-gray-400 text-sm">
              Simplifying VAT compliance for Irish businesses
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-medium text-white mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/pricing" 
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link 
                  href="/vat-guide" 
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  VAT Guide
                </Link>
              </li>
              <li>
                <Link 
                  href="/dashboard" 
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Info */}
          <div>
            <h4 className="font-medium text-white mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/about" 
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  href="/faq" 
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <a 
                  href="mailto:support@payvat.ie" 
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-medium text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/privacy" 
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms" 
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link 
                  href="/gdpr" 
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  GDPR
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <hr className="border-gray-700 my-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 PayVAT. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="text-gray-400 text-sm">payvat.ie</span>
          </div>
        </div>
      </div>
    </footer>
  )
}