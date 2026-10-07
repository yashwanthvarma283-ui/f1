import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Users,
  Trophy,
  ArrowUp,
  ArrowDown,
  Minus,
  Timer,
  Gauge,
  X,
  Layers,
  Sparkles,
} from 'lucide-react'
import { getTeamMeta } from '@/lib/teams'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import {
  DriverSessionInfo,
  DriverRaceSummaryStats,
  LapData,
} from '@/types/data'

interface DriversTabProps {
  drivers: DriverSessionInfo[]
  driverStats: DriverRaceSummaryStats[]
  laps: LapData[]
}

export const DriversTab: React.FC<DriversTabProps> = ({
  drivers,
  driverStats,
  laps,
}) => {
  const [selectedDriverNumber, setSelectedDriverNumber] = useState<number | null>(null)

  // Driver lookup map
  const driverMap = useMemo(() => {
    const map = new Map<number, DriverSessionInfo>()
    drivers.forEach((d) => map.set(d.driverNumber, d))
    return map
  }, [drivers])

  // Selected driver object and their laps
  const selectedDriver = selectedDriverNumber ? driverMap.get(selectedDriverNumber) : null
  const selectedDriverStats = selectedDriverNumber
    ? driverStats.find((s) => s.driverNumber === selectedDriverNumber)
    : null

  const selectedDriverLaps = useMemo(() => {
    if (!selectedDriverNumber) return []
    return laps
      .filter((l) => l.driverNumber === selectedDriverNumber)
      .sort((a, b) => a.lapNumber - b.lapNumber)
  }, [laps, selectedDriverNumber])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)] pb-4">
        <div>
          <h2 className="text-xl font-display font-black uppercase tracking-tight text-[var(--text)]">
            Driver Race Telemetry &amp; Performance
          </h2>
          <p className="text-xs font-mono text-[var(--text-muted)] mt-0.5">
            Per-driver race statistics, sector benchmarks, pace averages, and drill-down lap logs
          </p>
        </div>
        <div className="text-xs font-mono text-[var(--text-muted)]">
          CLICK CARD TO INSPECT ALL LAPS
        </div>
      </div>

      {/* 20 Driver Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {driverStats.map((stat) => {
          const driver = driverMap.get(stat.driverNumber)
          const team = getTeamMeta(driver?.teamName)
          const delta = stat.grid - stat.finish

          return (
            <motion.div
              key={stat.driverNumber}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.15 }}
              onClick={() => setSelectedDriverNumber(stat.driverNumber)}
              className="cursor-pointer rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] hover:border-[var(--accent)]/60 hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              {/* Team accent bar */}
              <div className="h-1 w-full" style={{ backgroundColor: team.color }} />

              <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                {/* Header: Driver & Number */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-[var(--surface-3)] border border-[var(--border)] shrink-0">
                      {driver?.headshotUrl ? (
                        <img
                          src={driver.headshotUrl}
                          alt={driver.fullName}
                          className="w-full h-full object-cover object-top"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-mono font-bold text-xs text-[var(--text-muted)]">
                          {stat.driverCode}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="font-display font-black text-sm text-[var(--text)] uppercase tracking-tight truncate">
                        {driver?.fullName || stat.driverCode}
                      </div>
                      <div className="text-[11px] font-mono text-[var(--text-muted)] flex items-center gap-1.5 truncate">
                        <span
                          className="w-1.5 h-1.5 rounded-full inline-block"
                          style={{ backgroundColor: team.color }}
                        />
                        <span className="truncate">{driver?.teamName}</span>
                      </div>
                    </div>
                  </div>

                  <span className="font-display font-black text-xl text-[var(--text-muted)] opacity-50 shrink-0">
                    #{stat.driverNumber}
                  </span>
                </div>

                {/* Grid vs Finish */}
                <div className="p-2.5 rounded-xl bg-[var(--surface-2)]/60 border border-[var(--border)] flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase text-[var(--text-muted)]">FINISH</span>
                    <span className="font-display font-black text-sm text-[var(--text)]">
                      P{stat.finish}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase text-[var(--text-muted)]">GRID</span>
                    <span className="text-xs text-[var(--text-muted)]">P{stat.grid}</span>
                    {delta > 0 ? (
                      <span className="inline-flex items-center text-emerald-400 font-bold text-[11px]">
                        <ArrowUp className="w-3 h-3" />+{delta}
                      </span>
                    ) : delta < 0 ? (
                      <span className="inline-flex items-center text-rose-400 font-bold text-[11px]">
                        <ArrowDown className="w-3 h-3" />
                        {delta}
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[var(--text-muted)] text-[11px]">
                        <Minus className="w-3 h-3" />0
                      </span>
                    )}
                  </div>
                </div>

                {/* Race Statistics Strip */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded-lg bg-[var(--surface-2)]/40 border border-[var(--border)]/40">
                    <div className="text-[10px] text-[var(--text-muted)] uppercase">Fastest Lap</div>
                    <div className="font-bold text-[var(--text)] mt-0.5">
                      {stat.fastestLapTime || '--:--.---'}
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-[var(--surface-2)]/40 border border-[var(--border)]/40">
                    <div className="text-[10px] text-[var(--text-muted)] uppercase">Pit Stops</div>
                    <div className="font-bold text-[var(--text)] mt-0.5">
                      {stat.pitStopCount} stops
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-[var(--surface-2)]/40 border border-[var(--border)]/40">
                    <div className="text-[10px] text-[var(--text-muted)] uppercase">Avg Pace</div>
                    <div className="font-bold text-[var(--text)] mt-0.5">
                      {stat.averagePaceSeconds ? `${stat.averagePaceSeconds.toFixed(2)}s` : '--'}
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-[var(--surface-2)]/40 border border-[var(--border)]/40">
                    <div className="text-[10px] text-[var(--text-muted)] uppercase">Laps Led</div>
                    <div className="font-bold text-[var(--text)] mt-0.5">
                      {stat.lapsLed} laps
                    </div>
                  </div>
                </div>

                {/* Best Sector Times */}
                <div className="pt-2 border-t border-[var(--border)]/60 flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
                  <span>S1: {stat.bestSector1 ? `${stat.bestSector1}s` : '--'}</span>
                  <span>S2: {stat.bestSector2 ? `${stat.bestSector2}s` : '--'}</span>
                  <span>S3: {stat.bestSector3 ? `${stat.bestSector3}s` : '--'}</span>
                </div>
              </div>

              {/* Bottom footer button */}
              <div className="px-4 py-2 border-t border-[var(--border)] bg-[var(--surface-2)]/30 text-center text-[11px] font-mono text-[var(--accent)] font-bold">
                DRILL DOWN LAPS →
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Driver Full Lap Breakdown Modal */}
      <AnimatePresence>
        {selectedDriverNumber && selectedDriver && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-[var(--surface-1)] border border-[var(--border)] rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-2)]/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-[var(--surface-3)] border border-[var(--border)]">
                    {selectedDriver.headshotUrl ? (
                      <img
                        src={selectedDriver.headshotUrl}
                        alt={selectedDriver.fullName}
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold font-mono">
                        {selectedDriver.nameAcronym}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-display font-black text-lg text-[var(--text)] uppercase tracking-tight">
                      {selectedDriver.fullName} &bull; Lap Breakdown
                    </h3>
                    <p className="text-xs font-mono text-[var(--text-muted)]">
                      {selectedDriver.teamName} &bull; Finish: P{selectedDriverStats?.finish} &bull; {selectedDriverLaps.length} Laps Logged
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDriverNumber(null)}
                  className="rounded-xl"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Laps Table */}
              <div className="flex-1 overflow-y-auto p-4">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-[10px] uppercase text-[var(--text-muted)] bg-[var(--surface-2)] sticky top-0 z-10">
                      <th className="py-2.5 px-3 font-bold">Lap</th>
                      <th className="py-2.5 px-3 font-bold">Lap Time</th>
                      <th className="py-2.5 px-3 font-bold">Sector 1</th>
                      <th className="py-2.5 px-3 font-bold">Sector 2</th>
                      <th className="py-2.5 px-3 font-bold">Sector 3</th>
                      <th className="py-2.5 px-3 font-bold text-center">Tyre</th>
                      <th className="py-2.5 px-3 font-bold text-center">Age</th>
                      <th className="py-2.5 px-3 font-bold text-right">Speed Trap</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]/60">
                    {selectedDriverLaps.map((lap) => {
                      const compound = lap.compound || 'UNKNOWN'
                      const isSoft = compound.includes('SOFT')
                      const isMed = compound.includes('MEDIUM')
                      const isHard = compound.includes('HARD')

                      return (
                        <tr
                          key={lap.lapNumber}
                          className={`hover:bg-[var(--surface-2)]/60 transition-colors ${
                            lap.isFastestLap ? 'bg-purple-500/10' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 font-bold text-[var(--text)]">
                            {lap.lapNumber}
                          </td>
                          <td className="py-2.5 px-3 font-bold whitespace-nowrap">
                            <span className={lap.isFastestLap ? 'text-purple-400' : 'text-[var(--text)]'}>
                              {lap.lapTimeString}
                            </span>
                            {lap.isFastestLap && (
                              <span className="ml-2 text-[9px] px-1 py-0.2 rounded bg-purple-500 text-white font-bold">
                                PURPLE
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-[var(--text-muted)]">
                            {lap.sector1 ? `${lap.sector1.toFixed(3)}s` : '--'}
                          </td>
                          <td className="py-2.5 px-3 text-[var(--text-muted)]">
                            {lap.sector2 ? `${lap.sector2.toFixed(3)}s` : '--'}
                          </td>
                          <td className="py-2.5 px-3 text-[var(--text-muted)]">
                            {lap.sector3 ? `${lap.sector3.toFixed(3)}s` : '--'}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isSoft
                                  ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                                  : isMed
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                  : isHard
                                  ? 'bg-slate-200/20 text-slate-200 border border-slate-300/40'
                                  : 'bg-zinc-800 text-zinc-400'
                              }`}
                            >
                              {compound}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center text-[var(--text-muted)]">
                            L{lap.tyreLife || '--'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-semibold text-[var(--text)]">
                            {lap.speedSt ? `${lap.speedSt} km/h` : '--'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-[var(--border)] bg-[var(--surface-2)]/40 flex justify-end">
                <Button variant="primary" size="sm" onClick={() => setSelectedDriverNumber(null)}>
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
