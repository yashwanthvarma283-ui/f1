import React, { useState, useMemo } from 'react'
import {
  Radio,
  Search,
  Volume2,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react'
import { getTeamMeta } from '@/lib/teams'
import { TeamRadioClip, DriverSessionInfo } from '@/types/data'

interface TeamRadioTabProps {
  radioClips: TeamRadioClip[]
  drivers: DriverSessionInfo[]
}

export const TeamRadioTab: React.FC<TeamRadioTabProps> = ({
  radioClips,
  drivers,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDriver, setSelectedDriver] = useState<string>('all')
  const [selectedTeam, setSelectedTeam] = useState<string>('all')
  const [lapFilter, setLapFilter] = useState<'all' | 'mapped' | 'unmapped'>('all')

  const teamsList = useMemo(() => {
    const set = new Set<string>()
    radioClips.forEach((c) => {
      if (c.teamName) set.add(c.teamName)
    })
    return Array.from(set).sort()
  }, [radioClips])

  // Filtered radio clips
  const filteredClips = useMemo(() => {
    return radioClips.filter((clip) => {
      // Driver filter
      if (selectedDriver !== 'all' && clip.driverCode.toLowerCase() !== selectedDriver.toLowerCase()) {
        return false
      }

      // Team filter
      if (selectedTeam !== 'all' && clip.teamName.toLowerCase() !== selectedTeam.toLowerCase()) {
        return false
      }

      // Lap mapped status
      if (lapFilter === 'mapped' && clip.lapNumber === null) return false
      if (lapFilter === 'unmapped' && clip.lapNumber !== null) return false

      // Search query
      const q = searchQuery.toLowerCase().trim()
      if (q) {
        const matches =
          clip.driverCode.toLowerCase().includes(q) ||
          clip.teamName.toLowerCase().includes(q) ||
          (clip.lapNumber !== null && `lap ${clip.lapNumber}`.includes(q))
        if (!matches) return false
      }

      return true
    })
  }, [radioClips, selectedDriver, selectedTeam, lapFilter, searchQuery])

  // Aggregate stats
  const mappedCount = radioClips.filter((c) => c.lapNumber !== null).length
  const unmappedCount = radioClips.length - mappedCount
  const mappedPercentage = Math.round((mappedCount / Math.max(1, radioClips.length)) * 100)

  return (
    <div className="space-y-6">
      {/* 1. Header & Policy Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-[var(--accent)]" />
            <h2 className="text-xl font-display font-black uppercase tracking-tight text-[var(--text)]">
              Team Radio Broadcast Archive
            </h2>
          </div>
          <p className="text-xs font-mono text-[var(--text-muted)] mt-0.5">
            Complete synchronized broadcast audio clips with millisecond UTC alignment
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text-muted)]">
            TOTAL CLIPS: <strong className="text-[var(--text)]">{radioClips.length}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
            {mappedPercentage}% MAPPED TO RACE LAPS
          </span>
        </div>
      </div>

      {/* Streaming Architecture Disclaimer */}
      <div className="p-3.5 rounded-xl bg-[var(--surface-2)]/70 border border-[var(--border)] flex items-start gap-2.5 text-xs font-mono text-[var(--text-muted)]">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="text-[var(--text)] font-bold">Remote Audio Protocol Compliance:</span>
          <p className="text-[11px] leading-relaxed">
            All audio playback connects directly to authorized remote OpenF1/FOM CDN streaming URLs. Audio files are never downloaded, scraped, or re-hosted on application servers.
          </p>
        </div>
      </div>

      {/* 2. Filter & Search Deck */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search driver, team, lap..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[var(--surface-1)] border border-[var(--border)] rounded-xl text-xs font-mono text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
          />
        </div>

        {/* Driver Filter */}
        <select
          value={selectedDriver}
          onChange={(e) => setSelectedDriver(e.target.value)}
          className="w-full p-2 bg-[var(--surface-1)] border border-[var(--border)] rounded-xl text-xs font-mono text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
        >
          <option value="all">All Drivers ({drivers.length})</option>
          {drivers.map((d) => (
            <option key={d.driverNumber} value={d.nameAcronym}>
              #{d.driverNumber} {d.fullName} ({d.nameAcronym})
            </option>
          ))}
        </select>

        {/* Team Filter */}
        <select
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
          className="w-full p-2 bg-[var(--surface-1)] border border-[var(--border)] rounded-xl text-xs font-mono text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
        >
          <option value="all">All Constructors</option>
          {teamsList.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        {/* Lap Mapping Filter */}
        <div className="flex items-center bg-[var(--surface-1)] border border-[var(--border)] rounded-xl p-1">
          <button
            onClick={() => setLapFilter('all')}
            className={`flex-1 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
              lapFilter === 'all'
                ? 'bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            All ({radioClips.length})
          </button>
          <button
            onClick={() => setLapFilter('mapped')}
            className={`flex-1 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
              lapFilter === 'mapped'
                ? 'bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            In-Race ({mappedCount})
          </button>
          <button
            onClick={() => setLapFilter('unmapped')}
            className={`flex-1 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
              lapFilter === 'unmapped'
                ? 'bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            Pre-Race ({unmappedCount})
          </button>
        </div>
      </div>

      {/* 3. Audio Clips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredClips.map((clip) => {
          const team = getTeamMeta(clip.teamName)

          return (
            <div
              key={clip.id}
              className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] hover:border-[var(--accent)]/50 transition-all space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="w-1.5 h-6 rounded-full shrink-0"
                    style={{ backgroundColor: team.color }}
                  />
                  <div className="min-w-0">
                    <div className="font-display font-black text-sm text-[var(--text)] uppercase tracking-tight truncate">
                      {clip.driverCode} &bull; #{clip.driverNumber}
                    </div>
                    <div className="text-[11px] font-mono text-[var(--text-muted)] truncate">
                      {clip.teamName}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {clip.lapNumber !== null ? (
                    <span className="px-2 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border)] font-mono text-xs font-bold text-[var(--text)]">
                      LAP {clip.lapNumber}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-[var(--surface-2)] font-mono text-[10px] text-[var(--text-muted)]">
                      PRE-RACE / GRID
                    </span>
                  )}
                  <div className="text-[10px] font-mono text-[var(--text-muted)] mt-1">
                    {new Date(clip.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              {/* Native HTML5 Audio Player */}
              <div className="pt-2 border-t border-[var(--border)]/60">
                <audio controls preload="none" className="w-full h-8 rounded-lg">
                  <source src={clip.audioUrl} type="audio/mpeg" />
                  Audio playback not supported.
                </audio>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)] pt-1">
                <span>Remote FOM broadcast feed</span>
                <a
                  href={clip.audioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--accent)] flex items-center gap-1 transition-colors"
                >
                  <span>Direct Stream</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          )
        })}
      </div>

      {radioClips.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] space-y-3">
          <Radio className="w-8 h-8 text-amber-400 mx-auto opacity-70" />
          <div>
            <span className="px-2.5 py-0.5 rounded font-mono text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 inline-block">
              Historical Audio Archive
            </span>
          </div>
          <h3 className="font-display font-bold text-sm uppercase text-[var(--text)]">
            Team Radio Broadcast Feeds Not Available
          </h3>
          <p className="text-xs font-mono text-[var(--text-muted)] max-w-md mx-auto leading-relaxed">
            Live broadcast team radio clips with driver audio feeds are active for the modern telemetry era (2018–present via OpenF1 and FOM). Historical radio transmissions were not publicly recorded in this era.
          </p>
        </div>
      ) : filteredClips.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-[var(--border)] bg-[var(--surface-1)] space-y-2">
          <Volume2 className="w-8 h-8 text-[var(--text-muted)] mx-auto opacity-50" />
          <h3 className="font-display font-bold text-sm uppercase text-[var(--text)]">
            No Team Radio Clips Found
          </h3>
          <p className="text-xs font-mono text-[var(--text-muted)]">
            No clips match the current search or driver/team filter.
          </p>
        </div>
      ) : null}
    </div>
  )
}
