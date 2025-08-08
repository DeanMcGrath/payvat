"use client"

import { useState, useEffect, useCallback } from 'react'
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
  const [isReady, setIsReady] = useState(false)
  const [timeoutReached, setTimeoutReached] = useState(false)

  const checkAdminAccess = useCallback(async () => {
    console.log('[AdminRoute] Starting admin access check...')
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        controller.abort()
        console.log('[AdminRoute] Request timeout after 10 seconds')
      }, 10000)
      
      const response = await fetch('/api/auth/profile', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      console.log(`[AdminRoute] Auth API responded: ${response.status}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.user) {
          console.log(`[AdminRoute] User authenticated: ${data.user.email} (${data.user.role})`)
          setUser(data.user)
          
          // Check if user has required admin role
          const hasAccess = hasAdminRole(data.user.role, requiredRole)
          if (!hasAccess) {
            console.log(`[AdminRoute] Insufficient role: ${data.user.role} < ${requiredRole}`)
            setError('Insufficient privileges. Admin access required.')
          } else {
            console.log('[AdminRoute] Admin access granted')
          }
        } else {
          console.log('[AdminRoute] Invalid response data')
          setError('Authentication failed. Please log in.')
        }
      } else if (response.status === 401) {
        console.log('[AdminRoute] 401 - Redirecting to login immediately')
        // Immediate redirect for 401 - don't wait
        window.location.href = '/login'
        return // Don't set error, just redirect
      } else if (response.status === 403) {
        console.log('[AdminRoute] 403 - Access forbidden')
        setError('Access forbidden. Admin privileges required. Try admin setup if this is the first time.')
      } else {
        console.log(`[AdminRoute] Unexpected status: ${response.status}`)
        setError(`Authentication error (${response.status}). Please try again.`)
      }
    } catch (err) {
      console.error('[AdminRoute] Admin access check failed:', err)
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('[AdminRoute] Request was aborted due to timeout')
        setTimeoutReached(true)
        setError('Authentication check timed out. Please try refreshing the page or check your connection.')
      } else if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Network connection failed. Please check your internet connection.')
      } else {
        setError('Failed to verify admin access')
      }
    } finally {
      setLoading(false)
    }
  }, [requiredRole])

  useEffect(() => {
    console.log('[AdminRoute] Component mounted, checking admin access...')
    checkAdminAccess()
    
    // Absolute safety timeout - if still loading after 30 seconds, force error state
    const safetyTimeout = setTimeout(() => {
      if (loading) {
        console.error('[AdminRoute] SAFETY TIMEOUT: Still loading after 30 seconds')
        setTimeoutReached(true)
        setLoading(false)
        setError('Authentication check took too long. Please refresh the page.')
      }
    }, 30000)
    
    return () => clearTimeout(safetyTimeout)
  }, [checkAdminAccess])

  // Handle admin panel readiness (ensure auth state is settled)
  useEffect(() => {
    if (user && hasAdminRole(user.role, requiredRole) && !loading && !error) {
      // Small delay to ensure auth state is fully settled before rendering children
      const timer = setTimeout(() => setIsReady(true), 100)
      return () => clearTimeout(timer)
    } else {
      setIsReady(false)
    }
  }, [user, requiredRole, loading, error])

  const hasAdminRole = (userRole: string, required: string): boolean => {
    const roles = ['USER', 'ADMIN', 'SUPER_ADMIN']
    const userRoleIndex = roles.indexOf(userRole)
    const requiredRoleIndex = roles.indexOf(required)
    
    return userRoleIndex >= requiredRoleIndex && userRoleIndex > 0 // Must be at least ADMIN
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-teal-600 animate-spin" />
                <span className="text-gray-600">
                  {timeoutReached ? 'Connection taking longer than expected...' : 'Verifying admin access...'}
                </span>
              </div>
              {timeoutReached && (
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-500">This is taking too long</p>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      onClick={() => window.location.reload()}
                      variant="outline"
                    >
                      Refresh Page
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => window.location.href = '/login'}
                    >
                      Go to Login
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !user || (user && !hasAdminRole(user.role, requiredRole))) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
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
                  className="bg-teal-500 hover:bg-teal-600 text-white"
                >
                  Go to Login
                </Button>
              </div>
            )}
            
            {user && !hasAdminRole(user.role, requiredRole) && (
              <div className="text-center">
                <div className="bg-gray-100 rounded-lg p-3 mb-3">
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
  // Check if admin panel is ready (defensive loading state)
  if (user && hasAdminRole(user.role, requiredRole) && !isReady) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <Shield className="h-5 w-5 text-teal-600 animate-spin" />
              <span className="text-gray-600">Initializing admin panel...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="admin-context">
      {/* Admin Header Bar */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-2 px-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium">Admin Panel</span>
            <span className="text-xs bg-teal-500 px-2 py-1 rounded">{user.role}</span>
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