"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Mail, 
  Phone, 
  Calendar, 
  Building, 
  MessageSquare, 
  Search,
  Filter,
  ExternalLink,
  User,
  CheckSquare,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Eye,
  UserCheck,
  ArrowUpCircle,
  ArrowDownCircle,
  Edit3,
  Save,
  X,
  Download
} from 'lucide-react'

interface ContactSubmission {
  id: string
  fullName: string
  email: string
  phone: string
  companyName?: string
  subject: string
  message: string
  businessType?: string
  currentStage?: string
  source: string
  status: string
  priority: string
  adminNotes?: string
  responseDate?: string
  assignedTo?: string
  followUpDate?: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export default function AdminContactsPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSource, setFilterSource] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<ContactSubmission>>({})
  const [bulkAction, setBulkAction] = useState('')

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/contact')
      const data = await response.json()
      setSubmissions(data.submissions || [])
    } catch (error) {
      console.error('Error fetching submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = 
      submission.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (submission.companyName?.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesSource = filterSource === '' || filterSource === 'all' || submission.source === filterSource
    const matchesStatus = filterStatus === '' || filterStatus === 'all' || submission.status === filterStatus
    const matchesPriority = filterPriority === '' || filterPriority === 'all' || submission.priority === filterPriority

    return matchesSearch && matchesSource && matchesStatus && matchesPriority
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getSubjectColor = (subject: string) => {
    const colors: Record<string, string> = {
      'general-inquiry': 'bg-blue-100 text-petrol-dark',
      'vat-services': 'bg-green-100 text-green-800',
      'business-setup': 'bg-purple-100 text-purple-800',
      'support': 'bg-orange-100 text-orange-800'
    }
    return colors[subject] || 'bg-gray-100 text-gray-800'
  }

  const getSourceColor = (source: string) => {
    const colors: Record<string, string> = {
      'contact-page': 'bg-blue-100 text-[#2A7A8F]',
      'business-setup-guide': 'bg-indigo-100 text-indigo-800'
    }
    return colors[source] || 'bg-gray-100 text-gray-800'
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'new': 'bg-blue-100 text-blue-800',
      'read': 'bg-gray-100 text-gray-800',
      'in_progress': 'bg-yellow-100 text-yellow-800',
      'responded': 'bg-green-100 text-green-800',
      'resolved': 'bg-emerald-100 text-emerald-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'low': 'bg-gray-100 text-gray-800',
      'normal': 'bg-blue-100 text-blue-800',
      'high': 'bg-orange-100 text-orange-800',
      'urgent': 'bg-red-100 text-red-800'
    }
    return colors[priority] || 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      'new': <MessageSquare className="h-4 w-4" />,
      'read': <Eye className="h-4 w-4" />,
      'in_progress': <Clock className="h-4 w-4" />,
      'responded': <CheckCircle2 className="h-4 w-4" />,
      'resolved': <CheckSquare className="h-4 w-4" />
    }
    return icons[status] || <MessageSquare className="h-4 w-4" />
  }

  const getPriorityIcon = (priority: string) => {
    const icons: Record<string, any> = {
      'low': <ArrowDownCircle className="h-4 w-4" />,
      'normal': <User className="h-4 w-4" />,
      'high': <ArrowUpCircle className="h-4 w-4" />,
      'urgent': <AlertTriangle className="h-4 w-4" />
    }
    return icons[priority] || <User className="h-4 w-4" />
  }

  const uniqueSources = [...new Set(submissions.map(s => s.source))]
  const uniqueStatuses = [...new Set(submissions.map(s => s.status))]
  const uniquePriorities = [...new Set(submissions.map(s => s.priority))]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#2A7A8F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contact submissions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-normal text-gray-900">Contact Submissions</h1>
              <p className="text-gray-600 mt-1">Manage and track all contact form submissions with workflow</p>
            </div>
            <Button onClick={fetchSubmissions} className="bg-[#2A7A8F] hover:bg-[#216477]">
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 content-after-header pb-8">
        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Advanced Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, email, or subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterSource} onValueChange={setFilterSource}>
                <SelectTrigger>
                  <SelectValue placeholder="All Sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {uniqueSources.map(source => (
                    <SelectItem key={source} value={source}>
                      {source.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {uniqueStatuses.map(status => (
                    <SelectItem key={status} value={status}>
                      {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  {uniquePriorities.map(priority => (
                    <SelectItem key={priority} value={priority}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-3xl font-normal text-gray-900">{submissions.length}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-[#2A7A8F]" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">New</p>
                  <p className="text-3xl font-normal text-blue-600">
                    {submissions.filter(s => s.status === 'new').length}
                  </p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-3xl font-normal text-yellow-600">
                    {submissions.filter(s => s.status === 'in_progress').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Urgent</p>
                  <p className="text-3xl font-normal text-red-600">
                    {submissions.filter(s => s.priority === 'urgent').length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Resolved</p>
                  <p className="text-3xl font-normal text-green-600">
                    {submissions.filter(s => s.status === 'resolved').length}
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Today</p>
                  <p className="text-3xl font-normal text-gray-900">
                    {submissions.filter(s => 
                      new Date(s.createdAt).toDateString() === new Date().toDateString()
                    ).length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg text-blue-800">
                {selectedIds.length} submission(s) selected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Select value={bulkAction} onValueChange={setBulkAction}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select bulk action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mark_read">Mark as Read</SelectItem>
                    <SelectItem value="mark_in_progress">Mark as In Progress</SelectItem>
                    <SelectItem value="mark_responded">Mark as Responded</SelectItem>
                    <SelectItem value="mark_resolved">Mark as Resolved</SelectItem>
                    <SelectItem value="set_high_priority">Set High Priority</SelectItem>
                    <SelectItem value="set_urgent_priority">Set Urgent Priority</SelectItem>
                    <SelectItem value="delete">Delete Selected</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={async () => {
                    if (!bulkAction) return
                    
                    let action = ''
                    let status = ''
                    let priority = ''
                    
                    if (bulkAction.startsWith('mark_')) {
                      action = 'update_status'
                      status = bulkAction.replace('mark_', '')
                    } else if (bulkAction.includes('priority')) {
                      action = 'update_priority'
                      priority = bulkAction.includes('high') ? 'high' : 'urgent'
                    } else if (bulkAction === 'delete') {
                      action = 'delete'
                    }
                    
                    try {
                      const response = await fetch('/api/admin/contacts/bulk', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action, ids: selectedIds, status, priority })
                      })
                      
                      if (response.ok) {
                        fetchSubmissions()
                        setSelectedIds([])
                        setBulkAction('')
                      }
                    } catch (error) {
                      console.error('Bulk action error:', error)
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Apply Action
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setSelectedIds([])}
                >
                  Clear Selection
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submissions List */}
        <div className="space-y-6">
          {filteredSubmissions.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-normal text-gray-900 mb-2">No submissions found</h3>
                <p className="text-gray-600">
                  {submissions.length === 0 
                    ? "No contact form submissions yet."
                    : "Try adjusting your search or filter criteria."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredSubmissions.map((submission) => (
              <Card key={submission.id} className={`hover:shadow-lg transition-shadow ${
                submission.status === 'new' ? 'border-l-4 border-l-blue-500' :
                submission.priority === 'urgent' ? 'border-l-4 border-l-red-500' :
                submission.priority === 'high' ? 'border-l-4 border-l-orange-500' : ''
              }`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedIds.includes(submission.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedIds([...selectedIds, submission.id])
                          } else {
                            setSelectedIds(selectedIds.filter(id => id !== submission.id))
                          }
                        }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-normal text-gray-900">{submission.fullName}</h3>
                          {submission.companyName && (
                            <Badge variant="outline" className="text-xs">
                              {submission.companyName}
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge className={getSubjectColor(submission.subject)}>
                            {submission.subject.replace('-', ' ')}
                          </Badge>
                          <Badge className={getSourceColor(submission.source)}>
                            {submission.source.replace('-', ' ')}
                          </Badge>
                          <Badge className={getStatusColor(submission.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(submission.status)}
                              {submission.status.replace('_', ' ')}
                            </div>
                          </Badge>
                          <Badge className={getPriorityColor(submission.priority)}>
                            <div className="flex items-center gap-1">
                              {getPriorityIcon(submission.priority)}
                              {submission.priority}
                            </div>
                          </Badge>
                          {submission.assignedTo && (
                            <Badge variant="outline" className="text-xs">
                              <UserCheck className="h-3 w-3 mr-1" />
                              {submission.assignedTo}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {formatDate(submission.createdAt)}
                        </div>
                        {submission.followUpDate && (
                          <div className="flex items-center gap-2 text-orange-600">
                            <Clock className="h-4 w-4" />
                            Follow-up: {formatDate(submission.followUpDate)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 mb-4">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <a href={`mailto:${submission.email}`} className="text-[#2A7A8F] hover:text-[#216477]">
                        {submission.email}
                      </a>
                      <ExternalLink className="h-3 w-3" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <a href={`tel:${submission.phone}`} className="text-[#2A7A8F] hover:text-[#216477]">
                        {submission.phone}
                      </a>
                      <ExternalLink className="h-3 w-3" />
                    </div>
                  </div>
                  
                  {(submission.businessType || submission.currentStage) && (
                    <div className="grid gap-2 md:grid-cols-2 mb-4 text-sm">
                      {submission.businessType && (
                        <div>
                          <span className="font-normal text-gray-700">Business Type:</span>
                          <span className="ml-2 text-gray-600">{submission.businessType.replace('-', ' ')}</span>
                        </div>
                      )}
                      {submission.currentStage && (
                        <div>
                          <span className="font-normal text-gray-700">Current Stage:</span>
                          <span className="ml-2 text-gray-600">{submission.currentStage.replace('-', ' ')}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="font-normal text-gray-900 mb-2">Message:</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{submission.message}</p>
                  </div>

                  {submission.adminNotes && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                      <h4 className="font-normal text-yellow-800 mb-1 text-sm">Admin Notes:</h4>
                      <p className="text-yellow-700 text-sm whitespace-pre-wrap">{submission.adminNotes}</p>
                    </div>
                  )}

                  {submission.responseDate && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                      <p className="text-green-800 text-sm">
                        <CheckCircle2 className="h-4 w-4 inline mr-1" />
                        Responded on {formatDate(submission.responseDate)}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <Button 
                      size="sm" 
                      className="bg-[#2A7A8F] hover:bg-[#216477]"
                      onClick={() => window.open(`mailto:${submission.email}?subject=Re: Your inquiry about ${submission.subject.replace('-', ' ')}`)}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Reply via Email
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(`tel:${submission.phone}`)}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setEditingId(submission.id)
                        setEditForm(submission)
                      }}
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Export Button */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <Button 
              onClick={async () => {
                try {
                  const csvContent = [
                    ['Date', 'Name', 'Email', 'Phone', 'Company', 'Subject', 'Status', 'Priority', 'Assigned To', 'Message'].join(','),
                    ...filteredSubmissions.map(s => [
                      new Date(s.createdAt).toLocaleDateString(),
                      s.fullName,
                      s.email,
                      s.phone,
                      s.companyName || '',
                      s.subject,
                      s.status,
                      s.priority,
                      s.assignedTo || '',
                      `"${s.message.replace(/"/g, '""')}"`
                    ].join(','))
                  ].join('\n')
                  
                  const blob = new Blob([csvContent], { type: 'text/csv' })
                  const url = window.URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `contact-submissions-${new Date().toISOString().split('T')[0]}.csv`
                  a.click()
                  window.URL.revokeObjectURL(url)
                } catch (error) {
                  console.error('Export error:', error)
                }
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Export to CSV ({filteredSubmissions.length} items)
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Edit Contact Submission</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setEditingId(null)
                    setEditForm({})
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select 
                    value={editForm.status} 
                    onValueChange={(value) => setEditForm({...editForm, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="responded">Responded</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Priority</label>
                  <Select 
                    value={editForm.priority} 
                    onValueChange={(value) => setEditForm({...editForm, priority: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Assigned To</label>
                <Input
                  value={editForm.assignedTo || ''}
                  onChange={(e) => setEditForm({...editForm, assignedTo: e.target.value})}
                  placeholder="Enter assignee name or email"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Admin Notes</label>
                <Textarea
                  value={editForm.adminNotes || ''}
                  onChange={(e) => setEditForm({...editForm, adminNotes: e.target.value})}
                  placeholder="Add internal notes about this submission..."
                  rows={4}
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setEditingId(null)
                    setEditForm({})
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={async () => {
                    if (!editingId) return
                    
                    try {
                      const response = await fetch(`/api/admin/contacts/${editingId}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(editForm)
                      })
                      
                      if (response.ok) {
                        fetchSubmissions()
                        setEditingId(null)
                        setEditForm({})
                      }
                    } catch (error) {
                      console.error('Update error:', error)
                    }
                  }}
                  className="bg-[#2A7A8F] hover:bg-[#216477]"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}