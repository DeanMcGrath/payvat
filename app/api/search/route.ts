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
    id: 'home',
    title: 'PayVAT',
    content: 'Prepare review record export and track Irish VAT returns in a guided workflow for paid beta users',
    url: '/',
    type: 'page' as const,
    category: 'Product'
  },
  {
    id: 'pricing',
    title: 'Paid Beta Pricing',
    content: 'Paid beta access for guided VAT preparation review recording export and payment tracking',
    url: '/pricing',
    type: 'page' as const,
    category: 'Pricing'
  },
  {
    id: 'contact',
    title: 'Contact PayVAT',
    content: 'Contact the PayVAT team for onboarding support and paid beta access',
    url: '/contact',
    type: 'help' as const,
    category: 'Support'
  },
  {
    id: 'faq',
    title: 'Frequently Asked Questions',
    content: 'Guided filing workflow ROS boundary PayVAT tracking reference export artifact payment tracking and support',
    url: '/faq',
    type: 'help' as const,
    category: 'Help'
  },
  {
    id: 'beta-limitations',
    title: 'How PayVAT Works Today',
    content: 'Paid beta limitations ROS filing boundary export artifact guidance and user responsibilities',
    url: '/beta-limitations',
    type: 'help' as const,
    category: 'Help'
  },
  {
    id: 'dashboard-documents',
    title: 'Documents Workspace',
    content: 'Upload documents review flagged items correct totals and VAT amounts and track processing outcomes',
    url: '/dashboard/documents',
    type: 'page' as const,
    category: 'Workflow'
  },
  {
    id: 'dashboard-returns',
    title: 'VAT Returns',
    content: 'Review draft VAT returns see period totals and continue to submission checkpoint',
    url: '/dashboard/vat-returns',
    type: 'page' as const,
    category: 'Workflow'
  },
  {
    id: 'vat-submission',
    title: 'VAT Submission Review',
    content: 'Record guided submission generate PayVAT tracking reference and export filing artifact for ROS handoff',
    url: '/vat-submission',
    type: 'page' as const,
    category: 'Workflow'
  },
  {
    id: 'dashboard-payments',
    title: 'Payments',
    content: 'Track payment records references pending and completed payment states after return recording',
    url: '/dashboard/payments',
    type: 'page' as const,
    category: 'Workflow'
  },
  {
    id: 'signup',
    title: 'Sign Up',
    content: 'Create your PayVAT account and start paid beta onboarding',
    url: '/signup',
    type: 'page' as const,
    category: 'Account'
  },
  {
    id: 'login',
    title: 'Login',
    content: 'Sign in to your PayVAT workspace',
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
