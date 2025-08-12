import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Register Business Name Ireland (2025 Guide) | PayVat',
  description: 'Complete guide to business name registration in Ireland. Check availability, reserve names, and incorporate in 7-10 days. CRO compliant process from €125 total.',
  keywords: 'register business name ireland, business name registration ireland, company registration ireland, CRO registration, business incorporation ireland',
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
    canonical: '/register-business-name-ireland',
  },
  openGraph: {
    title: 'Register Business Name Ireland (2025 Guide) | PayVat',
    description: 'Complete guide to business name registration in Ireland. Check availability, reserve names, and incorporate in 7-10 days. CRO compliant process from €125 total.',
    url: '/register-business-name-ireland',
    siteName: 'PayVat',
    locale: 'en_IE',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Register Business Name Ireland (2025 Guide) | PayVat',
    description: 'Complete guide to business name registration in Ireland. Check availability, reserve names, and incorporate in 7-10 days. CRO compliant process from €125 total.',
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

export default function RegisterBusinessNameIrelandLayout({
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
            "@type": "HowTo",
            "name": "How to Register a Business Name in Ireland",
            "description": "Step-by-step guide to registering a business name in Ireland through the Companies Registration Office (CRO), including name checks, reservation, and incorporation.",
            "image": "https://payvat.ie/images/business-name-registration.jpg",
            "totalTime": "P10D",
            "estimatedCost": {
              "@type": "MonetaryAmount",
              "currency": "EUR",
              "value": "125"
            },
            "supply": [
              {
                "@type": "HowToSupply",
                "name": "Form A1 incorporation application"
              },
              {
                "@type": "HowToSupply", 
                "name": "Memorandum and Articles of Association"
              },
              {
                "@type": "HowToSupply",
                "name": "Director and secretary identification"
              }
            ],
            "tool": [
              {
                "@type": "HowToTool",
                "name": "CRO online portal"
              },
              {
                "@type": "HowToTool",
                "name": "PayVat business setup service"
              }
            ],
            "step": [
              {
                "@type": "HowToStep",
                "name": "Check Name Availability",
                "text": "Search the CRO database and trademark registry to ensure your chosen business name is available and compliant.",
                "url": "https://payvat.ie/register-business-name-ireland#step-1"
              },
              {
                "@type": "HowToStep", 
                "name": "Reserve Your Name",
                "text": "Submit name reservation application with €25 fee to secure your chosen name for 28 days.",
                "url": "https://payvat.ie/register-business-name-ireland#step-2"
              },
              {
                "@type": "HowToStep",
                "name": "Prepare Documents", 
                "text": "Complete Form A1, Memorandum and Articles of Association, and gather required officer information.",
                "url": "https://payvat.ie/register-business-name-ireland#step-3"
              },
              {
                "@type": "HowToStep",
                "name": "Submit Incorporation",
                "text": "File complete incorporation application with CRO including €100 fee and receive company number within 5-7 days.",
                "url": "https://payvat.ie/register-business-name-ireland#step-4"
              }
            ],
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
            "dateModified": "2025-08-12"
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "Business Name Registration Ireland",
            "description": "Professional business name registration and incorporation services for Irish companies, including CRO compliance and VAT setup.",
            "provider": {
              "@type": "Organization",
              "name": "PayVat",
              "url": "https://payvat.ie"
            },
            "areaServed": {
              "@type": "Country",
              "name": "Ireland"
            },
            "offers": {
              "@type": "Offer",
              "price": "125",
              "priceCurrency": "EUR",
              "description": "Complete business name registration including CRO fees and professional guidance"
            }
          })
        }}
      />
      {children}
    </>
  )
}