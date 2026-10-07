import { CONFIG } from './config'
import { rateLimiter } from './rateLimiter'
import { diskCache } from './diskCache'

export interface RawOpenF1Session {
  session_key: number
  session_name: string
  session_type: string
  date_start: string
  date_end: string
  meeting_key: number
  circuit_key: number
  circuit_short_name: string
  country_key: number
  country_code: string
  country_name: string
  location: string
  gmt_offset: string
  year: number
  is_cancelled: boolean
}

export interface RawOpenF1Driver {
  meeting_key: number
  session_key: number
  driver_number: number
  broadcast_name: string
  full_name: string
  name_acronym: string
  team_name: string
  team_colour: string
  first_name: string
  last_name: string
  headshot_url?: string | null
  country_code?: string
}

export interface RawOpenF1Lap {
  meeting_key: number
  session_key: number
  driver_number: number
  lap_number: number
  date_start: string
  duration_sector_1: number | null
  duration_sector_2: number | null
  duration_sector_3: number | null
  i1_speed: number | null
  i2_speed: number | null
  st_speed: number | null
  is_pit_out_lap: boolean
  lap_duration: number | null
  segments_sector_1?: (number | null)[]
  segments_sector_2?: (number | null)[]
  segments_sector_3?: (number | null)[]
}

export interface RawOpenF1Stint {
  meeting_key: number
  session_key: number
  driver_number: number
  stint_number: number
  compound: string
  tyre_age_at_start: number
  lap_start: number
  lap_end: number
}

export interface RawOpenF1Pit {
  meeting_key: number
  session_key: number
  driver_number: number
  lap_number: number
  pit_duration: number | null
  date: string
}

export interface RawOpenF1Position {
  meeting_key: number
  session_key: number
  driver_number: number
  date: string
  position: number
}

export interface RawOpenF1RaceControl {
  meeting_key: number
  session_key: number
  date: string
  category: string
  flag?: string
  message: string
  driver_number?: number | null
  lap_number?: number | null
  scope?: string
  sector?: number | null
}

export interface RawOpenF1TeamRadio {
  meeting_key: number
  session_key: number
  driver_number: number
  date: string
  recording_url: string
}

export interface RawOpenF1Weather {
  meeting_key: number
  session_key: number
  date: string
  air_temperature: number
  track_temperature: number
  humidity: number
  pressure: number
  wind_speed: number
  wind_direction: number
  rainfall: number
}

class OpenF1Client {
  private async get<T>(endpoint: string, params: Record<string, string | number>): Promise<T[]> {
    const url = new URL(`${CONFIG.OPENF1_BASE_URL}/${endpoint}`)
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.append(key, String(value))
    }

    const cacheKey = url.toString()
    if (diskCache.has(cacheKey)) {
      return diskCache.get<T[]>(cacheKey) || []
    }

    try {
      const response = await rateLimiter.fetchWithRetry(url.toString(), {
        headers: { Accept: 'application/json' },
      })

      if (!response.ok) {
        if (response.status === 404) return []
        throw new Error(`OpenF1 returned ${response.status} for ${endpoint}`)
      }

      const data = (await response.json()) as T[]
      diskCache.set(cacheKey, data)
      return data
    } catch (err: any) {
      console.warn(`[OpenF1 WARN] Error fetching ${endpoint}:`, err.message)
      return []
    }
  }

  async getSessions(year: number): Promise<RawOpenF1Session[]> {
    return this.get<RawOpenF1Session>('sessions', { year })
  }

  async getDrivers(sessionKey: number): Promise<RawOpenF1Driver[]> {
    return this.get<RawOpenF1Driver>('drivers', { session_key: sessionKey })
  }

  async getLaps(sessionKey: number): Promise<RawOpenF1Lap[]> {
    return this.get<RawOpenF1Lap>('laps', { session_key: sessionKey })
  }

  async getStints(sessionKey: number): Promise<RawOpenF1Stint[]> {
    return this.get<RawOpenF1Stint>('stints', { session_key: sessionKey })
  }

  async getPit(sessionKey: number): Promise<RawOpenF1Pit[]> {
    return this.get<RawOpenF1Pit>('pit', { session_key: sessionKey })
  }

  async getPosition(sessionKey: number): Promise<RawOpenF1Position[]> {
    return this.get<RawOpenF1Position>('position', { session_key: sessionKey })
  }

  async getRaceControl(sessionKey: number): Promise<RawOpenF1RaceControl[]> {
    return this.get<RawOpenF1RaceControl>('race_control', { session_key: sessionKey })
  }

  async getTeamRadio(sessionKey: number): Promise<RawOpenF1TeamRadio[]> {
    return this.get<RawOpenF1TeamRadio>('team_radio', { session_key: sessionKey })
  }

  async getWeather(sessionKey: number): Promise<RawOpenF1Weather[]> {
    return this.get<RawOpenF1Weather>('weather', { session_key: sessionKey })
  }
}

export const openF1 = new OpenF1Client()
