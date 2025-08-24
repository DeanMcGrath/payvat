"use client"

import { useEffect, useState } from 'react'

export default function DebugAPI() {
  const [apiTest, setApiTest] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function testAPI() {
      try {
        console.log('Testing API direct fetch...')
        
        const response = await fetch('/api/documents?dashboard=true', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        })
        
        console.log('Response status:', response.status)
        console.log('Response headers:', response.headers)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const data = await response.json()
        console.log('Response data:', data)
        
        setApiTest({
          success: data.success,
          documentCount: data.documents?.length || 0,
          hasDocuments: !!data.documents,
          firstDocumentId: data.documents?.[0]?.id || null,
          firstDocumentCategory: data.documents?.[0]?.category || null
        })
        
      } catch (err) {
        console.error('API test failed:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    
    testAPI()
  }, [])

  return (
    <div className="p-8">
      <h1>API Debug Test</h1>
      
      <div className="space-y-4 mt-8">
        <div>
          <strong>Loading:</strong> {loading.toString()}
        </div>
        <div>
          <strong>Error:</strong> {error || 'None'}
        </div>
        {apiTest && (
          <div>
            <h3>API Test Results:</h3>
            <pre>{JSON.stringify(apiTest, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}