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
import { Euro, Save, Send, ArrowUp, FileText, Shield, CheckCircle, Clock, Sparkles, AlertCircle, Loader2 } from "lucide-react"
import SiteHeader from "@/components/site-header"
import { useVATData } from "@/contexts/vat-data-context"
import { convertToWholeEurosString, calculatePeriodDates, formatEuroAmount } from "@/lib/vatUtils"
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
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({})
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null)
  
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
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Show notification function
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => {
      setNotification(null)
    }, 5000) // Auto-hide after 5 seconds
  }

  // Helper function to get input class with error styling
  const getInputClassName = (fieldName: string, baseClasses = "bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500 text-gray-900 text-base") => {
    const hasError = fieldErrors[fieldName]
    if (hasError) {
      return baseClasses.replace('border-gray-300', 'border-red-300').replace('focus:border-teal-500', 'focus:border-red-500').replace('focus:ring-teal-500', 'focus:ring-red-500')
    }
    return baseClasses
  }

  // Helper component for autofill badge and error display
  const FieldWrapper = ({ fieldName, children }: { fieldName: string, children: React.ReactNode }) => (
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
      {fieldErrors[fieldName] && (
        <div className="mt-1 text-sm text-red-600 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
          {fieldErrors[fieldName]}
        </div>
      )}
    </div>
  )

  const handleSaveDraft = async () => {
    setIsSaving(true)
    try {
      // Simulate saving draft
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      // Save to localStorage as draft
      localStorage.setItem('vat3_draft_data', JSON.stringify({
        ...formData,
        lastSaved: new Date().toISOString()
      }))
      
      console.log("Draft saved:", formData)
      showNotification('success', 'Draft saved successfully! You can resume later.')
    } catch (error) {
      console.error("Error saving draft:", error)
      showNotification('error', 'Failed to save draft. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  // Enhanced form validation function
  const validateForm = (): { errors: string[], fieldErrors: {[key: string]: string} } => {
    const errors: string[] = []
    const newFieldErrors: {[key: string]: string} = {}
    
    // Required field validation
    if (!formData.traderName?.trim()) {
      errors.push('Trader Name is required')
      newFieldErrors.traderName = 'This field is required'
    }
    if (!formData.registrationNumber?.trim()) {
      errors.push('Registration Number is required')
      newFieldErrors.registrationNumber = 'This field is required'
    }
    if (!formData.periodBeginDate) {
      errors.push('Period Begin Date is required')
      newFieldErrors.periodBeginDate = 'This field is required'
    }
    if (!formData.periodEndDate) {
      errors.push('Period End Date is required')
      newFieldErrors.periodEndDate = 'This field is required'
    }
    if (!formData.t1VATOnSales || parseFloat(formData.t1VATOnSales) < 0) {
      errors.push('VAT on Sales (T1) must be a valid positive number')
      newFieldErrors.t1VATOnSales = 'Must be a valid positive number'
    }
    if (!formData.t2VATOnPurchases || parseFloat(formData.t2VATOnPurchases) < 0) {
      errors.push('VAT on Purchases (T2) must be a valid positive number')
      newFieldErrors.t2VATOnPurchases = 'Must be a valid positive number'
    }
    
    // Unusual expenditure validation
    if (formData.unusualExpenditure === 'yes') {
      if (!formData.unusualAmount || parseFloat(formData.unusualAmount) <= 0) {
        errors.push('Unusual expenditure amount is required when unusual expenditure is Yes')
        newFieldErrors.unusualAmount = 'Amount is required for unusual expenditure'
      }
      if (!formData.unusualDetails?.trim()) {
        errors.push('Unusual expenditure details are required when unusual expenditure is Yes')
        newFieldErrors.unusualDetails = 'Details are required for unusual expenditure'
      }
    }
    
    // EU Trade validation (ensure no negative numbers)
    if (parseFloat(formData.e1TotalGoodsTo) < 0) {
      errors.push('Total goods to other EU countries cannot be negative')
      newFieldErrors.e1TotalGoodsTo = 'Cannot be negative'
    }
    if (parseFloat(formData.e2TotalGoodsFrom) < 0) {
      errors.push('Total goods from other EU countries cannot be negative')
      newFieldErrors.e2TotalGoodsFrom = 'Cannot be negative'
    }
    if (parseFloat(formData.es1TotalServicesTo) < 0) {
      errors.push('Total services to other EU countries cannot be negative')
      newFieldErrors.es1TotalServicesTo = 'Cannot be negative'
    }
    if (parseFloat(formData.es2TotalServicesFrom) < 0) {
      errors.push('Total services from other EU countries cannot be negative')
      newFieldErrors.es2TotalServicesFrom = 'Cannot be negative'
    }
    if (parseFloat(formData.pa1PostponedAccounting) < 0) {
      errors.push('Postponed Accounting cannot be negative')
      newFieldErrors.pa1PostponedAccounting = 'Cannot be negative'
    }
    
    return { errors, fieldErrors: newFieldErrors }
  }

  const handleSubmitReturn = async () => {
    console.log('🚀 VAT3 Submit Return: Starting submission process')
    
    // Browser compatibility checks
    if (typeof window === 'undefined') {
      console.error('❌ VAT3 Submit Return: Window is undefined (SSR issue)')
      setValidationErrors(['Browser compatibility error. Please refresh and try again.'])
      return
    }

    if (typeof localStorage === 'undefined' || !localStorage) {
      console.error('❌ VAT3 Submit Return: localStorage is not available')
      setValidationErrors(['Your browser does not support local storage. Please enable cookies and local storage, then try again.'])
      return
    }

    // Validate form before submission
    const validation = validateForm()
    if (validation.errors.length > 0) {
      console.warn('⚠️ VAT3 Submit Return: Form validation failed', validation.errors)
      setValidationErrors(validation.errors)
      setFieldErrors(validation.fieldErrors)
      // Scroll to top to show errors with fallback for older browsers
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } catch {
        window.scrollTo(0, 0)
      }
      return
    }
    
    console.log('✅ VAT3 Submit Return: Form validation passed')
    setValidationErrors([])
    setFieldErrors({})
    setIsSubmitting(true)
    
    try {
      console.log('💾 VAT3 Submit Return: Storing form data in localStorage')
      // Store form data in localStorage for confirmation page
      const dataToStore = {
        ...formData,
        submissionTimestamp: new Date().toISOString(),
        submissionId: `VAT3-${Date.now()}`
      }
      localStorage.setItem('vat3_submission_data', JSON.stringify(dataToStore))
      
      // Verify data was stored successfully
      const storedData = localStorage.getItem('vat3_submission_data')
      if (!storedData) {
        throw new Error('Failed to store form data in localStorage')
      }
      console.log('✅ VAT3 Submit Return: Form data stored successfully')
      
      // Simulate processing time
      console.log('⏳ VAT3 Submit Return: Processing submission...')
      await new Promise((resolve) => setTimeout(resolve, 1500))
      
      console.log('🧭 VAT3 Submit Return: Attempting navigation to /confirmation-payment')
      
      // Primary navigation method with error handling
      try {
        await router.push('/confirmation-payment')
        console.log('✅ VAT3 Submit Return: Router.push completed successfully')
      } catch (routerError) {
        console.warn('⚠️ VAT3 Submit Return: Router.push failed, using fallback', routerError)
        window.location.href = '/confirmation-payment'
        return
      }
      
      // Verify navigation started with extended timeout for slower devices
      setTimeout(() => {
        if (window.location.pathname === '/vat3-return') {
          console.warn('⚠️ VAT3 Submit Return: Navigation may have failed, attempting fallback')
          // Fallback navigation method
          try {
            window.location.href = '/confirmation-payment'
          } catch (fallbackError) {
            console.error('❌ VAT3 Submit Return: Fallback navigation also failed', fallbackError)
            setValidationErrors(['Navigation failed. Please manually navigate to the confirmation page or try again.'])
          }
        }
      }, 2000) // Increased timeout for slower devices
      
      console.log('✅ VAT3 Submit Return: Navigation initiated successfully')
      
    } catch (error) {
      console.error('❌ VAT3 Submit Return: Error during submission:', error)
      
      // More specific error handling
      if (error instanceof Error) {
        if (error.message.includes('localStorage')) {
          setValidationErrors(['Unable to save form data. Please check your browser settings and try again.'])
        } else if (error.message.includes('navigation') || error.message.includes('router')) {
          setValidationErrors(['Navigation error occurred. Redirecting...'])
          // Immediate fallback for navigation errors with multiple methods
          setTimeout(() => {
            try {
              // Try window.location.href first
              window.location.href = '/confirmation-payment'
            } catch {
              // If that fails, try replace
              try {
                window.location.replace('/confirmation-payment')
              } catch {
                // Final fallback - show manual navigation message
                setValidationErrors(['Automatic navigation failed. Please click here to continue to confirmation page.'])
                setNotification({
                  type: 'error',
                  message: 'Please manually navigate to the confirmation page to complete your submission.'
                })
              }
            }
          }, 1000)
        } else {
          setValidationErrors([`Submission error: ${error.message}. Please try again.`])
        }
      } else {
        setValidationErrors(['An unexpected error occurred while submitting your return. Please try again.'])
      }
    } finally {
      setIsSubmitting(false)
      console.log('🏁 VAT3 Submit Return: Submission process completed')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader 
        searchPlaceholder="Search VAT forms and guidance..."
        currentPage="VAT3 Return Form"
        pageSubtitle="Complete your VAT return submission"
      />

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
                        {error.includes('click here to continue') && (
                          <Link 
                            href="/confirmation-payment" 
                            className="ml-2 underline font-semibold text-red-800 hover:text-red-900"
                          >
                            → Go to Confirmation Page
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notification Toast */}
        {notification && (
          <Card className={`border-2 mb-6 ${notification.type === 'success' 
            ? 'border-green-200 bg-green-50' 
            : 'border-red-200 bg-red-50'
          }`}>
            <CardContent className="pt-4">
              <div className="flex items-start space-x-3">
                {notification.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className={`font-semibold ${notification.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                    {notification.message}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setNotification(null)}
                  className={`${notification.type === 'success' ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'}`}
                >
                  ×
                </Button>
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
                  <FieldWrapper fieldName="traderName">
                    <Input
                      value={formData.traderName}
                      onChange={(e) => handleInputChange("traderName", e.target.value)}
                      className={getInputClassName("traderName")}
                    />
                  </FieldWrapper>
                </div>
                <div className="space-y-2">
                  <Label className="text-base font-medium text-foreground">Registration Number *</Label>
                  <FieldWrapper fieldName="registrationNumber">
                    <Input
                      value={formData.registrationNumber}
                      onChange={(e) => handleInputChange("registrationNumber", e.target.value)}
                      className={getInputClassName("registrationNumber")}
                    />
                  </FieldWrapper>
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
                    <FieldWrapper fieldName="periodBeginDate">
                      <Input
                        type="date"
                        value={formData.periodBeginDate}
                        onChange={(e) => handleInputChange("periodBeginDate", e.target.value)}
                        className={getInputClassName("periodBeginDate")}
                      />
                    </FieldWrapper>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base font-medium text-foreground">Period End Date *</Label>
                    <div className="text-sm text-gray-600 mb-1">(dd/mm/yyyy)</div>
                    <FieldWrapper fieldName="periodEndDate">
                      <Input
                        type="date"
                        value={formData.periodEndDate}
                        onChange={(e) => handleInputChange("periodEndDate", e.target.value)}
                        className={getInputClassName("periodEndDate")}
                      />
                    </FieldWrapper>
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
                    <div className="flex items-start gap-2">
                      <Euro className="h-4 w-4 text-gray-600 mt-3" />
                      <FieldWrapper fieldName="t1VATOnSales">
                        <Input
                          type="number"
                          value={formData.t1VATOnSales}
                          onChange={(e) => handleInputChange("t1VATOnSales", e.target.value)}
                          className={getInputClassName("t1VATOnSales", "w-32 text-right bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500 text-gray-900 text-base")}
                          placeholder="0"
                        />
                      </FieldWrapper>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Label className="text-base font-medium text-foreground">VAT on Purchases *</Label>
                      <Label className="font-bold text-base text-gray-800">T2</Label>
                    </div>
                    <div className="flex items-start gap-2">
                      <Euro className="h-4 w-4 text-gray-600 mt-3" />
                      <FieldWrapper fieldName="t2VATOnPurchases">
                        <Input
                          type="number"
                          value={formData.t2VATOnPurchases}
                          onChange={(e) => handleInputChange("t2VATOnPurchases", e.target.value)}
                          className={getInputClassName("t2VATOnPurchases", "w-32 text-right bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500 text-gray-900 text-base")}
                          placeholder="0"
                        />
                      </FieldWrapper>
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
                      <div className="flex items-start gap-2">
                        <Euro className="h-4 w-4 text-gray-600 mt-3" />
                        <FieldWrapper fieldName="unusualAmount">
                          <Input
                            type="number"
                            value={formData.unusualAmount}
                            onChange={(e) => handleInputChange("unusualAmount", e.target.value)}
                            className={getInputClassName("unusualAmount", "w-32 text-right bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500 text-gray-900 text-base")}
                            placeholder="0"
                          />
                        </FieldWrapper>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base font-medium text-foreground">
                        Please provide details of the exceptional expenditure. Details should include type of asset
                        acquired, name and VAT number of supplier, total invoice cost excluding VAT, and VAT amount
                        payable in respect of each item of exceptional expenditure. *
                      </Label>
                      <FieldWrapper fieldName="unusualDetails">
                        <Textarea
                          value={formData.unusualDetails}
                          onChange={(e) => handleInputChange("unusualDetails", e.target.value)}
                          className={getInputClassName("unusualDetails", "min-h-[80px] w-full bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500 text-gray-900 text-base")}
                          placeholder="Enter details here..."
                        />
                      </FieldWrapper>
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
                  <div className="flex items-start gap-2">
                    <Euro className="h-4 w-4 text-gray-600 mt-3" />
                    <FieldWrapper fieldName="e1TotalGoodsTo">
                      <Input
                        type="number"
                        value={formData.e1TotalGoodsTo}
                        onChange={(e) => handleInputChange("e1TotalGoodsTo", e.target.value)}
                        className={getInputClassName("e1TotalGoodsTo", "w-32 text-right bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500 text-gray-900 text-base")}
                        placeholder="0"
                      />
                    </FieldWrapper>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Label className="text-base font-medium text-foreground">Total goods from other EU countries *</Label>
                    <Label className="font-bold text-base text-gray-800">E2</Label>
                  </div>
                  <div className="flex items-start gap-2">
                    <Euro className="h-4 w-4 text-gray-600 mt-3" />
                    <FieldWrapper fieldName="e2TotalGoodsFrom">
                      <Input
                        type="number"
                        value={formData.e2TotalGoodsFrom}
                        onChange={(e) => handleInputChange("e2TotalGoodsFrom", e.target.value)}
                        className={getInputClassName("e2TotalGoodsFrom", "w-32 text-right bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500 text-gray-900 text-base")}
                        placeholder="0"
                      />
                    </FieldWrapper>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Label className="text-base font-medium text-foreground">Total services to other EU countries *</Label>
                    <Label className="font-bold text-base text-gray-800">ES1</Label>
                  </div>
                  <div className="flex items-start gap-2">
                    <Euro className="h-4 w-4 text-gray-600 mt-3" />
                    <FieldWrapper fieldName="es1TotalServicesTo">
                      <Input
                        type="number"
                        value={formData.es1TotalServicesTo}
                        onChange={(e) => handleInputChange("es1TotalServicesTo", e.target.value)}
                        className={getInputClassName("es1TotalServicesTo", "w-32 text-right bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500 text-gray-900 text-base")}
                        placeholder="0"
                      />
                    </FieldWrapper>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Label className="text-base font-medium text-foreground">Total services from other EU countries *</Label>
                    <Label className="font-bold text-base text-gray-800">ES2</Label>
                  </div>
                  <div className="flex items-start gap-2">
                    <Euro className="h-4 w-4 text-gray-600 mt-3" />
                    <FieldWrapper fieldName="es2TotalServicesFrom">
                      <Input
                        type="number"
                        value={formData.es2TotalServicesFrom}
                        onChange={(e) => handleInputChange("es2TotalServicesFrom", e.target.value)}
                        className={getInputClassName("es2TotalServicesFrom", "w-32 text-right bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500 text-gray-900 text-base")}
                        placeholder="0"
                      />
                    </FieldWrapper>
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
                <div className="flex items-start gap-2">
                  <Euro className="h-4 w-4 text-gray-600 mt-3" />
                  <FieldWrapper fieldName="pa1PostponedAccounting">
                    <Input
                      type="number"
                      value={formData.pa1PostponedAccounting}
                      onChange={(e) => handleInputChange("pa1PostponedAccounting", e.target.value)}
                      className={getInputClassName("pa1PostponedAccounting", "w-32 text-right bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500 text-gray-900 text-base")}
                      placeholder="0"
                    />
                  </FieldWrapper>
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
                  className="gradient-primary px-8 py-3 font-semibold text-white hover-scale shadow-lg disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      <span className="animate-pulse">Processing submission...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Return
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Live Chat */}

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