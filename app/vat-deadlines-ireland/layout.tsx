import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'VAT Deadlines Ireland 2025: Complete Calendar | PayVat',
  description: 'Complete guide to Irish VAT deadlines, filing periods, and penalties. 2025 calendar with 19th vs 23rd rules. Never miss a deadline with PayVat.',
  keywords: 'vat deadlines ireland, irish vat filing dates, vat return deadlines, ros filing deadlines, vat penalties ireland, vat calendar 2025',
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
    canonical: '/vat-deadlines-ireland',
  },
  openGraph: {
    title: 'VAT Deadlines Ireland 2025: Complete Calendar | PayVat',
    description: 'Complete guide to Irish VAT deadlines, filing periods, and penalties. 2025 calendar with 19th vs 23rd rules. Never miss a deadline with PayVat.',
    url: '/vat-deadlines-ireland',
    siteName: 'PayVat',
    locale: 'en_IE',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VAT Deadlines Ireland 2025: Complete Calendar | PayVat',
    description: 'Complete guide to Irish VAT deadlines, filing periods, and penalties. 2025 calendar with 19th vs 23rd rules. Never miss a deadline with PayVat.',
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

export default function VATDeadlinesIrelandLayout({
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
            "headline": "VAT Deadlines Ireland 2025: Complete Filing Calendar and Penalty Guide",
            "description": "Comprehensive guide to Irish VAT deadlines including bi-monthly periods, ROS extensions, penalty calculations, and compliance best practices for 2025.",
            "image": "https://payvat.ie/images/vat-deadlines-ireland.jpg",
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
              "@id": "https://payvat.ie/vat-deadlines-ireland"
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
                "name": "When are VAT returns due in Ireland?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "VAT returns are due by the 19th of the month following the end of the VAT period. ROS (Revenue Online Service) users get an extension until the 23rd for filing returns, but payments are still due by the 19th."
                }
              },
              {
                "@type": "Question",
                "name": "What is the difference between 19th and 23rd VAT deadlines?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The 19th is the standard deadline for both filing and payment. ROS users get until the 23rd to file their returns, but payment must still be made by the 19th. This gives 4 extra days to prepare and submit the return documentation."
                }
              },
              {
                "@type": "Question",
                "name": "How often do I need to file VAT returns in Ireland?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Most Irish SMEs file bi-monthly (every two months). Revenue assigns filing frequency based on turnover: monthly for high-turnover businesses, bi-monthly for most SMEs, four-monthly for smaller businesses, and half-yearly in special cases."
                }
              },
              {
                "@type": "Question",
                "name": "What are the penalties for late VAT filing in Ireland?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Late VAT filing penalties are: €150 initial penalty, €10 per day after 20 days late, maximum €1,500 if over 6 months late, plus 8% annual interest on any tax due. Penalties apply even for nil returns."
                }
              },
              {
                "@type": "Question",
                "name": "What are the 2025 VAT deadlines for bi-monthly filers?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "2025 bi-monthly VAT deadlines: Jan-Feb due 19/23 Mar, Mar-Apr due 19/23 May, May-Jun due 19/23 Jul, Jul-Aug due 19/23 Sep, Sep-Oct due 19/23 Nov, Nov-Dec due 19/23 Jan 2026."
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
            "@type": "Table",
            "name": "Irish VAT Deadlines Calendar 2025",
            "description": "Complete bi-monthly VAT filing and payment deadlines for Ireland in 2025",
            "about": {
              "@type": "Thing",
              "name": "Irish VAT Compliance Deadlines"
            }
          })
        }}
      />
      {children}
    </>
  )
}