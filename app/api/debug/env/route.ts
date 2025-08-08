import { NextRequest, NextResponse } from 'next/server'
import { isAIEnabled } from '@/lib/ai/openai'

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
  const openaiKey = process.env.OPENAI_API_KEY
  
  return NextResponse.json({
    environment: process.env.NODE_ENV,
    adminSetupKeyExists: !!adminSetupKey,
    adminSetupKeyLength: adminSetupKey?.length || 0,
    adminSetupKeyStart: adminSetupKey?.substring(0, 10) || 'not-set',
    adminSetupKeyEnd: adminSetupKey?.substring(-10) || 'not-set',
    openaiKeyExists: !!openaiKey,
    openaiKeyLength: openaiKey?.length || 0,
    openaiKeyStart: openaiKey?.substring(0, 15) || 'not-set',
    openaiKeyEnd: openaiKey?.substring(-10) || 'not-set',
    aiEnabled: isAIEnabled(),
    allEnvKeys: Object.keys(process.env).filter(key => key.includes('ADMIN') || key.includes('OPENAI')),
    timestamp: new Date().toISOString()
  })
}