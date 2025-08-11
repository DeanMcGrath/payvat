"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Euro, Bell, Settings, LogOut, Search, Save, Send, ArrowUp, FileText, Shield, CheckCircle, Clock, Sparkles, AlertCircle } from "lucide-react"
import LiveChat from "../../components/live-chat"
import { useVATData } from "@/contexts/vat-data-context"
import { convertToWholeEurosString, calculatePeriodDates, formatEuroAmount } from "@/lib/vat-utils"
import { Badge } from "@/components/ui/badge"

export default function VAT3ReturnForm() {
  const { 
    userProfile, 
    selectedYear, 
    selectedPeriod, 
    periodBeginDate, 
    periodEndDate,
    totalSalesVAT, 
    totalPurchaseVAT, 
    loadUserProfile 
  } = useVATData()
  
  const [formData, setFormData] = useState({
    traderName: "",
    registrationNumber: "",
    filingFrequency: "bi-monthly",
    periodBeginDate: "",
    periodEndDate: "",
    returnType: "original",
    t1VATOnSales: "",
    t2VATOnPurchases: "",
    unusualExpenditure: "no",
    unusualAmount: "",
    unusualDetails: "",
    t3NetPayable: "0",
    t4NetRepayable: "0",
    e1TotalGoodsTo: "0",
    e2TotalGoodsFrom: "0",
    es1TotalServicesTo: "0",
    es2TotalServicesFrom: "0",
    pa1PostponedAccounting: "0",
  })

  const [isSaving, setIsSaving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [autoFilledFields, setAutoFilledFields] = useState<string[]>([])
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  
  const router = useRouter()

  // Autofill form on component mount and when context data changes
  useEffect(() => {
    console.log('VAT3 Autofill Debug:', {
      userProfile: userProfile,
      periodBeginDate: periodBeginDate,
      periodEndDate: periodEndDate,
      totalSalesVAT: totalSalesVAT,
      totalPurchaseVAT: totalPurchaseVAT,
      selectedYear: selectedYear,
      selectedPeriod: selectedPeriod
    })

    let fieldsToAutofill: string[] = []
    let updatedFormData: typeof formData = {
      traderName: formData.traderName,
      registrationNumber: formData.registrationNumber,
      filingFrequency: formData.filingFrequency,
      periodBeginDate: formData.periodBeginDate,
      periodEndDate: formData.periodEndDate,
      returnType: formData.returnType,
      t1VATOnSales: formData.t1VATOnSales,
      t2VATOnPurchases: formData.t2VATOnPurchases,
      unusualExpenditure: formData.unusualExpenditure,
      unusualAmount: formData.unusualAmount,
      unusualDetails: formData.unusualDetails,
      t3NetPayable: formData.t3NetPayable,
      t4NetRepayable: formData.t4NetRepayable,
      e1TotalGoodsTo: formData.e1TotalGoodsTo,
      e2TotalGoodsFrom: formData.e2TotalGoodsFrom,
      es1TotalServicesTo: formData.es1TotalServicesTo,
      es2TotalServicesFrom: formData.es2TotalServicesFrom,
      pa1PostponedAccounting: formData.pa1PostponedAccounting,
    }

    // Load user profile if not already loaded
    if (!userProfile) {
      loadUserProfile()
    }

    // 1. Autofill Registration Details from user profile
    if (userProfile) {
      if (userProfile.businessName) {
        updatedFormData.traderName = userProfile.businessName
        fieldsToAutofill.push('traderName')
      } else if (userProfile.firstName && userProfile.lastName) {
        updatedFormData.traderName = `${userProfile.firstName} ${userProfile.lastName}`
        fieldsToAutofill.push('traderName')
      }
      
      if (userProfile.vatNumber) {
        updatedFormData.registrationNumber = userProfile.vatNumber
        fieldsToAutofill.push('registrationNumber')
      }
    }

    // 2. Autofill Period Details from context
    if (periodBeginDate && periodEndDate) {
      updatedFormData.periodBeginDate = periodBeginDate
      updatedFormData.periodEndDate = periodEndDate
      fieldsToAutofill.push('periodBeginDate', 'periodEndDate')
      console.log('Period dates autofilled:', periodBeginDate, periodEndDate)
    } else {
      console.log('No period dates available in context')
    }

    // 3. Autofill VAT amounts from context (convert to whole euros)
    if (totalSalesVAT > 0) {
      const roundedSalesVAT = convertToWholeEurosString(totalSalesVAT)
      updatedFormData.t1VATOnSales = roundedSalesVAT
      fieldsToAutofill.push('t1VATOnSales')
      console.log('Sales VAT autofilled:', totalSalesVAT, '→', roundedSalesVAT)
    }
    
    if (totalPurchaseVAT > 0) {
      const roundedPurchaseVAT = convertToWholeEurosString(totalPurchaseVAT)
      updatedFormData.t2VATOnPurchases = roundedPurchaseVAT
      fieldsToAutofill.push('t2VATOnPurchases')
      console.log('Purchase VAT autofilled:', totalPurchaseVAT, '→', roundedPurchaseVAT)
    }

    // Update state if there are changes
    if (fieldsToAutofill.length > 0) {
      console.log('Autofilling fields:', fieldsToAutofill)
      setFormData(updatedFormData)
      setAutoFilledFields(fieldsToAutofill)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile, periodBeginDate, periodEndDate, totalSalesVAT, totalPurchaseVAT, selectedYear, selectedPeriod])

  // Auto-calculate T3 and T4 based on T1 and T2
  useEffect(() => {
    const t1 = Number.parseFloat(formData.t1VATOnSales) || 0
    const t2 = Number.parseFloat(formData.t2VATOnPurchases) || 0
    const difference = t1 - t2

    if (difference > 0) {
      setFormData((prev) => ({
        ...prev,
        t3NetPayable: difference.toString(),
        t4NetRepayable: "0",
      }))
    } else if (difference < 0) {
      setFormData((prev) => ({
        ...prev,
        t3NetPayable: "0",
        t4NetRepayable: Math.abs(difference).toString(),
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        t3NetPayable: "0",
        t4NetRepayable: "0",
      }))
    }
  }, [formData.t1VATOnSales, formData.t2VATOnPurchases])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Remove from auto-filled list when user manually changes a field
    if (autoFilledFields.includes(field)) {
      setAutoFilledFields(prev => prev.filter(f => f !== field))
    }
  }

  // Helper component for autofill badge
  const AutoFillBadge = ({ fieldName, children }: { fieldName: string, children: React.ReactNode }) => (
    <div className="relative">
      {children}
      {autoFilledFields.includes(fieldName) && (
        <Badge 
          variant="secondary" 
          className="absolute -top-2 -right-2 text-xs bg-green-100 text-green-800 hover:bg-green-100"
        >
          <Sparkles className="h-3 w-3 mr-1" />
          Auto-filled
        </Badge>
      )}
    </div>
  )

  const handleSaveDraft = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log("Draft saved:", formData)
    setIsSaving(false)
  }

  // Form validation function
  const validateForm = (): string[] => {
    const errors: string[] = []
    
    // Required field validation
    if (!formData.traderName?.trim()) {
      errors.push('Trader Name is required')
    }
    if (!formData.registrationNumber?.trim()) {
      errors.push('Registration Number is required')
    }
    if (!formData.periodBeginDate) {
      errors.push('Period Begin Date is required')
    }
    if (!formData.periodEndDate) {
      errors.push('Period End Date is required')
    }
    if (!formData.t1VATOnSales || parseFloat(formData.t1VATOnSales) < 0) {
      errors.push('VAT on Sales (T1) must be a valid positive number')
    }
    if (!formData.t2VATOnPurchases || parseFloat(formData.t2VATOnPurchases) < 0) {
      errors.push('VAT on Purchases (T2) must be a valid positive number')
    }
    
    // Unusual expenditure validation
    if (formData.unusualExpenditure === 'yes') {
      if (!formData.unusualAmount || parseFloat(formData.unusualAmount) <= 0) {
        errors.push('Unusual expenditure amount is required when unusual expenditure is Yes')
      }
      if (!formData.unusualDetails?.trim()) {
        errors.push('Unusual expenditure details are required when unusual expenditure is Yes')
      }
    }
    
    return errors
  }

  const handleSubmitReturn = async () => {
    // Validate form before submission
    const errors = validateForm()
    if (errors.length > 0) {
      setValidationErrors(errors)
      // Scroll to top to show errors
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    
    setValidationErrors([])
    setIsSubmitting(true)
    
    try {
      // Store form data in localStorage for confirmation page
      localStorage.setItem('vat3_submission_data', JSON.stringify(formData))
      
      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 1500))
      
      // Navigate to confirmation page
      router.push('/confirmation-payment')
    } catch (error) {
      console.error('Error submitting return:', error)
      setValidationErrors(['An error occurred while submitting your return. Please try again.'])
    } finally {
      setIsSubmitting(false)
    }
  }

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
              
              {/* Header Actions */}
              <div className="flex items-center space-x-4">
                {/* Search - Desktop */}
                <div className="hidden lg:flex items-center space-x-3">
                  <div className="relative">
                    <Input
                      placeholder="Search VAT forms..."
                      className="w-64 xl:w-80 bg-white/10 text-white placeholder-white/70 border-white/20 backdrop-blur-sm focus:bg-white/15 focus:border-white/40"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70" />
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/10 lg:hidden glass-white/10 backdrop-blur-sm border-white/20"
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/10 glass-white/10 backdrop-blur-sm border-white/20 relative"
                  >
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-warning rounded-full animate-pulse-gentle"></span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/10 hidden sm:flex glass-white/10 backdrop-blur-sm border-white/20"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/10 hidden sm:flex glass-white/10 backdrop-blur-sm border-white/20"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Modern Navigation */}
          <nav className="border-t border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-8">
                  <span className="text-white/90 text-sm font-medium flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>VAT3 Return Form</span>
                  </span>
                </div>
                <div className="text-white/60 text-xs hidden sm:block">
                  Complete your VAT return submission
                </div>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            {/* Hero Content */}
            <div className="max-w-4xl mx-auto animate-fade-in">
              <div className="mb-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3 animate-bounce-gentle">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse-gentle"></div>
                  Revenue compliant VAT3 submission
                </div>
                
                <div className="icon-premium mb-3 mx-auto">
                  <FileText className="h-12 w-12 text-white" />
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-2">
                  <span className="text-gradient-primary">Complete Your</span>
                  <br />
                  <span className="text-foreground">VAT3 Return</span>
                </h1>
                
                <div className="w-32 h-1 gradient-primary mx-auto mb-4 rounded-full"></div>
                
                <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Submit your VAT3 return with confidence using our expert-guided form. 
                  <span className="text-primary font-semibold">All fields validated and Revenue-ready.</span>
                </p>
                
                <div className="mt-4 text-sm text-muted-foreground">
                  <span className="text-primary">*</span> Denotes Required field
                </div>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex items-center justify-center gap-8 text-muted-foreground text-sm mb-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-success" />
                  <span>Revenue compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>Auto-calculations</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-success" />
                  <span>Save & resume</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Background Elements */}
          <div className="absolute top-20 left-10 w-16 h-16 gradient-accent rounded-full blur-xl opacity-20 animate-float"></div>
          <div className="absolute top-32 right-20 w-12 h-12 gradient-primary rounded-full blur-lg opacity-30 animate-float" style={{animationDelay: '-2s'}}></div>
          <div className="absolute bottom-20 left-20 w-20 h-20 gradient-glass rounded-full blur-2xl opacity-25 animate-float" style={{animationDelay: '-4s'}}></div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <Card className="border-red-200 bg-red-50 mb-2">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-red-800 font-semibold mb-1">Please correct the following errors:</h3>
                  <ul className="text-red-700 text-sm space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index} className="flex items-start space-x-1">
                        <span className="text-red-500">•</span>
                        <span>{error}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {/* Registration Details */}
          <Card className="card-modern hover-lift">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground">Registration Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-base font-medium text-foreground">Trader Name *</Label>
                  <AutoFillBadge fieldName="traderName">
                    <Input
                      value={formData.traderName}
                      onChange={(e) => handleInputChange("traderName", e.target.value)}
                      className="bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500 text-gray-900 text-base"
                    />
                  </AutoFillBadge>
                </div>
                <div className="space-y-2">
                  <Label className="text-base font-medium text-foreground">Registration Number *</Label>
                  <AutoFillBadge fieldName="registrationNumber">
                    <Input
                      value={formData.registrationNumber}
                      onChange={(e) => handleInputChange("registrationNumber", e.target.value)}
                      className="bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500 text-gray-900 text-base"
                    />
                  </AutoFillBadge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filing Frequency */}
          <Card className="card-modern hover-lift">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground">Filing Frequency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Label className="text-base font-medium text-foreground">Please indicate Filing Frequency *</Label>
                <RadioGroup
                  value={formData.filingFrequency}
                  onValueChange={(value) => handleInputChange("filingFrequency", value)}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bi-monthly" id="bi-monthly" />
                    <Label htmlFor="bi-monthly" className="text-base text-gray-700 font-medium">
                      Bi-Monthly / Repayment Only
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="four-monthly" id="four-monthly" />
                    <Label htmlFor="four-monthly" className="text-base text-gray-700 font-medium">
                      Four Monthly
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bi-annual" id="bi-annual" />
                    <Label htmlFor="bi-annual" className="text-base text-gray-700 font-medium">
                      Bi-Annual
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other" className="text-base text-gray-700 font-medium">
                      Other
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Period Details */}
          <Card className="card-modern hover-lift">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground">Period Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-base font-semibold text-foreground">Please enter period dates</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-base font-medium text-foreground">Period Begin Date *</Label>
                    <div className="text-sm text-gray-600 mb-1">(dd/mm/yyyy)</div>
                    <AutoFillBadge fieldName="periodBeginDate">
                      <Input
                        type="date"
                        value={formData.periodBeginDate}
                        onChange={(e) => handleInputChange("periodBeginDate", e.target.value)}
                        className="bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500 text-gray-900 text-base"
                      />
                    </AutoFillBadge>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base font-medium text-foreground">Period End Date *</Label>
                    <div className="text-sm text-gray-600 mb-1">(dd/mm/yyyy)</div>
                    <AutoFillBadge fieldName="periodEndDate">
                      <Input
                        type="date"
                        value={formData.periodEndDate}
                        onChange={(e) => handleInputChange("periodEndDate", e.target.value)}
                        className="bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500 text-gray-900 text-base"
                      />
                    </AutoFillBadge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Return Details */}
          <Card className="card-modern hover-lift">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground">Return Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Label className="text-base font-medium text-foreground">
                  Please indicate the type of return you wish to file *
                </Label>
                <RadioGroup
                  value={formData.returnType}
                  onValueChange={(value) => handleInputChange("returnType", value)}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="original" id="original" />
                    <Label htmlFor="original" className="text-base text-gray-700 font-medium">
                      Original VAT3
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="supplementary" id="supplementary" />
                    <Label htmlFor="supplementary" className="text-base text-gray-700 font-medium">
                      Supplementary VAT3
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="amended" id="amended" />
                    <Label htmlFor="amended" className="text-base text-gray-700 font-medium">
                      Amended VAT3
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* VAT3 Details */}
          <Card className="card-modern hover-lift">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground">VAT3 Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-base font-semibold text-foreground">Whole Euro only. Please do not enter cent.</div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Label className="text-base font-medium text-foreground">VAT on Sales *</Label>
                      <Label className="font-bold text-base text-gray-800">T1</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Euro className="h-4 w-4 text-gray-600" />
                      <AutoFillBadge fieldName="t1VATOnSales">
                        <Input
                          type="number"
                          value={formData.t1VATOnSales}
                          onChange={(e) => handleInputChange("t1VATOnSales", e.target.value)}
                          className="w-32 text-right bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500 text-gray-900 text-base"
                          placeholder="0"
                        />
                      </AutoFillBadge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Label className="text-base font-medium text-foreground">VAT on Purchases *</Label>
                      <Label className="font-bold text-base text-gray-800">T2</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Euro className="h-4 w-4 text-gray-600" />
                      <AutoFillBadge fieldName="t2VATOnPurchases">
                        <Input
                          type="number"
                          value={formData.t2VATOnPurchases}
                          onChange={(e) => handleInputChange("t2VATOnPurchases", e.target.value)}
                          className="w-32 text-right bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500 text-gray-900 text-base"
                          placeholder="0"
                        />
                      </AutoFillBadge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Unusual Expenditure */}
          <Card className="card-modern hover-lift">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground">Unusual Expenditure</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <p className="text-base text-gray-700">
                  Please indicate if this Return includes any exceptional business purchases which have resulted in an
                  unusually large T2 (e.g. vehicles, fittings, equipment, plant and machinery, property, ICT equipment
                  or software, franchise license etc.)?
                </p>
                <RadioGroup
                  value={formData.unusualExpenditure}
                  onValueChange={(value) => handleInputChange("unusualExpenditure", value)}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="yes" />
                    <Label htmlFor="yes" className="text-base text-gray-700 font-medium">
                      Yes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="no" />
                    <Label htmlFor="no" className="text-base text-gray-700 font-medium">
                      No
                    </Label>
                  </div>
                </RadioGroup>

                {formData.unusualExpenditure === "yes" && (
                  <div className="space-y-6 border-t pt-6">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium text-foreground">Amount (excl. VAT) *</Label>
                      <div className="flex items-center gap-2">
                        <Euro className="h-4 w-4 text-gray-600" />
                        <Input
                          type="number"
                          value={formData.unusualAmount}
                          onChange={(e) => handleInputChange("unusualAmount", e.target.value)}
                          className="w-32 text-right bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500 text-gray-900 text-base"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base font-medium text-foreground">
                        Please provide details of the exceptional expenditure. Details should include type of asset
                        acquired, name and VAT number of supplier, total invoice cost excluding VAT, and VAT amount
                        payable in respect of each item of exceptional expenditure. *
                      </Label>
                      <Textarea
                        value={formData.unusualDetails}
                        onChange={(e) => handleInputChange("unusualDetails", e.target.value)}
                        className="min-h-[80px] w-full bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500 text-gray-900 text-base"
                        placeholder="Enter details here..."
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Net Amounts */}
          <Card className="card-modern hover-lift">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground">Net Amounts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Label className="text-base font-medium text-gray-700">Net Payable</Label>
                    <Label className="font-bold text-base text-gray-800">T3</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Euro className="h-4 w-4 text-gray-600" />
                    <Input
                      type="number"
                      value={formData.t3NetPayable}
                      className="w-32 text-right bg-gray-50 text-gray-900 text-base"
                      readOnly
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Label className="text-base font-medium text-gray-700">Net Repayable</Label>
                    <Label className="font-bold text-base text-gray-800">T4</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Euro className="h-4 w-4 text-gray-600" />
                    <Input
                      type="number"
                      value={formData.t4NetRepayable}
                      className="w-32 text-right bg-gray-50 text-gray-900 text-base"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Intra-EU Trade */}
          <Card className="card-modern hover-lift">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground">Intra-EU Trade (INTRASTAT)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Label className="text-base font-medium text-foreground">Total goods to other EU countries *</Label>
                    <Label className="font-bold text-base text-gray-800">E1</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Euro className="h-4 w-4 text-gray-600" />
                    <Input
                      type="number"
                      value={formData.e1TotalGoodsTo}
                      onChange={(e) => handleInputChange("e1TotalGoodsTo", e.target.value)}
                      className="w-32 text-right bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500 text-gray-900 text-base"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Label className="text-base font-medium text-foreground">Total goods from other EU countries *</Label>
                    <Label className="font-bold text-base text-gray-800">E2</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Euro className="h-4 w-4 text-gray-600" />
                    <Input
                      type="number"
                      value={formData.e2TotalGoodsFrom}
                      onChange={(e) => handleInputChange("e2TotalGoodsFrom", e.target.value)}
                      className="w-32 text-right bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500 text-gray-900 text-base"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Label className="text-base font-medium text-foreground">Total services to other EU countries *</Label>
                    <Label className="font-bold text-base text-gray-800">ES1</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Euro className="h-4 w-4 text-gray-600" />
                    <Input
                      type="number"
                      value={formData.es1TotalServicesTo}
                      onChange={(e) => handleInputChange("es1TotalServicesTo", e.target.value)}
                      className="w-32 text-right bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500 text-gray-900 text-base"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Label className="text-base font-medium text-foreground">Total services from other EU countries *</Label>
                    <Label className="font-bold text-base text-gray-800">ES2</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Euro className="h-4 w-4 text-gray-600" />
                    <Input
                      type="number"
                      value={formData.es2TotalServicesFrom}
                      onChange={(e) => handleInputChange("es2TotalServicesFrom", e.target.value)}
                      className="w-32 text-right bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500 text-gray-900 text-base"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Non EU Trade */}
          <Card className="card-modern hover-lift">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-foreground">Non EU Trade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Label className="text-base font-medium text-foreground">Postponed Accounting *</Label>
                  <Label className="font-bold text-base text-gray-800">PA1</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Euro className="h-4 w-4 text-gray-600" />
                  <Input
                    type="number"
                    value={formData.pa1PostponedAccounting}
                    onChange={(e) => handleInputChange("pa1PostponedAccounting", e.target.value)}
                    className="w-32 text-right bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500 text-gray-900 text-base"
                    placeholder="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card className="card-modern hover-lift">
            <CardContent className="p-6">
              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={isSaving}
                  className="px-8 py-3 font-semibold hover-scale glass-white/10 backdrop-blur-sm"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save as Draft"}
                </Button>
                <Button
                  onClick={handleSubmitReturn}
                  disabled={isSubmitting}
                  className="gradient-primary px-8 py-3 font-semibold text-white hover-scale shadow-lg"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Submitting..." : "Submit Return"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Live Chat */}
      <LiveChat />

      {/* Main Footer */}
      <footer className="bg-teal-700 text-white">
        {/* Navigation Bar */}
        <div className="bg-teal-600 py-4">
          <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
            <Link href="/" className="text-white hover:text-teal-200 underline">
              Back
            </Link>
            <a href="#top" className="text-white hover:text-teal-200 underline flex items-center space-x-1">
              <ArrowUp className="h-4 w-4" />
              <span>Back to top</span>
            </a>
          </div>
        </div>
        {/* Copyright */}
        <div className="bg-teal-800 py-4">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-sm font-thin">© PayVAT</p>
          </div>
        </div>
      </footer>
    </div>
  )
}