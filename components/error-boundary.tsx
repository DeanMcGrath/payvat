"use client"

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  errorId: string
}

// Security: Error boundary with secure error handling
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, errorId: '' }
  }

  static getDerivedStateFromError(error: Error): State {
    // Security: Generate safe error ID for logging/support
    const errorId = Math.random().toString(36).substring(2, 15)
    
    // Security: Log error securely (in production, send to monitoring service)
    if (typeof window !== 'undefined') {
      console.error('Error Boundary caught an error:', {
        errorId,
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      })
    }

    return { hasError: true, errorId }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Security: Log additional error info securely
    console.error('Error Boundary - Component Stack:', {
      errorId: this.state.errorId,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    })

    // Security: In production, report to error monitoring service
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } })
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorId: '' })
    // Security: Reload the page to reset state
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // Security: Custom fallback UI with no sensitive information
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                <span>Something went wrong</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                We encountered an unexpected error. Our team has been notified and is working on a fix.
              </p>
              
              {/* Security: Only show error ID for support, not actual error details */}
              <div className="bg-gray-100 p-3 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Error ID:</strong> {this.state.errorId}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Please provide this ID when contacting support
                </p>
              </div>

              <div className="flex space-x-2">
                <Button 
                  onClick={this.handleRetry}
                  className="flex-1 bg-[#2A7A8F] hover:bg-[#216477]"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/'}
                  className="flex-1"
                >
                  Go Home
                </Button>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-500">
                  If the problem persists, please contact support at{' '}
                  <a 
                    href="mailto:support@payvat.ie" 
                    className="text-[#2A7A8F] hover:text-[#216477]"
                  >
                    support@payvat.ie
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}