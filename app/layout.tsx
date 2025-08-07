import { SubscriptionProvider } from '@/contexts/subscription-context'
import { ErrorBoundary } from '@/components/error-boundary'
import { Toaster } from '@/components/ui/sonner'
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
            {children}
          </SubscriptionProvider>
          <Toaster />
        </ErrorBoundary>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };
