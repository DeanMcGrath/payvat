"use client"

import { useDocumentsData } from "@/hooks/useDocumentsData"
import { useEffect, useState } from 'react'

export default function TestDashboard() {
  const {
    state: { documents, vatData, loadingDocuments, loadingVAT, error },
    computed: { totalDocuments, salesDocuments, purchaseDocuments }
  } = useDocumentsData()
  
  const [directApiTest, setDirectApiTest] = useState<any>(null)
  
  // Test API directly
  useEffect(() => {
    async function testDirectAPI() {
      try {
        console.log('Testing direct API call...')
        const response = await fetch('/api/documents?dashboard=true')
        console.log('Direct API response status:', response.status)
        const data = await response.json()
        console.log('Direct API data:', data)
        setDirectApiTest({
          status: response.status,
          success: data.success,
          documentCount: data.documents?.length || 0
        })
      } catch (err) {
        console.error('Direct API test failed:', err)
        setDirectApiTest({ error: err instanceof Error ? err.message : 'Unknown error' })
      }
    }
    testDirectAPI()
  }, [])

  return (
    <div className="p-8">
      <h1>Dashboard Debug Test</h1>
      
      <div className="space-y-4 mt-8">
        <div>
          <strong>Loading Documents:</strong> {loadingDocuments.toString()}
        </div>
        <div>
          <strong>Loading VAT:</strong> {loadingVAT.toString()}
        </div>
        <div>
          <strong>Error:</strong> {error || 'None'}
        </div>
        <div>
          <strong>Total Documents:</strong> {totalDocuments}
        </div>
        <div>
          <strong>Sales Documents:</strong> {salesDocuments.length}
        </div>
        <div>
          <strong>Purchase Documents:</strong> {purchaseDocuments.length}
        </div>
        <div>
          <strong>VAT Data:</strong> {vatData ? 'Loaded' : 'Not loaded'}
        </div>
        
        {directApiTest && (
          <div>
            <h3>Direct API Test:</h3>
            <pre>{JSON.stringify(directApiTest, null, 2)}</pre>
          </div>
        )}
        
        {documents.length > 0 && (
          <div>
            <h3>First Document:</h3>
            <pre>{JSON.stringify(documents[0], null, 2)}</pre>
          </div>
        )}
        
        {error && (
          <div style={{color: 'red'}}>
            <h3>Error Details:</h3>
            <pre>{error}</pre>
          </div>
        )}
      </div>
    </div>
  )
}