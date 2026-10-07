import {
  RawOpenF1Lap,
  RawOpenF1Driver,
  RawOpenF1TeamRadio,
  RawOpenF1RaceControl,
  RawOpenF1Stint,
  RawOpenF1Pit,
} from './openf1'
import {
  TeamRadioClip,
  RaceControlMessage,
  LapPositionSnapshot,
  OvertakeEvent,
} from '../../src/types/data'

interface DriverLapTimeline {
  driverNumber: number
  driverCode: string
  laps: {
    lapNumber: number
    startMs: number
    endMs: number
  }[]
}

/**
 * Align telemetry events to lap numbers using precision ISO timestamps.
 * Adheres to SRP: exactly one responsibility of temporal mapping and lap alignment.
 */
export class TelemetryMapper {
  private driverTimelines = new Map<number, DriverLapTimeline>()
  private raceStartMs = Infinity
  private raceEndMs = 0

  constructor(laps: RawOpenF1Lap[], drivers: RawOpenF1Driver[]) {
    const driverCodeMap = new Map<number, string>()
    for (const d of drivers) {
      driverCodeMap.set(d.driver_number, d.name_acronym)
    }

    // Group laps by driver
    const lapsByDriver = new Map<number, RawOpenF1Lap[]>()
    for (const lap of laps) {
      if (!lapsByDriver.has(lap.driver_number)) {
        lapsByDriver.set(lap.driver_number, [])
      }
      lapsByDriver.get(lap.driver_number)!.push(lap)
    }

    // Build timeline for each driver
    for (const [driverNumber, dLaps] of lapsByDriver.entries()) {
      dLaps.sort((a, b) => a.lap_number - b.lap_number)
      const timeline: DriverLapTimeline = {
        driverNumber,
        driverCode: driverCodeMap.get(driverNumber) || String(driverNumber),
        laps: [],
      }

      for (let i = 0; i < dLaps.length; i++) {
        const lap = dLaps[i]
        const startMs = new Date(lap.date_start).getTime()
        let endMs = startMs + (lap.lap_duration ? lap.lap_duration * 1000 : 90000)

        // If next lap exists, use its start time as end time for zero-gap continuity
        if (i + 1 < dLaps.length) {
          const nextStartMs = new Date(dLaps[i + 1].date_start).getTime()
          if (nextStartMs > startMs) {
            endMs = nextStartMs
          }
        }

        if (startMs < this.raceStartMs) this.raceStartMs = startMs
        if (endMs > this.raceEndMs) this.raceEndMs = endMs

        timeline.laps.push({
          lapNumber: lap.lap_number,
          startMs,
          endMs,
        })
      }

      this.driverTimelines.set(driverNumber, timeline)
    }
  }

  /**
   * Finds the active lap for a given driver at a timestamp.
   */
  getLapForDriver(driverNumber: number, timestampIso: string): number | null {
    const tMs = new Date(timestampIso).getTime()
    const timeline = this.driverTimelines.get(driverNumber)

    if (timeline) {
      for (const lap of timeline.laps) {
        if (tMs >= lap.startMs && tMs <= lap.endMs) {
          return lap.lapNumber
        }
      }
    }

    // Fallback: estimate based on any active driver at that time
    return this.getGeneralLapAtTimestamp(tMs)
  }

  /**
   * Estimates general race lap at timestamp based on leader / majority drivers.
   */
  getGeneralLapAtTimestamp(timestampMs: number): number | null {
    if (timestampMs < this.raceStartMs || timestampMs > this.raceEndMs) {
      return null // Unmapped bucket
    }

    const candidateLaps: number[] = []
    for (const timeline of this.driverTimelines.values()) {
      for (const lap of timeline.laps) {
        if (timestampMs >= lap.startMs && timestampMs <= lap.endMs) {
          candidateLaps.push(lap.lapNumber)
          break
        }
      }
    }

    if (candidateLaps.length === 0) return null

    // Mode / median lap
    candidateLaps.sort((a, b) => a - b)
    return candidateLaps[Math.floor(candidateLaps.length / 2)]
  }

  /**
   * Maps team radio clips to laps.
   * If unmapped, assigns lapNumber: null (never dropped).
   */
  mapTeamRadio(
    radioList: RawOpenF1TeamRadio[],
    driverMap: Map<number, RawOpenF1Driver>
  ): TeamRadioClip[] {
    return radioList.map((clip, index) => {
      const driver = driverMap.get(clip.driver_number)
      const lapNumber = this.getLapForDriver(clip.driver_number, clip.date)

      return {
        id: `radio_${clip.session_key}_${clip.driver_number}_${index}`,
        timestamp: clip.date,
        driverNumber: clip.driver_number,
        driverCode: driver?.name_acronym || String(clip.driver_number),
        teamName: driver?.team_name || 'F1 Team',
        audioUrl: clip.recording_url,
        lapNumber,
      }
    })
  }

  /**
   * Maps race control messages to laps.
   * If unmapped, assigns lapNumber: null (never dropped).
   */
  mapRaceControl(messages: RawOpenF1RaceControl[]): RaceControlMessage[] {
    return messages.map((rc, index) => {
      let lapNumber = rc.lap_number || null
      if (lapNumber === null) {
        if (rc.driver_number) {
          lapNumber = this.getLapForDriver(rc.driver_number, rc.date)
        } else {
          lapNumber = this.getGeneralLapAtTimestamp(new Date(rc.date).getTime())
        }
      }

      let category: RaceControlMessage['category'] = 'Information'
      const msg = rc.message.toUpperCase()
      if (rc.flag) category = 'Flag'
      else if (msg.includes('VIRTUAL SAFETY CAR') || msg.includes('VSC')) category = 'VirtualSafetyCar'
      else if (msg.includes('SAFETY CAR')) category = 'SafetyCar'
      else if (msg.includes('INVESTIGATION')) category = 'Investigation'
      else if (msg.includes('PENALTY') || msg.includes('TIME PENALTY')) category = 'Penalty'

      return {
        id: `rc_${rc.session_key}_${index}`,
        timestamp: rc.date,
        category,
        flag: rc.flag as any,
        message: rc.message,
        driverNumber: rc.driver_number,
        lapNumber,
      }
    })
  }

  /**
   * Derives position and gap snapshots for every lap of the race.
   */
  static derivePositionsAndGaps(
    laps: RawOpenF1Lap[],
    drivers: RawOpenF1Driver[],
    stints: RawOpenF1Stint[],
    pitStops: RawOpenF1Pit[]
  ): { positionsByLap: LapPositionSnapshot[]; overtakes: OvertakeEvent[] } {
    const driverCodeMap = new Map<number, string>()
    for (const d of drivers) {
      driverCodeMap.set(d.driver_number, d.name_acronym)
    }

    // Determine max lap
    let maxLap = 0
    const lapsByDriver = new Map<number, Map<number, RawOpenF1Lap>>()
    for (const lap of laps) {
      if (lap.lap_number > maxLap) maxLap = lap.lap_number
      if (!lapsByDriver.has(lap.driver_number)) {
        lapsByDriver.set(lap.driver_number, new Map())
      }
      lapsByDriver.get(lap.driver_number)!.set(lap.lap_number, lap)
    }

    // Build cumulative elapsed time per driver up to each lap
    const cumulativeTime = new Map<number, number>()
    const positionsByLap: LapPositionSnapshot[] = []
    const overtakes: OvertakeEvent[] = []

    let previousOrder: number[] = []

    for (let lapNum = 1; lapNum <= maxLap; lapNum++) {
      const activeDrivers: { driverNumber: number; cumulative: number }[] = []

      for (const [driverNumber, lapMap] of lapsByDriver.entries()) {
        const lapData = lapMap.get(lapNum)
        const prev = cumulativeTime.get(driverNumber) || 0

        if (lapData && lapData.lap_duration) {
          const updated = prev + lapData.lap_duration
          cumulativeTime.set(driverNumber, updated)
          activeDrivers.push({ driverNumber, cumulative: updated })
        } else if (cumulativeTime.has(driverNumber)) {
          // If retired or unrecorded, maintain trailing order
          activeDrivers.push({ driverNumber, cumulative: prev + 999999 })
        }
      }

      // Sort by cumulative time ascending
      activeDrivers.sort((a, b) => a.cumulative - b.cumulative)
      const currentOrder = activeDrivers.map((d) => d.driverNumber)

      // Calculate gaps
      const leaderTime = activeDrivers[0]?.cumulative || 0
      const snapshot: LapPositionSnapshot = {
        lap: lapNum,
        positions: activeDrivers.map((d, idx) => {
          const prevDriverTime = idx > 0 ? activeDrivers[idx - 1].cumulative : d.cumulative
          const gapToLeader = idx === 0 ? 0 : parseFloat((d.cumulative - leaderTime).toFixed(3))
          const intervalToAhead = idx === 0 ? 0 : parseFloat((d.cumulative - prevDriverTime).toFixed(3))

          // Check stint info
          const currentStint = stints.find(
            (s) => s.driver_number === d.driverNumber && lapNum >= s.lap_start && lapNum <= s.lap_end
          )
          const compound = currentStint?.compound || 'UNKNOWN'
          const tyreAge = currentStint ? (lapNum - currentStint.lap_start) + currentStint.tyre_age_at_start : 0

          // Check pit stop on this lap
          const pitThisLap = pitStops.some(
            (p) => p.driver_number === d.driverNumber && p.lap_number === lapNum
          )

          return {
            driverNumber: d.driverNumber,
            driverCode: driverCodeMap.get(d.driverNumber) || String(d.driverNumber),
            position: idx + 1,
            gapToLeaderSeconds: gapToLeader > 9000 ? null : gapToLeader,
            intervalToAheadSeconds: intervalToAhead > 9000 ? null : intervalToAhead,
            compound,
            tyreAge,
            pitStopThisLap: pitThisLap,
          }
        }),
      }

      positionsByLap.push(snapshot)

      // Detect overtakes between lapNum-1 and lapNum
      if (previousOrder.length > 0) {
        for (let pos = 0; pos < currentOrder.length; pos++) {
          const dNum = currentOrder[pos]
          const oldPos = previousOrder.indexOf(dNum)
          if (oldPos > -1 && oldPos > pos) {
            // Driver gained positions
            const overtakenNum = previousOrder[pos]
            if (overtakenNum && overtakenNum !== dNum) {
              overtakes.push({
                lap: lapNum,
                overtakingDriverNumber: dNum,
                overtakenDriverNumber: overtakenNum,
                overtakingCode: driverCodeMap.get(dNum) || String(dNum),
                overtakenCode: driverCodeMap.get(overtakenNum) || String(overtakenNum),
                fromPosition: oldPos + 1,
                toPosition: pos + 1,
              })
            }
          }
        }
      }

      previousOrder = currentOrder
    }

    return { positionsByLap, overtakes }
  }
}
