import { CONFIG } from './config'

/**
 * Polite API Rate Limiter and Exponential Backoff Dispatcher.
 * Adheres to SRP: exactly one responsibility of pacing requests and handling retries.
 */
class RateLimiter {
  private lastRequestTime = 0
  private minIntervalMs = 1000 / CONFIG.MAX_REQUESTS_PER_SECOND

  async throttle(): Promise<void> {
    const now = Date.now()
    const elapsed = now - this.lastRequestTime
    if (elapsed < this.minIntervalMs) {
      await new Promise((resolve) => setTimeout(resolve, this.minIntervalMs - elapsed))
    }
    this.lastRequestTime = Date.now()
  }

  async fetchWithRetry(url: string, options: RequestInit = {}): Promise<Response> {
    let attempt = 0
    let delay = CONFIG.INITIAL_RETRY_DELAY_MS

    while (attempt < CONFIG.MAX_RETRIES) {
      await this.throttle()

      try {
        const response = await fetch(url, options)

        if (response.status === 429 || response.status === 503 || response.status === 502) {
          attempt++
          const jitter = Math.random() * 500
          console.warn(
            `\x1b[33m[RATE LIMIT / SERVER ${response.status}] Retrying ${url} in ${Math.round(
              delay + jitter
            )}ms (Attempt ${attempt}/${CONFIG.MAX_RETRIES})\x1b[0m`
          )
          await new Promise((resolve) => setTimeout(resolve, delay + jitter))
          delay *= 2
          continue
        }

        return response
      } catch (err: any) {
        attempt++
        if (attempt >= CONFIG.MAX_RETRIES) throw err
        const jitter = Math.random() * 500
        console.warn(
          `\x1b[33m[NETWORK ERROR] ${err.message}. Retrying in ${Math.round(
            delay + jitter
          )}ms (Attempt ${attempt}/${CONFIG.MAX_RETRIES})\x1b[0m`
        )
        await new Promise((resolve) => setTimeout(resolve, delay + jitter))
        delay *= 2
      }
    }

    throw new Error(`Failed to fetch ${url} after ${CONFIG.MAX_RETRIES} attempts.`)
  }
}

export const rateLimiter = new RateLimiter()
