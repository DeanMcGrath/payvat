import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Digital Services VAT Ireland (2025) | PayVat',
  description: 'Complete digital services VAT guide. B2B/B2C rules, place of supply, OSS registration, EU VAT rates. Automated compliance for Irish tech companies.',
  keywords: 'digital services vat ireland, oss registration ireland, eu vat digital services, b2b b2c vat rules, place of supply digital',
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
    canonical: '/digital-services-vat-ireland',
  },
  openGraph: {
    title: 'Digital Services VAT Ireland (2025) | PayVat',
    description: 'Complete digital services VAT guide. B2B/B2C rules, place of supply, OSS registration, EU VAT rates. Automated compliance for Irish tech companies.',
    url: '/digital-services-vat-ireland',
    siteName: 'PayVat',
    locale: 'en_IE',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Digital Services VAT Ireland (2025) | PayVat',
    description: 'Complete digital services VAT guide. B2B/B2C rules, place of supply, OSS registration, EU VAT rates. Automated compliance for Irish tech companies.',
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

export default function DigitalServicesVatIrelandLayout({
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
            "headline": "Complete Digital Services VAT Guide for Ireland 2025",
            "description": "Comprehensive guide to VAT compliance for digital services including B2B/B2C rules, place of supply, OSS registration, and EU cross-border compliance.",
            "image": "https://payvat.ie/images/digital-services-vat-ireland.jpg",
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
              "@id": "https://payvat.ie/digital-services-vat-ireland"
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
                "name": "What are digital services for VAT purposes in Ireland?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Digital services include software/SaaS, mobile apps, digital content (e-books, music, videos), web services, online platforms, and digital training. Traditional consulting, professional services, and physical goods are not digital services."
                }
              },
              {
                "@type": "Question",
                "name": "How do B2B VAT rules work for digital services?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "For EU business customers with valid VAT numbers, reverse charge applies - invoice at 0% VAT stating 'Reverse charge applies'. Customer pays VAT in their country. You must validate VAT numbers and submit monthly EC Sales Lists."
                }
              },
              {
                "@type": "Question",
                "name": "Do I need OSS registration for digital services?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "OSS registration is required when selling digital services to EU consumers from the first €1 (no threshold). It simplifies compliance by allowing quarterly returns through Irish Revenue instead of registering in each EU country."
                }
              },
              {
                "@type": "Question",
                "name": "What evidence do I need for customer location?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "You need 2 pieces of evidence: billing address, IP address location, bank account country, mobile number country, payment card issuing country, or landline location. If conflicting, use billing address first, then IP address."
                }
              },
              {
                "@type": "Question",
                "name": "What VAT rate do I charge EU consumers for digital services?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Charge the VAT rate of the customer's country. Rates range from 19% (Germany) to 27% (Hungary). Irish consumers pay 23%. PayVat automatically applies correct rates based on customer location."
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