import { NextRequest, NextResponse } from 'next/server'

interface SearchResult {
  id: string
  title: string
  excerpt: string
  url: string
  type: 'page' | 'help' | 'guide'
  relevance: number
  category: string
}

// Static content index for searching
const SEARCHABLE_CONTENT = [
  {
    id: 'vat-registration',
    title: 'How to Apply for a VAT Number in Ireland',
    content: 'This guide outlines the process for new businesses in Ireland to register for a Value-Added Tax (VAT) number, ensuring compliance with Irish tax regulations. Registration requirements mandatory voluntary intention trade documents forms Revenue Online Service ROS TR1 TR2 processing obligations compliance',
    url: '/vat-registration',
    type: 'guide' as const,
    category: 'VAT Registration'
  },
  {
    id: 'vat-guide',
    title: 'Everything You Need to Know About VAT in Ireland',
    content: 'Value-Added Tax VAT indirect tax applied sale goods services Ireland registered businesses charge output reclaim input VAT rates 23% 13.5% 9% 0% filing payment deadlines periodic returns Revenue Commissioners',
    url: '/vat-guide',
    type: 'guide' as const,
    category: 'VAT Guide'
  },
  {
    id: 'dashboard',
    title: 'VAT Dashboard',
    content: 'Dashboard overview VAT returns submissions payments analytics reports upcoming deadlines business summary financial overview Revenue compliance status',
    url: '/dashboard',
    type: 'page' as const,
    category: 'Dashboard'
  },
  {
    id: 'vat-submission',
    title: 'VAT Return Submission',
    content: 'Submit VAT returns calculate sales VAT purchase VAT net VAT due upload supporting documents automatic calculations AI processing Revenue submission compliance',
    url: '/vat-submission',
    type: 'page' as const,
    category: 'VAT Returns'
  },
  {
    id: 'submit-return',
    title: 'Submit VAT Return',
    content: 'Submit VAT return review calculations confirm submission Revenue declaration supporting documents approval payment process',
    url: '/submit-return',
    type: 'page' as const,
    category: 'VAT Returns'
  },
  {
    id: 'secure-payment',
    title: 'Secure VAT Payment',
    content: 'Secure payment VAT dues credit card debit card bank transfer Revenue payment processing SSL security PCI compliant payment methods',
    url: '/secure-payment',
    type: 'page' as const,
    category: 'Payments'
  },
  {
    id: 'payment-confirmed',
    title: 'Payment Confirmed',
    content: 'Payment confirmation VAT payment successful Revenue processed receipt download transaction details business information payment method',
    url: '/payment-confirmed',
    type: 'page' as const,
    category: 'Payments'
  },
  {
    id: 'reports',
    title: 'VAT Reports & Analytics',
    content: 'VAT reports analytics financial summaries annual reports trend analysis EC Sales List reporting statistics business insights Revenue compliance tracking',
    url: '/reports',
    type: 'page' as const,
    category: 'Reports'
  },
  {
    id: 'vat-period',
    title: 'VAT Calculator',
    content: 'VAT calculator period selection calculate VAT amounts rates 23% 13.5% 9% input output VAT computation business calculations tax planning',
    url: '/vat-period',
    type: 'page' as const,
    category: 'Calculator'
  },
  {
    id: 'pricing',
    title: 'Pricing Plans',
    content: 'PayVAT pricing plans subscription costs VAT management service fees business plans enterprise solutions monthly annual billing payment processing',
    url: '/pricing',
    type: 'page' as const,
    category: 'Pricing'
  },
  {
    id: 'about',
    title: 'About PayVAT',
    content: 'About PayVAT Irish VAT compliance software automated VAT returns Revenue integration business tax management Irish businesses VAT processing company information',
    url: '/about',
    type: 'page' as const,
    category: 'Company'
  },
  {
    id: 'faq',
    title: 'Frequently Asked Questions',
    content: 'FAQ frequently asked questions VAT help support common issues troubleshooting Revenue integration payment problems return submissions business guidance',
    url: '/faq',
    type: 'help' as const,
    category: 'Help & Support'
  },
  {
    id: 'signup',
    title: 'Sign Up for PayVAT',
    content: 'Sign up register PayVAT account business registration VAT number company details subscription start trial create account user registration',
    url: '/signup',
    type: 'page' as const,
    category: 'Account'
  },
  {
    id: 'login',
    title: 'Login to PayVAT',
    content: 'Login sign in PayVAT account user authentication email password access dashboard business account user login credentials',
    url: '/login',
    type: 'page' as const,
    category: 'Account'
  }
]

function searchContent(query: string, type?: string): SearchResult[] {
  if (!query.trim()) {
    return []
  }

  const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 1)
  const results: SearchResult[] = []

  for (const content of SEARCHABLE_CONTENT) {
    // Filter by type if specified
    if (type && type !== 'all' && content.type !== type) {
      continue
    }

    const searchableText = `${content.title} ${content.content}`.toLowerCase()
    let relevanceScore = 0
    let matchedTerms = 0

    // Calculate relevance score
    for (const term of searchTerms) {
      if (content.title.toLowerCase().includes(term)) {
        relevanceScore += 10 // Higher weight for title matches
        matchedTerms++
      } else if (searchableText.includes(term)) {
        relevanceScore += 1
        matchedTerms++
      }
    }

    // Only include results that match at least one search term
    if (matchedTerms > 0) {
      // Boost score based on percentage of terms matched
      relevanceScore *= (matchedTerms / searchTerms.length)

      // Create excerpt with highlighted terms
      const excerpt = createExcerpt(content.content, searchTerms)

      results.push({
        id: content.id,
        title: content.title,
        excerpt,
        url: content.url,
        type: content.type,
        relevance: relevanceScore,
        category: content.category
      })
    }
  }

  // Sort by relevance score (highest first)
  return results.sort((a, b) => b.relevance - a.relevance)
}

function createExcerpt(content: string, searchTerms: string[]): string {
  const words = content.split(' ')
  const maxExcerptLength = 150

  // Find the best position to start the excerpt (near a search term)
  let bestStart = 0
  for (const term of searchTerms) {
    const termIndex = words.findIndex(word => word.toLowerCase().includes(term))
    if (termIndex !== -1) {
      bestStart = Math.max(0, termIndex - 10)
      break
    }
  }

  // Create excerpt
  let excerpt = words.slice(bestStart, bestStart + 25).join(' ')
  
  if (excerpt.length > maxExcerptLength) {
    excerpt = excerpt.substring(0, maxExcerptLength) + '...'
  }

  if (bestStart > 0) {
    excerpt = '...' + excerpt
  }

  return excerpt
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q') || ''
  const type = searchParams.get('type') || 'all'

  const startTime = Date.now()

  try {
    const results = searchContent(query, type)
    const searchTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      results,
      totalResults: results.length,
      searchTime,
      query: query.trim()
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Search failed',
        results: [],
        totalResults: 0,
        searchTime: Date.now() - startTime,
        query: query.trim()
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, type = 'all' } = body

    const startTime = Date.now()
    const results = searchContent(query || '', type)
    const searchTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      results,
      totalResults: results.length,
      searchTime,
      query: (query || '').trim()
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Search failed',
        results: [],
        totalResults: 0,
        searchTime: 0,
        query: ''
      },
      { status: 500 }
    )
  }
}