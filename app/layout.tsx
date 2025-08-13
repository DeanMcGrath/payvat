import { SubscriptionProvider } from '@/contexts/subscription-context'
import { VATDataProvider } from '@/contexts/vat-data-context'
import { ErrorBoundary } from '@/components/error-boundary'
import { Toaster } from '@/components/ui/sonner'
import LiveChat from '@/components/live-chat'
import WebVitals from '@/components/web-vitals'
import JsonLdSchema from '@/components/json-ld-schema'
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
          <JsonLdSchema />
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
