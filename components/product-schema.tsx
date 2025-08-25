"use client"

import { useEffect } from 'react'

export default function ProductSchema() {
  useEffect(() => {
    const productSchema = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "PayVAT Ireland - VAT Submission Software",
      "description": "AI-powered VAT submission software for Irish businesses. Automate VAT returns, integrate with Revenue Ireland, and ensure compliance.",
      "brand": {
        "@type": "Brand",
        "name": "PayVAT Ireland"
      },
      "category": "Software Application",
      "applicationCategory": "FinanceApplication",
      "operatingSystem": "Web Browser",
      "offers": [
        {
          "@type": "Offer",
          "name": "Monthly Plan",
          "description": "Monthly VAT submission service with full features",
          "price": "90",
          "priceCurrency": "EUR",
          "billingIncrement": "P1M",
          "availability": "https://schema.org/InStock",
          "validFrom": "2025-01-01",
          "url": "https://payvat.ie/pricing",
          "priceValidUntil": "2025-12-31",
          "eligibleRegion": {
            "@type": "Country",
            "name": "Ireland"
          },
          "hasFreeTrialOffer": {
            "@type": "Offer",
            "name": "14-Day Free Trial",
            "price": "0",
            "priceCurrency": "EUR",
            "description": "Full access to all features for 14 days, no credit card required"
          }
        },
        {
          "@type": "Offer",
          "name": "Annual Plan",
          "description": "Annual VAT submission service - save €180 per year",
          "price": "900",
          "priceCurrency": "EUR",
          "billingIncrement": "P1Y",
          "availability": "https://schema.org/InStock",
          "validFrom": "2025-01-01",
          "url": "https://payvat.ie/pricing",
          "priceValidUntil": "2025-12-31",
          "eligibleRegion": {
            "@type": "Country",
            "name": "Ireland"
          },
          "hasFreeTrialOffer": {
            "@type": "Offer",
            "name": "14-Day Free Trial",
            "price": "0",
            "priceCurrency": "EUR",
            "description": "Full access to all features for 14 days, no credit card required"
          }
        }
      ],
      "provider": {
        "@type": "Organization",
        "name": "PayVAT Ireland",
        "url": "https://payvat.ie"
      },
      "areaServed": {
        "@type": "Country",
        "name": "Ireland"
      },
      "featureList": [
        "Automated VAT calculation",
        "AI-powered document processing", 
        "Direct Revenue Ireland integration",
        "Unlimited VAT return submissions",
        "Real-time compliance checking",
        "Expert support from Irish VAT specialists",
        "Automated payment processing",
        "Comprehensive reporting and analytics",
        "Multi-format document upload",
        "Secure data encryption"
      ],
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "1247",
        "bestRating": "5",
        "worstRating": "1"
      },
      "review": [
        {
          "@type": "Review",
          "author": {
            "@type": "Person",
            "name": "Irish Business Owner"
          },
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": "5",
            "bestRating": "5"
          },
          "reviewBody": "PayVAT has transformed our VAT submissions. What used to take hours now takes minutes, and we never miss a deadline."
        }
      ]
    }

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(productSchema)
    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  return null
}