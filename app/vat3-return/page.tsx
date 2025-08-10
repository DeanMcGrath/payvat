"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Euro, Bell, Settings, LogOut, Search, Save, Send, ArrowUp } from "lucide-react"
import LiveChat from "../../components/live-chat"

export default function VAT3ReturnForm() {
  const [formData, setFormData] = useState({
    traderName: "Brian Cusack Trading Ltd",
    registrationNumber: "IE0352440A",
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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-garamond font-medium">PayVAT</h1>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Input placeholder="Search" className="w-64 bg-white text-gray-900 border-0" />
                <Button size="sm" className="bg-blue-700 hover:bg-blue-800">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" className="text-white hover:bg-teal-600">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-white hover:bg-teal-600">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-white hover:bg-teal-600">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        {/* Navigation */}
        <div className="bg-teal-600 px-6 py-3">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-white">VAT3 Return</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">VAT3 Return</h2>
          <div className="text-black text-base">
            <span>* Denotes Required field</span>
          </div>
        </div>

        <div className="space-y-6">
          {/* Registration Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">Registration Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-base font-medium text-black">Trader Name *</Label>
                  <Input
                    value={formData.traderName}
                    onChange={(e) => handleInputChange("traderName", e.target.value)}
                    className="bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500 text-gray-900 text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-base font-medium text-black">Registration Number *</Label>
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
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">Filing Frequency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Label className="text-base font-medium text-black">Please indicate Filing Frequency *</Label>
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
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">Period Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-base font-semibold text-gray-800">Please enter period dates</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-base font-medium text-black">Period Begin Date *</Label>
                    <div className="text-sm text-gray-600 mb-1">(dd/mm/yyyy)</div>
                    <Input
                      type="date"
                      value={formData.periodBeginDate}
                      onChange={(e) => handleInputChange("periodBeginDate", e.target.value)}
                      className="bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500 text-gray-900 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base font-medium text-black">Period End Date *</Label>
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
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">Return Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Label className="text-base font-medium text-black">
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
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">VAT3 Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-base font-semibold text-gray-800">Whole Euro only. Please do not enter cent.</div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Label className="text-base font-medium text-black">VAT on Sales *</Label>
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
                      <Label className="text-base font-medium text-black">VAT on Purchases *</Label>
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
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">Unusual Expenditure</CardTitle>
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
                      <Label className="text-base font-medium text-black">Amount (excl. VAT) *</Label>
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
                      <Label className="text-base font-medium text-black">
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
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">Net Amounts</CardTitle>
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
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">Intra-EU Trade (INTRASTAT)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Label className="text-base font-medium text-black">Total goods to other EU countries *</Label>
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
                    <Label className="text-base font-medium text-black">Total goods from other EU countries *</Label>
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
                    <Label className="text-base font-medium text-black">Total services to other EU countries *</Label>
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
                    <Label className="text-base font-medium text-black">Total services from other EU countries *</Label>
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
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">Non EU Trade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Label className="text-base font-medium text-black">Postponed Accounting *</Label>
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
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={isSaving}
                  className="px-6 bg-white border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold text-base"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save as Draft"}
                </Button>
                <Button
                  onClick={handleSubmitReturn}
                  disabled={isSubmitting}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 text-base"
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
            <p className="text-sm font-garamond font-medium">© PayVAT</p>
          </div>
        </div>
      </footer>
    </div>
  )
}