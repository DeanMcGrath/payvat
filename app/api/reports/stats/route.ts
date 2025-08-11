import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get user email from cookies (simple auth check)
    const cookieStore = await cookies()
    const userEmail = cookieStore.get('user-email')?.value
    
    if (!userEmail) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication required' 
      }, { status: 401 })
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: {
        email: userEmail
      }
    })

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 })
    }

    const currentYear = new Date().getFullYear()

    // Get user's VAT submissions for current year
    const submissions = await prisma.vATReturn.findMany({
      where: {
        userId: user.id,
        createdAt: {
          gte: new Date(`${currentYear}-01-01`),
          lt: new Date(`${currentYear + 1}-01-01`)
        }
      },
      select: {
        salesVAT: true,
        purchaseVAT: true,
        netVAT: true,
        status: true,
        submittedAt: true,
        dueDate: true
      }
    })

    // Calculate statistics
    const totalVATPayments = submissions.reduce((sum, sub) => sum + Number(sub.netVAT || 0), 0)
    const returnsFiled = submissions.filter(sub => sub.status === 'SUBMITTED').length
    const averageVATPerReturn = returnsFiled > 0 ? totalVATPayments / returnsFiled : 0

    // Calculate on-time payment rate
    const submittedOnTime = submissions.filter(sub => 
      sub.submittedAt && sub.dueDate && sub.submittedAt <= sub.dueDate
    ).length
    const onTimePaymentRate = returnsFiled > 0 ? Math.round((submittedOnTime / returnsFiled) * 100) : 100

    const stats = {
      totalVATPayments,
      returnsFiled,
      averageVATPerReturn,
      onTimePaymentRate,
      currentYear
    }

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch user statistics' 
    }, { status: 500 })
  }
}