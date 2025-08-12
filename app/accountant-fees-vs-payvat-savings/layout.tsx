import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Accountant Fees vs PayVat: Save €4,200+ Annually | PayVat',
  description: 'Compare real accountant costs vs PayVat savings. See exactly how much Irish businesses save on VAT compliance. 92% savings with complete control and transparency.',
  keywords: 'accountant fees ireland, vat compliance costs, payvat savings, accountant vs software, irish vat costs, save money vat filing',
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
    canonical: '/accountant-fees-vs-payvat-savings',
  },
  openGraph: {
    title: 'Accountant Fees vs PayVat: Save €4,200+ Annually | PayVat',
    description: 'Compare real accountant costs vs PayVat savings. See exactly how much Irish businesses save on VAT compliance. 92% savings with complete control and transparency.',
    url: '/accountant-fees-vs-payvat-savings',
    siteName: 'PayVat',
    locale: 'en_IE',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Accountant Fees vs PayVat: Save €4,200+ Annually | PayVat',
    description: 'Compare real accountant costs vs PayVat savings. See exactly how much Irish businesses save on VAT compliance. 92% savings with complete control and transparency.',
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

export default function AccountantFeesVsPayVatSavingsLayout({
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
            "headline": "Accountant Fees vs PayVat Savings: Complete Cost Comparison for Irish Businesses",
            "description": "Detailed cost comparison between traditional accountant fees and PayVat software for Irish VAT compliance, showing potential savings of €4,200+ annually.",
            "image": "https://payvat.ie/images/accountant-fees-comparison.jpg",
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
              "@id": "https://payvat.ie/accountant-fees-vs-payvat-savings"
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
                "name": "How much do accountants charge for VAT services in Ireland?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Traditional accountants in Ireland charge an average of €4,560 annually for VAT compliance services, including €300 per return for preparation and filing, plus additional fees for advice, corrections, and annual summaries."
                }
              },
              {
                "@type": "Question",
                "name": "How much can I save by using PayVat instead of an accountant?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Most Irish businesses save €4,200+ annually by switching from traditional accountants to PayVat, representing 92% cost savings while gaining speed, control, and transparency in their VAT compliance."
                }
              },
              {
                "@type": "Question",
                "name": "What are the hidden costs of using traditional accountants?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Hidden costs include time delays waiting for availability, lack of real-time insights, penalty risks from manual processes, document chasing overhead, loss of control over timing, and knowledge dependency creating business inflexibility."
                }
              },
              {
                "@type": "Question",
                "name": "Is PayVat really as accurate as a professional accountant?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "PayVat provides automated error checking, real-time compliance monitoring, and always up-to-date Revenue requirements. We offer penalty protection guarantee and have zero penalty records for customers using our automated features correctly."
                }
              },
              {
                "@type": "Question",
                "name": "What is the ROI of switching to PayVat from an accountant?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The first-year ROI is 1,167% with €4,200 savings. Over 5 years, businesses save €21,000 which many reinvest in marketing (43%), hiring staff (31%), or upgrading equipment (26%)."
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
            "@type": "ComparisonTable",
            "name": "Accountant Fees vs PayVat Cost Comparison",
            "description": "Annual cost comparison between traditional Irish accountants and PayVat software for VAT compliance services",
            "offers": [
              {
                "@type": "Offer",
                "name": "Traditional Accountant Services",
                "price": "4560",
                "priceCurrency": "EUR",
                "description": "Annual VAT compliance services including preparation, filing, advice, and support"
              },
              {
                "@type": "Offer", 
                "name": "PayVat Software Platform",
                "price": "360",
                "priceCurrency": "EUR",
                "description": "Annual subscription for automated VAT compliance with unlimited calculations, filing, and support"
              }
            ]
          })
        }}
      />
      {children}
    </>
  )
}