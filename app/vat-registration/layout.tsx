import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'VAT Registration Ireland 2025 - Register for VAT with Revenue Ireland | PayVAT.ie',
  description: 'Complete guide to VAT registration in Ireland. Learn VAT thresholds (€42,500/€85,000), registration requirements, and how to register with Revenue Ireland online.',
  keywords: [
    'VAT registration Ireland',
    'Register for VAT Ireland',
    'Irish VAT registration',
    'VAT registration threshold Ireland',
    'Revenue Ireland VAT registration',
    'VAT number Ireland',
    'Irish VAT thresholds 2025',
    'VAT registration requirements Ireland',
    'How to register for VAT Ireland',
    'Irish business VAT registration',
    'ROS VAT registration',
    'VAT registration process Ireland'
  ],
  openGraph: {
    title: 'VAT Registration Ireland 2025 - Complete Registration Guide',
    description: 'Everything you need to know about VAT registration in Ireland. Thresholds, requirements, and step-by-step registration process.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://payvat.ie'}/vat-registration`,
    siteName: 'PayVAT.ie',
    locale: 'en_IE',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VAT Registration Ireland Guide',
    description: 'Complete guide to VAT registration in Ireland. Thresholds, requirements, and registration process.',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://payvat.ie'}/vat-registration`,
  },
}

export default function VATRegistrationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}