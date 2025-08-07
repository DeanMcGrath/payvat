"use client"

import { useState, useEffect } from 'react'
import { useSubscription } from '@/contexts/subscription-context'
import PaywallPopup from './paywall-popup'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiresSubscription?: boolean
}

export default function ProtectedRoute({ children, requiresSubscription = true }: ProtectedRouteProps) {
  const { hasAccess, subscribe, activateFreeTrial } = useSubscription()
  const [showPaywall, setShowPaywall] = useState(false)

  useEffect(() => {
    if (requiresSubscription && !hasAccess) {
      setShowPaywall(true)
    }
  }, [requiresSubscription, hasAccess])

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
