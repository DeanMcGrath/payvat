"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, AlertTriangle, Lock } from 'lucide-react'

interface AdminRouteProps {
  children: React.ReactNode
  requiredRole?: 'ADMIN' | 'SUPER_ADMIN'
}

interface User {
  id: string
  email: string
  role: string
  businessName: string
}

export default function AdminRoute({ children, requiredRole = 'ADMIN' }: AdminRouteProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    try {
      const response = await fetch('/api/auth/profile')
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.user) {
          setUser(data.user)
          
          // Check if user has required admin role
          const hasAccess = hasAdminRole(data.user.role, requiredRole)
          if (!hasAccess) {
            setError('Insufficient privileges. Admin access required.')
          }
        } else {
          setError('Authentication required')
        }
      } else {
        setError('Authentication required')
      }
    } catch (err) {
      console.error('Admin access check failed:', err)
      setError('Failed to verify admin access')
    } finally {
      setLoading(false)
    }
  }

  const hasAdminRole = (userRole: string, required: string): boolean => {
    const roles = ['USER', 'ADMIN', 'SUPER_ADMIN']
    const userRoleIndex = roles.indexOf(userRole)
    const requiredRoleIndex = roles.indexOf(required)
    
    return userRoleIndex >= requiredRoleIndex && userRoleIndex > 0 // Must be at least ADMIN
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <Shield className="h-5 w-5 text-emerald-600 animate-spin" />
              <span className="text-gray-600">Verifying admin access...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !user || !hasAdminRole(user.role, requiredRole)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <span>Access Denied</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <Lock className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Admin Access Required</p>
                <p className="text-sm text-red-600 mt-1">
                  {error || 'You need administrator privileges to access this page.'}
                </p>
              </div>
            </div>
            
            {!user && (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">Please log in with an admin account</p>
                <Button 
                  onClick={() => window.location.href = '/login'}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  Go to Login
                </Button>
              </div>
            )}
            
            {user && !hasAdminRole(user.role, requiredRole) && (
              <div className="text-center">
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <p className="text-sm text-gray-600">Current Role: <span className="font-medium">{user.role}</span></p>
                  <p className="text-sm text-gray-600">Required: <span className="font-medium">{requiredRole}+</span></p>
                </div>
                <Button 
                  onClick={() => window.location.href = '/dashboard'}
                  variant="outline"
                  className="w-full"
                >
                  Return to Dashboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // User has admin access - render admin interface with user context
  return (
    <div className="admin-context">
      {/* Admin Header Bar */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-2 px-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium">Admin Panel</span>
            <span className="text-xs bg-emerald-500 px-2 py-1 rounded">{user.role}</span>
          </div>
          <div className="text-sm">
            {user.businessName} • {user.email}
          </div>
        </div>
      </div>
      
      {/* Admin Content */}
      {children}
    </div>
  )
}