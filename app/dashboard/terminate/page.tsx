"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  XCircle, 
  AlertTriangle, 
  FileText, 
  Phone, 
  Mail,
  ExternalLink,
  CheckCircle,
  Clock,
  Building,
  Calculator,
  Users,
  CreditCard,
  Loader2
} from "lucide-react"
import { toast } from "sonner"

interface TerminationStep {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  category: 'legal' | 'tax' | 'employees' | 'assets' | 'creditors'
  completed: boolean
  dueDate?: string
  estimatedCost?: number
  requirements: string[]
  resources?: Array<{
    name: string
    url: string
    description: string
  }>
}

interface TerminationRequest {
  businessName: string
  companyNumber: string
  reason: string
  plannedClosureDate: string
  hasEmployees: boolean
  employeeCount: number
  hasAssets: boolean
  assetValue: number
  hasDebts: boolean
  debtAmount: number
  contactEmail: string
  contactPhone: string
  additionalInfo: string
  urgency: 'immediate' | 'within_month' | 'within_3months' | 'planning'
}

export default function TerminatePage() {
  const [showChecklist, setShowChecklist] = useState(true)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<TerminationRequest>({
    businessName: '',
    companyNumber: '',
    reason: '',
    plannedClosureDate: '',
    hasEmployees: false,
    employeeCount: 0,
    hasAssets: false,
    assetValue: 0,
    hasDebts: false,
    debtAmount: 0,
    contactEmail: '',
    contactPhone: '',
    additionalInfo: '',
    urgency: 'planning'
  })

  const terminationSteps: TerminationStep[] = [
    {
      id: '1',
      title: 'Board Resolution to Wind Up',
      description: 'Pass a board resolution to voluntarily wind up the company',
      priority: 'high',
      category: 'legal',
      completed: false,
      requirements: [
        'Directors\' meeting to pass resolution',
        'Signed copy of board resolution',
        'Documentation of decision rationale'
      ],
      resources: [
        {
          name: 'Board Resolution Template',
          url: 'https://www.cro.ie/en-ie/online-services/companies-forms',
          description: 'Official template from CRO'
        }
      ]
    },
    {
      id: '2',
      title: 'Appointment of Liquidator',
      description: 'Appoint a qualified liquidator to oversee the winding up process',
      priority: 'high',
      category: 'legal',
      completed: false,
      estimatedCost: 3000,
      requirements: [
        'Research qualified liquidators',
        'Obtain quotes for liquidation services',
        'Formal appointment documentation'
      ]
    },
    {
      id: '3',
      title: 'Employee Consultation & Redundancies',
      description: 'Properly consult with employees and handle redundancy procedures',
      priority: 'high',
      category: 'employees',
      completed: false,
      requirements: [
        'Employee consultation period (30+ days)',
        'Redundancy payments calculation',
        'Final payroll and P45 forms',
        'Notification to Department of Enterprise'
      ],
      resources: [
        {
          name: 'Redundancy Information',
          url: 'https://www.citizensinformation.ie/en/employment/unemployment-and-redundancy/',
          description: 'Official guidance on redundancy procedures'
        }
      ]
    },
    {
      id: '4',
      title: 'Tax Clearance Certificate',
      description: 'Obtain tax clearance from Revenue before dissolution',
      priority: 'high',
      category: 'tax',
      completed: false,
      requirements: [
        'Final VAT return submission',
        'Final corporation tax return',
        'Final PAYE/PRSI returns',
        'Settlement of all outstanding taxes'
      ],
      resources: [
        {
          name: 'Revenue Tax Clearance',
          url: 'https://www.revenue.ie/en/companies-and-charities/tax-clearance/index.aspx',
          description: 'Apply for tax clearance certificate'
        }
      ]
    },
    {
      id: '5',
      title: 'Creditor Notifications',
      description: 'Notify all creditors of the intended dissolution',
      priority: 'medium',
      category: 'creditors',
      completed: false,
      requirements: [
        'Compile full creditor list',
        'Send formal notification letters',
        'Allow 21-day response period',
        'Settlement of outstanding debts'
      ]
    },
    {
      id: '6',
      title: 'Asset Disposal',
      description: 'Dispose of company assets and settle accounts',
      priority: 'medium',
      category: 'assets',
      completed: false,
      requirements: [
        'Asset valuation and inventory',
        'Sale or transfer of assets',
        'Distribution to shareholders',
        'Final accounting records'
      ]
    },
    {
      id: '7',
      title: 'Strike Off Application (Form STR1)',
      description: 'Submit application to strike company off the register',
      priority: 'high',
      category: 'legal',
      completed: false,
      estimatedCost: 40,
      requirements: [
        'Complete Form STR1',
        'Statutory declaration',
        'Publication in Iris Oifigiúil',
        'CRO filing fee payment'
      ],
      resources: [
        {
          name: 'Form STR1',
          url: 'https://www.cro.ie/en-ie/online-services/companies-forms/strike-off-form-str1',
          description: 'Application to strike company off register'
        }
      ]
    }
  ]

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Termination assistance request submitted successfully. We will contact you within 1 business day.')
      
      // Reset form
      setFormData({
        businessName: '',
        companyNumber: '',
        reason: '',
        plannedClosureDate: '',
        hasEmployees: false,
        employeeCount: 0,
        hasAssets: false,
        assetValue: 0,
        hasDebts: false,
        debtAmount: 0,
        contactEmail: '',
        contactPhone: '',
        additionalInfo: '',
        urgency: 'planning'
      })
      setShowRequestForm(false)
      
    } catch (error) {
      toast.error('Failed to submit request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'legal':
        return <Building className="h-5 w-5 text-blue-600" />
      case 'tax':
        return <Calculator className="h-5 w-5 text-green-600" />
      case 'employees':
        return <Users className="h-5 w-5 text-purple-600" />
      case 'assets':
        return <CreditCard className="h-5 w-5 text-orange-600" />
      case 'creditors':
        return <FileText className="h-5 w-5 text-gray-600" />
      default:
        return <FileText className="h-5 w-5 text-gray-600" />
    }
  }

  const completedSteps = terminationSteps.filter(step => step.completed).length
  const totalSteps = terminationSteps.length
  const progressPercentage = Math.round((completedSteps / totalSteps) * 100)

  return (
    <div className="space-y-6">
      {/* Warning Notice */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-orange-900">Important Notice</h3>
              <p className="text-sm text-orange-800 mt-1">
                Business termination is a complex legal process with significant implications. 
                We strongly recommend consulting with qualified professionals before proceeding. 
                This checklist is for guidance only and does not constitute legal advice.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <XCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Termination Checklist</h3>
                <p className="text-sm text-gray-600">Step-by-step guidance for closing your business</p>
                <div className="mt-2">
                  <Button 
                    variant={showChecklist ? "default" : "outline"} 
                    size="sm"
                    onClick={() => {setShowChecklist(true); setShowRequestForm(false)}}
                  >
                    View Checklist
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Phone className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Expert Assistance</h3>
                <p className="text-sm text-gray-600">Get professional help with your business closure</p>
                <div className="mt-2">
                  <Button 
                    variant={showRequestForm ? "default" : "outline"} 
                    size="sm"
                    onClick={() => {setShowRequestForm(true); setShowChecklist(false)}}
                  >
                    Request Help
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Termination Checklist */}
      {showChecklist && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-brand-700">
                <XCircle className="h-5 w-5" />
                Business Termination Checklist
              </CardTitle>
              <div className="text-sm">
                <span className="font-medium">{completedSteps}/{totalSteps}</span> completed
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progress</span>
                <span>{progressPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-brand-700 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {terminationSteps.map((step, index) => (
              <div key={step.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getCategoryIcon(step.category)}
                        <h4 className="font-medium text-gray-900">{step.title}</h4>
                        <Badge className={getPriorityColor(step.priority)}>
                          {step.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                      
                      {step.estimatedCost && (
                        <div className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Estimated cost:</span> €{step.estimatedCost}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {step.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Clock className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-sm text-gray-900 mb-2">Requirements:</h5>
                  <ul className="space-y-1">
                    {step.requirements.map((requirement, reqIndex) => (
                      <li key={reqIndex} className="flex items-start gap-2 text-sm text-gray-600">
                        <div className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                          <span className="text-xs font-medium text-blue-600">•</span>
                        </div>
                        {requirement}
                      </li>
                    ))}
                  </ul>
                </div>

                {step.resources && step.resources.length > 0 && (
                  <div>
                    <h5 className="font-medium text-sm text-gray-900 mb-2">Resources:</h5>
                    <div className="space-y-2">
                      {step.resources.map((resource, resIndex) => (
                        <Button
                          key={resIndex}
                          variant="outline"
                          size="sm"
                          className="h-auto p-2 justify-start text-left"
                          onClick={() => window.open(resource.url, '_blank')}
                        >
                          <div className="flex-1">
                            <div className="font-medium text-xs">{resource.name}</div>
                            <div className="text-xs text-gray-500">{resource.description}</div>
                          </div>
                          <ExternalLink className="h-3 w-3 ml-2 flex-shrink-0" />
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Request Assistance Form */}
      {showRequestForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-brand-700">
              <Phone className="h-5 w-5" />
              Request Termination Assistance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => setFormData(prev => ({...prev, businessName: e.target.value}))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="companyNumber">Company Number</Label>
                  <Input
                    id="companyNumber"
                    value={formData.companyNumber}
                    onChange={(e) => setFormData(prev => ({...prev, companyNumber: e.target.value}))}
                    placeholder="e.g., 123456"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Closure *</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({...prev, reason: e.target.value}))}
                  placeholder="Please explain why you are closing the business..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plannedClosureDate">Planned Closure Date</Label>
                  <Input
                    id="plannedClosureDate"
                    type="date"
                    value={formData.plannedClosureDate}
                    onChange={(e) => setFormData(prev => ({...prev, plannedClosureDate: e.target.value}))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="urgency">Urgency</Label>
                  <Select 
                    value={formData.urgency} 
                    onValueChange={(value: 'immediate' | 'within_month' | 'within_3months' | 'planning') => 
                      setFormData(prev => ({...prev, urgency: value}))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate (within days)</SelectItem>
                      <SelectItem value="within_month">Within 1 month</SelectItem>
                      <SelectItem value="within_3months">Within 3 months</SelectItem>
                      <SelectItem value="planning">Just planning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Checkboxes for business details */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasEmployees"
                    checked={formData.hasEmployees}
                    onCheckedChange={(checked) => setFormData(prev => ({...prev, hasEmployees: !!checked}))}
                  />
                  <Label htmlFor="hasEmployees">The business has employees</Label>
                </div>

                {formData.hasEmployees && (
                  <div className="ml-6 space-y-2">
                    <Label htmlFor="employeeCount">Number of Employees</Label>
                    <Input
                      id="employeeCount"
                      type="number"
                      value={formData.employeeCount}
                      onChange={(e) => setFormData(prev => ({...prev, employeeCount: parseInt(e.target.value) || 0}))}
                      className="w-32"
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasAssets"
                    checked={formData.hasAssets}
                    onCheckedChange={(checked) => setFormData(prev => ({...prev, hasAssets: !!checked}))}
                  />
                  <Label htmlFor="hasAssets">The business has significant assets</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasDebts"
                    checked={formData.hasDebts}
                    onCheckedChange={(checked) => setFormData(prev => ({...prev, hasDebts: !!checked}))}
                  />
                  <Label htmlFor="hasDebts">The business has outstanding debts</Label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData(prev => ({...prev, contactEmail: e.target.value}))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData(prev => ({...prev, contactPhone: e.target.value}))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalInfo">Additional Information</Label>
                <Textarea
                  id="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={(e) => setFormData(prev => ({...prev, additionalInfo: e.target.value}))}
                  placeholder="Any additional details about your situation..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading} className="bg-brand-700 hover:bg-brand-800">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
                  Submit Request
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowRequestForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-brand-700">
            <Phone className="h-5 w-5" />
            Need Immediate Help?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Professional Support</h4>
              <p className="text-sm text-gray-600 mb-3">
                Our team of qualified professionals can guide you through the entire business closure process.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-green-600" />
                  <span>+353 1 234 5678</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span>closure@payvat.ie</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Office Hours</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div>Monday - Friday: 9:00 AM - 6:00 PM</div>
                <div>Saturday: 10:00 AM - 2:00 PM</div>
                <div>Sunday: Closed</div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Emergency consultations available by appointment
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}