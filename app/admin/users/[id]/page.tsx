'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AdminRoute from '@/components/admin-route'
import { ErrorBoundary } from '@/components/error-boundary'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ChevronLeft,
  Mail,
  Building,
  CreditCard,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Phone,
  MapPin,
  Calendar,
  Download,
  Eye,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'

interface UserDetail {
  id: string
  email: string
  role: string
  businessName: string
  vatNumber: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  address: string | null
  emailVerified: boolean
  lastLoginAt: Date | null
  createdAt: Date
  updatedAt: Date
  documents: Document[]
  vatReturns: VATReturn[]
  payments: Payment[]
  chatSessions: ChatSession[]
  stats: {
    totalVATReturns: number
    totalDocuments: number
    totalPayments: number
    totalVATPaid: number
    pendingPayments: number
  }
}

interface Document {
  id: string
  fileName: string
  originalName: string
  fileSize: number
  mimeType: string
  documentType: string
  category: string
  isScanned: boolean
  scanResult: string | null
  uploadedAt: Date
  vatReturnId: string | null
}

interface VATReturn {
  id: string
  periodStart: Date
  periodEnd: Date
  dueDate: Date
  salesVAT: number
  purchaseVAT: number
  netVAT: number
  status: string
  submittedAt: Date | null
  paidAt: Date | null
  revenueRefNumber: string | null
  createdAt: Date
  updatedAt: Date
}

interface Payment {
  id: string
  vatReturnId: string
  amount: number
  currency: string
  status: string
  paymentMethod: string | null
  stripePaymentId: string | null
  processedAt: Date | null
  failedAt: Date | null
  failureReason: string | null
  receiptNumber: string | null
  receiptUrl: string | null
  createdAt: Date
  updatedAt: Date
}

interface ChatSession {
  id: string
  sessionId: string
  isActive: boolean
  isResolved: boolean
  resolvedAt: Date | null
  userEmail: string | null
  userName: string | null
  userCompany: string | null
  createdAt: Date
  lastMessageAt: Date
  messageCount: number
}

export default function AdminUserDetail() {
  return (
    <AdminRoute requiredRole="ADMIN">
      <ErrorBoundary>
        <AdminUserDetailContent />
      </ErrorBoundary>
    </AdminRoute>
  )
}

function AdminUserDetailContent() {
  const params = useParams()
  const router = useRouter()
  const userId = params?.id as string
  
  const [user, setUser] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          if (response.status === 401) {
            setError('Authentication required. Redirecting to login...')
            setTimeout(() => {
              window.location.href = '/login'
            }, 2000)
            return
          } else if (response.status === 403) {
            setError('Admin access required.')
            return
          } else if (response.status === 404) {
            setError('User not found.')
            return
          }
          throw new Error(`Server responded with ${response.status}`)
        }
        
        const data = await response.json()
        
        if (!data.success || !data.user) {
          throw new Error('Invalid response format from server')
        }
        
        setUser(data.user)
      } catch (err) {
        console.error('User fetch error:', err)
        if (err instanceof TypeError && err.message.includes('fetch')) {
          setError('Network error. Please check your connection and try again.')
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load user details')
        }
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchUser()
    }
  }, [userId])

  const formatCurrency = (amount: number | undefined | null) => {
    const safeAmount = amount || 0
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR'
    }).format(safeAmount)
  }

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'Never'
    
    try {
      const dateObj = new Date(date)
      if (isNaN(dateObj.getTime())) return 'Invalid Date'
      
      return dateObj.toLocaleDateString('en-IE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (err) {
      return 'Invalid Date'
    }
  }

  const formatDateOnly = (date: Date | string | null) => {
    if (!date) return 'Never'
    
    try {
      const dateObj = new Date(date)
      if (isNaN(dateObj.getTime())) return 'Invalid Date'
      
      return dateObj.toLocaleDateString('en-IE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    } catch (err) {
      return 'Invalid Date'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'super_admin':
        return 'bg-red-100 text-red-800'
      case 'admin':
        return 'bg-purple-100 text-purple-800'
      case 'user':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'paid':
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
      case 'processing':
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#73C2FB]"></div>
          <span className="ml-2 text-gray-600">Loading user details...</span>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading User</h2>
          <p className="text-gray-600 mb-4 max-w-md mx-auto">{error || 'User not found'}</p>
          <div className="flex justify-center space-x-3">
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
            <Link href="/admin/users">
              <Button variant="outline">
                Back to Users
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              {user.firstName && user.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user.businessName}
            </h1>
            <Badge className={getRoleColor(user.role || 'user')}>
              {(user.role || 'user').toLowerCase().replace('_', ' ')}
            </Badge>
            {user.emailVerified ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            )}
          </div>
          <p className="text-gray-600">User Account Details & Activity</p>
        </div>
        <Link href="/admin/users">
          <Button variant="outline">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
        </Link>
      </div>

      {/* User Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VAT Returns</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.stats.totalVATReturns}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.stats.totalDocuments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.stats.totalPayments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total VAT Paid</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(user.stats.totalVATPaid)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="returns">VAT Returns</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">First Name</label>
                    <p className="text-sm">{user.firstName || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Name</label>
                    <p className="text-sm">{user.lastName || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{user.email}</span>
                  {user.emailVerified ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  )}
                </div>
                {user.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{user.phone}</span>
                  </div>
                )}
                {user.address && (
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                    <span className="text-sm">{user.address}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Account Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Account Created</label>
                  <p className="text-sm">{formatDate(user.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="text-sm">{formatDate(user.updatedAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Login</label>
                  <p className="text-sm">{formatDate(user.lastLoginAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email Verified</label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">
                      {user.emailVerified ? 'Yes' : 'No'}
                    </span>
                    {user.emailVerified ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents ({user.documents.length})</CardTitle>
              <CardDescription>
                All documents uploaded by this user
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user.documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No documents uploaded</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {user.documents.map((document) => (
                    <div key={document.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium">{document.originalName}</h4>
                            <Badge variant="outline">{document.documentType}</Badge>
                            <Badge variant="outline">{document.category}</Badge>
                            {document.isScanned && (
                              <Badge className="bg-green-100 text-green-800">Scanned</Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>File: {document.fileName}</p>
                            <p>Size: {formatFileSize(document.fileSize)}</p>
                            <p>Type: {document.mimeType}</p>
                            <p>Uploaded: {formatDate(document.uploadedAt)}</p>
                            {document.scanResult && (
                              <p>Scan Result: {document.scanResult}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* VAT Returns Tab */}
        <TabsContent value="returns">
          <Card>
            <CardHeader>
              <CardTitle>VAT Returns ({user.vatReturns.length})</CardTitle>
              <CardDescription>
                All VAT return submissions and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user.vatReturns.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No VAT returns submitted</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {user.vatReturns.map((vatReturn) => (
                    <div key={vatReturn.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium">
                              Period: {formatDateOnly(vatReturn.periodStart)} - {formatDateOnly(vatReturn.periodEnd)}
                            </h4>
                            <Badge className={getStatusColor(vatReturn.status)}>
                              {vatReturn.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Sales VAT</p>
                              <p className="font-medium">{formatCurrency(vatReturn.salesVAT)}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Purchase VAT</p>
                              <p className="font-medium">{formatCurrency(vatReturn.purchaseVAT)}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Net VAT</p>
                              <p className="font-medium">{formatCurrency(vatReturn.netVAT)}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-3">
                            <div>
                              <p className="text-gray-500">Due Date</p>
                              <p>{formatDateOnly(vatReturn.dueDate)}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Submitted</p>
                              <p>{formatDate(vatReturn.submittedAt)}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Paid</p>
                              <p>{formatDate(vatReturn.paidAt)}</p>
                            </div>
                          </div>
                          {vatReturn.revenueRefNumber && (
                            <div className="mt-3">
                              <p className="text-gray-500 text-sm">Revenue Reference</p>
                              <p className="font-medium">{vatReturn.revenueRefNumber}</p>
                            </div>
                          )}
                        </div>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payments ({user.payments.length})</CardTitle>
              <CardDescription>
                Payment history and transaction details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user.payments.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No payments recorded</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {user.payments.map((payment) => (
                    <div key={payment.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium">{formatCurrency(payment.amount)}</h4>
                            <Badge className={getStatusColor(payment.status)}>
                              {payment.status}
                            </Badge>
                            {payment.paymentMethod && (
                              <Badge variant="outline">{payment.paymentMethod}</Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Currency</p>
                              <p>{payment.currency}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Created</p>
                              <p>{formatDate(payment.createdAt)}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Processed</p>
                              <p>{formatDate(payment.processedAt)}</p>
                            </div>
                          </div>
                          {payment.receiptNumber && (
                            <div className="mt-3">
                              <p className="text-gray-500 text-sm">Receipt Number</p>
                              <p className="font-medium">{payment.receiptNumber}</p>
                            </div>
                          )}
                          {payment.stripePaymentId && (
                            <div className="mt-2">
                              <p className="text-gray-500 text-sm">Stripe Payment ID</p>
                              <p className="font-medium text-xs">{payment.stripePaymentId}</p>
                            </div>
                          )}
                          {payment.failureReason && (
                            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                              <p className="text-red-800 text-sm">{payment.failureReason}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          {payment.receiptUrl && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={payment.receiptUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-1" />
                                Receipt
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Tab */}
        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Business Name</label>
                <p className="text-lg font-medium">{user.businessName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">VAT Number</label>
                <p className="text-lg font-medium">{user.vatNumber}</p>
              </div>
              {user.address && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Business Address</label>
                  <p className="text-sm">{user.address}</p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Registration Date</label>
                  <p className="text-sm">{formatDateOnly(user.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Account Status</label>
                  <div className="flex items-center space-x-2">
                    <Badge className={getRoleColor(user.role || 'user')}>
                      {(user.role || 'user').toLowerCase().replace('_', ' ')}
                    </Badge>
                    {user.emailVerified ? (
                      <Badge className="bg-green-100 text-green-800">Verified</Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800">Unverified</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Support Tab */}
        <TabsContent value="support">
          <Card>
            <CardHeader>
              <CardTitle>Support Sessions ({user.chatSessions.length})</CardTitle>
              <CardDescription>
                Customer support chat history
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user.chatSessions.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No support sessions found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {user.chatSessions.map((session) => (
                    <div key={session.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium">Session {session.sessionId.slice(-8)}</h4>
                            <Badge className={session.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {session.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge className={session.isResolved ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}>
                              {session.isResolved ? 'Resolved' : 'Unresolved'}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Created</p>
                              <p>{formatDate(session.createdAt)}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Last Message</p>
                              <p>{formatDate(session.lastMessageAt)}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Messages</p>
                              <p>{session.messageCount || 0}</p>
                            </div>
                          </div>
                          {session.isResolved && session.resolvedAt && (
                            <div className="mt-2 text-sm">
                              <p className="text-gray-500">Resolved: {formatDate(session.resolvedAt)}</p>
                            </div>
                          )}
                        </div>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View Chat
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}