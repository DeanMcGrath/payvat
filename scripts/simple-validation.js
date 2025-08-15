/**
 * Simple Production Validation Script
 * Basic checks for production readiness
 */

const { PrismaClient } = require('../lib/generated/prisma')

async function runBasicValidation() {
  console.log('🚀 PRODUCTION VALIDATION STARTING...')
  console.log('=====================================\n')
  
  const results = {
    database: false,
    security: false,
    environment: false,
    overall: false
  }
  
  const errors = []
  const warnings = []

  // 1. Environment Validation
  console.log('1️⃣ Validating Environment...')
  
  const requiredEnvVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'OPENAI_API_KEY'
  ]

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      errors.push(`Missing required environment variable: ${envVar}`)
      console.log(`   ❌ Missing: ${envVar}`)
    } else {
      console.log(`   ✅ Found: ${envVar}`)
    }
  }

  if (errors.length === 0) {
    results.environment = true
    console.log('   ✅ Environment variables validated')
  }

  console.log('')

  // 2. Security Checks
  console.log('2️⃣ Security Validation...')
  
  if (process.env.NODE_ENV !== 'production') {
    warnings.push('NODE_ENV is not set to production')
    console.log(`   ⚠️  NODE_ENV: ${process.env.NODE_ENV} (should be production)`)
  } else {
    console.log('   ✅ NODE_ENV set to production')
  }

  if (process.env.ENABLE_DEBUG === 'true') {
    errors.push('ENABLE_DEBUG is enabled in production')
    console.log('   ❌ Debug mode enabled')
  } else {
    console.log('   ✅ Debug mode disabled')
  }

  if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length >= 32) {
    console.log('   ✅ NEXTAUTH_SECRET has sufficient length')
  } else {
    errors.push('NEXTAUTH_SECRET is too short or missing')
    console.log('   ❌ NEXTAUTH_SECRET too short')
  }

  if (errors.filter(e => e.includes('DEBUG') || e.includes('SECRET')).length === 0) {
    results.security = true
  }

  console.log('')

  // 3. Database Connectivity
  console.log('3️⃣ Testing Database Connection...')
  const prisma = new PrismaClient()
  try {
    await prisma.$connect()
    
    // Test basic queries
    const userCount = await prisma.user.count()
    const docCount = await prisma.document.count()
    
    console.log('   ✅ Database connection successful')
    console.log(`   📊 Users: ${userCount}, Documents: ${docCount}`)
    results.database = true
  } catch (error) {
    console.log(`   ❌ Database connection failed: ${error.message}`)
    errors.push(`Database: ${error.message}`)
  } finally {
    await prisma.$disconnect()
  }

  console.log('')

  // Final Assessment
  console.log('📋 VALIDATION SUMMARY')
  console.log('=====================')
  
  const passedTests = Object.values(results).filter(Boolean).length
  const totalTests = Object.keys(results).length - 1 // Exclude 'overall'
  
  console.log(`✅ Passed: ${passedTests}/${totalTests} tests`)
  console.log(`❌ Errors: ${errors.length}`)
  console.log(`⚠️  Warnings: ${warnings.length}`)
  
  if (errors.length === 0) {
    results.overall = true
    console.log('\n🎉 BASIC VALIDATION PASSED!')
    console.log('🚀 Core systems are ready for production')
  } else {
    console.log('\n❌ VALIDATION FAILED!')
    console.log('🛑 Fix the following errors before deploying:')
    errors.forEach(error => console.log(`   - ${error}`))
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS TO CONSIDER:')
    warnings.forEach(warning => console.log(`   - ${warning}`))
  }

  // Exit with appropriate code
  process.exit(results.overall ? 0 : 1)
}

// Run validation
runBasicValidation().catch(error => {
  console.error('💥 VALIDATION SCRIPT FAILED:', error)
  process.exit(1)
})