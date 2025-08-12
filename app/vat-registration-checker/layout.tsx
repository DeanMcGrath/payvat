import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'VAT Registration Checker Ireland (2025) - Free Tool | PayVat',
  description: 'Free VAT registration checker for Ireland. Check if you need VAT registration based on turnover thresholds. Instant analysis for services (€42,500) and goods (€85,000).',
  keywords: 'vat registration checker ireland, vat threshold ireland, do i need vat registration, vat registration requirement ireland, irish vat checker',
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
    canonical: '/vat-registration-checker',
  },
  openGraph: {
    title: 'VAT Registration Checker Ireland (2025) - Free Tool | PayVat',
    description: 'Free VAT registration checker for Ireland. Check if you need VAT registration based on turnover thresholds. Instant analysis for services (€42,500) and goods (€85,000).',
    url: '/vat-registration-checker',
    siteName: 'PayVat',
    locale: 'en_IE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VAT Registration Checker Ireland (2025) - Free Tool | PayVat',
    description: 'Free VAT registration checker for Ireland. Check if you need VAT registration based on turnover thresholds. Instant analysis for services (€42,500) and goods (€85,000).',
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

export default function VatRegistrationCheckerLayout({
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
            "name": "Irish VAT Registration Checker",
            "description": "Free online tool to check VAT registration requirements in Ireland. Analyzes business type and turnover against Irish VAT thresholds with instant recommendations.",
            "url": "https://payvat.ie/vat-registration-checker",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "EUR"
            },
            "featureList": [
              "VAT threshold checking",
              "Business type analysis", 
              "Turnover assessment",
              "Registration recommendations",
              "Timeline guidance"
            ],
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
                "name": "What are the VAT registration thresholds in Ireland?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Irish VAT registration thresholds are €42,500 for services and €85,000 for goods. You must register within 30 days of exceeding these annual turnover limits."
                }
              },
              {
                "@type": "Question",
                "name": "Do I need VAT registration if I'm below the threshold?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "VAT registration is not required below thresholds, but voluntary registration can be beneficial for input VAT recovery, professional credibility, and B2B trading advantages."
                }
              },
              {
                "@type": "Question",
                "name": "How do I know if my business is services or goods for VAT?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Services include consulting, professional services, digital services, and intangible supplies. Goods include physical products, manufacturing, retail, and tangible items. Mixed businesses use the lower €42,500 threshold."
                }
              },
              {
                "@type": "Question",
                "name": "When must I register for VAT after exceeding the threshold?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "You must register for VAT within 30 days of exceeding the threshold. For projected turnover, register when you expect to exceed the threshold in the next 30 days."
                }
              },
              {
                "@type": "Question",
                "name": "What happens if I don't register for VAT when required?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Failure to register for VAT when required can result in penalties, interest on unpaid VAT, and Revenue investigations. Registration is mandatory once thresholds are exceeded."
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