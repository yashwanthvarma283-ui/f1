import { CONFIG } from './config'
import { rateLimiter } from './rateLimiter'
import { diskCache } from './diskCache'

class JolpicaClient {
  private async get<T>(path: string): Promise<T | null> {
    const url = `${CONFIG.JOLPICA_BASE_URL}/${path}.json`
    const cacheKey = url

    if (diskCache.has(cacheKey)) {
      return diskCache.get<T>(cacheKey)
    }

    try {
      const response = await rateLimiter.fetchWithRetry(url, {
        headers: { Accept: 'application/json' },
      })

      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error(`Jolpica returned ${response.status} for ${path}`)
      }

      const json = await response.json()
      diskCache.set(cacheKey, json)
      return json as T
    } catch (err: any) {
      console.warn(`[Jolpica WARN] Error fetching ${path}:`, err.message)
      return null
    }
  }

  async getSchedule(year: number): Promise<any[]> {
    const data = await this.get<any>(`${year}`)
    return data?.MRData?.RaceTable?.Races || []
  }

  async getRaceResults(year: number, round: number): Promise<any | null> {
    const data = await this.get<any>(`${year}/${round}/results`)
    return data?.MRData?.RaceTable?.Races?.[0] || null
  }

  async getPitStops(year: number, round: number): Promise<any[]> {
    const data = await this.get<any>(`${year}/${round}/pitstops`)
    return data?.MRData?.RaceTable?.Races?.[0]?.PitStops || []
  }

  async getCircuitPastWinners(circuitId: string, limit = 5): Promise<any[]> {
    const data = await this.get<any>(`circuits/${circuitId}/results/1?limit=${limit}`)
    const races = data?.MRData?.RaceTable?.Races || []
    return races.map((r: any) => ({
      year: parseInt(r.season, 10),
      raceName: r.raceName,
      winner: r.Results?.[0]?.Driver
        ? `${r.Results[0].Driver.givenName} ${r.Results[0].Driver.familyName}`
        : 'Unknown',
      driverCode: r.Results?.[0]?.Driver?.code || '',
      constructorName: r.Results?.[0]?.Constructor?.name || '',
      time: r.Results?.[0]?.Time?.time || null,
    }))
  }
}

export const jolpica = new JolpicaClient()
