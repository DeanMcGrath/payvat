import { NextRequest, NextResponse } from 'next/server'
import { createGuestFriendlyRoute } from '@/lib/middleware'
import { PromptOptimizer } from '@/lib/ai/prompt-optimization'
import { AuthUser } from '@/lib/auth'

export const runtime = 'nodejs'

/**
 * GET /api/admin/ai/prompts - Get prompt optimization data
 */
async function getPromptData(request: NextRequest, user?: AuthUser) {
  try {
    // Only admin users can access prompt optimization data
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Admin access required'
        },
        { status: 403 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'metrics'
    const category = searchParams.get('category')
    const timeRange = searchParams.get('timeRange') as 'day' | 'week' | 'month' || 'week'
    
    switch (action) {
      case 'metrics':
        const metrics = await PromptOptimizer.getVariationMetrics(category || undefined, timeRange)
        return NextResponse.json({
          success: true,
          metrics,
          category: category || 'all',
          timeRange
        })
        
      case 'optimized':
        const optimizations = await PromptOptimizer.getOptimizedPrompts()
        return NextResponse.json({
          success: true,
          optimizations
        })
        
      case 'test-results':
        const testName = searchParams.get('testName')
        if (!testName) {
          return NextResponse.json(
            { success: false, error: 'Test name required' },
            { status: 400 }
          )
        }
        
        try {
          const testResults = await PromptOptimizer.analyzeABTest(testName)
          return NextResponse.json({
            success: true,
            testResults
          })
        } catch (error) {
          return NextResponse.json(
            { success: false, error: error.message },
            { status: 404 }
          )
        }
        
      default:
        return NextResponse.json(
          { 
            success: false,
            error: 'Invalid action parameter'
          },
          { status: 400 }
        )
    }
    
  } catch (error) {
    console.error('Error getting prompt data:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to retrieve prompt data'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/ai/prompts - Manage prompt optimization (create variations, start tests)
 */
async function managePrompts(request: NextRequest, user?: AuthUser) {
  try {
    // Only admin users can manage prompts
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Admin access required'
        },
        { status: 403 }
      )
    }
    
    const { action, ...data } = await request.json()
    
    switch (action) {
      case 'create-variation':
        const { name, description, promptText, category, weight } = data
        
        if (!name || !promptText || !category) {
          return NextResponse.json(
            { 
              success: false,
              error: 'Name, prompt text, and category are required'
            },
            { status: 400 }
          )
        }
        
        const variation = await PromptOptimizer.createPromptVariation({
          name,
          description: description || '',
          promptText,
          category,
          isActive: true,
          weight: weight || 0.1,
          version: 1
        })
        
        return NextResponse.json({
          success: true,
          variation,
          message: 'Prompt variation created successfully'
        })
        
      case 'start-ab-test':
        const { 
          testName, 
          testCategory, 
          variations, 
          trafficSplit, 
          minSampleSize, 
          maxDuration,
          confidenceLevel 
        } = data
        
        if (!testName || !testCategory || !variations || !trafficSplit) {
          return NextResponse.json(
            { 
              success: false,
              error: 'Test name, category, variations, and traffic split are required'
            },
            { status: 400 }
          )
        }
        
        await PromptOptimizer.startABTest({
          testName,
          category: testCategory,
          variations,
          trafficSplit,
          minSampleSize: minSampleSize || 50,
          maxDuration: maxDuration || 30,
          confidenceLevel: confidenceLevel || 0.95,
          isActive: true
        })
        
        return NextResponse.json({
          success: true,
          message: `A/B test "${testName}" started successfully`
        })
        
      case 'record-test':
        const {
          variationId,
          documentId,
          userId,
          confidence,
          accuracy,
          extractionSuccess,
          processingTime,
          errorMessage,
          testContext
        } = data
        
        if (!variationId || !documentId || confidence === undefined) {
          return NextResponse.json(
            { 
              success: false,
              error: 'Variation ID, document ID, and confidence are required'
            },
            { status: 400 }
          )
        }
        
        await PromptOptimizer.recordPromptTest({
          variationId,
          documentId,
          userId,
          confidence,
          accuracy,
          extractionSuccess: extractionSuccess !== false,
          processingTime: processingTime || 0,
          errorMessage,
          testContext: testContext || {}
        })
        
        return NextResponse.json({
          success: true,
          message: 'Test results recorded successfully'
        })
        
      default:
        return NextResponse.json(
          { 
            success: false,
            error: 'Invalid action'
          },
          { status: 400 }
        )
    }
    
  } catch (error) {
    console.error('Error managing prompts:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to manage prompt optimization'
      },
      { status: 500 }
    )
  }
}

export const GET = createGuestFriendlyRoute(getPromptData)
export const POST = createGuestFriendlyRoute(managePrompts)