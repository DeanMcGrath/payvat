import { SubscriptionProvider } from '@/contexts/subscription-context'
import { VATDataProvider } from '@/contexts/vat-data-context'
import { ErrorBoundary } from '@/components/error-boundary'
import { Toaster } from '@/components/ui/sonner'
import LiveChat from '@/components/live-chat'
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
        </ErrorBoundary>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };
