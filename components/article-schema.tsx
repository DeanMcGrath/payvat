"use client"

import { useEffect } from 'react'

interface ArticleSchemaProps {
  title: string
  description: string
  datePublished?: string
  dateModified?: string
  keywords?: string[]
  url: string
}

export default function ArticleSchema({ 
  title, 
  description, 
  datePublished = "2025-01-01", 
  dateModified = "2025-08-25",
  keywords = [],
  url 
}: ArticleSchemaProps) {
  useEffect(() => {
    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": title,
      "description": description,
      "image": "https://payvat.ie/og-image.jpg",
      "datePublished": datePublished,
      "dateModified": dateModified,
      "author": {
        "@type": "Organization",
        "name": "PayVAT Ireland",
        "url": "https://payvat.ie"
      },
      "publisher": {
        "@type": "Organization",
        "name": "PayVAT Ireland",
        "logo": {
          "@type": "ImageObject",
          "url": "https://payvat.ie/logo.png"
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": url
      },
      "articleSection": "VAT Compliance Guide",
      "keywords": keywords.join(", "),
      "about": {
        "@type": "Thing",
        "name": "Irish VAT Compliance",
        "description": "VAT regulations, filing requirements, and compliance guidance for Irish businesses"
      },
      "isPartOf": {
        "@type": "WebSite",
        "name": "PayVAT Ireland",
        "url": "https://payvat.ie"
      },
      "inLanguage": "en-IE",
      "copyrightYear": "2025",
      "copyrightHolder": {
        "@type": "Organization",
        "name": "PayVAT Ireland"
      }
    }

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(articleSchema)
    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [title, description, datePublished, dateModified, keywords, url])

  return null
}