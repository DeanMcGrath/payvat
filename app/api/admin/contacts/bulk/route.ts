import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

interface BulkUpdateData {
  action: 'update_status' | 'update_priority' | 'assign' | 'delete'
  ids: string[]
  status?: string
  priority?: string
  assignedTo?: string
}

export async function POST(request: NextRequest) {
  try {
    const data: BulkUpdateData = await request.json()
    
    if (!data.action || !data.ids || data.ids.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: action and ids' },
        { status: 400 }
      )
    }

    // Validate action types
    const validActions = ['update_status', 'update_priority', 'assign', 'delete']
    if (!validActions.includes(data.action)) {
      return NextResponse.json(
        { error: 'Invalid action type' },
        { status: 400 }
      )
    }

    let result;

    switch (data.action) {
      case 'update_status':
        if (!data.status) {
          return NextResponse.json(
            { error: 'Status is required for status update' },
            { status: 400 }
          )
        }

        const validStatuses = ['new', 'read', 'in_progress', 'responded', 'resolved']
        if (!validStatuses.includes(data.status)) {
          return NextResponse.json(
            { error: 'Invalid status value' },
            { status: 400 }
          )
        }

        const statusUpdate: any = { 
          status: data.status,
          updatedAt: new Date()
        }

        // Set response date for completed statuses
        if (data.status === 'responded' || data.status === 'resolved') {
          statusUpdate.responseDate = new Date()
        }

        result = await prisma.contactSubmission.updateMany({
          where: { id: { in: data.ids } },
          data: statusUpdate
        })
        break

      case 'update_priority':
        if (!data.priority) {
          return NextResponse.json(
            { error: 'Priority is required for priority update' },
            { status: 400 }
          )
        }

        const validPriorities = ['low', 'normal', 'high', 'urgent']
        if (!validPriorities.includes(data.priority)) {
          return NextResponse.json(
            { error: 'Invalid priority value' },
            { status: 400 }
          )
        }

        result = await prisma.contactSubmission.updateMany({
          where: { id: { in: data.ids } },
          data: { 
            priority: data.priority,
            updatedAt: new Date()
          }
        })
        break

      case 'assign':
        if (!data.assignedTo) {
          return NextResponse.json(
            { error: 'AssignedTo is required for assignment' },
            { status: 400 }
          )
        }

        result = await prisma.contactSubmission.updateMany({
          where: { id: { in: data.ids } },
          data: { 
            assignedTo: data.assignedTo,
            status: 'in_progress', // Auto-update status when assigning
            updatedAt: new Date()
          }
        })
        break

      case 'delete':
        result = await prisma.contactSubmission.deleteMany({
          where: { id: { in: data.ids } }
        })
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action type' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${result.count} submissions`,
      affected: result.count
    })

  } catch (error) {
    console.error('Bulk operation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const assignedTo = searchParams.get('assignedTo')
    const tags = searchParams.get('tags')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    // Build filter conditions
    const where: any = {}

    if (status && status !== 'all') {
      where.status = status
    }

    if (priority && priority !== 'all') {
      where.priority = priority
    }

    if (assignedTo && assignedTo !== 'all') {
      where.assignedTo = assignedTo
    }

    if (tags) {
      where.tags = { hasSome: tags.split(',') }
    }

    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom)
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo)
      }
    }

    const submissions = await prisma.contactSubmission.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    // Get summary statistics
    const stats = await prisma.contactSubmission.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    })

    const priorityStats = await prisma.contactSubmission.groupBy({
      by: ['priority'],
      _count: {
        id: true
      }
    })

    return NextResponse.json({
      success: true,
      submissions,
      stats: {
        byStatus: stats,
        byPriority: priorityStats,
        total: submissions.length
      }
    })

  } catch (error) {
    console.error('Bulk fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}