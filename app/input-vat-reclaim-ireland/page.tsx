import type { Metadata } from 'next'
import InputVATReclaimPageClient from './page-client'

export const metadata: Metadata = {
  title: 'Input VAT Reclaim Ireland: Complete Guide to VAT Refunds 2025 | PayVAT',
  description:
    'Comprehensive guide to input VAT reclaim Ireland. Learn eligible expenses, claim processes, VAT refund procedures, and maximize your tax recovery with automated software.',
}

export default function InputVATReclaimPage() {
  return <InputVATReclaimPageClient />
}

