"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, FileText, Building, Calendar, Euro, Shield, CheckCircle, Clock, Send, Loader2 } from 'lucide-react'
import { useRouter } from "next/navigation"
import { useVATData } from "@/contexts/vat-data-context"
import { formatEuroAmount, getPeriodLabel } from "@/lib/vat-utils"
import Link from "next/link"

interface VAT3FormData {
  traderName: string
  registrationNumber: string
  filingFrequency: string
  periodBeginDate: string
  periodEndDate: string
  returnType: string
  t1VATOnSales: string
  t2VATOnPurchases: string
  unusualExpenditure: string
  unusualAmount: string
  unusualDetails: string
  t3NetPayable: string
  t4NetRepayable: string
  e1TotalGoodsTo: string
  e2TotalGoodsFrom: string
  es1TotalServicesTo: string
  es2TotalServicesFrom: string
  pa1PostponedAccounting: string
}

export default function ConfirmationPayment() {
  const [formData, setFormData] = useState<VAT3FormData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const router = useRouter()
  const { selectedYear, selectedPeriod } = useVATData()

  useEffect(() => {
    // Retrieve form data from localStorage
    const savedData = localStorage.getItem('vat3_submission_data')
    if (savedData) {
      try {
        setFormData(JSON.parse(savedData))
      } catch (error) {
        console.error('Error parsing saved form data:', error)
        // Redirect back to VAT3 form if data is corrupted
        router.push('/vat3-return')
      }
    } else {
      // No saved data, redirect to VAT3 form
      router.push('/vat3-return')
    }
  }, [router])

  const handleConfirmSubmission = async () => {
    if (!formData) return
    
    setIsSubmitting(true)
    
    try {
      // Simulate API call for submission
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Clear saved form data
      localStorage.removeItem('vat3_submission_data')
      
      // Show success modal
      setShowSuccessModal(true)
    } catch (error) {
      console.error('Error submitting VAT return:', error)
      setIsSubmitting(false)
    }
  }

  const handlePrintPage = () => {
    window.print()
  }

  const handleReturnToDashboard = () => {
    router.push('/dashboard')
  }

  const calculateNetAmount = () => {
    if (!formData) return { amount: 0, type: 'payable' }
    
    const t1 = parseFloat(formData.t1VATOnSales) || 0
    const t2 = parseFloat(formData.t2VATOnPurchases) || 0
    const difference = t1 - t2
    
    return {
      amount: Math.abs(difference),
      type: difference >= 0 ? 'payable' : 'repayable'
    }
  }

  if (!formData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Loading confirmation...</span>
        </div>
      </div>
    )
  }

  const netAmount = calculateNetAmount()

  return (
    <div className="min-h-screen bg-background">
      {/* Modern Header */}
      <header className="gradient-primary relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 gradient-mesh opacity-30"></div>
        
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center">
                <Link href="/" className="text-2xl font-thin text-white tracking-tight hover:text-white/90 transition-colors">
                  PayVAT
                </Link>
              </div>
            </div>
          </div>
          
          {/* Modern Navigation */}
          <nav className="border-t border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-8">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => router.back()}
                    className="text-white/90 hover:text-white flex items-center space-x-2 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Go Back</span>
                  </Button>
                  <span className="text-white/90 text-sm font-medium flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>Confirm VAT Return Submission</span>
                  </span>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-16 lg:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <div className="max-w-4xl mx-auto animate-fade-in">
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 animate-bounce-gentle">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse-gentle"></div>
                  Final Review Required
                </div>
                
                <div className="icon-premium mb-4 mx-auto">
                  <FileText className="h-12 w-12 text-white" />
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-3">
                  <span className="text-gradient-primary">Confirm Your</span>
                  <br />
                  <span className="text-foreground">VAT Return Submission</span>
                </h1>
                
                <div className="w-32 h-1 gradient-primary mx-auto mb-4 rounded-full"></div>
                
                <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Review your VAT3 return details below before final submission.
                  <span className="text-primary font-semibold"> All information must be accurate and complete.</span>
                </p>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex items-center justify-center gap-8 text-muted-foreground text-sm mb-12">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-success" />
                  <span>Revenue compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>Secure transmission</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-success" />
                  <span>Instant processing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* VAT Return Summary */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Business Information */}
            <Card className="card-premium hover-lift">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-foreground flex items-center">
                  <Building className="h-5 w-5 mr-2 text-primary" />
                  Business Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Trader Name</p>
                    <p className="font-semibold text-foreground">{formData.traderName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Registration Number</p>
                    <p className="font-mono font-semibold text-foreground">{formData.registrationNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Filing Frequency</p>
                    <p className="font-semibold text-foreground capitalize">{formData.filingFrequency.replace('-', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Return Type</p>
                    <p className="font-semibold text-foreground capitalize">{formData.returnType} VAT3</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Period Information */}
            <Card className="card-premium hover-lift">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-foreground flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  Period Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Period</p>
                    <p className="font-semibold text-foreground">{getPeriodLabel(selectedPeriod || 'jan-feb')} {selectedYear || '2025'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Period Dates</p>
                    <p className="font-semibold text-foreground">
                      {new Date(formData.periodBeginDate).toLocaleDateString('en-IE')} - {new Date(formData.periodEndDate).toLocaleDateString('en-IE')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* VAT Amounts */}
            <Card className="card-premium hover-lift">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-foreground flex items-center">
                  <Euro className="h-5 w-5 mr-2 text-primary" />
                  VAT Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-700 font-medium mb-1">VAT on Sales (T1)</p>
                      <p className="text-2xl font-bold text-green-800">€{formData.t1VATOnSales}</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-700 font-medium mb-1">VAT on Purchases (T2)</p>
                      <p className="text-2xl font-bold text-blue-800">€{formData.t2VATOnPurchases}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className={`p-6 rounded-xl border-2 text-center ${netAmount.type === 'payable' 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-green-50 border-green-200'
                    }`}>
                      <p className={`text-sm font-medium mb-2 ${netAmount.type === 'payable' 
                        ? 'text-red-700' 
                        : 'text-green-700'
                      }`}>
                        Net {netAmount.type === 'payable' ? 'Payable (T3)' : 'Repayable (T4)'}
                      </p>
                      <p className={`text-3xl font-bold ${netAmount.type === 'payable' 
                        ? 'text-red-800' 
                        : 'text-green-800'
                      }`}>
                        €{netAmount.amount}
                      </p>
                    </div>
                  </div>
                </div>

                {/* EU Trade Summary */}
                {(parseFloat(formData.e1TotalGoodsTo) > 0 || parseFloat(formData.e2TotalGoodsFrom) > 0 || 
                  parseFloat(formData.es1TotalServicesTo) > 0 || parseFloat(formData.es2TotalServicesFrom) > 0) && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <h4 className="text-lg font-semibold text-foreground mb-4">Intra-EU Trade</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Goods To (E1)</p>
                        <p className="font-semibold">€{formData.e1TotalGoodsTo}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Goods From (E2)</p>
                        <p className="font-semibold">€{formData.e2TotalGoodsFrom}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Services To (ES1)</p>
                        <p className="font-semibold">€{formData.es1TotalServicesTo}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Services From (ES2)</p>
                        <p className="font-semibold">€{formData.es2TotalServicesFrom}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Unusual Expenditure */}
                {formData.unusualExpenditure === 'yes' && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <h4 className="text-lg font-semibold text-foreground mb-4">Unusual Expenditure</h4>
                    <div className="space-y-2">
                      <div>
                        <p className="text-muted-foreground">Amount (excl. VAT)</p>
                        <p className="font-semibold">€{formData.unusualAmount}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Details</p>
                        <p className="text-sm bg-muted p-3 rounded-lg">{formData.unusualDetails}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Confirmation Sidebar */}
          <div className="space-y-6">
            <Card className="card-premium sticky top-6">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-foreground">Final Confirmation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">Declaration</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        By proceeding, you confirm that the information provided is accurate, complete, and complies with Revenue requirements.
                      </p>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleConfirmSubmission}
                  disabled={isSubmitting}
                  className="w-full btn-primary px-6 py-4 text-lg font-semibold hover-scale shadow-lg"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Confirm to Submit and Pay VAT Return
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <Button 
                    variant="ghost" 
                    onClick={() => router.back()}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Go Back to Edit
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* What happens next */}
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">What Happens Next?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Return submitted to Revenue instantly</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Payment processed automatically</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Confirmation receipt generated</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>
          <div className="relative glass-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 max-w-md w-full mx-4 shadow-premium">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-success/10 rounded-full mb-4">
                <CheckCircle className="h-10 w-10 text-success" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Submission Complete</h3>
                <p className="text-muted-foreground">
                  Your VAT3 return has been successfully submitted to Revenue.
                </p>
              </div>

              <div className="flex flex-col space-y-3">
                <Button 
                  onClick={handlePrintPage}
                  variant="outline"
                  className="w-full glass-white/10 backdrop-blur-sm border-white/20"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Print Page
                </Button>
                
                <Button 
                  onClick={handleReturnToDashboard}
                  className="w-full btn-primary"
                >
                  Return to Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}