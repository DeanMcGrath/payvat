import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'
import emailService from '@/lib/email-service'

const prisma = new PrismaClient()

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

    // Save to database
    const submission = await prisma.contactSubmission.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        companyName: data.companyName,
        subject: data.subject,
        message: data.message,
        businessType: data.businessType,
        currentStage: data.currentStage,
        source: data.source,
        status: 'new',        // Default status for new submissions
        priority: 'normal',   // Default priority for new submissions
        tags: []             // Empty tags array by default
      },
    })

    // Send email notifications (don't wait for completion to avoid delays)
    const emailData = {
      fullName: submission.fullName,
      email: submission.email,
      subject: submission.subject,
      message: submission.message,
      submissionId: submission.id
    }

    // Send confirmation email to customer
    emailService.sendContactConfirmationToCustomer(emailData).catch(error => {
      console.error('Failed to send confirmation email:', error)
    })

    // Send notification to admin
    emailService.sendContactNotificationToAdmin(emailData).catch(error => {
      console.error('Failed to send admin notification:', error)
    })

    console.log('✅ New contact form submission saved:', submission.id)

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
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET() {
  try {
    // Return all submissions for admin panel
    // In production, this would require authentication
    const submissions = await prisma.contactSubmission.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      submissions: submissions
    })
  } catch (error) {
    console.error('Error fetching contact submissions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}