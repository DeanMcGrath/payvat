import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Register Your Business in Dublin (2025) | PayVat',
  description: 'Complete guide to business registration in Dublin. City Council requirements, local supports, costs, districts guide. Access Ireland\'s business capital.',
  keywords: 'dublin business registration, register company dublin, dublin city council business, dublin business license, start business dublin ireland',
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
    canonical: '/dublin-business-registration',
  },
  openGraph: {
    title: 'Register Your Business in Dublin (2025) | PayVat',
    description: 'Complete guide to business registration in Dublin. City Council requirements, local supports, costs, districts guide. Access Ireland\'s business capital.',
    url: '/dublin-business-registration',
    siteName: 'PayVat',
    locale: 'en_IE',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Register Your Business in Dublin (2025) | PayVat',
    description: 'Complete guide to business registration in Dublin. City Council requirements, local supports, costs, districts guide. Access Ireland\'s business capital.',
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

export default function DublinBusinessRegistrationLayout({
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
            "name": "How to Register a Business in Dublin",
            "description": "Complete guide to registering a business in Dublin including CRO registration, Dublin City Council requirements, and local business support access.",
            "image": "https://payvat.ie/images/dublin-business-registration.jpg",
            "totalTime": "P28D",
            "estimatedCost": {
              "@type": "MonetaryAmount",
              "currency": "EUR",
              "value": "4000"
            },
            "supply": [
              {
                "@type": "HowToSupply",
                "name": "Business plan and incorporation documents"
              },
              {
                "@type": "HowToSupply", 
                "name": "Dublin premises lease or ownership proof"
              },
              {
                "@type": "HowToSupply",
                "name": "Higher setup budget for Dublin costs"
              },
              {
                "@type": "HowToSupply",
                "name": "Professional services contacts in Dublin"
              }
            ],
            "tool": [
              {
                "@type": "HowToTool",
                "name": "Companies Registration Office (CRO) - Parnell Square"
              },
              {
                "@type": "HowToTool",
                "name": "Dublin City Council - City Hall registration"
              },
              {
                "@type": "HowToTool",
                "name": "Revenue Dublin offices (IFSC, Tallaght)"
              },
              {
                "@type": "HowToTool",
                "name": "Local Enterprise Office Dublin City"
              }
            ],
            "step": [
              {
                "@type": "HowToStep",
                "name": "National Business Registration",
                "text": "Register limited company with CRO in Parnell Square, obtain Tax Reference Number at Revenue offices, and open business bank account with Dublin business banking centres.",
                "url": "https://payvat.ie/dublin-business-registration#dublin-checklist"
              },
              {
                "@type": "HowToStep", 
                "name": "Dublin City Council Requirements",
                "text": "Register for commercial rates at City Hall, verify planning permission at Wood Quay planning office, and apply for signage permissions if needed.",
                "url": "https://payvat.ie/dublin-business-registration#dublin-checklist"
              },
              {
                "@type": "HowToStep",
                "name": "Industry-Specific Licensing", 
                "text": "Obtain required licenses from relevant Dublin authorities: food business registration, liquor licenses, late night premises permits as applicable.",
                "url": "https://payvat.ie/dublin-business-registration#dublin-checklist"
              },
              {
                "@type": "HowToStep",
                "name": "Access Dublin Business Supports",
                "text": "Connect with Local Enterprise Office for grants and mentoring, join Dublin Chamber of Commerce, and access Enterprise Ireland supports.",
                "url": "https://payvat.ie/dublin-business-registration#dublin-checklist"
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
                "name": "How much does it cost to register a business in Dublin?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Dublin business registration costs €4,000-15,000+ including CRO registration (€125-200), Dublin City Council rates (€500-2,000), professional services (€2,000-8,000), and insurance (€1,200-4,000). Costs are 30-50% higher than other Irish locations."
                }
              },
              {
                "@type": "Question",
                "name": "What are the advantages of registering a business in Dublin?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Dublin offers EU headquarters access, 700+ multinational companies, IFSC financial hub, Silicon Docks tech cluster, extensive business support network, and highest revenue potential in Ireland (+50-100% vs national average)."
                }
              },
              {
                "@type": "Question",
                "name": "What Dublin City Council requirements apply to businesses?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Dublin businesses need: commercial rates registration at City Hall, planning permission verification at Wood Quay, signage permissions for advertising, and industry-specific licenses through Dublin City Council departments."
                }
              },
              {
                "@type": "Question",
                "name": "Which Dublin district is best for my business?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Dublin 1&2 for prestige and accessibility, Dublin 4/IFSC for financial services, Silicon Docks for tech companies, suburban business parks (D6W, D14, D18) for cost-effective operations. Choose based on industry and budget."
                }
              },
              {
                "@type": "Question",
                "name": "What business support is available in Dublin?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Dublin offers Local Enterprise Office grants (€3,000-20,000), Dublin Chamber networking, Enterprise Ireland headquarters access, HBAN angel investors, VC funding ecosystem, and comprehensive professional services."
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