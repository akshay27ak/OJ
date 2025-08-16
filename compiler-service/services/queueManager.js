const Queue = require("bull")
const { executionEngine } = require("./executionEngine")

class QueueManager {
  constructor() {
    this.queues = new Map()
    this.redisConfig = {
      host: process.env.REDIS_HOST || "localhost",
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      db: 0,
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxLoadingTimeout: 1000,
    }

    this.queueOptions = {
      redis: this.redisConfig,
      defaultJobOptions: {
        removeOnComplete: 100, // Keep last 100 completed jobs
        removeOnFail: 50, // Keep last 50 failed jobs
        attempts: 3, // Retry failed jobs 3 times
        backoff: {
          type: "exponential",
          delay: 2000, // Start with 2 second delay
        },
        delay: 0,
        timeout: 300000, // 5 minutes timeout
      },
      settings: {
        stalledInterval: 30000, // Check for stalled jobs every 30 seconds
        maxStalledCount: 1, // Max number of times a job can be stalled
      },
    }

    this.initializeQueues()
  }

  initializeQueues() {
    // Main execution queue
    this.executionQueue = new Queue("code-execution", this.queueOptions)
    this.queues.set("execution", this.executionQueue)

    // Priority queue for contest submissions
    this.priorityQueue = new Queue("priority-execution", {
      ...this.queueOptions,
      defaultJobOptions: {
        ...this.queueOptions.defaultJobOptions,
        priority: 10, // Higher priority
        attempts: 1, // No retries for contest submissions
      },
    })
    this.queues.set("priority", this.priorityQueue)

    // Batch processing queue for multiple submissions
    this.batchQueue = new Queue("batch-execution", {
      ...this.queueOptions,
      defaultJobOptions: {
        ...this.queueOptions.defaultJobOptions,
        attempts: 1,
      },
    })
    this.queues.set("batch", this.batchQueue)

    this.setupQueueProcessors()
    this.setupQueueEventListeners()
  }

  setupQueueProcessors() {
    // Main execution processor
    this.executionQueue.process("execute", 5, async (job) => {
      return await this.processExecutionJob(job)
    })

    // Priority execution processor
    this.priorityQueue.process("execute", 3, async (job) => {
      return await this.processExecutionJob(job)
    })

    // Batch execution processor
    this.batchQueue.process("batch-execute", 2, async (job) => {
      return await this.processBatchJob(job)
    })
  }

  async processExecutionJob(job) {
    const { submissionId, code, language, testCases, timeLimit, memoryLimit, userId } = job.data

    console.log(`[v0] Processing execution job ${job.id} for submission ${submissionId}`)

    try {
      // Update job progress
      await job.progress(10)

      // Execute the submission
      const result = await executionEngine.executeSubmission({
        submissionId,
        code,
        language,
        testCases,
        timeLimit,
        memoryLimit,
      })

      // Update job progress
      await job.progress(100)

      // Add execution metadata
      result.jobId = job.id
      result.userId = userId
      result.queueWaitTime = Date.now() - job.timestamp
      result.processedAt = new Date().toISOString()

      console.log(
        `[v0] Job ${job.id} completed: ${result.verdict} (${result.passedTestCases}/${result.totalTestCases})`,
      )

      return result
    } catch (error) {
      console.error(`[v0] Job ${job.id} failed:`, error)

      // Update job progress to indicate failure
      await job.progress(100)

      throw error
    }
  }

  async processBatchJob(job) {
    const { submissions } = job.data
    console.log(`[v0] Processing batch job ${job.id} with ${submissions.length} submissions`)

    const results = []
    const totalSubmissions = submissions.length

    for (let i = 0; i < submissions.length; i++) {
      const submission = submissions[i]

      try {
        // Update progress
        await job.progress(Math.floor((i / totalSubmissions) * 100))

        const result = await executionEngine.executeSubmission(submission)
        results.push({
          submissionId: submission.submissionId,
          success: true,
          result,
        })
      } catch (error) {
        console.error(`[v0] Batch submission ${submission.submissionId} failed:`, error)
        results.push({
          submissionId: submission.submissionId,
          success: false,
          error: error.message,
        })
      }
    }

    await job.progress(100)

    return {
      totalSubmissions,
      successfulSubmissions: results.filter((r) => r.success).length,
      failedSubmissions: results.filter((r) => !r.success).length,
      results,
    }
  }

  setupQueueEventListeners() {
    // Set up event listeners for all queues
    this.queues.forEach((queue, name) => {
      queue.on("completed", (job, result) => {
        console.log(`[v0] ${name} queue job ${job.id} completed`)
      })

      queue.on("failed", (job, err) => {
        console.error(`[v0] ${name} queue job ${job.id} failed:`, err.message)
      })

      queue.on("stalled", (job) => {
        console.warn(`[v0] ${name} queue job ${job.id} stalled`)
      })

      queue.on("progress", (job, progress) => {
        console.log(`[v0] ${name} queue job ${job.id} progress: ${progress}%`)
      })

      queue.on("waiting", (jobId) => {
        console.log(`[v0] ${name} queue job ${jobId} waiting`)
      })

      queue.on("active", (job, jobPromise) => {
        console.log(`[v0] ${name} queue job ${job.id} started`)
      })
    })
  }

  async addExecutionJob(jobData, options = {}) {
    const queueType = options.priority ? "priority" : "execution"
    const queue = this.queues.get(queueType)

    const jobOptions = {
      ...options,
      delay: options.delay || 0,
      priority: options.priority || 0,
    }

    const job = await queue.add("execute", jobData, jobOptions)

    console.log(`[v0] Added execution job ${job.id} to ${queueType} queue`)

    return {
      jobId: job.id,
      queue: queueType,
      estimatedTime: this.estimateExecutionTime(jobData),
    }
  }

  async addBatchJob(submissions, options = {}) {
    const job = await this.batchQueue.add("batch-execute", { submissions }, options)

    console.log(`[v0] Added batch job ${job.id} with ${submissions.length} submissions`)

    return {
      jobId: job.id,
      queue: "batch",
      totalSubmissions: submissions.length,
    }
  }

  async getJobStatus(jobId, queueType = "execution") {
    const queue = this.queues.get(queueType)
    if (!queue) {
      throw new Error(`Queue ${queueType} not found`)
    }

    const job = await queue.getJob(jobId)
    if (!job) {
      return null
    }

    const state = await job.getState()
    const progress = job.progress()

    return {
      jobId: job.id,
      state,
      progress,
      data: job.data,
      result: job.returnvalue,
      failedReason: job.failedReason,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
      timestamp: job.timestamp,
      attemptsMade: job.attemptsMade,
      delay: job.delay,
      priority: job.opts.priority,
    }
  }

  async getQueueStats() {
    const stats = {}

    for (const [name, queue] of this.queues) {
      const waiting = await queue.getWaiting()
      const active = await queue.getActive()
      const completed = await queue.getCompleted()
      const failed = await queue.getFailed()
      const delayed = await queue.getDelayed()

      stats[name] = {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        delayed: delayed.length,
        total: waiting.length + active.length + completed.length + failed.length + delayed.length,
      }
    }

    return stats
  }

  async pauseQueue(queueType) {
    const queue = this.queues.get(queueType)
    if (queue) {
      await queue.pause()
      console.log(`[v0] Paused ${queueType} queue`)
    }
  }

  async resumeQueue(queueType) {
    const queue = this.queues.get(queueType)
    if (queue) {
      await queue.resume()
      console.log(`[v0] Resumed ${queueType} queue`)
    }
  }

  async cleanQueue(queueType, grace = 5000) {
    const queue = this.queues.get(queueType)
    if (queue) {
      await queue.clean(grace, "completed")
      await queue.clean(grace, "failed")
      console.log(`[v0] Cleaned ${queueType} queue`)
    }
  }

  estimateExecutionTime(jobData) {
    const { testCases, timeLimit } = jobData
    const baseTime = testCases ? testCases.length * (timeLimit || 5000) : 5000
    const queueDelay = 2000 // Estimated queue processing delay

    return Math.ceil((baseTime + queueDelay) / 1000) // Return in seconds
  }

  async shutdown() {
    console.log("[v0] Shutting down queue manager...")

    for (const [name, queue] of this.queues) {
      await queue.close()
      console.log(`[v0] Closed ${name} queue`)
    }
  }
}

// Singleton instance
const queueManager = new QueueManager()

module.exports = {
  QueueManager,
  queueManager,
}
