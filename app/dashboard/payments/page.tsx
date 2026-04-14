"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, CreditCard, AlertCircle, CheckCircle2, ArrowRight, ReceiptText } from "lucide-react"
import { formatCurrency } from "@/lib/vatUtils"
import { toast } from "sonner"

type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | string
type ReturnStatus = "DRAFT" | "SUBMITTED" | "PAID" | "OVERDUE" | string

interface PaymentItem {
  id: string
  amount: number
  currency: string
  status: PaymentStatus
  paymentMethod?: string | null
  processedAt?: string | null
  failedAt?: string | null
  failureReason?: string | null
  receiptNumber?: string | null
  createdAt: string
  vatReturn: {
    id: string
    period: string
    status: ReturnStatus
    revenueRefNumber?: string | null
    netVAT: number
  } | null
}

function statusBadge(status: PaymentStatus) {
  if (status === "COMPLETED") return <Badge className="bg-green-100 text-green-800 border-0">Paid</Badge>
  if (status === "FAILED") return <Badge className="bg-red-100 text-red-800 border-0">Blocked</Badge>
  return <Badge className="bg-amber-100 text-amber-800 border-0">Pending</Badge>
}

function returnBadge(status: ReturnStatus) {
  if (status === "PAID") return <Badge className="bg-green-100 text-green-800 border-0">Return Paid</Badge>
  if (status === "SUBMITTED") return <Badge className="bg-blue-100 text-blue-800 border-0">Return Recorded</Badge>
  if (status === "OVERDUE") return <Badge className="bg-red-100 text-red-800 border-0">Return Overdue</Badge>
  return <Badge className="bg-amber-100 text-amber-800 border-0">Draft Return</Badge>
}

export default function PaymentsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState<PaymentItem[]>([])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const response = await fetch("/api/payments?limit=50", { cache: "no-store" })
        const data = await response.json()
        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to load payments")
        }
        setPayments(data.payments || [])
      } catch (error) {
        console.error("Failed to load payments:", error)
        toast.error("Could not load payment records")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const summary = useMemo(() => {
    const pending = payments.filter((item) => item.status === "PENDING")
    const completed = payments.filter((item) => item.status === "COMPLETED")
    const totalPending = pending.reduce((sum, item) => sum + (item.amount || 0), 0)
    const totalPaid = completed.reduce((sum, item) => sum + (item.amount || 0), 0)
    return {
      count: payments.length,
      pendingCount: pending.length,
      completedCount: completed.length,
      totalPending,
      totalPaid,
    }
  }, [payments])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-14">
        <Loader2 className="h-8 w-8 animate-spin text-[#2A7A8F]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-[#B8DDF6] bg-[#F5FAFF]">
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-[#216477]">Payments handoff</p>
              <h2 className="text-xl font-normal text-[#114B5F]">Track payment completion after return recording</h2>
              <p className="mt-1 text-sm text-[#216477]">
                PayVAT tracks payment status and references. Revenue payment completion remains external in this beta.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push("/dashboard/vat-returns")}>
                Review VAT Returns
              </Button>
              <Button onClick={() => router.push("/vat-submission")}>
                Open Submission Review
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-neutral-600">Payment Records</p>
            <p className="text-2xl font-normal text-neutral-900">{summary.count}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-neutral-600">Pending Payments</p>
            <p className="text-2xl font-normal text-amber-700">{summary.pendingCount}</p>
            <p className="text-xs text-neutral-500 mt-1">{formatCurrency(summary.totalPending)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-neutral-600">Completed Payments</p>
            <p className="text-2xl font-normal text-green-700">{summary.completedCount}</p>
            <p className="text-xs text-neutral-500 mt-1">{formatCurrency(summary.totalPaid)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-neutral-600">Support</p>
            <a className="text-sm text-[#2A7A8F] underline" href="mailto:support@payvat.ie">support@payvat.ie</a>
            <p className="text-xs text-neutral-500 mt-1">Include your PayVAT tracking reference.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#114B5F]">
            <CreditCard className="h-5 w-5" />
            Payment Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center">
              <ReceiptText className="h-10 w-10 text-neutral-400 mx-auto mb-3" />
              <p className="text-neutral-900 font-normal">No payment records yet</p>
              <p className="text-sm text-neutral-600 mt-1">
                Record a guided submission with VAT due to create a payment handoff record.
              </p>
              <Button className="mt-4" onClick={() => router.push("/vat-submission")}>
                Go to VAT Submission
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div key={payment.id} className="rounded-lg border bg-white p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {statusBadge(payment.status)}
                        {payment.vatReturn ? returnBadge(payment.vatReturn.status) : null}
                      </div>
                      <p className="text-sm text-neutral-900">
                        {payment.vatReturn?.period || "Unlinked period"}
                      </p>
                      <p className="text-xs text-neutral-600">
                        PayVAT tracking reference: {payment.vatReturn?.revenueRefNumber || "Not yet available"}
                      </p>
                      {payment.failureReason ? (
                        <p className="flex items-center gap-1 text-xs text-red-700">
                          <AlertCircle className="h-3 w-3" />
                          {payment.failureReason}
                        </p>
                      ) : null}
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-lg font-normal text-neutral-900">{formatCurrency(payment.amount)}</p>
                      <p className="text-xs text-neutral-500">
                        Created {new Date(payment.createdAt).toLocaleDateString("en-IE")}
                      </p>
                      {payment.processedAt ? (
                        <p className="text-xs text-green-700 mt-1 inline-flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Processed {new Date(payment.processedAt).toLocaleDateString("en-IE")}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
