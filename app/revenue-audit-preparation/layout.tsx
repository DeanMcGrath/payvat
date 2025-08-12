import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Revenue Audit Preparation Ireland (2025) - Complete Guide | PayVat',
  description: 'Complete guide to Irish Revenue audit preparation. Documentation requirements, audit process, rights & obligations, settlement options, professional representation.',
  keywords: 'revenue audit ireland, irish tax audit, revenue audit preparation, tax audit documentation, revenue audit rights',
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
    canonical: '/revenue-audit-preparation',
  },
  openGraph: {
    title: 'Revenue Audit Preparation Ireland (2025) - Complete Guide | PayVat',
    description: 'Complete guide to Irish Revenue audit preparation. Documentation requirements, audit process, rights & obligations, settlement options, professional representation.',
    url: '/revenue-audit-preparation',
    siteName: 'PayVat',
    locale: 'en_IE',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Revenue Audit Preparation Ireland (2025) - Complete Guide | PayVat',
    description: 'Complete guide to Irish Revenue audit preparation. Documentation requirements, audit process, rights & obligations, settlement options, professional representation.',
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

export default function RevenueAuditPreparationLayout({
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
            "headline": "Complete Revenue Audit Preparation Guide for Ireland 2025",
            "description": "Comprehensive guide to preparing for Irish Revenue audits including documentation requirements, audit types, taxpayer rights and obligations, and settlement strategies.",
            "image": "https://payvat.ie/images/revenue-audit-preparation.jpg",
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
              "@id": "https://payvat.ie/revenue-audit-preparation"
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
                "name": "What triggers a Revenue audit in Ireland?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Revenue audits can be triggered by various factors including inconsistencies in returns, industry benchmarking, random selection, third-party information, large refund claims, or significant changes in business patterns."
                }
              },
              {
                "@type": "Question",
                "name": "What documents do I need for a Revenue audit?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Essential documents include accounting records, bank statements, VAT returns and invoices, PAYE records, purchase and sales invoices, contracts, asset registers, and all supporting documentation for the audit period (typically 4 years)."
                }
              },
              {
                "@type": "Question",
                "name": "Do I have the right to professional representation during an audit?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, you have the right to professional representation by a qualified tax advisor or accountant during all Revenue audit proceedings. It's highly recommended to have professional representation throughout the process."
                }
              },
              {
                "@type": "Question",
                "name": "What are the different types of Revenue audits?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Revenue conducts three main types of audits: Comprehensive audits (all taxes, multiple years), Aspect audits (specific tax areas like VAT or PAYE), and Desktop audits (correspondence-based with no site visit)."
                }
              },
              {
                "@type": "Question",
                "name": "Can I appeal Revenue audit findings?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, you have the right to appeal Revenue audit findings through the formal appeals process. Appeals must be made within specified timeframes and should be supported by professional advice and documentation."
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