import type { Metadata } from 'next'
import VATAutomationSoftwarePageClient from './page-client'

export const metadata: Metadata = {
  title: 'VAT Automation Software Ireland: AI-Powered Submission System | PayVAT',
  description:
    'Advanced VAT automation software for Irish businesses. AI-powered document processing, automated Revenue submissions, and 90% time savings. Free trial available.',
}

export default function VATAutomationSoftwarePage() {
  return <VATAutomationSoftwarePageClient />
}

