"use client"

import { useEffect } from 'react'

export default function FAQSchema() {
  useEffect(() => {
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Who can use PayVAT?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Any Irish-registered business required to submit VAT returns can use PayVAT. Whether you're a micro-enterprise, an SME, or a growing startup, our platform scales to suit your needs."
          }
        },
        {
          "@type": "Question",
          "name": "How do I register for PayVAT?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Registration is simple: Visit PayVAT.ie, choose your plan (monthly or annual), enter your company details, create a password, verify your email, and you're ready to file your first VAT return!"
          }
        },
        {
          "@type": "Question",
          "name": "How does payment work with PayVAT?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "After you submit your VAT return through PayVAT, you can initiate your VAT payment via Revenue's Online Service (ROS) with one click—no need to log in separately. All payments are secure and directly processed by Revenue Ireland."
          }
        },
        {
          "@type": "Question",
          "name": "How much does PayVAT cost?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "PayVAT offers simple pricing: €90/month (cancel anytime) or €900/year (save €180 with annual billing). Both plans include unlimited VAT returns, expert support, and Revenue compliance."
          }
        },
        {
          "@type": "Question",
          "name": "Is there a free trial?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, we offer a 14-day free trial with no setup fees and no credit card required. Try all features risk-free before committing."
          }
        },
        {
          "@type": "Question",
          "name": "What's included in the PayVAT service?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "PayVAT includes VAT calculations, automatic submissions via ROS, payment processing integration, unlimited transactions, comprehensive reporting, and expert support from our Irish VAT specialists."
          }
        },
        {
          "@type": "Question",
          "name": "What are the VAT registration thresholds in Ireland?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "For 2025, VAT registration is required if your annual turnover exceeds €42,500 for services or €85,000 for goods. Register if you're likely to exceed these thresholds in the current or previous calendar year."
          }
        },
        {
          "@type": "Question",
          "name": "How often do I need to file VAT returns in Ireland?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "VAT filing frequency depends on your turnover: bi-monthly for most businesses (6 times per year), monthly for larger businesses with turnover over €3 million, or annually for smaller businesses under certain conditions."
          }
        },
        {
          "@type": "Question",
          "name": "What happens if I miss a VAT filing deadline?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Missing VAT deadlines results in penalties from Revenue Ireland. Late filing penalties start at €4 per day (minimum €125), plus interest on unpaid VAT. PayVAT's automated reminders help you avoid these costly penalties."
          }
        },
        {
          "@type": "Question",
          "name": "Can PayVAT integrate with my existing accounting software?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "PayVAT's AI-powered document processing works with receipts and invoices from any source. While direct integrations are planned, our current system processes your financial documents regardless of your accounting software."
          }
        }
      ]
    }

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(faqSchema)
    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  return null
}