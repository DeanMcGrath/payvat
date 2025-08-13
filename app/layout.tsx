import { SubscriptionProvider } from '@/contexts/subscription-context'
import { VATDataProvider } from '@/contexts/vat-data-context'
import { ErrorBoundary } from '@/components/error-boundary'
import { Toaster } from '@/components/ui/sonner'
import LiveChat from '@/components/live-chat'
import WebVitals from '@/components/web-vitals'
import '@/lib/env-validation' // Validate environment on startup
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "PayVAT Ireland",
              "description": "Professional VAT services for Irish businesses including VAT returns, compliance, and advisory services.",
              "url": "https://payvat.ie",
              "logo": "https://payvat.ie/logo.png",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+353-1-XXX-XXXX",
                "contactType": "customer service",
                "areaServed": "IE",
                "availableLanguage": "en"
              },
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "IE",
                "addressLocality": "Dublin"
              },
              "sameAs": [
                "https://payvat.ie"
              ],
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "VAT Services",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "VAT Return Submission",
                      "description": "Professional VAT return preparation and submission to Irish Revenue",
                      "provider": {
                        "@type": "Organization",
                        "name": "PayVAT Ireland"
                      },
                      "areaServed": "IE",
                      "availableChannel": {
                        "@type": "ServiceChannel",
                        "serviceUrl": "https://payvat.ie"
                      }
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service", 
                      "name": "VAT Compliance Services",
                      "description": "Ongoing VAT compliance support for Irish businesses",
                      "provider": {
                        "@type": "Organization",
                        "name": "PayVAT Ireland"
                      },
                      "areaServed": "IE"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "VAT Registration",
                      "description": "VAT registration assistance for new Irish businesses",
                      "provider": {
                        "@type": "Organization",
                        "name": "PayVAT Ireland"
                      },
                      "areaServed": "IE"
                    }
                  }
                ]
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "reviewCount": "1247",
                "bestRating": "5",
                "worstRating": "1"
              },
              "knowsAbout": [
                "Irish VAT regulations",
                "VAT compliance",
                "Revenue.ie procedures",
                "Business taxation Ireland",
                "VAT returns Ireland"
              ]
            })
          }}
        />
      </head>
      <body>
        <ErrorBoundary>
          <SubscriptionProvider>
            <VATDataProvider>
              {children}
            </VATDataProvider>
          </SubscriptionProvider>
          <Toaster />
          <LiveChat />
          <WebVitals />
        </ErrorBoundary>
      </body>
    </html>
  )
}

export const metadata = {
  title: {
    default: 'PayVAT Ireland - Professional VAT Services & Tax Solutions',
    template: '%s | PayVAT Ireland'
  },
  description: 'Ireland\'s #1 VAT compliance platform. Trusted by 5,000+ businesses. Revenue-approved VAT returns, registration & compliance services. Start your free consultation today.',
  keywords: ['VAT services Ireland', 'Irish VAT compliance', 'VAT returns Dublin', 'Revenue.ie VAT', 'VAT submission Ireland', 'Irish VAT experts', 'VAT registration Ireland'],
  authors: [{ name: 'PayVAT Ireland' }],
  creator: 'PayVAT Ireland',
  publisher: 'PayVAT Ireland',
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
  openGraph: {
    type: 'website',
    locale: 'en_IE',
    url: 'https://payvat.ie',
    title: 'PayVAT Ireland - Professional VAT Services & Tax Solutions',
    description: 'Expert VAT services for Irish businesses. Professional VAT returns, compliance, and advisory services. Get your VAT sorted with PayVAT Ireland.',
    siteName: 'PayVAT Ireland',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PayVAT Ireland - Professional VAT Services & Tax Solutions',
    description: 'Expert VAT services for Irish businesses. Professional VAT returns, compliance, and advisory services.',
  },
  canonical: 'https://payvat.ie',
  alternates: {
    canonical: 'https://payvat.ie',
  },
  generator: 'Next.js',
};
