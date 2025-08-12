import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Complete Business Setup Guide Ireland (2025) | PayVat',
  description: 'The definitive step-by-step guide to starting your business in Ireland. From choosing your structure to VAT registration—everything in one place. Join 15,000+ entrepreneurs.',
  keywords: 'start business ireland, irish business setup, company registration ireland, sole trader ireland, vat registration ireland, business setup guide',
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
    canonical: '/complete-business-setup-guide-ireland',
  },
  openGraph: {
    title: 'Complete Business Setup Guide Ireland (2025) | PayVat',
    description: 'The definitive step-by-step guide to starting your business in Ireland. From choosing your structure to VAT registration—everything in one place.',
    url: '/complete-business-setup-guide-ireland',
    siteName: 'PayVat',
    locale: 'en_IE',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Complete Business Setup Guide Ireland (2025) | PayVat',
    description: 'The definitive step-by-step guide to starting your business in Ireland. From choosing your structure to VAT registration—everything in one place.',
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

export default function CompleteBusinessSetupGuideIrelandLayout({
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
            "name": "How to Set Up a Business in Ireland",
            "description": "Complete step-by-step guide to starting a business in Ireland, including structure selection, registration, tax setup, and VAT compliance.",
            "image": "https://payvat.ie/images/business-setup-guide.jpg",
            "totalTime": "P90D",
            "supply": [
              {
                "@type": "HowToSupply",
                "name": "Business plan"
              },
              {
                "@type": "HowToSupply", 
                "name": "Identification documents"
              },
              {
                "@type": "HowToSupply",
                "name": "Proof of address"
              }
            ],
            "tool": [
              {
                "@type": "HowToTool",
                "name": "PayVat platform"
              },
              {
                "@type": "HowToTool",
                "name": "Revenue Online Service (ROS)"
              }
            ],
            "step": [
              {
                "@type": "HowToStep",
                "name": "Choose Business Structure",
                "text": "Decide between sole trader and limited company based on liability, credibility, and growth plans.",
                "url": "https://payvat.ie/complete-business-setup-guide-ireland#step-1"
              },
              {
                "@type": "HowToStep", 
                "name": "Register Your Business",
                "text": "Complete business name registration and incorporation with the Companies Registration Office.",
                "url": "https://payvat.ie/complete-business-setup-guide-ireland#step-2"
              },
              {
                "@type": "HowToStep",
                "name": "Tax Registration", 
                "text": "Obtain Tax Reference Number, register for VAT if required, and set up ROS access.",
                "url": "https://payvat.ie/complete-business-setup-guide-ireland#step-3"
              },
              {
                "@type": "HowToStep",
                "name": "Banking & Finance",
                "text": "Open a business bank account and establish financial systems for proper accounting.",
                "url": "https://payvat.ie/complete-business-setup-guide-ireland#step-4"
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
      {children}
    </>
  )
}