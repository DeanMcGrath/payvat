import type { Metadata } from 'next'
import VATPaymentIrelandPageClient from './page-client'

export const metadata: Metadata = {
  title: 'VAT Payment Ireland 2025: Deadlines, Methods & Penalties | PayVAT',
  description:
    'Complete guide to VAT payment Ireland including payment deadlines, online payment methods, late penalties, and automated payment solutions for Irish businesses.',
}

export default function VATPaymentIrelandPage() {
  return <VATPaymentIrelandPageClient />
}

