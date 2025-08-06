"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, FileText, CreditCard, Settings, LogOut, TrendingUp, Calendar, Euro } from 'lucide-react'
import LiveChat from "../../components/live-chat"
import { useSubscription } from "../../contexts/subscription-context"

export default function HomePage() {
  const { hasAccess, subscriptionType, trialEndsAt } = useSubscription()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-800">
              PAY <span className="text-emerald-500">VAT</span>
            </h1>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <h3 className="text-lg font-bold text-emerald-600">Brian Cusack Trading Ltd</h3>
              <p className="text-emerald-600 font-mono text-sm">VAT: IE0352440A</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, Brian</h2>
          <p className="text-gray-600">Here&apos;s your VAT overview for this quarter</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">VAT Due</CardTitle>
              <Euro className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">€12,450.00</div>
              <p className="text-xs text-gray-500 mt-1">Due: 15th Jan 2025</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">This Quarter</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">€45,230.00</div>
              <p className="text-xs text-emerald-600 mt-1">+12% from last quarter</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Next Return</CardTitle>
              <Calendar className="h-4 w-4 text-emerald-500" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white justify-start"
                onClick={() => window.location.href = '/vat-period'}
              >
                <FileText className="h-4 w-4 mr-2" />
                VAT RETURNS
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start border-emerald-200 text-emerald-700 hover:bg-emerald-50"
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
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
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
