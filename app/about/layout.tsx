export const metadata = {
  title: 'About PayVAT Ireland - Irish VAT Experts & Fintech Platform',
  description: 'Learn about PayVAT Ireland, the leading VAT compliance platform for Irish businesses. Expert VAT solutions, trusted by companies across Ireland.',
  keywords: ['PayVAT Ireland', 'Irish VAT experts', 'VAT compliance platform', 'VAT fintech Ireland', 'Irish VAT specialists', 'Dublin VAT services'],
  openGraph: {
    title: 'About PayVAT Ireland - Irish VAT Experts & Fintech Platform',
    description: 'The leading VAT compliance platform for Irish businesses. Expert solutions trusted across Ireland.',
    url: 'https://payvat.ie/about',
    type: 'website',
  },
  alternates: {
    canonical: 'https://payvat.ie/about',
  },
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}