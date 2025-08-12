import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How to Register for VAT in Ireland (2025) | PayVat',
  description: 'Complete guide to VAT registration in Ireland. Learn thresholds, deadlines, process, and avoid penalties. Updated for 2025 with €42,500/€85,000 limits.',
  keywords: 'how to register for vat ireland, vat registration ireland, irish vat registration, vat thresholds ireland, register vat revenue ireland',
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
    canonical: '/how-to-register-for-vat-ireland',
  },
  openGraph: {
    title: 'How to Register for VAT in Ireland (2025) | PayVat',
    description: 'Complete guide to VAT registration in Ireland. Learn thresholds, deadlines, process, and avoid penalties. Updated for 2025 with €42,500/€85,000 limits.',
    url: '/how-to-register-for-vat-ireland',
    siteName: 'PayVat',
    locale: 'en_IE',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How to Register for VAT in Ireland (2025) | PayVat',
    description: 'Complete guide to VAT registration in Ireland. Learn thresholds, deadlines, process, and avoid penalties. Updated for 2025 with €42,500/€85,000 limits.',
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

export default function HowToRegisterForVATIrelandLayout({
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
            "@type": "HowTo",
            "name": "How to Register for VAT in Ireland",
            "description": "Complete step-by-step guide to registering for VAT in Ireland, including thresholds, required documents, application process, and compliance setup.",
            "image": "https://payvat.ie/images/vat-registration-ireland.jpg",
            "totalTime": "P30D",
            "estimatedCost": {
              "@type": "MonetaryAmount",
              "currency": "EUR",
              "value": "0"
            },
            "supply": [
              {
                "@type": "HowToSupply",
                "name": "Tax Reference Number (TRN)"
              },
              {
                "@type": "HowToSupply", 
                "name": "Evidence of business activity"
              },
              {
                "@type": "HowToSupply",
                "name": "Business bank account details"
              },
              {
                "@type": "HowToSupply",
                "name": "Identification documents"
              }
            ],
            "tool": [
              {
                "@type": "HowToTool",
                "name": "Revenue Online Service (ROS)"
              },
              {
                "@type": "HowToTool",
                "name": "PayVat compliance platform"
              }
            ],
            "step": [
              {
                "@type": "HowToStep",
                "name": "Check VAT Registration Thresholds",
                "text": "Determine if you must register based on turnover thresholds: €42,500 for services or €85,000 for goods in any rolling 12-month period.",
                "url": "https://payvat.ie/how-to-register-for-vat-ireland#thresholds"
              },
              {
                "@type": "HowToStep", 
                "name": "Obtain Tax Reference Number",
                "text": "Apply for TRN through Revenue's MyAccount or submit Form TR1 (individuals) or TR2 (companies). Required before VAT registration.",
                "url": "https://payvat.ie/how-to-register-for-vat-ireland#trn"
              },
              {
                "@type": "HowToStep",
                "name": "Complete VAT Application", 
                "text": "Submit VAT registration application through ROS with business details, evidence of trade, and required documentation.",
                "url": "https://payvat.ie/how-to-register-for-vat-ireland#application"
              },
              {
                "@type": "HowToStep",
                "name": "Set Up Compliance Systems",
                "text": "Once approved, update invoicing with VAT number, set up deadline reminders, and implement compliance tracking.",
                "url": "https://payvat.ie/how-to-register-for-vat-ireland#compliance"
              }
            ],
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
            "dateModified": "2025-08-12"
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
                "name": "What are the VAT registration thresholds in Ireland for 2025?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The VAT registration thresholds in Ireland for 2025 are €42,500 for services and €85,000 for goods in any rolling 12-month period. You must register within 30 days of exceeding these thresholds."
                }
              },
              {
                "@type": "Question",
                "name": "When do I need to register for VAT in Ireland?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "You must register for VAT within 30 days if your turnover has exceeded the thresholds or you expect to exceed them in the next 30 days. You can also register voluntarily to reclaim input VAT or for business credibility."
                }
              },
              {
                "@type": "Question",
                "name": "What documents do I need for VAT registration in Ireland?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "You need a Tax Reference Number (TRN), evidence of business activity (invoices, contracts), business bank account details, identification documents, proof of business premises, and for companies, your CRO certificate of incorporation."
                }
              },
              {
                "@type": "Question",
                "name": "How long does VAT registration take in Ireland?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "VAT registration typically takes 15-30 days from submission of a complete application. Revenue may request additional information which can extend the process. Online applications through ROS are processed faster."
                }
              },
              {
                "@type": "Question",
                "name": "What happens if I register for VAT late in Ireland?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Late VAT registration results in penalties of 5% of tax due (minimum €125, maximum €12,695), back-dated VAT liability from when you should have registered, and 8% annual interest on all amounts owed."
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