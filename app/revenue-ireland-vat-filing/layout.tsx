import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Revenue Ireland VAT Filing 2025 - Complete VAT Submission Guide | PayVAT.ie',
  description: 'Complete guide to filing VAT returns with Irish Revenue. ROS online submission, deadlines, requirements, and automated filing solutions for Irish businesses.',
  keywords: [
    'Revenue Ireland VAT filing',
    'Irish Revenue VAT submission',
    'ROS VAT filing',
    'Revenue online service VAT',
    'VAT filing Ireland',
    'Submit VAT to Revenue Ireland',
    'Irish VAT filing guide',
    'Revenue VAT returns',
    'VAT submission Revenue Ireland',
    'ROS online VAT',
    'Irish VAT compliance filing',
    'Revenue VAT portal'
  ],
  openGraph: {
    title: 'Revenue Ireland VAT Filing 2025 - Complete Submission Guide',
    description: 'Everything you need to know about filing VAT returns with Irish Revenue. ROS guide, deadlines, and automated solutions.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://payvat.ie'}/revenue-ireland-vat-filing`,
    siteName: 'PayVAT.ie',
    locale: 'en_IE',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Revenue Ireland VAT Filing Guide',
    description: 'Complete guide to filing VAT returns with Irish Revenue. ROS submissions, deadlines, and requirements.',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://payvat.ie'}/revenue-ireland-vat-filing`,
  },
}

export default function RevenueIrelandVATFilingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}