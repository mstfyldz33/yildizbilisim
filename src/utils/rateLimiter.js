class RateLimiter {
  constructor(maxRequests = 5, windowMs = 60000) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
    this.requests = new Map()
  }

  checkLimit(identifier) {
    const now = Date.now()
    const userRequests = this.requests.get(identifier) || []

    const validRequests = userRequests.filter(
      (timestamp) => now - timestamp < this.windowMs
    )

    if (validRequests.length >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: validRequests[0] + this.windowMs
      }
    }

    validRequests.push(now)
    this.requests.set(identifier, validRequests)

    return {
      allowed: true,
      remaining: this.maxRequests - validRequests.length,
      resetTime: validRequests[0] + this.windowMs
    }
  }

  clear(identifier) {
    this.requests.delete(identifier)
  }

  clearExpired() {
    const now = Date.now()
    for (const [identifier, timestamps] of this.requests.entries()) {
      const validRequests = timestamps.filter(
        (timestamp) => now - timestamp < this.windowMs
      )
      
      if (validRequests.length === 0) {
        this.requests.delete(identifier)
      } else {
        this.requests.set(identifier, validRequests)
      }
    }
  }

  getStatus(identifier) {
    const now = Date.now()
    const userRequests = this.requests.get(identifier) || []
    const validRequests = userRequests.filter(
      (timestamp) => now - timestamp < this.windowMs
    )

    return {
      count: validRequests.length,
      remaining: this.maxRequests - validRequests.length,
      resetTime: validRequests.length > 0 ? validRequests[0] + this.windowMs : now
    }
  }
}

const globalRateLimiter = new RateLimiter(5, 60000)

function getClientIdentifier() {
  let identifier = localStorage.getItem('clientId')
  if (!identifier) {
    identifier = `client_${Date.now()}_${Math.random().toString(36).substring(7)}`
    localStorage.setItem('clientId', identifier)
  }
  return identifier
}

export function checkRateLimit(action = 'default') {
  const identifier = `${getClientIdentifier()}_${action}`
  return globalRateLimiter.checkLimit(identifier)
}

export function getRateLimitStatus(action = 'default') {
  const identifier = `${getClientIdentifier()}_${action}`
  return globalRateLimiter.getStatus(identifier)
}

export function clearRateLimit(action = 'default') {
  const identifier = `${getClientIdentifier()}_${action}`
  globalRateLimiter.clear(identifier)
}

export function cleanupExpired() {
  globalRateLimiter.clearExpired()
}

if (typeof window !== 'undefined') {
  setInterval(cleanupExpired, 5 * 60000)
}

export default globalRateLimiter

