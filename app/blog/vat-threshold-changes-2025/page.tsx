import type { Metadata } from 'next'
import VATThresholdChanges2025BlogClient from './page-client'

export const metadata: Metadata = {
  title: 'VAT Threshold Changes 2025: What Irish Businesses Need to Know | PayVAT Blog',
  description:
    'Complete guide to Ireland VAT registration thresholds for 2025. Learn how Revenue threshold changes affect your business and what you need to do to stay compliant.',
}

export default function VATThresholdChanges2025BlogPage() {
  return <VATThresholdChanges2025BlogClient />
}

