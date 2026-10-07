import React, { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  FastForward,
  Radio,
  Flag,
  Flame,
  Volume2,
  AlertTriangle,
  Wrench,
  ChevronRight,
  Wind,
  Thermometer,
  ShieldAlert,
  Sliders,
  Filter,
} from 'lucide-react'
import { getTeamMeta } from '@/lib/teams'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  LapPositionSnapshot,
  LapFeedEntry,
  TeamRadioClip,
  RaceControlMessage,
  WeatherSnapshot,
  DriverSessionInfo,
  LapData,
  PitStopData,
} from '@/types/data'

interface LapExplorerProps {
  positionsByLap: LapPositionSnapshot[]
  lapFeed: LapFeedEntry[]
  radioClips: TeamRadioClip[]
  raceControl: RaceControlMessage[]
  weather: WeatherSnapshot[]
  drivers: DriverSessionInfo[]
  laps: LapData[]
  pitstops: PitStopData[]
}

export const LapExplorer: React.FC<LapExplorerProps> = ({
  positionsByLap,
  lapFeed,
  radioClips,
  raceControl,
  weather,
  drivers,
  laps,
  pitstops,
}) => {
  const [currentLap, setCurrentLap] = useState<number>(1)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1) // 1x, 2x, 5x
  const [radioFilterDriver, setRadioFilterDriver] = useState<string>('all')

  const shouldReduceMotion = useReducedMotion()
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const totalLaps = useMemo(() => {
    if (!positionsByLap || positionsByLap.length === 0) return 57
    return Math.max(...positionsByLap.map((p) => p.lap))
  }, [positionsByLap])

  // Driver lookup map
  const driverMap = useMemo(() => {
    const map = new Map<number, DriverSessionInfo>()
    drivers.forEach((d) => map.set(d.driverNumber, d))
    return map
  }, [drivers])

  // Key Lap Jump Targets:
  // 1. Fastest Lap lap number
  const fastestLapNumber = useMemo(() => {
    const fl = laps.find((l) => l.isFastestLap)
    return fl?.lapNumber || null
  }, [laps])

  // 2. Safety car laps
  const safetyCarLaps = useMemo(() => {
    const s = new Set<number>()
    raceControl.forEach((rc) => {
      if (
        rc.lapNumber &&
        (rc.category === 'SafetyCar' ||
          rc.category === 'VirtualSafetyCar' ||
          rc.message.includes('SAFETY CAR'))
      ) {
        s.add(rc.lapNumber)
      }
    })
    return Array.from(s).sort((a, b) => a - b)
  }, [raceControl])

  // 3. Pit stop laps
  const pitStopLaps = useMemo(() => {
    const s = new Set<number>()
    pitstops.forEach((p) => s.add(p.lapNumber))
    return Array.from(s).sort((a, b) => a - b)
  }, [pitstops])

  // Playback loop
  useEffect(() => {
    if (isPlaying) {
      const intervalMs = Math.round(1400 / playbackSpeed)
      timerRef.current = setInterval(() => {
        setCurrentLap((prev) => {
          if (prev >= totalLaps) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, intervalMs)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPlaying, playbackSpeed, totalLaps])

  // Keyboard navigation: Left/Right arrows, Space to play/pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setCurrentLap((prev) => Math.max(1, prev - 1))
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        setCurrentLap((prev) => Math.min(totalLaps, prev + 1))
      } else if (e.key === ' ') {
        e.preventDefault()
        setIsPlaying((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [totalLaps])

  // Current lap data slice
  const currentSnapshot = useMemo(() => {
    return (
      positionsByLap.find((p) => p.lap === currentLap) ||
      positionsByLap[0] || { lap: currentLap, positions: [] }
    )
  }, [positionsByLap, currentLap])

  const currentCommentary = useMemo(() => {
    return lapFeed.find((f) => f.lap === currentLap) || null
  }, [lapFeed, currentLap])

  const currentRadio = useMemo(() => {
    const clips = radioClips.filter((r) => r.lapNumber === currentLap)
    if (radioFilterDriver === 'all') return clips
    return clips.filter((r) => r.driverCode.toLowerCase() === radioFilterDriver.toLowerCase())
  }, [radioClips, currentLap, radioFilterDriver])

  const currentRaceControl = useMemo(() => {
    return raceControl.filter((rc) => rc.lapNumber === currentLap)
  }, [raceControl, currentLap])

  const currentWeather = useMemo(() => {
    if (!weather || weather.length === 0) return null
    // Approximate index based on lap percentage
    const index = Math.min(
      weather.length - 1,
      Math.floor(((currentLap - 1) / totalLaps) * weather.length)
    )
    return weather[index]
  }, [weather, currentLap, totalLaps])

  // Jump helper
  const jumpToLap = (targetLap: number) => {
    setCurrentLap(Math.min(totalLaps, Math.max(1, targetLap)))
  }

  return (
    <div className="space-y-6">
      {/* 1. Scrubber Control Deck */}
      <div className="sticky top-16 z-30 f1-card-accent p-4 sm:p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-1)]/95 backdrop-blur-md shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Lap Counter & Title */}
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                LAP
              </span>
              <span className="font-display font-black text-2xl text-[var(--accent)] tracking-tight">
                {String(currentLap).padStart(2, '0')}
              </span>
              <span className="text-xs font-mono text-[var(--text-muted)]">/ {totalLaps}</span>
            </div>

            {currentCommentary?.leaderCode && (
              <div className="text-xs font-mono hidden md:flex items-center gap-2">
                <span className="text-[var(--text-muted)]">LEADER:</span>
                <span className="font-bold text-[var(--text)]">{currentCommentary.leaderCode}</span>
                <span className="text-[var(--text-muted)]">
                  (+{currentCommentary.gapToSecond})
                </span>
              </div>
            )}
          </div>

          {/* Jump To Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
            <span className="text-[10px] text-[var(--text-muted)] uppercase mr-1">JUMP:</span>

            {fastestLapNumber && (
              <button
                onClick={() => jumpToLap(fastestLapNumber)}
                className="px-2 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30 hover:bg-purple-500/20 transition-colors flex items-center gap-1 shrink-0"
              >
                <Flame className="w-3 h-3" />
                <span>Fastest Lap (L{fastestLapNumber})</span>
              </button>
            )}

            {safetyCarLaps.length > 0 && (
              <button
                onClick={() => jumpToLap(safetyCarLaps[0])}
                className="px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-colors flex items-center gap-1 shrink-0"
              >
                <ShieldAlert className="w-3 h-3" />
                <span>Safety Car (L{safetyCarLaps[0]})</span>
              </button>
            )}

            {pitStopLaps.length > 0 && (
              <button
                onClick={() => jumpToLap(pitStopLaps[0])}
                className="px-2 py-1 rounded-lg bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--surface-3)] transition-colors flex items-center gap-1 shrink-0"
              >
                <Wrench className="w-3 h-3 text-[var(--accent)]" />
                <span>First Pits (L{pitStopLaps[0]})</span>
              </button>
            )}
          </div>

          {/* Playback Controls & Speed Toggle */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-0.5">
              {[1, 2, 5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    playbackSpeed === speed
                      ? 'bg-[var(--accent)] text-white shadow-xs'
                      : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentLap((prev) => Math.max(1, prev - 1))}
                disabled={currentLap <= 1}
                className="rounded-xl px-2.5"
              >
                <SkipBack className="w-4 h-4" />
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsPlaying((prev) => !prev)}
                className="rounded-xl px-4 flex items-center gap-1.5 font-bold"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentLap((prev) => Math.min(totalLaps, prev + 1))}
                disabled={currentLap >= totalLaps}
                className="rounded-xl px-2.5"
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* 60fps Scrubber Range Slider */}
        <div className="space-y-1.5">
          <input
            type="range"
            min={1}
            max={totalLaps}
            value={currentLap}
            onChange={(e) => {
              setIsPlaying(false)
              setCurrentLap(parseInt(e.target.value, 10))
            }}
            className="w-full h-2 bg-[var(--surface-2)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)] focus:outline-none"
          />

          <div className="flex justify-between items-center text-[10px] font-mono text-[var(--text-muted)]">
            <span>START (LAP 1)</span>
            <span>USE KEYBOARD &larr; / &rarr; OR SPACEBAR TO SCRUB</span>
            <span>CHEQUERED (LAP {totalLaps})</span>
          </div>
        </div>
      </div>

      {/* 2. Main Two-Column View: Left Timing Tower / Right Telemetry Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Live Synchronized Timing Tower (7 cols) */}
        <div className="lg:col-span-7 f1-card-accent rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[var(--accent)]" />
              <h3 className="font-display font-black text-sm uppercase tracking-tight text-[var(--text)]">
                Timing Tower &bull; Lap {currentLap}
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">
              60FPS REORDER ANIMATION
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-[var(--border)] text-[10px] uppercase text-[var(--text-muted)] bg-[var(--surface-2)]/60">
                  <th className="py-2.5 px-3 font-bold w-12 text-center">Pos</th>
                  <th className="py-2.5 px-3 font-bold">Driver</th>
                  <th className="py-2.5 px-3 font-bold text-right">Gap to Leader</th>
                  <th className="py-2.5 px-3 font-bold text-right">Interval</th>
                  <th className="py-2.5 px-3 font-bold text-center">Tyre</th>
                  <th className="py-2.5 px-3 font-bold text-center">Pit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]/50">
                <AnimatePresence>
                  {currentSnapshot.positions.map((p) => {
                    const driver = driverMap.get(p.driverNumber)
                    const team = getTeamMeta(driver?.teamName)
                    const compound = p.compound?.toUpperCase() || 'SOFT'
                    const isSoft = compound.includes('SOFT')
                    const isMed = compound.includes('MEDIUM')
                    const isHard = compound.includes('HARD')
                    const isInter = compound.includes('INTER')
                    const isWet = compound.includes('WET')

                    return (
                      <motion.tr
                        key={p.driverNumber}
                        layout={!shouldReduceMotion}
                        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
                        className="hover:bg-[var(--surface-2)]/50 transition-colors"
                      >
                        {/* Position */}
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`w-6 h-6 rounded inline-flex items-center justify-center font-display font-black text-xs ${
                              p.position === 1
                                ? 'bg-amber-400 text-black'
                                : p.position === 2
                                ? 'bg-zinc-300 text-black'
                                : p.position === 3
                                ? 'bg-amber-700 text-white'
                                : 'bg-[var(--surface-2)] text-[var(--text)]'
                            }`}
                          >
                            {p.position}
                          </span>
                        </td>

                        {/* Driver */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-1 h-4 rounded-full shrink-0"
                              style={{ backgroundColor: team.color }}
                            />
                            <span className="font-bold text-[var(--text)] text-xs">
                              {p.driverCode}
                            </span>
                            <span className="text-[10px] text-[var(--text-muted)]">
                              #{p.driverNumber}
                            </span>
                          </div>
                        </td>

                        {/* Gap to Leader */}
                        <td className="py-2.5 px-3 text-right font-semibold whitespace-nowrap">
                          {p.position === 1 ? (
                            <span className="text-amber-400 font-bold">LEADER</span>
                          ) : p.gapToLeaderSeconds !== null ? (
                            <span className="text-[var(--text)]">
                              +{p.gapToLeaderSeconds.toFixed(3)}s
                            </span>
                          ) : (
                            <span className="text-[var(--text-muted)]">--</span>
                          )}
                        </td>

                        {/* Interval to Ahead */}
                        <td className="py-2.5 px-3 text-right text-[var(--text-muted)] whitespace-nowrap">
                          {p.position === 1
                            ? '--'
                            : p.intervalToAheadSeconds !== null
                            ? `+${p.intervalToAheadSeconds.toFixed(3)}s`
                            : '--'}
                        </td>

                        {/* Tyre Compound & Age */}
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold">
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                isSoft
                                  ? 'bg-red-500'
                                  : isMed
                                  ? 'bg-amber-400'
                                  : isHard
                                  ? 'bg-slate-200'
                                  : isInter
                                  ? 'bg-emerald-500'
                                  : isWet
                                  ? 'bg-blue-500'
                                  : 'bg-zinc-400'
                              }`}
                            />
                            <span className="text-[var(--text)]">{compound.charAt(0)}</span>
                            <span className="text-[var(--text-muted)]">L{p.tyreAge}</span>
                          </div>
                        </td>

                        {/* Pit Status */}
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          {p.pitStopThisLap ? (
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-bold animate-pulse">
                              BOX BOX
                            </span>
                          ) : (
                            <span className="text-[10px] text-[var(--text-muted)]">TRACK</span>
                          )}
                        </td>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Lap Commentary, Radio & Race Control (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Lap Commentary Feed Card */}
          <div className="f1-card-accent p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                  Lap {currentLap} Commentary
                </span>
              </div>
              <span className="text-[10px] font-mono text-[var(--text-muted)]">
                Auto-generated from timing data
              </span>
            </div>

            {currentCommentary ? (
              <div className="space-y-3">
                <div className="font-display font-black text-sm text-[var(--text)] uppercase tracking-tight">
                  {currentCommentary.headline}
                </div>

                <p className="text-xs font-sans text-[var(--text-muted)] leading-relaxed">
                  {currentCommentary.summary}
                </p>

                {currentCommentary.events.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-[var(--border)]/60">
                    <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] tracking-wider">
                      Events This Lap
                    </span>
                    {currentCommentary.events.map((ev, i) => (
                      <div
                        key={i}
                        className="text-xs font-mono p-2 rounded-lg bg-[var(--surface-2)] flex items-start gap-2 text-[var(--text)]"
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-[var(--accent)] shrink-0 mt-0.5" />
                        <span>{ev.description}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs font-mono text-[var(--text-muted)] py-4 text-center">
                All cars maintaining position on lap {currentLap}.
              </div>
            )}
          </div>

          {/* Team Radio for Lap N */}
          <div className="f1-card-accent p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-[var(--accent)]" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                  Team Radio &bull; Lap {currentLap}
                </span>
              </div>
              <span className="text-[10px] font-mono text-[var(--text-muted)]">
                {currentRadio.length} CLIPS
              </span>
            </div>

            {currentRadio.length > 0 ? (
              <div className="space-y-2.5">
                {currentRadio.map((clip) => {
                  const team = getTeamMeta(clip.teamName)

                  return (
                    <div
                      key={clip.id}
                      className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: team.color }}
                          />
                          <span className="font-bold text-[var(--text)]">
                            {clip.driverCode} &bull; {clip.teamName}
                          </span>
                        </div>
                        <span className="text-[10px] text-[var(--text-muted)]">
                          {new Date(clip.timestamp).toLocaleTimeString()}
                        </span>
                      </div>

                      {/* HTML5 Audio Player for remote FOM/OpenF1 stream */}
                      <audio controls preload="none" className="w-full h-8 rounded-lg mt-1">
                        <source src={clip.audioUrl} type="audio/mpeg" />
                        Your browser does not support audio playback.
                      </audio>
                      <div className="text-[9px] font-mono text-[var(--text-muted)]">
                        Streamed directly from OpenF1 / FOM remote broadcast audio
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-xs font-mono text-[var(--text-muted)] py-4 text-center">
                No public broadcast team radio clips recorded on lap {currentLap}.
              </div>
            )}
          </div>

          {/* Race Control Alerts for Lap N */}
          <div className="f1-card-accent p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-amber-400" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                  Race Control Notices &bull; Lap {currentLap}
                </span>
              </div>
            </div>

            {currentRaceControl.length > 0 ? (
              <div className="space-y-2">
                {currentRaceControl.map((rc) => (
                  <div
                    key={rc.id}
                    className="p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-xs font-mono flex items-start gap-2.5"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-[var(--text)] uppercase">{rc.category}</div>
                      <div className="text-[11px] text-[var(--text-muted)] mt-0.5">{rc.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs font-mono text-[var(--text-muted)] py-3 text-center">
                Track status normal (Green Flag) on lap {currentLap}.
              </div>
            )}
          </div>

          {/* Telemetry Weather Frame */}
          {currentWeather && (
            <div className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-1.5 text-[var(--text)]">
                <Thermometer className="w-3.5 h-3.5 text-red-400" />
                <span>Track: {currentWeather.trackTemp}°C</span>
              </div>
              <div className="flex items-center gap-1.5 text-[var(--text)]">
                <Wind className="w-3.5 h-3.5 text-teal-400" />
                <span>Wind: {currentWeather.windSpeed} m/s</span>
              </div>
              <div className="text-emerald-400 font-bold">DRY</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
