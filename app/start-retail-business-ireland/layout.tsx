import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Start a Retail Business in Ireland (2025) | PayVat',
  description: 'Complete guide to opening a retail store in Ireland. Shop licensing, VAT rates, inventory management, costs €26k-116k. Save on setup VAT.',
  keywords: 'start retail business ireland, open shop ireland, retail business license ireland, shop vat ireland, retail startup costs ireland',
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
    canonical: '/start-retail-business-ireland',
  },
  openGraph: {
    title: 'Start a Retail Business in Ireland (2025) | PayVat',
    description: 'Complete guide to opening a retail store in Ireland. Shop licensing, VAT rates, inventory management, costs €26k-116k. Save on setup VAT.',
    url: '/start-retail-business-ireland',
    siteName: 'PayVat',
    locale: 'en_IE',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Start a Retail Business in Ireland (2025) | PayVat',
    description: 'Complete guide to opening a retail store in Ireland. Shop licensing, VAT rates, inventory management, costs €26k-116k. Save on setup VAT.',
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

export default function StartRetailBusinessIrelandLayout({
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
            "name": "How to Start a Retail Business in Ireland",
            "description": "Complete guide to opening a retail store in Ireland including licensing, premises setup, VAT compliance, inventory management, and cost planning.",
            "image": "https://payvat.ie/images/start-retail-ireland.jpg",
            "totalTime": "P84D",
            "estimatedCost": {
              "@type": "MonetaryAmount",
              "currency": "EUR",
              "value": "26500"
            },
            "supply": [
              {
                "@type": "HowToSupply",
                "name": "Business plan and financial projections"
              },
              {
                "@type": "HowToSupply", 
                "name": "Retail premises lease agreement"
              },
              {
                "@type": "HowToSupply",
                "name": "Initial capital €26,500-116,000 depending on shop size"
              },
              {
                "@type": "HowToSupply",
                "name": "Supplier agreements for stock purchase"
              }
            ],
            "tool": [
              {
                "@type": "HowToTool",
                "name": "Companies Registration Office (CRO) portal"
              },
              {
                "@type": "HowToTool",
                "name": "Local authority licensing system"
              },
              {
                "@type": "HowToTool",
                "name": "Revenue Online Service (ROS)"
              },
              {
                "@type": "HowToTool",
                "name": "PayVat retail compliance platform"
              }
            ],
            "step": [
              {
                "@type": "HowToStep",
                "name": "Business Foundation Setup",
                "text": "Register limited company, open business bank account with merchant services, and register for VAT to reclaim setup costs on fittings and stock.",
                "url": "https://payvat.ie/start-retail-business-ireland#retail-checklist"
              },
              {
                "@type": "HowToStep", 
                "name": "Premises and Licensing",
                "text": "Secure shop premises license, verify planning permission for retail use, and apply for signage permissions with local authority.",
                "url": "https://payvat.ie/start-retail-business-ireland#retail-checklist"
              },
              {
                "@type": "HowToStep",
                "name": "Operational Setup", 
                "text": "Install POS system with inventory management, secure comprehensive insurance coverage, and register employees with Revenue.",
                "url": "https://payvat.ie/start-retail-business-ireland#retail-checklist"
              },
              {
                "@type": "HowToStep",
                "name": "Stock and Launch",
                "text": "Establish supplier relationships, purchase initial stock with proper VAT tracking, and implement marketing and customer loyalty programs.",
                "url": "https://payvat.ie/start-retail-business-ireland#retail-checklist"
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
                "name": "How much does it cost to start a retail business in Ireland?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Retail startup costs range from €26,500 for a small shop (50m²) to €116,000 for a large store (200m²). This includes setup costs, shop fittings, POS systems, initial stock, and insurance. Plus 3-6 months working capital."
                }
              },
              {
                "@type": "Question",
                "name": "What licenses do I need to open a retail shop in Ireland?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "You need: shop premises license from local authority, retail planning permission (or change of use), signage display permissions, and VAT registration. Some products require additional licenses (food, medicines, etc.)."
                }
              },
              {
                "@type": "Question",
                "name": "What VAT rates apply to retail goods in Ireland?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Most retail goods are 23% VAT (clothing, electronics). Zero-rated items include food, books, children's clothing/footwear, medical equipment. Fuel and energy are 13.5%. Register early to reclaim VAT on setup costs."
                }
              },
              {
                "@type": "Question",
                "name": "How long does it take to open a retail store in Ireland?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Opening a retail store typically takes 12 weeks: business setup (4 weeks), premises licensing (4-8 weeks), operational setup (6-10 weeks), and stock/launch preparation (6-12 weeks). Some stages can run concurrently."
                }
              },
              {
                "@type": "Question",
                "name": "Should I register for VAT when starting a retail business?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, register early even below the €85,000 threshold. This allows you to reclaim VAT on shop fittings (€5,000-15,000 typical), access wholesale prices, and establish business credibility with suppliers."
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