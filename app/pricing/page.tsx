import type { Metadata } from 'next'
import PricingPageClient from './page-client'

export const metadata: Metadata = {
  title: 'PayVAT Pricing - €30/Month VAT Software | 14-Day Free Trial',
  description:
    'Simple, transparent pricing for Irish VAT submission. €30/month or €300/year. Save €180 annually. 14-day free trial, no credit card required. Try PayVAT today.',
}

export default function PricingPage() {
  return <PricingPageClient />
}

