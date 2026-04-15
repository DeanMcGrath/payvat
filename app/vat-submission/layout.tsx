import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'VAT Submission Ireland - Review and Record VAT3 Returns | PayVAT.ie',
  description: 'Review, validate, and record your Irish VAT returns in PayVAT with export-ready ROS handoff support and clear payment tracking.',
  keywords: [
    'VAT submission Ireland',
    'VAT3 return Ireland',
    'Prepare VAT for Revenue Ireland',
    'Irish VAT3 form',
    'Revenue Ireland VAT filing workflow',
    'VAT return filing Ireland',
    'ROS VAT handoff',
    'Irish VAT compliance',
    'VAT3 online preparation',
    'Revenue VAT portal',
    'Irish VAT filing system',
    'VAT submission workflow Ireland'
  ],
  openGraph: {
    title: 'VAT Submission Ireland - Review and Record VAT Returns',
    description: 'Review and record Irish VAT returns with automated VAT3 preparation, ROS-ready export guidance, and payment tracking.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://payvat.ie'}/vat-submission`,
    siteName: 'PayVAT.ie',
    locale: 'en_IE',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VAT Submission Ireland - VAT Return Review Workflow',
    description: 'Review and record Irish VAT returns with automated VAT3 preparation and ROS-ready export guidance.',
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
