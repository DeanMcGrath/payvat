/**
 * Production Validation Script
 * Comprehensive testing before going live
 * Tests all critical systems and security measures
 */

const { validateProductionConfig } = require('../config/production.ts')
const { PrismaClient } = require('@prisma/client')
const { cleanupGuestUsers, getGuestUserStats } = require('../lib/jobs/guest-cleanup.ts')
const { healthCheck } = require('../lib/enhanced-document-processor.ts')

async function runProductionValidation() {
  console.log('🚀 PRODUCTION VALIDATION STARTING...')
  console.log('=====================================\n')
  
  const results = {
    config: false,
    database: false,
    security: false,
    guestCleanup: false,
    documentProcessing: false,
    storage: false,
    overall: false
  }
  
  const errors = []
  const warnings = []

  // 1. Configuration Validation
  console.log('1️⃣ Validating Configuration...')
  try {
    const configValidation = validateProductionConfig()
    if (configValidation.isValid) {
      console.log('   ✅ Configuration is valid')
      results.config = true
    } else {
      console.log('   ❌ Configuration validation failed:')
      configValidation.errors.forEach(error => {
        console.log(`      - ERROR: ${error}`)
        errors.push(`Config: ${error}`)
      })
    }
    
    if (configValidation.warnings.length > 0) {
      console.log('   ⚠️  Configuration warnings:')
      configValidation.warnings.forEach(warning => {
        console.log(`      - WARNING: ${warning}`)
        warnings.push(`Config: ${warning}`)
      })
    }
  } catch (error) {
    console.log(`   ❌ Configuration check failed: ${error.message}`)
    errors.push(`Config: ${error.message}`)
  }

  console.log('')

  // 2. Database Connectivity
  console.log('2️⃣ Testing Database Connection...')
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
  }

  console.log('')

  // 3. Security Validation
  console.log('3️⃣ Security Validation...')
  try {
    // Check environment variables
    const securityChecks = [
      { name: 'NODE_ENV', expected: 'production', actual: process.env.NODE_ENV },
      { name: 'ENABLE_DEBUG', expected: undefined, actual: process.env.ENABLE_DEBUG },
      { name: 'JWT_SECRET length', expected: '>=32', actual: process.env.JWT_SECRET?.length }
    ]

    let securityPassed = true
    for (const check of securityChecks) {
      if (check.name === 'NODE_ENV' && check.actual !== check.expected) {
        console.log(`   ❌ ${check.name}: Expected ${check.expected}, got ${check.actual}`)
        errors.push(`Security: NODE_ENV not set to production`)
        securityPassed = false
      } else if (check.name === 'ENABLE_DEBUG' && check.actual === 'true') {
        console.log(`   ❌ ${check.name}: Debug mode enabled in production`)
        errors.push(`Security: Debug mode enabled`)
        securityPassed = false
      } else if (check.name.includes('length') && check.actual && check.actual < 32) {
        console.log(`   ❌ ${check.name}: JWT secret too short`)
        errors.push(`Security: JWT secret too short`)
        securityPassed = false
      }
    }

    if (securityPassed) {
      console.log('   ✅ Security checks passed')
      results.security = true
    }
  } catch (error) {
    console.log(`   ❌ Security validation failed: ${error.message}`)
    errors.push(`Security: ${error.message}`)
  }

  console.log('')

  // 4. Guest User System
  console.log('4️⃣ Testing Guest User System...')
  try {
    const guestStats = await getGuestUserStats()
    console.log(`   📊 Guest users: ${guestStats.total} (${guestStats.withDocuments} with documents)`)
    console.log(`   📁 Total guest documents: ${guestStats.totalDocuments}`)
    console.log(`   💾 Total guest storage: ${Math.round(guestStats.totalSize / 1024 / 1024)}MB`)
    
    if (guestStats.total > 1000) {
      warnings.push(`Guest cleanup: ${guestStats.total} guest users (consider cleanup)`)
    }

    // Test cleanup (dry run)
    const cleanupResult = await cleanupGuestUsers({ 
      maxAgeHours: 24, 
      dryRun: true, 
      batchSize: 10 
    })
    console.log(`   🧹 Cleanup simulation: ${cleanupResult.guestUsersDeleted} users would be deleted`)
    
    results.guestCleanup = true
    console.log('   ✅ Guest user system operational')
  } catch (error) {
    console.log(`   ❌ Guest user system test failed: ${error.message}`)
    errors.push(`Guest system: ${error.message}`)
  }

  console.log('')

  // 5. Document Processing
  console.log('5️⃣ Testing Document Processing...')
  try {
    const healthResult = await healthCheck()
    console.log(`   🏥 System health: ${healthResult.status}`)
    console.log(`   ⚡ Average processing time: ${healthResult.performance.averageProcessingTime}ms`)
    console.log(`   📈 Success rate: ${Math.round(healthResult.performance.successRate * 100)}%`)
    
    if (healthResult.status === 'healthy') {
      results.documentProcessing = true
      console.log('   ✅ Document processing system healthy')
    } else {
      warnings.push(`Document processing: System status is ${healthResult.status}`)
    }
  } catch (error) {
    console.log(`   ❌ Document processing test failed: ${error.message}`)
    errors.push(`Document processing: ${error.message}`)
  }

  console.log('')

  // 6. Storage System
  console.log('6️⃣ Testing Storage System...')
  try {
    // Test file upload/download (with dummy data)
    const testData = Buffer.from('Test file content for validation')
    const uploadResult = await secureStorage.uploadFile(
      testData,
      'test-validation.txt',
      'text/plain',
      'validation-test'
    )

    if (uploadResult.success && uploadResult.file) {
      console.log('   ✅ File upload successful')
      
      // Test download
      const downloadResult = await secureStorage.downloadFile(
        uploadResult.file.url,
        uploadResult.file.encryptionKey,
        'validation-test'
      )
      
      if (downloadResult.success) {
        console.log('   ✅ File download successful')
        results.storage = true
        
        // Cleanup test file
        await secureStorage.deleteFile(uploadResult.file.url, 'validation-test')
        console.log('   🗑️ Test file cleaned up')
      } else {
        errors.push(`Storage: Download failed - ${downloadResult.error}`)
      }
    } else {
      errors.push(`Storage: Upload failed - ${uploadResult.error}`)
    }
  } catch (error) {
    console.log(`   ❌ Storage system test failed: ${error.message}`)
    errors.push(`Storage: ${error.message}`)
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
    console.log('\n🎉 PRODUCTION VALIDATION PASSED!')
    console.log('🚀 System is ready for production deployment')
  } else {
    console.log('\n❌ PRODUCTION VALIDATION FAILED!')
    console.log('🛑 Fix the following errors before deploying:')
    errors.forEach(error => console.log(`   - ${error}`))
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS TO CONSIDER:')
    warnings.forEach(warning => console.log(`   - ${warning}`))
  }

  // Cleanup
  await prisma.$disconnect()

  // Exit with appropriate code
  process.exit(results.overall ? 0 : 1)
}

// Run validation
runProductionValidation().catch(error => {
  console.error('💥 VALIDATION SCRIPT FAILED:', error)
  process.exit(1)
})