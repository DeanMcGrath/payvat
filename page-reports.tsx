"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, TrendingUp, FileText, Calendar, Download, Eye, BarChart3, PieChart, LineChart, Euro, Building } from 'lucide-react'
import LiveChat from "./components/live-chat"

export default function ReportsPage() {
  // Mock report data
  const reports = [
    {
      id: 1,
      title: "VAT Summary Report",
      period: "Q4 2024",
      type: "VAT Summary",
      status: "Available",
      date: "15 Jan 2025",
      amount: "€12,450.00"
    },
    {
      id: 2,
      title: "Annual VAT Report",
      period: "2024",
      type: "Annual Summary",
      status: "Available",
      date: "31 Dec 2024",
      amount: "€48,230.00"
    },
    {
      id: 3,
      title: "Q3 2024 VAT Return",
      period: "Q3 2024",
      type: "VAT Return",
      status: "Submitted",
      date: "15 Oct 2024",
      amount: "€8,750.00"
    },
    {
      id: 4,
      title: "Q2 2024 VAT Return",
      period: "Q2 2024",
      type: "VAT Return",
      status: "Paid",
      date: "15 Jul 2024",
      amount: "€6,890.00"
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'Submitted':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Paid':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.location.href = '/dashboard'}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">
              PAY <span className="text-emerald-500">VAT</span>
            </h1>
          </div>
          <div className="text-right">
            <h3 className="text-lg font-bold text-emerald-600">Brian Cusack Trading Ltd</h3>
            <p className="text-emerald-600 font-mono text-sm">VAT: IE0352440A</p>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">VAT Reports & Analytics</h2>
              <p className="text-gray-600">View and download your VAT reports and financial summaries</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total VAT Paid (2024)</CardTitle>
              <Euro className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">€48,230.00</div>
              <p className="text-xs text-emerald-600 mt-1">+15% from 2023</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Returns Filed</CardTitle>
              <FileText className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">6</div>
              <p className="text-xs text-gray-500 mt-1">Bi-monthly returns</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Average VAT</CardTitle>
              <BarChart3 className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">€8,038.33</div>
              <p className="text-xs text-gray-500 mt-1">Per return period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">On-Time Payments</CardTitle>
              <Calendar className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">100%</div>
              <p className="text-xs text-emerald-600 mt-1">Perfect record</p>
            </CardContent>
          </Card>
        </div>

        {/* Report Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-emerald-200 hover:border-emerald-300 cursor-pointer transition-colors">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <PieChart className="h-5 w-5 mr-2 text-emerald-600" />
                VAT Summary Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">
                Comprehensive VAT summaries by period with breakdowns of sales and purchase VAT.
              </p>
              <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
                View VAT Summaries
              </Button>
            </CardContent>
          </Card>

          <Card className="border-blue-200 hover:border-blue-300 cursor-pointer transition-colors">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <LineChart className="h-5 w-5 mr-2 text-blue-600" />
                Trend Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">
                Analyze VAT trends over time with visual charts and comparative data.
              </p>
              <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50">
                View Trends
              </Button>
            </CardContent>
          </Card>

          <Card className="border-purple-200 hover:border-purple-300 cursor-pointer transition-colors">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
                Annual Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">
                Complete annual VAT reports for tax filing and business planning purposes.
              </p>
              <Button variant="outline" className="w-full border-purple-200 text-purple-700 hover:bg-purple-50">
                View Annual Reports
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Reports List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-emerald-600" />
                Recent Reports
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{report.title}</h4>
                      <p className="text-sm text-gray-600">{report.period} • {report.date}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{report.amount}</p>
                      <Badge className={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          <Button 
            variant="outline"
            onClick={() => window.location.href = '/dashboard'}
          >
            Back to Dashboard
          </Button>
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
            <Download className="h-4 w-4 mr-2" />
            Export All Reports
          </Button>
        </div>
      </div>

      {/* Live Chat */}
      <LiveChat />

      {/* Footer */}
      <footer className="mt-8 py-6 text-center border-t border-gray-200">
        <p className="text-gray-500 text-sm">payvat.ie</p>
      </footer>
    </div>
  )
}
