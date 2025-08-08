"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
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
  const mountedRef = useRef(true)

  // Safe timeout with Promise.race (browser compatible)
  const fetchWithTimeout = useCallback(async (url: string, options: RequestInit = {}, timeoutMs = 15000) => {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    })
    
    return Promise.race([
      fetch(url, options),
      timeoutPromise
    ])
  }, [])

  const checkAdminAccess = useCallback(async () => {
    if (!mountedRef.current) return
    
    console.log('[AdminRoute] Checking admin access...')
    
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetchWithTimeout('/api/auth/profile', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      
      if (!mountedRef.current) return
      
      console.log(`[AdminRoute] Auth API response: ${response.status}`)
      
      if (response.ok) {
        const data = await response.json()
        
        if (!mountedRef.current) return
        
        if (data.success && data.user) {
          console.log(`[AdminRoute] User authenticated: ${data.user.email} (${data.user.role})`)
          setUser(data.user)
          
          const hasAccess = hasAdminRole(data.user.role, requiredRole)
          if (!hasAccess) {
            console.log(`[AdminRoute] Insufficient role: ${data.user.role} < ${requiredRole}`)
            setError('Insufficient privileges. Admin access required.')
          }
        } else {
          console.log('[AdminRoute] Invalid response data')
          setError('Authentication failed. Please log in.')
        }
      } else if (response.status === 401) {
        console.log('[AdminRoute] 401 - Redirecting to login')
        // For 401, redirect immediately
        window.location.href = '/login'
        return // Don't set loading to false, we're redirecting
      } else if (response.status === 403) {
        console.log('[AdminRoute] 403 - Access forbidden')
        setError('Access forbidden. Admin privileges required.')
      } else {
        console.log(`[AdminRoute] Unexpected status: ${response.status}`)
        setError(`Authentication error (${response.status}). Please try again.`)
      }
    } catch (err) {
      if (!mountedRef.current) return
      
      console.error('[AdminRoute] Auth check failed:', err)
      
      if (err instanceof Error) {
        if (err.message === 'Request timeout') {
          setError('Authentication check timed out. Please refresh the page.')
        } else if (err.message.includes('fetch')) {
          setError('Network connection failed. Please check your connection.')
        } else {
          setError('Failed to verify admin access. Please try again.')
        }
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [requiredRole, fetchWithTimeout])

  useEffect(() => {
    mountedRef.current = true
    console.log('[AdminRoute] Component mounted')
    
    // Start the auth check
    checkAdminAccess()
    
    // Cleanup function
    return () => {
      console.log('[AdminRoute] Component unmounting')
      mountedRef.current = false
    }
  }, [checkAdminAccess])

  // Handle ready state
  useEffect(() => {
    if (!loading && !error && user && hasAdminRole(user.role, requiredRole)) {
      // Small delay to ensure state is settled
      const timer = setTimeout(() => {
        if (mountedRef.current) {
          setIsReady(true)
        }
      }, 100)
      
      return () => clearTimeout(timer)
    } else {
      setIsReady(false)
    }
  }, [user, requiredRole, loading, error])

  const hasAdminRole = (userRole: string, required: string): boolean => {
    const roles = ['USER', 'ADMIN', 'SUPER_ADMIN']
    const userRoleIndex = roles.indexOf(userRole)
    const requiredRoleIndex = roles.indexOf(required)
    
    return userRoleIndex >= requiredRoleIndex && userRoleIndex > 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <Shield className="h-5 w-5 text-teal-600 animate-spin" />
              <span className="text-gray-600">Verifying admin access...</span>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">This should only take a few seconds</p>
              <div className="mt-3">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => window.location.href = '/login'}
                >
                  Go to Login
                </Button>
              </div>
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
            
            <div className="text-center">
              <Button 
                onClick={checkAdminAccess}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                {loading ? 'Checking...' : 'Try Again'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Wait for ready state
  if (!isReady) {
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