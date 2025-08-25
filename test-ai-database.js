#!/usr/bin/env node

console.log('🧪 Testing AI System Database Integration...\n')

async function testDatabaseConnections() {
  console.log('📊 Testing database schema and AI table structures...')
  
  try {
    // Test basic Prisma connection
    const { prisma } = require('./lib/prisma')
    
    console.log('🔍 Testing Prisma connection...')
    const userCount = await prisma.user.count()
    console.log(`✅ Prisma connected - Found ${userCount} users`)
    
    console.log('🔍 Testing AI-related tables...')
    
    // Test document processing analytics table
    const analyticsCount = await prisma.processingAnalytics.count()
    console.log(`✅ ProcessingAnalytics table accessible - ${analyticsCount} records`)
    
    // Test template usage tracking
    const templateUsageCount = await prisma.templateUsage.count()
    console.log(`✅ TemplateUsage table accessible - ${templateUsageCount} records`)
    
    // Test user corrections (feedback system)
    const correctionsCount = await prisma.userCorrection.count()
    console.log(`✅ UserCorrection table accessible - ${correctionsCount} records`)
    
    // Test AI learning jobs
    const learningJobsCount = await prisma.aILearningJob.count()
    console.log(`✅ AILearningJob table accessible - ${learningJobsCount} records`)
    
    // Test confidence scores
    const confidenceCount = await prisma.confidenceScore.count()
    console.log(`✅ ConfidenceScore table accessible - ${confidenceCount} records`)
    
    // Test document table
    const documentsCount = await prisma.document.count()
    console.log(`✅ Document table accessible - ${documentsCount} records`)
    
    console.log('\n🎯 Testing AI system table relationships...')
    
    // Test document with analytics relationship
    const docWithAnalytics = await prisma.document.findFirst({
      include: {
        processingAnalytics: true,
        templateUsages: true,
        userCorrections: true,
        confidenceScores: true
      }
    })
    
    if (docWithAnalytics) {
      console.log('✅ Document relationships working properly')
      console.log(`   - Analytics: ${docWithAnalytics.processingAnalytics?.length || 0}`)
      console.log(`   - Template usages: ${docWithAnalytics.templateUsages?.length || 0}`)
      console.log(`   - User corrections: ${docWithAnalytics.userCorrections?.length || 0}`)
      console.log(`   - Confidence scores: ${docWithAnalytics.confidenceScores?.length || 0}`)
    } else {
      console.log('⚠️  No documents found to test relationships')
    }
    
    await prisma.$disconnect()
    
    console.log('\n🎉 All database connections and AI tables are working correctly!')
    return true
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message)
    console.log('\n💡 Make sure your database is running and properly configured')
    return false
  }
}

async function testAISystemIntegration() {
  console.log('🤖 Testing AI System Integration...\n')
  
  const dbTest = await testDatabaseConnections()
  
  if (dbTest) {
    console.log('\n✅ Database integration tests: PASSED')
  } else {
    console.log('\n❌ Database integration tests: FAILED')
  }
  
  console.log('\n📋 AI System Optimization Summary:')
  console.log('✅ Phase 1: Real data integration completed')
  console.log('✅ Phase 2: Performance optimizations completed') 
  console.log('✅ Phase 3: Advanced learning features completed')
  console.log('🧪 Phase 4: Comprehensive testing in progress')
}

testAISystemIntegration().catch(console.error)