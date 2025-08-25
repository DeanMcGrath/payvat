import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'VAT Submission Ireland - Submit VAT3 Returns to Revenue Online | PayVAT.ie',
  description: 'Submit your Irish VAT returns directly to Revenue Ireland. AI-powered VAT3 form preparation with automated calculations. Fast, accurate VAT submission for Irish businesses.',
  keywords: [
    'VAT submission Ireland',
    'VAT3 return Ireland',
    'Submit VAT to Revenue Ireland',
    'Irish VAT3 form',
    'Revenue Ireland VAT submission',
    'VAT return filing Ireland',
    'ROS VAT submission',
    'Irish VAT compliance',
    'VAT3 online submission',
    'Revenue VAT portal',
    'Irish VAT filing system',
    'Automated VAT submission Ireland'
  ],
  openGraph: {
    title: 'VAT Submission Ireland - Submit VAT Returns to Revenue',
    description: 'Submit Irish VAT returns directly to Revenue with automated VAT3 form preparation and AI-powered calculations.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://payvat.ie'}/vat-submission`,
    siteName: 'PayVAT.ie',
    locale: 'en_IE',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VAT Submission Ireland - Revenue VAT Returns',
    description: 'Submit Irish VAT returns with automated VAT3 form preparation and calculations.',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://payvat.ie'}/vat-submission`,
  },
}

export default function VATSubmissionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}