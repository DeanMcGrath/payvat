/**
 * Production Configuration
 * All settings for production deployment
 * SECURITY: No sensitive data - use environment variables
 */

export const PRODUCTION_CONFIG = {
  // Application
  app: {
    name: 'VAT AI - PayVAT.ie',
    version: '1.0.0',
    environment: 'production',
    debugMode: false,
    maintenanceMode: false
  },

  // Security
  security: {
    enableDebugEndpoints: false,
    enableConsoleLogging: false,
    enableDataEncryption: true,
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    enableTwoFactor: false, // Future feature
    enableIpWhitelisting: false
  },

  // Rate Limiting
  rateLimiting: {
    enabled: true,
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    // Special limits for sensitive endpoints
    loginLimit: 5,
    uploadLimit: 20,
    extractionLimit: 50
  },

  // File Processing
  fileProcessing: {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedMimeTypes: [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    processingTimeout: 120000, // 2 minutes
    retryAttempts: 3,
    virusScanning: true,
    enablePreview: true
  },

  // VAT Extraction
  vatExtraction: {
    enableAI: true,
    enableFallbacks: true,
    minConfidenceThreshold: 0.6,
    enableManualReview: true,
    maxProcessingTime: 60000, // 1 minute
    enableIrishSpecialization: true,
    enableValidation: true,
    supportedVATRates: [23, 13.5, 9, 4.8, 0] // Irish VAT rates
  },

  // Database
  database: {
    connectionPoolSize: 10,
    maxRetries: 3,
    queryTimeout: 30000,
    enableQueryLogging: false,
    enableSlowQueryLogging: true,
    slowQueryThreshold: 5000, // 5 seconds
    enableRowLevelSecurity: true
  },

  // Storage
  storage: {
    provider: 'vercel-blob',
    encryption: true,
    compression: true,
    retentionDays: 2555, // 7 years for VAT compliance
    enableCDN: true,
    maxStoragePerUser: 1024 * 1024 * 1024, // 1GB
    enableAutoCleanup: true
  },

  // Guest Users
  guestUsers: {
    enabled: true,
    maxAgeHours: 24,
    maxDocuments: 10,
    maxStorageSize: 100 * 1024 * 1024, // 100MB
    cleanupIntervalHours: 6,
    enableConversion: true
  },

  // Monitoring
  monitoring: {
    enableMetrics: true,
    enableTracing: true,
    enableErrorTracking: true,
    enablePerformanceMonitoring: true,
    enableSecurityMonitoring: true,
    alertThresholds: {
      errorRate: 0.05, // 5%
      responseTime: 5000, // 5 seconds
      memoryUsage: 0.8, // 80%
      cpuUsage: 0.8 // 80%
    }
  },

  // Email
  email: {
    enabled: true,
    provider: 'vercel', // or 'sendgrid', 'ses'
    enableTemplates: true,
    enableTracking: true,
    retryAttempts: 3
  },

  // Payments
  payments: {
    enabled: true,
    provider: 'stripe',
    currency: 'EUR',
    enableSubscriptions: false, // Future feature
    enableRefunds: false,
    webhookRetries: 3
  },

  // Caching
  caching: {
    enabled: true,
    defaultTTL: 300, // 5 minutes
    maxCacheSize: 100 * 1024 * 1024, // 100MB
    enableCompression: true,
    cacheStrategies: {
      vatData: 600, // 10 minutes
      userProfile: 1800, // 30 minutes
      documents: 300, // 5 minutes
      reports: 3600 // 1 hour
    }
  },

  // API
  api: {
    version: 'v1',
    enableVersioning: true,
    enableCORS: true,
    corsOrigins: ['https://payvat.ie', 'https://*.payvat.ie'],
    enableCompression: true,
    enableEtag: true,
    maxRequestSize: '50mb'
  },

  // Features
  features: {
    enableChat: true,
    enableVideos: true,
    enableReports: true,
    enableAnalytics: true,
    enableExport: false, // SECURITY: Disabled for sensitive financial data
    enableAPI: true,
    enableWebhooks: false, // Future feature
    enableBulkProcessing: true
  },

  // Compliance
  compliance: {
    gdprCompliant: true,
    enableDataRetention: true,
    enableDataDeletion: true,
    enableAuditLogging: true,
    enableDataEncryption: true,
    enableAccessControls: true,
    dataClassification: 'confidential'
  },

  // Performance
  performance: {
    enableLazyLoading: true,
    enableCodeSplitting: true,
    enableServiceWorker: false, // Not needed for this app
    enableImageOptimization: true,
    enablePreloading: true,
    bundleAnalysis: false // Only in development
  }
} as const

// Environment validation
export function validateProductionConfig(): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // Required environment variables
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'NEXTAUTH_SECRET',
    'STRIPE_SECRET_KEY',
    'OPENAI_API_KEY'
  ]

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      errors.push(`Missing required environment variable: ${envVar}`)
    }
  }

  // Security checks
  if (process.env.NODE_ENV !== 'production') {
    warnings.push('NODE_ENV is not set to production')
  }

  if (process.env.ENABLE_DEBUG === 'true') {
    errors.push('ENABLE_DEBUG is set to true in production')
  }

  // JWT secret strength
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET is too short (minimum 32 characters)')
  }

  // Stripe configuration
  if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.startsWith('sk_live_')) {
    warnings.push('Stripe secret key appears to be for test mode')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

// Runtime configuration
export function getRuntimeConfig() {
  return {
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development',
    isTest: process.env.NODE_ENV === 'test',
    buildTime: new Date().toISOString(),
    version: PRODUCTION_CONFIG.app.version,
    features: PRODUCTION_CONFIG.features
  }
}

// Export individual config sections for type safety
export const { security, rateLimiting, fileProcessing, vatExtraction } = PRODUCTION_CONFIG