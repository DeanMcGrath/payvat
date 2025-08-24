"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, X, ArrowUpDown, Home, RefreshCw, Video, Play, Calendar, Clock, ArrowRight, Search, FileText, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { toast } from "sonner"
import { useVATData } from "@/contexts/vat-data-context"
import { formatCurrency } from "@/lib/vatUtils"
import { useDocumentsData } from "@/hooks/useDocumentsData"
import { DocumentSection } from "@/components/dashboard/DocumentSection"
import { StatCard, StatCardGrid, DocumentsStatCard, VATStatCard, NetVATStatCard } from "@/components/dashboard/StatCard"

// This component only loads if JavaScript is working
export function EnhancedDashboard() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [showEnhanced, setShowEnhanced] = useState(false)
  const router = useRouter()
  const { selectedYear, selectedPeriod, setVATAmounts } = useVATData()
  
  // Use the documents data hook
  const {
    state: { documents, vatData, loadingDocuments, loadingVAT, error, inFallbackMode, fallbackMessage },
    actions: { refreshData, debouncedRefreshVAT, removeDocument, setDocuments },
    computed: { salesDocuments, purchaseDocuments, totalDocuments, processedDocuments }
  } = useDocumentsData()

  // Hide server content and show enhanced version when JS loads
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true)
      // Hide server dashboard and show enhanced version
      const serverDashboard = document.querySelector('[data-server-dashboard]')
      if (serverDashboard) {
        serverDashboard.classList.add('hidden')
      }
      setShowEnhanced(true)
    }, 1000) // Give 1 second for JS to load

    return () => clearTimeout(timer)
  }, [])

  if (!isLoaded || !showEnhanced) {
    return null // Keep server content visible
  }

  // Show enhanced dashboard with actual data
  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Success indicator that JS loaded */}
      <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
        <div className="flex">
          <CheckCircle className="h-5 w-5 text-green-400" />
          <div className="ml-3">
            <p className="text-sm text-green-700">
              ✅ Enhanced dashboard loaded successfully! All features are now available.
            </p>
          </div>
        </div>
      </div>

      {/* Fallback mode indicator */}
      {inFallbackMode && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                {fallbackMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Stats Grid */}
      <StatCardGrid>
        <DocumentsStatCard 
          totalDocuments={totalDocuments}
          processedDocuments={processedDocuments}
          loading={loadingDocuments}
        />
        <VATStatCard 
          label="Sales VAT"
          amount={vatData?.totalSalesVAT || 0}
          color="green"
          loading={loadingVAT}
        />
        <VATStatCard 
          label="Purchase VAT"
          amount={vatData?.totalPurchaseVAT || 0}
          color="blue"
          loading={loadingVAT}
        />
        <NetVATStatCard 
          netVAT={vatData?.totalNetVAT || 0}
          loading={loadingVAT}
        />
      </StatCardGrid>

      {/* Enhanced Document Section */}
      <DocumentSection
        documents={documents}
        loading={loadingDocuments}
        error={error}
        onRefresh={refreshData}
        onRemoveDocument={removeDocument}
      />

      {/* Debug Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-sm">Debug Information</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-gray-500">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p>Documents: {documents.length}</p>
              <p>Loading Docs: {loadingDocuments.toString()}</p>
              <p>Loading VAT: {loadingVAT.toString()}</p>
            </div>
            <div>
              <p>Fallback Mode: {inFallbackMode.toString()}</p>
              <p>Error: {error || 'None'}</p>
              <p>Enhanced: Active</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}