"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Euro, Bell, Settings, LogOut, Search, Save, Send, ArrowUp, FileText, Shield, CheckCircle, Clock } from "lucide-react"

export default function VAT3ReturnForm() {
  const [formData, setFormData] = useState({
    traderName: "  ",
    registrationNumber: " ",
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
  }

  const handleSaveDraft = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log("Draft saved:", formData)
    setIsSaving(false)
  }

  const handleSubmitReturn = async () => {
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    console.log("Return submitted:", formData)
    window.location.href = "/submit-return"
    setIsSubmitting(false)
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
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3 animate-bounce-gentle">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse-gentle"></div>
                  Works with ROS VAT3 submission
                </div>
                
                <div className="icon-premium mb-6 mx-auto">
                  <FileText className="h-12 w-12 text-white" />
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-3">
                  <span className="text-gradient-primary">Complete Your</span>
                  <br />
                  <span className="text-foreground">VAT3 Return</span>
                </h1>
                
                <div className="w-32 h-1 gradient-primary mx-auto mb-8 rounded-full"></div>
                
                <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Submit your VAT3 return with confidence using our expert-guided form. 
                  <span className="text-primary font-semibold">All fields validated and Revenue-ready.</span>
                </p>
                
                <div className="mt-4 text-sm text-muted-foreground">
                  <span className="text-primary">*</span> Denotes Required field
                </div>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex items-center justify-center gap-8 text-muted-foreground text-sm mb-12">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-success" />
                  <span>Works with ROS</span>
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
                  <Input
                    value={formData.traderName}
                    onChange={(e) => handleInputChange("traderName", e.target.value)}
                    className="bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500 text-gray-900 text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-base font-medium text-foreground">Registration Number *</Label>
                  <Input
                    value={formData.registrationNumber}
                    onChange={(e) => handleInputChange("registrationNumber", e.target.value)}
                    className="bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500 text-gray-900 text-base"
                  />
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
                    <Input
                      type="date"
                      value={formData.periodBeginDate}
                      onChange={(e) => handleInputChange("periodBeginDate", e.target.value)}
                      className="bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500 text-gray-900 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base font-medium text-foreground">Period End Date *</Label>
                    <div className="text-sm text-gray-600 mb-1">(dd/mm/yyyy)</div>
                    <Input
                      type="date"
                      value={formData.periodEndDate}
                      onChange={(e) => handleInputChange("periodEndDate", e.target.value)}
                      className="bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500 text-gray-900 text-base"
                    />
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
                      <Input
                        type="number"
                        value={formData.t1VATOnSales}
                        onChange={(e) => handleInputChange("t1VATOnSales", e.target.value)}
                        className="w-32 text-right bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500 text-gray-900 text-base"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Label className="text-base font-medium text-foreground">VAT on Purchases *</Label>
                      <Label className="font-bold text-base text-gray-800">T2</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Euro className="h-4 w-4 text-gray-600" />
                      <Input
                        type="number"
                        value={formData.t2VATOnPurchases}
                        onChange={(e) => handleInputChange("t2VATOnPurchases", e.target.value)}
                        className="w-32 text-right bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500 text-gray-900 text-base"
                        placeholder="0"
                      />
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
              <div className="flex gap-4 justify-center">
                <Button 
                  variant="outline" 
                  onClick={handleSaveDraft} 
                  disabled={isSaving}
                  className="btn-outline hover-scale"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Saving..." : "Save as Draft"}
                </Button>
                <Button 
                  onClick={handleSubmitReturn} 
                  disabled={isSubmitting}
                  className="btn-primary hover-scale"
                >
                  <Send className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Submitting..." : "Submit VAT Return"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Footer */}
      <footer className="bg-teal-700 text-white">
        {/* Navigation Bar */}
        <div className="bg-teal-600 py-4">
          <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
            <Link href="/dashboard" className="text-white hover:text-teal-200 underline">
              Back to Dashboard
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
