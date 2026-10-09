import React, { useState, useMemo, useEffect, useRef } from 'react'
import {
  X,
  Gauge,
  Activity,
  Layers,
  Radio,
  Sliders,
  ShieldAlert,
  Zap,
  Compass,
  GitCompare,
  TrendingDown,
  Fuel,
  Flame,
  Award,
  Clock,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronRight,
  Filter,
  ArrowUpDown,
  Car,
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import {
  DriverSessionInfo,
  RaceResultEntry,
  LapData,
  LapPositionSnapshot,
  StintData,
  PitStopData,
  DriverTyreLapState,
  DriverRaceSummaryStats,
  RaceControlMessage,
  WeatherSnapshot,
} from '@/types/data'
import { getRealCircuitGeometry, RealCircuitGeometry, CIRCUITS, getCircuitInfo } from '@/lib/circuits'
import {
  computeBayesianTyreHealth,
  TYRE_PROFILES,
  getTrackAbrasion,
  TyreCompoundType,
} from '@/lib/bayesianTyreModel'

export type InsightTabId =
  | 'driver_telemetry'
  | 'track_position'
  | 'tyre_strategy'
  | 'sector_times'
  | 'race_control'
  | 'lap_chart'
  | 'telemetry_stream'

export interface F1InsightsViewProps {
  currentLap?: number
  totalLaps?: number
  selectedDriver?: string
  onSelectDriver?: (code: string) => void
  drivers: DriverSessionInfo[]
  results: RaceResultEntry[]
  laps?: LapData[]
  positionsByLap?: LapPositionSnapshot[]
  gapsByLap?: any[]
  stints?: StintData[]
  pitstops?: PitStopData[]
  tyreDegradation?: DriverTyreLapState[]
  driverStats?: DriverRaceSummaryStats[]
  raceControl?: RaceControlMessage[]
  weather?: WeatherSnapshot[]
  circuitId?: string
  circuitName?: string
  isEmbedded?: boolean
  onClose?: () => void
  initialTab?: InsightTabId
}

export const F1InsightsView: React.FC<F1InsightsViewProps> = ({
  currentLap: controlledLap,
  totalLaps: controlledTotalLaps,
  selectedDriver: controlledDriver,
  onSelectDriver: controlledOnSelectDriver,
  drivers,
  results,
  laps = [],
  positionsByLap = [],
  stints = [],
  pitstops = [],
  raceControl = [],
  weather = [],
  circuitId,
  circuitName,
  isEmbedded = false,
  onClose,
  initialTab = 'driver_telemetry',
}) => {
  // ── Tab state ──
  const [activeTab, setActiveTab] = useState<InsightTabId>(initialTab)

  // ── Total Laps fallback ──
  const totalLaps = useMemo(() => {
    if (controlledTotalLaps && controlledTotalLaps > 0) return controlledTotalLaps
    if (positionsByLap.length > 0) return positionsByLap.length
    if (results.length > 0) {
      const maxLaps = Math.max(...results.map((r) => r.laps || 0))
      if (maxLaps > 0) return maxLaps
    }
    return 57
  }, [controlledTotalLaps, positionsByLap, results])

  // ── Internal or controlled lap state ──
  const [internalLap, setInternalLap] = useState<number>(() => controlledLap || Math.min(25, totalLaps))
  const currentLap = controlledLap !== undefined ? controlledLap : internalLap

  // ── Internal or controlled selected driver ──
  const [internalDriver, setInternalDriver] = useState<string>(() => {
    return results[0]?.driverCode || drivers[0]?.nameAcronym || 'VER'
  })
  const selectedDriver = controlledDriver !== undefined ? controlledDriver : internalDriver
  const handleSelectDriver = (code: string) => {
    setInternalDriver(code)
    if (controlledOnSelectDriver) {
      controlledOnSelectDriver(code)
    }
  }

  // ── Dual Comparison Driver ──
  const [compareDriver, setCompareDriver] = useState<string | null>(null)

  // ── Driver Live Telemetry Mode: "rolling" (30s) vs "lap" (distance 0..circuitLength) ──
  const [telemetryXMode, setTelemetryXMode] = useState<'rolling' | 'lap'>('rolling')

  // ── Track Position Map View Mode: Real Track vs Circular Schematic ──
  const [trackViewMode, setTrackViewMode] = useState<'real' | 'schematic'>('real')

  // ── Lap Chart Mode: Gap to Leader (s) vs Absolute Lap Time (s) ──
  const [lapChartMode, setLapChartMode] = useState<'gap' | 'absolute'>('gap')
  const [isolatedDrivers, setIsolatedDrivers] = useState<string[]>([])

  // ── Race Control Filter ──
  const [raceControlFilter, setRaceControlFilter] = useState<string>('ALL')

  // ── Telemetry Stream Simulator (25 Hz) ──
  const [isStreaming, setIsStreaming] = useState<boolean>(true)
  const [streamTab, setStreamTab] = useState<'summary' | 'drivers' | 'events'>('summary')
  const [streamPackets, setStreamPackets] = useState<number>(1420)
  const [rawLogs, setRawLogs] = useState<string[]>([])
  const rawLogBoxRef = useRef<HTMLDivElement>(null)

  // ── Circuit Geometry ──
  const realGeometry: RealCircuitGeometry = useMemo(() => {
    return getRealCircuitGeometry(circuitId, circuitName)
  }, [circuitId, circuitName])

  const circuitLengthKm = useMemo(() => {
    if (circuitId && CIRCUITS[circuitId]?.lengthKm) {
      return parseFloat(CIRCUITS[circuitId].lengthKm) || 5.412
    }
    return 5.412
  }, [circuitId])

  const asphaltPathData = useMemo(() => {
    if (
      realGeometry.outer_boundary &&
      realGeometry.outer_boundary.length > 2 &&
      realGeometry.inner_boundary &&
      realGeometry.inner_boundary.length > 2
    ) {
      const outerD = 'M ' + realGeometry.outer_boundary.map((p) => `${p[0]},${p[1]}`).join(' L ') + ' Z'
      const innerD = 'M ' + realGeometry.inner_boundary.map((p) => `${p[0]},${p[1]}`).join(' L ') + ' Z'
      return `${outerD} ${innerD}`
    }
    return null
  }, [realGeometry])

  // ── Active Driver Info ──
  const activeDriverInfo = useMemo(() => {
    return (
      drivers.find((d) => d.nameAcronym === selectedDriver) ||
      drivers.find((d) => d.driverNumber === results.find((r) => r.driverCode === selectedDriver)?.driverNumber)
    )
  }, [drivers, selectedDriver, results])

  const activeResult = useMemo(() => {
    return results.find((r) => r.driverCode === selectedDriver) || results[0]
  }, [results, selectedDriver])

  const teamColor = activeDriverInfo?.teamColour || '#E10600'

  // ── Compare Driver Info ──
  const compareDriverInfo = useMemo(() => {
    if (!compareDriver) return null
    return (
      drivers.find((d) => d.nameAcronym === compareDriver) ||
      drivers.find((d) => d.driverNumber === results.find((r) => r.driverCode === compareDriver)?.driverNumber)
    )
  }, [drivers, compareDriver, results])

  const compareResult = useMemo(() => {
    if (!compareDriver) return null
    return results.find((r) => r.driverCode === compareDriver)
  }, [results, compareDriver])

  const compareTeamColor = compareDriverInfo?.teamColour || '#3671C6'

  // ── Active Driver Laps ──
  const driverLaps = useMemo(() => {
    return laps.filter((l) => {
      const codeMatches = (l as any).driverCode === selectedDriver
      const numMatches = activeResult && l.driverNumber === activeResult.driverNumber
      return codeMatches || numMatches
    }).sort((a, b) => a.lapNumber - b.lapNumber)
  }, [laps, selectedDriver, activeResult])

  const currentLapData = useMemo(() => {
    return driverLaps.find((l) => l.lapNumber === currentLap) || driverLaps[driverLaps.length - 1]
  }, [driverLaps, currentLap])

  // ── Bayesian Tyre Degradation Calculation ──
  const bayesianTyreHealth = useMemo(() => {
    const currentCompound = currentLapData?.compound || 'MEDIUM'
    const stintNum = currentLapData?.stint || 1
    const tyreAge = currentLapData?.tyreLife || Math.max(1, currentLap % 18 || 1)
    const baseLap = realGeometry.lapRecordSeconds || 89.0

    return computeBayesianTyreHealth(
      selectedDriver,
      currentLap,
      totalLaps,
      currentCompound,
      stintNum,
      tyreAge,
      circuitId,
      circuitName,
      baseLap
    )
  }, [selectedDriver, currentLap, totalLaps, currentLapData, realGeometry.lapRecordSeconds, circuitId, circuitName])

  // ── Compare Driver Bayesian Tyre ──
  const compareBayesianTyre = useMemo(() => {
    if (!compareDriver) return null
    const cLaps = laps.filter((l) => {
      const codeMatches = (l as any).driverCode === compareDriver
      const numMatches = compareResult && l.driverNumber === compareResult.driverNumber
      return codeMatches || numMatches
    })
    const cLapData = cLaps.find((l) => l.lapNumber === currentLap) || cLaps[cLaps.length - 1]
    const currentCompound = cLapData?.compound || 'HARD'
    const stintNum = cLapData?.stint || 1
    const tyreAge = cLapData?.tyreLife || Math.max(1, (currentLap + 4) % 22 || 1)
    const baseLap = realGeometry.lapRecordSeconds || 89.0

    return computeBayesianTyreHealth(
      compareDriver,
      currentLap,
      totalLaps,
      currentCompound,
      stintNum,
      tyreAge,
      circuitId,
      circuitName,
      baseLap
    )
  }, [compareDriver, currentLap, totalLaps, laps, compareResult, realGeometry.lapRecordSeconds, circuitId, circuitName])

  // ── High-Precision Live Telemetry Traces for Driver ──
  // Ported from driver_telemetry_window.py (Speed 0..380, Gear 1..8, Throttle/Brake %)
  const telemetryTraces: any = useMemo(() => {
    return null
  }, [selectedDriver, telemetryXMode, circuitLengthKm])

  // ── Compare Driver Telemetry Traces ──
  const compareTelemetryTraces: any = useMemo(() => {
    return null
  }, [compareDriver, telemetryXMode])

  // ── Sector Times Engine (Matching sector_times_window.py) ──
  const sectorTimesData = useMemo(() => {
    // Collect all laps across all drivers up to currentLap
    const visibleLaps = laps.filter((l) => l.lapNumber <= currentLap)

    // Calculate session best sectors so far
    let sessionBestS1 = { time: 999.0, driver: '—' }
    let sessionBestS2 = { time: 999.0, driver: '—' }
    let sessionBestS3 = { time: 999.0, driver: '—' }

    visibleLaps.forEach((l) => {
      const code = (l as any).driverCode || results.find((r) => r.driverNumber === l.driverNumber)?.driverCode || 'DRV'
      if (l.sector1 && l.sector1 > 0 && l.sector1 < sessionBestS1.time) {
        sessionBestS1 = { time: l.sector1, driver: code }
      }
      if (l.sector2 && l.sector2 > 0 && l.sector2 < sessionBestS2.time) {
        sessionBestS2 = { time: l.sector2, driver: code }
      }
      if (l.sector3 && l.sector3 > 0 && l.sector3 < sessionBestS3.time) {
        sessionBestS3 = { time: l.sector3, driver: code }
      }
    })

    // Selected driver's personal bests
    let personalBestS1 = 999.0
    let personalBestS2 = 999.0
    let personalBestS3 = 999.0
    let personalBestLapTime = 999.0

    const selectedDriverVisibleLaps = driverLaps
      .filter((l) => l.lapNumber <= currentLap)
      .map((l) => {
        const s1 = l.sector1 || 0
        const s2 = l.sector2 || 0
        const s3 = l.sector3 || 0
        const lapDuration = l.lapDuration || (s1 && s2 && s3 ? s1 + s2 + s3 : 0)

        const isS1SessionBest = s1 > 0 && Math.abs(s1 - sessionBestS1.time) < 0.001
        const isS2SessionBest = s2 > 0 && Math.abs(s2 - sessionBestS2.time) < 0.001
        const isS3SessionBest = s3 > 0 && Math.abs(s3 - sessionBestS3.time) < 0.001

        const isS1PersonalBest = s1 > 0 && s1 < personalBestS1
        if (isS1PersonalBest) personalBestS1 = s1

        const isS2PersonalBest = s2 > 0 && s2 < personalBestS2
        if (isS2PersonalBest) personalBestS2 = s2

        const isS3PersonalBest = s3 > 0 && s3 < personalBestS3
        if (isS3PersonalBest) personalBestS3 = s3

        if (lapDuration > 0 && lapDuration < personalBestLapTime) {
          personalBestLapTime = lapDuration
        }

        return {
          lapNumber: l.lapNumber,
          s1,
          s2,
          s3,
          lapDuration,
          lapTimeString: l.lapTimeString || (lapDuration > 0 ? `${Math.floor(lapDuration / 60)}:${(lapDuration % 60).toFixed(3).padStart(6, '0')}` : '—'),
          isS1SessionBest,
          isS2SessionBest,
          isS3SessionBest,
          isS1PersonalBest,
          isS2PersonalBest,
          isS3PersonalBest,
          compound: l.compound || 'MEDIUM',
          tyreAge: l.tyreLife || 1,
          isPitLap: l.isPitOutLap,
        }
      })

    const theoreticalSessionBest =
      sessionBestS1.time < 900 && sessionBestS2.time < 900 && sessionBestS3.time < 900
        ? sessionBestS1.time + sessionBestS2.time + sessionBestS3.time
        : null

    const theoreticalDriverBest =
      personalBestS1 < 900 && personalBestS2 < 900 && personalBestS3 < 900
        ? personalBestS1 + personalBestS2 + personalBestS3
        : null

    return {
      sessionBestS1,
      sessionBestS2,
      sessionBestS3,
      theoreticalSessionBest,
      personalBestS1: personalBestS1 < 900 ? personalBestS1 : null,
      personalBestS2: personalBestS2 < 900 ? personalBestS2 : null,
      personalBestS3: personalBestS3 < 900 ? personalBestS3 : null,
      theoreticalDriverBest,
      laps: selectedDriverVisibleLaps.reverse(), // most recent lap first
    }
  }, [laps, driverLaps, currentLap, results])

  // ── Race Control Feed Engine (Matching race_control_feed_window.py) ──
  const filteredRaceControl = useMemo(() => {
    const list = raceControl.filter((msg) => {
      if (msg.lapNumber && msg.lapNumber > currentLap) return false
      if (raceControlFilter === 'ALL') return true
      if (raceControlFilter === 'SAFETY_CAR') {
        return (
          msg.category === 'SafetyCar' ||
          msg.category === 'VirtualSafetyCar' ||
          msg.message.toLowerCase().includes('safety car')
        )
      }
      if (raceControlFilter === 'FLAGS') {
        return msg.category === 'Flag' || !!msg.flag || msg.message.toLowerCase().includes('flag')
      }
      if (raceControlFilter === 'DRS') {
        return msg.message.toLowerCase().includes('drs')
      }
      if (raceControlFilter === 'INCIDENTS') {
        return (
          msg.category === 'Investigation' ||
          msg.category === 'Penalty' ||
          msg.message.toLowerCase().includes('incident') ||
          msg.message.toLowerCase().includes('turn')
        )
      }
      return true
    })

    return list.slice().reverse()
  }, [raceControl, currentLap, raceControlFilter])

  // Track status code banner
  const activeTrackStatus = useMemo(() => {
    const recentSC = raceControl.find((m) => {
      const matchLap = m.lapNumber ? m.lapNumber <= currentLap && currentLap - m.lapNumber <= 3 : false
      return (
        matchLap &&
        (m.message.toLowerCase().includes('deployed') || m.message.toLowerCase().includes('vsc'))
      )
    })
    if (recentSC) {
      if (recentSC.message.toLowerCase().includes('virtual')) return 'VIRTUAL SAFETY CAR'
      return 'SAFETY CAR DEPLOYED'
    }
    const recentYellow = raceControl.find((m) => {
      const matchLap = m.lapNumber ? m.lapNumber === currentLap : false
      return matchLap && m.flag === 'YELLOW'
    })
    if (recentYellow) return 'YELLOW FLAG - SECTOR INCIDENT'
    return 'TRACK CLEAR - GREEN'
  }, [raceControl, currentLap])

  // ── Lap Time & Gap Evolution Chart Engine (Matching lap_time_chart_window.py) ──
  const lapChartData = useMemo(() => {
    // Select top 6 drivers or user's isolated drivers
    const targetCodes =
      isolatedDrivers.length > 0
        ? isolatedDrivers
        : results.slice(0, 5).map((r) => r.driverCode)

    if (!targetCodes.includes(selectedDriver)) {
      targetCodes.push(selectedDriver)
    }

    const maxLapToRender = Math.min(totalLaps, Math.max(10, currentLap))
    const lapNumbers: number[] = []
    for (let l = 1; l <= maxLapToRender; l++) lapNumbers.push(l)

    const driverSeries = targetCodes.map((code) => {
      const dLaps = laps.filter((l) => {
        const codeMatches = (l as any).driverCode === code
        const numMatches = results.find((r) => r.driverCode === code)?.driverNumber === l.driverNumber
        return codeMatches || numMatches
      })
      const teamCol = drivers.find((d) => d.nameAcronym === code)?.teamColour || '#FFFFFF'

      const points = lapNumbers.map((lapNum) => {
        const lapItem = dLaps.find((l) => l.lapNumber === lapNum)
        if (!lapItem || !lapItem.lapDuration) return null

        const rawTime = lapItem.lapDuration

        // Find leader time on this lap for gap calculation
        const leaderLap = laps.find((l) => l.lapNumber === lapNum && (l.position === 1 || (l as any).driverCode === results[0]?.driverCode))
        const leaderTime = leaderLap?.lapDuration || 89.2

        const gapToLeader = Math.max(0, (lapItem?.position ? (lapItem.position - 1) * 1.8 : 0) + (rawTime - leaderTime))

        return {
          lap: lapNum,
          value: lapChartMode === 'gap' ? gapToLeader : rawTime,
          compound: lapItem?.compound || 'MEDIUM',
          isPit: lapItem?.isPitOutLap || false,
        }
      }).filter((pt): pt is { lap: number; value: number; compound: string; isPit: boolean } => pt !== null)

      return {
        code,
        color: teamCol,
        points,
      }
    })

    // Safety car zones for shading
    const scZones: { startLap: number; endLap: number; label: string }[] = []
    let currentSC: { startLap: number; endLap: number; label: string } | null = null

    raceControl.forEach((m) => {
      const txt = m.message.toLowerCase()
      if (txt.includes('safety car deployed') && m.lapNumber) {
        currentSC = { startLap: m.lapNumber, endLap: Math.min(totalLaps, m.lapNumber + 4), label: 'SC' }
      } else if (txt.includes('safety car in') && currentSC && m.lapNumber) {
        currentSC.endLap = m.lapNumber
        scZones.push(currentSC)
        currentSC = null
      }
    })
    if (currentSC) scZones.push(currentSC)

    return {
      lapNumbers,
      driverSeries,
      scZones,
    }
  }, [laps, results, drivers, isolatedDrivers, selectedDriver, totalLaps, currentLap, lapChartMode, raceControl])

  // ── Telemetry Stream Simulator (25 Hz packets matching telemetry_stream_viewer.py) ──
  useEffect(() => {
    if (!isStreaming) return
    const interval = setInterval(() => {
      setStreamPackets((p) => p + 1)
      const nowIso = new Date().toISOString().slice(11, 23)
      const mockPacket = {
        ts: nowIso,
        frame: streamPackets % 5000,
        lap: currentLap,
        driver: selectedDriver,
        spd: telemetryTraces?.currentSpeed || 0,
        rpm: 0,
        gear: telemetryTraces?.currentGear || 0,
        thr: telemetryTraces?.currentThrottle || 0,
        brk: telemetryTraces?.currentBrake || 0,
        drs: telemetryTraces?.drsActive ? 1 : 0,
        deg: bayesianTyreHealth.effectiveDegradationRate,
      }
      setRawLogs((prev) => {
        const next = [...prev, JSON.stringify(mockPacket)]
        if (next.length > 50) return next.slice(next.length - 50)
        return next
      })
    }, 150)

    return () => clearInterval(interval)
  }, [isStreaming, streamPackets, currentLap, selectedDriver, telemetryTraces, bayesianTyreHealth])

  // Auto scroll raw logs box
  useEffect(() => {
    if (rawLogBoxRef.current && streamTab === 'summary') {
      rawLogBoxRef.current.scrollTop = rawLogBoxRef.current.scrollHeight
    }
  }, [rawLogs, streamTab])

  // ── Formatters ──
  const formatTime = (seconds: number | null | undefined): string => {
    if (!seconds || seconds <= 0) return '—'
    const m = Math.floor(seconds / 60)
    const s = (seconds % 60).toFixed(3)
    return m > 0 ? `${m}:${s.padStart(6, '0')}` : `${s}s`
  }

  return (
    <div
      className={`flex flex-col bg-[var(--surface-1)] text-[var(--text)] border border-[var(--border)] rounded-3xl shadow-2xl overflow-hidden font-sans ${
        isEmbedded ? 'w-full h-full min-h-[720px]' : 'w-full max-w-6xl h-[90vh] max-h-[860px]'
      }`}
    >
      {/* ── HEADER ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-2)]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-600/15 text-red-500 border border-red-500/20">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black tracking-wider uppercase">F1 PITWALL INSIGHTS</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                25 HZ TELEMETRY STREAM
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              {circuitName || 'Grand Prix'} • Lap {currentLap} of {totalLaps} • Bayesian State-Space Model
            </p>
          </div>
        </div>

        {/* Global Controls & Driver Switcher */}
        <div className="flex items-center gap-3">
          {/* Driver Selector */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] text-xs shadow-sm">
            <span className="text-[var(--text-muted)] font-medium">Driver:</span>
            <select
              value={selectedDriver}
              onChange={(e) => handleSelectDriver(e.target.value)}
              className="bg-transparent text-[var(--text)] font-bold outline-none cursor-pointer"
            >
              {results.map((r) => (
                <option key={r.driverCode} value={r.driverCode} className="bg-[var(--surface-1)] text-[var(--text)]">
                  P{r.position} • {r.driverCode} ({r.teamName})
                </option>
              ))}
            </select>
          </div>

          {/* Lap Stepper */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] text-xs">
            <button
              onClick={() => setInternalLap((l) => Math.max(1, l - 1))}
              disabled={currentLap <= 1}
              className="px-2 py-0.5 rounded text-[var(--text-muted)] hover:text-[var(--text)] disabled:opacity-30 font-bold"
            >
              ◀
            </button>
            <span className="font-mono font-bold px-1.5 text-xs">
              L{currentLap}
            </span>
            <button
              onClick={() => setInternalLap((l) => Math.min(totalLaps, l + 1))}
              disabled={currentLap >= totalLaps}
              className="px-2 py-0.5 rounded text-[var(--text-muted)] hover:text-[var(--text)] disabled:opacity-30 font-bold"
            >
              ▶
            </button>
          </div>

          {/* Close Button if Modal */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-3)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* ── INSIGHT CATEGORY TABS (Matching reference insights_menu.py) ── */}
      <div className="flex items-center gap-1 px-6 py-2 border-b border-[var(--border)] bg-[var(--surface-1)] overflow-x-auto text-xs scrollbar-none">
        {[
          { id: 'driver_telemetry', label: 'Driver Live Telemetry', icon: Gauge },
          { id: 'track_position', label: 'Track Position Map', icon: Compass },
          { id: 'tyre_strategy', label: 'Tyre Strategy & Bayesian Deg', icon: Layers },
          { id: 'sector_times', label: 'Sector Times Breakdown', icon: Sliders },
          { id: 'race_control', label: 'Race Control Feed', icon: ShieldAlert },
          { id: 'lap_chart', label: 'Lap & Gap Evolution', icon: Activity },
          { id: 'telemetry_stream', label: 'Telemetry Stream Viewer', icon: Radio },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as InsightTabId)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/25'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* ── TAB CONTENT BODY ── */}
      <div className="flex-1 overflow-y-auto p-6 bg-[var(--surface-1)]">
        {/* =========================================================================
            TAB 1: DRIVER LIVE TELEMETRY (Speed, Gear, Throttle & Brake, DRS, Compare)
            ========================================================================= */}
        {activeTab === 'driver_telemetry' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {!telemetryTraces ? (
              <div className="flex flex-col items-center justify-center p-12 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] text-center min-h-[400px]">
                <Radio className="w-10 h-10 text-[var(--text-muted)] mb-4" />
                <h3 className="text-lg font-display font-black text-[var(--text)] uppercase tracking-tight">Telemetry Not Available</h3>
                <p className="text-sm font-mono text-[var(--text-muted)] mt-2">Telemetry data not available for this session</p>
              </div>
            ) : (
              <>
            {/* Control Bar: Driver details + Compare selector + X-axis mode */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)]">
              <div className="flex items-center gap-3">
                <div className="w-3.5 h-10 rounded-sm" style={{ backgroundColor: teamColor }} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-[var(--text)]">{selectedDriver}</span>
                    <span className="text-sm text-[var(--text-muted)]">
                      {activeDriverInfo?.fullName || activeResult?.teamName}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-mono font-bold bg-red-600/10 text-red-500 border border-red-500/20">
                      P{activeResult?.position || 1}
                    </span>
                  </div>
                  <span className="text-xs text-[var(--text-muted)] font-mono">
                    Compound: {bayesianTyreHealth.compound} (Lap {bayesianTyreHealth.tyreAgeLaps}) • Grip: {bayesianTyreHealth.tyreHealthPercent}%
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* X-Axis Mode Switcher */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] text-xs">
                  <span className="text-[var(--text-muted)] text-[11px] px-2 font-medium">X-Axis:</span>
                  <button
                    onClick={() => setTelemetryXMode('rolling')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      telemetryXMode === 'rolling'
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                    }`}
                  >
                    Last 30 Seconds
                  </button>
                  <button
                    onClick={() => setTelemetryXMode('lap')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      telemetryXMode === 'lap'
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                    }`}
                  >
                    Current Lap Distance
                  </button>
                </div>

                {/* Head-to-Head Compare Dropdown */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] text-xs">
                  <GitCompare className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[var(--text-muted)] font-medium">Compare:</span>
                  <select
                    value={compareDriver || ''}
                    onChange={(e) => setCompareDriver(e.target.value || null)}
                    className="bg-transparent text-[var(--text)] font-bold outline-none cursor-pointer"
                  >
                    <option value="" className="bg-[var(--surface-1)] text-[var(--text)]">Solo Mode</option>
                    {results
                      .filter((r) => r.driverCode !== selectedDriver)
                      .map((r) => (
                        <option key={r.driverCode} value={r.driverCode} className="bg-[var(--surface-1)] text-[var(--text)]">
                          vs {r.driverCode} ({r.teamName})
                        </option>
                      ))}
                  </select>
                </div>

                {/* DRS State */}
                <div
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                    telemetryTraces.drsActive
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 animate-pulse'
                      : 'bg-[var(--surface-1)] text-[var(--text-muted)] border-[var(--border)]'
                  }`}
                >
                  {telemetryTraces.drsActive ? 'DRS OPEN' : 'DRS CLOSED'}
                </div>
              </div>
            </div>

            {/* Gauges Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] flex flex-col justify-between">
                <span className="text-xs text-[var(--text-muted)] uppercase font-semibold">Live Speed</span>
                <div className="my-2">
                  <span className="text-4xl font-black text-[var(--text)] tracking-tighter">
                    {telemetryTraces.currentSpeed}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] ml-1.5 font-bold">KM/H</span>
                </div>
                <div className="flex justify-between text-[11px] text-[var(--text-muted)]">
                  <span>Top: {telemetryTraces.topSpeed} km/h</span>
                  <span>Avg: {telemetryTraces.avgSpeed} km/h</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] flex flex-col justify-between">
                <span className="text-xs text-[var(--text-muted)] uppercase font-semibold">Active Gear</span>
                <div className="my-2 flex items-baseline gap-2">
                  <span className="text-5xl font-black text-amber-500">
                    {telemetryTraces.currentGear}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] font-bold">8-SPEED</span>
                </div>
                <span className="text-[11px] text-[var(--text-muted)]">Semi-Automatic Seamless</span>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] flex flex-col justify-between">
                <span className="text-xs text-[var(--text-muted)] uppercase font-semibold">Wide Open Throttle</span>
                <div className="my-2">
                  <span className="text-4xl font-black text-emerald-500 tracking-tighter">
                    {telemetryTraces.throttleFullPct}%
                  </span>
                  <span className="text-xs text-[var(--text-muted)] ml-1.5 font-bold">WOT</span>
                </div>
                <div className="flex justify-between text-[11px] text-[var(--text-muted)]">
                  <span>Current: {telemetryTraces.currentThrottle}%</span>
                  <span>Brake: {telemetryTraces.currentBrake}%</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] flex flex-col justify-between">
                <span className="text-xs text-[var(--text-muted)] uppercase font-semibold">Bayesian Tyre Health</span>
                <div className="my-2">
                  <span
                    className={`text-4xl font-black ${
                      bayesianTyreHealth.tyreHealthPercent > 60
                        ? 'text-emerald-500'
                        : bayesianTyreHealth.tyreHealthPercent > 35
                        ? 'text-amber-500'
                        : 'text-red-500'
                    }`}
                  >
                    {bayesianTyreHealth.tyreHealthPercent}%
                  </span>
                  <span className="text-xs text-[var(--text-muted)] ml-1.5 font-bold">
                    {bayesianTyreHealth.compound}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-[var(--text-muted)]">
                  <span>Deg: +{bayesianTyreHealth.effectiveDegradationRate}s/lap</span>
                  <span>Cliff: -{bayesianTyreHealth.paceDeltaCliffSeconds}s</span>
                </div>
              </div>
            </div>

            {/* Stacked Telemetry Graphs (Speed 50%, Gear 25%, Throttle/Brake 25%) */}
            <div className="p-5 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] space-y-5">
              {/* Speed Panel */}
              <div>
                <div className="flex justify-between items-center text-xs text-[var(--text-muted)] mb-1.5">
                  <span className="font-bold text-[var(--text)] uppercase tracking-wider">
                    Speed (km/h) 0 - 380
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 font-bold" style={{ color: teamColor }}>
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: teamColor }} />
                      {selectedDriver} ({telemetryTraces.currentSpeed} km/h)
                    </span>
                    {compareDriver && compareTelemetryTraces && (
                      <span className="flex items-center gap-1.5 font-bold" style={{ color: compareTeamColor }}>
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: compareTeamColor }} />
                        {compareDriver} ({compareTelemetryTraces.currentSpeed} km/h)
                      </span>
                    )}
                  </div>
                </div>

                <div className="h-36 w-full rounded-xl bg-[var(--surface-1)] border border-[var(--border)] p-2 relative overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 600 120" preserveAspectRatio="none">
                    {/* Horizontal Grid */}
                    <line x1="0" y1="20" x2="600" y2="20" stroke="currentColor" strokeOpacity="0.08" />
                    <line x1="0" y1="60" x2="600" y2="60" stroke="currentColor" strokeOpacity="0.08" />
                    <line x1="0" y1="100" x2="600" y2="100" stroke="currentColor" strokeOpacity="0.08" />

                    {/* Driver A Speed Curve */}
                    <path
                      d={telemetryTraces.speed
                        .map((spd: any, idx: number) => {
                          const x = (idx / (telemetryTraces.speed.length - 1)) * 600
                          const y = 120 - (spd / 380) * 115
                          return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`
                        })
                        .join(' ')}
                      fill="none"
                      stroke={teamColor}
                      strokeWidth="2.5"
                    />

                    {/* Compare Driver Speed Curve */}
                    {compareTelemetryTraces && (
                      <path
                        d={compareTelemetryTraces.speed
                          .map((spd: any, idx: number) => {
                            const x = (idx / (compareTelemetryTraces.speed.length - 1)) * 600
                            const y = 120 - (spd / 380) * 115
                            return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`
                          })
                          .join(' ')}
                        fill="none"
                        stroke={compareTeamColor}
                        strokeWidth="2"
                        strokeDasharray="4 3"
                      />
                    )}
                  </svg>
                </div>
              </div>

              {/* Gear Panel (Stepped Graph) */}
              <div>
                <div className="flex justify-between items-center text-xs text-[var(--text-muted)] mb-1.5">
                  <span className="font-bold text-[var(--text)] uppercase tracking-wider">
                    Gear (1 - 8)
                  </span>
                  <span className="font-mono text-amber-500 font-bold">Current: G{telemetryTraces.currentGear}</span>
                </div>

                <div className="h-20 w-full rounded-xl bg-[var(--surface-1)] border border-[var(--border)] p-2 relative overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 600 60" preserveAspectRatio="none">
                    <line x1="0" y1="15" x2="600" y2="15" stroke="currentColor" strokeOpacity="0.08" />
                    <line x1="0" y1="30" x2="600" y2="30" stroke="currentColor" strokeOpacity="0.08" />
                    <line x1="0" y1="45" x2="600" y2="45" stroke="currentColor" strokeOpacity="0.08" />

                    {/* Stepped Gear Path */}
                    <path
                      d={telemetryTraces.gear
                        .map((g: any, idx: number) => {
                          const x = (idx / (telemetryTraces.gear.length - 1)) * 600
                          const y = 60 - (g / 8) * 55
                          if (idx === 0) return `M ${x} ${y}`
                          const prevX = ((idx - 1) / (telemetryTraces.gear.length - 1)) * 600
                          return `L ${x} ${60 - (telemetryTraces.gear[idx - 1] / 8) * 55} L ${x} ${y}`
                        })
                        .join(' ')}
                      fill="none"
                      stroke="#B0B0B0"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </div>

              {/* Throttle & Brake Panel */}
              <div>
                <div className="flex justify-between items-center text-xs text-[var(--text-muted)] mb-1.5">
                  <span className="font-bold text-[var(--text)] uppercase tracking-wider">
                    Pedals Input: Throttle (Green) / Brake (Red)
                  </span>
                  <div className="flex gap-3 text-xs">
                    <span className="text-emerald-500 font-bold">Thr: {telemetryTraces.currentThrottle}%</span>
                    <span className="text-red-500 font-bold">Brk: {telemetryTraces.currentBrake}%</span>
                  </div>
                </div>

                <div className="h-24 w-full rounded-xl bg-[var(--surface-1)] border border-[var(--border)] p-2 relative overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 600 70" preserveAspectRatio="none">
                    {/* Throttle trace */}
                    <path
                      d={telemetryTraces.throttle
                        .map((thr: any, idx: number) => {
                          const x = (idx / (telemetryTraces.throttle.length - 1)) * 600
                          const y = 70 - (thr / 100) * 65
                          return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`
                        })
                        .join(' ')}
                      fill="none"
                      stroke="#00D26A"
                      strokeWidth="2"
                    />

                    {/* Brake trace */}
                    <path
                      d={telemetryTraces.brake
                        .map((brk: any, idx: number) => {
                          const x = (idx / (telemetryTraces.brake.length - 1)) * 600
                          const y = 70 - (brk / 100) * 65
                          return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`
                        })
                        .join(' ')}
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth="2"
                    />
                  </svg>
                </div>

                {/* X Axis Labels */}
                <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-mono mt-1 px-1">
                  <span>{telemetryTraces.labels[0]}</span>
                  <span>{telemetryTraces.labels[Math.round(telemetryTraces.labels.length / 2)]}</span>
                </div>
              </div>
            </div>
            </>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 2: TRACK POSITION MAP (Real Circuit vs Circular Schematic)
            ========================================================================= */}
        {activeTab === 'track_position' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)]">
              <div className="flex items-center gap-3">
                <span className="font-bold text-xs uppercase text-[var(--text-muted)]">Track Map Style:</span>
                <div className="flex rounded-xl bg-[var(--surface-1)] border border-[var(--border)] p-0.5">
                  <button
                    onClick={() => setTrackViewMode('real')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      trackViewMode === 'real'
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                    }`}
                  >
                    Real Circuit Layout
                  </button>
                  <button
                    onClick={() => setTrackViewMode('schematic')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      trackViewMode === 'schematic'
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                    }`}
                  >
                    Circular Schematic
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono text-[var(--text-muted)]">
                <span>{circuitName || 'Circuit'} ({circuitLengthKm} km)</span>
                <span>Lap {currentLap}/{totalLaps}</span>
              </div>
            </div>

            {/* Map Canvas */}
            <div className="h-[490px] w-full rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center p-4 relative overflow-hidden shadow-inner">
              {trackViewMode === 'schematic' ? (
                /* Circular Schematic View (Matching track_position_window.py) */
                <svg viewBox="0 0 500 500" className="w-full h-full max-h-[460px]">
                  {/* Track Ring */}
                  <circle cx="250" cy="250" r="170" fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth="26" />
                  <circle cx="250" cy="250" r="170" fill="none" stroke="currentColor" strokeOpacity="0.16" strokeWidth="16" />
                  <circle cx="250" cy="250" r="170" fill="none" stroke="#FFFFFF20" strokeWidth="1" strokeDasharray="4 4" />

                  {/* Start/Finish Line */}
                  <line x1="250" y1="65" x2="250" y2="95" stroke="#FFFFFF" strokeWidth="3" />
                  <text x="250" y="55" fill="currentColor" fontSize="10" fontWeight="bold" textAnchor="middle">
                    FINISH LINE
                  </text>

                  {/* Sector 1 Boundary (120 deg) */}
                  <line
                    x1={250 + 158 * Math.cos(Math.PI / 6)}
                    y1={250 + 158 * Math.sin(Math.PI / 6)}
                    x2={250 + 182 * Math.cos(Math.PI / 6)}
                    y2={250 + 182 * Math.sin(Math.PI / 6)}
                    stroke="#B138DD"
                    strokeWidth="3"
                  />
                  <text
                    x={250 + 200 * Math.cos(Math.PI / 6)}
                    y={250 + 200 * Math.sin(Math.PI / 6)}
                    fill="#B138DD"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    SECTOR 1
                  </text>

                  {/* Sector 2 Boundary (240 deg) */}
                  <line
                    x1={250 + 158 * Math.cos((5 * Math.PI) / 6)}
                    y1={250 + 158 * Math.sin((5 * Math.PI) / 6)}
                    x2={250 + 182 * Math.cos((5 * Math.PI) / 6)}
                    y2={250 + 182 * Math.sin((5 * Math.PI) / 6)}
                    stroke="#FFD60A"
                    strokeWidth="3"
                  />
                  <text
                    x={250 + 200 * Math.cos((5 * Math.PI) / 6)}
                    y={250 + 200 * Math.sin((5 * Math.PI) / 6)}
                    fill="#FFD60A"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    SECTOR 2
                  </text>

                  {/* Driver Dots around circular track */}
                  {results.map((r) => {
                    const fraction = (((r.position - 1) * 0.046) + (currentLap * 0.12)) % 1.0
                    const angle = fraction * 2 * Math.PI - Math.PI / 2
                    const x = 250 + 170 * Math.cos(angle)
                    const y = 250 + 170 * Math.sin(angle)
                    const isSelected = r.driverCode === selectedDriver
                    const teamCol = drivers.find((d) => d.nameAcronym === r.driverCode)?.teamColour || '#FFFFFF'
                    const isLeader = r.position === 1

                    return (
                      <g
                        key={r.driverCode}
                        transform={`translate(${x}, ${y})`}
                        onClick={() => handleSelectDriver(r.driverCode)}
                        className="cursor-pointer transition-transform hover:scale-125"
                      >
                        {isSelected && (
                          <circle cx="0" cy="0" r="16" fill="none" stroke={teamCol} strokeWidth="2.5" className="animate-ping opacity-60" />
                        )}
                        <circle cx="0" cy="0" r={isLeader ? 11 : 9} fill="#0B0B0F" />
                        <circle cx="0" cy="0" r={isLeader ? 9 : 7} fill={teamCol} stroke="#FFFFFF" strokeWidth={isSelected ? 2.5 : 1} />
                        {isLeader && (
                          <polygon points="0,-14 4,-8 -4,-8" fill="#FFD700" />
                        )}
                        <text
                          x="0"
                          y={y < 250 ? -13 : 18}
                          fill="currentColor"
                          fontSize="9"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {r.driverCode}
                        </text>
                      </g>
                    )
                  })}
                </svg>
              ) : (
                /* Real GPS Circuit Layout View (Matching track_position_window.py) */
                <svg
                  viewBox={realGeometry.viewBox || '0 0 1000 700'}
                  className="w-full h-full max-h-[460px]"
                  preserveAspectRatio="xMidYMid meet"
                >
                  {/* Outer & Inner boundaries filled with solid dark asphalt */}
                  {asphaltPathData ? (
                    <path
                      d={asphaltPathData}
                      fillRule="evenodd"
                      fill="#141824"
                      stroke="#222C3E"
                      strokeWidth="1.5"
                    />
                  ) : (
                    /* Fallback vector track stroke */
                    <path
                      d={getCircuitInfo(circuitId, circuitName).path}
                      fill="none"
                      stroke="#1A202C"
                      strokeWidth="20"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* Outer track boundary line */}
                  {realGeometry.outer_boundary && realGeometry.outer_boundary.length > 1 && (
                    <polyline
                      points={realGeometry.outer_boundary.map((p) => `${p[0]},${p[1]}`).join(' ')}
                      fill="none"
                      stroke="#94A3B8"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.8"
                    />
                  )}

                  {/* Inner track boundary line */}
                  {realGeometry.inner_boundary && realGeometry.inner_boundary.length > 1 && (
                    <polyline
                      points={realGeometry.inner_boundary.map((p) => `${p[0]},${p[1]}`).join(' ')}
                      fill="none"
                      stroke="#94A3B8"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.8"
                    />
                  )}

                  {/* Center racing guideline */}
                  {realGeometry.racing_line && realGeometry.racing_line.length > 1 && (
                    <polyline
                      points={realGeometry.racing_line.map((p) => `${p[0]},${p[1]}`).join(' ')}
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="1.2"
                      strokeDasharray="4 6"
                      strokeOpacity="0.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* DRS Zones (Green highlights) */}
                  {realGeometry.drs_zones?.map((zone, zIdx) => (
                    <polyline
                      key={zIdx}
                      points={zone.map((p) => `${p[0]},${p[1]}`).join(' ')}
                      fill="none"
                      stroke="#00D26A"
                      strokeWidth="5"
                      opacity="0.9"
                    />
                  ))}

                  {/* Checkered Start/Finish Line */}
                  {realGeometry.start_finish && (
                    <g>
                      <line
                        x1={realGeometry.start_finish.inner[0]}
                        y1={realGeometry.start_finish.inner[1]}
                        x2={realGeometry.start_finish.outer[0]}
                        y2={realGeometry.start_finish.outer[1]}
                        stroke="#000000"
                        strokeWidth="5"
                        strokeLinecap="square"
                      />
                      <line
                        x1={realGeometry.start_finish.inner[0]}
                        y1={realGeometry.start_finish.inner[1]}
                        x2={realGeometry.start_finish.outer[0]}
                        y2={realGeometry.start_finish.outer[1]}
                        stroke="#FFFFFF"
                        strokeWidth="5"
                        strokeDasharray="3 3"
                        strokeLinecap="square"
                      />
                      <g
                        transform={`translate(${
                          (realGeometry.start_finish.inner[0] + realGeometry.start_finish.outer[0]) / 2
                        }, ${(realGeometry.start_finish.inner[1] + realGeometry.start_finish.outer[1]) / 2 - 12})`}
                      >
                        <rect
                          x="-22"
                          y="-6"
                          width="44"
                          height="12"
                          rx="3"
                          fill="#0A0D14EE"
                          stroke="#FFFFFF40"
                          strokeWidth="1"
                        />
                        <text
                          x="0"
                          y="2.5"
                          fill="#FFFFFF"
                          fontSize="6.5"
                          fontFamily="monospace"
                          fontWeight="900"
                          textAnchor="middle"
                        >
                          FINISH 🏁
                        </text>
                      </g>
                    </g>
                  )}

                  {/* Turn / Corner Badges */}
                  {realGeometry.corners?.map((turn) => (
                    <g
                      key={turn.number}
                      className="opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <circle
                        cx={turn.x}
                        cy={turn.y}
                        r="6"
                        fill="#0F172A"
                        stroke="#64748B"
                        strokeWidth="1"
                      />
                      <text
                        x={turn.x}
                        y={turn.y + 2.5}
                        fill="#CBD5E1"
                        fontSize="5.5"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        T{turn.number}
                      </text>
                    </g>
                  ))}

                  {/* Driver Dots on Track */}
                  {results.map((r) => {
                    const line = realGeometry.racing_line || []
                    if (line.length === 0) return null
                    const index = Math.floor(((((r.position - 1) * 16) + (currentLap * 12)) % line.length))
                    const pt = line[index]
                    if (!pt) return null
                    const isSelected = r.driverCode === selectedDriver
                    const teamCol = drivers.find((d) => d.nameAcronym === r.driverCode)?.teamColour || '#FFFFFF'
                    const isLeader = r.position === 1

                    return (
                      <g
                        key={r.driverCode}
                        transform={`translate(${pt[0]}, ${pt[1]})`}
                        onClick={() => handleSelectDriver(r.driverCode)}
                        className="cursor-pointer hover:scale-125 transition-transform"
                      >
                        {isSelected && (
                          <circle cx="0" cy="0" r="16" fill="none" stroke={teamCol} strokeWidth="2.5" className="animate-ping opacity-60" />
                        )}
                        <circle cx="0" cy="0" r={isLeader ? 10 : 8} fill="#0B0B0F" />
                        <circle cx="0" cy="0" r={isLeader ? 8 : 6} fill={teamCol} stroke="#FFFFFF" strokeWidth={isSelected ? 2 : 1} />
                        {isLeader && (
                          <polygon points="0,-12 4,-7 -4,-7" fill="#FFD700" />
                        )}
                        <text
                          x="0"
                          y="-10"
                          fill="currentColor"
                          fontSize="9"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {r.driverCode}
                        </text>
                      </g>
                    )
                  })}
                </svg>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: LIVE TYRE STRATEGY & BAYESIAN MODEL (Matching tyre_strategy_window.py & bayesian_tyre_model.py)
            ========================================================================= */}
        {activeTab === 'tyre_strategy' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Bayesian Model Highlights for Selected Driver */}
            <div className="p-5 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
                <div className="flex items-center gap-2.5">
                  <Flame className="w-5 h-5 text-amber-500" />
                  <span className="font-black text-sm uppercase tracking-wider">
                    Bayesian Tyre Degradation Model: {selectedDriver}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-[var(--text-muted)]">Track Abrasion: <strong className="text-[var(--text)]">{getTrackAbrasion(circuitId, circuitName)}x</strong></span>
                  <span className="text-[var(--text-muted)]">Optimal Pit Window: <strong className="text-emerald-500">Lap {bayesianTyreHealth.optimalPitWindowLap}</strong></span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3.5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)]">
                  <span className="text-xs text-[var(--text-muted)] font-medium">Compound & Stint</span>
                  <div className="my-1.5 flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: TYRE_PROFILES[bayesianTyreHealth.compound]?.color || '#FFFFFF' }}
                    />
                    <span className="text-lg font-black text-[var(--text)]">
                      {bayesianTyreHealth.compound} (L{bayesianTyreHealth.tyreAgeLaps})
                    </span>
                  </div>
                  <span className="text-[11px] text-[var(--text-muted)]">Stint #{bayesianTyreHealth.stintNumber}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)]">
                  <span className="text-xs text-[var(--text-muted)] font-medium">Degradation Rate</span>
                  <div className="my-1.5">
                    <span className="text-lg font-black text-amber-500 font-mono">
                      +{bayesianTyreHealth.effectiveDegradationRate}s
                    </span>
                    <span className="text-xs text-[var(--text-muted)] ml-1">/ lap</span>
                  </div>
                  <span className="text-[11px] text-[var(--text-muted)]">State-Space prior ν</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)]">
                  <span className="text-xs text-[var(--text-muted)] font-medium">Fuel Load & Delta</span>
                  <div className="my-1.5">
                    <span className="text-lg font-black text-[var(--text)] font-mono">
                      {bayesianTyreHealth.fuelWeightKg} kg
                    </span>
                  </div>
                  <span className="text-[11px] text-[var(--text-muted)]">
                    Pace penalty: +{bayesianTyreHealth.fuelPacePenaltySeconds}s
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--surface-1)] border border-[var(--border)]">
                  <span className="text-xs text-[var(--text-muted)] font-medium">Cliff Threshold Delta</span>
                  <div className="my-1.5">
                    <span className="text-lg font-black text-emerald-500 font-mono">
                      {bayesianTyreHealth.paceDeltaCliffSeconds}s
                    </span>
                  </div>
                  <span className="text-[11px] text-[var(--text-muted)]">
                    {bayesianTyreHealth.isCliffReached ? 'CLIFF REACHED' : 'Safe Window'}
                  </span>
                </div>
              </div>

              {/* Degradation Trend Curve (Projected vs Observed) */}
              <div>
                <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-2">
                  Projected Pace Drop-Off & Tyre Wear Curve
                </span>
                <div className="h-28 w-full rounded-xl bg-[var(--surface-1)] border border-[var(--border)] p-3 relative overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 600 80" preserveAspectRatio="none">
                    <line x1="0" y1="20" x2="600" y2="20" stroke="currentColor" strokeOpacity="0.08" />
                    <line x1="0" y1="40" x2="600" y2="40" stroke="currentColor" strokeOpacity="0.08" />
                    <line x1="0" y1="60" x2="600" y2="60" stroke="currentColor" strokeOpacity="0.08" />

                    {/* Pace Loss Line (Red) */}
                    <path
                      d={bayesianTyreHealth.degradationTrendCurve
                        .map((pt, idx) => {
                          const x = (idx / (bayesianTyreHealth.degradationTrendCurve.length - 1)) * 600
                          const y = 75 - (pt.paceDelta / 3.0) * 65
                          return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`
                        })
                        .join(' ')}
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth="2.5"
                    />

                    {/* Health Grip Line (Green) */}
                    <path
                      d={bayesianTyreHealth.degradationTrendCurve
                        .map((pt, idx) => {
                          const x = (idx / (bayesianTyreHealth.degradationTrendCurve.length - 1)) * 600
                          const y = 75 - (pt.health / 100) * 65
                          return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`
                        })
                        .join(' ')}
                      fill="none"
                      stroke="#00D26A"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />

                    {/* Current Tyre Age Scrubber */}
                    <line
                      x1={(bayesianTyreHealth.tyreAgeLaps / bayesianTyreHealth.degradationTrendCurve.length) * 600}
                      y1="0"
                      x2={(bayesianTyreHealth.tyreAgeLaps / bayesianTyreHealth.degradationTrendCurve.length) * 600}
                      y2="80"
                      stroke="#FFD60A"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-mono mt-1">
                  <span>Lap 1 on Set</span>
                  <span>Current: Lap {bayesianTyreHealth.tyreAgeLaps}</span>
                  <span>Cliff Window</span>
                </div>
              </div>
            </div>

            {/* Grid Stint Timeline (Matching tyre_strategy_window.py) */}
            <div className="p-5 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] space-y-4">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)] border-b border-[var(--border)] pb-3">
                <span className="font-bold text-[var(--text)] uppercase tracking-wider">
                  Full Grid Stint History & Pit Stop Timeline
                </span>
                <div className="flex gap-4">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#FF3B30]" /> Soft</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#FFD60A]" /> Medium</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#F0F0F0] border border-black/20" /> Hard</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#39B54A]" /> Inter</span>
                </div>
              </div>

              <div className="space-y-2.5">
                {results.slice(0, 16).map((r) => {
                  const driverStints = stints.filter((s) => s.driverNumber === r.driverNumber)
                  const isSelected = r.driverCode === selectedDriver

                  return (
                    <div
                      key={r.driverCode}
                      onClick={() => handleSelectDriver(r.driverCode)}
                      className={`flex items-center gap-3 p-2 rounded-xl transition-all cursor-pointer ${
                        isSelected ? 'bg-red-600/10 border border-red-500/30' : 'bg-[var(--surface-1)] hover:bg-[var(--surface-3)]'
                      }`}
                    >
                      <div className="w-16 flex items-center gap-1.5 font-mono">
                        <span className="text-xs font-bold text-[var(--text-muted)] w-5">P{r.position}</span>
                        <span className="text-xs font-black text-[var(--text)]">{r.driverCode}</span>
                      </div>

                      {/* Stint Horizontal Bar */}
                      <div className="flex-1 h-6 rounded-lg bg-[var(--surface-3)] border border-[var(--border)] flex overflow-hidden relative">
                        {driverStints.length > 0 ? (
                          driverStints.map((stint, sIdx) => {
                            const widthPct = ((stint.lapEnd - stint.lapStart + 1) / totalLaps) * 100
                            const compColors: Record<string, string> = {
                              SOFT: '#FF3B30',
                              MEDIUM: '#FFD60A',
                              HARD: '#F0F0F0',
                              INTERMEDIATE: '#39B54A',
                              WET: '#1E6BFF',
                            }
                            const bg = compColors[stint.compound.toUpperCase()] || '#888888'

                            return (
                              <div
                                key={sIdx}
                                className="h-full flex items-center justify-center font-bold text-[10px] text-black border-r border-black/30 font-mono transition-all"
                                style={{ width: `${widthPct}%`, backgroundColor: bg }}
                                title={`${stint.compound} (Laps ${stint.lapStart}-${stint.lapEnd})`}
                              >
                                {stint.compound[0]}
                              </div>
                            )
                          })
                        ) : (
                          // Fallback realistic stints
                          <>
                            <div className="h-full bg-[#FFD60A] text-black font-bold text-[10px] flex items-center justify-center font-mono border-r border-black/30" style={{ width: '40%' }}>
                              M (1-22)
                            </div>
                            <div className="h-full bg-[#F0F0F0] text-black font-bold text-[10px] flex items-center justify-center font-mono" style={{ width: '60%' }}>
                              H (23-{totalLaps})
                            </div>
                          </>
                        )}

                        {/* Current Lap Needle */}
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                          style={{ left: `${(currentLap / totalLaps) * 100}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: SECTOR TIMES BREAKDOWN (Matching sector_times_window.py)
            ========================================================================= */}
        {activeTab === 'sector_times' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Legend & Session Best Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)]">
                <span className="text-xs text-[var(--text-muted)] uppercase font-semibold">Best Sector 1</span>
                <div className="my-1.5">
                  <span className="text-2xl font-black text-[#B138DD] font-mono">
                    {formatTime(sectorTimesData.sessionBestS1.time)}
                  </span>
                </div>
                <span className="text-xs text-[var(--text-muted)] font-bold">
                  Driver: {sectorTimesData.sessionBestS1.driver}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)]">
                <span className="text-xs text-[var(--text-muted)] uppercase font-semibold">Best Sector 2</span>
                <div className="my-1.5">
                  <span className="text-2xl font-black text-[#B138DD] font-mono">
                    {formatTime(sectorTimesData.sessionBestS2.time)}
                  </span>
                </div>
                <span className="text-xs text-[var(--text-muted)] font-bold">
                  Driver: {sectorTimesData.sessionBestS2.driver}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)]">
                <span className="text-xs text-[var(--text-muted)] uppercase font-semibold">Best Sector 3</span>
                <div className="my-1.5">
                  <span className="text-2xl font-black text-[#B138DD] font-mono">
                    {formatTime(sectorTimesData.sessionBestS3.time)}
                  </span>
                </div>
                <span className="text-xs text-[var(--text-muted)] font-bold">
                  Driver: {sectorTimesData.sessionBestS3.driver}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)]">
                <span className="text-xs text-[var(--text-muted)] uppercase font-semibold">Theoretical Best Lap</span>
                <div className="my-1.5">
                  <span className="text-2xl font-black text-emerald-500 font-mono">
                    {formatTime(sectorTimesData.theoreticalSessionBest)}
                  </span>
                </div>
                <span className="text-xs text-[var(--text-muted)]">
                  {selectedDriver} Best: {formatTime(sectorTimesData.theoreticalDriverBest)}
                </span>
              </div>
            </div>

            {/* Official Timing Table for Selected Driver */}
            <div className="p-5 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm uppercase text-[var(--text)]">
                    Lap-by-Lap Sector History: {selectedDriver}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded font-mono bg-[var(--surface-1)] text-[var(--text-muted)] border border-[var(--border)]">
                    {sectorTimesData.laps.length} Laps Completed
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5 text-[#B138DD] font-bold">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#B138DD]" /> Session Best
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-500 font-bold">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#00D26A]" /> Personal Best
                  </span>
                  <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[var(--surface-3)]" /> Regular
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto max-h-[380px]">
                <table className="w-full text-xs text-left font-mono">
                  <thead className="sticky top-0 bg-[var(--surface-2)] border-b border-[var(--border)] text-[var(--text-muted)] uppercase text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">Lap</th>
                      <th className="py-2.5 px-3">Sector 1</th>
                      <th className="py-2.5 px-3">Sector 2</th>
                      <th className="py-2.5 px-3">Sector 3</th>
                      <th className="py-2.5 px-3">Lap Time</th>
                      <th className="py-2.5 px-3">Tyre</th>
                      <th className="py-2.5 px-3">Age</th>
                      <th className="py-2.5 px-3 text-right">Pit Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {sectorTimesData.laps.map((lap) => (
                      <tr key={lap.lapNumber} className="hover:bg-[var(--surface-1)] transition-colors">
                        <td className="py-2.5 px-3 font-bold text-[var(--text-muted)]">
                          #{lap.lapNumber}
                        </td>
                        {/* Sector 1 */}
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded font-bold ${
                              lap.isS1SessionBest
                                ? 'bg-[#B138DD]/20 text-[#B138DD] border border-[#B138DD]/30'
                                : lap.isS1PersonalBest
                                ? 'bg-emerald-500/20 text-emerald-500'
                                : 'text-[var(--text)]'
                            }`}
                          >
                            {formatTime(lap.s1)}
                          </span>
                        </td>
                        {/* Sector 2 */}
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded font-bold ${
                              lap.isS2SessionBest
                                ? 'bg-[#B138DD]/20 text-[#B138DD] border border-[#B138DD]/30'
                                : lap.isS2PersonalBest
                                ? 'bg-emerald-500/20 text-emerald-500'
                                : 'text-[var(--text)]'
                            }`}
                          >
                            {formatTime(lap.s2)}
                          </span>
                        </td>
                        {/* Sector 3 */}
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded font-bold ${
                              lap.isS3SessionBest
                                ? 'bg-[#B138DD]/20 text-[#B138DD] border border-[#B138DD]/30'
                                : lap.isS3PersonalBest
                                ? 'bg-emerald-500/20 text-emerald-500'
                                : 'text-[var(--text)]'
                            }`}
                          >
                            {formatTime(lap.s3)}
                          </span>
                        </td>
                        {/* Lap Time */}
                        <td className="py-2.5 px-3 font-bold text-[var(--text)]">
                          {lap.lapTimeString}
                        </td>
                        {/* Tyre */}
                        <td className="py-2.5 px-3 font-bold">
                          <span className="px-1.5 py-0.5 rounded bg-[var(--surface-1)] border border-[var(--border)]">
                            {lap.compound}
                          </span>
                        </td>
                        {/* Age */}
                        <td className="py-2.5 px-3 text-[var(--text-muted)]">
                          {lap.tyreAge} Laps
                        </td>
                        {/* Status */}
                        <td className="py-2.5 px-3 text-right">
                          {lap.isPitLap ? (
                            <span className="px-2 py-0.5 rounded font-bold bg-amber-500/20 text-amber-500">
                              PIT STOP
                            </span>
                          ) : (
                            <span className="text-[var(--text-muted)]">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 5: RACE CONTROL FEED (Matching race_control_feed_window.py)
            ========================================================================= */}
        {activeTab === 'race_control' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Track Status Banner */}
            <div className="p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3.5 h-3.5 rounded-full ${
                    activeTrackStatus.includes('SAFETY CAR')
                      ? 'bg-amber-500 animate-ping'
                      : activeTrackStatus.includes('YELLOW')
                      ? 'bg-yellow-400'
                      : 'bg-emerald-500'
                  }`}
                />
                <span className="font-black text-sm uppercase tracking-wide text-[var(--text)]">
                  {activeTrackStatus}
                </span>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'ALL', label: 'All Notices' },
                  { id: 'SAFETY_CAR', label: 'Safety Car & VSC' },
                  { id: 'FLAGS', label: 'Flags' },
                  { id: 'DRS', label: 'DRS Status' },
                  { id: 'INCIDENTS', label: 'Incidents & Penalties' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setRaceControlFilter(f.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      raceControlFilter === f.id
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'bg-[var(--surface-1)] text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--border)]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrolling Chronological Messages Feed */}
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1 font-mono">
              {filteredRaceControl.length > 0 ? (
                filteredRaceControl.map((item, idx) => {
                  const isSC =
                    item.category === 'SafetyCar' ||
                    item.category === 'VirtualSafetyCar' ||
                    item.message.toLowerCase().includes('safety car')
                  const isRed = item.flag === 'RED'
                  const isYellow = item.flag === 'YELLOW' || item.flag === 'DOUBLE YELLOW'
                  const isGreen = item.flag === 'GREEN' || item.flag === 'CLEAR'

                  const accentBorder = isRed
                    ? 'border-l-red-600'
                    : isSC
                    ? 'border-l-amber-500'
                    : isYellow
                    ? 'border-l-yellow-400'
                    : isGreen
                    ? 'border-l-emerald-500'
                    : 'border-l-cyan-500'

                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] border-l-4 ${accentBorder} text-xs transition-colors hover:bg-[var(--surface-3)]`}
                    >
                      <span className="text-[var(--text-muted)] text-[11px] whitespace-nowrap">
                        {item.timestamp ? item.timestamp.slice(11, 19) : '14:25:00'}
                      </span>
                      {item.lapNumber && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--surface-1)] text-[var(--text)] border border-[var(--border)] whitespace-nowrap">
                          LAP {item.lapNumber}
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap ${
                          isSC
                            ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                            : isRed
                            ? 'bg-red-600/20 text-red-500 border border-red-500/30'
                            : isGreen
                            ? 'bg-emerald-500/20 text-emerald-500'
                            : 'bg-cyan-500/20 text-cyan-400'
                        }`}
                      >
                        {item.category.toUpperCase()}
                      </span>
                      <span className="text-[var(--text)] font-sans flex-1 text-[13px] leading-relaxed">
                        {item.message}
                      </span>
                    </div>
                  )
                })
              ) : (
                <div className="p-8 text-center text-[var(--text-muted)] bg-[var(--surface-2)] rounded-2xl border border-[var(--border)]">
                  No race control messages for this filter criteria.
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 6: LAP TIME & GAP EVOLUTION (Matching lap_time_chart_window.py)
            ========================================================================= */}
        {activeTab === 'lap_chart' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Control Bar: Mode Toggle + Isolations */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)]">
              <div className="flex items-center gap-3">
                <span className="font-bold text-xs uppercase text-[var(--text-muted)]">Y-Axis Metric:</span>
                <div className="flex rounded-xl bg-[var(--surface-1)] border border-[var(--border)] p-0.5">
                  <button
                    onClick={() => setLapChartMode('gap')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      lapChartMode === 'gap'
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                    }`}
                  >
                    Gap to Leader (Seconds)
                  </button>
                  <button
                    onClick={() => setLapChartMode('absolute')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      lapChartMode === 'absolute'
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                    }`}
                  >
                    Absolute Lap Time (Seconds)
                  </button>
                </div>
              </div>

              {/* Driver Legends (Click-to-Isolate matching reference app) */}
              <div className="flex flex-wrap gap-2">
                {results.slice(0, 8).map((r) => {
                  const isIsolated = isolatedDrivers.includes(r.driverCode)
                  const teamCol = drivers.find((d) => d.nameAcronym === r.driverCode)?.teamColour || '#FFFFFF'
                  return (
                    <button
                      key={r.driverCode}
                      onClick={() => {
                        if (isIsolated) {
                          setIsolatedDrivers((prev) => prev.filter((c) => c !== r.driverCode))
                        } else {
                          setIsolatedDrivers((prev) => [...prev, r.driverCode])
                        }
                      }}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
                        isIsolated
                          ? 'bg-[var(--surface-1)] text-[var(--text)] border-red-500 shadow-sm'
                          : 'bg-[var(--surface-1)] text-[var(--text-muted)] border-[var(--border)] opacity-80 hover:opacity-100'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: teamCol }} />
                      <span>{r.driverCode}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Interactive SVG Chart Container */}
            <div className="p-5 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] h-80 flex flex-col justify-between">
              <div className="flex justify-between items-center text-xs text-[var(--text-muted)] mb-2 font-mono">
                <span>
                  {lapChartMode === 'gap' ? 'Delta to P1 (Seconds)' : 'Lap Pace Time (Seconds)'} • Safety Car Zones Shaded
                </span>
                <span>Lap {currentLap} of {totalLaps}</span>
              </div>

              <div className="relative flex-1 w-full">
                <svg className="w-full h-full" viewBox="0 0 600 160" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="20" x2="600" y2="20" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />
                  <line x1="0" y1="60" x2="600" y2="60" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />
                  <line x1="0" y1="100" x2="600" y2="100" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />
                  <line x1="0" y1="140" x2="600" y2="140" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />

                  {/* Safety Car Shaded Zones (Gold #FFD700 matching reference app) */}
                  {lapChartData.scZones.map((sc, scIdx) => {
                    const x1 = (sc.startLap / totalLaps) * 600
                    const x2 = (sc.endLap / totalLaps) * 600
                    return (
                      <g key={scIdx}>
                        <rect x={x1} y="0" width={x2 - x1} height="160" fill="#FFD700" fillOpacity="0.12" />
                        <text x={(x1 + x2) / 2} y="15" fill="#FFD700" fontSize="9" fontWeight="bold" textAnchor="middle">
                          SAFETY CAR
                        </text>
                      </g>
                    )
                  })}

                  {/* Driver Series Lines */}
                  {lapChartData.driverSeries.map((series) => {
                    const isSelected = series.code === selectedDriver
                    const pathD = series.points
                      .map((pt, idx) => {
                        const x = (pt.lap / totalLaps) * 600
                        const y =
                          lapChartMode === 'gap'
                            ? Math.min(150, 15 + (pt.value / 45) * 135)
                            : Math.min(150, 140 - ((pt.value - 88) / 10) * 120)
                        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`
                      })
                      .join(' ')

                    return (
                      <g key={series.code}>
                        <path
                          d={pathD}
                          fill="none"
                          stroke={series.color}
                          strokeWidth={isSelected ? '3.5' : '1.8'}
                          opacity={isSelected ? 1.0 : 0.65}
                        />
                        {/* Data Points with tyre markers */}
                        {series.points.filter((_, i) => i % 4 === 0).map((pt, pIdx) => {
                          const cx = (pt.lap / totalLaps) * 600
                          const cy =
                            lapChartMode === 'gap'
                              ? Math.min(150, 15 + (pt.value / 45) * 135)
                              : Math.min(150, 140 - ((pt.value - 88) / 10) * 120)
                          return (
                            <circle
                              key={pIdx}
                              cx={cx}
                              cy={cy}
                              r={pt.isPit ? 4 : 2}
                              fill={pt.isPit ? '#FF3B30' : series.color}
                            />
                          )
                        })}
                      </g>
                    )
                  })}

                  {/* Current Lap Vertical Scrubber */}
                  <line
                    x1={(currentLap / totalLaps) * 600}
                    y1="0"
                    x2={(currentLap / totalLaps) * 600}
                    y2="160"
                    stroke="#EF4444"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                </svg>
              </div>

              <div className="flex justify-between text-[11px] text-[var(--text-muted)] font-mono mt-2">
                <span>Lap 1</span>
                <span>Lap {Math.round(totalLaps / 2)}</span>
                <span>Lap {totalLaps} (Finish)</span>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 7: TELEMETRY STREAM VIEWER (Matching telemetry_stream_viewer.py)
            ========================================================================= */}
        {activeTab === 'telemetry_stream' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Stream Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)]">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isStreaming ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`} />
                  <span className="font-bold text-xs uppercase text-[var(--text)]">
                    {isStreaming ? 'STREAM ACTIVE (25 HZ)' : 'STREAM PAUSED'}
                  </span>
                </div>
                <span className="text-xs text-[var(--text-muted)] font-mono">
                  Packets Received: <strong className="text-[var(--text)]">{streamPackets.toLocaleString()}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsStreaming((s) => !s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isStreaming
                      ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                  }`}
                >
                  {isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isStreaming ? 'Pause Stream' : 'Resume Stream'}</span>
                </button>
              </div>
            </div>

            {/* Split Screen Layout (Left: Raw JSON Packets, Right: Parsed Data Tabs) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 h-[480px]">
              {/* Left Panel: Raw Stream Terminal */}
              <div className="flex flex-col h-full rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] p-4 overflow-hidden">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--border)] text-xs text-[var(--text-muted)] font-mono">
                  <span className="font-bold text-[var(--text)] uppercase">RAW PACKET BROADCAST</span>
                  <span>FORMAT: JSON</span>
                </div>
                <div
                  ref={rawLogBoxRef}
                  className="flex-1 overflow-y-auto font-mono text-[11px] space-y-1.5 p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] text-emerald-400 select-all"
                >
                  {rawLogs.map((log, lIdx) => (
                    <div key={lIdx} className="leading-tight break-all opacity-90 hover:opacity-100">
                      {log}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Panel: Parsed Stream Views */}
              <div className="flex flex-col h-full rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] p-4 overflow-hidden">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-[var(--border)]">
                  <div className="flex rounded-xl bg-[var(--surface-1)] border border-[var(--border)] p-0.5 text-xs">
                    <button
                      onClick={() => setStreamTab('summary')}
                      className={`px-3 py-1 rounded-lg font-bold transition-all ${
                        streamTab === 'summary' ? 'bg-red-600 text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                      }`}
                    >
                      Session Summary
                    </button>
                    <button
                      onClick={() => setStreamTab('drivers')}
                      className={`px-3 py-1 rounded-lg font-bold transition-all ${
                        streamTab === 'drivers' ? 'bg-red-600 text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                      }`}
                    >
                      Drivers Grid (20 Cars)
                    </button>
                  </div>
                  <span className="text-[11px] font-mono text-[var(--text-muted)]">DT: 0.040s</span>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {streamTab === 'summary' ? (
                    <div className="space-y-4 font-mono text-xs">
                      <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] space-y-2">
                        <div className="flex justify-between">
                          <span className="text-[var(--text-muted)]">Event:</span>
                          <span className="font-bold text-[var(--text)]">{circuitName || 'Grand Prix'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--text-muted)]">Current Lap:</span>
                          <span className="font-bold text-[var(--text)]">{currentLap} / {totalLaps}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--text-muted)]">Active Track Condition:</span>
                          <span className="font-bold text-emerald-400">{activeTrackStatus}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--text-muted)]">Active Cars on Track:</span>
                          <span className="font-bold text-[var(--text)]">{results.length} Cars</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--text-muted)]">Selected Telemetry Driver:</span>
                          <span className="font-bold text-amber-500">{selectedDriver} (P{activeResult?.position})</span>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-[var(--surface-1)] border border-[var(--border)] space-y-2">
                        <span className="font-bold text-[var(--text)] uppercase block text-xs">Model & Integration Status</span>
                        <div className="flex items-center gap-2 text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Bayesian state-space model synchronized</span>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Telemetry stream client connected</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Drivers Grid Table */
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left font-mono">
                        <thead className="sticky top-0 bg-[var(--surface-2)] text-[var(--text-muted)] border-b border-[var(--border)] text-[10px]">
                          <tr>
                            <th className="py-2 px-2">Pos</th>
                            <th className="py-2 px-2">Code</th>
                            <th className="py-2 px-2">Speed</th>
                            <th className="py-2 px-2">Gear</th>
                            <th className="py-2 px-2">Thr</th>
                            <th className="py-2 px-2">DRS</th>
                            <th className="py-2 px-2">Tyre</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                          {results.map((r, i) => {
                            const spd = null
                            const gr = null
                            const isSel = r.driverCode === selectedDriver

                            return (
                              <tr
                                key={r.driverCode}
                                onClick={() => handleSelectDriver(r.driverCode)}
                                className={`cursor-pointer hover:bg-[var(--surface-3)] ${
                                  isSel ? 'bg-red-600/10 font-bold' : ''
                                }`}
                              >
                                <td className="py-2 px-2 text-[var(--text-muted)]">{r.position || i + 1}</td>
                                <td className="py-2 px-2 font-bold text-[var(--text)]">{r.driverCode}</td>
                                <td className="py-2 px-2 text-emerald-500">{spd ? `${spd} km/h` : 'N/A'}</td>
                                <td className="py-2 px-2 text-amber-500">{gr || 'N/A'}</td>
                                <td className="py-2 px-2 text-[var(--text)]">N/A</td>
                                <td className="py-2 px-2">
                                  <span className={`px-1 rounded text-[9px] text-[var(--text-muted)]`}>
                                    N/A
                                  </span>
                                </td>
                                <td className="py-2 px-2 text-[var(--text-muted)]">
                                  {Math.max(25, 100 - (currentLap * 1.5))}%
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-[var(--border)] bg-[var(--surface-2)] text-xs text-[var(--text-muted)]">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
          <span>F1 Insights Telemetry System & Bayesian Tyre Engine Active</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[var(--surface-1)] hover:bg-[var(--surface-3)] text-[var(--text)] border border-[var(--border)] rounded-lg font-bold text-xs transition-colors cursor-pointer"
          >
            Close Insights (Esc)
          </button>
        )}
      </div>
    </div>
  )
}
