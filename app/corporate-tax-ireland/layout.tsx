import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Corporation Tax Ireland (2025) - 12.5% Rate & Filing Guide | PayVat',
  description: 'Complete Irish corporation tax guide. 12.5% trading rate, 25% passive income, filing deadlines, tax reliefs, R&D credits, and compliance requirements.',
  keywords: 'corporation tax ireland, irish corporation tax rate, ct1 filing deadlines, corporate tax ireland, irish company tax',
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
    canonical: '/corporate-tax-ireland',
  },
  openGraph: {
    title: 'Corporation Tax Ireland (2025) - 12.5% Rate & Filing Guide | PayVat',
    description: 'Complete Irish corporation tax guide. 12.5% trading rate, 25% passive income, filing deadlines, tax reliefs, R&D credits, and compliance requirements.',
    url: '/corporate-tax-ireland',
    siteName: 'PayVat',
    locale: 'en_IE',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Corporation Tax Ireland (2025) - 12.5% Rate & Filing Guide | PayVat',
    description: 'Complete Irish corporation tax guide. 12.5% trading rate, 25% passive income, filing deadlines, tax reliefs, R&D credits, and compliance requirements.',
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

export default function CorporateTaxIrelandLayout({
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
            "headline": "Complete Corporation Tax Guide for Ireland 2025",
            "description": "Comprehensive guide to Irish corporation tax including rates, filing deadlines, tax reliefs, compliance requirements, and planning strategies for Irish companies.",
            "image": "https://payvat.ie/images/corporate-tax-ireland.jpg",
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
              "@id": "https://payvat.ie/corporate-tax-ireland"
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
                "name": "What is the corporation tax rate in Ireland?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Ireland's corporation tax rates are 12.5% on trading income, 25% on passive income (investment/rental), and 33% on capital gains. The 12.5% rate is one of the most competitive in Europe."
                }
              },
              {
                "@type": "Question",
                "name": "When are corporation tax returns due in Ireland?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Corporation tax returns (Form CT1) are due 9 months after the accounting period end. Small companies (turnover ≤€3m) pay tax 9 months after year end, while large companies pay 6 months after year end."
                }
              },
              {
                "@type": "Question",
                "name": "What qualifies for the 12.5% corporation tax rate?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The 12.5% rate applies to active trading income including manufacturing, service provision, and commercial activities. Passive income like investments, royalties, and rental income is taxed at 25%."
                }
              },
              {
                "@type": "Question",
                "name": "Are there tax reliefs available for Irish companies?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, available reliefs include R&D tax credits (25% of qualifying expenditure), capital allowances on equipment, loss relief, group relief, and various sector-specific incentives."
                }
              },
              {
                "@type": "Question",
                "name": "What happens if I file my corporation tax return late?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Late filing incurs penalties and interest charges. The penalty is typically 5% of the tax due or €12,695 (whichever is lower) plus interest at 0.0274% per day on unpaid tax."
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