"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DebugButton } from "@/components/ui/debug-button"

export default function TestJSPage() {
  const [clickCount, setClickCount] = useState(0)
  const [jsStatus, setJsStatus] = useState("Loading...")
  const [errorMessage, setErrorMessage] = useState("")

  // Test basic JavaScript execution using useEffect
  useEffect(() => {
    setJsStatus("✅ React useState hook working")
    console.log("✅ Test page loaded - JavaScript is executing")
    
    // Test DOM manipulation
    setTimeout(() => {
      try {
        const testElement = document.createElement("div")
        testElement.textContent = "DOM manipulation works"
        setJsStatus("✅ React hooks and DOM manipulation working")
      } catch (error) {
        setErrorMessage(`❌ DOM error: ${error}`)
      }
    }, 100)
  }, [])

  // Test button click handler
  const handleTestClick = () => {
    console.log("🔘 Button clicked! Count:", clickCount + 1)
    setClickCount(prev => prev + 1)
    
    // Test API call
    testApiCall()
  }

  // Test API endpoint
  const testApiCall = async () => {
    try {
      const response = await fetch('/api/debug/test-console-log', {
        method: 'GET'
      })
      console.log('📡 API test response:', response.status)
    } catch (error) {
      console.error('❌ API test failed:', error)
      setErrorMessage(`API error: ${error}`)
    }
  }

  // Test direct HTML button
  const handleNativeClick = () => {
    console.log("🔘 Native HTML button clicked!")
    alert("Native HTML button works!")
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>PayVAT JavaScript Test Page</h1>
      
      <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f0f9ff', border: '1px solid #0369a1', borderRadius: '8px' }}>
        <h2>JavaScript Status</h2>
        <p><strong>Status:</strong> {jsStatus}</p>
        <p><strong>React State:</strong> Click count = {clickCount}</p>
        {errorMessage && <p style={{ color: 'red' }}><strong>Error:</strong> {errorMessage}</p>}
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Button Tests</h2>
        
        <div style={{ marginBottom: '1rem' }}>
          <h3>1. Original React Button Component:</h3>
          <Button 
            onClick={handleTestClick}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Original Button (Clicked {clickCount} times)
          </Button>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <h3>2. Test Button - Simple Red:</h3>
          <DebugButton 
            variant="test1"
            onClick={handleTestClick}
          >
            Simple Test Button (Clicked {clickCount} times)
          </DebugButton>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <h3>3. Test Button - No Transforms:</h3>
          <DebugButton 
            variant="test2"
            onClick={handleTestClick}
          >
            No Transform Button (Clicked {clickCount} times)
          </DebugButton>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <h3>4. Test Button - With pointer-events:</h3>
          <DebugButton 
            variant="test3"
            onClick={handleTestClick}
          >
            Pointer Events Button (Clicked {clickCount} times)
          </DebugButton>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <h3>5. Native HTML Button:</h3>
          <button 
            onClick={handleNativeClick}
            style={{ 
              backgroundColor: '#059669', 
              color: 'white', 
              padding: '8px 16px', 
              borderRadius: '6px', 
              border: 'none', 
              cursor: 'pointer' 
            }}
          >
            Native HTML Button
          </button>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <h3>6. Inline onClick Test:</h3>
          <button 
            onClick={() => {
              console.log("🔘 Inline onClick works!")
              alert("Inline onClick works!")
            }}
            style={{ 
              backgroundColor: '#dc2626', 
              color: 'white', 
              padding: '8px 16px', 
              borderRadius: '6px', 
              border: 'none', 
              cursor: 'pointer' 
            }}
          >
            Inline onClick Test
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px' }}>
        <h2>Console Debug Info</h2>
        <p>Check your browser console (F12) for detailed logs:</p>
        <ul>
          <li>✅ React state updates</li>
          <li>🔘 Button click events</li>
          <li>📡 API call attempts</li>
          <li>❌ Any JavaScript errors</li>
        </ul>
      </div>

      <div>
        <h2>Network Test</h2>
        <button 
          onClick={async () => {
            console.log("🌐 Testing network request...")
            try {
              const response = await fetch('/', { method: 'GET' })
              console.log("✅ Network request successful:", response.status)
              alert(`Network test: ${response.status} ${response.statusText}`)
            } catch (error) {
              console.error("❌ Network request failed:", error)
              alert(`Network error: ${error}`)
            }
          }}
          style={{ 
            backgroundColor: '#7c3aed', 
            color: 'white', 
            padding: '8px 16px', 
            borderRadius: '6px', 
            border: 'none', 
            cursor: 'pointer' 
          }}
        >
          Test Network Request
        </button>
      </div>
    </div>
  )
}