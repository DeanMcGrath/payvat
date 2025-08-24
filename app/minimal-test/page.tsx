"use client"

import { useEffect, useState } from 'react'
import { documentsApi } from '@/lib/apiClient'

export default function MinimalTest() {
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('MinimalTest: Starting...')
    
    async function testApiClient() {
      try {
        console.log('MinimalTest: Calling documentsApi.getAll...')
        
        const response = await documentsApi.getAll({ dashboard: true })
        
        console.log('MinimalTest: Response received:', response)
        
        setResult({
          success: response.success,
          documentCount: response.documents?.length || 0,
          hasDocuments: !!response.documents,
          responseType: typeof response,
          responseKeys: Object.keys(response)
        })
        
      } catch (err) {
        console.error('MinimalTest: Error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        console.log('MinimalTest: Setting loading to false')
        setLoading(false)
      }
    }
    
    testApiClient()
  }, [])

  console.log('MinimalTest: Render - loading:', loading, 'result:', result, 'error:', error)

  return (
    <div className="p-8">
      <h1>Minimal API Client Test</h1>
      <div className="mt-4">
        <div><strong>Loading:</strong> {loading.toString()}</div>
        <div><strong>Error:</strong> {error || 'None'}</div>
        {result && (
          <div className="mt-4">
            <h2>Result:</h2>
            <pre className="bg-gray-100 p-4 rounded">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}