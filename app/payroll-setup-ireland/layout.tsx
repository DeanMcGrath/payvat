import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Payroll Setup Ireland (2025) - PAYE, PRSI, USC Guide | PayVat',
  description: 'Complete Irish payroll setup guide. PAYE rates, PRSI 11.05%, USC bands, P30 returns, compliance deadlines, minimum wage €12.70/hour.',
  keywords: 'payroll setup ireland, paye rates ireland, prsi rates ireland, usc rates ireland, irish payroll compliance, p30 returns',
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
    canonical: '/payroll-setup-ireland',
  },
  openGraph: {
    title: 'Payroll Setup Ireland (2025) - PAYE, PRSI, USC Guide | PayVat',
    description: 'Complete Irish payroll setup guide. PAYE rates, PRSI 11.05%, USC bands, P30 returns, compliance deadlines, minimum wage €12.70/hour.',
    url: '/payroll-setup-ireland',
    siteName: 'PayVat',
    locale: 'en_IE',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Payroll Setup Ireland (2025) - PAYE, PRSI, USC Guide | PayVat',
    description: 'Complete Irish payroll setup guide. PAYE rates, PRSI 11.05%, USC bands, P30 returns, compliance deadlines, minimum wage €12.70/hour.',
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

export default function PayrollSetupIrelandLayout({
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
            "name": "How to Set Up Payroll in Ireland",
            "description": "Complete step-by-step guide to setting up payroll in Ireland including PAYE registration, PRSI setup, USC configuration, and compliance requirements.",
            "image": "https://payvat.ie/images/payroll-setup-ireland.jpg",
            "totalTime": "P7D",
            "estimatedCost": {
              "@type": "MonetaryAmount",
              "currency": "EUR",
              "value": "200"
            },
            "supply": [
              {
                "@type": "HowToSupply",
                "name": "Company registration documents"
              },
              {
                "@type": "HowToSupply",
                "name": "Employee PPS numbers"
              },
              {
                "@type": "HowToSupply",
                "name": "Payroll software"
              }
            ],
            "step": [
              {
                "@type": "HowToStep",
                "name": "Register as Employer",
                "text": "Register with Revenue Commissioners for PAYE and PRSI using Form TR2 or through ROS online system.",
                "url": "https://payvat.ie/payroll-setup-ireland#registration"
              },
              {
                "@type": "HowToStep",
                "name": "Setup Payroll System",
                "text": "Choose Revenue-approved payroll software and configure current tax rates and thresholds.",
                "url": "https://payvat.ie/payroll-setup-ireland#system"
              },
              {
                "@type": "HowToStep",
                "name": "Configure Tax Settings",
                "text": "Setup PAYE, PRSI, and USC rates according to current Irish tax bands and thresholds.",
                "url": "https://payvat.ie/payroll-setup-ireland#rates"
              },
              {
                "@type": "HowToStep",
                "name": "Test Payroll Process",
                "text": "Run test payroll to verify calculations and ensure compliance with Irish requirements.",
                "url": "https://payvat.ie/payroll-setup-ireland#testing"
              },
              {
                "@type": "HowToStep",
                "name": "Setup Compliance Calendar",
                "text": "Establish procedures for monthly P30 returns, annual P35 returns, and employee certificates.",
                "url": "https://payvat.ie/payroll-setup-ireland#compliance"
              }
            ],
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
                "name": "What are the current PAYE rates in Ireland?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Irish PAYE rates for 2025 are 20% on income up to €42,000 (single) or €84,000 (married), and 40% on income above these thresholds. Standard tax credits are €1,875 personal and €1,875 PAYE credit."
                }
              },
              {
                "@type": "Question",
                "name": "What is the employer PRSI rate in Ireland?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Employer PRSI rate is 11.05% on employee income over €352 per week, with a reduced rate of 8.8% on income between €352-€424 per week. There is no upper limit on PRSI contributions."
                }
              },
              {
                "@type": "Question",
                "name": "When are P30 payroll returns due?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "P30 returns and payments are due by the 14th of the month following the pay period. For example, January payroll P30 is due by 14th February. Late filing incurs penalties and interest."
                }
              },
              {
                "@type": "Question",
                "name": "What is the minimum wage in Ireland for 2025?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The minimum wage in Ireland for 2025 is €12.70 per hour for experienced adult workers, with sub-minimum rates applying to employees under 18 and those in first two years of employment in certain circumstances."
                }
              },
              {
                "@type": "Question",
                "name": "Do I need Revenue-approved payroll software?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "While not mandatory, Revenue-approved payroll software ensures compliance with Irish requirements including RPN support, correct tax calculations, and proper P30 return formatting. Manual payroll is complex and error-prone."
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