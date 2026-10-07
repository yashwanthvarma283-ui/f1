import { LiveSessionStatus } from './types'

const OPENF1_BASE = 'https://api.openf1.org/v1'

interface OpenF1Session {
  session_key: number
  session_name: string
  session_type: string
  date_start: string
  date_end: string
  country_name: string
  circuit_short_name: string
  year: number
}

/**
 * OpenF1 API Client for live telemetry and session status.
 * Adheres to SRP: only handles OpenF1 queries and live session detection.
 */
class OpenF1Client {
  /**
   * Checks whether an F1 session is currently live or within the replay window (finished within 3 hours).
   * Derives state strictly from real timestamps.
   */
  async checkSessionStatus(circuitName?: string, countryName?: string): Promise<LiveSessionStatus> {
    try {
      const now = new Date()
      // Look for sessions within a 4-hour window
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 4000)

      let query = `${OPENF1_BASE}/sessions?session_key=latest`
      if (countryName) {
        query = `${OPENF1_BASE}/sessions?country_name=${encodeURIComponent(countryName)}&year=${now.getUTCFullYear()}`
      }

      const response = await fetch(query, {
        signal: controller.signal,
      }).catch(() => null)

      clearTimeout(timeoutId)

      if (!response || !response.ok) {
        return { isLive: false, isReplay: false }
      }

      const sessions: OpenF1Session[] = await response.json()
      if (!Array.isArray(sessions) || sessions.length === 0) {
        return { isLive: false, isReplay: false }
      }

      const latest = sessions[sessions.length - 1]
      const startTime = new Date(latest.date_start).getTime()
      const endTime = new Date(latest.date_end).getTime()
      const currentTime = now.getTime()

      // Live if current time is between start and end
      if (currentTime >= startTime && currentTime <= endTime) {
        return {
          isLive: true,
          isReplay: false,
          activeSessionName: latest.session_name,
          sessionKey: latest.session_key,
        }
      }

      // Replay if ended within 3 hours
      const threeHoursMs = 3 * 60 * 60 * 1000
      if (currentTime > endTime && currentTime <= endTime + threeHoursMs) {
        return {
          isLive: false,
          isReplay: true,
          activeSessionName: latest.session_name,
          sessionKey: latest.session_key,
        }
      }

      return { isLive: false, isReplay: false }
    } catch {
      return { isLive: false, isReplay: false }
    }
  }
}

export const openf1Client = new OpenF1Client()
