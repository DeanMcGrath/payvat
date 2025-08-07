"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface SubscriptionContextType {
  isSubscribed: boolean
  subscriptionType: 'monthly' | 'annual' | 'trial' | null
  trialEndsAt: Date | null
  hasAccess: boolean
  subscribe: (plan: 'monthly' | 'annual') => void
  activateFreeTrial: () => void
  checkAccess: () => boolean
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [subscriptionType, setSubscriptionType] = useState<'monthly' | 'annual' | 'trial' | null>(null)
  const [trialEndsAt, setTrialEndsAt] = useState<Date | null>(null)

  // Load subscription status from localStorage on mount
  useEffect(() => {
    const savedSubscription = localStorage.getItem('vat-subscription')
    const savedTrialEnd = localStorage.getItem('vat-trial-end')
    
    if (savedSubscription) {
      const subscription = JSON.parse(savedSubscription)
      setIsSubscribed(subscription.isSubscribed)
      setSubscriptionType(subscription.type)
    }
    
    if (savedTrialEnd) {
      setTrialEndsAt(new Date(savedTrialEnd))
    }
  }, [])

  const hasAccess = () => {
    // For now, give everyone free access to the platform
    return true
    // Original logic (commented out for free access):
    // if (isSubscribed) return true
    // if (trialEndsAt && new Date() < trialEndsAt) return true
    // return false
  }

  const subscribe = (plan: 'monthly' | 'annual') => {
    setIsSubscribed(true)
    setSubscriptionType(plan)
    setTrialEndsAt(null)
    
    // Save to localStorage
    localStorage.setItem('vat-subscription', JSON.stringify({
      isSubscribed: true,
      type: plan
    }))
    localStorage.removeItem('vat-trial-end')
  }

  const activateFreeTrial = () => {
    const trialEnd = new Date()
    trialEnd.setMonth(trialEnd.getMonth() + 2) // 2 months from now
    
    setSubscriptionType('trial')
    setTrialEndsAt(trialEnd)
    
    // Save to localStorage
    localStorage.setItem('vat-trial-end', trialEnd.toISOString())
    localStorage.setItem('vat-subscription', JSON.stringify({
      isSubscribed: false,
      type: 'trial'
    }))
  }

  const checkAccess = () => hasAccess()

  return (
    <SubscriptionContext.Provider value={{
      isSubscribed,
      subscriptionType,
      trialEndsAt,
      hasAccess: hasAccess(),
      subscribe,
      activateFreeTrial,
      checkAccess
    }}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}
