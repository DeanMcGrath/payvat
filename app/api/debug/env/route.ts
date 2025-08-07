import { NextRequest, NextResponse } from 'next/server'

// Debug endpoint to check environment variables (remove in production)
export async function GET(request: NextRequest) {
  // Only allow in development or with special header for security
  const isDebugAllowed = process.env.NODE_ENV === 'development' || 
                         request.headers.get('x-debug-key') === 'debug-env-2024'
  
  if (!isDebugAllowed) {
    return NextResponse.json(
      { error: 'Not authorized' },
      { status: 403 }
    )
  }

  const adminSetupKey = process.env.ADMIN_SETUP_KEY
  
  return NextResponse.json({
    environment: process.env.NODE_ENV,
    adminSetupKeyExists: !!adminSetupKey,
    adminSetupKeyLength: adminSetupKey?.length || 0,
    adminSetupKeyStart: adminSetupKey?.substring(0, 10) || 'not-set',
    adminSetupKeyEnd: adminSetupKey?.substring(-10) || 'not-set',
    allEnvKeys: Object.keys(process.env).filter(key => key.includes('ADMIN')),
    timestamp: new Date().toISOString()
  })
}