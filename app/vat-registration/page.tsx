import type { Metadata } from 'next'
import VATRegistrationPageClient from './page-client'

export const metadata: Metadata = {
  title: 'VAT Registration Ireland 2025 - Complete Guide, Forms & Requirements',
  description:
    'Complete guide to VAT registration in Ireland. Learn thresholds (€42,500 services, €85,000 goods), forms, deadlines, and requirements. Step-by-step process explained.',
}

export default function VATRegistrationPage() {
  return <VATRegistrationPageClient />
}

