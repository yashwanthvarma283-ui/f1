import React, { useState, useMemo } from 'react'
import {
  BarChart3,
  TrendingUp,
  Sliders,
  Check,
  ChevronDown,
  Sparkles,
  Zap,
} from 'lucide-react'
import { getTeamMeta } from '@/lib/teams'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  LapPositionSnapshot,
  LapData,
  DriverSessionInfo,
  DriverRaceSummaryStats,
} from '@/types/data'

interface PacePositionsTabProps {
  positionsByLap: LapPositionSnapshot[]
  laps: LapData[]
  drivers: DriverSessionInfo[]
  driverStats: DriverRaceSummaryStats[]
}

type ChartViewMode = 'positions' | 'lap-times' | 'gap-to-leader'

export const PacePositionsTab: React.FC<PacePositionsTabProps> = ({
  positionsByLap,
  laps,
  drivers,
  driverStats,
}) => {
  const [viewMode, setViewMode] = useState<ChartViewMode>('positions')
  const [filterOutliers, setFilterOutliers] = useState<boolean>(true)
  const [selectedDrivers, setSelectedDrivers] = useState<number[]>([1, 11, 55, 16, 4]) // Default top 5
  const [compareDriverA, setCompareDriverA] = useState<number>(1)
  const [compareDriverB, setCompareDriverB] = useState<number>(16)

  // Driver map
  const driverMap = useMemo(() => {
    const map = new Map<number, DriverSessionInfo>()
    drivers.forEach((d) => map.set(d.driverNumber, d))
    return map
  }, [drivers])

  const statsMap = useMemo(() => {
    const map = new Map<number, DriverRaceSummaryStats>()
    driverStats.forEach((s) => map.set(s.driverNumber, s))
    return map
  }, [driverStats])

  const totalLaps = useMemo(() => {
    if (!positionsByLap || positionsByLap.length === 0) return 57
    return Math.max(...positionsByLap.map((p) => p.lap))
  }, [positionsByLap])

  // Toggle driver selection
  const toggleDriver = (driverNumber: number) => {
    setSelectedDrivers((prev) => {
      if (prev.includes(driverNumber)) {
        if (prev.length === 1) return prev // Keep at least one
        return prev.filter((n) => n !== driverNumber)
      }
      return [...prev, driverNumber]
    })
  }

  // Head-to-head calculations
  const comparison = useMemo(() => {
    const aStats = statsMap.get(compareDriverA)
    const bStats = statsMap.get(compareDriverB)
    const aDriver = driverMap.get(compareDriverA)
    const bDriver = driverMap.get(compareDriverB)

    // Laps faster count
    let aFaster = 0
    let bFaster = 0

    for (let lap = 1; lap <= totalLaps; lap++) {
      const aLap = laps.find((l) => l.driverNumber === compareDriverA && l.lapNumber === lap)
      const bLap = laps.find((l) => l.driverNumber === compareDriverB && l.lapNumber === lap)
      if (aLap?.lapDuration && bLap?.lapDuration) {
        if (aLap.lapDuration < bLap.lapDuration) aFaster++
        else if (bLap.lapDuration < aLap.lapDuration) bFaster++
      }
    }

    return { aStats, bStats, aDriver, bDriver, aFaster, bFaster }
  }, [compareDriverA, compareDriverB, statsMap, driverMap, laps, totalLaps])

  // SVG Chart Dimensions
  const svgWidth = 850
  const svgHeight = 340
  const padding = { top: 20, right: 30, bottom: 30, left: 40 }
  const chartW = svgWidth - padding.left - padding.right
  const chartH = svgHeight - padding.top - padding.bottom

  // Position chart paths
  const positionPaths = useMemo(() => {
    return selectedDrivers.map((driverNumber) => {
      const driver = driverMap.get(driverNumber)
      const team = getTeamMeta(driver?.teamName)

      const points: { x: number; y: number }[] = []
      for (let lap = 1; lap <= totalLaps; lap++) {
        const snap = positionsByLap.find((p) => p.lap === lap)
        const posEntry = snap?.positions.find((p) => p.driverNumber === driverNumber)
        if (posEntry) {
          const x = padding.left + ((lap - 1) / (totalLaps - 1)) * chartW
          // Inverted Y: P1 is near top, P20 near bottom
          const y = padding.top + ((posEntry.position - 1) / 19) * chartH
          points.push({ x, y })
        }
      }

      const d =
        points.length > 0
          ? `M ${points.map((pt) => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' L ')}`
          : ''

      return {
        driverNumber,
        code: driver?.nameAcronym || String(driverNumber),
        color: team.color,
        d,
        lastPoint: points[points.length - 1],
      }
    })
  }, [selectedDrivers, positionsByLap, totalLaps, driverMap, chartW, chartH, padding])

  // Lap time chart paths (with outlier filtering)
  const lapTimePaths = useMemo(() => {
    // Determine min and max lap times across selected drivers
    let minTime = 80
    let maxTime = 110

    const validLaps = laps.filter((l) => selectedDrivers.includes(l.driverNumber) && l.lapDuration)
    if (validLaps.length > 0) {
      const durations = validLaps.map((l) => l.lapDuration as number).sort((a, b) => a - b)
      const median = durations[Math.floor(durations.length / 2)]
      const threshold = filterOutliers ? median * 1.12 : 150

      const filtered = durations.filter((d) => d <= threshold)
      if (filtered.length > 0) {
        minTime = Math.floor(filtered[0])
        maxTime = Math.ceil(filtered[filtered.length - 1])
      }
    }

    const timeRange = Math.max(1, maxTime - minTime)

    return selectedDrivers.map((driverNumber) => {
      const driver = driverMap.get(driverNumber)
      const team = getTeamMeta(driver?.teamName)

      const points: { x: number; y: number }[] = []
      for (let lap = 1; lap <= totalLaps; lap++) {
        const lapData = laps.find((l) => l.driverNumber === driverNumber && l.lapNumber === lap)
        if (lapData?.lapDuration && (!filterOutliers || lapData.lapDuration <= maxTime)) {
          const x = padding.left + ((lap - 1) / (totalLaps - 1)) * chartW
          const clamped = Math.max(minTime, Math.min(maxTime, lapData.lapDuration))
          const y = padding.top + chartH - ((clamped - minTime) / timeRange) * chartH
          points.push({ x, y })
        }
      }

      const d =
        points.length > 0
          ? `M ${points.map((pt) => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' L ')}`
          : ''

      return {
        driverNumber,
        code: driver?.nameAcronym || String(driverNumber),
        color: team.color,
        d,
      }
    })
  }, [selectedDrivers, laps, totalLaps, filterOutliers, driverMap, chartW, chartH, padding])

  return (
    <div className="space-y-8">
      {/* 1. View Mode Switcher & Outlier Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[var(--accent)]" />
            <h2 className="text-xl font-display font-black uppercase tracking-tight text-[var(--text)]">
              Pace &amp; Position Telemetry
            </h2>
          </div>
          <p className="text-xs font-mono text-[var(--text-muted)] mt-0.5">
            Full-race position progression, lap-by-lap pace curves, and head-to-head teammate comparison
          </p>
        </div>

        <div className="flex items-center gap-3">
          {viewMode === 'lap-times' && (
            <button
              onClick={() => setFilterOutliers((p) => !p)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-colors ${
                filterOutliers
                  ? 'bg-[var(--accent-glow-subtle)] text-[var(--accent)] border-[var(--accent)]'
                  : 'bg-[var(--surface-2)] text-[var(--text-muted)] border-[var(--border)]'
              }`}
            >
              <span>Outlier Filter</span>
              {filterOutliers ? 'ON' : 'OFF'}
            </button>
          )}

          <div className="flex items-center bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-1">
            {(
              [
                { id: 'positions', label: 'Positions' },
                { id: 'lap-times', label: 'Lap Pace' },
              ] as const
            ).map((mode) => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  viewMode === mode.id
                    ? 'bg-[var(--accent)] text-white shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Driver Multi-Filter Pills */}
      <div className="f1-card-accent p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] space-y-2">
        <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
          Select Drivers to Plot on Chart:
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {drivers.map((d) => {
            const isSelected = selectedDrivers.includes(d.driverNumber)
            const team = getTeamMeta(d.teamName)

            return (
              <button
                key={d.driverNumber}
                onClick={() => toggleDriver(d.driverNumber)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all border ${
                  isSelected
                    ? 'bg-[var(--surface-2)] text-[var(--text)] border-[var(--accent)] shadow-xs'
                    : 'bg-[var(--surface-1)] text-[var(--text-muted)] border-[var(--border)] opacity-60 hover:opacity-100'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: team.color }}
                />
                <span>{d.nameAcronym}</span>
                {isSelected && <Check className="w-3 h-3 text-[var(--accent)]" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* 3. Interactive SVG Chart Canvas */}
      <div className="f1-card-accent p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] space-y-3 overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
          <h3 className="font-display font-black text-sm uppercase tracking-tight text-[var(--text)]">
            {viewMode === 'positions'
              ? 'Position Trajectory (P1 to P20 by Lap)'
              : 'Lap Pace Delta in Seconds (Clean Racing Pace)'}
          </h3>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">
            LAPS 1 &ndash; {totalLaps}
          </span>
        </div>

        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto min-w-[700px] font-mono text-[10px]"
          >
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((frac, idx) => {
              const y = padding.top + frac * chartH
              const label =
                viewMode === 'positions'
                  ? `P${Math.round(1 + frac * 19)}`
                  : `${(85 + (1 - frac) * 20).toFixed(0)}s`

              return (
                <g key={idx}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={padding.left + chartW}
                    y2={y}
                    stroke="var(--border)"
                    strokeDasharray="4 4"
                    opacity={0.6}
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 3}
                    textAnchor="end"
                    fill="var(--text-muted)"
                    fontSize={10}
                  >
                    {label}
                  </text>
                </g>
              )
            })}

            {/* X-axis ticks (Laps) */}
            {[1, Math.round(totalLaps / 4), Math.round(totalLaps / 2), Math.round((totalLaps * 3) / 4), totalLaps].map(
              (lap, i) => {
                const x = padding.left + ((lap - 1) / (totalLaps - 1)) * chartW
                return (
                  <g key={i}>
                    <line
                      x1={x}
                      y1={padding.top + chartH}
                      x2={x}
                      y2={padding.top + chartH + 5}
                      stroke="var(--border)"
                    />
                    <text
                      x={x}
                      y={padding.top + chartH + 18}
                      textAnchor="middle"
                      fill="var(--text-muted)"
                      fontSize={10}
                    >
                      L{lap}
                    </text>
                  </g>
                )
              }
            )}

            {/* Lines */}
            {(viewMode === 'positions' ? positionPaths : lapTimePaths).map((p) => (
              <g key={p.driverNumber}>
                <path
                  d={p.d}
                  fill="none"
                  stroke={p.color}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={0.88}
                />
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* 4. Head-to-Head Driver Compare Mode */}
      <div className="f1-card-accent p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="font-display font-black text-sm uppercase tracking-tight text-[var(--text)]">
              Head-to-Head Telemetry Comparison
            </h3>
          </div>
          <span className="text-xs font-mono text-[var(--text-muted)]">
            DIRECT DRILL-DOWN BETWEEN TWO DRIVERS
          </span>
        </div>

        {/* Driver Pickers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-[var(--text-muted)] uppercase">
              Driver 1 (Left)
            </label>
            <select
              value={compareDriverA}
              onChange={(e) => setCompareDriverA(parseInt(e.target.value, 10))}
              className="w-full p-2.5 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-xs font-mono text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
            >
              {drivers.map((d) => (
                <option key={d.driverNumber} value={d.driverNumber}>
                  #{d.driverNumber} {d.fullName} ({d.teamName})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-[var(--text-muted)] uppercase">
              Driver 2 (Right)
            </label>
            <select
              value={compareDriverB}
              onChange={(e) => setCompareDriverB(parseInt(e.target.value, 10))}
              className="w-full p-2.5 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-xs font-mono text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
            >
              {drivers.map((d) => (
                <option key={d.driverNumber} value={d.driverNumber}>
                  #{d.driverNumber} {d.fullName} ({d.teamName})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Head-to-Head Comparison Card */}
        {comparison.aDriver && comparison.bDriver && (
          <div className="p-5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-4">
            {/* Laps Faster Comparison Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="font-bold text-[var(--text)]">
                  {comparison.aDriver.nameAcronym}: {comparison.aFaster} laps faster
                </span>
                <span className="font-bold text-[var(--text)]">
                  {comparison.bDriver.nameAcronym}: {comparison.bFaster} laps faster
                </span>
              </div>

              <div className="w-full h-3 rounded-full overflow-hidden bg-[var(--surface-3)] flex">
                <div
                  style={{
                    width: `${
                      (comparison.aFaster / Math.max(1, comparison.aFaster + comparison.bFaster)) *
                      100
                    }%`,
                    backgroundColor: getTeamMeta(comparison.aDriver.teamName).color,
                  }}
                  className="h-full transition-all"
                />
                <div
                  style={{
                    width: `${
                      (comparison.bFaster / Math.max(1, comparison.aFaster + comparison.bFaster)) *
                      100
                    }%`,
                    backgroundColor: getTeamMeta(comparison.bDriver.teamName).color,
                  }}
                  className="h-full transition-all"
                />
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 text-xs font-mono pt-3 border-t border-[var(--border)] text-center">
              <div className="font-bold text-[var(--text)]">
                P{comparison.aStats?.finish || '--'}
              </div>
              <div className="text-[10px] text-[var(--text-muted)] uppercase">Finish Position</div>
              <div className="font-bold text-[var(--text)]">
                P{comparison.bStats?.finish || '--'}
              </div>

              <div className="font-bold text-[var(--text)]">
                {comparison.aStats?.fastestLapTime || '--'}
              </div>
              <div className="text-[10px] text-[var(--text-muted)] uppercase">Fastest Lap</div>
              <div className="font-bold text-[var(--text)]">
                {comparison.bStats?.fastestLapTime || '--'}
              </div>

              <div className="font-bold text-[var(--text)]">
                {comparison.aStats?.averagePaceSeconds ? `${comparison.aStats.averagePaceSeconds.toFixed(2)}s` : '--'}
              </div>
              <div className="text-[10px] text-[var(--text-muted)] uppercase">Average Pace</div>
              <div className="font-bold text-[var(--text)]">
                {comparison.bStats?.averagePaceSeconds ? `${comparison.bStats.averagePaceSeconds.toFixed(2)}s` : '--'}
              </div>

              <div className="font-bold text-[var(--text)]">
                {comparison.aStats?.pitStopCount || 0} stops
              </div>
              <div className="text-[10px] text-[var(--text-muted)] uppercase">Pit Stops</div>
              <div className="font-bold text-[var(--text)]">
                {comparison.bStats?.pitStopCount || 0} stops
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
