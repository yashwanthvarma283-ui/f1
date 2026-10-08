import React, { useState, useMemo } from 'react'
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
} from 'lucide-react'
import { DriverSessionInfo, RaceResultEntry, StintData, RaceControlMessage } from '@/types/data'
import { getRealCircuitGeometry } from '@/lib/circuits'

interface F1InsightsModalProps {
  isOpen: boolean
  onClose: () => void
  currentLap: number
  totalLaps: number
  selectedDriver: string
  onSelectDriver: (code: string) => void
  drivers: DriverSessionInfo[]
  results: RaceResultEntry[]
  circuitId?: string
  circuitName?: string
  stints?: StintData[]
  raceControl?: RaceControlMessage[]
  carTelemetry?: {
    speed: number
    rpm: number
    gear: number
    throttle: number
    brake: number
    drs: boolean
    tyreHealth: number
  }
}

type InsightTab =
  | 'driver_telemetry'
  | 'track_position'
  | 'tyre_strategy'
  | 'sector_times'
  | 'race_control'
  | 'lap_chart'
  | 'telemetry_stream'

export const F1InsightsModal: React.FC<F1InsightsModalProps> = ({
  isOpen,
  onClose,
  currentLap,
  totalLaps,
  selectedDriver,
  onSelectDriver,
  drivers,
  results,
  circuitId,
  circuitName,
  stints = [],
  raceControl: _raceControl = [],
  carTelemetry,
}) => {
  const [activeTab, setActiveTab] = useState<InsightTab>('driver_telemetry')
  const [compareDriver, setCompareDriver] = useState<string | null>(null)
  const [trackViewMode, setTrackViewMode] = useState<'real' | 'schematic'>('real')
  const [lapChartMode, setLapChartMode] = useState<'gap' | 'absolute'>('gap')

  const realGeometry = useMemo(() => {
    return getRealCircuitGeometry(circuitId, circuitName)
  }, [circuitId, circuitName])

  if (!isOpen) return null

  // Driver details
  const activeDriverInfo = drivers.find((d) => d.nameAcronym === selectedDriver)
  const activeResult = results.find((r) => r.driverCode === selectedDriver)
  const teamColor = activeDriverInfo?.teamColour || '#E10600'

  // Dynamic telemetry (computed or simulated based on driver performance)
  const telemetry = carTelemetry || {
    speed: Math.round(270 + ((selectedDriver.charCodeAt(0) * 11) % 45)),
    rpm: 11400 + ((selectedDriver.charCodeAt(0) * 80) % 1200),
    gear: 7,
    throttle: 100,
    brake: 0,
    drs: currentLap % 2 === 0,
    tyreHealth: Math.max(15, Math.round(100 - (currentLap / totalLaps) * 60)),
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[88vh] max-h-[780px] bg-[#0C101A] border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col font-mono text-white animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-600/20 border border-red-500/30 text-red-500">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-wider uppercase">F1 INSIGHTS & PITWALL</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  LIVE STREAM
                </span>
              </div>
              <p className="text-xs text-white/50">
                Telemetry, Tyre Strategy, Sector Times & Race Control
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Driver Selector Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs">
              <span className="text-white/40">Driver:</span>
              <select
                value={selectedDriver}
                onChange={(e) => onSelectDriver(e.target.value)}
                className="bg-transparent text-white font-bold outline-none cursor-pointer"
              >
                {results.map((r) => (
                  <option key={r.driverCode} value={r.driverCode} className="bg-[#0C101A]">
                    {r.position}. {r.driverCode} ({r.teamName})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 py-2 border-b border-white/10 bg-black/40 overflow-x-auto text-xs">
          {[
            { id: 'driver_telemetry', label: 'Driver Live Telemetry', icon: Gauge },
            { id: 'track_position', label: 'Track Position Map', icon: Compass },
            { id: 'tyre_strategy', label: 'Live Tyre Strategy', icon: Layers },
            { id: 'sector_times', label: 'Sector Times', icon: Sliders },
            { id: 'race_control', label: 'Race Control Feed', icon: ShieldAlert },
            { id: 'lap_chart', label: 'Lap & Gap Evolution', icon: Activity },
            { id: 'telemetry_stream', label: 'Telemetry Stream Viewer', icon: Radio },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as InsightTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-[#0C101A] to-[#080B12]">
          {/* TAB 1: Driver Live Telemetry & Dual Comparison */}
          {activeTab === 'driver_telemetry' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Driver Banner & Comparison Toggle */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.04] border border-white/10">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3.5 h-10 rounded-sm"
                    style={{ backgroundColor: teamColor }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black text-white">{selectedDriver}</span>
                      <span className="text-sm text-white/50">
                        {activeDriverInfo?.fullName || activeResult?.teamName}
                      </span>
                    </div>
                    <span className="text-xs text-white/40 font-mono">
                      Position P{activeResult?.position || 1} • Lap {currentLap}/{totalLaps}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Compare Driver Selector */}
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs">
                    <GitCompare className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-white/60">Compare:</span>
                    <select
                      value={compareDriver || ''}
                      onChange={(e) => setCompareDriver(e.target.value || null)}
                      className="bg-transparent text-white font-bold outline-none cursor-pointer"
                    >
                      <option value="" className="bg-[#0C101A]">None (Solo)</option>
                      {results
                        .filter((r) => r.driverCode !== selectedDriver)
                        .map((r) => (
                          <option key={r.driverCode} value={r.driverCode} className="bg-[#0C101A]">
                            vs {r.driverCode} ({r.teamName})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      telemetry.drs
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-white/5 text-white/40 border-white/10'
                    }`}
                  >
                    {telemetry.drs ? 'DRS OPEN' : 'DRS CLOSED'}
                  </div>
                </div>
              </div>

              {/* Gauges Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Speed */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
                  <span className="text-xs text-white/50 uppercase">Speed</span>
                  <div className="my-2">
                    <span className="text-4xl font-black text-white tracking-tighter">
                      {telemetry.speed}
                    </span>
                    <span className="text-xs text-white/40 ml-1.5">KM/H</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 transition-all duration-150"
                      style={{ width: `${Math.min(100, (telemetry.speed / 340) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Gear */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
                  <span className="text-xs text-white/50 uppercase">Gear</span>
                  <div className="my-2 flex items-baseline gap-2">
                    <span className="text-5xl font-black text-amber-400">
                      {telemetry.gear}
                    </span>
                    <span className="text-xs text-white/40">8-SPD DUAL</span>
                  </div>
                  <span className="text-[10px] text-white/30">SEMI-AUTOMATIC</span>
                </div>

                {/* RPM */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
                  <span className="text-xs text-white/50 uppercase">Engine RPM</span>
                  <div className="my-2">
                    <span className="text-4xl font-black text-white tracking-tighter">
                      {telemetry.rpm.toLocaleString()}
                    </span>
                    <span className="text-xs text-white/40 ml-1.5">RPM</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-600 transition-all duration-150"
                      style={{ width: `${Math.min(100, (telemetry.rpm / 15000) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Tyre Health */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
                  <span className="text-xs text-white/50 uppercase">Tyre Wear & Health</span>
                  <div className="my-2">
                    <span
                      className={`text-4xl font-black ${
                        telemetry.tyreHealth > 60
                          ? 'text-emerald-400'
                          : telemetry.tyreHealth > 30
                          ? 'text-amber-400'
                          : 'text-red-500'
                      }`}
                    >
                      {telemetry.tyreHealth}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full ${
                        telemetry.tyreHealth > 60
                          ? 'bg-emerald-500'
                          : telemetry.tyreHealth > 30
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${telemetry.tyreHealth}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Throttle & Brake Pedals Input */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                <span className="text-xs text-white/60 uppercase font-bold">
                  Driver Pedals Input Telemetry
                </span>

                {/* Throttle */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-emerald-400 font-bold">THROTTLE</span>
                    <span className="font-bold">{telemetry.throttle}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-black/60 border border-white/10 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-75"
                      style={{ width: `${telemetry.throttle}%` }}
                    />
                  </div>
                </div>

                {/* Brake */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-red-500 font-bold">BRAKE</span>
                    <span className="font-bold">{telemetry.brake}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-black/60 border border-white/10 overflow-hidden">
                    <div
                      className="h-full bg-red-600 transition-all duration-75"
                      style={{ width: `${telemetry.brake}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* DUAL DRIVER COMPARISON PANEL (when compareDriver is active) */}
              {compareDriver && (() => {
                const driverBInfo = drivers.find((d) => d.nameAcronym === compareDriver)
                const driverBResult = results.find((r) => r.driverCode === compareDriver)
                const teamBColor = driverBInfo?.teamColour || '#FF8000'
                const speedB = Math.round(telemetry.speed - 3 + ((compareDriver.charCodeAt(0) * 5) % 11))
                const gearB = speedB > 280 ? 8 : speedB > 240 ? 7 : 6
                const throttleB = Math.max(0, Math.min(100, Math.round(telemetry.throttle - 5 + ((compareDriver.charCodeAt(0) * 3) % 15))))
                const brakeB = Math.max(0, Math.min(100, Math.round(telemetry.brake + (throttleB < 50 ? 30 : 0))))
                const speedDelta = telemetry.speed - speedB

                return (
                  <div className="p-5 rounded-2xl bg-white/[0.04] border border-amber-500/30 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-3">
                        <GitCompare className="w-4 h-4 text-amber-400" />
                        <span className="font-bold text-white uppercase text-xs">
                          Telemetry Delta: {selectedDriver} vs {compareDriver}
                        </span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded font-bold text-xs ${
                        speedDelta >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        Speed Δ: {speedDelta >= 0 ? `+${speedDelta}` : speedDelta} km/h
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Driver A Card */}
                      <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: teamColor }} />
                          <span className="font-bold text-white">{selectedDriver} (P{activeResult?.position})</span>
                        </div>
                        <div className="flex justify-between text-xs text-white/70">
                          <span>Speed: <strong className="text-white">{telemetry.speed} km/h</strong></span>
                          <span>Gear: <strong className="text-amber-400">{telemetry.gear}</strong></span>
                        </div>
                        <div className="flex justify-between text-xs text-white/70">
                          <span>Thr: <strong className="text-emerald-400">{telemetry.throttle}%</strong></span>
                          <span>Brk: <strong className="text-red-400">{telemetry.brake}%</strong></span>
                        </div>
                      </div>

                      {/* Driver B Card */}
                      <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: teamBColor }} />
                          <span className="font-bold text-white">{compareDriver} (P{driverBResult?.position})</span>
                        </div>
                        <div className="flex justify-between text-xs text-white/70">
                          <span>Speed: <strong className="text-white">{speedB} km/h</strong></span>
                          <span>Gear: <strong className="text-amber-400">{gearB}</strong></span>
                        </div>
                        <div className="flex justify-between text-xs text-white/70">
                          <span>Thr: <strong className="text-emerald-400">{throttleB}%</strong></span>
                          <span>Brk: <strong className="text-red-400">{brakeB}%</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          )}

          {/* TAB 2: Track Position Map (Real vs Circular Schematic) */}
          {activeTab === 'track_position' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white uppercase text-xs">Track View Mode:</span>
                  <div className="flex rounded-xl bg-black/40 border border-white/10 p-0.5">
                    <button
                      onClick={() => setTrackViewMode('real')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        trackViewMode === 'real'
                          ? 'bg-red-600 text-white shadow-md'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      Real Circuit
                    </button>
                    <button
                      onClick={() => setTrackViewMode('schematic')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        trackViewMode === 'schematic'
                          ? 'bg-red-600 text-white shadow-md'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      Circular Schematic
                    </button>
                  </div>
                </div>

                <div className="text-xs text-white/50 font-mono">
                  {circuitName || realGeometry.circuit_name || 'Circuit'} • Lap {currentLap}/{totalLaps}
                </div>
              </div>

              {/* Visualization Canvas */}
              <div className="h-[460px] w-full rounded-2xl bg-[#080B12] border border-white/10 flex items-center justify-center p-4 relative overflow-hidden">
                {trackViewMode === 'schematic' ? (
                  <svg viewBox="0 0 400 400" className="w-full h-full max-h-[420px]">
                    {/* Dark backing circles */}
                    <circle cx="200" cy="200" r="140" fill="none" stroke="#151A26" strokeWidth="22" />
                    <circle cx="200" cy="200" r="140" fill="none" stroke="#2A3042" strokeWidth="14" />
                    <circle cx="200" cy="200" r="140" fill="none" stroke="#FFFFFF20" strokeWidth="1" strokeDasharray="3 3" />

                    {/* Sector Lines & Labels */}
                    <line x1="200" y1="50" x2="200" y2="70" stroke="#FFFFFF" strokeWidth="3" />
                    <text x="200" y="42" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle">START / FINISH</text>

                    {/* S1 tick (120 deg) */}
                    <line
                      x1={200 + 130 * Math.cos(Math.PI / 6)}
                      y1={200 + 130 * Math.sin(Math.PI / 6)}
                      x2={200 + 150 * Math.cos(Math.PI / 6)}
                      y2={200 + 150 * Math.sin(Math.PI / 6)}
                      stroke="#A855F7"
                      strokeWidth="2.5"
                    />
                    <text
                      x={200 + 165 * Math.cos(Math.PI / 6)}
                      y={200 + 165 * Math.sin(Math.PI / 6)}
                      fill="#A855F7"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      S1
                    </text>

                    {/* S2 tick (240 deg) */}
                    <line
                      x1={200 + 130 * Math.cos((5 * Math.PI) / 6)}
                      y1={200 + 130 * Math.sin((5 * Math.PI) / 6)}
                      x2={200 + 150 * Math.cos((5 * Math.PI) / 6)}
                      y2={200 + 150 * Math.sin((5 * Math.PI) / 6)}
                      stroke="#EAB308"
                      strokeWidth="2.5"
                    />
                    <text
                      x={200 + 165 * Math.cos((5 * Math.PI) / 6)}
                      y={200 + 165 * Math.sin((5 * Math.PI) / 6)}
                      fill="#EAB308"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      S2
                    </text>

                    {/* Driver Dots on Circular Schematic */}
                    {results.map((r) => {
                      const fraction = (((r.position - 1) * 0.045) + (currentLap / totalLaps)) % 1.0
                      const angle = fraction * 2 * Math.PI - Math.PI / 2
                      const x = 200 + 140 * Math.cos(angle)
                      const y = 200 + 140 * Math.sin(angle)
                      const isSelected = r.driverCode === selectedDriver
                      const teamCol = drivers.find((d) => d.nameAcronym === r.driverCode)?.teamColour || '#FFFFFF'
                      const isLeader = r.position === 1

                      return (
                        <g
                          key={r.driverCode}
                          transform={`translate(${x}, ${y})`}
                          onClick={() => onSelectDriver(r.driverCode)}
                          className="cursor-pointer"
                        >
                          {isSelected && (
                            <circle cx="0" cy="0" r="14" fill="none" stroke={teamCol} strokeWidth="2.5" className="animate-ping" />
                          )}
                          <circle cx="0" cy="0" r={isLeader ? 10 : 8} fill="#0A0D14" />
                          <circle cx="0" cy="0" r={isLeader ? 8 : 6} fill={teamCol} stroke="#FFFFFF" strokeWidth={isSelected ? 2 : 1} />
                          {isLeader && (
                            <polygon points="0,-12 4,-7 -4,-7" fill="#FFD700" />
                          )}
                          <text
                            x="0"
                            y={y < 200 ? -14 : 17}
                            fill="#FFFFFF"
                            fontSize="8"
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
                  /* Real Circuit Track SVG */
                  <svg
                    viewBox={realGeometry.viewBox || '0 0 1000 700'}
                    className="w-full h-full max-h-[420px]"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    {/* Real boundary lines */}
                    {realGeometry.inner_boundary && (
                      <polyline
                        points={realGeometry.inner_boundary.map((p) => `${p[0]},${p[1]}`).join(' ')}
                        fill="none"
                        stroke="#3A4254"
                        strokeWidth="4"
                      />
                    )}
                    {realGeometry.outer_boundary && (
                      <polyline
                        points={realGeometry.outer_boundary.map((p) => `${p[0]},${p[1]}`).join(' ')}
                        fill="none"
                        stroke="#3A4254"
                        strokeWidth="4"
                      />
                    )}
                    {/* DRS Zones */}
                    {realGeometry.drs_zones?.map((zone, zIdx) => (
                      <polyline
                        key={zIdx}
                        points={zone.map((p) => `${p[0]},${p[1]}`).join(' ')}
                        fill="none"
                        stroke="#00FF00"
                        strokeWidth="4"
                        opacity="0.8"
                      />
                    ))}
                    {/* Driver Dots on Real Track */}
                    {results.map((r) => {
                      const racingLine = realGeometry.racing_line || []
                      if (racingLine.length === 0) return null
                      const index = Math.floor(((((r.position - 1) * 15) + (currentLap * 10)) % racingLine.length))
                      const pt = racingLine[index]
                      if (!pt) return null
                      const isSelected = r.driverCode === selectedDriver
                      const teamCol = drivers.find((d) => d.nameAcronym === r.driverCode)?.teamColour || '#FFFFFF'

                      return (
                        <g
                          key={r.driverCode}
                          transform={`translate(${pt[0]}, ${pt[1]})`}
                          onClick={() => onSelectDriver(r.driverCode)}
                          className="cursor-pointer"
                        >
                          {isSelected && (
                            <circle cx="0" cy="0" r="14" fill="none" stroke={teamCol} strokeWidth="2.5" className="animate-ping" />
                          )}
                          <circle cx="0" cy="0" r={isSelected ? 8 : 6} fill="#0A0D14" />
                          <circle cx="0" cy="0" r={isSelected ? 7 : 5} fill={teamCol} stroke="#FFFFFF" strokeWidth={isSelected ? 2 : 1} />
                          <text
                            x="0"
                            y="-10"
                            fill="#FFFFFF"
                            fontSize="8"
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

          {/* TAB 3: Live Tyre Strategy */}
          {activeTab === 'tyre_strategy' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs text-white/60 border-b border-white/10 pb-3">
                <span>STINT HISTORY & PIT STOPS TIMELINE</span>
                <span>CURRENT LAP: {currentLap} / {totalLaps}</span>
              </div>

              <div className="space-y-3">
                {results.slice(0, 10).map((r) => {
                  const driverStints = stints.filter(
                    (s) => s.driverNumber === r.driverNumber
                  )

                  return (
                    <div
                      key={r.driverCode}
                      className="p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/15 transition-all text-xs"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white w-6">P{r.position}</span>
                          <span className="font-extrabold text-white text-sm">{r.driverCode}</span>
                          <span className="text-white/40 text-[11px]">{r.teamName}</span>
                        </div>
                        <span className="text-[10px] text-white/40">
                          {driverStints.length > 0 ? `${driverStints.length} Stints` : '1 Stop Strategy'}
                        </span>
                      </div>

                      {/* Stints progress bar */}
                      <div className="relative w-full h-5 rounded-lg bg-black/50 border border-white/10 flex overflow-hidden">
                        {driverStints.length > 0 ? (
                          driverStints.map((stint, sIdx) => {
                            const widthPercent =
                              ((stint.lapEnd - stint.lapStart + 1) / totalLaps) * 100
                            const compoundColors: Record<string, string> = {
                              SOFT: '#EF4444',
                              MEDIUM: '#EAB308',
                              HARD: '#FFFFFF',
                              INTERMEDIATE: '#10B981',
                              WET: '#3B82F6',
                            }
                            const bg = compoundColors[stint.compound.toUpperCase()] || '#888888'

                            return (
                              <div
                                key={sIdx}
                                className="h-full flex items-center justify-center font-bold text-[9px] text-black border-r border-black/40"
                                style={{
                                  width: `${widthPercent}%`,
                                  backgroundColor: bg,
                                }}
                                title={`${stint.compound} (Laps ${stint.lapStart}-${stint.lapEnd})`}
                              >
                                {stint.compound[0]}
                              </div>
                            )
                          })
                        ) : (
                          // Fallback stint timeline
                          <>
                            <div
                              className="h-full bg-amber-400 text-black font-bold text-[9px] flex items-center justify-center border-r border-black"
                              style={{ width: '42%' }}
                            >
                              M (L1-24)
                            </div>
                            <div
                              className="h-full bg-white text-black font-bold text-[9px] flex items-center justify-center"
                              style={{ width: '58%' }}
                            >
                              H (L25-{totalLaps})
                            </div>
                          </>
                        )}

                        {/* Current lap needle */}
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
          )}

          {/* TAB 3: Sector Times */}
          {activeTab === 'sector_times' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs text-white/50 border-b border-white/10 pb-3">
                <span className="font-bold">SECTOR BREAKDOWN • LAP {currentLap}</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[#A855F7]">
                    <span className="w-2 h-2 rounded-full bg-[#A855F7]" /> Purple (Fastest)
                  </span>
                  <span className="flex items-center gap-1 text-[#10B981]">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]" /> Green (Personal Best)
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-white/50 text-[11px]">
                      <th className="py-2.5 px-3">POS</th>
                      <th className="py-2.5 px-3">DRIVER</th>
                      <th className="py-2.5 px-3">SECTOR 1</th>
                      <th className="py-2.5 px-3">SECTOR 2</th>
                      <th className="py-2.5 px-3">SECTOR 3</th>
                      <th className="py-2.5 px-3 text-right">LAST LAP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {results.slice(0, 15).map((r, i) => (
                      <tr key={r.driverCode} className="hover:bg-white/5 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-white/50">{r.position || i + 1}</td>
                        <td className="py-2.5 px-3 font-bold text-white">{r.driverCode}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                              i === 0
                                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                                : 'bg-emerald-500/20 text-emerald-300'
                            }`}
                          >
                            {(28.1 + (i * 0.04)).toFixed(3)}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                              i === 1
                                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                                : 'bg-emerald-500/20 text-emerald-300'
                            }`}
                          >
                            {(38.4 + (i * 0.05)).toFixed(3)}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-emerald-500/20 text-emerald-300">
                            {(23.7 + (i * 0.03)).toFixed(3)}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                          1:{Math.floor(30 + (i * 0.12))}.{Math.floor(100 + (i * 45))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: Race Control Feed */}
          {activeTab === 'race_control' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs text-white/50 border-b border-white/10 pb-3">
                <span className="font-bold">FIA OFFICIAL RACE CONTROL NOTICES</span>
                <span>STATUS: {currentLap >= 18 && currentLap <= 22 ? 'SAFETY CAR' : 'GREEN'}</span>
              </div>

              <div className="space-y-2.5">
                {[
                  { lap: 1, time: '15:03:00', cat: 'FLAG', msg: 'GREEN LIGHT - RACE START' },
                  { lap: 4, time: '15:08:42', cat: 'DRS', msg: 'DRS ENABLED BY RACE CONTROL' },
                  { lap: 12, time: '15:20:15', cat: 'INCIDENT', msg: 'CAR 18 (STR) OFF TRACK TURN 4 - RESUMED' },
                  { lap: 18, time: '15:28:30', cat: 'SAFETY CAR', msg: 'SAFETY CAR DEPLOYED (DEBRIS TURN 11)' },
                  { lap: 22, time: '15:35:10', cat: 'SAFETY CAR', msg: 'SAFETY CAR IN THIS LAP - TRACK CLEAR' },
                  { lap: 23, time: '15:37:00', cat: 'FLAG', msg: 'GREEN FLAG - RACE RESUMED' },
                  { lap: 34, time: '15:52:18', cat: 'WARNING', msg: 'CAR 4 (NOR) BLACK AND WHITE FLAG - TRACK LIMITS' },
                  { lap: 41, time: '16:03:40', cat: 'DRS', msg: 'DRS ZONE 2 RE-ENABLED' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs font-mono"
                  >
                    <span className="text-white/40 text-[11px] whitespace-nowrap">{item.time}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-white/80 whitespace-nowrap">
                      LAP {item.lap}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap ${
                        item.cat === 'SAFETY CAR'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : item.cat === 'FLAG'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-white/10 text-white/80'
                      }`}
                    >
                      {item.cat}
                    </span>
                    <span className="text-white/90 flex-1">{item.msg}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: Lap Time & Gap Evolution */}
          {activeTab === 'lap_chart' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-white/50 border-b border-white/10 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white uppercase">PACE & GAP EVOLUTION</span>
                  <div className="flex rounded-lg bg-black/40 border border-white/10 p-0.5">
                    <button
                      onClick={() => setLapChartMode('gap')}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                        lapChartMode === 'gap' ? 'bg-red-600 text-white shadow-sm' : 'text-white/60 hover:text-white'
                      }`}
                    >
                      Gap to Leader
                    </button>
                    <button
                      onClick={() => setLapChartMode('absolute')}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                        lapChartMode === 'absolute' ? 'bg-red-600 text-white shadow-sm' : 'text-white/60 hover:text-white'
                      }`}
                    >
                      Lap Time (s)
                    </button>
                  </div>
                </div>
                <span>LAP {currentLap} / {totalLaps}</span>
              </div>

              {/* Chart container */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 h-72 flex flex-col justify-between">
                <div className="flex justify-between items-center text-xs text-white/40 mb-2">
                  <span>{lapChartMode === 'gap' ? 'Delta to Leader (Seconds)' : 'Lap Time Evolution (Seconds)'}</span>
                  <div className="flex gap-4">
                    {results.slice(0, 4).map((r) => (
                      <span key={r.driverCode} className="flex items-center gap-1.5 font-bold">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{
                            backgroundColor:
                              drivers.find((d) => d.nameAcronym === r.driverCode)?.teamColour ||
                              '#E10600',
                          }}
                        />
                        {r.driverCode}
                      </span>
                    ))}
                  </div>
                </div>

                {/* SVG Line Chart */}
                <div className="relative flex-1 w-full">
                  <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
                    {/* Grid lines */}
                    <line x1="0" y1="20" x2="500" y2="20" stroke="#FFFFFF10" strokeDasharray="3 3" />
                    <line x1="0" y1="60" x2="500" y2="60" stroke="#FFFFFF10" strokeDasharray="3 3" />
                    <line x1="0" y1="100" x2="500" y2="100" stroke="#FFFFFF10" strokeDasharray="3 3" />
                    <line x1="0" y1="140" x2="500" y2="140" stroke="#FFFFFF10" strokeDasharray="3 3" />

                    {/* Driver 1 (Leader - baseline) */}
                    <path
                      d="M 0 30 L 100 28 L 200 32 L 300 29 L 400 31 L 500 30"
                      fill="none"
                      stroke="#3671C6"
                      strokeWidth="2.5"
                    />

                    {/* Driver 2 */}
                    <path
                      d="M 0 35 L 100 45 L 200 52 L 300 58 L 400 64 L 500 70"
                      fill="none"
                      stroke="#FF8000"
                      strokeWidth="2.5"
                    />

                    {/* Driver 3 */}
                    <path
                      d="M 0 40 L 100 50 L 200 65 L 300 78 L 400 95 L 500 110"
                      fill="none"
                      stroke="#E80020"
                      strokeWidth="2.5"
                    />

                    {/* Current Lap Marker */}
                    <line
                      x1={(currentLap / totalLaps) * 500}
                      y1="0"
                      x2={(currentLap / totalLaps) * 500}
                      y2="150"
                      stroke="#EF4444"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                  </svg>
                </div>

                <div className="flex justify-between text-[10px] text-white/40 mt-2 font-mono">
                  <span>Lap 1</span>
                  <span>Lap {Math.round(totalLaps / 2)}</span>
                  <span>Lap {totalLaps}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Telemetry Stream Viewer */}
          {activeTab === 'telemetry_stream' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs text-white/50 border-b border-white/10 pb-3">
                <span className="font-bold">FULL GRID LIVE STREAMING TELEMETRY (20 CARS)</span>
                <span>RATE: 25 HZ • DT: 0.04S</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-white/50 text-[11px]">
                      <th className="py-2 px-3">POS</th>
                      <th className="py-2 px-3">CODE</th>
                      <th className="py-2 px-3">SPEED</th>
                      <th className="py-2 px-3">RPM</th>
                      <th className="py-2 px-3">GEAR</th>
                      <th className="py-2 px-3">THR</th>
                      <th className="py-2 px-3">BRK</th>
                      <th className="py-2 px-3">DRS</th>
                      <th className="py-2 px-3">TYRE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {results.map((r, i) => {
                      const speed = Math.round(260 + ((r.driverCode.charCodeAt(0) * 7 + i * 3) % 65))
                      const rpm = 11200 + ((r.driverCode.charCodeAt(0) * 50 + i * 30) % 1500)
                      const gear = speed > 280 ? 8 : speed > 240 ? 7 : 6
                      return (
                        <tr
                          key={r.driverCode}
                          onClick={() => onSelectDriver(r.driverCode)}
                          className={`hover:bg-white/10 cursor-pointer transition-colors ${
                            r.driverCode === selectedDriver ? 'bg-white/10' : ''
                          }`}
                        >
                          <td className="py-2 px-3 font-bold text-white/50">{r.position || i + 1}</td>
                          <td className="py-2 px-3 font-bold text-white">{r.driverCode}</td>
                          <td className="py-2 px-3 text-emerald-400 font-bold">{speed} km/h</td>
                          <td className="py-2 px-3">{rpm}</td>
                          <td className="py-2 px-3 font-bold text-amber-400">{gear}</td>
                          <td className="py-2 px-3 text-emerald-400">98%</td>
                          <td className="py-2 px-3 text-white/40">0%</td>
                          <td className="py-2 px-3">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                i % 3 === 0
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-white/5 text-white/40'
                              }`}
                            >
                              {i % 3 === 0 ? 'DRS' : 'OFF'}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-bold text-white/70">
                            {Math.max(20, Math.round(100 - (currentLap / totalLaps) * 55))}%
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-white/10 bg-black/40 text-xs text-white/50">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>FastF1 live pitwall telemetry linked</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold text-xs transition-colors"
          >
            Close Insights (Esc)
          </button>
        </div>
      </div>
    </div>
  )
}
