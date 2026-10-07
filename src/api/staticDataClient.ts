import {
  SeasonMeta,
  RaceDetailMeta,
  RaceCoverageReport,
  LapData,
  StintData,
  PitStopData,
  WeatherSnapshot,
  TeamRadioClip,
  RaceControlMessage,
  LapFeedEntry,
  LapPositionSnapshot,
  OvertakeEvent,
  DriverTyreLapState,
  DriverRaceSummaryStats,
  DriverSessionInfo,
  SessionDataset,
  RaceResultEntry,
} from '@/types/data'
import { getTeamMeta } from '@/lib/teams'
import { jolpicaClient } from './jolpicaClient'

class StaticDataClient {
  private cache = new Map<string, any>()

  private async fetchJson<T>(url: string): Promise<T | null> {
    if (this.cache.has(url)) {
      return this.cache.get(url) as T
    }

    try {
      const res = await fetch(url)
      if (!res.ok) {
        if (res.status === 404) return null
        throw new Error(`HTTP ${res.status} fetching ${url}`)
      }
      const data = (await res.json()) as T
      this.cache.set(url, data)
      return data
    } catch {
      return null
    }
  }

  /**
   * Get Season Meta (all races with winner, date, status, score)
   */
  async getSeasonMeta(year: number): Promise<SeasonMeta | null> {
    const staticData = await this.fetchJson<SeasonMeta>(`/data/${year}/meta.json`)
    if (staticData) return staticData

    // Fallback to Jolpica if static file not yet extracted
    try {
      const schedule = await jolpicaClient.getSchedule(String(year))
      const raceList = schedule?.races || []
      if (raceList.length === 0) return null

      return {
        year,
        totalRaces: raceList.length,
        extractedRaces: 0,
        lastUpdated: new Date().toISOString(),
        races: raceList.map((r: any) => ({
          round: parseInt(r.round, 10),
          slug: (r.Circuit.Location.locality || r.raceName).toLowerCase().replace(/[^a-z0-9]/g, '_'),
          raceName: r.raceName,
          circuitId: r.Circuit.circuitId,
          circuitName: r.Circuit.circuitName,
          country: r.Circuit.Location.country,
          date: r.date,
          hasSprint: !!r.Sprint,
          isCompleted: new Date(r.date).getTime() < Date.now(),
          coverageScore: 0,
          sessionsAvailable: [],
        })),
      }
    } catch {
      return null
    }
  }

  /**
   * Resolve any round number, slug or composite ID into the exact folder name
   */
  async resolveRoundFolder(year: number, roundOrSlug: string | number): Promise<string> {
    const raw = String(roundOrSlug).trim()
    // Strip year prefix if present like 2024-01-sakhir or 2024_1
    const stripped = raw.replace(/^(\d{4})[-_]/, '')
    const normalized = stripped.toLowerCase().replace(/-/g, '_')

    if (/^\d{2}_[a-z0-9_]+$/.test(normalized)) {
      return normalized
    }

    const seasonMeta = await this.getSeasonMeta(year)
    if (seasonMeta) {
      const match = seasonMeta.races.find(r => 
        String(r.round) === raw ||
        String(r.round) === stripped ||
        r.slug.toLowerCase() === normalized ||
        `${String(r.round).padStart(2, '0')}_${r.slug}` === normalized ||
        `${r.round}_${r.slug}` === normalized ||
        r.circuitId.toLowerCase() === normalized
      )
      if (match) {
        return `${String(match.round).padStart(2, '0')}_${match.slug}`
      }
    }

    const roundNum = parseInt(raw.replace(/\D/g, ''), 10)
    if (!isNaN(roundNum) && roundNum > 0) {
      return `${String(roundNum).padStart(2, '0')}_${normalized}`
    }
    return normalized
  }

  /**
   * Get Race Detail Meta (circuit facts, schedule, lat/long)
   */
  async getRaceMeta(year: number, roundSlug: string | number): Promise<RaceDetailMeta | null> {
    const folder = await this.resolveRoundFolder(year, roundSlug)
    return this.fetchJson<RaceDetailMeta>(`/data/${year}/${folder}/meta.json`)
  }

  /**
   * Get Coverage Validation Report
   */
  async getRaceCoverage(year: number, roundSlug: string | number): Promise<RaceCoverageReport | null> {
    const folder = await this.resolveRoundFolder(year, roundSlug)
    return this.fetchJson<RaceCoverageReport>(`/data/${year}/${folder}/coverage.json`)
  }

  /**
   * Get full session dataset bundle (static FastF1 or Jolpica live fallback)
   */
  async getSessionDataset(
    year: number,
    roundSlug: string | number,
    session = 'race'
  ): Promise<SessionDataset> {
    const folder = await this.resolveRoundFolder(year, roundSlug)
    const basePath = `/data/${year}/${folder}/${session}`

    const [
      results,
      drivers,
      laps,
      positionsByLap,
      gapsByLap,
      overtakes,
      stints,
      pitstops,
      tyreDegradation,
      driverStats,
      radio,
      raceControl,
      weather,
      lapFeed,
    ] = await Promise.all([
      this.fetchJson<RaceResultEntry[]>(`${basePath}/results.json`),
      this.fetchJson<DriverSessionInfo[]>(`${basePath}/drivers.json`),
      this.fetchJson<LapData[]>(`${basePath}/laps.json`),
      this.fetchJson<LapPositionSnapshot[]>(`${basePath}/positions-by-lap.json`),
      this.fetchJson<any[]>(`${basePath}/gaps-by-lap.json`),
      this.fetchJson<OvertakeEvent[]>(`${basePath}/overtakes.json`),
      this.fetchJson<StintData[]>(`${basePath}/stints.json`),
      this.fetchJson<PitStopData[]>(`${basePath}/pitstops.json`),
      this.fetchJson<DriverTyreLapState[]>(`${basePath}/tyre-degradation.json`),
      this.fetchJson<DriverRaceSummaryStats[]>(`${basePath}/driver-stats.json`),
      this.fetchJson<TeamRadioClip[]>(`${basePath}/radio.json`),
      this.fetchJson<RaceControlMessage[]>(`${basePath}/race-control.json`),
      this.fetchJson<WeatherSnapshot[]>(`${basePath}/weather.json`),
      this.fetchJson<LapFeedEntry[]>(`${basePath}/lap-feed.json`),
    ])

    // Case 1: Pre-extracted high-resolution telemetry exists (e.g. 2024 season)
    if (laps && laps.length > 0) {
      return {
        isAvailable: true,
        isHistoricalArchive: false,
        dataSource: 'fastf1',
        results: results || [],
        drivers: drivers || [],
        laps: laps || [],
        positionsByLap: positionsByLap || [],
        gapsByLap: gapsByLap || [],
        overtakes: overtakes || [],
        stints: stints || [],
        pitstops: pitstops || [],
        tyreDegradation: tyreDegradation || [],
        driverStats: driverStats || [],
        radio: radio || [],
        raceControl: raceControl || [],
        weather: weather || [],
        lapFeed: lapFeed || [],
      }
    }

    // Case 2: Static results are available on disk without high-frequency telemetry
    if (results && results.length > 0) {
      return {
        isAvailable: true,
        isHistoricalArchive: true,
        dataSource: 'fastf1',
        results: results,
        drivers: drivers || [],
        laps: [],
        positionsByLap: positionsByLap || [],
        gapsByLap: gapsByLap || [],
        overtakes: overtakes || [],
        stints: stints || [],
        pitstops: pitstops || [],
        tyreDegradation: tyreDegradation || [],
        driverStats: driverStats || [],
        radio: radio || [],
        raceControl: raceControl || [],
        weather: weather || [],
        lapFeed: lapFeed || [],
      }
    }

    // Case 3: Historical archive fallback to Jolpica API (1950–2023)
    const matchRound = folder.match(/^(\d+)/)
    const roundNum = matchRound
      ? parseInt(matchRound[1], 10)
      : parseInt(String(roundSlug).replace(/\D/g, ''), 10)

    if (roundNum > 0) {
      try {
        const isQuali = session.toLowerCase().includes('quali')
        if (isQuali) {
          const qualiData = await jolpicaClient.getQualifyingResults(year, roundNum)
          const rawQuali = qualiData?.QualifyingResults || []
          if (rawQuali.length > 0) {
            const finalResults = rawQuali.map((r: any, idx: number) => {
              const driverNum = parseInt(r.number, 10) || idx + 1
              const pos = parseInt(r.position, 10) || idx + 1
              const driverCode =
                r.Driver?.code ||
                (r.Driver?.familyName ? r.Driver.familyName.slice(0, 3).toUpperCase() : `D${driverNum}`)
              const teamName = r.Constructor?.name || 'Independent'

              return {
                position: pos,
                classifiedPosition: String(pos),
                grid: pos,
                status: 'Classified',
                points: 0,
                laps: 0,
                time: r.Q3 || r.Q2 || r.Q1 || 'No time',
                driverNumber: driverNum,
                driverCode,
                teamName,
              }
            })

            const finalDrivers: DriverSessionInfo[] = rawQuali.map((r: any, idx: number) => {
              const driverNum = parseInt(r.number, 10) || idx + 1
              const driverCode =
                r.Driver?.code ||
                (r.Driver?.familyName ? r.Driver.familyName.slice(0, 3).toUpperCase() : `D${driverNum}`)
              const teamName = r.Constructor?.name || 'Independent'
              const teamMeta = getTeamMeta(teamName)

              return {
                driverNumber: driverNum,
                driverId: r.Driver?.driverId,
                broadcastName: r.Driver?.familyName?.toUpperCase() || driverCode,
                fullName: `${r.Driver?.givenName || ''} ${r.Driver?.familyName || ''}`.trim() || driverCode,
                nameAcronym: driverCode,
                teamName,
                teamColour: teamMeta.color,
                firstName: r.Driver?.givenName || '',
                lastName: r.Driver?.familyName || '',
                headshotUrl: null,
                countryCode: r.Driver?.nationality,
              }
            })

            return {
              isAvailable: true,
              isHistoricalArchive: true,
              dataSource: 'jolpica',
              results: finalResults,
              drivers: finalDrivers,
              laps: [],
              positionsByLap: [],
              gapsByLap: [],
              overtakes: [],
              stints: [],
              pitstops: [],
              tyreDegradation: [],
              driverStats: [],
              radio: [],
              raceControl: [],
              weather: [],
              lapFeed: [],
            }
          }
        } else {
          // Race session
          const raceData = await jolpicaClient.getRaceResults(year, roundNum)
          const rawResults = raceData?.Results || []
          if (rawResults.length > 0) {
            const finalResults = rawResults.map((r: any, idx: number) => {
              const driverNum = parseInt(r.number, 10) || idx + 1
              const pos = parseInt(r.position, 10) || idx + 1
              const grid = parseInt(r.grid, 10) || 0
              const driverCode =
                r.Driver?.code ||
                (r.Driver?.familyName ? r.Driver.familyName.slice(0, 3).toUpperCase() : `D${driverNum}`)
              const teamName = r.Constructor?.name || 'Independent'

              let timeStr = ''
              if (r.Time?.time) {
                timeStr = r.Time.time
              } else if (r.status === 'Finished') {
                timeStr = 'Finished'
              } else {
                timeStr = r.status || 'Not classified'
              }

              return {
                position: pos,
                classifiedPosition: r.positionText || String(pos),
                grid,
                status: r.status || 'Finished',
                points: parseFloat(r.points) || 0,
                laps: parseInt(r.laps, 10) || 0,
                time: timeStr,
                driverNumber: driverNum,
                driverCode,
                teamName,
              }
            })

            const finalDrivers: DriverSessionInfo[] = rawResults.map((r: any, idx: number) => {
              const driverNum = parseInt(r.number, 10) || idx + 1
              const driverCode =
                r.Driver?.code ||
                (r.Driver?.familyName ? r.Driver.familyName.slice(0, 3).toUpperCase() : `D${driverNum}`)
              const teamName = r.Constructor?.name || 'Independent'
              const teamMeta = getTeamMeta(teamName)

              return {
                driverNumber: driverNum,
                driverId: r.Driver?.driverId,
                broadcastName: r.Driver?.familyName?.toUpperCase() || driverCode,
                fullName: `${r.Driver?.givenName || ''} ${r.Driver?.familyName || ''}`.trim() || driverCode,
                nameAcronym: driverCode,
                teamName,
                teamColour: teamMeta.color,
                firstName: r.Driver?.givenName || '',
                lastName: r.Driver?.familyName || '',
                headshotUrl: null,
                countryCode: r.Driver?.nationality,
              }
            })

            const finalDriverStats: DriverRaceSummaryStats[] = rawResults.map((r: any, idx: number) => {
              const driverNum = parseInt(r.number, 10) || idx + 1
              const pos = parseInt(r.position, 10) || idx + 1
              const grid = parseInt(r.grid, 10) || 0
              const driverCode =
                r.Driver?.code ||
                (r.Driver?.familyName ? r.Driver.familyName.slice(0, 3).toUpperCase() : `D${driverNum}`)

              return {
                driverNumber: driverNum,
                driverCode,
                grid,
                finish: pos,
                positionsGained: grid > 0 ? grid - pos : 0,
                fastestLapTime: r.FastestLap?.Time?.time || null,
                fastestLapDuration: null,
                averagePaceSeconds: null,
                bestSector1: null,
                bestSector2: null,
                bestSector3: null,
                pitStopCount: 0,
                lapsLed: pos === 1 ? parseInt(r.laps, 10) || 0 : 0,
                stintsCount: 1,
                compoundsUsed: [],
              }
            })

            let finalPitstops: PitStopData[] = []
            if (year >= 2012) {
              try {
                const rawPits = await jolpicaClient.getPitStops(year, roundNum)
                if (rawPits && rawPits.length > 0) {
                  finalPitstops = rawPits.map((p: any) => {
                    const driver = finalDrivers.find((d) => d.driverId === p.driverId)
                    return {
                      driverNumber: driver ? driver.driverNumber : parseInt(p.driverId, 10) || 0,
                      lapNumber: parseInt(p.lap, 10) || 1,
                      stopNumber: parseInt(p.stop, 10) || 1,
                      pitDurationSeconds: parseFloat(p.duration) || null,
                      pitLaneDurationSeconds: parseFloat(p.duration) || null,
                      timestamp: p.time,
                    }
                  })
                }
              } catch {
                // Pit stops fallback silent
              }
            }

            const winner = rawResults[0]
            const p2 = rawResults[1]
            const p3 = rawResults[2]
            const winnerName = winner
              ? `${winner.Driver?.givenName || ''} ${winner.Driver?.familyName || ''}`.trim()
              : 'Winner'
            const winnerLaps = winner ? parseInt(winner.laps, 10) || 50 : 50

            const finalLapFeed: LapFeedEntry[] = [
              {
                lap: 1,
                headline: `Grand Prix Start: ${raceData.raceName || 'Grand Prix'}`,
                summary: `The ${year} ${raceData.raceName || 'Grand Prix'} commenced with ${rawResults.length} drivers on the starting grid.`,
                leaderCode:
                  winner?.Driver?.code ||
                  winner?.Driver?.familyName?.slice(0, 3).toUpperCase() ||
                  'P1',
                gapToSecond: '0.000',
                events: [
                  {
                    type: 'FLAG',
                    description: `Official race start of the ${year} ${raceData.raceName || 'Grand Prix'}.`,
                    importance: 'high',
                  },
                ],
              },
              {
                lap: winnerLaps,
                headline: `Chequered Flag: Victory for ${winnerName}`,
                summary: `${winnerName} (${winner?.Constructor?.name || 'Constructor'}) took victory in the ${year} ${raceData.raceName || 'Grand Prix'}${p2 ? `, followed by ${p2.Driver?.givenName} ${p2.Driver?.familyName}` : ''}${p3 ? ` and ${p3.Driver?.givenName} ${p3.Driver?.familyName}` : ''}.`,
                leaderCode:
                  winner?.Driver?.code ||
                  winner?.Driver?.familyName?.slice(0, 3).toUpperCase() ||
                  'P1',
                gapToSecond: p2?.Time?.time || '0.000',
                events: [
                  {
                    type: 'FLAG',
                    description: `Chequered flag: ${winnerName} takes victory.`,
                    importance: 'high',
                  },
                ],
              },
            ]

            return {
              isAvailable: true,
              isHistoricalArchive: true,
              dataSource: 'jolpica',
              results: finalResults,
              drivers: finalDrivers,
              laps: [],
              positionsByLap: [],
              gapsByLap: [],
              overtakes: [],
              stints: [],
              pitstops: finalPitstops,
              tyreDegradation: [],
              driverStats: finalDriverStats,
              radio: [],
              raceControl: [],
              weather: [],
              lapFeed: finalLapFeed,
            }
          }
        }
      } catch {
        // Jolpica network error or rate limit
      }
    }

    return {
      isAvailable: false,
      isHistoricalArchive: false,
      dataSource: 'none',
      results: [],
      drivers: [],
      laps: [],
      positionsByLap: [],
      gapsByLap: [],
      overtakes: [],
      stints: [],
      pitstops: [],
      tyreDegradation: [],
      driverStats: [],
      radio: [],
      raceControl: [],
      weather: [],
      lapFeed: [],
    }
  }
}

export const staticDataClient = new StaticDataClient()

