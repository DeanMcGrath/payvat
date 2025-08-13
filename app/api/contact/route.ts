import { NextRequest, NextResponse } from 'next/server'

interface ContactFormData {
  fullName: string
  email: string
  phone: string
  companyName?: string
  subject: string
  message: string
  businessType?: string
  currentStage?: string
  source: string
  timestamp: string
}

// In-memory storage for demo purposes
// In production, this would connect to a database
let submissions: ContactFormData[] = []

export async function POST(request: NextRequest) {
  try {
    const data: ContactFormData = await request.json()
    
    // Validate required fields
    if (!data.fullName || !data.email || !data.phone || !data.message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Add submission to storage
    const submission = {
      ...data,
      timestamp: new Date().toISOString(),
      id: Date.now().toString() // Simple ID generation for demo
    }
    
    submissions.push(submission)

    // In production, you would:
    // 1. Save to database
    // 2. Send email notification to support team
    // 3. Add to CRM system
    // 4. Log for analytics

    console.log('New contact form submission:', submission)

    return NextResponse.json(
      { 
        success: true, 
        message: 'Message sent successfully',
        id: submission.id
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Contact form submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Return all submissions for admin panel
  // In production, this would require authentication
  return NextResponse.json({
    submissions: submissions.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  })
}