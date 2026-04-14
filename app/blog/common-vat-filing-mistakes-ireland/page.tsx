import type { Metadata } from 'next'
import CommonVATFilingMistakesBlogClient from './page-client'

export const metadata: Metadata = {
  title: '5 Common VAT Filing Mistakes Irish Businesses Make (And How to Avoid Them) | PayVAT Blog',
  description:
    'Discover the most frequent VAT errors that cost Irish businesses time and money. Learn practical solutions to prevent common VAT filing mistakes and ensure Revenue compliance.',
}

export default function CommonVATFilingMistakesBlogPage() {
  return <CommonVATFilingMistakesBlogClient />
}

