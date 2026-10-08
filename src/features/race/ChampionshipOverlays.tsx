import React, { useMemo } from 'react'
import { X, Trophy, Award, TrendingUp } from 'lucide-react'
import { RaceResultEntry, DriverSessionInfo } from '@/types/data'

interface ChampionshipOverlaysProps {
  showDrivers: boolean
  showConstructors: boolean
  onCloseDrivers: () => void
  onCloseConstructors: () => void
  currentLap: number
  totalLaps: number
  results: RaceResultEntry[]
  drivers: DriverSessionInfo[]
}

// Standard F1 points system (P1-P10)
const F1_POINTS: Record<number, number> = {
  1: 25,
  2: 18,
  3: 15,
  4: 12,
  5: 10,
  6: 8,
  7: 6,
  8: 4,
  9: 2,
  10: 1,
}

// Estimated 2024 season baseline points for major drivers to make standings authentic
const BASELINE_DRIVER_POINTS: Record<string, number> = {
  VER: 393,
  NOR: 331,
  LEC: 307,
  PIA: 262,
  SAI: 244,
  RUS: 192,
  HAM: 190,
  PER: 151,
  ALO: 62,
  HUL: 31,
  GAS: 26,
  TSU: 28,
  OCO: 23,
  MAG: 14,
  ALB: 12,
  RIC: 12,
  STR: 24,
  COL: 5,
  BEA: 7,
  LAW: 4,
  ZHO: 0,
  BOT: 0,
  SAR: 0,
}

const BASELINE_TEAM_POINTS: Record<string, number> = {
  'McLaren': 593,
  'Ferrari': 551,
  'Red Bull Racing': 544,
  'Mercedes': 382,
  'Aston Martin': 86,
  'Haas F1 Team': 46,
  'Alpine': 49,
  'RB': 44,
  'Williams': 17,
  'Kick Sauber': 0,
}

export const ChampionshipOverlays: React.FC<ChampionshipOverlaysProps> = ({
  showDrivers,
  showConstructors,
  onCloseDrivers,
  onCloseConstructors,
  currentLap,
  totalLaps: _totalLaps,
  results,
  drivers,
}) => {
  // Compute live drivers standings based on current race results / positions
  const liveDriverStandings = useMemo(() => {
    return results.map((r, index) => {
      const pos = r.position || index + 1
      const ptsGained = F1_POINTS[pos] || 0
      const driverInfo = drivers.find(
        (d) => d.nameAcronym === r.driverCode || d.driverNumber === r.driverNumber
      )
      const basePts = BASELINE_DRIVER_POINTS[r.driverCode] ?? 20
      const totalPts = basePts + ptsGained
      const teamColor = driverInfo?.teamColour || '#E10600'
      const teamName = driverInfo?.teamName || r.teamName || 'F1 Team'

      return {
        driverCode: r.driverCode,
        fullName: driverInfo?.fullName || r.driverCode,
        teamName,
        teamColor,
        racePos: pos,
        basePts,
        ptsGained,
        totalPts,
      }
    }).sort((a, b) => b.totalPts - a.totalPts)
  }, [results, drivers])

  // Compute live constructors standings based on current race positions
  const liveConstructorStandings = useMemo(() => {
    const teamMap: Record<
      string,
      { teamName: string; teamColor: string; basePts: number; ptsGained: number; drivers: string[] }
    > = {}

    results.forEach((r, index) => {
      const pos = r.position || index + 1
      const ptsGained = F1_POINTS[pos] || 0
      const driverInfo = drivers.find(
        (d) => d.nameAcronym === r.driverCode || d.driverNumber === r.driverNumber
      )
      const teamName = driverInfo?.teamName || r.teamName || 'Other'
      const teamColor = driverInfo?.teamColour || '#888888'

      if (!teamMap[teamName]) {
        teamMap[teamName] = {
          teamName,
          teamColor,
          basePts: BASELINE_TEAM_POINTS[teamName] ?? 50,
          ptsGained: 0,
          drivers: [],
        }
      }
      teamMap[teamName].ptsGained += ptsGained
      teamMap[teamName].drivers.push(r.driverCode)
    })

    return Object.values(teamMap)
      .map((t) => ({
        ...t,
        totalPts: t.basePts + t.ptsGained,
      }))
      .sort((a, b) => b.totalPts - a.totalPts)
  }, [results, drivers])

  if (!showDrivers && !showConstructors) return null

  return (
    <>
      {/* Drivers Championship Overlay */}
      {showDrivers && (
        <div className="absolute top-16 left-6 z-40 w-96 max-h-[500px] bg-[#0E131F]/95 border border-white/15 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-2.5">
              <Trophy className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-sm font-black tracking-wide text-white uppercase font-mono">
                  Drivers' Championship
                </h3>
                <span className="text-[10px] font-mono text-white/50">
                  Live Standings • Lap {currentLap}
                </span>
              </div>
            </div>
            <button
              onClick={onCloseDrivers}
              className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              title="Close (C or Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Table list */}
          <div className="overflow-y-auto max-h-[420px] p-2 divide-y divide-white/5">
            {liveDriverStandings.slice(0, 16).map((item, idx) => (
              <div
                key={item.driverCode}
                className="flex items-center justify-between px-3 py-2 hover:bg-white/5 rounded-lg transition-colors text-xs font-mono"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 text-right font-bold text-white/50 text-[11px]">
                    {idx + 1}
                  </span>
                  <span
                    className="w-1.5 h-4 rounded-sm"
                    style={{ backgroundColor: item.teamColor }}
                  />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white text-xs">{item.driverCode}</span>
                      <span className="text-[10px] text-white/40 truncate max-w-[110px]">
                        {item.fullName}
                      </span>
                    </div>
                    <span className="text-[9px] text-white/40">{item.teamName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {item.ptsGained > 0 && (
                    <span className="flex items-center text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      <TrendingUp className="w-2.5 h-2.5 mr-0.5 inline" />+{item.ptsGained}
                    </span>
                  )}
                  <div className="text-right">
                    <span className="font-extrabold text-white text-xs">{item.totalPts}</span>
                    <span className="text-[9px] text-white/40 ml-1">PTS</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div className="px-4 py-2 border-t border-white/10 bg-black/20 text-[10px] font-mono text-white/40 flex justify-between">
            <span>Press [C] to toggle</span>
            <span>Includes live race points</span>
          </div>
        </div>
      )}

      {/* Constructors Championship Overlay */}
      {showConstructors && (
        <div className="absolute top-16 left-6 z-40 w-96 max-h-[500px] bg-[#0E131F]/95 border border-white/15 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-2.5">
              <Award className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-sm font-black tracking-wide text-white uppercase font-mono">
                  Constructors' Championship
                </h3>
                <span className="text-[10px] font-mono text-white/50">
                  Live Standings • Lap {currentLap}
                </span>
              </div>
            </div>
            <button
              onClick={onCloseConstructors}
              className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              title="Close (A or Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Table list */}
          <div className="overflow-y-auto max-h-[420px] p-2 divide-y divide-white/5">
            {liveConstructorStandings.map((item, idx) => (
              <div
                key={item.teamName}
                className="flex items-center justify-between px-3 py-2.5 hover:bg-white/5 rounded-lg transition-colors text-xs font-mono"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 text-right font-bold text-white/50 text-[11px]">
                    {idx + 1}
                  </span>
                  <span
                    className="w-2 h-5 rounded-sm"
                    style={{ backgroundColor: item.teamColor }}
                  />
                  <div className="flex flex-col">
                    <span className="font-bold text-white text-xs">{item.teamName}</span>
                    <span className="text-[9px] text-white/40">
                      {item.drivers.join(' / ')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {item.ptsGained > 0 && (
                    <span className="flex items-center text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      <TrendingUp className="w-2.5 h-2.5 mr-0.5 inline" />+{item.ptsGained}
                    </span>
                  )}
                  <div className="text-right">
                    <span className="font-extrabold text-white text-xs">{item.totalPts}</span>
                    <span className="text-[9px] text-white/40 ml-1">PTS</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div className="px-4 py-2 border-t border-white/10 bg-black/20 text-[10px] font-mono text-white/40 flex justify-between">
            <span>Press [A] to toggle</span>
            <span>Includes live race points</span>
          </div>
        </div>
      )}
    </>
  )
}
