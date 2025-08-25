"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Building, 
  FileCheck, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ExternalLink,
  Plus,
  Loader2,
  FileText,
  Calendar,
  User
} from "lucide-react"
import { toast } from "sonner"

interface RegistrationItem {
  id: string
  type: 'company' | 'revenue' | 'business_name' | 'vat'
  title: string
  description: string
  status: 'completed' | 'in_progress' | 'not_started'
  progress: number
  dueDate?: string
  completedDate?: string
  referenceNumber?: string
  documents?: Array<{
    name: string
    url: string
    uploadedAt: string
  }>
  nextSteps?: string[]
  externalLinks?: Array<{
    name: string
    url: string
    description: string
  }>
}

export default function RegistrationPage() {
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [overallProgress, setOverallProgress] = useState(0)

  useEffect(() => {
    loadRegistrationData()
  }, [])

  const loadRegistrationData = async () => {
    try {
      setLoading(true)
      
      // Mock data - replace with real API call
      const mockRegistrations: RegistrationItem[] = [
        {
          id: '1',
          type: 'company',
          title: 'Companies Registration Office (CRO)',
          description: 'Register your company with the Companies Registration Office',
          status: 'completed',
          progress: 100,
          completedDate: '2024-11-15',
          referenceNumber: 'CRO123456',
          documents: [
            {
              name: 'Certificate of Incorporation',
              url: '/documents/certificate-incorporation.pdf',
              uploadedAt: '2024-11-15T10:30:00Z'
            },
            {
              name: 'Form A1 - Constitution',
              url: '/documents/form-a1.pdf', 
              uploadedAt: '2024-11-15T10:30:00Z'
            }
          ],
          externalLinks: [
            {
              name: 'CRO Portal',
              url: 'https://www.cro.ie',
              description: 'Manage your company registration'
            }
          ]
        },
        {
          id: '2',
          type: 'revenue',
          title: 'Revenue Registration',
          description: 'Register with Revenue for tax purposes',
          status: 'in_progress',
          progress: 65,
          nextSteps: [
            'Submit Form TR1',
            'Await tax reference number',
            'Set up ROS account'
          ],
          externalLinks: [
            {
              name: 'ROS - Revenue Online Service',
              url: 'https://www.ros.ie',
              description: 'Online tax services portal'
            },
            {
              name: 'Form TR1',
              url: 'https://www.revenue.ie/en/companies-and-charities/documents/tr1.pdf',
              description: 'Tax registration form for companies'
            }
          ]
        },
        {
          id: '3',
          type: 'business_name',
          title: 'Business Name Registration',
          description: 'Register your business name with CRO',
          status: 'completed',
          progress: 100,
          completedDate: '2024-11-20',
          referenceNumber: 'BN789012',
          documents: [
            {
              name: 'Business Name Certificate',
              url: '/documents/business-name-cert.pdf',
              uploadedAt: '2024-11-20T14:15:00Z'
            }
          ]
        },
        {
          id: '4',
          type: 'vat',
          title: 'VAT Registration',
          description: 'Register for Value Added Tax with Revenue',
          status: 'not_started',
          progress: 0,
          dueDate: '2025-01-30',
          nextSteps: [
            'Submit VAT registration application',
            'Provide business activity details',
            'Estimate turnover figures'
          ],
          externalLinks: [
            {
              name: 'VAT Registration Form',
              url: 'https://www.revenue.ie/en/vat/vat-registration/index.aspx',
              description: 'Apply for VAT registration online'
            }
          ]
        }
      ]

      setRegistrations(mockRegistrations)
      
      // Calculate overall progress
      const totalProgress = mockRegistrations.reduce((sum, item) => sum + item.progress, 0)
      setOverallProgress(Math.round(totalProgress / mockRegistrations.length))

    } catch (error) {
      console.error('Failed to load registration data:', error)
      toast.error('Failed to load registration information')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'in_progress':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'not_started':
        return <AlertCircle className="h-5 w-5 text-gray-400" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case 'in_progress':
        return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
      case 'not_started':
        return <Badge variant="secondary">Not Started</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'company':
        return <Building className="h-8 w-8 text-petrol-base" />
      case 'revenue':
        return <FileText className="h-8 w-8 text-green-600" />
      case 'business_name':
        return <User className="h-8 w-8 text-purple-600" />
      case 'vat':
        return <FileCheck className="h-8 w-8 text-orange-600" />
      default:
        return <FileCheck className="h-8 w-8 text-gray-600" />
    }
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
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-petrol-dark">
            <FileCheck className="h-5 w-5" />
            Registration Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-normal">Overall Completion</span>
              <span className="h6 text-petrol-dark">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
              <div className="text-center">
                <div className="text-2xl font-normal text-green-600">
                  {registrations.filter(r => r.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-normal text-yellow-600">
                  {registrations.filter(r => r.status === 'in_progress').length}
                </div>
                <div className="text-sm text-gray-600">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-normal text-gray-400">
                  {registrations.filter(r => r.status === 'not_started').length}
                </div>
                <div className="text-sm text-gray-600">Not Started</div>
              </div>
              <div className="text-center">
                <div className="h3 text-petrol-dark">
                  {registrations.length}
                </div>
                <div className="text-sm text-gray-600">Total Items</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registration Items */}
      <div className="grid gap-6">
        {registrations.map((registration) => (
          <Card key={registration.id} className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getTypeIcon(registration.type)}
                  <div>
                    <CardTitle className="text-lg">{registration.title}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{registration.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(registration.status)}
                  {getStatusBadge(registration.status)}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{registration.progress}%</span>
                </div>
                <Progress value={registration.progress} className="h-2" />
              </div>

              {/* Dates and Reference */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {registration.completedDate && (
                  <div>
                    <span className="font-normal text-gray-700">Completed:</span>
                    <div className="text-gray-600">
                      {new Date(registration.completedDate).toLocaleDateString()}
                    </div>
                  </div>
                )}
                {registration.dueDate && (
                  <div>
                    <span className="font-normal text-gray-700">Due Date:</span>
                    <div className="text-gray-600">
                      {new Date(registration.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                )}
                {registration.referenceNumber && (
                  <div>
                    <span className="font-normal text-gray-700">Reference:</span>
                    <div className="text-gray-600">{registration.referenceNumber}</div>
                  </div>
                )}
              </div>

              {/* Next Steps */}
              {registration.nextSteps && registration.nextSteps.length > 0 && (
                <div>
                  <h4 className="font-normal text-gray-900 mb-2">Next Steps:</h4>
                  <ul className="space-y-1">
                    {registration.nextSteps.map((step, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                        <div className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                          <span className="text-xs font-normal text-petrol-base">{index + 1}</span>
                        </div>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Documents */}
              {registration.documents && registration.documents.length > 0 && (
                <div>
                  <h4 className="font-normal text-gray-900 mb-2">Documents:</h4>
                  <div className="space-y-2">
                    {registration.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-md border border-green-200">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-normal">{doc.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {new Date(doc.uploadedAt).toLocaleDateString()}
                          </span>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* External Links */}
              {registration.externalLinks && registration.externalLinks.length > 0 && (
                <div className="pt-4 border-t">
                  <h4 className="font-normal text-gray-900 mb-2">Helpful Links:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {registration.externalLinks.map((link, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="justify-start text-left h-auto p-3"
                        onClick={() => window.open(link.url, '_blank')}
                      >
                        <div className="flex-1">
                          <div className="font-normal">{link.name}</div>
                          <div className="text-xs text-gray-500">{link.description}</div>
                        </div>
                        <ExternalLink className="h-4 w-4 ml-2 flex-shrink-0" />
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}