import {
  LapPositionSnapshot,
  OvertakeEvent,
  RaceControlMessage,
  LapFeedEntry,
  LapFeedEvent,
} from '../../src/types/data'
import { RawOpenF1Pit, RawOpenF1Stint, RawOpenF1Lap } from './openf1'

/**
 * Deterministic, template-based commentary feed generator.
 * Adheres to SRP & Truthfulness:
 * - Generates entries strictly from real timing, overtake, stint, pit, and race control events.
 * - Varied deterministic templates without fabricating causes.
 * - Guarantees every single lap has a summary entry.
 */
export class CommentaryGenerator {
  static generateLapFeed(
    positionsByLap: LapPositionSnapshot[],
    overtakes: OvertakeEvent[],
    pitStops: RawOpenF1Pit[],
    stints: RawOpenF1Stint[],
    raceControlMessages: RaceControlMessage[],
    laps: RawOpenF1Lap[]
  ): LapFeedEntry[] {
    const feed: LapFeedEntry[] = []

    // Index overtakes by lap
    const overtakesByLap = new Map<number, OvertakeEvent[]>()
    for (const ot of overtakes) {
      if (!overtakesByLap.has(ot.lap)) overtakesByLap.set(ot.lap, [])
      overtakesByLap.get(ot.lap)!.push(ot)
    }

    // Index pit stops by lap
    const pitsByLap = new Map<number, RawOpenF1Pit[]>()
    for (const pit of pitStops) {
      if (!pitsByLap.has(pit.lap_number)) pitsByLap.set(pit.lap_number, [])
      pitsByLap.get(pit.lap_number)!.push(pit)
    }

    // Index race control by lap
    const rcByLap = new Map<number, RaceControlMessage[]>()
    for (const rc of raceControlMessages) {
      if (rc.lapNumber !== null) {
        if (!rcByLap.has(rc.lapNumber)) rcByLap.set(rc.lapNumber, [])
        rcByLap.get(rc.lapNumber)!.push(rc)
      }
    }

    // Track fastest lap progression
    let overallFastestLapTime = Infinity
    let overallFastestDriver = ''

    for (const lapSnapshot of positionsByLap) {
      const lapNum = lapSnapshot.lap
      const events: LapFeedEvent[] = []

      const leader = lapSnapshot.positions[0]
      const second = lapSnapshot.positions[1]
      const leaderCode = leader ? leader.driverCode : 'LEAD'
      const gapToSecond = second && second.gapToLeaderSeconds !== null
        ? `+${second.gapToLeaderSeconds.toFixed(3)}s`
        : '0.000s'

      // 1. Race Control events on this lap
      const rcItems = rcByLap.get(lapNum) || []
      for (const rc of rcItems) {
        let type: LapFeedEvent['type'] = 'FLAG'
        let importance: LapFeedEvent['importance'] = 'medium'

        if (rc.category === 'SafetyCar') {
          type = 'SAFETY_CAR'
          importance = 'high'
        } else if (rc.category === 'VirtualSafetyCar') {
          type = 'VSC'
          importance = 'high'
        } else if (rc.category === 'Penalty') {
          type = 'PENALTY'
          importance = 'high'
        } else if (rc.flag === 'RED') {
          type = 'FLAG'
          importance = 'high'
        }

        events.push({
          type,
          description: rc.message,
          driverNumber: rc.driverNumber || undefined,
          importance,
        })
      }

      // 2. Pit stops on this lap
      const lapPits = pitsByLap.get(lapNum) || []
      for (const p of lapPits) {
        const driverPos = lapSnapshot.positions.find((d) => d.driverNumber === p.driver_number)
        const driverCode = driverPos ? driverPos.driverCode : `#${p.driver_number}`
        const stintInfo = stints.find(
          (s) => s.driver_number === p.driver_number && lapNum >= s.lap_start && lapNum <= s.lap_end
        )
        const newCompound = stintInfo ? stintInfo.compound : 'Fresh tyres'
        const durationStr = p.pit_duration ? `in ${p.pit_duration.toFixed(1)}s` : ''

        events.push({
          type: 'PIT_STOP',
          description: `${driverCode} boxes for pit stop (${newCompound}) ${durationStr}`.trim(),
          driverNumber: p.driver_number,
          importance: 'medium',
        })
      }

      // 3. Overtakes on this lap
      const lapOvertakes = overtakesByLap.get(lapNum) || []
      for (const ot of lapOvertakes.slice(0, 4)) {
        events.push({
          type: 'OVERTAKE',
          description: `${ot.overtakingCode} overtakes ${ot.overtakenCode} for P${ot.toPosition}`,
          driverNumber: ot.overtakingDriverNumber,
          importance: ot.toPosition <= 3 ? 'high' : 'medium',
        })
      }

      // 4. Check fastest laps on this lap
      for (const pos of lapSnapshot.positions) {
        const dLap = laps.find((l) => l.driver_number === pos.driverNumber && l.lap_number === lapNum)
        if (dLap && dLap.lap_duration && dLap.lap_duration < overallFastestLapTime) {
          overallFastestLapTime = dLap.lap_duration
          overallFastestDriver = pos.driverCode
          events.push({
            type: 'FASTEST_LAP',
            description: `Fastest lap of the race set by ${pos.driverCode} (${dLap.lap_duration.toFixed(3)}s)`,
            driverNumber: pos.driverNumber,
            importance: 'high',
          })
        }
      }

      // 5. Synthesize Headline and Summary
      let headline = `Lap ${lapNum}`
      let summary = ''

      if (events.some((e) => e.type === 'SAFETY_CAR')) {
        headline = `Lap ${lapNum}: Safety Car Deployed`
        summary = `The Safety Car is out on track as the field neutralizes. ${leaderCode} leads with the pack compressed.`
      } else if (events.some((e) => e.type === 'VSC')) {
        headline = `Lap ${lapNum}: Virtual Safety Car Period`
        summary = `Virtual Safety Car active across all sectors. Drivers managing delta times.`
      } else if (events.some((e) => e.type === 'OVERTAKE' && e.importance === 'high')) {
        const topOt = events.find((e) => e.type === 'OVERTAKE' && e.importance === 'high')!
        headline = `Lap ${lapNum}: ${topOt.description}`
        summary = `${topOt.description}. ${leaderCode} controls the race with a ${gapToSecond} advantage.`
      } else if (lapPits.length > 0) {
        headline = `Lap ${lapNum}: Pit Lane Activity (${lapPits.length} Stops)`
        summary = `${lapPits.length} driver(s) dive into the pits. ${leaderCode} stays out in P1 (${gapToSecond} gap).`
      } else if (lapNum === 1) {
        headline = `Lap 1: Grand Prix Race Start`
        summary = `Lights out and away we go! ${leaderCode} leads into the opening complex with clean starts across the grid.`
      } else {
        // Varied deterministic wording templates based on gap
        const secondCode = second ? second.driverCode : 'P2'
        const gapNum = second?.gapToLeaderSeconds || 0

        if (gapNum < 1.0) {
          summary = `${leaderCode} under intense pressure from ${secondCode} within DRS range (${gapToSecond}).`
        } else if (gapNum < 3.0) {
          summary = `${leaderCode} maintains a steady ${gapToSecond} cushion ahead of chasing ${secondCode}.`
        } else {
          summary = `${leaderCode} commanding the Grand Prix with a comfortable ${gapToSecond} lead over ${secondCode}.`
        }
        headline = `Lap ${lapNum}: ${leaderCode} leads by ${gapToSecond}`
      }

      feed.push({
        lap: lapNum,
        headline,
        summary,
        leaderCode,
        gapToSecond,
        events,
      })
    }

    return feed
  }

  /**
   * Stage 2 LLM Commentary Enrichment (Optional Free Tier)
   * Strictly adheres to user constraints:
   * - Uses ONLY supplied timing facts; no invented causes or quotes.
   * - Gracefully falls back to deterministic template text if key is absent or quota runs out.
   */
  static async enrichWithGemini(
    feed: LapFeedEntry[],
    apiKey?: string
  ): Promise<LapFeedEntry[]> {
    if (!apiKey) {
      return feed
    }

    try {
      const { GoogleGenAI } = await import('@google/genai')
      const ai = new GoogleGenAI({ apiKey })

      const enrichedFeed: LapFeedEntry[] = [...feed]
      const chunkSize = 15

      for (let i = 0; i < feed.length; i += chunkSize) {
        const chunk = feed.slice(i, i + chunkSize)
        const prompt = `You are a Formula 1 timing commentary writer.
CRITICAL RULES:
- Use ONLY the supplied facts from the input JSON.
- Never invent causes (do NOT invent mechanical issues, driver mistakes, or strategies unless stated).
- Never invent quotes, driver thoughts, or names not present in the facts.
- Produce natural, punchy broadcast commentary (1-2 sentences per lap).
- Output a valid JSON array of objects with keys: "lap" (number), "headline" (string), "summary" (string).

Input facts:
${JSON.stringify(
  chunk.map((c) => ({
    lap: c.lap,
    leader: c.leaderCode,
    gapToSecond: c.gapToSecond,
    events: c.events.map((e) => e.description),
  }))
)}`

        try {
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
            },
          })

          const text = response.text?.trim()
          if (text) {
            const rewritten = JSON.parse(text)
            if (Array.isArray(rewritten)) {
              for (const item of rewritten) {
                const target = enrichedFeed.find((f) => f.lap === item.lap)
                if (target) {
                  if (item.headline) target.headline = item.headline
                  if (item.summary) target.summary = item.summary
                }
              }
            }
          }
        } catch (chunkErr: any) {
          console.warn(`[CommentaryGen] Gemini API chunk ${i + 1}-${i + chunk.length} fallback to templates:`, chunkErr.message)
          break
        }
      }

      return enrichedFeed
    } catch (err: any) {
      console.warn('[CommentaryGen] Gemini enrichment bypassed:', err.message)
      return feed
    }
  }
}
