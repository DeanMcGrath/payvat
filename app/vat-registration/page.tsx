"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, Calculator, Calendar, AlertTriangle, CheckCircle, ExternalLink, FileText, Clock, ArrowRight, Download, Euro, Building, Mail, Phone, Loader2, AlertCircle as AlertCircleIcon, Shield, UserCheck } from 'lucide-react'
import Footer from "@/components/footer"
import SiteHeader from "@/components/site-header"

interface UserProfile {
  id: string
  email: string
  businessName: string
  vatNumber: string
  firstName?: string
  lastName?: string
}

export default function VATRegistrationPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [userLoading, setUserLoading] = useState(true)
  const [userError, setUserError] = useState<string | null>(null)

  useEffect(() => {
    fetchUserProfile()
  }, [])
  
  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'GET',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.user) {
          setUser(data.user)
        } else {
          setUserError('Failed to load user profile')
        }
      } else if (response.status === 401) {
        // User not logged in - this is fine for public pages
        setUser(null)
      } else {
        setUserError('Failed to fetch user profile')
      }
    } catch (err) {
      setUserError('Network error occurred')
    } finally {
      setUserLoading(false)
    }
  }
  
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      window.location.href = '/login'
    } catch (err) {
      window.location.href = '/login'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader 
        searchPlaceholder="Search registration guide..."
        currentPage="VAT Registration Guide"
        pageSubtitle="Complete guide to Irish VAT registration"
        user={user}
        onLogout={handleLogout}
      />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            {/* Hero Content */}
            <div className="max-w-4xl mx-auto animate-fade-in">
              <div className="mb-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3 animate-bounce-gentle">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse-gentle"></div>
                  Expert registration guidance
                </div>
                
                <div className="icon-premium mb-3 mx-auto">
                  <UserCheck className="h-12 w-12 text-white" />
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-2">
                  <span className="text-gradient-primary">Apply for Your</span>
                  <br />
                  <span className="text-foreground">VAT Number in Ireland</span>
                </h1>
                
                <div className="w-32 h-1 gradient-primary mx-auto mb-4 rounded-full"></div>
                
                <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Complete step-by-step guide for new businesses to register for VAT in Ireland. 
                  <span className="text-primary font-semibold">Revenue compliant and up-to-date.</span>
                </p>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex items-center justify-center gap-8 text-muted-foreground text-sm mb-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-success" />
                  <span>Revenue approved</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>Expert guidance</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-success" />
                  <span>Always updated</span>
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

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Step 1: Determine if You Need to Register */}
        <Card className="card-modern hover-lift mb-2" id="step-1">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
              <span className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
              Determine if You Need to Register for VAT
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-600">Before applying, confirm whether your business is required to register for VAT or if voluntary registration is beneficial.</p>
            
            {/* Mandatory Registration */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 mb-3 flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                Mandatory Registration
              </h4>
              <p className="text-red-800 mb-3">You must register for VAT if:</p>
              <ul className="space-y-2 text-red-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                  Your annual turnover from supplying goods exceeds €80,000.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                  Your annual turnover from supplying services exceeds €40,000.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                  You are a non-resident business making taxable supplies in Ireland (no turnover threshold applies).
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                  You engage in intra-EU trade or receive services from abroad for business purposes (e.g., reverse-charge VAT or intra-Community acquisitions).
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                  You are an online seller with distance sales exceeding €10,000 annually to EU consumers.
                </li>
              </ul>
            </div>

            {/* Voluntary Registration */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                Voluntary Registration
              </h4>
              <p className="text-green-800 mb-3">If your turnover is below the thresholds, you can still register voluntarily to:</p>
              <ul className="space-y-2 text-green-700">
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  Reclaim VAT on business purchases (e.g., office supplies, equipment).
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  Enhance your business&apos;s professional image with suppliers and clients.
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  Prepare for future trade if you expect to exceed thresholds soon.
                </li>
              </ul>
            </div>

            {/* Intention to Trade */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                <FileText className="h-5 w-5 text-blue-600 mr-2" />
                Intention to Trade
              </h4>
              <p className="text-blue-800">If your business hasn&apos;t started trading but plans to, you can apply for VAT registration by providing evidence of future taxable activities (e.g., business plans, contracts).</p>
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Gather Required Information */}
        <Card className="card-modern hover-lift mb-2" id="step-2">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
              <span className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
              Gather Required Information and Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-600">To apply for a VAT number, you&apos;ll need to provide specific details and supporting documents to demonstrate your business&apos;s eligibility.</p>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Business Information */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Building className="h-5 w-5 text-teal-600 mr-2" />
                  Business Information
                </h4>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Business name and address</li>
                  <li>• Type of business (sole trader, partnership, limited company, trust, etc.)</li>
                  <li>• Estimated annual turnover</li>
                  <li>• Nature of goods or services supplied</li>
                  <li>• Bank account details (for Irish business accounts)</li>
                  <li>• VAT registration date (when you intend to start charging VAT)</li>
                </ul>
              </div>

              {/* Personal/Director Information */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Users className="h-5 w-5 text-teal-600 mr-2" />
                  Personal/Director Information
                </h4>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• For sole traders: Personal Public Service (PPS) number or Identified Person Number (IPN)</li>
                  <li>• For companies: Tax Registration Number (TRN) from Corporation Tax registration (must be completed first)</li>
                  <li>• Names and addresses of directors or responsible persons</li>
                </ul>
              </div>

              {/* Evidence of Trade */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <FileText className="h-5 w-5 text-teal-600 mr-2" />
                  Evidence of Trade
                </h4>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Invoices or contracts showing trade with Irish suppliers or customers</li>
                  <li>• Business plans, bank statements, or agreements demonstrating economic activity in Ireland</li>
                  <li>• For non-resident businesses: Documentation confirming taxable supplies in Ireland (e.g., courier service invoices, supplier agreements)</li>
                </ul>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-900 mb-2">Additional Notes:</h4>
              <ul className="space-y-1 text-yellow-800 text-sm">
                <li>• Non-resident businesses may need to provide utility bills or other evidence of activity if hiring employees or establishing a presence in Ireland.</li>
                <li>• Ensure all documents are accurate to avoid delays or rejection.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Choose the Appropriate Registration Form */}
        <Card className="card-modern hover-lift mb-2" id="step-3">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
              <span className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">3</span>
              Choose the Appropriate Registration Form
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-600">Select the correct form based on your business structure and residency status. Most registrations are submitted online via the Revenue Online Service (ROS), but paper forms are available for specific cases.</p>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Online Forms */}
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <h4 className="font-semibold text-teal-900 mb-3 flex items-center">
                  <ExternalLink className="h-5 w-5 text-teal-600 mr-2" />
                  Online Forms (via ROS)
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white rounded border border-teal-100">
                    <div>
                      <span className="font-medium text-teal-800">TR1 Form</span>
                      <p className="text-sm text-teal-700">For sole traders, partnerships, or trusts established in Ireland</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-teal-200 text-teal-700"
                      onClick={() => window.open('https://www.revenue.ie/en/companies-and-charities/documents/tr1.pdf', '_blank')}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      TR1
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded border border-teal-100">
                    <div>
                      <span className="font-medium text-teal-800">TR2 Form</span>
                      <p className="text-sm text-teal-700">For limited companies established in Ireland</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-teal-200 text-teal-700"
                      onClick={() => window.open('https://www.revenue.ie/en/companies-and-charities/documents/tr2.pdf', '_blank')}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      TR2
                    </Button>
                  </div>
                </div>
              </div>

              {/* Paper Forms */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <FileText className="h-5 w-5 text-gray-600 mr-2" />
                  Paper Forms (for non-residents)
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white rounded border border-gray-100">
                    <div>
                      <span className="font-medium text-gray-800">TR1 (FT) Form</span>
                      <p className="text-sm text-gray-700">For non-resident individuals, partnerships, trusts, or unincorporated bodies</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-gray-200 text-gray-700"
                      onClick={() => window.open('https://www.revenue.ie/en/companies-and-charities/documents/tr1-ft.pdf', '_blank')}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      TR1 (FT)
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded border border-gray-100">
                    <div>
                      <span className="font-medium text-gray-800">TR2 (FT) Form</span>
                      <p className="text-sm text-gray-700">For non-resident companies</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-gray-200 text-gray-700"
                      onClick={() => window.open('https://www.revenue.ie/en/companies-and-charities/documents/tr2-ft.pdf', '_blank')}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      TR2 (FT)
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Two-Tier VAT System:</h4>
              <p className="text-blue-800 text-sm">Specify whether you need &quot;domestic-only&quot; registration (for trading within Ireland or with non-EU countries) or &quot;intra-EU&quot; registration (for trading with EU businesses, requiring additional documentation like EC Sales List reporting details).</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm"><strong>Note:</strong> Non-residents can submit paper applications to: Business Taxes Registrations, Office of The Revenue Commissioners, P.O. Box 1, Wexford. Online registration via ROS is preferred for faster processing.</p>
            </div>
          </CardContent>
        </Card>

        {/* Step 4: Register Through ROS */}
        <Card className="card-modern hover-lift mb-2" id="step-4">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
              <span className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">4</span>
              Register Through the Revenue Online Service (ROS)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-600">Most businesses register for VAT online through ROS for efficiency. Follow these steps:</p>
            
            <div className="space-y-4">
              {/* Create ROS Account */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <span className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">Create a ROS Account</h4>
                  <p className="text-gray-700 mb-3">Visit the ROS website at <a href="https://www.ros.ie" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-700 underline">www.ros.ie</a> and register for a ROS account if you don&apos;t have one.</p>
                  <p className="text-gray-700">You&apos;ll need your PPS number (for sole traders) or TRN (for companies).</p>
                  <Button 
                    size="sm" 
                    className="mt-3 bg-teal-600 hover:bg-teal-700"
                    onClick={() => window.open('https://www.ros.ie/myenquiries-web/registration/registration.html?execution=e1s1', '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    ROS Registration Guide
                  </Button>
                </div>
              </div>

              {/* Complete Form */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <span className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">Complete the Appropriate Form</h4>
                  <p className="text-gray-700 mb-3">Log in to ROS at <a href="https://www.ros.ie" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-700 underline">www.ros.ie</a> and select the TR1 or TR2 form based on your business type.</p>
                  <ul className="space-y-1 text-gray-700">
                    <li>• Fill in all required fields, including business details, turnover estimates, and VAT registration date</li>
                    <li>• Indicate whether you&apos;re applying for &quot;domestic-only&quot; or &quot;intra-EU&quot; status</li>
                  </ul>
                </div>
              </div>

              {/* Upload Documents */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <span className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">Upload Supporting Documents</h4>
                  <p className="text-gray-700 mb-3">Attach evidence of trade (e.g., invoices, contracts) and any required identification documents.</p>
                  <p className="text-gray-700">For &quot;intra-EU&quot; registration, include details on transportation arrangements, types of supplies, and due diligence for verifying customers/suppliers.</p>
                </div>
              </div>

              {/* Submit Application */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <span className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">Submit the Application</h4>
                  <p className="text-gray-700 mb-3">Review your application for accuracy to avoid delays.</p>
                  <p className="text-gray-700">Submit the form through ROS. You&apos;ll receive a confirmation of submission.</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm"><strong>Alternative for Non-Residents:</strong> If you cannot use ROS, complete the TR1 (FT) or TR2 (FT) paper form and mail it to the Revenue Commissioners at the Wexford address provided above. <a href="https://www.revenue.ie/en/vat/registering-for-vat/non-resident-vat-registration.aspx" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">Non-Resident VAT Registration Guidance</a></p>
            </div>
          </CardContent>
        </Card>

        {/* Step 5: Await Processing */}
        <Card className="card-modern hover-lift mb-2" id="step-5">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
              <span className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">5</span>
              Await Processing and Respond to Queries
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-600">Once submitted, the Revenue Commissioners will review your application.</p>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Processing Time */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                  <Clock className="h-5 w-5 text-green-600 mr-2" />
                  Processing Time
                </h4>
                <ul className="space-y-2 text-green-700 text-sm">
                  <li>• Online applications typically take 7–10 working days if no additional information is required</li>
                  <li>• Paper applications or complex cases (e.g., non-resident businesses) may take up to 28 days</li>
                </ul>
              </div>

              {/* Revenue Queries */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-3 flex items-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                  Revenue Queries
                </h4>
                <ul className="space-y-2 text-yellow-700 text-sm">
                  <li>• If Revenue requests further clarification or documentation, respond within 30 days to avoid delays</li>
                  <li>• Common reasons for queries include insufficient evidence of trade or incomplete forms</li>
                </ul>
              </div>

              {/* Approval */}
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <h4 className="font-semibold text-teal-900 mb-3 flex items-center">
                  <CheckCircle className="h-5 w-5 text-teal-600 mr-2" />
                  Approval
                </h4>
                <ul className="space-y-2 text-teal-700 text-sm">
                  <li>• Upon approval, you&apos;ll receive a VAT number in the format &quot;IE&quot; followed by 8 or 9 characters (e.g., IE1234567A or IE12345678B)</li>
                  <li>• The VAT number is effective from the start of the next taxable period (two months after application receipt) or the date you were required to register</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 6: Post-Registration Obligations */}
        <Card className="card-modern hover-lift mb-2" id="step-6">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
              <span className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">6</span>
              Understand Post-Registration Obligations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-600">After receiving your VAT number, you must comply with ongoing VAT requirements to avoid penalties (e.g., €4,000 for non-compliance).</p>
            
            <div className="space-y-4">
              {/* Charge VAT on Sales */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Euro className="h-5 w-5 text-teal-600 mr-2" />
                  Charge VAT on Sales
                </h4>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• Apply the appropriate VAT rate: 23% (standard), 13.5% (reduced, e.g., food, construction), 9% (e.g., newspapers), 4.8% (super-reduced), or 0% (e.g., children&apos;s clothes, exports)</li>
                  <li>• Issue VAT-compliant invoices with your VAT number</li>
                </ul>
              </div>

              {/* Submit VAT Returns */}
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <h4 className="font-semibold text-teal-900 mb-3 flex items-center">
                  <FileText className="h-5 w-5 text-teal-600 mr-2" />
                  Submit VAT Returns
                </h4>
                <div className="space-y-3">
                  <ul className="space-y-2 text-teal-700 text-sm">
                    <li>• Submit VAT returns every two months, detailing sales, purchases, and VAT owed</li>
                    <li>• Choose between invoice basis (VAT due when invoiced) or cash basis (VAT due when paid, if turnover is below €2 million and 90% of customers are non-VAT-registered)</li>
                  </ul>
                  <div className="bg-white border border-teal-200 rounded-lg p-3">
                    <p className="text-teal-800 text-sm mb-2"><strong>Note:</strong> You can calculate, submit, and pay VAT using digital platforms.</p>
                    <Button 
                      size="sm" 
                      className="bg-teal-600 hover:bg-teal-700"
                      onClick={() => window.location.href = '/vat-guide'}
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Learn about VAT process
                    </Button>
                  </div>
                </div>
              </div>

              {/* Pay VAT */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                  <Calculator className="h-5 w-5 text-blue-600 mr-2" />
                  Pay VAT
                </h4>
                <div className="space-y-3">
                  <p className="text-blue-700 text-sm">Pay any VAT owed to Revenue on time to avoid penalties.</p>
                  <div className="bg-white border border-blue-200 rounded-lg p-3">
                    <p className="text-blue-800 text-sm mb-2"><strong>Note:</strong> You can calculate, submit, and pay VAT using digital platforms.</p>
                    <Button 
                      size="sm" 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => window.location.href = '/about'}
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Contact for help
                    </Button>
                  </div>
                </div>
              </div>

              {/* Reclaim Input VAT */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  Reclaim Input VAT
                </h4>
                <div className="space-y-3">
                  <p className="text-green-700 text-sm">Claim VAT paid on business purchases (e.g., supplies, equipment) if related to taxable sales. Keep valid VAT invoices for deductions.</p>
                  <div className="bg-white border border-green-200 rounded-lg p-3">
                    <p className="text-green-800 text-sm mb-2"><strong>Note:</strong> You can calculate, submit, and pay VAT using digital platforms.</p>
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => window.location.href = '/pricing'}
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      View pricing options
                    </Button>
                  </div>
                </div>
              </div>

              {/* Additional Reporting */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-3 flex items-center">
                  <FileText className="h-5 w-5 text-purple-600 mr-2" />
                  Additional Reporting
                </h4>
                <ul className="space-y-2 text-purple-700 text-sm">
                  <li>• For intra-EU trade, submit EC Sales List reports and comply with Intrastat requirements for goods movements. <a href="https://www.revenue.ie/en/vat/vat-on-sales-and-purchases/vat-on-intra-eu-transactions/ec-sales-list.aspx" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 underline">EC Sales List Guidance</a></li>
                  <li>• For e-commerce, consider VAT OSS (One Stop Shop) for simplified EU sales reporting. <a href="https://www.revenue.ie/en/vat/vat-on-e-services/one-stop-shop-oss/index.aspx" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 underline">VAT OSS Information</a></li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 7: Monitor and Maintain Compliance */}
        <Card className="card-modern hover-lift mb-2" id="step-7">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
              <span className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">7</span>
              Monitor and Maintain Compliance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <FileText className="h-4 w-4 text-gray-600 mr-2" />
                  Record-Keeping
                </h4>
                <p className="text-gray-700 text-sm">Maintain accurate records of all VAT-related transactions, including invoices and bank statements, for Revenue audits.</p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-2 flex items-center">
                  <CheckCircle className="h-4 w-4 text-yellow-600 mr-2" />
                  Compliance Checks
                </h4>
                <p className="text-yellow-700 text-sm">Revenue may verify your compliance post-registration. Ensure transparency and accuracy in your VAT affairs.</p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-2 flex items-center">
                  <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                  Cancel Registration
                </h4>
                <p className="text-red-700 text-sm">If your business ceases trading, falls below thresholds, or no longer requires a VAT number, notify Revenue promptly. <a href="https://www.revenue.ie/en/vat/registering-for-vat/cancelling-vat-registration.aspx" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-700 underline">Cancel VAT Registration</a></p>
                <p className="text-red-700 text-sm mt-2">Note that cancellation may result in repaying excess VAT refunds.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PayVAT CTA */}
        <Card className="card-premium hover-lift">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Streamline Your VAT Management?</h3>
            <p className="text-gray-600 mb-2 max-w-2xl mx-auto">Once you receive your VAT number, let PayVAT handle your VAT calculations, submissions, and payments. Focus on growing your business while we ensure your VAT compliance.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-8 text-lg"
                onClick={() => window.location.href = '/about'}
              >
                <ArrowRight className="h-5 w-5 mr-2" />
                Contact PayVAT
              </Button>
              <Button 
                variant="outline" 
                className="border-teal-200 text-teal-700 hover:bg-teal-50 py-3 px-8 text-lg"
                onClick={() => window.location.href = '/vat-guide'}
              >
                <BookOpen className="h-5 w-5 mr-2" />
                Learn More About VAT
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}