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

export default function VATReturnsPage() {
  const router = useRouter()
  const [pastReturns, setPastReturns] = useState<VATReturn[]>([])
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
        return <Clock className="h-5 w-5 text-petrol-base" />
      case 'OVERDUE':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <FileText className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge className="bg-green-100 text-green-800 border-0">Paid</Badge>
      case 'SUBMITTED':
        return <Badge className="bg-blue-100 text-blue-800 border-0">Submitted</Badge>
      case 'OVERDUE':
        return <Badge className="bg-red-100 text-red-800 border-0">Blocked</Badge>
      case 'DRAFT':
        return <Badge className="bg-amber-100 text-amber-800 border-0">Draft</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
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
                <p className="h3 text-petrol-dark">{stats.totalSubmitted}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-petrol-dark" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Payments Made</p>
                <p className="text-2xl font-normal text-green-600">{stats.totalPaid}</p>
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
                <p className="text-2xl font-normal text-purple-600">
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
                <p className="text-2xl font-normal text-petrol-base">{stats.onTimeSubmissions}%</p>
              </div>
              <Clock className="h-8 w-8 text-petrol-base" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Draft */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-petrol-dark">
              <Calendar className="h-5 w-5" />
              Current Draft Return
            </CardTitle>
            <Button onClick={() => router.push('/vat-submission')}>
              <Plus className="h-4 w-4 mr-2" />
              Open Submission Review
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {pastReturns.find((item) => item.status === 'DRAFT') ? (
            <div className="space-y-4">
              {(() => {
                const draftReturn = pastReturns.find((item) => item.status === 'DRAFT')!
                return (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-amber-900">Draft period</p>
                        <h4 className="font-normal text-amber-900">
                          {new Date(draftReturn.periodStart).toLocaleDateString()} - {new Date(draftReturn.periodEnd).toLocaleDateString()}
                        </h4>
                        <p className="text-xs text-amber-800 mt-1">
                          Due: {new Date(draftReturn.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      {getStatusBadge(draftReturn.status)}
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-amber-800">Sales VAT</p>
                        <p className="text-lg font-normal text-amber-900">{formatCurrency(Number(draftReturn.salesVAT))}</p>
                      </div>
                      <div>
                        <p className="text-xs text-amber-800">Purchase VAT</p>
                        <p className="text-lg font-normal text-amber-900">{formatCurrency(Number(draftReturn.purchaseVAT))}</p>
                      </div>
                      <div>
                        <p className="text-xs text-amber-800">Net VAT</p>
                        <p className="text-lg font-normal text-amber-900">{formatCurrency(Number(draftReturn.netVAT))}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" onClick={() => router.push(`/vat-submission?returnId=${draftReturn.id}`)}>
                        Continue Draft Review
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/documents')}>
                        Review Source Documents
                      </Button>
                    </div>
                  </div>
                )
              })()}
              <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-700">
                Forecast-style upcoming returns are hidden in paid beta until they are generated from live document data.
              </div>
              <div className="rounded-md border border-[#B8DDF6] bg-[#F5FAFF] p-3 text-xs text-[#216477]">
                Need help reviewing your draft? Contact <a href="mailto:support@payvat.ie" className="underline">support@payvat.ie</a> or read <a href="/beta-limitations" className="underline">How PayVAT works today</a>.
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No draft return yet</p>
              <p className="text-sm mt-1">Upload and review documents to prepare the next return.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Returns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-petrol-dark">
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
                      <p className="text-sm font-normal text-gray-900">
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
                      className="text-petrol-dark border-petrol-700 hover:bg-petrol-50"
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
              <h3 className="text-lg font-normal text-gray-900 mb-2">No VAT Returns Yet</h3>
              <p className="text-gray-500 mb-4">
                Start by uploading your documents and creating your first VAT return
              </p>
              <Button 
                onClick={() => router.push('/vat-submission')}
                className="bg-petrol-dark hover:bg-petrol-dark text-white"
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
