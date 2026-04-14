import type { Metadata } from 'next'
import VATDeadlinesCalendarPageClient from './page-client'

export const metadata: Metadata = {
  title: 'VAT Deadlines Calendar Ireland 2025 - Never Miss a Filing Date | PayVAT',
  description:
    'Complete 2025 VAT deadlines calendar for Ireland. Monthly, bi-monthly, and annual filing dates. Set reminders, avoid penalties. PayVAT automates your submissions.',
}

export default function VATDeadlinesCalendarPage() {
  return <VATDeadlinesCalendarPageClient />
}

