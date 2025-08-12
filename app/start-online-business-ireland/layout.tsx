import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Start an Online Business in Ireland (2025) | PayVat',
  description: 'Complete guide to launching your online business in Ireland. EU VAT compliance, e-commerce setup, digital services, costs €5k-50k.',
  keywords: 'start online business ireland, ecommerce business ireland, digital services vat ireland, eu vat compliance, online business setup ireland',
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
    canonical: '/start-online-business-ireland',
  },
  openGraph: {
    title: 'Start an Online Business in Ireland (2025) | PayVat',
    description: 'Complete guide to launching your online business in Ireland. EU VAT compliance, e-commerce setup, digital services, costs €5k-50k.',
    url: '/start-online-business-ireland',
    siteName: 'PayVat',
    locale: 'en_IE',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Start an Online Business in Ireland (2025) | PayVat',
    description: 'Complete guide to launching your online business in Ireland. EU VAT compliance, e-commerce setup, digital services, costs €5k-50k.',
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

export default function StartOnlineBusinessIrelandLayout({
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
            "name": "How to Start an Online Business in Ireland",
            "description": "Complete guide to launching an online business in Ireland including EU VAT compliance, digital infrastructure, payment processing, and marketing setup.",
            "image": "https://payvat.ie/images/start-online-business-ireland.jpg",
            "totalTime": "P56D",
            "estimatedCost": {
              "@type": "MonetaryAmount",
              "currency": "EUR",
              "value": "5300"
            },
            "supply": [
              {
                "@type": "HowToSupply",
                "name": "Business plan and digital strategy"
              },
              {
                "@type": "HowToSupply", 
                "name": "Website design and development"
              },
              {
                "@type": "HowToSupply",
                "name": "Initial capital €5,300-50,200 depending on complexity"
              },
              {
                "@type": "HowToSupply",
                "name": "Payment processing and security setup"
              }
            ],
            "tool": [
              {
                "@type": "HowToTool",
                "name": "Companies Registration Office (CRO) portal"
              },
              {
                "@type": "HowToTool",
                "name": "Data Protection Commission registration"
              },
              {
                "@type": "HowToTool",
                "name": "EU One Stop Shop (OSS) for VAT"
              },
              {
                "@type": "HowToTool",
                "name": "PayVat EU VAT compliance platform"
              }
            ],
            "step": [
              {
                "@type": "HowToStep",
                "name": "Legal Foundation Setup",
                "text": "Register limited company, obtain data protection registration for GDPR compliance, and register for VAT including EU One Stop Shop if needed.",
                "url": "https://payvat.ie/start-online-business-ireland#online-checklist"
              },
              {
                "@type": "HowToStep", 
                "name": "Digital Infrastructure",
                "text": "Build compliant website with payment processing, setup EU VAT calculation system, and implement data protection measures.",
                "url": "https://payvat.ie/start-online-business-ireland#online-checklist"
              },
              {
                "@type": "HowToStep",
                "name": "Operational Setup", 
                "text": "Open business bank account, secure appropriate insurance coverage, and setup automated accounting with e-commerce integration.",
                "url": "https://payvat.ie/start-online-business-ireland#online-checklist"
              },
              {
                "@type": "HowToStep",
                "name": "Marketing and Launch",
                "text": "Implement SEO strategy, setup digital marketing channels, configure analytics tracking, and optimize for conversions.",
                "url": "https://payvat.ie/start-online-business-ireland#online-checklist"
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
                "name": "How much does it cost to start an online business in Ireland?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Online business startup costs range from €5,300 for a basic store to €50,200 for an enterprise setup. This includes company registration, website development, payment processing, marketing, and legal compliance. Monthly operating costs start from €750."
                }
              },
              {
                "@type": "Question",
                "name": "Do I need to register for VAT for EU online sales?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, for digital services to EU consumers you need OSS registration from the first €1. For goods, distance selling thresholds apply (€10,000 per EU country). Register early for compliance and to reclaim setup VAT."
                }
              },
              {
                "@type": "Question",
                "name": "What are the GDPR requirements for online businesses in Ireland?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Register with Data Protection Commission (€35/year), implement compliant privacy policy, cookie consent, data security measures, and appoint DPO if processing large amounts of personal data. GDPR fines can reach €20M."
                }
              },
              {
                "@type": "Question",
                "name": "How long does it take to launch an online business in Ireland?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Launching an online business typically takes 8 weeks: legal foundation (2 weeks), digital infrastructure (4 weeks), operational setup (6 weeks), marketing and launch (8 weeks). Many phases can run concurrently."
                }
              },
              {
                "@type": "Question",
                "name": "What's the difference between B2B and B2C VAT for online sales?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "B2B sales use reverse charge (0% VAT with valid EU VAT number, customer pays in their country). B2C sales use customer's country VAT rate for digital services, or distance selling rules for goods. PayVat automates both."
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