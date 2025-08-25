import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'VAT Deadlines Calendar Ireland 2025 - Revenue VAT Filing Dates | PayVAT.ie',
  description: 'Complete 2025 VAT deadlines calendar for Irish businesses. Never miss Revenue VAT submission dates with bi-monthly, monthly & annual filing schedules.',
  keywords: [
    'VAT deadlines Ireland 2025',
    'Irish VAT calendar',
    'Revenue VAT submission dates',
    'VAT filing deadlines Ireland',
    'Irish VAT due dates',
    'VAT3 return deadlines',
    'Revenue Ireland deadlines',
    'VAT payment calendar Ireland',
    'Irish VAT schedule',
    'VAT compliance calendar'
  ],
  openGraph: {
    title: 'VAT Deadlines Calendar Ireland 2025 - All Revenue Filing Dates',
    description: 'Complete VAT deadlines calendar for Irish businesses. Bi-monthly, monthly & annual filing dates for 2025.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://payvat.ie'}/vat-deadlines-calendar-ireland`,
    siteName: 'PayVAT.ie',
    locale: 'en_IE',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VAT Deadlines Ireland 2025 Calendar',
    description: 'All Irish Revenue VAT submission dates for 2025. Never miss a deadline.',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://payvat.ie'}/vat-deadlines-calendar-ireland`,
  },
}

export default function VATDeadlinesCalendarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}