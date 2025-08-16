const Redis = require("redis")

class RateLimiter {
  constructor() {
    this.redis = Redis.createClient({
      socket: {
        host: process.env.REDIS_HOST || "localhost",
        port: process.env.REDIS_PORT || 6379,
      },
      password: process.env.REDIS_PASSWORD || undefined,
      database: 1, // Use different database for rate limiting
    })

    this.redis.on("error", (err) => {
      console.error("[v0] Redis rate limiter error:", err)
    })

    this.redis.on("connect", () => {
      console.log("[v0] Rate limiter Redis connected")
    })

    this.redis.connect().catch(console.error)
  }

  async checkRateLimit(userId, action = "execute") {
    const key = `rate_limit:${action}:${userId}`
    const now = Date.now()
    const window = this.getWindowSize(action)
    const limit = this.getLimit(action)

    try {
      // Remove expired entries
      await this.redis.zRemRangeByScore(key, 0, now - window)

      // Count current requests
      const current = await this.redis.zCard(key)

      if (current >= limit) {
        const oldestRequest = await this.redis.zRangeWithScores(key, 0, 0)
        const resetTime = oldestRequest.length > 0 ? Number.parseInt(oldestRequest[0].score) + window : now + window

        return {
          allowed: false,
          limit,
          current,
          resetTime,
          retryAfter: Math.ceil((resetTime - now) / 1000),
        }
      }

      // Add current request
      await this.redis.zAdd(key, { score: now, value: `${now}-${Math.random()}` })
      await this.redis.expire(key, Math.ceil(window / 1000))

      return {
        allowed: true,
        limit,
        current: current + 1,
        resetTime: now + window,
        retryAfter: 0,
      }
    } catch (error) {
      console.error("[v0] Rate limit check error:", error)
      // Allow request if Redis is down
      return {
        allowed: true,
        limit,
        current: 0,
        resetTime: now + window,
        retryAfter: 0,
      }
    }
  }

  getWindowSize(action) {
    const windows = {
      execute: 60000, // 1 minute
      batch: 300000, // 5 minutes
      priority: 30000, // 30 seconds
    }
    return windows[action] || 60000
  }

  getLimit(action) {
    const limits = {
      execute: 10, // 10 executions per minute
      batch: 2, // 2 batch jobs per 5 minutes
      priority: 5, // 5 priority executions per 30 seconds
    }
    return limits[action] || 10
  }

  async getUserStats(userId) {
    const actions = ["execute", "batch", "priority"]
    const stats = {}

    for (const action of actions) {
      const key = `rate_limit:${action}:${userId}`
      const now = Date.now()
      const window = this.getWindowSize(action)

      // Remove expired entries
      await this.redis.zRemRangeByScore(key, 0, now - window)

      // Get current count
      const current = await this.redis.zCard(key)
      const limit = this.getLimit(action)

      stats[action] = {
        current,
        limit,
        remaining: Math.max(0, limit - current),
        resetTime: now + window,
      }
    }

    return stats
  }

  async resetUserLimits(userId) {
    const actions = ["execute", "batch", "priority"]

    for (const action of actions) {
      const key = `rate_limit:${action}:${userId}`
      await this.redis.del(key)
    }

    console.log(`[v0] Reset rate limits for user ${userId}`)
  }
}

// Singleton instance
const rateLimiter = new RateLimiter()

module.exports = {
  RateLimiter,
  rateLimiter,
}
