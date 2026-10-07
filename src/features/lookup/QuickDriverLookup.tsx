import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { F1_GRID_DRIVERS, DriverSearchItem } from '@/components/search/CommandPalette'
import { getTeamMeta } from '@/lib/teams'
import { CountryFlag } from '@/lib/flags'
import { Search, UserCheck, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuickDriverLookupProps {
  leaderDriverId?: string
}

export const QuickDriverLookup: React.FC<QuickDriverLookupProps> = ({ leaderDriverId }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  // Featured drivers list: championship leader first, then top contenders
  const featuredDrivers = useMemo(() => {
    const leaderId = leaderDriverId || 'norris'
    const leader = F1_GRID_DRIVERS.find((d) => d.id === leaderId) || F1_GRID_DRIVERS[0]
    const others = F1_GRID_DRIVERS.filter((d) => d.id !== leader.id).slice(0, 5)
    return [leader, ...others]
  }, [leaderDriverId])

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return []
    const q = searchTerm.toLowerCase()
    return F1_GRID_DRIVERS.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        d.constructorName.toLowerCase().includes(q) ||
        d.number.includes(q)
    ).slice(0, 6)
  }, [searchTerm])

  const handleSelect = (driver: DriverSearchItem) => {
    navigate(`/drivers?focus=${driver.id}`)
  }

  return (
    <section className="py-12 border-b border-[var(--border)] bg-[var(--surface-1)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent-text)] font-bold uppercase tracking-wider">
            <UserCheck className="w-3.5 h-3.5" />
            GRID TELEMETRY
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-[var(--text)] uppercase tracking-[0.01em] mt-1">
            Quick Driver Lookup
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1 font-mono">
            Instant telemetry lookup for any 2026 championship competitor.
          </p>
        </div>

        {/* Search Input Box with Smooth Expansion on Focus */}
        <div className="relative max-w-xl group">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" />
          <input
            type="text"
            placeholder="Type driver name, racing number (#1), code (NOR), or constructor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)] shadow-xs transition-all duration-200"
          />

          {/* Autocomplete dropdown */}
          {filtered.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 bg-[var(--surface-1)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden z-30 divide-y divide-[var(--border)]">
              {filtered.map((driver) => {
                const team = getTeamMeta(driver.constructorId)
                return (
                  <button
                    key={driver.id}
                    onClick={() => handleSelect(driver)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-6 rounded-full" style={{ backgroundColor: team.color }} />
                      <span className="font-mono text-xs font-bold text-[var(--text-muted)]">#{driver.number}</span>
                      <span className="font-semibold text-sm text-[var(--text)]">{driver.name}</span>
                      <CountryFlag country={driver.nationality} className="w-3.5 h-2.5 rounded-xs" />
                    </div>
                    <span className="text-xs text-[var(--text-muted)] font-mono">{driver.constructorName}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Featured Drivers Section */}
        <div className="space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] block font-bold">
            Featured Competitors
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {featuredDrivers.map((driver, index) => {
              const team = getTeamMeta(driver.constructorId)
              const isLeader = index === 0

              return (
                <button
                  key={driver.id}
                  onClick={() => handleSelect(driver)}
                  className={cn(
                    'relative p-3.5 rounded-xl border text-left transition-all duration-200 group active:scale-[0.98] hover:-translate-y-0.5 cursor-pointer',
                    isLeader
                      ? 'bg-[var(--surface-2)] border-amber-500/40 shadow-sm shadow-amber-500/10'
                      : 'bg-[var(--surface-1)] border-[var(--border)] hover:border-[var(--text-muted)] shadow-xs'
                  )}
                >
                  {/* Top color livery tag */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
                    style={{ backgroundColor: team.color }}
                  />

                  {/* Leader Badge */}
                  {isLeader && (
                    <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-amber-800 dark:text-amber-300 mb-2">
                      <Crown className="w-3 h-3 fill-current" />
                      LEADER
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-1">
                    <span className="font-mono text-xs font-black text-[var(--text-muted)]">#{driver.number}</span>
                    <CountryFlag country={driver.nationality} className="w-3.5 h-2.5 rounded-xs shadow-xs" />
                  </div>

                  <div className="font-display font-black text-base text-[var(--text)] uppercase tracking-[0.01em] mt-1 truncate group-hover:text-[var(--accent)] transition-colors">
                    {driver.name}
                  </div>

                  <div className="text-[11px] text-[var(--text-muted)] truncate mt-0.5 font-sans">
                    {driver.constructorName}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
