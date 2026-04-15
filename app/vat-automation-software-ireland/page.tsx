import type { Metadata } from 'next'
import VATAutomationSoftwarePageClient from './page-client'

export const metadata: Metadata = {
  title: 'VAT Automation Software Ireland: AI-Powered Review Workflow | PayVAT',
  description:
    'Advanced VAT automation software for Irish businesses. AI-powered document processing, review controls, guided ROS-ready export records, and payment tracking.',
}

export default function VATAutomationSoftwarePage() {
  return <VATAutomationSoftwarePageClient />
}
