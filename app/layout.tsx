import { SubscriptionProvider } from '@/contexts/subscription-context'
import { ErrorBoundary } from '@/components/error-boundary'
import '@/lib/env-validation' // Validate environment on startup
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <SubscriptionProvider>
            {children}
          </SubscriptionProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };
