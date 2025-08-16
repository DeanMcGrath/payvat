import { NextRequest, NextResponse } from 'next/server'
import { ConfidenceMonitor } from '@/lib/ai/confidence-monitoring'

/**
 * GET /api/admin/confidence-metrics
 * Get confidence monitoring dashboard data
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') as 'day' | 'week' | 'month' || 'week'
    
    // console.log(`📊 Fetching confidence metrics for time range: ${timeRange}`)
    
    // Get comprehensive metrics
    const metrics = await ConfidenceMonitor.getConfidenceMetrics(timeRange)
    
    // Get current alerts
    const alerts = await ConfidenceMonitor.checkForAlerts()
    
    // Combine data for dashboard
    const dashboardData = {
      metrics,
      alerts,
      summary: {
        overallHealth: metrics.performance.systemHealth,
        averageConfidence: Math.round(metrics.overall.averageConfidence * 100),
        totalDocuments: metrics.overall.totalDocuments,
        complianceRate: Math.round(metrics.qualityMetrics.irishVATCompliance),
        alertCount: alerts.length,
        criticalAlerts: alerts.filter(a => a.severity === 'critical').length
      },
      timestamp: new Date().toISOString()
    }
    
    // console.log(`✅ Generated confidence dashboard data:`)
    // console.log(`   📈 Average confidence: ${dashboardData.summary.averageConfidence}%`)
    // console.log(`   📄 Documents: ${dashboardData.summary.totalDocuments}`)
    // console.log(`   🇮🇪 Compliance: ${dashboardData.summary.complianceRate}%`)
    // console.log(`   🚨 Alerts: ${dashboardData.summary.alertCount} (${dashboardData.summary.criticalAlerts} critical)`)
    // console.log(`   💪 Health: ${dashboardData.summary.overallHealth}`)
    
    return NextResponse.json({
      success: true,
      data: dashboardData
    })
    
  } catch (error) {
    console.error('❌ Failed to generate confidence metrics:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate confidence metrics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/confidence-metrics
 * Log a confidence metric for a processed document
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Validate required fields
    const requiredFields = ['documentId', 'fileName', 'documentType', 'processingMethod', 'confidence', 'vatAmounts']
    const missingFields = requiredFields.filter(field => !(field in data))
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Missing required fields: ${missingFields.join(', ')}` 
        },
        { status: 400 }
      )
    }
    
    // Log the confidence metric
    await ConfidenceMonitor.logConfidenceMetric(data)
    
    // console.log(`📊 Logged confidence metric for ${data.fileName}: ${Math.round(data.confidence * 100)}%`)
    
    return NextResponse.json({
      success: true,
      message: 'Confidence metric logged successfully'
    })
    
  } catch (error) {
    console.error('❌ Failed to log confidence metric:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to log confidence metric',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}