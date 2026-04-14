import type { Metadata } from 'next'
import LandingPageClient from './page-client'

export const metadata: Metadata = {
  title: 'PayVAT Ireland - AI-Powered VAT Submission Software for Irish Businesses',
  description:
    'Automate your Irish VAT returns with AI-powered document processing. Submit VAT to Revenue Ireland easily. €30/month. 14-day free trial. Trusted by Irish businesses.',
}

export default function LandingPage() {
  return <LandingPageClient />
}

