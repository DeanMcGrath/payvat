import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Business Expense Tracker Ireland (2025) - Deductions & Mileage | PayVat',
  description: 'Complete Irish business expense tracking guide. Deductibility rules, VAT recovery, mileage rates (€0.3756/€0.2113), subsistence allowances, record keeping.',
  keywords: 'business expense tracker ireland, irish mileage rates, expense deductions ireland, vat on expenses, subsistence allowances ireland',
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
    canonical: '/expense-tracker-ireland',
  },
  openGraph: {
    title: 'Business Expense Tracker Ireland (2025) - Deductions & Mileage | PayVat',
    description: 'Complete Irish business expense tracking guide. Deductibility rules, VAT recovery, mileage rates (€0.3756/€0.2113), subsistence allowances, record keeping.',
    url: '/expense-tracker-ireland',
    siteName: 'PayVat',
    locale: 'en_IE',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Business Expense Tracker Ireland (2025) - Deductions & Mileage | PayVat',
    description: 'Complete Irish business expense tracking guide. Deductibility rules, VAT recovery, mileage rates (€0.3756/€0.2113), subsistence allowances, record keeping.',
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

export default function ExpenseTrackerIrelandLayout({
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
            "headline": "Complete Business Expense Tracking Guide for Ireland 2025",
            "description": "Comprehensive guide to tracking business expenses in Ireland including deductibility rules, VAT recovery, current mileage rates, subsistence allowances, and record keeping requirements.",
            "image": "https://payvat.ie/images/expense-tracker-ireland.jpg",
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
              "@id": "https://payvat.ie/expense-tracker-ireland"
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
                "name": "What are the current mileage rates in Ireland for 2025?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Irish mileage rates for 2025 are €0.3756 per km for the first 6,437km annually, and €0.2113 per km for additional kilometers. Motorcycle rate is €0.2439 per km for all business travel."
                }
              },
              {
                "@type": "Question",
                "name": "What business expenses are fully tax deductible in Ireland?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Fully deductible expenses include office rent, equipment, professional services, training, marketing, and business travel. The expense must be incurred wholly and exclusively for business purposes."
                }
              },
              {
                "@type": "Question",
                "name": "Can I recover VAT on business expenses in Ireland?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, if you're VAT registered, you can recover VAT on most business expenses with valid VAT invoices. Entertainment VAT is generally not recoverable, and some expenses have restrictions."
                }
              },
              {
                "@type": "Question",
                "name": "What are the subsistence allowances in Ireland?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Irish subsistence allowances for 2025 are €34.84 per day for domestic travel over 5 hours, €121.59 for overnight domestic stays, with country-specific rates for foreign travel."
                }
              },
              {
                "@type": "Question",
                "name": "How long must I keep business expense records in Ireland?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "You must keep all business expense records for 6 years from the end of the relevant tax year. Records can be digital but must be clearly legible and accessible for Revenue inspections."
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