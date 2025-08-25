"use client"

import { useState, useEffect } from 'react'
import { X, Bell, CheckCircle, Clock, AlertTriangle, TrendingUp, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface SmartNotification {
  id: string
  type: 'achievement' | 'reminder' | 'social_proof' | 'deadline' | 'tip' | 'upgrade'
  title: string
  message: string
  icon: any
  priority: 'low' | 'medium' | 'high'
  actionText?: string
  actionUrl?: string
  dismissible: boolean
  autoHide?: number // milliseconds
  conditions?: {
    userType?: 'trial' | 'free' | 'paid'
    daysActive?: number
    documentsUploaded?: number
    lastAction?: string
  }
}

interface SmartNotificationsProps {
  userId?: string
  userType: 'trial' | 'free' | 'paid'
  userStats: {
    daysActive: number
    documentsUploaded: number
    vatReturnsCompleted: number
    lastActiveDate: Date
  }
}

export default function SmartNotifications({
  userId,
  userType,
  userStats
}: SmartNotificationsProps) {
  const [notifications, setNotifications] = useState<SmartNotification[]>([])
  const [visibleNotifications, setVisibleNotifications] = useState<SmartNotification[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  // All possible notifications
  const allNotifications: SmartNotification[] = [
    {
      id: 'welcome_achievement',
      type: 'achievement',
      title: '🎉 Welcome to PayVAT!',
      message: 'You\'ve joined 1,000+ Irish businesses automating their VAT.',
      icon: CheckCircle,
      priority: 'medium',
      dismissible: true,
      autoHide: 8000,
      conditions: { daysActive: 0, documentsUploaded: 0 }
    },
    {
      id: 'first_document_uploaded',
      type: 'achievement',
      title: '📄 First Document Processed!',
      message: 'Great start! Our AI extracted VAT data in seconds.',
      icon: CheckCircle,
      priority: 'medium',
      dismissible: true,
      autoHide: 6000,
      conditions: { documentsUploaded: 1 }
    },
    {
      id: 'social_proof_recent',
      type: 'social_proof',
      title: '👥 5 businesses upgraded today',
      message: 'Join others automating their VAT submissions this week.',
      icon: Users,
      priority: 'low',
      actionText: 'See Plans',
      actionUrl: '/pricing',
      dismissible: true,
      conditions: { userType: 'trial', daysActive: 3 }
    },
    {
      id: 'vat_deadline_reminder',
      type: 'deadline',
      title: '⏰ VAT Deadline Approaching',
      message: 'Your next VAT return is due in 5 days. Documents ready?',
      icon: Clock,
      priority: 'high',
      actionText: 'Check Status',
      actionUrl: '/dashboard/vat-returns',
      dismissible: false,
      conditions: { documentsUploaded: 1 }
    },
    {
      id: 'trial_expiry_warning',
      type: 'reminder',
      title: '⚡ Trial Expires Tomorrow',
      message: 'Upgrade now to keep your VAT automation active.',
      icon: AlertTriangle,
      priority: 'high',
      actionText: 'Upgrade Now',
      actionUrl: '/pricing?source=trial_warning',
      dismissible: false,
      conditions: { userType: 'trial', daysActive: 13 }
    },
    {
      id: 'productivity_tip',
      type: 'tip',
      title: '💡 Pro Tip: Bulk Upload',
      message: 'Upload multiple documents at once for faster processing.',
      icon: TrendingUp,
      priority: 'low',
      dismissible: true,
      autoHide: 10000,
      conditions: { documentsUploaded: 5 }
    },
    {
      id: 'upgrade_suggestion',
      type: 'upgrade',
      title: '🚀 Ready for Unlimited Processing?',
      message: 'You\'ve processed 8 documents. Upgrade for unlimited access.',
      icon: TrendingUp,
      priority: 'medium',
      actionText: 'View Plans',
      actionUrl: '/pricing?source=usage_limit',
      dismissible: true,
      conditions: { userType: 'free', documentsUploaded: 8 }
    },
    {
      id: 'achievement_power_user',
      type: 'achievement',
      title: '🏆 Power User Achievement!',
      message: 'You\'ve completed 3 VAT returns. You\'re a VAT pro!',
      icon: CheckCircle,
      priority: 'medium',
      dismissible: true,
      autoHide: 8000,
      conditions: { userType: 'paid' }
    }
  ]

  // Load dismissed notifications from storage
  useEffect(() => {
    if (userId) {
      const savedDismissed = localStorage.getItem(`dismissed_notifications_${userId}`)
      if (savedDismissed) {
        setDismissed(new Set(JSON.parse(savedDismissed)))
      }
    }
  }, [userId])

  // Filter and prioritize notifications based on user conditions
  useEffect(() => {
    const now = new Date()
    const relevantNotifications = allNotifications.filter(notification => {
      // Skip dismissed notifications
      if (dismissed.has(notification.id)) return false

      // Check conditions
      if (notification.conditions) {
        const { userType: requiredUserType, daysActive, documentsUploaded, lastAction } = notification.conditions

        if (requiredUserType && requiredUserType !== userType) return false
        if (daysActive !== undefined && userStats.daysActive < daysActive) return false
        if (documentsUploaded !== undefined && userStats.documentsUploaded < documentsUploaded) return false
      }

      return true
    })

    // Sort by priority (high -> medium -> low)
    const sortedNotifications = relevantNotifications.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })

    // Limit to 3 notifications at a time
    setNotifications(sortedNotifications.slice(0, 3))
  }, [userType, userStats, dismissed])

  // Manage visible notifications (show one at a time for better UX)
  useEffect(() => {
    if (notifications.length > 0) {
      // Show highest priority notification first
      const nextNotification = notifications.find(n => !visibleNotifications.includes(n))
      
      if (nextNotification && visibleNotifications.length === 0) {
        setVisibleNotifications([nextNotification])

        // Auto-hide if specified
        if (nextNotification.autoHide) {
          setTimeout(() => {
            dismissNotification(nextNotification.id)
          }, nextNotification.autoHide)
        }
      }
    }
  }, [notifications, visibleNotifications])

  const dismissNotification = (notificationId: string) => {
    const newDismissed = new Set([...dismissed, notificationId])
    setDismissed(newDismissed)
    setVisibleNotifications(prev => prev.filter(n => n.id !== notificationId))

    // Save to localStorage
    if (userId) {
      localStorage.setItem(`dismissed_notifications_${userId}`, JSON.stringify([...newDismissed]))
    }

    // Track dismissal
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'notification_dismissed', {
        notification_id: notificationId,
        notification_type: notifications.find(n => n.id === notificationId)?.type
      })
    }
  }

  const handleAction = (notification: SmartNotification) => {
    // Track click
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'notification_clicked', {
        notification_id: notification.id,
        notification_type: notification.type,
        action_url: notification.actionUrl
      })
    }

    if (notification.actionUrl) {
      window.location.href = notification.actionUrl
    }

    dismissNotification(notification.id)
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'achievement': return 'border-green-200 bg-green-50'
      case 'deadline': return 'border-red-200 bg-red-50'
      case 'reminder': return 'border-orange-200 bg-orange-50'
      case 'social_proof': return 'border-blue-200 bg-blue-50'
      case 'tip': return 'border-purple-200 bg-purple-50'
      case 'upgrade': return 'border-indigo-200 bg-indigo-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  if (visibleNotifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {visibleNotifications.map((notification) => (
        <Card 
          key={notification.id}
          className={`${getNotificationColor(notification.type)} border-l-4 shadow-lg animate-in slide-in-from-right duration-500`}
        >
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <notification.icon className="h-5 w-5 mt-0.5 flex-shrink-0 text-gray-600" />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">
                    {notification.title}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        notification.priority === 'high' ? 'border-red-300 text-red-700' :
                        notification.priority === 'medium' ? 'border-orange-300 text-orange-700' :
                        'border-gray-300 text-gray-600'
                      }`}
                    >
                      {notification.priority}
                    </Badge>
                    {notification.dismissible && (
                      <button
                        onClick={() => dismissNotification(notification.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 mb-3">
                  {notification.message}
                </p>
                
                {notification.actionText && (
                  <Button
                    onClick={() => handleAction(notification)}
                    size="sm"
                    className="text-xs"
                  >
                    {notification.actionText}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Hook for managing notification triggers
export function useSmartNotifications(userId?: string) {
  const triggerNotification = (notificationId: string) => {
    // This would be called when specific user actions occur
    console.log(`Triggering notification: ${notificationId}`)
    
    // You could dispatch custom events or update state here
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('smart-notification', {
        detail: { notificationId }
      }))
    }
  }

  return { triggerNotification }
}