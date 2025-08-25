import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import AIPerformanceDashboard from '@/components/admin/AIPerformanceDashboard'

export const metadata: Metadata = {
  title: 'AI Performance Dashboard | PayVAT.ie Admin',
  description: 'Real-time monitoring and analytics for AI document processing system'
}

export default async function AIPerformancePage() {
  const user = await getCurrentUser()

  // Check if user is admin
  if (!user || user.role !== 'ADMIN') {
    redirect('/auth/signin?callbackUrl=/admin/ai-performance')
  }

  return (
    <div className="container mx-auto p-6">
      <AIPerformanceDashboard />
    </div>
  )
}