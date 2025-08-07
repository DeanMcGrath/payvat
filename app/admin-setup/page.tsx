"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react'

export default function AdminSetup() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    vatNumber: '',
    setupKey: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          businessName: formData.businessName,
          vatNumber: formData.vatNumber,
          setupKey: formData.setupKey
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setSuccess('Admin user created successfully! You can now login.')
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          businessName: '',
          vatNumber: '',
          setupKey: ''
        })
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          window.location.href = '/login'
        }, 3000)
      } else {
        setError(data.error || 'Failed to create admin user')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Clear errors when user starts typing
    if (error) setError('')
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-teal-800">
            <Shield className="h-5 w-5" />
            <span>Admin Setup</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>First-time setup:</strong> Create the initial administrator account for payvat.ie
            </p>
          </div>

          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {success}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="setupKey">Setup Key *</Label>
              <Input
                id="setupKey"
                name="setupKey"
                type="password"
                value={formData.setupKey}
                onChange={handleInputChange}
                placeholder="Enter admin setup key"
                required
                className="bg-yellow-50 border-yellow-200 focus:border-yellow-400"
              />
              <p className="text-xs text-gray-500">
                Contact system administrator for the setup key
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter admin email address"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Min 8 characters"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Repeat password"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                placeholder="Your Business Ltd"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vatNumber">VAT Number *</Label>
              <Input
                id="vatNumber"
                name="vatNumber"
                value={formData.vatNumber}
                onChange={handleInputChange}
                placeholder="IE0000000AA"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white"
            >
              {loading ? 'Creating Admin...' : 'Create Admin User'}
            </Button>
          </form>

          <div className="mt-4 pt-4 border-t text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <a href="/login" className="text-teal-600 hover:text-teal-700 font-medium">
                Login here
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}