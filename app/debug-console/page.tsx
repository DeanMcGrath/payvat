"use client"

import { useEffect, useState } from 'react'

export default function DebugConsole() {
  const [logs, setLogs] = useState<string[]>([])
  const [apiResult, setApiResult] = useState<any>(null)
  const [jsError, setJsError] = useState<string | null>(null)

  // Override console methods to capture logs
  useEffect(() => {
    const originalLog = console.log
    const originalError = console.error
    const originalWarn = console.warn

    const captureLog = (level: string, ...args: any[]) => {
      const message = `[${level}] ${args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ')}`
      setLogs(prev => [...prev, message])
      if (level === 'log') originalLog(...args)
      if (level === 'error') originalError(...args)
      if (level === 'warn') originalWarn(...args)
    }

    console.log = (...args) => captureLog('log', ...args)
    console.error = (...args) => captureLog('error', ...args)
    console.warn = (...args) => captureLog('warn', ...args)

    // Global error handler
    const errorHandler = (event: ErrorEvent) => {
      setJsError(`${event.error?.message || event.message} at ${event.filename}:${event.lineno}`)
      captureLog('error', 'Global error:', event.error)
    }

    window.addEventListener('error', errorHandler)
    window.addEventListener('unhandledrejection', (event) => {
      setJsError(`Unhandled promise rejection: ${event.reason}`)
      captureLog('error', 'Unhandled promise rejection:', event.reason)
    })

    console.log('DebugConsole: Component mounted, starting test...')

    // Test basic functionality
    setTimeout(() => {
      console.log('DebugConsole: setTimeout works')
      
      // Test fetch
      console.log('DebugConsole: Testing fetch API...')
      fetch('/api/documents?dashboard=true')
        .then(response => {
          console.log('DebugConsole: Fetch response received:', response.status, response.ok)
          return response.json()
        })
        .then(data => {
          console.log('DebugConsole: Fetch data received:', data)
          setApiResult({
            success: data.success,
            documentCount: data.documents?.length || 0,
            hasDocuments: Array.isArray(data.documents)
          })
        })
        .catch(err => {
          console.error('DebugConsole: Fetch failed:', err)
          setApiResult({ error: err.message })
        })
    }, 1000)

    return () => {
      console.log = originalLog
      console.error = originalError  
      console.warn = originalWarn
      window.removeEventListener('error', errorHandler)
    }
  }, [])

  console.log('DebugConsole: Render called')

  return (
    <div className="p-8 max-w-4xl">
      <h1>Debug Console</h1>
      
      <div className="mt-4 space-y-4">
        <div>
          <strong>Current Time:</strong> {new Date().toISOString()}
        </div>
        
        <div>
          <strong>JavaScript Error:</strong> {jsError || 'None'}
        </div>

        <div>
          <strong>API Result:</strong>
          <pre className="bg-gray-100 p-2 rounded mt-1">
            {apiResult ? JSON.stringify(apiResult, null, 2) : 'Not loaded yet'}
          </pre>
        </div>

        <div>
          <strong>Console Logs:</strong>
          <div className="bg-black text-white p-4 rounded max-h-96 overflow-y-auto text-sm">
            {logs.length === 0 ? 'No logs captured yet...' : logs.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}