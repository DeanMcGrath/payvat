import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Company vs Sole Trader Ireland: Which to Choose? | PayVat',
  description: 'Compare limited companies vs sole traders in Ireland. Understand liability, taxes, credibility, and costs. Make the right choice for your business structure.',
  keywords: 'company vs sole trader ireland, limited company ireland, sole trader ireland, business structure ireland, liability protection ireland, tax comparison',
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
    canonical: '/company-vs-sole-trader-ireland',
  },
  openGraph: {
    title: 'Company vs Sole Trader Ireland: Which to Choose? | PayVat',
    description: 'Compare limited companies vs sole traders in Ireland. Understand liability, taxes, credibility, and costs. Make the right choice for your business structure.',
    url: '/company-vs-sole-trader-ireland',
    siteName: 'PayVat',
    locale: 'en_IE',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Company vs Sole Trader Ireland: Which to Choose? | PayVat',
    description: 'Compare limited companies vs sole traders in Ireland. Understand liability, taxes, credibility, and costs. Make the right choice for your business structure.',
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

export default function CompanyVsSoleTraderIrelandLayout({
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
            "headline": "Company vs Sole Trader Ireland: Complete Comparison Guide",
            "description": "Comprehensive comparison of limited companies versus sole traders in Ireland, covering liability, taxation, setup costs, credibility and VAT implications.",
            "image": "https://payvat.ie/images/company-vs-sole-trader.jpg",
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
              "@id": "https://payvat.ie/company-vs-sole-trader-ireland"
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
                "name": "What is the main difference between a company and sole trader in Ireland?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The main difference is liability protection. Limited companies provide personal asset protection while sole traders have unlimited personal liability for business debts. Companies also offer more credibility and tax planning options but require more administration."
                }
              },
              {
                "@type": "Question",
                "name": "Which is better for tax in Ireland - company or sole trader?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "For profits over €50,000, limited companies typically offer better tax efficiency through corporation tax at 12.5% and salary/dividend optimization. Sole traders pay income tax at 20-40% plus USC and PRSI on all profits."
                }
              },
              {
                "@type": "Question",
                "name": "Do VAT rules differ between companies and sole traders?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "No, VAT registration thresholds and obligations are identical for both structures. Both must register when turnover exceeds €42,500 for services or €85,000 for goods in any 12-month period."
                }
              },
              {
                "@type": "Question",
                "name": "Can I change from sole trader to limited company later?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, but it involves incorporating a new company, transferring assets, potential tax implications, and professional fees of €500-2,000. It's generally easier to choose the right structure from the start."
                }
              },
              {
                "@type": "Question",
                "name": "How much does it cost to set up each business structure?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Sole trader setup costs €0-50 and takes 24-48 hours. Limited company incorporation costs €125-200 and takes 7-10 days through the Companies Registration Office (CRO)."
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