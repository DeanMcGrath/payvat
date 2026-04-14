import type { Metadata } from 'next'
import VATComplianceChecklistPageClient from './page-client'

export const metadata: Metadata = {
  title: 'VAT Compliance Checklist Ireland 2025: Complete Guide | PayVAT',
  description:
    'Essential VAT compliance checklist for Irish businesses. Ensure Revenue compliance with monthly tasks, VAT rules, exemptions, and invoicing requirements. Free PDF download.',
}

export default function VATComplianceChecklistPage() {
  return <VATComplianceChecklistPageClient />
}

