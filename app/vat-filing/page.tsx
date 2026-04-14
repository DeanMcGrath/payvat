import type { Metadata } from 'next'
import VATFilingPageClient from './page-client'

export const metadata: Metadata = {
  title: 'VAT Filing Ireland: Automated Submission Software | PayVAT',
  description:
    'Complete guide to VAT filing Ireland. Learn bimonthly VAT filing process, input VAT reclaim, and automated VAT submission software. Ensure Revenue compliance.',
}

export default function VATFilingPage() {
  return <VATFilingPageClient />
}

