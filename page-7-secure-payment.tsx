"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SecurePayment() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Card className="max-w-md mx-auto mt-20">
        <CardHeader>
          <CardTitle>Secure Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Payment functionality coming soon...</p>
          <Button 
            onClick={() => window.location.href = '/dashboard'} 
            className="mt-4"
          >
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}