/**
 * Processing Optimizations for VAT Extraction System
 * Implements batching, parallel processing, and memory optimization
 */

import { Worker, isMainThread, parentPort, workerData } from 'worker_threads'
import { vatExtractionCache, textExtractionCache } from './caching-system'

// Processing queue interface
export interface ProcessingJob {
  id: string
  fileData: string
  mimeType: string
  fileName: string
  category: string
  priority: number
  createdAt: number
}

// Batch processing configuration
export interface BatchConfig {
  maxBatchSize: number
  maxWaitTime: number
  maxMemoryUsage: number
  enableParallel: boolean
  workerThreads: number
}

// Performance metrics for processing
export interface ProcessingMetrics {
  totalJobs: number
  completedJobs: number
  failedJobs: number
  avgProcessingTime: number
  throughput: number // jobs per second
  memoryUsage: number
  activeWorkers: number
}

// High-performance processing queue with batching and parallel execution
export class ProcessingQueue {
  private queue: ProcessingJob[] = []
  private processing = new Set<string>()
  private workers: Worker[] = []
  private metrics: ProcessingMetrics = {
    totalJobs: 0,
    completedJobs: 0,
    failedJobs: 0,
    avgProcessingTime: 0,
    throughput: 0,
    memoryUsage: 0,
    activeWorkers: 0
  }
  private isProcessing = false
  private processingTimer: NodeJS.Timeout | null = null

  constructor(private config: BatchConfig) {
    this.initializeWorkers()
    this.startProcessingTimer()
  }

  // Add job to processing queue
  async addJob(job: Omit<ProcessingJob, 'id' | 'createdAt'>): Promise<string> {
    const processingJob: ProcessingJob = {
      ...job,
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now()
    }

    // Check cache first
    const cachedResult = vatExtractionCache.getCachedVATResult(
      job.fileData, 
      job.mimeType, 
      job.fileName
    )

    if (cachedResult) {
      console.log(`⚡ Cache hit for job ${processingJob.id}`)
      return processingJob.id
    }

    // Add to queue with priority sorting
    this.queue.push(processingJob)
    this.queue.sort((a, b) => b.priority - a.priority)
    
    this.metrics.totalJobs++

    console.log(`📋 Job queued: ${processingJob.id} (queue size: ${this.queue.length})`)

    // Trigger immediate processing if queue is getting full
    if (this.queue.length >= this.config.maxBatchSize) {
      this.processBatch()
    }

    return processingJob.id
  }

  // Process a batch of jobs
  private async processBatch(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return
    }

    this.isProcessing = true
    const startTime = Date.now()

    // Check memory usage before processing
    await this.checkMemoryLimits()

    // Take batch from queue
    const batchSize = Math.min(this.config.maxBatchSize, this.queue.length)
    const batch = this.queue.splice(0, batchSize)

    console.log(`🔄 Processing batch of ${batch.length} jobs...`)

    if (this.config.enableParallel && batch.length > 1) {
      await this.processBatchParallel(batch)
    } else {
      await this.processBatchSequential(batch)
    }

    const processingTime = Date.now() - startTime
    this.updateMetrics(batch.length, processingTime)

    this.isProcessing = false

    // Process next batch if queue has items
    if (this.queue.length > 0) {
      setImmediate(() => this.processBatch())
    }
  }

  // Sequential batch processing
  private async processBatchSequential(batch: ProcessingJob[]): Promise<void> {
    for (const job of batch) {
      await this.processJob(job)
    }
  }

  // Parallel batch processing using worker threads
  private async processBatchParallel(batch: ProcessingJob[]): Promise<void> {
    const promises = batch.map((job, index) => {
      const workerIndex = index % this.workers.length
      return this.processJobWithWorker(job, workerIndex)
    })

    await Promise.allSettled(promises)
  }

  // Process individual job
  private async processJob(job: ProcessingJob): Promise<any> {
    const jobStartTime = Date.now()
    this.processing.add(job.id)

    try {
      console.log(`⚙️ Processing job ${job.id} (${job.fileName})`)

      // Simulate processing (in real implementation, call actual VAT extraction)
      const result = await this.simulateVATExtraction(job)
      
      // Cache the result
      vatExtractionCache.cacheVATResult(job.fileData, job.mimeType, job.fileName, result)

      const processingTime = Date.now() - jobStartTime
      console.log(`✅ Job ${job.id} completed in ${processingTime}ms`)

      this.metrics.completedJobs++
      return result

    } catch (error) {
      console.log(`❌ Job ${job.id} failed: ${(error as Error).message}`)
      this.metrics.failedJobs++
      throw error

    } finally {
      this.processing.delete(job.id)
    }
  }

  // Process job with dedicated worker thread
  private async processJobWithWorker(job: ProcessingJob, workerIndex: number): Promise<any> {
    const worker = this.workers[workerIndex]
    if (!worker) {
      throw new Error(`Worker ${workerIndex} not available`)
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Job ${job.id} timed out in worker ${workerIndex}`))
      }, 30000) // 30 second timeout

      worker.once('message', (result) => {
        clearTimeout(timeout)
        if (result.error) {
          reject(new Error(result.error))
        } else {
          resolve(result.data)
        }
      })

      worker.postMessage(job)
    })
  }

  // Initialize worker threads for parallel processing
  private initializeWorkers(): void {
    if (!this.config.enableParallel) return

    const numWorkers = this.config.workerThreads || 4

    for (let i = 0; i < numWorkers; i++) {
      try {
        const worker = new Worker(__filename, {
          workerData: { workerId: i }
        })

        worker.on('error', (error) => {
          console.log(`❌ Worker ${i} error:`, error)
        })

        worker.on('exit', (code) => {
          console.log(`🔄 Worker ${i} exited with code ${code}`)
        })

        this.workers.push(worker)
      } catch (error) {
        console.log(`⚠️ Failed to create worker ${i}:`, (error as Error).message)
      }
    }

    this.metrics.activeWorkers = this.workers.length
    console.log(`👷 Initialized ${this.workers.length} worker threads`)
  }

  // Start processing timer for batching
  private startProcessingTimer(): void {
    this.processingTimer = setInterval(() => {
      if (this.queue.length > 0) {
        this.processBatch()
      }
    }, this.config.maxWaitTime)
  }

  // Memory management
  private async checkMemoryLimits(): Promise<void> {
    const memoryUsage = process.memoryUsage()
    this.metrics.memoryUsage = memoryUsage.heapUsed

    if (memoryUsage.heapUsed > this.config.maxMemoryUsage) {
      console.log(`🚨 High memory usage: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`)
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc()
        console.log('🗑️ Forced garbage collection')
      }

      // Clear some cache if memory is still high
      const newMemoryUsage = process.memoryUsage()
      if (newMemoryUsage.heapUsed > this.config.maxMemoryUsage) {
        await this.reduceCacheSize()
      }
    }
  }

  // Reduce cache size to free memory
  private async reduceCacheSize(): Promise<void> {
    console.log('📉 Reducing cache size to free memory...')
    
    // Clear 25% of each cache
    const vatStats = vatExtractionCache.getStats()
    const textStats = textExtractionCache.getStats()
    
    if (vatStats.entries > 100) {
      // Clear least recently used entries
      for (let i = 0; i < Math.floor(vatStats.entries * 0.25); i++) {
        vatExtractionCache.cleanup()
      }
    }
    
    if (textStats.entries > 100) {
      for (let i = 0; i < Math.floor(textStats.entries * 0.25); i++) {
        textExtractionCache.cleanup()
      }
    }

    console.log('✅ Cache size reduced')
  }

  // Simulate VAT extraction (replace with actual implementation)
  private async simulateVATExtraction(job: ProcessingJob): Promise<any> {
    // Simulate processing time based on file size
    const processingTime = Math.min(100 + job.fileData.length / 1000, 2000)
    await new Promise(resolve => setTimeout(resolve, processingTime))

    // Return simulated result
    return {
      salesVAT: [92.00],
      purchaseVAT: [],
      confidence: 0.85,
      extractedText: [`Processed ${job.fileName}`],
      documentType: 'SALES_INVOICE',
      processingMethod: 'OPTIMIZED_BATCH',
      processingTimeMs: processingTime,
      validationFlags: ['BATCH_PROCESSED'],
      irishVATCompliant: true,
      jobId: job.id,
      batchProcessed: true
    }
  }

  // Update processing metrics
  private updateMetrics(batchSize: number, processingTime: number): void {
    const avgTime = processingTime / batchSize
    
    this.metrics.avgProcessingTime = (
      (this.metrics.avgProcessingTime * (this.metrics.completedJobs - batchSize) + 
       (avgTime * batchSize)) / this.metrics.completedJobs
    )

    const elapsedTime = Date.now() - (Date.now() - processingTime)
    this.metrics.throughput = elapsedTime > 0 ? (batchSize * 1000) / processingTime : 0
  }

  // Get processing statistics
  getStats(): ProcessingMetrics & { 
    queueLength: number
    processingJobs: number
    successRate: number
  } {
    const totalProcessed = this.metrics.completedJobs + this.metrics.failedJobs
    const successRate = totalProcessed > 0 ? this.metrics.completedJobs / totalProcessed : 0

    return {
      ...this.metrics,
      queueLength: this.queue.length,
      processingJobs: this.processing.size,
      successRate
    }
  }

  // Shutdown processing queue
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down processing queue...')
    
    // Stop processing timer
    if (this.processingTimer) {
      clearInterval(this.processingTimer)
    }

    // Wait for current processing to complete
    while (this.processing.size > 0) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // Terminate workers
    for (const worker of this.workers) {
      await worker.terminate()
    }

    console.log('✅ Processing queue shutdown complete')
  }
}

// Memory optimization utilities
export class MemoryOptimizer {
  private static memoryCheckInterval: NodeJS.Timeout | null = null

  // Start memory monitoring
  static startMonitoring(intervalMs = 30000): void {
    this.memoryCheckInterval = setInterval(() => {
      this.checkMemoryUsage()
    }, intervalMs)
  }

  // Check current memory usage
  static checkMemoryUsage(): void {
    const usage = process.memoryUsage()
    const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024)
    const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024)

    console.log(`🧠 Memory: ${heapUsedMB}MB used / ${heapTotalMB}MB total`)

    // Warning if memory usage is high
    if (heapUsedMB > 500) {
      console.log(`⚠️ High memory usage detected: ${heapUsedMB}MB`)
      this.optimizeMemory()
    }
  }

  // Optimize memory usage
  static optimizeMemory(): void {
    console.log('🔧 Optimizing memory usage...')
    
    // Force garbage collection
    if (global.gc) {
      global.gc()
      console.log('🗑️ Garbage collection triggered')
    }

    // Clean up caches
    vatExtractionCache.cleanup()
    textExtractionCache.cleanup()

    const usage = process.memoryUsage()
    const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024)
    console.log(`✅ Memory optimized: ${heapUsedMB}MB used`)
  }

  // Stop memory monitoring
  static stopMonitoring(): void {
    if (this.memoryCheckInterval) {
      clearInterval(this.memoryCheckInterval)
      this.memoryCheckInterval = null
    }
  }
}

// Worker thread code for parallel processing
if (!isMainThread) {
  parentPort?.on('message', async (job: ProcessingJob) => {
    try {
      // Simulate VAT extraction in worker thread
      const result = await simulateWorkerVATExtraction(job)
      parentPort?.postMessage({ data: result })
    } catch (error) {
      parentPort?.postMessage({ error: (error as Error).message })
    }
  })

  async function simulateWorkerVATExtraction(job: ProcessingJob): Promise<any> {
    // Simulate processing
    const processingTime = Math.min(50 + job.fileData.length / 2000, 1000)
    await new Promise(resolve => setTimeout(resolve, processingTime))

    return {
      salesVAT: [Math.random() * 100],
      purchaseVAT: [],
      confidence: 0.80,
      extractedText: [`Worker processed ${job.fileName}`],
      documentType: 'SALES_INVOICE',
      processingMethod: 'WORKER_THREAD',
      processingTimeMs: processingTime,
      validationFlags: ['WORKER_PROCESSED'],
      irishVATCompliant: true,
      jobId: job.id,
      workerId: workerData.workerId
    }
  }
}

// Export optimized processing queue instance
export const processingQueue = new ProcessingQueue({
  maxBatchSize: 10,
  maxWaitTime: 5000, // 5 seconds
  maxMemoryUsage: 300 * 1024 * 1024, // 300MB
  enableParallel: true,
  workerThreads: 4
})

// Start memory monitoring
MemoryOptimizer.startMonitoring()

// Performance benchmarking utility
export class PerformanceBenchmark {
  private static benchmarks = new Map<string, { start: number, samples: number[] }>()

  static start(name: string): void {
    this.benchmarks.set(name, { start: Date.now(), samples: [] })
  }

  static end(name: string): number {
    const benchmark = this.benchmarks.get(name)
    if (!benchmark) return 0

    const duration = Date.now() - benchmark.start
    benchmark.samples.push(duration)

    // Keep only last 100 samples for moving average
    if (benchmark.samples.length > 100) {
      benchmark.samples.shift()
    }

    return duration
  }

  static getAverage(name: string): number {
    const benchmark = this.benchmarks.get(name)
    if (!benchmark || benchmark.samples.length === 0) return 0

    const sum = benchmark.samples.reduce((a, b) => a + b, 0)
    return sum / benchmark.samples.length
  }

  static report(): void {
    console.log('📊 Performance Benchmark Report:')
    for (const [name, benchmark] of this.benchmarks.entries()) {
      if (benchmark.samples.length > 0) {
        const avg = this.getAverage(name)
        const min = Math.min(...benchmark.samples)
        const max = Math.max(...benchmark.samples)
        console.log(`   ${name}: avg ${avg.toFixed(2)}ms, min ${min}ms, max ${max}ms (${benchmark.samples.length} samples)`)
      }
    }
  }
}