import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Business Structure Comparison Ireland (2025) - Interactive Tool | PayVat',
  description: 'Compare Irish business structures: sole trader vs partnership vs limited company vs DAC. Interactive tool with tax, liability, and setup comparisons.',
  keywords: 'irish business structures, sole trader vs limited company, business structure comparison ireland, dac vs limited company, partnership ireland',
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
    canonical: '/business-structure-comparison',
  },
  openGraph: {
    title: 'Business Structure Comparison Ireland (2025) - Interactive Tool | PayVat',
    description: 'Compare Irish business structures: sole trader vs partnership vs limited company vs DAC. Interactive tool with tax, liability, and setup comparisons.',
    url: '/business-structure-comparison',
    siteName: 'PayVat',
    locale: 'en_IE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Business Structure Comparison Ireland (2025) - Interactive Tool | PayVat',
    description: 'Compare Irish business structures: sole trader vs partnership vs limited company vs DAC. Interactive tool with tax, liability, and setup comparisons.',
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

export default function BusinessStructureComparisonLayout({
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
            "name": "Irish Business Structure Comparison Tool",
            "description": "Interactive tool to compare business structures in Ireland including sole trader, partnership, limited company, and DAC options with detailed analysis of tax, liability, and compliance requirements.",
            "url": "https://payvat.ie/business-structure-comparison",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "EUR"
            },
            "featureList": [
              "Interactive structure comparison",
              "Tax efficiency analysis",
              "Liability comparison",
              "Setup cost calculator",
              "Decision framework"
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
                "name": "What's the difference between sole trader and limited company in Ireland?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Sole traders have unlimited personal liability and pay 20-40% income tax, while limited companies offer limited liability protection and pay 12.5% corporation tax. Limited companies require more paperwork but provide better tax efficiency for higher earners."
                }
              },
              {
                "@type": "Question",
                "name": "When should I choose a limited company over sole trader?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Choose a limited company when annual profits exceed €50,000, you need liability protection, want to attract investment, or require professional credibility. The 12.5% corporation tax rate becomes more beneficial than income tax rates."
                }
              },
              {
                "@type": "Question",
                "name": "What is a DAC and when should I use it?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "A Designated Activity Company (DAC) is suitable for complex businesses with specific activities. It offers flexibility in company objects and is often preferred for investment vehicles, professional services, or businesses with multiple activities."
                }
              },
              {
                "@type": "Question",
                "name": "Can I change my business structure later?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, you can change business structures as your business grows. Common transitions include sole trader to limited company or partnership to limited company. Consider tax implications and seek professional advice for the transition."
                }
              },
              {
                "@type": "Question",
                "name": "What are the tax differences between business structures?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Sole traders and partnerships pay 20-40% income tax on profits. Limited companies and DACs pay 12.5% corporation tax on profits, with additional tax when distributing dividends. Corporation tax is generally more efficient for higher profit levels."
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