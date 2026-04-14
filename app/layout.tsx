import { Metadata } from 'next'
import { SubscriptionProvider } from '@/contexts/subscription-context'
import { VATDataProvider } from '@/contexts/vat-data-context'
import { ErrorBoundary } from '@/components/error-boundary'
import { Toaster } from '@/components/ui/sonner'
import LiveChat from '@/components/live-chat'
import WebVitals from '@/components/web-vitals'
import JsonLdSchema from '@/components/json-ld-schema'
import '@/lib/env-validation' // Validate environment on startup
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'PayVAT Ireland - Guided VAT Preparation and Filing Workflow for Irish Businesses',
    template: '%s | PayVAT.ie'
  },
  description: 'Prepare, review, record, export, and track Irish VAT returns in one workflow. PayVAT does not file directly with Revenue ROS in this beta.',
  keywords: [
    'VAT submission Ireland',
    'Irish VAT returns',
    'VAT calculation software Ireland',
    'guided VAT workflow Ireland',
    'VAT registration Ireland',
    'Irish VAT compliance',
    'automated VAT processing',
    'VAT software Ireland',
    'VAT export record',
    'Irish business VAT',
    'VAT3 returns Ireland',
    'VAT payment Ireland'
  ],
  authors: [{ name: 'PayVAT Ireland' }],
  creator: 'PayVAT Ireland',
  publisher: 'PayVAT Ireland',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IE',
    url: 'https://payvat.ie',
    siteName: 'PayVAT Ireland',
    title: 'PayVAT Ireland - Guided VAT Preparation Workflow',
    description: 'Prepare, review, record, export, and track Irish VAT returns. This beta does not file directly with Revenue ROS.',
    images: [
      {
        url: 'https://payvat.ie/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'PayVAT Ireland - VAT Submission Software',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PayVAT Ireland - Guided VAT Workflow',
    description: 'Prepare, review, record, export, and track Irish VAT returns in PayVAT.',
    images: ['https://payvat.ie/twitter-image.jpg'],
    creator: '@payvat_ie',
  },
  verification: {
    google: 'google-site-verification-code', // Replace with actual verification code
  },
  alternates: {
    canonical: 'https://payvat.ie',
  },
  other: {
    'msapplication-TileColor': '#2563eb',
    'theme-color': '#2563eb',
  },
}

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
