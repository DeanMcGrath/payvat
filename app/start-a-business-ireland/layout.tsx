import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Start a Business in Ireland (2025): Complete Guide | PayVat',
  description: 'Complete 2025 guide to starting a business in Ireland. Structures, registration, taxes, VAT, insurance, and first 90 days. Launch your business right.',
  keywords: 'start business ireland, how to start business ireland, irish business startup, business registration ireland, startup guide ireland',
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
    canonical: '/start-a-business-ireland',
  },
  openGraph: {
    title: 'Start a Business in Ireland (2025): Complete Guide | PayVat',
    description: 'Complete 2025 guide to starting a business in Ireland. Structures, registration, taxes, VAT, insurance, and first 90 days. Launch your business right.',
    url: '/start-a-business-ireland',
    siteName: 'PayVat',
    locale: 'en_IE',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Start a Business in Ireland (2025): Complete Guide | PayVat',
    description: 'Complete 2025 guide to starting a business in Ireland. Structures, registration, taxes, VAT, insurance, and first 90 days. Launch your business right.',
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

export default function StartABusinessIrelandLayout({
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
            "name": "How to Start a Business in Ireland",
            "description": "Complete guide to starting a business in Ireland including structure selection, registration, tax setup, VAT compliance, and first 90 days success plan.",
            "image": "https://payvat.ie/images/start-business-ireland.jpg",
            "totalTime": "P60D",
            "estimatedCost": {
              "@type": "MonetaryAmount",
              "currency": "EUR",
              "value": "500"
            },
            "supply": [
              {
                "@type": "HowToSupply",
                "name": "Business plan and projections"
              },
              {
                "@type": "HowToSupply", 
                "name": "Identification and address documents"
              },
              {
                "@type": "HowToSupply",
                "name": "Initial capital for setup costs"
              }
            ],
            "tool": [
              {
                "@type": "HowToTool",
                "name": "Companies Registration Office (CRO) portal"
              },
              {
                "@type": "HowToTool",
                "name": "Revenue Online Service (ROS)"
              },
              {
                "@type": "HowToTool",
                "name": "PayVat business setup platform"
              }
            ],
            "step": [
              {
                "@type": "HowToStep",
                "name": "Choose Business Structure",
                "text": "Decide between sole trader and limited company based on liability, growth plans, and tax considerations.",
                "url": "https://payvat.ie/start-a-business-ireland#structure"
              },
              {
                "@type": "HowToStep", 
                "name": "Register Business",
                "text": "Complete business registration with CRO for companies or start trading immediately as sole trader.",
                "url": "https://payvat.ie/start-a-business-ireland#registration"
              },
              {
                "@type": "HowToStep",
                "name": "Tax and VAT Setup", 
                "text": "Obtain Tax Reference Number, register for VAT if required, and set up Revenue Online Service access.",
                "url": "https://payvat.ie/start-a-business-ireland#taxes"
              },
              {
                "@type": "HowToStep",
                "name": "Banking and Insurance",
                "text": "Open business bank account, obtain essential insurance coverage, and set up financial systems.",
                "url": "https://payvat.ie/start-a-business-ireland#banking"
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
                "name": "What is the best business structure for starting a business in Ireland?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "It depends on your circumstances. Sole trader is best for low-risk service providers wanting quick setup (€0-50 cost). Limited company is better for growth businesses, higher-risk activities, or those planning to raise investment (€125-200 setup cost)."
                }
              },
              {
                "@type": "Question",
                "name": "How long does it take to start a business in Ireland?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Sole traders can start immediately. Limited companies take 7-10 days for CRO registration. Complete setup including tax registration, banking, and VAT typically takes 4-8 weeks depending on complexity."
                }
              },
              {
                "@type": "Question",
                "name": "What are the costs of starting a business in Ireland?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Sole trader: €0-50 for basic setup. Limited company: €125 CRO fee plus €25 name reservation. Additional costs include business bank account (€0-200), insurance (€200-1000), and professional services if needed."
                }
              },
              {
                "@type": "Question",
                "name": "Do I need to register for VAT when starting a business in Ireland?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "VAT registration is required when turnover exceeds €42,500 for services or €85,000 for goods in any 12-month period. Many businesses register voluntarily early to reclaim startup VAT and appear more professional."
                }
              },
              {
                "@type": "Question",
                "name": "What licenses and permits do I need to start a business in Ireland?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Requirements vary by industry. Common needs include: business registration (companies), tax registration, VAT registration, professional body membership, local authority licenses (food, retail), and industry-specific permits. Check with relevant authorities for your sector."
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