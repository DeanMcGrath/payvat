import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'VAT Calculator Ireland (2025) - Free Tool | PayVat',
  description: 'Free Irish VAT calculator. Add or extract VAT at 23%, 13.5%, 9%, 0% rates. Calculate VAT for invoices, expenses. Includes rate guide.',
  keywords: 'vat calculator ireland, irish vat calculator, vat rates ireland, calculate vat ireland, vat calculation tool',
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
    canonical: '/vat-calculator-ireland',
  },
  openGraph: {
    title: 'VAT Calculator Ireland (2025) - Free Tool | PayVat',
    description: 'Free Irish VAT calculator. Add or extract VAT at 23%, 13.5%, 9%, 0% rates. Calculate VAT for invoices, expenses. Includes rate guide.',
    url: '/vat-calculator-ireland',
    siteName: 'PayVat',
    locale: 'en_IE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VAT Calculator Ireland (2025) - Free Tool | PayVat',
    description: 'Free Irish VAT calculator. Add or extract VAT at 23%, 13.5%, 9%, 0% rates. Calculate VAT for invoices, expenses. Includes rate guide.',
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

export default function VatCalculatorIrelandLayout({
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
            "@type": "WebApplication",
            "name": "Irish VAT Calculator",
            "description": "Free online VAT calculator for Ireland. Add or extract VAT at Irish rates: 23%, 13.5%, 9%, 0%, and 4.8%. Instant calculations for businesses and freelancers.",
            "url": "https://payvat.ie/vat-calculator-ireland",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "EUR"
            },
            "publisher": {
              "@type": "Organization",
              "name": "PayVat",
              "url": "https://payvat.ie",
              "logo": {
                "@type": "ImageObject",
                "url": "https://payvat.ie/logo.png"
              }
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
                "name": "What are the current VAT rates in Ireland?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Ireland has 5 VAT rates: 23% (standard rate for most goods/services), 13.5% (reduced rate for construction, restaurants, fuel), 9% (second reduced rate for newspapers, hotels, hairdressing), 0% (zero rate for food, books, children's clothes), and 4.8% (livestock rate)."
                }
              },
              {
                "@type": "Question",
                "name": "How do I calculate VAT in Ireland?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "To add VAT: multiply net amount by VAT rate (e.g., €100 × 1.23 = €123 total). To extract VAT: divide gross amount by (1 + VAT rate), then subtract from gross (e.g., €123 ÷ 1.23 = €100 net, VAT = €23)."
                }
              },
              {
                "@type": "Question",
                "name": "When do I need to register for VAT in Ireland?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Register for VAT when annual turnover exceeds €42,500 for services or €85,000 for goods. You must register within 30 days of exceeding these thresholds. Many businesses register voluntarily earlier to reclaim input VAT."
                }
              },
              {
                "@type": "Question",
                "name": "What VAT rate applies to construction services?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Construction services in Ireland are charged at 13.5% VAT, including house building, repairs, and maintenance. Construction materials are charged at 23% VAT. Mixed supplies follow the two-third rule for rate determination."
                }
              },
              {
                "@type": "Question",
                "name": "Is this VAT calculator free to use?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, this Irish VAT calculator is completely free to use. It supports all Irish VAT rates and can both add VAT to net amounts and extract VAT from gross amounts. Perfect for businesses, freelancers, and accountants."
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