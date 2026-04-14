import type { Metadata } from 'next'
import PricingPageClient from './page-client'

export const metadata: Metadata = {
  title: 'PayVAT Paid Beta - Guided VAT Workflow Pricing',
  description:
    'Paid beta pricing for PayVAT guided VAT preparation, review, recording, export, and payment tracking. This beta does not file directly with Revenue ROS.',
  robots: {
    index: true,
    follow: true,
  },
}

export default function PricingPage() {
  return <PricingPageClient />
}
