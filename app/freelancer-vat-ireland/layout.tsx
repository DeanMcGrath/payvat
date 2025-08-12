import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Freelancer VAT Rules Ireland (2025) | PayVat',
  description: 'Complete VAT guide for Irish freelancers. €42,500 threshold, registration, invoicing, expenses, cross-border rules. Automated compliance.',
  keywords: 'freelancer vat ireland, irish freelancer tax, vat registration freelancer, freelance vat threshold ireland, contractor vat rules',
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
    canonical: '/freelancer-vat-ireland',
  },
  openGraph: {
    title: 'Freelancer VAT Rules Ireland (2025) | PayVat',
    description: 'Complete VAT guide for Irish freelancers. €42,500 threshold, registration, invoicing, expenses, cross-border rules. Automated compliance.',
    url: '/freelancer-vat-ireland',
    siteName: 'PayVat',
    locale: 'en_IE',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Freelancer VAT Rules Ireland (2025) | PayVat',
    description: 'Complete VAT guide for Irish freelancers. €42,500 threshold, registration, invoicing, expenses, cross-border rules. Automated compliance.',
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

export default function FreelancerVatIrelandLayout({
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
            "headline": "Complete VAT Guide for Irish Freelancers 2025",
            "description": "Comprehensive guide to VAT rules for freelancers in Ireland including registration thresholds, invoicing requirements, allowable expenses, and cross-border compliance.",
            "image": "https://payvat.ie/images/freelancer-vat-ireland.jpg",
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
              "@id": "https://payvat.ie/freelancer-vat-ireland"
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
                "name": "What is the VAT threshold for freelancers in Ireland?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Irish freelancers providing services must register for VAT when their annual turnover exceeds €42,500. This is lower than the €85,000 threshold for goods. Registration is required within 30 days of exceeding the threshold."
                }
              },
              {
                "@type": "Question",
                "name": "Should I register for VAT early as a freelancer?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, early VAT registration can benefit freelancers by allowing you to reclaim VAT on business expenses (equipment, software, training), improve professional credibility, and access wholesale supplier rates."
                }
              },
              {
                "@type": "Question",
                "name": "How do I charge VAT to EU business clients?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "For EU business clients with valid VAT numbers, apply reverse charge - invoice at 0% VAT and state 'Reverse charge applies'. The client pays VAT in their country. You must submit monthly EC Sales Lists."
                }
              },
              {
                "@type": "Question",
                "name": "What expenses can freelancers claim VAT on?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "VAT-registered freelancers can reclaim VAT on: office equipment, software, professional development, business travel, marketing, insurance, and proportional home office expenses (utilities, rent business portion)."
                }
              },
              {
                "@type": "Question",
                "name": "How often do freelancers file VAT returns in Ireland?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Most freelancers file bi-monthly VAT returns. Payment is due by the 19th of the month following the VAT period, with an extension to the 23rd for ROS online filing. Late filing incurs €150 penalty plus daily charges."
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