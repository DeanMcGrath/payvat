import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Avoid Revenue Penalties Ireland: Complete Guide | PayVat',
  description: 'Protect your business from costly Revenue penalties. Learn penalty rates, common triggers, and prevention systems. Join 15,000+ penalty-free businesses.',
  keywords: 'revenue penalties ireland, vat penalties ireland, late filing penalties, revenue compliance ireland, irish tax penalties, avoid penalties',
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
    canonical: '/avoid-revenue-penalties-ireland',
  },
  openGraph: {
    title: 'Avoid Revenue Penalties Ireland: Complete Guide | PayVat',
    description: 'Protect your business from costly Revenue penalties. Learn penalty rates, common triggers, and prevention systems. Join 15,000+ penalty-free businesses.',
    url: '/avoid-revenue-penalties-ireland',
    siteName: 'PayVat',
    locale: 'en_IE',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Avoid Revenue Penalties Ireland: Complete Guide | PayVat',
    description: 'Protect your business from costly Revenue penalties. Learn penalty rates, common triggers, and prevention systems. Join 15,000+ penalty-free businesses.',
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

export default function AvoidRevenuePenaltiesIrelandLayout({
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
            "headline": "How to Avoid Revenue Penalties in Ireland: Complete Business Guide",
            "description": "Comprehensive guide to avoiding Irish Revenue penalties including VAT, company returns, and compliance deadlines. Learn penalty costs, common triggers, and prevention systems.",
            "image": "https://payvat.ie/images/avoid-revenue-penalties.jpg",
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
              "@id": "https://payvat.ie/avoid-revenue-penalties-ireland"
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
                "name": "What are the most common Revenue penalties in Ireland?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The most common penalties are: Late VAT registration (€125-€12,695), late VAT return filing (€150 + €10/day), late company annual returns (€100 + €3/day), and incorrect VAT rates on invoices. Missing VAT registration when turnover exceeds thresholds is the most expensive mistake."
                }
              },
              {
                "@type": "Question",
                "name": "How much do late VAT filing penalties cost?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Late VAT filing incurs €150 initial penalty, then €10 per day after 20 days late. If over 6 months late, the penalty is €1,500 plus 8% annual interest on any tax due. Even nil returns must be filed on time to avoid penalties."
                }
              },
              {
                "@type": "Question",
                "name": "What triggers a VAT registration penalty?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Failing to register for VAT within 30 days of exceeding thresholds (€42,500 for services, €85,000 for goods) triggers penalties of 5% of tax due (minimum €125, maximum €12,695) plus back-dated VAT liability and interest."
                }
              },
              {
                "@type": "Question",
                "name": "How can I avoid Revenue penalties?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Set up automated deadline alerts, monitor turnover monthly, use correct VAT rates, maintain proper records, file returns early, and separate business/personal expenses. PayVat users have zero penalty records due to automated compliance features."
                }
              },
              {
                "@type": "Question",
                "name": "What is the penalty for late company annual returns?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Late annual returns (Form B1) incur €100 fixed penalty plus €3 per day from the second month. After 12 months, the penalty reaches €1,200 and Revenue begins strike-off proceedings against the company."
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
            "@type": "Service",
            "name": "Revenue Penalty Protection Service",
            "description": "Automated compliance system to prevent Irish Revenue penalties through deadline management, accurate filing, and real-time monitoring.",
            "provider": {
              "@type": "Organization",
              "name": "PayVat",
              "url": "https://payvat.ie"
            },
            "areaServed": {
              "@type": "Country",
              "name": "Ireland"
            },
            "offers": {
              "@type": "Offer",
              "price": "30",
              "priceCurrency": "EUR",
              "description": "Monthly penalty protection with automated filing and compliance monitoring"
            }
          })
        }}
      />
      {children}
    </>
  )
}