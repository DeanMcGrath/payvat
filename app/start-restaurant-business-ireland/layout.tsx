import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Start a Restaurant Business in Ireland (2025) | PayVat',
  description: 'Complete guide to opening a restaurant in Ireland. Licenses, VAT compliance, food safety, costs, and setup checklist. Save €15,000+ in setup costs.',
  keywords: 'start restaurant ireland, open restaurant ireland, restaurant business license ireland, food business registration ireland, restaurant vat ireland',
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
    canonical: '/start-restaurant-business-ireland',
  },
  openGraph: {
    title: 'Start a Restaurant Business in Ireland (2025) | PayVat',
    description: 'Complete guide to opening a restaurant in Ireland. Licenses, VAT compliance, food safety, costs, and setup checklist. Save €15,000+ in setup costs.',
    url: '/start-restaurant-business-ireland',
    siteName: 'PayVat',
    locale: 'en_IE',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Start a Restaurant Business in Ireland (2025) | PayVat',
    description: 'Complete guide to opening a restaurant in Ireland. Licenses, VAT compliance, food safety, costs, and setup checklist. Save €15,000+ in setup costs.',
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

export default function StartRestaurantBusinessIrelandLayout({
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
            "name": "How to Start a Restaurant Business in Ireland",
            "description": "Complete guide to opening a restaurant in Ireland including licensing, VAT registration, food safety compliance, permits, and startup costs.",
            "image": "https://payvat.ie/images/start-restaurant-ireland.jpg",
            "totalTime": "P120D",
            "estimatedCost": {
              "@type": "MonetaryAmount",
              "currency": "EUR",
              "value": "57000"
            },
            "supply": [
              {
                "@type": "HowToSupply",
                "name": "Business plan and financial projections"
              },
              {
                "@type": "HowToSupply", 
                "name": "Premises lease or purchase agreement"
              },
              {
                "@type": "HowToSupply",
                "name": "Initial capital investment €57,000-162,000"
              },
              {
                "@type": "HowToSupply",
                "name": "Food safety management system plan"
              }
            ],
            "tool": [
              {
                "@type": "HowToTool",
                "name": "Companies Registration Office (CRO) portal"
              },
              {
                "@type": "HowToTool",
                "name": "Food Safety Authority of Ireland (FSAI) registration"
              },
              {
                "@type": "HowToTool",
                "name": "Local authority planning portal"
              },
              {
                "@type": "HowToTool",
                "name": "PayVat restaurant compliance platform"
              }
            ],
            "step": [
              {
                "@type": "HowToStep",
                "name": "Business Foundation Setup",
                "text": "Register limited company, open business bank account, obtain Tax Reference Number, and register for VAT to reclaim setup costs.",
                "url": "https://payvat.ie/start-restaurant-business-ireland#restaurant-checklist"
              },
              {
                "@type": "HowToStep", 
                "name": "Food Business Registration",
                "text": "Register with FSAI, complete local authority food business registration, and obtain HACCP certification for food safety management.",
                "url": "https://payvat.ie/start-restaurant-business-ireland#restaurant-checklist"
              },
              {
                "@type": "HowToStep",
                "name": "Premises and Licensing", 
                "text": "Apply for planning permission change of use, obtain liquor license if serving alcohol, and secure fire safety certificates.",
                "url": "https://payvat.ie/start-restaurant-business-ireland#restaurant-checklist"
              },
              {
                "@type": "HowToStep",
                "name": "Operational Setup",
                "text": "Register employees, secure comprehensive insurance, install POS system with VAT compliance, and setup automated VAT filing.",
                "url": "https://payvat.ie/start-restaurant-business-ireland#restaurant-checklist"
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
                "name": "How much does it cost to start a restaurant in Ireland?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Starting a restaurant in Ireland typically costs €57,000-162,000 including legal setup (€6,000-14,000), kitchen equipment (€25,000-75,000), furniture (€15,000-40,000), and technology (€3,000-8,000). Plus 3-6 months working capital."
                }
              },
              {
                "@type": "Question",
                "name": "What licenses do I need to open a restaurant in Ireland?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "You need: FSAI food business registration, local authority food business registration, planning permission for restaurant use, fire safety certificate (>30 occupancy), and liquor license if serving alcohol (€4,000-8,000)."
                }
              },
              {
                "@type": "Question",
                "name": "What is the VAT rate for restaurants in Ireland?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Restaurant meals are charged 13.5% VAT for dine-in and hot takeaway. Cold takeaway food is 0% VAT. Alcohol is 23% VAT. Register early to reclaim €5,000-15,000 in setup VAT on equipment and renovations."
                }
              },
              {
                "@type": "Question",
                "name": "How long does it take to open a restaurant in Ireland?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Opening a restaurant typically takes 16-24 weeks: business setup (4 weeks), food business registration (4-6 weeks), planning permission (8-12 weeks), and operational setup (8-16 weeks). Plan for longer if applying for liquor license."
                }
              },
              {
                "@type": "Question",
                "name": "Do I need HACCP certification to open a restaurant in Ireland?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, the restaurant owner or designated manager must have certified HACCP (Hazard Analysis Critical Control Points) training. You also need a written food safety management system based on HACCP principles."
                }
              }
            ]
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Restaurant Startup Costs Ireland 2025",
            "description": "Breakdown of costs to start a restaurant business in Ireland",
            "numberOfItems": 8,
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Legal and Administrative Setup",
                "description": "Company registration, food business registration, planning permission, liquor license, insurance",
                "url": "https://payvat.ie/start-restaurant-business-ireland#restaurant-costs"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Kitchen Equipment",
                "description": "Commercial cooking equipment, refrigeration, food prep equipment",
                "url": "https://payvat.ie/start-restaurant-business-ireland#restaurant-costs"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": "Furniture and Fittings",
                "description": "Dining furniture, décor, lighting, flooring",
                "url": "https://payvat.ie/start-restaurant-business-ireland#restaurant-costs"
              },
              {
                "@type": "ListItem",
                "position": 4,
                "name": "POS System and Technology",
                "description": "Point of sale system, payment processing, VAT compliance software",
                "url": "https://payvat.ie/start-restaurant-business-ireland#restaurant-costs"
              }
            ]
          })
        }}
      />
      {children}
    </>
  )
}