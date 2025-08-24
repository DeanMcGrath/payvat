"use client"

import { useEffect, useState } from 'react'

export default function SimpleTest() {
  const [apiResult, setApiResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('SimpleTest: useEffect running')
    
    async function testSimple() {
      try {
        console.log('SimpleTest: Making API call...')
        
        const response = await fetch('/api/documents?dashboard=true', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        })
        
        console.log('SimpleTest: Response received', response.status, response.ok)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const data = await response.json()
        console.log('SimpleTest: Data parsed', data)
        
        setApiResult({
          success: data.success,
          documentCount: data.documents?.length || 0,
          firstDoc: data.documents?.[0]?.fileName || 'None',
          categories: data.documents?.map(d => d.category).slice(0, 5) || []
        })
        
      } catch (err) {
        console.error('SimpleTest: Error occurred', err)
        setApiResult({ 
          error: err instanceof Error ? err.message : 'Unknown error',
          stack: err instanceof Error ? err.stack : undefined
        })
      } finally {
        setLoading(false)
      }
    }
    
    testSimple()
  }, [])

  return (
    <div className="p-8">
      <h1>Simple API Test</h1>
      <div className="mt-4">
        <div><strong>Loading:</strong> {loading.toString()}</div>
        {apiResult && (
          <div className="mt-4">
            <h2>API Result:</h2>
            <pre className="bg-gray-100 p-4 rounded">
              {JSON.stringify(apiResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}