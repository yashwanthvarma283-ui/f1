/**
 * Shared Type Definitions for the PitWall Data Architecture.
 * Used by both data extraction scripts (/scripts/) and frontend components (/src/).
 * Strictly follows Interface Segregation Principle (ISP).
 */

export interface SeasonMeta {
  year: number
  totalRaces: number
  extractedRaces: number
  lastUpdated: string
  races: RaceSummaryMeta[]
}

export interface RaceSummaryMeta {
  round: number
  slug: string
  raceName: string
  circuitId: string
  circuitName: string
  country: string
  date: string
  hasSprint: boolean
  isCompleted: boolean
  winner?: {
    driverId: string
    name: string
    code: string
    constructorName: string
  }
  coverageScore: number // 0 to 100%
  sessionsAvailable: string[] // e.g. ['FP1', 'Qualifying', 'Race']
}

export interface RaceDetailMeta {
  year: number
  round: number
  slug: string
  raceName: string
  circuit: {
    id: string
    name: string
    locality: string
    country: string
    lat: number
    long: number
    turns: number
    lengthKm: number
  }
  schedule: Record<
    string,
    {
      startIso: string
      endIso: string
      openF1SessionKey?: number
    }
  >
  coverage: Record<string, number>
}

export interface DriverSessionInfo {
  driverNumber: number
  driverId?: string
  broadcastName: string
  fullName: string
  nameAcronym: string
  teamName: string
  teamColour: string
  firstName: string
  lastName: string
  headshotUrl?: string | null
  countryCode?: string
}

export interface LapData {
  driverNumber: number
  lapNumber: number
  lapDuration: number | null // in seconds
  lapTimeString: string // e.g. "1:21.322"
  sector1: number | null
  sector2: number | null
  sector3: number | null
  speedI1?: number | null
  speedI2?: number | null
  speedSt?: number | null
  speedFl?: number | null
  isPitOutLap: boolean
  isPersonalBest: boolean
  isFastestLap: boolean
  compound?: string
  tyreLife?: number
  freshTyre?: boolean
  stint?: number
  position?: number
  trackStatus?: string
  dateStartIso: string
}

export interface StintData {
  driverNumber: number
  stintNumber: number
  compound: 'SOFT' | 'MEDIUM' | 'HARD' | 'INTERMEDIATE' | 'WET' | 'UNKNOWN'
  tyreAgeAtStart: number
  lapStart: number
  lapEnd: number
  totalLaps: number
}

export interface PitStopData {
  driverNumber: number
  lapNumber: number
  stopNumber: number
  pitDurationSeconds: number | null
  pitLaneDurationSeconds: number | null
  timestamp?: string
}

export interface LapDriverPosition {
  driverNumber: number
  driverCode: string
  position: number
  gapToLeaderSeconds: number | null
  intervalToAheadSeconds: number | null
  compound: string
  tyreAge: number
  pitStopThisLap: boolean
}

export interface LapPositionSnapshot {
  lap: number
  positions: LapDriverPosition[]
}

export interface OvertakeEvent {
  lap: number
  overtakingDriverNumber: number
  overtakenDriverNumber: number
  overtakingCode: string
  overtakenCode: string
  fromPosition: number
  toPosition: number
  timestamp?: string
}

export interface TeamRadioClip {
  id: string
  timestamp: string
  driverNumber: number
  driverCode: string
  teamName: string
  audioUrl: string // Remote FOM/OpenF1 stream URL only; never re-hosted
  lapNumber: number | null // null indicates unmapped bucket
}

export interface RaceControlMessage {
  id: string
  timestamp: string
  category: 'Flag' | 'SafetyCar' | 'VirtualSafetyCar' | 'Investigation' | 'Penalty' | 'Information'
  flag?: 'GREEN' | 'YELLOW' | 'DOUBLE YELLOW' | 'RED' | 'CHEQUERED' | 'CLEAR'
  message: string
  driverNumber?: number | null
  lapNumber: number | null // null indicates unmapped bucket
}

export interface LapFeedEvent {
  type: 'OVERTAKE' | 'PIT_STOP' | 'SAFETY_CAR' | 'VSC' | 'FLAG' | 'FASTEST_LAP' | 'RETIREMENT' | 'PENALTY'
  description: string
  driverNumber?: number
  importance: 'high' | 'medium' | 'low'
}

export interface LapFeedEntry {
  lap: number
  timestamp?: string
  headline: string
  summary: string
  leaderCode: string
  gapToSecond: string
  events: LapFeedEvent[]
}

export interface WeatherSnapshot {
  timestamp: string
  lapApprox?: number
  airTemp: number
  trackTemp: number
  humidity: number
  pressure: number
  windSpeed: number
  windDirection: number
  rainfall: boolean
}

export interface RaceCoverageReport {
  raceName: string
  year: number
  round: number
  generatedAt: string
  sessions: Record<
    string,
    {
      sessionKey?: number
      driversCount: number
      lapsCount: number
      stintsAvailable: boolean
      pitStopsCount: number
      radioClipsCount: number
      radioMappedPercentage: number
      raceControlMessagesCount: number
      raceControlMappedPercentage: number
      weatherCount: number
      overallCompletenessPercent: number
    }
  >
}

export type SeasonRaceMeta = RaceSummaryMeta

export interface DriverRaceSummaryStats {
  driverNumber: number
  driverCode: string
  grid: number
  finish: number
  positionsGained: number
  fastestLapTime: string | null
  fastestLapDuration: number | null
  averagePaceSeconds: number | null
  bestSector1: number | null
  bestSector2: number | null
  bestSector3: number | null
  pitStopCount: number
  lapsLed: number
  stintsCount: number
  compoundsUsed: string[]
}

export interface DriverTyreLapState {
  driverNumber: number
  lapNumber: number
  compound: string
  tyreAgeLaps: number
  stintNumber: number
  isNewAtStart: boolean
  lapTimeSeconds: number | null
  deltaToStintBestSeconds: number | null
  estimatedDegradationTrendSeconds: number | null
  topSpeedKmh?: number | null
  minCornerSpeedKmh?: number | null
}

export interface RaceResultEntry {
  position: number
  classifiedPosition: string
  grid: number
  status: string
  points: number
  laps: number
  time: string
  driverNumber: number
  driverCode: string
  teamName: string
}

export interface SessionDataset {
  isAvailable: boolean
  isHistoricalArchive?: boolean
  dataSource?: 'fastf1' | 'jolpica' | 'none'
  results: RaceResultEntry[]
  drivers: DriverSessionInfo[]
  laps: LapData[]
  positionsByLap: LapPositionSnapshot[]
  gapsByLap: any[]
  overtakes: OvertakeEvent[]
  stints: StintData[]
  pitstops: PitStopData[]
  tyreDegradation: DriverTyreLapState[]
  driverStats: DriverRaceSummaryStats[]
  radio: TeamRadioClip[]
  raceControl: RaceControlMessage[]
  weather: WeatherSnapshot[]
  lapFeed: LapFeedEntry[]
}
