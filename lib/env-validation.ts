/**
 * Environment Variable Validation
 * Validates required environment variables at startup
 */

export interface EnvConfig {
  // Database
  DATABASE_URL: string
  
  // Authentication
  JWT_SECRET: string
  NEXTAUTH_SECRET?: string
  NEXTAUTH_URL?: string
  
  // Stripe
  STRIPE_SECRET_KEY?: string
  STRIPE_PUBLISHABLE_KEY?: string
  STRIPE_WEBHOOK_SECRET?: string
  
  // App Configuration
  NODE_ENV: 'development' | 'production' | 'test'
  
  // Security
  ENCRYPTION_KEY?: string
  
  // AI Configuration
  OPENAI_API_KEY?: string
}

const requiredEnvVars: (keyof EnvConfig)[] = [
  'DATABASE_URL',
  'JWT_SECRET',
  'NODE_ENV'
]

const optionalEnvVars: (keyof EnvConfig)[] = [
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL', 
  'STRIPE_SECRET_KEY',
  'STRIPE_PUBLISHABLE_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'ENCRYPTION_KEY',
  'OPENAI_API_KEY'
]

export function validateEnvironment(): EnvConfig {
  const missingVars: string[] = []
  const warnings: string[] = []
  
  // Skip validation during build if not in actual production deployment
  const isLocalBuild = !process.env.VERCEL && process.env.NODE_ENV === 'production'
  
  // Check required variables
  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      missingVars.push(varName)
    }
  }
  
  // Check optional but recommended variables
  for (const varName of optionalEnvVars) {
    if (!process.env[varName]) {
      warnings.push(`Optional environment variable ${varName} is not set`)
    }
  }
  
  // Validate specific formats
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('postgresql://')) {
    console.warn('⚠️  DATABASE_URL should start with postgresql:// for production')
  }
  
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    missingVars.push('JWT_SECRET must be at least 32 characters long')
  }
  
  // Fatal errors for missing required vars (only in production deployment)
  if (missingVars.length > 0 && process.env.NODE_ENV === 'production' && !isLocalBuild) {
    console.error('❌ Missing required environment variables:')
    missingVars.forEach(varName => console.error(`   - ${varName}`))
    console.error('\nPlease check your .env file or environment configuration.')
    process.exit(1)
  } else if (missingVars.length > 0) {
    console.warn('⚠️  Missing environment variables:')
    missingVars.forEach(varName => console.warn(`   - ${varName}`))
  }
  
  // Warnings for optional vars
  if (warnings.length > 0 && process.env.NODE_ENV !== 'development') {
    console.warn('⚠️  Environment warnings:')
    warnings.forEach(warning => console.warn(`   - ${warning}`))
  }
  
  console.log('✅ Environment validation passed')
  
  return {
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://placeholder',
    JWT_SECRET: process.env.JWT_SECRET || 'placeholder-jwt-secret-for-build',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    NODE_ENV: (process.env.NODE_ENV as EnvConfig['NODE_ENV']) || 'development',
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  }
}

// Export singleton instance
export const env = validateEnvironment()