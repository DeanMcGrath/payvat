"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Calendar, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Download,
  Upload,
  Plus,
  Eye,
  Loader2,
  Building,
  Calculator,
  Euro,
  ExternalLink
} from "lucide-react"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/vatUtils"
import FileUpload from "@/components/file-upload"

interface AnnualReturn {
  id: string
  year: number
  dueDate: string
  type: 'CRO' | 'Revenue' | 'VAT_Annual'
  title: string
  description: string
  status: 'upcoming' | 'in_progress' | 'submitted' | 'paid' | 'overdue'
  submittedAt?: string
  paidAt?: string
  amount?: number
  referenceNumber?: string
  documents?: Array<{
    name: string
    type: string
    uploadedAt: string
    url: string
  }>
  requirements?: string[]
  estimatedCost?: number
  progress: number
}

interface AnnualStats {
  totalFilings: number
  onTimeFilings: number
  pendingFilings: number
  totalCosts: number
  completionRate: number
}

export default function AnnualReturnsPage() {
  const [annualReturns, setAnnualReturns] = useState<AnnualReturn[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AnnualStats>({
    totalFilings: 0,
    onTimeFilings: 0,
    pendingFilings: 0,
    totalCosts: 0,
    completionRate: 0
  })

  useEffect(() => {
    loadAnnualReturnsData()
  }, [])

  const loadAnnualReturnsData = async () => {
    try {
      setLoading(true)
      
      const currentYear = new Date().getFullYear()
      
      // Mock data - replace with real API calls
      const mockReturns: AnnualReturn[] = [
        {
          id: '1',
          year: currentYear,
          dueDate: '2025-01-31',
          type: 'CRO',
          title: 'CRO Annual Return (B1)',
          description: 'Companies Registration Office annual return filing',
          status: 'upcoming',
          amount: 40.00,
          progress: 25,
          requirements: [
            'Updated company details',
            'Current directors information', 
            'Registered office address',
            'Share capital details'
          ],
          estimatedCost: 40.00,
          documents: [
            {
              name: 'Director Details Form',
              type: 'requirement',
              uploadedAt: '2024-12-01T10:00:00Z',
              url: '/documents/director-details.pdf'
            }
          ]
        },
        {
          id: '2',
          year: currentYear,
          dueDate: '2025-10-31',
          type: 'Revenue',
          title: 'Corporation Tax Return (CT1)',
          description: 'Annual corporation tax return to Revenue',
          status: 'upcoming',
          amount: 0,
          progress: 5,
          requirements: [
            'Audited financial statements',
            'Profit and loss account',
            'Balance sheet',
            'Tax computation'
          ],
          estimatedCost: 1200.00
        },
        {
          id: '3',
          year: currentYear - 1,
          dueDate: '2024-01-31',
          type: 'CRO',
          title: 'CRO Annual Return (B1)',
          description: 'Companies Registration Office annual return filing for 2023',
          status: 'submitted',
          submittedAt: '2024-01-15T14:30:00Z',
          amount: 40.00,
          referenceNumber: 'CRO2024001',
          progress: 100,
          documents: [
            {
              name: 'B1 Form Submitted',
              type: 'confirmation',
              uploadedAt: '2024-01-15T14:30:00Z',
              url: '/documents/b1-confirmation-2023.pdf'
            }
          ]
        },
        {
          id: '4',
          year: currentYear - 1,
          dueDate: '2024-10-31',
          type: 'Revenue',
          title: 'Corporation Tax Return (CT1)',
          description: 'Annual corporation tax return to Revenue for 2023',
          status: 'paid',
          submittedAt: '2024-09-15T10:00:00Z',
          paidAt: '2024-09-20T12:00:00Z',
          amount: 850.00,
          referenceNumber: 'CT20240001',
          progress: 100,
          documents: [
            {
              name: 'CT1 Submitted',
              type: 'confirmation',
              uploadedAt: '2024-09-15T10:00:00Z',
              url: '/documents/ct1-confirmation-2023.pdf'
            },
            {
              name: 'Payment Receipt',
              type: 'payment',
              uploadedAt: '2024-09-20T12:00:00Z',
              url: '/documents/payment-receipt-2023.pdf'
            }
          ]
        }
      ]

      setAnnualReturns(mockReturns)
      
      // Calculate stats
      const totalFilings = mockReturns.length
      const onTime = mockReturns.filter(r => 
        r.status === 'submitted' || r.status === 'paid'
      ).length
      const pending = mockReturns.filter(r => 
        r.status === 'upcoming' || r.status === 'in_progress'
      ).length
      const totalCosts = mockReturns.reduce((sum, r) => sum + (r.amount || 0), 0)
      const completionRate = totalFilings > 0 ? Math.round((onTime / totalFilings) * 100) : 0

      setStats({
        totalFilings,
        onTimeFilings: onTime,
        pendingFilings: pending,
        totalCosts,
        completionRate
      })

    } catch (error) {
      console.error('Failed to load annual returns data:', error)
      toast.error('Failed to load annual returns information')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
      case 'submitted':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'in_progress':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'overdue':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case 'upcoming':
        return <Calendar className="h-5 w-5 text-petrol-base" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>
      case 'submitted':
        return <Badge className="bg-blue-100 text-petrol-dark">Submitted</Badge>
      case 'in_progress':
        return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>
      case 'upcoming':
        return <Badge className="bg-gray-100 text-gray-800">Upcoming</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'CRO':
        return <Building className="h-6 w-6 text-petrol-base" />
      case 'Revenue':
        return <Calculator className="h-6 w-6 text-green-600" />
      case 'VAT_Annual':
        return <FileText className="h-6 w-6 text-purple-600" />
      default:
        return <FileText className="h-6 w-6 text-gray-600" />
    }
  }

  const isOverdue = (dueDate: string, status: string) => {
    return new Date(dueDate) < new Date() && 
           !['submitted', 'paid'].includes(status)
  }

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
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
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Filings</p>
                <p className="h3 text-petrol-dark">{stats.totalFilings}</p>
              </div>
              <FileText className="h-8 w-8 text-petrol-dark" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">On Time</p>
                <p className="text-2xl font-normal text-green-600">{stats.onTimeFilings}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-normal text-yellow-600">{stats.pendingFilings}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Costs</p>
                <p className="text-2xl font-normal text-purple-600">
                  {formatCurrency(stats.totalCosts)}
                </p>
              </div>
              <Euro className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-petrol-dark">
            <Plus className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => window.open('https://www.cro.ie/en-ie/online-services/companies-forms/annual-return-form-b1', '_blank')}
            >
              <Building className="h-8 w-8 text-petrol-base" />
              <div className="text-center">
                <div className="font-normal">CRO Annual Return</div>
                <div className="text-xs text-gray-500">File B1 form online</div>
              </div>
              <ExternalLink className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => window.open('https://www.ros.ie', '_blank')}
            >
              <Calculator className="h-8 w-8 text-green-600" />
              <div className="text-center">
                <div className="font-normal">Revenue ROS</div>
                <div className="text-xs text-gray-500">Corporation tax returns</div>
              </div>
              <ExternalLink className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <FileText className="h-8 w-8 text-purple-600" />
              <div className="text-center">
                <div className="font-normal">Document Upload</div>
                <div className="text-xs text-gray-500">Upload required documents</div>
              </div>
              <Upload className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Annual Returns List */}
      <div className="grid gap-6">
        {annualReturns.map((annualReturn) => {
          const overdue = isOverdue(annualReturn.dueDate, annualReturn.status)
          const daysUntilDue = getDaysUntilDue(annualReturn.dueDate)
          
          return (
            <Card key={annualReturn.id} className={`overflow-hidden ${
              overdue ? 'border-red-200 bg-red-50' : ''
            }`}>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(annualReturn.type)}
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {annualReturn.title}
                        <Badge variant="outline">{annualReturn.year}</Badge>
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{annualReturn.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(annualReturn.status)}
                    {getStatusBadge(annualReturn.status)}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Completion</span>
                    <span>{annualReturn.progress}%</span>
                  </div>
                  <Progress value={annualReturn.progress} className="h-2" />
                </div>

                {/* Key Information */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-normal text-gray-700">Due Date:</span>
                    <div className={`text-gray-600 ${overdue ? 'text-red-600 font-normal' : ''}`}>
                      {new Date(annualReturn.dueDate).toLocaleDateString()}
                      {!['submitted', 'paid'].includes(annualReturn.status) && (
                        <div className={`text-xs ${daysUntilDue < 30 ? 'text-yellow-600' : 'text-gray-500'}`}>
                          {daysUntilDue > 0 ? `${daysUntilDue} days left` : `${Math.abs(daysUntilDue)} days overdue`}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {annualReturn.amount !== undefined && (
                    <div>
                      <span className="font-normal text-gray-700">Cost:</span>
                      <div className="text-gray-600">{formatCurrency(annualReturn.amount)}</div>
                    </div>
                  )}
                  
                  {annualReturn.submittedAt && (
                    <div>
                      <span className="font-normal text-gray-700">Submitted:</span>
                      <div className="text-gray-600">
                        {new Date(annualReturn.submittedAt).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                  
                  {annualReturn.referenceNumber && (
                    <div>
                      <span className="font-normal text-gray-700">Reference:</span>
                      <div className="text-gray-600">{annualReturn.referenceNumber}</div>
                    </div>
                  )}
                </div>

                {/* Requirements */}
                {annualReturn.requirements && annualReturn.requirements.length > 0 && (
                  <div>
                    <h4 className="font-normal text-gray-900 mb-2">Requirements:</h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {annualReturn.requirements.map((requirement, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                          <div className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                            <span className="text-xs font-normal text-petrol-base">•</span>
                          </div>
                          {requirement}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Documents */}
                {annualReturn.documents && annualReturn.documents.length > 0 && (
                  <div>
                    <h4 className="font-normal text-gray-900 mb-2">Documents:</h4>
                    <div className="space-y-2">
                      {annualReturn.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-md border border-green-200">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-normal">{doc.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {doc.type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              {new Date(doc.uploadedAt).toLocaleDateString()}
                            </span>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Document Upload for pending returns */}
                {['upcoming', 'in_progress'].includes(annualReturn.status) && (
                  <div className="pt-4 border-t">
                    <h4 className="font-normal text-gray-900 mb-3">Upload Documents:</h4>
                    <FileUpload
                      category={`ANNUAL_RETURN_${annualReturn.id}`}
                      title="Upload Required Documents"
                      description="Upload supporting documents for this annual return"
                      acceptedFiles={['.pdf', '.doc', '.docx', '.xlsx']}
                      enableBatchMode={false}
                      showBatchProgress={false}
                      onUploadSuccess={(doc) => {
                        toast.success('Document uploaded successfully')
                        loadAnnualReturnsData()
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {annualReturns.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-normal text-gray-900 mb-2">No Annual Returns Found</h3>
            <p className="text-gray-500 mb-4">
              Your annual return requirements will appear here as due dates approach
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}