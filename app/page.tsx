import type { Metadata } from 'next'
import LandingPageClient from './page-client'

export const metadata: Metadata = {
  title: 'PayVAT Ireland - Guided VAT Preparation Workflow for Irish Businesses',
  description:
    'Prepare, review, record, export, and track Irish VAT returns in one workflow. This beta does not file directly with Revenue ROS.',
  robots: {
    index: true,
    follow: true,
  },
}

export default function LandingPage() {
  return <LandingPageClient />
}
