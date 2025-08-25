import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'
import emailService from '@/lib/email-service'

const prisma = new PrismaClient()

interface ContactUpdateData {
  status?: string
  priority?: string
  adminNotes?: string
  assignedTo?: string
  followUpDate?: string
  tags?: string[]
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data: ContactUpdateData = await request.json()
    
    // Validate status values
    const validStatuses = ['new', 'read', 'in_progress', 'responded', 'resolved']
    const validPriorities = ['low', 'normal', 'high', 'urgent']
    
    if (data.status && !validStatuses.includes(data.status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      )
    }

    if (data.priority && !validPriorities.includes(data.priority)) {
      return NextResponse.json(
        { error: 'Invalid priority value' },
        { status: 400 }
      )
    }

    // Get current submission to check for status changes
    const currentSubmission = await prisma.contactSubmission.findUnique({
      where: { id: params.id }
    })

    if (!currentSubmission) {
      return NextResponse.json(
        { error: 'Contact submission not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    }

    if (data.status !== undefined) updateData.status = data.status
    if (data.priority !== undefined) updateData.priority = data.priority
    if (data.adminNotes !== undefined) updateData.adminNotes = data.adminNotes
    if (data.assignedTo !== undefined) updateData.assignedTo = data.assignedTo
    if (data.tags !== undefined) updateData.tags = data.tags
    
    if (data.followUpDate) {
      updateData.followUpDate = new Date(data.followUpDate)
    }

    // Set response date when status is changed to 'responded' or 'resolved'
    if (data.status === 'responded' || data.status === 'resolved') {
      updateData.responseDate = new Date()
    }

    const submission = await prisma.contactSubmission.update({
      where: { id: params.id },
      data: updateData
    })

    // Send status update notification if status changed significantly
    if (data.status && data.status !== currentSubmission.status) {
      const emailData = {
        fullName: submission.fullName,
        email: submission.email,
        subject: submission.subject,
        message: submission.message,
        submissionId: submission.id
      }

      emailService.sendStatusUpdateNotification(
        emailData, 
        currentSubmission.status, 
        data.status, 
        data.adminNotes
      ).catch(error => {
        console.error('Failed to send status update notification:', error)
      })
    }

    return NextResponse.json({
      success: true,
      submission
    })

  } catch (error) {
    console.error('Contact submission update error:', error)
    
    // Check if record not found
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { error: 'Contact submission not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const submission = await prisma.contactSubmission.findUnique({
      where: { id: params.id }
    })

    if (!submission) {
      return NextResponse.json(
        { error: 'Contact submission not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      submission
    })

  } catch (error) {
    console.error('Contact submission fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.contactSubmission.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Contact submission deleted successfully'
    })

  } catch (error) {
    console.error('Contact submission delete error:', error)
    
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return NextResponse.json(
        { error: 'Contact submission not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}