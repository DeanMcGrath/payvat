import type { Metadata } from 'next'
import VATGuidePageClient from './page-client'

export const metadata: Metadata = {
  title: 'Complete Irish VAT Guide 2025 - Registration, Rates, Deadlines | PayVAT',
  description:
    'Comprehensive guide to Irish VAT compliance. Learn about VAT registration thresholds, rates, deadlines, and filing requirements. Updated for 2025. Expert advice from PayVAT.',
}

export default function VATGuidePage() {
  return <VATGuidePageClient />
}

