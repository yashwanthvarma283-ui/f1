import { RawOpenF1Lap, RawOpenF1Stint } from './openf1'

export interface DriverTyreLapState {
  driverNumber: number
  lapNumber: number
  compound: string
  tyreAgeLaps: number
  stintNumber: number
  isNewAtStart: boolean
  lapTimeSeconds: number | null
  deltaToStintBestSeconds: number | null
  estimatedDegradationTrendSeconds: number | null // Fuel-corrected degradation trend
}

export interface DriverRaceSummaryStats {
  driverNumber: number
  driverCode: string
  grid: number
  finish: number
  positionsGained: number
  fastestLapTime: string
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

/**
 * Calculates tyre degradation trends and driver race metrics.
 * Adheres to SRP & Truthfulness:
 * - Fuel correction model: ~0.06s/lap burnoff compensation across a GP distance.
 * - No fake wear percentages; strictly delta to stint best and estimated pace drop.
 */
export class TyreDegradationCalculator {
  static computeTyreLapStates(
    laps: RawOpenF1Lap[],
    stints: RawOpenF1Stint[]
  ): DriverTyreLapState[] {
    const states: DriverTyreLapState[] = []

    // Group laps by driver
    const lapsByDriver = new Map<number, RawOpenF1Lap[]>()
    for (const lap of laps) {
      if (!lapsByDriver.has(lap.driver_number)) {
        lapsByDriver.set(lap.driver_number, [])
      }
      lapsByDriver.get(lap.driver_number)!.push(lap)
    }

    for (const [driverNumber, dLaps] of lapsByDriver.entries()) {
      dLaps.sort((a, b) => a.lap_number - b.lap_number)
      const dStints = stints
        .filter((s) => s.driver_number === driverNumber)
        .sort((a, b) => a.stint_number - b.stint_number)

      for (const stint of dStints) {
        const stintLaps = dLaps.filter(
          (l) => l.lap_number >= stint.lap_start && l.lap_number <= stint.lap_end
        )

        // Find fastest clean lap in stint (excluding pit out lap)
        const cleanLaps = stintLaps.filter((l) => !l.is_pit_out_lap && l.lap_duration && l.lap_duration > 50 && l.lap_duration < 150)
        const bestStintLap = cleanLaps.reduce<number | null>((min, l) => {
          if (!l.lap_duration) return min
          return min === null || l.lap_duration < min ? l.lap_duration : min
        }, null)

        for (const lap of stintLaps) {
          const tyreAgeLaps = (lap.lap_number - stint.lap_start) + stint.tyre_age_at_start
          const isNewAtStart = stint.tyre_age_at_start === 0

          let deltaToStintBestSeconds: number | null = null
          let estimatedDegradationTrendSeconds: number | null = null

          if (lap.lap_duration && bestStintLap !== null && !lap.is_pit_out_lap) {
            deltaToStintBestSeconds = parseFloat((lap.lap_duration - bestStintLap).toFixed(3))

            // Fuel correction: car gets lighter by ~0.06s each lap
            const lapsIntoStint = lap.lap_number - stint.lap_start
            const fuelEffect = lapsIntoStint * 0.06
            estimatedDegradationTrendSeconds = parseFloat((deltaToStintBestSeconds + fuelEffect).toFixed(3))
          }

            states.push({
            driverNumber,
            lapNumber: lap.lap_number,
            compound: stint.compound,
            tyreAgeLaps,
            stintNumber: stint.stint_number,
            isNewAtStart,
            lapTimeSeconds: lap.lap_duration,
            deltaToStintBestSeconds,
            estimatedDegradationTrendSeconds,
            topSpeedKmh: (lap as any).speedSt || (lap as any).speedFl || (lap as any).st_speed || null,
            minCornerSpeedKmh: (lap as any).speedI1 || (lap as any).i1_speed || null,
          })
        }
      }
    }

    return states
  }

  static computeDriverRaceStats(
    laps: any[],
    results: any[],
    stints: any[],
    pitstops: any[],
    positionsByLap: any[]
  ): DriverRaceSummaryStats[] {
    const stats: DriverRaceSummaryStats[] = []
    const resultsMap = new Map<number, any>()
    for (const r of results) {
      resultsMap.set(r.driverNumber || (r.Driver && parseInt(r.Driver.permanentNumber, 10)), r)
    }

    // Group laps by driver
    const lapsByDriver = new Map<number, any[]>()
    for (const lap of laps) {
      const dNum = lap.driverNumber || lap.driver_number
      if (!lapsByDriver.has(dNum)) lapsByDriver.set(dNum, [])
      lapsByDriver.get(dNum)!.push(lap)
    }

    // Calculate laps led
    const lapsLedMap = new Map<number, number>()
    for (const posSnap of positionsByLap) {
      if (posSnap.positions && posSnap.positions[0]) {
        const leaderNum = posSnap.positions[0].driverNumber
        lapsLedMap.set(leaderNum, (lapsLedMap.get(leaderNum) || 0) + 1)
      }
    }

    for (const [driverNumber, dLaps] of lapsByDriver.entries()) {
      const r = resultsMap.get(driverNumber) || {}
      const grid = r.grid || 20
      const finish = r.position || 20
      const code = r.driverCode || r.Driver?.code || String(driverNumber)

      // Clean laps for average pace
      const cleanLaps = dLaps.filter(
        (l) => !l.isPitOutLap && !l.is_pit_out_lap && l.lapDuration > 50 && l.lapDuration < 150
      )
      const avgPace = cleanLaps.length > 0
        ? parseFloat((cleanLaps.reduce((acc, l) => acc + (l.lapDuration || l.lap_duration), 0) / cleanLaps.length).toFixed(3))
        : null

      // Fastest lap
      let fastestLapDuration: number | null = null
      let fastestLapTime = '--:--.---'
      for (const l of dLaps) {
        const dur = l.lapDuration || l.lap_duration
        if (dur && (fastestLapDuration === null || dur < fastestLapDuration)) {
          fastestLapDuration = dur
          fastestLapTime = l.lapTimeString || l.time || `${Math.floor(dur / 60)}:${(dur % 60).toFixed(3).padStart(6, '0')}`
        }
      }

      // Best sectors
      const s1List = dLaps.map((l) => l.sector1 || l.duration_sector_1).filter((s) => s && s > 0)
      const s2List = dLaps.map((l) => l.sector2 || l.duration_sector_2).filter((s) => s && s > 0)
      const s3List = dLaps.map((l) => l.sector3 || l.duration_sector_3).filter((s) => s && s > 0)

      const bestS1 = s1List.length > 0 ? Math.min(...s1List) : null
      const bestS2 = s2List.length > 0 ? Math.min(...s2List) : null
      const bestS3 = s3List.length > 0 ? Math.min(...s3List) : null

      const driverStints = stints.filter((s) => (s.driverNumber || s.driver_number) === driverNumber)
      const compounds = Array.from(new Set(driverStints.map((s) => s.compound)))
      const driverPits = pitstops.filter((p) => (p.driverNumber || p.driver_number) === driverNumber)

      stats.push({
        driverNumber,
        driverCode: code,
        grid,
        finish,
        positionsGained: grid - finish,
        fastestLapTime,
        fastestLapDuration,
        averagePaceSeconds: avgPace,
        bestSector1: bestS1,
        bestSector2: bestS2,
        bestSector3: bestS3,
        pitStopCount: driverPits.length,
        lapsLed: lapsLedMap.get(driverNumber) || 0,
        stintsCount: driverStints.length,
        compoundsUsed: compounds as string[],
      })
    }

    return stats.sort((a, b) => a.finish - b.finish)
  }
}
