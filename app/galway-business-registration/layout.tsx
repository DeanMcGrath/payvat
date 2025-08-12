import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Start Your Business in Galway (2025) - Complete Guide | PayVat',
  description: 'Complete guide to starting a business in Galway, Ireland. Company formation, VAT registration, local supports, NUI Galway partnerships, LEO grants.',
  keywords: 'start business galway ireland, galway company formation, leo galway grants, galway chamber commerce, business registration galway',
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
    canonical: '/galway-business-registration',
  },
  openGraph: {
    title: 'Start Your Business in Galway (2025) - Complete Guide | PayVat',
    description: 'Complete guide to starting a business in Galway, Ireland. Company formation, VAT registration, local supports, NUI Galway partnerships, LEO grants.',
    url: '/galway-business-registration',
    siteName: 'PayVat',
    locale: 'en_IE',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Start Your Business in Galway (2025) - Complete Guide | PayVat',
    description: 'Complete guide to starting a business in Galway, Ireland. Company formation, VAT registration, local supports, NUI Galway partnerships, LEO grants.',
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

export default function GalwayBusinessRegistrationLayout({
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
            "name": "How to Start a Business in Galway, Ireland",
            "description": "Complete step-by-step guide to starting and registering a business in Galway, including local supports, compliance requirements, and sector opportunities.",
            "image": "https://payvat.ie/images/galway-business-registration.jpg",
            "totalTime": "P14D",
            "estimatedCost": {
              "@type": "MonetaryAmount",
              "currency": "EUR",
              "value": "500"
            },
            "supply": [
              {
                "@type": "HowToSupply",
                "name": "Business plan"
              },
              {
                "@type": "HowToSupply",
                "name": "Company constitution"
              },
              {
                "@type": "HowToSupply",
                "name": "Director identification"
              }
            ],
            "step": [
              {
                "@type": "HowToStep",
                "name": "Choose Business Structure",
                "text": "Select the most appropriate business structure for your Galway venture: sole trader, partnership, limited company, or DAC.",
                "url": "https://payvat.ie/galway-business-registration#structure"
              },
              {
                "@type": "HowToStep",
                "name": "Register with CRO",
                "text": "File company registration documents with the Companies Registration Office including constitutional documents and director appointments.",
                "url": "https://payvat.ie/galway-business-registration#cro"
              },
              {
                "@type": "HowToStep",
                "name": "Revenue Registration",
                "text": "Register for tax obligations with Revenue including corporation tax, VAT if applicable, and PAYE for employees.",
                "url": "https://payvat.ie/galway-business-registration#revenue"
              },
              {
                "@type": "HowToStep",
                "name": "Galway Local Requirements",
                "text": "Complete Galway City/County Council registrations, obtain sector-specific licenses, and secure required insurances.",
                "url": "https://payvat.ie/galway-business-registration#local"
              },
              {
                "@type": "HowToStep",
                "name": "Access Galway Supports",
                "text": "Connect with Local Enterprise Office Galway, Galway Chamber of Commerce, and NUI Galway innovation programs.",
                "url": "https://payvat.ie/galway-business-registration#supports"
              }
            ],
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
                "name": "How long does it take to register a business in Galway?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Business registration in Galway typically takes 10-15 business days including CRO filing, Revenue registration, and local compliance. Professional agents can expedite the process to 5-7 days."
                }
              },
              {
                "@type": "Question",
                "name": "What business grants are available in Galway?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Local Enterprise Office Galway offers start-up grants up to €15,000, feasibility study grants up to €15,000, and business expansion grants up to €150,000. Additional supports include mentoring, training, and networking programs."
                }
              },
              {
                "@type": "Question",
                "name": "What are the main business sectors in Galway?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Galway's key sectors include technology (major multinationals, startups), life sciences (medical devices, biotech), tourism (Wild Atlantic Way hub), and creative industries (festivals, arts, culture). The city offers diverse opportunities across multiple industries."
                }
              },
              {
                "@type": "Question",
                "name": "What makes Galway attractive for new businesses?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Galway offers strategic Atlantic location, skilled university graduates, vibrant cultural scene, lower costs than Dublin, strong business supports, and access to EU markets. It's Ireland's cultural capital with excellent quality of life."
                }
              },
              {
                "@type": "Question",
                "name": "How do I connect with the Galway business community?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Join Galway Chamber of Commerce for networking, attend Local Enterprise Office events, connect with NUI Galway innovation programs, and participate in sector-specific associations. Galway has an active, supportive business community."
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