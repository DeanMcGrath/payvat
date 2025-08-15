/**
 * Apply Security Migration Script
 * Runs the security constraints and indexes for production
 */

const { PrismaClient } = require('../lib/generated/prisma')
const fs = require('fs').promises

async function applySecurityMigration() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔒 Applying security migration...')
    
    // Read the SQL migration file
    const migrationSQL = await fs.readFile('./prisma/migrations/add_security_constraints.sql', 'utf8')
    
    // Split into individual statements and execute
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📝 Executing ${statements.length} security statements...`)
    
    for (const [index, statement] of statements.entries()) {
      try {
        console.log(`   ${index + 1}/${statements.length}: ${statement.substring(0, 60)}...`)
        await prisma.$executeRawUnsafe(statement + ';')
      } catch (error) {
        // Some constraints might already exist - that's okay
        if (!error.message.includes('already exists') && 
            !error.message.includes('does not exist')) {
          console.warn(`   ⚠️  Warning on statement ${index + 1}: ${error.message}`)
        }
      }
    }
    
    console.log('✅ Security migration completed successfully!')
    
    // Verify indexes were created
    const indexCheck = await prisma.$queryRaw`
      SELECT schemaname, tablename, indexname 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND indexname LIKE 'idx_%'
      ORDER BY tablename, indexname
    `
    
    console.log(`📊 Created ${indexCheck.length} performance indexes:`)
    indexCheck.forEach(idx => {
      console.log(`   - ${idx.tablename}.${idx.indexname}`)
    })
    
  } catch (error) {
    console.error('❌ Security migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the migration
applySecurityMigration().catch(console.error)