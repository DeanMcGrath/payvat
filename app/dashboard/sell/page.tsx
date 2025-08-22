"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  DollarSign, 
  Calculator, 
  TrendingUp, 
  Building, 
  Users,
  FileText,
  Phone,
  Mail,
  ExternalLink,
  Info,
  AlertCircle,
  CheckCircle,
  Loader2,
  BarChart3,
  PieChart,
  Target
} from "lucide-react"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/vatUtils"

interface BusinessValuation {
  revenue: number
  profit: number
  assets: number
  liabilities: number
  employeeCount: number
  industryMultiplier: number
  estimatedValue: number
  valuationRange: {
    min: number
    max: number
  }
}

interface SaleRequest {
  businessName: string
  industry: string
  yearEstablished: number
  annualRevenue: number
  annualProfit: number
  employeeCount: number
  reasonForSelling: string
  timeframe: string
  askingPrice: number
  contactEmail: string
  contactPhone: string
  additionalInfo: string
  hasFinancials: boolean
  hasAssets: boolean
  hasContracts: boolean
}

interface ValuationMethod {
  name: string
  description: string
  formula: string
  result: number
  confidence: 'high' | 'medium' | 'low'
}

export default function SellPage() {
  const [showValuationTool, setShowValuationTool] = useState(true)
  const [showSaleRequest, setShowSaleRequest] = useState(false)
  const [loading, setLoading] = useState(false)
  const [valuation, setValuation] = useState<BusinessValuation | null>(null)
  const [valuationMethods, setValuationMethods] = useState<ValuationMethod[]>([])
  
  const [valuationInputs, setValuationInputs] = useState({
    annualRevenue: '',
    annualProfit: '',
    assets: '',
    liabilities: '',
    employees: '',
    industry: ''
  })

  const [saleRequest, setSaleRequest] = useState<SaleRequest>({
    businessName: '',
    industry: '',
    yearEstablished: new Date().getFullYear(),
    annualRevenue: 0,
    annualProfit: 0,
    employeeCount: 0,
    reasonForSelling: '',
    timeframe: '',
    askingPrice: 0,
    contactEmail: '',
    contactPhone: '',
    additionalInfo: '',
    hasFinancials: false,
    hasAssets: false,
    hasContracts: false
  })

  const industries = [
    { value: 'technology', label: 'Technology', multiplier: 3.5 },
    { value: 'retail', label: 'Retail', multiplier: 1.2 },
    { value: 'manufacturing', label: 'Manufacturing', multiplier: 2.1 },
    { value: 'services', label: 'Professional Services', multiplier: 2.8 },
    { value: 'hospitality', label: 'Hospitality', multiplier: 1.8 },
    { value: 'construction', label: 'Construction', multiplier: 1.5 },
    { value: 'healthcare', label: 'Healthcare', multiplier: 3.2 },
    { value: 'education', label: 'Education', multiplier: 2.5 },
    { value: 'other', label: 'Other', multiplier: 2.0 }
  ]

  const calculateValuation = () => {
    const revenue = parseFloat(valuationInputs.annualRevenue) || 0
    const profit = parseFloat(valuationInputs.annualProfit) || 0
    const assets = parseFloat(valuationInputs.assets) || 0
    const liabilities = parseFloat(valuationInputs.liabilities) || 0
    const employees = parseInt(valuationInputs.employees) || 0
    
    const selectedIndustry = industries.find(ind => ind.value === valuationInputs.industry)
    const multiplier = selectedIndustry?.multiplier || 2.0

    if (revenue === 0 && profit === 0) {
      toast.error('Please enter at least revenue or profit figures')
      return
    }

    // Different valuation methods
    const methods: ValuationMethod[] = [
      {
        name: 'Revenue Multiple',
        description: 'Based on annual revenue and industry average multiples',
        formula: `€${revenue.toLocaleString()} × ${multiplier}`,
        result: revenue * multiplier,
        confidence: revenue > 100000 ? 'high' : 'medium'
      },
      {
        name: 'Profit Multiple (EBITDA)',
        description: 'Based on annual profit with industry multiplier',
        formula: `€${profit.toLocaleString()} × ${multiplier + 1}`,
        result: profit * (multiplier + 1),
        confidence: profit > 50000 ? 'high' : 'medium'
      },
      {
        name: 'Asset-Based',
        description: 'Net asset value approach',
        formula: `€${assets.toLocaleString()} - €${liabilities.toLocaleString()}`,
        result: assets - liabilities,
        confidence: assets > liabilities ? 'medium' : 'low'
      },
      {
        name: 'Market Comparison',
        description: 'Comparable business sales in your industry',
        formula: `Market avg. × business factors`,
        result: (revenue * 0.8 * multiplier + profit * 3) / 2,
        confidence: 'medium'
      }
    ]

    // Filter out methods with negative or zero results
    const validMethods = methods.filter(method => method.result > 0)
    setValuationMethods(validMethods)

    // Calculate average valuation
    const averageValue = validMethods.reduce((sum, method) => sum + method.result, 0) / validMethods.length
    const minValue = Math.min(...validMethods.map(m => m.result)) * 0.8
    const maxValue = Math.max(...validMethods.map(m => m.result)) * 1.2

    const businessValuation: BusinessValuation = {
      revenue,
      profit,
      assets,
      liabilities,
      employeeCount: employees,
      industryMultiplier: multiplier,
      estimatedValue: averageValue,
      valuationRange: {
        min: minValue,
        max: maxValue
      }
    }

    setValuation(businessValuation)
  }

  const handleSaleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Business sale inquiry submitted successfully. We will contact you within 1 business day.')
      
      // Reset form
      setSaleRequest({
        businessName: '',
        industry: '',
        yearEstablished: new Date().getFullYear(),
        annualRevenue: 0,
        annualProfit: 0,
        employeeCount: 0,
        reasonForSelling: '',
        timeframe: '',
        askingPrice: 0,
        contactEmail: '',
        contactPhone: '',
        additionalInfo: '',
        hasFinancials: false,
        hasAssets: false,
        hasContracts: false
      })
      setShowSaleRequest(false)
      
    } catch (error) {
      toast.error('Failed to submit request. Please try again.')
    } finally {
      setLoading(false)
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

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900">Business Sale Advisory</h3>
              <p className="text-sm text-blue-800 mt-1">
                Selling a business involves complex legal, financial, and tax considerations. 
                Our valuation tool provides estimates only. Professional advice is recommended for accurate valuations and sale processes.
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
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calculator className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Business Valuation</h3>
                <p className="text-sm text-gray-600">Get an estimated value for your business</p>
                <div className="mt-2">
                  <Button 
                    variant={showValuationTool ? "default" : "outline"} 
                    size="sm"
                    onClick={() => {setShowValuationTool(true); setShowSaleRequest(false)}}
                  >
                    Calculate Value
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Phone className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Sale Assistance</h3>
                <p className="text-sm text-gray-600">Get professional help selling your business</p>
                <div className="mt-2">
                  <Button 
                    variant={showSaleRequest ? "default" : "outline"} 
                    size="sm"
                    onClick={() => {setShowSaleRequest(true); setShowValuationTool(false)}}
                  >
                    Request Help
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Business Valuation Tool */}
      {showValuationTool && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-brand-700">
                <Calculator className="h-5 w-5" />
                Business Valuation Calculator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="revenue">Annual Revenue (€)</Label>
                  <Input
                    id="revenue"
                    type="number"
                    placeholder="e.g., 500000"
                    value={valuationInputs.annualRevenue}
                    onChange={(e) => setValuationInputs(prev => ({...prev, annualRevenue: e.target.value}))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="profit">Annual Profit (€)</Label>
                  <Input
                    id="profit"
                    type="number"
                    placeholder="e.g., 120000"
                    value={valuationInputs.annualProfit}
                    onChange={(e) => setValuationInputs(prev => ({...prev, annualProfit: e.target.value}))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="assets">Total Assets (€)</Label>
                  <Input
                    id="assets"
                    type="number"
                    placeholder="e.g., 200000"
                    value={valuationInputs.assets}
                    onChange={(e) => setValuationInputs(prev => ({...prev, assets: e.target.value}))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="liabilities">Total Liabilities (€)</Label>
                  <Input
                    id="liabilities"
                    type="number"
                    placeholder="e.g., 50000"
                    value={valuationInputs.liabilities}
                    onChange={(e) => setValuationInputs(prev => ({...prev, liabilities: e.target.value}))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="employees">Number of Employees</Label>
                  <Input
                    id="employees"
                    type="number"
                    placeholder="e.g., 8"
                    value={valuationInputs.employees}
                    onChange={(e) => setValuationInputs(prev => ({...prev, employees: e.target.value}))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select 
                    value={valuationInputs.industry} 
                    onValueChange={(value) => setValuationInputs(prev => ({...prev, industry: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry.value} value={industry.value}>
                          {industry.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button onClick={calculateValuation} className="w-full md:w-auto">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Business Value
              </Button>
            </CardContent>
          </Card>

          {/* Valuation Results */}
          {valuation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <TrendingUp className="h-5 w-5" />
                  Estimated Business Value
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Summary */}
                <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {formatCurrency(valuation.estimatedValue)}
                  </div>
                  <div className="text-sm text-green-700 mb-4">Estimated Business Value</div>
                  <div className="text-sm text-gray-600">
                    Range: {formatCurrency(valuation.valuationRange.min)} - {formatCurrency(valuation.valuationRange.max)}
                  </div>
                </div>

                {/* Valuation Methods */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Valuation Methods Used:</h4>
                  <div className="grid gap-4">
                    {valuationMethods.map((method, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h5 className="font-medium text-gray-900">{method.name}</h5>
                            <p className="text-sm text-gray-600">{method.description}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(method.confidence)}`}>
                            {method.confidence} confidence
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          Formula: {method.formula}
                        </div>
                        <div className="h6 text-brand-700">
                          {formatCurrency(method.result)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Factors */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <div className="font-medium">Revenue Multiple</div>
                    <div className="text-sm text-gray-600">{valuation.industryMultiplier}x</div>
                  </div>
                  <div className="text-center">
                    <PieChart className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <div className="font-medium">Net Assets</div>
                    <div className="text-sm text-gray-600">{formatCurrency(valuation.assets - valuation.liabilities)}</div>
                  </div>
                  <div className="text-center">
                    <Target className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <div className="font-medium">Profit Margin</div>
                    <div className="text-sm text-gray-600">
                      {valuation.revenue > 0 ? Math.round((valuation.profit / valuation.revenue) * 100) : 0}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Sale Request Form */}
      {showSaleRequest && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-brand-700">
              <DollarSign className="h-5 w-5" />
              Business Sale Inquiry
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaleRequestSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    value={saleRequest.businessName}
                    onChange={(e) => setSaleRequest(prev => ({...prev, businessName: e.target.value}))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry *</Label>
                  <Select 
                    value={saleRequest.industry} 
                    onValueChange={(value) => setSaleRequest(prev => ({...prev, industry: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry.value} value={industry.value}>
                          {industry.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="yearEstablished">Year Established</Label>
                  <Input
                    id="yearEstablished"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={saleRequest.yearEstablished}
                    onChange={(e) => setSaleRequest(prev => ({...prev, yearEstablished: parseInt(e.target.value)}))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="annualRevenue">Annual Revenue (€)</Label>
                  <Input
                    id="annualRevenue"
                    type="number"
                    value={saleRequest.annualRevenue}
                    onChange={(e) => setSaleRequest(prev => ({...prev, annualRevenue: parseFloat(e.target.value) || 0}))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="employeeCount">Number of Employees</Label>
                  <Input
                    id="employeeCount"
                    type="number"
                    value={saleRequest.employeeCount}
                    onChange={(e) => setSaleRequest(prev => ({...prev, employeeCount: parseInt(e.target.value) || 0}))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reasonForSelling">Reason for Selling *</Label>
                <Textarea
                  id="reasonForSelling"
                  value={saleRequest.reasonForSelling}
                  onChange={(e) => setSaleRequest(prev => ({...prev, reasonForSelling: e.target.value}))}
                  placeholder="Please explain why you want to sell your business..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timeframe">Sale Timeframe</Label>
                  <Select 
                    value={saleRequest.timeframe} 
                    onValueChange={(value) => setSaleRequest(prev => ({...prev, timeframe: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate (within 3 months)</SelectItem>
                      <SelectItem value="6months">Within 6 months</SelectItem>
                      <SelectItem value="12months">Within 12 months</SelectItem>
                      <SelectItem value="exploring">Just exploring options</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="askingPrice">Expected Asking Price (€)</Label>
                  <Input
                    id="askingPrice"
                    type="number"
                    value={saleRequest.askingPrice}
                    onChange={(e) => setSaleRequest(prev => ({...prev, askingPrice: parseFloat(e.target.value) || 0}))}
                    placeholder="Optional - leave blank for valuation advice"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={saleRequest.contactEmail}
                    onChange={(e) => setSaleRequest(prev => ({...prev, contactEmail: e.target.value}))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    value={saleRequest.contactPhone}
                    onChange={(e) => setSaleRequest(prev => ({...prev, contactPhone: e.target.value}))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalInfo">Additional Information</Label>
                <Textarea
                  id="additionalInfo"
                  value={saleRequest.additionalInfo}
                  onChange={(e) => setSaleRequest(prev => ({...prev, additionalInfo: e.target.value}))}
                  placeholder="Any additional details about your business or sale requirements..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading} className="bg-brand-700 hover:bg-brand-800">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
                  Submit Inquiry
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowSaleRequest(false)}
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
            Professional Business Sale Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">What We Offer</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Professional business valuations
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Marketing and buyer identification
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Legal documentation and contracts
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Tax optimization strategies
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Negotiation and closing support
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Get in Touch</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-green-600" />
                  <span>+353 1 234 5678</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span>sales@payvat.ie</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Free initial consultation available
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}