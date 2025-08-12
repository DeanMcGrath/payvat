import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Property Rental VAT Ireland (2025) - Complete Guide | PayVat',
  description: 'Property rental VAT guide for Ireland. Residential exemptions, commercial property VAT, short-term rentals, Airbnb rules, landlord compliance requirements.',
  keywords: 'property rental vat ireland, landlord vat ireland, airbnb vat ireland, commercial property vat, residential rental vat exemption',
  authors: [{ name: 'PayVat Team' }],
  creator: 'PayVat',
  publisher: 'PayVat',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://payvat.ie'),
  alternates: {
    canonical: '/property-rental-vat-ireland',
  },
  openGraph: {
    title: 'Property Rental VAT Ireland (2025) - Complete Guide | PayVat',
    description: 'Property rental VAT guide for Ireland. Residential exemptions, commercial property VAT, short-term rentals, Airbnb rules, landlord compliance requirements.',
    url: '/property-rental-vat-ireland',
    siteName: 'PayVat',
    locale: 'en_IE',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Property Rental VAT Ireland (2025) - Complete Guide | PayVat',
    description: 'Property rental VAT guide for Ireland. Residential exemptions, commercial property VAT, short-term rentals, Airbnb rules, landlord compliance requirements.',
    creator: '@payvat_ie',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function PropertyRentalVatIrelandLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Complete Property Rental VAT Guide for Ireland 2025",
            "description": "Comprehensive guide to VAT for property rentals in Ireland including residential exemptions, commercial property options, short-term rental rules, and landlord compliance requirements.",
            "image": "https://payvat.ie/images/property-rental-vat-ireland.jpg",
            "author": {
              "@type": "Organization",
              "name": "PayVat",
              "url": "https://payvat.ie"
            },
            "publisher": {
              "@type": "Organization",
              "name": "PayVat",
              "url": "https://payvat.ie",
              "logo": {
                "@type": "ImageObject",
                "url": "https://payvat.ie/logo.png"
              }
            },
            "datePublished": "2025-08-12",
            "dateModified": "2025-08-12",
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "https://payvat.ie/property-rental-vat-ireland"
            }
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Is residential property rental subject to VAT in Ireland?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "No, long-term residential property rentals are exempt from VAT in Ireland. You cannot charge VAT on residential rent and cannot reclaim VAT on related expenses. However, short-term lets (like Airbnb) are subject to 9% VAT."
                }
              },
              {
                "@type": "Question",
                "name": "Can I charge VAT on commercial property rent in Ireland?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, you can opt to charge 23% VAT on commercial property rent if both landlord and tenant agree. This allows you to reclaim VAT on property expenses and is beneficial for VAT-registered tenants."
                }
              },
              {
                "@type": "Question",
                "name": "What VAT applies to Airbnb and short-term rentals?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Short-term rentals including Airbnb are considered accommodation services and subject to 9% VAT. You must register for VAT if annual income exceeds €42,500 and file bi-monthly returns."
                }
              },
              {
                "@type": "Question",
                "name": "What VAT rate applies to new property development?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "New residential properties are subject to 13.5% VAT on first supply within 5 years of completion. Commercial properties are subject to 23% VAT. The Capital Goods Scheme may apply for adjustments."
                }
              },
              {
                "@type": "Question",
                "name": "Should landlords register for VAT in Ireland?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Residential-only landlords generally shouldn't register. Commercial property landlords should consider it to reclaim input VAT. Short-term rental landlords must register if exceeding €42,500 annually."
                }
              }
            ]
          })
        }}
      />
      {children}
    </>
  )
}