"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Mail, 
  Phone, 
  Calendar, 
  Building, 
  MessageSquare, 
  Search,
  Filter,
  ExternalLink,
  User
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
  createdAt: string
  updatedAt: string
}

export default function AdminContactsPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSource, setFilterSource] = useState('')

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

    const matchesSource = filterSource === '' || submission.source === filterSource

    return matchesSearch && matchesSource
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
      'general-inquiry': 'bg-blue-100 text-blue-800',
      'vat-services': 'bg-green-100 text-green-800',
      'business-setup': 'bg-purple-100 text-purple-800',
      'support': 'bg-orange-100 text-orange-800'
    }
    return colors[subject] || 'bg-gray-100 text-gray-800'
  }

  const getSourceColor = (source: string) => {
    const colors: Record<string, string> = {
      'contact-page': 'bg-teal-100 text-teal-800',
      'business-setup-guide': 'bg-indigo-100 text-indigo-800'
    }
    return colors[source] || 'bg-gray-100 text-gray-800'
  }

  const uniqueSources = [...new Set(submissions.map(s => s.source))]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
              <h1 className="text-3xl font-bold text-gray-900">Contact Submissions</h1>
              <p className="text-gray-600 mt-1">Manage and review all contact form submissions</p>
            </div>
            <Button onClick={fetchSubmissions} className="bg-teal-600 hover:bg-teal-700">
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, email, or subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="">All Sources</option>
                {uniqueSources.map(source => (
                  <option key={source} value={source}>
                    {source.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Submissions</p>
                  <p className="text-3xl font-bold text-gray-900">{submissions.length}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-teal-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Today</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {submissions.filter(s => 
                      new Date(s.createdAt).toDateString() === new Date().toDateString()
                    ).length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">VAT Services</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {submissions.filter(s => s.subject === 'vat-services').length}
                  </p>
                </div>
                <Building className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Business Setup</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {submissions.filter(s => s.subject === 'business-setup').length}
                  </p>
                </div>
                <User className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submissions List */}
        <div className="space-y-6">
          {filteredSubmissions.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
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
              <Card key={submission.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{submission.fullName}</h3>
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
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      <div className="flex items-center gap-1 mb-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(submission.createdAt)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 mb-4">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <a href={`mailto:${submission.email}`} className="text-teal-600 hover:text-teal-700">
                        {submission.email}
                      </a>
                      <ExternalLink className="h-3 w-3" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <a href={`tel:${submission.phone}`} className="text-teal-600 hover:text-teal-700">
                        {submission.phone}
                      </a>
                      <ExternalLink className="h-3 w-3" />
                    </div>
                  </div>
                  
                  {(submission.businessType || submission.currentStage) && (
                    <div className="grid gap-2 md:grid-cols-2 mb-4 text-sm">
                      {submission.businessType && (
                        <div>
                          <span className="font-medium text-gray-700">Business Type:</span>
                          <span className="ml-2 text-gray-600">{submission.businessType.replace('-', ' ')}</span>
                        </div>
                      )}
                      {submission.currentStage && (
                        <div>
                          <span className="font-medium text-gray-700">Current Stage:</span>
                          <span className="ml-2 text-gray-600">{submission.currentStage.replace('-', ' ')}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Message:</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{submission.message}</p>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <Button 
                      size="sm" 
                      className="bg-teal-600 hover:bg-teal-700"
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
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}