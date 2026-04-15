import type { Metadata } from 'next'
import VATFilingPageClient from './page-client'

export const metadata: Metadata = {
  title: 'VAT Filing Ireland: Preparation and Review Guide | PayVAT',
  description:
    'Complete guide to VAT filing Ireland. Learn bimonthly VAT filing, input VAT reclaim, and how to prepare returns with a review-first workflow.',
}

export default function VATFilingPage() {
  return <VATFilingPageClient />
}
