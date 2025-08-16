'use client'

import { useEffect, useState, useCallback } from 'react'
import AdminRoute from '@/components/admin-route'
import { ErrorBoundary } from '@/components/error-boundary'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { 
  Users, 
  User,
  Search, 
  Filter,
  ChevronLeft,
  ChevronRight,
  Mail,
  Building,
  CreditCard,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  UserX,
  UserCheck,
  Download,
  Trash2
} from 'lucide-react'
import Link from 'next/link'

interface User {
  id: string
  email: string
  role: string
  businessName: string
  vatNumber: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  emailVerified: boolean
  lastLoginAt: Date | null
  createdAt: Date
  updatedAt: Date
  stats: {
    totalVATReturns: number
    totalDocuments: number
    totalPayments: number
    totalVATPaid: number
    pendingPayments: number
    lastVATReturn: {
      id: string
      status: string
      periodEnd: Date
      netVAT: number
      submittedAt: Date | null
    } | null
  }
}

interface UsersResponse {
  success: boolean
  users: User[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
  }
}

export default function AdminUsers() {
  return (
    <AdminRoute requiredRole="ADMIN">
      <ErrorBoundary>
        <AdminUsersContent />
      </ErrorBoundary>
    </AdminRoute>
  )
}

function AdminUsersContent() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined)
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0
  })
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      })
      
      if (search) params.append('search', search)
      if (roleFilter) params.append('role', roleFilter)
      if (statusFilter) params.append('status', statusFilter)

      const response = await fetch(`/api/admin/users?${params}`, {
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
          setError('Admin access required. Please log in as administrator.')
          return
        }
        throw new Error(`Server responded with ${response.status}`)
      }
      
      const data: UsersResponse = await response.json()
      
      // Validate response structure
      if (!data.success || !Array.isArray(data.users)) {
        throw new Error('Invalid response format from server')
      }
      
      // Ensure all users have safe stats object
      const safeUsers = data.users.map(user => ({
        ...user,
        stats: user.stats || {
          totalVATReturns: 0,
          totalDocuments: 0,
          totalPayments: 0,
          totalVATPaid: 0,
          pendingPayments: 0,
          lastVATReturn: null
        }
      }))
      
      setUsers(safeUsers)
      setPagination(data.pagination || { page: 1, limit: 20, totalCount: 0, totalPages: 0 })
    } catch (err) {
      console.error('Users fetch error:', err)
      
      // More specific error handling
      if (err instanceof TypeError && err.message.includes('fetch')) {
        setError('Network error. Please check your connection and try again.')
      } else if (err instanceof TypeError || err instanceof ReferenceError) {
        // Handle potential runtime/reference errors that could cause crashes
        setError('Application error. Please refresh the page and try again.')
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to load users. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }, [search, roleFilter, statusFilter, page])

  useEffect(() => {
    // Wrap async call in proper error handling to prevent unhandled promise rejections
    const loadUsers = async () => {
      try {
        await fetchUsers()
      } catch (error) {
        console.error('Critical error in useEffect fetchUsers:', error)
        setError('Critical error loading users. Please refresh the page.')
        setLoading(false)
      }
    }
    
    loadUsers()
  }, [fetchUsers])

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
        year: 'numeric'
      })
    } catch (err) {
      return 'Invalid Date'
    }
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
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1) // Reset to first page on search
  }

  const handleFilterChange = (filterType: 'role' | 'status', value: string) => {
    if (filterType === 'role') {
      setRoleFilter(value === 'all' ? undefined : value)
    } else {
      setStatusFilter(value === 'all' ? undefined : value)
    }
    setPage(1) // Reset to first page on filter change
  }

  const handleSelectUser = (userId: string, checked: boolean) => {
    setSelectedUsers(prev => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(userId)
      } else {
        newSet.delete(userId)
      }
      return newSet
    })
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(new Set(users.map(user => user.id)))
    } else {
      setSelectedUsers(new Set())
    }
  }

  const handleBulkAction = async (action: 'export' | 'deactivate' | 'activate' | 'delete') => {
    if (selectedUsers.size === 0) return
    
    setIsPerformingBulkAction(true)
    try {
      switch (action) {
        case 'export':
          await handleExportUsers(Array.from(selectedUsers))
          break
        case 'deactivate':
          await handleDeactivateUsers(Array.from(selectedUsers))
          break
        case 'activate':
          await handleActivateUsers(Array.from(selectedUsers))
          break
        case 'delete':
          if (confirm(`Are you sure you want to delete ${selectedUsers.size} user(s)? This action cannot be undone.`)) {
            await handleDeleteUsers(Array.from(selectedUsers))
          }
          break
      }
      setSelectedUsers(new Set()) // Clear selection after action
      fetchUsers() // Refresh the list
    } catch (error) {
      console.error('Bulk action failed:', error)
      setError(`Failed to perform bulk action: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsPerformingBulkAction(false)
    }
  }

  const handleExportUsers = async (userIds: string[]) => {
    const response = await fetch('/api/admin/users/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userIds }),
      credentials: 'include'
    })
    
    if (!response.ok) throw new Error('Export failed')
    
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleDeactivateUsers = async (userIds: string[]) => {
    const response = await fetch('/api/admin/users/bulk-deactivate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userIds }),
      credentials: 'include'
    })
    
    if (!response.ok) throw new Error('Deactivation failed')
  }

  const handleActivateUsers = async (userIds: string[]) => {
    const response = await fetch('/api/admin/users/bulk-activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userIds }),
      credentials: 'include'
    })
    
    if (!response.ok) throw new Error('Activation failed')
  }

  const handleDeleteUsers = async (userIds: string[]) => {
    const response = await fetch('/api/admin/users/bulk-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userIds }),
      credentials: 'include'
    })
    
    if (!response.ok) throw new Error('Deletion failed')
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#73C2FB]"></div>
          <span className="ml-2 text-gray-600">Loading users...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Users</h2>
          <p className="text-gray-600 mb-4 max-w-md mx-auto">{error}</p>
          <div className="flex justify-center space-x-3">
            <Button onClick={fetchUsers} disabled={loading}>
              {loading ? 'Retrying...' : 'Try Again'}
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/admin'}>
              Back to Admin
            </Button>
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
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage and monitor user accounts</p>
        </div>
        <Link href="/admin">
          <Button variant="outline">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </div>
            {selectedUsers.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {selectedUsers.size} selected
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={isPerformingBulkAction}
                    >
                      {isPerformingBulkAction ? 'Processing...' : 'Bulk Actions'}
                      <MoreHorizontal className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleBulkAction('export')}>
                      <Download className="h-4 w-4 mr-2" />
                      Export Selected
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleBulkAction('activate')}>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Activate Selected
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('deactivate')}>
                      <UserX className="h-4 w-4 mr-2" />
                      Deactivate Selected
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleBulkAction('delete')}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Selected
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, business, or VAT number..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter || undefined} onValueChange={(value) => handleFilterChange('role', value)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter || undefined} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active (30 days)</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={users.length > 0 && selectedUsers.size === users.length}
                  onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                  aria-label="Select all users"
                />
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Select all
                </label>
              </div>
              <CardTitle>
                Users ({pagination.totalCount})
              </CardTitle>
            </div>
            <div className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.totalPages}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No users found</p>
              </div>
            ) : (
              users.map((user) => (
                <div key={user.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Selection Checkbox */}
                    <div className="flex items-start gap-3">
                      <div className="pt-1">
                        <Checkbox
                          checked={selectedUsers.has(user.id)}
                          onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                          aria-label={`Select ${user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.businessName}`}
                        />
                      </div>
                      
                      {/* User Info */}
                      <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <Link href={`/admin/users/${user.id}`}>
                              <h3 className="font-semibold text-lg hover:text-[#73C2FB] cursor-pointer">
                                {user.firstName && user.lastName 
                                  ? `${user.firstName} ${user.lastName}` 
                                  : user.businessName}
                              </h3>
                            </Link>
                            <Badge className={getRoleColor(user.role || 'user')}>
                              {(user.role || 'user').toLowerCase().replace('_', ' ')}
                            </Badge>
                            {user.emailVerified ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <Mail className="h-4 w-4 mr-1" />
                              {user.email}
                            </span>
                            <span className="flex items-center">
                              <Building className="h-4 w-4 mr-1" />
                              {user.businessName || 'No business name'}
                            </span>
                            <span>VAT: {user.vatNumber || 'Not provided'}</span>
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              Last login: {formatDate(user.lastLoginAt)}
                            </span>
                          </div>
                        </div>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-semibold flex items-center">
                          <FileText className="h-4 w-4 mr-1" />
                          {user.stats?.totalVATReturns || 0}
                        </div>
                        <div className="text-gray-500">VAT Returns</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold flex items-center">
                          <CreditCard className="h-4 w-4 mr-1" />
                          {user.stats?.totalPayments || 0}
                        </div>
                        <div className="text-gray-500">Payments</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">
                          {formatCurrency(user.stats?.totalVATPaid)}
                        </div>
                        <div className="text-gray-500">VAT Paid</div>
                      </div>
                    </div>

                    {/* Last VAT Return */}
                    {user.stats?.lastVATReturn && (
                      <div className="min-w-[200px]">
                        <div className="text-sm">
                          <div className="font-medium">Last VAT Return</div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(user.stats.lastVATReturn?.status || 'unknown')}>
                              {user.stats.lastVATReturn?.status || 'Unknown'}
                            </Badge>
                            <span className="text-gray-500">
                              {formatDate(user.stats.lastVATReturn?.periodEnd)}
                            </span>
                          </div>
                          <div className="text-gray-600">
                            {formatCurrency(user.stats.lastVATReturn?.netVAT)}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* View Details Button */}
                    <div className="flex items-center">
                      <Link href={`/admin/users/${user.id}`}>
                        <Button size="sm" variant="outline">
                          <User className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Pending Payments Warning */}
                  {(user.stats?.pendingPayments || 0) > 0 && (
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                      <div className="flex items-center">
                        <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                        <span className="text-yellow-800">
                          {user.stats.pendingPayments} pending payment(s)
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Account Created */}
                  <div className="mt-2 text-xs text-gray-500">
                    Account created: {formatDate(user.createdAt)}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Showing {((page - 1) * pagination.limit) + 1} to {Math.min(page * pagination.limit, pagination.totalCount)} of {pagination.totalCount} users
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= pagination.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}