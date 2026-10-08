import React, { useMemo } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import {
  Trophy,
  Zap,
  ArrowUp,
  ArrowDown,
  Minus,
  CloudSun,
  Wind,
  Droplets,
  Thermometer,
  Flag,
  AlertTriangle,
  Play,
} from 'lucide-react'
import { getTeamMeta } from '@/lib/teams'
import {
  DriverSessionInfo,
  LapData,
  WeatherSnapshot,
  RaceControlMessage,
  OvertakeEvent,
  DriverRaceSummaryStats,
  RaceResultEntry,
} from '@/types/data'

interface OverviewTabProps {
  results: RaceResultEntry[]
  drivers: DriverSessionInfo[]
  laps: LapData[]
  weather: WeatherSnapshot[]
  raceControl: RaceControlMessage[]
  overtakes: OvertakeEvent[]
  driverStats: DriverRaceSummaryStats[]
  isHistoricalArchive?: boolean
  onOpenReplay?: () => void
}

function formatRaceTime(time: string | undefined | null, status: string | undefined, isWinner: boolean): string {
  if (!time && !status) return '—'
  if (isWinner) {
    if (time && time !== 'Finished') {
      return time.replace(/^0 days /, '').replace(/\.0+$/, '').slice(0, 12)
    }
    return 'Winner'
  }
  if (time) {
    if (time.startsWith('+')) return `${time}s`
    if (time.startsWith('0 days 00:00:')) {
      const sec = time.replace('0 days 00:00:', '').slice(0, 6)
      return `+${sec}s`
    }
    if (time.startsWith('0 days ')) {
      const rest = time.replace('0 days ', '').slice(0, 10)
      return `+${rest}`
    }
    if (time !== 'Finished' && time !== 'Not classified') {
      return time
    }
  }
  if (status && status !== 'Finished') {
    return status
  }
  return time || status || 'Finished'
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  results,
  drivers,
  laps,
  weather,
  raceControl,
  overtakes,
  driverStats,
  isHistoricalArchive = false,
  onOpenReplay,
}) => {
  const shouldReduceMotion = useReducedMotion()

  // Drivers lookup map by number
  const driverMap = useMemo(() => {
    const map = new Map<number, DriverSessionInfo>()
    drivers.forEach((d) => map.set(d.driverNumber, d))
    return map
  }, [drivers])

  // Driver stats lookup map by number
  const statsMap = useMemo(() => {
    const map = new Map<number, DriverRaceSummaryStats>()
    driverStats.forEach((s) => map.set(s.driverNumber, s))
    return map
  }, [driverStats])

  // Top 3 Podium Drivers
  const podium = useMemo(() => {
    if (!results || results.length < 3) return []
    return [results[1], results[0], results[2]].filter(Boolean) // Order: P2, P1, P3
  }, [results])

  // Fastest Lap of the race
  const fastestLap = useMemo(() => {
    const lap = laps.find((l) => l.isFastestLap)
    if (!lap) return null
    const driver = driverMap.get(lap.driverNumber)
    return {
      lapNumber: lap.lapNumber,
      time: lap.lapTimeString,
      driverName: driver?.fullName || `Driver #${lap.driverNumber}`,
      driverCode: driver?.nameAcronym || String(lap.driverNumber),
      teamName: driver?.teamName || '',
      teamColour: driver?.teamColour || '#E10600',
    }
  }, [laps, driverMap])

  // Average weather conditions across the race
  const weatherSummary = useMemo(() => {
    if (!weather || weather.length === 0) return null
    const len = weather.length
    const avgAir = Math.round(weather.reduce((acc, w) => acc + w.airTemp, 0) / len)
    const avgTrack = Math.round(weather.reduce((acc, w) => acc + w.trackTemp, 0) / len)
    const avgHumidity = Math.round(weather.reduce((acc, w) => acc + w.humidity, 0) / len)
    const avgWind = (weather.reduce((acc, w) => acc + w.windSpeed, 0) / len).toFixed(1)
    const hasRain = weather.some((w) => w.rainfall)

    return { avgAir, avgTrack, avgHumidity, avgWind, hasRain }
  }, [weather])

  // Curated Key Moments (safety cars, red flags, VSC, top overtakes)
  const keyMoments = useMemo(() => {
    const moments: {
      id: string
      lap: number | null
      category: 'safety-car' | 'flag' | 'overtake' | 'incident'
      title: string
      description: string
      timeIso?: string
    }[] = []

    // 1. Race control significant alerts
    raceControl.forEach((rc) => {
      const msg = rc.message.toUpperCase()
      if (
        rc.category === 'SafetyCar' ||
        rc.category === 'VirtualSafetyCar' ||
        msg.includes('SAFETY CAR') ||
        msg.includes('VSC') ||
        msg.includes('RED FLAG')
      ) {
        moments.push({
          id: rc.id,
          lap: rc.lapNumber,
          category: msg.includes('SAFETY CAR') || rc.category === 'SafetyCar' ? 'safety-car' : 'flag',
          title: rc.category === 'SafetyCar' ? 'SAFETY CAR DEPLOYED' : 'RACE CONTROL NOTICE',
          description: rc.message,
          timeIso: rc.timestamp,
        })
      }
    })

    // 2. High position overtakes (Lead changes or top 5 battle)
    overtakes
      .filter((o) => o.toPosition <= 3)
      .slice(0, 4)
      .forEach((o, idx) => {
        moments.push({
          id: `lead_ot_${idx}`,
          lap: o.lap,
          category: 'overtake',
          title: `LEAD BATTLE: P${o.toPosition} OVERTAKE`,
          description: `${o.overtakingCode} passed ${o.overtakenCode} for position P${o.toPosition}`,
        })
      })

    // Sort by lap
    return moments.sort((a, b) => (a.lap || 0) - (b.lap || 0)).slice(0, 8)
  }, [raceControl, overtakes])

  return (
    <div className="space-y-8">
      {/* 2D Race Replay Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-[var(--surface-1)] to-[var(--surface-2)] p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
              INTERACTIVE 2D REPLAY ENGINE
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-black uppercase text-[var(--text)] tracking-tight">
            Watch Full Race 2D Telemetry &amp; Replay
          </h2>
          <p className="text-xs font-mono text-[var(--text-muted)] max-w-xl">
            Experience the entire Grand Prix with 20 animated cars, live sector timing, leaderboards, track status, weather metrics, and driver throttle/brake pedal telemetry.
          </p>
        </div>
        {onOpenReplay && (
          <button
            onClick={onOpenReplay}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent)] hover:opacity-90 text-white font-mono font-bold text-xs uppercase shadow-lg shadow-[var(--accent)]/20 transition-all shrink-0 z-10 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Launch 2D Replay 🏁</span>
          </button>
        )}
      </div>

      {/* 1. Podium Section */}
      {podium.length === 3 && (
        <div className="f1-card-accent p-6 sm:p-8 rounded-2xl border border-[var(--border)] bg-[var(--surface-1)]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h2 className="text-base sm:text-lg font-display font-black uppercase tracking-tight text-[var(--text)]">
                Grand Prix Podium
              </h2>
            </div>
            <span className="text-xs font-mono text-[var(--text-muted)]">OFFICIAL TOP 3 CLASSIFICATION</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">
            {podium.map((res, idx) => {
              const pos = idx === 1 ? 1 : idx === 0 ? 2 : 3
              const driver = driverMap.get(res.driverNumber)
              const team = getTeamMeta(res.teamName)
              const isWinner = pos === 1

              return (
                <motion.div
                  key={res.driverNumber}
                  initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                  className={`flex flex-col items-center text-center p-6 rounded-2xl border relative overflow-hidden transition-all ${
                    isWinner
                      ? 'border-amber-400/50 bg-gradient-to-b from-amber-500/10 via-[var(--surface-2)] to-[var(--surface-1)] md:order-2 md:-translate-y-4 shadow-lg'
                      : pos === 2
                      ? 'border-[var(--border)] bg-[var(--surface-2)] md:order-1'
                      : 'border-[var(--border)] bg-[var(--surface-2)] md:order-3'
                  }`}
                >
                  {/* Top Team Color Stripe */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1"
                    style={{ backgroundColor: team.color }}
                  />

                  {/* Position Pill */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-display font-black text-sm mb-4 shadow-xs ${
                      isWinner
                        ? 'bg-amber-400 text-black shadow-amber-400/30'
                        : pos === 2
                        ? 'bg-zinc-300 text-black'
                        : 'bg-amber-700 text-white'
                    }`}
                  >
                    P{pos}
                  </div>

                  {/* Driver Headshot */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-[var(--surface-3)] border-2 border-[var(--border)] relative mb-3 shadow-inner">
                    {driver?.headshotUrl ? (
                      <img
                        src={driver.headshotUrl}
                        alt={driver.fullName}
                        className="w-full h-full object-cover object-top"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl font-mono font-bold text-[var(--text-muted)]">
                        {res.driverCode}
                      </div>
                    )}
                  </div>

                  {/* Driver Info */}
                  <h3 className="font-display font-black text-lg text-[var(--text)] uppercase tracking-tight">
                    {driver?.fullName || res.driverCode}
                  </h3>
                  <div className="text-xs font-mono text-[var(--text-muted)] mt-0.5 flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ backgroundColor: team.color }}
                    />
                    <span>{res.teamName}</span>
                  </div>

                  {/* Points & Time Delta */}
                  <div className="mt-4 pt-3 border-t border-[var(--border)] w-full flex items-center justify-between text-xs font-mono">
                    <span className="text-[var(--text-muted)]">
                      {isWinner ? 'WINNER TIME' : 'INTERVAL'}
                    </span>
                    <span className="font-bold text-[var(--text)]">
                      {formatRaceTime(res.time, res.status, isWinner)}
                    </span>
                  </div>

                  <div className="w-full flex items-center justify-between text-xs font-mono mt-1">
                    <span className="text-[var(--text-muted)]">CHAMPIONSHIP</span>
                    <span className="font-bold text-amber-400">+{res.points} PTS</span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Historical Era Classification Notice */}
      {(isHistoricalArchive || (!fastestLap && !weatherSummary && keyMoments.length === 0)) && (
        <div className="p-5 sm:p-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-400">
                Official Historical Grand Prix Archive
              </span>
              <span className="text-[10px] font-mono text-[var(--text-muted)] bg-[var(--surface-2)] px-2 py-0.5 rounded">
                JOLPICA / ERGAST ARCHIVE
              </span>
            </div>
            <p className="text-xs font-sans text-[var(--text-muted)] leading-relaxed">
              Official FIA World Championship finishing classification, grid positions, and championship points are preserved from historical archives. High-frequency track weather sensors, micro-telemetry transponders, and live race control message feeds were introduced in modern Formula 1 eras.
            </p>
          </div>
        </div>
      )}

      {/* 2. Highlights Strip: Fastest Lap + Weather Telemetry */}
      {(fastestLap || weatherSummary) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Fastest Lap Award */}
        {fastestLap && (
          <div className="md:col-span-2 f1-card-accent p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-purple-400">
                  DHL OFFICIAL FASTEST LAP
                </span>
              </div>
              <span className="text-xs font-mono text-[var(--text-muted)]">
                LAP {fastestLap.lapNumber}
              </span>
            </div>

            <div className="my-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
              <div>
                <div className="text-3xl sm:text-4xl font-mono font-bold tracking-tight text-[var(--text)]">
                  {fastestLap.time}
                </div>
                <div className="text-xs font-mono text-[var(--text-muted)] mt-1 flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: fastestLap.teamColour }}
                  />
                  <span className="font-bold text-[var(--text)]">{fastestLap.driverName}</span>
                  <span>({fastestLap.teamName})</span>
                </div>
              </div>

              <div className="text-left sm:text-right font-mono text-xs text-[var(--text-muted)]">
                <div className="text-emerald-400 font-bold">+1 BONUS POINT</div>
                <div>Purple Sector Benchmark</div>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border)] text-[11px] font-mono text-[var(--text-muted)] flex items-center justify-between">
              <span>Fastest race speed delta recorded</span>
              <span>FastF1 GPS Timing</span>
            </div>
          </div>
        )}

        {/* Ambient Track Weather */}
        {weatherSummary && (
          <div className="f1-card-accent p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CloudSun className="w-4 h-4 text-sky-400" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                  Race Weather
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400">DRY RACE</span>
            </div>

            <div className="grid grid-cols-2 gap-3 py-2">
              <div className="bg-[var(--surface-2)] p-2.5 rounded-xl border border-[var(--border)]">
                <div className="text-[10px] font-mono uppercase text-[var(--text-muted)] flex items-center gap-1">
                  <Thermometer className="w-3 h-3 text-red-400" /> Track Temp
                </div>
                <div className="text-lg font-mono font-bold text-[var(--text)] mt-0.5">
                  {weatherSummary.avgTrack}°C
                </div>
              </div>

              <div className="bg-[var(--surface-2)] p-2.5 rounded-xl border border-[var(--border)]">
                <div className="text-[10px] font-mono uppercase text-[var(--text-muted)] flex items-center gap-1">
                  <CloudSun className="w-3 h-3 text-sky-400" /> Air Temp
                </div>
                <div className="text-lg font-mono font-bold text-[var(--text)] mt-0.5">
                  {weatherSummary.avgAir}°C
                </div>
              </div>

              <div className="bg-[var(--surface-2)] p-2.5 rounded-xl border border-[var(--border)]">
                <div className="text-[10px] font-mono uppercase text-[var(--text-muted)] flex items-center gap-1">
                  <Wind className="w-3 h-3 text-teal-400" /> Wind Speed
                </div>
                <div className="text-lg font-mono font-bold text-[var(--text)] mt-0.5">
                  {weatherSummary.avgWind} m/s
                </div>
              </div>

              <div className="bg-[var(--surface-2)] p-2.5 rounded-xl border border-[var(--border)]">
                <div className="text-[10px] font-mono uppercase text-[var(--text-muted)] flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-blue-400" /> Humidity
                </div>
                <div className="text-lg font-mono font-bold text-[var(--text)] mt-0.5">
                  {weatherSummary.avgHumidity}%
                </div>
              </div>
            </div>

            <div className="pt-2 text-[10px] font-mono text-[var(--text-muted)] text-center">
              Averaged from 150+ telemetry weather frames
            </div>
          </div>
        )}
      </div>
      )}

      {/* 3. Key Moments Timeline */}
      {keyMoments.length > 0 && (
        <div className="f1-card-accent p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-1)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h2 className="text-base font-display font-black uppercase tracking-tight text-[var(--text)]">
                Key Race Moments
              </h2>
            </div>
            <span className="text-xs font-mono text-[var(--text-muted)]">RACE CONTROL & HIGHLIGHTS</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {keyMoments.map((m) => (
              <div
                key={m.id}
                className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1.5 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="px-2 py-0.5 rounded bg-[var(--surface-3)] font-bold text-[var(--text)]">
                    {m.lap ? `LAP ${m.lap}` : 'PRE-RACE'}
                  </span>
                  {m.category === 'safety-car' ? (
                    <span className="text-amber-400 text-[10px] font-bold uppercase flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> SC
                    </span>
                  ) : m.category === 'overtake' ? (
                    <span className="text-sky-400 text-[10px] font-bold uppercase flex items-center gap-1">
                      <Zap className="w-3 h-3" /> PASS
                    </span>
                  ) : (
                    <span className="text-purple-400 text-[10px] font-bold uppercase flex items-center gap-1">
                      <Flag className="w-3 h-3" /> FLAG
                    </span>
                  )}
                </div>

                <div className="font-display font-bold text-xs text-[var(--text)] uppercase line-clamp-1">
                  {m.title}
                </div>
                <div className="text-[11px] font-sans text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                  {m.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Complete Official Classification Table */}
      <div className="f1-card-accent rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] overflow-hidden">
        <div className="p-6 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-display font-black uppercase tracking-tight text-[var(--text)]">
              Official Classification
            </h2>
            <p className="text-xs font-mono text-[var(--text-muted)] mt-0.5">
              Full 20-car race classification, grid deltas, pit counts, and championship points
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] bg-[var(--surface-2)]/50">
                <th className="py-3 px-4 font-bold">Pos</th>
                <th className="py-3 px-2 font-bold text-center">Gain</th>
                <th className="py-3 px-4 font-bold">Driver</th>
                <th className="py-3 px-4 font-bold">Constructor</th>
                <th className="py-3 px-3 font-bold text-right">Laps</th>
                <th className="py-3 px-4 font-bold text-right">Time / Gap</th>
                <th className="py-3 px-3 font-bold text-right">Fastest Lap</th>
                <th className="py-3 px-3 font-bold text-center">Pits</th>
                <th className="py-3 px-4 font-bold text-right">Pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]/60 text-xs font-mono">
              {results.map((r, i) => {
                const driver = driverMap.get(r.driverNumber)
                const team = getTeamMeta(r.teamName)
                const stats = statsMap.get(r.driverNumber)
                const grid = r.grid || i + 1
                const finish = r.position || i + 1
                const delta = grid - finish

                return (
                  <tr
                    key={r.driverNumber}
                    className="hover:bg-[var(--surface-2)]/60 transition-colors"
                  >
                    {/* Position */}
                    <td className="py-3 px-4 font-bold text-[var(--text)] whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded flex items-center justify-center text-xs font-display font-black ${
                            finish === 1
                              ? 'bg-amber-400 text-black'
                              : finish === 2
                              ? 'bg-zinc-300 text-black'
                              : finish === 3
                              ? 'bg-amber-700 text-white'
                              : 'bg-[var(--surface-2)] text-[var(--text)]'
                          }`}
                        >
                          {finish}
                        </span>
                      </div>
                    </td>

                    {/* Grid Gain / Loss */}
                    <td className="py-3 px-2 text-center whitespace-nowrap">
                      {delta > 0 ? (
                        <span className="inline-flex items-center text-emerald-400 font-bold text-[11px]">
                          <ArrowUp className="w-3 h-3 mr-0.5" />+{delta}
                        </span>
                      ) : delta < 0 ? (
                        <span className="inline-flex items-center text-rose-400 font-bold text-[11px]">
                          <ArrowDown className="w-3 h-3 mr-0.5" />
                          {delta}
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[var(--text-muted)] text-[11px]">
                          <Minus className="w-3 h-3 mr-0.5" />0
                        </span>
                      )}
                    </td>

                    {/* Driver */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-1 h-5 rounded-full shrink-0"
                          style={{ backgroundColor: team.color }}
                        />
                        <div className="flex flex-col">
                          <span className="font-bold text-[var(--text)] text-sm">
                            {driver?.fullName || r.driverCode}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)]">
                            #{r.driverNumber} • {r.driverCode}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Constructor */}
                    <td className="py-3 px-4 text-[var(--text-muted)] whitespace-nowrap">
                      {r.teamName}
                    </td>

                    {/* Laps Completed */}
                    <td className="py-3 px-3 text-right text-[var(--text)] whitespace-nowrap font-bold">
                      {r.laps}
                    </td>

                    {/* Time / Gap / Status */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {r.status === 'Finished' ? (
                        <span className="text-[var(--text)] font-semibold">
                          {formatRaceTime(r.time, r.status, finish === 1)}
                        </span>
                      ) : (
                        <span className="text-rose-400 font-bold uppercase">{r.status || 'Not classified'}</span>
                      )}
                    </td>

                    {/* Fastest Lap */}
                    <td className="py-3 px-3 text-right text-[var(--text-muted)] whitespace-nowrap">
                      {stats?.fastestLapTime || '—'}
                    </td>

                    {/* Pit Stop Count */}
                    <td className="py-3 px-3 text-center whitespace-nowrap text-[var(--text-muted)]">
                      {stats?.pitStopCount !== undefined && stats.pitStopCount > 0 ? stats.pitStopCount : '—'}
                    </td>

                    {/* Points */}
                    <td className="py-3 px-4 text-right font-bold text-amber-400 whitespace-nowrap">
                      {r.points > 0 ? `+${r.points}` : '0'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
