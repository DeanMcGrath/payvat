"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  ArrowLeft, TrendingUp, FileText, Calendar, Download, Eye, 
  BarChart3, PieChart, LineChart, Euro, Bell, Settings, LogOut, 
  Search, Loader2, AlertCircle, Shield, CheckCircle, Clock,
  ChevronRight, Sparkles, ArrowUp
} from 'lucide-react'
import Footer from "@/components/footer"

interface Report {
  id: number
  title: string
  period: string
  type: string
  status: string
  date: string
  amount: string
}

interface UserProfile {
  id: string
  email: string
  businessName: string
  vatNumber: string
  firstName?: string
  lastName?: string
}

interface UserStats {
  totalVATPayments: number
  returnsFiled: number
  averageVATPerReturn: number
  onTimePaymentRate: number
  currentYear: number
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [userLoading, setUserLoading] = useState(true)
  const [userError, setUserError] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    fetchUserProfile()
    fetchReports()
    fetchUserStats()
    
    // Trigger animations after mount
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)
    
    return () => clearTimeout(timer)
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
        window.location.href = '/login'
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
  
  const fetchReports = async () => {
    try {
      const response = await fetch('/api/reports')
      if (response.ok) {
        const data = await response.json()
        setReports(data.reports || [])
      } else {
        setError('Failed to load reports')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/reports/stats', {
        method: 'GET',
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUserStats(data.stats)
        }
      }
    } catch (err) {
      console.error('Failed to fetch user stats:', err)
    } finally {
      setStatsLoading(false)
    }
  }

  if (userLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-muted-foreground">Loading...</span>
        </div>
      </div>
    )
  }

  if (userError || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <span className="text-lg font-medium text-red-800">Error Loading Page</span>
            </div>
            <p className="text-red-600 text-center mb-4">{userError}</p>
            <div className="flex space-x-2">
              <Button onClick={fetchUserProfile} className="flex-1">
                Try Again
              </Button>
              <Button onClick={() => window.location.href = '/login'} variant="outline" className="flex-1">
                Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="error-card max-w-md mx-auto">
          <h2 className="text-xl font-bold text-foreground mb-2">Error Loading Reports</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="btn-primary hover-lift"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-success/10 text-success border-success/20'
      case 'Submitted':
        return 'bg-primary/10 text-primary border-primary/20'
      case 'Paid':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      default:
        return 'bg-muted text-muted-foreground border-border'
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
                      placeholder="Search reports..."
                      className="w-64 xl:w-80 bg-white/10 text-white placeholder-white/70 border-white/20 backdrop-blur-sm focus:bg-white/15 focus:border-white/40"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70" />
                  </div>
                </div>

                {/* Company Info */}
                <div className="text-right hidden sm:block glass-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                  <h3 className="text-sm lg:text-base font-bold text-white truncate">{user.businessName}</h3>
                  <p className="text-white/70 font-mono text-xs">VAT: {user.vatNumber}</p>
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
                    onClick={handleLogout} 
                    title="Logout"
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
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => window.location.href = '/dashboard'}
                    className="text-white/90 hover:text-white flex items-center space-x-2 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Button>
                  <span className="text-white/90 text-sm font-medium flex items-center space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>Reports & Analytics</span>
                  </span>
                </div>
                <div className="text-white/60 text-xs hidden sm:block">
                  View your VAT reports and financial summaries
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
                  Real-time analytics & insights
                </div>
                
                <div className="icon-premium mb-3 mx-auto">
                  <TrendingUp className="h-12 w-12 text-white" />
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-2">
                  <span className="text-gradient-primary">VAT Reports</span>
                  <br />
                  <span className="text-foreground">& Analytics</span>
                </h1>
                
                <div className="w-32 h-1 gradient-primary mx-auto mb-4 rounded-full"></div>
                
                <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Comprehensive reporting and analytics for your VAT compliance. 
                  <span className="text-primary font-semibold">Export-ready reports at your fingertips.</span>
                </p>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex items-center justify-center gap-8 text-muted-foreground text-sm mb-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-success" />
                  <span>Works with ROS</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span>Real-time data</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-success" />
                  <span>Historical tracking</span>
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

      <div className="px-6 lg:px-8 max-w-7xl mx-auto -mt-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-2">
          <Card className="card-premium hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total VAT Paid (2024)</CardTitle>
              <div className="icon-modern bg-gradient-to-br from-emerald-500 to-teal-600">
                <Euro className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="text-2xl font-bold text-muted-foreground">Loading...</div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-foreground">
                    €{userStats?.totalVATPayments?.toLocaleString('en-IE', { minimumFractionDigits: 2 }) || '0.00'}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {userStats?.currentYear || new Date().getFullYear()} total
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="card-premium hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Returns Filed</CardTitle>
              <div className="icon-modern gradient-primary">
                <FileText className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="text-2xl font-bold text-muted-foreground">Loading...</div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-foreground">
                    {userStats?.returnsFiled || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {userStats?.returnsFiled ? 'Returns filed' : 'Ready to file'}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="card-premium hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average VAT</CardTitle>
              <div className="icon-modern bg-gradient-to-br from-blue-500 to-indigo-600">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="text-2xl font-bold text-muted-foreground">Loading...</div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-foreground">
                    €{userStats?.averageVATPerReturn?.toLocaleString('en-IE', { minimumFractionDigits: 2 }) || '0.00'}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Average per period</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="card-premium hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">On-Time Payments</CardTitle>
              <div className="icon-modern bg-gradient-to-br from-green-500 to-emerald-600">
                <Calendar className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="text-2xl font-bold text-muted-foreground">Loading...</div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-foreground">
                    {userStats?.onTimePaymentRate || 0}%
                  </div>
                  <p className="text-xs text-success mt-1 flex items-center gap-1">
                    {(userStats?.onTimePaymentRate || 0) === 100 ? (
                      <><CheckCircle className="h-3 w-3" />Perfect record</>
                    ) : (
                      <><Clock className="h-3 w-3" />Payment history</>
                    )}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Report Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
          <Card className="card-modern hover-lift group cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground flex items-center">
                <div className="icon-modern gradient-primary mr-3">
                  <PieChart className="h-5 w-5 text-white" />
                </div>
                VAT Summary Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4">
                Comprehensive VAT summaries by period with breakdowns of sales and purchase VAT.
              </p>
              <Button className="w-full btn-primary hover-scale">
                <Sparkles className="h-4 w-4 mr-2" />
                View VAT Summaries
              </Button>
            </CardContent>
          </Card>

          <Card className="card-modern hover-lift group cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground flex items-center">
                <div className="icon-modern bg-gradient-to-br from-blue-500 to-indigo-600 mr-3">
                  <LineChart className="h-5 w-5 text-white" />
                </div>
                Trend Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4">
                Analyze VAT trends over time with visual charts and comparative data.
              </p>
              <Button variant="outline" className="w-full hover-scale glass-white/10">
                View Trends
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card className="card-modern hover-lift group cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground flex items-center">
                <div className="icon-modern bg-gradient-to-br from-teal-500 to-teal-600 mr-3">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                Annual Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4">
                Complete annual VAT reports for tax filing and business planning purposes.
              </p>
              <Button variant="outline" className="w-full hover-scale glass-white/10">
                View Annual Reports
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Reports List */}
        <Card className="card-premium mb-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground flex items-center justify-between">
              <div className="flex items-center">
                <div className="icon-modern gradient-primary mr-3">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                Recent Reports
              </div>
              <Button variant="outline" size="sm" className="hover-scale glass-white/10">
                <Download className="h-4 w-4 mr-2" />
                Download All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reports.length === 0 ? (
                <div className="text-center py-12">
                  <div className="icon-premium mb-4 mx-auto opacity-50">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-muted-foreground">No reports available yet</p>
                  <p className="text-sm text-muted-foreground mt-2">Reports will appear here after your first VAT submission</p>
                </div>
              ) : (
                reports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/30 bg-card hover:bg-accent/5 transition-all group">
                    <div className="flex items-center space-x-4">
                      <div className="icon-modern gradient-glass group-hover:scale-110 transition-transform">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{report.title}</h4>
                        <p className="text-sm text-muted-foreground">{report.period} • {report.date}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{report.amount}</p>
                        <Badge className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="hover-scale glass-white/10">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="hover-scale glass-white/10">
                          <Download className="h-4 w-4 mr-1" />
                          PDF
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 pb-12">
          <Button 
            variant="outline"
            className="hover-scale glass-white/10"
            onClick={() => window.location.href = '/dashboard'}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button className="btn-primary hover-scale shadow-lg">
            <Download className="h-4 w-4 mr-2" />
            Export All Reports
          </Button>
        </div>
      </div>

      
      <Footer />
    </div>
  )
}
