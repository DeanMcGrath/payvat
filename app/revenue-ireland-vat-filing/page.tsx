import type { Metadata } from 'next'
import RevenueIrelandVATFilingPageClient from './page-client'

export const metadata: Metadata = {
  title: 'Revenue Ireland VAT Filing 2025 - ROS Filing Guide | PayVAT',
  description:
    "Complete guide to filing VAT returns with Revenue Ireland through ROS. Step-by-step process, requirements, and PayVAT's filing preparation workflow.",
}

export default function RevenueIrelandVATFilingPage() {
  return <RevenueIrelandVATFilingPageClient />
}
