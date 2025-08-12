export const metadata = {
  title: 'VAT Guide Ireland - Complete VAT Compliance Guide',
  description: 'Comprehensive guide to Irish VAT registration, returns, and compliance. Learn VAT rates, deadlines, and submission requirements for Irish businesses.',
  keywords: ['VAT guide Ireland', 'Irish VAT registration', 'VAT compliance Ireland', 'VAT rates Ireland', 'VAT deadlines Ireland', 'Revenue VAT guide'],
  openGraph: {
    title: 'VAT Guide Ireland - Complete VAT Compliance Guide',
    description: 'Comprehensive guide to Irish VAT registration, returns, and compliance for businesses.',
    url: 'https://payvat.ie/vat-guide',
    type: 'article',
  },
  alternates: {
    canonical: 'https://payvat.ie/vat-guide',
  },
}

export default function VATGuideLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}