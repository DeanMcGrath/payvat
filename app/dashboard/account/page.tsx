"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Building, 
  CreditCard, 
  Bell, 
  Edit, 
  Save, 
  X, 
  Loader2,
  Check,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  Calendar
} from "lucide-react"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/vatUtils"

interface UserProfile {
  id: string
  email: string
  businessName: string
  vatNumber: string
  firstName?: string
  lastName?: string
  phone?: string
  address?: string
  createdAt: string
  lastLoginAt?: string
}

interface Message {
  id: string
  title: string
  content: string
  type: 'info' | 'warning' | 'success' | 'error'
  createdAt: string
  read: boolean
}

interface Billing {
  subscriptionStatus: string
  planType: string
  nextBillingDate?: string
  amount?: number
  paymentHistory: Array<{
    id: string
    date: string
    amount: number
    status: string
    description: string
  }>
}

export default function AccountPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [billing, setBilling] = useState<Billing | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileData, setProfileData] = useState<Partial<UserProfile>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadAccountData()
  }, [])

  const loadAccountData = async () => {
    try {
      setLoading(true)

      // Load user profile
      const profileResponse = await fetch('/api/auth/profile')
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        if (profileData.success) {
          setUser(profileData.user)
          setProfileData(profileData.user)
        }
      }

      // Mock messages data - you can replace with real API call
      setMessages([
        {
          id: '1',
          title: 'VAT Return Due Soon',
          content: 'Your VAT return for Q4 2024 is due on January 19, 2025. Ensure all documents are uploaded.',
          type: 'warning',
          createdAt: '2024-12-15T10:00:00Z',
          read: false
        },
        {
          id: '2', 
          title: 'Welcome to Don\'t Be Like Me!',
          content: 'Thank you for joining our VAT management platform. Get started by uploading your documents.',
          type: 'info',
          createdAt: '2024-12-01T09:00:00Z',
          read: true
        }
      ])

      // Mock billing data - you can replace with real API call
      setBilling({
        subscriptionStatus: 'active',
        planType: 'Professional',
        nextBillingDate: '2025-01-15',
        amount: 49.99,
        paymentHistory: [
          {
            id: '1',
            date: '2024-12-15',
            amount: 49.99,
            status: 'paid',
            description: 'Monthly subscription - Professional Plan'
          },
          {
            id: '2',
            date: '2024-11-15', 
            amount: 49.99,
            status: 'paid',
            description: 'Monthly subscription - Professional Plan'
          }
        ]
      })

    } catch (error) {
      console.error('Failed to load account data:', error)
      toast.error('Failed to load account information')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      setSaving(true)
      
      const response = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      })

      if (response.ok) {
        const updatedData = await response.json()
        if (updatedData.success) {
          setUser(updatedData.user)
          setEditingProfile(false)
          toast.success('Profile updated successfully')
        }
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const markMessageAsRead = async (messageId: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, read: true } : msg
      )
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-brand-300" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Account Info Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-petrol-dark">
            <User className="h-5 w-5" />
            Account Information
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingProfile(!editingProfile)}
              className="ml-auto"
            >
              {editingProfile ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={profileData.firstName || ''}
                onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                disabled={!editingProfile}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={profileData.lastName || ''}
                onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                disabled={!editingProfile}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email || ''}
                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                disabled={!editingProfile}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={profileData.phone || ''}
                onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                disabled={!editingProfile}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={profileData.address || ''}
                onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                disabled={!editingProfile}
              />
            </div>
          </div>

          {editingProfile && (
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveProfile} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => {
                setEditingProfile(false)
                setProfileData(user || {})
              }}>
                Cancel
              </Button>
            </div>
          )}

          {user && (
            <div className="flex flex-wrap gap-4 pt-4 border-t text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </div>
              {user.lastLoginAt && (
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  Last login {new Date(user.lastLoginAt).toLocaleDateString()}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Business Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-petrol-dark">
            <Building className="h-5 w-5" />
            Business Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Business Name</Label>
              <div className="p-3 bg-gray-50 rounded-md text-sm">
                {user?.businessName || 'Not provided'}
              </div>
            </div>
            <div className="space-y-2">
              <Label>VAT Number</Label>
              <div className="p-3 bg-gray-50 rounded-md text-sm">
                {user?.vatNumber || 'Not registered'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing Section */}
      {billing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-petrol-dark">
              <CreditCard className="h-5 w-5" />
              Billing & Subscription
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-normal">{billing.planType} Plan</div>
                <div className="text-sm text-gray-600">
                  Status: <Badge variant={billing.subscriptionStatus === 'active' ? 'default' : 'secondary'}>
                    {billing.subscriptionStatus}
                  </Badge>
                </div>
              </div>
              {billing.amount && (
                <div className="text-right">
                  <div className="font-normal">{formatCurrency(billing.amount)}/month</div>
                  {billing.nextBillingDate && (
                    <div className="text-sm text-gray-600">
                      Next billing: {new Date(billing.nextBillingDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-normal mb-3">Recent Payments</h4>
              <div className="space-y-2">
                {billing.paymentHistory.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <div className="font-normal text-sm">{payment.description}</div>
                      <div className="text-xs text-gray-600">
                        {new Date(payment.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-normal">{formatCurrency(payment.amount)}</div>
                      <Badge variant={payment.status === 'paid' ? 'default' : 'secondary'}>
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Messages Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-petrol-dark">
            <Bell className="h-5 w-5" />
            Messages & Alerts
            {messages.filter(msg => !msg.read).length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {messages.filter(msg => !msg.read).length} new
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {messages.length > 0 ? (
            messages.map((message) => (
              <div
                key={message.id}
                className={`p-4 rounded-lg border ${
                  message.read ? 'bg-gray-50' : 'bg-blue-50 border-petrol-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {message.type === 'warning' && <AlertCircle className="h-4 w-4 text-yellow-600" />}
                      {message.type === 'info' && <Bell className="h-4 w-4 text-petrol-base" />}
                      {message.type === 'success' && <Check className="h-4 w-4 text-green-600" />}
                      {message.type === 'error' && <X className="h-4 w-4 text-red-600" />}
                      <h4 className="font-normal text-sm">{message.title}</h4>
                      {!message.read && (
                        <Badge variant="secondary" className="text-xs">New</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{message.content}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(message.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!message.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markMessageAsRead(message.id)}
                    >
                      Mark as read
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No messages at this time</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}