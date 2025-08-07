"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, FileText, CreditCard, Settings, LogOut, TrendingUp, Calendar, Euro, AlertCircle, Loader2 } from 'lucide-react'
import LiveChat from "./components/live-chat"
import { useSubscription } from "./contexts/subscription-context"

interface UserProfile {
  id: string
  email: string
  businessName: string
  vatNumber: string
  firstName?: string
  lastName?: string
}

export default function HomePage() {
  const { hasAccess, subscriptionType, trialEndsAt } = useSubscription()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'GET',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.user) {
          setUser(data.user)
        } else {
          setError('Failed to load user profile')
        }
      } else if (response.status === 401) {
        // User not authenticated, redirect to login
        window.location.href = '/login'
      } else {
        setError('Failed to fetch user profile')
      }
    } catch (err) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      // Always redirect to login after logout attempt
      window.location.href = '/login'
    } catch (err) {
      // Even if logout fails, redirect to login
      window.location.href = '/login'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-teal-700" />
          <span className="text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="w-full max-w-md border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <span className="text-lg font-medium text-red-800">Error Loading Dashboard</span>
            </div>
            <p className="text-red-600 text-center mb-4">{error}</p>
            <div className="flex space-x-2">
              <Button onClick={fetchUserProfile} className="flex-1">
                Try Again
              </Button>
              <Button onClick={() => window.location.href = '/login'} variant="outline" className="flex-1">
                Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-thin text-gray-800">
              PAY <span className="text-teal-700">VAT</span>
            </h1>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <h3 className="text-lg font-bold text-teal-700">{user.businessName}</h3>
              <p className="text-teal-700 font-mono text-sm">VAT: {user.vatNumber}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout} title="Logout">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 md:p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.firstName || user.businessName.split(' ')[0] || 'User'}
          </h2>
          <p className="text-gray-600">Here's your VAT overview for this quarter</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">VAT Due</CardTitle>
              <Euro className="h-4 w-4 text-teal-700" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">€12,450.00</div>
              <p className="text-xs text-gray-500 mt-1">Due: 15th Jan 2025</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">This Quarter</CardTitle>
              <TrendingUp className="h-4 w-4 text-teal-700" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">€45,230.00</div>
              <p className="text-xs text-teal-700 mt-1">+12% from last quarter</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Next Return</CardTitle>
              <Calendar className="h-4 w-4 text-teal-700" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">15 days</div>
              <p className="text-xs text-gray-500 mt-1">Q4 2024 Return</p>
            </CardContent>
          </Card>
        </div>

        {/* Subscription Status */}
        {subscriptionType === 'trial' && trialEndsAt && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <Bell className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-900">Free Trial Active</h3>
                    <p className="text-sm text-amber-700">
                      Your trial expires on {trialEndsAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                  Upgrade Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full bg-teal-600 hover:bg-teal-600 text-white justify-start"
                onClick={() => window.location.href = '/vat-period'}
              >
                <FileText className="h-4 w-4 mr-2" />
                VAT RETURNS
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start border-teal-200 text-teal-700 hover:bg-teal-50"
                onClick={() => window.location.href = '/payment'}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Make Payment
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/reports'}>
                <TrendingUp className="h-4 w-4 mr-2" />
                View Reports
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Payment processed</p>
                  <p className="text-xs text-gray-500">€8,450.00 - 2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">VAT return submitted</p>
                  <p className="text-xs text-gray-500">Q3 2024 - 3 days ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Account updated</p>
                  <p className="text-xs text-gray-500">Profile settings - 1 week ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Live Chat */}
      <LiveChat />

      {/* Footer */}
      <footer className="mt-8 py-6 text-center border-t border-gray-200">
        <p className="text-gray-500 text-sm">payvat.ie</p>
      </footer>
    </div>
  )
}
