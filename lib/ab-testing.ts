// A/B Testing Framework for Conversion Optimization
export interface ABTest {
  id: string
  name: string
  description: string
  status: 'draft' | 'running' | 'completed' | 'paused'
  variants: ABVariant[]
  allocation: { [variantId: string]: number } // Percentage allocation
  targeting?: {
    userType?: ('anonymous' | 'trial' | 'paid')[]
    pages?: string[]
    countries?: string[]
    devices?: ('mobile' | 'desktop' | 'tablet')[]
  }
  metrics: {
    primary: string // e.g., 'signup_conversion'
    secondary: string[] // e.g., ['engagement_time', 'page_views']
  }
  startDate: Date
  endDate?: Date
  confidence: number // Statistical confidence level
}

export interface ABVariant {
  id: string
  name: string
  description: string
  isControl: boolean
  weight: number // Traffic allocation weight
  config: any // Variant-specific configuration
}

export interface ABTestResult {
  testId: string
  variantId: string
  userId?: string
  sessionId: string
  event: string
  value?: number
  timestamp: Date
  metadata?: any
}

class ABTestingManager {
  private static instance: ABTestingManager
  private tests: Map<string, ABTest> = new Map()
  private userVariants: Map<string, { [testId: string]: string }> = new Map()
  private results: ABTestResult[] = []

  private constructor() {
    // Load tests from configuration or API
    this.initializeTests()
  }

  public static getInstance(): ABTestingManager {
    if (!ABTestingManager.instance) {
      ABTestingManager.instance = new ABTestingManager()
    }
    return ABTestingManager.instance
  }

  private initializeTests() {
    // Define conversion optimization tests
    const conversionTests: ABTest[] = [
      {
        id: 'homepage_hero_test',
        name: 'Homepage Hero Message',
        description: 'Test different value propositions on homepage',
        status: 'running',
        variants: [
          {
            id: 'control',
            name: 'Original',
            description: 'Current hero message',
            isControl: true,
            weight: 50,
            config: {
              headline: 'PayVAT Ireland - AI-Powered VAT Submission Software',
              subtext: 'Automate your Irish VAT returns with AI-powered document processing'
            }
          },
          {
            id: 'benefit_focused',
            name: 'Benefit Focused',
            description: 'Focus on time savings and automation',
            isControl: false,
            weight: 50,
            config: {
              headline: 'Save 10+ Hours Every VAT Return',
              subtext: 'Irish businesses trust PayVAT to automate their VAT submissions and never miss a deadline'
            }
          }
        ],
        allocation: { control: 50, benefit_focused: 50 },
        targeting: {
          userType: ['anonymous'],
          pages: ['/']
        },
        metrics: {
          primary: 'signup_conversion',
          secondary: ['time_on_page', 'scroll_depth', 'cta_clicks']
        },
        startDate: new Date('2025-08-25'),
        confidence: 0.95
      },
      {
        id: 'pricing_page_test',
        name: 'Pricing Page CTA',
        description: 'Test different CTA buttons on pricing page',
        status: 'running',
        variants: [
          {
            id: 'control',
            name: 'Start Free Trial',
            description: 'Current CTA text',
            isControl: true,
            weight: 33,
            config: {
              ctaText: 'Start Free Trial',
              ctaColor: 'blue'
            }
          },
          {
            id: 'urgency',
            name: 'Start Saving Time Today',
            description: 'Urgency-focused CTA',
            isControl: false,
            weight: 33,
            config: {
              ctaText: 'Start Saving Time Today',
              ctaColor: 'green'
            }
          },
          {
            id: 'value',
            name: 'Try 14 Days Free',
            description: 'Value-focused CTA',
            isControl: false,
            weight: 34,
            config: {
              ctaText: 'Try 14 Days Free',
              ctaColor: 'purple'
            }
          }
        ],
        allocation: { control: 33, urgency: 33, value: 34 },
        targeting: {
          userType: ['anonymous', 'trial'],
          pages: ['/pricing']
        },
        metrics: {
          primary: 'cta_click_rate',
          secondary: ['signup_conversion', 'page_bounce_rate']
        },
        startDate: new Date('2025-08-25'),
        confidence: 0.95
      },
      {
        id: 'exit_intent_test',
        name: 'Exit Intent Popup',
        description: 'Test different exit intent popup variations',
        status: 'running',
        variants: [
          {
            id: 'control',
            name: 'No Popup',
            description: 'No exit intent popup',
            isControl: true,
            weight: 50,
            config: { enabled: false }
          },
          {
            id: 'extended_trial',
            name: 'Extended Trial Offer',
            description: '30-day trial instead of 14-day',
            isControl: false,
            weight: 50,
            config: {
              enabled: true,
              headline: 'Wait! Get 30 Days Free',
              offer: '30-day extended trial',
              urgency: 'Limited time offer'
            }
          }
        ],
        allocation: { control: 50, extended_trial: 50 },
        targeting: {
          userType: ['anonymous'],
          pages: ['/pricing', '/vat-submission', '/']
        },
        metrics: {
          primary: 'exit_intent_conversion',
          secondary: ['popup_show_rate', 'signup_conversion']
        },
        startDate: new Date('2025-08-25'),
        confidence: 0.90
      }
    ]

    conversionTests.forEach(test => {
      this.tests.set(test.id, test)
    })
  }

  // Get user's variant for a specific test
  public getUserVariant(testId: string, userId?: string, sessionId?: string): string | null {
    const test = this.tests.get(testId)
    if (!test || test.status !== 'running') return null

    const identifier = userId || sessionId || 'anonymous'
    
    // Check if user already has a variant assigned
    if (this.userVariants.has(identifier)) {
      const userTests = this.userVariants.get(identifier)!
      if (userTests[testId]) {
        return userTests[testId]
      }
    }

    // Assign variant based on allocation
    const variant = this.assignVariant(test, identifier)
    
    // Store variant assignment
    if (!this.userVariants.has(identifier)) {
      this.userVariants.set(identifier, {})
    }
    this.userVariants.get(identifier)![testId] = variant

    // Save to localStorage for persistence
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('ab_test_variants') || '{}'
      const variants = JSON.parse(stored)
      variants[testId] = variant
      localStorage.setItem('ab_test_variants', JSON.stringify(variants))
    }

    return variant
  }

  private assignVariant(test: ABTest, identifier: string): string {
    // Use consistent hashing for stable variant assignment
    const hash = this.hashString(identifier + test.id)
    const randomValue = hash % 100

    let cumulativeWeight = 0
    for (const variant of test.variants) {
      cumulativeWeight += variant.weight
      if (randomValue < cumulativeWeight) {
        return variant.id
      }
    }

    // Fallback to control
    return test.variants.find(v => v.isControl)?.id || test.variants[0].id
  }

  private hashString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  // Get variant configuration
  public getVariantConfig(testId: string, variantId: string): any {
    const test = this.tests.get(testId)
    if (!test) return null

    const variant = test.variants.find(v => v.id === variantId)
    return variant?.config || null
  }

  // Track test event
  public trackEvent(
    testId: string,
    variantId: string,
    event: string,
    value?: number,
    userId?: string,
    sessionId?: string,
    metadata?: any
  ): void {
    const result: ABTestResult = {
      testId,
      variantId,
      userId,
      sessionId: sessionId || this.generateSessionId(),
      event,
      value,
      timestamp: new Date(),
      metadata
    }

    this.results.push(result)

    // Send to analytics in production
    this.sendToAnalytics(result)

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[A/B Test] ${testId} - ${variantId}: ${event}`, { value, metadata })
    }
  }

  private async sendToAnalytics(result: ABTestResult): Promise<void> {
    try {
      await fetch('/api/analytics/ab-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result)
      })
    } catch (error) {
      console.error('Failed to send A/B test result:', error)
    }
  }

  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  // Get test results summary
  public getTestResults(testId: string): any {
    const testResults = this.results.filter(r => r.testId === testId)
    const test = this.tests.get(testId)
    
    if (!test) return null

    const summary: any = {
      testId,
      testName: test.name,
      status: test.status,
      totalEvents: testResults.length,
      variants: {}
    }

    test.variants.forEach(variant => {
      const variantResults = testResults.filter(r => r.variantId === variant.id)
      const uniqueUsers = new Set(variantResults.map(r => r.userId || r.sessionId)).size
      
      summary.variants[variant.id] = {
        name: variant.name,
        isControl: variant.isControl,
        events: variantResults.length,
        uniqueUsers,
        conversions: variantResults.filter(r => r.event === test.metrics.primary).length,
        conversionRate: uniqueUsers > 0 ? 
          (variantResults.filter(r => r.event === test.metrics.primary).length / uniqueUsers) * 100 : 0
      }
    })

    return summary
  }

  // Check if user matches test targeting
  private matchesTargeting(test: ABTest, context: any): boolean {
    if (!test.targeting) return true

    const { userType, pages, countries, devices } = test.targeting

    if (userType && !userType.includes(context.userType)) return false
    if (pages && !pages.includes(context.currentPage)) return false
    if (countries && !countries.includes(context.country)) return false
    if (devices && !devices.includes(context.device)) return false

    return true
  }

  // Get active tests for current context
  public getActiveTests(context: any): ABTest[] {
    return Array.from(this.tests.values())
      .filter(test => test.status === 'running')
      .filter(test => this.matchesTargeting(test, context))
  }
}

// Singleton instance
export const abTestManager = ABTestingManager.getInstance()

// React hook for A/B testing
export function useABTest(testId: string, userId?: string) {
  const sessionId = typeof window !== 'undefined' ? 
    (sessionStorage.getItem('session_id') || 'session_' + Date.now()) : undefined

  const variantId = abTestManager.getUserVariant(testId, userId, sessionId)
  const config = variantId ? abTestManager.getVariantConfig(testId, variantId) : null

  const trackEvent = (event: string, value?: number, metadata?: any) => {
    if (variantId) {
      abTestManager.trackEvent(testId, variantId, event, value, userId, sessionId, metadata)
    }
  }

  return {
    variantId,
    config,
    trackEvent,
    isActive: variantId !== null
  }
}

export default ABTestingManager