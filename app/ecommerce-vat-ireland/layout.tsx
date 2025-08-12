import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'E-commerce VAT Ireland (2025) - Complete Guide | PayVat',
  description: 'E-commerce VAT compliance guide for Ireland. €10,000 EU threshold, OSS registration, marketplace rules, Brexit implications. Automated compliance.',
  keywords: 'ecommerce vat ireland, distance selling ireland, oss registration ecommerce, marketplace vat rules, brexit ecommerce vat',
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
    canonical: '/ecommerce-vat-ireland',
  },
  openGraph: {
    title: 'E-commerce VAT Ireland (2025) - Complete Guide | PayVat',
    description: 'E-commerce VAT compliance guide for Ireland. €10,000 EU threshold, OSS registration, marketplace rules, Brexit implications. Automated compliance.',
    url: '/ecommerce-vat-ireland',
    siteName: 'PayVat',
    locale: 'en_IE',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'E-commerce VAT Ireland (2025) - Complete Guide | PayVat',
    description: 'E-commerce VAT compliance guide for Ireland. €10,000 EU threshold, OSS registration, marketplace rules, Brexit implications. Automated compliance.',
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

export default function EcommerceVatIrelandLayout({
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
            "headline": "Complete E-commerce VAT Guide for Ireland 2025",
            "description": "Comprehensive guide to VAT compliance for Irish e-commerce businesses including distance selling thresholds, OSS registration, marketplace facilitation, and Brexit rules.",
            "image": "https://payvat.ie/images/ecommerce-vat-ireland.jpg",
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
              "@id": "https://payvat.ie/ecommerce-vat-ireland"
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
                "name": "What is the EU distance selling threshold for Irish e-commerce?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The EU distance selling threshold is €10,000 in total EU B2C sales annually. Below this, charge Irish 23% VAT. Above this, you must register for OSS and charge each customer's country VAT rate."
                }
              },
              {
                "@type": "Question",
                "name": "How do marketplace VAT rules work for Irish sellers?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Large marketplaces like Amazon and eBay collect VAT on B2C sales for you. They handle OSS compliance and issue VAT invoices. You still need Irish VAT registration and must track sales for your own returns."
                }
              },
              {
                "@type": "Question",
                "name": "What are the UK e-commerce VAT rules post-Brexit?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "For goods under £135, register for UK VAT and charge 20% at checkout. Over £135, zero-rate the sale and customer pays import VAT. Northern Ireland follows EU rules under the NI Protocol."
                }
              },
              {
                "@type": "Question",
                "name": "Do I need OSS registration for my Irish e-commerce business?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "OSS registration is required when your B2C sales to other EU countries exceed €10,000 annually. It simplifies compliance by allowing quarterly returns through Irish Revenue instead of registering in each EU country."
                }
              },
              {
                "@type": "Question",
                "name": "What VAT rate do I charge EU e-commerce customers?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Below €10,000 EU sales: charge Irish 23% VAT. Above €10,000: charge the customer's country VAT rate (17-27%). PayVat automatically applies correct rates based on customer location."
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