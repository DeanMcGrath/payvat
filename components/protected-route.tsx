"use client"

import { useState, useEffect } from 'react'
import { useSubscription } from '@/contexts/subscription-context'
import PaywallPopup from './paywall-popup'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiresSubscription?: boolean
  requiresAuth?: boolean
}

export default function ProtectedRoute({ 
  children, 
  requiresSubscription = false, // Changed default to false for free access
  requiresAuth = true 
}: ProtectedRouteProps) {
  const { hasAccess, subscribe, activateFreeTrial } = useSubscription()
  const [showPaywall, setShowPaywall] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  // Check authentication status
  useEffect(() => {
    if (requiresAuth) {
      checkAuthentication()
    } else {
      setAuthLoading(false)
      setIsAuthenticated(true)
    }
  }, [requiresAuth])

  // Check subscription access
  useEffect(() => {
    if (requiresSubscription && !hasAccess && isAuthenticated) {
      setShowPaywall(true)
    }
  }, [requiresSubscription, hasAccess, isAuthenticated])

  const checkAuthentication = async () => {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'GET',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.user) {
          setIsAuthenticated(true)
        } else {
          setAuthError('Authentication failed')
        }
      } else if (response.status === 401) {
        setAuthError('Please log in to continue')
      } else {
        setAuthError('Authentication verification failed')
      }
    } catch (err) {
      setAuthError('Network error occurred')
    } finally {
      setAuthLoading(false)
    }
  }

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
          <span className="text-gray-600">Verifying access...</span>
        </div>
      </div>
    )
  }

  // Show authentication error
  if (authError || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <span className="text-lg font-medium text-red-800">Authentication Required</span>
            </div>
            <p className="text-red-600 text-center mb-4">{authError}</p>
            <div className="flex space-x-2">
              <Button onClick={checkAuthentication} className="flex-1" variant="outline">
                Try Again
              </Button>
              <Button onClick={() => window.location.href = '/login'} className="flex-1">
                Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSubscribe = (plan: 'monthly' | 'annual') => {
    subscribe(plan)
    setShowPaywall(false)
    // In a real app, you would integrate with a payment processor here
    alert(`Successfully subscribed to ${plan} plan!`)
  }

  const handleFreeTrial = () => {
    activateFreeTrial()
    setShowPaywall(false)
    alert('Free trial activated! You now have 2 months of full access.')
  }

  const handleClosePaywall = () => {
    // Don't allow closing if access is required
    if (!requiresSubscription || hasAccess) {
      setShowPaywall(false)
    }
  }

  if (requiresSubscription && !hasAccess && showPaywall) {
    return (
      <>
        <div className="blur-sm pointer-events-none">
          {children}
        </div>
        <PaywallPopup
          isOpen={showPaywall}
          onClose={handleClosePaywall}
          onSubscribe={handleSubscribe}
          onFreeTrial={handleFreeTrial}
        />
      </>
    )
  }

  return <>{children}</>
}
