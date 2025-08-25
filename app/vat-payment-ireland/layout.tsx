import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'VAT Payment Ireland 2025 - Complete Guide to Revenue VAT Payments | PayVAT.ie',
  description: 'Everything you need to know about paying VAT to Irish Revenue in 2025. Deadlines, methods, ROS online payments, and compliance requirements for Irish businesses.',
  keywords: [
    'VAT payment Ireland',
    'Revenue Ireland VAT payment',
    'Irish VAT payment deadlines',
    'ROS VAT payment',
    'VAT payment methods Ireland',
    'Revenue online service',
    'VAT compliance Ireland',
    'Irish VAT calendar 2025',
    'VAT deadline Ireland',
    'Revenue VAT submission'
  ],
  openGraph: {
    title: 'VAT Payment Ireland 2025 - Revenue Payment Guide',
    description: 'Complete guide to paying VAT to Irish Revenue. Deadlines, methods, and compliance requirements for 2025.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://payvat.ie'}/vat-payment-ireland`,
    siteName: 'PayVAT.ie',
    locale: 'en_IE',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VAT Payment Ireland 2025 Guide',
    description: 'Everything about paying VAT to Irish Revenue - deadlines, methods, compliance.',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://payvat.ie'}/vat-payment-ireland`,
  },
}

export default function VATPaymentIrelandLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}