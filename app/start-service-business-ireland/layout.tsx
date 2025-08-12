import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Start a Service Business in Ireland (2025) | PayVat',
  description: 'Complete guide to launching your service business in Ireland. Professional services, VAT compliance (€42.5k threshold), costs €3k-24k.',
  keywords: 'start service business ireland, professional services ireland, consultancy business ireland, service business vat ireland, freelance business ireland',
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
    canonical: '/start-service-business-ireland',
  },
  openGraph: {
    title: 'Start a Service Business in Ireland (2025) | PayVat',
    description: 'Complete guide to launching your service business in Ireland. Professional services, VAT compliance (€42.5k threshold), costs €3k-24k.',
    url: '/start-service-business-ireland',
    siteName: 'PayVat',
    locale: 'en_IE',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Start a Service Business in Ireland (2025) | PayVat',
    description: 'Complete guide to launching your service business in Ireland. Professional services, VAT compliance (€42.5k threshold), costs €3k-24k.',
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

export default function StartServiceBusinessIrelandLayout({
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
            "name": "How to Start a Service Business in Ireland",
            "description": "Complete guide to starting a service business in Ireland including professional qualifications, VAT compliance, insurance requirements, and client acquisition strategies.",
            "image": "https://payvat.ie/images/start-service-business-ireland.jpg",
            "totalTime": "P56D",
            "estimatedCost": {
              "@type": "MonetaryAmount",
              "currency": "EUR",
              "value": "3300"
            },
            "supply": [
              {
                "@type": "HowToSupply",
                "name": "Professional qualifications and certifications"
              },
              {
                "@type": "HowToSupply", 
                "name": "Professional indemnity insurance"
              },
              {
                "@type": "HowToSupply",
                "name": "Initial capital €3,300-24,200 depending on service type"
              },
              {
                "@type": "HowToSupply",
                "name": "Professional workspace and equipment"
              }
            ],
            "tool": [
              {
                "@type": "HowToTool",
                "name": "Companies Registration Office (CRO) portal"
              },
              {
                "@type": "HowToTool",
                "name": "Professional body registration"
              },
              {
                "@type": "HowToTool",
                "name": "Revenue Online Service (ROS)"
              },
              {
                "@type": "HowToTool",
                "name": "PayVat service business compliance platform"
              }
            ],
            "step": [
              {
                "@type": "HowToStep",
                "name": "Foundation and Qualifications",
                "text": "Verify professional qualifications, choose business structure (sole trader or limited company), and consider early VAT registration for credibility.",
                "url": "https://payvat.ie/start-service-business-ireland#service-checklist"
              },
              {
                "@type": "HowToStep", 
                "name": "Legal and Compliance Setup",
                "text": "Obtain professional indemnity insurance, create service contracts, and ensure GDPR compliance for client data protection.",
                "url": "https://payvat.ie/start-service-business-ireland#service-checklist"
              },
              {
                "@type": "HowToStep",
                "name": "Operations and Systems", 
                "text": "Setup business banking, implement professional invoicing with VAT compliance, and establish workspace for client meetings.",
                "url": "https://payvat.ie/start-service-business-ireland#service-checklist"
              },
              {
                "@type": "HowToStep",
                "name": "Marketing and Client Acquisition",
                "text": "Build professional website with portfolio, develop referral networks, and implement content marketing to demonstrate expertise.",
                "url": "https://payvat.ie/start-service-business-ireland#service-checklist"
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
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "How much does it cost to start a service business in Ireland?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Service business startup costs range from €3,300 for sole traders to €24,200 for professional practices. Includes business registration, professional insurance, equipment, website, and marketing. Monthly operating costs: €650-4,400."
                }
              },
              {
                "@type": "Question",
                "name": "What is the VAT threshold for service businesses in Ireland?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Service businesses must register for VAT when annual turnover exceeds €42,500 (vs €85,000 for goods). Many register early for credibility and to reclaim setup VAT on equipment and professional fees."
                }
              },
              {
                "@type": "Question",
                "name": "Do I need professional indemnity insurance for my service business?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, professional indemnity insurance is essential for advice-giving services and often mandatory for professional body membership. Costs €500-5,000 annually depending on sector and coverage level."
                }
              },
              {
                "@type": "Question",
                "name": "How do cross-border VAT rules work for service businesses?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "B2B services use reverse charge (customer pays VAT in their country with valid VAT number). B2C services follow place of supply rules. Digital services to EU consumers require MOSS registration."
                }
              },
              {
                "@type": "Question",
                "name": "Should I start as sole trader or limited company for services?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Sole trader for simple services with low risk (€0 setup cost). Limited company for advice-giving services, higher income potential, or liability concerns (€200 setup cost + ongoing compliance)."
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