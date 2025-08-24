import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, Upload, FileText, Home, AlertCircle } from 'lucide-react'

// Server-side rendered dashboard that works without JavaScript
export function ServerDashboard() {
  return (
    <div className="max-w-7xl mx-auto p-6" data-server-dashboard>
      <noscript>
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">
                JavaScript is required for full dashboard functionality. Please enable JavaScript or use the basic controls below.
              </p>
            </div>
          </div>
        </div>
      </noscript>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Document Management</h1>
        <div className="flex gap-3">
          <Button onClick={() => window.location.reload()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => window.location.href = '/'} variant="outline">
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
        </div>
      </div>

      {/* Stats Grid - Server Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Documents</p>
                <p className="text-2xl font-bold text-gray-900">Loading...</p>
              </div>
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sales VAT</p>
                <p className="text-2xl font-bold text-green-600">€0.00</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 font-bold">+</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Purchase VAT</p>
                <p className="text-2xl font-bold text-blue-600">€0.00</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-bold">-</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net VAT</p>
                <p className="text-2xl font-bold text-purple-600">€0.00</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-purple-600 font-bold">=</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons - Always Work */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Upload your VAT documents for processing and analysis.
            </p>
            <Button 
              onClick={() => window.location.href = '/vat-submission'}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Documents
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Submit VAT Return</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Submit your completed VAT return to Revenue.
            </p>
            <Button 
              onClick={() => window.location.href = '/submit-return'}
              variant="outline"
              className="w-full"
            >
              <FileText className="h-4 w-4 mr-2" />
              Submit Return
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Documents Section - Server Side */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Documents</CardTitle>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reload
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Documents...</h3>
            <p className="text-gray-600 mb-6">
              If this page doesn't load properly, try refreshing or enable JavaScript.
            </p>
            <div className="flex justify-center gap-3">
              <Button onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Page
              </Button>
              <Button onClick={() => window.location.href = '/vat-submission'} variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Upload New Documents
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer Help */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          Having trouble? Try <button 
            onClick={() => window.location.reload()} 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            refreshing the page
          </button> or <a 
            href="/contact" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            contact support
          </a>.
        </p>
      </div>
    </div>
  )
}

// Enhanced client-side component (loaded after JS hydration)
export function ClientDashboard() {
  return (
    <div id="client-dashboard" className="hidden">
      {/* This will be populated by the client-side JavaScript */}
      <p>Loading enhanced dashboard...</p>
    </div>
  )
}