"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Calculator, 
  Calendar, 
  Clock, 
  CheckCircle,
  FileText,
  Download,
  Plus,
  ArrowRight,
  Loader2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Euro
} from "lucide-react"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/vatUtils"

interface VATReturn {
  id: string
  periodStart: string
  periodEnd: string
  dueDate: string
  salesVAT: number
  purchaseVAT: number
  netVAT: number
  status: 'DRAFT' | 'SUBMITTED' | 'PAID' | 'OVERDUE'
  submittedAt?: string
  paidAt?: string
  revenueRefNumber?: string
  paymentConfirmation?: string
  estimatedFromDocuments?: boolean
  documentCount?: number
}

interface UpcomingReturn {
  id: string
  periodStart: string
  periodEnd: string
  dueDate: string
  estimatedSalesVAT: number
  estimatedPurchaseVAT: number
  estimatedNetVAT: number
  documentCount: number
  confidence: 'high' | 'medium' | 'low'
  isOverdue: boolean
  daysUntilDue: number
}

export default function VATReturnsPage() {
  const router = useRouter()
  const [pastReturns, setPastReturns] = useState<VATReturn[]>([])
  const [upcomingReturns, setUpcomingReturns] = useState<UpcomingReturn[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalSubmitted: 0,
    totalPaid: 0,
    averageNetVAT: 0,
    onTimeSubmissions: 0
  })

  useEffect(() => {
    loadVATReturnsData()
  }, [])

  const loadVATReturnsData = async () => {
    try {
      setLoading(true)

      // Load past returns from API
      const returnsResponse = await fetch('/api/vat')
      if (returnsResponse.ok) {
        const returnsData = await returnsResponse.json()
        if (returnsData.success && returnsData.vatReturns) {
          setPastReturns(returnsData.vatReturns)
          
          // Calculate stats
          const submitted = returnsData.vatReturns.filter((r: VATReturn) => 
            r.status === 'SUBMITTED' || r.status === 'PAID'
          ).length
          const paid = returnsData.vatReturns.filter((r: VATReturn) => r.status === 'PAID').length
          const avgNet = returnsData.vatReturns.reduce((sum: number, r: VATReturn) => 
            sum + parseFloat(r.netVAT.toString()), 0
          ) / returnsData.vatReturns.length || 0
          
          setStats({
            totalSubmitted: submitted,
            totalPaid: paid,
            averageNetVAT: avgNet,
            onTimeSubmissions: Math.round((submitted / returnsData.vatReturns.length) * 100) || 0
          })
        }
      }

      // Mock upcoming returns data - replace with real API call based on document analysis
      const currentDate = new Date()
      const mockUpcomingReturns: UpcomingReturn[] = [
        {
          id: 'upcoming-1',
          periodStart: '2024-11-01',
          periodEnd: '2024-12-31',
          dueDate: '2025-01-19',
          estimatedSalesVAT: 2850.50,
          estimatedPurchaseVAT: 1200.75,
          estimatedNetVAT: 1649.75,
          documentCount: 45,
          confidence: 'high',
          isOverdue: false,
          daysUntilDue: Math.ceil((new Date('2025-01-19').getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
        },
        {
          id: 'upcoming-2',
          periodStart: '2025-01-01',
          periodEnd: '2025-02-28',
          dueDate: '2025-03-19',
          estimatedSalesVAT: 0,
          estimatedPurchaseVAT: 0,
          estimatedNetVAT: 0,
          documentCount: 0,
          confidence: 'low',
          isOverdue: false,
          daysUntilDue: Math.ceil((new Date('2025-03-19').getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))
        }
      ]
      
      setUpcomingReturns(mockUpcomingReturns)

    } catch (error) {
      console.error('Failed to load VAT returns data:', error)
      toast.error('Failed to load VAT returns information')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'SUBMITTED':
        return <Clock className="h-5 w-5 text-blue-600" />
      case 'OVERDUE':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <FileText className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>
      case 'SUBMITTED':
        return <Badge className="bg-blue-100 text-blue-800">Submitted</Badge>
      case 'OVERDUE':
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>
      case 'DRAFT':
        return <Badge variant="secondary">Draft</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'text-green-600 bg-green-50'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50'
      case 'low':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
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
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Submitted</p>
                <p className="h3 text-brand-700">{stats.totalSubmitted}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-brand-700" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Payments Made</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalPaid}</p>
              </div>
              <Euro className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Net VAT</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(stats.averageNetVAT)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">On Time Rate</p>
                <p className="text-2xl font-bold text-blue-600">{stats.onTimeSubmissions}%</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Returns */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-brand-700">
              <Calendar className="h-5 w-5" />
              Upcoming VAT Returns
            </CardTitle>
            <Button onClick={() => router.push('/vat-submission')}>
              <Plus className="h-4 w-4 mr-2" />
              New Return
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {upcomingReturns.length > 0 ? (
            <div className="space-y-4">
              {upcomingReturns.map((upcomingReturn) => (
                <div
                  key={upcomingReturn.id}
                  className={`p-4 rounded-lg border ${
                    upcomingReturn.isOverdue 
                      ? 'border-red-200 bg-red-50' 
                      : upcomingReturn.daysUntilDue <= 7
                      ? 'border-yellow-200 bg-yellow-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium">
                        {new Date(upcomingReturn.periodStart).toLocaleDateString()} - {new Date(upcomingReturn.periodEnd).toLocaleDateString()}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Due: {new Date(upcomingReturn.dueDate).toLocaleDateString()}
                        <span className={`ml-2 ${
                          upcomingReturn.daysUntilDue <= 7 ? 'text-yellow-600' : 'text-gray-500'
                        }`}>
                          ({upcomingReturn.daysUntilDue} days)
                        </span>
                      </p>
                    </div>
                    <Badge className={`${getConfidenceColor(upcomingReturn.confidence)} border-0`}>
                      {upcomingReturn.confidence} confidence
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600">
                        {formatCurrency(upcomingReturn.estimatedSalesVAT)}
                      </div>
                      <div className="text-xs text-gray-500">Sales VAT</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">
                        {formatCurrency(upcomingReturn.estimatedPurchaseVAT)}
                      </div>
                      <div className="text-xs text-gray-500">Purchase VAT</div>
                    </div>
                    <div className="text-center">
                      <div className="h6 text-brand-700">
                        {formatCurrency(upcomingReturn.estimatedNetVAT)}
                      </div>
                      <div className="text-xs text-gray-500">Net VAT</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-600">
                        {upcomingReturn.documentCount}
                      </div>
                      <div className="text-xs text-gray-500">Documents</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => router.push(`/vat-submission?period=${upcomingReturn.periodStart}-${upcomingReturn.periodEnd}`)}
                    >
                      Start Return
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                    {upcomingReturn.documentCount === 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push('/dashboard/documents')}
                      >
                        Upload Documents
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No upcoming returns</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Returns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-brand-700">
            <Calculator className="h-5 w-5" />
            Past VAT Returns
            {pastReturns.length > 0 && (
              <Badge variant="secondary">{pastReturns.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pastReturns.length > 0 ? (
            <div className="space-y-3">
              {pastReturns.map((vatReturn) => (
                <div key={vatReturn.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getStatusIcon(vatReturn.status)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(vatReturn.periodStart).toLocaleDateString()} - {new Date(vatReturn.periodEnd).toLocaleDateString()}
                      </p>
                      <div className="flex items-center space-x-4 mt-1">
                        {getStatusBadge(vatReturn.status)}
                        <span className="text-xs text-gray-500">
                          Sales: {formatCurrency(parseFloat(vatReturn.salesVAT.toString()))} • 
                          Purchase: {formatCurrency(parseFloat(vatReturn.purchaseVAT.toString()))} • 
                          Net: {formatCurrency(parseFloat(vatReturn.netVAT.toString()))}
                        </span>
                      </div>
                      {vatReturn.revenueRefNumber && (
                        <p className="text-xs text-gray-500 mt-1">
                          Ref: {vatReturn.revenueRefNumber}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/vat-submission?returnId=${vatReturn.id}`)}
                      className="text-brand-700 border-brand-700 hover:bg-brand-50"
                    >
                      {vatReturn.status === 'DRAFT' ? 'Continue' : 'View Details'}
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                    {(vatReturn.status === 'SUBMITTED' || vatReturn.status === 'PAID') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Handle document download
                          toast.info('Downloading receipt...')
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              {pastReturns.length > 10 && (
                <div className="text-center pt-4">
                  <Button variant="outline">
                    View All Returns ({pastReturns.length})
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No VAT Returns Yet</h3>
              <p className="text-gray-500 mb-4">
                Start by uploading your documents and creating your first VAT return
              </p>
              <Button 
                onClick={() => router.push('/vat-submission')}
                className="bg-brand-700 hover:bg-brand-800 text-white"
              >
                Create First VAT Return
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}