/**
 * Configuration Management for VAT Patterns
 * Allows dynamic configuration of extraction patterns without code changes
 */

import fs from 'fs/promises'
import path from 'path'
import { EventEmitter } from 'events'

// Pattern configuration interfaces
export interface VATPatternConfig {
  id: string
  name: string
  description: string
  pattern: string
  priority: number
  enabled: boolean
  confidence: number
  documentTypes: string[]
  countries: string[]
  testCases: Array<{
    input: string
    expectedMatch: string
    expectedAmount: number
  }>
  metadata: {
    createdAt: string
    updatedAt: string
    version: string
    author: string
  }
}

export interface PatternSet {
  name: string
  description: string
  patterns: VATPatternConfig[]
  enabled: boolean
  priority: number
}

export interface ConfigurationSettings {
  version: string
  lastUpdated: string
  environment: 'development' | 'staging' | 'production'
  patternSets: Record<string, PatternSet>
  globalSettings: {
    defaultConfidenceThreshold: number
    maxPatternExecutionTime: number
    enablePatternCaching: boolean
    debugMode: boolean
    fallbackToBasicPatterns: boolean
  }
  countrySpecific: Record<string, {
    standardRates: number[]
    currencySymbol: string
    patterns: string[]
  }>
}

// Configuration manager class
export class PatternConfigurationManager extends EventEmitter {
  private config: ConfigurationSettings
  private configPath: string
  private watchInterval: NodeJS.Timeout | null = null

  constructor(configPath: string = './config/vat-patterns.json') {
    super()
    this.configPath = path.resolve(configPath)
    this.config = this.getDefaultConfiguration()
    this.initializeConfiguration()
  }

  // Load configuration from file
  async loadConfiguration(): Promise<void> {
    try {
      const configData = await fs.readFile(this.configPath, 'utf-8')
      this.config = JSON.parse(configData)
      this.validateConfiguration()
      console.log(`✅ Configuration loaded from ${this.configPath}`)
      this.emit('configurationLoaded', this.config)
    } catch (error) {
      console.log(`⚠️ Failed to load configuration: ${(error as Error).message}`)
      console.log('Using default configuration')
      await this.saveConfiguration()
    }
  }

  // Save configuration to file
  async saveConfiguration(): Promise<void> {
    try {
      this.config.lastUpdated = new Date().toISOString()
      const configDir = path.dirname(this.configPath)
      
      // Ensure directory exists
      try {
        await fs.mkdir(configDir, { recursive: true })
      } catch (error) {
        // Directory already exists
      }

      await fs.writeFile(
        this.configPath, 
        JSON.stringify(this.config, null, 2),
        'utf-8'
      )
      console.log(`✅ Configuration saved to ${this.configPath}`)
      this.emit('configurationSaved', this.config)
    } catch (error) {
      console.error(`❌ Failed to save configuration: ${(error as Error).message}`)
      throw error
    }
  }

  // Get all enabled patterns
  getEnabledPatterns(documentType?: string, country?: string): VATPatternConfig[] {
    const patterns: VATPatternConfig[] = []

    Object.values(this.config.patternSets).forEach(patternSet => {
      if (!patternSet.enabled) return

      patternSet.patterns.forEach(pattern => {
        if (!pattern.enabled) return

        // Filter by document type if specified
        if (documentType && !pattern.documentTypes.includes(documentType)) return

        // Filter by country if specified  
        if (country && !pattern.countries.includes(country) && !pattern.countries.includes('*')) return

        patterns.push(pattern)
      })
    })

    // Sort by priority (higher priority first)
    return patterns.sort((a, b) => b.priority - a.priority)
  }

  // Add new pattern
  async addPattern(patternSetName: string, pattern: Omit<VATPatternConfig, 'id' | 'metadata'>): Promise<string> {
    const patternSet = this.config.patternSets[patternSetName]
    if (!patternSet) {
      throw new Error(`Pattern set '${patternSetName}' not found`)
    }

    const patternId = `${patternSetName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const fullPattern: VATPatternConfig = {
      ...pattern,
      id: patternId,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0.0',
        author: 'system'
      }
    }

    // Validate pattern
    this.validatePattern(fullPattern)

    patternSet.patterns.push(fullPattern)
    await this.saveConfiguration()

    console.log(`✅ Added pattern '${pattern.name}' to set '${patternSetName}'`)
    this.emit('patternAdded', { patternSetName, pattern: fullPattern })

    return patternId
  }

  // Update existing pattern
  async updatePattern(patternId: string, updates: Partial<VATPatternConfig>): Promise<void> {
    let foundPattern: VATPatternConfig | null = null
    let foundPatternSet: string | null = null

    // Find the pattern
    Object.entries(this.config.patternSets).forEach(([setName, patternSet]) => {
      const pattern = patternSet.patterns.find(p => p.id === patternId)
      if (pattern) {
        foundPattern = pattern
        foundPatternSet = setName
      }
    })

    if (!foundPattern || !foundPatternSet) {
      throw new Error(`Pattern with ID '${patternId}' not found`)
    }

    // Apply updates
    Object.assign(foundPattern, updates, {
      metadata: {
        ...foundPattern.metadata,
        updatedAt: new Date().toISOString(),
        version: this.incrementVersion(foundPattern.metadata.version)
      }
    })

    // Validate updated pattern
    this.validatePattern(foundPattern)

    await this.saveConfiguration()

    console.log(`✅ Updated pattern '${foundPattern.name}'`)
    this.emit('patternUpdated', { patternSetName: foundPatternSet, pattern: foundPattern })
  }

  // Remove pattern
  async removePattern(patternId: string): Promise<void> {
    let removed = false
    let removedPatternName = ''

    Object.entries(this.config.patternSets).forEach(([setName, patternSet]) => {
      const patternIndex = patternSet.patterns.findIndex(p => p.id === patternId)
      if (patternIndex >= 0) {
        removedPatternName = patternSet.patterns[patternIndex].name
        patternSet.patterns.splice(patternIndex, 1)
        removed = true
        this.emit('patternRemoved', { patternSetName: setName, patternId })
      }
    })

    if (!removed) {
      throw new Error(`Pattern with ID '${patternId}' not found`)
    }

    await this.saveConfiguration()
    console.log(`✅ Removed pattern '${removedPatternName}'`)
  }

  // Test pattern against test cases
  testPattern(patternId: string): { passed: number, failed: number, results: any[] } {
    let pattern: VATPatternConfig | null = null

    // Find the pattern
    Object.values(this.config.patternSets).forEach(patternSet => {
      const found = patternSet.patterns.find(p => p.id === patternId)
      if (found) pattern = found
    })

    if (!pattern) {
      throw new Error(`Pattern with ID '${patternId}' not found`)
    }

    const results: any[] = []
    let passed = 0
    let failed = 0

    // Test each test case
    pattern.testCases.forEach((testCase, index) => {
      try {
        const regex = new RegExp(pattern!.pattern, 'gi')
        const matches = testCase.input.match(regex)
        
        if (matches && matches.includes(testCase.expectedMatch)) {
          passed++
          results.push({
            testCase: index + 1,
            status: 'PASS',
            input: testCase.input,
            expected: testCase.expectedMatch,
            actual: matches
          })
        } else {
          failed++
          results.push({
            testCase: index + 1,
            status: 'FAIL',
            input: testCase.input,
            expected: testCase.expectedMatch,
            actual: matches || []
          })
        }
      } catch (error) {
        failed++
        results.push({
          testCase: index + 1,
          status: 'ERROR',
          input: testCase.input,
          error: (error as Error).message
        })
      }
    })

    console.log(`🧪 Pattern '${pattern.name}' test results: ${passed} passed, ${failed} failed`)

    return { passed, failed, results }
  }

  // Get configuration summary
  getConfigurationSummary(): {
    totalPatterns: number
    enabledPatterns: number
    patternSets: number
    enabledPatternSets: number
    lastUpdated: string
    version: string
  } {
    let totalPatterns = 0
    let enabledPatterns = 0
    let enabledPatternSets = 0

    Object.values(this.config.patternSets).forEach(patternSet => {
      totalPatterns += patternSet.patterns.length
      if (patternSet.enabled) {
        enabledPatternSets++
        enabledPatterns += patternSet.patterns.filter(p => p.enabled).length
      }
    })

    return {
      totalPatterns,
      enabledPatterns,
      patternSets: Object.keys(this.config.patternSets).length,
      enabledPatternSets,
      lastUpdated: this.config.lastUpdated,
      version: this.config.version
    }
  }

  // Export configuration for backup
  exportConfiguration(): string {
    return JSON.stringify(this.config, null, 2)
  }

  // Import configuration from backup
  async importConfiguration(configData: string): Promise<void> {
    try {
      const newConfig = JSON.parse(configData) as ConfigurationSettings
      this.validateConfiguration(newConfig)
      
      this.config = newConfig
      await this.saveConfiguration()
      
      console.log('✅ Configuration imported successfully')
      this.emit('configurationImported', this.config)
    } catch (error) {
      throw new Error(`Failed to import configuration: ${(error as Error).message}`)
    }
  }

  // Get country-specific settings
  getCountrySettings(countryCode: string): any {
    return this.config.countrySpecific[countryCode] || this.config.countrySpecific['default']
  }

  // Update global settings
  async updateGlobalSettings(settings: Partial<ConfigurationSettings['globalSettings']>): Promise<void> {
    Object.assign(this.config.globalSettings, settings)
    await this.saveConfiguration()
    console.log('✅ Global settings updated')
    this.emit('globalSettingsUpdated', this.config.globalSettings)
  }

  // Private methods
  private async initializeConfiguration(): Promise<void> {
    await this.loadConfiguration()
    
    // Setup file watching for auto-reload
    if (this.config.globalSettings.debugMode) {
      this.watchInterval = setInterval(async () => {
        try {
          const stats = await fs.stat(this.configPath)
          const configData = await fs.readFile(this.configPath, 'utf-8')
          const fileConfig = JSON.parse(configData)
          
          if (fileConfig.lastUpdated !== this.config.lastUpdated) {
            console.log('🔄 Configuration file changed, reloading...')
            await this.loadConfiguration()
          }
        } catch (error) {
          // File doesn't exist or can't be read
        }
      }, 5000) // Check every 5 seconds
    }
  }

  private getDefaultConfiguration(): ConfigurationSettings {
    return {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      environment: 'development',
      patternSets: {
        'irish_standard': {
          name: 'Irish Standard VAT Patterns',
          description: 'Standard patterns for Irish VAT extraction',
          enabled: true,
          priority: 10,
          patterns: [
            {
              id: 'vat_percentage_amount',
              name: 'VAT with Percentage and Amount',
              description: 'Matches VAT (23.00%): €92.00 format',
              pattern: 'VAT\\s*\\(([0-9.]+)%?\\)\\s*:\\s*€([0-9,]+\\.?[0-9]*)',
              priority: 10,
              enabled: true,
              confidence: 0.9,
              documentTypes: ['INVOICE', 'RECEIPT'],
              countries: ['IE', '*'],
              testCases: [
                {
                  input: 'VAT (23.00%): €92.00',
                  expectedMatch: 'VAT (23.00%): €92.00',
                  expectedAmount: 92.00
                }
              ],
              metadata: {
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: '1.0.0',
                author: 'system'
              }
            },
            {
              id: 'total_vat_simple',
              name: 'Total VAT Amount',
              description: 'Matches Total VAT €amount format',
              pattern: 'Total\\s*VAT\\s*€([0-9,]+\\.?[0-9]*)',
              priority: 8,
              enabled: true,
              confidence: 0.8,
              documentTypes: ['INVOICE', 'RECEIPT'],
              countries: ['IE', '*'],
              testCases: [
                {
                  input: 'Total VAT €134.96',
                  expectedMatch: 'Total VAT €134.96',
                  expectedAmount: 134.96
                }
              ],
              metadata: {
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: '1.0.0',
                author: 'system'
              }
            }
          ]
        }
      },
      globalSettings: {
        defaultConfidenceThreshold: 0.6,
        maxPatternExecutionTime: 1000,
        enablePatternCaching: true,
        debugMode: false,
        fallbackToBasicPatterns: true
      },
      countrySpecific: {
        'IE': {
          standardRates: [0, 9, 13.5, 23],
          currencySymbol: '€',
          patterns: ['irish_standard']
        },
        'default': {
          standardRates: [0, 20],
          currencySymbol: '€',
          patterns: ['irish_standard']
        }
      }
    }
  }

  private validateConfiguration(config?: ConfigurationSettings): void {
    const configToValidate = config || this.config

    if (!configToValidate.version) {
      throw new Error('Configuration missing version')
    }

    if (!configToValidate.patternSets) {
      throw new Error('Configuration missing pattern sets')
    }

    // Validate each pattern set
    Object.entries(configToValidate.patternSets).forEach(([name, patternSet]) => {
      if (!patternSet.patterns || !Array.isArray(patternSet.patterns)) {
        throw new Error(`Pattern set '${name}' missing patterns array`)
      }

      patternSet.patterns.forEach(pattern => {
        this.validatePattern(pattern)
      })
    })
  }

  private validatePattern(pattern: VATPatternConfig): void {
    if (!pattern.id || !pattern.name || !pattern.pattern) {
      throw new Error('Pattern missing required fields (id, name, pattern)')
    }

    // Test if pattern is valid regex
    try {
      new RegExp(pattern.pattern)
    } catch (error) {
      throw new Error(`Invalid regex pattern: ${pattern.pattern}`)
    }

    // Validate priority range
    if (pattern.priority < 0 || pattern.priority > 100) {
      throw new Error('Pattern priority must be between 0 and 100')
    }

    // Validate confidence range
    if (pattern.confidence < 0 || pattern.confidence > 1) {
      throw new Error('Pattern confidence must be between 0 and 1')
    }
  }

  private incrementVersion(version: string): string {
    const parts = version.split('.')
    const patch = parseInt(parts[2] || '0') + 1
    return `${parts[0] || '1'}.${parts[1] || '0'}.${patch}`
  }

  // Cleanup resources
  destroy(): void {
    if (this.watchInterval) {
      clearInterval(this.watchInterval)
      this.watchInterval = null
    }
    this.removeAllListeners()
  }
}

// Export configuration instance
export const patternConfigurationManager = new PatternConfigurationManager()

// Initialize configuration on module load
patternConfigurationManager.on('configurationLoaded', (config) => {
  console.log(`📋 Loaded ${Object.keys(config.patternSets).length} pattern sets with ${
    Object.values(config.patternSets).reduce((sum, set) => sum + set.patterns.length, 0)
  } total patterns`)
})