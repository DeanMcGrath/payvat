"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to documents page by default
    router.replace('/dashboard/documents')
  }, [router])

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
      <div className="flex items-center space-x-2">
        <Loader2 className="h-6 w-6 animate-spin text-brand-300" />
        <span className="body-md text-neutral-600">Loading dashboard...</span>
      </div>
    </div>
  )
}