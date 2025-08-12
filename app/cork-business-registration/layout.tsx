import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Start Your Business in Cork (2025) - Complete Guide | PayVat',
  description: 'Complete guide to starting a business in Cork, Ireland. Company formation, VAT registration, local supports, Cork Chamber, LEO grants and compliance.',
  keywords: 'start business cork ireland, cork company formation, leo cork grants, cork chamber commerce, business registration cork',
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
    canonical: '/cork-business-registration',
  },
  openGraph: {
    title: 'Start Your Business in Cork (2025) - Complete Guide | PayVat',
    description: 'Complete guide to starting a business in Cork, Ireland. Company formation, VAT registration, local supports, Cork Chamber, LEO grants and compliance.',
    url: '/cork-business-registration',
    siteName: 'PayVat',
    locale: 'en_IE',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Start Your Business in Cork (2025) - Complete Guide | PayVat',
    description: 'Complete guide to starting a business in Cork, Ireland. Company formation, VAT registration, local supports, Cork Chamber, LEO grants and compliance.',
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

export default function CorkBusinessRegistrationLayout({
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
            "name": "How to Start a Business in Cork, Ireland",
            "description": "Complete step-by-step guide to starting and registering a business in Cork, including local supports, compliance requirements, and growth opportunities.",
            "image": "https://payvat.ie/images/cork-business-registration.jpg",
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
                "name": "Articles of association"
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
                "text": "Select the most appropriate business structure for your Cork venture: sole trader, partnership, limited company, or DAC.",
                "url": "https://payvat.ie/cork-business-registration#structure"
              },
              {
                "@type": "HowToStep",
                "name": "Register with CRO",
                "text": "File company registration documents with the Companies Registration Office including Form A1 and constitutional documents.",
                "url": "https://payvat.ie/cork-business-registration#cro"
              },
              {
                "@type": "HowToStep",
                "name": "Revenue Registration",
                "text": "Register for tax obligations with Revenue including corporation tax, VAT if applicable, and PAYE for employees.",
                "url": "https://payvat.ie/cork-business-registration#revenue"
              },
              {
                "@type": "HowToStep",
                "name": "Cork Local Requirements",
                "text": "Complete Cork City/County Council registrations, obtain business licenses, and secure required insurances.",
                "url": "https://payvat.ie/cork-business-registration#local"
              },
              {
                "@type": "HowToStep",
                "name": "Access Cork Supports",
                "text": "Connect with Local Enterprise Office Cork, Cork Chamber of Commerce, and university research partnerships.",
                "url": "https://payvat.ie/cork-business-registration#supports"
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
                "name": "How long does it take to register a business in Cork?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Business registration in Cork typically takes 10-15 business days. This includes CRO filing, Revenue registration, and local compliance. Using an agent can expedite the process to 5-7 days."
                }
              },
              {
                "@type": "Question",
                "name": "What grants are available for new businesses in Cork?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Local Enterprise Office Cork offers start-up grants up to €15,000 for new businesses, feasibility study grants up to €15,000, and business expansion grants up to €150,000. Additional supports include mentoring and training programs."
                }
              },
              {
                "@type": "Question",
                "name": "Do I need special licenses to start a business in Cork?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "License requirements depend on your business type. Food businesses need FSAI registration, retail needs trading licenses, and some services require professional licenses. Cork City/County Council provides guidance on local requirements."
                }
              },
              {
                "@type": "Question",
                "name": "What are the main business sectors in Cork?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Cork's key sectors include pharmaceuticals (major global companies), technology (software, fintech), tourism and hospitality (Wild Atlantic Way), and creative industries (film, music, design). The city offers diverse opportunities across multiple industries."
                }
              },
              {
                "@type": "Question",
                "name": "How do I connect with other businesses in Cork?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Join Cork Chamber of Commerce for networking, attend Local Enterprise Office events, connect with UCC Innovation programs, and participate in sector-specific associations. Cork has an active business community with regular networking opportunities."
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