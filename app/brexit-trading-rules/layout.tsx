import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Brexit Trading Rules Ireland-UK (2025) - Complete Guide | PayVat',
  description: 'Complete Brexit trading guide for Ireland-UK trade. VAT rules, customs procedures, Northern Ireland Protocol, documentation requirements, compliance checklist.',
  keywords: 'brexit trading rules ireland uk, northern ireland protocol, ireland uk vat, brexit customs procedures, post brexit trade',
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
    canonical: '/brexit-trading-rules',
  },
  openGraph: {
    title: 'Brexit Trading Rules Ireland-UK (2025) - Complete Guide | PayVat',
    description: 'Complete Brexit trading guide for Ireland-UK trade. VAT rules, customs procedures, Northern Ireland Protocol, documentation requirements, compliance checklist.',
    url: '/brexit-trading-rules',
    siteName: 'PayVat',
    locale: 'en_IE',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Brexit Trading Rules Ireland-UK (2025) - Complete Guide | PayVat',
    description: 'Complete Brexit trading guide for Ireland-UK trade. VAT rules, customs procedures, Northern Ireland Protocol, documentation requirements, compliance checklist.',
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

export default function BrexitTradingRulesLayout({
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
            "headline": "Complete Brexit Trading Rules Guide for Ireland-UK Trade 2025",
            "description": "Comprehensive guide to post-Brexit trading between Ireland and UK including VAT changes, customs procedures, Northern Ireland Protocol benefits, and compliance requirements.",
            "image": "https://payvat.ie/images/brexit-trading-rules.jpg",
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
              "@id": "https://payvat.ie/brexit-trading-rules"
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
                "name": "How has Brexit affected VAT on Ireland-UK trade?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Post-Brexit, UK is treated as a third country. Exports to UK are zero-rated, while imports from UK are subject to 23% import VAT. Full customs procedures now apply with documentation requirements."
                }
              },
              {
                "@type": "Question",
                "name": "What special rules apply to Northern Ireland?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Northern Ireland remains aligned with EU single market for goods under the Protocol. EU VAT rules apply, trade with Ireland continues as before Brexit, and XI VAT numbers are valid for EU transactions."
                }
              },
              {
                "@type": "Question",
                "name": "What documents are needed for Ireland-UK trade?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Required documents include customs declarations, commercial invoices, packing lists, transport documents, rules of origin certificates for preferential tariffs, and various licenses for controlled goods."
                }
              },
              {
                "@type": "Question",
                "name": "Do I need an EORI number for UK trade?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, an EORI (Economic Operators Registration and Identification) number is required for all customs declarations when importing from or exporting to the UK. It's free to obtain from Irish Revenue."
                }
              },
              {
                "@type": "Question",
                "name": "Can I still get preferential tariffs under Brexit?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, the Trade and Cooperation Agreement provides for tariff-free trade if goods meet rules of origin requirements. You need proper documentation and may need REX registration for origin declarations."
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