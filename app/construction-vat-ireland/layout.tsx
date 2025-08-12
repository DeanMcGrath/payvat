import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Construction VAT Rules Ireland (2025) | PayVat',
  description: 'Complete construction VAT guide. RCT system, 13.5% vs 23% rates, subcontractor rules, two-third rule, automated compliance for Irish builders.',
  keywords: 'construction vat ireland, rct system ireland, building vat rates, subcontractor tax ireland, construction tax compliance',
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
    canonical: '/construction-vat-ireland',
  },
  openGraph: {
    title: 'Construction VAT Rules Ireland (2025) | PayVat',
    description: 'Complete construction VAT guide. RCT system, 13.5% vs 23% rates, subcontractor rules, two-third rule, automated compliance for Irish builders.',
    url: '/construction-vat-ireland',
    siteName: 'PayVat',
    locale: 'en_IE',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Construction VAT Rules Ireland (2025) | PayVat',
    description: 'Complete construction VAT guide. RCT system, 13.5% vs 23% rates, subcontractor rules, two-third rule, automated compliance for Irish builders.',
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

export default function ConstructionVatIrelandLayout({
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
            "headline": "Complete Construction VAT and RCT Guide for Ireland 2025",
            "description": "Comprehensive guide to VAT compliance for Irish construction businesses including RCT system, VAT rates, subcontractor rules, and automation solutions.",
            "image": "https://payvat.ie/images/construction-vat-ireland.jpg",
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
              "@id": "https://payvat.ie/construction-vat-ireland"
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
                "name": "What VAT rate applies to construction services in Ireland?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Most construction services in Ireland are charged at 13.5% VAT including house building, general construction, repairs and maintenance. Materials are charged at 23% VAT. Mixed supplies follow the two-third rule."
                }
              },
              {
                "@type": "Question",
                "name": "What is the RCT system in Irish construction?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "RCT (Relevant Contracts Tax) is Ireland's construction industry tax system. Principal contractors deduct 0% (C2 holders), 20% (standard), or 35% (non-compliant) from subcontractor payments and submit monthly returns by the 14th."
                }
              },
              {
                "@type": "Question",
                "name": "How does the two-third rule work for construction VAT?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "If services exceed 2/3 of total value, apply 13.5% VAT to entire supply. If materials exceed 2/3, apply 23% to entire supply. If neither exceeds 2/3, split the supply and apply appropriate rates to each component."
                }
              },
              {
                "@type": "Question",
                "name": "Should construction businesses register for VAT early?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, construction businesses benefit significantly from early VAT registration. Typical annual VAT recovery ranges from €8,000-€100,000+ on equipment, vehicles, and materials. Essential for commercial contracts and trade supplier access."
                }
              },
              {
                "@type": "Question",
                "name": "What are the penalties for late RCT returns?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Late RCT returns incur €1,520 penalty plus 10% surcharge on unpaid deductions. Monthly returns are due by the 14th of the following month, even for nil returns when no subcontractor payments were made."
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