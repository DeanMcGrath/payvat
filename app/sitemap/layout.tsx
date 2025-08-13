import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sitemap - PayVat Ireland | Complete Site Navigation',
  description: 'Complete sitemap of PayVat Ireland website. Find all pages including VAT guides, business setup resources, calculators, and tools for Irish businesses.',
  keywords: 'sitemap, PayVat Ireland, site navigation, VAT guides, business setup, Irish tax resources',
  authors: [{ name: 'PayVat Team' }],
  creator: 'PayVat',
  publisher: 'PayVat',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://payvat.ie'),
  alternates: {
    canonical: '/sitemap',
  },
  openGraph: {
    title: 'Sitemap - PayVat Ireland | Complete Site Navigation',
    description: 'Complete sitemap of PayVat Ireland website. Find all pages and resources for Irish businesses.',
    url: '/sitemap',
    siteName: 'PayVat',
    locale: 'en_IE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sitemap - PayVat Ireland | Complete Site Navigation',
    description: 'Complete sitemap of PayVat Ireland website. Find all pages and resources for Irish businesses.',
    creator: '@payvat_ie',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function SitemapLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "PayVat Ireland Sitemap",
            "description": "Complete navigation and page listing for PayVat Ireland website",
            "url": "https://payvat.ie/sitemap",
            "publisher": {
              "@type": "Organization",
              "name": "PayVat",
              "url": "https://payvat.ie",
              "logo": {
                "@type": "ImageObject",
                "url": "https://payvat.ie/logo.png"
              }
            }
          })
        }}
      />
      {children}
    </>
  )
}