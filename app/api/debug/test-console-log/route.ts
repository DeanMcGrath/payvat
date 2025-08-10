import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  console.log('🧪🧪🧪 TEST CONSOLE LOG ENDPOINT CALLED')
  console.log('   This is a test to verify console.log works in production')
  console.log('   Current time:', new Date().toISOString())
  console.log('   If you see this, console.log is working!')
  
  return NextResponse.json({
    success: true,
    message: 'Console log test executed - check browser console for logs',
    timestamp: new Date().toISOString()
  })
}